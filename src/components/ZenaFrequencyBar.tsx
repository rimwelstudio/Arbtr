import React, { useEffect, useRef } from 'react';
import { ZenaThemeConfig } from '../utils/zenaThemes';

interface ZenaFrequencyBarProps {
  status: 'idle' | 'listening' | 'deliberating' | 'speaking' | 'ready';
  audioLevel: number; // 0.0 to 1.0
  theme: ZenaThemeConfig;
  className?: string;
}

export const ZenaFrequencyBar: React.FC<ZenaFrequencyBarProps> = ({
  status,
  audioLevel,
  theme,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth interpolated amplitude to prevent sudden jumps
  const smoothAmpRef = useRef<number>(0.05);
  const phaseRef = useRef<number>(0);

  const isActive = status === 'speaking' || status === 'listening';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Target amplitude: higher during active speaking/listening, gentle baseline when ready/idle
      const targetAmp = isActive
        ? Math.max(0.18, Math.min(1.0, audioLevel * 1.25))
        : 0.06;

      // Exponential moving average for liquid-smooth physics
      smoothAmpRef.current += (targetAmp - smoothAmpRef.current) * 0.14;
      const amp = smoothAmpRef.current;

      // Advance phase speed based on activity
      const speed = isActive ? 0.05 + amp * 0.04 : 0.015;
      phaseRef.current = (phaseRef.current + speed) % (Math.PI * 200);
      const phase = phaseRef.current;

      const centerY = height * 0.65;
      const maxWaveHeight = height * 0.55;

      // 1. Draw Subtle Vertical Spectrum Equalizer Bars
      const numBars = Math.max(16, Math.min(48, Math.floor(width / 10)));
      const barSpacing = width / numBars;
      const barWidth = Math.max(1.5, Math.min(3, barSpacing * 0.45));

      for (let i = 0; i < numBars; i++) {
        const x = i * barSpacing + barSpacing / 2;
        const normalizedX = i / numBars;
        // Natural bell-curve modulation + sinusoidal rhythm
        const envelope = Math.sin(normalizedX * Math.PI);
        const barNoise = Math.sin(i * 0.45 + phase * 2.2) * 0.35 + Math.cos(i * 0.28 - phase * 1.8) * 0.35 + 0.3;
        const barHeight = Math.max(2, (envelope * barNoise * amp * maxWaveHeight * 0.95));

        const barGrad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        if (status === 'speaking') {
          barGrad.addColorStop(0, `${theme.accentHex}20`);
          barGrad.addColorStop(1, `${theme.secondaryHex}bb`);
        } else if (status === 'listening') {
          barGrad.addColorStop(0, `${theme.accentHex}20`);
          barGrad.addColorStop(1, `${theme.accentHex}dd`);
        } else {
          barGrad.addColorStop(0, 'rgba(148, 163, 184, 0.05)');
          barGrad.addColorStop(1, `${theme.accentHex}40`);
        }

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        // Rounded bar top
        if (ctx.roundRect) {
          ctx.roundRect(x - barWidth / 2, height - barHeight - 1, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x - barWidth / 2, height - barHeight - 1, barWidth, barHeight);
        }
        ctx.fill();
      }

      // 2. Draw Harmonic Flowing Ambient Sine Wave Layer (Translucent Fill)
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 4) {
        const relX = x / width;
        const wave1 = Math.sin(relX * Math.PI * 3.5 + phase) * (amp * maxWaveHeight * 0.5);
        const wave2 = Math.cos(relX * Math.PI * 2.0 - phase * 0.7) * (amp * maxWaveHeight * 0.25);
        const y = centerY - (wave1 + wave2);
        ctx.lineTo(x, Math.max(2, Math.min(height - 1, y)));
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      if (status === 'speaking') {
        waveGrad.addColorStop(0, `${theme.accentHex}15`);
        waveGrad.addColorStop(0.5, `${theme.secondaryHex}35`);
        waveGrad.addColorStop(1, `${theme.accentHex}15`);
      } else if (status === 'listening') {
        waveGrad.addColorStop(0, `${theme.accentHex}10`);
        waveGrad.addColorStop(0.5, `${theme.accentHex}40`);
        waveGrad.addColorStop(1, `${theme.accentHex}10`);
      } else {
        waveGrad.addColorStop(0, `${theme.accentHex}05`);
        waveGrad.addColorStop(0.5, `${theme.accentHex}15`);
        waveGrad.addColorStop(1, `${theme.accentHex}05`);
      }

      ctx.fillStyle = waveGrad;
      ctx.fill();

      // 3. Draw Crisp Luminous Crest Stroke
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const relX = x / width;
        const wave1 = Math.sin(relX * Math.PI * 3.5 + phase) * (amp * maxWaveHeight * 0.5);
        const wave2 = Math.cos(relX * Math.PI * 2.0 - phase * 0.7) * (amp * maxWaveHeight * 0.25);
        const y = centerY - (wave1 + wave2);
        if (x === 0) {
          ctx.moveTo(x, Math.max(1, Math.min(height - 1, y)));
        } else {
          ctx.lineTo(x, Math.max(1, Math.min(height - 1, y)));
        }
      }

      const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
      if (status === 'speaking') {
        strokeGrad.addColorStop(0, `${theme.accentHex}60`);
        strokeGrad.addColorStop(0.5, `${theme.secondaryHex}`);
        strokeGrad.addColorStop(1, `${theme.accentHex}60`);
        ctx.shadowColor = theme.secondaryHex;
        ctx.shadowBlur = 6;
      } else if (status === 'listening') {
        strokeGrad.addColorStop(0, `${theme.accentHex}60`);
        strokeGrad.addColorStop(0.5, `${theme.accentHex}`);
        strokeGrad.addColorStop(1, `${theme.accentHex}60`);
        ctx.shadowColor = theme.accentHex;
        ctx.shadowBlur = 5;
      } else {
        strokeGrad.addColorStop(0, `${theme.accentHex}20`);
        strokeGrad.addColorStop(0.5, `${theme.accentHex}60`);
        strokeGrad.addColorStop(1, `${theme.accentHex}20`);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.stroke();

      // Reset shadow for baseline
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 4. Subtle Base Horizon Edge Line along bottom
      ctx.fillStyle = isActive ? `${theme.accentHex}40` : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, height - 1, width, 1);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, status, audioLevel, theme]);

  return (
    <div className={`relative w-full h-5 sm:h-6 overflow-hidden select-none pointer-events-none ${className}`}>
      {/* HTML5 High-Performance Audio Spectrum Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Subtle Micro HUD Status Overlay (Left & Right) */}
      <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] font-mono tracking-wider uppercase text-neutral-400/80 dark:text-neutral-500/80 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full transition-all duration-200 ${
              status === 'speaking'
                ? 'animate-ping'
                : status === 'listening'
                ? 'animate-pulse'
                : ''
            }`}
            style={{
              backgroundColor:
                status === 'speaking'
                  ? theme.secondaryHex
                  : status === 'listening'
                  ? theme.accentHex
                  : `${theme.accentHex}88`,
            }}
          />
          <span className="font-semibold text-[8px] sm:text-[9px]">
            {status === 'speaking'
              ? 'AI Synthesis'
              : status === 'listening'
              ? 'Mic Frequency'
              : status === 'deliberating'
              ? 'Computing'
              : 'Matrix Idle'}
          </span>
        </div>

        {/* Dynamic decibel / amplitude readout */}
        <div className="flex items-center gap-1 text-[8px] sm:text-[9px]">
          <span style={{ color: isActive ? theme.accentHex : undefined }}>
            {isActive ? `${Math.round(audioLevel * 100)}%` : 'Active'}
          </span>
          <span className="opacity-40">|</span>
          <span className="opacity-75">{theme.name.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};
