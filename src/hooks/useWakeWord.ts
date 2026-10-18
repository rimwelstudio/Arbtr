import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type definitions for cross-browser Web Speech API
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseWakeWordOptions {
  onWakeWordDetected?: (phrase: string) => void;
  disabled?: boolean;
  enabledByDefault?: boolean;
  currentLanguage?: string;
}

/**
 * Phonetic normalizer and pattern matcher for Zena wake word ("Hey Zena").
 * Handles punctuation removal, homophones, Google STT misrecognitions,
 * and multilingual wake terms.
 */
export function checkWakeMatch(rawTranscript: string): { matched: boolean; detected: string } {
  if (!rawTranscript) return { matched: false, detected: '' };
  const text = rawTranscript.trim().toLowerCase();
  if (!text) return { matched: false, detected: '' };

  // 1. Clean punctuation, symbols and excess spacing
  // (e.g. "Hey Zena!" -> "hey zena")
  const clean = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\\|<>+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Normalize common phonetic misrecognitions of "Zena" and "Hey Zena" in speech-to-text
  const normalized = clean
    .replace(/\b(hay|he|aye|ey|hi|k|okay|ok)\s+(zena|xena|zeena|zina|zayna|zeno|zenna)\b/gi, 'hey zena')
    .replace(/\b(xena|zeena|zina|zayna|zeno|zenna|cyna|seena|sena)\b/gi, 'zena')
    .replace(/\b(zy|zi|zye|zai|sai|ze)\s+(know|no|nah|na|now)\b/gi, 'zena')
    .replace(/\b(wake\s+opt|wait\s+up|way\s+cup|wake\s+app)\b/gi, 'wake up');

  // Direct matching patterns prioritizing "Hey Zena"
  const patterns = [
    // Primary trigger: "Hey Zena", "Hi Zena", "OK Zena", "Hello Zena"
    /\b(?:hey|hi|hello|ok|okay)\s+zena\b/i,
    // "Zena" followed by action or phrase
    /\bzena\s+(?:wake\s*up|activate|listen|start|help|deliberate|answer|despierta|acorda|reveille|wach\s*auf|svegliati)\b/i,
    /\b(?:wake\s*up|despierta|acorda|reveille|wach\s*auf|svegliati)\s+zena\b/i,
    // "Zena" alone or clearly addressed
    /\bzena\b/i,
    // Multilingual wake expressions
    /\b(?:despierta|acorda|reveille-toi|wach\s*auf|svegliati)\b/i,
  ];

  for (const pattern of patterns) {
    if (pattern.test(normalized) || pattern.test(clean) || pattern.test(text)) {
      return { matched: true, detected: rawTranscript.trim() };
    }
  }

  return { matched: false, detected: '' };
}

/**
 * Synthesizes an instant futuristic wake-up chime using Web Audio API
 */
export async function playWakeChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Ensure audio context is resumed (browser autoplay policy)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    masterGain.connect(ctx.destination);

    // Three rising harmonic notes: F#5 (739.99Hz) -> A#5 (932.33Hz) -> C#6 (1108.73Hz)
    const freqs = [739.99, 932.33, 1108.73];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      noteGain.gain.setValueAtTime(0, now + idx * 0.08);
      noteGain.gain.linearRampToValueAtTime(0.35, now + idx * 0.08 + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch (err) {
    console.debug('[WakeWord] Audio chime playback error:', err);
  }
}

