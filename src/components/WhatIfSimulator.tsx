import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FlaskConical,
  Flame
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types';
import { getTranslation } from '../utils/i18n';

interface WhatIfSimulatorProps {
  decision: DecisionAnalysisResult;
  currentLanguage?: string;
}

interface RefinementResult {
  recommendationShift: 'flips_verdict' | 'reinforces_verdict' | 'neutral_nuance';
  updatedWinningOption: string;
  advisorySummary: string;
  impactedFactors: string[];
  testableAction: string;
}

const SAMPLE_QUESTIONS = [
  "What if my budget is cut by 25%?",
  "What if I can negotiate 2 days/week of remote work?",
  "What if my spouse/family expresses hesitation?",
  "What if I try this for 6 months with an exit clause?",
  "What is the worst-case scenario if this fails completely?",
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ decision, currentLanguage = 'en' }) => {
  const t = getTranslation(currentLanguage);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RefinementResult | null>(null);

  const effectiveLanguage = decision.translatedTo || (decision.language && decision.language !== 'auto' ? decision.language : currentLanguage);

  const handleAsk = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/refine-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDecision: decision,
          followUpQuestion: promptText.trim(),
          targetLanguage: effectiveLanguage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze scenario');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error processing scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
            {t.simulatorTitle || '"What-If" Scenario Simulator'}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
          {t.simulatorSubtitle || 'Test changing assumptions, worst-case scenarios, or new constraints to see if they shift the winning recommendation.'}
        </p>

        {/* Quick Sample Questions */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">
            {t.simulatorPromptChipsTitle || 'Suggested Scenarios to Test:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  handleAsk(q);
                }}
                className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.simulatorInputPlaceholder || "Type custom scenario (e.g., What if I burn out after 6 months?)..."}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="shrink-0 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.simulatorRunningBtn || 'Simulating...'}</span>
              </>
            ) : (
              <>
                <span>{t.simulatorRunBtn || 'Simulate'}</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {t.tabSimulator || 'Scenario Result'}
              </span>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                Outcome for: "{question}"
              </h4>
            </div>

            {/* Shift Badge */}
            <div>
              {result.recommendationShift === 'flips_verdict' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <Flame className="h-3.5 w-3.5" />
                  {t.simulatorFlipsVerdict || 'Verdict Flips:'} {result.updatedWinningOption}
                </span>
              )}
              {result.recommendationShift === 'reinforces_verdict' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.simulatorReinforces || 'Verdict Reinforced:'} {result.updatedWinningOption}
                </span>
              )}
              {result.recommendationShift === 'neutral_nuance' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.simulatorNuance || 'Nuance Added: Maintain'} {result.updatedWinningOption}
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2">
            {result.advisorySummary?.split('\n\n').map((p, idx) => (
              <p key={idx}>{p}</p>
            )) || <p>{result.advisorySummary}</p>}
          </div>

          {result.impactedFactors && result.impactedFactors.length > 0 && (
            <div>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                {t.simulatorFactorsSensitive || 'Factors Most Sensitive to this Change:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.impactedFactors.map((f, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.testableAction && (
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 p-4">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <FlaskConical className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                {t.simulatorActionableTip || 'Recommended Test to Validate Before Committing:'}
              </span>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                {result.testableAction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
