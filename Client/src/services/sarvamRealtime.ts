/**
 * Realtime / Streaming Speech-to-Text client.
 * Supports Sarvam WebSocket API streaming with browser WebSpeech realtime fallback.
 */

import { getSarvamApiKey } from './sarvamApi';
import type { LanguageMode } from '../types';

export interface RealtimeCallbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'connecting' | 'listening' | 'closed') => void;
}

export class RealtimeSTTClient {
  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private speechRecognition: any = null;
  private isRunning: boolean = false;
  private callbacks: RealtimeCallbacks;
  private languageMode: LanguageMode;

  constructor(callbacks: RealtimeCallbacks, languageMode: LanguageMode = 'codemix') {
    this.callbacks = callbacks;
    this.languageMode = languageMode;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    const apiKey = getSarvamApiKey();

    // Try WebSocket connection if API key exists
    if (apiKey) {
      try {
        await this.startWebSocketStream(apiKey);
        return;
      } catch (wsError) {
        console.warn('WebSocket realtime fallback to browser speech recognition:', wsError);
      }
    }

    // Browser WebSpeech API fallback for live streaming
    this.startBrowserSpeechRecognition();
  }

  private async startWebSocketStream(apiKey: string): Promise<void> {
    this.callbacks.onStatusChange('connecting');

    // Sarvam streaming websocket URL
    const wsUrl = `wss://api.sarvam.ai/streaming-speech-to-text?model=saaras:v3-realtime&language_code=${
      this.languageMode === 'ta-IN' ? 'ta-IN' : this.languageMode === 'en-IN' ? 'en-IN' : 'unknown'
    }`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = async () => {
        this.callbacks.onStatusChange('listening');
        // Send initial auth message if required
        this.socket?.send(JSON.stringify({ type: 'auth', key: apiKey }));
        await this.captureAndSendAudio();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'partial' || data.transcript_type === 'partial') {
            this.callbacks.onPartial(data.transcript || data.text || '');
          } else if (data.type === 'final' || data.transcript_type === 'final') {
            this.callbacks.onFinal(data.transcript || data.text || '');
          }
        } catch {
          // plain text response
          this.callbacks.onPartial(event.data);
        }
      };

      this.socket.onerror = () => {
        // Fallback to WebSpeech Recognition if WS has network or auth error
        this.cleanupWebSocket();
        this.startBrowserSpeechRecognition();
      };

      this.socket.onclose = () => {
        if (this.isRunning) {
          this.callbacks.onStatusChange('closed');
        }
      };
    } catch {
      this.startBrowserSpeechRecognition();
    }
  }

  private async captureAndSendAudio(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.isRunning || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.socket.send(pcmData.buffer);
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (err: any) {
      this.callbacks.onError(err.message || 'Microphone access denied for streaming');
    }
  }

  private startBrowserSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.callbacks.onError('Live streaming is not supported on this browser. Use Standard Record mode instead.');
      return;
    }

    try {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;

      if (this.languageMode === 'ta-IN') {
        this.speechRecognition.lang = 'ta-IN';
      } else if (this.languageMode === 'en-IN') {
        this.speechRecognition.lang = 'en-IN';
      } else {
        // Tanglish / mixed: English with Indian accent handles code-mix well in browser
        this.speechRecognition.lang = 'en-IN';
      }

      this.speechRecognition.onstart = () => {
        this.callbacks.onStatusChange('listening');
      };

      this.speechRecognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          this.callbacks.onFinal(final);
        }
        if (interim) {
          this.callbacks.onPartial(interim);
        }
      };

      this.speechRecognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          this.callbacks.onError(`Realtime Speech Error: ${event.error}`);
        }
      };

      this.speechRecognition.onend = () => {
        if (this.isRunning) {
          // Restart if still running
          try {
            this.speechRecognition.start();
          } catch {
            this.callbacks.onStatusChange('closed');
          }
        } else {
          this.callbacks.onStatusChange('closed');
        }
      };

      this.speechRecognition.start();
    } catch (err: any) {
      this.callbacks.onError(err.message || 'Could not start realtime recognition');
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.cleanupWebSocket();

    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {
        // ignore
      }
      this.speechRecognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.callbacks.onStatusChange('closed');
  }

  private cleanupWebSocket(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }
  }
}
