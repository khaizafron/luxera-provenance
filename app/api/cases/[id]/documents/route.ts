import { NextRequest, NextResponse } from 'next/server';
import { dbStore, DocumentRecord } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';
import { redactPII } from '@/lib/compliance/pii-redactor';
import { extractTextFromDocument } from '@/lib/compliance/ocr-engine';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg']);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });

    dbStore.syncFromDisk(true);
    const sowCase = dbStore.cases.get(id);
    if (!sowCase) {
      console.error(`[CRITICAL DIAGNOSTIC] Case retrieval failed at Document Upload stage.`, {
        requested_case_id: id,
        endpoint: `/api/cases/${id}/documents`,
        request_stage: 'DOCUMENT_UPLOAD_LOOKUP',
        organization_context: session.organization?.id || 'NO_ORGANIZATION_CONTEXT',
        persistence_lookup_result: 'NOT_FOUND_IN_STORE',
        total_cases_in_store: dbStore.cases.size,
      });
      return NextResponse.json({ error: `Case '${id}' not found in active database.` }, { status: 404 });
    }

    // Enforce Tenant Isolation
    if (sowCase.organization_id !== session.organization.id) {
      console.warn(`[SECURITY ALERT] Cross-organization document upload attempt blocked.`, {
        user_id: session.user.id,
        user_org: session.organization.id,
        case_id: id,
        case_org: sowCase.organization_id,
      });
      return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const singleFile = formData.get('file') as File;

      const uploadQueue = files.length > 0 ? files : singleFile ? [singleFile] : [];

      if (uploadQueue.length === 0) {
        return NextResponse.json({ error: 'No files provided in upload payload' }, { status: 400 });
      }

      const classification = (formData.get('file_type') || formData.get('classification') || 'BANK_STATEMENT') as any;

      const createdDocs: DocumentRecord[] = [];

      for (const file of uploadQueue) {
        if (!file || typeof file === 'string') continue;

        // 1. File size validation
        if (file.size === 0) {
          return NextResponse.json({ error: `File '${file.name}' is empty (0 bytes)` }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File '${file.name}' exceeds maximum allowed size limit of 25MB` },
            { status: 400 }
          );
        }

        // 2. Extension & MIME validation
        const ext = path.extname(file.name).toLowerCase();
        const mime = file.type.toLowerCase();

        if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(mime)) {
          return NextResponse.json(
            { error: `Invalid file format for '${file.name}'. Only PDF, PNG, JPG, and JPEG are accepted.` },
            { status: 400 }
          );
        }

        // 3. Read Binary Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. SHA-256 Binary Checksum
        const sha256_hash = createHash('sha256').update(buffer).digest('hex');

        const docId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // 5. Store in Private Local Storage
        const uploadsDir = path.join(process.cwd(), 'private_uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filePath = path.join(uploadsDir, safeFilename);
        fs.writeFileSync(filePath, buffer);
        const storageKey = `/api/cases/${sowCase.id}/documents/${docId}`;

        // 6. Real OCR Text Extraction
        const ocrRes = await extractTextFromDocument(buffer, mime || 'application/pdf', file.name);

        // 7. PII Sanitization
        let piiRedacted = '';
        if (ocrRes.extractedText) {
          piiRedacted = redactPII(ocrRes.extractedText).redactedText;
        }

        // 8. Create DB Document Record
        const newDoc: DocumentRecord = {
          id: docId,
          case_id: sowCase.id,
          organization_id: sowCase.organization_id,
          filename: file.name,
          file_type: classification,
          file_size: file.size,
          mime_type: mime || (ext === '.pdf' ? 'application/pdf' : 'image/png'),
          sha256_hash,
          url: storageKey,
          storage_path: filePath,
          ocr_extracted_text: ocrRes.extractedText,
          pii_redacted_text: piiRedacted,
          upload_status: 'COMPLETED',
          ocr_status: ocrRes.ocrStatus,
          uploaded_by: session.user.id,
          created_at: new Date().toISOString(),
        };

        dbStore.documents.set(newDoc.id, newDoc);
        createdDocs.push(newDoc);

        // 9. Add Hash Chained Audit Event
        dbStore.addAuditBlock(
          sowCase.id,
          sowCase.organization_id,
          'DOCUMENT_UPLOADED',
          session.user.id,
          session.user.email,
          {
            document_id: newDoc.id,
            filename: newDoc.filename,
            file_type: newDoc.file_type,
            file_size: newDoc.file_size,
            sha256_hash: newDoc.sha256_hash,
            ocr_status: newDoc.ocr_status,
          }
        );
      }

      return NextResponse.json({ documents: createdDocs }, { status: 201 });
    }

    // JSON fallback for programmatic API integration
    const body = await req.json();
    const { filename, file_type, file_text_content } = body;

    if (!filename || !file_type) {
      return NextResponse.json({ error: 'Filename and file_type are required.' }, { status: 400 });
    }

    const sha256_hash = createHash('sha256').update(file_text_content || filename).digest('hex');
    const piiRedacted = file_text_content ? redactPII(file_text_content).redactedText : '';

    const docId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Write physical private file for text content to enable downloading if needed
    const uploadsDir = path.join(process.cwd(), 'private_uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, Buffer.from(file_text_content || ''));

    const newDoc: DocumentRecord = {
      id: docId,
      case_id: sowCase.id,
      organization_id: sowCase.organization_id,
      filename,
      file_type,
      file_size: (file_text_content || '').length,
      mime_type: filename.endsWith('.pdf') ? 'application/pdf' : 'image/png',
      sha256_hash,
      url: `/api/cases/${sowCase.id}/documents/${docId}`,
      storage_path: filePath,
      ocr_extracted_text: file_text_content || '',
      pii_redacted_text: piiRedacted,
      upload_status: 'COMPLETED',
      ocr_status: file_text_content ? 'COMPLETED' : 'OCR_NOT_CONFIGURED',
      uploaded_by: session.user.id,
      created_at: new Date().toISOString(),
    };

    dbStore.documents.set(newDoc.id, newDoc);

    dbStore.addAuditBlock(
      sowCase.id,
      sowCase.organization_id,
      'DOCUMENT_UPLOADED',
      session.user.id,
      session.user.email,
      {
        document_id: newDoc.id,
        filename: newDoc.filename,
        file_type: newDoc.file_type,
        sha256_hash: newDoc.sha256_hash,
      }
    );

    return NextResponse.json({ documents: [newDoc] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Delete document endpoint
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const docId = url.searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'docId query parameter is required' }, { status: 400 });
    }

    const doc = dbStore.documents.get(docId);
    if (!doc || doc.case_id !== id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Enforce Tenant Isolation
    if (doc.organization_id !== session.organization.id) {
      console.warn(`[SECURITY ALERT] Cross-organization document deletion attempt blocked.`, {
        user_id: session.user.id,
        user_org: session.organization.id,
        document_id: docId,
        doc_org: doc.organization_id,
      });
      return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
    }

    // Physical deletion from secure storage
    if (doc.storage_path && fs.existsSync(doc.storage_path)) {
      try {
        fs.unlinkSync(doc.storage_path);
      } catch (err) {
        console.error('[STORAGE ERROR] Failed to delete physical file from private disk:', err);
      }
    }

    dbStore.documents.delete(docId);

    // Audit Event
    dbStore.addAuditBlock(
      id,
      doc.organization_id,
      'DOCUMENT_DELETED',
      session.user.id,
      session.user.email,
      {
        document_id: doc.id,
        filename: doc.filename,
      }
    );

    return NextResponse.json({ success: true, deletedDocId: docId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
