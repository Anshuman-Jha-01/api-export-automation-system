import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Search, 
  RefreshCw,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { SendLogEntry, CampaignReport } from '../types.ts';

interface ReportViewProps {
  sentLogs: SendLogEntry[];
  latestReport: CampaignReport | null;
  onRefresh: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  sentLogs,
  latestReport,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed' | 'skipped_duplicate'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalLogged = sentLogs.length;
  const sentCount = sentLogs.filter(s => s.status === 'sent').length;
  const failedCount = sentLogs.filter(s => s.status === 'failed').length;
  const skippedCount = sentLogs.filter(s => s.status === 'skipped_duplicate').length;
  const successRate = totalLogged > 0 ? Math.round((sentCount / totalLogged) * 100) : 100;

  const filteredLogs = sentLogs.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.email.toLowerCase().includes(q) ||
        log.buyer_name.toLowerCase().includes(q) ||
        log.company_name.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Stage 5: Reporting, Delivery Auditing & Analytics (Section 8)
              </h2>
              <p className="text-xs text-slate-400">
                Persistent log of every discovery, validation, and send event in <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-slate-300">sent_log.csv</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
              <span>Refresh Log</span>
            </button>
            <a
              id="btn-download-campaign-report"
              href="/api/download-report"
              download="outreach_campaign_report.csv"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Stream Report CSV (/download-report)</span>
            </a>
          </div>
        </div>

        {/* Aggregate KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-xs">
            <span className="text-slate-400">Total Attempts</span>
            <div className="text-xl font-bold text-white mt-1">{totalLogged}</div>
            <span className="text-[10px] text-slate-400">All campaign logs</span>
          </div>

          <div className="p-3.5 rounded-xl backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-emerald-300 font-medium">Delivered (250 OK)</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{sentCount}</div>
            <span className="text-[10px] text-emerald-400 font-medium">Active recipients</span>
          </div>

          <div className="p-3.5 rounded-xl backdrop-blur-md bg-rose-500/10 border border-rose-500/20 text-xs">
            <span className="text-rose-300 font-medium">Failed / Bounced</span>
            <div className="text-xl font-bold text-rose-400 mt-1">{failedCount}</div>
            <span className="text-[10px] text-rose-400">SMTP drop or reject</span>
          </div>

          <div className="p-3.5 rounded-xl backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="text-amber-300 font-medium">Duplicate Skipped</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{skippedCount}</div>
            <span className="text-[10px] text-amber-400">Cross-reference guard</span>
          </div>

          <div className="p-3.5 rounded-xl backdrop-blur-md bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <span className="text-indigo-300 font-medium">Computed Rate</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">{successRate}%</div>
            <span className="text-[10px] text-indigo-400">Delivery reliability</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-300">Status Filter:</span>
            {(['all', 'sent', 'failed', 'skipped_duplicate'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs capitalize transition-all ${
                  filterStatus === st 
                    ? 'backdrop-blur-xl bg-white/15 text-white font-medium border border-white/20 shadow-sm' 
                    : 'backdrop-blur-md bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {st === 'skipped_duplicate' ? 'Duplicate' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter recipient, subject, studio..."
              className="text-xs rounded-xl border border-white/10 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md bg-white/5 text-slate-100 placeholder:text-slate-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Delivery ID</th>
                <th className="py-2.5 px-3">Recipient & Studio</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">SMTP Server Response</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No entries in the log match this filter.
                  </td>
                </tr>
              ) : (
                [...filteredLogs].reverse().map(entry => (
                  <tr key={entry.delivery_id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {entry.delivery_id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{entry.buyer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{entry.email}</div>
                      {entry.company_name && (
                        <div className="text-[10px] text-slate-400">{entry.company_name}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {entry.status === 'sent' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Sent (250 OK)</span>
                        </span>
                      ) : entry.status === 'skipped_duplicate' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Skipped Duplicate</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate text-slate-300">
                      {entry.subject}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {entry.response_message || 'OK'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(entry.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
