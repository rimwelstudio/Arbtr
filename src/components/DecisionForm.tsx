import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Plus, Trash2, SlidersHorizontal, ArrowRight, HelpCircle, Check, Compass, Languages, Search, X } from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets';
import { DecisionPreset } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/i18n';
import { SuggestedPrioritiesDropdown } from './SuggestedPrioritiesDropdown';
import { COMMON_PRIORITIES_LIST as COMMON_PRIORITIES } from '../data/priorities';

interface DecisionFormProps {
  onSubmit: (title: string, context: string, options: string[], priorities: string[], targetLanguage?: string) => void;
  isLoading: boolean;
  loadingStep: string;
  currentLanguage: string;
  onOpenAbout?: () => void;
  onOpenTemplatesModal?: () => void;
  onOpenWelcome?: () => void;
  initialPreset?: DecisionPreset | null;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  isLoading,
  loadingStep,
  currentLanguage,
  onOpenAbout,
  onOpenTemplatesModal,
  onOpenWelcome,
  initialPreset,
}) => {
  const t = getTranslation(currentLanguage);

  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('arbitr_welcome_banner_dismissed') === 'true';
  });

  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'multi' | 'yesno'>('multi');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [context, setContext] = useState('');
  const [priorities, setPriorities] = useState<string[]>(['Financial Upside', 'Work-Life Balance']);
  const [customPriorityInput, setCustomPriorityInput] = useState('');
  const [recentlyAddedPriority, setRecentlyAddedPriority] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetLang, setTargetLang] = useState<string>(currentLanguage || 'auto');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    if (currentLanguage) {
      setTargetLang(currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (initialPreset) {
      setTitle(initialPreset.title);
      setContext(initialPreset.context);
      setOptions([...initialPreset.options]);
      setPriorities([...initialPreset.priorities]);
      setMode('multi');
      setActivePresetId(initialPreset.id);
    }
  }, [initialPreset]);

  const handleModeChange = (newMode: 'multi' | 'yesno') => {
    setMode(newMode);
    if (newMode === 'yesno') {
      setOptions(['Yes: Move forward with this choice', 'No: Decline / Maintain status quo']);
    } else {
      setOptions(['Option A', 'Option B']);
    }
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const togglePriority = (p: string) => {
    if (priorities.some((item) => item.toLowerCase() === p.toLowerCase())) {
      setPriorities(priorities.filter((item) => item.toLowerCase() !== p.toLowerCase()));
    } else {
      setPriorities([...priorities, p]);
      setRecentlyAddedPriority(p);
      setTimeout(() => setRecentlyAddedPriority(null), 3000);
    }
  };

  const removePriority = (p: string) => {
    setPriorities(priorities.filter((item) => item.toLowerCase() !== p.toLowerCase()));
  };

  const handleAddCustomPriority = (e?: React.KeyboardEvent | React.MouseEvent, overrideVal?: string) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const val = overrideVal !== undefined ? overrideVal : customPriorityInput;
    const trimmed = val.trim();
    if (!trimmed) return;

    const existingMatch = priorities.find((p) => p.toLowerCase() === trimmed.toLowerCase());
    if (!existingMatch) {
      setPriorities([...priorities, trimmed]);
      setRecentlyAddedPriority(trimmed);
      setTimeout(() => setRecentlyAddedPriority(null), 3000);
    } else {
      setRecentlyAddedPriority(existingMatch);
      setTimeout(() => setRecentlyAddedPriority(null), 3000);
    }
    // If entered directly, we keep the search or let them clear to see the result
  };

  // Comprehensive search match calculations (case-insensitive)
  const { matchingActive, matchingAvailable, exactMatchInActive } = useMemo(() => {
    const q = customPriorityInput.trim().toLowerCase();
    if (!q) {
      return {
        matchingActive: [] as string[],
        matchingAvailable: [] as string[],
        exactMatchInActive: false,
      };
    }

    const activeMatches = priorities.filter((p) => p.toLowerCase().includes(q));
    const availableMatches = COMMON_PRIORITIES.filter(
      (p) => p.toLowerCase().includes(q) && !priorities.some((ap) => ap.toLowerCase() === p.toLowerCase())
    );
    const hasExactInActive = priorities.some((p) => p.toLowerCase() === q);

    return {
      matchingActive: activeMatches,
      matchingAvailable: availableMatches,
      exactMatchInActive: hasExactInActive,
    };
  }, [customPriorityInput, priorities]);

  const applyPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions([...preset.options]);
    setPriorities([...preset.priorities]);
    setMode('multi');
    setActivePresetId(preset.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    const cleanedOptions = options.map((opt, i) => opt.trim() || `Option ${i + 1}`);
    const resolvedLang = targetLang === 'auto'
      ? 'auto'
      : (SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang);
    onSubmit(title.trim(), context.trim(), cleanedOptions, priorities, resolvedLang);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Welcome Note Banner on App Launch / Initial Screen */}
      {!welcomeBannerDismissed ? (
        <div 
          id="welcome-note-banner"
          className="mb-6 p-4 sm:p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent dark:from-cyan-950/40 dark:via-indigo-950/30 backdrop-blur-xs relative overflow-hidden transition-all shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <span className="text-2xl sm:text-3xl select-none shrink-0" role="img" aria-label="wave">👋</span>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {t.welcomeBannerNoteTitle || 'Welcome to Arbitr!'}
                  </h2>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                    AI Decision Intelligence
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 max-w-xl">
                  {t.welcomeBannerNoteDesc || 'State any crossroad or trade-off you are weighing. Our AI decision science engine will evaluate your options against your values and provide a clear, reasoned verdict.'}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {onOpenWelcome && (
                    <button
                      id="welcome-open-full-intro-btn"
                      type="button"
                      onClick={onOpenWelcome}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 dark:text-cyan-600" />
                      <span>{t.welcomeBannerGuideLink || 'Read Quick Introduction'} →</span>
                    </button>
                  )}
                  {onOpenAbout && (
                    <button
                      type="button"
                      onClick={onOpenAbout}
                      className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer px-1 py-1"
                    >
                      {t.whatIsArbitrLink || 'What is Arbitr & How it works'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              id="welcome-banner-dismiss-btn"
              type="button"
              onClick={() => {
                setWelcomeBannerDismissed(true);
                localStorage.setItem('arbitr_welcome_banner_dismissed', 'true');
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Dismiss welcome note"
              aria-label="Dismiss welcome note"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        onOpenWelcome && (
          <div className="mb-4 flex justify-center">
            <button
              id="reopen-welcome-note-pill"
              type="button"
              onClick={onOpenWelcome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all cursor-pointer shadow-2xs"
            >
              <span>👋 Welcome!</span>
              <span className="text-cyan-600 dark:text-cyan-400 underline font-semibold">{t.welcomeBannerGuideLink || 'Read Quick Introduction'}</span>
            </button>
          </div>
        )
      )}

      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t.formSystemBadge || 'Rational Cognitive Decision System'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
          {t.formHeading || 'Break the deadlocks in your life.'}
        </h1>
        <p className="text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3 tracking-tight">
          {t.appTagline || 'Stop overthinking. Start deciding.'}
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 text-base max-w-xl mx-auto leading-relaxed mb-3">
          {t.formSubheading || 'State the crossroad you are facing. Get a side-by-side pros & cons list, criteria comparison matrix, SWOT analysis, and a decisive verdict.'}
        </p>
        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>{t.whatIsArbitrLink || 'What is Arbitr & How it works →'}</span>
          </button>
        )}
      </div>

      {/* Preset Quick-Picks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-neutral-400 dark:text-slate-400" />
            {t.quickPresetsTitle || 'Quick Presets / Inspiration:'}
          </span>
          {onOpenTemplatesModal && (
            <button
              id="form-browse-all-templates-btn"
              type="button"
              onClick={onOpenTemplatesModal}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              <span>{t.exploreAllTemplates || 'Explore All Templates'} ({DECISION_PRESETS.length}) →</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {DECISION_PRESETS.slice(0, 4).map((preset) => {
            const isCurrentActive = activePresetId === preset.id || title === preset.title;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all text-left shadow-2xs cursor-pointer ${
                  isCurrentActive
                    ? 'border-indigo-500/80 bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 ring-1 ring-indigo-400'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="text-neutral-400 dark:text-slate-400 mr-1.5">[{preset.category}]</span>
                {preset.title.length > 38 ? preset.title.slice(0, 38) + '...' : preset.title}
                {isCurrentActive && <span className="ml-1.5 text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
        {/* Decision Title */}
        <div className="mb-6">
          <label htmlFor="decision-title" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
            {t.fieldTitleLabel || 'What decision do you need to make?'} <span className="text-rose-500">*</span>
          </label>
          <input
            id="decision-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.fieldTitlePlaceholder || 'e.g., Should I take the new job in Seattle or stay at my current role?'}
            className="w-full rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 px-4 py-3 text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:focus:ring-cyan-400 transition-all"
          />
        </div>

        {/* Mode Selector */}
        <div className="mb-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {t.decisionStructure || 'Decision Structure'}
          </span>
          <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200/60 dark:border-neutral-700">
            <button
              type="button"
              id="mode-multi-btn"
              onClick={() => handleModeChange('multi')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === 'multi'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {t.compareOptions || 'Compare Options'}
            </button>
            <button
              type="button"
              id="mode-yesno-btn"
              onClick={() => handleModeChange('yesno')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === 'yesno'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {t.yesNoEvaluation || 'Yes / No Evaluation'}
            </button>
          </div>
        </div>

        {/* Options Input List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.fieldOptionsLabel || 'Options to Evaluate'}
            </label>
            {mode === 'multi' && options.length < 5 && (
              <motion.button
                type="button"
                id="add-option-btn"
                onClick={handleAddOption}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addOptionBtn || 'Add Another Option'}
              </motion.button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1} title`}
                  className="w-full rounded-lg border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:focus:ring-cyan-400 transition-all"
                />
                {mode === 'multi' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Priority Chips */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="priority-search-input" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.fieldPrioritiesLabel || 'Core Priorities & Values (What matters most to you?)'}
            </label>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
              {priorities.length} active
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            {t.fieldPrioritiesHelp || 'Helps the AI score each option according to your values and priorities.'}
          </p>

          {/* Active Selected Priorities Strip */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400 dark:text-slate-400">
                {t.activePriorities || 'Active Priorities'} ({priorities.length} {t.activePrioritiesCount || 'active'})
              </span>
              {priorities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPriorities([])}
                  className="text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {t.clearAll || 'Clear all'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60">
              {priorities.length === 0 ? (
                <span className="text-xs text-neutral-400 dark:text-slate-400 italic px-1">
                  {t.noPrioritiesSelected || 'No priorities selected yet. Pick from the suggestions below or search/type custom values.'}
                </span>
              ) : (
                priorities.map((p) => {
                  const isJustAdded = recentlyAddedPriority?.toLowerCase() === p.toLowerCase();
                  const isSearchMatch = customPriorityInput.trim() && p.toLowerCase().includes(customPriorityInput.trim().toLowerCase());
                  return (
                    <span
                      key={p}
                      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold shadow-2xs group transition-all animate-in fade-in zoom-in-95 duration-150 ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-neutral-900 scale-105'
                          : isSearchMatch
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/80 dark:ring-indigo-300'
                            : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${isJustAdded ? 'text-white' : 'text-emerald-400 dark:text-emerald-600'} shrink-0`} />
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => removePriority(p)}
                        className="p-0.5 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 text-neutral-300 dark:text-slate-400 hover:text-white dark:hover:text-neutral-900 transition-colors cursor-pointer"
                        title={`Remove ${p}`}
                        aria-label={`Remove ${p}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Search & Custom Priority Input Bar */}
          <div className="relative mb-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                id="priority-search-input"
                type="text"
                value={customPriorityInput}
                onChange={(e) => setCustomPriorityInput(e.target.value)}
                onKeyDown={(e) => handleAddCustomPriority(e)}
                placeholder={t.priorityPlaceholder || "Search values or type custom criteria (e.g., Short commute, Kid's schools, High equity)..."}
                className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-hidden transition-all shadow-2xs"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                {customPriorityInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPriorityInput('');
                      setRecentlyAddedPriority(null);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-md cursor-pointer"
                    title={t.clearSearch || 'Clear search'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddCustomPriority()}
                  disabled={!customPriorityInput.trim()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    customPriorityInput.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs cursor-pointer'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    {t.addPriorityBtn || 'Add'}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Search Results / Instant Add Dropdown */}
            {customPriorityInput.trim() && (
              <div className="mt-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl space-y-3 z-10 relative animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Visual feedback banner when recently added */}
                {recentlyAddedPriority && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.priorityAddedFeedback || 'Added to active priorities:'} <strong>&ldquo;{recentlyAddedPriority}&rdquo;</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setRecentlyAddedPriority(null)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Section 1: Active Priorities matching search */}
                {matchingActive.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 px-1 py-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{t.priorityActiveInDecision || 'Active in Your Decision'} ({matchingActive.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {matchingActive.map((p) => (
                        <div
                          key={p}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
                        >
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{p}</span>
                          <button
                            type="button"
                            onClick={() => removePriority(p)}
                            className="p-0.5 text-emerald-600 dark:text-emerald-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors ml-1 cursor-pointer"
                            title={`Remove ${p}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: Available suggestions matching search */}
                {matchingAvailable.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-slate-400 px-1 py-0.5">
                      {t.priorityAvailableSuggestions || 'Available Suggestions'} ({matchingAvailable.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {matchingAvailable.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleAddCustomPriority(undefined, p)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-neutral-400" />
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: Add as custom priority if not exact match */}
                {!exactMatchInActive && (
                  <button
                    type="button"
                    onClick={() => handleAddCustomPriority(undefined, customPriorityInput)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors text-left cursor-pointer border border-indigo-200/80 dark:border-indigo-800/60"
                  >
                    <span className="flex items-center gap-1.5 truncate mr-2">
                      <Plus className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span>{t.addAsCustomPriority || 'Add as custom priority:'} <strong>&ldquo;{customPriorityInput.trim()}&rdquo;</strong></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-mono opacity-80 shrink-0 bg-indigo-200/60 dark:bg-indigo-900 px-1.5 py-0.5 rounded">
                      Enter ↵
                    </span>
                  </button>
                )}

                {/* If nothing matches suggestions and already in active */}
                {matchingAvailable.length === 0 && exactMatchInActive && matchingActive.length > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 px-1 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> &ldquo;{customPriorityInput.trim()}&rdquo; {t.alreadyActiveInPriorities || 'is already active in your decision priorities above.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Suggested Common Priorities Dropdown with Tick options and Value Sorting */}
          <div className="pt-1.5">
            <SuggestedPrioritiesDropdown
              selectedPriorities={priorities}
              onTogglePriority={togglePriority}
              onClearAllPriorities={() => setPriorities([])}
              onSelectMultiple={(newPriorities) => {
                const combined = [...priorities];
                newPriorities.forEach((p) => {
                  if (!combined.some((item) => item.toLowerCase() === p.toLowerCase())) {
                    combined.push(p);
                  }
                });
                setPriorities(combined);
              }}
            />
          </div>
        </div>

        {/* Context & Constraints (Expandable / Clean) */}
        <div className="mb-6 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              {t.fieldContextLabel || 'Detailed Context, Numbers & Constraints'}
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                {context ? (t.contextIncluded || '(Included)') : (t.contextOptional || '(Optional, increases accuracy)')}
              </span>
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {showAdvanced ? (t.hideLabel || 'Hide') : (t.expandLabel || 'Expand')}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-3">
              <textarea
                id="decision-context"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t.fieldContextPlaceholder || 'Include key numbers (salaries, savings, commute time), emotional stakes, spouse/family concerns, or timelines...'}
                className="w-full rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 p-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:focus:ring-cyan-400 transition-all"
              />
            </div>
          )}
        </div>

        {/* Target Language Selection */}
        <div className="mb-6 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label htmlFor="form-target-language" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {t.targetLanguageLabel || 'Generate Analysis In Language:'}
              </label>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t.targetLanguageHelp || 'Gemini will produce the complete breakdown natively in this language.'}
              </p>
            </div>

            <select
              id="form-target-language"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-white focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none"
            >
              <option value="auto" className="bg-slate-900 text-white">🌐 {t.targetLanguageAuto || 'Auto-detect from input'}</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            id="break-the-tie-btn"
            type="submit"
            disabled={isLoading || !title.trim()}
            whileHover={isLoading || !title.trim() ? undefined : { scale: 1.02 }}
            whileTap={isLoading || !title.trim() ? undefined : { scale: 0.98 }}
            className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-6 py-3.5 text-base font-semibold text-white dark:text-neutral-900 shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900" />
                <span>{loadingStep || t.analyzingBtn || 'Analyzing Decision Matrix...'}</span>
              </div>
            ) : (
              <>
                <span>{t.breakTheTieBtn || 'Break the Tie'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};
