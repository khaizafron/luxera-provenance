'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building2, CheckCircle2, ClipboardList, PlusCircle, ShieldCheck, Wallet } from 'lucide-react';

export default function PortfolioClientProfilePage({ params }: { params: Promise<{ clientId: string }> }) {
  const [client, setClient] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      const { clientId } = await params;
      try {
        const res = await fetch(`/api/portfolio/${clientId}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Client not found');
        setClient(data.client);
        setCases(data.cases || []);
      } catch (error) {
        console.error('Failed to load portfolio client:', error);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [params]);

  if (loading) {
    return <div className="text-xs text-slate-400 font-mono p-4">Loading client profile...</div>;
  }

  if (!client) {
    return <div className="text-xs text-slate-400 font-mono p-4">Client not found.</div>;
  }

  const latestCase = cases[0] || null;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800/80 flex items-end justify-between gap-4">
        <div>
          <div className="ui-pill ui-pill--amber mb-2">
            CLIENT PROFILE
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">{client.client_name}</h1>
        </div>

        <Link
          href={`/app/cases/new?client_id=${encodeURIComponent(client.client_id)}&client_name=${encodeURIComponent(client.client_name)}&total_deposited=${encodeURIComponent(client.total_deposited)}&currency=${encodeURIComponent(client.currency)}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-medium text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Create SoW Case
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0b0d12] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-mono">
            <Building2 className="w-4 h-4 text-amber-400" />
            Client Summary
          </div>
          <div className="space-y-3 text-xs">
            <div><span className="text-slate-500">Client ID:</span> <span className="font-mono text-slate-200">{client.client_id}</span></div>
            <div><span className="text-slate-500">Client Name:</span> <span className="text-white">{client.client_name}</span></div>
            <div><span className="text-slate-500">Total Deposited / Exposure:</span> <span className="font-mono text-emerald-400">{client.currency} {Number(client.total_deposited || 0).toLocaleString()}</span></div>
            <div><span className="text-slate-500">Currency:</span> <span className="font-mono text-slate-200">{client.currency}</span></div>
            <div><span className="text-slate-500">Organization Context:</span> <span className="text-slate-200">Luxera Cognitive Resources</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b0d12] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            SoW Status
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-[#080b10]">
            <div className="text-[10px] uppercase text-slate-500 mb-2 font-mono">Current Status</div>
            <div className="text-sm text-white font-medium">{latestCase ? (latestCase.overall_decision || latestCase.status) : 'NO_CASE'}</div>
          </div>
          {latestCase ? (
            <Link href={`/app/cases/${latestCase.id}`} className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300">
              <span>Open existing case</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link href={`/app/cases/new?client_id=${encodeURIComponent(client.client_id)}&client_name=${encodeURIComponent(client.client_name)}&total_deposited=${encodeURIComponent(client.total_deposited)}&currency=${encodeURIComponent(client.currency)}`} className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300">
              <span>No SoW case has been created for this client.</span>
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b0d12] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-mono">
            <Wallet className="w-4 h-4 text-amber-400" />
            Portfolio Context
          </div>
          <div className="space-y-3 text-xs">
            <div><span className="text-slate-500">Imported:</span> <span className="text-slate-200">{new Date(client.created_at).toLocaleString()}</span></div>
            <div><span className="text-slate-500">Last Updated:</span> <span className="text-slate-200">{new Date(client.updated_at).toLocaleString()}</span></div>
            <div><span className="text-slate-500">Source:</span> <span className="text-slate-200">{client.source}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0b0d12] p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-mono mb-4">
          <ClipboardList className="w-4 h-4 text-amber-400" />
          Related SoW Cases
        </div>

        {cases.length === 0 ? (
          <div className="text-sm text-slate-300">No SoW case has been created for this client.</div>
        ) : (
          <div className="space-y-3">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="rounded-xl border border-slate-800 bg-[#080b10] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-amber-400 text-[11px]">{caseItem.case_number}</div>
                  <div className="text-xs text-slate-300">{caseItem.customer_name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-mono border ${
                    caseItem.overall_decision === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : caseItem.overall_decision === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : caseItem.overall_decision === 'INSUFFICIENT_INFORMATION'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {caseItem.overall_decision || caseItem.status}
                  </span>
                  <Link href={`/app/cases/${caseItem.id}`} className="inline-flex items-center gap-1 text-xs text-amber-400">
                    Open case <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
