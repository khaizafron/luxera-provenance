'use client';

import { useState } from 'react';
import { FileText, Download, CheckCircle2, ChevronRight, FileJson } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function AppCompliancePage() {
  const [dsarCaseId, setDsarCaseId] = useState('CASE-2026-001');
  const [dsarData, setDsarData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExportDsar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/compliance/dsar?case_id=${dsarCaseId}`);
      const json = await res.json();
      setDsarData(json);
    } catch (err) {
      console.error('DSAR export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ui-pill ui-pill--amber">
              STATUTORY CONTROL FRAMEWORK
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans">
            Regulatory & Legal Compliance Center
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Statutory control verification and client data privacy compliance management aligned with PDPA 2010 (Act 709) and AMLA 2001 (Act 613) regulatory mandates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDPA Control Status Card */}
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div>
            <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono pb-3 border-b border-slate-800/80">
              <FileText className="w-4 h-4 text-amber-400" />
              PDPA 2010 (Act 709) Control Audits
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#080c14] border border-slate-800/80 hover:border-amber-500/20 transition-all">
              <div className="space-y-0.5">
                <span className="font-medium text-white text-xs block">Section 6: Digital Consent Logging</span>
                <span className="text-[10px] text-slate-400 font-normal">Immutable storage of customer compliance consent receipts</span>
              </div>
              <span className="ui-status ui-status--green">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#080c14] border border-slate-800/80 hover:border-amber-500/20 transition-all">
              <div className="space-y-0.5">
                <span className="font-medium text-white text-xs block">Section 9: Pre-LLM PII Sanitization</span>
                <span className="text-[10px] text-slate-400 font-normal">Automated pattern masking of NRIC, phone and bank accounts</span>
              </div>
              <span className="ui-status ui-status--green">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#080c14] border border-slate-800/80 hover:border-amber-500/20 transition-all">
              <div className="space-y-0.5">
                <span className="font-medium text-white text-xs block">Section 12: Data Subject Access Export</span>
                <span className="text-[10px] text-slate-400 font-normal">Instant extraction of compiled data dossiers in standard format</span>
              </div>
              <span className="ui-status ui-status--green">ACTIVE</span>
            </div>
          </div>
        </SpotlightCard>

        {/* DSAR Exporter Box */}
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div>
            <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono pb-3 border-b border-slate-800/80">
              <FileJson className="w-4 h-4 text-amber-400" />
              PDPA Section 12 Data Subject Access Request (DSAR)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-slate-400 font-medium">Customer Case ID for Dossier Export</label>
              <div className="relative">
                <input
                  type="text"
                  value={dsarCaseId}
                  onChange={(e) => setDsarCaseId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleExportDsar}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 transition-all group"
            >
              <Download className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>{loading ? 'Exporting dossier...' : 'Generate Statutory DSAR JSON Dossier'}</span>
            </button>

            {dsarData && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Secure Cryptographic Compliance Export Package
                </div>
                <pre className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-56 leading-relaxed scrollbar-thin">
                  {JSON.stringify(dsarData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
