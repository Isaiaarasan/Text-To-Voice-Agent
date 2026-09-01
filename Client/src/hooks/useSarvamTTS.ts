import { useState, useRef, useCallback, useEffect } from 'react';
import { convertTextToSpeech } from '../services/sarvamTTS';
import type { LanguageMode, TTSSpeaker, TTSSession } from '../types';

export function useSarvamTTS() {
  const [inputText, setInputText] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<TTSSpeaker>('meera');
  const [pace, setPace] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ttsHistory, setTtsHistory] = useState<TTSSession[]>(() => {
    try {
      const saved = localStorage.getItem('tva_tts_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync TTS history with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tva_tts_history', JSON.stringify(ttsHistory));
    } catch (e) {
      console.warn('Failed to save TTS history to localStorage', e);
    }
  }, [ttsHistory]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateSpeech = useCallback(
    async (textToConvert?: string, langMode: LanguageMode = 'en-IN', autoPlay: boolean = true) => {
      const targetText = (textToConvert || inputText).trim();
      if (!targetText) {
        setError('Please enter some text to convert to voice.');
        return null;
      }

      setIsGenerating(true);
      setError(null);

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      try {
        const result = await convertTextToSpeech({
          text: targetText,
          targetLanguageCode: langMode,
          speaker: selectedSpeaker,
          pace: pace,
          pitch: pitch,
        });

        if (result.audioUrl) {
          setAudioUrl(result.audioUrl);

          // Add to TTS history
          const newSession: TTSSession = {
            id: `tts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            text: targetText,
            languageCode: langMode,
            speaker: selectedSpeaker,
            audioUrl: result.audioUrl,
            createdAt: Date.now(),
            charCount: targetText.length,
          };
          setTtsHistory((prev) => [newSession, ...prev.slice(0, 19)]);

          if (autoPlay) {
            const audio = new Audio(result.audioUrl);
            audioRef.current = audio;
            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => setIsPlaying(false);
            await audio.play();
          }
        } else if (result.isFallback) {
          // Native browser synthesis handled
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), Math.max(2000, targetText.length * 70));
        }

        return result.audioUrl;
      } catch (err: any) {
        const msg = err.message || 'Failed to generate voice speech. Please verify your API key or network connection.';
        setError(msg);
        console.error('TTS generation error:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [inputText, selectedSpeaker, pace, pitch]
  );

  const playAudio = useCallback((urlToPlay?: string) => {
    const url = urlToPlay || audioUrl;
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch((e) => console.warn('Audio play error:', e));
  }, [audioUrl]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  const downloadAudio = useCallback((filename = 'sarvam_voice.wav') => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [audioUrl]);

  const clearHistory = useCallback(() => {
    setTtsHistory([]);
    try {
      localStorage.removeItem('tva_tts_history');
    } catch {}
  }, []);

  return {
    inputText,
    setInputText,
    selectedSpeaker,
    setSelectedSpeaker,
    pace,
    setPace,
    pitch,
    setPitch,
    isGenerating,
    isPlaying,
    audioUrl,
    error,
    setError,
    ttsHistory,
    generateSpeech,
    playAudio,
    pauseAudio,
    downloadAudio,
    clearHistory,
  };
}
