'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Scale, FileText, ShieldCheck, Server, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-normal">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Apache 2.0 License & Data Controller/Processor Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white">Terms of Service & Operational Agreement</h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed font-normal">
            This Master Terms of Service governs the operational, legal, and statutory responsibilities between subscribing financial institutions and the Luxera Provenance Source of Wealth Intelligence Platform.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Classification of Legal Roles */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              1. Classification of Legal Roles & Statutory Mandate
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Luxera Provenance is engineered to operate in strict alignment with Southeast Asian (Malaysia/ASEAN) statutory frameworks and international AML/CFT directives. Under Section 6 of the Personal Data Protection Act 2010 (Act 709) and Section 13 of the Anti-Money Laundering Act 2001 (Act 613):
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-sm font-normal text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Subscribing Institution (Tenant / Client) — Data Controller Responsibilities
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-normal list-disc list-inside">
                  <li><strong>Consent Acquisition:</strong> Responsible for obtaining explicit digital consent from data subjects prior to dispatching customer financial records (payslips, tax declarations, bank statements) via Luxera APIs.</li>
                  <li><strong>KYC & Identity Verification:</strong> Retains sole responsibility for validating primary identity documents (NRIC, Passport) and performing initial customer screening.</li>
                  <li><strong>Human-in-the-Loop Sign-off:</strong> Bound by statutory requirements to ensure that a designated compliance officer reviews and renders final binding approval or rejection on all flagged cases.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-sm font-normal text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Luxera Provenance Platform — Data Processor Responsibilities
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-normal list-disc list-inside">
                  <li><strong>Tenant Data Isolation:</strong> Guarantees strict multi-tenant database isolation using PostgreSQL Row Level Security (RLS) on all queries.</li>
                  <li><strong>In-Memory PII Sanitization:</strong> Executes regex and Named Entity Recognition (NER) token masking before transmitting extracted document text to LLM endpoints.</li>
                  <li><strong>Cryptographic Audit Trails:</strong> Maintains an unalterable SHA-256 hash-chained ledger (<code className="text-orange-300">provenance_audit_chain</code>) recording all system evaluations, rule triggers, and officer sign-offs.</li>
                  <li><strong>Retention Lifecycle:</strong> Automatically purges temporary processing artifacts within 24 hours while enforcing 7-year WORM storage locks on final case evidence.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Statutory Basis under AMLA & BNM Directives */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              2. Statutory Processing Basis (AMLA 2001 & BNM Policy Document)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              The processing of customer financial evidence within Luxera Provenance rests on two statutory pillars:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-normal">
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-mono text-emerald-400 uppercase mb-2">AMLA 2001 Sec 13 / BNM Policy Document</div>
                <h3 className="text-sm font-normal text-white mb-2">Statutory Obligation Exemption</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under PDPA Act 709 Section 6(2)(b), processing necessary for compliance with a statutory obligation (performing mandatory CDD/EDD and verifying Source of Wealth for high-net-worth or high-risk accounts) is lawful under federal law.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-mono text-amber-400 uppercase mb-2">AMLA 2001 Sec 17</div>
                <h3 className="text-sm font-normal text-white mb-2">7-Year Statutory Audit Retention</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Requires all Customer Due Diligence and Source of Wealth verification records to be retained in tamper-evident storage for a minimum of 7 years post-case resolution, overriding premature data erasure requests.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Open Source Licensing & Self-Hosting Duties */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              3. Open Source Software License (Apache 2.0) & Self-Hosting Terms
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Luxera Provenance software components are published under the open-source <strong>Apache License 2.0</strong>. Subscribing institutions electing to deploy self-hosted Docker, Kubernetes, or cloud instances accept the following conditions:
            </p>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 font-normal">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-normal">KMS & Key Rotation:</strong> Self-hosting tenants are strictly responsible for managing KMS encryption keys, database passwords, and environment credentials (<code className="text-orange-300">GEMINI_API_KEY</code>, <code className="text-orange-300">N8N_API_KEY</code>).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-normal">Infrastructure Security:</strong> Tenant is responsible for enforcing TLS 1.3 encryption terminates at their load balancer boundary and maintaining PostgreSQL Row Level Security configurations.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-normal">No Warranty Disclaimer:</strong> In accordance with Apache 2.0 Section 7, software is provided "AS IS", without warranties or conditions of any kind, either express or implied.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Human-in-the-Loop & AI Governance Disclaimer */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              4. Human-In-The-Loop Oversight & AI Output Governance
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              In accordance with MOSTI National Guidelines on AI Governance & Ethics (2024) and ISO 42001 standards:
            </p>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed font-normal">
              All automated risk scores, anomaly flags, deposit-to-salary ratio calculations, and extracted financial profile outputs generated by Luxera Provenance are strictly advisory compliance recommendations. The platform does NOT execute legally binding credit denials or account freezes automatically. Final compliance determination remains solely with the tenant’s authorized compliance officer.
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
