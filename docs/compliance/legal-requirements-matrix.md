# Legal & Regulatory Requirements Matrix
## Detailed Mapping of Compliance Rules to System Specifications

---

## 1. Matrix Overview

This matrix breaks down statutory requirements from PDPA Act 709, BNM AML/CFT Policy Documents, and DPIA Guidelines into discrete, measurable technical requirements for the **Luxera Provenance** application.

Status Key:
- `CONTROL_IMPLEMENTED`: Fully supported in system architecture and code.
- `REQUIRES_LEGAL_REVIEW`: Requires organization-specific legal team configuration or policy approval.
- `IMPLEMENTATION_GAP`: Technical requirement identified; requires dedicated feature build (documented in Gap Analysis).

---

## 2. Requirements Matrix

| Requirement ID | Legal Source | Legal Requirement Description | Technical System Requirement | Target Luxera Module | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-PDPA-01` | PDPA Sec 6 | Explicit user consent for processing financial records & PII. | Capture digital consent receipt with timestamp, IP, and policy version before file upload. | `Auth & Onboarding Module` | `CONTROL_IMPLEMENTED` |
| `REQ-PDPA-02` | PDPA Sec 9 | Encryption of PII at rest and in transit. | TLS 1.3 in transit; AES-256 field-level envelope encryption for sensitive payload fields (NRIC, income). | `Security & Key Mgt Engine` | `CONTROL_IMPLEMENTED` |
| `REQ-PDPA-03` | PDPA Sec 10 | Data retention enforcement & automated purging. | Automated data lifecycle manager; hard deletion of temporary OCR files post-evaluation. | `Storage & Archival Engine` | `CONTROL_IMPLEMENTED` |
| `REQ-PDPA-04` | PDPA Sec 12 | Right to Data Access & Rectification (DSAR). | Compliance dashboard feature to export customer data dossier or edit incorrect income fields. | `Compliance Officer UI` | `CONTROL_IMPLEMENTED` |
| `REQ-AMLA-01` | AMLA Sec 13 | Verification of Source of Wealth (SoW) for high-risk accounts. | Automated financial rule comparison (Salary vs Deposits ratio, third-party funding checks). | `n8n SoW Engine & AI Agent` | `CONTROL_IMPLEMENTED` |
| `REQ-AMLA-02` | AMLA Sec 17 | Retention of CDD & SoW verification records for minimum 7 years. | Long-term cold archive store with immutability guarantees (`Object Lock` / Write-Once-Read-Many). | `Audit Ledger & Storage` | `CONTROL_IMPLEMENTED` |
| `REQ-AMLA-03` | BNM AML-PD | Audit trailing of all compliance officer decisions and overrides. | Cryptographically signed audit log (`provenance_audit_chain`) detailing officer ID, reason, and timestamp. | `Provenance Audit Engine` | `CONTROL_IMPLEMENTED` |
| `REQ-DPIA-01` | DPIA Guide | Systematic assessment of privacy risks in AI processing. | Pre-processing PII redaction layer before sending document text to external LLM providers. | `PII Redaction Service` | `CONTROL_IMPLEMENTED` |
| `REQ-AIGOV-01` | AI Gov Guide | Transparent explainability for automated decision outputs. | Every evaluation provides breakdown of risk score, rule failures, and exact supporting document citations. | `Decision & Explanation UI` | `CONTROL_IMPLEMENTED` |
| `REQ-AIGOV-02` | AI Gov Guide | Human-in-the-Loop oversight for automated financial decisions. | Machine decisions categorized as recommendations; final binding rejection/approval requires officer signoff. | `Case Review Queue` | `CONTROL_IMPLEMENTED` |
