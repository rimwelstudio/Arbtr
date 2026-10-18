import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Lock,
  Cpu,
  Mic,
  Download,
  Copy,
  Check,
  Printer,
  Search,
  AlertTriangle,
  Mail,
  Info,
  ExternalLink,
  Scale,
} from 'lucide-react';
import {
  PRIVACY_METADATA,
  PRIVACY_KEY_HIGHLIGHTS,
  PRIVACY_SECTIONS,
  PrivacySection,
} from '../data/privacyPolicy';
import { ArbitrEmblem } from './ArbitrLogo';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms?: () => void;
  currentLanguage?: string;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onOpenTerms,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PRIVACY_SECTIONS;

    return PRIVACY_SECTIONS.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchParagraphs = sec.paragraphs.some((p) => p.toLowerCase().includes(q));
      const matchBullets = sec.bullets?.some((b) => b.toLowerCase().includes(q));
      const matchNotice = sec.importantNotice?.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchParagraphs || matchBullets || matchNotice;
    });
  }, [searchQuery]);

  // Copy plain-text policy to clipboard
  const handleCopyPolicy = () => {
    const text = [
      `# ${PRIVACY_METADATA.appName} - Privacy Policy`,
      `Website: ${PRIVACY_METADATA.website}`,
      `Effective Date: ${PRIVACY_METADATA.effectiveDate} (Last Updated: ${PRIVACY_METADATA.lastUpdated})`,
      `Version: ${PRIVACY_METADATA.version}`,
      `DPO Contact: ${PRIVACY_METADATA.dpoEmail}`,
      '\n--- KEY PRIVACY COMMITMENTS ---\n',
      ...PRIVACY_KEY_HIGHLIGHTS.map((h) => `• ${h.title}: ${h.description}`),
      '\n--- FULL POLICY SECTIONS ---\n',
      ...PRIVACY_SECTIONS.map((sec) => {
        const parts = [
          sec.title,
          `Summary: ${sec.summary}`,
          ...sec.paragraphs,
        ];
        if (sec.importantNotice) parts.push(`[IMPORTANT]: ${sec.importantNotice}`);
        if (sec.bullets) parts.push(...sec.bullets.map((b) => `  - ${b}`));
        return parts.join('\n\n');
      }),
    ].join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  // Scroll to a specific section by ID
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`privacy-section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="privacy-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-neutral-950/70 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <motion.div
          id="privacy-modal-card"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="shrink-0 px-5 sm:px-8 py-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-emerald-400 p-1 border border-neutral-800 shadow-sm">
                <ArbitrEmblem className="h-7 w-7" glow={false} animated={false} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="privacy-modal-title"
                    className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight"
                  >
                    Privacy Policy &amp; Data Protection
                  </h2>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    v{PRIVACY_METADATA.version}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hidden sm:inline font-semibold">
                    {PRIVACY_METADATA.domain}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate font-medium">
                  Effective: {PRIVACY_METADATA.effectiveDate} • Last Updated: {PRIVACY_METADATA.lastUpdated}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {onOpenTerms && (
                <button
                  id="privacy-switch-terms-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTerms();
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs min-h-[36px]"
                  title="View Terms & Conditions of Service"
                >
                  <Scale className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                  <span>Terms of Service</span>
                </button>
              )}

              <button
                id="privacy-copy-btn"
                type="button"
                onClick={handleCopyPolicy}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs min-h-[36px]"
                title="Copy full policy text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                id="privacy-print-btn"
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs min-h-[36px]"
                title="Print or export as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                <span>Print</span>
              </button>

              <button
                id="privacy-close-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close Privacy Policy modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Navigation Bar */}
          <div className="shrink-0 px-5 sm:px-8 py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-400 pointer-events-none" />
              <input
                id="privacy-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search privacy, AI data, GDPR, security, cookies..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Section Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                Jump to:
              </span>
              <button
                type="button"
                onClick={() => scrollToSection('overview')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                1. Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('data-collected')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                2. Data Collected
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('ai-processing')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                4. AI &amp; Gemini
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('storage-and-security')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                5. Security
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('user-rights-gdpr-ccpa')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                7. GDPR &amp; CCPA
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contact-dpo')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                12. Contact DPO
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div
            ref={contentContainerRef}
            className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 text-sm text-neutral-800 dark:text-neutral-200"
          >
            {/* Core Privacy Promise Banner */}
            <div className="rounded-2xl border border-emerald-300/90 dark:border-emerald-700/80 bg-emerald-50/80 dark:bg-emerald-950/60 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wide">
                  Our Privacy Covenant: Your Decisions Belong to You
                </h3>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  Arbitr is architected around private decision sovereignty. We do not sell your personal dilemma details,
                  monetize your tradeoff matrices, or train public AI foundation models on your private scenario entries.
                  Your cloud records in Firestore are strictly isolated to your authenticated UID.
                </p>
              </div>
            </div>

            {/* Quick Overview Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIVACY_KEY_HIGHLIGHTS.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200/80 dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400">
                        {item.icon === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
                        {item.icon === 'Lock' && <Lock className="w-4 h-4" />}
                        {item.icon === 'Cpu' && <Cpu className="w-4 h-4" />}
                        {item.icon === 'Mic' && <Mic className="w-4 h-4" />}
                        {item.icon === 'Download' && <Download className="w-4 h-4" />}
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Section Count Indicator when searching */}
            {searchQuery && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-300">
                  Showing <strong>{filteredSections.length}</strong> matching sections for "{searchQuery}"
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Render Sections */}
            <div className="space-y-6">
              {filteredSections.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  <p>No privacy policy sections match your search query.</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer"
                  >
                    View all sections
                  </button>
                </div>
              ) : (
                filteredSections.map((section: PrivacySection) => (
                  <div
                    key={section.id}
                    id={`privacy-section-${section.id}`}
                    className="p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 space-y-3.5 scroll-mt-24 shadow-2xs"
                  >
                    {/* Section Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                        <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                          {section.title}
                        </h3>
                      </div>
                      {section.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-600">
                          {section.badge}
                        </span>
                      )}
                    </div>

                    {/* Section Plain-English Summary */}
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-neutral-950 dark:text-white mr-1.5">
                          Plain English Summary:
                        </span>
                        <span className="text-neutral-700 dark:text-neutral-200">{section.summary}</span>
                      </div>
                    </div>

                    {/* Important Notice if any */}
                    {section.importantNotice && (
                      <div className="p-3.5 rounded-xl border border-emerald-300/90 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/60 text-xs font-semibold text-emerald-950 dark:text-emerald-200 leading-relaxed flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>{section.importantNotice}</div>
                      </div>
                    )}

                    {/* Paragraphs */}
                    <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Bullets if present */}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="space-y-1.5 pt-1 text-xs sm:text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200 list-disc list-inside marker:text-emerald-500 dark:marker:text-emerald-400 pl-1">
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-normal">
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DPO & Compliance Box */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Data Protection Officer &amp; Privacy Office
              </h4>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                For GDPR/CCPA data subject requests (access, export, or deletion), reporting security vulnerabilities,
                or inquiries regarding how your data is handled:
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <a
                  href={`mailto:${PRIVACY_METADATA.dpoEmail}`}
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{PRIVACY_METADATA.dpoEmail}</span>
                </a>
                <span>•</span>
                <a
                  href={`mailto:${PRIVACY_METADATA.legalEmail}`}
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{PRIVACY_METADATA.legalEmail}</span>
                </a>
                <span>•</span>
                <span className="font-mono text-neutral-600 dark:text-neutral-300">
                  {PRIVACY_METADATA.domain} ({PRIVACY_METADATA.handle})
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 px-5 sm:px-8 py-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Your data is protected under modern encryption and strictly private access rules.
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onOpenTerms && (
                <button
                  id="privacy-footer-terms-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTerms();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer min-h-[38px]"
                >
                  View Terms
                </button>
              )}
              <button
                id="privacy-acknowledge-btn"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm cursor-pointer min-h-[38px]"
              >
                I Understand
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
