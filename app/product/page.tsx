'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlowButton } from '@/components/ui/shiny-button-1';
import { CheckCircle2, Cpu, ArrowRight } from 'lucide-react';

export default function ProductPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-2 font-normal">Capabilities & Architecture</div>
          <h1 className="text-3xl font-normal text-white sm:text-4xl">Source of Wealth (SoW) Intelligence Engine</h1>
          <p className="mt-4 text-slate-300 text-base leading-relaxed font-normal">
            Luxera Provenance converts fragmented customer income documents, pay slips, tax filings, and bank statements into verified, audit-ready financial profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 font-normal">
          <div className="p-6 rounded-2xl bg-[#14151a] border border-slate-800/80">
            <h3 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-400" />
              Deterministic Rule Enforcement
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Calculates deposit-to-salary ratios, verifies employer names against corporate databases, and detects unexplained third-party transfers using deterministic mathematical logic that AI cannot override.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#14151a] border border-slate-800/80">
            <h3 className="text-lg font-normal text-white mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-orange-400" />
              Pre-LLM PII Protection
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Automatically sanitizes Malaysian NRIC numbers, passport IDs, credit card numbers, and bank account details prior to AI model evaluation, adhering to PDPA Act 709 Section 9.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 text-center font-normal">
          <h3 className="text-2xl font-normal text-white mb-3">Test the SoW Engine Live</h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6 font-normal">Create a case, upload sample payslips and bank statements, and review real-time deterministic compliance evaluations.</p>
          <GlowButton href="/app/cases/new">
            <span className="flex items-center gap-2 font-normal text-sm">
              Create Case <ArrowRight className="w-4 h-4" />
            </span>
          </GlowButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}

