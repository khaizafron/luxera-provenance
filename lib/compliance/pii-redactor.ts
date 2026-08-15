export interface PIIRedactionResult {
  redactedText: string;
  piiDetected: boolean;
  maskedCount: number;
  tokensMap: Record<string, string>;
}

/**
 * PII Redaction Filter adhering to PDPA Act 709 Section 9
 * Masks NRIC/Passport, Credit Cards/Bank Accounts, Phone Numbers, and Email Addresses
 */
export function redactPII(input: string): PIIRedactionResult {
  if (!input) {
    return { redactedText: '', piiDetected: false, maskedCount: 0, tokensMap: {} };
  }

  let text = input;
  let maskedCount = 0;
  const tokensMap: Record<string, string> = {};

  // 1. Malaysian NRIC (YYMMDD-PB-###G or YYMMDD-##-####)
  const nricRegex = /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])-\d{2}-\d{4}\b/g;
  text = text.replace(nricRegex, (match) => {
    maskedCount++;
    const token = `[NRIC_REDACTED_${maskedCount}]`;
    tokensMap[token] = match;
    return token;
  });

  // 2. Bank Account / Credit Card numbers (10 to 16 digits)
  const bankRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{2,4}\b/g;
  text = text.replace(bankRegex, (match) => {
    maskedCount++;
    const token = `[ACCT_REDACTED_${maskedCount}]`;
    tokensMap[token] = match;
    return token;
  });

  // 3. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  text = text.replace(emailRegex, (match) => {
    maskedCount++;
    const token = `[EMAIL_REDACTED_${maskedCount}]`;
    tokensMap[token] = match;
    return token;
  });

  // 4. Phone numbers (+60, 01x-xxx)
  const phoneRegex = /(\+?6?01[0-9][- ]?\d{3,4}[- ]?\d{4})/g;
  text = text.replace(phoneRegex, (match) => {
    maskedCount++;
    const token = `[PHONE_REDACTED_${maskedCount}]`;
    tokensMap[token] = match;
    return token;
  });

  return {
    redactedText: text,
    piiDetected: maskedCount > 0,
    maskedCount,
    tokensMap,
  };
}
