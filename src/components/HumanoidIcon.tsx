import React from 'react';

export interface ParticleVoiceIconProps {
  className?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  isMuted?: boolean;
  animated?: boolean;
  size?: number;
}

export const ParticleVoiceIcon: React.FC<ParticleVoiceIconProps> = ({
  className = 'w-5 h-5',
  isSpeaking = false,
  isListening = false,
  isMuted = false,
  animated = true,
  size = 24,
}) => {
  // Theme state color mappings
  const primaryColor = isMuted
    ? '#f43f5e' // Rose Red
    : isSpeaking
      ? '#06b6d4' // Electric Cyan
      : isListening
        ? '#10b981' // Emerald
        : '#6366f1'; // Indigo / Violet

  const secondaryColor = isMuted
    ? '#fda4af'
    : isSpeaking
      ? '#67e8f9'
      : isListening
        ? '#6ee7b7'
        : '#a5b4fc';

  const filterId = `orb-glow-${primaryColor.replace('#', '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 overflow-visible`}
      role="img"
      aria-label="Interactive Particle Voice Indicator"
    >
      <defs>
        {/* Particle luminescence filter */}
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* --- PURE INTERACTIVE MOVING PARTICLE SYSTEM --- */}

      {/* Outer Acoustic Resonance Waves (Active Speaking/Listening) */}
      {(isSpeaking || isListening) && (
        <circle
          cx="12"
          cy="12"
          r="10.5"
          stroke={primaryColor}
          strokeWidth="0.6"
          strokeDasharray="2 3"
          opacity="0.4"
          className="animate-ping"
          style={{ transformOrigin: '12px 12px', animationDuration: isSpeaking ? '1.4s' : '2.2s' }}
        />
      )}

      {/* Synaptic Orbital Track 1 (Diagonal Ellipse Ring) */}
      <g style={{ transformOrigin: '12px 12px' }}>
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="4"
          transform="rotate(-30 12 12)"
          stroke={primaryColor}
          strokeWidth="0.4"
          strokeDasharray="1.5 2"
          strokeOpacity="0.35"
        />
      </g>

      {/* Synaptic Orbital Track 2 (Counter-Angle Ellipse Ring) */}
      <g style={{ transformOrigin: '12px 12px' }}>
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="4"
          transform="rotate(45 12 12)"
          stroke={secondaryColor}
          strokeWidth="0.4"
          strokeDasharray="1.5 2"
          strokeOpacity="0.3"
        />
      </g>

      {/* 1. Orbiting Outer Particle Ring (Clockwise Rotation) */}
      <g style={{ transformOrigin: '12px 12px' }}>
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur={isSpeaking ? '3s' : isListening ? '5s' : '8s'}
            repeatCount="indefinite"
          />
        )}

        {/* Dynamic Filament Connections from Orbiters to Center */}
        <line x1="12" y1="12" x2="3.5" y2="12" stroke={primaryColor} strokeWidth="0.35" strokeOpacity="0.25" />
        <line x1="12" y1="12" x2="20.5" y2="12" stroke={primaryColor} strokeWidth="0.35" strokeOpacity="0.25" />
        <line x1="12" y1="12" x2="12" y2="3.5" stroke={primaryColor} strokeWidth="0.35" strokeOpacity="0.25" />
        <line x1="12" y1="12" x2="12" y2="20.5" stroke={primaryColor} strokeWidth="0.35" strokeOpacity="0.25" />

        {/* Outer Ring Particle Nodes */}
        <circle cx="3.5" cy="12" r="1.1" fill={primaryColor} filter={`url(#${filterId})`} />
        <circle cx="20.5" cy="12" r="1.1" fill={primaryColor} filter={`url(#${filterId})`} />
        <circle cx="12" cy="3.5" r="1.1" fill={secondaryColor} />
        <circle cx="12" cy="20.5" r="1.1" fill={secondaryColor} />

        {/* Diagonal satellites */}
        <circle cx="6" cy="6" r="0.75" fill={primaryColor} opacity="0.8" />
        <circle cx="18" cy="18" r="0.75" fill={primaryColor} opacity="0.8" />
        <circle cx="18" cy="6" r="0.75" fill={secondaryColor} opacity="0.8" />
        <circle cx="6" cy="18" r="0.75" fill={secondaryColor} opacity="0.8" />
      </g>

      {/* 2. Counter-Rotating Inner Harmonic Particle Shell (Counter-Clockwise) */}
      <g style={{ transformOrigin: '12px 12px' }}>
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 12 12"
            to="0 12 12"
            dur={isSpeaking ? '2.4s' : isListening ? '4s' : '6s'}
            repeatCount="indefinite"
          />
        )}

        {/* Inner Octagonal Particle Matrix */}
        <circle cx="12" cy="6.8" r="0.85" fill={secondaryColor} />
        <circle cx="15.7" cy="8.3" r="0.75" fill={primaryColor} />
        <circle cx="17.2" cy="12" r="0.9" fill={secondaryColor} />
        <circle cx="15.7" cy="15.7" r="0.75" fill={primaryColor} />
        <circle cx="12" cy="17.2" r="0.85" fill={secondaryColor} />
        <circle cx="8.3" cy="15.7" r="0.75" fill={primaryColor} />
        <circle cx="6.8" cy="12" r="0.9" fill={secondaryColor} />
        <circle cx="8.3" cy="8.3" r="0.75" fill={primaryColor} />

        {/* Cross-linking energetic filaments between inner nodes */}
        <polygon
          points="12,6.8 17.2,12 12,17.2 6.8,12"
          stroke={secondaryColor}
          strokeWidth="0.3"
          strokeOpacity="0.3"
          fill="none"
        />
      </g>

      {/* 3. Central Quantum Singularity Nucleus */}
      <g filter={`url(#${filterId})`}>
        {/* Ambient Core Halo */}
        <circle
          cx="12"
          cy="12"
          r={isSpeaking ? 3.4 : isListening ? 3.0 : 2.6}
          fill={primaryColor}
          opacity={isMuted ? 0.6 : 0.85}
          className={animated ? 'animate-pulse' : ''}
          style={{ transformOrigin: '12px 12px' }}
        >
          {animated && (
            <animate
              attributeName="r"
              values={isSpeaking ? '3.0;4.0;3.0' : isListening ? '2.5;3.2;2.5' : '2.4;2.8;2.4'}
              dur={isSpeaking ? '0.8s' : '2s'}
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Radiant Center Node */}
        <circle cx="12" cy="12" r="1.4" fill="#ffffff" />
      </g>

      {/* 4. Micro Energetic Spark Particles */}
      <g fill="#ffffff" opacity="0.9">
        <circle cx="10" cy="10" r="0.5">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="1.3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="14" cy="13.5" r="0.45">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.9;0.1;0.9"
              dur="1.7s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="13.5" cy="9.5" r="0.4">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.3;0.9;0.3"
              dur="1.1s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </g>
    </svg>
  );
};

// Also export as HumanoidIcon to preserve backwards compatibility across existing components
export const HumanoidIcon = ParticleVoiceIcon;
