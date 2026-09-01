import React, { useRef } from 'react';
import { Trash2, BookmarkPlus, Sparkles, Volume2 } from 'lucide-react';

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSaveToHistory: () => void;
  isLoading: boolean;
  interimValue?: string;
  onSendToTTS?: (text: string) => void;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  value,
  onChange,
  onClear,
  onSaveToHistory,
  isLoading,
  interimValue,
  onSendToTTS,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = value;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Raw Editor
          </span>
          {isLoading && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 animate-pulse">
              Listening...
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {value.trim() && onSendToTTS && (
            <button
              type="button"
              onClick={() => onSendToTTS(value)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition"
              title="Speak transcript in Text-to-Voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speak</span>
            </button>
          )}

          {value.trim() && (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
              title="Save snapshot to History"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            disabled={!value && !interimValue}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-40"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formatting Quick-Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-black/2 dark:bg-white/2 border-b border-black/5 dark:border-white/5 overflow-x-auto text-[11px]">
        <span className="text-muted-foreground flex items-center gap-1 mr-1 text-[10px]">
          <Sparkles className="w-3 h-3 text-indigo-500" />
        </span>
        <button
          type="button"
          onClick={() => insertSnippet('\n# ')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n## ')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n- ')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground"
          title="Bullet"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n- [ ] ')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground"
          title="Task"
        >
          [ ] Task
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('**Bold**')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n```\n\n```')}
          className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-mono text-[10px]"
          title="Code"
        >
          &lt;/&gt;
        </button>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 min-h-[260px] flex flex-col">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Speak or dictate audio to generate formatted Markdown text here..."
          className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50"
        />

        {/* Realtime stream partial overlay */}
        {interimValue && (
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/60 font-mono text-xs text-indigo-600 dark:text-indigo-300 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
            <span className="truncate">{interimValue}</span>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 text-[11px] text-muted-foreground font-mono">
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  );
};
