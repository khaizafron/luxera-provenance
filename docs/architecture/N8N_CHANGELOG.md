# N8N Workflow Changelog & Modifications
## Historical Source of Wealth (SoW) Compliance Agent

---

## Modification Summary: Version 1.1.0

### Objective
Enable safe external API execution from the **Luxera Provenance Application Gateway** while strictly preserving all downstream deterministic rule checks, financial calculations, and AI prompts.

### Changes Made
1. **Added Webhook Trigger Node (`Webhook Trigger`):**
   - Node Type: `n8n-nodes-base.webhook`
   - Path: `sow-evaluate`
   - Method: `POST`
   - Authentication: Ingests signed bearer tokens and tenant context headers (`X-Luxera-Tenant-Context`).
   - Connected directly to `Parse & Normalize Inbound Case`.

2. **Decoupled Hardcoded Development Values:**
   - Replaced static string fields (`user_id = 'test_user'`, `declared_sow = 50000`, static sheet IDs) with dynamic properties extracted from the inbound request body:
     - `case_id`
     - `organization_id`
     - `submitted_by_user_id`
     - `declared_wealth` (category, annual income, currency, employer name)
     - `supporting_documents`
     - `options` (PII redaction flags, confidence thresholds)

3. **Added PII Masking Filter Node (`PII Redaction Filter`):**
   - Node Type: `n8n-nodes-base.code`
   - Executes Regex-based masking for NRIC/Passport numbers and Bank Account numbers before passing raw text to external OpenAI models, satisfying PDPA Act 709 Section 9.

4. **Added Webhook Response Node (`Respond to Webhook`):**
   - Node Type: `n8n-nodes-base.respondToWebhook`
   - Returns structured JSON adhering to `SoWEvaluationResponsePayload` schema contract.

5. **Preserved Baseline Processing Nodes:**
   - `Start SoW Check` (Manual Trigger preserved for developer debugging in n8n UI)
   - `OpenAI SoW Extraction Agent`
   - `Financial Consistency Evaluator`
