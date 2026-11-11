import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Compass, 
  ArrowUpRight, 
  Layers, 
  Check, 
  Copy,
  Zap,
  Info
} from 'lucide-react';

interface DecisionIntelligenceSealProps {
  variant?: 'showcase' | 'compact' | 'badge';
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
}

export const DecisionIntelligenceSeal: React.FC<DecisionIntelligenceSealProps> = ({
  variant = 'showcase',
  className = '',
  interactive = true,
  showControls = true,
}) => {
  const [pulseKey, setPulseKey] = useState(0);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currentYear = new Date().getFullYear();

  // 3D perspective mouse tracking for showcase variant
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || variant !== 'showcase' || !cardRef.current) return;
    // Don't calculate 3D tilt if user is using a touch device (pointer: coarse)
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleTriggerPulse = () => {
    setPulseKey(prev => prev + 1);
  };

  const handleCopyBadge = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://arbitrapps.com';
    navigator.clipboard.writeText(`![Arbitr Decision Intelligence Seal](${origin}/arbitr-banner.svg)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompact = variant === 'compact';
  const isBadge = variant === 'badge';

  if (isBadge) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full bg-neutral-950/80 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-md shadow-md ${className}`}>
        <div className="relative h-4 w-4">
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-400 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
        </div>
        <span className="tracking-wide">Official Brand &amp; Seal</span>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-cyan-500/30 bg-neutral-950/90 p-3 shadow-lg flex items-center gap-3 ${className}`}>
        {/* Animated Mini Seal */}
        <div className="relative h-12 w-12 shrink-0">
          <motion.div
            className="absolute -inset-1 rounded-full bg-cyan-500/20 blur-sm"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
            {/* Outer Rotating Ring */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeDasharray="8 6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: 'center' }}
            />
            {/* Scales & Arrow */}
            <path
              d="M 100 24 L 78 62 L 91 58 L 91 76 M 100 24 L 122 62 L 109 58 L 109 76"
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points="100,28 82,60 93,56 93,72 107,72 107,56 118,60"
              fill="#00F0FF"
              fillOpacity="0.4"
            />
            <path d="M 62 76 L 40 114 M 62 76 L 76 114 M 38 114 L 78 114" stroke="#38BDF8" strokeWidth="4" />
            <path d="M 138 76 L 124 114 M 138 76 L 160 114 M 122 114 L 162 114" stroke="#38BDF8" strokeWidth="4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              Verified Brand &amp; Seal
            </p>
          </div>
          <p className="text-xs text-neutral-300 truncate">
            Decision Intelligence Engine
          </p>
        </div>
      </div>
    );
  }

  // SHOWCASE VARIANT: High-definition, Interactive, Multi-layered Animated Seal
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 3D Interactive Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 shadow-2xl p-4 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center cursor-crosshair group w-full"
      >
        {/* Dynamic Holographic Grid Backdrop */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#00F0FF 1px, transparent 1px), radial-gradient(#6366F1 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Ambient Pulsing Backlight Cones */}
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-radial from-cyan-500/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none"
          animate={{
            scale: isHovered ? [1.1, 1.25, 1.1] : [1, 1.12, 1],
            opacity: isHovered ? [0.6, 0.8, 0.6] : [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Catching Holographic Diagonal Shimmer Sweep */}
        <motion.div
          className="absolute -inset-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transform -skew-x-25 pointer-events-none"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 2.5,
            ease: 'easeInOut',
          }}
        />

        {/* Top Header Tag */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-neutral-900/90 border border-cyan-500/40 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-inner max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-bold truncate">
              Official Decision Intelligence Seal
            </span>
          </div>

          <div className="hidden xs:inline-flex items-center gap-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-medium text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>Cryptographically Verified</span>
          </div>
        </div>

        {/* THE MAIN ANIMATED SEAL (SVG) - Responsively sized for all devices */}
        <div className="relative w-40 h-40 xs:w-52 xs:h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 max-w-full my-1 sm:my-2 select-none shrink-0">
          {/* Shockwave Radar Burst triggered on demand */}
          <motion.div
            key={`burst-${pulseKey}`}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none"
          />

          <svg
            viewBox="0 0 400 400"
            className="w-full h-full filter drop-shadow-[0_0_25px_rgba(0,240,255,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Neon Linear Gradient for Frame & Scale */}
              <linearGradient id="sealNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="35%" stopColor="#00F0FF" />
                <stop offset="70%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>

              {/* Gold / Electro Accents */}
              <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>

              {/* Radial Core Glow */}
              <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
                <stop offset="40%" stopColor="#0284C7" stopOpacity="0.15" />
                <stop offset="85%" stopColor="#0F172A" stopOpacity="0.0" />
              </radialGradient>

              {/* Glowing Pan Fill */}
              <linearGradient id="panFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
              </linearGradient>

              {/* Filter for intense glow */}
              <filter id="sealHighGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Text Path for Seal Inscription */}
              <path
                id="sealTextPath"
                d="M 200, 200 m -162, 0 a 162,162 0 1,1 324,0 a 162,162 0 1,1 -324,0"
              />
            </defs>

            {/* Core Backdrop Ambient Disc */}
            <circle cx="200" cy="200" r="170" fill="url(#coreAura)" />

            {/* LAYER 1: OUTER ROTATING CELESTIAL & TEXT RING (Clockwise 45s) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              {/* Outer Dashed Border */}
              <circle
                cx="200"
                cy="200"
                r="186"
                stroke="url(#sealNeonGrad)"
                strokeWidth="2"
                strokeDasharray="6 8"
                opacity="0.75"
              />
              <circle
                cx="200"
                cy="200"
                r="174"
                stroke="#38BDF8"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Cardinal Geometric Markers */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={`marker-${deg}`} transform={`rotate(${deg} 200 200)`}>
                  <rect
                    x="198"
                    y="10"
                    width="4"
                    height="8"
                    fill={deg % 90 === 0 ? '#00F0FF' : '#60A5FA'}
                    rx="1"
                  />
                  {deg % 90 === 0 && (
                    <circle cx="200" cy="24" r="2.5" fill="#FCD34D" />
                  )}
                </g>
              ))}

              {/* Circular Inscription Text */}
              <text className="text-[9.5px] font-black tracking-[0.28em] fill-cyan-300 uppercase select-none opacity-85">
                <textPath href="#sealTextPath" startOffset="0%">
                  {`ARBITR • DECISION INTELLIGENCE • OBJECTIVE SYNTHESIS • EST. ${currentYear} •`}
                </textPath>
              </text>
            </motion.g>

            {/* LAYER 2: COUNTER-ROTATING INNER CALIBRATION COMPASS RING (Counter-Clockwise 32s) */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              <circle
                cx="200"
                cy="200"
                r="148"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="3 9"
                opacity="0.65"
              />
              <circle
                cx="200"
                cy="200"
                r="138"
                stroke="url(#sealNeonGrad)"
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Azimuth tick marks */}
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={`tick-${i}`}
                  x1="200"
                  y1="56"
                  x2="200"
                  y2={i % 3 === 0 ? "64" : "60"}
                  stroke="#38BDF8"
                  strokeWidth={i % 3 === 0 ? "2" : "1"}
                  opacity={i % 3 === 0 ? "0.9" : "0.5"}
                  transform={`rotate(${i * 15} 200 200)`}
                />
              ))}
            </motion.g>

            {/* LAYER 3: ORBITING SATELLITE PARTICLES (Quantum Evaluation Nodes) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              <circle cx="200" cy="40" r="4.5" fill="#00F0FF" filter="url(#sealHighGlow)" />
              <circle cx="200" cy="40" r="2" fill="#FFFFFF" />
            </motion.g>
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              <circle cx="200" cy="360" r="3.5" fill="#A855F7" filter="url(#sealHighGlow)" />
              <circle cx="200" cy="360" r="1.5" fill="#FFFFFF" />
            </motion.g>

            {/* LAYER 4: SCALES OF JUSTICE WITH SUBTLE OSCILLATING EQUILIBRIUM */}
            <motion.g
              animate={{
                rotate: isHovered ? [-3, 3, -3] : [-1.5, 1.5, -1.5],
              }}
              transition={{
                duration: isHovered ? 2.2 : 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '200px 145px' }}
            >
              {/* Horizontal Balance Beam */}
              <line
                x1="128"
                y1="145"
                x2="272"
                y2="145"
                stroke="url(#sealNeonGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#sealHighGlow)"
              />
              {/* Fulcrum Pivot Diamond */}
              <polygon
                points="200,138 206,145 200,152 194,145"
                fill="#FCD34D"
                filter="url(#sealHighGlow)"
              />

              {/* Left Scale Pan of Justice */}
              <g>
                <line x1="135" y1="145" x2="105" y2="205" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="135" y1="145" x2="165" y2="205" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 98 205 L 172 205" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M 102 205 Q 135 240 168 205 Z"
                  fill="url(#panFillGrad)"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />
                {/* Weight particle */}
                <circle cx="135" cy="214" r="3" fill="#FCD34D" />
              </g>

              {/* Right Scale Pan of Justice */}
              <g>
                <line x1="265" y1="145" x2="235" y2="205" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="265" y1="145" x2="295" y2="205" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 228 205 L 302 205" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M 232 205 Q 265 240 298 205 Z"
                  fill="url(#panFillGrad)"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />
                {/* Weight particle */}
                <circle cx="265" cy="214" r="3" fill="#FCD34D" />
              </g>
            </motion.g>

            {/* LAYER 5: INTERTWINING CONVERGING PATHWAYS (Synthesis of Crossroads) */}
            <g stroke="url(#sealNeonGrad)" strokeWidth="6" strokeLinecap="round">
              {/* Left Pathway flowing inward */}
              <path
                d="M 148 290 C 180 290 190 260 192 225 C 194 190 192 155 192 135"
                strokeDasharray="180"
                strokeDashoffset="0"
              />
              {/* Right Pathway flowing inward */}
              <path
                d="M 252 290 C 220 290 210 260 208 225 C 206 190 208 155 208 135"
                strokeDasharray="180"
                strokeDashoffset="0"
              />

              {/* Converging ribbons tails */}
              <path d="M 148 290 C 132 290 114 296 98 306" strokeWidth="4" opacity="0.8" />
              <path d="M 252 290 C 268 290 286 296 302 306" strokeWidth="4" opacity="0.8" />
            </g>

            {/* LAYER 6: THE CENTRAL APEX ARROW (Decisive Forward Resolution) */}
            <g filter="url(#sealHighGlow)">
              <path
                d="M 200 52 L 164 122 L 188 114 L 188 150 M 200 52 L 236 122 L 212 114 L 212 150"
                stroke="url(#sealNeonGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon
                points="200,60 172,118 190,110 190,146 210,146 210,110 228,118"
                fill="url(#sealNeonGrad)"
                fillOpacity="0.45"
              />
              
              {/* Gleaming Starburst at Arrow Tip */}
              <motion.g
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '200px 52px' }}
              >
                <circle cx="200" cy="52" r="5" fill="#FFFFFF" />
                <path d="M 200 40 L 200 64 M 188 52 L 212 52" stroke="#FFFFFF" strokeWidth="2.5" />
              </motion.g>
            </g>
          </svg>
        </div>

        {/* Wordmark Typography & Tagline */}
        <div className="relative z-10 mt-3 space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white uppercase select-none flex items-center justify-center">
            <span className="text-cyan-400 mr-1">A</span>RBITR
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-cyan-200/90 tracking-wider uppercase">
            Official Decision Intelligence Authority
          </p>
          <p className="text-[11px] text-neutral-400 max-w-sm mx-auto pt-1">
            Certified balance of probability, weighted trade-off analysis, and cognitive debiasing.
          </p>
        </div>

        {/* Interactive Action Badges */}
        {showControls && (
          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTriggerPulse}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition-all cursor-pointer shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Energy Pulse</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyBadge}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 transition-all cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Badge Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Copy Badge</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* SYMBOLISM DECODER (Interactive Educational Section) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 sm:p-5 backdrop-blur-sm w-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-200">
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Seal Iconography &amp; Meaning</span>
          </div>
          <span className="text-[11px] text-neutral-300">Tap or hover to inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Symbol 1: Scales */}
          <div
            onClick={() => setActiveSymbol(activeSymbol === 'scales' ? null : 'scales')}
            onMouseEnter={() => setActiveSymbol('scales')}
            onMouseLeave={() => setActiveSymbol(null)}
            className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer select-none touch-manipulation ${
              activeSymbol === 'scales'
                ? 'border-cyan-500 bg-cyan-950/50 shadow-sm ring-1 ring-cyan-500/30'
                : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 active:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                <Scale className="h-3.5 w-3.5 text-cyan-400" />
                <span>Scales of Justice</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Harmonic</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Multivariate trade-off balance that calculates non-linear utility and eliminates cognitive bias.
            </p>
          </div>

          {/* Symbol 2: Arrow */}
          <div
            onClick={() => setActiveSymbol(activeSymbol === 'arrow' ? null : 'arrow')}
            onMouseEnter={() => setActiveSymbol('arrow')}
            onMouseLeave={() => setActiveSymbol(null)}
            className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer select-none touch-manipulation ${
              activeSymbol === 'arrow'
                ? 'border-indigo-500 bg-indigo-950/50 shadow-sm ring-1 ring-indigo-500/30'
                : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 active:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400" />
                <span>Apex Arrow</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 uppercase font-semibold">Momentum</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Forward momentum and decisive commitment that breaks analysis paralysis loop.
            </p>
          </div>

          {/* Symbol 3: Pathways */}
          <div
            onClick={() => setActiveSymbol(activeSymbol === 'pathways' ? null : 'pathways')}
            onMouseEnter={() => setActiveSymbol('pathways')}
            onMouseLeave={() => setActiveSymbol(null)}
            className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer select-none touch-manipulation ${
              activeSymbol === 'pathways'
                ? 'border-purple-500 bg-purple-950/50 shadow-sm ring-1 ring-purple-500/30'
                : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 active:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span>Crossroad Ribbons</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 uppercase font-semibold">Synthesized</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Converging competing possibilities into a clear synthesized consensus trajectory.
            </p>
          </div>

          {/* Symbol 4: Rings */}
          <div
            onClick={() => setActiveSymbol(activeSymbol === 'rings' ? null : 'rings')}
            onMouseEnter={() => setActiveSymbol('rings')}
            onMouseLeave={() => setActiveSymbol(null)}
            className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer select-none touch-manipulation ${
              activeSymbol === 'rings'
                ? 'border-amber-500 bg-amber-950/50 shadow-sm ring-1 ring-amber-500/30'
                : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 active:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span>Orbital Compass</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 uppercase font-semibold">Regret Min</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Holistic 360° perspective evaluating 10-10-10 long-term regret minimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
