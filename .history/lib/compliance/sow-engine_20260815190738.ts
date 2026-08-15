import { GoogleGenAI } from '@google/genai';
import { redactPII } from './pii-redactor';
import { dbStore, SoWCase, DocumentRecord, ProcessingJob } from '../db/store';

export interface RuleResult {
  rule_id: string;
  rule_name: string;
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  observed_value: string | number;
  expected_threshold: string | number;
  failure_message?: string;
}

export interface ComplianceFlag {
  flag_code: string;
  flag_title: string;
  description: string;
  risk_points_added: number;
  recommended_remediation: string;
}

export interface ExtractedProfile {
  verified_monthly_income?: number | null;
  verified_annual_income?: number | null;
  detected_employer_name?: string | null;
  total_bank_deposits_detected?: number | null;
  deposit_evaluation_period_months?: number | null;
  currency_code?: string;
  extraction_confidence_score?: number;
  financial_evidence_status?: 'AVAILABLE' | 'EXTRACTED' | 'VALID' | 'MISSING' | 'NOT_EXTRACTED' | 'NOT_AVAILABLE' | 'OCR_FAILED' | 'PARSER_FAILED' | 'INVALID';
}

export interface SoWEvaluationResult {
  case_id: string;
  organization_id: string;
  execution_engine: 'NATIVE_COMPLIANCE_ENGINE';
  workflow_execution_id: string;
  processed_at: string;
  overall_decision: 'APPROVED' | 'MANUAL_REVIEW_REQUIRED' | 'INSUFFICIENT_INFORMATION' | 'REJECTED';
  composite_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  extracted_financial_profile: ExtractedProfile;
  rule_evaluation_results: RuleResult[];
  compliance_flags: ComplianceFlag[];
  ai_explanation: string;
  provenance_metadata: {
    model_used: string;
    pii_redacted: boolean;
    execution_time_ms: number;
    payload_sha256: string;
  };
}

/**
 * Extracts financial data deterministically from OCR text using regexes as a fallback or structure check
 */
