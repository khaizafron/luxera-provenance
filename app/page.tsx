'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlowButton } from '@/components/ui/shiny-button-1';
import { LiquidButton } from '@/components/ui/button-1';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Database,
  GitBranch,
  Terminal,
  Server,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-800/60 bg-gradient-to-b from-[#0c0d10] via-[#101114] to-[#0c0d10]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,85,0,0.12),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.03em] text-white max-w-4xl leading-[1.08] font-sans">
            Financial Evidence & <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent font-normal">
              Compliance Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
            Enterprise-grade Source of Wealth (SoW) compliance automation for fintechs, wealth managers, and financial institutions. Powered by deterministic financial consistency rules, real-time PII redaction, and cryptographic audit trail verification.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LiquidButton href="/app">
              <span className="flex items-center gap-2 font-normal text-base">
                Launch Live Application
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </span>
            </LiquidButton>
            <Link
              href="/open-source"
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-normal text-sm transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-orange-400" />
              Self-Hosting Docs
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 hover:border-orange-500/30">
              <div className="text-xs text-slate-400 uppercase font-mono mb-1">Processing Engine</div>
              <div className="text-lg font-normal text-white flex items-center gap-2 mt-2">
                <Server className="w-5 h-5 text-orange-400" />
                Autonomous AI Pipeline
              </div>
            </div>
            <div className="card p-5 hover:border-emerald-500/30">
              <div className="text-xs text-slate-400 uppercase font-mono mb-1">Data Protection</div>
              <div className="text-lg font-normal text-white flex items-center gap-2 mt-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                PDPA Act 709 Redaction
              </div>
            </div>
            <div className="card p-5 hover:border-amber-500/30">
              <div className="text-xs text-slate-400 uppercase font-mono mb-1">AML Benchmark</div>
              <div className="text-lg font-normal text-white flex items-center gap-2 mt-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                AMLA 2001 Compliant
              </div>
            </div>
            <div className="card p-5 hover:border-blue-500/30">
              <div className="text-xs text-slate-400 uppercase font-mono mb-1">Audit Trail</div>
              <div className="text-lg font-normal text-white flex items-center gap-2 mt-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                SHA-256 Hash Chain
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Architecture Flow */}
      <section className="py-16 md:py-24 bg-[#0c0d10] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-white">End-to-End SoW Evaluation Architecture</h2>
            <p className="mt-3 text-slate-400 text-sm font-normal">
              Real-time pipeline passing customer financial evidence through PII redaction, deterministic rule checks, structured LLM extraction, and cryptographic ledger recording.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="card hover:border-orange-500/30">
              <div className="card-body flex gap-4">
                <div className="icon text-orange-400">1</div>
                <div>
                  <h3 className="text-sm font-normal text-white mb-2">Customer Case & Upload</h3>
                  <p className="text-xs text-slate-400 font-normal">Capture declared annual salary, primary wealth source, payslips, and bank statements with PDPA digital consent.</p>
                </div>
              </div>
            </div>

            <div className="card hover:border-emerald-500/30">
              <div className="card-body flex gap-4">
                <div className="icon text-emerald-400">2</div>
                <div>
                  <h3 className="text-sm font-normal text-white mb-2">Pre-LLM PII Redaction</h3>
                  <p className="text-xs text-slate-400 font-normal">Masks NRIC/Passport numbers, bank account details, and emails prior to transmitting text to external LLMs.</p>
                </div>
              </div>
            </div>

            <div className="card hover:border-amber-500/30">
              <div className="card-body flex gap-4">
                <div className="icon text-amber-400">3</div>
                <div>
                  <h3 className="text-sm font-normal text-white mb-2">Deterministic Consistency Engine</h3>
                  <p className="text-xs text-slate-400 font-normal">Evaluates bank deposits vs declared salary ratio, employer name matching, and document freshness thresholds.</p>
                </div>
              </div>
            </div>

            <div className="card hover:border-blue-500/30">
              <div className="card-body flex gap-4">
                <div className="icon text-blue-400">4</div>
                <div>
                  <h3 className="text-sm font-normal text-white mb-2">Immutable Hash Chain Audit</h3>
                  <p className="text-xs text-slate-400 font-normal">Records decision blocks with SHA-256 hash signatures, guaranteeing tamper-evident regulatory inspection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bar */}
      <section className="py-12 bg-orange-500/5 border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-normal text-white">Ready to test the live SoW compliance workflow?</h3>
            <p className="text-slate-300 text-sm mt-1 font-normal">Experience real case creation, document processing, and compliance review in the Luxera Console.</p>
          </div>
          <GlowButton href="/app/cases/new">
            <span className="font-normal flex items-center gap-2 text-sm">
              Create New Case Now
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </span>
          </GlowButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}

