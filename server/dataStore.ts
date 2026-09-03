import fs from 'fs';
import path from 'path';
import { BuyerRecord, ClassifiedEmailRecord, SendLogEntry, AppSettings, DatabaseStats, CampaignReport } from '../src/types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const BUYERS_FILE = path.join(DATA_DIR, 'buyers.csv');
const BUSINESS_FILE = path.join(DATA_DIR, 'business_emails.csv');
const INDIVIDUAL_FILE = path.join(DATA_DIR, 'individual_emails.csv');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent_log.csv');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// In-memory campaign report holder for fast access and downloads
let latestCampaignReport: CampaignReport | null = null;

export function getLatestReport(): CampaignReport | null {
  return latestCampaignReport;
}

export function setLatestReport(report: CampaignReport) {
  latestCampaignReport = report;
}

// Helper to parse CSV lines with quoted string support
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h.trim()] = (values[idx] || '').trim();
    });
    records.push(record);
  }
  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function escapeCSVField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Read Buyers
export function readBuyers(): BuyerRecord[] {
  if (!fs.existsSync(BUYERS_FILE)) return [];
  const content = fs.readFileSync(BUYERS_FILE, 'utf-8');
  const rows = parseCSV(content);

  return rows.map(r => ({
    email: r.email || r.email_address || '',
    buyer_name: r.buyer_name || 'Valued Buyer',
    company_name: r.company_name || 'Wellness Studio',
    website: r.website || '',
    country: r.country || 'International',
    source_platform: (r.source_platform as any) || 'Other',
    category: (r.category as any) || 'unclassified',
    discovered_date: r.discovered_date || new Date().toISOString(),
    status: (r.status as any) || 'valid',
    notes: r.notes || '',
    ai_confidence: r.ai_confidence ? parseFloat(r.ai_confidence) : undefined,
    ai_reasoning: r.ai_reasoning || ''
  })).filter(b => b.email.length > 0);
}

// Write Buyers
export function writeBuyers(buyers: BuyerRecord[]): void {
  const headers = ['email', 'buyer_name', 'company_name', 'website', 'country', 'source_platform', 'category', 'discovered_date', 'status', 'ai_confidence', 'ai_reasoning'];
  const lines = [headers.join(',')];

  buyers.forEach(b => {
    lines.push([
      escapeCSVField(b.email),
      escapeCSVField(b.buyer_name),
      escapeCSVField(b.company_name),
      escapeCSVField(b.website),
      escapeCSVField(b.country),
      escapeCSVField(b.source_platform),
      escapeCSVField(b.category),
      escapeCSVField(b.discovered_date),
      escapeCSVField(b.status),
      escapeCSVField(b.ai_confidence ?? ''),
      escapeCSVField(b.ai_reasoning ?? '')
    ].join(','));
  });

  fs.writeFileSync(BUYERS_FILE, lines.join('\n'), 'utf-8');
}

// Read Business Emails
export function readBusinessEmails(): ClassifiedEmailRecord[] {
  if (!fs.existsSync(BUSINESS_FILE)) return [];
  const content = fs.readFileSync(BUSINESS_FILE, 'utf-8');
  const rows = parseCSV(content);
  return rows.map(r => ({
    email: r.email || r.email_address || '',
    buyer_name: r.buyer_name || '',
    company_name: r.company_name || '',
    website: r.website || '',
    country: r.country || '',
    source_platform: (r.source_platform as any) || 'Other',
    category: 'business' as const,
    ai_confidence: parseFloat(r.ai_confidence || '0.9'),
    ai_reasoning: r.ai_reasoning || 'Business classification',
    classified_at: r.classified_at || new Date().toISOString()
  })).filter(b => b.email.length > 0);
}

// Write Business Emails
export function writeBusinessEmails(records: ClassifiedEmailRecord[]): void {
  const headers = ['email', 'buyer_name', 'company_name', 'website', 'country', 'source_platform', 'ai_confidence', 'ai_reasoning', 'classified_at'];
  const lines = [headers.join(',')];
  records.forEach(r => {
    lines.push([
      escapeCSVField(r.email),
      escapeCSVField(r.buyer_name),
      escapeCSVField(r.company_name),
      escapeCSVField(r.website),
      escapeCSVField(r.country),
      escapeCSVField(r.source_platform),
      escapeCSVField(r.ai_confidence),
      escapeCSVField(r.ai_reasoning),
      escapeCSVField(r.classified_at)
    ].join(','));
  });
  fs.writeFileSync(BUSINESS_FILE, lines.join('\n'), 'utf-8');
}

