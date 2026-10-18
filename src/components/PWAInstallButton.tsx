import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  PlusSquare, 
  X, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'mobile' | 'compact';
  className?: string;
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
  onInstalled,
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isIframe, 
    isAndroid, 
    isMacOS, 
    browserName, 
    install, 
    openStandaloneWindow 
  } = usePWAInstall();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  // If already running inside standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    // If native Chromium beforeinstallprompt is ready, trigger it directly!
    if (isInstallable) {
      setInstalling(true);
      try {
        const accepted = await install();
        if (accepted) {
          setInstalledSuccess(true);
          onInstalled?.();
          setTimeout(() => setInstalledSuccess(false), 4000);
          return;
        }
      } catch (err) {
        console.warn('[PWA] Native install failed, opening guided sheet:', err);
      } finally {
        setInstalling(false);
      }
    }

    // In all other cases (iframe, iOS, desktop without prompt, Firefox, Safari):
    // Open the comprehensive guided installation modal
    setShowModal(true);
  };

  const renderButton = () => {
    if (variant === 'mobile') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className={`flex items-center gap-2.5 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 text-left transition-colors min-h-[48px] cursor-pointer w-full ${className}`}
          title={isIOS ? 'Add Arbitr to your Home Screen on iOS' : 'Install Arbitr Progressive Web App'}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 shadow-xs">
            <Download className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                {isIOS ? 'Install on iPhone / iPad' : 'Install Arbitr App'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                PWA
              </span>
            </div>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 truncate block">
              {isIOS ? 'Add to Home Screen' : 'Fast offline access & Home Screen launcher'}
            </span>
          </div>
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${className}`}
          title={isIOS ? 'Install on iOS Safari' : 'Install Arbitr App'}
          aria-label="Install Arbitr Application"
        >
          <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-xs">Install</span>
        </button>
      );
    }

    // Default 'navbar' variant for desktop & tablet
    return (
      <button
        id="pwa-install-nav-btn"
        type="button"
        onClick={handleInstallClick}
        disabled={installing}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer min-h-[38px] shadow-2xs group ${className}`}
        title={isIOS ? 'Install Arbitr on iOS Safari' : 'Install Arbitr as a standalone desktop/mobile app'}
        aria-label="Install Arbitr PWA"
      >
        <div className="relative flex items-center justify-center">
          <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
        </div>
        <span>Install App</span>
        <span className="hidden lg:inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
          PWA
        </span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Success Toast when installed */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Arbitr has been installed to your device!</span>
        </div>
      )}

      {/* Comprehensive Guided Install Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 shadow-2xl relative text-left text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                    Install Arbitr
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800">
                    PWA Ready
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  Fast offline access, native window, and 1-tap home screen launch
                </p>
              </div>
            </div>

            {/* If inside an iframe (AI Studio preview environment), provide 1-click launch to standalone window */}
            {isIframe && (
              <div className="mb-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 p-4 text-xs text-indigo-950 dark:text-indigo-200">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-100">
                      Embedded Preview Notice
                    </h4>
                    <p className="mt-1 leading-relaxed text-indigo-900/90 dark:text-indigo-200/90">
                      Web browsers disable native PWA install prompts inside preview iframes. Open Arbitr in a dedicated browser tab to trigger the native 1-click install button.
                    </p>
                    <button
                      type="button"
                      onClick={openStandaloneWindow}
                      className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open in Dedicated Window to Install</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Specific Steps */}
            <div className="space-y-4 my-4">
              {/* iOS Safari Guide */}
              {isIOS ? (
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>How to Install on iPhone &amp; iPad (Safari)</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-200">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="leading-relaxed">
                        Tap the <strong className="font-semibold text-neutral-900 dark:text-white inline-flex items-center gap-1">Share <Share2 className="inline h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /></strong> icon in the bottom Safari toolbar.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="leading-relaxed">
                        Scroll down the share menu and select <strong className="font-semibold text-neutral-900 dark:text-white inline-flex items-center gap-1"><PlusSquare className="inline h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Add to Home Screen</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="leading-relaxed">
                        Tap <strong className="font-semibold text-neutral-900 dark:text-white">Add</strong> in the top-right corner to launch Arbitr anytime like a native app.
                      </div>
                    </div>
                  </div>
                </div>
              ) : isAndroid ? (
                /* Android Chrome / Samsung Guide */
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>How to Install on Android ({browserName})</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-200">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="leading-relaxed">
                        Tap the browser menu <strong className="font-semibold text-neutral-900 dark:text-white">⋮ (three dots)</strong> in the top-right corner.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="leading-relaxed">
                        Select <strong className="font-semibold text-neutral-900 dark:text-white">&ldquo;Install app&rdquo;</strong> or <strong className="font-semibold text-neutral-900 dark:text-white">&ldquo;Add to Home screen&rdquo;</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="leading-relaxed">
                        Confirm <strong className="font-semibold text-neutral-900 dark:text-white">Install</strong> to add the icon directly to your home screen.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Chrome, Edge, Safari, Firefox Guide */
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                    <Monitor className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span>How to Install on Desktop ({browserName || 'Browser'})</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-200">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="leading-relaxed">
                        Look for the <strong className="font-semibold text-neutral-900 dark:text-white">Install icon (⊕ or computer with down arrow)</strong> on the right side of your browser address bar.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="leading-relaxed">
                        Or click your browser menu <strong className="font-semibold text-neutral-900 dark:text-white">(⋮ or ⋯)</strong> and select <strong className="font-semibold text-neutral-900 dark:text-white">&ldquo;Install Arbitr...&rdquo;</strong> (or &ldquo;Save and share&rdquo; → &ldquo;Install app&rdquo;).
                      </div>
                    </div>

                    {isMacOS && (
                      <div className="flex items-start gap-2.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          <strong>macOS Safari tip:</strong> In Safari menu bar, click <strong>File</strong> → <strong>Add to Dock...</strong>.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* What you get with PWA */}
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-2xs">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Why Install Arbitr?</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                  <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <strong className="block text-neutral-900 dark:text-white font-semibold mb-0.5">Offline Access</strong>
                    Browse templates and view saved decisions even when disconnected.
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <strong className="block text-neutral-900 dark:text-white font-semibold mb-0.5">Zena Spoken Voice</strong>
                    Fast 1-tap launcher to start deliberating without browser URL bars.
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <strong className="block text-neutral-900 dark:text-white font-semibold mb-0.5">Zero Lag</strong>
                    Pre-cached assets launch instantly on mobile and desktop.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    const accepted = await install();
                    if (accepted) {
                      setInstalledSuccess(true);
                      setShowModal(false);
                      onInstalled?.();
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-md transition-all cursor-pointer min-h-[44px]"
                >
                  <Download className="h-4 w-4" />
                  <span>Install to Device Now</span>
                </button>
              )}

              {isIframe && (
                <button
                  type="button"
                  onClick={openStandaloneWindow}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Standalone Window</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
