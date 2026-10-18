import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, VolumeX, Activity, Zap, Radio } from 'lucide-react';

interface HumanoidVoiceVisualizerProps {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);
  const [tick, setTick] = useState(0);

  // Smooth periodic clock tick for pure dynamic particle orbits
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setTick((t) => (t + delta * (isModelSpeaking ? 2.8 : isUserSpeaking ? 2.0 : isHovered ? 1.6 : 1.0)) % 1000);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isModelSpeaking, isUserSpeaking, isHovered]);

  // Track cursor relative to particle orb center for 3D perspective & magnetic particle attraction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
    setMousePos({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAvatarClick = () => {
    if (status !== 'connected') return;
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 500);
    onToggleMute();
  };

  // Determine active theme colors based on state
  const primaryColor = isMuted
    ? '#f43f5e' // Rose Red for Muted
    : isModelSpeaking
      ? '#06b6d4' // Electric Cyan for AI Speaking
      : isUserSpeaking
        ? '#10b981' // Emerald for User Listening
        : '#6366f1'; // Indigo for Idle Ready

  const secondaryColor = isMuted
    ? '#fda4af'
    : isModelSpeaking
      ? '#67e8f9'
      : isUserSpeaking
        ? '#6ee7b7'
        : '#a5b4fc';

  const glowColorRgba = isMuted
    ? 'rgba(244, 63, 94, 0.45)'
    : isModelSpeaking
      ? 'rgba(6, 182, 212, 0.6)'
      : isUserSpeaking
        ? 'rgba(16, 185, 129, 0.55)'
        : 'rgba(99, 102, 241, 0.4)';

  // Calculate audio reactive amplitude
  const activeVolume = isModelSpeaking ? modelVolume : isUserSpeaking ? userVolume : 0;
  const pulseScale = 1 + activeVolume * 0.28 + (clickPulse ? 0.15 : 0);

  // 3D perspective tilt angles driven by cursor
  const tiltX = -mousePos.y * 14;
  const tiltY = mousePos.x * 16;

  // Center coordinate of the SVG particle canvas (240 x 240)
  const CX = 120;
  const CY = 120;

  // Generate 3D Orbital Particle Rings calculated with spherical trigonometry & current tick
  const particles = useMemo(() => {
    const list: Array<{
      id: string;
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      opacity: number;
      ring: number;
    }> = [];

    const volumeBonus = activeVolume * 18;
    const dispersion = clickPulse ? 24 : 0;

    // Ring 1: Equatorial Orbital Belt (14 particles)
    const R1 = 68 + volumeBonus * 0.6 + dispersion;
    for (let i = 0; i < 14; i++) {
      const angle = tick * 1.2 + (i * Math.PI * 2) / 14;
      const x = CX + Math.cos(angle) * R1 + mousePos.x * 8;
      const y = CY + Math.sin(angle) * (R1 * 0.35) + mousePos.y * 6;
      const z = Math.sin(angle);
      const size = 1.6 + (z + 1) * 1.2 + (isModelSpeaking ? 0.8 : 0);
      const opacity = 0.4 + (z + 1) * 0.3;
      list.push({
        id: `r1-${i}`,
        x,
        y,
        z,
        size,
        color: z > 0 ? primaryColor : secondaryColor,
        opacity,
        ring: 1,
      });
    }

    // Ring 2: Inclined 45° Gyroscopic Ring (12 particles, counter-rotation)
    const R2 = 62 + volumeBonus * 0.8 + dispersion;
    for (let i = 0; i < 12; i++) {
      const angle = -tick * 0.9 + (i * Math.PI * 2) / 12;
      // 45 degree rotation transform
      const rawX = Math.cos(angle) * R2;
      const rawY = Math.sin(angle) * (R2 * 0.4);
      const rad45 = (45 * Math.PI) / 180;
      const rotX = rawX * Math.cos(rad45) - rawY * Math.sin(rad45);
      const rotY = rawX * Math.sin(rad45) + rawY * Math.cos(rad45);
      const z = Math.sin(angle);
      list.push({
        id: `r2-${i}`,
        x: CX + rotX + mousePos.x * 10,
        y: CY + rotY + mousePos.y * 8,
        z,
        size: 1.5 + (z + 1) * 1.0,
        color: z > 0 ? primaryColor : '#ffffff',
        opacity: 0.35 + (z + 1) * 0.3,
        ring: 2,
      });
    }

    // Ring 3: Counter-Inclined -45° Ring (12 particles)
    const R3 = 58 + volumeBonus * 0.7 + dispersion;
    for (let i = 0; i < 12; i++) {
      const angle = tick * 0.75 + (i * Math.PI * 2) / 12;
      const rawX = Math.cos(angle) * R3;
      const rawY = Math.sin(angle) * (R3 * 0.38);
      const radNeg45 = (-45 * Math.PI) / 180;
      const rotX = rawX * Math.cos(radNeg45) - rawY * Math.sin(radNeg45);
      const rotY = rawX * Math.sin(radNeg45) + rawY * Math.cos(radNeg45);
      const z = Math.sin(angle);
      list.push({
        id: `r3-${i}`,
        x: CX + rotX + mousePos.x * 6,
        y: CY + rotY + mousePos.y * 6,
        z,
        size: 1.4 + (z + 1) * 0.9,
        color: secondaryColor,
        opacity: 0.35 + (z + 1) * 0.3,
        ring: 3,
      });
    }

    // Polar Meridian Loop (8 particles)
    const R4 = 52 + volumeBonus * 0.5 + dispersion;
    for (let i = 0; i < 8; i++) {
      const angle = tick * 1.1 + (i * Math.PI * 2) / 8;
      const x = CX + Math.sin(angle) * (R4 * 0.28) + mousePos.x * 4;
      const y = CY + Math.cos(angle) * R4 + mousePos.y * 8;
      const z = Math.cos(angle);
      list.push({
        id: `r4-${i}`,
        x,
        y,
        z,
        size: 1.3 + (z + 1) * 0.8,
        color: primaryColor,
        opacity: 0.4 + (z + 1) * 0.25,
        ring: 4,
      });
    }

    // Outer Ambient Floating Particle Cloud (18 particles)
    for (let i = 0; i < 18; i++) {
      const baseAngle = (i * Math.PI * 2) / 18;
      const wobble = Math.sin(tick * 1.5 + i) * 12;
      const dist = 82 + ((i * 17) % 24) + volumeBonus * 1.1 + dispersion * 1.5 + wobble;
      const angle = baseAngle + tick * 0.25;
      const x = CX + Math.cos(angle) * dist + mousePos.x * 12;
      const y = CY + Math.sin(angle) * (dist * 0.85) + mousePos.y * 10;
      list.push({
        id: `cloud-${i}`,
        x,
        y,
        z: 0.2,
        size: 1.1 + (Math.sin(tick * 2 + i) + 1) * 0.6,
        color: i % 2 === 0 ? secondaryColor : '#ffffff',
        opacity: 0.25 + (Math.cos(tick + i) + 1) * 0.25,
        ring: 5,
      });
    }

    return list.sort((a, b) => a.z - b.z);
  }, [tick, mousePos.x, mousePos.y, activeVolume, clickPulse, primaryColor, secondaryColor, isModelSpeaking]);

  // Connect close neighbor particles with dynamic holographic synaptic filaments
  const filaments = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
    const maxDist = 38 + activeVolume * 15;

    for (let i = 0; i < particles.length; i += 2) {
      for (let j = i + 1; j < particles.length; j += 2) {
        if (particles[i].ring === particles[j].ring || Math.abs(particles[i].z - particles[j].z) < 0.8) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            lines.push({
              x1: particles[i].x,
              y1: particles[i].y,
              x2: particles[j].x,
              y2: particles[j].y,
              opacity: (1 - dist / maxDist) * 0.35,
            });
          }
        }
      }
    }
    return lines.slice(0, 48); // Cap filaments for buttery 60fps performance
  }, [particles, activeVolume]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Futuristic Telemetry HUD */}
      <div className="flex items-center justify-between w-full max-w-md px-3 py-1.5 mb-2 rounded-lg bg-neutral-900/90 dark:bg-neutral-950/95 border border-neutral-800 text-[10px] text-neutral-400 font-mono tracking-wider backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: primaryColor }}
            />
          </span>
          <span className="font-semibold text-neutral-200">PARTICLE ORB MATRIX</span>
          <span className="text-neutral-600">|</span>
          <span className="text-cyan-400 font-medium">64-NODE QUANTUM LATTICE</span>
        </div>

        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-neutral-300">
                {isModelSpeaking ? 'SYNTHESIZING' : isUserSpeaking ? 'RECEPTIVE' : isMuted ? 'PARTICLES DORMANT' : 'ORBITING'}
              </span>
            </div>
          )}
          {status === 'connecting' && <span className="text-amber-400 animate-pulse">INITIALIZING...</span>}
          {status === 'error' && <span className="text-rose-400">OFFLINE</span>}
        </div>
      </div>

      {/* Main Interactive Pure Particle Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleAvatarClick}
        style={{ perspective: 1000 }}
        className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 cursor-pointer group rounded-3xl p-4 transition-all"
        title={status === 'connected' ? (isMuted ? 'Click particle orb to unmute microphone' : 'Click particle orb to mute microphone') : ''}
      >
        {/* Acoustic Resonance Expansion Wave 1 */}
        <div
          className="absolute inset-2 rounded-full pointer-events-none transition-all duration-100 ease-out border"
          style={{
            borderColor: glowColorRgba,
            transform: `scale(${pulseScale * 1.15})`,
            opacity: isModelSpeaking || isUserSpeaking ? 0.75 : 0.2,
            boxShadow: `0 0 36px ${glowColorRgba}`,
          }}
        />

        {/* Acoustic Resonance Expansion Wave 2 (Dashed Counter-Spinning Ring) */}
        <div
          className="absolute inset-6 rounded-full pointer-events-none transition-all duration-150 ease-out border border-dashed"
          style={{
            borderColor: glowColorRgba,
            transform: `scale(${pulseScale * 1.05}) rotate(${mousePos.x * 30 + tick * 10}deg)`,
            opacity: isModelSpeaking || isUserSpeaking ? 0.5 : 0.15,
          }}
        />

        {/* 3D Tilted Gyroscopic Particle Orb Container */}
        <div
          className="relative flex items-center justify-center w-56 h-56 transition-transform duration-150 ease-out"
          style={{
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${clickPulse ? 0.92 : 1})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Deep Quantum Ambient Glow */}
          <div
            className="absolute inset-4 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
            style={{
              backgroundColor: glowColorRgba,
              opacity: isHovered || isModelSpeaking || isUserSpeaking ? 0.85 : 0.35,
            }}
          />

          {/* SVG Pure Particle Canvas */}
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full relative z-10 drop-shadow-2xl overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="pOrbGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="coreSingularity" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor={secondaryColor} stopOpacity="0.9" />
                <stop offset="70%" stopColor={primaryColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connecting Synaptic Wave Filaments */}
            <g stroke={primaryColor} strokeWidth="0.6" strokeDasharray="2 3">
              {filaments.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  strokeOpacity={line.opacity}
                />
              ))}
            </g>

            {/* Central Luminous Singularity Core (Pulsing Quantum Particle Node) */}
            <g filter="url(#pOrbGlow)">
              <circle
                cx={CX + mousePos.x * 4}
                cy={CY + mousePos.y * 4}
                r={16 + activeVolume * 16 + (clickPulse ? 8 : 0)}
                fill="url(#coreSingularity)"
              />
              <circle
                cx={CX + mousePos.x * 4}
                cy={CY + mousePos.y * 4}
                r={4.5 + activeVolume * 3}
                fill="#ffffff"
              />
            </g>

            {/* 3D Orbiting Pure Particles */}
            {particles.map((p) => (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.size}
                  fill={p.color}
                  opacity={p.opacity}
                  filter={p.z > 0 ? 'url(#pOrbGlow)' : undefined}
                />
                {p.size > 2.5 && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.size * 0.35}
                    fill="#ffffff"
                    opacity={0.9}
                  />
                )}
              </g>
            ))}

            {/* Central Wave Radiator Rings */}
            {(isModelSpeaking || isUserSpeaking) && (
              <g stroke={primaryColor} strokeWidth="0.8" fill="none" opacity="0.4">
                <circle
                  cx={CX}
                  cy={CY}
                  r={28 + ((tick * 25) % 45)}
                  strokeDasharray="2 4"
                  opacity={1 - ((tick * 25) % 45) / 45}
                />
              </g>
            )}
          </svg>

          {/* Interactive Tap Hint Badge on Hover */}
          <div
            className={`absolute -bottom-3 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide transition-all duration-200 border pointer-events-none shadow-md ${
              isHovered
                ? 'opacity-100 translate-y-0 bg-neutral-900/90 text-neutral-100 border-neutral-700'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            {isMuted ? 'Tap Orb to Unmute' : 'Tap Orb to Mute'}
          </div>
        </div>
      </div>

      {/* Futuristic Particle Console Bar (Below the Orb) */}
      <div className="flex flex-col items-center gap-2 mt-1 w-full max-w-sm">
        {/* Real-time Frequency / Decibel Spectrum Bar */}
        <div className="w-full px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[11px] font-mono">
              {isModelSpeaking ? 'ACOUSTIC SYNTHESIS' : isUserSpeaking ? 'PARTICLE SENSITIVITY' : 'HARMONIC SPECTRUM'}
            </span>
          </div>

          {/* 12-Segment Futuristic VU Meter */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 12 }).map((_, idx) => {
              const threshold = (idx + 1) / 12;
              const isActive = activeVolume >= threshold;
              const isPeak = idx >= 10;
              return (
                <div
                  key={idx}
                  className="w-1.5 h-3 rounded-xs transition-all duration-75"
                  style={{
                    backgroundColor: isActive
                      ? isPeak
                        ? '#ef4444'
                        : isModelSpeaking
                          ? '#06b6d4'
                          : '#10b981'
                      : 'var(--color-neutral-300, #cbd5e1)',
                    opacity: isActive ? 1 : 0.25,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Primary Interactive Control Switch */}
        <div className="flex items-center gap-2 w-full">
          <button
            id="particle-orb-toggle-mute-btn"
            type="button"
            onClick={onToggleMute}
            disabled={status !== 'connected'}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-200 shadow-sm cursor-pointer ${
              status !== 'connected'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-300 dark:border-neutral-700'
                : isMuted
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-400/40 hover:border-rose-400'
                  : isModelSpeaking
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/40 shadow-cyan-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>UNMUTE PARTICLE SENSORS</span>
              </>
            ) : isModelSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span>VOICE ARBITER SPEAKING (TAP TO PAUSE)</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>PARTICLE MATRIX RECEPTIVE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
