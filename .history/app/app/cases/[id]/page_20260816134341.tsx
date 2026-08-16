'use client';

import { useEffect, useState, use } from 'react';
import { ShieldCheck, User, Sparkles, Building, Briefcase, Landmark } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/cases/${id}`, { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    }
    load();
  }, [id]);

  if (!data) return <div className="text-xs text-slate-400 font-mono p-4">Loading overview...</div>;

  const c = data.case;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      {c.portfolio_client_id && (
        <SpotlightCard className="p-6 space-y-4 lg:col-span-2" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-xs font-normal text-slate-200 uppercase font-mono flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              Portfolio Context
            </h3>
            {c.portfolio_client_id && (
              <a href={`/app/portfolio/${encodeURIComponent(c.portfolio_client_id)}`} className="text-[10px] font-mono uppercase text-amber-400 hover:text-amber-300">
                Open Client Profile
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-slate-800 bg-[#080c14] p-3">
              <div className="text-slate-500 font-mono uppercase text-[9px]">Client ID</div>
              <div className="mt-1 text-white font-medium">{c.portfolio_client_id}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#080c14] p-3">
              <div className="text-slate-500 font-mono uppercase text-[9px]">Client Name</div>
              <div className="mt-1 text-white font-medium">{c.portfolio_client_name || 'Portfolio Client'}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#080c14] p-3">
              <div className="text-slate-500 font-mono uppercase text-[9px]">Portfolio Exposure</div>
              <div className="mt-1 text-emerald-400 font-medium">{c.portfolio_currency || c.currency} {Number(c.portfolio_total_deposited || 0).toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#080c14] p-3">
              <div className="text-slate-500 font-mono uppercase text-[9px]">Portfolio Snapshot</div>
              <div className="mt-1 text-white font-medium">{c.portfolio_currency || c.currency}</div>
            </div>
          </div>
        </SpotlightCard>
      )}
      {/* Financial Consistency Box (Portfolio Cases) */}
      {c.portfolio_client_id && data.jobs && data.jobs.length > 0 && (
        <SpotlightCard className="p-6 space-y-4 lg:col-span-2" spotlightColor="rgba(16, 185, 129, 0.08)">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-xs font-normal text-slate-200 uppercase font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Financial Consistency Assessment
            </h3>
          </div>
          {(() => {
            const latestJob = data.jobs[data.jobs.length - 1];
            const portfolioRule = latestJob?.rule_results?.find((r: any) => r.rule_id === 'RULE_PORTFOLIO_CONSISTENCY');
            
            if (!portfolioRule) {
              return <div className="text-xs text-slate-400">No portfolio financial consistency rule was applied to this case.</div>;
            }
            
            return (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-[#080c14] p-4">
                  <div className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-2">Portfolio Financial Relationship</div>
                  <div className="text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
                    {portfolioRule.observed_value}
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-800 bg-[#080c14] p-4">
                  <div className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-2">Assessment Result</div>
                  <div className={`text-sm font-semibold ${portfolioRule.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {portfolioRule.failure_message || 'Financial evidence supports the portfolio exposure'}
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-800 bg-[#080c14] p-4">
                  <div className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-2">Expected Threshold</div>
                  <div className="text-sm text-slate-300">{portfolioRule.expected_threshold}</div>
                </div>
              </div>
            );
          })()}
        </SpotlightCard>
      )}
      {/* Profile Box */}
      <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
        <div>
          <h3 className="text-xs font-normal text-slate-200 uppercase font-mono border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            Customer & Declaration Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-normal">
          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">Customer Name</div>
            <div className="font-sans font-light text-white text-base">{c.customer_name}</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">NRIC / Passport ID</div>
            <div className="font-mono text-slate-200 text-sm">{c.customer_nric_passport}</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">Declared Annual Net Income</div>
            <div className="font-mono text-emerald-400 text-base font-semibold">
              {c.currency} {c.declared_annual_income?.toLocaleString()}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">Primary Wealth Source</div>
            <div className="font-sans font-light text-slate-200 text-sm flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-400/80" />
              {c.primary_source_category}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">Employer Name</div>
            <div className="font-sans font-light text-slate-200 text-sm flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400/80" />
              {c.employer_name}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-slate-500 font-mono text-[10px] uppercase font-medium">Occupation Title</div>
            <div className="font-sans font-light text-slate-200 text-sm flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400/80" />
              {c.occupation_title || 'N/A'}
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Decision Summary Box */}
      <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(16, 185, 129, 0.08)" borderGlowColor="rgba(16, 185, 129, 0.25)">
        <div>
          <h3 className="text-xs font-normal text-slate-200 uppercase font-mono border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Compliance Decision & Assessment
          </h3>
        </div>

        <div className="space-y-4 text-xs font-normal">
          <div className="p-4 rounded-xl bg-[#080c14] border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">
              {c.override_reason ? 'Final Officer Decision' : 'Overall Decision Status'}
            </span>
            <span className={`font-mono text-[11px] px-2.5 py-1 rounded-md border tracking-wide font-medium ${
              c.overall_decision === 'APPROVED' || c.status === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : c.overall_decision === 'REJECTED' || c.status === 'REJECTED'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : c.overall_decision === 'INSUFFICIENT_INFORMATION' || c.status === 'INSUFFICIENT_INFORMATION'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {c.overall_decision || c.status || 'PENDING'}
            </span>
          </div>

          {c.override_reason && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Original Automated Decision</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#05070a] text-amber-400 border border-amber-500/30 font-medium">
                  {c.automated_decision || 'MANUAL_REVIEW_REQUIRED'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Deterministic Risk Score: <span className="text-white font-semibold">{c.composite_risk_score ?? 0} / 100</span>
              </div>
              <div className="pt-2 border-t border-amber-500/20 text-slate-300 font-sans text-xs">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-medium mb-1">Officer Justification:</div>
                <p className="text-slate-300 leading-relaxed font-light italic">&quot;{c.override_reason}&quot;</p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#080c14] border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">Risk Level Profile</span>
            <span className={`font-mono text-[11px] px-2.5 py-1 rounded-md border tracking-wide font-medium ${
              c.risk_level === 'LOW'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : c.risk_level === 'CRITICAL' || c.risk_level === 'HIGH'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {c.risk_level || 'MEDIUM'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#080c14] border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              {c.override_reason ? 'Adjudicating Officer' : 'Assigned Compliance Inspector'}
            </div>
            <div className="font-sans font-light text-slate-200">Luxera Compliance Officer (officer@luxera.world)</div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
