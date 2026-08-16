'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, FileUp, Filter, PlusCircle, Search, Users, Wallet, BadgeCheck, AlertTriangle, CircleSlash, FileSearch } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface PortfolioClientRecord {
  id: string;
  client_id: string;
  client_name: string;
  total_deposited: number;
  currency: string;
  current_status?: string;
  created_at: string;
  updated_at: string;
}

function normalizeStatus(value?: string) {
  if (!value) return 'NO_CASE';
  if (value === 'MANUAL_REVIEW_REQUIRED') return 'MANUAL_REVIEW_REQUIRED';
  if (value === 'INSUFFICIENT_INFORMATION') return 'INSUFFICIENT_INFORMATION';
  if (value === 'REJECTED') return 'REJECTED';
  if (value === 'APPROVED') return 'APPROVED';
  return 'NO_CASE';
}

export default function PortfolioPage() {
  const [clients, setClients] = useState<PortfolioClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ created: number; updated: number; rejected: number } | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' });
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.client_id.toLowerCase().includes(search.toLowerCase()) ||
        client.client_name.toLowerCase().includes(search.toLowerCase());
      const normalized = normalizeStatus(client.current_status);
      const matchesStatus = statusFilter === 'ALL' || normalized === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const totalDeposited = clients.reduce((sum, client) => sum + Number(client.total_deposited || 0), 0);
  const totalClients = clients.length;
  const noCaseCount = clients.filter((client) => normalizeStatus(client.current_status) === 'NO_CASE').length;
  const approvedCount = clients.filter((client) => normalizeStatus(client.current_status) === 'APPROVED').length;
  const manualReviewCount = clients.filter((client) => normalizeStatus(client.current_status) === 'MANUAL_REVIEW_REQUIRED').length;
  const rejectedCount = clients.filter((client) => normalizeStatus(client.current_status) === 'REJECTED').length;
  const insufficientCount = clients.filter((client) => normalizeStatus(client.current_status) === 'INSUFFICIENT_INFORMATION').length;

  const handleDownloadTemplate = async () => {
    window.open('/api/portfolio/template', '_blank');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportError(null);
    setImportSummary(null);
    setValidation(null);
    setImporting(true);

    try {
      const text = await file.text();
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || 'Portfolio import failed.');
        setValidation(data.validation || null);
        throw new Error(data.error || 'Portfolio import failed.');
      }

      setImportSummary({
        created: data.created?.length || 0,
        updated: data.updated?.length || 0,
        rejected: data.rejected?.length || 0,
      });
      await fetchPortfolio();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800/80 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] tracking-wider uppercase font-medium mb-2">
            PORTFOLIO MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2 font-sans">
            <Users className="w-6 h-6 text-amber-400" />
            Portfolio & Clients
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Institutional client portfolio context and existing Source of Wealth verification status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0a0d12] text-slate-200 text-xs transition-all hover:border-slate-600"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download CSV Template
          </button>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs transition-all shadow-md cursor-pointer">
            <FileUp className="w-4 h-4 text-slate-950" />
            <span>{importing ? 'Importing...' : 'Import Client Data'}</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileImport} />
          </label>
        </div>
      </div>

      {selectedFileName && (
        <div className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">Selected file: {selectedFileName}</div>
      )}

      {importError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {importError}
        </div>
      )}

      {importSummary && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          Created: {importSummary.created} • Updated: {importSummary.updated} • Rejected: {importSummary.rejected}
        </div>
      )}

      {validation && validation.rejected?.length > 0 && (
        <SpotlightCard className="p-4 space-y-3">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-mono">Validation preview</div>
          <div className="text-xs text-slate-300">
            {validation.validCount} valid • {validation.rejectedCount} require correction
          </div>
          <ul className="space-y-2 text-[11px] text-slate-300 max-h-48 overflow-auto">
            {validation.rejected.slice(0, 8).map((issue: any, index: number) => (
              <li key={`${issue.lineNumber}-${index}`} className="border-l border-amber-500/40 pl-2">
                Line {issue.lineNumber || 'header'}: {issue.message}
              </li>
            ))}
          </ul>
        </SpotlightCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>Total Clients</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-white">{totalClients}</div>
        </SpotlightCard>

        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>Total Deposited</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-mono text-emerald-400">{Number(totalDeposited).toLocaleString()} </div>
        </SpotlightCard>

        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>No SoW Case</span>
            <CircleSlash className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-light text-white">{noCaseCount}</div>
        </SpotlightCard>

        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>Approved</span>
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-light text-emerald-400">{approvedCount}</div>
        </SpotlightCard>

        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>Manual Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-light text-amber-400">{manualReviewCount}</div>
        </SpotlightCard>
      </div>

      <SpotlightCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by client ID or name"
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
            <option value="ALL">All</option>
            <option value="NO_CASE">No Case</option>
            <option value="APPROVED">Approved</option>
            <option value="MANUAL_REVIEW_REQUIRED">Manual Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="INSUFFICIENT_INFORMATION">Insufficient Information</option>
          </select>
        </div>
      </SpotlightCard>

      <SpotlightCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading portfolio...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
              <FileSearch className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-white">Your client portfolio is empty.</h3>
            <p className="text-xs text-slate-400">Import a CSV to begin managing your client portfolio.</p>
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-medium text-xs cursor-pointer">
              <PlusCircle className="w-4 h-4" />
              <span>Import Client Data</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileImport} />
            </label>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-[#05070a] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="p-3.5 font-normal">Client ID</th>
                  <th className="p-3.5 font-normal">Client Name</th>
                  <th className="p-3.5 font-normal">Portfolio</th>
                  <th className="p-3.5 font-normal">Currency</th>
                  <th className="p-3.5 font-normal">SoW Status</th>
                  <th className="p-3.5 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClients.map((client) => {
                  const status = normalizeStatus(client.current_status);
                  return (
                    <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-3.5 font-mono text-amber-400 font-medium">{client.client_id}</td>
                      <td className="p-3.5 text-white">{client.client_name}</td>
                      <td className="p-3.5 font-mono text-slate-300">{Number(client.total_deposited || 0).toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-slate-300">{client.currency || 'MYR'}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider font-medium border ${
                          status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : status === 'MANUAL_REVIEW_REQUIRED'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : status === 'INSUFFICIENT_INFORMATION'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/app/portfolio/${client.client_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] transition-all"
                        >
                          <span>Open Client</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
