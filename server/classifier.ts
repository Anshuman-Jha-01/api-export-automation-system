import { BuyerRecord, ClassifiedEmailRecord } from '../src/types.ts';
import { generateContentWithFallback, safeParseGeminiJSON } from './geminiService.ts';
import {
  readBuyers,
  writeBuyers,
  readBusinessEmails,
  writeBusinessEmails,
  readIndividualEmails,
  writeIndividualEmails
} from './dataStore.ts';

export interface ClassificationResult {
  email: string;
  category: 'business' | 'individual';
  confidence: number;
  reasoning: string;
}

export async function classifyBatchWithGemini(leads: BuyerRecord[]): Promise<ClassificationResult[]> {
  if (leads.length === 0) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback heuristic classifier when API key is missing
    return leads.map(heuristicClassify);
  }

  try {
    const payload = leads.map(l => ({
      email: l.email,
      name: l.buyer_name,
      company: l.company_name,
      website: l.website,
      country: l.country
    }));

    const prompt = `You are the AI Email Classification Module for a Singing Bowls export marketing pipeline.
Given this batch of prospective buyer records, classify each record as either "business" (e.g., sound bath studio, yoga center, wholesale distributor, retail store, meditation academy, spa) or "individual" (e.g., solo acoustic practitioner, independent yoga teacher, private collector, personal enthusiast).

Input records:
${JSON.stringify(payload, null, 2)}

Return a JSON array of objects with this exact structure:
[
  {
    "email": "string",
    "category": "business" | "individual",
    "confidence": number between 0.0 and 1.0,
    "reasoning": "concise explanation of why this was classified as business or individual"
  }
]
Output ONLY valid JSON.`;

    const responseText = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json'
    });

    if (responseText) {
      const parsed = safeParseGeminiJSON<any[]>(responseText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          email: item.email?.toLowerCase().trim() || '',
          category: item.category === 'business' ? 'business' : 'individual',
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.9,
          reasoning: item.reasoning || 'Classified via Gemini AI'
        }));
      }
    }
    return leads.map(heuristicClassify);
  } catch (err: any) {
    console.warn('Gemini classification fallback to heuristics:', err.message || err);
    return leads.map(heuristicClassify);
  }
}

function heuristicClassify(lead: BuyerRecord): ClassificationResult {
  const email = lead.email.toLowerCase();
  const domain = email.split('@')[1] || '';
  const localPart = email.split('@')[0] || '';
  const company = (lead.company_name || '').toLowerCase();

  const businessRoles = ['info', 'contact', 'wholesale', 'sales', 'support', 'orders', 'purchasing', 'import', 'b2b', 'office', 'admin', 'inquiries'];
  const personalProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com'];

  const isRoleBased = businessRoles.some(role => localPart === role || localPart.startsWith(role + '.') || localPart.startsWith(role + '_'));
  const isPersonalDomain = personalProviders.includes(domain);
  const hasCompanyKeyword = ['studio', 'academy', 'ltd', 'inc', 'llc', 'center', 'shop', 'imports', 'wholesale', 'sanctuary', 'co', 'gmbh', 'store', 'corp', 'hub'].some(k => company.includes(k));

  if (isRoleBased || (!isPersonalDomain && domain.length > 0) || hasCompanyKeyword) {
    return {
      email: lead.email,
      category: 'business',
      confidence: isRoleBased && !isPersonalDomain ? 0.96 : 0.88,
      reasoning: isRoleBased
        ? `Handle "${localPart}@" suggests corporate department at ${domain || 'company'}`
        : `Custom domain ${domain} and company name "${lead.company_name}" indicates a registered enterprise`
    };
  }

  return {
    email: lead.email,
    category: 'individual',
    confidence: 0.85,
    reasoning: `Webmail provider ${domain} and personal contact name suggests independent practitioner or enthusiast`
  };
}

// Execute full classification pipeline on all unclassified or requested buyers
export async function runClassificationPipeline(targetEmails?: string[]): Promise<{
  classifiedCount: number;
  businessCount: number;
  individualCount: number;
  results: ClassificationResult[];
}> {
  const allBuyers = readBuyers();
  const targetBuyers = targetEmails && targetEmails.length > 0
    ? allBuyers.filter(b => targetEmails.includes(b.email.toLowerCase()))
    : allBuyers.filter(b => b.category === 'unclassified' || !b.category);

  if (targetBuyers.length === 0) {
    return {
      classifiedCount: 0,
      businessCount: 0,
      individualCount: 0,
      results: []
    };
  }

  // Algorithm 12.2 step 2: split emails into manageable batches (e.g. 10 at a time)
  const batchSize = 10;
  const results: ClassificationResult[] = [];

  for (let i = 0; i < targetBuyers.length; i += batchSize) {
    const batch = targetBuyers.slice(i, i + batchSize);
    const batchResults = await classifyBatchWithGemini(batch);
    results.push(...batchResults);
  }

  // Update in buyers.csv
  const resultMap = new Map(results.map(r => [r.email.toLowerCase(), r]));
  const updatedBuyers = allBuyers.map(b => {
    const res = resultMap.get(b.email.toLowerCase());
    if (res) {
      return {
        ...b,
        category: res.category,
        ai_confidence: res.confidence,
        ai_reasoning: res.reasoning
      };
    }
    return b;
  });
  writeBuyers(updatedBuyers);

  // Algorithm 12.2 step 6 & 7: append to business_emails.csv and individual_emails.csv
  const currentBusiness = readBusinessEmails();
  const currentIndividual = readIndividualEmails();

  const businessMap = new Map(currentBusiness.map(b => [b.email.toLowerCase(), b]));
  const individualMap = new Map(currentIndividual.map(i => [i.email.toLowerCase(), i]));

  let newBusinessCount = 0;
  let newIndividualCount = 0;

  for (const res of results) {
    const buyer = updatedBuyers.find(b => b.email.toLowerCase() === res.email);
    if (!buyer) continue;

    const classifiedRecord: ClassifiedEmailRecord = {
      email: buyer.email,
      buyer_name: buyer.buyer_name,
      company_name: buyer.company_name,
      website: buyer.website,
      country: buyer.country,
      source_platform: buyer.source_platform,
      category: res.category,
      ai_confidence: res.confidence,
      ai_reasoning: res.reasoning,
      classified_at: new Date().toISOString()
    };

    if (res.category === 'business') {
      businessMap.set(buyer.email.toLowerCase(), classifiedRecord);
      newBusinessCount++;
    } else {
      individualMap.set(buyer.email.toLowerCase(), classifiedRecord);
      newIndividualCount++;
    }
  }

  writeBusinessEmails(Array.from(businessMap.values()));
  writeIndividualEmails(Array.from(individualMap.values()));

  return {
    classifiedCount: results.length,
    businessCount: newBusinessCount,
    individualCount: newIndividualCount,
    results
  };
}
