import React from 'react';
import { Mic, Upload, Radio, Sparkles } from 'lucide-react';
import type { InputMode } from '../../types';

interface ModeSelectorProps {
  inputMode: InputMode;
  onChangeInputMode: (mode: InputMode) => void;
  isStreamingMode: boolean;
  onToggleStreamingMode: () => void;
  enableVoiceCommands: boolean;
  onToggleVoiceCommands: () => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  inputMode,
  onChangeInputMode,
  isStreamingMode,
  onToggleStreamingMode,
  enableVoiceCommands,
  onToggleVoiceCommands,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
      {/* Input Mode Tabs: Mic vs Upload */}
      <div className="p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeInputMode('record')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            inputMode === 'record'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Microphone</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeInputMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            inputMode === 'upload'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Feature toggles */}
      <div className="flex items-center gap-1.5">
        {/* Realtime Streaming Toggle */}
        {inputMode === 'record' && (
          <button
            type="button"
            disabled={disabled}
            onClick={onToggleStreamingMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
              isStreamingMode
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
                : 'bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground hover:text-foreground'
            }`}
            title="Live streaming transcription via WebSocket"
          >
            <Radio className={`w-3 h-3 ${isStreamingMode ? 'text-indigo-600 animate-pulse' : 'text-muted-foreground'}`} />
            <span>Live Stream</span>
          </button>
        )}

        {/* Voice Commands Toggle */}
        <button
          type="button"
          disabled={disabled}
          onClick={onToggleVoiceCommands}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            enableVoiceCommands
              ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold shadow-2xs'
              : 'bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground hover:text-foreground'
          }`}
          title="Auto-format spoken commands ('heading 1', 'bullet point', 'bold that') into Markdown"
        >
          <Sparkles className={`w-3 h-3 ${enableVoiceCommands ? 'text-purple-600' : 'text-muted-foreground'}`} />
          <span>Voice Commands</span>
        </button>
      </div>
    </div>
  );
};
