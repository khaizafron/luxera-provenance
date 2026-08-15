'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Terminal, GitBranch, Server, Code, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-slate-100 font-normal">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-normal">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Apache 2.0 Open Source & Architecture Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-white">Open Source & Deployment Specifications</h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed font-normal">
            Luxera Provenance is fully self-hostable with Docker, Docker Compose, or native Next.js deployment. View source code on GitHub, inspect the integrated native compliance structures, and run your own self-contained pipelines.
          </p>
          <div className="mt-4">
            <a
              href="https://github.com/khaizafron/luxera-provenance.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-orange-400 hover:text-orange-300 bg-orange-950/40 border border-orange-500/30 px-3.5 py-2 rounded-xl transition"
            >
              <GitBranch className="w-4 h-4" />
              Repository: https://github.com/khaizafron/luxera-provenance.git
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        <div className="space-y-12">
          {/* Quick Start Terminal */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#14151a] border border-slate-800/80">
            <h2 className="text-xl font-normal text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Quick Self-Hosting Docker Commands
            </h2>
            <div className="p-6 rounded-2xl bg-[#0c0d10] border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <div className="text-slate-500 mb-2"># Clone repository from GitHub</div>
              <div className="text-emerald-400">git clone https://github.com/khaizafron/luxera-provenance.git</div>
              <div className="text-emerald-400">cd luxera-provenance</div>
              <div className="text-slate-500 my-2"># Copy environment variables template</div>
              <div className="text-emerald-400">cp .env.example .env</div>
              <div className="text-slate-500 my-2"># Spin up isolated container stack</div>
              <div className="text-emerald-400">docker-compose up -d</div>
              <div className="text-slate-500 mt-2"># Application running at http://localhost:3000</div>
            </div>
          </section>

          {/* Deployment Modes */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Supported Deployment Architectures
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <Server className="w-6 h-6 text-blue-400 mb-2" />
                <h3 className="font-normal text-white text-base">Standalone Mode</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Zero-dependency mode with local persistent store and server-side Gemini AI engine using a single <code className="text-orange-300 font-mono">GEMINI_API_KEY</code> environment variable.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <GitBranch className="w-6 h-6 text-purple-400 mb-2" />
                <h3 className="font-normal text-white text-base">Embedded Node Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  The original source-of-wealth workflow specification was converted into native Node.js application code and runs deterministically with no external dependencies.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <Code className="w-6 h-6 text-emerald-400 mb-2" />
                <h3 className="font-normal text-white text-base">Enterprise Cloud Mode</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Scales to Google Cloud Run, PostgreSQL / Supabase with Row Level Security, KMS envelope encryption, and S3 / GCS object storage.
                </p>
              </div>
            </div>
          </section>

          {/* Native Integration Schema Contract */}
          <section className="p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 space-y-6">
            <h2 className="text-xl font-normal text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-orange-400" />
              Source Specification & Native Integration Contracts
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Below are the exact TypeScript interfaces and JSON structures for the native SoW compliance engine and its integrated execution contracts within Luxera Provenance:
            </p>

            <div className="space-y-6">
              {/* Inbound Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Inbound Evaluation Payload (<code className="text-orange-400">Native Ingestion</code>)</h3>
                  <span className="text-xs font-mono text-orange-400">Gateway → Native Engine</span>
                </div>
                <pre className="p-5 rounded-2xl bg-[#0c0d10] border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`export interface SoWEvaluationRequestPayload {
  case_id: string; // Unique execution tracking identifier
  organization_id: string; // Tenant isolation key
  submitted_by_user_id: string;

  declared_wealth: {
    primary_source_category: 'EMPLOYMENT' | 'BUSINESS_OWNERSHIP' | 'INVESTMENTS' | 'INHERITANCE' | 'REAL_ESTATE_SALE' | 'OTHER';
    declared_annual_income: number;
    currency: string; // ISO 4217, e.g. "MYR", "USD"
    employer_or_business_name: string;
  };

  supporting_documents: Array<{
    document_id: string;
    document_type: 'PAYSLIP' | 'BANK_STATEMENT' | 'TAX_DECLARATION' | 'AUDITED_FINANCIALS' | 'LEGAL_DEED';
    file_url: string; // Secure short-lived presigned URL
    document_hash_sha256: string;
  }>;

  options: {
    enable_pii_redaction: boolean;
    confidence_threshold: number; // e.g. 0.85
    strict_financial_rules: boolean;
  };
}`}
                </pre>
              </div>

              {/* Outbound Callback Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white">Outbound Evaluation Response (<code className="text-emerald-400">Native Callback</code>)</h3>
                  <span className="text-xs font-mono text-emerald-400">Native Engine → Gateway</span>
                </div>
                <pre className="p-5 rounded-2xl bg-[#0c0d10] border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`export interface SoWEvaluationResponsePayload {
  case_id: string;
  organization_id: string;
  workflow_execution_id: string;
  processed_at: string; // ISO 8601 UTC

  overall_decision: 'APPROVED' | 'MANUAL_REVIEW_REQUIRED' | 'REJECTED';
  composite_risk_score: number; // 0 to 100
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  extracted_financial_profile: {
    verified_monthly_income: number | null;
    verified_annual_income: number | null;
    detected_employer_name: string | null;
    total_bank_deposits_detected: number | null;
    deposit_evaluation_period_months: number | null;
    currency_code: string;
    extraction_confidence_score: number;
  };

  rule_evaluation_results: Array<{
    rule_id: string; // e.g. "RULE_SALARY_VS_DEPOSIT_RATIO"
    rule_name: string;
    passed: boolean;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    observed_value: string | number;
    expected_threshold: string | number;
    failure_message?: string;
  }>;

  provenance_metadata: {
    n8n_version: string;
    llm_model_used: string; // e.g. "gemini-2.5-flash"
    tokens_consumed: number;
    execution_time_ms: number;
    payload_sha256: string;
  };
}`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
