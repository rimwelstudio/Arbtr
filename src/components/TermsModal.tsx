import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  ShieldAlert,
  Cpu,
  Lock,
  Mic,
  Copy,
  Check,
  Printer,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Mail,
  Info,
} from 'lucide-react';
import {
  TERMS_METADATA,
  TERMS_KEY_HIGHLIGHTS,
  TERMS_SECTIONS,
  TermsSection,
} from '../data/termsAndConditions';
import { ArbitrEmblem } from './ArbitrLogo';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
  currentLanguage?: string;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('acceptance');
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
    if (!q) return TERMS_SECTIONS;

    return TERMS_SECTIONS.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchParagraphs = sec.paragraphs.some((p) => p.toLowerCase().includes(q));
      const matchBullets = sec.bullets?.some((b) => b.toLowerCase().includes(q));
      const matchNotice = sec.importantNotice?.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchParagraphs || matchBullets || matchNotice;
    });
  }, [searchQuery]);

  // Scroll to section smoothly
  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const el = document.getElementById(`terms-section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Copy full policy as clean markdown text
  const handleCopyPolicy = async () => {
    try {
      const lines: string[] = [
        `# ${TERMS_METADATA.appName} - Terms and Conditions of Service`,
        `Effective Date: ${TERMS_METADATA.effectiveDate} | Version: ${TERMS_METADATA.version}`,
        `Website: ${TERMS_METADATA.website} | Domain: ${TERMS_METADATA.domain}`,
        '',
        '---',
        '',
      ];

      TERMS_SECTIONS.forEach((sec) => {
        lines.push(`## ${sec.title}`);
        lines.push(`*Summary: ${sec.summary}*`);
        lines.push('');
        if (sec.importantNotice) {
          lines.push(`> IMPORTANT NOTICE: ${sec.importantNotice}`);
          lines.push('');
        }
        sec.paragraphs.forEach((p) => {
          lines.push(p);
          lines.push('');
        });
        if (sec.bullets && sec.bullets.length > 0) {
          sec.bullets.forEach((b) => {
            lines.push(`- ${b}`);
          });
          lines.push('');
        }
      });

      lines.push('---');
      lines.push(`Legal Contact: ${TERMS_METADATA.legalEmail}`);
      lines.push(`Support: ${TERMS_METADATA.supportEmail}`);

      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  // Handle browser print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="terms-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="terms-modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="shrink-0 px-5 sm:px-8 py-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-cyan-400 p-1 border border-neutral-800 shadow-sm">
                <ArbitrEmblem className="h-7 w-7" glow={false} animated={false} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="terms-modal-title"
                    className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight"
                  >
                    Terms &amp; Conditions of Service
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                    v{TERMS_METADATA.version}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hidden sm:inline font-semibold">
                    {TERMS_METADATA.domain}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate font-medium">
                  Effective Date: {TERMS_METADATA.effectiveDate} • Last Updated: {TERMS_METADATA.lastUpdated}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenPrivacy && (
                <button
                  id="terms-switch-privacy-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacy();
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs min-h-[36px]"
                  title="View Privacy Policy"
                >
                  <Lock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                  <span>Privacy Policy</span>
                </button>
              )}

              <button
                id="terms-copy-btn"
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
                id="terms-print-btn"
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs min-h-[36px]"
                title="Print or export as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                <span>Print</span>
              </button>

              <button
                id="terms-close-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close Terms modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Navigation Strip */}
          <div className="shrink-0 px-5 sm:px-8 py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-400 pointer-events-none" />
              <input
                id="terms-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms, AI disclaimer, privacy, liability..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
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
                onClick={() => scrollToSection('acceptance')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                1. Acceptance
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('non-advisory-disclaimer')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                2. AI Disclaimer
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('user-accounts-sync')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                4. Cloud &amp; Auth
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('user-data-ip')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                5. Data Ownership
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('voice-deliberation')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                6. Voice &amp; Zena
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('limitation-liability')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                11. Liability
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div
            ref={contentContainerRef}
            className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 text-sm text-neutral-800 dark:text-neutral-200"
          >
            {/* Crucial Banner: AI Non-Advisory Notice */}
            <div className="rounded-2xl border border-amber-300/90 dark:border-amber-700/80 bg-amber-50/80 dark:bg-amber-950/60 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 uppercase tracking-wide">
                  Crucial Notice: Decision Structuring &amp; Non-Advisory Framework
                </h3>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  Arbitr is an artificial intelligence-assisted cognitive tool created to help structure thoughts,
                  evaluate trade-offs, and reduce cognitive biases. Arbitr does <strong>NOT</strong> provide certified
                  legal, financial, tax, investment, medical, or life-safety advice. All scores and verdicts are
                  probabilistic heuristics. You retain sole, final responsibility for your actions, contracts, and choices.
                </p>
              </div>
            </div>

            {/* Key Highlights Cards (4 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TERMS_KEY_HIGHLIGHTS.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200/80 dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400">
                        {item.icon === 'ShieldAlert' && <ShieldAlert className="w-4 h-4" />}
                        {item.icon === 'Cpu' && <Cpu className="w-4 h-4" />}
                        {item.icon === 'Lock' && <Lock className="w-4 h-4" />}
                        {item.icon === 'Mic' && <Mic className="w-4 h-4" />}
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
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Render Sections */}
            <div className="space-y-6">
              {filteredSections.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  <p>No sections match your search query.</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    View all Terms &amp; Conditions sections
                  </button>
                </div>
              ) : (
                filteredSections.map((section) => (
                  <div
                    key={section.id}
                    id={`terms-section-${section.id}`}
                    className="p-5 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 space-y-3.5 scroll-mt-24 shadow-2xs"
                  >
                    {/* Section Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
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
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-neutral-950 dark:text-white mr-1.5">
                          Plain English Summary:
                        </span>
                        <span className="text-neutral-700 dark:text-neutral-200">{section.summary}</span>
                      </div>
                    </div>

                    {/* Important Legal Notice Box if present */}
                    {section.importantNotice && (
                      <div className="p-3.5 rounded-xl border border-rose-300/90 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/60 text-xs font-semibold text-rose-950 dark:text-rose-200 leading-relaxed flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
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
                      <ul className="space-y-1.5 pt-1 text-xs sm:text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200 list-disc list-inside marker:text-indigo-500 dark:marker:text-indigo-400 pl-1">
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

            {/* Legal Contacts & Inquiry Box */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Legal Department &amp; Formal Inquiries
              </h4>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                If you have questions concerning these Terms, copyright requests, or privacy considerations, our legal
                compliance team can be reached directly:
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <a
                  href={`mailto:${TERMS_METADATA.legalEmail}`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{TERMS_METADATA.legalEmail}</span>
                </a>
                <span>•</span>
                <a
                  href={`mailto:${TERMS_METADATA.supportEmail}`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{TERMS_METADATA.supportEmail}</span>
                </a>
                <span>•</span>
                <span className="font-mono text-neutral-600 dark:text-neutral-300">
                  {TERMS_METADATA.domain} ({TERMS_METADATA.handle})
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 px-5 sm:px-8 py-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                By continuing to use Arbitr, you acknowledge and agree to these terms.
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onOpenPrivacy && (
                <button
                  id="terms-footer-privacy-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacy();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer min-h-[38px]"
                >
                  View Privacy Policy
                </button>
              )}
              <button
                id="terms-acknowledge-btn"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm cursor-pointer min-h-[38px]"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
