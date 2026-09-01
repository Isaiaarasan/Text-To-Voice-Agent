import React, { useState } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  ArrowRightLeft,
  Trash2,
  Music,
  CheckCircle2
} from 'lucide-react';
import type { LanguageMode, TTSSpeaker } from '../../types';
import { TTS_SPEAKERS } from '../../services/sarvamTTS';

interface TTSPanelProps {
  languageMode: LanguageMode;
  inputText: string;
  onChangeInputText: (text: string) => void;
  selectedSpeaker: TTSSpeaker;
  onChangeSpeaker: (speaker: TTSSpeaker) => void;
  pace: number;
  onChangePace: (pace: number) => void;
  pitch: number;
  onChangePitch: (pitch: number) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  error: string | null;
  onGenerate: (text?: string) => Promise<string | null>;
  onPlay: (url?: string) => void;
  onPause: () => void;
  onDownload: () => void;
  ttsHistory: Array<{
    id: string;
    text: string;
    speaker: TTSSpeaker;
    audioUrl: string;
    createdAt: number;
    charCount: number;
  }>;
  onClearHistory: () => void;
  onSendToTranscript?: (text: string) => void;
}

const SAMPLES = [
  {
    tag: 'English',
    text: 'Welcome to Voice AI Studio! Experience crystal-clear speech synthesis powered by Sarvam AI.',
  },
  {
    tag: 'Tanglish',
    text: 'Vanakkam! Indha application la Voice to Text and Text to Voice rendu features-ume romba smooth-aa work aagudhu.',
  },
  {
    tag: 'Tamil',
    text: 'வணக்கம்! செயற்கை நுண்ணறிவு மூலம் உருவாக்கப்பட்ட உயர்ரக குரல் சேவையை நீங்கள் இப்போது கேட்கிறீர்கள்.',
  },
];

export const TTSPanel: React.FC<TTSPanelProps> = ({
  languageMode,
  inputText,
  onChangeInputText,
  selectedSpeaker,
  onChangeSpeaker,
  pace,
  onChangePace,
  pitch,
  onChangePitch,
  isGenerating,
  isPlaying,
  audioUrl,
  error,
  onGenerate,
  onPlay,
  onPause,
  onDownload,
  ttsHistory,
  onClearHistory,
  onSendToTranscript,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxChars = 500;
  const charsRemaining = maxChars - inputText.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display">
              Text to Voice
            </h2>
            <p className="text-xs text-muted-foreground">
              Natural Indian AI speech generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 uppercase">
            {languageMode === 'codemix' ? 'Tanglish' : languageMode === 'ta-IN' ? 'Tamil' : 'English'}
          </span>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
              showSettings ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : ''
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tune</span>
          </button>
        </div>
      </div>

      {/* Voice Tune Drawer (Expandable) */}
      {showSettings && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-foreground">Speed Rate (Pace)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{pace.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={pace}
              onChange={(e) => onChangePace(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Fast)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-foreground">Pitch</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{pitch >= 0 ? `+${pitch.toFixed(1)}` : pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.05"
              value={pitch}
              onChange={(e) => onChangePitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span>Neutral</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}

      {/* Voice Artist Selection Cards */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-foreground">
          Voice Artist
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TTS_SPEAKERS.slice(0, 6).map((speaker) => {
            const isSelected = selectedSpeaker === speaker.id;
            return (
              <button
                key={speaker.id}
                type="button"
                onClick={() => onChangeSpeaker(speaker.id)}
                className={`relative p-3 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between gap-1.5 border ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        speaker.gender === 'female'
                          ? 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {speaker.name[0]}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'}`}>
                      {speaker.name}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="text-[10px] text-muted-foreground truncate">
                  {speaker.recommendedFor}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Text Input Area */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Text to Convert
          </span>
          <span
            className={`text-xs font-mono font-medium ${
              isOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground'
            }`}
          >
            {inputText.length} / {maxChars}
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => onChangeInputText(e.target.value)}
            placeholder="Type or paste the text you want the voice agent to speak..."
            className="w-full glass-input p-4 text-sm resize-none leading-relaxed text-foreground placeholder:text-muted-foreground/60 border border-black/10 dark:border-white/10 rounded-2xl focus:border-indigo-500 transition-all font-sans"
          />

          {/* Quick Clear / Copy buttons */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            {inputText && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition"
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeInputText('')}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-destructive transition"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="text-[11px] text-muted-foreground font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
          </span>
          {SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeInputText(sample.text)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-foreground border border-black/5 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-2xs"
            >
              {sample.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Generate / Speak Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => onGenerate()}
          disabled={isGenerating || !inputText.trim() || isOverLimit}
          className="btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Voice...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Speak Text</span>
            </>
          )}
        </button>

        {/* Audio Player Controls */}
        {audioUrl && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isPlaying ? onPause : () => onPlay()}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
              }`}
              title={isPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="btn-secondary h-11 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
              title="Download Audio WAV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download .WAV</span>
            </button>

            {onSendToTranscript && (
              <button
                type="button"
                onClick={() => onSendToTranscript(inputText)}
                className="btn-secondary h-11 px-3 rounded-xl flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400"
                title="Send text to Transcript editor"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">To STT</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recent Voice Clips Playlist */}
      {ttsHistory.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-500" />
              Recent Clips ({ttsHistory.length})
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[10px] text-muted-foreground hover:text-destructive transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {ttsHistory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/8 transition flex items-center justify-between gap-2 text-xs"
              >
                <p className="truncate text-foreground font-medium text-[11px] flex-1">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold capitalize">
                    {item.speaker}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPlay(item.audioUrl)}
                    className="w-6 h-6 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white flex items-center justify-center transition"
                  >
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
