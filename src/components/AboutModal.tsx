import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Home,
  Rocket,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  Globe2,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Clock,
  HeartHandshake,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { DECISION_PRESETS } from '../data/presets';
import { DecisionPreset } from '../types';
import { getTranslation } from '../utils/i18n';
import { ArbitrEmblem, ArbitrWordmark } from './ArbitrLogo';
import { DecisionIntelligenceSeal } from './DecisionIntelligenceSeal';
import { PWAInstallButton } from './PWAInstallButton';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset?: (preset: DecisionPreset) => void;
  onOpenTemplates?: () => void;
  onStartNew?: () => void;
  onOpenWelcome?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  currentLanguage: string;
}

type TabKey = 'overview' | 'use-cases' | 'framework' | 'features';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onOpenTemplates,
  onStartNew,
  onOpenWelcome,
  onOpenTerms,
  onOpenPrivacy,
  currentLanguage,
}) => {
  const t = getTranslation(currentLanguage);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunchPreset = (preset: DecisionPreset) => {
    onClose();
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  const handleCreateNew = () => {
    onClose();
    if (onStartNew) {
      onStartNew();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[96dvh] sm:max-h-[90dvh] h-full sm:h-auto bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Main Header - Responsive across all device sizes */}
        <div className="shrink-0 flex items-center justify-between px-3.5 xs:px-4 sm:px-6 md:px-7 py-3 sm:py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-md gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-950 p-1 text-white shadow-md border border-neutral-800 ring-1 ring-cyan-500/30">
              <ArbitrEmblem className="h-7 w-7 sm:h-8 sm:w-8" glow={true} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 id="about-modal-title" className="font-bold text-base sm:text-lg md:text-xl text-neutral-950 dark:text-white tracking-tight truncate">
                  {t.navAbout || 'About Arbitr'}
                </h3>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                  </span>
                  <span>{t.aiEngineBadge || 'AI Engine'}</span>
                </div>
                <span className="hidden xs:inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  v2.5
                </span>
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-mono text-cyan-600 dark:text-cyan-300 border border-neutral-200 dark:border-neutral-700"
                  title="Official brand domain: arbitrapps.com"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
                  <span>arbitrapps.com</span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 truncate max-w-[200px] xs:max-w-xs sm:max-w-md mt-0.5">
                {t.appTagline || 'Stop overthinking. Start deciding.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation - Responsive scrollable bar with high-contrast active states */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 md:px-7 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-neutral-950 dark:text-white font-bold bg-white/80 dark:bg-neutral-800/60 rounded-t-lg'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500 shrink-0" />
            <span>{t.aboutTabOverview || 'Overview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('use-cases')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'use-cases'
                ? 'border-cyan-500 text-neutral-950 dark:text-white font-bold bg-white/80 dark:bg-neutral-800/60 rounded-t-lg'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 shrink-0" />
            <span>{t.aboutTabUseCases || 'Use Cases'}</span>
            <span className="hidden xs:inline-block px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('framework')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'framework'
                ? 'border-cyan-500 text-neutral-950 dark:text-white font-bold bg-white/80 dark:bg-neutral-800/60 rounded-t-lg'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
            }`}
          >
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 shrink-0" />
            <span>{t.aboutTabFramework || '5-Pillar Framework'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'features'
                ? 'border-cyan-500 text-neutral-950 dark:text-white font-bold bg-white/80 dark:bg-neutral-800/60 rounded-t-lg'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
            }`}
          >
            <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
            <span>{t.aboutTabCapabilities || 'Key Features'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-7 space-y-6 text-sm text-neutral-800 dark:text-neutral-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Tab 1 Executive Hero Header Banner */}
              <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 via-white to-cyan-50/40 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-cyan-950/20 p-4 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    <Sparkles className="h-3 w-3" />
                    Decision Intelligence System
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono hidden sm:inline-block">
                    Multi-Lens Analysis Engine
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                  Break Deadlocks with Mathematical &amp; Behavioral Clarity
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
                  Arbitr transforms agonizing choices into definitive roadmaps. It replaces superficial pros &amp; cons lists with weighted multivariate matrices, strategic SWOT analysis, proactive risk mitigations, and Bezos regret minimization.
                </p>

                {/* 4 Pillars Highlight Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3.5 mt-3 border-t border-neutral-200/60 dark:border-neutral-800/80 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Weighted Scoring</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>Risk Mitigations</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>10-10-10 Regret</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold">
                    <Scale className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Definitive Verdict</span>
                  </div>
                </div>
              </div>

              {/* Official Decision Intelligence Brand & Seal Showcase */}
              <DecisionIntelligenceSeal variant="showcase" interactive={true} showControls={true} />

              {/* Web Access & Domain Status Card */}
              <div className="rounded-2xl border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                      Application Web Access &amp; Domain Status
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold font-mono">
                    Live &amp; Accessible
                  </span>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                  <strong>Active Host Environment:</strong> You are accessing Arbitr directly on this deployment. If you encountered an issue trying to access the external <code className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 font-mono text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 font-semibold">arbitrapps.com</code> URL, that domain is the trademark brand identity for the project. The complete copilot, AI engines, and voice arbiter are running live right here.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-indigo-200/80 dark:border-indigo-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe2 className="h-4 w-4 text-cyan-500 shrink-0" />
                    <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate">
                      {typeof window !== 'undefined' ? window.location.origin : 'Current Host'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.origin);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Copied Live URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Active App URL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <strong>Custom Domain Setup:</strong> To point <code className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">arbitrapps.com</code> directly to this instance, add a DNS <span className="font-semibold text-neutral-800 dark:text-neutral-200">CNAME</span> or <span className="font-semibold text-neutral-800 dark:text-neutral-200">A</span> record in your domain registrar pointing to your Cloud Run or container deployment IP.
                </div>
              </div>

              {/* Progressive Web App (PWA) Install Showcase Card */}
              <div className="rounded-2xl border border-indigo-200/90 dark:border-indigo-800/80 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                      Install Arbitr as an App (PWA)
                    </h4>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Offline Ready
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Install to your phone home screen or desktop for fast offline caching, full-screen view, and instant voice deliberation with Zena.
                  </p>
                </div>
                <PWAInstallButton variant="navbar" className="shrink-0" />
              </div>

              {/* Primary Mission Card */}
              <div className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 p-4 sm:p-6">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  The Problem: Analysis Paralysis
                </h4>
                <p className="leading-relaxed text-neutral-700 dark:text-neutral-200 mb-3">
                  When facing important choices—changing jobs, moving cities, choosing business strategies, or picking tech stacks—we often get stuck in endless loops of overthinking.
                </p>
                <p className="leading-relaxed text-neutral-700 dark:text-neutral-200">
                  Traditional pros and cons lists fail because they count trivial points equally with critical dealbreakers, ignore risk mitigations, and fail to calculate cognitive biases like loss aversion or status quo bias.
                </p>
              </div>

              {/* The Arbitr Solution */}
              <div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  The Arbitr Solution
                </h4>
                <p className="leading-relaxed text-neutral-700 dark:text-neutral-200 mb-4">
                  <strong>Arbitr</strong> is an objective, AI-powered decision arbiter. Instead of vague advice, it applies proven decision science methodologies to dismantle your deadlock:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs mb-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Multivariate Scoring Matrix
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Evaluates each candidate option across key criteria weighted by your explicit priorities (1–5x importance).
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs mb-1.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-500" />
                      Actionable Risk Mitigations
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Every con is paired with a realistic mitigation tactic so downsides aren&apos;t just listed—they are solvable.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs mb-1.5">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Regret Minimization Test
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Applies the 10-10-10 rule (impact in 10 days, 10 months, 10 years) to filter out fleeting anxiety from lasting fulfillment.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs mb-1.5">
                      <Scale className="h-4 w-4 text-amber-500" />
                      Definitive Tiebreaker Verdict
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Declares an unequivocal recommended winner with confidence percentage and the single decisive pivot point.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt to action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 dark:border-neutral-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Ready to test a dilemma with Arbitr?
                  </span>
                  {onOpenWelcome && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenWelcome();
                      }}
                      className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      View Welcome Introduction →
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <span>Start a Decision</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USE CASES */}
          {activeTab === 'use-cases' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Tab 2 Header Banner */}
              <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 via-white to-indigo-50/40 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-indigo-950/20 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Briefcase className="h-3 w-3" />
                    High-Stakes Decision Scenarios
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-1.5">
                  When Intuition Alone Carries Too Much Risk
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed max-w-2xl">
                  Arbitr is purpose-built for irreversible or capital-intensive dilemmas where trade-offs feel evenly matched, stakes are significant, and emotional bias clouds forward action.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Career */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span>Career &amp; Job Opportunities</span>
                  </div>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-200 space-y-1.5 pl-1 leading-relaxed">
                    <li>• Accepting a high-risk startup offer vs. staying at an enterprise</li>
                    <li>• Choosing between two competing job offers with different comp structures</li>
                    <li>• Transitioning to individual contributor vs. management track</li>
                    <li>• Pursuing an MBA or bootcamp vs. continued on-the-job promotion</li>
                  </ul>
                </div>

                {/* Business & Tech */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <span>Business &amp; Technology Strategy</span>
                  </div>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-200 space-y-1.5 pl-1 leading-relaxed">
                    <li>• Building an in-house engineering team vs. outsourcing development</li>
                    <li>• Bootstrapping a SaaS prototype vs. raising seed venture capital</li>
                    <li>• Architecture decisions (e.g. monolithic framework vs. microservices)</li>
                    <li>• Pricing models (usage-based vs. tiered subscription seats)</li>
                  </ul>
                </div>

                {/* Housing & Relocation */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Home className="h-4 w-4" />
                    </div>
                    <span>Living &amp; Financial Commitments</span>
                  </div>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-200 space-y-1.5 pl-1 leading-relaxed">
                    <li>• Buying a suburban home vs. continuing to rent downtown</li>
                    <li>• Relocating to a new city or country for lifestyle vs. career</li>
                    <li>• Large equipment, vehicle, or property investments</li>
                    <li>• Taking a 6-month sabbatical vs. continuing retirement savings</li>
                  </ul>
                </div>

                {/* Team & Leadership */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-800/40 space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <HeartHandshake className="h-4 w-4" />
                    </div>
                    <span>Team Deadlocks &amp; Leadership</span>
                  </div>
                  <ul className="text-xs text-neutral-700 dark:text-neutral-200 space-y-1.5 pl-1 leading-relaxed">
                    <li>• Breaking ties when co-founders or executive teams disagree</li>
                    <li>• Vendor selection between top RFP finalists</li>
                    <li>• Product roadmap prioritization when resources are strictly limited</li>
                    <li>• Establishing consensus backed by transparent weighted scores</li>
                  </ul>
                </div>
              </div>

              {/* Try sample cases */}
              <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    Try One of Our Curated Dilemmas:
                  </span>
                  {onOpenTemplates && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTemplates();
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Browse All ({DECISION_PRESETS.length}) →
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DECISION_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleLaunchPreset(p)}
                      className="text-left rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 p-2.5 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all group cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {p.category}
                      </span>
                      <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {p.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRAMEWORK */}
          {activeTab === 'framework' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Tab 3 Header Banner */}
              <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 via-white to-purple-50/40 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-purple-950/20 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Layers className="h-3 w-3" />
                    Analytical Methodology
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-1.5">
                  The 5-Pillar Decision Intelligence Engine
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed max-w-2xl mb-4">
                  Arbitr synthesizes executive strategy, behavioral economics, and Bayesian scoring into a multi-lens audit that eliminates bias and surfaces the true winning option.
                </p>

                {/* 5-Step Pipeline Flow Banner */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80">
                  <div className="rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 p-2 text-center">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">STEP 1</span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate block">Weighted Matrix</span>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 p-2 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">STEP 2</span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate block">Risk Mitigations</span>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 p-2 text-center">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">STEP 3</span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate block">SWOT Analysis</span>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 p-2 text-center">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">STEP 4</span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate block">Regret 10-10-10</span>
                  </div>
                  <div className="col-span-2 xs:col-span-1 rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 p-2 text-center">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">STEP 5</span>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate block">Tiebreaker Verdict</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-3.5">
                {/* Step 1 */}
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-3.5 sm:p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                      Multi-Criteria Trade-Off Matrix
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Dissects the dilemma across distinct evaluation dimensions (e.g. Financial Return, Work-Life Balance, Reversibility, Psychological Peace). Each criterion is multiplied by your designated importance weight (1–5) to calculate rigorous, transparent quantitative scores.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-3.5 sm:p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                      Impact-Ranked Pros &amp; Cons with Actionable Mitigations
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Identifies high-impact upsides and critical downsides. Crucially, every single con is accompanied by a tactical mitigation strategy, allowing you to proactively neutralize risks before committing.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-3.5 sm:p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                      4-Quadrant Strategic SWOT Analysis
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Maps out internal Strengths and Weaknesses alongside external Opportunities and Threats for each choice, concluding with an overarching strategic implication for your situation.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-3.5 sm:p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                      Cognitive Bias &amp; Regret Minimization Check
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Applies Jeff Bezos&apos;s Regret Minimization Framework and Suzy Welch&apos;s 10-10-10 rule (how will you feel about this choice in 10 minutes, 10 months, and 10 years?), paired with an intuitive gut-check question to cut through emotional static.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 p-3.5 sm:p-4 bg-white dark:bg-neutral-800/80 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                      The Decisive Tiebreaker Verdict &amp; Action Plan
                    </h5>
                    <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Delivers a single winning option, an objective confidence percentage (e.g., 85%), the precise &ldquo;Tiebreaker Factor&rdquo; that tilted the scales, and an immediate step-by-step roadmap to begin execution within 24–48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAPABILITIES */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Tab 4 Header Banner */}
              <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-emerald-950/20 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Radio className="h-3 w-3" />
                    System Capabilities
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-1.5">
                  Engineered for Fluid Interaction &amp; Real-Time Stress Testing
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed max-w-2xl">
                  Arbitr isn&apos;t just a static calculator. It integrates real-time conversational voice advisors, dynamic weight sensitivity testing, 7-language localization, and private local history.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                {/* Live Voice */}
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 shadow-2xs">
                  <div className="flex items-center gap-2.5 font-semibold text-indigo-950 dark:text-indigo-200 text-sm mb-1.5">
                    <Radio className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
                    <span>Gemini 3.1 Live Voice Conversations</span>
                  </div>
                  <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed mb-2.5">
                    Talk through your decision out loud in real time using the <code className="px-1 py-0.5 rounded bg-indigo-100/80 dark:bg-indigo-900/60 font-mono text-[11px]">gemini-3.1-flash-live-preview</code> Live API. Features hands-free wake word activation (&ldquo;Hey Zena&rdquo;), ultra-low latency full-duplex audio, conversational interruptions, 5 specialized advisor voices led by Zena (plus Kore, Puck, Charon, Fenrir), and reactive interactive particle fields.
                  </p>
                  <span className="text-[11px] font-medium text-indigo-800 dark:text-indigo-300 block">
                    💡 Simply say &ldquo;Hey Zena&rdquo; anytime, click the floating ZENA avatar widget in the bottom-right corner, or access via the &ldquo;Zena Voice&rdquo; button in the top navigation.
                  </span>
                </div>

                {/* What-If Simulator */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-sm mb-1.5">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-600 dark:text-neutral-300 shrink-0" />
                    <span>Interactive &ldquo;What-If&rdquo; Sensitivity Simulator</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    Test how robust your decision is under changing priorities. Adjust real-time sliders (e.g. increase importance of Work-Life Balance to 5x or reduce Financial Upside to 1x) to see if and when the winning option pivots.
                  </p>
                </div>

                {/* Multilingual Support */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-sm mb-1.5">
                    <Globe2 className="h-4 w-4 text-neutral-600 dark:text-neutral-300 shrink-0" />
                    <span>7 Languages &amp; Native RTL Localization</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    Fully localized in English, Spanish (Español), French (Français), German (Deutsch), Chinese (中文), Japanese (日本語), and Arabic (العربية) with native right-to-left layout rendering and one-click report translation.
                  </p>
                </div>

                {/* Privacy & History */}
                <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-sm mb-1.5">
                    <ShieldCheck className="h-4 w-4 text-neutral-600 dark:text-neutral-300 shrink-0" />
                    <span>Private Local Storage &amp; Markdown Export</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    Your confidential dilemmas are saved privately in your browser&apos;s local storage. You can revisit past analyses from the History drawer, export complete dossiers as formatted Markdown, or delete them anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Shrink-0, responsive on all devices */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-7 py-3 sm:py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-xs">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Arbitr Decision Engine</span>
            <span>•</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold inline-flex items-center gap-1">
              <span>arbitrapps.com</span>
            </span>
            <span>•</span>
            <span className="font-mono text-neutral-600 dark:text-neutral-400">@arbitrapps</span>
            <span>•</span>
            <span className="text-neutral-600 dark:text-neutral-400">v2.5</span>
            {onOpenTerms && (
              <>
                <span>•</span>
                <button
                  id="about-terms-link-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTerms();
                  }}
                  className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {t.navTerms || 'Terms & Conditions'}
                </button>
              </>
            )}
            {onOpenPrivacy && (
              <>
                <span>•</span>
                <button
                  id="about-privacy-link-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacy();
                  }}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {t.navPrivacy || 'Privacy Policy'}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 sm:px-4 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer min-h-[36px]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="rounded-xl bg-neutral-900 dark:bg-neutral-100 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
            >
              <span>Resolve a Dilemma</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
