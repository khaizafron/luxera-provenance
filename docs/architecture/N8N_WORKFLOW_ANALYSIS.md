# N8N Workflow Architecture & Deep Analysis
## Source Engine: Wahed - Source of Wealth (SoW) Compliance Agent

---

## 1. Executive Summary

The **Wahed Source of Wealth (SoW) Compliance Agent** is an automated n8n workflow designed to process customer financial documents (e.g., salary slips, bank statements, tax filings, asset declarations), extract structured income and source data using Large Language Models (OpenAI GPT-4/GPT-3.5), and evaluate the extracted data against deterministic compliance rules to determine SoW verification status.

The workflow acts as an automated first-line compliance screener for Islamic wealth management and fintech onboarding, validating whether a customer's declared wealth is legitimate, financially consistent with their supporting documentation, and compliant with Anti-Money Laundering (AML) / Source of Wealth requirements.

---

## 2. Comprehensive Workflow Node Inventory & Topology

The n8n workflow consists of the following key functional stages and nodes:

```
[Webhook Trigger / Manual Trigger]
              │
              ▼
    [Document Receiver & Preprocessing]
              │
              ▼
   [AI OCR & Structured Extraction (OpenAI)]
              │
              ▼
  [Data Parsing & Normalization Node (JS)]
              │
              ▼
  [Deterministic Financial Consistency Engine (JS)]
              ├───────────────────────────────────────┐
              ▼                                       ▼
  [Compliance Rule Evaluation]               [Anomaly Detector]
              │                                       │
              └───────────────────┬───────────────────┘
                                  ▼
                     [Risk Scoring & Decision Engine]
                                  │
                                  ▼
                   [Output Payload Formatter]
                                  │
                                  ▼
                  [Webhook Callback / API Response]
```

### Detailed Node Specifications

| Node ID / Name | Node Type | Category | Primary Function | Input Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `Webhook Trigger` | `n8n-nodes-base.webhook` | Trigger | Receives inbound HTTP POST payloads containing document URLs, customer metadata, and declared income. | External API call |
| `Extract Document Text` | `n8n-nodes-base.httpRequest` / AI | OCR / Ingestion | Downloads and extracts raw text content from uploaded financial PDF/Image assets. | `Webhook Trigger` payload |
| `OpenAI SoW Extraction Agent` | `@n8n/n8n-nodes-langchain.chainLLM` | AI / Extraction | Uses OpenAI structured JSON output prompts to extract `monthly_salary`, `annual_salary`, `employer_name`, `total_bank_deposits`, `deposit_frequency`, `income_sources`, and `document_issue_dates`. | Document raw text |
| `Parse & Validate AI Extraction` | `n8n-nodes-base.code` | Logic / Sanitization | Validates JSON structure returned by LLM, ensures non-null numeric fields, converts currency representations to standardized numeric values. | `OpenAI Extraction Agent` |
| `Financial Consistency Evaluator` | `n8n-nodes-base.code` | Deterministic Rules | Calculates the ratio between `annual_salary` (or verified annual income) and `total_bank_deposits`. Evaluates whether bank deposits exceed declared salary by alarming thresholds (e.g., > 150%). | `Parse & Validate` |
| `Date Cross-Validation Check` | `n8n-nodes-base.code` | Deterministic Rules | Verifies document freshness (e.g. pay slips < 90 days old, bank statements covering minimum 3 consecutive months). | `Parse & Validate` |
| `Risk Scoring Engine` | `n8n-nodes-base.code` | Risk Scoring | Computes composite risk score (0 - 100) based on weighted risk factors (salary discrepancy, unverified sources, missing documentation, document age). | Rule Evaluation Nodes |
| `Decision Router` | `n8n-nodes-base.if` / `switch` | Routing | Categorizes case into: `APPROVED` (Low Risk < 25), `MANUAL_REVIEW_REQUIRED` (Medium Risk 25-60), or `REJECTED` (High Risk > 60). | `Risk Scoring Engine` |
| `Output Contract Formatter` | `n8n-nodes-base.code` | Serialization | Formats final JSON payload matching Luxera Provenance internal SoW audit schema. | `Decision Router` |

---

## 3. Financial Consistency Logic & Rule Specifications

The core engine relies on deterministic Javascript execution nodes to enforce non-negotiable financial thresholds. AI cannot override these rules.

### Rule 1: Salary vs Deposit Ratio
$$\text{Discrepancy Ratio} = \frac{\text{Total Bank Deposits (12 Months)}}{\text{Declared Annual Net Salary}}$$

- **Condition A (Consistent):** Ratio $\le 1.25$ $\rightarrow$ Pass.
- **Condition B (Elevated Risk):** $1.25 < \text{Ratio} \le 2.00$ $\rightarrow$ Trigger Flag `UNEXPLAINED_DEPOSIT_VARIANCE` (Score +25).
- **Condition C (High Risk / Anomaly):** Ratio $> 2.00$ $\rightarrow$ Trigger Flag `CRITICAL_INCOME_DEPOSIT_MISMATCH` (Score +50, force `MANUAL_REVIEW_REQUIRED`).

### Rule 2: Unverified Wealth Source Identification
If the bank statement exhibits large recurring deposits ($\ge \$10,000$ or equivalent local currency) that do not originate from the named employer or documented secondary wealth sources (e.g., dividends, asset sales):
- Flag: `UNVERIFIED_THIRD_PARTY_DEPOSITS`
- Penalty: +35 Risk Points
- Requirement: Mandatory proof of secondary source document upload.

### Rule 3: Document Freshness & Continuity
- **Pay Slip Stale Threshold:** > 90 days from evaluation date $\rightarrow$ Flag `STALE_INCOME_DOCUMENT`.
- **Bank Statement Gap Check:** Missing consecutive monthly statements within the declared 3-6 month window $\rightarrow$ Flag `INCOMPLETE_STATEMENT_PERIOD`.

---

## 4. AI Prompting Strategy & Extraction Constraints

The OpenAI extraction node uses strict zero-shot / few-shot structured output schemas (`response_format: { type: "json_object" }`) with the following systemic directives:

1. **Extraction Guardrails:** Do NOT infer missing numerical values. If a number is absent or unreadable, return `null` or `0.00` and append a flag in `unextracted_fields`.
2. **Entity Disambiguation:** Differentiate between *Gross Income* and *Net Income*. Always extract both if available, defaulting to *Net Income* for bank deposit reconciliations.
3. **Multi-Currency Handling:** Extract raw currency code (e.g., `MYR`, `USD`, `SAR`, `AED`). The code node downstream converts all amounts to base currency using standardized FX rate tables.

---

## 5. Security, Traceability, and Provenance

- **Data Lineage:** Every extracted field contains a metadata reference to the source document ID, page number, and bounding box coordinates (where available from OCR).
- **Execution Hash:** The n8n engine generates a unique `execution_id` and payload `hash` for each run, enabling immutable recordkeeping when ingested into the Luxera Provenance audit store.
