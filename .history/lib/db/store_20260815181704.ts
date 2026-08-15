import { AuditBlock, calculateBlockHash, calculatePayloadHash } from '../audit/hash-chain';
import fs from 'fs';
import path from 'path';

// Custom Map subclass that intercepts mutations to trigger persistent savings
class PersistentMap<K, V> extends Map<K, V> {
  private onChange: () => void;

  constructor(entries: readonly (readonly [K, V])[] | null | undefined, onChange: () => void) {
    super(entries);
    this.onChange = onChange;
  }

  set(key: K, value: V): this {
    super.set(key, value);
    this.onChange();
    return this;
  }

  // Raw setter without triggering onChange (used during load/merge from disk)
  setRaw(key: K, value: V): this {
    super.set(key, value);
    return this;
  }

  delete(key: K): boolean {
    const res = super.delete(key);
    if (res) this.onChange();
    return res;
  }

  clear(): void {
    super.clear();
    this.onChange();
  }
}

export type DecisionStatus = 'APPROVED' | 'MANUAL_REVIEW_REQUIRED' | 'INSUFFICIENT_INFORMATION' | 'REJECTED';

export type CaseStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'INSUFFICIENT_INFORMATION'
  | 'REJECTED'
  | 'FAILED'
  | 'APPROVED';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'COMPLIANCE_OFFICER' | 'TENANT_ADMIN' | 'AUDITOR';
  organization_id: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  license_type: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  case_id: string;
  organization_id: string;
  filename: string;
  file_type: 'PAYSLIP' | 'BANK_STATEMENT' | 'TAX_DECLARATION' | 'AUDITED_FINANCIALS' | 'LEGAL_DEED' | 'EMPLOYMENT_LETTER' | 'EPF_STATEMENT' | 'INVESTMENT_STATEMENT' | 'SALE_AGREEMENT' | 'OTHER';
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  url: string;
  storage_path?: string;
  ocr_extracted_text?: string;
  pii_redacted_text?: string;
  upload_status?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocr_status?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'OCR_NOT_CONFIGURED';
  uploaded_by?: string;
  created_at: string;
}

export interface SoWCase {
  id: string;
  case_number: string;
  organization_id: string;
  customer_name: string;
  customer_nric_passport: string;
  declared_annual_income: number;
  currency: string;
  primary_source_category: 'EMPLOYMENT' | 'BUSINESS_OWNERSHIP' | 'INVESTMENTS' | 'INHERITANCE' | 'REAL_ESTATE_SALE' | 'OTHER';
  employer_name: string;
  occupation_title: string;
  status: CaseStatus;
  overall_decision?: DecisionStatus;
  automated_decision?: DecisionStatus;
  composite_risk_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_by_user_id: string;
  assigned_officer_id?: string;
  review_notes?: string;
  override_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  case_id: string;
  organization_id: string;
  engine_used: 'NATIVE_COMPLIANCE_ENGINE' | 'GEMINI_SERVER_ENGINE' | 'N8N_LIVE_WORKFLOW';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  started_at: string;
  completed_at?: string;
  extracted_data?: Record<string, unknown>;
  rule_results?: Array<{
    rule_id: string;
    rule_name: string;
    passed: boolean;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    observed_value: string | number;
    expected_threshold: string | number;
    failure_message?: string;
  }>;
  compliance_flags?: Array<{
    flag_code: string;
    flag_title: string;
    description: string;
    risk_points_added: number;
    recommended_remediation: string;
  }>;
  ai_explanation?: string;
  error_message?: string;
}

export interface ConsentRecord {
  id: string;
  organization_id: string;
  user_id: string;
  case_id: string;
  purpose: string;
  policy_version: string;
  status: 'GRANTED' | 'REVOKED';
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// In-Memory Persistent Store
class Store {
  private _organizations: PersistentMap<string, Organization>;
  private _users: PersistentMap<string, User>;
  private _cases: PersistentMap<string, SoWCase>;
  private _documents: PersistentMap<string, DocumentRecord>;
  private _jobs: PersistentMap<string, ProcessingJob>;
  private _auditBlocks: AuditBlock[] = [];
  private _consents: PersistentMap<string, ConsentRecord>;

  private isLoadingState = false;
  private lastLoadedMtimeMs = 0;
  private lastSavedMtimeMs = 0;

