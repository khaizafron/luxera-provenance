# Luxera Provenance — Security Architecture & Controls

This document details the security model, cryptographic guarantees, API key handling, and data integrity mechanisms implemented in **Luxera Provenance**.

---

## 1. Core Security Guarantees

1. **Zero Client Exposure of API Keys**:
   - The `GEMINI_API_KEY` and `N8N_API_KEY` are maintained exclusively in server-side environment variables (`process.env`).
   - They are never prefixed with `NEXT_PUBLIC_` and are never bundled into client-side JavaScript.

2. **Pre-LLM PII Tokenization**:
   - Customer Personally Identifiable Information (PII) is masked locally before any external API transmission.
   - Regex patterns match:
     - Malaysian NRIC: `YYMMDD-PB-###G`
     - Account/Card Numbers: 10–16 digit numerical sequences
     - Email Addresses: Standard RFC 5322 regex
     - Phone Numbers: Malaysian local formats (`+601x`, `01x-xxx-xxxx`)

3. **Tamper-Evident SHA-256 Audit Ledger**:
   - All critical actions (case creation, document upload, evaluation run, officer override) are recorded in an append-only hash chain.
   - Any retroactive modification to payload data alters the computed `payload_hash` and invalidates all subsequent `previous_block_hash` links.

4. **Input Validation & Binary File Security**:
   - Server-side MIME-type verification restricts uploads to PDF documents (`application/pdf`) and approved image formats (`image/png`, `image/jpeg`).
   - Maximum file size per document is strictly enforced (10MB).
   - Binary SHA-256 hash generation at ingestion ensures file content integrity.

---

## 2. Responsible Disclosure

If you identify a security vulnerability, data leakage issue, or cryptographic weakness within Luxera Provenance, please report it immediately to:

📧 **Security Contact**: [contact@luxera.world](mailto:contact@luxera.world)

Please do **not** disclose vulnerabilities in public GitHub issues prior to coordinated resolution.
