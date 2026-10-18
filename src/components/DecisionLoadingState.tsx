import React from 'react';
import { motion } from 'motion/react';
import { Scale, Sparkles, Cpu, Layers, Compass, CheckCircle2 } from 'lucide-react';
import { ArbitrEmblem } from './ArbitrLogo';
import { getTranslation } from '../utils/i18n';

interface DecisionLoadingStateProps {
  step?: string;
  currentLanguage?: string;
}

export const DecisionLoadingState: React.FC<DecisionLoadingStateProps> = ({
  step,
  currentLanguage = 'en',
}) => {
  const t = getTranslation(currentLanguage);

  const stepsList = [
    'Parsing constraints & decision criteria',
    'Simulating pairwise trade-off frontiers',
    'Executing 10/10/10 regret minimization',
    'Synthesizing decisive tiebreaker verdict',
  ];

  return (
    <motion.div
      id="decision-computing-state"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Futuristic Radar & Scale Graphic Container */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-10 text-white shadow-2xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Futuristic Radar / Scale Animation */}
          <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 mb-6">
            {/* Concentric Radar Rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-4 rounded-full border border-cyan-500/25 border-dashed" />
            <div className="absolute inset-10 rounded-full border border-indigo-500/30" />
            <div className="absolute inset-16 rounded-full border border-indigo-500/40" />

            {/* Pulsing Radar Wave */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
              animate={{
                scale: [0.6, 1.15, 1.25],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            {/* Spinning Futuristic Radar Sweep Beam */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0) 0deg, rgba(6, 182, 212, 0.25) 60deg, transparent 75deg)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Rotating Scale / Axis Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-cyan-500/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-px bg-cyan-500/20" />
            </div>

            {/* Oscillating Balance Scales in Center */}
            <motion.div
              className="relative z-20 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900/90 border border-neutral-700/80 p-3 shadow-xl backdrop-blur-md ring-1 ring-cyan-500/40"
              animate={{
                rotate: [-4, 4, -4],
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ArbitrEmblem className="h-12 w-12 text-cyan-400" glow={true} />
            </motion.div>

            {/* Orbiting Satellite Data Nodes */}
            <motion.div
              className="absolute h-full w-full pointer-events-none"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 px-2 py-0.5 text-[9px] font-mono text-cyan-300 shadow-xs">
                <Cpu className="h-2.5 w-2.5" />
                <span>Trade-offs</span>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-indigo-950/80 border border-indigo-400/50 px-2 py-0.5 text-[9px] font-mono text-indigo-300 shadow-xs">
                <Compass className="h-2.5 w-2.5" />
                <span>Regret Test</span>
              </div>
            </motion.div>
          </div>

          {/* Heading & Live Step Info */}
          <div className="max-w-md space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AI Decision Engine Active</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.computingVerdictTitle || t.analyzingBtn || 'Deliberating Optimal Path...'}
            </h3>

            <p className="text-xs sm:text-sm font-medium text-cyan-200/90 h-6">
              {step || t.analyzingBtn || 'Evaluating multi-criteria matrices and calculating trade-off frontiers...'}
            </p>
          </div>

          {/* Flowing Calculation Steps Bar */}
          <div className="mt-8 w-full max-w-lg">
            <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400"
                initial={{ width: '15%' }}
                animate={{
                  width: ['15%', '65%', '90%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-[10px] text-neutral-400">
              {stepsList.map((st, idx) => (
                <div key={idx} className="flex items-center gap-1 text-left">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 shrink-0" />
                  <span className="truncate">{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing Skeleton Preview Screen */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 shadow-2xs space-y-5 animate-pulse">
        {/* Skeleton Top Bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-7 w-64 sm:w-80 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Skeleton Recommendation Banner */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800/80 p-5 space-y-4 bg-neutral-50/70 dark:bg-neutral-800/40">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded-md bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <div className="h-8 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-16 w-full rounded-xl bg-neutral-200/60 dark:bg-neutral-700/50" />
        </div>

        {/* Skeleton Comparison Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div className="h-4 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-2.5 w-5/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-2.5 w-4/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div className="h-4 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-2.5 w-5/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-2.5 w-4/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
