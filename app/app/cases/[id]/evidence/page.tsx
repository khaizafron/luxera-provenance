'use client';

import { useEffect, useState, use } from 'react';
import { Calculator, AlertCircle, TrendingUp, DollarSign, Scale, Info } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/cases/${id}`);
      const json = await res.json();
      setData(json);
    }
    load();
  }, [id]);

  if (!data) return <div className="text-xs text-slate-400 font-mono p-4">Loading financial evidence...</div>;

  const sowCase = data.case;
  const job = data.jobs?.[0];
  const extracted = job?.extracted_data;

  const rawDeposits = extracted?.total_bank_deposits_detected;
  const hasExtractedDeposits = rawDeposits !== null && rawDeposits !== undefined && !isNaN(Number(rawDeposits));
  const detectedDeposits = hasExtractedDeposits ? Number(rawDeposits) : null;

  const ratio = detectedDeposits !== null && sowCase.declared_annual_income
    ? (detectedDeposits / sowCase.declared_annual_income).toFixed(2)
    : null;
  const ratioNum = ratio !== null ? Number(ratio) : null;

  const isInsufficient = sowCase.overall_decision === 'INSUFFICIENT_INFORMATION' || detectedDeposits === null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h2 className="text-sm font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Calculator className="w-4 h-4 text-amber-400" />
          Financial Evidence & Consistency Engine
        </h2>
        {isInsufficient && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-mono uppercase font-medium">
            <Info className="w-3.5 h-3.5" />
            Insufficient Evidence
          </span>
        )}
      </div>

      {isInsufficient && (
        <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/50 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="text-sky-300 font-medium font-mono uppercase text-[11px]">
              Financial Evidence Incomplete or Unextractable
            </div>
            <p className="text-slate-400 leading-relaxed font-normal">
              Usable 12-month deposit transactions or verified monthly earnings could not be reliably extracted from the submitted documentation. Missing financial values are preserved as unextracted rather than evaluated as zero risk.
            </p>
          </div>
        </div>
      )}

      {/* Salary vs Deposit Ratio Card with Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Declared */}
        <SpotlightCard className="p-5" spotlightColor="rgba(217, 119, 6, 0.08)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-400">Declared Annual Income</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/80">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-light text-white tracking-tight font-sans">
            {sowCase.currency} {sowCase.declared_annual_income?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase">Declared by Customer</div>
        </SpotlightCard>

        {/* Detected */}
        <SpotlightCard className="p-5" spotlightColor="rgba(217, 119, 6, 0.08)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-400">Detected Deposits (12M)</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/80">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-light tracking-tight font-sans">
            {detectedDeposits !== null ? (
              <span className="text-amber-400">{sowCase.currency} {detectedDeposits.toLocaleString()}</span>
            ) : (
              <span className="text-sky-400 text-lg font-mono">NOT_EXTRACTED</span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase">
            {detectedDeposits !== null ? 'Extracted from Statement' : 'Requires Additional Evidence'}
          </div>
        </SpotlightCard>

        {/* Ratio */}
        <SpotlightCard className="p-5" spotlightColor="rgba(217, 119, 6, 0.08)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-400">Deposit-to-Salary Ratio</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/80">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl font-light tracking-tight font-sans ${
            ratioNum === null
              ? 'text-sky-400 text-lg font-mono'
              : ratioNum > 2.0
              ? 'text-rose-400'
              : ratioNum > 1.25
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {ratioNum !== null ? (
              <>
                {ratio}x <span className="text-xs text-slate-500 font-sans font-normal">(Limit: 1.25x)</span>
              </>
            ) : (
              'NOT AVAILABLE'
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase font-medium">
            {ratioNum === null
              ? 'Evidence Gap (Uncalculated)'
              : ratioNum > 2.0
              ? 'Critical Inconsistency (> 200%)'
              : ratioNum > 1.25
              ? 'Elevated Variance (> 25%)'
              : 'In Compliance (<= 25%)'}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
