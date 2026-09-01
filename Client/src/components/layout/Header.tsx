import React from 'react';
import { Sparkles, Moon, Sun, History, Key, HelpCircle, AudioWaveform, Globe } from 'lucide-react';
import type { AppMode, LanguageMode } from '../../types';

interface HeaderProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenApiKeyModal: () => void;
  onOpenVoiceCommandsModal: () => void;
  historyCount: number;
  hasApiKey: boolean;
  appMode: AppMode;
  onChangeAppMode: (mode: AppMode) => void;
  languageMode: LanguageMode;
  onChangeLanguageMode: (mode: LanguageMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleDarkMode,
  onOpenHistory,
  onOpenApiKeyModal,
  onOpenVoiceCommandsModal,
  historyCount,
  hasApiKey,
  appMode,
  onChangeAppMode,
  languageMode,
  onChangeLanguageMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/60 dark:ring-white/10">
            <AudioWaveform className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground font-display flex items-center gap-1.5">
                Voice AI Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                TTS & STT
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden md:block">
              Sarvam AI Bulbul:v1 & Saaras:v3 • Tamil • Tanglish • English
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md flex items-center gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => onChangeAppMode('dual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                appMode === 'dual'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dual Studio
            </button>
            <button
              type="button"
              onClick={() => onChangeAppMode('tts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                appMode === 'tts'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Text to Voice
            </button>
            <button
              type="button"
              onClick={() => onChangeAppMode('stt')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                appMode === 'stt'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Voice to Text
            </button>
          </div>
        </div>

        {/* Right: Actions, Language Quick Toggle & Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Language Segmented Selector */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-xs">
            <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => onChangeLanguageMode('codemix')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                languageMode === 'codemix'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tanglish
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguageMode('ta-IN')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                languageMode === 'ta-IN'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguageMode('en-IN')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                languageMode === 'en-IN'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
          </div>

          {/* Voice Commands Guide Modal Trigger */}
          <button
            type="button"
            onClick={onOpenVoiceCommandsModal}
            className="btn-icon text-muted-foreground hover:text-foreground"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* API Key settings */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="btn-icon relative text-muted-foreground hover:text-foreground"
            title="API Key Configuration"
          >
            <Key className="w-5 h-5" />
            {hasApiKey && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Transcripts History Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="btn-icon relative text-muted-foreground hover:text-foreground"
            title="Saved Transcripts History"
          >
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-sm">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="btn-icon text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="flex md:hidden px-4 pb-3 pt-1 justify-center border-t border-black/5 dark:border-white/5">
        <div className="w-full max-w-sm p-1 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between gap-1 text-xs">
          <button
            type="button"
            onClick={() => onChangeAppMode('dual')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              appMode === 'dual'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Dual
          </button>
          <button
            type="button"
            onClick={() => onChangeAppMode('tts')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              appMode === 'tts'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            TTS
          </button>
          <button
            type="button"
            onClick={() => onChangeAppMode('stt')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              appMode === 'stt'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            STT
          </button>
        </div>
      </div>
    </header>
  );
};
