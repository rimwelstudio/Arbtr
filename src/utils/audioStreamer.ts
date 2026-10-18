// Audio utilities for Gemini 3.1 Live API (WebSockets)
// Input: 16kHz 16-bit little-endian PCM
// Output: 24kHz 16-bit little-endian PCM

/**
 * Converts a Float32Array of audio samples (-1.0 to 1.0) into a 16-bit little-endian PCM base64 string
 */
export function pcmToBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // true = little-endian
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a 16-bit little-endian PCM base64 string into a Float32Array (-1.0 to 1.0)
 */
export function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

/**
 * Downsamples audio from any source sample rate to 16000 Hz if needed
 */
export function downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetInput = 0;
  while (offsetResult < result.length) {
    const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetInput; i < nextOffsetInput && i < input.length; i++) {
      accum += input[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : input[offsetInput];
    offsetResult++;
    offsetInput = nextOffsetInput;
  }
  return result;
}

/**
 * Gapless Audio Player for 24kHz PCM from Gemini Live
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private analyserDataArray: Uint8Array | null = null;
  private isMutedState: boolean = false;
  private currentVolumeLevel: number = 1.0;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      try {
        // Prefer 24kHz matching Gemini Live native output rate
        this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      } catch {
        try {
          // Fallback to hardware default rate (e.g. 44.1kHz / 48kHz) for Safari & older browsers
          this.audioCtx = new AudioContextClass();
        } catch (e) {
          console.warn('Could not initialize AudioContext for player:', e);
        }
      }

      if (this.audioCtx) {
        try {
          this.gainNode = this.audioCtx.createGain();
          this.gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 64;
          this.analyserDataArray = new Uint8Array(this.analyser.frequencyBinCount);

          this.gainNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (setupErr) {
          console.warn('Error setting up audio graph:', setupErr);
        }
      }
    }
  }

  async resume(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (err) {
        console.debug('AudioContext resume error:', err);
      }
    }
  }

  /**
   * Set player output volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.currentVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.audioCtx) {
      const effective = this.isMutedState ? 0 : this.currentVolumeLevel;
      this.gainNode.gain.setValueAtTime(effective, this.audioCtx.currentTime);
    }
  }

  /**
   * Toggle or set speaker output mute
   */
  setMute(mute: boolean): void {
    this.isMutedState = mute;
    if (this.gainNode && this.audioCtx) {
      const effective = mute ? 0 : this.currentVolumeLevel;
      this.gainNode.gain.setValueAtTime(effective, this.audioCtx.currentTime);
    }
  }

  isMuted(): boolean {
    return this.isMutedState;
  }

  playChunk(base64Pcm: string): void {
    if (!this.audioCtx) return;
    this.resume().catch(() => {});

    const float32Data = base64ToFloat32(base64Pcm);
    if (float32Data.length === 0) return;

    // Web Audio native resampler automatically resamples 24kHz buffer to audioCtx.sampleRate
    const audioBuffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    if (this.gainNode) {
      source.connect(this.gainNode);
    } else if (this.analyser) {
      source.connect(this.analyser);
    } else {
      source.connect(this.audioCtx.destination);
    }

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;

    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
    };
  }

  /**
   * Returns current output volume level (0.0 to 1.0)
   */
  getVolume(): number {
    if (this.isMutedState || !this.analyser || !this.analyserDataArray || this.activeSources.length === 0) {
      return 0;
    }
    this.analyser.getByteFrequencyData(this.analyserDataArray);
    let sum = 0;
    for (let i = 0; i < this.analyserDataArray.length; i++) {
      sum += this.analyserDataArray[i];
    }
    const avg = sum / this.analyserDataArray.length;
    return Math.min(1, avg / 128);
  }

  stopAll(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  close(): void {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
      this.analyser = null;
      this.gainNode = null;
    }
  }
}

/**
 * Microphone Recorder capturing 16kHz PCM chunks for Gemini Live
 */
export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onAudioChunk: (base64: string) => void;
  private isMuted: boolean = false;
  private currentVolume: number = 0;

  constructor(onAudioChunk: (base64: string) => void) {
    this.onAudioChunk = onAudioChunk;
  }

  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.stream = stream;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    try {
      this.audioCtx = new AudioContextClass({ sampleRate: 16000 });
    } catch {
      // Fallback for Safari / mobile WebKit requiring device native sample rate
      this.audioCtx = new AudioContextClass();
    }

    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (this.isMuted) {
        this.currentVolume = 0;
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);

      // Compute RMS volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.currentVolume = Math.min(1, rms * 5); // boosted for visibility

      // Resample to 16k if needed
      const sampled = downsampleTo16k(inputData, this.audioCtx?.sampleRate || 16000);
      const base64 = pcmToBase64(sampled);
      this.onAudioChunk(base64);
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
  }

  setMute(mute: boolean): void {
    this.isMuted = mute;
    if (this.stream) {
      this.stream.getAudioTracks().forEach((track) => {
        track.enabled = !mute;
      });
    }
  }

  getVolume(): number {
    return this.isMuted ? 0 : this.currentVolume;
  }

  stop(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.currentVolume = 0;
  }
}
