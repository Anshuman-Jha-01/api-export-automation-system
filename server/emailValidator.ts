import { BuyerRecord, SendLogEntry } from '../src/types.ts';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];

const PLACEHOLDER_DOMAINS = [
  'example.com', 'test.com', 'sample.com', 'placeholder.com', 'domain.com', 'localhost', 'mysite.com'
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  isDuplicateInSentLog?: boolean;
  isDuplicateInList?: boolean;
}

export function validateEmailSyntax(email: string): { isValid: boolean; reason?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, reason: 'Email is empty or not a string' };
  }

  const clean = email.trim().toLowerCase();

  // Check length
  if (clean.length < 5 || clean.length > 254) {
    return { isValid: false, reason: 'Email length out of valid range (5-254 characters)' };
  }

  // Check for image extension trailing
  for (const ext of IMAGE_EXTENSIONS) {
    if (clean.endsWith(ext)) {
      return { isValid: false, reason: `Email ends with image extension (${ext})` };
    }
  }

  // Split into local and domain parts
  const atIndex = clean.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === clean.length - 1) {
    return { isValid: false, reason: 'Missing local part or domain part' };
  }

  const localPart = clean.slice(0, atIndex);
  const domainPart = clean.slice(atIndex + 1);

  // Algorithm 12.1 step 9: domain part length > 50
  if (domainPart.length > 50) {
    return { isValid: false, reason: `Domain part length exceeds 50 characters (${domainPart.length})` };
  }

  // Domain must contain dot
  if (!domainPart.includes('.')) {
    return { isValid: false, reason: 'Domain part must contain a top-level domain extension' };
  }

  // Placeholder check
  if (PLACEHOLDER_DOMAINS.includes(domainPart)) {
    return { isValid: false, reason: `Domain is a known placeholder (${domainPart})` };
  }

  // Regex format check
  if (!EMAIL_REGEX.test(clean)) {
    return { isValid: false, reason: 'Email does not match standard RFC email pattern' };
  }

  return { isValid: true };
}

export function validateAndEnrichLeads(
  leads: Partial<BuyerRecord>[],
  existingSentLog: SendLogEntry[] = [],
  existingBuyers: BuyerRecord[] = []
): { validLeads: BuyerRecord[]; flaggedLeads: BuyerRecord[]; duplicatesSkipped: number } {
  const sentEmails = new Set(existingSentLog.map(s => s.email.trim().toLowerCase()));
  const existingEmails = new Set(existingBuyers.map(b => b.email.trim().toLowerCase()));
  const seenInBatch = new Set<string>();

  const validLeads: BuyerRecord[] = [];
  const flaggedLeads: BuyerRecord[] = [];
  let duplicatesSkipped = 0;

  for (const lead of leads) {
    const email = (lead.email || '').trim().toLowerCase();
    const syntaxCheck = validateEmailSyntax(email);

    const buyerName = (lead.buyer_name || '').trim() || 'Valued Buyer';
    const companyName = (lead.company_name || '').trim() || 'Wellness Studio';
    const website = (lead.website || '').trim();
    const country = (lead.country || '').trim() || 'International';
    const sourcePlatform = lead.source_platform || 'Other';
    const discoveredDate = lead.discovered_date || new Date().toISOString();

    if (!syntaxCheck.isValid) {
      flaggedLeads.push({
        email: email || 'missing@unknown.com',
        buyer_name: buyerName,
        company_name: companyName,
        website,
        country,
        source_platform: sourcePlatform,
        category: lead.category || 'unclassified',
        discovered_date: discoveredDate,
        status: 'invalid',
        notes: syntaxCheck.reason || 'Invalid email syntax'
      });
      continue;
    }

    // Check duplicate in current batch
    if (seenInBatch.has(email)) {
      duplicatesSkipped++;
      continue;
    }
    seenInBatch.add(email);

    // Check duplicate in sent_log
    const alreadySent = sentEmails.has(email);
    // Check if already in database
    const alreadyInDb = existingEmails.has(email);

    const record: BuyerRecord = {
      email,
      buyer_name: buyerName,
      company_name: companyName,
      website,
      country,
      source_platform: sourcePlatform,
      category: lead.category || 'unclassified',
      discovered_date: discoveredDate,
      status: alreadySent ? 'flagged' : 'valid',
      notes: alreadySent ? 'Already contacted in previous campaign (sent_log)' : (alreadyInDb ? 'Existing buyer record' : undefined)
    };

    if (alreadySent) {
      flaggedLeads.push(record);
    } else {
      validLeads.push(record);
    }
  }

  return { validLeads, flaggedLeads, duplicatesSkipped };
}
