import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  HeartHandshake, 
  Clock, 
  CheckSquare, 
  Square, 
  Sparkles, 
  ArrowRight,
  Radio
} from 'lucide-react';
import { HumanoidIcon } from './HumanoidIcon';
import { TiebreakerVerdict, OptionAnalysis } from '../types';
import { getTranslation } from '../utils/i18n';
import { ArbitrEmblem } from './ArbitrLogo';
import { DecisionIntelligenceSeal } from './DecisionIntelligenceSeal';
import { AnimatedCounter } from './AnimatedCounter';

interface VerdictViewProps {
  verdict: TiebreakerVerdict;
  options: OptionAnalysis[];
  onNavigateToTab: (tab: 'proscons' | 'matrix' | 'swot') => void;
  onOpenLiveVoice?: () => void;
  currentLanguage?: string;
}

interface ParsedActionStep {
  stepNumber: number;
  title: string;
  description: string;
}

function parseActionStepItem(step: any, idx: number, recommendedName: string): ParsedActionStep {
  const fallbackTitles = [
    `Formalize commitment to ${recommendedName || 'the recommended path'}`,
    'Align and communicate with key stakeholders',
    'Execute 48-hour immediate micro-milestone',
    'Set up progress review and risk safeguards',
    'Re-evaluate outcomes after 30 days',
  ];

  const defaultTitle = fallbackTitles[idx % fallbackTitles.length];

  if (typeof step === 'string') {
    const raw = step.trim();
    // Clean leading "Step 1:" or "1." only if there's actual text remaining
    const cleaned = raw.replace(/^(step\s*\d+[:.-]?|\d+[:.-]?)\s*/i, '').trim();
    const effectiveText = cleaned.length > 0 ? cleaned : raw;

    const colonIdx = effectiveText.indexOf(':');
    const dashIdx = effectiveText.indexOf(' - ');

    if (colonIdx > 0 && colonIdx < 60) {
      const titlePart = effectiveText.slice(0, colonIdx).trim();
      const descPart = effectiveText.slice(colonIdx + 1).trim();
      return {
        stepNumber: idx + 1,
        title: titlePart || defaultTitle,
        description: descPart,
      };
    }
    if (dashIdx > 0 && dashIdx < 60) {
      const titlePart = effectiveText.slice(0, dashIdx).trim();
      const descPart = effectiveText.slice(dashIdx + 3).trim();
      return {
        stepNumber: idx + 1,
        title: titlePart || defaultTitle,
        description: descPart,
      };
    }
    return {
      stepNumber: idx + 1,
      title: effectiveText || defaultTitle,
      description: '',
    };
  }

  if (typeof step === 'object' && step !== null) {
    const stepNumber = typeof step.step === 'number' ? step.step : idx + 1;
    
    // Comprehensive key resolution
    const rawTitle =
      step.title ||
      step.action ||
      step.task ||
      step.name ||
      step.heading ||
      step.summary ||
      step.what ||
      step.actionItem ||
      step.action_item ||
      step.step_title ||
      step.actionTitle ||
      step.milestone ||
      step.recommendation ||
      step.titre ||
      step.titulo ||
      step.título ||
      step.titel ||
      step.bezeichnung ||
      step.schritt ||
      step.titolo ||
      step.标题 ||
      step.行动 ||
      step.任务 ||
      step.名称 ||
      step.步骤 ||
      step.事项 ||
      '';

    const rawDesc =
      step.description ||
      step.detail ||
      step.details ||
      step.text ||
      step.summary ||
      step.instruction ||
      step.notes ||
      step.timeline ||
      step.timeframe ||
      step.how ||
      step.step_description ||
      step.actionDescription ||
      step.texte ||
      step.texto ||
      step.beschreibung ||
      step.dettagli ||
      step.描述 ||
      step.详情 ||
      step.说明 ||
      step.内容 ||
      step.措施 ||
      '';

    let strTitle = String(rawTitle).trim();
    let strDesc = String(rawDesc).trim();

    // If title is just a placeholder like "Step 1", "Action Step 1", or empty, prefer description
    const isPlaceholderTitle = !strTitle || /^(step\s*\d+|action\s*step\s*\d+|\d+)$/i.test(strTitle);
    if (isPlaceholderTitle && strDesc) {
      const colonIdx = strDesc.indexOf(':');
      if (colonIdx > 0 && colonIdx < 60) {
        strTitle = strDesc.slice(0, colonIdx).trim();
        strDesc = strDesc.slice(colonIdx + 1).trim();
      } else {
        strTitle = strDesc;
        strDesc = '';
      }
    }

    // If both still empty, search other string values in the object
    if (!strTitle && !strDesc) {
      const nonIdStrings = Object.entries(step)
        .filter(([k, v]) => !['id', 'step', 'stepNumber', 'number'].includes(k) && typeof v === 'string' && v.trim().length > 0)
        .map(([, v]) => String(v).trim());
      if (nonIdStrings.length >= 2) {
        strTitle = nonIdStrings[0];
        strDesc = nonIdStrings[1];
      } else if (nonIdStrings.length === 1) {
        strTitle = nonIdStrings[0];
      }
    }

    // If title has a colon and no description, split it
    if (strTitle && !strDesc) {
      const colonIdx = strTitle.indexOf(':');
      const dashIdx = strTitle.indexOf(' - ');
      if (colonIdx > 0 && colonIdx < 60) {
        strDesc = strTitle.slice(colonIdx + 1).trim();
        strTitle = strTitle.slice(0, colonIdx).trim();
      } else if (dashIdx > 0 && dashIdx < 60) {
        strDesc = strTitle.slice(dashIdx + 3).trim();
        strTitle = strTitle.slice(0, dashIdx).trim();
      }
    }

    // Strip "Step 1:" prefix from title if it remains
    strTitle = strTitle.replace(/^(step\s*\d+[:.-]?|\d+[:.-]?)\s*/i, '').trim();

    return {
      stepNumber,
      title: strTitle || defaultTitle,
      description: strDesc && strDesc !== strTitle ? strDesc : '',
    };
  }

  return {
    stepNumber: idx + 1,
    title: defaultTitle,
    description: '',
  };
}

