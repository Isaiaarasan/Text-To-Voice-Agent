import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X, ArrowRight } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  onTranscribe: () => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

const SUPPORTED_FORMATS = ['WAV', 'MP3', 'AAC', 'OGG', 'OPUS', 'FLAC', 'WebM', 'M4A'];

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  isLoading,
  onTranscribe,
  selectedFile,
  onClearFile,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i)) {
        onFileSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-200 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
              : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-600'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>

          <p className="text-xs font-semibold text-foreground mb-0.5">
            Drag & drop audio file, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
          </p>
          <p className="text-[10px] text-muted-foreground mb-3">
            Supports files up to 25MB (Auto short/batch transcribing)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1 max-w-xs">
            {SUPPORTED_FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/5 dark:bg-white/5 text-muted-foreground"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FileAudio className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearFile}
              disabled={isLoading}
              className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onTranscribe}
            disabled={isLoading}
            className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <span>Transcribe Audio File</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
