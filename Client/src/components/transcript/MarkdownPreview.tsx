import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Eye } from 'lucide-react';
import { copyToClipboard } from '../../utils/export';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!content) return;
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-xl">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </span>
        </div>

        {content.trim() && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition"
            title="Copy rendered markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Rendered Preview Body */}
      <div
        id="rendered-markdown-content"
        className="flex-1 p-5 overflow-y-auto max-h-[500px] min-h-[260px] markdown-body selection:bg-indigo-500 selection:text-white"
      >
        {content.trim() ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-3 rounded-xl border border-black/10 dark:border-white/10">
                  <table className="min-w-full divide-y divide-black/10 dark:divide-white/10" {...props} />
                </div>
              ),
              pre: ({ ...props }) => (
                <div className="relative group my-3">
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 overflow-x-auto font-mono text-xs border border-slate-800" {...props} />
                </div>
              ),
              a: ({ ...props }) => (
                <a className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <Eye className="w-6 h-6 opacity-30" />
            <p className="text-xs font-medium">Rendered Markdown output will appear here</p>
            <p className="text-[11px] opacity-70">Dictate, type, or speak into the microphone</p>
          </div>
        )}
      </div>
    </div>
  );
};
