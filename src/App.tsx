import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Scale, 
  Table, 
  Compass, 
  FlaskConical, 
  Copy, 
  Check, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft, 
  AlertCircle,
  Languages,
  ArrowRightLeft,
  Cloud,
  BookmarkPlus,
  BookmarkCheck,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DecisionForm } from './components/DecisionForm';
import { VerdictView } from './components/VerdictView';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonTableView } from './components/ComparisonTableView';
import { SwotView } from './components/SwotView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { InsightFeedback } from './components/InsightFeedback';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TranslationModal } from './components/TranslationModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AboutModal } from './components/AboutModal';
import { WelcomeModal } from './components/WelcomeModal';
import { TemplatesModal } from './components/TemplatesModal';
import { AuthModal } from './components/AuthModal';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { WakeWordBanner } from './components/WakeWordBanner';
import { ZenaVoiceWidget } from './components/ZenaVoiceWidget';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useWakeWord } from './hooks/useWakeWord';
import { useAuth } from './contexts/AuthContext';
import { DecisionAnalysisResult, OptionAnalysis, DecisionPreset } from './types';
import { DecisionLoadingState } from './components/DecisionLoadingState';
import { saveDecisionToFirestore, deleteDecisionFromFirestore, subscribeToUserDecisions } from './services/decisionsDb';
import { formatDecisionAsMarkdown } from './utils/export';
import { getTranslation, isRTL } from './utils/i18n';
import { ArbitrEmblem } from './components/ArbitrLogo';

