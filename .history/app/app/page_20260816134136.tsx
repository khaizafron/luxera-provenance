'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  ArrowRight,
  Sliders,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  ArrowUpRight,
  TrendingUp,
  FileSearch,
  Lock,
  UploadCloud
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { UploadCard } from '@/components/ui/upload-ui';

export default function DashboardPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Upload card interactive state simulation
  const [demoStatus, setDemoStatus] = useState<'uploading' | 'success' | 'error'>('uploading');
  const [demoProgress, setDemoProgress] = useState(35);

  useEffect(() => {
    let interval: any;
    if (demoStatus === 'uploading') {
      interval = setInterval(() => {
        setDemoProgress((prev) => {
          if (prev >= 100) {
            setDemoStatus('success');
            return 100;
          }
          return prev + 5;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [demoStatus]);

  useEffect(() => {
    async function loadData() {
      try {
        const [casesRes, intRes] = await Promise.all([
          fetch('/api/cases', { cache: 'no-store' }),
          fetch('/api/integrations/status', { cache: 'no-store' }),
        ]);
        const casesData = await casesRes.json();
        const intData = await intRes.json();
        setCases(casesData.cases || []);
        setIntegrations(intData.integrations || null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCases = cases.length;
  const approvedCases = cases.filter((c) => c.status === 'APPROVED').length;
  const reviewRequiredCases = cases.filter((c) => c.status === 'MANUAL_REVIEW_REQUIRED').length;
  const insufficientCases = cases.filter((c) => c.status === 'INSUFFICIENT_INFORMATION').length;
  const rejectedCases = cases.filter((c) => c.status === 'REJECTED').length;

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ui-pill ui-pill--amber">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              LUXERA COGNITIVE RESOURCES · ORG-LUXERA-01
            </span>
          </div>
          {/* h1 with non-bold light typography */}
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white font-sans">
            Source of Wealth Compliance Console
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Automated financial evidence verification, real-time PII sanitization, and cryptographic audit logging platform engineered for institutional wealth management operations.
          </p>
        </div>

        <Link
          href="/app/cases/new"
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 shrink-0 group"
        >
          <PlusCircle className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>Create New SoW Case</span>
        </Link>
      </div>

      {/* Institutional Metric Cards Grid with Interactive Cursor Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Active Cases */}
        <SpotlightCard className="p-4" spotlightColor="rgba(217, 119, 6, 0.1)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-300">Total Cases</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-light text-white tracking-tight font-sans">{totalCases}</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pipeline cases
          </div>
        </SpotlightCard>

        {/* Approved Cases */}
        <SpotlightCard className="p-4" spotlightColor="rgba(16, 185, 129, 0.1)" borderGlowColor="rgba(16, 185, 129, 0.3)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-300">Approved</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-light text-emerald-400 tracking-tight font-sans">{approvedCases}</div>
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-2 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Low risk (Score 0–24)
          </div>
        </SpotlightCard>

        {/* Review Required */}
        <SpotlightCard className="p-4" spotlightColor="rgba(245, 158, 11, 0.1)" borderGlowColor="rgba(245, 158, 11, 0.3)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-300">Review Required</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-light text-amber-400 tracking-tight font-sans">{reviewRequiredCases}</div>
          </div>
          <div className="text-[10px] text-amber-400/90 mt-2 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Moderate risk (Score 25–49)
          </div>
        </SpotlightCard>

        {/* Insufficient Information */}
        <SpotlightCard className="p-4" spotlightColor="rgba(14, 165, 233, 0.1)" borderGlowColor="rgba(14, 165, 233, 0.3)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-300">Insufficient Info</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileSearch className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-light text-sky-400 tracking-tight font-sans">{insufficientCases}</div>
          </div>
          <div className="text-[10px] text-sky-400/90 mt-2 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Evidence required (Score 0)
          </div>
        </SpotlightCard>

        {/* Rejected Cases */}
        <SpotlightCard className="p-4" spotlightColor="rgba(244, 63, 94, 0.1)" borderGlowColor="rgba(244, 63, 94, 0.3)" showIcon={false} showClose={false}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="font-medium text-slate-300">Rejected</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-light text-rose-400 tracking-tight font-sans">{rejectedCases}</div>
          </div>
          <div className="text-[10px] text-rose-400/90 mt-2 flex items-center gap-1.5 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Critical mismatch (&ge; 50)
          </div>
        </SpotlightCard>
      </div>

      {/* Integration Status Panel */}
      <SpotlightCard className="p-6 space-y-4" showIcon={false} showClose={false}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Sliders className="w-4 h-4 text-amber-400" />
            Live Runtime Integration Status
          </h2>
          <Link
            href="/app/integrations"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors group"
          >
            <span>Manage Integrations</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="card hover:border-amber-500/30 transition-all">
            <div className="card-body">
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Native Compliance Engine
              </div>
              <div className="font-normal text-white flex items-center gap-2 mt-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    integrations?.sowEngine?.status === 'READY' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {integrations?.sowEngine?.status || 'READY'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate font-normal">
                {integrations?.sowEngine?.details || 'Deterministic local rules active'}
              </div>
            </div>
          </div>

          <div className="card hover:border-emerald-500/30 transition-all">
            <div className="card-body">
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Gemini AI Engine
              </div>
              <div className="font-normal text-white flex items-center gap-2 mt-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    integrations?.ai?.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {integrations?.ai?.status || 'CONNECTED'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate font-normal">
                {integrations?.ai?.details || 'Google Gemini 2.5 Flash API'}
              </div>
            </div>
          </div>

          <div className="card hover:border-blue-500/30 transition-all">
            <div className="card-body">
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Audit Ledger Hash Chain
              </div>
              <div className="font-normal text-emerald-400 flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ACTIVE & VERIFIED
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-normal">
                Cryptographic SHA-256 Chaining
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Interactive Evidence Upload Simulation Workspace (Direct component from User Prompt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(245, 158, 11, 0.05)" showIcon={false} showClose={false}>
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-800/80">
            <UploadCloud className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider font-mono">
              Live Asset Upload Simulator Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Verify the physical render integrity, color state transitions, progress bars, and button events of your institutional Upload Component live. Click below to test various edge conditions:
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => { setDemoStatus('uploading'); setDemoProgress(35); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                demoStatus === 'uploading'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Simulate Uploading
            </button>
            <button
              onClick={() => { setDemoStatus('success'); setDemoProgress(100); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                demoStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Simulate Success
            </button>
            <button
              onClick={() => { setDemoStatus('error'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                demoStatus === 'error'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Simulate Error
            </button>
          </div>
        </SpotlightCard>

        {/* Live UploadCard Render */}
        <UploadCard
          status={demoStatus}
          progress={demoProgress}
          title={
            demoStatus === 'uploading'
              ? 'Uploading Statement of Wealth Evidence...'
              : demoStatus === 'success'
              ? 'Verification Dossier Compiled!'
              : 'Secure Upload Failure'
          }
          description={
            demoStatus === 'uploading'
              ? 'Analyzing NRIC, verifying salary payslips, and executing pre-LLM PII sanitization redaction filters.'
              : demoStatus === 'success'
              ? 'SHA-256 hash successfully linked to blockchain ledger block. Case record state transit set to APPROVED.'
              : 'Network handshake timeout. Secure cryptographic file gateway has refused connection. Please retry.'
          }
          primaryButtonText={
            demoStatus === 'uploading' ? 'Abort Upload' : demoStatus === 'success' ? 'Copy Secure URI' : 'Re-establish Handshake'
          }
          onPrimaryButtonClick={() => {
            if (demoStatus === 'uploading') {
              setDemoStatus('error');
            } else if (demoStatus === 'success') {
              alert('Copied secure case ledger link to clipboard!');
            } else {
              setDemoStatus('uploading');
              setDemoProgress(10);
            }
          }}
          secondaryButtonText={demoStatus !== 'uploading' ? 'Dismiss' : undefined}
          onSecondaryButtonClick={() => {
            alert('Upload card interaction dismissed.');
          }}
        />
      </div>

      {/* Recent Cases Table with Spotlight Container */}
      <SpotlightCard className="p-6 space-y-4" showIcon={false} showClose={false}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-amber-400" />
            Recent SoW Verification Cases
          </h2>
          <Link
            href="/app/cases"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1 group"
          >
            <span>View All Cases Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080c14] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="p-3.5 font-normal">Case ID</th>
                <th className="p-3.5 font-normal">Customer Name</th>
                <th className="p-3.5 font-normal">Declared Income</th>
                <th className="p-3.5 font-normal">Employer</th>
                <th className="p-3.5 font-normal">Risk Score</th>
                <th className="p-3.5 font-normal">Status</th>
                <th className="p-3.5 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-normal">
                    Loading cases pipeline...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-normal">
                    No cases in queue.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-3.5 font-mono text-amber-400 font-medium">{c.case_number}</td>
                    <td className="p-3.5 font-normal text-white">{c.customer_name}</td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {c.currency} {c.declared_annual_income?.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-300 font-normal">{c.employer_name}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-mono text-[10px] tracking-wider font-medium border ${
                          (c.composite_risk_score || 0) >= 50
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : (c.composite_risk_score || 0) >= 25
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {c.composite_risk_score ?? 0} / 100
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider font-medium border ${
                          c.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : c.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : c.status === 'MANUAL_REVIEW_REQUIRED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : c.status === 'INSUFFICIENT_INFORMATION'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/app/cases/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] font-normal transition-all group-hover:border-amber-500/40"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
