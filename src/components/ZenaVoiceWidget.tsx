import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Move,
  Palette
} from 'lucide-react';
import { ParticleVoiceIcon } from './HumanoidIcon';
import { DecisionAnalysisResult } from '../types';
import { getTranslation, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { ZenaThemeId, ZENA_THEMES, getStoredZenaTheme, setStoredZenaTheme } from '../utils/zenaThemes';
import { ZenaFrequencyBar } from './ZenaFrequencyBar';

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

const getLocalizedPrompts = (lang: string) => {
  if (lang === 'es') {
    return [
      { label: '⚖️ Romper el empate', prompt: 'Entre mis opciones, ¿cuál gana objetivamente y cuál es el factor decisivo?' },
      { label: '📊 Pesar pros y contras', prompt: '¿Qué opción tiene la ventaja más sólida frente a riesgos ocultos?' },
      { label: '🛡️ Detectar puntos ciegos', prompt: '¿Qué punto ciego o mitigación crítica estoy pasando por alto?' },
      { label: '⏳ Prueba 10-10-10', prompt: 'Aplica la prueba de arrepentimiento 10-10-10 a mi dilema: 10 minutos, 10 meses y 10 años.' },
      { label: '🧠 Sesgos cognitivos', prompt: '¿Estoy cayendo en aversión a la pérdida o sesgo del statu quo?' },
    ];
  }
  if (lang === 'fr') {
    return [
      { label: '⚖️ Trancher le dilemme', prompt: 'Entre mes options, laquelle l’emporte objectivement et quel est le facteur décisif ?' },
      { label: '📊 Peser le pour et le contre', prompt: 'Quelle option présente le meilleur avantage face aux risques cachés ?' },
      { label: '🛡️ Repérer les angles morts', prompt: 'Quel angle mort critique ou risque suis-je en train de négliger ?' },
      { label: '⏳ Test du regret 10-10-10', prompt: 'Applique le test 10-10-10 à mon dilemme : 10 minutes, 10 mois, 10 ans.' },
      { label: '🧠 Vérifier les biais', prompt: 'Suis-je influencé par l’aversion à la perte ou le statu quo ?' },
    ];
  }
  if (lang === 'de') {
    return [
      { label: '⚖️ Patt brechen', prompt: 'Welche Option gewinnt objektiv und was ist der entscheidende Faktor?' },
      { label: '📊 Vor- und Nachteile', prompt: 'Welche Option hat das stärkste Potenzial gegenüber versteckten Risiken?' },
      { label: '🛡️ Blinde Flecken', prompt: 'Welchen kritischen blinden Fleck übersehe ich gerade?' },
      { label: '⏳ 10-10-10 Reuetest', prompt: 'Wende den 10-10-10 Reuetest an: 10 Minuten, 10 Monate und 10 Jahre.' },
      { label: '🧠 Kognitive Verzerrung', prompt: 'Unterliege ich Verlustaversion oder dem Status-quo-Effekt?' },
    ];
  }
  if (lang === 'tl') {
    return [
      { label: '⚖️ Basagin ang Tabla', prompt: 'Sa pagitan ng aking mga opsyon, alin ang panalo at ano ang mapagpasyang dahilan?' },
      { label: '📊 Timbangin ang Bentahe', prompt: 'Aling opsyon ang may pinakamatatag na bentahe laban sa mga panganib?' },
      { label: '🛡️ Tingnan ang Bulag na Panig', prompt: 'Anong kritikal na panganib o anggulo ang aking nalalampasan?' },
      { label: '⏳ 10-10-10 Pagsubok', prompt: 'Ilapat ang 10-10-10 regret test sa aking desisyon: 10 minuto, 10 buwan, 10 taon.' },
      { label: '🧠 Suriin ang Bias', prompt: 'Nahuhulog ba ako sa loss aversion o status quo bias?' },
    ];
  }
  if (lang === 'zh') {
    return [
      { label: '⚖️ 打破僵局', prompt: '在我的选项中，哪一个客观上胜出？关键的决胜因素是什么？' },
      { label: '📊 权衡利弊', prompt: '面对潜在风险，哪个选项具有最稳健的优势？' },
      { label: '🛡️ 发现盲点', prompt: '我现在忽略了什么关键风险或应对措施？' },
      { label: '⏳ 10-10-10 遗憾测试', prompt: '将 10-10-10 遗憾最小化测试应用于我的困境：10 分钟、10 个月和 10 年。' },
      { label: '🧠 认知偏差检查', prompt: '我是否陷入了损失厌恶或现状偏见？' },
    ];
  }
  if (lang === 'ja') {
    return [
      { label: '⚖️ 決着をつける', prompt: '選択肢の中で客観的に優れているのはどれで、決定的な要因は何ですか？' },
      { label: '📊 メリットとデメリット', prompt: '隠れたリスクに対して最も回復力のあるメリットを持つ選択肢はどれですか？' },
      { label: '🛡️ 盲点を見抜く', prompt: '私が見落としている重大なリスクや軽減策は何ですか？' },
      { label: '⏳ 10-10-10 後悔テスト', prompt: '10分、10か月、10年後の後悔を最小限にする10-10-10テストを適用してください。' },
      { label: '🧠 認知バイアス確認', prompt: '現状維持バイアスや損失回避に囚われていませんか？' },
    ];
  }
  if (lang === 'ar') {
    return [
      { label: '⚖️ كسر التعادل', prompt: 'بين خياراتي، ما الخيار الأفضل موضوعياً وما العامل الحاسم؟' },
      { label: '📊 موازنة الإيجابيات والسلبيات', prompt: 'أي خيار يتمتع بأكبر ميزة مقابل المخاطر الخفية؟' },
      { label: '🛡️ كشف النقاط العمياء', prompt: 'ما النقطة العمياء أو الإجراء الحاسم الذي أتجاهله؟' },
      { label: '⏳ اختبار الندم 10-10-10', prompt: 'طبّق اختبار الندم 10-10-10 على معضلتي: 10 دقائق، 10 أشهر، و10 سنوات.' },
      { label: '🧠 فحص الانحياز المعرفي', prompt: 'هل أقع ضحية لتجنب الخسارة أو انحياز الوضع الراهن؟' },
    ];
  }
  return ARBITR_DELIBERATION_PROMPTS;
};

const BCP47_LANGUAGE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  tl: 'fil-PH',
};

