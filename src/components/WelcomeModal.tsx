import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Compass,
  SlidersHorizontal,
  Scale,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  BookOpen,
  CheckCircle2,
  Brain,
  Volume2
} from 'lucide-react';
import { ArbitrEmblem, ArbitrWordmark } from './ArbitrLogo';
import { HumanoidIcon } from './HumanoidIcon';
import { getTranslation } from '../utils/i18n';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDecision: () => void;
  onExplorePresets: () => void;
  onOpenVoice: () => void;
  currentLanguage: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartDecision,
  onExplorePresets,
  onOpenVoice,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('arbitr_has_seen_welcome', 'true');
    } else {
      localStorage.removeItem('arbitr_has_seen_welcome');
    }
    onClose();
  };

  const handleStart = () => {
    handleDismiss();
    onStartDecision();
  };

  const handlePresets = () => {
    handleDismiss();
    onExplorePresets();
  };

  const handleVoice = () => {
    handleDismiss();
    onOpenVoice();
  };

  return (
    <div
      id="welcome-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        id="welcome-modal-card"
        className="relative w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden transition-all my-auto max-h-[92vh] flex flex-col ring-1 ring-cyan-500/20"
      >
        {/* Ambient Top Glow Banner */}
        <div className="relative bg-gradient-to-br from-neutral-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white border-b border-cyan-500/20 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_50%)] pointer-events-none" />
          
          <button
            id="welcome-modal-close-btn"
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
            title="Close"
            aria-label="Close Welcome Introduction"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-neutral-950 p-2 text-white shadow-xl border border-cyan-500/30 ring-2 ring-cyan-500/20 shrink-0">
              <ArbitrEmblem className="h-10 w-10 sm:h-12 sm:w-12" glow={true} animated={true} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  {t.welcomeIntroBadge || 'Welcome to Arbitr'}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-mono text-cyan-200">
                  arbitrapp.com • @arbitrapp
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>{t.welcomeIntroHeading || 'Stop Overthinking. Start Deciding.'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl leading-relaxed">
                {t.welcomeIntroSubtitle || 'Welcome! Arbitr is your rational decision copilot designed to eliminate decision paralysis, uncover blindspots, and guide you through tough crossroads.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
          {/* 3-Step Guided Framework */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100 mb-3.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{t.welcomeHowItWorksTitle || 'How Arbitr Guides Your Decisions:'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Step 1 */}
              <div className="p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/90 dark:bg-neutral-800/90 flex flex-col justify-between hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/70 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-700/60 text-xs font-bold">
                      1
                    </span>
                    <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
                    {t.welcomeStep1Title || 'Frame the Dilemma'}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t.welcomeStep1Desc || 'State your choice: compare 2 to 5 competing options or evaluate a single high-stakes proposal. Set the priorities that matter to you.'}
                  </p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-700/80 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
                  Career, tech, investments, moves
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/90 dark:bg-neutral-800/90 flex flex-col justify-between hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/60 text-xs font-bold">
                      2
                    </span>
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
                    {t.welcomeStep2Title || 'Multi-Angle Deliberation'}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t.welcomeStep2Desc || 'Instant weighted scoring matrix, pros & cons with risk mitigations, SWOT analysis, and a decisive final tiebreaker recommendation.'}
                  </p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-700/80 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  Objective & bias-resistant
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/90 dark:bg-neutral-800/90 flex flex-col justify-between hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/60 text-xs font-bold">
                      3
                    </span>
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">
                    {t.welcomeStep3Title || 'Hands-Free Zena Voice'}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t.welcomeStep3Desc || 'Deliberate verbally in real time. Say "Hey Zena" or tap the voice orb to talk through trade-offs naturally.'}
                  </p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-700/80 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Spoken voice deliberation
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent dark:from-cyan-950/60 dark:via-indigo-950/50 dark:to-neutral-900">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Bias Mitigation</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Weighted Matrix</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                <Globe2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">20+ Languages</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Firestore Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Control Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-950 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-200 cursor-pointer select-none">
            <input
              id="welcome-dont-show-again-checkbox"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
            />
            <span className="text-neutral-700 dark:text-neutral-200">{t.welcomeDontShowAgain || "Don't show this intro automatically on launch"}</span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <button
              id="welcome-try-presets-btn"
              type="button"
              onClick={handlePresets}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer min-h-[40px]"
            >
              <BookOpen className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>{t.welcomeExplorePresets || 'Sample Dilemmas'}</span>
            </button>

            <button
              id="welcome-voice-btn"
              type="button"
              onClick={handleVoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-500/40 dark:border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/60 text-xs font-semibold text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100/70 dark:hover:bg-cyan-900/60 transition-colors cursor-pointer min-h-[40px]"
            >
              <HumanoidIcon size={14} animated={true} />
              <span>{t.welcomeTalkZyno || 'Talk with Zena'}</span>
            </button>

            <button
              id="welcome-start-decision-btn"
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-xs font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer min-h-[40px]"
            >
              <span>{t.welcomeStartDeciding || 'Start a Decision'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
