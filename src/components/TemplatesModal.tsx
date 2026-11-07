import React, { useState, useMemo } from 'react';
import { Compass, X, Search, Check, Sparkles, ArrowRight, Layers, Play } from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets';
import { DecisionPreset } from '../types';
import { getTranslation } from '../utils/i18n';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DecisionPreset, runImmediately?: boolean) => void;
  currentLanguage: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    DECISION_PRESETS.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter presets
  const filteredPresets = useMemo(() => {
    return DECISION_PRESETS.filter((preset) => {
      const matchesCategory =
        selectedCategory === 'All' || preset.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        preset.title.toLowerCase().includes(q) ||
        preset.context.toLowerCase().includes(q) ||
        preset.category.toLowerCase().includes(q) ||
        preset.options.some((opt) => opt.toLowerCase().includes(q)) ||
        preset.priorities.some((pri) => pri.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="templates-modal-title"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 id="templates-modal-title" className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {t.navPresets || 'Decision Templates & Dilemmas'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.templatesModalSubtitle || 'Select a real-world case study to immediately populate the framework or run automated arbitration.'}
              </p>
            </div>
          </div>
          <button
            id="close-templates-modal-btn"
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label={t.templatesClose || 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 sm:px-6 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.templatesSearchPlaceholder || 'Search templates by dilemma, keyword, or decision criteria...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-slate-900/90 border border-neutral-200 dark:border-white/15 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {t.templatesClear || 'Clear'}
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat === 'All' ? (t.all || 'All') : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Template Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <Compass className="h-10 w-10 mx-auto text-neutral-300 dark:text-slate-400 mb-2" />
              <p className="font-semibold text-sm">{t.templatesNoMatchTitle || 'No dilemma templates matched your search.'}</p>
              <p className="text-xs mt-1">{t.templatesNoMatchDesc || 'Try searching with a broader keyword or choose another category.'}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t.templatesResetFilters || 'Reset filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex flex-col justify-between rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div>
                    {/* Category pill */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                        {preset.category}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {preset.options.length} {t.fieldOptionsLabel || 'Options'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2">
                      {preset.title}
                    </h3>

                    {/* Context description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
                      {preset.context}
                    </p>

                    {/* Options Preview */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                        {t.templatesCompetingPaths || 'Competing Paths:'}
                      </div>
                      {preset.options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 px-2.5 py-1 rounded-md border border-neutral-200/60 dark:border-neutral-800"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-[10px] font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Evaluation Priorities */}
                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">
                        {t.templatesDecisionPriorities || 'Key Decision Priorities:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.priorities.map((pri, i) => (
                          <span
                            key={i}
                            className="inline-block text-[10px] px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium"
                          >
                            {pri}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset, false);
                        onClose();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>{t.templatesLoadIntoForm || t.loadPresetBtn || 'Load Into Form'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset, true);
                        onClose();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{t.templatesAnalyze || 'Analyze'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
          <span>{filteredPresets.length} {t.navPresets || 'templates'}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-600 dark:text-neutral-300 font-medium hover:underline cursor-pointer"
          >
            {t.templatesClose || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
