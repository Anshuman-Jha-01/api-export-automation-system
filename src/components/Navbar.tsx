import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  UploadCloud, 
  Sparkles, 
  Send, 
  FileSpreadsheet, 
  Settings, 
  FileText
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'search' | 'upload' | 'classify' | 'send' | 'report' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unclassifiedCount: number;
  totalBuyers: number;
  simulationMode: boolean;
  onOpenPresentation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unclassifiedCount,
  totalBuyers,
  simulationMode,
  onOpenPresentation
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Buyer Search', icon: Search },
    { id: 'upload', label: 'Upload CSV', icon: UploadCloud },
    { id: 'classify', label: 'AI Classification', icon: Sparkles, badge: unclassifiedCount > 0 ? unclassifiedCount : undefined },
    { id: 'send', label: 'Send Campaign', icon: Send, badge: totalBuyers > 0 ? totalBuyers : undefined },
    { id: 'report', label: 'Reports & Logs', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="backdrop-blur-2xl bg-slate-950/60 text-slate-100 border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Target Product Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-serif font-bold text-xl tracking-tight border border-white/15">
              ॐ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-tight text-white">API 3 — Export Automation</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/15 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                  Singing Bowls Niche
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Source Discovery & Automated Gmail Outreach</p>
            </div>
          </div>

          {/* Quick Actions / Catalog Trigger */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="btn-view-presentation"
              onClick={onOpenPresentation}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 shadow-sm transition"
              title="View & download the Singing Bowls Export Catalog attachment"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Catalog PDF</span>
            </button>

            {simulationMode ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                Safe Sandbox Mode
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                Live SMTP Active
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto py-1.5 border-t border-white/5 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'backdrop-blur-xl bg-white/15 border border-white/20 text-white font-semibold shadow-md shadow-black/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
