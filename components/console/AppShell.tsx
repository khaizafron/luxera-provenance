'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConsoleHeader } from './ConsoleHeader';

interface AppShellProps {
  children: React.ReactNode;
}

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

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('luxera_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('luxera_sidebar_collapsed', String(nextState));
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Reusable Fixed Sidebar */}
      <Sidebar
        isCollapsed={mounted ? isCollapsed : false}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        session={session}
      />

      {/* Main Container - Left padding handles sidebar offset on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          mounted && isCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'
        }`}
      >
        {/* Console Header */}
        <ConsoleHeader onOpenMobile={() => setIsMobileOpen(true)} />

        {/* Page Content Stream */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
