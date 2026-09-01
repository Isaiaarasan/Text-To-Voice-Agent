import React from 'react';
import { Mic, Square, Pause, Play, RefreshCw, Send, Radio } from 'lucide-react';
import type { RecordingState } from '../../types';
import { WaveformVisualizer } from './WaveformVisualizer';

interface RecorderProps {
  recordingState: RecordingState;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  analyserNode: AnalyserNode | null;
  isStreaming: boolean;
  streamingStatus: 'connecting' | 'listening' | 'closed';
  isLoading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onResetRecording: () => void;
  onTranscribe: () => void;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  isStreamingMode: boolean;
}

export const Recorder: React.FC<RecorderProps> = ({
  recordingState,
  duration,
  audioBlob,
  audioUrl,
  analyserNode,
  isStreaming,
  streamingStatus,
  isLoading,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onResetRecording,
  onTranscribe,
  onStartStreaming,
  onStopStreaming,
  isStreamingMode,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isBatchMode = duration > 30;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMainButtonClick = () => {
    if (isStreamingMode) {
      if (isStreaming) {
        onStopStreaming();
      } else {
        onStartStreaming();
      }
    } else {
      if (isRecording) {
        onStopRecording();
      } else if (isPaused) {
        onResumeRecording();
      } else {
        onStartRecording();
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Waveform Visualizer Bar */}
      <WaveformVisualizer
        analyserNode={analyserNode}
        isRecording={isRecording || (isStreaming && streamingStatus === 'listening')}
        durationSeconds={duration}
      />

      {/* Status & Timer Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 font-mono text-xs font-semibold text-foreground">
          <span
            className={`w-2 h-2 rounded-full ${
              isRecording || isStreaming
                ? 'bg-red-500 animate-ping'
                : isPaused
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span>{formatTime(duration)}</span>
        </div>

        {isBatchMode && !isStreamingMode && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Batch Mode (&gt;30s)
          </span>
        )}

        {isStreaming && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Radio className="w-3 h-3 animate-pulse text-indigo-600" />
            {streamingStatus === 'connecting' ? 'Connecting...' : 'Live Stream'}
          </span>
        )}
      </div>

      {/* Recording Control Hub */}
      <div className="flex items-center justify-center gap-4 pt-1">
        {/* Left Action: Pause / Resume / Reset */}
        {!isStreamingMode && (isRecording || isPaused) ? (
          <button
            type="button"
            onClick={isPaused ? onResumeRecording : onPauseRecording}
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground border border-black/5 dark:border-white/10 transition active:scale-95 shadow-xs"
            title={isPaused ? 'Resume Recording' : 'Pause Recording'}
          >
            {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
          </button>
        ) : audioBlob && !isRecording && !isStreaming ? (
          <button
            type="button"
            onClick={onResetRecording}
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground border border-black/5 dark:border-white/10 transition active:scale-95 shadow-xs"
            title="Reset Recording"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}

        {/* Central Mic / Stop Orb */}
        <div className="relative flex items-center justify-center">
          {(isRecording || isStreaming) && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping -z-10" />
          )}

          <button
            type="button"
            onClick={handleMainButtonClick}
            disabled={isLoading}
            className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl ${
              isRecording || isStreaming
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white ring-4 ring-red-500/30 hover:scale-105'
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white ring-4 ring-indigo-500/20 hover:ring-indigo-500/40 hover:scale-105 shadow-indigo-500/30'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isRecording || isStreaming ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording || isStreaming ? (
              <Square className="w-6 h-6 fill-white" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Right Action: Send to Transcribe */}
        {!isStreamingMode && audioBlob && !isRecording ? (
          <button
            type="button"
            onClick={onTranscribe}
            disabled={isLoading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50"
            title="Transcribe Audio"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}
      </div>

      {/* Audio Playback preview */}
      {audioUrl && !isRecording && !isStreaming && (
        <div className="w-full max-w-sm mt-1">
          <audio
            controls
            src={audioUrl}
            className="w-full h-8 rounded-lg opacity-90 hover:opacity-100 transition"
          />
        </div>
      )}
    </div>
  );
};
