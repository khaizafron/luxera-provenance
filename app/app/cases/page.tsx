'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, FolderKanban, ArrowUpRight } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { RiskScorePill, StatusPill } from '@/components/ui/case-outcome-pill';

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch('/api/cases', { cache: 'no-store' });
        const data = await res.json();
        setCases(data.cases || []);
      } catch (err) {
        console.error('Failed to fetch cases:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.employer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="ui-pill ui-pill--amber mb-2">
            FINANCIAL COMPLIANCE PIPELINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2 font-sans">
            <FolderKanban className="w-6 h-6 text-amber-400" />
            Source of Wealth Cases Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Active customer compliance cases undergoing evidence verification and audit.
          </p>
        </div>

        <Link
          href="/app/cases/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Create New SoW Case</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <SpotlightCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between" showIcon={false} showClose={false}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, case ID, employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#05070a] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#05070a] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-mono transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="MANUAL_REVIEW_REQUIRED">MANUAL_REVIEW_REQUIRED</option>
            <option value="INSUFFICIENT_INFORMATION">INSUFFICIENT_INFORMATION</option>
            <option value="REJECTED">REJECTED</option>
            <option value="QUEUED">QUEUED</option>
          </select>
        </div>
      </SpotlightCard>

      {/* Table */}
      <SpotlightCard className="p-6" showIcon={false} showClose={false}>
        <div className="overflow-x-auto pb-2">
        <table className="w-max min-w-[1180px] table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[110px]" />
            <col className="w-[140px]" />
            <col className="w-[130px]" />
            <col className="w-[120px]" />
            <col className="w-[230px]" />
            <col className="w-[130px]" />
            <col className="w-[130px]" />
            <col className="w-[140px]" />
          </colgroup>
          <thead className="bg-[#05070a] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="p-3.5 font-normal">Case ID</th>
              <th className="p-3.5 font-normal">Customer Name</th>
              <th className="p-3.5 font-normal">NRIC / Passport</th>
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
                <td colSpan={8} className="p-8 text-center text-slate-400 font-normal">
                  Loading cases...
                </td>
              </tr>
            ) : filteredCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-normal">
                  No matching cases found.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-3.5 font-mono text-amber-400 font-medium">{c.case_number}</td>
                  <td className="p-3.5 font-normal text-white">{c.customer_name}</td>
                  <td className="p-3.5 font-mono text-slate-300">{c.customer_nric_passport}</td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {c.currency} {c.declared_annual_income?.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-slate-300 font-normal">{c.employer_name}</td>
                  <td className="p-3.5">
                    <RiskScorePill score={c.composite_risk_score ?? 0} />
                  </td>
                  <td className="p-3.5">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="p-3.5 text-center">
                    <Link
                      href={`/app/cases/${c.id}`}
                      className="inline-flex w-[104px] items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] font-normal transition-all group-hover:border-amber-500/40"
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
