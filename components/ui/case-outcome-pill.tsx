'use client';

import React from 'react';

type CaseStatus = string | null | undefined;

type RiskTone = {
  shell: string;
  accent: string;
  value: string;
  band: string;
};

type StatusTone = {
  shell: string;
  dot: string;
  label: string;
};

function clampScore(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function normalizeStatus(status: CaseStatus) {
  return (status || '').toUpperCase().trim();
}

function formatStatusLabel(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'MANUAL_REVIEW_REQUIRED':
      return 'Manual Review';
    case 'REJECTED':
      return 'Rejected';
    case 'INSUFFICIENT_INFORMATION':
      return 'Insufficient Info';
    default:
      return status.replace(/_/g, ' ');
  }
}

function getRiskTone(score: number): RiskTone {
  if (score >= 50) {
    return {
      shell: 'border-rose-500/25 bg-gradient-to-b from-rose-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(244,63,94,0.65)]',
      accent: 'bg-rose-400',
      value: 'text-rose-200',
      band: 'CRITICAL',
    };
  }

  if (score >= 25) {
    return {
      shell: 'border-amber-500/25 bg-gradient-to-b from-amber-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(245,158,11,0.65)]',
      accent: 'bg-amber-400',
      value: 'text-amber-200',
      band: 'REVIEW',
    };
  }

  return {
    shell: 'border-emerald-500/25 bg-gradient-to-b from-emerald-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(16,185,129,0.65)]',
    accent: 'bg-emerald-400',
    value: 'text-emerald-200',
    band: 'LOW',
  };
}

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case 'APPROVED':
      return {
        shell: 'border-emerald-500/25 bg-gradient-to-b from-emerald-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(16,185,129,0.65)]',
        dot: 'bg-emerald-300',
        label: 'text-emerald-100',
      };
    case 'MANUAL_REVIEW_REQUIRED':
      return {
        shell: 'border-amber-500/25 bg-gradient-to-b from-amber-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(245,158,11,0.65)]',
        dot: 'bg-amber-300',
        label: 'text-amber-100',
      };
    case 'REJECTED':
      return {
        shell: 'border-rose-500/25 bg-gradient-to-b from-rose-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(244,63,94,0.65)]',
        dot: 'bg-rose-300',
        label: 'text-rose-100',
      };
    case 'INSUFFICIENT_INFORMATION':
      return {
        shell: 'border-sky-500/25 bg-gradient-to-b from-sky-500/10 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(56,189,248,0.65)]',
        dot: 'bg-sky-300',
        label: 'text-sky-100',
      };
    default:
      return {
        shell: 'border-slate-700 bg-gradient-to-b from-slate-800/80 to-[#090b11] shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)]',
        dot: 'bg-slate-300',
        label: 'text-slate-100',
      };
  }
}

export function RiskScorePill({ score }: { score?: number | null }) {
  const safeScore = clampScore(score ?? 0);
  const tone = getRiskTone(safeScore);

  return (
    <div
      className={`inline-grid w-[136px] grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-2.5 py-1.5 whitespace-nowrap backdrop-blur-sm ${tone.shell}`}
      aria-label={`Risk score ${safeScore} out of 100`}
    >
      <span className={`h-7 w-1 rounded-full ${tone.accent}`} />
      <div className="min-w-0">
        <div className="text-[8px] font-mono uppercase tracking-[0.24em] text-slate-500 leading-none">
          Risk
        </div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className={`text-sm leading-none font-semibold ${tone.value}`}>{safeScore}</span>
          <span className="text-[10px] text-slate-500">/100</span>
        </div>
      </div>
      <span className="justify-self-end rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-200">
        {tone.band}
      </span>
    </div>
  );
}

export function StatusPill({ status }: { status?: CaseStatus }) {
  const normalizedStatus = normalizeStatus(status);
  const tone = getStatusTone(normalizedStatus);
  const label = formatStatusLabel(normalizedStatus || 'UNKNOWN');

  return (
    <div
      className={`inline-flex w-[112px] items-center gap-2 rounded-xl border px-2.5 py-1.5 whitespace-nowrap backdrop-blur-sm ${tone.shell}`}
      aria-label={`Case status ${label}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${tone.dot} ring-2 ring-white/5`} />
      <div className="min-w-0">
        <div className="text-[8px] font-mono uppercase tracking-[0.24em] text-slate-500 leading-none">
          Status
        </div>
        <div className={`truncate text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.label}`}>
          {label}
        </div>
      </div>
    </div>
  );
}
