import React from 'react';
import { FileText, Download, X, CheckCircle, ShieldCheck, Sparkles, Music } from 'lucide-react';
import { AppSettings } from '../types.ts';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-slate-950/90 border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl font-serif shadow-lg shadow-amber-950/50 border border-amber-400/30">
              ॐ
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Himalayan Singing Bowls — Export Catalog 2026</h3>
              <p className="text-xs text-slate-400">
                Company Presentation Attachment (MIME asset sent to all prospective buyers)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Product Presentation Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Catalog Highlights */}
          <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-200 text-sm font-serif">
                Authentic Hand-Hammered 7-Metal Singing Bowls & Acoustic Instruments
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                FOB & CIF Rates
              </span>
            </div>
            <p className="text-amber-300/90 text-xs leading-relaxed">
              Crafted in Kathmandu Valley (Nepal) and Northern India by traditional master bronze lineages. Each instrument is alloyed using 7 planetary metals (Gold, Silver, Copper, Iron, Tin, Lead, Zinc) and precision tuned for extended acoustic sustain (&gt;45s) and harmonic overtones.
            </p>
          </div>

          {/* Export Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/[0.04]">
              <div className="font-bold text-white mb-3 flex items-center space-x-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Product Export Portfolio</span>
              </div>
              <ul className="space-y-2 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                <li><strong className="text-white">7-Metal Planetary Singing Bowls:</strong> 6&quot; to 16&quot; diameter, calibrated to 432Hz &amp; 528Hz Solfeggio.</li>
                <li><strong className="text-white">Full Moon Bowls:</strong> Forged under full moon light for higher acoustic clarity.</li>
                <li><strong className="text-white">7-Chakra Tuned Sets:</strong> C, D, E, F, G, A, B frequency matching.</li>
                <li><strong className="text-white">Pure Quartz Crystal Bowls:</strong> 99.99% pure frosted &amp; optical clear.</li>
                <li><strong className="text-white">Tibetan Tingsha &amp; Gongs:</strong> Handcrafted bronze meditation chimes.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/[0.04]">
              <div className="font-bold text-white mb-3 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Wholesale &amp; Export Terms</span>
              </div>
              <ul className="space-y-2 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                <li><strong className="text-white">Minimum Order Quantity (MOQ):</strong> 15 units / mix-and-match sets.</li>
                <li><strong className="text-white">Custom Branding:</strong> Laser etching of buyer studio/retailer logo.</li>
                <li><strong className="text-white">Packaging:</strong> Handmade eco Lokta paper boxes &amp; silk cushions.</li>
                <li><strong className="text-white">Air/Ocean Freight:</strong> Express CIF DHL/FedEx to USA, EU, UK, JP.</li>
                <li><strong className="text-white">Testing &amp; Warranty:</strong> Individual acoustic spectrogram certificate.</li>
              </ul>
            </div>
          </div>

          {/* PDF File Details */}
          <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-white">
                  {settings.presentation_filename || 'Export_API_documentation.docx.pdf'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Location: <code className="font-mono text-slate-300 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{settings.presentation_path || 'assets/Export_API_documentation.docx.pdf'}</code>
                </div>
              </div>
            </div>

            <a
              href="/api/presentation"
              download={settings.presentation_filename || 'Export_API_documentation.docx.pdf'}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Asset</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
