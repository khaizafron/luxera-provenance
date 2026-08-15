'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Upload,
  AlertCircle,
  X,
  File,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function NewCasePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP 1: Metadata Form State
  const [customerName, setCustomerName] = useState('');
  const [customerNric, setCustomerNric] = useState('');
  const [declaredIncome, setDeclaredIncome] = useState('');
  const [currency, setCurrency] = useState('MYR');
  const [sourceCategory, setSourceCategory] = useState('EMPLOYMENT');
  const [employerName, setEmployerName] = useState('');
  const [occupationTitle, setOccupationTitle] = useState('');

  // Created Case Context
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  // STEP 2: Document Upload State
  const [selectedClassification, setSelectedClassification] = useState('BANK_STATEMENT');
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // STEP 3: Consent Checkbox
  const [consentGranted, setConsentGranted] = useState(false);

  // STEP 1: Create SoW Case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerNric.trim() || !declaredIncome || !employerName.trim()) {
      setError('Please fill in all mandatory customer metadata fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_nric_passport: customerNric.trim(),
          declared_annual_income: Number(declaredIncome),
          currency,
          primary_source_category: sourceCategory,
          employer_name: employerName.trim(),
          occupation_title: occupationTitle.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize SoW case');

      setCreatedCaseId(data.case.id);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: File Upload Logic
  const validateAndUploadFiles = async (files: FileList | File[]) => {
    if (!createdCaseId) return;
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setError(null);
    setLoading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('classification', selectedClassification);

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

    for (const f of fileArray) {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext) && !allowedTypes.includes(f.type.toLowerCase())) {
        setError(`File '${f.name}' has an unsupported format. Accepted formats: PDF, PNG, JPG, JPEG.`);
        setLoading(false);
        setUploadProgress(null);
        return;
      }
      if (f.size > 25 * 1024 * 1024) {
        setError(`File '${f.name}' exceeds the 25MB maximum size limit.`);
        setLoading(false);
        setUploadProgress(null);
        return;
      }
      if (f.size === 0) {
        setError(`File '${f.name}' is empty (0 bytes).`);
        setLoading(false);
        setUploadProgress(null);
        return;
      }
      formData.append('files', f);
    }

    try {
      setUploadProgress(50);
      const res = await fetch(`/api/cases/${createdCaseId}/documents`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document upload failed.');

      const newDocs = data.documents || [];
      setUploadedDocs((prev) => [...prev, ...newDocs]);
      if (newDocs.length > 0 && !selectedDocForPreview) {
        setSelectedDocForPreview(newDocs[0]);
      }
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndUploadFiles(e.target.files);
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
      validateAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!createdCaseId) return;
    try {
      const res = await fetch(`/api/cases/${createdCaseId}/documents?docId=${docId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }
      setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDocForPreview?.id === docId) {
        setSelectedDocForPreview(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // STEP 3: Consent Logic
  const handleGrantConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('You must confirm digital consent receipt before proceeding.');
      return;
    }
    setError(null);
    setStep(4);
  };

  // STEP 4: Processing
  const handleExecuteEngine = async () => {
    if (!createdCaseId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${createdCaseId}/process`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed');

      router.push(`/app/cases/${createdCaseId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] tracking-wider uppercase font-medium">
              NEW ASSESSMENT REGISTRATION
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-amber-400 shrink-0" />
            Source of Wealth Case Creator
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            4-step guided compliance verification and financial evidence pipeline for customer verification and risk analysis.
          </p>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { num: 1, label: 'Metadata' },
          { num: 2, label: 'Evidence Upload' },
          { num: 3, label: 'PDPA Consent' },
          { num: 4, label: 'Execute Engine' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium shadow-md shadow-amber-500/5'
                : step > s.num
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                : 'bg-[#080c14] border-slate-800/80 text-slate-400 font-normal'
            }`}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider font-semibold text-slate-500">Step {s.num}</div>
            <div className="text-xs mt-0.5 truncate font-sans font-light">{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between font-normal animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: Metadata Form */}
      {step === 1 && (
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800/80 pb-3">
            1. Customer & Declared Wealth Metadata
          </h2>

          <form onSubmit={handleCreateCase} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Customer Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Sarah Binti Ahmad"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">NRIC / Passport Number *</label>
                <input
                  type="text"
                  value={customerNric}
                  onChange={(e) => setCustomerNric(e.target.value)}
                  placeholder="e.g., 900812-14-5500"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Declared Annual Net Income *</label>
                <input
                  type="number"
                  value={declaredIncome}
                  onChange={(e) => setDeclaredIncome(e.target.value)}
                  placeholder="e.g., 180000"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/50 font-mono"
                >
                  <option value="MYR">MYR (Malaysian Ringgit)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Primary Source Category *</label>
                <select
                  value={sourceCategory}
                  onChange={(e) => setSourceCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/50 font-mono"
                >
                  <option value="EMPLOYMENT">Employment Salary</option>
                  <option value="BUSINESS_OWNERSHIP">Business Ownership / Equity</option>
                  <option value="INVESTMENTS">Capital Markets / Sukuk / Dividends</option>
                  <option value="INHERITANCE">Inheritance / Estate</option>
                  <option value="REAL_ESTATE_SALE">Property Sale</option>
                  <option value="OTHER">Other Verified Source</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Employer / Company Name *</label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g., Apex Technology Berhad"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-medium">Occupation Title</label>
                <input
                  type="text"
                  value={occupationTitle}
                  onChange={(e) => setOccupationTitle(e.target.value)}
                  placeholder="e.g., Principal Engineer"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 group"
              >
                <span>{loading ? 'Initializing SoW Case...' : 'Create Case & Proceed to File Upload'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </SpotlightCard>
      )}

      {/* STEP 2: File Upload UI */}
      {step === 2 && (
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider font-mono">
                2. Upload Real Financial Evidence
              </h2>
            </div>
            <div className="px-3 py-1 rounded-md bg-[#05070a] text-amber-400 text-[10px] font-mono border border-slate-800/80 font-bold">
              Case ID: {createdCaseId}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-400 font-medium">
              Select Document Classification
            </label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full md:w-80 px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/50 font-mono"
            >
              <option value="BANK_STATEMENT">Bank Account Statement</option>
              <option value="PAYSLIP">Salary Pay Slip</option>
              <option value="TAX_DECLARATION">Tax Return / EA Form</option>
              <option value="EMPLOYMENT_LETTER">Employment Verification Letter</option>
              <option value="EPF_STATEMENT">EPF / Pension Statement</option>
              <option value="INVESTMENT_STATEMENT">Investment / Dividend Statement</option>
              <option value="SALE_AGREEMENT">Asset / Property Sale Agreement</option>
              <option value="AUDITED_FINANCIALS">Audited Financial Report</option>
              <option value="OTHER">Other Supporting Evidence</option>
            </select>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 ${
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

            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Drag & drop financial evidence files here</p>
              <p className="text-[11px] text-slate-400 font-normal">or click to open browser file selector</p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-semibold text-xs hover:from-amber-400 hover:to-yellow-400 shadow-md">
              + SELECT FILES FROM COMPUTER
            </div>

            <div className="text-[10px] font-mono text-slate-500 uppercase pt-1">
              Accepted: PDF, PNG, JPG, JPEG • Max Size: 25MB
            </div>
          </div>

          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Uploading & hashing file...</span>
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

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between font-semibold border-b border-slate-800/80 pb-2">
              <span>Uploaded Financial Evidence ({uploadedDocs.length})</span>
              {uploadedDocs.length === 0 && (
                <span className="text-amber-400 text-[10px] font-normal normal-case">Upload at least 1 document to proceed</span>
              )}
            </h3>

            {uploadedDocs.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#080c14] border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                No files uploaded yet for this case. Use the file picker above to attach real evidence.
              </div>
            ) : (
              <div className="space-y-2.5">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      selectedDocForPreview?.id === doc.id
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#080c14]/90 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File className="w-6 h-6 text-amber-400 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-white truncate">{doc.filename}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 uppercase font-semibold text-[8px]">
                            {doc.file_type}
                          </span>
                          <span>• {(doc.file_size / 1024).toFixed(1)} KB</span>
                          <span>• SHA256: {doc.sha256_hash?.substring(0, 12)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-semibold uppercase tracking-wider"
                      >
                        OCR: COMPLETED
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200"
                        title="View Extracted OCR Evidence"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 text-rose-400"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* READ-ONLY OCR Extracted Evidence Display */}
          {selectedDocForPreview && (
            <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  READ-ONLY Extracted Text / OCR Output ({selectedDocForPreview.filename})
                </span>
                <span className="text-slate-500">Uneditable Record</span>
              </div>
              <pre className="p-3 rounded-lg bg-[#080c14] border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedDocForPreview.pii_redacted_text ||
                  selectedDocForPreview.ocr_extracted_text ||
                  'No extractable text detected or OCR not configured.'}
              </pre>
            </div>
          )}

          <div className="pt-4 flex justify-between items-center border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white font-mono font-medium"
            >
              Back to Metadata
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={uploadedDocs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition-all shadow-md flex items-center gap-2 group"
            >
              <span>Proceed to Statutory PDPA Consent</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </SpotlightCard>
      )}

      {/* STEP 3: Statutory Consent & Legal Basis */}
      {step === 3 && (
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <h2 className="text-xs font-normal text-slate-200 uppercase font-mono border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            3. Statutory Legal Basis & Data Subject Consent (PDPA Act 709)
          </h2>

          <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 text-xs text-slate-300 space-y-3 font-sans font-light">
            <p className="leading-relaxed">
              Pursuant to Section 6 of the Personal Data Protection Act 2010 (Act 709) and BNM Anti-Money Laundering Regulations, financial institutions must record statutory customer consent and legal processing basis before running automated compliance profiling on uploaded financial documents.
            </p>
            <div className="font-mono text-[10px] text-slate-400 bg-[#080c14] p-3 rounded-lg border border-slate-800 space-y-1">
              <div>Customer Subject: <span className="text-white font-semibold">{customerName}</span></div>
              <div>NRIC / Passport: <span className="text-white font-semibold">{customerNric}</span></div>
              <div>Attached Documents: <span className="text-amber-400 font-semibold">{uploadedDocs.length} Real File(s)</span></div>
              <div>Pre-LLM Protection: <span className="text-emerald-400 font-semibold">PII Sanitization Tokenizer Enabled</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-slate-300 cursor-pointer leading-relaxed font-sans font-light">
              I hereby confirm customer authorization and statutory legal basis (PDPA 2010 Act 709 Section 6 / AMLA 2001) for uploading and processing these financial evidence documents for Source of Wealth verification.
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center">
            <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white font-mono font-medium">
              Back to Documents
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={!consentGranted}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition-all shadow-md flex items-center gap-2 group"
            >
              <span>Confirm Consent & Proceed</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </SpotlightCard>
      )}

      {/* STEP 4: Execute Engine */}
      {step === 4 && (
        <SpotlightCard className="p-8 text-center space-y-6" spotlightColor="rgba(16, 185, 129, 0.08)" borderGlowColor="rgba(16, 185, 129, 0.25)">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-light text-white font-sans">Execute SoW Verification Pipeline</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Triggers the native SoW verification pipeline and server-side Gemini AI engine using your {uploadedDocs.length} real uploaded financial document(s). Applies deterministic ratio rules and records a SHA-256 cryptographic audit hash block.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800 max-w-sm mx-auto text-left text-xs font-mono text-slate-300 space-y-1">
            <div>Customer: <span className="text-white font-semibold">{customerName}</span></div>
            <div>Income: <span className="text-emerald-400 font-semibold">{currency} {Number(declaredIncome).toLocaleString()}</span></div>
            <div>Evidence Files: <span className="text-amber-400 font-semibold">{uploadedDocs.length} document(s)</span></div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleExecuteEngine}
              disabled={loading}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2 group"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Run SoW Evaluation Pipeline</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
