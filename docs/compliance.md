# Luxera Provenance — Compliance & Privacy Framework

This document outlines how **Luxera Provenance** aligns with regulatory compliance frameworks, specifically **Malaysia Personal Data Protection Act 2010 (PDPA Act 709)** and Anti-Money Laundering principles under **AMLA 2001 (Act 613)**.

---

## 1. Statutory PDPA Act 709 Alignment

| PDPA Section | Requirement | Technical Implementation in Luxera Provenance |
| :--- | :--- | :--- |
| **Section 6 (General Principle)** | Processing requires explicit data subject consent | Recorded via `ConsentRecord` schema tracking purpose, policy version, IP address, user-agent, and timestamp |
| **Section 9 (Security Principle)** | Practical security measures to protect data from disclosure | Pre-LLM PII Sanitization masks NRIC, account numbers, email, and phone numbers before AI evaluation |
| **Section 10 (Retention Principle)** | Data must not be kept longer than necessary | Data minimization controls and clear evidence lifecycle management |
| **Section 12 (Data Subject Access)** | Data subjects have right to access personal data | Automated DSAR API endpoint (`GET /api/compliance/dsar?case_id=...`) providing downloadable compliance dossiers |

---

## 2. AML/CFT Source of Wealth (SoW) Principles

- **Primary Evidence Reliance**: Verifies declared annual salary against bank statements, payslips, tax filings, or real estate deeds.
- **Deposit-to-Salary Ratio Rules**: Automated trigger when 12-month deposit volume exceeds declared income by $> 25\%$.
- **Human-in-the-Loop Oversight**: AI synthesizes data; qualified human compliance officers make all binding approval or rejection determinations.

---

## 3. Statutory Disclaimer

*Luxera Provenance is open-source software infrastructure designed to assist financial compliance operations. Deploying Luxera Provenance does not automatically grant statutory legal compliance certification. Operating institutions remain responsible for complete operational compliance.*