// Read Individual Emails
export function readIndividualEmails(): ClassifiedEmailRecord[] {
  if (!fs.existsSync(INDIVIDUAL_FILE)) return [];
  const content = fs.readFileSync(INDIVIDUAL_FILE, 'utf-8');
  const rows = parseCSV(content);
  return rows.map(r => ({
    email: r.email || r.email_address || '',
    buyer_name: r.buyer_name || '',
    company_name: r.company_name || '',
    website: r.website || '',
    country: r.country || '',
    source_platform: (r.source_platform as any) || 'Other',
    category: 'individual' as const,
    ai_confidence: parseFloat(r.ai_confidence || '0.9'),
    ai_reasoning: r.ai_reasoning || 'Individual practitioner classification',
    classified_at: r.classified_at || new Date().toISOString()
  })).filter(b => b.email.length > 0);
}

// Write Individual Emails
export function writeIndividualEmails(records: ClassifiedEmailRecord[]): void {
  const headers = ['email', 'buyer_name', 'company_name', 'website', 'country', 'source_platform', 'ai_confidence', 'ai_reasoning', 'classified_at'];
  const lines = [headers.join(',')];
  records.forEach(r => {
    lines.push([
      escapeCSVField(r.email),
      escapeCSVField(r.buyer_name),
      escapeCSVField(r.company_name),
      escapeCSVField(r.website),
      escapeCSVField(r.country),
      escapeCSVField(r.source_platform),
      escapeCSVField(r.ai_confidence),
      escapeCSVField(r.ai_reasoning),
      escapeCSVField(r.classified_at)
    ].join(','));
  });
  fs.writeFileSync(INDIVIDUAL_FILE, lines.join('\n'), 'utf-8');
}

// Read Sent Log
export function readSentLog(): SendLogEntry[] {
  if (!fs.existsSync(SENT_LOG_FILE)) return [];
  const content = fs.readFileSync(SENT_LOG_FILE, 'utf-8');
  const rows = parseCSV(content);
  return rows.map(r => ({
    delivery_id: r.delivery_id || `del_${Date.now()}`,
    campaign_id: r.campaign_id || 'camp_default',
    email: r.email || r.email_address || '',
    buyer_name: r.buyer_name || '',
    company_name: r.company_name || '',
    subject: r.subject || '',
    status: (r.status as any) || 'sent',
    sent_at: r.sent_at || new Date().toISOString(),
    response_message: r.response_message || ''
  })).filter(s => s.email.length > 0);
}

// Append Sent Log Entry
export function appendSentLog(entry: SendLogEntry): void {
  const fileExists = fs.existsSync(SENT_LOG_FILE);
  const row = [
    escapeCSVField(entry.delivery_id),
    escapeCSVField(entry.campaign_id),
    escapeCSVField(entry.email),
    escapeCSVField(entry.buyer_name),
    escapeCSVField(entry.company_name),
    escapeCSVField(entry.subject),
    escapeCSVField(entry.status),
    escapeCSVField(entry.sent_at),
    escapeCSVField(entry.response_message ?? '')
  ].join(',');

  if (!fileExists) {
    const headers = 'delivery_id,campaign_id,email,buyer_name,company_name,subject,status,sent_at,response_message\n';
    fs.writeFileSync(SENT_LOG_FILE, headers + row + '\n', 'utf-8');
  } else {
    fs.appendFileSync(SENT_LOG_FILE, row + '\n', 'utf-8');
  }
}

