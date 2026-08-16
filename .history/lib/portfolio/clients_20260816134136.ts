export interface PortfolioCsvRow {
  client_id: string;
  client_name: string;
  total_deposited: number;
  currency: string;
  lineNumber: number;
}

export interface PortfolioCsvValidationIssue {
  lineNumber: number;
  message: string;
  row: Partial<PortfolioCsvRow> | null;
}

export interface PortfolioCsvParsed {
  headers: string[];
  rows: PortfolioCsvRow[];
  errors: string[];
}

export interface PortfolioCsvValidationResult {
  valid: PortfolioCsvRow[];
  rejected: PortfolioCsvValidationIssue[];
  errors: PortfolioCsvValidationIssue[];
  total: number;
  validCount: number;
  rejectedCount: number;
}

const REQUIRED_HEADERS = ['client_id', 'client_name', 'total_deposited', 'currency'];

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeCell(value: string): string {
  return (value ?? '').replace(/\uFEFF/g, '').trim();
}

function parseSimpleCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => normalizeCell(value));
}

export function parsePortfolioCsv(csvText: string): PortfolioCsvParsed {
  const cleaned = csvText.replace(/\r/g, '').trim();
  if (!cleaned) {
    return { headers: [], rows: [], errors: ['CSV file is empty.'] };
  }

  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['CSV file must include a header row and at least one data row.'] };
  }

  const rawHeaders = parseSimpleCsvLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);
  const rows: PortfolioCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseSimpleCsvLine(lines[i]);
    if (values.every((value) => value === '')) {
      continue;
    }

    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      record[headers[j]] = values[j] ?? '';
    }

    const clientId = normalizeCell(record.client_id ?? '');
    const clientName = normalizeCell(record.client_name ?? '');
    const amountRaw = normalizeCell(record.total_deposited ?? '');
    const currency = normalizeCell(record.currency ?? '').toUpperCase();

    if (!clientId || !clientName || !amountRaw || !currency) {
      errors.push(`Row ${i + 1} is incomplete or missing required values.`);
      continue;
    }

    const amountValue = Number(amountRaw.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      errors.push(`Row ${i + 1} has an invalid total_deposited value.`);
      continue;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      errors.push(`Row ${i + 1} has an invalid currency code. Use a 3-letter ISO code such as MYR, USD, SGD.`);
      continue;
    }

    rows.push({
      client_id: clientId,
      client_name: clientName,
      total_deposited: Number(amountValue),
      currency,
      lineNumber: i + 1,
    });
  }

  return { headers, rows, errors };
}

export function validatePortfolioCsvRows(
  rows: PortfolioCsvRow[],
  headers: string[] = REQUIRED_HEADERS
): PortfolioCsvValidationResult {
  const issues: PortfolioCsvValidationIssue[] = [];
  const valid: PortfolioCsvRow[] = [];
  const seenClientIds = new Set<string>();

  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const missingRequired = REQUIRED_HEADERS.filter((header) => !normalizedHeaders.includes(header));
  if (missingRequired.length > 0) {
    issues.push({
      lineNumber: 0,
      message: `Missing required column(s): ${missingRequired.join(', ')}`,
      row: null,
    });
    return {
      valid: [],
      rejected: issues,
      errors: issues,
      total: rows.length,
      validCount: 0,
      rejectedCount: issues.length,
    };
  }

  for (const row of rows) {
    const rowErrors: string[] = [];

    if (!row.client_id || !row.client_id.trim()) {
      rowErrors.push('Missing client_id');
    }
    if (!row.client_name || !row.client_name.trim()) {
      rowErrors.push('Missing client_name');
    }
    if (!Number.isFinite(row.total_deposited) || row.total_deposited <= 0) {
      rowErrors.push('Invalid total_deposited');
    }
    if (!/^[A-Z]{3}$/.test((row.currency || '').toUpperCase())) {
      rowErrors.push('Invalid currency');
    }
    if (seenClientIds.has((row.client_id || '').trim())) {
      rowErrors.push('Duplicate client_id');
    }
    if (row.client_id) {
      seenClientIds.add(row.client_id.trim());
    }

    if (rowErrors.length > 0) {
      const rowIssues = rowErrors.map((message) => ({
        lineNumber: row.lineNumber,
        message,
        row,
      }));
      issues.push(...rowIssues);
      continue;
    }

    valid.push(row);
  }

  return {
    valid,
    rejected: issues,
    errors: issues,
    total: rows.length,
    validCount: valid.length,
    rejectedCount: issues.length,
  };
}

export function buildPortfolioTemplateCsv(): string {
  return [
    'client_id,client_name,total_deposited,currency',
    'CL-0001,Ahmad Zaki,850000,MYR',
    'CL-0002,Sarah Tan,2400000,MYR',
    'CL-0003,Daniel Lim,150000,MYR',
  ].join('\n');
}
