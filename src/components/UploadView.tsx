import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  HardDrive, 
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Loader2
} from 'lucide-react';
import { DatabaseStats } from '../types.ts';

interface UploadViewProps {
  stats: DatabaseStats | null;
  onRefreshStats: () => void;
  onRefreshBuyers: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  stats,
  onRefreshStats,
  onRefreshBuyers
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    totalParsed: number;
    addedCount: number;
    updatedCount: number;
    validCount: number;
    flaggedCount: number;
    duplicatesSkipped: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        await submitCsv(content);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from local disk.');
    };
    reader.readAsText(file);
  };

  const submitCsv = async (text: string) => {
    if (!text.trim()) {
      setErrorMessage('Please paste or select a valid CSV file.');
      return;
    }
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse and upload CSV.');
      }
      setUploadResult(data);
      onRefreshStats();
      onRefreshBuyers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading leads');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sample = `email,buyer_name,company_name,website,country,source_platform,category
contact@sanfranciscosoundbath.com,David Thorne,SF Vibrational Arts Studio,https://sanfranciscosoundbath.com,United States,Google,business
wholesale@londonchimes.co.uk,Sophia Clark,London Tibetan Chimes Ltd,https://londonchimes.co.uk,United Kingdom,LinkedIn,business
healer.mark@gmail.com,Mark Jensen,Mark Jensen Sound Therapy,https://markjensensound.com,Australia,Facebook,individual
purchasing@himalayanimports.de,Hans Gruber,Himalayan Klang Import GmbH,https://himalayanimports.de,Germany,Directory,business`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'singing_bowls_leads_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Lead Import & Database Store
              </h2>
              <p className="text-xs text-slate-400">
                Upload existing spreadsheets of international Singing Bowls buyers, or inspect the flat-file CSV schemas.
              </p>
            </div>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer backdrop-blur-md transition-all ${
              dragActive 
                ? 'border-amber-400 bg-amber-500/10' 
                : 'border-white/15 hover:border-amber-400/60 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 mx-auto text-amber-400 mb-2 stroke-1.5" />
            <h3 className="font-semibold text-sm text-white">
              Click to browse or drop your CSV file here
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Accepts comma-separated values (.csv) with headers: <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-200">email, buyer_name, company_name, website, country, source_platform</code>
            </p>
          </div>
        </div>

        {/* Manual Paste Accordion */}
        <div className="mt-4">
          <details className="group border border-white/10 rounded-xl p-3 bg-white/[0.03] backdrop-blur-md text-xs">
            <summary className="cursor-pointer font-medium text-slate-300 flex items-center justify-between">
              <span>Or paste raw CSV text directly</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-2">
              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="email,buyer_name,company_name,country&#10;info@zenbath.com,Sarah,Zen Sound Bath,USA"
                rows={4}
                className="w-full font-mono text-[11px] rounded-xl border border-white/10 p-2.5 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-md"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => submitCsv(csvText)}
                  disabled={isUploading || !csvText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/90 hover:bg-amber-400 text-white shadow-lg shadow-amber-950/40 border border-amber-400/30 disabled:opacity-50 transition"
                >
                  {isUploading ? 'Importing...' : 'Parse & Import CSV'}
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl backdrop-blur-md bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Success Report */}
        {uploadResult && (
          <div className="mt-4 p-4 rounded-xl backdrop-blur-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
            <div className="flex items-center space-x-2 font-semibold mb-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CSV Imported Successfully into Local Database</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300 mt-2">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400">Rows Parsed:</span>
                <div className="font-bold text-white text-base">{uploadResult.totalParsed}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400">New Added:</span>
                <div className="font-bold text-emerald-400 text-base">+{uploadResult.addedCount}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400">Valid Syntax:</span>
                <div className="font-bold text-white text-base">{uploadResult.validCount}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400">Duplicates Skipped:</span>
                <div className="font-bold text-amber-400 text-base">{uploadResult.duplicatesSkipped}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Statistics (Section 7.1 & Section 8) */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-slate-300" />
            <h3 className="font-semibold text-sm text-white">
              Database Files & Local Storage Statistics (Section 7.1)
            </h3>
          </div>

          <button
            onClick={() => {
              onRefreshStats();
              onRefreshBuyers();
            }}
            className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stats</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* buyers.csv */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.08] transition">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span>data/buyers.csv</span>
                <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300 border border-white/10">
                  {stats?.file_sizes.buyers_csv_kb ?? 0} KB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                All discovered and uploaded buyer records (Primary Dataset).
              </p>
              <div className="text-xl font-bold text-white">
                {stats?.total_buyers ?? 0} <span className="text-xs font-normal text-slate-400">records</span>
              </div>
            </div>
            <a
              href="/api/download-csv/buyers"
              download="singing_bowls_buyers.csv"
              className="mt-3 inline-flex items-center justify-center space-x-1 w-full py-2 rounded-xl text-xs font-medium backdrop-blur-md bg-white/10 border border-white/15 text-slate-200 hover:bg-white/15 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* business_emails.csv */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-md flex flex-col justify-between hover:bg-indigo-500/15 transition">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-200 mb-1">
                <span>data/business_emails.csv</span>
                <span className="text-[10px] font-mono bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-400/30">
                  {stats?.file_sizes.business_csv_kb ?? 0} KB
                </span>
              </div>
              <p className="text-[11px] text-indigo-300/80 mb-3">
                Commercial studios, retail shops, and wholesale distributors.
              </p>
              <div className="text-xl font-bold text-white">
                {stats?.business_count ?? 0} <span className="text-xs font-normal text-indigo-300">enterprises</span>
              </div>
            </div>
            <a
              href="/api/download-csv/business"
              download="singing_bowls_business_emails.csv"
              className="mt-3 inline-flex items-center justify-center space-x-1 w-full py-2 rounded-xl text-xs font-medium backdrop-blur-md bg-white/10 border border-white/15 text-slate-200 hover:bg-white/15 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* individual_emails.csv */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/10 backdrop-blur-md flex flex-col justify-between hover:bg-sky-500/15 transition">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-sky-200 mb-1">
                <span>data/individual_emails.csv</span>
                <span className="text-[10px] font-mono bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-300 border border-sky-400/30">
                  {stats?.file_sizes.individual_csv_kb ?? 0} KB
                </span>
              </div>
              <p className="text-[11px] text-sky-300/80 mb-3">
                Solo acoustic therapists, yoga teachers, and private practitioners.
              </p>
              <div className="text-xl font-bold text-white">
                {stats?.individual_count ?? 0} <span className="text-xs font-normal text-sky-300">individuals</span>
              </div>
            </div>
            <a
              href="/api/download-csv/individual"
              download="singing_bowls_individual_emails.csv"
              className="mt-3 inline-flex items-center justify-center space-x-1 w-full py-2 rounded-xl text-xs font-medium backdrop-blur-md bg-white/10 border border-white/15 text-slate-200 hover:bg-white/15 transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* sent_log.csv */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md flex flex-col justify-between hover:bg-emerald-500/15 transition">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-200 mb-1">
                <span>data/sent_log.csv</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-400/30">
                  {stats?.file_sizes.sent_log_csv_kb ?? 0} KB
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mb-3">
                Outreach audit history & duplicate-suppression source.
              </p>
              <div className="text-xl font-bold text-white">
                {stats?.total_sent ?? 0} <span className="text-xs font-normal text-emerald-300">logged</span>
              </div>
            </div>
            <a
              href="/api/download-csv/sent_log"
              download="singing_bowls_sent_log.csv"
              className="mt-3 inline-flex items-center justify-center space-x-1 w-full py-2 rounded-xl text-xs font-medium backdrop-blur-md bg-white/10 border border-white/15 text-slate-200 hover:bg-white/15 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
