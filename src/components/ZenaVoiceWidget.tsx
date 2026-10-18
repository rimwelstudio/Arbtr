import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Copy,
  Check,
  Trash2,
  Scale,
  Radio,
  ExternalLink,
  ChevronDown,
  Info,
  RotateCcw,
  Move
} from 'lucide-react';
import { ParticleVoiceIcon } from './HumanoidIcon';
import { DecisionAnalysisResult } from '../types';
import { getTranslation } from '../utils/i18n';

export interface ZenaMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export type ZenaStatus = 'idle' | 'ready' | 'listening' | 'deliberating' | 'speaking' | 'muted';

export interface WidgetPosition {
  x: number;
  y: number;
}

interface ZenaVoiceWidgetProps {
  activeDecision?: DecisionAnalysisResult | null;
  currentLanguage?: string;
  initialOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenLiveModal?: () => void;
}

// Quick action deliberation prompts calibrated for Arbitr
const ARBITR_DELIBERATION_PROMPTS = [
  { label: '⚖️ Break the tie', prompt: 'Between my options, which one objectively wins and what is the decisive tiebreaker factor?' },
  { label: '📊 Weigh pros & cons', prompt: 'Which option has the most resilient upside versus dangerous hidden downsides?' },
  { label: '🛡️ Spot hidden risks', prompt: 'What critical blindspot or mitigation am I overlooking right now?' },
  { label: '⏳ 10-10-10 Regret Test', prompt: 'Apply the 10-10-10 regret minimization test to my dilemma: 10 minutes, 10 months, and 10 years.' },
  { label: '🧠 Check cognitive bias', prompt: 'Am I falling for loss aversion, status quo bias, or sunk cost fallacy here?' },
];

