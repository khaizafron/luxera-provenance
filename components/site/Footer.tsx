'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowUpRight,
  Globe,
  Mail,
  Phone,
  FileText,
  Lock,
  Layers,
  Cpu,
  Github,
  CheckCircle2,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0c0d10] border-t border-slate-800/80 text-slate-400 text-xs font-sans relative overflow-hidden">
      {/* Subtle Atmospheric Gradient Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Column 1: Corporate Brand & Attribution (Spans 2 on sm/lg if needed or 1 on lg) */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/main-logo.png"
                alt="Luxera Provenance"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <div>
                <span className="font-semibold text-base tracking-tight text-white flex items-center gap-1">
                  LUXERA <span className="text-amber-400 font-normal">PROVENANCE</span>
                </span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Financial Evidence & Compliance Intelligence
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              Enterprise open-source Source of Wealth (SoW) compliance verification platform with deterministic rules, PII protection, and cryptographic hash-chained audit trails.
            </p>

            {/* Corporate Attribution Block */}
            <div className="pt-2 space-y-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/60 max-w-sm">
              <div className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Luxera Cognitive Resources</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Reg: 003808430-T</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 pt-1">
                <a
                  href="https://www.luxera.world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 group"
                >
                  <Globe className="w-3 h-3 text-amber-500/80" />
                  <span>luxera.world</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

                <a
                  href="mailto:contact@luxera.world"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-amber-500/80" />
                  <span>contact@luxera.world</span>
                </a>

                <a
                  href="tel:0177348015"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-500/80" />
                  <span>017-734 8015</span>
                </a>
              </div>
            </div>

            {/* License Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800/80 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>v1.1.0 • Apache License 2.0</span>
            </div>
          </div>

          {/* Column 2: Platform Architecture */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-mono text-[11px] uppercase tracking-wider font-semibold">
              Platform Architecture
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/product" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group">
                  <Layers className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span>SoW Automation Engine</span>
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group">
                  <Lock className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                  <span>PII Redaction & Vault</span>
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group">
                  <FileText className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span>Regulatory Matrix</span>
                </Link>
              </li>
              <li>
                <Link href="/open-source" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group">
                  <Cpu className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
                  <span>Self-Hosting & Docker</span>
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                  <span>Officer Review Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regulatory Compliance Standards */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-mono text-[11px] uppercase tracking-wider font-semibold">
              Regulatory Standards
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">PDPA 2010 (Act 709)</span>
                  <span className="text-[10px] text-slate-500">Malaysia Personal Data Protection</span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">AMLA 2001 (Act 613)</span>
                  <span className="text-[10px] text-slate-500">BNM Anti-Money Laundering</span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">ISO/IEC 42001</span>
                  <span className="text-[10px] text-slate-500">Artificial Intelligence Governance</span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">DPIA Framework</span>
                  <span className="text-[10px] text-slate-500">Data Protection Impact Assessment</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-mono text-[11px] uppercase tracking-wider font-semibold">
              Legal & Governance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy (PDPA Sec 7)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service & Licensing
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-amber-400 transition-colors">
                  Security Architecture & DPIA
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/khaizafron/luxera-provenance.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 group"
                >
                  <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                  <span>GitHub Source Code</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.luxera.world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 group"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                  <span>Luxera Corporate Portal</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-slate-900/90 bg-[#0a0b0d] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-300 font-medium">Luxera Cognitive Resources</span> (Reg. No. 003808430-T). All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>Distributed under Apache License 2.0</span>
            <span>•</span>
            <span className="text-slate-400">Cryptographic SHA-256 Audit Chain Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
