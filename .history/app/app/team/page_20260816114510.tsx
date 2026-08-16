'use client';

import { Users, UserPlus, Mail, ShieldAlert, BadgeCheck } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function TeamPage() {
  const members = [
    { name: 'Luxera Compliance Officer', email: 'officer@luxera.world', role: 'COMPLIANCE_OFFICER', status: 'ACTIVE' },
    { name: 'Luxera Platform Administrator', email: 'admin@luxera.world', role: 'TENANT_ADMIN', status: 'ACTIVE' },
    { name: 'Independent External Auditor', email: 'audit@luxera.world', role: 'AUDITOR', status: 'READ_ONLY' },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ui-pill ui-pill--amber">
              ACCESS & IDENTITY MANAGEMENT
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans flex items-center gap-2">
            Organization Team Roster
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Role-Based Access Control (RBAC), officer permission logs, and institutional inspection accounts.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs transition-all shadow-lg shadow-amber-500/10 shrink-0 group">
          <UserPlus className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>Invite New Officer</span>
        </button>
      </div>

      <SpotlightCard className="p-6 overflow-hidden" spotlightColor="rgba(217, 119, 6, 0.05)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#05070a] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="p-4 font-normal">Full Name</th>
                <th className="p-4 font-normal">Email Address</th>
                <th className="p-4 font-normal">Role</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-[10px] font-mono text-amber-400 font-medium">
                      {m.name.charAt(0)}
                    </div>
                    <span className="font-sans font-light text-slate-200">{m.name}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{m.email}</td>
                  <td className="p-4 font-mono text-amber-400/95 font-medium">{m.role}</td>
                  <td className="p-4">
                    <span className={`ui-status ${m.status === 'READ_ONLY' ? 'ui-status--slate' : 'ui-status--green'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'READ_ONLY' ? 'bg-slate-300' : 'bg-emerald-300'}`} />
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
