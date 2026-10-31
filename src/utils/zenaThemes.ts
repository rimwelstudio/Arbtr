export type ZenaThemeId = 'cyber' | 'solar' | 'violet' | 'emerald' | 'cobalt' | 'crimson';

export interface ZenaThemeConfig {
  id: ZenaThemeId;
  name: string;
  tagline: string;
  swatchGradient: string; // Tailwind gradient for preview button
  accentHex: string;
  glowHex: string;
  secondaryHex: string;

  // Floating trigger button & avatar classes
  idleBorder: string;
  idleShadow: string;
  idleGlowBackdrop: string;
  
  listeningBorder: string;
  listeningShadow: string;
  listeningRing: string;
  listeningBadge: string;
  listeningOuterRing: string;

  speakingBorder: string;
  speakingShadow: string;
  speakingRing: string;
  speakingBadge: string;
  speakingBackdrop: string;

  // Visualizer live SVG & tick colors
  svgStrokeIdle: string;
  svgStrokeListening: string;
  svgStrokeSpeaking: string;
  svgTrackSpeaking: string;
  
  // Status badges & micro dots
  badgeIdle: string;
  badgeListening: string;
  badgeSpeaking: string;
  dotColor: {
    idle: string;
    listening: string;
    speaking: string;
  };
}

