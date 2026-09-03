import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { SearchDiscoveryView } from './components/SearchDiscoveryView.tsx';
import { UploadView } from './components/UploadView.tsx';
import { ClassificationView } from './components/ClassificationView.tsx';
import { CampaignSendView } from './components/CampaignSendView.tsx';
import { ReportView } from './components/ReportView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PresentationModal } from './components/PresentationModal.tsx';
import { BuyerRecord, DatabaseStats, SendLogEntry, AppSettings, CampaignReport } from './types.ts';

export default function App() {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [sentLogs, setSentLogs] = useState<SendLogEntry[]>([]);
  const [latestReport, setLatestReport] = useState<CampaignReport | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState<AppSettings>({
    email: 'export@singingbowls-himalaya.com',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    use_ssl: false,
    cc_monitoring: 'audit-log@singingbowls-export.com',
    delay: 2,
    daily_send_limit: 100,
    search_keyword: 'Singing Bowls',
    default_subject: 'Handcrafted Singing Bowls — Direct Export Catalog & B2B Wholesale Pricing',
    default_body: 'Dear {buyer_name},\n\nI hope this message finds you well at {company_name}.\n\nWe are premier Himalayan exporters of authentic hand-hammered 7-metal Singing Bowls, Healing Gong Sets, and 432Hz Quartz Crystal Bowls crafted by master artisan lineages in the Kathmandu Valley and northern India.\n\nHaving noticed your esteemed presence in {country}\'s sound wellness and meditation space, we would love to share our latest 2026 Wholesale Export Catalog (attached) featuring exclusive B2B wholesale rates, sound-frequency testing certifications, and custom branding.\n\nPlease find the company presentation attached. Would you have 5 minutes next week for a brief conversation on sampling?\n\nWarm regards,\nExport Sales Team\nHimalayan Singing Bowls Export House',
    presentation_path: 'assets/Export_API_documentation.docx.pdf',
    presentation_filename: 'Export_API_documentation.docx.pdf',
    auto_classify: true,
    remove_duplicates: true,
    simulation_mode: true
  });

  // Hash-based route synchronization (Section 8)
  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    window.location.hash = tab === 'dashboard' ? '' : tab;
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const validTabs: ActiveTab[] = ['dashboard', 'search', 'upload', 'classify', 'send', 'report', 'settings'];
      if (validTabs.includes(hash as ActiveTab)) {
        setActiveTabState(hash as ActiveTab);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch data
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchBuyers = useCallback(async () => {
    try {
      const res = await fetch('/api/buyers');
      if (res.ok) {
        const data = await res.json();
        setBuyers(data);
      }
    } catch (err) {
      console.error('Failed to load buyers:', err);
    }
  }, []);

  const fetchSentLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/sent-log');
      if (res.ok) {
        const data = await res.json();
        setSentLogs(data);
      }
    } catch (err) {
      console.error('Failed to load sent logs:', err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch('/api/report');
      if (res.ok) {
        const data = await res.json();
        setLatestReport(data.latestReport);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchBuyers(),
      fetchSentLogs(),
      fetchSettings(),
      fetchReport()
    ]);
    setIsLoading(false);
  }, [fetchStats, fetchBuyers, fetchSentLogs, fetchSettings, fetchReport]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddLeads = async (newLeads: BuyerRecord[]) => {
    for (const lead of newLeads) {
      await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    }
    await Promise.all([fetchBuyers(), fetchStats()]);
  };

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
    }
  };

  const unclassifiedCount = buyers.filter(b => !b.category || b.category === 'unclassified').length;
  const existingBuyerEmails = new Set(buyers.map(b => b.email.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient Frosted Glass Glow Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[420px] h-[420px] bg-purple-600/25 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[520px] h-[520px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-[25%] right-[8%] w-[320px] h-[320px] bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="fixed bottom-[30%] left-[5%] w-[320px] h-[320px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Content Workspace Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unclassifiedCount={unclassifiedCount}
          totalBuyers={buyers.length}
          simulationMode={settings.simulation_mode}
          onOpenPresentation={() => setIsPresentationOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              buyers={buyers}
              sentLogs={sentLogs}
              setActiveTab={setActiveTab}
              onRefresh={loadAll}
            />
          )}

          {activeTab === 'search' && (
            <SearchDiscoveryView
              onAddLeads={handleAddLeads}
              existingBuyerEmails={existingBuyerEmails}
              onRefresh={loadAll}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              stats={stats}
              onRefreshStats={fetchStats}
              onRefreshBuyers={fetchBuyers}
            />
          )}

          {activeTab === 'classify' && (
            <ClassificationView
              buyers={buyers}
              stats={stats}
              onRefreshBuyers={fetchBuyers}
              onRefreshStats={fetchStats}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'send' && (
            <CampaignSendView
              settings={settings}
              buyers={buyers}
              onRefreshStats={fetchStats}
              onRefreshBuyers={fetchBuyers}
              setActiveTab={setActiveTab}
              onOpenPresentation={() => setIsPresentationOpen(true)}
            />
          )}

          {activeTab === 'report' && (
            <ReportView
              sentLogs={sentLogs}
              latestReport={latestReport}
              onRefresh={() => {
                fetchSentLogs();
                fetchReport();
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRefreshSettings={fetchSettings}
              onOpenPresentation={() => setIsPresentationOpen(true)}
            />
          )}
        </main>

        {/* Presentation Asset Modal */}
        <PresentationModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          settings={settings}
        />

        {/* Footer */}
        <footer className="backdrop-blur-xl bg-slate-950/40 border-t border-white/10 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-200">API 3 — EXPORT Automation System</span>
              <span className="text-white/20">•</span>
              <span className="text-slate-400">Himalayan Singing Bowls B2B Pipeline</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span>Storage: Flat-file CSV / JSON</span>
              <span>Transport: Gmail SMTP (STARTTLS 587)</span>
              <span>AI: Gemini 3.8 Flash</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
