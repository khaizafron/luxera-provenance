'use client';

import { useEffect, useState, use } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Cpu } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!data) return <div className="text-xs text-slate-400 font-mono p-4">Loading rule evaluation data...</div>;

  const job = data.jobs?.[0] || {};
  const ruleResults = job.rule_results || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h2 className="text-sm font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Activity className="w-4 h-4 text-amber-400" />
          Deterministic Policy Rules Evaluation
        </h2>
      </div>

      {/* Rules Evaluation List */}
      <div className="space-y-3">
        {ruleResults.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#080c14]/90 border border-slate-800/80 text-center text-xs font-mono text-slate-400">
            No rule evaluation records found. Trigger evaluation on the case queue to execute compliance rules.
          </div>
        ) : (
          ruleResults.map((r: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-[#080c14]/90 border border-slate-800/80 flex items-start gap-4 transition-all hover:border-amber-500/20 shadow-sm">
              {r.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : r.severity === 'CRITICAL' ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-light text-white text-sm font-sans">{r.rule_name}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">{r.rule_id}</span>
                </div>
                <p className="text-slate-400 font-normal leading-relaxed">
                  Observed: <span className="font-mono text-white font-semibold">{r.observed_value}</span> • Expected Threshold: <span className="font-mono text-slate-400">{r.expected_threshold}</span>
                </p>
                {r.failure_message && (
                  <p className="text-amber-400 mt-2 text-[11px] font-mono font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {r.failure_message}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gemini AI Explanation */}
      <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(16, 185, 129, 0.08)" borderGlowColor="rgba(16, 185, 129, 0.25)">
        <h3 className="text-xs font-normal uppercase tracking-wider text-slate-200 flex items-center gap-2 font-mono pb-3 border-b border-slate-800/80">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Structured Gemini AI Compliance Synthesis
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
          {job.ai_explanation ||
            `Source of Wealth evaluation has not yet been executed for ${data.case.customer_name}. Trigger evaluation to generate AI synthesis.`}
        </p>
      </SpotlightCard>
    </div>
  );
}