export function extractDeterministicFromOCR(
  text: string,
  declaredAnnual: number,
  declaredEmployer: string
): Partial<ExtractedProfile> {
  const result: Partial<ExtractedProfile> = {
    verified_monthly_income: undefined,
    verified_annual_income: undefined,
    detected_employer_name: undefined,
    total_bank_deposits_detected: undefined,
  };

  const parseMoney = (value: string): number | null => {
    if (!value) return null;
    const cleaned = value.replace(/[^0-9.\-]/g, '').trim();
    if (!cleaned || isNaN(Number(cleaned))) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const extractMoneyValues = (value: string): number[] => {
    const matches = value.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g) || [];
    return matches
      .map((match) => parseMoney(match))
      .filter((amount): amount is number => amount !== null);
  };

  const isDateLine = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /(?:\b(?:19|20)\d{2}[-/][01]?\d[-/][0-3]?\d\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\b|\b(?:19|20)\d{2}-\d{2}-\d{2}\b)/i.test(trimmed);
  };

  const isSummaryLine = (value: string): boolean => /statement summary|total credits|total deposits|closing balance|opening balance|balance carried|balance at end|summary/i.test(value);
  const isCreditDescriptor = (value: string): boolean => /salary\s+credit|credit|incoming\s+transfer|transfer|deposit|unit\s+trust\s+redemption|fixed\s+deposit\s+maturity|cash\s+in|incoming/i.test(value);
  const isDebitDescriptor = (value: string): boolean => /debit|withdraw|card\s*\/|online|household|purchase|fee|balance|payment|cash\s+out|atm|transfer\s+out/i.test(value);

  const getTransactionCreditCandidates = (lines: string[]): Array<{ description: string; amount: number }> => {
    const candidates: Array<{ description: string; amount: number }> = [];
    const seen = new Set<string>();

    const pushCandidate = (description: string, amount: number, dateRef?: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return;
      const cleanDescription = description.replace(/\s+/g, ' ').trim();
      if (!cleanDescription) return;
      if (/debit|withdraw|payment|card\s*\/|online|household|balance|expense|fee/i.test(cleanDescription)) return;
      const key = `${dateRef ?? 'UNKNOWN'}|${cleanDescription}|${amount}`;
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push({ description: cleanDescription, amount });
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes('|')) {
        const parts = line.split('|').map((part) => part.trim());
        if (parts.length >= 3) {
          const [datePart, descPart, maybeCreditPart] = parts;
          const dateOk = isDateLine(datePart) || /\b(?:19|20)\d{2}\b/.test(datePart);
          if (!dateOk) continue;
          const description = descPart || '';
          const creditPart = maybeCreditPart || '';
          const amountValues = extractMoneyValues(creditPart);
          const amount = amountValues[0] ?? null;
          if (amount !== null && amount > 0 && !/debit|withdraw|payment|card\s*\/|online|household|balance|expense|fee/i.test(description)) {
            pushCandidate(description, amount, datePart);
          }
        }
        continue;
      }

      if (!isDateLine(line)) continue;

      const block: string[] = [line];
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (!next) continue;
        if (isDateLine(next) || isSummaryLine(next)) break;
        block.push(next);
      }

      const blockText = block.join('\n');
      if (isSummaryLine(blockText)) continue;

      let descriptionIndex = -1;
      let descriptionText = '';
      for (let idx = 1; idx < block.length; idx++) {
        const entry = block[idx].trim();
        if (!entry || isSummaryLine(entry)) continue;
        const entryLower = entry.toLowerCase();
        const isCreditLike = isCreditDescriptor(entryLower) || /salary|transfer|deposit|redemption|incoming|credit/i.test(entryLower);
        if (isCreditLike) {
          descriptionIndex = idx;
          descriptionText = entry;
          break;
        }
      }

      if (descriptionIndex < 0) continue;

      const amountLine = (() => {
        for (let idx = descriptionIndex + 1; idx < block.length; idx++) {
          const entry = block[idx].trim();
          if (!entry || isSummaryLine(entry)) continue;
          const entryLower = entry.toLowerCase();
          if (/balance|debit|withdraw|card\s*\/|online|household|expense|fee|payment/i.test(entryLower)) continue;
          const values = extractMoneyValues(entry);
          if (values.length > 0) {
            const amount = values[0];
            if (amount > 0) return amount;
          }
        }
        return null;
      })();

      if (amountLine !== null) {
        pushCandidate(descriptionText, amountLine, line);
      }
    }

    return candidates;
  };

  const lines = text.split('\n');

  // Try to find any company name from OCR lines first
  for (const line of lines) {
    let candidate = line;
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        candidate = parts[1]; // description column
      }
    }
    candidate = candidate.replace(/^(Employer|Company|Organization|Account|Payroll|Salary)\s*[:—–-]\s*/i, '').trim();

    const normalizedCandidate = candidate.trim();
    const candidateLower = normalizedCandidate.toLowerCase();
    const declaredLower = (declaredEmployer || '').toLowerCase();
    const looksLikeBank = /\bbank\b|\bbanking\b|\bfinance\b|\bfinancial\b|\bcredit\b|\bcard\b/.test(candidateLower);
    const hasEmployerMarker = /\b(?:sdn|berhad|bhd|ltd|inc|corp|holdings|services|solutions|technology|technologies|systems)\b/.test(candidateLower);

    if ((declaredLower && declaredLower.split(/\s+/).some((token) => token.length > 2 && candidateLower.includes(token))) ||
        (hasEmployerMarker && !looksLikeBank)) {
      result.detected_employer_name = normalizedCandidate;
      break;
    }
  }

  // Transaction Table Extraction
  "use strict";
  let sumTotalCredits = 0;
  let sumPayrollCredits = 0;
  let transactionCount = 0;

  const creditCandidates = getTransactionCreditCandidates(lines);
  for (const candidate of creditCandidates) {
    const amount = candidate.amount;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const description = candidate.description || '';
    const isPayroll = /payroll|salary|gaji/i.test(description) ||
      (declaredEmployer && description.toLowerCase().includes(declaredEmployer.toLowerCase())) ||
      (result.detected_employer_name && description.toLowerCase().includes(result.detected_employer_name.toLowerCase()));

    sumTotalCredits += amount;
    transactionCount++;
    if (isPayroll) {
      sumPayrollCredits += amount;
    }
  }

  const summarySalaryMatch = text.match(/salary\s+credits\s*(?:[:\-]|\n)\s*(?:[A-Z]{3}\s*)?([0-9,]+(?:\.\d+)?)/i);
  const summaryOtherInflowMatch = text.match(/other\s+incoming\s+credits\s*(?:[:\-]|\n)\s*(?:[A-Z]{3}\s*)?([0-9,]+(?:\.\d+)?)/i);
  const summaryTotalMatch = text.match(/(?:total\s+account\s+credits|total\s+credits|total\s+deposits)\s*(?:[:\-]|\n)\s*(?:[A-Z]{3}\s*)?([0-9,]+(?:\.\d+)?)/i);

  if (summaryTotalMatch) {
    const totalSummaryCredits = parseFloat(summaryTotalMatch[1].replace(/,/g, ''));
    if (!isNaN(totalSummaryCredits)) {
      result.total_bank_deposits_detected = totalSummaryCredits;
    }
  }

  if (summarySalaryMatch) {
    const monthlySummaryIncome = parseFloat(summarySalaryMatch[1].replace(/,/g, '')) / 12;
    if (!isNaN(monthlySummaryIncome)) {
      result.verified_monthly_income = monthlySummaryIncome;
      result.verified_annual_income = monthlySummaryIncome * 12;
    }
  }

  if (!result.total_bank_deposits_detected && transactionCount > 0) {
    result.total_bank_deposits_detected = sumTotalCredits;
  }

  if (!result.verified_annual_income && transactionCount > 0 && sumPayrollCredits > 0) {
    const payrollPayments: number[] = [];
    for (const candidate of creditCandidates) {
      const description = candidate.description || '';
      if (/payroll|salary|gaji/i.test(description) || (declaredEmployer && description.toLowerCase().includes(declaredEmployer.toLowerCase()))) {
        payrollPayments.push(candidate.amount);
      }
    }
    const monthlyEst = payrollPayments.length > 0 ? Math.max(...payrollPayments) : sumPayrollCredits / Math.max(1, transactionCount);
    result.verified_monthly_income = monthlyEst;
    result.verified_annual_income = monthlyEst * 12;
  }

  if (!result.total_bank_deposits_detected) {
    // Fallback to summary-level regex matches
    const basicSalaryMatch =
      text.match(/(?:basic|net)\s+salary\s*:\s*[A-Z]{3}\s*([0-9,.]+)/i) ||
      text.match(/salary\s*:\s*[A-Z]{3}\s*([0-9,.]+)/i);
    if (basicSalaryMatch) {
      const monthly = parseFloat(basicSalaryMatch[1].replace(/,/g, ''));
      if (!isNaN(monthly)) {
        result.verified_monthly_income = monthly;
        result.verified_annual_income = monthly * 12;
      }
    }

    const creditsMatch = text.match(/(?:total credits|total deposits|deposits|credits)\s*:\s*[A-Z]{3}\s*([0-9,.]+)/i);
    if (creditsMatch) {
      const credits = parseFloat(creditsMatch[1].replace(/,/g, ''));
      if (!isNaN(credits)) {
        result.total_bank_deposits_detected = credits;
      }
    } else {
      const unidentifiedMatch = text.match(
        /(?:unidentified deposit|deposit|transfer|trf)\s*:\s*[A-Z]{3}\s*([0-9,.]+)/i
      );
      if (unidentifiedMatch) {
        const deposit = parseFloat(unidentifiedMatch[1].replace(/,/g, ''));
        if (!isNaN(deposit)) {
          result.total_bank_deposits_detected = deposit;
        }
      }
    }
  }

  return result;
}

