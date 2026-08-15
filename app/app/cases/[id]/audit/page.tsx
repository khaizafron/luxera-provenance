'use client';

import { useEffect, useState, use } from 'react';
import { GitBranch, ShieldCheck, AlertCircle, CheckCircle2, Server } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/cases/${id}`);
      const json = await res.json();
      setData(json);
    }
    load();
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/compliance/verify-audit-chain');
      const json = await res.json();
      setVerification(json.verification_result);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (!data) return <div className="text-xs text-slate-400 font-mono p-4">Loading audit ledger...</div>;

  const blocks = data.auditBlocks || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-normal text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
            <GitBranch className="w-4 h-4 text-amber-400" />
            Cryptographic Audit Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Immutable blockchain-like SHA-256chained audit blocks containing compliance evaluation results and human-officer actions.
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-semibold text-xs transition-all shadow-md shrink-0 group"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>{verifying ? 'Recomputing SHA-256...' : 'Verify Ledger Integrity'}</span>
        </button>
      </div>

      {verification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            verification.isValid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {verification.isValid ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-white">
              {verification.isValid ? 'Audit Chain Validated successfully' : 'Audit Chain Tampering Mismatch Detected'}
            </div>
            <div className="text-[11px] mt-1 text-slate-300 leading-relaxed font-mono font-normal">{verification.message}</div>
          </div>
        </div>
      )}

      {/* Audit Blocks Timeline */}
      <div className="space-y-3">
        {blocks.map((b: any) => (
          <div key={b.sequence_id} className="p-4 rounded-xl bg-[#080c14]/90 border border-slate-800/80 space-y-3 text-xs transition-all hover:border-amber-500/20 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#05070a] text-amber-400 border border-slate-800 font-mono font-bold text-[9px] uppercase tracking-wide">
                  Block #{b.sequence_id}
                </span>
                <span className="font-mono font-medium text-white uppercase tracking-wide">{b.event_type}</span>
              </div>
              <span className="font-mono text-[9px] text-slate-500">{b.timestamp}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono text-slate-500">
              <div className="space-y-0.5">
                <span className="text-slate-500 block">PREVIOUS BLOCK HASH:</span>
                <span className="text-slate-300 select-all">{b.previous_block_hash}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-amber-500/70">CURRENT BLOCK HASH:</span>
                <span className="text-amber-400 font-medium select-all">{b.block_hash}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-800/50 pt-2.5">
              <span>AUTHORIZED ACTOR EMAIL: <strong className="text-slate-300 font-semibold">{b.actor_email}</strong></span>
              <span>COMPLIANCE LEDGER NODE</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
