import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  X, 
  Radio, 
  Sparkles, 
  Send, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle,
  BrainCircuit,
  MessageSquare,
  Download,
  Keyboard,
  Sliders,
  Globe,
  Minimize2
} from 'lucide-react';
import { useLiveVoice, LiveVoiceMessage } from '../hooks/useLiveVoice';
import { DecisionAnalysisResult } from '../types';
import { HumanoidVoiceVisualizer } from './HumanoidVoiceVisualizer';
import { getTranslation, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { ZenaThemeId, ZENA_THEMES, getStoredZenaTheme } from '../utils/zenaThemes';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDecision?: DecisionAnalysisResult | null;
  currentLanguage?: string;
  onOpenZenaWidget?: () => void;
}

const VOICE_OPTIONS = [
  { id: 'Zena', name: 'Zena', style: 'Primary Arbiter • Sharp & Perceptive' },
  { id: 'Kore', name: 'Kore', style: 'Decisive & Crisp' },
  { id: 'Puck', name: 'Puck', style: 'Inquisitive & Dynamic' },
  { id: 'Charon', name: 'Charon', style: 'Grounded & Deep' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Direct & Candid' },
];

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  activeDecision,
  currentLanguage = 'en',
  onOpenZenaWidget,
}) => {
  const [conversationLanguage, setConversationLanguage] = useState<string>(currentLanguage || 'en');
  const t = getTranslation(conversationLanguage);
  const [activeTab, setActiveTab] = useState<'studio' | 'transcript'>('studio');
  const [includeContext, setIncludeContext] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sync conversationLanguage when currentLanguage prop changes
  useEffect(() => {
    if (currentLanguage) {
      setConversationLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Compile context string from active decision
  const decisionContextString = React.useMemo(() => {
    if (!activeDecision || !includeContext) return '';
    const optionNames = (activeDecision.options || []).map((o) => (typeof o === 'string' ? o : o.name)).join(', ');
    const parts = [
      `Dilemma Topic: ${activeDecision.title}`,
      activeDecision.context ? `Background Context: ${activeDecision.context}` : '',
      `Options Under Review: ${optionNames}`,
    ];
    if (activeDecision.verdict) {
      parts.push(`Current Recommended Winner: ${activeDecision.verdict.recommendedOptionName}`);
      parts.push(`The Tiebreaker Factor: ${activeDecision.verdict.theTiebreakerFactor}`);
      parts.push(`Core Rationale: ${activeDecision.verdict.coreReasoning}`);
    }
    return parts.filter(Boolean).join('\n');
  }, [activeDecision, includeContext]);

  const {
    status,
    errorMessage,
    isMuted,
    isSpeakerMuted,
    voice,
    setVoice,
    language,
    setLanguage,
    messages,
    userVolume,
    modelVolume,
    isModelSpeaking,
    isUserSpeaking,
    isInterrupted,
    startSession,
    endSession,
    sendTextMessage,
    toggleMute,
    toggleSpeakerMute,
    clearMessages,
  } = useLiveVoice({
    decisionContext: decisionContextString,
    defaultVoice: 'Zena',
    language: conversationLanguage,
  });

  // Active character theme from user settings
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

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isModelSpeaking, activeTab]);

  // Connect automatically on modal open to make conversation live immediately
  useEffect(() => {
    if (isOpen && (status === 'idle' || status === 'error')) {
      startSession(decisionContextString, voice, conversationLanguage);
    }
  }, [isOpen, status, startSession, decisionContextString, voice, conversationLanguage]);

  // Keyboard shortcuts (M = mute mic, S = mute speaker, Esc = close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in the text input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        toggleSpeakerMute();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleMute, toggleSpeakerMute]);

  // Handle modal close
  const handleClose = () => {
    endSession();
    onClose();
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput);
    setTextInput('');
  };

  const handleCopyTranscript = () => {
    const text = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'You' : `Zena (${voice})`}: ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const formattedDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    let content = `# Zena Live Voice Deliberation\n`;
    content += `**Date:** ${formattedDate}\n`;
    content += `**Voice Persona:** ${voice}\n`;
    if (activeDecision?.title) {
      content += `**Dilemma:** ${activeDecision.title}\n`;
    }
    content += `\n---\n\n`;

    messages.filter((m) => m.role !== 'system').forEach((m) => {
      const speaker = m.role === 'user' ? 'You' : `Zena (${voice})`;
      content += `### ${speaker}\n${m.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zena-deliberation-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const quickPrompts = React.useMemo(() => {
    const opt0 = activeDecision?.options?.[0]?.name || 'Option A';
    const opt1 = activeDecision?.options?.[1]?.name || 'Option B';
    const winner = activeDecision?.verdict?.recommendedOptionName || 'the leading choice';

    if (conversationLanguage === 'es') {
      return activeDecision ? [
        `${voice}, ¿cuál es el mayor riesgo oculto entre "${opt0}" vs "${opt1}"?`,
        `${voice}, argumenta en contra de tu elección recomendada "${winner}".`,
        `${voice}, si debo actuar dentro de 24 horas, ¿cuál es mi primer paso?`,
        `${voice}, ¿cuál opción tiene menor probabilidad de arrepentimiento?`,
      ] : [
        `${voice}, ayúdame a elegir entre dos opciones difíciles.`,
        `${voice}, ¿cómo debo priorizar mis criterios de decisión?`,
        `${voice}, ¿qué preguntas debo hacerme para romper este empate?`,
      ];
    }

    if (conversationLanguage === 'fr') {
      return activeDecision ? [
        `${voice}, quel est le plus grand risque caché entre "${opt0}" et "${opt1}" ?`,
        `${voice}, argumente contre ton choix recommandé "${winner}".`,
        `${voice}, si je dois avancer sous 24h, que dois-je exécuter en premier ?`,
        `${voice}, quelle option minimise le regret ?`,
      ] : [
        `${voice}, aide-moi à départager deux options difficiles.`,
        `${voice}, comment structurer mes critères de décision ?`,
        `${voice}, quelles questions me poser pour trancher ?`,
      ];
    }

    if (conversationLanguage === 'de') {
      return activeDecision ? [
        `${voice}, was ist das größte versteckte Risiko zwischen "${opt0}" und "${opt1}"?`,
        `${voice}, argumentiere gegen deine Empfehlung "${winner}".`,
        `${voice}, wenn ich innerhalb von 24 Stunden handeln muss, was ist der erste Schritt?`,
        `${voice}, welche Option minimiert Reuegefühle?`,
      ] : [
        `${voice}, hilf mir bei der Entscheidung zwischen zwei Optionen.`,
        `${voice}, wie sollte ich meine Kriterien gewichten?`,
        `${voice}, welche Kernfragen brechen dieses Patt?`,
      ];
    }

    if (conversationLanguage === 'tl') {
      return activeDecision ? [
        `${voice}, ano ang pinakamalaking nakatagong panganib sa "${opt0}" vs "${opt1}"?`,
        `${voice}, mangatwiran laban sa iyong inirekumendang "${winner}".`,
        `${voice}, kung kailangan kong kumilos sa loob ng 24 oras, ano ang uunahin ko?`,
        `${voice}, aling opsyon ang may pinakamababang potensyal na pagsisisi?`,
      ] : [
        `${voice}, tulungan mo akong pumili sa dalawang mahirap na desisyon.`,
        `${voice}, paano ko dapat iayos ang aking pamantayan?`,
        `${voice}, anong mga tanong ang dapat kong itanong sa sarili ko?`,
      ];
    }

    return activeDecision ? [
      `${voice}, what is the greatest hidden risk with "${opt0}" vs "${opt1}"?`,
      `${voice}, argue against your recommended choice "${winner}".`,
      `${voice}, if I need to move forward within 24 hours, what should I execute first?`,
      `${voice}, which option has the lowest emotional regret potential?`,
    ] : [
      `${voice}, help me choose between two difficult career paths.`,
      `${voice}, how should I structure my decision criteria?`,
      `${voice}, what questions should I ask myself to break a tie?`,
    ];
  }, [activeDecision, conversationLanguage, voice]);

  if (!isOpen) return null;

  return (
    <div 
      id="live-voice-modal-backdrop"
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Live Voice Deliberation Modal"
    >
      <div 
        id="live-voice-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div 
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border-2 overflow-hidden bg-slate-950 ring-1 transition-all duration-300"
              style={{
                borderColor: isModelSpeaking ? activeTheme.secondaryHex : activeTheme.accentHex,
                boxShadow: `0 0 12px ${isModelSpeaking ? activeTheme.secondaryHex : activeTheme.glowHex}`,
              }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={isModelSpeaking ? '/zena-speaking.png' : isUserSpeaking ? '/zena-listening.png' : '/zena-idle.png'}
                  src={isModelSpeaking ? '/zena-speaking.png' : isUserSpeaking ? '/zena-listening.png' : '/zena-idle.png'}
                  alt="ZENA Mascot"
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {t.liveVoiceTitle || 'ZENA Decision Ref'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-800">
                  <Sparkles className="h-3 w-3 text-cyan-500" />
                  Gemini Live
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-mono text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
                  {t.zynoWakeNav || 'Wake: "Hey Zena"'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.liveVoiceSubtitle || 'Interactive sentient particle voice entity powered by Gemini Live API'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <span className={`h-2 w-2 rounded-full ${
                status === 'connected' 
                  ? isModelSpeaking 
                    ? 'bg-cyan-500 animate-ping' 
                    : isUserSpeaking 
                      ? 'bg-emerald-500 animate-pulse' 
                      : 'bg-emerald-500'
                  : status === 'connecting' 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-neutral-400'
              }`} />
              <span className="text-neutral-700 dark:text-neutral-300 capitalize">
                {status === 'connected' 
                  ? isModelSpeaking ? (t.liveVoiceSpeaking || 'Zena Speaking') : isUserSpeaking ? (t.liveVoiceListening || 'Listening to You') : (t.liveVoiceActive || 'Active') 
                  : status === 'connecting' ? (t.liveVoiceConnecting || 'Connecting...') : status}
              </span>
            </div>

            {/* Keyboard shortcuts toggle */}
            <button
              type="button"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Keyboard shortcuts (M = Mute Mic, S = Mute Speaker, Esc = Close)"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </button>

            {/* Switch to Floating Widget / Minimize */}
            {onOpenZenaWidget && (
              <button
                type="button"
                id="live-voice-minimize-btn"
                onClick={() => {
                  handleClose();
                  onOpenZenaWidget();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer min-h-[36px]"
                title="Minimize live voice to floating referee"
                aria-label="Minimize live voice to floating referee"
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Minimize</span>
              </button>
            )}

            {/* Close Button */}
            <button
              id="live-voice-close-btn"
              type="button"
              onClick={handleClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60 bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-600 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 font-bold text-xs transition-colors cursor-pointer min-h-[36px]"
              title={t.liveVoiceClose || 'Close voice conversation (restore floating referee)'}
              aria-label="Close voice conversation"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Shortcuts banner */}
        {showShortcuts && (
          <div className="flex items-center justify-between px-5 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-700 font-mono text-[10px]">M</kbd> Toggle Mic</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-700 font-mono text-[10px]">S</kbd> Toggle Speaker</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-700 font-mono text-[10px]">Esc</kbd> Close</span>
            </div>
            <button
              type="button"
              onClick={() => setShowShortcuts(false)}
              className="text-indigo-500 hover:text-indigo-700 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Context, Voice & Language Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-neutral-100/60 dark:bg-neutral-950/50 border-b border-neutral-200/60 dark:border-neutral-800 text-xs">
          {/* Decision context toggle */}
          {activeDecision ? (
            <div className="flex items-center gap-2 max-w-full sm:max-w-xs truncate">
              <BrainCircuit className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-neutral-500 dark:text-neutral-400 shrink-0">{t.liveVoiceGrounding || 'Grounding:'}</span>
              <button
                type="button"
                onClick={() => setIncludeContext(!includeContext)}
                className={`truncate font-medium underline-offset-2 hover:underline cursor-pointer ${
                  includeContext ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 line-through'
                }`}
                title={includeContext ? 'Decision context attached to live session' : 'Context detached'}
              >
                {activeDecision.title}
              </button>
            </div>
          ) : (
            <div className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {t.liveVoiceOpenEnded || 'Open-ended deliberation mode'}
            </div>
          )}

          {/* Controls: Voice & Conversation Language */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {/* Conversation Language Selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span className="text-neutral-500 dark:text-neutral-400">{t.liveVoiceLanguageLabel || 'Language:'}</span>
              <select
                id="live-voice-conversation-language-select"
                value={conversationLanguage}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setConversationLanguage(newLang);
                  setLanguage(newLang);
                  if (status === 'connected') {
                    startSession(decisionContextString, voice, newLang);
                  }
                }}
                className="rounded-lg border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 py-1 px-2 text-xs font-semibold text-neutral-800 dark:text-white shadow-2xs focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-400 cursor-pointer"
                title={t.liveVoiceConversationLanguage || 'Conversation Language'}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice persona selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 dark:text-neutral-400">{t.liveVoiceVoiceLabel || 'Voice:'}</span>
              <select
                id="live-voice-persona-select"
                value={voice}
                onChange={(e) => {
                  const newVoice = e.target.value;
                  setVoice(newVoice);
                  if (status === 'connected') {
                    startSession(decisionContextString, newVoice, conversationLanguage);
                  }
                }}
                className="rounded-lg border border-neutral-200 dark:border-white/15 bg-white dark:bg-slate-900/90 py-1 px-2 text-xs font-semibold text-neutral-800 dark:text-white shadow-2xs focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-400 cursor-pointer"
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.name} ({v.style})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Tabs Bar: Live Studio vs Conversation Transcript */}
        <div className="flex items-center justify-between px-5 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 text-xs">
          <div className="inline-flex p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
            <button
              id="live-tab-studio-btn"
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-cyan-500" />
              <span>{t.liveVoiceTabStudio || 'Live Studio'}</span>
            </button>
            <button
              id="live-tab-transcript-btn"
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transcript'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
              <span>{t.liveVoiceTabTranscript || 'Transcript'}</span>
              {messages.filter((m) => m.role !== 'system').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {messages.filter((m) => m.role !== 'system').length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">
              {SUPPORTED_LANGUAGES.find((l) => l.code === conversationLanguage)?.name || conversationLanguage}
            </span>
          </div>
        </div>

        {/* Interactive Humanoid Voice Centerpiece (Visible in Studio tab) */}
        {activeTab === 'studio' && (
          <div className="relative flex flex-col items-center justify-center py-5 px-4 bg-gradient-to-b from-neutral-900/5 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border-b border-neutral-200/80 dark:border-neutral-800">
            <HumanoidVoiceVisualizer
              status={status}
              isMuted={isMuted}
              isModelSpeaking={isModelSpeaking}
              isUserSpeaking={isUserSpeaking}
              modelVolume={modelVolume}
              userVolume={userVolume}
              voiceName={voice}
              onToggleMute={toggleMute}
            />

            {/* Interruption Notice Banner */}
            {isInterrupted && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[11px] font-semibold animate-pulse">
                <span>⚡ Interrupted — Listening to you</span>
              </div>
            )}

            {/* Audio controls toolbar (Mic toggle, Speaker toggle, VU meter) */}
            {status === 'connected' && (
              <div className="mt-3 flex items-center gap-2 p-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                {/* Mic mute toggle button */}
                <button
                  id="live-voice-mic-toggle-btn"
                  type="button"
                  onClick={toggleMute}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isMuted 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 shadow-2xs'
                  }`}
                  title="Toggle microphone (Hotkey: M)"
                >
                  {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-emerald-500" />}
                  <span>{isMuted ? 'Mic Muted' : 'Mic Active'}</span>
                </button>

                {/* Mic Input Level Meter VU Bar */}
                <div className="flex items-center gap-0.5 px-2 py-1 bg-neutral-200/70 dark:bg-neutral-900/70 rounded-full h-5" title={`Mic Volume: ${Math.round(userVolume * 100)}%`}>
                  {[0.1, 0.25, 0.45, 0.7, 0.9].map((thresh, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        !isMuted && userVolume >= thresh
                          ? idx >= 3 
                            ? 'h-3.5 bg-amber-500' 
                            : 'h-3 bg-emerald-500'
                          : 'h-1.5 bg-neutral-400/40 dark:bg-neutral-600/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Speaker mute toggle button */}
                <button
                  id="live-voice-speaker-toggle-btn"
                  type="button"
                  onClick={toggleSpeakerMute}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSpeakerMuted 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 shadow-2xs'
                  }`}
                  title="Toggle speaker output sound (Hotkey: S)"
                >
                  {isSpeakerMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-500" />}
                  <span className="hidden sm:inline">{isSpeakerMuted ? 'Muted' : 'Audio On'}</span>
                </button>
              </div>
            )}

            {/* Reconnect or Switch button on error */}
            {status === 'error' && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => startSession(decisionContextString, voice, conversationLanguage)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-medium text-white dark:text-neutral-900 shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-establish Neural Link
                </button>
                {onOpenZenaWidget && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onOpenZenaWidget();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Use Zena Persona Sheet
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live Conversation Transcript Stream */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/40 dark:bg-neutral-950/30 ${
          activeTab === 'transcript' ? 'min-h-[360px] sm:min-h-[440px] max-h-[580px]' : 'min-h-[160px] max-h-[260px] sm:max-h-[300px]'
        }`}>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pb-1 border-b border-neutral-200/40 dark:border-neutral-800">
            <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>{t.liveVoiceTabTranscript || 'Real-Time Transcript'}</span>
              <span className="text-neutral-400 font-normal">({SUPPORTED_LANGUAGES.find((l) => l.code === conversationLanguage)?.nativeName || conversationLanguage})</span>
            </span>
            <div className="flex items-center gap-3">
              {messages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title={t.liveVoiceCopy || 'Copy full transcript'}
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : (t.copy || 'Copy')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTranscript}
                    className="inline-flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title="Download transcript markdown"
                  >
                    {downloaded ? <Check className="h-3 w-3 text-emerald-500" /> : <Download className="h-3 w-3" />}
                    <span>{downloaded ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
                    title={t.liveVoiceClear || 'Clear transcript'}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 dark:text-slate-400">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-400/50 shadow-md overflow-hidden mb-2 bg-slate-950 opacity-80 ring-1 ring-cyan-400/30">
                <img src="/zena.png" alt="ZENA" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Voice transcript stream ready.</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Speak naturally or pick a quick question below.</p>
            </div>
          ) : (
            messages.map((m) => {
              if (m.role === 'system') {
                return (
                  <div key={m.id} className="text-center my-1">
                    <span className="inline-block rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      {m.text}
                    </span>
                  </div>
                );
              }

              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isUser && (
                      <div className="w-4 h-4 rounded-full border border-cyan-400/60 overflow-hidden shrink-0 shadow-xs">
                        <img src="/zena.png" alt="ZENA" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-slate-400">
                      {isUser ? (t.liveVoiceYou || 'You') : `Zena (${voice})`}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-br-xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Inspiration Chips */}
        <div className="px-4 py-2 bg-neutral-100/50 dark:bg-neutral-900/60 border-t border-neutral-200/60 dark:border-neutral-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
            <span className="text-[11px] font-medium text-neutral-400 dark:text-slate-400 shrink-0">
              {t.liveVoiceQuickPrompts || 'Quick Ask:'}
            </span>
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendTextMessage(prompt)}
                className="shrink-0 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1 text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/70 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Fallback Text Input & Disconnect Bar */}
        <div className="p-3 sm:p-4 pb-safe bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <input
              id="live-voice-text-fallback-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={status === 'connected' ? (t.liveVoiceTypePlaceholder || 'Type a question or message to Zena...') : 'Ask Zena a question or test a trade-off...'}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-white/15 bg-neutral-50/50 dark:bg-slate-900/90 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder:text-slate-400 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              id="live-voice-send-text-btn"
              type="submit"
              disabled={!textInput.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
              title={t.liveVoiceSend || "Send text message to Zena"}
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              id="live-voice-end-session-btn"
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            >
              {t.liveVoiceEnd || 'End Call'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
