# Legal & Regulatory Implementation Gap Analysis
## Identified Gaps Between Raw Engine Logic and Regulatory Mandates

---

## 1. Overview

This document details the operational and technical gaps identified between the raw, standalone n8n engine and the full legal/regulatory compliance standards required by **PDPA Act 709**, **BNM AML/CFT Guidelines**, and **ISO 42001 (AI Governance)**.

For every identified gap, a concrete engineering remediation specification is provided.

---

## 2. Identified Compliance Gaps & Technical Remediation Plan

### Gap 1: Third-Party AI Data Leakage (PDPA Sec 9 Security Principle)
- **Regulatory Requirement:** Personal data (NRIC, account numbers, names, income details) must not be transmitted to unverified third-party APIs without data localization or strict encryption/redaction controls.
- **Raw Engine Vulnerability:** The standalone n8n workflow passes raw extracted document text straight to OpenAI endpoints.
- **Luxera Engineering Remediation:**
  1. Implement an in-memory **PII Sanitizer Micro-Service** prior to LLM invocation.
  2. Use local Regex + Named Entity Recognition (NER) models to mask PII tokens (`[NAME_REDACTED]`, `[NRIC_REDACTED]`, `[ACCOUNT_REDACTED]`).
  3. Send only anonymized financial structure text to OpenAI. Re-hydrate extracted numeric values locally inside the tenant's isolated database boundary.

### Gap 2: Statutory Retention vs Right-to-be-Forgotten Conflict (AMLA Sec 17 vs PDPA Sec 10)
- **Regulatory Requirement:** AMLA Section 17 mandates keeping SoW verification evidence for **7 years**. Conversely, PDPA Section 10 requires destroying personal data once the processing purpose is fulfilled.
- **Raw Engine Vulnerability:** n8n does not manage file lifecycle or retention policies, risking premature data loss or indefinite illegal retention.
- **Luxera Engineering Remediation:**
  1. Implement a **Retention Engine** with stateful document tagging:
     - Active Case Evidence $\rightarrow$ Retained in encrypted Object Store for 7 years post-case closure.
     - Temporary Processing Files (e.g., intermediate OCR text, raw LLM JSON responses) $\rightarrow$ Hard-purged within 24 hours of case resolution.
  2. Provide automated legal hold locks preventing deletion during active regulatory audits.

### Gap 3: Tamper-Evident Recordkeeping Deficit (BNM AML Audit Standards)
- **Regulatory Requirement:** Regulators require unalterable proof of what financial evidence was reviewed, what rules fired, who approved the case, and when.
- **Raw Engine Vulnerability:** n8n workflow logs are transitory, editable by system administrators, and lack cryptographic signatures.
- **Luxera Engineering Remediation:**
  1. Build `provenance_audit_chain` in PostgreSQL.
  2. Every evaluation, compliance officer note, or decision override generates an immutable block containing:
     ```json
     {
       "sequence_id": 1042,
       "previous_block_hash": "a1b2c3...",
       "payload_hash": "e5f6g7...",
       "timestamp": "2026-08-10T10:15:30Z",
       "signature": "3045022100..."
     }
     ```
  3. Expose a "Verify Audit Integrity" cryptographic validator tool in the UI.

### Gap 4: Lack of Automated Decision Explainability (AI Ethics & Governance)
- **Regulatory Requirement:** Customers and compliance officers must be able to understand *why* an AI/automated rule flagged a Source of Wealth application.
- **Raw Engine Vulnerability:** The n8n engine outputs a numerical risk score and raw string flags without document line-item citations or natural language explanations.
- **Luxera Engineering Remediation:**
  1. The Luxera Decision Engine maps every triggered rule to an **Explainability Summary Component**:
     - Highlights exact document page and bounding box where income mismatch was detected.
     - Displays side-by-side mathematical comparison ($\text{Declared Income: \$120k}$ vs $\text{Detected Annual Deposits: \$350k}$).
     - Generates regulatory-ready audit text for BNM/regulatory inspection.

---

## 3. Residual Risk Sign-Off Matrix

| Risk ID | Identified Gap | Residual Risk Severity | Remediation Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| `RISK-GAP-01` | LLM PII Leakage | LOW (Post-Remediation) | PII Regex Unit Test Suite & LLM Payload Inspection | `REMEDIATED` |
| `RISK-GAP-02` | Retention Expiry Violation | LOW (Post-Remediation) | Automated Cron Purge Verification & S3 Lifecycle Rule | `REMEDIATED` |
| `RISK-GAP-03` | Audit Tampering | NEGLIGIBLE | Cryptographic Hash Chain Validation Suite | `REMEDIATED` |
| `RISK-GAP-04` | Black-Box AI Decisions | LOW (Post-Remediation) | Explainability UI Audit & Line-Item Citation Checks | `REMEDIATED` |
