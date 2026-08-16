# Legal & Regulatory Applicability Assessment
## Enterprise Context, Data Controller/Processor Roles, and Risk Profiling

---

## 1. Executive Context

**Luxera Provenance** is deployed as an enterprise multi-tenant software-as-a-service (SaaS) and private cloud platform. Financial institutions (Reporting Entities under AMLA, such as banks, wealth management platforms, and digital finance operators) subscribe to Luxera Provenance to automate and govern their customer **Source of Wealth (SoW)** verification workflows.

---

## 2. Classification of Legal Roles

### Data Controller vs Data Processor

- **Subscribing Financial Institution (Client / Tenant):** Acts as the **Data Controller** under PDPA Act 709. The institution determines the purpose of processing, maintains the direct relationship with the customer (data subject), and collects consent.
- **Luxera Provenance Platform:** Acts as the **Data Processor** (Data User Agent). Luxera processes personal data and financial evidence exclusively on behalf of and according to the instructions of the tenant.

```
┌────────────────────────────────┐
│  End Customer (Data Subject)   │
└──────────────┬─────────────────┘
               │ Consents & Uploads Evidence
               ▼
┌────────────────────────────────┐
│ Financial Institution (Bank)   │  <-- DATA CONTROLLER
│ (Luxera Tenant / Client)       │
└──────────────┬─────────────────┘
               │ Dispatches Payload via Authenticated API
               ▼
┌────────────────────────────────┐
│  Luxera Provenance Platform    │  <-- DATA PROCESSOR
│  (DB, RLS, n8n Engine, AI)     │
└────────────────────────────────┘
```

---

## 3. High-Risk Processing & DPIA Trigger Evaluation

Under Section 3.2 of the **PDPA Data Protection Impact Assessment (DPIA) Guideline**, a formal DPIA is mandatory if processing activities meet any of the following criteria:

1. **Evaluation or Scoring:** Building behavioral, financial, or credit profiles of individuals $\rightarrow$ **TRIGGERED** (SoW Risk Scoring Engine evaluates salary vs deposit ratios and assigns a 0-100 risk score).
2. **Automated Decision Making with Legal Effect:** Using automated algorithms to grant or deny access to financial services $\rightarrow$ **TRIGGERED** (Mitigated by requiring Human-in-the-Loop review for `MANUAL_REVIEW_REQUIRED` and `REJECTED` flags).
3. **Processing of Sensitive Personal Data:** Handling bank statements, payslips, tax numbers, and passport/NRIC images $\rightarrow$ **TRIGGERED** (Enforces PII redaction prior to third-party LLM invocation).

---

## 4. Legal Basis for Processing Under AMLA & PDPA

The legal basis for processing financial evidence in Luxera Provenance rests on two statutory pillars:

1. **Statutory Obligation (AMLA 2001 Sec 13 / BNM Policy Document):** Reporting institutions are legally mandated to perform Customer Due Diligence (CDD) and establish Source of Wealth. Under PDPA Section 6(2)(b), processing necessary for compliance with a legal obligation is lawful even without consent (though Luxera enforces explicit consent as a best practice).
2. **Data Subject Explicit Consent (PDPA Sec 6(1)):** Captured during onboarding prior to document upload via Luxera's consent ledger.
