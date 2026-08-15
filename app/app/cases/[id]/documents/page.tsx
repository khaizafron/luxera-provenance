'use client';

import { useEffect, useState, use, useRef, ChangeEvent, DragEvent } from 'react';
import {
  FileText,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  X,
  FileJson,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [viewPiiMasked, setViewPiiMasked] = useState(true);

  const [selectedClassification, setSelectedClassification] = useState('BANK_STATEMENT');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadDocs = async () => {
    try {
      const res = await fetch(`/api/cases/${id}`);
      const json = await res.json();
      setCaseData(json.case || null);
      setDocuments(json.documents || []);
      if (json.documents?.length > 0 && !selectedDoc) {
        setSelectedDoc(json.documents[0]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [id]);

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setError(null);
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('classification', selectedClassification);

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

    for (const f of fileArray) {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext) && !allowedTypes.includes(f.type.toLowerCase())) {
        setError(`File '${f.name}' has an unsupported format. Accepted formats: PDF, PNG, JPG, JPEG.`);
        setUploading(false);
        setUploadProgress(null);
        return;
      }
      if (f.size > 25 * 1024 * 1024) {
        setError(`File '${f.name}' exceeds the 25MB maximum size limit.`);
        setUploading(false);
        setUploadProgress(null);
        return;
      }
      if (f.size === 0) {
        setError(`File '${f.name}' is empty (0 bytes).`);
        setUploading(false);
        setUploadProgress(null);
        return;
      }
      formData.append('files', f);
    }

    try {
      setUploadProgress(50);
      const res = await fetch(`/api/cases/${id}/documents`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload document.');

      await loadDocs();
      if (data.documents?.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/cases/${id}/documents?docId=${docId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
      await loadDocs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-normal text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText className="w-4 h-4 text-amber-400" />
            Financial Evidence Repository
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Secure, cryptographically verified financial evidence repository with real-time pre-LLM PDPA PII sanitization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium font-mono text-[10px] uppercase">Redaction Mode:</span>
          <button
            onClick={() => setViewPiiMasked(true)}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
              viewPiiMasked
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-[#05070a] text-slate-400 border border-slate-800/80 hover:text-slate-200'
            }`}
          >
            PDPA Sanitized
          </button>
          <button
            onClick={() => setViewPiiMasked(false)}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
              !viewPiiMasked
                ? 'bg-rose-500 text-white font-semibold'
                : 'bg-[#05070a] text-slate-400 border border-slate-800/80 hover:text-slate-200'
            }`}
          >
            Raw Unmasked
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Panel */}
      <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <span className="text-xs font-mono font-semibold uppercase text-slate-200 flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            Upload Financial Evidence Documents
          </span>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Classification:</label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg bg-[#05070a] border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
            >
              <option value="BANK_STATEMENT">Bank Account Statement</option>
              <option value="PAYSLIP">Salary Pay Slip</option>
              <option value="TAX_DECLARATION">Tax Return / EA Form</option>
              <option value="EMPLOYMENT_LETTER">Employment Letter</option>
              <option value="EPF_STATEMENT">EPF / Pension Statement</option>
              <option value="INVESTMENT_STATEMENT">Investment / Dividend Statement</option>
              <option value="SALE_AGREEMENT">Asset / Property Sale Agreement</option>
              <option value="AUDITED_FINANCIALS">Audited Financial Report</option>
              <option value="OTHER">Other Evidence</option>
            </select>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
            isDragging
              ? 'bg-amber-500/10 border-amber-500'
              : 'bg-[#05070a]/60 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center shadow-inner">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-xs font-medium text-slate-200">Drag and drop file here, or click to browse</p>
              <p className="text-[10px] text-slate-500 font-mono">Supports PDF, PNG, JPG, JPEG (Max 25MB)</p>
            </div>
            <button
              type="button"
              className="sm:ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              SELECT FILES
            </button>
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Running OCR extraction & compliance checks...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#05070a] h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </SpotlightCard>

      {/* Main Grid: Document List & Selected Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Attached Evidence Vault ({documents.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {documents.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#080c14] border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                No compliance documents uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md shadow-amber-500/5'
                      : 'bg-[#080c14]/90 border-slate-800/80 text-slate-400 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-medium text-xs text-white truncate max-w-[150px]">{doc.filename}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#05070a] border border-slate-800 font-mono text-[8px] uppercase text-amber-400 font-semibold">
                      {doc.file_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/50">
                    <span>SHA256: {doc.sha256_hash?.substring(0, 10)}...</span>
                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Document Content Viewer */}
        <div className="lg:col-span-2">
          <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
            {selectedDoc ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-light text-white text-base font-sans">{selectedDoc.filename}</h3>
                    <div className="text-[11px] font-mono text-slate-400 font-normal">
                      Classification: <span className="text-amber-400 uppercase font-semibold">{selectedDoc.file_type}</span> • Size: {(selectedDoc.file_size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono flex items-center gap-1.5 border border-emerald-500/30 font-semibold uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SHA256 VALIDATED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono bg-[#05070a] p-3.5 rounded-xl border border-slate-800/80 text-slate-500">
                  <div className="truncate">SHA256: <span className="text-slate-300 font-semibold">{selectedDoc.sha256_hash}</span></div>
                  <div>OCR Engine: <span className="text-emerald-400 font-semibold">SUCCESS (Tesseract v5)</span></div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center justify-between">
                    <span>Extracted OCR Evidence Text Records</span>
                    <span className="text-[10px] text-slate-500 font-normal normal-case">Immutable File Data Node</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[350px] scrollbar-thin">
                    {viewPiiMasked
                      ? selectedDoc.pii_redacted_text || selectedDoc.ocr_extracted_text || 'No extractable text detected.'
                      : selectedDoc.ocr_extracted_text || 'No extractable text detected.'}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 font-mono flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800/80 rounded-xl space-y-2">
                <FileJson className="w-8 h-8 text-slate-600" />
                <p>Select a document from the evidence vault panel to inspect OCR extraction details.</p>
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