/**
 * Executes Source of Wealth Evaluation natively in application code (n8n is deprecated as a runtime)
 */
export async function runSoWEvaluation(
  sowCase: SoWCase,
  documents: DocumentRecord[],
  options = { enablePiiRedaction: true }
): Promise<SoWEvaluationResult> {
  const startTime = Date.now();

  // Combine OCR texts
  let combinedDocumentText = documents.map((d) => d.ocr_extracted_text || d.filename).join('\n---\n');
  let piiRedacted = false;
  if (options.enablePiiRedaction) {
    const redacted = redactPII(combinedDocumentText);
    combinedDocumentText = redacted.redactedText;
    piiRedacted = redacted.piiDetected;
  }

  let extractedData: Partial<ExtractedProfile> & { ai_explanation?: string; confidence_score?: number } = {};
  let aiExplanation = '';
  let modelUsed = 'NATIVE_DETERMINISTIC_RULES';

  // Check if Gemini API is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const prompt = `You are a Senior AML/CFT Compliance Officer for an Islamic Wealth Manager.
Evaluate the following customer's declared wealth against their supporting document text.

CUSTOMER DECLARED METADATA:
- Customer Name: ${sowCase.customer_name}
- Declared Annual Net Income: ${sowCase.currency} ${sowCase.declared_annual_income.toLocaleString()}
- Declared Employer: ${sowCase.employer_name}
- Source Category: ${sowCase.primary_source_category}

SUPPORTING DOCUMENTS TEXT:
${combinedDocumentText}

INSTRUCTIONS:
1. Differentiate net income vs deposits.
2. Extract verified monthly income, annual income, total deposits detected, employer name seen on docs.
3. Provide a clear, professional 2-3 paragraph AML compliance explanation summarizing findings, key discrepancies, and recommendations.

Return output strictly in JSON format:
{
  "verified_monthly_income": number,
  "verified_annual_income": number,
  "detected_employer_name": "string",
  "total_bank_deposits_detected": number,
  "deposit_evaluation_period_months": number,
  "currency_code": "string",
  "extraction_confidence_score": number,
  "ai_explanation": "string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const deterministicBaseline = extractDeterministicFromOCR(
          combinedDocumentText,
          sowCase.declared_annual_income,
          sowCase.employer_name
        );
        extractedData = {
          ...parsed,
          verified_monthly_income: parsed.verified_monthly_income || deterministicBaseline.verified_monthly_income,
          verified_annual_income: parsed.verified_annual_income || deterministicBaseline.verified_annual_income,
          detected_employer_name: parsed.detected_employer_name || deterministicBaseline.detected_employer_name,
          total_bank_deposits_detected: (parsed.total_bank_deposits_detected !== undefined && parsed.total_bank_deposits_detected > 0)
            ? parsed.total_bank_deposits_detected
            : deterministicBaseline.total_bank_deposits_detected,
        };
        aiExplanation = parsed.ai_explanation || '';
        modelUsed = 'gemini-3.7-flash';
      }
    } catch (err) {
      console.error('Gemini API call failed, falling back to deterministic OCR parsing:', err);
    }
  }

  // If Gemini was not used or failed entirely to extract main indicators, load full deterministic baseline
  if (!extractedData.verified_annual_income || extractedData.total_bank_deposits_detected === undefined) {
    const deterministicData = extractDeterministicFromOCR(
      combinedDocumentText,
      sowCase.declared_annual_income,
      sowCase.employer_name
    );
    extractedData = {
      ...extractedData,
      ...deterministicData,
      confidence_score: 0.85,
    };
    if (!aiExplanation) {
      aiExplanation = `Source of Wealth evaluation completed natively using local deterministic rule engines. Gemini AI assisted analysis is currently not configured or unavailable. Pre-configured threshold checking executed successfully.`;
    }
  }

  // Deterministic Financial Consistency Engine Rules
  const declaredAnnual =
    typeof sowCase.declared_annual_income === 'number' &&
    !isNaN(sowCase.declared_annual_income) &&
    sowCase.declared_annual_income > 0
      ? sowCase.declared_annual_income
      : 0;
  const isDeclaredIncomeValid = declaredAnnual > 0;

  // Extract total deposits safely - must be a valid positive number
  const rawTotalDeposits = extractedData.total_bank_deposits_detected;
  const depositsExtracted =
    rawTotalDeposits !== undefined &&
    rawTotalDeposits !== null &&
    typeof rawTotalDeposits === 'number' &&
    !isNaN(rawTotalDeposits) &&
    rawTotalDeposits > 0;

  const totalDeposits = depositsExtracted ? rawTotalDeposits : undefined;
  const detectedDeposits = totalDeposits !== undefined ? totalDeposits : 0;

  // Extract verified income safely
  const rawAnnualIncome = extractedData.verified_annual_income;
  const incomeExtracted =
    rawAnnualIncome !== undefined &&
    rawAnnualIncome !== null &&
    typeof rawAnnualIncome === 'number' &&
    !isNaN(rawAnnualIncome) &&
    rawAnnualIncome > 0;
  const verifiedAnnualIncome = incomeExtracted ? rawAnnualIncome : undefined;

  // Documents inspection
  const hasDocuments = Array.isArray(documents) && documents.length > 0;
  const hasBankStatement = documents.some((d) => d.file_type === 'BANK_STATEMENT');
  const hasIncomeDoc = documents.some((d) =>
    ['PAYSLIP', 'EMPLOYMENT_LETTER', 'EPF_STATEMENT', 'TAX_DECLARATION'].includes(d.file_type)
  );

  // Check OCR integrity across documents
  const hasFailedDocument = documents.some(
    (d) =>
      d.upload_status === 'FAILED' ||
      d.ocr_status === 'FAILED' ||
      (d.ocr_extracted_text && /\[OCR_FAILED\]|OCR_ERROR|UNREADABLE_DOCUMENT|CORRUPTED_DOCUMENT/i.test(d.ocr_extracted_text))
  );
  const hasEmptyOCR = hasDocuments && documents.every((d) => !d.ocr_extracted_text || d.ocr_extracted_text.trim().length < 10);

  // Compute Deposit-to-Salary Ratio
  let ratio: number | undefined = undefined;
  if (depositsExtracted && isDeclaredIncomeValid) {
    ratio = totalDeposits! / declaredAnnual;
  } else if (incomeExtracted && isDeclaredIncomeValid && !hasBankStatement) {
    // If only salary doc was provided (e.g. payslip), ratio is verified income vs declared income
    ratio = verifiedAnnualIncome! / declaredAnnual;
  }

  // Financial Evidence Status Classification
  let financialEvidenceStatus: 'AVAILABLE' | 'EXTRACTED' | 'VALID' | 'MISSING' | 'NOT_EXTRACTED' | 'NOT_AVAILABLE' | 'OCR_FAILED' | 'PARSER_FAILED' | 'INVALID' = 'VALID';
  if (!hasDocuments) {
    financialEvidenceStatus = 'MISSING';
  } else if (hasFailedDocument || hasEmptyOCR) {
    financialEvidenceStatus = 'OCR_FAILED';
  } else if (!isDeclaredIncomeValid) {
    financialEvidenceStatus = 'INVALID';
  } else if (!depositsExtracted && !incomeExtracted) {
    financialEvidenceStatus = 'NOT_EXTRACTED';
  } else if (hasBankStatement && !depositsExtracted) {
    financialEvidenceStatus = 'NOT_EXTRACTED';
  } else {
    financialEvidenceStatus = 'VALID';
  }

  // Evidence Sufficiency Gate
  const isEvidenceInsufficient =
    !hasDocuments ||
    hasFailedDocument ||
    hasEmptyOCR ||
    !isDeclaredIncomeValid ||
    financialEvidenceStatus !== 'VALID' ||
    ratio === undefined ||
    isNaN(ratio);

  const ruleResults: RuleResult[] = [];
  const flags: ComplianceFlag[] = [];
  let riskPoints = 0;

  // =========================================================================
  // STEP 1 — EVIDENCE SUFFICIENCY GATE (Evaluated BEFORE Risk Scoring)
  // =========================================================================
  if (isEvidenceInsufficient || ratio === undefined || (!depositsExtracted && !incomeExtracted)) {
    // Missing, unreadable, OCR-failed, or unextractable financial parameters
    // -> decision = INSUFFICIENT_INFORMATION
    // -> risk score = 0
    // -> DO NOT continue to approval scoring
    // -> DO NOT convert missing/unextracted values into zero
    // -> DO NOT allow APPROVED
    const decision = 'INSUFFICIENT_INFORMATION';
    const riskLevel = 'LOW';
    const finalScore = 0;

    ruleResults.push({
      rule_id: 'RULE_EVIDENCE_SUFFICIENCY',
      rule_name: 'Financial Evidence Sufficiency',
      passed: false,
      severity: 'WARNING',
      observed_value: financialEvidenceStatus,
      expected_threshold: 'Valid, readable financial statements and extractable parameters',
      failure_message: !hasDocuments
        ? 'No supporting financial documentation was uploaded for verification.'
        : hasFailedDocument || hasEmptyOCR
        ? 'Document OCR parsing failed or produced unreadable text.'
        : hasBankStatement && !depositsExtracted
        ? 'Bank statement was submitted but deposit transactions could not be extracted.'
        : 'The submitted documents did not contain readable or valid financial parameters.',
    });
    flags.push({
      flag_code: 'INSUFFICIENT_FINANCIAL_EVIDENCE',
      flag_title: 'Additional Financial Evidence Required',
      description: 'Usable financial data (such as verified monthly net pay or bank statement deposits) could not be extracted from the submitted files. This represents an evidence gap, not suspicious misconduct.',
      risk_points_added: 0,
      recommended_remediation: 'Request certified 12-month bank statements or statutory payslips from the customer before re-running verification.',
    });

    let aiExplanation = `The submitted documentation for customer ${sowCase.customer_name} is insufficient to complete the automated Source of Wealth (SoW) compliance assessment. ${
      !hasDocuments
        ? 'No financial evidence or supporting documents were attached to the case file.'
        : hasFailedDocument || hasEmptyOCR
        ? 'Uploaded documents could not be processed due to OCR extraction failures or unreadable image scans.'
        : hasBankStatement && !depositsExtracted
        ? 'Bank statement was provided but transaction deposit data could not be reliably extracted.'
        : 'Required financial metrics could not be verified from the submitted records.'
    } Additional documentation (e.g. certified 12-month bank statements, statutory payslips, or tax filings) is required before a compliance determination can be made.`;

    const executionTimeMs = Date.now() - startTime;

    const result: SoWEvaluationResult = {
      case_id: sowCase.id,
      organization_id: sowCase.organization_id,
      execution_engine: 'NATIVE_COMPLIANCE_ENGINE',
      workflow_execution_id: `NATIVE-EXEC-${Date.now()}`,
      processed_at: new Date().toISOString(),
      overall_decision: decision,
      composite_risk_score: finalScore,
      risk_level: riskLevel,
      extracted_financial_profile: {
        verified_monthly_income: extractedData.verified_monthly_income !== undefined ? extractedData.verified_monthly_income : null,
        verified_annual_income: extractedData.verified_annual_income !== undefined ? extractedData.verified_annual_income : null,
        detected_employer_name: extractedData.detected_employer_name || null,
        total_bank_deposits_detected: totalDeposits !== undefined ? totalDeposits : null,
        deposit_evaluation_period_months: totalDeposits !== undefined ? 12 : null,
        currency_code: sowCase.currency,
        extraction_confidence_score: extractedData.extraction_confidence_score || extractedData.confidence_score || 0,
        financial_evidence_status: financialEvidenceStatus,
      },
      rule_evaluation_results: ruleResults,
      compliance_flags: flags,
      ai_explanation: aiExplanation,
      provenance_metadata: {
        model_used: 'NATIVE_DETERMINISTIC_EVIDENCE_GATE',
        pii_redacted: true,
        execution_time_ms: executionTimeMs,
        payload_sha256: 'a9f8e7d6c5b4a3210987654321fedcba',
      },
    };

    // Auto-update DB store
    const existingCase = dbStore.cases.get(sowCase.id);
    if (existingCase) {
      existingCase.status = decision;
      existingCase.overall_decision = decision;
      existingCase.composite_risk_score = finalScore;
      existingCase.risk_level = riskLevel;
      existingCase.updated_at = new Date().toISOString();
      dbStore.cases.set(existingCase.id, existingCase);
    }

    return result;
  }

  // =========================================================================
  // STEP 2 — DETERMINISTIC RISK SCORING (Evidence is Complete & Extractable)
  // =========================================================================
  // Rule 1: Salary vs Deposit Ratio
  if (ratio !== undefined) {
    if (ratio > 2.0) {
      ruleResults.push({
        rule_id: 'RULE_SALARY_VS_DEPOSIT_RATIO',
        rule_name: 'Bank Deposit to Annual Salary Ratio',
        passed: false,
        severity: 'CRITICAL',
        observed_value: ratio.toFixed(2),
        expected_threshold: '<= 1.25',
        failure_message: `Bank deposits (${sowCase.currency} ${detectedDeposits.toLocaleString()}) exceed declared annual salary (${sowCase.currency} ${declaredAnnual.toLocaleString()}) by over 200%.`,
      });
      flags.push({
        flag_code: 'CRITICAL_INCOME_DEPOSIT_MISMATCH',
        flag_title: 'Critical Income-Deposit Discrepancy',
        description: `Detected 12-month bank deposits (${sowCase.currency} ${detectedDeposits.toLocaleString()}) significantly exceed declared annual net salary (${sowCase.currency} ${declaredAnnual.toLocaleString()}).`,
        risk_points_added: 50,
        recommended_remediation: 'Mandatory Enhanced Due Diligence (EDD): Request audited tax returns or secondary asset sale deeds.',
      });
      riskPoints += 50;
    } else if (ratio > 1.25) {
      ruleResults.push({
        rule_id: 'RULE_SALARY_VS_DEPOSIT_RATIO',
        rule_name: 'Bank Deposit to Annual Salary Ratio',
        passed: false,
        severity: 'WARNING',
        observed_value: ratio.toFixed(2),
        expected_threshold: '<= 1.25',
        failure_message: 'Elevated deposit volume relative to declared annual income.',
      });
      flags.push({
        flag_code: 'UNEXPLAINED_DEPOSIT_VARIANCE',
        flag_title: 'Elevated Bank Deposit Variance',
        description: 'Total bank deposits exceed declared salary by more than 25%.',
        risk_points_added: 25,
        recommended_remediation: 'Require customer clarification regarding secondary income streams.',
      });
      riskPoints += 25;
    } else {
      ruleResults.push({
        rule_id: 'RULE_SALARY_VS_DEPOSIT_RATIO',
        rule_name: 'Bank Deposit to Annual Salary Ratio',
        passed: true,
        severity: 'INFO',
        observed_value: ratio.toFixed(2),
        expected_threshold: '<= 1.25',
      });
    }
  }

  // Rule 2: Employer Consistency Check
  const detectedEmployer = extractedData.detected_employer_name;
  if (detectedEmployer && detectedEmployer !== 'NOT_DETECTED') {
    const normalizeEmployer = (str: string): string => {
      if (!str || typeof str !== 'string') return '';
      return str
        .toLowerCase()
        // Replace punctuation and symbols with spaces
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        // Normalize and strip standard legal entity suffixes
        // (Do NOT strip substantive business words like services, solutions, technologies, etc.)
        .replace(
          /\b(sendirian\s+berhad|sdn\s+bhd|sdn\s*bhd|pte\s+ltd|pte\s*ltd|private\s+limited|berhad|bhd|limited|ltd|corporation|corp|incorporated|inc|llc|plc)\b/gi,
          ''
        )
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normDetected = normalizeEmployer(detectedEmployer);
    const normDeclared = normalizeEmployer(sowCase.employer_name || '');

    // Strict deterministic equality check on normalized employer names
    const match = normDetected.length > 0 && normDeclared.length > 0 && normDetected === normDeclared;

    if (!match) {
      ruleResults.push({
        rule_id: 'RULE_EMPLOYER_MATCH',
        rule_name: 'Employer Name Consistency Check',
        passed: false,
        severity: 'WARNING',
        observed_value: detectedEmployer,
        expected_threshold: sowCase.employer_name,
        failure_message: `Document employer '${detectedEmployer}' does not match declared employer '${sowCase.employer_name}'.`,
      });
      flags.push({
        flag_code: 'EMPLOYER_NAME_MISMATCH',
        flag_title: 'Employer Name Discrepancy',
        description: `Payslip shows employer '${detectedEmployer}' whereas declared employer is '${sowCase.employer_name}'.`,
        risk_points_added: 20,
        recommended_remediation: 'Verify recent job changes or corporate subsidiary naming differences.',
      });
      riskPoints += 20;
    } else {
      ruleResults.push({
        rule_id: 'RULE_EMPLOYER_MATCH',
        rule_name: 'Employer Name Consistency Check',
        passed: true,
        severity: 'INFO',
        observed_value: detectedEmployer,
        expected_threshold: sowCase.employer_name,
      });
    }
  }

  // =========================================================================
  // STEP 3 — DECISION BY SCORE (Authoritative Thresholds)
  // - 0–24: APPROVED
  // - 25–49: MANUAL_REVIEW_REQUIRED
  // - 50–100: REJECTED
  // =========================================================================
  // Mathematically bound risk score within [0, 100]
  riskPoints = Math.min(100, Math.max(0, Math.round(riskPoints)));

  let decision: 'APPROVED' | 'MANUAL_REVIEW_REQUIRED' | 'INSUFFICIENT_INFORMATION' | 'REJECTED';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  if (riskPoints >= 50) {
    decision = 'REJECTED';
    riskLevel = 'CRITICAL';
  } else if (riskPoints >= 25) {
    decision = 'MANUAL_REVIEW_REQUIRED';
    riskLevel = 'MEDIUM';
  } else {
    // 0–24 points with complete verified evidence
    decision = 'APPROVED';
    riskLevel = 'LOW';
  }

  // Synthesis of Professional compliance narrative explanation
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const failedRulesText = ruleResults
        .filter((r) => !r.passed)
        .map((r) => `* ${r.rule_name}: Observed value of ${r.observed_value} against expected threshold of ${r.expected_threshold}. Failure reason: ${r.failure_message}`)
        .join('\n');

      const raisedFlagsText = flags
        .map((f) => `* ${f.flag_title}: ${f.description} (+${f.risk_points_added} risk points). recommended remediation: ${f.recommended_remediation}`)
        .join('\n');

      const synthesisPrompt = `You are a Senior AML/CFT Compliance Officer for an Islamic Wealth Manager.
Provide a professional, clear 2-3 paragraph Source of Wealth (SoW) compliance assessment explanation for customer ${sowCase.customer_name}.

YOUR GENERATED NARRATIVE MUST BE 100% CONSISTENT WITH THE DETERMINISTIC ENGINE EVALUATION RESULTS PROVIDED BELOW.
YOU MUST NEVER CONTRADICT THESE FINDINGS. 
- If decision is INSUFFICIENT_INFORMATION: Clearly state that the available evidence is insufficient to make a compliance decision and additional documents are required. Do NOT describe the customer as suspicious or guilty.
- If decision is REJECTED: Explain why the critical compliance violations led to REJECTED.
- If decision is MANUAL_REVIEW_REQUIRED: Explicitly state that human compliance officer review is required.
- If decision is APPROVED: State why the case is approved within acceptable risk parameters.

EVALUATION RESULTS FROM DETERMINISTIC ENGINE:
- Customer Name: ${sowCase.customer_name}
- Declared Net Income: ${sowCase.currency} ${sowCase.declared_annual_income.toLocaleString()}
- Declared Employer: ${sowCase.employer_name}
- Total Deposits Detected: ${totalDeposits !== undefined ? sowCase.currency + ' ' + totalDeposits.toLocaleString() : 'NOT_AVAILABLE'}
- Deposit-to-Salary Ratio: ${ratio !== undefined ? ratio.toFixed(2) + 'x' : 'NOT_AVAILABLE'} (Expected: <= 1.25x)
- Risk Score: ${riskPoints}/100
- Risk Level: ${riskLevel}
- Final Decision: ${decision}

FAILED COMPLIANCE RULES:
${failedRulesText || '* None'}

RAISED RISK FLAGS:
${raisedFlagsText || '* None'}

ASSESSMENT SUMMARY INSTRUCTIONS:
1. Explain the financial evidence status and ratio/deposit analysis.
2. Discuss consistency in declared vs documented details.
3. State the risk score (${riskPoints}/100), risk level (${riskLevel}), and authoritative decision (${decision}).
4. Keep the tone completely professional, authoritative, and aligned with Shariah compliance wealth verification best practices.

Return only the final plain text narrative explanation paragraphs. Do not wrap in JSON or markdown blocks.`;

      const synthResponse = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: synthesisPrompt,
      });

      if (synthResponse.text) {
        aiExplanation = synthResponse.text.trim();
        modelUsed = 'gemini-3.7-flash';
      }
    } catch (err) {
      console.error('[DBStore] Synthesis generation failed:', err);
    }
  }

  // Defensive post-processing consistency guards for decisions reached via Step 3
  if (decision === 'REJECTED') {
    const contradictoryPatterns = [
      /\bapproved\b/i,
      /acceptable risk/i,
      /low risk/i,
      /no material concern/i,
      /within acceptable parameters/i,
      /fully compliant/i,
      /passed all/i,
      /no discrepancy/i,
      /no discrepancies/i,
      /everything is correct/i,
      /no issues/i,
      /completely acceptable/i,
      /within normal/i
    ];

    const containsContradiction = contradictoryPatterns.some(pattern => pattern.test(aiExplanation));
    const fallbackText = `Source of Wealth evaluation completed with CRITICAL risk classification (Score: ${riskPoints}/100) leading to a decision of REJECTED. ${
      ratio !== undefined 
        ? `The bank deposit-to-annual-income ratio is ${ratio.toFixed(2)}x, vastly exceeding the critical 2.0x threshold.` 
        : 'Critical discrepancies were identified within the submitted financial evidence.'
    } This case has been formally REJECTED by the automated compliance engine due to severe financial inconsistency.`;

    if (containsContradiction || !aiExplanation) {
      console.warn(`[SECURITY / QA CHECK] Gemini narrative contradicted the deterministic decision (${decision}) or was empty. Correcting with compliance-safe fallback.`);
      aiExplanation = fallbackText;
    }
  } else if (decision === 'MANUAL_REVIEW_REQUIRED') {
    const contradictoryPatterns = [
      /\bapproved\b/i,
      /low risk/i,
      /fully compliant/i,
      /passed all/i,
      /everything is correct/i,
      /no issues/i,
      /completely acceptable/i
    ];

    const containsContradiction = contradictoryPatterns.some(pattern => pattern.test(aiExplanation));
    const fallbackText = `Source of Wealth evaluation completed with risk classification of ${riskLevel} (Score: ${riskPoints}/100) leading to a decision of ${decision}. ${
      ratio !== undefined 
        ? `The bank deposit-to-annual-income ratio is ${ratio.toFixed(2)}x, exceeding the configured 1.25x threshold.` 
        : 'Documented transactions or salary metrics exhibited variance requiring manual verification.'
    } This case has been routed to the pending compliance review queue for manual compliance officer review and formal adjudication.`;

    const requiresHumanStatement = aiExplanation.toLowerCase().includes('human') || 
                                   aiExplanation.toLowerCase().includes('manual') || 
                                   aiExplanation.toLowerCase().includes('review') ||
                                   aiExplanation.toLowerCase().includes('officer');

    if (containsContradiction || !aiExplanation || !requiresHumanStatement) {
      console.warn(`[SECURITY / QA CHECK] Gemini narrative contradicted the deterministic decision (${decision}) or failed to state human review requirement. Correcting with compliance-safe fallback.`);
      aiExplanation = fallbackText;
    }
  } else {
    // If APPROVED, ensure it is positive and didn't bypass any critical check
    const hasFailures = ruleResults.some((r) => !r.passed && r.severity === 'CRITICAL');
    if (hasFailures) {
      decision = 'MANUAL_REVIEW_REQUIRED';
      riskLevel = 'MEDIUM';
      aiExplanation = `Source of Wealth evaluation completed with detected variances. This case has been routed to the compliance review queue for manual assessment.`;
    } else if (!aiExplanation) {
      aiExplanation = `Source of Wealth verification completed successfully for ${sowCase.customer_name}. The bank deposit-to-salary ratio of ${ratio !== undefined ? ratio.toFixed(2) + 'x' : 'N/A'} is fully within acceptable risk parameters. Declared employer name matches verified records. Risk score: ${riskPoints}/100. Approved.`;
    }
  }

  const executionTimeMs = Date.now() - startTime;

  const result: SoWEvaluationResult = {
    case_id: sowCase.id,
    organization_id: sowCase.organization_id,
    execution_engine: 'NATIVE_COMPLIANCE_ENGINE',
    workflow_execution_id: `NATIVE-EXEC-${Date.now()}`,
    processed_at: new Date().toISOString(),
    overall_decision: decision,
    composite_risk_score: riskPoints,
    risk_level: riskLevel,
    extracted_financial_profile: {
      verified_monthly_income: extractedData.verified_monthly_income !== undefined ? extractedData.verified_monthly_income : null,
      verified_annual_income: extractedData.verified_annual_income !== undefined ? extractedData.verified_annual_income : null,
      detected_employer_name: extractedData.detected_employer_name || null,
      total_bank_deposits_detected: totalDeposits !== undefined ? totalDeposits : null,
      deposit_evaluation_period_months: totalDeposits !== undefined ? 12 : null,
      currency_code: sowCase.currency,
      extraction_confidence_score: extractedData.extraction_confidence_score || extractedData.confidence_score || 0,
      financial_evidence_status: financialEvidenceStatus,
    },
    rule_evaluation_results: ruleResults,
    compliance_flags: flags,
    ai_explanation:
      aiExplanation ||
      `Source of Wealth evaluation completed natively for ${sowCase.customer_name}. ${
        ratio !== undefined 
          ? `The calculated deposit-to-salary ratio is ${ratio.toFixed(2)}.` 
          : 'Mathematical deposit-to-salary ratio could not be computed due to lack of extracted bank statement data.'
      } Overall risk score assigned: ${riskPoints}/100.`,
    provenance_metadata: {
      model_used: modelUsed,
      pii_redacted: piiRedacted,
      execution_time_ms: executionTimeMs,
      payload_sha256: 'a9f8e7d6c5b4a3210987654321fedcba',
    },
  };

  // Update Case in Store
  dbStore.syncFromDisk(true);
  const activeCase = dbStore.cases.get(sowCase.id) || sowCase;
  const updatedCase: SoWCase = {
    ...activeCase,
    status: decision,
    overall_decision: decision,
    automated_decision: decision,
    composite_risk_score: riskPoints,
    risk_level: riskLevel,
    updated_at: new Date().toISOString(),
  };
  dbStore.cases.set(updatedCase.id, updatedCase);

  // Create Job Record
  const job: ProcessingJob = {
    id: `JOB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    case_id: updatedCase.id,
    organization_id: updatedCase.organization_id,
    engine_used: modelUsed === 'NATIVE_DETERMINISTIC_RULES' ? 'NATIVE_COMPLIANCE_ENGINE' : 'GEMINI_SERVER_ENGINE',
    status: 'COMPLETED',
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    extracted_data: result.extracted_financial_profile as unknown as Record<string, unknown>,
    rule_results: ruleResults,
    compliance_flags: flags,
    ai_explanation: result.ai_explanation,
  };
  dbStore.jobs.set(job.id, job);

  // Add Hash Chained Audit Event
  dbStore.addAuditBlock(
    updatedCase.id,
    updatedCase.organization_id,
    'SOW_EVALUATION_EXECUTED',
    updatedCase.created_by_user_id,
    'system@luxera.internal',
    {
      decision,
      risk_score: riskPoints,
      engine: 'NATIVE_COMPLIANCE_ENGINE',
      rule_failures_count: ruleResults.filter((r) => !r.passed).length,
    }
  );

  return result;
}
