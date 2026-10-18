import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Clock, 
  ArrowRight, 
  Trophy, 
  Scale,
  Cloud,
  Languages,
  AlertTriangle,
  PlusCircle,
  Search,
  CheckCircle2,
  ThumbsUp,
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';
import { getTranslation } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';
import { ArbitrEmblem } from './ArbitrLogo';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysisResult[];
  onSelectDecision: (decision: DecisionAnalysisResult) => void;
  onDeleteDecision: (id: string) => Promise<void> | void;
  currentLanguage: string;
  onOpenAuth: () => void;
}

/**
 * Formats a date timestamp into standard 'Sep 12, 2026' display format.
 */
function formatDecisionDate(dateVal?: string | Date): string {
  if (!dateVal) return 'Sep 12, 2026';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  // Filter and sort decisions by createdAt descending
  const sortedDecisions = useMemo(() => {
    const list = [...savedDecisions].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((dec) => {
      const titleMatch = dec.title.toLowerCase().includes(q);
      const verdictMatch =
        typeof dec.verdict === 'string'
          ? dec.verdict.toLowerCase().includes(q)
          : dec.verdict?.recommendedOptionName?.toLowerCase().includes(q);
      const optionsMatch = dec.options?.some((opt) => opt.name.toLowerCase().includes(q));
      return titleMatch || verdictMatch || optionsMatch;
    });
  }, [savedDecisions, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Background dismissal overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-xs cursor-pointer" 
            onClick={onClose}
            aria-label="Close panel overlay"
          />

          <motion.div 
            id="past-decisions-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-lg h-full bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 sm:px-6 py-4 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 p-1 text-white border border-neutral-800 ring-1 ring-cyan-500/20 shadow-sm">
                  <ArbitrEmblem className="h-8 w-8" glow={true} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">
                      {t.historyTitle || 'Past Decisions'}
                    </h3>
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-200 font-bold border border-neutral-200 dark:border-neutral-700">
                      {savedDecisions.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-300 font-medium">
                    Cloud Firestore synchronization
                  </p>
                </div>
              </div>
              <motion.button
                id="close-history-drawer-btn"
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close panel"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

        {/* User Account & Cloud Sync Status Banner */}
        {user && (
          <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-medium truncate">
              <Cloud className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">Synced with Cloud ({user.email})</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Active</span>
            </span>
          </div>
        )}

        {/* Optional Search / Filter bar if there are decisions */}
        {savedDecisions.length > 2 && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-300" />
              <input
                id="search-past-decisions-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.historySearchPlaceholder || 'Search past decisions by title or winner...'}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-300 hover:text-neutral-600 dark:hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Temporary Deletion Toast Banner */}
        {deletedToast && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150 shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              <span>{deletedToast}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setDeletedToast(null)}
              className="text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 text-xs ml-2 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-neutral-50/50 dark:bg-neutral-950">
          {savedDecisions.length === 0 ? (
            /* Friendly Empty State as specified:
               'No saved decisions yet. Run your first Arbitr analysis to start building your history.' */
            <div 
              id="past-decisions-empty-state"
              className="flex flex-col items-center justify-center text-center py-16 sm:py-20 px-4 h-full"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-950 p-2 text-white mb-4 border border-neutral-800 ring-1 ring-cyan-500/20 shadow-md">
                <ArbitrEmblem className="h-14 w-14" glow={true} />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-2">
                No saved decisions yet
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-200 max-w-xs sm:max-w-sm leading-relaxed mb-6 font-normal">
                No saved decisions yet. Run your first Arbitr analysis to start building your history.
              </p>
              <button
                id="empty-state-new-decision-btn"
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Start New Analysis</span>
              </button>
            </div>
          ) : sortedDecisions.length === 0 ? (
            /* Filter produced no results */
            <div className="text-center py-12 px-4">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                No decisions matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="space-y-3.5"
            >
              {sortedDecisions.map((dec) => {
                const formattedDate = formatDecisionDate(dec.createdAt);
                const winningChoice =
                  dec.verdict?.recommendedOptionName ||
                  (typeof dec.verdict === 'string' ? dec.verdict : dec.options?.[0]?.name) ||
                  'Recommendation';

                const winningScore =
                  typeof dec.verdict?.confidenceScore === 'number' && dec.verdict.confidenceScore > 0
                    ? dec.verdict.confidenceScore
                    : dec.options?.find((o) => o.name.toLowerCase() === winningChoice.toLowerCase())?.score;

                const isConfirmingDelete = confirmDeleteId === dec.id;
                const isDeletingThis = isDeletingId === dec.id;

                return (
                  <motion.div
                    key={dec.id}
                    id={`decision-card-${dec.id}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                    }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      if (!isConfirmingDelete) {
                        onSelectDecision(dec);
                        onClose();
                      }
                    }}
                    className={`relative rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex flex-col gap-3 group cursor-pointer ${
                      isConfirmingDelete
                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-950/40'
                        : 'border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-lg dark:hover:shadow-neutral-950/60'
                    }`}
                  >
                  {/* Top Metadata Row: Formatted Date & Delete Icon */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                        <Clock className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>{formattedDate}</span>
                      </span>

                      {dec.translatedTo && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                          <Languages className="w-3 h-3" />
                          <span>{dec.translatedTo}</span>
                        </span>
                      )}

                      {dec.feedback && Object.keys(dec.feedback).length > 0 && (
                        <span 
                          title="Insights rated" 
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-md"
                        >
                          <ThumbsUp className="w-2.5 h-2.5 fill-emerald-500/20" />
                          <span>Rated</span>
                        </span>
                      )}
                    </div>

                    {/* Delete Icon Button */}
                    <button
                      id={`delete-decision-${dec.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(isConfirmingDelete ? null : dec.id);
                      }}
                      className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Delete decision from Firestore"
                      aria-label="Delete decision"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Decision Title */}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {dec.title}
                    </h4>
                  </div>

                  {/* Winning Choice / Verdict Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div 
                      id={`verdict-badge-${dec.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-250 dark:border-emerald-700/80 shadow-xs"
                    >
                      <Trophy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[240px]">
                        Verdict: <strong className="text-emerald-950 dark:text-emerald-100 font-extrabold">{winningChoice}</strong>
                      </span>
                    </div>

                    {typeof winningScore === 'number' && winningScore > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                        Score: <strong>{winningScore}/100</strong>
                      </span>
                    )}
                  </div>

                  {/* Options & Weights summary chips */}
                  {dec.options && dec.options.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {dec.options.map((opt) => {
                        const isWinner = opt.name.toLowerCase() === winningChoice.toLowerCase();
                        return (
                          <span
                            key={opt.id}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                              isWinner
                                ? 'bg-emerald-100/50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700 font-bold'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            {opt.name} {typeof opt.score === 'number' && opt.score > 0 ? `• ${opt.score}` : ''}
                          </span>
                        );
                      })}
                      {dec.comparisonMatrix?.criteria && dec.comparisonMatrix.criteria.length > 0 && (
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-300 ml-auto hidden sm:inline">
                          {dec.comparisonMatrix.criteria.length} criteria weighted
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick Confirmation Banner for Deletion */}
                  {isConfirmingDelete && (
                    <div
                      id={`confirm-delete-box-${dec.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 p-3.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/95 dark:bg-rose-950/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-100">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>Delete this decision permanently?</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          disabled={isDeletingThis}
                          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          id={`confirm-delete-btn-${dec.id}`}
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setIsDeletingId(dec.id);
                            try {
                              await onDeleteDecision(dec.id);
                              setDeletedToast(`Deleted "${dec.title.slice(0, 24)}..."`);
                              setTimeout(() => setDeletedToast(null), 3000);
                            } finally {
                              setIsDeletingId(null);
                              setConfirmDeleteId(null);
                            }
                          }}
                          disabled={isDeletingThis}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          {isDeletingThis ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Bottom: Open breakdown CTA */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
                      Click to load full breakdown
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDecision(dec);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>{t.historyLoadBtn || 'Open Breakdown'}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
