import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  Lightbulb, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { OptionAnalysis, SWOTQuadrant } from '../types';
import { getTranslation } from '../utils/i18n';

interface SwotViewProps {
  options: OptionAnalysis[];
  swotAnalysis: Record<string, SWOTQuadrant>;
  currentLanguage?: string;
}

export const SwotView: React.FC<SwotViewProps> = ({
  options,
  swotAnalysis,
  currentLanguage,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || '');
  const currentOption = options.find((o) => o.id === selectedOptionId) || options[0];
  const t = getTranslation(currentLanguage);

  // SWOT for this option
  const swot: SWOTQuadrant = swotAnalysis[currentOption?.id] || {
    strengths: ['Strong core upside', 'Clear short-term momentum'],
    weaknesses: ['Requires initial friction', 'Uncertain transition curve'],
    opportunities: ['Compound long-term leverage', 'Opens up adjacent paths'],
    threats: ['External market shifts', 'Execution fatigue'],
    strategicImplication: 'Prioritize risk containment while securing immediate quick wins.',
  };

  if (!currentOption) {
    return <div className="text-center py-12 text-neutral-500">{t.noDataFound || 'No SWOT data available.'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Option Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{t.tabSwot || 'SWOT Strategic Analysis'}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.swotSubtitle || 'Internal factors (Strengths & Weaknesses) vs. External dynamics (Opportunities & Threats)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt, idx) => {
            const isSelected = opt.id === currentOption.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* STRENGTHS */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">{t.swotStrengths || 'Strengths'}</h4>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {t.swotInternalAdvantages || 'Internal Advantages'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
              S
            </span>
          </div>

          <ul className="space-y-2.5">
            {swot.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">{t.swotWeaknesses || 'Weaknesses'}</h4>
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {t.swotInternalDeficits || 'Internal Deficits & Friction'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
              W
            </span>
          </div>

          <ul className="space-y-2.5">
            {swot.weaknesses?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50/30 dark:bg-sky-950/20 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">{t.swotOpportunities || 'Opportunities'}</h4>
                <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                  {t.swotExternalTailwinds || 'External Tailwinds & Growth'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 px-2.5 py-0.5 rounded-full">
              O
            </span>
          </div>

          <ul className="space-y-2.5">
            {swot.opportunities?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* THREATS */}
        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/20 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">{t.swotThreats || 'Threats'}</h4>
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  {t.swotExternalRisks || 'External Risks & Hazards'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full">
              T
            </span>
          </div>

          <ul className="space-y-2.5">
            {swot.threats?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Synthesis Card */}
      {swot.strategicImplication && (
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-950 text-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-300">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                {t.swotStrategicTakeaway || 'Strategic SWOT Takeaway for'} {currentOption.name}
              </h4>
              <p className="text-sm sm:text-base text-neutral-200 font-medium leading-relaxed">
                {swot.strategicImplication}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