export const ZenaVoiceWidget: React.FC<ZenaVoiceWidgetProps> = ({
  activeDecision,
  currentLanguage = 'en',
  initialOpen = false,
  isOpen: propIsOpen,
  onOpenChange,
  onOpenLiveModal,
}) => {
  const t = getTranslation(currentLanguage);

  // Controlled or uncontrolled open state
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(initialOpen);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const setIsOpen = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      const nextVal = typeof val === 'function' ? val(isOpen) : val;
      setInternalIsOpen(nextVal);
      if (onOpenChange) {
        onOpenChange(nextVal);
      }
    },
    [isOpen, onOpenChange]
  );

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [status, setStatus] = useState<ZenaStatus>('idle');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Draggable position state for mobile & desktop repositioning
  const [position, setPosition] = useState<WidgetPosition | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        // On mobile screens (< 640px), always dock to default bottom-right for clean responsive parity
        if (window.innerWidth < 640) {
          return null;
        }
        const saved = localStorage.getItem('zena_widget_position');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            const padding = 12;
            const maxX = Math.max(padding, window.innerWidth - 64 - padding);
            const maxY = Math.max(padding, window.innerHeight - 64 - padding);
            // Verify within viewport bounds
            if (parsed.x >= padding && parsed.x <= maxX && parsed.y >= padding && parsed.y <= maxY) {
              return parsed;
            }
          }
        }
      } catch {}
    }
    return null;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initial welcome message calibrated to 1-3 spoken sentences
  const [messages, setMessages] = useState<ZenaMessage[]>(() => {
    return [
      {
        id: 'zena-welcome',
        role: 'model',
        text: "I am Zena, your decision arbiter. Speak your dilemma or tap a criteria prompt, and I'll isolate the winning tiebreaker.",
        timestamp: Date.now(),
      },
    ];
  });

  // Refs for Speech Recognition, Synth, Draggable Touch Handling, and Timers
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const waveTimerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const lastToggleTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  // Check speech recognition capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = Boolean(
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      );
      setSpeechSupported(hasSpeech);
    }
  }, []);

  // Unlock mobile AudioContext & SpeechSynthesis safely without queue pollution
  const unlockAudioContext = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
        // Unlock Web Audio context safely if present
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          setTimeout(() => {
            ctx.close().catch(() => {});
          }, 300);
        }
      } catch {}
    }
  }, []);

  // Compile active decision context for Zena
  const decisionContextString = React.useMemo(() => {
    if (!activeDecision) return '';
    const optionNames = (activeDecision.options || [])
      .map((o) => (typeof o === 'string' ? o : o.name))
      .join(', ');
    const parts = [
      `Dilemma Title: ${activeDecision.title}`,
      activeDecision.context ? `Context: ${activeDecision.context}` : '',
      `Options: ${optionNames}`,
    ];
    if (activeDecision.verdict) {
      parts.push(`Current Leader: ${activeDecision.verdict.recommendedOptionName}`);
      parts.push(`The Tiebreaker Factor: ${activeDecision.verdict.theTiebreakerFactor}`);
      parts.push(`Core Rationale: ${activeDecision.verdict.coreReasoning}`);
    }
    return parts.filter(Boolean).join('\n');
  }, [activeDecision]);

  // Auto-scroll transcript box
  useEffect(() => {
    if (isOpen && !isMinimized) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, interimTranscript, isOpen, isMinimized]);

  // Stop speech synthesis on unmount or speaker mute
  useEffect(() => {
    if (isSpeakerMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      if (status === 'speaking') {
        setStatus(isMicActive ? 'listening' : 'ready');
      }
    }
  }, [isSpeakerMuted, status, isMicActive]);

  // Start animated visual voice level wave
  const startWaveAnimation = useCallback(() => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    waveTimerRef.current = setInterval(() => {
      // Dynamic natural pulse between 0.25 and 0.85
      setAudioLevel(0.25 + Math.random() * 0.6);
    }, 120);
  }, []);

  const stopWaveAnimation = useCallback(() => {
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Natural speech synthesis voice helper
  const speakText = useCallback(
    (text: string) => {
      if (isSpeakerMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        // Cancel any pending stuck utterances in the mobile TTS queue
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05; // Crisp, brisk executive pace
        utterance.pitch = 1.0;

        // Try to pick a pleasant English/native voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(
            (v) =>
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Ava') ||
                v.name.includes('Victoria') ||
                v.name.includes('Zira')) &&
              v.lang.startsWith(currentLanguage === 'en' ? 'en' : currentLanguage)
          ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        let hasFinished = false;
        const cleanupUtterance = () => {
          if (hasFinished) return;
          hasFinished = true;
          isSpeakingRef.current = false;
          stopWaveAnimation();
          setStatus(isMicActive ? 'listening' : 'ready');
        };

        utterance.onstart = () => {
          isSpeakingRef.current = true;
          setStatus('speaking');
          startWaveAnimation();
        };

        utterance.onend = cleanupUtterance;
        utterance.onerror = cleanupUtterance;

        // Safety watchdog: mobile browsers occasionally fail to emit onend
        setTimeout(() => {
          if (!hasFinished && isSpeakingRef.current) {
            cleanupUtterance();
          }
        }, Math.max(4000, text.length * 90));

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Zena TTS] SpeechSynthesis error:', err);
        isSpeakingRef.current = false;
        stopWaveAnimation();
        setStatus('ready');
      }
    },
    [isSpeakerMuted, currentLanguage, isMicActive, startWaveAnimation, stopWaveAnimation]
  );

  // Send user message to Zena API with calibrated system instructions
  const sendToZena = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;

      const userMsg: ZenaMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userInput.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimTranscript('');
      setStatus('deliberating');
      setErrorMessage(null);

      // Prepare conversation history
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      try {
        const response = await fetch('/api/zena/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput.trim(),
            decisionContext: decisionContextString,
            conversationHistory: history,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        const replyText =
          data.reply ||
          'Focus strictly on the option with the non-negotiable upside and minimal downside. That is your decisive winner.';

        const modelMsg: ZenaMessage = {
          id: `zena-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, modelMsg]);

        // Speak the response
        speakText(replyText);
      } catch (err: any) {
        console.warn('[Zena API] Chat error:', err);
        const fallbackReply =
          'When two choices seem tied, identify which option poses the highest irreversible cost and reject it immediately.';

        const modelMsg: ZenaMessage = {
          id: `zena-${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, modelMsg]);
        speakText(fallbackReply);
      }
    },
    [decisionContextString, messages, speakText]
  );

  // Start Speech Recognition (Web Speech API) without exclusive getUserMedia locking
  const startListening = useCallback(() => {
    setErrorMessage(null);
    unlockAudioContext();

    // Stop speaking if currently speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        'Speech dictation is not natively supported in this mobile browser. Tap quick dilemma chips or type below.'
      );
      return;
    }

    try {
      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false; // Mobile browsers operate best in single-shot mode
      recognition.interimResults = true;
      recognition.lang = currentLanguage === 'en' ? 'en-US' : currentLanguage;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsMicActive(true);
        setStatus('listening');
        startWaveAnimation();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final.trim()) {
          setInterimTranscript('');
          stopWaveAnimation();
          sendToZena(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Zena SpeechRecognition] Warning:', event.error);
        stopWaveAnimation();
        setIsMicActive(false);

        if (event.error === 'no-speech') {
          setStatus('ready');
        } else if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Tap to grant permission in mobile settings or type below.');
          setStatus('ready');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('Microphone is busy. Close background recorder apps or type below.');
          setStatus('ready');
        } else {
          setErrorMessage(`Mic notice: ${event.error}. You can also type below.`);
          setStatus('ready');
        }
      };

      recognition.onend = () => {
        stopWaveAnimation();
        setIsMicActive(false);
        if (status !== 'deliberating' && status !== 'speaking') {
          setStatus('ready');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[Zena Mic] Start error:', err);
      setErrorMessage('Could not activate microphone. Please type your dilemma or use quick chips below.');
      setIsMicActive(false);
      setStatus('ready');
      stopWaveAnimation();
    }
  }, [currentLanguage, sendToZena, startWaveAnimation, stopWaveAnimation, status, unlockAudioContext]);

  // Stop Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopWaveAnimation();
    setIsMicActive(false);
    if (status === 'listening') {
      setStatus('ready');
    }
  }, [stopWaveAnimation, status]);

  // Toggle Mic
  const handleToggleMic = () => {
    unlockAudioContext();
    if (isMicActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Viewport-aware coordinate boundary clamping
  const clampPosition = useCallback((x: number, y: number): WidgetPosition => {
    if (typeof window === 'undefined') return { x, y };
    const container = containerRef.current;
    const width = container?.offsetWidth || 64;
    const height = container?.offsetHeight || 64;
    const padding = 12;

    const minX = padding;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const minY = padding;
    const maxY = Math.max(padding, window.innerHeight - height - padding);

    return {
      x: Math.round(Math.max(minX, Math.min(maxX, x))),
      y: Math.round(Math.max(minY, Math.min(maxY, y))),
    };
  }, []);

  // Reset widget position back to default bottom corner docking
  const resetPosition = useCallback(() => {
    setPosition(null);
    try {
      localStorage.removeItem('zena_widget_position');
    } catch {}
  }, []);

  // Keep widget safely within viewport bounds on screen rotation or window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        return clampPosition(prev.x, prev.y);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  // Safe Avatar Press Handler for Mobile Touch & Desktop Click
  const handleAvatarPress = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.stopPropagation();
      }
      if (hasDraggedRef.current) return;
      const now = Date.now();
      if (now - lastToggleTimeRef.current < 350) return; // Prevent double trigger / ghost click toggle
      lastToggleTimeRef.current = now;

      unlockAudioContext();
      setIsOpen((prev) => !prev);
      setIsMinimized(false);
    },
    [setIsOpen, unlockAudioContext]
  );

  // Touch Event Listeners for Draggable Mobile Behavior
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    touchDragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
    };
    hasDraggedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchDragRef.current.startX;
    const deltaY = touch.clientY - touchDragRef.current.startY;
    const distance = Math.hypot(deltaX, deltaY);

    // 14px threshold to distinguish tap vs deliberate drag on touch screens
    if (distance > 14) {
      touchDragRef.current.hasMoved = true;
      hasDraggedRef.current = true;
      if (!isDragging) {
        setIsDragging(true);
      }
      const rawX = touchDragRef.current.initialX + deltaX;
      const rawY = touchDragRef.current.initialY + deltaY;
      setPosition(clampPosition(rawX, rawY));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dragData = touchDragRef.current;
    touchDragRef.current = null;
    setIsDragging(false);

    if (dragData?.hasMoved) {
      if (e.cancelable) {
        e.preventDefault();
      }
      hasDraggedRef.current = true;
      // Persist chosen position
      setPosition((cur) => {
        if (cur) {
          try {
            localStorage.setItem('zena_widget_position', JSON.stringify(cur));
          } catch {}
        }
        return cur;
      });
      // Suppress subsequent click/tap for a brief duration
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 200);
    } else {
      // Clean tap on touch device: prevent delayed synthetic click that could hit the newly mounted backdrop overlay!
      if (e.cancelable) {
        e.preventDefault();
      }
      handleAvatarPress(e);
    }
  };

  const handleTouchCancel = () => {
    touchDragRef.current = null;
    setIsDragging(false);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);
  };

  // Mouse drag handler for desktop parity
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Main left click only
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = rect.left;
    const initialY = rect.top;
    let moved = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (Math.hypot(deltaX, deltaY) > 6) {
        moved = true;
        hasDraggedRef.current = true;
        setIsDragging(true);
        const rawX = initialX + deltaX;
        const rawY = initialY + deltaY;
        setPosition(clampPosition(rawX, rawY));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
      if (moved) {
        hasDraggedRef.current = true;
        setPosition((cur) => {
          if (cur) {
            try {
              localStorage.setItem('zena_widget_position', JSON.stringify(cur));
            } catch {}
          }
          return cur;
        });
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 200);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Form Submit for typed input
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    unlockAudioContext();
    sendToZena(textInput);
    setTextInput('');
  };

  // Copy transcript
  const handleCopyTranscript = () => {
    const text = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'ZENA'}: ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear transcript
  const handleClearTranscript = () => {
    setMessages([
      {
        id: `zena-${Date.now()}`,
        role: 'model',
        text: 'Transcript cleared. How can I arbitrate your next decision?',
        timestamp: Date.now(),
      },
    ]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening]);

  // Audio reactive glow calculation for floating avatar button
  const reactiveScale =
    status === 'speaking'
      ? 1.08 + audioLevel * 0.18
      : status === 'listening'
      ? 1.05 + audioLevel * 0.15
      : 1;

  const reactiveGlow =
    status === 'speaking'
      ? 'shadow-[0_0_35px_rgba(6,182,212,0.85)] ring-4 ring-cyan-400'
      : status === 'listening'
      ? 'shadow-[0_0_35px_rgba(16,185,129,0.8)] ring-4 ring-emerald-400'
      : status === 'deliberating'
      ? 'shadow-[0_0_30px_rgba(168,85,247,0.7)] ring-2 ring-purple-400 animate-pulse'
      : 'shadow-[0_0_24px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/50 hover:shadow-[0_0_32px_rgba(6,182,212,0.7)]';

  return (
    <>
      {/* 1. DRAGGABLE FLOATING AVATAR WIDGET (Mobile touch draggable & desktop repositionable) */}
      {/* On mobile, when sheet is open, hide the avatar underneath to avoid touch conflicts */}
      <div
        ref={containerRef}
        id="zena-floating-container"
        className={`fixed z-40 items-center gap-2.5 pointer-events-auto select-none ${
          position ? '' : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
        } ${isOpen ? 'hidden sm:flex' : 'flex'}`}
        style={{
          ...(position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: 'auto',
                right: 'auto',
              }
            : {
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
              }),
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
      >
        {/* Drag Active Tooltip Hint */}
        {isDragging && (
          <div
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900/95 dark:bg-neutral-800/95 text-white text-[10px] font-semibold border border-cyan-400/60 shadow-xl pointer-events-none flex items-center gap-1.5 animate-pulse z-50 backdrop-blur-md"
            aria-live="polite"
          >
            <Move className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Repositioning ZENA</span>
          </div>
        )}

        {/* Floating Name Badge / Status Pill (Visible on tablet/desktop) */}
        <button
          type="button"
          onClick={handleAvatarPress}
          className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 py-2 px-3.5 shadow-lg shadow-neutral-950/10 backdrop-blur-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-grab active:cursor-grabbing group"
          title={position ? 'Drag to reposition • Click to talk (Repositioned)' : 'Drag to reposition • Click to talk'}
        >
          {/* Subtle Drag Grip Icon */}
          <Move className="h-3 w-3 text-neutral-400 dark:text-neutral-500 opacity-60 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />

          {/* Status Indicator Dot */}
          <span className="relative flex h-2 w-2">
            {status === 'speaking' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </>
            ) : status === 'listening' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </>
            ) : status === 'deliberating' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500 animate-pulse" />
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            )}
          </span>

          <span className="tracking-wide uppercase font-bold text-[11px] bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
            ZENA
          </span>

          <span className="text-neutral-400 dark:text-neutral-500 font-normal">•</span>

          <span className="text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
            {status === 'speaking'
              ? 'Speaking...'
              : status === 'listening'
              ? 'Listening...'
              : status === 'deliberating'
              ? 'Analyzing...'
              : 'Voice Arbiter'}
          </span>
        </button>

        {/* The Interactive Glowing Avatar Button: Minimum 56x56px with safe mobile touch handling */}
        <div className="relative flex items-center justify-center">
          {/* Acoustic ripple wave rings when listening or speaking */}
          {(status === 'listening' || status === 'speaking') && (
            <div
              className={`absolute -inset-3 rounded-full pointer-events-none ${
                status === 'speaking' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
              } animate-ping`}
              style={{ animationDuration: status === 'speaking' ? '1.2s' : '1.8s' }}
            />
          )}

          <button
            id="zena-floating-avatar-btn"
            type="button"
            onClick={handleAvatarPress}
            style={{
              transform: `scale(${isDragging ? 1.1 : reactiveScale})`,
              touchAction: 'none', // Critical for 100% reliable touch drag on mobile viewports
            }}
            className={`relative flex items-center justify-center min-w-[56px] min-h-[56px] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 text-white transition-all duration-200 cursor-grab active:cursor-grabbing ${reactiveGlow} ${
              isDragging ? 'ring-4 ring-cyan-400 scale-110 shadow-[0_0_40px_rgba(6,182,212,0.95)]' : 'active:scale-95'
            }`}
            aria-label="Open ZENA Voice Persona Widget"
            title={
              position
                ? 'Drag to reposition • Tap to talk to ZENA (Repositioned)'
                : 'Drag to reposition • Tap to talk to ZENA'
            }
          >
            {/* Inner Dark Glass Orb Container */}
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-950/90 backdrop-blur-sm overflow-hidden p-2">
              {/* Idle subtle breathing particle core */}
              <ParticleVoiceIcon
                size={28}
                isSpeaking={status === 'speaking'}
                isListening={status === 'listening'}
                isMuted={isSpeakerMuted}
                animated={true}
                className="transition-transform duration-300"
              />

              {/* Live Audio Frequency Ripples Overlay */}
              {audioLevel > 0.05 && (
                <div
                  className="absolute inset-0 rounded-full border border-cyan-400/40 pointer-events-none animate-pulse"
                  style={{ opacity: audioLevel }}
                />
              )}
            </div>

            {/* Micro Live Mic Icon Indicator Badge */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-neutral-950 text-[10px] shadow-sm ${
                isMicActive
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {isMicActive ? <Mic className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5 text-cyan-400" />}
            </span>
          </button>
        </div>
      </div>

      {/* 2. MOBILE BACKDROP OVERLAY (Dismisses bottom sheet on deliberate mobile tap) */}
      {isOpen && !isMinimized && (
        <div
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-40 sm:hidden transition-opacity"
          onClick={() => {
            // Guard against synthetic delayed touch ghost-clicks from immediately dismissing the sheet
            if (Date.now() - lastToggleTimeRef.current < 450) {
              return;
            }
            stopListening();
            setIsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* 3. SLEEK GLASSMORPHIC MODAL SHEET */}
      {isOpen && (
        <div
          id="zena-modal-sheet"
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-80 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 shadow-2xl p-3'
              : 'inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[440px] h-[84dvh] sm:h-[620px] max-h-[90dvh] sm:max-h-[660px] rounded-t-3xl sm:rounded-3xl border-t sm:border border-neutral-200/90 dark:border-neutral-800/90 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in slide-in-from-bottom-6 duration-200'
          }`}
          style={{
            paddingBottom: isMinimized ? undefined : 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          }}
          role="dialog"
          aria-label="ZENA Voice Persona Deliberation Sheet"
        >
          {/* Mobile Drag Notch Handle */}
          <div className="sm:hidden flex items-center justify-center pt-2.5 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </div>

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/50 backdrop-blur-md gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Header Avatar with Glow */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 text-white shadow-sm ring-1 ring-cyan-400/40">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                  <ParticleVoiceIcon
                    size={20}
                    isSpeaking={status === 'speaking'}
                    isListening={status === 'listening'}
                    animated={true}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white tracking-tight">
                    ZENA
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                    </span>
                    {status === 'speaking'
                      ? 'Speaking'
                      : status === 'listening'
                      ? 'Listening'
                      : status === 'deliberating'
                      ? 'Analyzing'
                      : 'Voice Arbiter'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {activeDecision ? `Context: ${activeDecision.title}` : 'Ready to evaluate trade-offs'}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              {/* Speaker Mute/Unmute Toggle */}
              <button
                type="button"
                onClick={() => {
                  unlockAudioContext();
                  setIsSpeakerMuted((prev) => !prev);
                }}
                className="rounded-lg p-2 text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                title={isSpeakerMuted ? 'Unmute ZENA spoken voice' : 'Mute ZENA spoken voice'}
                aria-label="Toggle speaker mute"
              >
                {isSpeakerMuted ? (
                  <VolumeX className="h-4 w-4 text-rose-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                )}
              </button>

              {/* Full Gemini Live Modal Launcher (Visible on both mobile & desktop) */}
              {onOpenLiveModal && (
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    setIsOpen(false);
                    onOpenLiveModal();
                  }}
                  className="rounded-lg p-2 text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Switch to Full Gemini 3.1 Live Studio (Full Duplex Audio)"
                  aria-label="Switch to full screen live voice"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}

              {/* Reset Dragged Position (Dock back to bottom-right corner) */}
              {position && (
                <button
                  type="button"
                  onClick={resetPosition}
                  className="rounded-lg p-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Reset ZENA to default bottom-right corner"
                  aria-label="Reset widget position to corner"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}

              {/* Minimize (Desktop/Tablet) */}
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="hidden sm:flex rounded-lg p-2 text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] items-center justify-center"
                title={isMinimized ? 'Expand window' : 'Minimize window'}
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsOpen(false);
                }}
                className="rounded-lg p-2 text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Close ZENA widget"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Minimized View Header Pill */}
          {isMinimized ? (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">ZENA Mini Bar</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Restore
              </button>
            </div>
          ) : (
            <>
              {/* Active Decision Context Bar */}
              {activeDecision && (
                <div className="shrink-0 px-4 py-2 bg-cyan-50/70 dark:bg-cyan-950/40 border-b border-cyan-100 dark:border-cyan-900/60 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 truncate text-cyan-950 dark:text-cyan-200">
                    <Scale className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="font-semibold truncate">
                      {activeDecision.options?.map((o) => (typeof o === 'string' ? o : o.name)).join(' vs ')}
                    </span>
                  </div>
                  {activeDecision.verdict && (
                    <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800">
                      Winner: {activeDecision.verdict.recommendedOptionName}
                    </span>
                  )}
                </div>
              )}

              {/* Audio Reactive Waveform Banner */}
              <div className="shrink-0 px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Radio
                    className={`h-3.5 w-3.5 ${
                      status === 'listening'
                        ? 'text-emerald-400 animate-pulse'
                        : status === 'speaking'
                        ? 'text-cyan-400 animate-pulse'
                        : 'text-neutral-400'
                    }`}
                  />
                  <span className="text-neutral-200 text-[11px]">
                    {status === 'speaking'
                      ? 'ZENA Spoken Voice Active'
                      : status === 'listening'
                      ? 'Listening to your speech...'
                      : status === 'deliberating'
                      ? 'Synthesizing tiebreaker...'
                      : 'Voice Arbiter Ready'}
                  </span>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 h-3.5">
                  {[40, 70, 100, 60, 85, 45, 90, 30].map((h, idx) => {
                    const dynamicHeight =
                      status === 'listening' || status === 'speaking'
                        ? Math.max(20, Math.min(100, (audioLevel * 100 + h * 0.4) % 100))
                        : 20;
                    return (
                      <span
                        key={idx}
                        className={`w-0.5 rounded-full transition-all duration-100 ${
                          status === 'speaking'
                            ? 'bg-cyan-400'
                            : status === 'listening'
                            ? 'bg-emerald-400'
                            : 'bg-neutral-600'
                        }`}
                        style={{ height: `${dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Notice or Error Alert if any */}
              {errorMessage && (
                <div className="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-300 dark:border-amber-700/80 text-[11px] text-amber-950 dark:text-amber-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-amber-800 dark:text-amber-300 hover:underline font-bold shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Browser Speech Dictation Notice (Fallback for mobile browsers without Web Speech) */}
              {!speechSupported && (
                <div className="shrink-0 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-950 dark:text-indigo-100 flex items-center justify-between gap-2">
                  <span>Voice dictation is unsupported in this mobile browser. You can type or launch Gemini Live.</span>
                  {onOpenLiveModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenLiveModal();
                      }}
                      className="font-bold text-indigo-600 dark:text-indigo-300 underline shrink-0 cursor-pointer"
                    >
                      Open Live Mode
                    </button>
                  )}
                </div>
              )}

              {/* SCROLLABLE TRANSCRIPT BOX (Flex-1 auto scroll on mobile) */}
              <div
                id="zena-transcript-box"
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50"
              >
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                          <ParticleVoiceIcon size={14} isSpeaking={status === 'speaking'} animated={false} />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                          isUser
                            ? 'bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 rounded-br-none'
                            : 'bg-white dark:bg-neutral-800/95 border border-neutral-200/90 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 rounded-bl-none'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                              ZENA • Decision Arbiter
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-400 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        <p className="leading-relaxed text-xs sm:text-[13px] whitespace-pre-wrap">
                          {m.text}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Interim Live Speech Transcript Bubble */}
                {interimTranscript && (
                  <div className="flex justify-end gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-br-none px-3.5 py-2 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 italic text-xs animate-pulse">
                      &ldquo;{interimTranscript}...&rdquo;
                    </div>
                  </div>
                )}

                {/* Deliberating Status Bubble */}
                {status === 'deliberating' && (
                  <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 italic font-mono pl-8">
                    <span className="animate-spin h-3 w-3 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    <span>Zena is computing criteria &amp; trade-offs...</span>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>

              {/* Quick Deliberation Prompts Slider */}
              <div className="shrink-0 px-3 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {ARBITR_DELIBERATION_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        unlockAudioContext();
                        sendToZena(item.prompt);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-600 dark:hover:text-cyan-400 border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-100 transition-colors cursor-pointer min-h-[30px]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript Actions Bar */}
              <div className="shrink-0 px-4 py-1.5 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <span className="font-mono text-[10px]">Concise 1–3 Sentence Protocol</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer min-h-[28px]"
                    title="Copy conversation transcript"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearTranscript}
                    className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer min-h-[28px]"
                    title="Clear transcript history"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Interactive Mic & Input Bar */}
              <div className="shrink-0 p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col gap-2.5">
                {/* Main Mic Toggle Control (Large touch target ≥ 52px for mobile) */}
                <div className="flex items-center gap-2">
                  <button
                    id="zena-mic-toggle-btn"
                    type="button"
                    onClick={handleToggleMic}
                    style={{ touchAction: 'manipulation' }}
                    className={`relative flex items-center justify-center min-h-[52px] px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-md flex-1 ${
                      isMicActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
                        : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white ring-2 ring-cyan-400/40 shadow-cyan-500/20 active:scale-[0.98]'
                    }`}
                  >
                    {isMicActive ? (
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                        </span>
                        <MicOff className="h-4 w-4" />
                        <span>Stop Mic (Listening...)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span>Start Speaking to ZENA</span>
                      </div>
                    )}
                  </button>

                  {/* Quick button to open Gemini Live if user wants full-duplex conversational voice */}
                  {onOpenLiveModal && (
                    <button
                      type="button"
                      onClick={() => {
                        stopListening();
                        setIsOpen(false);
                        onOpenLiveModal();
                      }}
                      className="min-h-[52px] px-3 rounded-2xl border border-cyan-500/30 dark:border-cyan-500/40 bg-cyan-50/50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-semibold text-xs flex flex-col items-center justify-center gap-0.5 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer"
                      title="Open Gemini 3.1 Live Audio Modal"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span className="text-[10px] leading-tight">Live Studio</span>
                    </button>
                  )}
                </div>

                {/* Text Fallback Input Bar */}
                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Or type a question for Zena..."
                    className="flex-1 min-h-[42px] px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/90 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                    title="Send message to Zena"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