  constructor() {
    const onChange = () => {
      if (!this.isLoadingState) {
        this.saveState();
      }
    };

    this._organizations = new PersistentMap(null, onChange);
    this._users = new PersistentMap(null, onChange);
    this._cases = new PersistentMap(null, onChange);
    this._documents = new PersistentMap(null, onChange);
    this._jobs = new PersistentMap(null, onChange);
    this._consents = new PersistentMap(null, onChange);

    this.loadState(true);
  }

  get organizations() { this.syncFromDisk(); return this._organizations; }
  get users() { this.syncFromDisk(); return this._users; }
  get cases() { this.syncFromDisk(); return this._cases; }
  get documents() { this.syncFromDisk(); return this._documents; }
  get jobs() { this.syncFromDisk(); return this._jobs; }
  get auditBlocks() { this.syncFromDisk(); return this._auditBlocks; }
  get consents() { this.syncFromDisk(); return this._consents; }

  set organizations(val) { this._organizations = val; this.saveState(); }
  set users(val) { this._users = val; this.saveState(); }
  set cases(val) { this._cases = val; this.saveState(); }
  set documents(val) { this._documents = val; this.saveState(); }
  set jobs(val) { this._jobs = val; this.saveState(); }
  set auditBlocks(val) { this._auditBlocks = val; this.saveState(); }
  set consents(val) { this._consents = val; this.saveState(); }

  private getFilePath(): string {
    return path.join(process.cwd(), 'luxera_db.json');
  }

  /**
   * Synchronizes in-memory state with disk only if the disk file has been updated externally
   */
  public syncFromDisk(force = false) {
    if (this.isLoadingState) return;
    const filePath = this.getFilePath();
    try {
      if (!fs.existsSync(filePath)) {
        if (this._cases.size === 0 && this._organizations.size === 0) {
          this.seedDefaults();
          this.saveState();
        }
        return;
      }

      const stat = fs.statSync(filePath);
      // If disk timestamp is newer than our last read/write timestamp, reload and merge
      if (force || stat.mtimeMs > Math.max(this.lastLoadedMtimeMs, this.lastSavedMtimeMs)) {
        this.loadState(force);
      }
    } catch (err) {
      console.error('[DBStore] Error during syncFromDisk check:', err);
    }
  }