const getBcp47Locale = (lang?: string): string => {
  if (!lang) return 'en-US';
  return BCP47_LANGUAGE_MAP[lang.toLowerCase().trim()] || 'en-US';
};

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
  const [sheetTab, setSheetTab] = useState<'conversation' | 'context' | 'settings'>('conversation');
  const [status, setStatus] = useState<ZenaStatus>('idle');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Character theme and glow profiles
  const [characterTheme, setCharacterTheme] = useState<ZenaThemeId>(getStoredZenaTheme);
  const activeTheme = ZENA_THEMES[characterTheme] || ZENA_THEMES.cyber;

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ZenaThemeId>;
      if (customEvent.detail && ZENA_THEMES[customEvent.detail]) {
        setCharacterTheme(customEvent.detail);
      }
    };
    window.addEventListener('zena-theme-changed', handleThemeChange);
    return () => window.removeEventListener('zena-theme-changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (themeId: ZenaThemeId) => {
    setCharacterTheme(themeId);
    setStoredZenaTheme(themeId);
  };

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

  // Initial welcome message calibrated to 1-3 spoken sentences in current language
  const [messages, setMessages] = useState<ZenaMessage[]>(() => {
    return [
      {
        id: 'zena-welcome',
        role: 'model',
        text: t.zenaWelcomeMessage || "I am Zena, your decision arbiter. Speak your dilemma or tap a criteria prompt, and I'll isolate the winning tiebreaker.",
        timestamp: Date.now(),
      },
    ];
  });

  // Keep initial welcome message synchronized when language switches
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'zena-welcome') {
        return [
          {
            id: 'zena-welcome',
            role: 'model',
            text: t.zenaWelcomeMessage || "I am Zena, your decision arbiter. Speak your dilemma or tap a criteria prompt, and I'll isolate the winning tiebreaker.",
            timestamp: Date.now(),
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage, t.zenaWelcomeMessage]);

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
            language: currentLanguage,
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
      recognition.lang = getBcp47Locale(currentLanguage);
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

  // Safe Avatar Press Handler for Mobile Touch & Desktop Click - One Call Away Direct to Live
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
      if (onOpenLiveModal) {
        onOpenLiveModal();
      } else {
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      }
    },
    [onOpenLiveModal, setIsOpen, unlockAudioContext]
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
      {/* 1. DRAGGABLE & FLOATING AVATAR WIDGET (Mobile touch draggable & desktop repositionable) */}
      <div
        ref={containerRef}
        id="zena-floating-container"
        className={`fixed z-50 items-center gap-2.5 pointer-events-auto select-none ${
          position ? '' : 'bottom-6 right-6'
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
                paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
                paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
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
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-950/95 text-white text-[10px] font-semibold border border-cyan-400/60 shadow-xl pointer-events-none flex items-center gap-1.5 animate-pulse z-50 backdrop-blur-md"
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
          className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-slate-950/95 py-2 px-3.5 shadow-lg shadow-neutral-950/10 backdrop-blur-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-grab active:cursor-grabbing group"
          title={position ? 'Drag to reposition • Click to talk (Repositioned)' : 'Drag to reposition • Click to talk'}
        >
          {/* Subtle Drag Grip Icon */}
          <Move className="h-3 w-3 text-neutral-400 dark:text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />

          {/* Status Indicator Dot */}
          <span className="relative flex h-2 w-2">
            {status === 'speaking' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </>
            ) : status === 'listening' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </>
            ) : status === 'deliberating' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse" />
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            )}
          </span>

          <span className="tracking-wide uppercase font-bold text-[11px] bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            ZENA
          </span>

          <span className="text-neutral-400 dark:text-slate-400 font-normal">•</span>

          <span className="text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
            {status === 'speaking'
              ? 'Speaking...'
              : status === 'listening'
              ? 'Listening...'
              : status === 'deliberating'
              ? 'Analyzing...'
              : 'Decision Ref'}
          </span>
        </button>

        {/* The Interactive Mascot Avatar Button: 64x64px (desktop) / 56x56px (mobile) */}
        <div className="relative flex items-center justify-center">
          {/* Audio-reactive pulse rings when listening or speaking */}
          {status === 'listening' && (
            <div
              className="absolute -inset-2.5 rounded-full pointer-events-none bg-cyan-400/25 animate-ping"
              style={{ animationDuration: '1.6s' }}
            />
          )}
          {status === 'speaking' && (
            <div
              className="absolute -inset-2.5 rounded-full pointer-events-none bg-purple-500/30 animate-ping"
              style={{ animationDuration: '1.2s' }}
            />
          )}

          <motion.button
            id="zena-floating-avatar-btn"
            type="button"
            onClick={handleAvatarPress}
            animate={{
              y: isDragging ? 0 : [0, -6, 0],
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
              },
            }}
            whileTap={{ scale: 0.94 }}
            style={{
              touchAction: 'none',
            }}
            className={`relative flex items-center justify-center min-w-[56px] min-h-[56px] w-14 h-14 sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px] rounded-full p-0.5 transition-all duration-300 cursor-grab active:cursor-grabbing select-none ${
              status === 'speaking'
                ? `${activeTheme.speakingBorder} ${activeTheme.speakingShadow} ${activeTheme.speakingRing}`
                : status === 'listening'
                ? `${activeTheme.listeningBorder} ${activeTheme.listeningRing} ${activeTheme.listeningShadow} animate-pulse`
                : `${activeTheme.idleBorder} ${activeTheme.idleShadow}`
            } bg-slate-950/80 backdrop-blur-md`}
            aria-label="Open ZENA Decision Referee"
            title={
              position
                ? 'Drag to reposition • Tap to consult ZENA (Repositioned)'
                : 'Drag to reposition • Tap to consult ZENA'
            }
          >
            {/* Official Mascot Avatar Asset with Dynamic Expression States */}
            <div className="relative h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-slate-950">
              <AnimatePresence initial={false}>
                <motion.img
                  key={status === 'speaking' ? '/zena-speaking.png' : status === 'listening' ? '/zena-listening.png' : '/zena-idle.png'}
                  src={status === 'speaking' ? '/zena-speaking.png' : status === 'listening' ? '/zena-listening.png' : '/zena-idle.png'}
                  alt={`ZENA mascot - ${status}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== window.location.origin + '/zena.png') {
                      target.src = '/zena.png';
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none select-none transition-transform duration-300 hover:scale-105"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Dynamic speaking audio frequency border ripple */}
              {audioLevel > 0.05 && (
                <div
                  className="absolute inset-0 rounded-full border pointer-events-none animate-pulse z-10"
                  style={{ borderColor: activeTheme.accentHex, opacity: audioLevel }}
                />
              )}
            </div>

            {/* Micro Status Dot Badge (Bottom-Right) */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-950 text-[10px] shadow-sm z-10 ${
                status === 'speaking'
                  ? `${activeTheme.dotColor.speaking} text-white animate-pulse`
                  : status === 'listening'
                  ? `${activeTheme.dotColor.listening} text-white animate-pulse`
                  : status === 'deliberating'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : `${activeTheme.dotColor.idle} text-white`
              }`}
            >
              {status === 'speaking' ? (
                <Volume2 className="h-2.5 w-2.5" />
              ) : isMicActive ? (
                <Mic className="h-2.5 w-2.5" />
              ) : (
                <Sparkles className="h-2.5 w-2.5" />
              )}
            </span>
          </motion.button>
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
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-200/80 dark:border-cyan-500/20 bg-neutral-50/80 dark:bg-slate-950/80 backdrop-blur-md gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Mascot Preview */}
              <div 
                className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border-2 overflow-hidden bg-slate-950 ring-1 transition-all duration-300"
                style={{
                  borderColor: status === 'speaking' ? activeTheme.secondaryHex : activeTheme.accentHex,
                  boxShadow: `0 0 14px ${status === 'speaking' ? activeTheme.secondaryHex : activeTheme.glowHex}`,
                }}
              >
                <AnimatePresence initial={false}>
                  <motion.img
                    key={status === 'speaking' ? '/zena-speaking.png' : status === 'listening' ? '/zena-listening.png' : '/zena-idle.png'}
                    src={status === 'speaking' ? '/zena-speaking.png' : status === 'listening' ? '/zena-listening.png' : '/zena-idle.png'}
                    alt={`ZENA mascot - ${status}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + '/zena.png') {
                        target.src = '/zena.png';
                      }
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white tracking-tight">
                    ZENA
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    Arbitr Decision Ref
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300 truncate mt-0.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      status === 'listening' ? 'bg-emerald-400' :
                      status === 'speaking' ? 'bg-purple-400' :
                      'bg-emerald-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      status === 'listening' ? 'bg-emerald-500' :
                      status === 'speaking' ? 'bg-purple-500' :
                      status === 'deliberating' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                  </span>
                  <span className="font-medium truncate">
                    {status === 'listening'
                      ? 'Online & Listening'
                      : status === 'speaking'
                      ? 'Speaking Verdict'
                      : status === 'deliberating'
                      ? 'Deliberating Trade-offs'
                      : 'Online & Listening'}
                  </span>
                </div>
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
              {/* Zena Sheet Navigation Tabs */}
              <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-neutral-100/80 dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 text-xs">
                <div className="inline-flex p-0.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                  <button
                    id="zena-tab-conversation-btn"
                    type="button"
                    onClick={() => setSheetTab('conversation')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      sheetTab === 'conversation'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span>💬 {t.zenaTabConversation || 'Conversation'}</span>
                  </button>
                  <button
                    id="zena-tab-context-btn"
                    type="button"
                    onClick={() => setSheetTab('context')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      sheetTab === 'context'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🎯 {t.zenaTabContext || 'Context'}</span>
                  </button>
                  <button
                    id="zena-tab-settings-btn"
                    type="button"
                    onClick={() => setSheetTab('settings')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      sheetTab === 'settings'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🌐 {t.zenaTabSettings || 'Voice & Lang'}</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 uppercase">
                  {currentLanguage}
                </span>
              </div>

              {/* TAB 1: CONTEXT VIEW */}
              {sheetTab === 'context' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50">
                  {activeDecision ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-slate-400 tracking-wider">Active Dilemma</span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white mt-1">{activeDecision.title}</h4>
                        {activeDecision.context && (
                          <p className="mt-1 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">{activeDecision.context}</p>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/40 dark:bg-cyan-950/30">
                        <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 tracking-wider">Options Under Review</span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {activeDecision.options?.map((opt, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs">
                              {typeof opt === 'string' ? opt : opt.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {activeDecision.verdict && (
                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">Recommended Leader</span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                              Winner
                            </span>
                          </div>
                          <p className="font-bold text-sm text-emerald-950 dark:text-emerald-100 mt-1">
                            {activeDecision.verdict.recommendedOptionName}
                          </p>
                          <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            <strong className="text-neutral-900 dark:text-white">Tiebreaker Factor:</strong> {activeDecision.verdict.theTiebreakerFactor}
                          </p>
                          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {activeDecision.verdict.coreReasoning}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSheetTab('conversation')}
                        className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs text-center cursor-pointer shadow-xs hover:bg-neutral-800"
                      >
                        Return to Conversation →
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-500">
                      <Scale className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                      <p className="font-semibold text-xs">No active decision loaded.</p>
                      <p className="text-[11px] mt-0.5">Start an analysis or load a template to bind context to Zena.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SETTINGS & LANGUAGE VIEW */}
              {sheetTab === 'settings' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50">
                  {/* ZENA Character Theme & Glow Profiles Toggle */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" style={{ color: activeTheme.accentHex }} />
                        <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-slate-400 tracking-wider">
                          ZENA Character Themes & Glow Profiles
                        </span>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors duration-200"
                        style={{
                          backgroundColor: `${activeTheme.accentHex}18`,
                          borderColor: `${activeTheme.accentHex}50`,
                          color: activeTheme.accentHex,
                        }}
                      >
                        {activeTheme.name}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Choose ZENA&apos;s interactive character theme for glow halos, microphone pulse rings, and acoustic frequency matrix effects. Saved in your user settings.
                    </p>

                    {/* Interactive 6-theme palette grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {Object.values(ZENA_THEMES).map((theme) => {
                        const isSelected = theme.id === characterTheme;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleSelectTheme(theme.id)}
                            className={`group relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-2 bg-neutral-50/80 dark:bg-neutral-900/80 shadow-xs'
                                : 'border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                            style={{
                              borderColor: isSelected ? theme.accentHex : undefined,
                              boxShadow: isSelected ? `0 0 14px ${theme.glowHex}` : undefined,
                            }}
                          >
                            {/* Color Swatch & Selection Indicator */}
                            <div className="flex items-center justify-between w-full mb-1.5">
                              <span
                                className={`h-4 w-4 rounded-full bg-gradient-to-tr ${theme.swatchGradient} shadow-xs ring-1 ring-black/10 dark:ring-white/10`}
                              />
                              {isSelected ? (
                                <span 
                                  className="flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] shadow-xs"
                                  style={{ backgroundColor: theme.accentHex }}
                                >
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="h-3.5 w-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 group-hover:border-neutral-400" />
                              )}
                            </div>

                            <span className="font-bold text-xs text-neutral-900 dark:text-white leading-tight">
                              {theme.name}
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                              {theme.tagline}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-slate-400 tracking-wider">Active Language Alignment</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || currentLanguage}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 uppercase font-bold">
                        {currentLanguage}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Zena converses strictly in this language. To change application language, use the global selector in the top navbar.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-slate-400 tracking-wider">Voice & Audio Mode</span>
                    <div className="flex items-center justify-between">
                      <span>Audio Speech Synthesis:</span>
                      <button
                        type="button"
                        onClick={() => {
                          unlockAudioContext();
                          setIsSpeakerMuted((prev) => !prev);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          isSpeakerMuted
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {isSpeakerMuted ? 'Muted' : 'Spoken Voice Active'}
                      </button>
                    </div>

                    {onOpenLiveModal && (
                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <button
                          type="button"
                          onClick={() => {
                            stopListening();
                            setIsOpen(false);
                            onOpenLiveModal();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold text-xs shadow-xs hover:opacity-95 cursor-pointer"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span>Switch to Full Gemini Live Studio</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CONVERSATION VIEW */}
              {sheetTab === 'conversation' && (
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
                      {getLocalizedPrompts(currentLanguage).map((item, idx) => (
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
                        title={t.liveVoiceCopy || 'Copy conversation transcript'}
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied' : (t.copy || 'Copy')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearTranscript}
                        className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer min-h-[28px]"
                        title={t.liveVoiceClear || 'Clear transcript history'}
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
                            <span>Hold or Tap to Speak</span>
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
            </>
          )}

          {/* Subtle, Non-Intrusive Live Audio Frequency Visualization Bar flowing along bottom edge */}
          <div className="shrink-0 w-full bg-slate-950/90 border-t border-neutral-200/40 dark:border-cyan-500/20">
            <ZenaFrequencyBar
              status={status}
              audioLevel={audioLevel}
              theme={activeTheme}
            />
          </div>
        </div>
      )}
    </>
  );
};
