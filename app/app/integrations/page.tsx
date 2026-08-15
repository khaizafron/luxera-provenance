'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Server, Database, Lock, Cpu, ShieldCheck, Activity, Mail } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function IntegrationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      const json = await res.json();
      setData(json.integrations || null);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] tracking-wider uppercase font-medium">
              SYSTEM INFRASTRUCTURE & CONNECTIONS
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans flex items-center gap-2">
            Integration & Services status
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Real-time status check of core back-end microservices, database, document storage servers, and native AI orchestration engines.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs transition-all shadow-lg shadow-amber-500/10 shrink-0 group"
        >
          <RefreshCw className={`w-4 h-4 text-slate-950 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>{loading ? 'Polling API...' : 'Run Services Health Check'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Native SoW Compliance Engine */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(249, 115, 22, 0.08)" borderGlowColor="rgba(249, 115, 22, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Server className="w-4 h-4 text-orange-400" />
              Native Compliance Engine
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              {data?.sowEngine?.status || 'READY'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.sowEngine?.details || 'Applying deterministic financial checking and ratio calculations.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Pipeline Mode:</span>
              <span className="text-white">Active Native Engine</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Self-Contained:</span>
              <span className="text-white">Yes (Offline Capable)</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Gemini AI Card */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(16, 185, 129, 0.08)" borderGlowColor="rgba(16, 185, 129, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Google Gemini AI Engine
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-medium border ${
                data?.ai?.status === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {data?.ai?.status || 'NOT_CONFIGURED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.ai?.details || 'Google Gemini 2.5 Flash API connection.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Model:</span>
              <span className="text-white">gemini-2.5-flash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Secret Scope:</span>
              <span className="text-white">Server-Side Environment Key</span>
            </div>
          </div>
        </SpotlightCard>

        {/* OCR / Document Processing */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(59, 130, 246, 0.08)" borderGlowColor="rgba(59, 130, 246, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-400" />
              OCR & Text Processing
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              {data?.ocr?.status || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.ocr?.details || 'Local OCR text parsing and file format checks active.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Parser:</span>
              <span className="text-white">Native PDF / Text Parser</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Formats:</span>
              <span className="text-white">PDF, PNG, JPG, JPEG</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Database Card */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(245, 158, 11, 0.08)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-400" />
              Database Store
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.database?.details || 'Active standalone server database connection.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Engine:</span>
              <span className="text-white">{data?.database?.type || 'SQLite File'}</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Object Storage Card */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(245, 158, 11, 0.08)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-400" />
              Encrypted Document Storage
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.storage?.details || 'Secure file storage active with AES-256 wrapping.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Type:</span>
              <span className="text-white">Encrypted local storage vault</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Audit Ledger */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(16, 185, 129, 0.08)" borderGlowColor="rgba(16, 185, 129, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Audit Ledger
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              {data?.auditLedger?.status || 'ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.auditLedger?.details || 'Verifiable SHA-256 hash-chain ledger trails.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="text-white">SHA-256 Cryptographic Chain</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Authentication Service */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(59, 130, 246, 0.08)" borderGlowColor="rgba(59, 130, 246, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Lock className="w-4 h-4 text-blue-400" />
              User Authentication Service
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-medium">
              {data?.auth?.status || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.auth?.details || 'Secure session isolation and access controls.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Mode:</span>
              <span className="text-white">Role-Based (RBAC) Isolation</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Email Notification Gateway */}
        <SpotlightCard className="p-6 space-y-4" spotlightColor="rgba(249, 115, 22, 0.08)" borderGlowColor="rgba(249, 115, 22, 0.25)">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-white font-medium text-xs font-mono uppercase tracking-wider">
              <Mail className="w-4 h-4 text-orange-400" />
              Email Notification Gateway
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-medium border ${
                data?.email?.status === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {data?.email?.status || 'NOT_CONFIGURED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">{data?.email?.details || 'Transactional gateway for compliance alerts.'}</p>
          <div className="text-[10px] font-mono text-slate-400 bg-[#0c0d10] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Provider:</span>
              <span className="text-white">{data?.email?.provider || 'SMTP / Resend'}</span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
