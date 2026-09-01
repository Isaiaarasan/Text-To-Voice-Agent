import React, { useState } from 'react';
import { Download, Copy, Check, FileText, FileDown } from 'lucide-react';
import { exportToMarkdown, exportToDocx, exportToPDF, copyToClipboard } from '../../utils/export';

interface ExportBarProps {
  content: string;
  filename?: string;
  disabled?: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  content,
  filename = 'transcript',
  disabled = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const hasContent = content.trim().length > 0;
  const isActionDisabled = disabled || !hasContent;

  const handleCopy = async () => {
    if (isActionDisabled) return;
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportMd = () => {
    if (isActionDisabled) return;
    setIsExporting('md');
    exportToMarkdown(content, filename);
    setTimeout(() => setIsExporting(null), 1000);
  };

  const handleExportDocx = async () => {
    if (isActionDisabled) return;
    setIsExporting('docx');
    await exportToDocx(content, filename);
    setIsExporting(null);
  };

  const handleExportPdf = async () => {
    if (isActionDisabled) return;
    setIsExporting('pdf');
    await exportToPDF('rendered-markdown-content', filename);
    setIsExporting(null);
  };

  return (
    <div className="w-full p-3 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          Export &amp; Share
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={isActionDisabled}
          className="btn-secondary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          title="Copy Markdown to Clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Markdown export */}
        <button
          type="button"
          onClick={handleExportMd}
          disabled={isActionDisabled || isExporting === 'md'}
          className="btn-secondary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          title="Download as Markdown file"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          <span>.MD</span>
        </button>

        {/* Word docx export */}
        <button
          type="button"
          onClick={handleExportDocx}
          disabled={isActionDisabled || isExporting === 'docx'}
          className="btn-secondary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          title="Download as Word DOCX document"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-500" />
          <span>.DOCX</span>
        </button>

        {/* PDF export */}
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isActionDisabled || isExporting === 'pdf'}
          className="btn-secondary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          title="Export as PDF document"
        >
          <FileDown className="w-3.5 h-3.5 text-rose-500" />
          <span>.PDF</span>
        </button>
      </div>
    </div>
  );
};
