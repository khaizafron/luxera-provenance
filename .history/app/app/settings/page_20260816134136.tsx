'use client';

import { Settings, Save, Lock, Sliders, ShieldCheck } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function AppSettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Editorial Page Header */}
      <div className="pb-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ui-pill ui-pill--amber">
              SYSTEM & POLICY CONFIGURATION
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white font-sans flex items-center gap-2">
            Tenant Settings
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">
            Configure compliance thresholds, statutory validation parameters, and organization profile identity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Identity */}
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div>
            <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono pb-3 border-b border-slate-800/80">
              <Lock className="w-4 h-4 text-amber-400" />
              Organization Identity
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-400 font-medium">Organization Legal Name</label>
              <input
                type="text"
                defaultValue="Luxera Cognitive Resources"
                className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 font-medium">Statutory Regulatory License</label>
              <input
                type="text"
                defaultValue="Islamic Capital Markets Services License (SC Malaysia)"
                className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors font-sans"
              />
            </div>
          </div>
        </SpotlightCard>

        {/* Compliance Rule Thresholds */}
        <SpotlightCard className="p-6 space-y-6" spotlightColor="rgba(217, 119, 6, 0.08)">
          <div>
            <h2 className="text-xs font-normal text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono pb-3 border-b border-slate-800/80">
              <Sliders className="w-4 h-4 text-amber-400" />
              Compliance Rule Thresholds
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-slate-400 font-medium">Deposit-to-Salary Threshold</label>
                <input
                  type="text"
                  defaultValue="1.25x (25% variance)"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-medium">Risk Score Limit</label>
                <input
                  type="text"
                  defaultValue="50 / 100"
                  className="w-full px-4 py-3 rounded-xl bg-[#05070a] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 group">
                <Save className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Save Rule Settings</span>
              </button>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
