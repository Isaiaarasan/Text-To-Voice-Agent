import React, { useState } from 'react';
import { Edit3, Eye, Columns } from 'lucide-react';
import { TranscriptEditor } from './TranscriptEditor';
import { MarkdownPreview } from './MarkdownPreview';

interface TranscriptPanelProps {
  transcript: string;
  interimTranscript?: string;
  onTranscriptChange: (value: string) => void;
  onClear: () => void;
  onSaveToHistory: () => void;
  isLoading: boolean;
  onSendToTTS?: (text: string) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  interimTranscript,
  onTranscriptChange,
  onClear,
  onSaveToHistory,
  isLoading,
  onSendToTTS,
}) => {
  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');

  return (
    <div className="w-full flex flex-col gap-3">
      {/* View Switcher Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            Transcript &amp; Output
          </span>
          {transcript.trim() && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
              {transcript.trim().split(/\s+/).length} words
            </span>
          )}
        </div>

        {/* View Switcher Pills */}
        <div className="p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              activeTab === 'split'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Panels Layout */}
      {/* Mobile: Tabbed */}
      <div className="block sm:hidden">
        {activeTab === 'preview' ? (
          <MarkdownPreview content={transcript} />
        ) : (
          <TranscriptEditor
            value={transcript}
            interimValue={interimTranscript}
            onChange={onTranscriptChange}
            onClear={onClear}
            onSaveToHistory={onSaveToHistory}
            isLoading={isLoading}
            onSendToTTS={onSendToTTS}
          />
        )}
      </div>

      {/* Desktop / Tablet */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'split' ? (
          <>
            <TranscriptEditor
              value={transcript}
              interimValue={interimTranscript}
              onChange={onTranscriptChange}
              onClear={onClear}
              onSaveToHistory={onSaveToHistory}
              isLoading={isLoading}
              onSendToTTS={onSendToTTS}
            />
            <MarkdownPreview content={transcript} />
          </>
        ) : activeTab === 'edit' ? (
          <div className="col-span-2">
            <TranscriptEditor
              value={transcript}
              interimValue={interimTranscript}
              onChange={onTranscriptChange}
              onClear={onClear}
              onSaveToHistory={onSaveToHistory}
              isLoading={isLoading}
              onSendToTTS={onSendToTTS}
            />
          </div>
        ) : (
          <div className="col-span-2">
            <MarkdownPreview content={transcript} />
          </div>
        )}
      </div>
    </div>
  );
};