// Settings
export function readSettings(): AppSettings {
  const defaultSettings: AppSettings = {
    email: process.env.GMAIL_EMAIL || 'export@singingbowls-himalaya.com',
    app_password: process.env.GMAIL_APP_PASSWORD || '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    use_ssl: false,
    cc_monitoring: '',
    delay: 2,
    daily_send_limit: parseInt(process.env.DAILY_SEND_LIMIT || '100', 10),
    search_keyword: process.env.SEARCH_KEYWORD || 'Singing Bowls',
    default_subject: 'Handcrafted Singing Bowls — Direct Export Catalog & B2B Wholesale Pricing',
    default_body: 'Dear {buyer_name},\n\nI hope this email finds you well at {company_name}.\n\nWe are premier Himalayan exporters of authentic hand-hammered 7-metal Singing Bowls, Meditation Chimes, and Quartz Crystal Bowls crafted by master artisans in Nepal & India.\n\nHaving noticed your esteemed presence in {country}\'s sound wellness and meditation space, we would love to share our latest 2026 Wholesale Export Catalog (attached) featuring exclusive B2B wholesale rates, sound-frequency testing certifications, and custom branding.\n\nPlease find the company presentation attached. Would you have 5 minutes next week for a brief conversation on sampling?\n\nWarm regards,\nExport Sales Team\nHimalayan Singing Bowls Export House',
    presentation_path: process.env.PRESENTATION_PATH || 'assets/Export_API_documentation.docx.pdf',
    presentation_filename: process.env.PRESENTATION_FILENAME || 'Export_API_documentation.docx.pdf',
    auto_classify: true,
    remove_duplicates: true,
    simulation_mode: true
  };

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    return defaultSettings;
  }

  try {
    const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    return defaultSettings;
  }
}

export function writeSettings(settings: Partial<AppSettings>): AppSettings {
  const current = readSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

// Clear all buyer leads, classification files, and sent log records
export function clearAllData(): void {
  writeBuyers([]);
  writeBusinessEmails([]);
  writeIndividualEmails([]);
  const sentLogHeaders = 'delivery_id,campaign_id,email,buyer_name,company_name,subject,status,sent_at,response_message\n';
  fs.writeFileSync(SENT_LOG_FILE, sentLogHeaders, 'utf-8');
  latestCampaignReport = null;
}

// Compute Database Statistics
export function getDatabaseStats(): DatabaseStats {
  const buyers = readBuyers();
  const sentLog = readSentLog();
  const business = readBusinessEmails();
  const individual = readIndividualEmails();

  const businessCount = buyers.filter(b => b.category === 'business').length;
  const individualCount = buyers.filter(b => b.category === 'individual').length;
  const unclassifiedCount = buyers.filter(b => b.category === 'unclassified').length;
  const validCount = buyers.filter(b => b.status === 'valid').length;
  const flaggedCount = buyers.filter(b => b.status === 'flagged' || b.status === 'invalid').length;

  const successfulDeliveries = sentLog.filter(s => s.status === 'sent').length;
  const failedDeliveries = sentLog.filter(s => s.status === 'failed').length;

  const getFileSize = (filePath: string) => {
    try {
      if (fs.existsSync(filePath)) {
        return Math.round(fs.statSync(filePath).size / 1024 * 10) / 10;
      }
    } catch {
      // ignore
    }
    return 0;
  };

  let lastMod = new Date().toISOString();
  try {
    if (fs.existsSync(BUYERS_FILE)) {
      lastMod = fs.statSync(BUYERS_FILE).mtime.toISOString();
    }
  } catch {
    // ignore
  }

  return {
    total_buyers: buyers.length,
    business_count: businessCount,
    individual_count: individualCount,
    unclassified_count: unclassifiedCount,
    valid_count: validCount,
    flagged_count: flaggedCount,
    total_sent: sentLog.length,
    successful_deliveries: successfulDeliveries,
    failed_deliveries: failedDeliveries,
    last_modified: lastMod,
    file_sizes: {
      buyers_csv_kb: getFileSize(BUYERS_FILE),
      sent_log_csv_kb: getFileSize(SENT_LOG_FILE),
      business_csv_kb: getFileSize(BUSINESS_FILE),
      individual_csv_kb: getFileSize(INDIVIDUAL_FILE),
      presentation_kb: getFileSize(path.resolve(process.cwd(), readSettings().presentation_path || 'assets/Export_API_documentation.docx.pdf'))
    }
  };
}