export const VerdictView: React.FC<VerdictViewProps> = ({
  verdict,
  options,
  onNavigateToTab,
  onOpenLiveVoice,
  currentLanguage,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [gutCheckRevealed, setGutCheckRevealed] = useState(false);
  const t = getTranslation(currentLanguage);

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  // Safe, robust action steps with contextual defaults if empty
  const actionSteps: ParsedActionStep[] = useMemo(() => {
    const recommendedName = verdict.recommendedOptionName || 'Recommended Choice';

    let rawList: any[] = [];
    if (Array.isArray(verdict.actionPlan) && verdict.actionPlan.length > 0) {
      rawList = verdict.actionPlan;
    } else if (typeof verdict.actionPlan === 'string' && (verdict.actionPlan as string).trim().length > 0) {
      rawList = (verdict.actionPlan as string).split(/\n+/).map((l) => l.trim()).filter(Boolean);
    } else if (typeof verdict.actionPlan === 'object' && verdict.actionPlan !== null) {
      const obj = verdict.actionPlan as any;
      if (Array.isArray(obj.steps)) rawList = obj.steps;
      else if (Array.isArray(obj.actions)) rawList = obj.actions;
      else if (Array.isArray(obj.actionPlan)) rawList = obj.actionPlan;
      else rawList = Object.values(obj);
    }

    if (rawList.length > 0) {
      const parsed = rawList.map((step, idx) => parseActionStepItem(step, idx, recommendedName));
      if (parsed.some((s) => s.title && s.title.trim().length > 0)) {
        return parsed;
      }
    }

    return [
      {
        stepNumber: 1,
        title: `Formalize Commitment to ${recommendedName}`,
        description: 'Document your choice and set an explicit timeline to eliminate second-guessing.',
      },
      {
        stepNumber: 2,
        title: 'Align Key Stakeholders',
        description: 'Communicate the decision clearly to all affected individuals and set expectations.',
      },
      {
        stepNumber: 3,
        title: 'Execute 48-Hour Micro-Milestone',
        description: 'Take one low-friction, irreversible action right away to lock in positive momentum.',
      },
    ];
  }, [verdict.actionPlan, verdict.recommendedOptionName]);

  return (
    <div className="space-y-6">
      {/* Primary Verdict Banner */}
      <motion.div 
        id="primary-verdict-recommendation-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1.0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-neutral-800/80 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ring-1 ring-cyan-500/20"
      >
        {/* Subtle Breathing Glow Aura */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 pointer-events-none"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-xs border border-cyan-500/30 shadow-xs">
                <ArbitrEmblem className="h-4 w-4" glow={true} animated={true} />
                <span className="font-bold tracking-wider">{t.verdictBannerBadge || 'Arbitr Decision'}</span>
              </div>
              <div className="hidden sm:inline-flex">
                <DecisionIntelligenceSeal variant="badge" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">{t.verdictConfidence || 'Confidence'}:</span>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <AnimatedCounter value={verdict.confidenceScore || 85} suffix="%" />
                <span>{t.verdictAlignment || 'Alignment'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              {t.verdictWinningRecommendation || 'Recommended Path Forward'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{verdict.recommendedOptionName}</span>
              <span className="text-emerald-400 text-xl font-normal">✓</span>
            </h2>
          </div>

          {/* The Tiebreaker Factor Banner */}
          <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 backdrop-blur-xs">
            <div className="flex items-center gap-2 mb-1.5 text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t.verdictTiebreakerFactor || 'The Decisive Pivot Point'}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-neutral-200 font-medium leading-relaxed">
              "{verdict.theTiebreakerFactor}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Spoken Voice Deliberation Banner */}
      {onOpenLiveVoice && (
        <div 
          id="verdict-live-voice-callout"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/60 dark:from-indigo-950/40 dark:via-neutral-900 dark:to-indigo-950/20 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 dark:bg-neutral-800 text-cyan-400 border border-neutral-700/80 shadow-sm shadow-cyan-500/10">
              <HumanoidIcon size={22} animated={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {t.verdictVoiceHeading || 'Talk Through This Verdict with Zena'}
                </h4>
                <span className="rounded bg-cyan-100 dark:bg-cyan-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
                  {t.liveVoiceWakePrompt || 'Wake: "Hey Zena"'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {t.verdictVoiceDescription || 'Have a real-time spoken deliberation with Zena to stress-test this verdict or debate trade-offs. Just say "Hey Zena" anytime or click below.'}
              </p>
            </div>
          </div>
          <motion.button
            id="verdict-start-live-voice-btn"
            type="button"
            onClick={onOpenLiveVoice}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <HumanoidIcon size={16} animated={true} />
            <span>{t.verdictVoiceButton || 'Consult Zena'}</span>
          </motion.button>
        </div>
      )}

      {/* Core Reasoning & Decision Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deep Strategic Rationale */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t.verdictCoreReasoning || 'Executive Decision Rationale'}
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 space-y-3 leading-relaxed">
              {verdict.coreReasoning?.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {verdict.regretMinimizationCheck && (
            <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-4 border border-neutral-200/70 dark:border-neutral-700/60">
                <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    {t.verdictRegretCheck || 'Regret Minimization Test (10 / 10 / 10 Framework)'}
                  </h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">
                    {verdict.regretMinimizationCheck}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gut Check & Instinct Validation */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t.verdictGutCheck || 'The Gut-Check Test'}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
              {t.verdictGutSubtitle || 'Cognitive science shows true preferences often reveal themselves before logic catches up.'}
            </p>

            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 p-4">
              <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 mb-2 uppercase tracking-wide">
                {t.verdictGutPromptLabel || 'Intuitive Prompt:'}
              </p>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
                "{verdict.gutCheckQuestion || 'Imagine a coin was tossed and made this choice for you. In the first 2 seconds, did you feel relieved or let down?'}"
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setGutCheckRevealed(!gutCheckRevealed)}
              className="w-full text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {gutCheckRevealed ? (t.gutCheckHide || 'Hide Instinct Interpretation') : (t.gutCheckInterpret || 'How to interpret your gut reaction?')}
            </button>
            {gutCheckRevealed && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700 leading-normal">
                {t.gutCheckExplanation || 'If reading this verdict brings a subtle sigh of relief, commit immediately. If it creates persistent inner resistance, that resistance points to an unspoken core value.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Plan & Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Action Plan */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t.verdictActionPlan || 'Immediate Execution Checklist'}
              </h3>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {completedSteps.length} {t.stepsDoneOf || 'of'} {actionSteps.length} {t.stepsDoneLabel || 'done'}
            </span>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            {t.verdictActionSubtitle || 'A decision only becomes real when converted into immediate action. Take these steps within the next 48 hours:'}
          </p>

          <div className="space-y-2.5">
            {actionSteps.map((step, idx) => {
              const isChecked = completedSteps.includes(idx);
              const stepLabel = t.verdictStep ? `${t.verdictStep} ${step.stepNumber}` : `Step ${step.stepNumber}`;

              return (
                <div
                  key={idx}
                  id={`action-step-${idx}`}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50 text-neutral-600 dark:text-neutral-400'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(idx);
                    }}
                    aria-label={`Toggle ${stepLabel}`}
                    className="mt-0.5 shrink-0 text-neutral-400 dark:text-slate-400"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 text-neutral-400 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-neutral-200" />
                    )}
                  </button>
                  <div className="text-xs sm:text-sm flex-1 min-w-0">
                    <p className={`font-semibold leading-snug ${isChecked ? 'line-through text-neutral-500 dark:text-slate-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                      <span className="text-neutral-500 dark:text-neutral-400 font-normal mr-1.5">{stepLabel}:</span>
                      {step.title}
                    </p>
                    {step.description && step.description !== step.title && (
                      <p className={`mt-1 text-xs leading-relaxed ${isChecked ? 'line-through text-neutral-400 dark:text-slate-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Risks to Watch */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
              {t.verdictCriticalRisks || 'Key Pitfalls & Hedging Strategy'}
            </h3>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            {t.verdictRisksSubtitle || 'Every choice bears trade-offs. Protect your chosen path against these specific vulnerabilities:'}
          </p>

          <div className="space-y-3">
            {verdict.criticalRisksToWatch?.map((risk: any, idx: number) => {
              const riskText =
                typeof risk === 'string'
                  ? risk
                  : (risk?.risk || risk?.title || risk?.description || risk?.text || JSON.stringify(risk));

              return (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-xs font-bold text-amber-900 dark:text-amber-200">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {riskText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Deep-dive Navigation Links */}
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-2">
            <motion.button
              type="button"
              onClick={() => onNavigateToTab('proscons')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <span>{t.tabProsCons || 'Examine Pros & Cons'}</span>
              <ArrowRight className="h-3 w-3 text-neutral-400" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onNavigateToTab('matrix')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <span>{t.tabMatrix || 'View Comparison Table'}</span>
              <ArrowRight className="h-3 w-3 text-neutral-400" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onNavigateToTab('swot')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <span>{t.tabSwot || 'Review SWOT Grid'}</span>
              <ArrowRight className="h-3 w-3 text-neutral-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
