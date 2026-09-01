import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import type { STTProgress } from '../../types';

interface StatusBarProps {
  isLoading: boolean;
  progress: STTProgress;
  error: string | null;
  onRetry?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isLoading,
  progress,
  error,
  onRetry,
}) => {
  if (!isLoading && !error && progress.status === 'idle') {
    return null;
  }

  return (
    <div className="w-full transition-all duration-200">
      {/* Loading & Progress State */}
      {isLoading && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                {progress.message || 'Processing audio with Sarvam AI...'}
              </span>
            </div>
            {progress.percent !== undefined && (
              <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                {progress.percent}%
              </span>
            )}
          </div>

          {/* Animated Progress Bar */}
          {progress.percent !== undefined && (
            <div className="w-full h-1.5 bg-indigo-200/60 dark:bg-indigo-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">{error}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                Check that your Sarvam AI API key is valid and has STT credits.
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Success Notification */}
      {!isLoading && !error && progress.status === 'completed' && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold">Transcription complete!</span>
        </div>
      )}
    </div>
  );
};
