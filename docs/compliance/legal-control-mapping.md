# Legal Control Mapping
## Direct Verification & Control Traceability Matrix

---

## 1. Matrix Structure & Intent

This document maps every legal and regulatory obligation directly to its implementing code module, database constraint, API security control, and verification mechanism within the **Luxera Provenance** software platform.

---

## 2. Technical Control Mapping Table

| Legal Source | Statutory Clause | Control ID | Control Name | Implementing Luxera Module | Technical Verification Mechanism | Operational Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PDPA 2010** | Sec 6 (Consent) | `CTL-PDPA-01` | Onboarding Digital Consent Ledger | `app/api/consent/route.ts` & `consent_logs` table | Database insert verification with user IP, user agent, timestamp, & notice hash. | `CONTROL_IMPLEMENTED` |
| **PDPA 2010** | Sec 8 (Disclosure) | `CTL-PDPA-02` | Multi-Tenant Data Isolation | PostgreSQL Row Level Security (RLS) on `organization_id` | Database RLS policy unit tests preventing cross-tenant SQL queries. | `CONTROL_IMPLEMENTED` |
| **PDPA 2010** | Sec 9 (Security) | `CTL-PDPA-03` | In-Transit & At-Rest Field Encryption | `lib/crypto/envelope.ts` (AES-256-GCM) | KMS key decryption validation & TLS 1.3 protocol scanner checks. | `CONTROL_IMPLEMENTED` |
| **PDPA 2010** | Sec 9 (Security) | `CTL-PDPA-04` | Pre-LLM PII Redaction Filter | `lib/compliance/pii-redactor.ts` | Unit tests asserting zero NRIC/Passport/Phone strings in outgoing LLM payloads. | `CONTROL_IMPLEMENTED` |
| **PDPA 2010** | Sec 10 (Retention) | `CTL-PDPA-05` | Automated Document Lifespan Manager | `lib/jobs/retention-purger.ts` | Scheduled job purging temporary OCR text files after evaluation completion. | `CONTROL_IMPLEMENTED` |
| **PDPA 2010** | Sec 12 (DSAR Access) | `CTL-PDPA-06` | Data Subject Export API | `app/api/compliance/dsar/route.ts` | Automated JSON/PDF export function bundling user profile & SoW records. | `CONTROL_IMPLEMENTED` |
| **AMLA 2001** | Sec 13 (CDD/SoW) | `CTL-AMLA-01` | Deterministic Financial Consistency Engine | `lib/compliance/sow-evaluator.ts` & n8n JS Node | Automated Jest unit tests evaluating salary vs bank deposit ratio thresholds. | `CONTROL_IMPLEMENTED` |
| **AMLA 2001** | Sec 17 (Recordkeeping)| `CTL-AMLA-02` | Immutable 7-Year Evidence Store | Encrypted Storage Engine + WORM Policy | Storage lock policy verification asserting non-deletion before 2555 days. | `CONTROL_IMPLEMENTED` |
| **BNM AML-PD**| Compliance Audits | `CTL-BNM-01` | Cryptographic Hash-Chained Audit Trail | `lib/audit/hash-chain.ts` & `provenance_audit_chain` | Cryptographic integrity validator script checking SHA-256 hash sequence. | `CONTROL_IMPLEMENTED` |
| **ISO 42001** | AI Explainability | `CTL-AIGOV-01` | Natural Language Decision Breakdown | `app/cases/[id]/components/DecisionExplanation.tsx` | Visual component inspection verifying rule failure citations & bounding box displays. | `CONTROL_IMPLEMENTED` |
| **ISO 42001** | Human Oversight | `CTL-AIGOV-02` | Compliance Officer HITL Signoff | `app/api/cases/[id]/override/route.ts` | API requirement enforcing compliance officer role & reason string before final decision. | `CONTROL_IMPLEMENTED` |

---

## 3. Continuous Audit & Compliance Verification

Compliance verification is automated as part of the Luxera Provenance CI/CD and runtime monitoring pipeline:

1. **Static Analysis & Schema Validation:** Linters and TypeScript compiler ensure typesafe implementation of all compliance contracts.
2. **Automated Compliance Test Suite:** Jest integration tests verify that PII redaction, financial logic, and hash chaining operate without regressions.
3. **Audit Ledger Verification Endpoint:** The system provides an administrator utility (`/api/v1/compliance/verify-audit-chain`) that re-computes and verifies the hash signature of every record in the ledger to detect any external database tampering.
