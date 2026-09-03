import React from 'react';
import { 
  Users, 
  Building2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Search,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { DatabaseStats, SendLogEntry, BuyerRecord } from '../types.ts';
import { ActiveTab } from './Navbar.tsx';

interface DashboardViewProps {
  stats: DatabaseStats | null;
  buyers: BuyerRecord[];
  sentLogs: SendLogEntry[];
  setActiveTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  buyers,
  sentLogs,
  setActiveTab
}) => {
  const totalBuyers = stats?.total_buyers ?? buyers.length;
  const businessCount = stats?.business_count ?? buyers.filter(b => b.category === 'business').length;
  const individualCount = stats?.individual_count ?? buyers.filter(b => b.category === 'individual').length;
  const unclassifiedCount = stats?.unclassified_count ?? buyers.filter(b => b.category === 'unclassified').length;
  
  const totalSent = stats?.total_sent ?? sentLogs.length;
  const successful = stats?.successful_deliveries ?? sentLogs.filter(s => s.status === 'sent').length;
  const failed = stats?.failed_deliveries ?? sentLogs.filter(s => s.status === 'failed').length;
  const successRate = totalSent > 0 ? Math.round((successful / totalSent) * 100) : 100;

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  buyers.forEach(b => {
    platformCounts[b.source_platform] = (platformCounts[b.source_platform] || 0) + 1;
  });

  const recentSends = [...sentLogs].reverse().slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Pipeline Overview */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Singing Bowls Export Outreach Pipeline
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              End-to-end automated system for international buyer discovery across online channels, regex validation, Gemini AI classification, and targeted Gmail dispatch with company catalog attachment.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-btn-find-leads"
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/90 hover:bg-amber-400 text-white shadow-lg shadow-amber-950/40 border border-amber-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Discover Buyers</span>
            </button>
            <button
              id="dash-btn-classify"
              onClick={() => setActiveTab('classify')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xl bg-white/10 hover:bg-white/15 text-white shadow-md border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Classify ({unclassifiedCount})</span>
            </button>
            <button
              id="dash-btn-campaign"
              onClick={() => setActiveTab('send')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Progression (Section 3.1 Master Workflow) */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            5-Stage Automated Workflow Pipeline
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div 
              onClick={() => setActiveTab('search')}
              className="cursor-pointer p-3 rounded-xl backdrop-blur-md bg-amber-500/10 border border-amber-400/20 hover:bg-amber-500/15 hover:border-amber-400/40 transition-all"
            >
              <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                <span>1. Lead Discovery</span>
                <Search className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-amber-200/80 text-[11px] leading-relaxed">
                Google, LinkedIn, FB & Directories querying for Singing Bowls buyers.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('upload')}
              className="cursor-pointer p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                <span>2. Extraction & Valid</span>
                <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Syntax regex checks, domain filtering & duplicate suppression.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('classify')}
              className="cursor-pointer p-3 rounded-xl backdrop-blur-md bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/15 hover:border-indigo-400/40 transition-all"
            >
              <div className="flex items-center justify-between font-semibold text-indigo-300 mb-1">
                <span>3. AI Classification</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-indigo-200/80 text-[11px] leading-relaxed">
                Gemini AI segments into Business vs. Individual practitioners.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('send')}
              className="cursor-pointer p-3 rounded-xl backdrop-blur-md bg-emerald-500/10 border border-emerald-400/20 hover:bg-emerald-500/15 hover:border-emerald-400/40 transition-all"
            >
              <div className="flex items-center justify-between font-semibold text-emerald-300 mb-1">
                <span>4. Campaign Dispatch</span>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-emerald-200/80 text-[11px] leading-relaxed">
                Personalized Gmail SMTP dispatch with presentation attachment.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('report')}
              className="cursor-pointer p-3 rounded-xl backdrop-blur-md bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/15 hover:border-blue-400/40 transition-all"
            >
              <div className="flex items-center justify-between font-semibold text-blue-300 mb-1">
                <span>5. Reporting & Log</span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-blue-200/80 text-[11px] leading-relaxed">
                Delivery auditing, bounce tracking, and CSV export.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Buyers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalBuyers}</div>
          <p className="text-[11px] text-slate-400 mt-1">In buyers.csv dataset</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Business Segment</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{businessCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Studios & Distributors</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Solo Practitioners</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{individualCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Individual Therapists</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Emails Dispatched</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSent}</div>
          <p className="text-[11px] text-slate-400 mt-1">Total campaign sends</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Delivered (250 OK)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{successful}</div>
          <p className="text-[11px] text-slate-400 mt-1">{failed} failed/bounced</p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-lg shadow-black/10 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{successRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Delivery reliability</p>
        </div>
      </div>

      {/* Main Grid: Discovery Channels & Recent Sends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Sources & Channel Coverage */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white">Discovery Sources</h3>
              <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">5 Adapters Active</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Google Search', key: 'Google', desc: 'B2B Wholesale operators', color: 'bg-blue-500' },
                { name: 'LinkedIn', key: 'LinkedIn', desc: 'Wellness directors & buyers', color: 'bg-sky-500' },
                { name: 'Facebook Pages', key: 'Facebook', desc: 'Sound therapy groups', color: 'bg-indigo-500' },
                { name: 'Business Directories', key: 'Directory', desc: 'Trade & importer registries', color: 'bg-amber-500' },
                { name: 'Website Scraper', key: 'Website', desc: 'Direct studio contact pages', color: 'bg-emerald-500' }
              ].map(source => {
                const count = platformCounts[source.key] || 0;
                const pct = totalBuyers > 0 ? Math.round((count / totalBuyers) * 100) : 0;
                return (
                  <div key={source.key} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${source.color}`} />
                        <span>{source.name}</span>
                      </div>
                      <span className="font-semibold text-white">{count} leads</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${source.color}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{source.desc}</span>
                      <span>{pct}% of db</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            id="dash-btn-run-discovery"
            onClick={() => setActiveTab('search')}
            className="mt-4 w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-medium backdrop-blur-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
          >
            <span>Configure Search Queries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right 2 Columns: Recent Outreach Activity Table */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-white">Recent Outreach Activity</h3>
              <p className="text-xs text-slate-400">Live audit log from data/sent_log.csv</p>
            </div>
            <button
              id="dash-btn-view-all-logs"
              onClick={() => setActiveTab('report')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
            >
              View All Logs →
            </button>
          </div>

          {recentSends.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Send className="w-8 h-8 mx-auto mb-2 text-slate-500 stroke-1" />
              No outreach emails logged yet. Launch your first campaign to begin dispatching presentations.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-y border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Recipient / Studio</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSends.map(log => (
                    <tr key={log.delivery_id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{log.buyer_name || 'Contact'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{log.email}</div>
                        {log.company_name && (
                          <div className="text-[10px] text-slate-500">{log.company_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {log.status === 'sent' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Sent (250 OK)
                          </span>
                        ) : log.status === 'skipped_duplicate' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Skipped (Duplicate)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-slate-300">
                        {log.subject}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
