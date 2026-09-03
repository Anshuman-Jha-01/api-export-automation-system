import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Key, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  Server,
  FileText
} from 'lucide-react';
import { AppSettings } from '../types.ts';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onRefreshSettings: () => void;
  onOpenPresentation: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRefreshSettings,
  onOpenPresentation
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 border border-white/15 text-slate-200 flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-serif">
              System Settings & SMTP Configuration (Section 8, 9, 10)
            </h2>
            <p className="text-xs text-slate-400">
              Configure Gmail SMTP credentials, anti-throttling parameters, catalog presentation path, and Gemini AI preferences.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Credentials & Dispatch Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gmail Credentials Box (Section 9.1 & 10.4) */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-xs text-white">
                  Gmail SMTP Credentials (Section 9 & 10)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Stored in data/settings.json</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gmail Address (Sender)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.business@gmail.com"
                  className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gmail App Password (16 Characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.app_password || ''}
                    onChange={e => setFormData({ ...formData, app_password: e.target.value })}
                    placeholder="abcd efgh ijkl mnop"
                    className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[10px] text-slate-400 hover:text-slate-200 font-medium transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            {/* SMTP Server Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtp_host}
                  onChange={e => setFormData({ ...formData, smtp_host: e.target.value })}
                  className="w-full text-xs rounded-xl border border-white/10 py-2 px-3 bg-white/5 text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtp_port}
                  onChange={e => setFormData({ ...formData, smtp_port: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl border border-white/10 py-2 px-3 bg-white/5 text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Transport Security
                </label>
                <select
                  value={formData.use_ssl ? 'ssl' : 'starttls'}
                  onChange={e => setFormData({ ...formData, use_ssl: e.target.value === 'ssl' })}
                  className="w-full text-xs rounded-xl border border-white/10 py-2 px-3 bg-slate-900/90 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                >
                  <option value="starttls">Port 587 (STARTTLS)</option>
                  <option value="ssl">Port 465 (SSL Fallback)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign & Pipeline Parameters */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20 space-y-4">
            <h3 className="font-semibold text-xs text-white border-b border-white/10 pb-2">
              Run Configuration & Throttling Limits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Search Niche Keyword
                </label>
                <input
                  type="text"
                  value={formData.search_keyword}
                  onChange={e => setFormData({ ...formData, search_keyword: e.target.value })}
                  className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Send Limit
                </label>
                <input
                  type="number"
                  value={formData.daily_send_limit}
                  onChange={e => setFormData({ ...formData, daily_send_limit: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Inter-Send Delay (Sec)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.delay}
                  onChange={e => setFormData({ ...formData, delay: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                CC Monitoring Audit Address
              </label>
              <input
                type="email"
                value={formData.cc_monitoring}
                onChange={e => setFormData({ ...formData, cc_monitoring: e.target.value })}
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.simulation_mode}
                  onChange={e => setFormData({ ...formData, simulation_mode: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Safe Sandbox Mode (Simulation without real SMTP sends)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remove_duplicates}
                  onChange={e => setFormData({ ...formData, remove_duplicates: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Auto-Suppress Duplicates via sent_log.csv</span>
              </label>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-300 font-semibold backdrop-blur-md bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Configuration saved successfully!</span>
              </div>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/90 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40 border border-amber-300/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save System Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Setup Guide & Presentation Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Section 10.4 Gmail Setup Steps Callout */}
          <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-xs shadow-xl shadow-black/20">
            <div className="flex items-center space-x-2 text-amber-200 font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Section 10.4: Gmail Setup Steps</span>
            </div>
            <ol className="space-y-2 text-amber-300/90 text-[11px] leading-relaxed list-decimal list-inside">
              <li>
                Enable <strong>2-Step Verification</strong> on your sending Gmail account.
              </li>
              <li>
                Navigate to <strong>Google Account → Security → App Passwords</strong>.
              </li>
              <li>
                Generate an App Password for &quot;Mail&quot; or &quot;Singing Bowls Export System&quot;.
              </li>
              <li>
                Paste the generated <strong>16-character password</strong> into the field on the left.
              </li>
            </ol>
            <p className="text-[10px] text-amber-300/70 mt-3 pt-2 border-t border-amber-500/20">
              * Note: For safe testing without exhausting your Gmail quote, keep &quot;Safe Sandbox Mode&quot; checked.
            </p>
          </div>

          {/* Presentation Asset Box */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20 text-xs space-y-3">
            <div className="flex items-center justify-between font-semibold text-white">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Product Presentation Asset</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">PDF Attachment</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Server Asset File Path
              </label>
              <input
                type="text"
                value={formData.presentation_path || ''}
                onChange={e => setFormData({ ...formData, presentation_path: e.target.value })}
                placeholder="assets/Export_API_documentation.docx.pdf"
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Outgoing Attachment Display Name
              </label>
              <input
                type="text"
                value={formData.presentation_filename || ''}
                onChange={e => setFormData({ ...formData, presentation_filename: e.target.value })}
                placeholder="Export_API_documentation.docx.pdf"
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-md"
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenPresentation}
                className="w-full py-2.5 rounded-xl text-xs font-medium backdrop-blur-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
              >
                Inspect &amp; Download Current PDF
              </button>
            </div>
          </div>

          {/* Gemini AI Status */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-white">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Gemini AI Engine (Discovery & Classification)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Primary: <code className="font-mono font-semibold text-indigo-300">gemini-3.8-flash</code> <br />
              High-Demand Fallback: <code className="font-mono text-indigo-200">gemini-3.1-flash-lite</code>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equipped with automatic exponential backoff retry and seamless fallback to rule-based heuristics & verified catalog directory when high-demand spikes occur.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
