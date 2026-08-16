'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  FolderKanban,
  PlusCircle,
  CheckSquare,
  FileText,
  Sliders,
  Users,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: SessionUser;
  organization?: { id: string; name: string };
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  session?: SessionResponse | null;
}

export const NAV_ITEMS = [
  { href: '/app', label: 'Dashboard', icon: Activity },
  { href: '/app/portfolio', label: 'Portfolio', icon: Users },
  { href: '/app/cases', label: 'Cases Queue', icon: FolderKanban },
  { href: '/app/cases/new', label: 'New SoW Case', icon: PlusCircle },
  { href: '/app/review', label: 'Compliance Review', icon: CheckSquare },
  { href: '/app/compliance', label: 'Regulatory Matrix', icon: FileText },
  { href: '/app/integrations', label: 'Live Integrations', icon: Sliders },
  { href: '/app/team', label: 'Team Members', icon: Users },
  { href: '/app/settings', label: 'Organization Settings', icon: Settings },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  session,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    onCloseMobile();
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    await fetch('/api/sign-out', { method: 'POST' });
    router.push('/sign-in');
    router.refresh();
  };

  const isNavItemActive = (href: string) => {
    if (pathname === href) return true;

    if (href === '/app') return false;

    if (href === '/app/cases') {
      return pathname.startsWith('/app/cases/') && pathname !== '/app/cases/new';
    }

    return pathname.startsWith(`${href}/`);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0f1013] border-r border-slate-800 text-slate-100">
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <Link
          href="/app"
          className="flex items-center gap-2.5 overflow-hidden focus:outline-none"
        >
          <img
            src="/main-logo.png"
            alt="Luxera Logo"
            className="w-7 h-7 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-semibold text-xs tracking-tight text-white block whitespace-nowrap">
                LUXERA <span className="text-amber-400 font-normal">PROVENANCE</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {session?.organization?.name || 'Luxera Cognitive Resources'}
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors focus:outline-none"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onCloseMobile}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all relative group ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate tracking-tight">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 shrink-0 bg-[#0b0c0f]">
        {session?.authenticated && session.user ? (
          !isCollapsed ? (
            <div className="p-2.5 rounded-lg bg-[#14151a] border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-medium text-[11px] mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Officer Session Active
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {session.user.email}
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={`Officer Session Active (${session.user.email})`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          )
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className={`mt-2 flex items-center gap-2 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {navContent}
      </aside>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <div className="relative w-[280px] max-w-[80vw] h-full shadow-2xl transition-transform duration-300 ease-out z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
