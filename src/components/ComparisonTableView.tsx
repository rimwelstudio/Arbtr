import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Table, 
  Sliders, 
  Trophy, 
  HelpCircle, 
  Info, 
  RotateCcw,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { OptionAnalysis, ComparisonCriterion } from '../types';
import { getTranslation } from '../utils/i18n';
import { AnimatedCounter } from './AnimatedCounter';

interface ComparisonTableViewProps {
  options: OptionAnalysis[];
  criteria: ComparisonCriterion[];
  summary: string;
  currentLanguage?: string;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  options,
  criteria: initialCriteria,
  summary,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialCriteria.forEach((c) => {
      map[c.id] = c.importanceWeight || 3;
    });
    return map;
  });

  const [expandedCriterionId, setExpandedCriterionId] = useState<string | null>(null);

  // Update a specific criterion weight
  const handleWeightChange = (id: string, weight: number) => {
    setWeights((prev) => ({
      ...prev,
      [id]: weight,
    }));
  };

  const handleResetWeights = () => {
    const map: Record<string, number> = {};
    initialCriteria.forEach((c) => {
      map[c.id] = c.importanceWeight || 3;
    });
    setWeights(map);
  };

  // Calculate weighted composite score for each option
  // Score is out of 100
  const optionScores: Record<string, { totalWeightedScore: number; maxPossible: number; percentage: number }> = {};
  
  options.forEach((opt) => {
    let weightedSum = 0;
    let totalWeight = 0;

    initialCriteria.forEach((crit) => {
      const w = weights[crit.id] ?? (crit.importanceWeight || 3);
      const score = crit.scores[opt.id] ?? 5; // 1-10 scale
      weightedSum += score * w;
      totalWeight += 10 * w; // max 10 per criterion
    });

    const percentage = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 50;
    optionScores[opt.id] = {
      totalWeightedScore: weightedSum,
      maxPossible: totalWeight,
      percentage,
    };
  });

  // Find leading option by weighted score
  const sortedOptions = [...options].sort(
    (a, b) => (optionScores[b.id]?.percentage || 0) - (optionScores[a.id]?.percentage || 0)
  );
  const leadingOption = sortedOptions[0];

  return (
    <div className="space-y-6">
      {/* Executive Summary & Dynamic Winner Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Table className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">{t.comparisonMatrixOverview || 'Comparison Matrix Overview'}</h3>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {summary || (t.comparisonMatrixDefaultSummary || "Here is how each option stacks up across the primary strategic dimensions.")}
            </p>
          </div>
          
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{t.matrixTip || 'Tip: Drag importance sliders below to test how personal priorities shift rankings'}</span>
            <motion.button
              type="button"
              onClick={handleResetWeights}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              {t.btnResetWeights || 'Reset Weights'}
            </motion.button>
          </div>
        </div>

        {/* Dynamic Leaderboard Based on Current Weights */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-950 text-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                {t.weightedLeader || 'Weighted Leader'}
              </span>
              <span className="text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full text-neutral-300">
                {t.interactiveModel || 'Interactive Model'}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-1">
              {leadingOption?.name || 'Option A'}
            </h4>
            <p className="text-xs text-neutral-400">
              {t.scoreLabel || 'Score:'}{' '}
              <span className="text-white font-semibold text-sm">
                <AnimatedCounter value={optionScores[leadingOption?.id]?.percentage || 0} suffix="%" />
              </span>{' '}
              {t.matchWithPriorities || 'match with current priorities'}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {options.map((opt) => {
              const score = optionScores[opt.id]?.percentage || 0;
              const isWinner = opt.id === leadingOption?.id;
              return (
                <div key={opt.id} className="text-xs">
                  <div className="flex justify-between mb-1 font-medium">
                    <span className={isWinner ? 'text-indigo-300 font-bold' : 'text-neutral-300'}>
                      {opt.name}
                    </span>
                    <span className={isWinner ? 'text-white font-bold' : 'text-neutral-400'}>
                      <AnimatedCounter value={score} suffix="%" />
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isWinner ? 'bg-indigo-400' : 'bg-neutral-600'
                      }`}
                      animate={{ width: `${score}%` }}
                      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Comparison Table */}
      <div>
        <div className="flex sm:hidden items-center justify-end gap-1 text-[11px] text-neutral-400 dark:text-slate-400 mb-1.5 px-1">
          <span>Swipe horizontally to compare</span>
          <span>→</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/80">
                <th className="py-3.5 px-4 text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider min-w-[200px]">
                  {t.evalCriteriaHeader || 'Evaluation Criteria & Priority'}
                </th>
                {options.map((opt) => {
                  const isLeader = opt.id === leadingOption?.id;
                  return (
                    <th
                      key={opt.id}
                      className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider min-w-[180px] ${
                        isLeader ? 'bg-indigo-50/40 dark:bg-indigo-950/40 text-neutral-900 dark:text-neutral-100 border-l border-r border-indigo-100 dark:border-indigo-900/60' : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.name}</span>
                        {isLeader && (
                          <span className="text-[10px] bg-neutral-900 dark:bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {t.leaderBadge || 'Leader'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              {initialCriteria.map((criterion) => {
                const currentWeight = weights[criterion.id] ?? (criterion.importanceWeight || 3);
                const isExpanded = expandedCriterionId === criterion.id;

                return (
                  <tr key={criterion.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Criteria Name & Weight Controller */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {criterion.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedCriterionId(isExpanded ? null : criterion.id)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-0.5"
                            title="Toggle details"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {criterion.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {criterion.description}
                          </p>
                        )}

                        {/* Interactive Weight Slider */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                            <span>{t.importanceWeightLabel || 'Importance Weight:'}</span>
                            <motion.span
                              key={currentWeight}
                              initial={{ scale: 1.25 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                              className="font-bold text-indigo-600 dark:text-indigo-400 inline-block"
                            >
                              {currentWeight}x
                            </motion.span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={currentWeight}
                            onChange={(e) => handleWeightChange(criterion.id, parseInt(e.target.value, 10))}
                            className="h-1.5 w-full cursor-pointer accent-indigo-600 dark:accent-indigo-500 bg-neutral-200 dark:bg-neutral-700 rounded-lg transition-all"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Option Scores & Rationale */}
                    {options.map((opt) => {
                      const score = criterion.scores[opt.id] ?? 5; // 1-10
                      const explanation = criterion.explanations[opt.id];
                      const isLeadingForThisCriterion = criterion.leadingOptionId === opt.id;
                      const isOverallLeader = opt.id === leadingOption?.id;

                      return (
                        <td
                          key={opt.id}
                          className={`py-4 px-4 align-top ${
                            isOverallLeader ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-l border-r border-indigo-100 dark:border-indigo-900/40' : ''
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-base font-bold ${
                                  score >= 8
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : score >= 6
                                    ? 'text-neutral-900 dark:text-neutral-100'
                                    : 'text-amber-700 dark:text-amber-400'
                                }`}>
                                  {score}
                                </span>
                                <span className="text-xs text-neutral-400 dark:text-slate-400">/ 10</span>
                              </div>

                              {isLeadingForThisCriterion && (
                                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                  {t.advantageBadge || 'Advantage'}
                                </span>
                              )}
                            </div>

                            {/* Mini Score Bar with Spring Transition */}
                            <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  score >= 8
                                    ? 'bg-emerald-500'
                                    : score >= 6
                                    ? 'bg-neutral-700 dark:bg-neutral-300'
                                    : 'bg-amber-400'
                                }`}
                                animate={{ width: `${score * 10}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                              />
                            </div>

                            {/* Rationale explanation */}
                            {explanation && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                {explanation}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};
