'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Lock, GitBranch, Database, ShieldCheck, Key, Server, CheckCircle2 } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-normal">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Enterprise Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white">Security & Data Governance Architecture</h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed font-normal">
            Luxera Provenance is engineered from the ground up for strict personal data privacy, multi-tenant isolation, field-level envelope encryption, and immutable auditability under PDPA Act 709 and BNM guidelines.
          </p>
        </div>

        <div className="space-y-10">
          {/* Section 1: Core Pillars */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 font-normal">
            <div className="p-6 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-normal text-white">Pre-LLM PII Token Masking</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Extracted customer text is scanned in-memory using Named Entity Recognition (NER) models to tokenize NRICs, passports, and account numbers prior to LLM submission.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-orange-500/10 text-orange-400">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-normal text-white">Cryptographic Hash Chaining</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Every evaluation event, risk score, and compliance officer override is linked via SHA-256 hash chaining (<code className="text-orange-300 font-mono">provenance_audit_chain</code>) to prevent data tampering.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-normal text-white">PostgreSQL Row Level Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Database queries enforce strict multi-tenancy boundaries using <code className="text-orange-300 font-mono">organization_id</code> policies, preventing cross-tenant data leaks.
              </p>
            </div>
          </section>

          {/* Section 2: Technical Security Control Specifications */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              Security Specifications & Key Management
            </h2>

            <div className="space-y-4 text-xs font-normal">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-normal text-white text-sm">Envelope Encryption (AES-256-GCM)</span>
                  <span className="font-mono text-purple-400">lib/crypto/envelope.ts</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Payload fields containing salary numbers, declared wealth, and identity data are encrypted at rest using AES-256-GCM with per-tenant data encryption keys (DEKs) wrapped by a master KMS key.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-normal text-white text-sm">In-Transit Transport Layer Security</span>
                  <span className="font-mono text-purple-400">TLS 1.3 / HTTPS</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  All REST endpoints and webhook dispatches mandate TLS 1.3 transport security with modern cipher suites and HTTP Strict Transport Security (HSTS).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-normal text-white text-sm">Automated Audit Verification Script</span>
                  <span className="font-mono text-purple-400">/api/v1/compliance/verify-audit-chain</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Administrator utility that iteratively re-computes SHA-256 block signatures across the audit ledger to detect and flag any database row modification or unauthorized alteration.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
