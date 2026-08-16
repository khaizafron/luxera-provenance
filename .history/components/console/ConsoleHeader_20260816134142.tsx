'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck } from 'lucide-react';

interface ConsoleHeaderProps {
  onOpenMobile: () => void;
}

export function ConsoleHeader({ onOpenMobile }: ConsoleHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname === '/app') return 'DASHBOARD';
    if (pathname === '/app/cases') return 'CASES QUEUE';
    if (pathname === '/app/cases/new') return 'NEW SOW CASE';
    if (pathname === '/app/review') return 'HITL OFFICER REVIEW';
    if (pathname === '/app/compliance') return 'REGULATORY MATRIX';
    if (pathname === '/app/integrations') return 'LIVE INTEGRATIONS';
    if (pathname === '/app/team') return 'TEAM MEMBERS';
    if (pathname === '/app/settings') return 'ORGANIZATION SETTINGS';
    if (pathname.startsWith('/app/cases/')) return 'CASE DETAILS';
    return pathname.replace('/app/', '').toUpperCase();
  };

  const statusLabel = (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span>PDPA 2010</span>
      <span className="text-slate-400">•</span>
      <span>PII Redaction Active</span>
    </span>
  );

  return (
    <header className="h-16 bg-[#0f1013]/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">LUXERA PROVENANCE</span>
          </div>
          <span className="text-slate-700">/</span>
          <span className="text-amber-400 font-semibold tracking-wider">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="ui-header-status ui-pill--green" aria-label="PDPA 2010 PII Redaction Active">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          {statusLabel}
        </span>
      </div>
    </header>
  );
}
