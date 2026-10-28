import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Play, Radio, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { HumanoidIcon } from './HumanoidIcon';
import { getTranslation } from '../utils/i18n';

interface WakeWordBannerProps {
  isEnabled: boolean;
  isListening: boolean;
  isSupported: boolean;
  needsPermission?: boolean;
  lastDetectedPhrase: string | null;
  onToggle: () => void;
  onRequestMicPermission?: () => Promise<boolean>;
  onSimulate: (phrase?: string) => void;
  onCallZena?: () => void;
  errorStatus?: string | null;
  currentLanguage?: string;
  isZenaOpen?: boolean;
}

export const WakeWordBanner: React.FC<WakeWordBannerProps> = ({
  isEnabled,
  isListening,
  isSupported,
  needsPermission = false,
  lastDetectedPhrase: _lastDetectedPhrase,
  onToggle,
  onRequestMicPermission,
  onSimulate,
  onCallZena,
  errorStatus,
  currentLanguage = 'en',
  isZenaOpen = false,
}) => {
  const t = getTranslation(currentLanguage);
  const [showInfo, setShowInfo] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleGrantMic = async () => {
    if (!onRequestMicPermission) return;
    setRequesting(true);
    try {
      await onRequestMicPermission();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      {/* Floating Wake Word Status & Control Pill (Docked neatly beside Zena avatar, hidden when live voice modal is open) */}
      {!isZenaOpen && (
        <div 
          id="wake-word-status-bar"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-24 z-20 flex items-center gap-2 pointer-events-auto max-w-[calc(100vw-1.5rem)]"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 px-2.5 sm:px-3 py-1.5 shadow-lg shadow-neutral-900/5 backdrop-blur-md text-xs text-neutral-700 dark:text-neutral-300 transition-all">
          
          {/* Permission Needed / Blocked State */}
          {needsPermission ? (
            <button
              id="wake-word-grant-mic-btn"
              type="button"
              onClick={handleGrantMic}
              disabled={requesting}
              className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
              title="Click to grant microphone permission for hands-free wake word"
            >
              <MicOff className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span className="font-semibold text-[11px]">
                {requesting ? (t.wakeBannerRequesting || 'Requesting...') : (t.wakeBannerEnableMic || 'Enable Mic')}
              </span>
            </button>
          ) : !isSupported ? (
            /* Unsupported Browser Fallback */
            <button
              type="button"
              onClick={onCallZena || (() => onSimulate('Hey Zena'))}
              className="flex items-center gap-1.5 font-medium hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
              title="Tap to launch direct live voice deliberation with Zena"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span className="font-mono font-semibold text-[11px] text-neutral-800 dark:text-neutral-200">
                Voice: Tap Call
              </span>
            </button>
          ) : (
            /* Standard Toggle Button */
            <button
              id="wake-word-toggle-btn"
              type="button"
              onClick={onToggle}
              className="flex items-center gap-1.5 font-medium hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
              title={
                isEnabled && isListening
                  ? 'Wake word detection ACTIVE: Say "Hey Zena" anytime to start voice deliberation'
                  : isEnabled
                  ? 'Wake word starting... (or click Call Zena)'
                  : 'Wake word paused. Click to turn on.'
              }
            >
              {isEnabled && isListening ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              ) : isEnabled ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 animate-pulse"></span>
                </span>
              ) : (
                <span className="inline-flex rounded-full h-2 w-2 bg-neutral-400 dark:bg-neutral-600"></span>
              )}

              <span className="font-mono font-semibold text-[11px] text-neutral-800 dark:text-neutral-200">
                {isEnabled && isListening ? (
                  <span>&ldquo;Hey Zena&rdquo;</span>
                ) : isEnabled ? (
                  <span>Listening...</span>
                ) : (
                  <span>{t.wakeBannerOff || 'Wake: Off'}</span>
                )}
              </span>
            </button>
          )}

          <div className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-700 mx-0.5"></div>

          {/* One Call Away: Direct Live Conversation Trigger */}
          <button
            id="wake-word-call-live-btn"
            type="button"
            onClick={onCallZena || (() => onSimulate('Hey Zena'))}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-semibold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer min-h-[28px]"
            title="One Call Away: Direct to live real-time voice conversation with Zena"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Call Zena</span>
          </button>

          {/* Info toggle button */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full cursor-pointer"
            title="Wake word information & keyboard shortcut"
          >
            <Radio className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Info popover */}
        {showInfo && (
          <div className="absolute bottom-12 right-0 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xl text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                <span>Zena Hands-Free Voice Wake</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 mb-2 leading-relaxed">
              Speak out loud at any time while the application is open:
            </p>

            <div className="flex items-center justify-center p-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/50 dark:border-cyan-800/50 font-mono text-cyan-800 dark:text-cyan-200 font-semibold text-center mb-2.5 text-sm">
              &ldquo;Hey Zena&rdquo;
            </div>

            <div className="space-y-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>Recognizes &ldquo;Hey Zena&rdquo;, &ldquo;Zena&rdquo;, &ldquo;Hi Zena&rdquo;, or &ldquo;OK Zena&rdquo;</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>Keyboard shortcut: <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-700 dark:text-neutral-300 text-[10px] border border-neutral-300 dark:border-neutral-700">Alt + Z</kbd> (or Option + Z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>Sounds synthesized 3-tone harmonic chime and connects live</span>
              </div>
            </div>

            {needsPermission && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 mb-3 text-[11px] flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Microphone Access Needed</span>
                  Browser requires user permission to listen in background.
                  <button
                    type="button"
                    onClick={handleGrantMic}
                    disabled={requesting}
                    className="mt-1.5 block px-2 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                  >
                    {requesting ? 'Prompting...' : 'Grant Microphone Access'}
                  </button>
                </div>
              </div>
            )}

            {errorStatus && !needsPermission && (
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mb-3 text-[11px]">
                ℹ️ {errorStatus}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
              <span className="text-neutral-400">
                Engine: {isSupported ? (isEnabled ? (isListening ? 'Active (Listening)' : 'Connecting') : 'Paused') : 'Unsupported Browser'}
              </span>
              <button
                type="button"
                onClick={onToggle}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isEnabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
};