export function useWakeWord({
  onWakeWordDetected,
  disabled = false,
  enabledByDefault = true,
  currentLanguage = 'en',
}: UseWakeWordOptions = {}) {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabledByDefault);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [lastDetectedPhrase, setLastDetectedPhrase] = useState<string | null>(null);
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const isHandlingWakeRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);

  const onDetectedRef = useRef(onWakeWordDetected);
  onDetectedRef.current = onWakeWordDetected;

  // Check Web Speech API support on mount and check mic permission if supported
  useEffect(() => {
    isMountedRef.current = true;
    const win = window as IWindowSpeechRecognition;
    const hasSupport = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
    setIsSupported(hasSupport);

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          if (!isMountedRef.current) return;
          if (permissionStatus.state === 'granted') {
            setNeedsPermission(false);
          } else if (permissionStatus.state === 'denied') {
            setNeedsPermission(true);
            setErrorStatus('Microphone permission blocked. Click to enable.');
          }
          permissionStatus.onchange = () => {
            if (!isMountedRef.current) return;
            if (permissionStatus.state === 'granted') {
              setNeedsPermission(false);
              setErrorStatus(null);
            } else if (permissionStatus.state === 'denied') {
              setNeedsPermission(true);
            }
          };
        })
        .catch(() => {});
    }

    return () => {
      isMountedRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
    };
  }, []);

  // Trigger wake word action with sound and callback
  const triggerWake = useCallback(
    (detectedPhrase: string = 'Hey Zena') => {
      if (isHandlingWakeRef.current) return;
      isHandlingWakeRef.current = true;

      console.log(`[WakeWord] Activated via phrase: "${detectedPhrase}"`);
      playWakeChime().catch(() => {});
      setLastDetectedPhrase(detectedPhrase);
      setTriggerCount((c) => c + 1);

      // Stop recognition while waking up
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);

      if (onDetectedRef.current) {
        onDetectedRef.current(detectedPhrase);
      }

      // Reset debounce flag after delay
      setTimeout(() => {
        isHandlingWakeRef.current = false;
      }, 1200);

      // Clear the last detected phrase display after 4 seconds
      setTimeout(() => {
        setLastDetectedPhrase((prev) => (prev === detectedPhrase ? null : prev));
      }, 4000);
    },
    []
  );

  // Global Keyboard Shortcut: Alt + Z (or Option + Z) to wake Zena hands-free
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        triggerWake('Alt+Z Shortcut');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerWake]);

  // Clean stop helper
  const stopRecognition = useCallback((resetListeningState: boolean = true) => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (resetListeningState) {
      setIsListening(false);
    }
    isStartingRef.current = false;
  }, []);

  // Fresh instance start helper (recreating SpeechRecognition on each cycle is required in Chrome/Safari)
  const startRecognition = useCallback((isCycle: boolean = false) => {
    if (!isMountedRef.current || isManuallyStoppedRef.current || disabled || !isEnabled || isHandlingWakeRef.current) {
      return;
    }

    const win = window as IWindowSpeechRecognition;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;

    // Detach and clean previous instance without causing UI flicker during silent cycles
    stopRecognition(!isCycle);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      // Use language preference or fallback to en-US for optimal wake phrase detection
      recognition.lang = currentLanguage && currentLanguage !== 'en' ? currentLanguage : 'en-US';

      recognition.onstart = () => {
        isStartingRef.current = false;
        if (!isMountedRef.current) return;
        setIsListening(true);
        setErrorStatus(null);
        setNeedsPermission(false);
      };

      recognition.onresult = (event: any) => {
        if (!isMountedRef.current || isHandlingWakeRef.current) return;

        let aggregated = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          for (let j = 0; j < result.length; ++j) {
            const transcript = result[j]?.transcript || '';
            aggregated += ' ' + transcript;
            const { matched, detected } = checkWakeMatch(transcript);
            if (matched) {
              console.log(`[WakeWord] Match in alternative ${j}: "${detected}"`);
              triggerWake(detected || 'Hey Zena');
              return;
            }
          }
        }

        if (aggregated.trim()) {
          const { matched, detected } = checkWakeMatch(aggregated);
          if (matched) {
            console.log(`[WakeWord] Match in aggregated speech: "${detected}"`);
            triggerWake(detected || 'Hey Zena');
            return;
          }
        }
      };

      recognition.onerror = (event: any) => {
        isStartingRef.current = false;
        if (!isMountedRef.current) return;
        const error = event.error;

        // "no-speech" is NOT a failure; it is the browser's standard silence timeout
        // event during passive background listening. Do not log as an error.
        if (error === 'no-speech') {
          // Chrome silence timeout - normal cycle, onend will smoothly restart recognition
          return;
        }

        // "aborted" occurs when recognition is intentionally stopped or restarted
        if (error === 'aborted') {
          return;
        }

        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setIsListening(false);
          setNeedsPermission(true);
          setErrorStatus('Microphone permission required for wake word. Click to enable.');
          return;
        }

        if (error === 'audio-capture') {
          setIsListening(false);
          setErrorStatus('No microphone detected. Please check your audio input device.');
          return;
        }

        if (error === 'network') {
          // Network hiccup with speech service: auto-restart with backoff
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && isEnabled && !disabled && !isManuallyStoppedRef.current) {
              startRecognition(false);
            }
          }, 1500);
          return;
        }

        // Log genuine unexpected errors only
        console.warn('[WakeWord] Speech recognition error:', error);
      };

      recognition.onend = () => {
        isStartingRef.current = false;
        if (!isMountedRef.current) return;
        recognitionRef.current = null;

        // Auto-restart with fresh instance if still active and not manually stopped
        if (isMountedRef.current && isEnabled && !disabled && !isManuallyStoppedRef.current && !isHandlingWakeRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && isEnabled && !disabled && !isManuallyStoppedRef.current && !isHandlingWakeRef.current) {
              startRecognition(true /* isCycle */);
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (startErr: any) {
        isStartingRef.current = false;
        recognitionRef.current = null;
        if (startErr?.name === 'InvalidStateError') {
          // Recognition already started or audio device busy, retry after small backoff
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && isEnabled && !disabled && !isManuallyStoppedRef.current) {
              startRecognition(true);
            }
          }, 250);
        } else {
          console.debug('[WakeWord] Recognition start error:', startErr);
        }
      }
    } catch (err: any) {
      isStartingRef.current = false;
      recognitionRef.current = null;
      if (err?.name === 'NotAllowedError') {
        setIsListening(false);
        setNeedsPermission(true);
        setErrorStatus('Microphone access blocked. Click to grant access.');
      } else {
        console.debug('[WakeWord] Failed to construct recognition:', err);
      }
    }
  }, [currentLanguage, disabled, isEnabled, stopRecognition, triggerWake]);

  // Request explicit microphone access via user gesture
  const requestMicPermission = useCallback(async () => {
    try {
      setErrorStatus(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release tracks immediately so mic is free for Web Speech API
        stream.getTracks().forEach((track) => track.stop());
      }
      setNeedsPermission(false);
      setIsEnabled(true);
      isManuallyStoppedRef.current = false;
      // Restart speech recognition cleanly
      setTimeout(() => {
        startRecognition();
      }, 150);
      return true;
    } catch (err: any) {
      console.warn('[WakeWord] Microphone permission request failed:', err);
      setErrorStatus('Microphone permission denied. Please allow microphone access in your browser.');
      setNeedsPermission(true);
      setIsListening(false);
      return false;
    }
  }, [startRecognition]);

  // Main lifecycle controller
  useEffect(() => {
    if (!isSupported || disabled || !isEnabled) {
      isManuallyStoppedRef.current = true;
      stopRecognition();
      return;
    }

    isManuallyStoppedRef.current = false;

    // Slight delay to allow any previous audio hardware teardown
    const timer = setTimeout(() => {
      startRecognition();
    }, 350);

    return () => {
      clearTimeout(timer);
      stopRecognition();
    };
  }, [isSupported, disabled, isEnabled, startRecognition, stopRecognition]);

  const toggleWakeWord = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (!next) {
        isManuallyStoppedRef.current = true;
        stopRecognition();
      } else {
        isManuallyStoppedRef.current = false;
        // If permission is needed, prompt
        if (needsPermission) {
          requestMicPermission();
        }
      }
      return next;
    });
  }, [needsPermission, requestMicPermission, stopRecognition]);

  return {
    isEnabled,
    isListening,
    isSupported,
    needsPermission,
    lastDetectedPhrase,
    triggerCount,
    errorStatus,
    toggleWakeWord,
    requestMicPermission,
    simulateWakeWord: triggerWake,
  };
}
