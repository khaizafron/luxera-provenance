'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock, CheckCircle2, FileText, Database, GitBranch, ArrowRight, Server } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-normal">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PDPA Act 709 & Section 7 Statutory Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white">Privacy Policy & Personal Data Protection Notice</h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed font-normal">
            Pursuant to Section 7 of the Personal Data Protection Act 2010 (Act 709) and the Personal Data Protection Regulations 2013, this notice outlines the operational and technical framework governing personal data processing within the Luxera Provenance platform.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Legal Classification & Roles */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              1. Executive Context & Classification of Legal Roles
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Luxera Provenance is deployed as an enterprise multi-tenant software-as-a-service (SaaS) and private cloud intelligence platform. Subscribing financial institutions (Reporting Entities under AMLA 2001, such as banks, wealth management platforms, and Islamic fintechs) utilize Luxera Provenance to automate customer Source of Wealth (SoW) compliance verification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-1">Subscribing Financial Institution</div>
                <h3 className="text-base font-normal text-white mb-2">Data Controller (Data User)</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Determines the legal purpose of processing, maintains the direct contractual relationship with the end customer (data subject), and collects explicit onboarding consent prior to document dispatch.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">Luxera Provenance Platform</div>
                <h3 className="text-base font-normal text-white mb-2">Data Processor (Data User Agent)</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Processes personal data and financial evidence exclusively on behalf of and according to strict API instructions from the Data Controller, within tenant-isolated environment boundaries.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Seven Statutory Principles (Act 709 Sections 6-12) */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              2. Statutory Principles Compliance (PDPA Act 709 Mapping)
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">General Principle (Section 6) — Digital Consent Ledger</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-01</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Personal data is only processed upon receiving explicit digital consent. Luxera records digital consent receipts (<code className="text-orange-300">consent_logs</code>) capturing timestamp, IP address, user agent, and policy version before supporting financial documents are uploaded.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">Notice & Choice Principle (Section 7) — Explicit Purpose Disclosure</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-02</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Data subjects are explicitly notified of the processing scope (Source of Wealth evaluation, CDD/EDD compliance, income consistency checking) and the classes of processing sub-processors (isolated n8n workflow engine, encrypted object store).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">Disclosure Principle (Section 8) — Multi-Tenant Row Level Security</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-02</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Personal data is never disclosed or shared across organization boundaries. Database queries enforce PostgreSQL Row Level Security (RLS) policies scoped strictly by <code className="text-orange-300">organization_id</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">Security Principle (Section 9) — Encryption & Pre-LLM PII Sanitization</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-03 / 04</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  In-transit data is protected via TLS 1.3. Sensitive database fields are secured with AES-256-GCM envelope encryption. Before text payloads are analyzed by AI models, an in-memory Named Entity Recognition (NER) filter redacts NRICs, passports, and bank account numbers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">Retention Principle (Section 10) vs AMLA Sec 17 Mandatory Retention</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-05</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Verified case evidence is retained for a statutory 7-year period as mandated by AMLA 2001 Section 17 under cold encrypted storage locks. Temporary processing files (raw OCR text, intermediate JSON tokens) are hard-purged within 24 hours of case resolution.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-white">Data Access & Rectification Principle (Section 12) — DSAR API</span>
                  <span className="text-xs font-mono text-emerald-400">CTL-PDPA-06</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Data subjects can request data access or rectification through the tenant compliance officer via the automated Data Subject Access Request (DSAR) export API (<code className="text-orange-300">/api/v1/compliance/dsar</code>).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Data Protection Impact Assessment (DPIA) */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              3. Data Protection Impact Assessment (DPIA) & High-Risk Criteria
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              In accordance with Section 3.2 of the PDP Department DPIA Guideline, Luxera Provenance underwent a comprehensive privacy risk evaluation covering three statutory triggers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-normal">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-orange-400 font-mono mb-1 uppercase">Trigger 1: Scoring & Evaluation</div>
                <p className="text-slate-300 leading-relaxed">
                  SoW Risk Scoring Engine evaluates salary vs deposit ratios and computes a 0-100 composite risk score.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-amber-400 font-mono mb-1 uppercase">Trigger 2: Sensitive Personal Data</div>
                <p className="text-slate-300 leading-relaxed">
                  Processes tax declarations, payslips, bank statements, and NRIC images. Mitigated via pre-LLM PII token masking.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-emerald-400 font-mono mb-1 uppercase">Trigger 3: Automated Decisioning</div>
                <p className="text-slate-300 leading-relaxed">
                  Mitigated by mandatory Human-in-the-Loop (HITL) compliance officer sign-off before binding rejections or approvals.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Technical Verification Matrix Table */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              4. Technical Verification & Security Control Matrix
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-normal border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-3 px-3">Control ID</th>
                    <th className="py-3 px-3">Statutory Standard</th>
                    <th className="py-3 px-3">Implementing Luxera Module</th>
                    <th className="py-3 px-3">Verification & Verification Mechanism</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-01</td>
                    <td className="py-3 px-3">PDPA Sec 6 (Consent)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">app/api/consent/route.ts</code></td>
                    <td className="py-3 px-3">Database insert receipt with IP, timestamp, user agent & policy hash.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-02</td>
                    <td className="py-3 px-3">PDPA Sec 8 (Isolation)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">PostgreSQL RLS Policies</code></td>
                    <td className="py-3 px-3">Unit tests asserting multi-tenant query failure without organization context.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-03</td>
                    <td className="py-3 px-3">PDPA Sec 9 (Encryption)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">lib/crypto/envelope.ts</code></td>
                    <td className="py-3 px-3">AES-256-GCM envelope encryption & TLS 1.3 protocol scanner checks.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-04</td>
                    <td className="py-3 px-3">PDPA Sec 9 (PII Redaction)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">lib/compliance/pii-redactor.ts</code></td>
                    <td className="py-3 px-3">Regex & NER unit tests asserting zero NRIC/Passport tokens in outbound payloads.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-05</td>
                    <td className="py-3 px-3">PDPA Sec 10 (Retention)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">lib/jobs/retention-purger.ts</code></td>
                    <td className="py-3 px-3">Scheduled purge job enforcing hard deletion of temporary OCR files post-evaluation.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">CTL-PDPA-06</td>
                    <td className="py-3 px-3">PDPA Sec 12 (DSAR Access)</td>
                    <td className="py-3 px-3"><code className="text-slate-200">app/api/compliance/dsar/route.ts</code></td>
                    <td className="py-3 px-3">Automated JSON/PDF data export bundling user profile & SoW evidence dossier.</td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
