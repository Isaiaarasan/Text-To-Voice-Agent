import React from 'react';
import { Globe } from 'lucide-react';
import type { LanguageMode, LanguageOption } from '../../types';

interface LanguageToggleProps {
  selectedMode: LanguageMode;
  onSelectMode: (mode: LanguageMode) => void;
  disabled?: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'codemix',
    label: 'Tanglish / Auto',
    subLabel: 'Code-Mixed Tamil + English',
    badge: 'Recommended',
  },
  {
    id: 'ta-IN',
    label: 'தமிழ் (Tamil)',
    subLabel: 'Pure Tamil Script',
    badge: 'ta-IN',
  },
  {
    id: 'en-IN',
    label: 'English',
    subLabel: 'Indian English Dictation',
    badge: 'en-IN',
  },
];

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2.5">
        <Globe className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Target Language Mode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-muted/60 dark:bg-muted/40 rounded-2xl border border-border/60 backdrop-blur-md">
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = selectedMode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(option.id)}
              className={`relative flex flex-col items-start px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-sm font-semibold">{option.label}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                {option.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
