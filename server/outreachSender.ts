import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { generateContentWithFallback, safeParseGeminiJSON } from './geminiService.ts';
import { BuyerRecord, CampaignRequest, CampaignReport, SendLogEntry } from '../src/types.ts';
import {
  readBuyers,
  readBusinessEmails,
  readIndividualEmails,
  readSentLog,
  appendSentLog,
  readSettings,
  setLatestReport
} from './dataStore.ts';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Personalize template strings with recipient tokens
export function interpolateTemplate(
  template: string,
  buyer: { buyer_name?: string; company_name?: string; country?: string; website?: string; email?: string }
): string {
  return template
    .replace(/\{buyer_name\}/gi, buyer.buyer_name || 'Valued Partner')
    .replace(/\{name\}/gi, buyer.buyer_name || 'Valued Partner')
    .replace(/\{company_name\}/gi, buyer.company_name || 'Your Esteemed Organization')
    .replace(/\{company\}/gi, buyer.company_name || 'Your Esteemed Organization')
    .replace(/\{country\}/gi, buyer.country || 'your region')
    .replace(/\{website\}/gi, buyer.website || '')
    .replace(/\{email\}/gi, buyer.email || '');
}

// Generate tailored AI personalizations if requested
export async function tailorMessageWithGemini(
  baseSubject: string,
  baseBody: string,
  buyer: BuyerRecord
): Promise<{ subject: string; body: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      subject: interpolateTemplate(baseSubject, buyer),
      body: interpolateTemplate(baseBody, buyer)
    };
  }

  try {
    const prompt = `You are an expert international export marketing specialist for authentic Himalayan Singing Bowls and sound wellness instruments.
Personalize this outreach email for the following recipient:
Recipient Name: ${buyer.buyer_name}
Company/Studio: ${buyer.company_name}
Country: ${buyer.country}
Website: ${buyer.website}
Category: ${buyer.category}

Base Subject: ${baseSubject}
Base Body:
${baseBody}

Instructions:
1. Tailor the opening paragraph and value proposition to specifically acknowledge their work in ${buyer.country} and their organization (${buyer.company_name}).
2. Keep the core product highlights (7-metal planetary alloys, 432Hz/528Hz harmonics, wholesale export catalog attachment, sampling offer) intact.
3. Keep the tone courteous, professional, and respectful of Himalayan artisanal craft.
4. Output JSON with "subject" and "body" keys only.`;

    const resText = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json'
    });

    if (resText) {
      const parsed = safeParseGeminiJSON<{ subject?: string; body?: string }>(resText);
      if (parsed?.subject && parsed?.body) {
        return {
          subject: parsed.subject,
          body: parsed.body
        };
      }
    }
  } catch (err: any) {
    console.warn('AI tailoring fallback to standard token replacement:', err.message || err);
  }

  return {
    subject: interpolateTemplate(baseSubject, buyer),
    body: interpolateTemplate(baseBody, buyer)
  };
}