export const ZENA_THEMES: Record<ZenaThemeId, ZenaThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    tagline: 'Electric Cyan & Vivid Magenta',
    swatchGradient: 'from-cyan-400 via-sky-500 to-fuchsia-500',
    accentHex: '#22d3ee',
    glowHex: 'rgba(34, 211, 238, 0.45)',
    secondaryHex: '#d946ef',

    idleBorder: 'border-cyan-400/60 hover:border-cyan-300',
    idleShadow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_28px_rgba(34,211,238,0.65)]',
    idleGlowBackdrop: 'bg-cyan-500/15',

    listeningBorder: 'border-cyan-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(34,211,238,0.6)]',
    listeningRing: 'ring-4 ring-cyan-400/60',
    listeningBadge: 'bg-cyan-500 text-white',
    listeningOuterRing: 'border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.7)]',

    speakingBorder: 'border-fuchsia-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(217,70,239,0.7),0_0_25px_rgba(34,211,238,0.5)]',
    speakingRing: 'ring-4 ring-fuchsia-500/40',
    speakingBadge: 'bg-purple-500 text-white',
    speakingBackdrop: 'from-fuchsia-600/40 via-purple-600/35 to-cyan-500/35',

    svgStrokeIdle: '#38bdf8',
    svgStrokeListening: '#22d3ee',
    svgStrokeSpeaking: '#e879f9',
    svgTrackSpeaking: '#e879f9',

    badgeIdle: 'bg-cyan-500/10 border-cyan-400/40 text-cyan-700 dark:text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]',
    badgeListening: 'bg-cyan-500/15 border-cyan-400/50 text-cyan-700 dark:text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    badgeSpeaking: 'bg-fuchsia-500/15 border-fuchsia-400/50 text-fuchsia-700 dark:text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.35)]',
    dotColor: {
      idle: 'bg-cyan-500',
      listening: 'bg-cyan-500',
      speaking: 'bg-fuchsia-500',
    },
  },

  solar: {
    id: 'solar',
    name: 'Solar Flare',
    tagline: 'Radiant Gold & Incandescent Amber',
    swatchGradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentHex: '#f59e0b',
    glowHex: 'rgba(245, 158, 11, 0.5)',
    secondaryHex: '#f97316',

    idleBorder: 'border-amber-400/60 hover:border-amber-300',
    idleShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_28px_rgba(245,158,11,0.7)]',
    idleGlowBackdrop: 'bg-amber-500/15',

    listeningBorder: 'border-amber-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.65)]',
    listeningRing: 'ring-4 ring-amber-400/60',
    listeningBadge: 'bg-amber-500 text-white',
    listeningOuterRing: 'border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.75)]',

    speakingBorder: 'border-orange-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(249,115,22,0.75),0_0_25px_rgba(234,179,8,0.5)]',
    speakingRing: 'ring-4 ring-orange-500/40',
    speakingBadge: 'bg-orange-500 text-white',
    speakingBackdrop: 'from-orange-600/40 via-amber-600/35 to-rose-500/35',

    svgStrokeIdle: '#f59e0b',
    svgStrokeListening: '#facc15',
    svgStrokeSpeaking: '#fb923c',
    svgTrackSpeaking: '#fb923c',

    badgeIdle: 'bg-amber-500/10 border-amber-400/40 text-amber-700 dark:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    badgeListening: 'bg-amber-500/15 border-amber-400/50 text-amber-700 dark:text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    badgeSpeaking: 'bg-orange-500/15 border-orange-400/50 text-orange-700 dark:text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    dotColor: {
      idle: 'bg-amber-500',
      listening: 'bg-amber-500',
      speaking: 'bg-orange-500',
    },
  },

  violet: {
    id: 'violet',
    name: 'Hyper Violet',
    tagline: 'Mystic Lavender & Ultraviolet',
    swatchGradient: 'from-purple-500 via-violet-500 to-pink-500',
    accentHex: '#a855f7',
    glowHex: 'rgba(168, 85, 247, 0.5)',
    secondaryHex: '#ec4899',

    idleBorder: 'border-purple-400/60 hover:border-purple-300',
    idleShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7)]',
    idleGlowBackdrop: 'bg-purple-500/15',

    listeningBorder: 'border-purple-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(168,85,247,0.65)]',
    listeningRing: 'ring-4 ring-purple-400/60',
    listeningBadge: 'bg-purple-500 text-white',
    listeningOuterRing: 'border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.75)]',

    speakingBorder: 'border-pink-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(236,72,153,0.75),0_0_25px_rgba(168,85,247,0.5)]',
    speakingRing: 'ring-4 ring-pink-500/40',
    speakingBadge: 'bg-pink-500 text-white',
    speakingBackdrop: 'from-purple-600/40 via-violet-600/35 to-pink-500/35',

    svgStrokeIdle: '#a855f7',
    svgStrokeListening: '#c084fc',
    svgStrokeSpeaking: '#f472b6',
    svgTrackSpeaking: '#f472b6',

    badgeIdle: 'bg-purple-500/10 border-purple-400/40 text-purple-700 dark:text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    badgeListening: 'bg-purple-500/15 border-purple-400/50 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    badgeSpeaking: 'bg-pink-500/15 border-pink-400/50 text-pink-700 dark:text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    dotColor: {
      idle: 'bg-purple-500',
      listening: 'bg-purple-500',
      speaking: 'bg-pink-500',
    },
  },

  emerald: {
    id: 'emerald',
    name: 'Quantum Mint',
    tagline: 'Tactical Emerald & Electric Jade',
    swatchGradient: 'from-emerald-400 via-teal-500 to-cyan-400',
    accentHex: '#10b981',
    glowHex: 'rgba(16, 185, 129, 0.5)',
    secondaryHex: '#14b8a6',

    idleBorder: 'border-emerald-400/60 hover:border-emerald-300',
    idleShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:shadow-[0_0_28px_rgba(16,185,129,0.7)]',
    idleGlowBackdrop: 'bg-emerald-500/15',

    listeningBorder: 'border-emerald-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.65)]',
    listeningRing: 'ring-4 ring-emerald-400/60',
    listeningBadge: 'bg-emerald-500 text-white',
    listeningOuterRing: 'border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.75)]',

    speakingBorder: 'border-teal-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(20,184,166,0.75),0_0_25px_rgba(16,185,129,0.5)]',
    speakingRing: 'ring-4 ring-teal-500/40',
    speakingBadge: 'bg-teal-500 text-white',
    speakingBackdrop: 'from-emerald-600/40 via-teal-600/35 to-cyan-500/35',

    svgStrokeIdle: '#34d399',
    svgStrokeListening: '#4ade80',
    svgStrokeSpeaking: '#2dd4bf',
    svgTrackSpeaking: '#2dd4bf',

    badgeIdle: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-700 dark:text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    badgeListening: 'bg-emerald-500/15 border-emerald-400/50 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    badgeSpeaking: 'bg-teal-500/15 border-teal-400/50 text-teal-700 dark:text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.35)]',
    dotColor: {
      idle: 'bg-emerald-500',
      listening: 'bg-emerald-500',
      speaking: 'bg-teal-500',
    },
  },

  cobalt: {
    id: 'cobalt',
    name: 'Deep Abyss',
    tagline: 'Glacial Sapphire & Arctic Sky',
    swatchGradient: 'from-blue-500 via-sky-500 to-indigo-600',
    accentHex: '#3b82f6',
    glowHex: 'rgba(59, 130, 246, 0.5)',
    secondaryHex: '#0284c7',

    idleBorder: 'border-blue-400/60 hover:border-blue-300',
    idleShadow: 'shadow-[0_0_20px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.7)]',
    idleGlowBackdrop: 'bg-blue-500/15',

    listeningBorder: 'border-blue-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(59,130,246,0.65)]',
    listeningRing: 'ring-4 ring-blue-400/60',
    listeningBadge: 'bg-blue-500 text-white',
    listeningOuterRing: 'border-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.75)]',

    speakingBorder: 'border-sky-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(14,165,233,0.75),0_0_25px_rgba(59,130,246,0.5)]',
    speakingRing: 'ring-4 ring-sky-500/40',
    speakingBadge: 'bg-sky-500 text-white',
    speakingBackdrop: 'from-blue-600/40 via-sky-600/35 to-indigo-500/35',

    svgStrokeIdle: '#3b82f6',
    svgStrokeListening: '#60a5fa',
    svgStrokeSpeaking: '#38bdf8',
    svgTrackSpeaking: '#38bdf8',

    badgeIdle: 'bg-blue-500/10 border-blue-400/40 text-blue-700 dark:text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    badgeListening: 'bg-blue-500/15 border-blue-400/50 text-blue-700 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    badgeSpeaking: 'bg-sky-500/15 border-sky-400/50 text-sky-700 dark:text-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.35)]',
    dotColor: {
      idle: 'bg-blue-500',
      listening: 'bg-blue-500',
      speaking: 'bg-sky-500',
    },
  },

  crimson: {
    id: 'crimson',
    name: 'Crimson Protocol',
    tagline: 'Vivid Ruby & Sunset Scarlet',
    swatchGradient: 'from-rose-500 via-red-500 to-amber-500',
    accentHex: '#f43f5e',
    glowHex: 'rgba(244, 63, 94, 0.5)',
    secondaryHex: '#f59e0b',

    idleBorder: 'border-rose-400/60 hover:border-rose-300',
    idleShadow: 'shadow-[0_0_20px_rgba(244,63,94,0.45)] hover:shadow-[0_0_28px_rgba(244,63,94,0.7)]',
    idleGlowBackdrop: 'bg-rose-500/15',

    listeningBorder: 'border-rose-400',
    listeningShadow: 'shadow-[0_0_35px_rgba(244,63,94,0.65)]',
    listeningRing: 'ring-4 ring-rose-400/60',
    listeningBadge: 'bg-rose-500 text-white',
    listeningOuterRing: 'border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.75)]',

    speakingBorder: 'border-rose-400/90',
    speakingShadow: 'shadow-[0_0_40px_rgba(244,63,94,0.75),0_0_25px_rgba(245,158,11,0.5)]',
    speakingRing: 'ring-4 ring-rose-500/40',
    speakingBadge: 'bg-rose-500 text-white',
    speakingBackdrop: 'from-rose-600/40 via-red-600/35 to-amber-500/35',

    svgStrokeIdle: '#f43f5e',
    svgStrokeListening: '#fb7185',
    svgStrokeSpeaking: '#f59e0b',
    svgTrackSpeaking: '#f59e0b',

    badgeIdle: 'bg-rose-500/10 border-rose-400/40 text-rose-700 dark:text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    badgeListening: 'bg-rose-500/15 border-rose-400/50 text-rose-700 dark:text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    badgeSpeaking: 'bg-amber-500/15 border-amber-400/50 text-amber-700 dark:text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    dotColor: {
      idle: 'bg-rose-500',
      listening: 'bg-rose-500',
      speaking: 'bg-amber-500',
    },
  },
};

export const ZENA_THEME_STORAGE_KEY = 'zena_character_theme';

export function getStoredZenaTheme(): ZenaThemeId {
  if (typeof window === 'undefined') return 'cyber';
  try {
    const saved = localStorage.getItem(ZENA_THEME_STORAGE_KEY) as ZenaThemeId;
    if (saved && ZENA_THEMES[saved]) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'cyber';
}

export function setStoredZenaTheme(themeId: ZenaThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ZENA_THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new CustomEvent('zena-theme-changed', { detail: themeId }));
  } catch {
    // Ignore storage errors
  }
}
