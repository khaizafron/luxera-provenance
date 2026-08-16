'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ShieldCheck,
  User,
  FolderKanban,
  AlertCircle,
  Activity,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Cpu,
  ArrowUpRight,
  Landmark,
  Building,
  DollarSign
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function ReviewQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' });
      const json = await res.json();
      // Strictly filter only cases awaiting manual compliance review
      const reviewQueue = (json.cases || []).filter(
        (c: any) => c.status === 'MANUAL_REVIEW_REQUIRED'
      );
      setCases(reviewQueue);
      if (reviewQueue.length > 0) {
        if (!selectedCaseId || !reviewQueue.some((c: any) => c.id === selectedCaseId)) {
          setSelectedCaseId(reviewQueue[0].id);
        }
      } else {
        setSelectedCaseId(null);
        setCaseDetails(null);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Fetch full details whenever selectedCaseId changes
  useEffect(() => {
    if (!selectedCaseId) {
      setCaseDetails(null);
      return;
    }

    async function fetchDetails() {
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/cases/${selectedCaseId}`, { cache: 'no-store' });
        const json = await res.json();
        setCaseDetails(json);
      } catch (err) {
        console.error('Failed to load case details:', err);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchDetails();
  }, [selectedCaseId]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    if (overrideReason.trim().length < 10) {
      setErrorMessage('Mandatory compliance justification must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_override: overrideDecision,
          override_reason: overrideReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Override failed');

      setMessage(
        `Compliance decision successfully recorded as ${overrideDecision}. Audit block #${data.auditBlock?.sequence_id || 'CHAINED'} added to ledger. Case removed from pending reviews.`
      );
      setOverrideReason('');

      // Refresh review queue
      await loadQueue();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCase = caseDetails?.case || cases.find((c) => c.id === selectedCaseId);
  const job = caseDetails?.jobs?.[0];
  const ruleResults = job?.rule_results || [];
  const extracted = job?.extracted_data;
  const docs = caseDetails?.documents || [];

  const rawDeposits = extracted?.total_bank_deposits_detected;
  const hasExtractedDeposits = rawDeposits !== null && rawDeposits !== undefined && !isNaN(Number(rawDeposits));
  const detectedDeposits = hasExtractedDeposits ? Number(rawDeposits) : null;
  const ratio = detectedDeposits !== null && selectedCase?.declared_annual_income
    ? (detectedDeposits / selectedCase.declared_annual_income).toFixed(2)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ui-pill ui-pill--amber">
              MANUAL COMPLIANCE ADJUDICATION
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans flex items-center gap-2">
            Compliance Review
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Examine flagged variance findings, inspect supporting financial evidence and AI compliance synthesis, and record authoritative compliance officer decisions with mandatory cryptographic ledger justification.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-normal flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">Compliance Decision Recorded</div>
            <p className="text-slate-300 leading-relaxed font-sans">{message}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-normal flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {cases.length === 0 ? (
        <SpotlightCard className="p-12 text-center" spotlightColor="rgba(217, 119, 6, 0.05)">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-white font-sans">No Pending Compliance Reviews</h3>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              All active customer cases have either been automatically approved by deterministic policy or have already been adjudicated by a compliance officer.
            </p>
            <div className="pt-2">
              <Link
                href="/app/cases"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
              >
                <span>View Full Cases Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          </div>
        </SpotlightCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Queue List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Pending Compliance Reviews ({cases.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCaseId === c.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-[#080c14]/90 border-slate-800/80 text-slate-400 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-xs text-white">{c.customer_name}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#05070a] border border-slate-800/80 text-amber-400 font-semibold">
                      {c.case_number}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">Employer: {c.employer_name}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 border-t border-slate-800/50 pt-2">
                    <span>Risk Score:</span>
                    <span className="text-amber-400 font-semibold">{c.composite_risk_score ?? 0} / 100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Review & Adjudication Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCase && (
              <>
                {/* Case Dossier Card */}
                <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[9px] tracking-wider uppercase font-semibold">
                          CASE #{selectedCase.case_number}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[9px] uppercase font-medium">
                          MANUAL_REVIEW_REQUIRED
                        </span>
                      </div>
                      <h2 className="text-2xl font-light text-white font-sans">{selectedCase.customer_name}</h2>
                    </div>

                    <Link
                      href={`/app/cases/${selectedCase.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors shrink-0"
                    >
                      <span>Inspect Full Case</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">NRIC / Passport ID</div>
                      <div className="font-mono text-slate-200 font-medium">{selectedCase.customer_nric_passport}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Declared Annual Income</div>
                      <div className="font-mono text-emerald-400 font-semibold">
                        {selectedCase.currency} {selectedCase.declared_annual_income?.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Primary Wealth Source</div>
                      <div className="font-sans text-slate-200 font-light truncate">{selectedCase.primary_source_category}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Employer Name</div>
                      <div className="font-sans text-slate-200 font-light truncate">{selectedCase.employer_name}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Automated Risk Score</div>
                      <div className="font-mono text-amber-400 font-semibold">{selectedCase.composite_risk_score ?? 0} / 100</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Evidence Documents</div>
                      <div className="font-mono text-slate-200">
                        {docs.length} Attached {docs.length > 0 ? `(${docs.map((d: any) => d.file_type).join(', ')})` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Financial Findings & Ratio */}
                  {ratio && (
                    <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400 uppercase text-[10px] flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-amber-400" />
                          Deposit-to-Salary Ratio
                        </span>
                        <span className="font-mono text-amber-400 font-semibold">{ratio}x (Configured Tolerance: 1.25x)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Detected 12-month bank deposits total {selectedCase.currency} {detectedDeposits?.toLocaleString()}, representing a variance above declared base salary.
                      </p>
                    </div>
                  )}

                  {/* Rule Evaluation Findings */}
                  {ruleResults.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Rule Evaluation Findings
                      </div>
                      <div className="space-y-2">
                        {ruleResults.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                              r.passed
                                ? 'bg-[#05070a] border-slate-800/80 text-slate-300'
                                : 'bg-amber-500/5 border-amber-500/30 text-amber-200'
                            }`}
                          >
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="text-white font-medium">{r.rule_name}</span>
                                <span className="text-slate-500 text-[9px]">{r.rule_id}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Observed: <span className="text-white font-mono">{r.observed_value}</span> • Threshold: <span className="font-mono text-slate-400">{r.expected_threshold}</span>
                              </div>
                              {r.failure_message && (
                                <p className="text-amber-400 text-[11px] font-mono mt-1 font-medium">
                                  {r.failure_message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemini AI Compliance Synthesis */}
                  {job?.ai_explanation && (
                    <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 space-y-2">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        Gemini AI Compliance Synthesis
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                        {job.ai_explanation}
                      </p>
                    </div>
                  )}

                  {/* Compliance Officer Adjudication Form */}
                  <form onSubmit={handleOverrideSubmit} className="space-y-6 pt-4 border-t border-slate-800/80">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300 font-medium">
                          Compliance Officer Decision
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          Original Automated: <strong className="text-amber-400">MANUAL_REVIEW_REQUIRED</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOverrideDecision('APPROVED')}
                          className={`py-3.5 px-4 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            overrideDecision === 'APPROVED'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                              : 'bg-[#05070a] border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          APPROVE CUSTOMER CASE
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverrideDecision('REJECTED')}
                          className={`py-3.5 px-4 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            overrideDecision === 'REJECTED'
                              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/10'
                              : 'bg-[#05070a] border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          REJECT CUSTOMER CASE
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300 font-medium">
                          Mandatory Compliance Justification Reason (Cryptographically Chained to Audit Ledger) *
                        </label>
                        <span className={`text-[10px] font-mono ${
                          overrideReason.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {overrideReason.trim().length} / 10 chars min
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g., Conducted human inspection of secondary tax return (EA Form) proving supplemental consulting dividends. Mismatch risk is successfully mitigated."
                        className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors leading-relaxed placeholder-slate-600"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || overrideReason.trim().length < 10}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/5 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>{submitting ? 'Recording compliance decision to immutable ledger...' : 'Record Compliance Decision'}</span>
                      <ShieldCheck className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                    </button>
                  </form>
                </SpotlightCard>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