type ActiveTab = 'verdict' | 'proscons' | 'matrix' | 'swot' | 'simulator';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('tiebreaker_ui_language') || 'en';
  });
  const [activeDecision, setActiveDecision] = useState<DecisionAnalysisResult | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('verdict');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showTranslationModal, setShowTranslationModal] = useState<boolean>(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    // Show welcome note / introduction on app launch unless previously opted out
    return localStorage.getItem('arbitr_has_seen_welcome') !== 'true';
  });
  const [selectedPreset, setSelectedPreset] = useState<DecisionPreset | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isViewingOriginal, setIsViewingOriginal] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tiebreaker_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);

  const t = getTranslation(currentLanguage);

  const [isZenaWidgetOpen, setIsZenaWidgetOpen] = useState<boolean>(false);

  // Hands-free "Hey Zena" voice activation hook
  const {
    isEnabled: isWakeWordEnabled,
    isListening: isWakeWordListening,
    isSupported: isWakeWordSupported,
    needsPermission: isWakeWordNeedsPermission,
    lastDetectedPhrase,
    toggleWakeWord,
    requestMicPermission,
    simulateWakeWord,
    errorStatus: wakeWordError,
  } = useWakeWord({
    disabled: showLiveVoiceModal || isZenaWidgetOpen,
    enabledByDefault: true,
    currentLanguage,
    onWakeWordDetected: () => {
      setIsZenaWidgetOpen(true);
    },
  });

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tiebreaker_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Apply RTL/LTR direction
  useEffect(() => {
    document.documentElement.dir = isRTL(currentLanguage) ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('tiebreaker_ui_language', currentLanguage);
  }, [currentLanguage]);

  // Real-time Firestore sync: Only authenticated users can access and save decisions
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserDecisions(
        user.uid,
        (cloudDecisions) => {
          setSavedDecisions(cloudDecisions);
        },
        (err) => {
          console.warn('[Firestore] Decisions subscription error:', err);
        }
      );
      return () => unsubscribe();
    } else {
      // Clear saved decisions when unauthenticated
      setSavedDecisions([]);
    }
  }, [user]);

  // Multi-step loading messages to keep user engaged while Gemini generates analysis
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      const steps = [
        t.loadingStep1 || 'Cataloging trade-offs & hidden costs...',
        t.loadingStep2 || 'Formulating multi-criteria comparison matrix...',
        t.loadingStep3 || 'Synthesizing 4-quadrant SWOT dimensions...',
        t.loadingStep4 || 'Applying regret minimization & tiebreaker logic...',
        t.loadingStep5 || 'Finalizing decisive verdict...',
      ];
      let stepIdx = 0;
      setLoadingStep(steps[0]);

      timer = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        setLoadingStep(steps[stepIdx]);
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isLoading, currentLanguage, t]);

  const handleSelectLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
  };

  const handleAnalyzeDecision = async (
    title: string,
    context: string,
    options: string[],
    priorities: string[],
    targetLanguage?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const effectiveTargetLang = (targetLanguage && targetLanguage !== 'auto')
        ? targetLanguage
        : (currentLanguage && currentLanguage !== 'en' ? currentLanguage : 'auto');

      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          context, 
          options, 
          priorities, 
          targetLanguage: effectiveTargetLang 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.hint || 'Failed to analyze decision');
      }

      const result: DecisionAnalysisResult = await response.json();
      setActiveDecision(result);
      setIsViewingOriginal(false);
      setActiveTab('verdict');

      // Only allow authenticated users to save their Arbitr decisions
      if (user) {
        try {
          await saveDecisionToFirestore(user.uid, result);
          setSaveSuccessToast(true);
          setTimeout(() => setSaveSuccessToast(false), 2500);
        } catch (saveErr) {
          console.warn('[Firestore] Could not auto-save to cloud:', saveErr);
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred while analyzing the decision.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveActiveDecision = async () => {
    if (!activeDecision) return;
    if (!user) {
      setAuthModalMode('signin');
      setAuthPromptReason('Sign in with Google or Email to save this decision to your account.');
      setShowAuthModal(true);
      return;
    }
    try {
      await saveDecisionToFirestore(user.uid, activeDecision);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 2500);
    } catch (err) {
      console.error('[Firestore] Failed to save decision:', err);
    }
  };

  const handleUpdateOptions = (updatedOptions: OptionAnalysis[]) => {
    if (!activeDecision) return;
    const updatedDecision = {
      ...activeDecision,
      options: updatedOptions,
    };
    setActiveDecision(updatedDecision);
    if (user) {
      saveDecisionToFirestore(user.uid, updatedDecision).catch(console.warn);
    }
  };

  const handleCopyReport = async () => {
    if (!activeDecision) return;
    const markdown = formatDecisionAsMarkdown(activeDecision);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleNewDecision = () => {
    setActiveDecision(null);
    setSelectedPreset(null);
    setIsViewingOriginal(false);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDecision = async (id: string) => {
    if (user) {
      try {
        await deleteDecisionFromFirestore(user.uid, id);
      } catch (err) {
        console.error('[Firestore] Failed to delete decision:', err);
      }
    }
    setSavedDecisions((prev) => prev.filter((d) => d.id !== id));
    if (activeDecision?.id === id) {
      setActiveDecision(null);
    }
  };

  const handleSelectFromHistory = (dec: DecisionAnalysisResult) => {
    setActiveDecision(dec);
    setIsViewingOriginal(false);
    setActiveTab('verdict');
    setShowHistoryDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTranslatedReport = (translatedDecision: DecisionAnalysisResult) => {
    setActiveDecision(translatedDecision);
    setIsViewingOriginal(false);
    if (user) {
      saveDecisionToFirestore(user.uid, translatedDecision).catch(console.warn);
    }
  };

  const handleToggleOriginalVersion = () => {
    if (!activeDecision) return;
    if (isViewingOriginal) {
      if ((activeDecision as any)._translatedBackup) {
        setActiveDecision((activeDecision as any)._translatedBackup);
      }
      setIsViewingOriginal(false);
    } else if (activeDecision.originalVersion) {
      const orig = {
        ...activeDecision.originalVersion,
        _translatedBackup: activeDecision,
      } as any;
      setActiveDecision(orig);
      setIsViewingOriginal(true);
    }
  };

  const handleSelectPreset = (preset: DecisionPreset, runImmediately: boolean = false) => {
    const clonedPreset: DecisionPreset = {
      ...preset,
      options: [...preset.options],
      priorities: [...preset.priorities],
    };
    setSelectedPreset(clonedPreset);
    setActiveDecision(null);
    setIsViewingOriginal(false);
    setErrorMessage(null);
    setShowTemplatesModal(false);
    setShowAboutModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (runImmediately) {
      handleAnalyzeDecision(
        clonedPreset.title,
        clonedPreset.context,
        clonedPreset.options,
        clonedPreset.priorities,
        currentLanguage
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col antialiased transition-colors duration-150">
      {/* Navbar */}
      <Navbar
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenPresets={() => setShowTemplatesModal(true)}
        onOpenLiveVoice={() => setShowLiveVoiceModal(true)}
        onOpenZenaWidget={() => setIsZenaWidgetOpen(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenWelcome={() => setShowWelcomeModal(true)}
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'signin');
          setAuthPromptReason(null);
          setShowAuthModal(true);
        }}
        savedCount={savedDecisions.length}
        hasActiveDecision={Boolean(activeDecision)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        wakeWordListening={isWakeWordListening}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 sm:p-5 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-rose-950 dark:text-rose-200">Analysis Notice</h4>
              <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 px-2 py-1 rounded-md"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Workspace Transition Area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-state-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <DecisionLoadingState step={loadingStep} currentLanguage={currentLanguage} />
            </motion.div>
          ) : !activeDecision ? (
            <motion.div
              key="decision-form-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <DecisionForm
                onSubmit={handleAnalyzeDecision}
                isLoading={isLoading}
                loadingStep={loadingStep}
                currentLanguage={currentLanguage}
                onOpenAbout={() => setShowAboutModal(true)}
                onOpenTemplatesModal={() => setShowTemplatesModal(true)}
                onOpenWelcome={() => setShowWelcomeModal(true)}
                initialPreset={selectedPreset}
              />
            </motion.div>
          ) : (
            /* Active Decision Workspace */
            <motion.div
              key={`active-decision-${activeDecision.id}-${activeDecision.translatedTo || 'orig'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
            {/* Top Meta Bar */}
            <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNewDecision}
                      className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {t.backToInput || 'Back to input'}
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {t.analyzedOn || 'Analyzed'} {new Date(activeDecision.createdAt).toLocaleDateString()}
                    </span>

                    {/* Translation indicator and toggle */}
                    {activeDecision.translatedTo && (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                          <Languages className="w-3 h-3 text-indigo-500" />
                          {t.translatedBadge || 'Translated to'} {activeDecision.translatedTo}
                        </span>
                      </>
                    )}

                    {activeDecision.originalVersion && (
                      <button
                        type="button"
                        onClick={handleToggleOriginalVersion}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 ml-1 rounded-md px-2 py-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        {isViewingOriginal 
                          ? (t.viewTranslatedBtn || 'View Translated')
                          : (t.viewOriginalBtn || 'View Original')}
                      </button>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {activeDecision.title}
                  </h1>

                  {activeDecision.context && (
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 max-w-3xl">
                      {activeDecision.context}
                    </p>
                  )}
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Save Status / Button */}
                  {user ? (
                    <button 
                      id="save-decision-btn"
                      type="button"
                      onClick={handleSaveActiveDecision}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-2xs cursor-pointer min-h-[36px] sm:min-h-[40px]"
                      title="Click to save or re-sync this decision to Cloud Firestore"
                    >
                      <BookmarkCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="hidden xs:inline">{saveSuccessToast ? (t.savedToast || 'Saved!') : (t.savedToCloud || 'Saved to Cloud')}</span>
                      <span className="xs:hidden">{saveSuccessToast ? 'Saved' : 'Save'}</span>
                    </button>
                  ) : (
                    <button
                      id="save-decision-btn"
                      type="button"
                      onClick={() => {
                        setAuthModalMode('signin');
                        setAuthPromptReason('Sign in to save this decision and access it anytime from any device.');
                        setShowAuthModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs cursor-pointer min-h-[36px] sm:min-h-[40px]"
                      title="Sign in with Google or Email to save this decision"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="hidden xs:inline">{t.signInToSave || 'Sign in to Save'}</span>
                      <span className="xs:hidden">Save</span>
                    </button>
                  )}

                  {/* Translate Report Button */}
                  <button
                    id="translate-report-btn"
                    type="button"
                    onClick={() => setShowTranslationModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-2xs cursor-pointer min-h-[36px] sm:min-h-[40px]"
                    title={t.translateReportTooltip || 'Translate entire decision report with Gemini'}
                  >
                    <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                    <span className="hidden xs:inline">{t.translateReportBtn || 'Translate Report'}</span>
                    <span className="xs:hidden">Translate</span>
                  </button>

                  <button
                    id="copy-report-btn"
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-2xs cursor-pointer min-h-[36px] sm:min-h-[40px]"
                    title="Copy full analysis report as Markdown"
                  >
                    {copiedToast ? (
                      <>
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-400">{t.copiedToClipboard || 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                        <span className="hidden xs:inline">{t.copyReport || 'Copy Report'}</span>
                        <span className="xs:hidden">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    id="new-crossroad-btn"
                    type="button"
                    onClick={handleNewDecision}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs cursor-pointer min-h-[36px] sm:min-h-[40px]"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden xs:inline">{t.navNewDecision || 'New Question'}</span>
                    <span className="xs:hidden">New</span>
                  </button>
                </div>
              </div>

              {/* Unauthenticated User Guest Banner */}
              {!user && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                    <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{t.guestBannerText || 'Viewing as guest. Sign in with Google or Email so your decisions are preserved in your account.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signin');
                      setAuthPromptReason('Sign in to save this decision to your account.');
                      setShowAuthModal(true);
                    }}
                    className="font-semibold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
                  >
                    {t.signInToSave || 'Sign in to Save'}
                  </button>
                </div>
              )}

              {/* View Tabs */}
              <div className="mt-5 sm:mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-4">
                <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 sm:gap-2 pb-1">
                  <motion.button
                    id="tab-verdict"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('verdict')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'verdict'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Award className="h-4 w-4 shrink-0" />
                    <span>{t.tabVerdict || 'Arbitr Verdict'}</span>
                  </motion.button>

                  <motion.button
                    id="tab-proscons"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('proscons')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'proscons'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>{t.tabProsCons || 'Pros & Cons List'}</span>
                  </motion.button>

                  <motion.button
                    id="tab-matrix"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('matrix')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'matrix'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Table className="h-4 w-4 shrink-0" />
                    <span>{t.tabMatrix || 'Comparison Table'}</span>
                  </motion.button>

                  <motion.button
                    id="tab-swot"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('swot')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'swot'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Compass className="h-4 w-4 shrink-0" />
                    <span>{t.tabSwot || 'SWOT Analysis'}</span>
                  </motion.button>

                  <motion.button
                    id="tab-simulator"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('simulator')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'simulator'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <FlaskConical className="h-4 w-4 shrink-0" />
                    <span>{t.tabSimulator || '"What-If" Simulator'}</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Active View Container with Tab Page Transitions */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {activeTab === 'verdict' && (
                    <VerdictView
                      verdict={activeDecision.verdict}
                      options={activeDecision.options}
                      onNavigateToTab={(tab) => setActiveTab(tab)}
                      onOpenLiveVoice={() => setShowLiveVoiceModal(true)}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {activeTab === 'proscons' && (
                    <ProsConsView
                      options={activeDecision.options}
                      onUpdateOptions={handleUpdateOptions}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {activeTab === 'matrix' && (
                    <ComparisonTableView
                      options={activeDecision.options}
                      criteria={activeDecision.comparisonMatrix.criteria}
                      summary={activeDecision.comparisonMatrix.analysisSummary}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {activeTab === 'swot' && (
                    <SwotView
                      options={activeDecision.options}
                      swotAnalysis={activeDecision.swotAnalysis}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {activeTab === 'simulator' && (
                    <WhatIfSimulator decision={activeDecision} currentLanguage={currentLanguage} />
                  )}

                  {/* Thumbs-Up/Down Feedback Mechanism */}
                  <InsightFeedback
                    decisionId={activeDecision.id}
                    activeTab={activeTab}
                    userId={user?.uid || null}
                    currentLanguage={currentLanguage}
                    onFeedbackSubmitted={(tab, feedbackItem) => {
                      setActiveDecision((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          feedback: {
                            ...(prev.feedback || {}),
                            [tab]: feedbackItem,
                          },
                        };
                      });
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={handleSelectFromHistory}
        onDeleteDecision={handleDeleteDecision}
        currentLanguage={currentLanguage}
        onOpenAuth={() => {
          setAuthModalMode('signin');
          setAuthPromptReason('Sign in to access and sync your decisions.');
          setShowAuthModal(true);
        }}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        promptReason={authPromptReason || undefined}
        currentLanguage={currentLanguage}
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onSuccess={() => {
          // If there is an active decision on screen and user just signed in, auto-save it to Firestore!
          if (activeDecision && user) {
            saveDecisionToFirestore(user.uid, activeDecision)
              .then(() => {
                setSaveSuccessToast(true);
                setTimeout(() => setSaveSuccessToast(false), 2500);
              })
              .catch((e) => console.warn('Could not auto-save on login:', e));
          }
        }}
      />

      {/* Translation Modal */}
      {activeDecision && (
        <TranslationModal
          isOpen={showTranslationModal}
          onClose={() => setShowTranslationModal(false)}
          decision={activeDecision}
          onTranslated={handleTranslatedReport}
          currentLang={currentLanguage}
        />
      )}

      {/* Gemini 3.1 Live Voice Modal */}
      <LiveVoiceModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
        activeDecision={activeDecision || null}
        currentLanguage={currentLanguage}
        onOpenZenaWidget={() => setIsZenaWidgetOpen(true)}
      />

      {/* Welcome Note & Introduction Modal on App Launch */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onStartDecision={() => {
          setShowWelcomeModal(false);
          if (activeDecision) {
            handleNewDecision();
          }
          setTimeout(() => {
            const inputEl = document.getElementById('decision-title');
            if (inputEl) {
              inputEl.focus();
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }}
        onExplorePresets={() => {
          setShowWelcomeModal(false);
          setShowTemplatesModal(true);
        }}
        onOpenVoice={() => {
          setShowWelcomeModal(false);
          setShowLiveVoiceModal(true);
        }}
        currentLanguage={currentLanguage}
      />

      {/* About Arbitr Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onSelectPreset={(preset) => handleSelectPreset(preset, false)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenWelcome={() => {
          setShowAboutModal(false);
          setShowWelcomeModal(true);
        }}
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onStartNew={() => {
          setSelectedPreset(null);
          handleNewDecision();
        }}
        currentLanguage={currentLanguage}
      />

      {/* Terms & Conditions of Service Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        currentLanguage={currentLanguage}
      />

      {/* Privacy Policy & Data Protection Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onOpenTerms={() => setShowTermsModal(true)}
        currentLanguage={currentLanguage}
      />

      {/* Templates & Dilemmas Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectPreset={handleSelectPreset}
        currentLanguage={currentLanguage}
      />

      {/* Hands-Free Wake Word Banner & Floating Control ("Hey Zena") */}
      <WakeWordBanner
        isEnabled={isWakeWordEnabled}
        isListening={isWakeWordListening}
        isSupported={isWakeWordSupported}
        needsPermission={isWakeWordNeedsPermission}
        lastDetectedPhrase={lastDetectedPhrase}
        onToggle={toggleWakeWord}
        onRequestMicPermission={requestMicPermission}
        onSimulate={simulateWakeWord}
        errorStatus={wakeWordError}
        currentLanguage={currentLanguage}
        isZenaOpen={isZenaWidgetOpen}
      />

      {/* Interactive Responsive Floating Voice Persona Widget: ZENA */}
      <ZenaVoiceWidget
        activeDecision={activeDecision}
        currentLanguage={currentLanguage}
        isOpen={isZenaWidgetOpen}
        onOpenChange={setIsZenaWidgetOpen}
        onOpenLiveModal={() => setShowLiveVoiceModal(true)}
      />

      {/* Subtle Footer with Web & Mobile Parity */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-300 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 shrink-0">
              <ArbitrEmblem className="h-5 w-5" glow={false} animated={true} />
            </div>
            <button
              id="footer-about-btn"
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="py-1 px-1 min-h-[36px] inline-flex items-center font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t.navAbout || 'About Arbitr'}
            </button>
            <span className="text-neutral-400 dark:text-neutral-600 select-none">•</span>
            <button
              id="footer-terms-btn"
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="py-1 px-1 min-h-[36px] inline-flex items-center font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t.navTerms || 'Terms & Conditions'}
            </button>
            <span className="text-neutral-400 dark:text-neutral-600 select-none">•</span>
            <button
              id="footer-privacy-btn"
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="py-1 px-1 min-h-[36px] inline-flex items-center font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t.navPrivacy || 'Privacy Policy'}
            </button>
            <span className="text-neutral-400 dark:text-neutral-600 select-none">•</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium py-1 inline-flex items-center">@arbitrapp</span>
            <span className="text-neutral-400 dark:text-neutral-600 hidden md:inline select-none">•</span>
            <span className="font-medium text-neutral-600 dark:text-neutral-300 hidden md:inline">{t.appTagline || 'Stop overthinking. Start deciding.'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
            <button
              id="footer-domain-btn"
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[38px] rounded-full bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs transition-all shadow-xs group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              title="Arbitr • arbitrapp.com — View Architecture & Domain Status"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-200">
                arbitrapp.com
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-100/70 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                Live
              </span>
            </button>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs hidden lg:inline">
              © {new Date().getFullYear()} Arbitr
            </span>
          </div>
        </div>
      </footer>
      {/* Floating Confirmation Toast for Decision Saved to Cloud Firestore */}
      <AnimatePresence>
        {saveSuccessToast && (
          <motion.div
            id="decision-saved-toast"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/90 bg-white/95 dark:bg-neutral-900/95 px-4 py-3 shadow-xl backdrop-blur-md text-sm text-neutral-800 dark:text-neutral-100 max-w-sm mx-auto sm:mx-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <BookmarkCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col pr-1 min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                {t.savedToast || 'Decision Saved!'}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {t.savedToCloudDesc || 'Stored securely in your Cloud Firestore decisions collection.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessToast(false)}
              className="ml-auto rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-xs"
              title="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connectivity & Offline Notification */}
      <OfflineIndicator />
    </div>
  );
}
