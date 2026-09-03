import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Check, 
  AlertTriangle, 
  Plus, 
  ExternalLink, 
  Loader2, 
  Filter, 
  Compass, 
  Building2, 
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import { BuyerRecord, SourcePlatform } from '../types.ts';

interface SearchDiscoveryViewProps {
  onAddLeads: (leads: BuyerRecord[]) => Promise<void>;
  existingBuyerEmails: Set<string>;
  onRefresh: () => void;
}

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  onAddLeads,
  existingBuyerEmails,
  onRefresh
}) => {
  const [keyword, setKeyword] = useState('Singing Bowls Wholesale');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [maxResults, setMaxResults] = useState(8);
  const [selectedSources, setSelectedSources] = useState<SourcePlatform[]>([
    'Google', 'LinkedIn', 'Facebook', 'Directory', 'Website'
  ]);

  const [isSearching, setIsSearching] = useState(false);
  const [discoveredLeads, setDiscoveredLeads] = useState<BuyerRecord[]>([]);
  const [selectedEmailSet, setSelectedEmailSet] = useState<Set<string>>(new Set());
  const [searchSummary, setSearchSummary] = useState<{
    totalDiscovered: number;
    validCount: number;
    flaggedCount: number;
    duplicatesSkipped: number;
  } | null>(null);

  // URL Scraper state
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ count: number; emails: string[] } | null>(null);

  const toggleSource = (source: SourcePlatform) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter(s => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchSummary(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          sources: selectedSources,
          country: selectedCountry === 'All' ? undefined : selectedCountry,
          maxResults,
          autoSave: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        const combined = [...(data.validLeads || []), ...(data.flaggedLeads || [])];
        setDiscoveredLeads(combined);
        setSearchSummary({
          totalDiscovered: data.totalDiscovered || combined.length,
          validCount: data.validLeads?.length || 0,
          flaggedCount: data.flaggedLeads?.length || 0,
          duplicatesSkipped: data.duplicatesSkipped || 0
        });

        // Pre-select all valid leads that aren't already in DB
        const initialSelected = new Set<string>();
        (data.validLeads || []).forEach((lead: BuyerRecord) => {
          if (!existingBuyerEmails.has(lead.email.toLowerCase())) {
            initialSelected.add(lead.email.toLowerCase());
          }
        });
        setSelectedEmailSet(initialSelected);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() })
      });
      const data = await res.json();
      if (res.ok && data.extractedRecords) {
        setScrapeResult({ count: data.emails.length, emails: data.emails });
        // Add to discovered leads
        const newRecords: BuyerRecord[] = data.extractedRecords.map((r: any) => ({
          email: r.email,
          buyer_name: r.buyer_name || 'Studio Contact',
          company_name: r.company_name || 'Website Lead',
          website: r.website || scrapeUrl,
          country: r.country || 'International',
          source_platform: 'Website',
          category: 'unclassified',
          discovered_date: new Date().toISOString(),
          status: 'valid'
        }));
        setDiscoveredLeads(prev => [...newRecords, ...prev]);
        setSelectedEmailSet(prev => {
          const next = new Set(prev);
          newRecords.forEach(nr => next.add(nr.email.toLowerCase()));
          return next;
        });
      }
    } catch (err) {
      console.error('Scraping error:', err);
    } finally {
      setIsScraping(false);
    }
  };

  const toggleLeadSelection = (email: string) => {
    const key = email.toLowerCase();
    const updated = new Set(selectedEmailSet);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedEmailSet(updated);
  };

  const selectAllValid = () => {
    const valid = new Set<string>();
    discoveredLeads.forEach(l => {
      if (l.status === 'valid' && !existingBuyerEmails.has(l.email.toLowerCase())) {
        valid.add(l.email.toLowerCase());
      }
    });
    setSelectedEmailSet(valid);
  };

  const handleSaveSelected = async () => {
    const leadsToSave = discoveredLeads.filter(l => selectedEmailSet.has(l.email.toLowerCase()));
    if (leadsToSave.length === 0) return;
    await onAddLeads(leadsToSave);
    onRefresh();
    // Clear saved from discovered
    setDiscoveredLeads(prev => prev.filter(l => !selectedEmailSet.has(l.email.toLowerCase())));
    setSelectedEmailSet(new Set());
  };

  const presetQueries = [
    'Singing Bowls Wholesale Importers',
    'Sound Healing & Meditation Studios',
    'Tibetan Singing Bowls Spiritual Gift Stores',
    'Yoga Wellness Retreats & Sound Bath'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-serif">
              Stage 1: Multi-Platform Buyer Search Module
            </h2>
            <p className="text-xs text-slate-400">
              Query online sources (Google, LinkedIn, Facebook, Directories, Websites) for singing bowl buyers and sound healing studios.
            </p>
          </div>
        </div>

        {/* Search Control Bar */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Keyword / Buyer Intent
              </label>
              <div className="relative">
                <input
                  id="input-search-keyword"
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. Singing Bowls Wholesale"
                  className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 pl-8 pr-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Country Region
              </label>
              <select
                id="select-search-country"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
              >
                <option value="All" className="bg-slate-900 text-slate-100">All International (Global)</option>
                <option value="United States" className="bg-slate-900 text-slate-100">United States</option>
                <option value="United Kingdom" className="bg-slate-900 text-slate-100">United Kingdom</option>
                <option value="Germany" className="bg-slate-900 text-slate-100">Germany</option>
                <option value="Japan" className="bg-slate-900 text-slate-100">Japan</option>
                <option value="Australia" className="bg-slate-900 text-slate-100">Australia</option>
                <option value="Canada" className="bg-slate-900 text-slate-100">Canada</option>
                <option value="France" className="bg-slate-900 text-slate-100">France</option>
                <option value="Netherlands" className="bg-slate-900 text-slate-100">Netherlands</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Results
              </label>
              <select
                id="select-search-max"
                value={maxResults}
                onChange={e => setMaxResults(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
              >
                <option value={6} className="bg-slate-900 text-slate-100">6 Prospects</option>
                <option value={8} className="bg-slate-900 text-slate-100">8 Prospects</option>
                <option value={12} className="bg-slate-900 text-slate-100">12 Prospects</option>
                <option value={15} className="bg-slate-900 text-slate-100">15 Prospects</option>
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-400">Presets:</span>
            {presetQueries.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setKeyword(q)}
                className={`px-3 py-1 rounded-xl text-[11px] transition-all ${
                  keyword === q 
                    ? 'backdrop-blur-md bg-amber-400/20 text-amber-200 font-semibold border border-amber-400/40' 
                    : 'backdrop-blur-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Source Platform Adapters */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Active Source Adapters (Section 5.1 & Algorithm 12.1)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Google', 'LinkedIn', 'Facebook', 'Directory', 'Website'] as SourcePlatform[]).map(source => {
                const isActive = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? 'backdrop-blur-xl bg-white/15 text-white border-white/20 shadow-sm'
                        : 'backdrop-blur-md bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-slate-500'}`} />
                    <span>{source}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex items-center justify-end pt-3 border-t border-white/10">
            <button
              id="btn-run-search"
              onClick={handleSearch}
              disabled={isSearching}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/90 hover:bg-amber-400 text-white shadow-lg shadow-amber-950/40 border border-amber-400/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Querying Adapters & Validating...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Execute Multi-Source Discovery</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Direct URL Scraper Sub-Module */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold">
            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Studio / Website Direct Scraper</span>
          </div>
          <span className="text-[11px] text-slate-400">Crawl website contact & about pages for direct emails</span>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
            placeholder="https://example-soundbath-studio.com/contact"
            className="flex-1 text-xs rounded-xl border border-white/10 py-2 px-3 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
          />
          <button
            onClick={handleScrape}
            disabled={isScraping || !scrapeUrl.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 disabled:opacity-50 transition"
          >
            {isScraping ? 'Extracting...' : 'Scrape URL'}
          </button>
        </div>

        {scrapeResult && (
          <p className="text-[11px] text-emerald-300 mt-2 font-medium">
            Extracted {scrapeResult.count} contact emails from URL and added to review queue.
          </p>
        )}
      </div>

      {/* Discovered Leads Review & Validation Section */}
      {searchSummary && (
        <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400">Discovered: </span>
              <span className="font-bold text-white">{searchSummary.totalDiscovered}</span>
            </div>
            <div>
              <span className="text-slate-400">Syntax Valid: </span>
              <span className="font-bold text-emerald-300">{searchSummary.validCount}</span>
            </div>
            <div>
              <span className="text-slate-400">Flagged / Invalid: </span>
              <span className="font-bold text-rose-300">{searchSummary.flaggedCount}</span>
            </div>
            <div>
              <span className="text-slate-400">Duplicates Skipped: </span>
              <span className="font-bold text-amber-300">{searchSummary.duplicatesSkipped}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllValid}
              className="text-xs text-slate-300 hover:text-white font-medium underline"
            >
              Select All Valid
            </button>
            <button
              id="btn-save-discovered-leads"
              onClick={handleSaveSelected}
              disabled={selectedEmailSet.size === 0}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white disabled:opacity-50 transition shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Selected ({selectedEmailSet.size}) to Database</span>
            </button>
          </div>
        </div>
      )}

      {discoveredLeads.length > 0 && (
        <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">
              Discovered Leads Queue ({discoveredLeads.length})
            </h3>
            <span className="text-xs text-slate-400">
              Check records to accept into <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-200">buyers.csv</code>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedEmailSet.size === discoveredLeads.length && discoveredLeads.length > 0}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedEmailSet(new Set(discoveredLeads.map(l => l.email.toLowerCase())));
                        } else {
                          setSelectedEmailSet(new Set());
                        }
                      }}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                  </th>
                  <th className="py-2.5 px-3">Lead / Company</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Validation Status</th>
                  <th className="py-2.5 px-3">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {discoveredLeads.map(lead => {
                  const key = lead.email.toLowerCase();
                  const isSelected = selectedEmailSet.has(key);
                  const isAlreadyInDb = existingBuyerEmails.has(key);

                  return (
                    <tr key={lead.email} className={`hover:bg-white/[0.04] transition-colors ${isSelected ? 'bg-white/[0.06]' : ''}`}>
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={lead.status === 'invalid'}
                          onChange={() => toggleLeadSelection(lead.email)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{lead.buyer_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{lead.company_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {lead.email}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {lead.country}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-300 border border-white/10">
                          {lead.source_platform}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isAlreadyInDb ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-400 border border-white/10">
                            Already in DB
                          </span>
                        ) : lead.status === 'valid' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Valid Syntax
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30" title={lead.notes}>
                            {lead.notes || 'Flagged'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1 font-mono text-[11px]"
                          >
                            <span className="max-w-[120px] truncate">{lead.website.replace('https://', '')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
