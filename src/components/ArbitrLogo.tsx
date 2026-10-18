import React from 'react';
import { motion } from 'motion/react';
export { DecisionIntelligenceSeal } from './DecisionIntelligenceSeal';

interface ArbitrLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  glow?: boolean;
  animated?: boolean;
}

const SIZE_MAP = {
  xs: { icon: 'h-6 w-6', text: 'text-sm' },
  sm: { icon: 'h-8 w-8', text: 'text-base' },
  md: { icon: 'h-10 w-10', text: 'text-lg' },
  lg: { icon: 'h-14 w-14', text: 'text-2xl' },
  xl: { icon: 'h-20 w-20', text: 'text-3xl' },
};

/**
 * Arbitr Official Logo Icon Emblem
 * Combines the balance scale of justice, intertwining converging pathways,
 * and an upward directional arrow into a glowing circular seal.
 */
export const ArbitrEmblem: React.FC<{ className?: string; glow?: boolean; animated?: boolean }> = ({
  className = 'h-10 w-10',
  glow = true,
  animated = false,
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-200`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arbitrNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>

        <linearGradient id="emblemFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.05" />
        </linearGradient>

        {glow && (
          <filter id="emblemGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Outer Rotating Halo when animated */}
      {animated && (
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center' }}
          opacity={0.6}
        />
      )}

      <g
        filter={glow ? 'url(#emblemGlowFilter)' : undefined}
        stroke="url(#arbitrNeonGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Central Upward Arrow Head */}
        <path d="M 100 28 L 82 58 L 93 54 L 93 68 M 100 28 L 118 58 L 107 54 L 107 68" />
        <polygon
          points="100,30 84,56 94,52 94,66 106,66 106,52 116,56"
          fill="url(#emblemFillGrad)"
        />

        {/* Outer Circular Boundary Arcs */}
        <path d="M 80 46 A 54 54 0 0 0 52 72" />
        <path d="M 120 46 A 54 54 0 0 1 148 72" />
        <path d="M 48 80 A 54 54 0 0 0 78 134" />
        <path d="M 152 80 A 54 54 0 0 1 122 134" />

        {/* Balance Scales with gentle harmonic tilt if animated */}
        {animated ? (
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 74px' }}
          >
            {/* Left Balance Scale (Pan of Justice) */}
            <path d="M 64 74 L 44 108" />
            <path d="M 64 74 L 76 108" />
            <path d="M 42 108 L 78 108" />
            <path d="M 44 108 Q 60 126 76 108 Z" fill="url(#emblemFillGrad)" />

            {/* Right Balance Scale (Pan of Justice) */}
            <path d="M 136 74 L 124 108" />
            <path d="M 136 74 L 156 108" />
            <path d="M 122 108 L 158 108" />
            <path d="M 124 108 Q 140 126 156 108 Z" fill="url(#emblemFillGrad)" />
          </motion.g>
        ) : (
          <>
            {/* Left Balance Scale (Pan of Justice) */}
            <path d="M 64 74 L 44 108" />
            <path d="M 64 74 L 76 108" />
            <path d="M 42 108 L 78 108" />
            <path d="M 44 108 Q 60 126 76 108 Z" fill="url(#emblemFillGrad)" />

            {/* Right Balance Scale (Pan of Justice) */}
            <path d="M 136 74 L 124 108" />
            <path d="M 136 74 L 156 108" />
            <path d="M 122 108 L 158 108" />
            <path d="M 124 108 Q 140 126 156 108 Z" fill="url(#emblemFillGrad)" />
          </>
        )}

        {/* Intertwining Converging Ribbons into arrow stem */}
        <path d="M 74 150 C 90 150 94 135 95 118 C 96 100 95 80 95 68" />
        <path d="M 126 150 C 110 150 106 135 105 118 C 104 100 105 80 105 68" />

        {/* Dynamic Ribbon tails */}
        <path d="M 74 150 C 66 150 58 153 52 156" />
        <path d="M 126 150 C 134 150 142 153 148 156" />
      </g>
    </svg>
  );
};

/**
 * Official Brand Wordmark for Arbitr with distinctive geometric typography
 */
export const ArbitrWordmark: React.FC<{ className?: string }> = ({ className = 'text-lg' }) => {
  return (
    <span className={`font-black tracking-[0.18em] uppercase font-sans select-none flex items-center ${className}`}>
      <span className="relative inline-flex items-center text-neutral-950 dark:text-white">
        {/* Custom Stylized A with diagonal break */}
        <span className="relative inline-block text-cyan-600 dark:text-cyan-400 font-extrabold mr-[0.5px]">
          A
        </span>
        <span className="text-neutral-900 dark:text-neutral-100 font-bold">RBITR</span>
      </span>
    </span>
  );
};

/**
 * Main Arbitr Logo Component
 */
export const ArbitrLogo: React.FC<ArbitrLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showBadge = false,
  badgeText = 'AI Engine',
  glow = true,
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emblem Container */}
      <div className="relative flex items-center justify-center rounded-xl bg-neutral-950 p-1.5 border border-neutral-800 shadow-md">
        <ArbitrEmblem className={sizeConfig.icon} glow={glow} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <ArbitrWordmark className={sizeConfig.text} />
            {showBadge && (
              <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 uppercase tracking-wider">
                {badgeText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArbitrLogo;