  public loadState(force = false) {
    if (this.isLoadingState) return;
    this.isLoadingState = true;
    const filePath = this.getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const data = fs.readFileSync(filePath, 'utf-8');
        if (data && data.trim().length > 0) {
          const parsed = JSON.parse(data);
          
          this._mergeMap(this._organizations, parsed.organizations);
          this._mergeMap(this._users, parsed.users);
          this._mergeMap(this._cases, parsed.cases);
          this._mergeMap(this._documents, parsed.documents);
          this._mergeMap(this._jobs, parsed.jobs);
          this._mergeAuditBlocks(parsed.auditBlocks);
          this._mergeMap(this._consents, parsed.consents);

          if (this._organizations.size === 0 || this._users.size === 0) {
            this.seedDefaults();
          }

          this.lastLoadedMtimeMs = stat.mtimeMs;
        }
      } else {
        this.seedDefaults();
        this.isLoadingState = false;
        this.saveState();
        this.isLoadingState = true;
      }
    } catch (err) {
      console.error('[DBStore] Failed to load persistent state, attempting backup recovery:', err);
      const bakPath = `${filePath}.bak`;
      if (fs.existsSync(bakPath)) {
        try {
          const bakData = fs.readFileSync(bakPath, 'utf-8');
          const parsed = JSON.parse(bakData);
          this._mergeMap(this._organizations, parsed.organizations);
          this._mergeMap(this._users, parsed.users);
          this._mergeMap(this._cases, parsed.cases);
          this._mergeMap(this._documents, parsed.documents);
          this._mergeMap(this._jobs, parsed.jobs);
          this._mergeAuditBlocks(parsed.auditBlocks);
          this._mergeMap(this._consents, parsed.consents);

          if (this._organizations.size === 0 || this._users.size === 0) {
            this.seedDefaults();
          }
        } catch (bakErr) {
          console.error('[DBStore] Backup load also failed:', bakErr);
        }
      }
    } finally {
      this.isLoadingState = false;
    }
  }

  public saveState() {
    if (this.isLoadingState) return;
    const filePath = this.getFilePath();
    try {
      const serialized = {
        organizations: Array.from(this._organizations.entries()),
        users: Array.from(this._users.entries()),
        cases: Array.from(this._cases.entries()),
        documents: Array.from(this._documents.entries()),
        jobs: Array.from(this._jobs.entries()),
        auditBlocks: this._auditBlocks,
        consents: Array.from(this._consents.entries()),
      };
      
      const jsonContent = JSON.stringify(serialized, null, 2);
      
      // Atomic write via unique temporary file
      const tempPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
      fs.writeFileSync(tempPath, jsonContent, 'utf-8');
      
      // Update .bak backup before atomic replacement
      if (fs.existsSync(filePath)) {
        try {
          fs.copyFileSync(filePath, `${filePath}.bak`);
        } catch (_) {}
      }

      fs.renameSync(tempPath, filePath);

      try {
        const stat = fs.statSync(filePath);
        this.lastSavedMtimeMs = stat.mtimeMs;
        this.lastLoadedMtimeMs = stat.mtimeMs;
      } catch (_) {}
    } catch (err) {
      console.error('[DBStore] Failed to save persistent state:', err);
    }
  }

  /**
   * Non-destructive merge of records into map
   */
  private _mergeMap<K, V>(map: PersistentMap<K, V>, entries: [K, V][] | undefined) {
    if (!entries || !Array.isArray(entries)) return;
    for (const [k, v] of entries) {
      map.setRaw(k, v);
    }
  }

  /**
   * Non-destructive merge of audit blocks preserving sequence order
   */
  private _mergeAuditBlocks(incoming: AuditBlock[] | undefined) {
    if (!incoming || !Array.isArray(incoming)) return;
    const existingSeqMap = new Map<number, AuditBlock>();
    for (const b of this._auditBlocks) {
      existingSeqMap.set(b.sequence_id, b);
    }
    for (const b of incoming) {
      if (!existingSeqMap.has(b.sequence_id)) {
        existingSeqMap.set(b.sequence_id, b);
      }
    }
    this._auditBlocks = Array.from(existingSeqMap.values()).sort((a, b) => a.sequence_id - b.sequence_id);
  }

  public saveCase(sowCase: SoWCase): SoWCase {
    const activeCase = this._cases.get(sowCase.id);
    const merged: SoWCase = {
      ...(activeCase || {}),
      ...sowCase,
      updated_at: new Date().toISOString(),
    };
    this._cases.set(merged.id, merged);
    return merged;
  }

  public getCase(id: string): SoWCase | undefined {
    this.syncFromDisk();
    return this._cases.get(id);
  }

  public getAllCases(): SoWCase[] {
    this.syncFromDisk();
    return Array.from(this._cases.values());
  }

  private seedDefaults() {
    // Seed Org
    const org: Organization = {
      id: 'ORG-WAHED-01',
      name: 'Wahed Wealth Management',
      license_type: 'Islamic Capital Markets Services License',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    };
    this._organizations.setRaw(org.id, org);

    // Seed User
    const user: User = {
      id: 'USR-OFFICER-01',
      email: 'officer@wahed.com',
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA256 of 'password'
      full_name: 'Siti Aminah Compliance',
      role: 'COMPLIANCE_OFFICER',
      organization_id: org.id,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    };
    this._users.setRaw(user.id, user);

    // Seed Case 1: Real Pending Case
    const case1: SoWCase = {
      id: 'CASE-2026-001',
      case_number: 'LX-SOW-2026-8801',
      organization_id: org.id,
      customer_name: 'Ahmad Zaki Bin Osman',
      customer_nric_passport: '880312-14-5591',
      declared_annual_income: 180000,
      currency: 'MYR',
      primary_source_category: 'EMPLOYMENT',
      employer_name: 'Malayan Tech Innovations Sdn Bhd',
      occupation_title: 'Senior Solutions Architect',
      status: 'MANUAL_REVIEW_REQUIRED',
      overall_decision: 'MANUAL_REVIEW_REQUIRED',
      composite_risk_score: 25,
      risk_level: 'MEDIUM',
      created_by_user_id: user.id,
      assigned_officer_id: user.id,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    };
    this._cases.setRaw(case1.id, case1);

    // Seed Documents for Case 1
    const doc1: DocumentRecord = {
      id: 'DOC-8801-PAYSLIP',
      case_id: case1.id,
      organization_id: org.id,
      filename: 'Ahmad_Zaki_Payslip_July2026.pdf',
      file_type: 'PAYSLIP',
      file_size: 245000,
      mime_type: 'application/pdf',
      sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      url: '/documents/Ahmad_Zaki_Payslip_July2026.pdf',
      ocr_extracted_text: 'MALAYAN TECH INNOVATIONS SDN BHD\nPay Slip - July 2026\nEmployee Name: Ahmad Zaki Bin Osman\nNRIC: 880312-14-5591\nDesignation: Senior Solutions Architect\nBasic Salary: MYR 15,000.00\nNet Pay: MYR 12,450.00\nBank Account: 162234009812 (Maybank)',
      pii_redacted_text: 'MALAYAN TECH INNOVATIONS SDN BHD\nPay Slip - July 2026\nEmployee Name: Ahmad Zaki Bin Osman\nNRIC: [NRIC_REDACTED_1]\nDesignation: Senior Solutions Architect\nBasic Salary: MYR 15,000.00\nNet Pay: MYR 12,450.00\nBank Account: [ACCT_REDACTED_1] (Maybank)',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    };
    const doc2: DocumentRecord = {
      id: 'DOC-8801-BANK',
      case_id: case1.id,
      organization_id: org.id,
      filename: 'Ahmad_Zaki_Maybank_Statement_3M.pdf',
      file_type: 'BANK_STATEMENT',
      file_size: 1120000,
      mime_type: 'application/pdf',
      sha256_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      url: '/documents/Ahmad_Zaki_Maybank_Statement_3M.pdf',
      ocr_extracted_text: 'MAYBANK BERHAD - STATEMENT OF ACCOUNT\nAccount Holder: Ahmad Zaki Bin Osman\nAccount Number: 162234009812\nPeriod: May 2026 - July 2026\nTotal Credits: MYR 235,000.00\nPayroll Credits: MYR 45,000.00 (Malayan Tech Innovations)\nUnidentified Deposit: MYR 190,000.00 (Transfer ref: TRF-X992)',
      pii_redacted_text: 'MAYBANK BERHAD - STATEMENT OF ACCOUNT\nAccount Holder: Ahmad Zaki Bin Osman\nAccount Number: [ACCT_REDACTED_1]\nPeriod: May 2026 - July 2026\nTotal Credits: MYR 235,000.00\nPayroll Credits: MYR 45,000.00 (Malayan Tech Innovations)\nUnidentified Deposit: MYR 190,000.00 (Transfer ref: TRF-X992)',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    };
    this._documents.setRaw(doc1.id, doc1);
    this._documents.setRaw(doc2.id, doc2);

    // Add Genesis Audit Block
    this.addAuditBlock(
      case1.id,
      org.id,
      'CASE_CREATED',
      user.id,
      user.email,
      {
        customer_name: case1.customer_name,
        declared_income: case1.declared_annual_income,
        currency: case1.currency,
      }
    );

    this.addAuditBlock(
      case1.id,
      org.id,
      'SOW_EVALUATION_COMPLETED',
      user.id,
      user.email,
      {
        decision: 'MANUAL_REVIEW_REQUIRED',
        score: 25,
        flag: 'UNEXPLAINED_DEPOSIT_VARIANCE',
      }
    );
  }

  public addAuditBlock(
    caseId: string,
    orgId: string,
    eventType: string,
    actorId: string,
    actorEmail: string,
    payload: Record<string, unknown>
  ): AuditBlock {
    const seq = this._auditBlocks.length + 1;
    const prevHash = seq === 1 ? 'GENESIS_BLOCK_HASH_0000000000000000000000000000000000000000' : this._auditBlocks[this._auditBlocks.length - 1].block_hash;
    const timestamp = new Date().toISOString();
    const payloadHash = calculatePayloadHash(payload);
    const blockHash = calculateBlockHash(seq, prevHash, caseId, eventType, actorId, timestamp, payloadHash);

    const block: AuditBlock = {
      sequence_id: seq,
      case_id: caseId,
      organization_id: orgId,
      event_type: eventType,
      actor_id: actorId,
      actor_email: actorEmail,
      previous_block_hash: prevHash,
      payload_hash: payloadHash,
      payload,
      timestamp,
      block_hash: blockHash,
    };

    this._auditBlocks.push(block);
    this.saveState();
    return block;
  }
}

// Global Store Instance
export const dbStore = new Store();
