import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Eye, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Building2, 
  User, 
  Users,
  ChevronDown,
  Info
} from 'lucide-react';
import { BuyerRecord, AppSettings, CampaignReport } from '../types.ts';
import { ActiveTab } from './Navbar.tsx';

interface CampaignSendViewProps {
  settings: AppSettings;
  buyers: BuyerRecord[];
  onRefreshStats: () => void;
  onRefreshBuyers: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenPresentation: () => void;
}

export const CampaignSendView: React.FC<CampaignSendViewProps> = ({
  settings,
  buyers,
  onRefreshStats,
  onRefreshBuyers,
  setActiveTab,
  onOpenPresentation
}) => {
  const [audience, setAudience] = useState<'business' | 'individual' | 'all'>('business');
  const [subject, setSubject] = useState(settings.default_subject || 'Handcrafted Singing Bowls — Direct Export Catalog & B2B Wholesale Pricing');
  const [body, setBody] = useState(settings.default_body || '');
  const [attachPresentation, setAttachPresentation] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(settings.delay || 2);
  const [aiTailorContent, setAiTailorContent] = useState(false);
  const [isSimulation, setIsSimulation] = useState(settings.simulation_mode);

  // Preview state
  const [previewBuyer, setPreviewBuyer] = useState<BuyerRecord | null>(null);
  const [previewResult, setPreviewResult] = useState<{ subject: string; body: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Dispatch state
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number; latestEmail: string; statusText: string }>({
    current: 0,
    total: 0,
    latestEmail: '',
    statusText: ''
  });
  const [campaignReport, setCampaignReport] = useState<CampaignReport | null>(null);

  // Filter recipients according to audience
  const audienceBuyers = buyers.filter(b => {
    if (audience === 'business') return b.category === 'business';
    if (audience === 'individual') return b.category === 'individual';
    return true;
  });

  const insertTag = (tag: string) => {
    setBody(prev => prev + tag);
  };

  const handlePreview = async (buyerToPreview?: BuyerRecord) => {
    const target = buyerToPreview || previewBuyer || audienceBuyers[0] || buyers[0];
    if (!target) return;
    setPreviewBuyer(target);
    setIsPreviewLoading(true);
    try {
      const res = await fetch('/api/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          email: target.email,
          ai_tailor: aiTailorContent
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewResult(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in both the email subject and message body.');
      return;
    }
    if (audienceBuyers.length === 0) {
      alert('No recipients in the selected audience segment.');
      return;
    }

    setIsSending(true);
    setCampaignReport(null);
    setSendProgress({
      current: 0,
      total: audienceBuyers.length,
      latestEmail: 'Initializing dispatch queue...',
      statusText: 'Connecting to SMTP and loading presentation attachment...'
    });

    try {
      const res = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          audience,
          attach_presentation: attachPresentation,
          delay_seconds: delaySeconds,
          simulation_mode: isSimulation,
          ai_tailor_content: aiTailorContent
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch campaign.');
      }
      setCampaignReport(data);
      onRefreshStats();
      onRefreshBuyers();
    } catch (err: any) {
      alert(`Campaign failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Stage 4: Automated Gmail Sender Module (Section 5.5 & Algorithm 12.3)
              </h2>
              <p className="text-xs text-slate-400">
                Compose B2B pitch, attach company catalog, personalize tokens, and dispatch via Gmail SMTP with anti-spam throttling.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePreview()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Recipient Preview</span>
            </button>
            <button
              id="btn-launch-campaign-top"
              onClick={handleLaunchCampaign}
              disabled={isSending || audienceBuyers.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Queue...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Launch Outreach ({audienceBuyers.length} Receivers)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Composer Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Email Composition */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20 space-y-4">
          {/* Audience Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              1. Target Audience Segment (Algorithm 12.3 Step 1)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAudience('business')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-medium border backdrop-blur-md transition-all ${
                  audience === 'business'
                    ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200 font-semibold shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Business ({buyers.filter(b => b.category === 'business').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAudience('individual')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-medium border backdrop-blur-md transition-all ${
                  audience === 'individual'
                    ? 'bg-sky-500/20 border-sky-400/40 text-sky-200 font-semibold shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>Individual ({buyers.filter(b => b.category === 'individual').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAudience('all')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-medium border backdrop-blur-md transition-all ${
                  audience === 'all'
                    ? 'backdrop-blur-xl bg-white/15 border-white/25 text-white font-semibold shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>All Buyers ({buyers.length})</span>
              </button>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                2. Subject Line
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Personalized tokens allowed</span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Handcrafted Singing Bowls — Wholesale Catalog for {company_name}"
              className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md font-medium"
            />
          </div>

          {/* Personalization Token Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                3. Email Body (MIME Content)
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-400 mr-1">Insert:</span>
                {['{buyer_name}', '{company_name}', '{country}', '{website}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono backdrop-blur-md bg-white/5 hover:bg-amber-400/20 text-slate-300 hover:text-amber-200 border border-white/10 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={12}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 bg-white/5 p-3.5 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* AI Tailoring Option (Section 14 Future Improvements) */}
          <div className="p-3.5 rounded-xl backdrop-blur-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-indigo-200">
                  AI-Personalized Tailoring (Section 14)
                </span>
                <p className="text-[11px] text-indigo-300/80">
                  Gemini generates buyer-specific introductory sentences honoring their studio/country context.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiTailorContent}
                onChange={e => setAiTailorContent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Right 1 Column: Attachments & Campaign Settings */}
        <div className="lg:col-span-1 space-y-4">
          {/* Attachment Box (Section 5.6) */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20">
            <h3 className="font-semibold text-xs text-white mb-3 flex items-center space-x-1.5">
              <Paperclip className="w-3.5 h-3.5 text-amber-400" />
              <span>Presentation Attachment Module</span>
            </h3>

            <div className="p-3.5 rounded-xl backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-amber-200 text-[11px] truncate max-w-[170px]">
                  {settings.presentation_filename || 'Export_API_documentation.docx.pdf'}
                </span>
                <button
                  type="button"
                  onClick={onOpenPresentation}
                  className="text-[10px] text-amber-300 font-semibold underline hover:text-amber-100"
                >
                  Inspect PDF
                </button>
              </div>
              <p className="text-[10px] text-amber-300/80 mb-2 leading-relaxed">
                Contains authentic 7-metal planetary alloys, 432Hz tuning data, MOQ wholesale tiers, and Nepalese export certification.
              </p>

              <label className="flex items-center space-x-2 text-[11px] font-medium text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachPresentation}
                  onChange={e => setAttachPresentation(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Attach to every outbound MIME message</span>
              </label>
            </div>
          </div>

          {/* Delivery & Anti-Spam Throttling */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20 space-y-3">
            <h3 className="font-semibold text-xs text-white flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              <span>Reliability & Anti-Spam Throttling</span>
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Delay Between Sends (Seconds)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={delaySeconds}
                onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Prevents Gmail SMTP rate-limit bans (Section 5.5)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                CC Monitoring Address
              </label>
              <input
                type="email"
                readOnly
                value={settings.cc_monitoring}
                className="w-full text-xs rounded-xl border border-white/10 py-2 px-3 bg-white/5 text-slate-300 font-mono text-[10px]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Audited in CC for delivery verification
              </span>
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSimulation}
                  onChange={e => setIsSimulation(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Safe Sandbox Dispatch Mode</span>
              </label>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Simulates real SMTP network latency & logs without exhausting Gmail quotas.
              </span>
            </div>
          </div>

          {/* Launch Campaign Button */}
          <button
            id="btn-launch-campaign-sidebar"
            onClick={handleLaunchCampaign}
            disabled={isSending || audienceBuyers.length === 0}
            className="w-full py-3.5 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending ({sendProgress.current}/{sendProgress.total})...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Launch Outreach ({audienceBuyers.length} Receivers)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Sending Progress Dialog / Overlay */}
      {isSending && (
        <div className="backdrop-blur-2xl bg-slate-950/85 text-white rounded-2xl p-6 shadow-2xl border border-white/15 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Outreach Campaign in Progress</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Dispatching to {audienceBuyers.length} {audience} buyers
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-300">
              {sendProgress.current} of {sendProgress.total} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-3 border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${sendProgress.total > 0 ? (sendProgress.current / sendProgress.total) * 100 : 0}%`
              }}
            />
          </div>

          <div className="text-xs text-slate-300 font-mono backdrop-blur-md bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="truncate">{sendProgress.latestEmail || 'Dispatching packets...'}</span>
            <span className="text-[10px] text-slate-400">Delay: {delaySeconds}s</span>
          </div>
        </div>
      )}

      {/* Campaign Complete Report Modal / Card */}
      {campaignReport && (
        <div className="backdrop-blur-xl bg-emerald-500/10 rounded-2xl border border-emerald-400/30 p-6 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">
                  Outreach Campaign Completed (ID: {campaignReport.campaign_id})
                </h3>
                <p className="text-xs text-slate-400">
                  Logged in <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300">data/sent_log.csv</code> for duplicate prevention and auditing.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="/api/download-report"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-md bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition"
              >
                <span>Download Report CSV</span>
              </a>
              <button
                onClick={() => setActiveTab('report')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition"
              >
                <span>View Full Audit Log →</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10">
              <span className="text-slate-400">Total Receivers:</span>
              <div className="text-lg font-bold text-white">{campaignReport.total}</div>
            </div>
            <div className="p-3 rounded-xl backdrop-blur-md bg-emerald-500/15 border border-emerald-500/30">
              <span className="text-emerald-300 font-medium">Successfully Sent:</span>
              <div className="text-lg font-bold text-emerald-400">{campaignReport.success_count}</div>
            </div>
            <div className="p-3 rounded-xl backdrop-blur-md bg-rose-500/15 border border-rose-500/30">
              <span className="text-rose-300 font-medium">Failed Deliveries:</span>
              <div className="text-lg font-bold text-rose-400">{campaignReport.failed_count}</div>
            </div>
            <div className="p-3 rounded-xl backdrop-blur-md bg-amber-500/15 border border-amber-500/30">
              <span className="text-amber-300 font-medium">Skipped (Duplicate):</span>
              <div className="text-lg font-bold text-amber-400">{campaignReport.skipped_count}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rendered Email Preview Drawer */}
      {previewResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-2xl bg-slate-950/90 border border-white/15 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Personalized Outreach Email Preview</h4>
                <p className="text-xs text-slate-400">
                  Recipient: <span className="font-semibold text-slate-200">{previewBuyer?.buyer_name}</span> ({previewBuyer?.company_name})
                </p>
              </div>
              <button
                onClick={() => setPreviewResult(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono">
                <span className="text-slate-400">To: </span>
                <span className="text-slate-200">{previewBuyer?.email}</span>
                <br />
                <span className="text-slate-400">Subject: </span>
                <span className="font-semibold text-white">{previewResult.subject}</span>
              </div>

              <div className="backdrop-blur-md bg-white/[0.03] p-4 rounded-xl border border-white/10 text-slate-200 whitespace-pre-line leading-relaxed">
                {previewResult.body}
              </div>

              {attachPresentation && (
                <div className="p-3 rounded-xl backdrop-blur-md bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2 text-amber-200">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">
                    Attached: {settings.presentation_filename || 'Export_API_documentation.docx.pdf'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setPreviewResult(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
