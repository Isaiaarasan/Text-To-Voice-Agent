import { useState, useCallback, useRef } from 'react';
import { transcribeShortAudio, transcribeBatchAudio } from '../services/sarvamApi';
import { RealtimeSTTClient } from '../services/sarvamRealtime';
import type { LanguageMode, STTProgress } from '../types';
import { processVoiceCommands } from '../utils/voiceCommands';

export interface UseSarvamSTTReturn {
  transcript: string;
  interimTranscript: string;
  setTranscript: (text: string | ((prev: string) => string)) => void;
  isLoading: boolean;
  progress: STTProgress;
  error: string | null;
  transcribeAudio: (audioBlob: Blob, duration: number, languageMode: LanguageMode, enableVoiceCommands?: boolean) => Promise<string>;
  startStreaming: (languageMode: LanguageMode) => Promise<void>;
  stopStreaming: (enableVoiceCommands?: boolean) => void;
  isStreaming: boolean;
  streamingStatus: 'connecting' | 'listening' | 'closed';
  clearTranscript: () => void;
}

export function useSarvamSTT(): UseSarvamSTTReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<STTProgress>({ status: 'idle', message: '' });
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingStatus, setStreamingStatus] = useState<'connecting' | 'listening' | 'closed'>('closed');

  const realtimeClientRef = useRef<RealtimeSTTClient | null>(null);
  const accumulatedRealtimeRef = useRef<string>('');

  const transcribeAudio = useCallback(
    async (
      audioBlob: Blob,
      duration: number,
      languageMode: LanguageMode,
      enableVoiceCommands: boolean = true
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setProgress({ status: 'uploading', message: 'Sending audio to Sarvam AI...', percent: 10 });

      try {
        let resultText = '';

        if (duration > 30) {
          // Long audio (> 30s) -> Use Batch API
          setProgress({ status: 'transcribing', message: 'Processing long audio batch...', percent: 30 });
          const response = await transcribeBatchAudio({
            audioBlob,
            languageMode,
            onStatusUpdate: (msg, pct) => {
              setProgress({ status: 'transcribing', message: msg, percent: pct });
            },
          });
          resultText = response.transcript;
        } else {
          // Short audio (<= 30s) -> REST sync API
          setProgress({ status: 'transcribing', message: 'Transcribing via Saaras:v3 model...', percent: 60 });
          const response = await transcribeShortAudio({
            audioBlob,
            languageMode,
            onProgress: (pct) => {
              setProgress({ status: 'uploading', message: `Uploading audio (${pct}%)...`, percent: pct });
            },
          });
          resultText = response.transcript;
        }

        // Apply voice commands post-processor
        const formatted = processVoiceCommands(resultText, enableVoiceCommands);

        setTranscript((prev) => {
          if (!prev.trim()) return formatted;
          return `${prev.trim()}\n\n${formatted}`;
        });

        setProgress({ status: 'completed', message: 'Transcription completed!', percent: 100 });
        return formatted;
      } catch (err: any) {
        console.error('Transcription error:', err);
        const errMsg = err.message || 'Failed to transcribe audio. Check your network or API key.';
        setError(errMsg);
        setProgress({ status: 'error', message: errMsg });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const startStreaming = useCallback(
    async (languageMode: LanguageMode) => {
      setError(null);
      setIsStreaming(true);
      setInterimTranscript('');
      accumulatedRealtimeRef.current = '';

      const client = new RealtimeSTTClient(
        {
          onPartial: (text) => {
            setInterimTranscript(text);
          },
          onFinal: (text) => {
            accumulatedRealtimeRef.current += (accumulatedRealtimeRef.current ? ' ' : '') + text;
            setTranscript((prev) => (prev ? `${prev} ${text}` : text));
            setInterimTranscript('');
          },
          onError: (err) => {
            setError(err);
          },
          onStatusChange: (status) => {
            setStreamingStatus(status);
          },
        },
        languageMode
      );

      realtimeClientRef.current = client;
      await client.start();
    },
    []
  );

  const stopStreaming = useCallback((enableVoiceCommands: boolean = true) => {
    if (realtimeClientRef.current) {
      realtimeClientRef.current.stop();
      realtimeClientRef.current = null;
    }
    setIsStreaming(false);
    setStreamingStatus('closed');
    setInterimTranscript('');

    if (enableVoiceCommands) {
      setTranscript((prev) => processVoiceCommands(prev, true));
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setProgress({ status: 'idle', message: '' });
  }, []);

  return {
    transcript,
    interimTranscript,
    setTranscript,
    isLoading,
    progress,
    error,
    transcribeAudio,
    startStreaming,
    stopStreaming,
    isStreaming,
    streamingStatus,
    clearTranscript,
  };
}
