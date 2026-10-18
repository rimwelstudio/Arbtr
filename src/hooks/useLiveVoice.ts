import { useState, useRef, useEffect, useCallback } from 'react';
import { LiveAudioPlayer, LiveAudioRecorder } from '../utils/audioStreamer';

export interface LiveVoiceMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export type LiveVoiceStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

export interface UseLiveVoiceOptions {
  decisionContext?: string;
  defaultVoice?: string;
  onTranscriptUpdate?: (transcript: LiveVoiceMessage[]) => void;
}

/**
 * Intelligent helper to append streaming speech transcription fragments smoothly
 */
function appendSpeechFragment(existing: string, chunk: string): string {
  if (!existing) return chunk.trim();
  if (!chunk) return existing;
  const trimmedChunk = chunk;
  // If the chunk starts with punctuation or if existing ends with space/hyphen, don't add extra space
  if (/^[\s,.:;!?'")\]}]/.test(trimmedChunk) || /[\s\-(]$/.test(existing)) {
    return existing + trimmedChunk;
  }
  return existing + ' ' + trimmedChunk;
}

export function useLiveVoice(options: UseLiveVoiceOptions = {}) {
  const [status, setStatus] = useState<LiveVoiceStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [voice, setVoice] = useState<string>(options.defaultVoice || 'Zena');
  const [messages, setMessages] = useState<LiveVoiceMessage[]>([]);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [modelVolume, setModelVolume] = useState<number>(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const recorderRef = useRef<LiveAudioRecorder | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeUserMessageIdRef = useRef<string | null>(null);
  const activeModelMessageIdRef = useRef<string | null>(null);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch {}
      recorderRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.close();
      } catch {}
      playerRef.current = null;
    }
    activeUserMessageIdRef.current = null;
    activeModelMessageIdRef.current = null;
    setUserVolume(0);
    setModelVolume(0);
    setIsModelSpeaking(false);
    setIsUserSpeaking(false);
    setIsInterrupted(false);
  }, []);

  // Poll volume levels for smooth visualizer feedback
  const startVolumeLoop = useCallback(() => {
    const loop = () => {
      if (recorderRef.current) {
        const uVol = recorderRef.current.getVolume();
        setUserVolume(uVol);
        setIsUserSpeaking(uVol > 0.08);
      }
      if (playerRef.current) {
        const mVol = playerRef.current.getVolume();
        setModelVolume(mVol);
        setIsModelSpeaking(mVol > 0.04);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, []);

  const startSession = useCallback(async (customContext?: string, customVoice?: string) => {
    cleanup();
    setStatus('connecting');
    setErrorMessage(null);
    setIsInterrupted(false);
    activeUserMessageIdRef.current = null;
    activeModelMessageIdRef.current = null;

    const selectedVoice = customVoice || voice;
    if (customVoice) setVoice(customVoice);

    try {
      // 1. Initialize Player
      const player = new LiveAudioPlayer();
      await player.resume();
      playerRef.current = player;

      // 2. Open WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-voice`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        // Start ping-pong keepalive every 15s to prevent cloud proxy idle drop
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            } catch {}
          }
        }, 15000);

        // Send init message with context & voice
        const contextPayload = customContext !== undefined ? customContext : (options.decisionContext || '');
        ws.send(JSON.stringify({
          type: 'init',
          voice: selectedVoice,
          decisionContext: contextPayload,
        }));

        // 3. Initialize Recorder after WS connection established
        try {
          const recorder = new LiveAudioRecorder((pcmBase64) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'audio',
                audio: pcmBase64,
              }));
            }
          });

          await recorder.start();
          recorderRef.current = recorder;
          setIsMuted(false);
          startVolumeLoop();
        } catch (micErr: any) {
          console.warn('Microphone access warning:', micErr);
          setErrorMessage('Microphone access was denied or not found. You can still type messages in Live mode.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ready') {
            setStatus('connected');
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                role: 'system',
                text: `Connected to Gemini 3.1 Live (${data.voice || selectedVoice} voice). Speak or type your thoughts.`,
                timestamp: Date.now(),
              },
            ]);
          } else if (data.type === 'pong') {
            // Keepalive acknowledged
          } else if (data.type === 'audio' && data.audio) {
            playerRef.current?.playChunk(data.audio);
          } else if (data.type === 'transcript') {
            if (data.role === 'model') {
              // When model starts responding, finalize user turn
              activeUserMessageIdRef.current = null;

              setMessages((prev) => {
                const currentId = activeModelMessageIdRef.current;
                const existingIndex = currentId ? prev.findIndex((m) => m.id === currentId) : -1;

                if (existingIndex !== -1) {
                  const updated = [...prev];
                  const existingMsg = updated[existingIndex];
                  updated[existingIndex] = {
                    ...existingMsg,
                    text: appendSpeechFragment(existingMsg.text, data.text),
                  };
                  return updated;
                } else {
                  const newId = `model-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                  activeModelMessageIdRef.current = newId;
                  return [
                    ...prev,
                    {
                      id: newId,
                      role: 'model',
                      text: data.text,
                      timestamp: Date.now(),
                    },
                  ];
                }
              });
            } else if (data.role === 'user') {
              // When user speaks, finalize model turn
              activeModelMessageIdRef.current = null;

              setMessages((prev) => {
                const currentId = activeUserMessageIdRef.current;
                const existingIndex = currentId ? prev.findIndex((m) => m.id === currentId) : -1;

                if (existingIndex !== -1) {
                  const updated = [...prev];
                  const existingMsg = updated[existingIndex];
                  updated[existingIndex] = {
                    ...existingMsg,
                    text: appendSpeechFragment(existingMsg.text, data.text),
                  };
                  return updated;
                } else {
                  const newId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                  activeUserMessageIdRef.current = newId;
                  return [
                    ...prev,
                    {
                      id: newId,
                      role: 'user',
                      text: data.text,
                      timestamp: Date.now(),
                    },
                  ];
                }
              });
            }
          } else if (data.type === 'interrupted') {
            playerRef.current?.stopAll();
            setIsModelSpeaking(false);
            activeModelMessageIdRef.current = null;
            setIsInterrupted(true);
            setTimeout(() => setIsInterrupted(false), 2000);
          } else if (data.type === 'turn_complete') {
            activeUserMessageIdRef.current = null;
            activeModelMessageIdRef.current = null;
          } else if (data.type === 'error') {
            setErrorMessage(data.error || 'A live session error occurred.');
            setStatus('error');
          } else if (data.type === 'closed') {
            setStatus('disconnected');
          }
        } catch (parseErr) {
          console.error('Error parsing live WS message:', parseErr);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setErrorMessage('Failed to connect to the Live API server.');
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus((current) => (current === 'error' ? 'error' : 'disconnected'));
      };
    } catch (err: any) {
      console.error('Failed to start Live Voice session:', err);
      setErrorMessage(err?.message || 'Could not start voice conversation.');
      setStatus('error');
      cleanup();
    }
  }, [cleanup, options.decisionContext, startVolumeLoop, voice]);

  const endSession = useCallback(() => {
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      // Finalize prior active user turn
      activeUserMessageIdRef.current = null;
      activeModelMessageIdRef.current = null;

      const userMsg: LiveVoiceMessage = {
        id: `user-text-${Date.now()}`,
        role: 'user',
        text: clean,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // If WebSocket is actively connected, send over live stream
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: 'text',
              text: clean,
            })
          );
          return;
        } catch (err) {
          console.warn('[useLiveVoice] WebSocket send error, falling back to REST:', err);
        }
      }

      // REST Fallback for Mobile Networks & Disconnected States
      setIsModelSpeaking(true);
      try {
        const res = await fetch('/api/zena/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: clean,
            decisionContext: options.decisionContext || '',
          }),
        });

        const data = await res.json();
        const replyText =
          data.reply ||
          'Focus directly on the option with the non-negotiable upside and minimal downside. That is your decisive winner.';

        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            timestamp: Date.now(),
          },
        ]);

        // Speak aloud via SpeechSynthesis if speaker is not muted
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isSpeakerMuted) {
          try {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(replyText);
            utt.onend = () => setIsModelSpeaking(false);
            utt.onerror = () => setIsModelSpeaking(false);
            window.speechSynthesis.speak(utt);
          } catch {
            setIsModelSpeaking(false);
          }
        } else {
          setIsModelSpeaking(false);
        }
      } catch (err) {
        console.warn('[useLiveVoice] REST fallback error:', err);
        setIsModelSpeaking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: 'When two choices seem tied, identify which option poses the highest irreversible cost and reject it immediately.',
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [isSpeakerMuted, options.decisionContext]
  );

  const toggleMute = useCallback(() => {
    if (recorderRef.current) {
      const next = !isMuted;
      recorderRef.current.setMute(next);
      setIsMuted(next);
      if (next) setUserVolume(0);
    }
  }, [isMuted]);

  const toggleSpeakerMute = useCallback(() => {
    if (playerRef.current) {
      const next = !isSpeakerMuted;
      playerRef.current.setMute(next);
      setIsSpeakerMuted(next);
    }
  }, [isSpeakerMuted]);

  const setSpeakerVolume = useCallback((volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    activeUserMessageIdRef.current = null;
    activeModelMessageIdRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
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
    setSpeakerVolume,
    clearMessages,
  };
}
