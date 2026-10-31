import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MicOff, AlertCircle } from 'lucide-react';
import { ZenaThemeId, ZENA_THEMES, getStoredZenaTheme } from '../utils/zenaThemes';

export interface HumanoidVoiceVisualizerProps {
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';
  isMuted: boolean;
  isModelSpeaking: boolean;
  isUserSpeaking: boolean;
  modelVolume: number;
  userVolume: number;
  voiceName: string;
  onToggleMute: () => void;
}

export const HumanoidVoiceVisualizer: React.FC<HumanoidVoiceVisualizerProps> = ({
  status,
  isMuted,
  isModelSpeaking,
  isUserSpeaking,
  modelVolume,
  userVolume,
  voiceName: _voiceName,
  onToggleMute,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tapPulse, setTapPulse] = useState(false);

  // Active character theme & glow profile from user settings
  const [themeId, setThemeId] = useState<ZenaThemeId>(getStoredZenaTheme);
  const activeTheme = ZENA_THEMES[themeId] || ZENA_THEMES.cyber;

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ZenaThemeId>;
      if (customEvent.detail && ZENA_THEMES[customEvent.detail]) {
        setThemeId(customEvent.detail);
      }
    };
    window.addEventListener('zena-theme-changed', handleThemeChange);
    return () => window.removeEventListener('zena-theme-changed', handleThemeChange);
  }, []);

  // Normalize RMS volumes (0.0 to 1.0)
  const clampedModelVol = Math.max(0, Math.min(1, modelVolume || 0));
  const clampedUserVol = Math.max(0, Math.min(1, userVolume || 0));

  // Determine active conversation state: 'speaking' | 'listening' | 'idle'
  const isSpeaking = status === 'connected' && isModelSpeaking;
  const isListening = status === 'connected' && !isMuted && (isUserSpeaking || clampedUserVol > 0.08);

  const conversationState: 'idle' | 'listening' | 'speaking' = isSpeaking
    ? 'speaking'
    : isListening
    ? 'listening'
    : 'idle';

  // Dynamic image source based on conversation state
  const avatarSrc =
    conversationState === 'speaking'
      ? '/zena-speaking.png'
      : conversationState === 'listening'
      ? '/zena-listening.png'
      : '/zena-idle.png';

  const handleContainerClick = () => {
    if (status !== 'connected') return;
    setTapPulse(true);
    setTimeout(() => setTapPulse(false), 300);
    onToggleMute();
  };

  // Generate 28 circular radial audio frequency ticks around the perimeter
  const radialTicks = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360;
    const waveOffset = Math.sin((i / 28) * Math.PI * 4);
    const tickHeight = isSpeaking
      ? 6 + clampedModelVol * 14 * (0.6 + 0.4 * Math.abs(waveOffset))
      : isListening
      ? 4 + clampedUserVol * 8 * (0.5 + 0.5 * Math.abs(waveOffset))
      : 3;
    return { id: i, angle, tickHeight };
  });

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto py-2 sm:py-4 select-none">
      {/* Visualizer Stage Container */}
      <div 
        className="relative flex items-center justify-center w-52 h-52 sm:w-68 sm:h-68 my-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* State 1: Listening Mode — Pulsing Radar Rings emitting outward in active theme color */}
        <AnimatePresence>
          {conversationState === 'listening' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 0.5, 1.0].map((delay, index) => (
                <motion.div
                  key={`radar-ring-${index}`}
                  initial={{ scale: 0.95, opacity: 0.7 }}
                  animate={{
                    scale: [0.95, 1.4 + clampedUserVol * 0.25, 1.8],
                    opacity: [0.7, 0.3, 0],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay,
                    ease: 'easeOut',
                  }}
                  style={{
                    borderColor: `${activeTheme.accentHex}cc`,
                    backgroundColor: `${activeTheme.accentHex}18`,
                    boxShadow: `0 0 20px ${activeTheme.glowHex}`,
                  }}
                  className="absolute rounded-full border w-44 h-44 sm:w-60 sm:h-60"
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* State 2: Speaking Mode — Themed Glow Aura Backdrop */}
        <AnimatePresence>
          {conversationState === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0.55, 0.9, 0.55],
                scale: [1.02, 1.16 + clampedModelVol * 0.15, 1.02],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-gradient-to-tr ${activeTheme.speakingBackdrop} blur-2xl pointer-events-none`}
            />
          )}
        </AnimatePresence>

        {/* Ambient Backlight (Idle State) */}
        {conversationState === 'idle' && status === 'connected' && (
          <div 
            className={`absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full ${activeTheme.idleGlowBackdrop} blur-2xl pointer-events-none transition-all duration-300`}
          />
        )}

        {/* Circular Frequency Waveform Ring hugging outer circumference */}
        <svg
          viewBox="0 0 280 280"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
        >
          {/* Outer Dashed Orbit Track */}
          <circle
            cx="140"
            cy="140"
            r="126"
            fill="none"
            stroke={
              conversationState === 'speaking'
                ? activeTheme.svgTrackSpeaking
                : conversationState === 'listening'
                ? activeTheme.svgStrokeListening
                : activeTheme.svgStrokeIdle
            }
            strokeWidth="1.2"
            strokeDasharray={conversationState === 'speaking' ? '4 3' : '3 6'}
            strokeOpacity={conversationState === 'speaking' ? 0.85 : 0.4}
            className={conversationState === 'speaking' ? 'animate-[spin_8s_linear_infinite]' : 'animate-[spin_30s_linear_infinite]'}
          />

          {/* Radial Audio Frequency Ticks hugging circumference */}
          <g transform="translate(140, 140)">
            {radialTicks.map((tick) => (
              <line
                key={tick.id}
                x1="0"
                y1="-120"
                x2="0"
                y2={-120 - tick.tickHeight}
                stroke={
                  isMuted
                    ? '#f43f5e'
                    : conversationState === 'speaking'
                    ? activeTheme.svgStrokeSpeaking
                    : conversationState === 'listening'
                    ? activeTheme.svgStrokeListening
                    : activeTheme.svgStrokeIdle
                }
                strokeWidth={conversationState === 'speaking' ? '2' : '1.5'}
                strokeLinecap="round"
                strokeOpacity={
                  conversationState === 'speaking'
                    ? (clampedModelVol > 0.05 ? 0.95 : 0.5)
                    : conversationState === 'listening'
                    ? 0.85
                    : 0.35
                }
                transform={`rotate(${tick.angle})`}
              />
            ))}
          </g>
        </svg>

        {/* Central Character Avatar Container (min 180x180px mobile, 240x240px desktop) */}
        <motion.div
          animate={
            conversationState === 'idle'
              ? { y: [0, -6, 0] } // Gentle floating hover animation (y: [0, -6, 0])
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          className="relative z-20"
        >
          {/* Pulsing Outer Ring when Listening */}
          {conversationState === 'listening' && (
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                opacity: [0.65, 1, 0.65],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute -inset-1.5 sm:-inset-2 rounded-full border-2 ${activeTheme.listeningOuterRing} pointer-events-none z-30`}
            />
          )}

          {/* Avatar Base Container with Audio-Reactive Pulse on Speaking */}
          <motion.div
            animate={
              tapPulse
                ? { scale: 0.94 }
                : conversationState === 'speaking'
                ? { scale: [1, 1.05 + clampedModelVol * 0.08, 1] } // Audio-reactive scale pulse [1, 1.05, 1]
                : { scale: 1.0 }
            }
            transition={
              conversationState === 'speaking'
                ? {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }
            }
            onClick={handleContainerClick}
            className={`w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] rounded-full border-2 bg-slate-950/85 backdrop-blur-xl overflow-hidden relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isMuted
                ? 'border-rose-500/70 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                : conversationState === 'speaking'
                ? `${activeTheme.speakingBorder} ${activeTheme.speakingShadow} ring-2 ring-white/10`
                : conversationState === 'listening'
                ? `${activeTheme.listeningBorder} ${activeTheme.listeningShadow} ring-2 ring-white/10`
                : `${activeTheme.idleBorder} ${activeTheme.idleShadow}`
            }`}
            title={status === 'connected' ? (isMuted ? 'Tap to unmute ZENA' : 'Tap to mute ZENA') : undefined}
          >
            {/* Smooth Crossfade Transitions Between Expression States */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.img
                  key={avatarSrc}
                  src={avatarSrc}
                  alt={`ZENA - ${conversationState}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== window.location.origin + '/zena.png') {
                      target.src = '/zena.png';
                    }
                  }}
                  className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transform scale-105 transition-transform duration-300 ${
                    conversationState === 'speaking' ? 'brightness-110 contrast-105' : 'brightness-100'
                  }`}
                />
              </AnimatePresence>
            </div>

            {/* Subtle Inner Glass Vignette Gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-950/40 via-transparent to-white/5 pointer-events-none z-10" />

            {/* Interactive Mute Overlay Badge */}
            {isMuted && (
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex flex-col items-center justify-center text-rose-400 z-20">
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10 mb-1 drop-shadow" />
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                  Muted
                </span>
              </div>
            )}

            {/* Speaking 3-Bar Audio Equalizer Overlay in Corner */}
            {conversationState === 'speaking' && (
              <div 
                className="absolute bottom-3 right-3 flex items-end gap-0.5 p-1 rounded-full bg-slate-950/80 border shadow-md z-20"
                style={{ borderColor: activeTheme.accentHex }}
              >
                <span 
                  className="w-1 rounded-full transition-all duration-75"
                  style={{ height: `${6 + clampedModelVol * 12}px`, backgroundColor: activeTheme.secondaryHex }} 
                />
                <span 
                  className="w-1 rounded-full transition-all duration-75"
                  style={{ height: `${10 + clampedModelVol * 14}px`, backgroundColor: activeTheme.accentHex }} 
                />
                <span 
                  className="w-1 rounded-full transition-all duration-75"
                  style={{ height: `${5 + clampedModelVol * 10}px`, backgroundColor: activeTheme.secondaryHex }} 
                />
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Hover / Tap Hint Pill */}
        <div
          className={`absolute -bottom-2 z-30 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all duration-200 border pointer-events-none shadow-lg ${
            isHovered && status === 'connected'
              ? 'opacity-100 translate-y-0 bg-neutral-900/95 text-neutral-100 border-neutral-700'
              : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          {isMuted ? 'Tap character to unmute' : 'Tap character to mute'}
        </div>
      </div>

      {/* Live Session HUD & Status Badge */}
      <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
        {status === 'connected' && (
          <>
            {isMuted ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-700 dark:text-rose-300 font-semibold text-xs shadow-xs">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>🔴 ZENA • Mic Muted (Tap to Speak)</span>
              </div>
            ) : conversationState === 'speaking' ? (
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold text-xs animate-pulse ${activeTheme.badgeSpeaking}`}>
                <span className={`h-2 w-2 rounded-full ${activeTheme.dotColor.speaking} animate-ping`} />
                <span>🟣 ZENA • Synthesizing Verdict...</span>
              </div>
            ) : conversationState === 'listening' ? (
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold text-xs ${activeTheme.badgeListening}`}>
                <span className={`h-2 w-2 rounded-full ${activeTheme.dotColor.listening} animate-ping`} />
                <span>🟢 ZENA • Listening...</span>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium text-xs ${activeTheme.badgeIdle}`}>
                <span className={`h-2 w-2 rounded-full ${activeTheme.dotColor.idle} animate-pulse`} />
                <span>🌐 ZENA • Online & Ready ({activeTheme.name})</span>
              </div>
            )}
          </>
        )}

        {status === 'connecting' && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 font-medium text-xs animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>🟡 ZENA • Connecting...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-700 dark:text-rose-300 font-medium text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>⚠️ ZENA • Offline / Link Error</span>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium text-xs">
            <span className="h-2 w-2 rounded-full bg-neutral-400" />
            <span>⚪ ZENA • Disconnected</span>
          </div>
        )}

        {/* Subtitle guidance text */}
        <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mt-0.5">
          {status === 'connected'
            ? isMuted
              ? 'Microphone muted. Tap Zena or the mic button below to talk.'
              : 'Full-duplex live audio — speak naturally or interrupt anytime.'
            : 'Establishing low-latency neural audio link...'}
        </p>
      </div>
    </div>
  );
};
