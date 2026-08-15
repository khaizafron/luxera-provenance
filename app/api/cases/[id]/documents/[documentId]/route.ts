import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // 1. Retrieve the target Case and enforce organization isolation
    const sowCase = dbStore.cases.get(id);
    if (!sowCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (sowCase.organization_id !== session.organization.id) {
      console.warn(`[SECURITY ALERT] Cross-organization document access attempt blocked.`, {
        user_id: session.user.id,
        user_org: session.organization.id,
        requested_case_org: sowCase.organization_id,
        case_id: id,
      });
      return NextResponse.json({ error: 'Access denied: Organization isolation is active.' }, { status: 403 });
    }

    // 2. Retrieve Document and verify relation
    const doc = dbStore.documents.get(documentId);
    if (!doc || doc.case_id !== id) {
      return NextResponse.json({ error: 'Document not found or does not belong to this case.' }, { status: 404 });
    }

    if (doc.organization_id !== session.organization.id) {
      return NextResponse.json({ error: 'Access denied: Organization isolation is active.' }, { status: 403 });
    }

    // 3. Check physical storage existence
    if (!doc.storage_path || !fs.existsSync(doc.storage_path)) {
      console.error(`[STORAGE ERROR] Document record exists but private file was not found on disk.`, {
        document_id: documentId,
        storage_path: doc.storage_path,
      });
      return NextResponse.json({ error: 'Evidence file not found on secure server.' }, { status: 404 });
    }

    // 4. Stream secure file response
    const fileBuffer = fs.readFileSync(doc.storage_path);
    const response = new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': doc.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.filename)}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600, no-transform',
      },
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
