import { useState, useEffect } from 'react';
import type { TranscriptSession, LanguageMode } from '../types';

const STORAGE_KEY = 'tva_transcript_history';

export function useTranscriptHistory() {
  const [history, setHistory] = useState<TranscriptSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save transcript history to localStorage:', e);
    }
  }, [history]);

  const saveSession = (
    text: string,
    languageMode: LanguageMode,
    durationSeconds: number = 0
  ): TranscriptSession | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    // Generate descriptive title from first line or words
    const firstLine = trimmed.split('\n')[0].replace(/^[#\-*\d.]+\s*/, '').trim();
    const title = firstLine.length > 40 ? `${firstLine.slice(0, 37)}...` : firstLine || 'Voice Note';
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    const newSession: TranscriptSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      text: trimmed,
      languageMode,
      createdAt: Date.now(),
      wordCount,
      durationSeconds,
    };

    setHistory((prev) => [newSession, ...prev]);
    return newSession;
  };

  const deleteSession = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    saveSession,
    deleteSession,
    clearHistory,
  };
}
