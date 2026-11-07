import React, { useState } from 'react';
import { 
  Languages, 
  X, 
  Check, 
  Sparkles, 
  Globe, 
  AlertCircle, 
  Search,
  ArrowRight
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';
import { SUPPORTED_LANGUAGES, LanguageOption, getTranslation } from '../utils/i18n';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: DecisionAnalysisResult;
  onTranslated: (translatedDecision: DecisionAnalysisResult) => void;
  currentLang: string;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  decision,
  onTranslated,
  currentLang,
}) => {
  const t = getTranslation(currentLang);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [customLanguage, setCustomLanguage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
  const targetLangToUse = customLanguage.trim() || selectedLangObj?.name || selectedLanguage;

  const handleTranslate = async () => {
    if (!targetLangToUse || isTranslating) return;
    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionData: decision,
          targetLanguage: targetLangToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to translate decision');
      }

      const translated: DecisionAnalysisResult = await response.json();
      onTranslated(translated);
      onClose();
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err?.message || 'Failed to translate report. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 dark:bg-neutral-950/70 p-4 backdrop-blur-xs">
      <div 
        id="translation-modal"
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-6 py-4 bg-neutral-50/70 dark:bg-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                {t.translateModalTitle || 'Translate Decision Report'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.translateModalDesc || 'Translate all arguments, matrices, SWOT & verdict into any language'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isTranslating}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Search languages */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              {t.translateModalSelectLang || 'Select Target Language'}
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter supported languages..."
                className="w-full rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Language grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguage === lang.code && !customLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setCustomLanguage('');
                    }}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom language input for any language in the world */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t.translateModalCustomLang || 'Or specify any other language in the world:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-slate-400" />
                <input
                  type="text"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  placeholder={t.translateModalCustomPlaceholder || 'e.g. Swahili, Hebrew, Greek, Bengali, Czech...'}
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none"
                />
              </div>
              {customLanguage && (
                <button
                  type="button"
                  onClick={() => setCustomLanguage('')}
                  className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 cursor-pointer"
                >
                  {t.templatesClear || 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-3 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-indigo-900 dark:text-indigo-200">
              Gemini translates all decision titles, trade-offs, pros & cons rationales, SWOT quadrants, matrix criteria, and action plan steps while strictly keeping your scores and option structure intact.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isTranslating}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t.translateModalCancel || 'Cancel'}
          </button>

          <button
            id="modal-confirm-translate-btn"
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !targetLangToUse}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-xs font-semibold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 transition-all shadow-2xs"
          >
            {isTranslating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>{t.translateModalTranslating || 'Translating with Gemini...'}</span>
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 text-indigo-200 dark:text-indigo-700" />
                <span>{t.translateModalActionBtn || 'Translate Report'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
