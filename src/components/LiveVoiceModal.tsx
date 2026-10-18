import React, { useState, useEffect, useRef } from 'react';
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
  Sliders
} from 'lucide-react';
import { useLiveVoice, LiveVoiceMessage } from '../hooks/useLiveVoice';
import { DecisionAnalysisResult } from '../types';
import { HumanoidVoiceVisualizer } from './HumanoidVoiceVisualizer';
import { HumanoidIcon } from './HumanoidIcon';
import { getTranslation } from '../utils/i18n';

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
  const t = getTranslation(currentLanguage);
  const [includeContext, setIncludeContext] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
  });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isModelSpeaking]);

  // Connect on modal open if idle
  useEffect(() => {
    if (isOpen && status === 'idle') {
      startSession(decisionContextString, voice);
    }
  }, [isOpen, status, startSession, decisionContextString, voice]);

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

  const quickPrompts = activeDecision ? [
    `Zena, what is the greatest hidden risk with ${(activeDecision.options?.[0]?.name) || 'Option A'} vs ${(activeDecision.options?.[1]?.name) || 'Option B'}?`,
    `Zena, argue against your recommended choice "${activeDecision.verdict?.recommendedOptionName || 'the leading option'}".`,
    `Zena, if I need to move forward within 24 hours, what should I execute first?`,
    `Zena, which option has the lowest emotional regret potential?`,
  ] : [
    "Zena, help me choose between two difficult career paths.",
    "Zena, how should I structure my decision criteria?",
    "Zena, what questions should I ask myself to break a tie?",
  ];

  if (!isOpen) return null;

  return (
    <div 
      id="live-voice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div 
        id="live-voice-modal-container"
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 dark:bg-neutral-800 text-cyan-400 border border-neutral-700/80 shadow-md shadow-cyan-500/10">
              <HumanoidIcon 
                size={22} 
                isSpeaking={isModelSpeaking} 
                isListening={isUserSpeaking} 
                isMuted={isMuted} 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {t.liveVoiceTitle || 'Zena Voice Deliberation'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-800">
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
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Keyboard shortcuts (M = Mute Mic, S = Mute Speaker, Esc = Close)"
            >
              <Keyboard className="h-4 w-4" />
            </button>

            <button
              id="live-voice-close-btn"
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={t.liveVoiceClose || 'Close voice conversation'}
            >
              <X className="h-5 w-5" />
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

        {/* Context & Voice Selection Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-neutral-100/60 dark:bg-neutral-950/50 border-b border-neutral-200/60 dark:border-neutral-800 text-xs">
          {/* Decision context toggle */}
          {activeDecision ? (
            <div className="flex items-center gap-2 max-w-full sm:max-w-md truncate">
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

          {/* Voice persona selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-neutral-500 dark:text-neutral-400">{t.liveVoiceVoiceLabel || 'Voice:'}</span>
            <select
              id="live-voice-persona-select"
              value={voice}
              onChange={(e) => {
                const newVoice = e.target.value;
                setVoice(newVoice);
                if (status === 'connected') {
                  startSession(decisionContextString, newVoice);
                }
              }}
              className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 px-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 shadow-2xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.style})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Humanoid Voice Centerpiece */}
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

          {/* Dynamic Status Indicator text */}
          <div className="mt-2 text-center max-w-md">
            <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {status === 'connecting' && 'Establishing neural link with Gemini 3.1 Live API...'}
              {status === 'error' && (errorMessage || 'Connection failed')}
              {status === 'connected' && isMuted && 'Acoustic sensors muted. Tap microphone or orb to speak.'}
              {status === 'connected' && !isMuted && isModelSpeaking && 'Zena is speaking...'}
              {status === 'connected' && !isMuted && isUserSpeaking && 'Zena is listening to you...'}
              {status === 'connected' && !isMuted && !isModelSpeaking && !isUserSpeaking && 'Speak naturally or tap quick questions below'}
              {status === 'disconnected' && 'Neural link disconnected'}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {status === 'connected' 
                ? 'Full-duplex bidirectional audio — interrupt naturally anytime.' 
                : 'Please wait while session initializes.'}
            </p>
          </div>

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
                onClick={() => startSession(decisionContextString, voice)}
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

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 min-h-[160px] max-h-[300px] sm:max-h-[340px] overflow-y-auto p-4 space-y-3 bg-neutral-50/40 dark:bg-neutral-950/30">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pb-1 border-b border-neutral-200/40 dark:border-neutral-800">
            <span className="font-medium uppercase tracking-wider text-[10px]">Real-Time Transcript</span>
            <div className="flex items-center gap-3">
              {messages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title="Copy full transcript"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
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
                    title="Clear transcript"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 dark:text-neutral-500">
              <HumanoidIcon size={32} className="mb-2 opacity-35" isListening={status === 'connected' && !isMuted} />
              <p className="text-xs font-semibold">Voice transcript stream ready.</p>
              <p className="text-[11px] mt-0.5">Speak naturally or pick a prompt below.</p>
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
                      <HumanoidIcon size={13} className="text-cyan-500" isSpeaking={isModelSpeaking} />
                    )}
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                      {isUser ? 'You' : `Zena (${voice})`}
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
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 shrink-0">
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
        <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <input
              id="live-voice-text-fallback-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={status === 'connected' ? (t.liveVoiceTypePlaceholder || 'Type a question or message to Zena...') : 'Ask Zena a question or test a trade-off...'}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
