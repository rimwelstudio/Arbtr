import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Send,
  MessageSquare
} from 'lucide-react';
import { InsightFeedbackItem, FeedbackRating } from '../types';
import { saveDecisionFeedback, getDecisionFeedback, removeDecisionFeedback } from '../services/decisionsDb';
import { getTranslation } from '../utils/i18n';

interface InsightFeedbackProps {
  decisionId: string;
  activeTab: 'verdict' | 'proscons' | 'matrix' | 'swot' | 'simulator';
  userId?: string | null;
  currentLanguage?: string;
  onFeedbackSubmitted?: (tab: string, item: InsightFeedbackItem) => void;
}

export const InsightFeedback: React.FC<InsightFeedbackProps> = ({
  decisionId,
  activeTab,
  userId,
  currentLanguage,
  onFeedbackSubmitted,
}) => {
  const t = getTranslation(currentLanguage);
  
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing feedback when tab or decision changes
  useEffect(() => {
    const existing = getDecisionFeedback(decisionId, activeTab);
    if (existing) {
      setRating(existing.rating);
      setSelectedTag(existing.reason || null);
      setNote(existing.notes || '');
      setHasSubmittedDetails(true);
    } else {
      setRating(null);
      setSelectedTag(null);
      setNote('');
      setHasSubmittedDetails(false);
    }
  }, [decisionId, activeTab]);

  const handleRate = async (newRating: FeedbackRating) => {
    // If clicking same rating again, allow toggling or keep selected
    if (rating === newRating && hasSubmittedDetails) {
      return;
    }

    setRating(newRating);
    setSelectedTag(null);
    setHasSubmittedDetails(false);

    // Immediately persist initial rating
    const feedbackItem: InsightFeedbackItem = {
      rating: newRating,
      timestamp: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await saveDecisionFeedback(userId || null, decisionId, activeTab, feedbackItem);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(activeTab, feedbackItem);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetailedSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rating) return;

    setIsSaving(true);
    const trimmedNotes = note.trim();
    const feedbackItem: InsightFeedbackItem = {
      rating,
      timestamp: new Date().toISOString(),
      ...(selectedTag ? { reason: selectedTag } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };

    try {
      await saveDecisionFeedback(userId || null, decisionId, activeTab, feedbackItem);
      setHasSubmittedDetails(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(activeTab, feedbackItem);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setRating(null);
    setSelectedTag(null);
    setNote('');
    setHasSubmittedDetails(false);
    
    await removeDecisionFeedback(userId || null, decisionId, activeTab);
  };

  const positiveTags = [
    t.feedbackTagClear || 'Clear rationale',
    t.feedbackTagAccurate || 'Accurate trade-offs',
    t.feedbackTagActionable || 'Actionable advice',
  ];

  const negativeTags = [
    t.feedbackTagVague || 'Too vague or generic',
    t.feedbackTagMissingFactors || 'Missed important factors',
    t.feedbackTagBiased || 'Biased recommendation',
    t.feedbackTagUnrealistic || 'Unrealistic assumptions',
  ];

  const getTabLabel = () => {
    switch (activeTab) {
      case 'verdict':
        return t.tabVerdict || 'Verdict';
      case 'proscons':
        return t.tabProsCons || 'Pros & Cons';
      case 'matrix':
        return t.tabMatrix || 'Comparison Matrix';
      case 'swot':
        return t.tabSwot || 'SWOT Grid';
      case 'simulator':
        return t.tabSimulator || 'Simulator';
      default:
        return 'Analysis';
    }
  };

  return (
    <div 
      id={`insight-feedback-container-${activeTab}`}
      className="mt-8 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs p-4 sm:p-5 shadow-2xs transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Prompt Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.feedbackPrompt || 'Was this AI insight helpful?'}
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>{getTabLabel()}</span> &bull; <span>Rate to help improve future analysis</span>
            </p>
          </div>
        </div>

        {/* Thumbs Up / Down Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Thumbs Up */}
          <button
            id={`feedback-thumbs-up-btn-${activeTab}`}
            type="button"
            onClick={() => handleRate('thumbs-up')}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              rating === 'thumbs-up'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-2xs ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/80'
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${rating === 'thumbs-up' ? 'fill-emerald-500/30' : ''}`} />
            <span>{t.feedbackHelpful || 'Helpful'}</span>
          </button>

          {/* Thumbs Down */}
          <button
            id={`feedback-thumbs-down-btn-${activeTab}`}
            type="button"
            onClick={() => handleRate('thumbs-down')}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              rating === 'thumbs-down'
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-2xs ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/80'
            }`}
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${rating === 'thumbs-down' ? 'fill-rose-500/30' : ''}`} />
            <span>{t.feedbackNotHelpful || 'Needs Improvement'}</span>
          </button>

          {/* Reset / Change button */}
          {rating !== null && (
            <button
              id={`feedback-reset-btn-${activeTab}`}
              type="button"
              onClick={handleReset}
              title={t.feedbackChangeRating || 'Change rating'}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Feedback Details */}
      <AnimatePresence>
        {rating !== null && (
          <motion.div
            key={rating}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80">
              {hasSubmittedDetails ? (
                <div 
                  id={`feedback-success-banner-${activeTab}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-700 dark:text-neutral-300"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {rating === 'thumbs-up'
                        ? t.feedbackPositiveNotice || 'Thank you for your rating! This helps improve future recommendations.'
                        : t.feedbackNegativeNotice || 'Thanks for letting us know. What could be improved?'}
                    </span>
                    {selectedTag && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-700 text-[10px] font-medium text-neutral-800 dark:text-neutral-200">
                        {selectedTag}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasSubmittedDetails(false)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDetailedSubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {rating === 'thumbs-up'
                        ? 'What worked best? (Optional)'
                        : 'What could be improved? (Optional)'}
                    </p>
                    <span className="text-[10px] text-neutral-400">Optional</span>
                  </div>

                  {/* Quick Reason Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {(rating === 'thumbs-up' ? positiveTags : negativeTags).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Optional Note Textarea */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id={`feedback-note-input-${activeTab}`}
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t.feedbackAddNote || 'Add an optional note...'}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      id={`feedback-submit-btn-${activeTab}`}
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      <Send className="h-3 w-3" />
                      <span>{t.feedbackSubmit || 'Submit'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
