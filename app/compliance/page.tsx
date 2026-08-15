'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, CheckCircle2, FileText, Database, GitBranch, Cpu, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CompliancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-normal">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Statutory & Regulatory Compliance Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white">Regulatory Compliance Framework</h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed font-normal">
            Direct statutory mapping, technical control traceability, and implementation gap analysis for Southeast Asian (Malaysia/ASEAN) statutory frameworks and global financial crime guidelines.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Statutory Source Register */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              1. Statutory & Regulatory Source Inventory
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Luxera Provenance is bound by strict statutory requirements regarding personal data protection, anti-money laundering, and automated financial decision-making transparency:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-normal border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-3 px-3">Source ID</th>
                    <th className="py-3 px-3">Statutory Title / Regulation</th>
                    <th className="py-3 px-3">Issuing Authority</th>
                    <th className="py-3 px-3">Core Application in Luxera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-PDPA-2010</td>
                    <td className="py-3 px-3 font-normal text-white">Personal Data Protection Act 2010 (Act 709)</td>
                    <td className="py-3 px-3">Parliament of Malaysia / PDP Dept</td>
                    <td className="py-3 px-3">Enforces consent, notice, multi-tenant isolation, data retention, and PII protection principles.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-PDPR-2013</td>
                    <td className="py-3 px-3 font-normal text-white">Personal Data Protection Regulations 2013</td>
                    <td className="py-3 px-3">Minister of Communications</td>
                    <td className="py-3 px-3">Operational standards for data user registration, consent logging, and DSAR processing.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-DPIA-GUIDE</td>
                    <td className="py-3 px-3 font-normal text-white">DPIA Guideline for High-Risk AI Processing</td>
                    <td className="py-3 px-3">Department of Personal Data Protection</td>
                    <td className="py-3 px-3">Mandatory risk assessment methodology for AI document evaluation & risk scoring.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-AMLA-2001</td>
                    <td className="py-3 px-3 font-normal text-white">AMLA 2001 (Act 613)</td>
                    <td className="py-3 px-3">Bank Negara Malaysia (BNM)</td>
                    <td className="py-3 px-3">Governs CDD/EDD, Source of Wealth verification, and mandatory 7-year audit retention.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-BNM-AML-PD</td>
                    <td className="py-3 px-3 font-normal text-white">BNM Policy Document on AML/CFT</td>
                    <td className="py-3 px-3">Bank Negara Malaysia</td>
                    <td className="py-3 px-3">Mandates reporting institutions to establish legitimate provenance of customer funds and wealth.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">SRC-AI-GOV-2024</td>
                    <td className="py-3 px-3 font-normal text-white">National Guidelines on AI Governance / ISO 42001</td>
                    <td className="py-3 px-3">MOSTI / Global Standards</td>
                    <td className="py-3 px-3">Enforces explainability, transparency, line-item document citations, and human oversight.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Detailed Requirements Matrix */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              2. Detailed Legal Requirements Matrix
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-normal border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-3 px-3">Req ID</th>
                    <th className="py-3 px-3">Legal Source</th>
                    <th className="py-3 px-3">Legal Requirement Description</th>
                    <th className="py-3 px-3">Technical System Specification</th>
                    <th className="py-3 px-3">Luxera Module</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-PDPA-01</td>
                    <td className="py-3 px-3">PDPA Sec 6</td>
                    <td className="py-3 px-3">Explicit user consent for processing financial records & PII.</td>
                    <td className="py-3 px-3">Capture digital consent receipt with timestamp, IP, and policy version before upload.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Auth & Onboarding</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-PDPA-02</td>
                    <td className="py-3 px-3">PDPA Sec 9</td>
                    <td className="py-3 px-3">Encryption of PII at rest and in transit.</td>
                    <td className="py-3 px-3">TLS 1.3 in transit; AES-256-GCM envelope encryption for sensitive payload fields.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Security Engine</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-PDPA-03</td>
                    <td className="py-3 px-3">PDPA Sec 10</td>
                    <td className="py-3 px-3">Data retention enforcement & automated purging.</td>
                    <td className="py-3 px-3">Automated lifecycle manager; hard deletion of temporary OCR files post-evaluation.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Storage Engine</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-PDPA-04</td>
                    <td className="py-3 px-3">PDPA Sec 12</td>
                    <td className="py-3 px-3">Right to Data Access & Rectification (DSAR).</td>
                    <td className="py-3 px-3">Compliance feature to export customer data dossier or edit incorrect income fields.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Compliance UI</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-AMLA-01</td>
                    <td className="py-3 px-3">AMLA Sec 13</td>
                    <td className="py-3 px-3">Verification of Source of Wealth for high-risk accounts.</td>
                    <td className="py-3 px-3">Automated financial rule comparison (salary vs deposits ratio, third-party funding checks).</td>
                    <td className="py-3 px-3"><code className="text-slate-200">SoW Engine & AI</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-AMLA-02</td>
                    <td className="py-3 px-3">AMLA Sec 17</td>
                    <td className="py-3 px-3">Retention of CDD & SoW verification records for minimum 7 years.</td>
                    <td className="py-3 px-3">Long-term cold archive store with immutability guarantees (Object Lock / WORM).</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Audit Ledger</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-AMLA-03</td>
                    <td className="py-3 px-3">BNM AML-PD</td>
                    <td className="py-3 px-3">Audit trailing of all compliance officer decisions and overrides.</td>
                    <td className="py-3 px-3">Cryptographically signed audit log (<code className="text-orange-300">provenance_audit_chain</code>) detailing officer ID, reason, and timestamp.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Audit Engine</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-DPIA-01</td>
                    <td className="py-3 px-3">DPIA Guide</td>
                    <td className="py-3 px-3">Systematic assessment of privacy risks in AI processing.</td>
                    <td className="py-3 px-3">Pre-processing PII redaction layer before sending document text to external LLMs.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">PII Service</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-AIGOV-01</td>
                    <td className="py-3 px-3">AI Gov / ISO 42001</td>
                    <td className="py-3 px-3">Transparent explainability for automated decision outputs.</td>
                    <td className="py-3 px-3">Every evaluation provides breakdown of risk score, rule failures, and exact document citations.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Explanation UI</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-orange-400">REQ-AIGOV-02</td>
                    <td className="py-3 px-3">AI Gov / ISO 42001</td>
                    <td className="py-3 px-3">Human-in-the-Loop oversight for automated financial decisions.</td>
                    <td className="py-3 px-3">Machine decisions categorized as recommendations; final binding rejection/approval requires officer signoff.</td>
                    <td className="py-3 px-3"><code className="text-slate-200">Case Review Queue</code></td>
                    <td className="py-3 px-3"><span className="text-emerald-400 font-mono">IMPLEMENTED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Gap Analysis & Technical Remediation Specifications */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              3. Compliance Gap Analysis & Technical Remediation Plan
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Comparison between raw engine workflow logic and regulatory mandates, along with Luxera engineering remediations:
            </p>

            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Gap 1: Third-Party AI Data Leakage Prevention (PDPA Sec 9)</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">REMEDIATED</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  <strong>Vulnerability:</strong> Passing raw document text directly to external LLMs risks transmitting customer PII (NRIC, Passport numbers, bank account numbers).<br />
                  <strong>Luxera Remediation:</strong> Built an in-memory PII Sanitizer Micro-Service (<code className="text-orange-300">lib/compliance/pii-redactor.ts</code>) using local regex and Named Entity Recognition (NER) models to mask personal tokens (<code className="text-orange-300">[NAME_REDACTED]</code>, <code className="text-orange-300">[NRIC_REDACTED]</code>) prior to LLM invocation.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Gap 2: Statutory Retention vs Right-to-be-Forgotten Conflict</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">REMEDIATED</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  <strong>Vulnerability:</strong> AMLA Sec 17 mandates 7-year evidence retention, whereas PDPA Sec 10 requires destroying data once processing completes.<br />
                  <strong>Luxera Remediation:</strong> Built stateful document lifecycle tagging (<code className="text-orange-300">lib/jobs/retention-purger.ts</code>). Active Case Evidence is locked in encrypted Object Storage for 7 years post-resolution, while temporary OCR artifacts and intermediate JSON tokens are hard-purged within 24 hours.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Gap 3: Tamper-Evident Recordkeeping Deficit (BNM AML Audit)</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">REMEDIATED</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  <strong>Vulnerability:</strong> System workflow logs are transitory and editable, failing BNM audit tamper-evidence standards.<br />
                  <strong>Luxera Remediation:</strong> Built <code className="text-orange-300">provenance_audit_chain</code> in PostgreSQL. Every evaluation, officer note, or decision override generates an unalterable block containing sequence ID, previous block hash, payload hash, timestamp, and cryptographic signature.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Gap 4: Black-Box AI Decisions & Explainability Deficit</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">REMEDIATED</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  <strong>Vulnerability:</strong> Raw numerical risk scores lack transparent mathematical breakdowns and line-item document citations.<br />
                  <strong>Luxera Remediation:</strong> Every triggered rule is mapped to an Explainability Summary Component highlighting exact document citations, deposit-to-salary ratio comparisons, and regulatory audit text for BNM inspection.
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
