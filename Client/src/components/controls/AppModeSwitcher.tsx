import React from 'react';
import { Volume2, Mic, Layers, Sparkles } from 'lucide-react';
import type { AppMode } from '../../types';

interface AppModeSwitcherProps {
  currentMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  disabled?: boolean;
}

export const AppModeSwitcher: React.FC<AppModeSwitcherProps> = ({
  currentMode,
  onChangeMode,
  disabled = false,
}) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="inline-flex p-1.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-border/80 shadow-md backdrop-blur-2xl">
        {/* Dual Mode */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('dual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            currentMode === 'dual'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Both (Dual Studio)</span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
            TTS + STT
          </span>
        </button>

        {/* Text to Voice Mode */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('tts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            currentMode === 'tts'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Text to Voice</span>
        </button>

        {/* Voice to Text Mode */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('stt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
            currentMode === 'stt'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice to Text</span>
          <Sparkles className="w-3 h-3 text-amber-300 hidden sm:inline" />
        </button>
      </div>
    </div>
  );
};
