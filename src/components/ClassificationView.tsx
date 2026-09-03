import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight,
  Filter,
  Loader2,
  Send
} from 'lucide-react';
import { BuyerRecord, DatabaseStats } from '../types.ts';
import { ActiveTab } from './Navbar.tsx';

interface ClassificationViewProps {
  buyers: BuyerRecord[];
  stats: DatabaseStats | null;
  onRefreshBuyers: () => void;
  onRefreshStats: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ClassificationView: React.FC<ClassificationViewProps> = ({
  buyers,
  stats,
  onRefreshBuyers,
  onRefreshStats,
  setActiveTab
}) => {
  const [isClassifying, setIsClassifying] = useState(false);
  const [filterSegment, setFilterSegment] = useState<'all' | 'business' | 'individual' | 'unclassified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFeedback, setClassificationFeedback] = useState<string | null>(null);

  const unclassifiedBuyers = buyers.filter(b => !b.category || b.category === 'unclassified');
  const businessBuyers = buyers.filter(b => b.category === 'business');
  const individualBuyers = buyers.filter(b => b.category === 'individual');

  const handleRunClassification = async (targetEmails?: string[]) => {
    setIsClassifying(true);
    setClassificationFeedback(null);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmails })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI classification failed.');
      }
      setClassificationFeedback(
        `Gemini AI classified ${data.classifiedCount} leads: ${data.businessCount} as Business, ${data.individualCount} as Individual.`
      );
      onRefreshBuyers();
      onRefreshStats();
    } catch (err: any) {
      setClassificationFeedback(`Error: ${err.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  const filteredBuyers = buyers.filter(b => {
    if (filterSegment !== 'all' && b.category !== filterSegment) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.email.toLowerCase().includes(q) ||
        b.buyer_name.toLowerCase().includes(q) ||
        b.company_name.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q)
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Stage 3: AI Email Classification Module (Gemini 2.5/3.8)
              </h2>
              <p className="text-xs text-slate-400">
                Segment contacts into Business (Studios, Distributors, Retailers) and Individual (Practitioners, Collectors) for tailored email messaging.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-run-ai-classify-all"
              onClick={() => handleRunClassification()}
              disabled={isClassifying || unclassifiedBuyers.length === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Classify Unclassified ({unclassifiedBuyers.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {classificationFeedback && (
          <div className="mt-4 p-3.5 rounded-xl backdrop-blur-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{classificationFeedback}</span>
          </div>
        )}

        {/* Segment Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div 
            onClick={() => setFilterSegment('business')}
            className={`p-4 rounded-2xl border cursor-pointer backdrop-blur-xl transition-all ${
              filterSegment === 'business' 
                ? 'border-indigo-400/40 bg-indigo-500/15 shadow-lg shadow-indigo-950/30' 
                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between text-indigo-200 font-semibold text-xs mb-1">
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Business Segment</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-indigo-400/30">
                data/business_emails.csv
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{businessBuyers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sound sanctuaries, wellness academies, import distributors, spiritual gift stores.
            </p>
          </div>

          <div 
            onClick={() => setFilterSegment('individual')}
            className={`p-4 rounded-2xl border cursor-pointer backdrop-blur-xl transition-all ${
              filterSegment === 'individual' 
                ? 'border-sky-400/40 bg-sky-500/15 shadow-lg shadow-sky-950/30' 
                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between text-sky-200 font-semibold text-xs mb-1">
              <span className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-sky-400" />
                <span>Individual Segment</span>
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono border border-sky-400/30">
                data/individual_emails.csv
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{individualBuyers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Independent sound healers, acoustic meditation teachers, private collectors.
            </p>
          </div>

          <div 
            onClick={() => setFilterSegment('unclassified')}
            className={`p-4 rounded-2xl border cursor-pointer backdrop-blur-xl transition-all ${
              filterSegment === 'unclassified' 
                ? 'border-amber-400/40 bg-amber-500/15 shadow-lg shadow-amber-950/30' 
                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between text-amber-200 font-semibold text-xs mb-1">
              <span className="flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Unclassified Queue</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-400/30">
                Pending AI
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{unclassifiedBuyers.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Freshly discovered or uploaded contacts waiting for Gemini classification.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table of Classified Buyers */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Filter Segment:</span>
            {(['all', 'business', 'individual', 'unclassified'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterSegment(tab)}
                className={`px-3 py-1 rounded-xl text-xs capitalize transition-all ${
                  filterSegment === tab 
                    ? 'backdrop-blur-xl bg-white/15 text-white font-medium border border-white/20 shadow-sm' 
                    : 'backdrop-blur-md bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="text-xs rounded-xl border border-white/10 py-2 px-3 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
            />
            <button
              onClick={() => setActiveTab('send')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Campaign</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Contact & Organization</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Category Segment</th>
                <th className="py-2.5 px-3">AI Confidence</th>
                <th className="py-2.5 px-3">AI Reasoning (Section 5.4)</th>
                <th className="py-2.5 px-3">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No leads match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBuyers.map(buyer => (
                  <tr key={buyer.email} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{buyer.buyer_name}</div>
                      <div className="text-[11px] text-slate-400">{buyer.company_name}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {buyer.email}
                    </td>
                    <td className="py-3 px-3">
                      {buyer.category === 'business' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Building2 className="w-3 h-3 text-indigo-400" />
                          <span>Business</span>
                        </span>
                      ) : buyer.category === 'individual' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          <User className="w-3 h-3 text-sky-400" />
                          <span>Individual</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Unclassified</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {buyer.ai_confidence ? (
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="bg-indigo-400 h-full"
                              style={{ width: `${Math.round(buyer.ai_confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {Math.round(buyer.ai_confidence * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs text-[11px] text-slate-400 italic">
                      {buyer.ai_reasoning || 'Pending classification'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {buyer.country}
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
