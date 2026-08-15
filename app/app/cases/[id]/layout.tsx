'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  FileText,
  Calculator,
  Activity,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function CaseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const [sowCase, setSowCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/${id}`, { cache: 'no-store' });
        const data = await res.json();
        setSowCase(data.case || null);
      } catch (err) {
        console.error('Failed to fetch case detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [id]);

  const tabs = [
    { href: `/app/cases/${id}`, label: 'Case Overview', icon: FolderKanban },
    { href: `/app/cases/${id}/documents`, label: 'Supporting Documents', icon: FileText },
    { href: `/app/cases/${id}/evidence`, label: 'Financial Evidence', icon: Calculator },
    { href: `/app/cases/${id}/analysis`, label: 'Rule Engine & AI', icon: Activity },
    { href: `/app/cases/${id}/audit`, label: 'Chained Audit Trail', icon: GitBranch },
  ];

  if (loading) {
    return <div className="p-8 text-xs text-slate-400 font-mono">Loading case inspection data...</div>;
  }

  if (!sowCase) {
    return <div className="p-8 text-xs text-rose-400 font-mono">Case not found or permission denied.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <Link href="/app/cases" className="hover:text-white flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Queue
        </Link>
        <span>/</span>
        <span className="text-amber-400 font-mono font-semibold">{sowCase.case_number}</span>
      </div>

      {/* Case Header Card with Interactive Cursor Spotlight */}
      <SpotlightCard className="p-6" spotlightColor="rgba(217, 119, 6, 0.08)">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-light tracking-tight text-white font-sans">{sowCase.customer_name}</h1>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide font-medium border ${
                  sowCase.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : sowCase.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : sowCase.status === 'MANUAL_REVIEW_REQUIRED'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : sowCase.status === 'INSUFFICIENT_INFORMATION'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {sowCase.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono font-normal">
              <span>NRIC/Passport ID: <strong className="text-white font-semibold">{sowCase.customer_nric_passport}</strong></span>
              <span>•</span>
              <span>
                Declared Income: <strong className="text-white font-semibold">{sowCase.currency} {sowCase.declared_annual_income?.toLocaleString()}</strong>
              </span>
              <span>•</span>
              <span>Employer: <strong className="text-white font-semibold">{sowCase.employer_name}</strong></span>
            </div>
          </div>

          {/* Risk Score Display */}
          <div className="p-4 rounded-xl bg-[#05070a] border border-slate-800/80 text-center shrink-0 min-w-[170px] hover:border-amber-500/20 transition-colors">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Composite Risk Score
            </div>
            <div
              className={`text-3xl font-light tracking-tight mt-1 ${
                (sowCase.composite_risk_score || 0) >= 50
                  ? 'text-rose-400'
                  : (sowCase.composite_risk_score || 0) >= 25
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {sowCase.composite_risk_score ?? 0} <span className="text-xs text-slate-500 font-normal font-sans">/ 100</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase font-medium">
              {sowCase.risk_level || 'LOW'} RISK PROFILE
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Sub-Tabs Navigation */}
      <div className="border-b border-slate-800/80 flex overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-xs tracking-tight font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-amber-400 text-amber-400 bg-amber-500/[0.02]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Sub-Tab Content */}
      <div className="py-2">{children}</div>
    </div>
  );
}
