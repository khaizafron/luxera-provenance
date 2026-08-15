# Technical Conflicts & Remediation Strategies: N8N Engine vs Enterprise App
## Analysis of Architectural Discrepancies and Mitigation Framework

---

## 1. Overview

While the provided **n8n Source of Wealth (SoW) Compliance Agent** workflow provides functional OCR extraction and financial logic, directly running it in an enterprise multi-tenant environment introduces critical architectural conflicts, security vulnerabilities, and operational limitations. 

This document details all identified conflicts between the n8n engine and the production requirements of **Luxera Provenance**, along with the mandatory engineering remediations implemented in the core platform.

---

## 2. Comprehensive Conflict Matrix

| Conflict Category | Standalone n8n Engine Behavior | Luxera Enterprise Platform Requirement | Impact Severity | Remediation Architecture |
| :--- | :--- | :--- | :--- | :--- |
| **1. Multi-Tenancy & Isolation** | Global workflow execution without tenant routing. No `organization_id` awareness. | Strict multi-tenant isolation. All state, documents, AI prompts, and audit records scoped to `organization_id`. | **CRITICAL** | Inject tenant context (`org_id`, `user_id`) in API proxy before dispatching to workflow. Enforce DB Row Level Security (RLS). |
| **2. PII Protection & Data Privacy** | Sends full unencrypted document text and raw customer PII directly to external LLM APIs. | Compliance with PDPA Act 709 & GDPR. Sensitive PII must be encrypted at rest & redacted before AI processing. | **CRITICAL** | Client-side/API-layer PII Redaction Filter (NER for NRIC, Tax ID, Address) prior to LLM dispatch. Encrypted storage of raw docs. |
| **3. Non-Deterministic AI Output** | Relies on LLM JSON generation without guaranteed runtime validation schema. | Strict type-safe deterministic execution contract required for financial regulatory auditing. | **HIGH** | Zod runtime schema validation on n8n webhook response. Fallback parser and automatic schema compliance retry loop. |
| **4. Persistence & Audit Logging** | Transitory in-memory execution. Execution logs expire or remain stored in n8n internal SQLite/PG. | Immutable, tamper-evident audit trail with cryptographic hash chaining for regulatory inspection. | **HIGH** | Ingress event stream to PostgreSQL `sow_evaluations` & `audit_logs` with SHA-256 payload chaining on every decision state. |
| **5. Authentication & Secret Mgt** | Hardcoded API tokens or basic webhook auth headers inside n8n credential store. | Enterprise OAuth2, HMAC payload signatures, ephemeral signed URLs, KMS-backed secrets. | **HIGH** | Signed HMAC-SHA256 headers for all Webhook triggers. Webhook secrets rotated via Cloud KMS / Secret Manager. |
| **6. Timeout & Rate Limit Handling** | Synchronous execution waiting for OpenAI API. Prone to HTTP 504 gateway timeouts on large multi-page PDFs. | Asynchronous job queues with background polling / Webhook callbacks and UI progress updates. | **MEDIUM** | Async execution pipeline: UI triggers request $\rightarrow$ Queue Job $\rightarrow$ n8n processes async $\rightarrow$ Webhook posts results back. |
| **7. Human-in-the-Loop (HITL)** | Automatic categorization without native compliance officer override / feedback loop. | Regulatory mandates require Human-in-the-Loop review for flagged or borderline cases (`MANUAL_REVIEW_REQUIRED`). | **HIGH** | Luxera Compliance Officer Queue UI with explicit override actions (`APPROVE_OVERRIDE`, `REJECT_OVERRIDE`) and mandatory audit reason logging. |

---

## 3. Detailed Conflict Deep-Dives & Remediation Plans

### Conflict 1: Tenant Boundary Leakage in Webhook Triggers
- **Problem:** The n8n webhook node listens on a single endpoint URL (e.g. `/webhook/sow-evaluate`). If multiple organizations trigger this endpoint, data streams mix within the n8n execution buffer.
- **Remediation Plan:** 
  1. Luxera's Next.js API Gateway intercepts incoming client requests.
  2. The Gateway validates user session, RBAC (`compliance_officer` or `tenant_admin`), and retrieves `organization_id`.
  3. The Gateway attaches a signed JWT payload containing `org_id`, `case_id`, and `tenant_key` in the request header `X-Luxera-Tenant-Context`.
  4. All records generated during execution are stored in tenant-isolated database tables enforced by Postgres RLS.

### Conflict 2: PII Transmission to Third-Party AI APIs
- **Problem:** The n8n LLM node passes full PDF text directly to OpenAI (`api.openai.com`), violating PDPA regulations on personal data transfer without explicit consent/redaction.
- **Remediation Plan:**
  1. A pre-processing Node (`PII Redaction Service`) utilizes Named Entity Recognition (NER) to detect names, NRIC/passport numbers, home addresses, and account numbers.
  2. PII is tokenized (e.g. `JOHN DOE` $\rightarrow$ `[NAME_1]`, `880101-14-5533` $\rightarrow$ `[NRIC_1]`).
  3. Redacted text is submitted to the LLM for SoW structure extraction.
  4. Post-extraction, tokenized entities are restored only within the tenant's isolated database environment.

### Conflict 3: Absence of Cryptographic Audit Hash Chaining
- **Problem:** n8n execution history does not provide cryptographic proof of non-tampering. A database admin could alter evaluation results post-facto.
- **Remediation Plan:**
  1. Luxera implements an audit ledger (`provenance_audit_chain`).
  2. Each evaluation record includes:
     $$\text{Current Hash} = \text{SHA256}(\text{Prev Hash} + \text{Tenant ID} + \text{Case ID} + \text{Decision} + \text{Timestamp})$$
  3. Any retroactive modification breaks the hash chain, immediately alerting compliance auditors.

### Conflict 4: Error Handling & Graceful Degradation
- **Problem:** If OpenAI returns a rate-limit error (HTTP 429) or malformed JSON, the raw n8n workflow aborts execution, leaving the case stuck in an unhandled pending state.
- **Remediation Plan:**
  1. n8n workflow incorporates explicit Error Trigger nodes (`n8n-nodes-base.errorTrigger`).
  2. Errors transmit a failure event back to Luxera API (`/api/v1/sow/webhook/error`).
  3. Luxera sets the case status to `PROCESSING_FAILED`, notifies the operator, and provides a "Retry Processing with Secondary Model" option in the UI.