export async function executeCampaign(
  campaignReq: CampaignRequest,
  onProgress?: (event: { current: number; total: number; email: string; status: 'sent' | 'failed' | 'skipped'; error?: string }) => void
): Promise<CampaignReport> {
  const settings = readSettings();
  const allBuyers = readBuyers();
  const businessRecords = readBusinessEmails();
  const individualRecords = readIndividualEmails();
  const sentLog = readSentLog();

  const sentEmailSet = new Set(sentLog.map(s => s.email.toLowerCase().trim()));

  // Step 1: Select CSV(s) for audience
  let targetBuyers: BuyerRecord[] = [];

  if (campaignReq.selected_emails && campaignReq.selected_emails.length > 0) {
    const selectedSet = new Set(campaignReq.selected_emails.map(e => e.toLowerCase().trim()));
    targetBuyers = allBuyers.filter(b => selectedSet.has(b.email.toLowerCase().trim()));
  } else if (campaignReq.audience === 'business') {
    const busEmails = new Set(businessRecords.map(b => b.email.toLowerCase().trim()));
    targetBuyers = allBuyers.filter(b => busEmails.has(b.email.toLowerCase().trim()) || b.category === 'business');
  } else if (campaignReq.audience === 'individual') {
    const indEmails = new Set(individualRecords.map(i => i.email.toLowerCase().trim()));
    targetBuyers = allBuyers.filter(b => indEmails.has(b.email.toLowerCase().trim()) || b.category === 'individual');
  } else {
    targetBuyers = [...allBuyers];
  }

  // Deduplicate target recipients by email
  const uniqueBuyersMap = new Map<string, BuyerRecord>();
  targetBuyers.forEach(b => {
    const email = b.email.toLowerCase().trim();
    if (email && !uniqueBuyersMap.has(email)) {
      uniqueBuyersMap.set(email, b);
    }
  });

  const uniqueBuyers = Array.from(uniqueBuyersMap.values());
  const campaignId = `camp_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const report: CampaignReport = {
    campaign_id: campaignId,
    timestamp,
    total: uniqueBuyers.length,
    success_count: 0,
    failed_count: 0,
    skipped_count: 0,
    audience: campaignReq.audience,
    successful: [],
    failed: [],
    skipped: []
  };

  if (uniqueBuyers.length === 0) {
    setLatestReport(report);
    return report;
  }

  // Step 4: Check presentation attachment
  let attachmentObj: { filename: string; path: string } | null = null;
  if (campaignReq.attach_presentation) {
    let presentationPath = path.resolve(process.cwd(), settings.presentation_path || 'assets/Export_API_documentation.docx.pdf');
    if (!fs.existsSync(presentationPath)) {
      const fallbackA = path.resolve(process.cwd(), 'assets/Export_API_documentation.docx.pdf');
      if (fs.existsSync(fallbackA)) presentationPath = fallbackA;
    }

    if (fs.existsSync(presentationPath)) {
      attachmentObj = {
        filename: settings.presentation_filename || path.basename(presentationPath),
        path: presentationPath
      };
    } else {
      console.warn('Presentation file not found at:', presentationPath);
    }
  }

  // Determine dispatch mode: Live SMTP or Smart Simulation
  const isSimulation = campaignReq.simulation_mode ?? (settings.simulation_mode || !settings.app_password || settings.app_password.trim() === '');
  const delaySec = campaignReq.delay_seconds ?? (settings.delay || 2);

  let transporter: nodemailer.Transporter | null = null;

  if (!isSimulation && settings.email && settings.app_password) {
    transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: settings.smtp_port || 587,
      secure: settings.use_ssl || false,
      auth: {
        user: settings.email,
        pass: settings.app_password.replace(/\s+/g, '') // remove spaces from Gmail app password
      }
    });
  }

  // Step 6: Loop through receivers
  for (let i = 0; i < uniqueBuyers.length; i++) {
    const buyer = uniqueBuyers[i];
    const email = buyer.email.toLowerCase().trim();

    // Duplicate prevention check (Section 5.3 & Algorithm 12.3)
    if (settings.remove_duplicates && sentEmailSet.has(email)) {
      report.skipped_count++;
      report.skipped.push({ email, reason: 'Already contacted previously in sent_log' });

      appendSentLog({
        delivery_id: `del_${Date.now()}_${i}`,
        campaign_id: campaignId,
        email,
        buyer_name: buyer.buyer_name,
        company_name: buyer.company_name,
        subject: campaignReq.subject,
        status: 'skipped_duplicate',
        sent_at: new Date().toISOString(),
        response_message: 'Skipped: Duplicate contact already in sent_log'
      });

      if (onProgress) {
        onProgress({ current: i + 1, total: uniqueBuyers.length, email, status: 'skipped', error: 'Duplicate contact' });
      }
      continue;
    }

    // Compose message
    let finalSubject = interpolateTemplate(campaignReq.subject, buyer);
    let finalBody = interpolateTemplate(campaignReq.body, buyer);

    if (campaignReq.ai_tailor_content) {
      try {
        const tailored = await tailorMessageWithGemini(campaignReq.subject, campaignReq.body, buyer);
        finalSubject = tailored.subject;
        finalBody = tailored.body;
      } catch (err) {
        // use standard
      }
    }

    const deliveryId = `del_${Date.now()}_${i}`;

    try {
      if (!isSimulation && transporter) {
        // Send real SMTP message
        const mailOptions: nodemailer.SendMailOptions = {
          from: `"${settings.email.split('@')[0]}" <${settings.email}>`,
          to: email,
          cc: settings.cc_monitoring || undefined,
          subject: finalSubject,
          text: finalBody,
          attachments: attachmentObj ? [attachmentObj] : undefined
        };

        const info = await transporter.sendMail(mailOptions);

        report.success_count++;
        report.successful.push({
          email,
          name: buyer.buyer_name,
          company: buyer.company_name,
          timestamp: new Date().toISOString()
        });

        appendSentLog({
          delivery_id: deliveryId,
          campaign_id: campaignId,
          email,
          buyer_name: buyer.buyer_name,
          company_name: buyer.company_name,
          subject: finalSubject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          response_message: `250 OK: ${info.messageId}`
        });

        sentEmailSet.add(email);
        if (onProgress) {
          onProgress({ current: i + 1, total: uniqueBuyers.length, email, status: 'sent' });
        }
      } else {
        // Realistic simulation mode (e.g. preview, demonstration, or sandbox)
        // Simulate SMTP network roundtrip
        await sleep(Math.max(100, Math.min(delaySec * 800, 1500)));

        report.success_count++;
        report.successful.push({
          email,
          name: buyer.buyer_name,
          company: buyer.company_name,
          timestamp: new Date().toISOString()
        });

        appendSentLog({
          delivery_id: deliveryId,
          campaign_id: campaignId,
          email,
          buyer_name: buyer.buyer_name,
          company_name: buyer.company_name,
          subject: finalSubject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          response_message: `250 2.0.0 OK (Simulated SMTP Dispatch - Attachment: ${attachmentObj ? attachmentObj.filename : 'None'})`
        });

        sentEmailSet.add(email);
        if (onProgress) {
          onProgress({ current: i + 1, total: uniqueBuyers.length, email, status: 'sent' });
        }
      }

      // Delay between sends to prevent throttling
      if (i < uniqueBuyers.length - 1 && delaySec > 0) {
        await sleep(Math.min(delaySec * 1000, 5000));
      }
    } catch (sendErr: any) {
      console.error(`Send error for recipient ${email}:`, sendErr.message);

      report.failed_count++;
      report.failed.push({
        email,
        name: buyer.buyer_name,
        company: buyer.company_name,
        error: sendErr.message || 'SMTP delivery failure',
        timestamp: new Date().toISOString()
      });

      appendSentLog({
        delivery_id: deliveryId,
        campaign_id: campaignId,
        email,
        buyer_name: buyer.buyer_name,
        company_name: buyer.company_name,
        subject: finalSubject,
        status: 'failed',
        sent_at: new Date().toISOString(),
        response_message: `SMTP Error: ${sendErr.message}`
      });

      if (onProgress) {
        onProgress({ current: i + 1, total: uniqueBuyers.length, email, status: 'failed', error: sendErr.message });
      }
    }
  }

  setLatestReport(report);
  return report;
}
