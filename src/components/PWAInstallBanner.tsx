import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ArbitrEmblem } from './ArbitrLogo';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isIframe, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  // Check session and local storage dismissal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sessionDismiss = sessionStorage.getItem('arbitr_pwa_banner_dismissed') === 'true';
      const localDismissTime = localStorage.getItem('arbitr_pwa_banner_dismissed_at');
      if (sessionDismiss) {
        setDismissed(true);
        return;
      }
      if (localDismissTime) {
        const elapsedHours = (Date.now() - parseInt(localDismissTime, 10)) / (1000 * 60 * 60);
        // Reshow banner after 48 hours if dismissed previously
        if (elapsedHours < 48) {
          setDismissed(true);
        }
      }
    } catch {
      // Storage restricted
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('arbitr_pwa_banner_dismissed', 'true');
      localStorage.setItem('arbitr_pwa_banner_dismissed_at', Date.now().toString());
    } catch {
      // Storage restricted
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        const accepted = await install();
        if (accepted) {
          setInstalledSuccess(true);
          setTimeout(() => {
            setInstalledSuccess(false);
            setDismissed(true);
          }, 3500);
        }
      } catch (err) {
        console.warn('[PWA Banner] Install failed:', err);
      } finally {
        setInstalling(false);
      }
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
  };

  // If already installed, running in standalone mode, dismissed, or inside sandboxed iframe without installability
  if (isInstalled || dismissed || (isIframe && !isInstallable)) {
    return null;
  }

  // Only display if installable via beforeinstallprompt OR on iOS device
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!dismissed && (
          <motion.aside
            id="pwa-install-banner"
            role="region"
            aria-label="Install Arbitr Application"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="fixed bottom-24 inset-x-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-40 rounded-2xl border border-indigo-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/98 backdrop-blur-2xl p-4 shadow-2xl text-neutral-900 dark:text-white"
          >
            <div className="flex items-start gap-3">
              {/* App Icon / Emblem */}
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-500/40 ring-1 ring-cyan-500/20">
                <ArbitrEmblem className="h-7 w-7" glow={true} animated={false} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                </span>
              </div>

              {/* Banner Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white leading-tight truncate">
                    {isIOS ? 'Add Arbitr to Home Screen' : 'Install Arbitr App'}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
                    PWA
                  </span>
                </div>

                <p className="text-[11px] text-neutral-600 dark:text-slate-300 leading-snug">
                  {isIOS
                    ? 'Get 1-tap home screen access and fullscreen decision deliberation.'
                    : 'Fast offline access, 1-tap launcher, and fullscreen decision referee.'}
                </p>

                {/* Action Buttons Row */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    id="pwa-banner-install-btn"
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[34px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{installing ? 'Opening Prompt...' : isIOS ? 'Add to Home Screen' : 'Install Now'}</span>
                  </button>

                  <button
                    id="pwa-banner-dismiss-btn"
                    type="button"
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Not now
                  </button>
                </div>
              </div>

              {/* Close Icon Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss install banner"
                aria-label="Dismiss install banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Success Toast when installed */}
      <AnimatePresence>
        {installedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Arbitr has been installed to your device!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Guided Install Sheet */}
      <AnimatePresence>
        {showIOSModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          >
            <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-white/15 p-6 shadow-2xl space-y-4">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Install on iPhone / iPad</h3>
                  <p className="text-xs text-neutral-500 dark:text-slate-300">Apple iOS Safari instructions</p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-neutral-50 dark:bg-slate-800/80 p-3.5 text-xs text-neutral-800 dark:text-slate-200 border border-neutral-200/80 dark:border-white/10">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">1</span>
                  <p>Tap the <strong>Share</strong> button <Share2 className="inline h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 -mt-0.5" /> in Safari's bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">2</span>
                  <p>Scroll down the menu and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 -mt-0.5" />.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">3</span>
                  <p>Tap <strong>Add</strong> in the top-right corner to finish.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
