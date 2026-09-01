export type AppMode = 'dual' | 'tts' | 'stt';

export type LanguageMode = 'codemix' | 'ta-IN' | 'en-IN';

export interface LanguageOption {
  id: LanguageMode;
  label: string;
  subLabel: string;
  badge: string;
}

export type InputMode = 'record' | 'upload';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export interface TranscriptSession {
  id: string;
  title: string;
  text: string;
  languageMode: LanguageMode;
  createdAt: number;
  wordCount: number;
  durationSeconds: number;
}

export interface VoiceCommandRule {
  trigger: RegExp;
  replacement: string | ((match: string, p1?: string) => string);
  description: string;
  example: string;
}

export interface STTOptions {
  languageCode?: string;
  mode?: string;
  model?: string;
  apiKey?: string;
}

export interface STTProgress {
  status: 'idle' | 'uploading' | 'transcribing' | 'completed' | 'error';
  message: string;
  percent?: number;
}

// Text to Speech (TTS) Types
export type TTSSpeaker =
  | 'meera'
  | 'pavithra'
  | 'maithili'
  | 'arvind'
  | 'amartya'
  | 'diya'
  | 'anushka'
  | 'chitresh'
  | 'lalith'
  | 'arun'
  | 'roopa';

export interface TTSSpeakerOption {
  id: TTSSpeaker;
  name: string;
  gender: 'female' | 'male';
  recommendedFor?: string;
  description: string;
}

export interface TTSRequestParams {
  text: string;
  targetLanguageCode: string;
  speaker?: TTSSpeaker;
  pace?: number;
  pitch?: number;
  loudness?: number;
  speechSampleRate?: 8000 | 16000 | 22050;
  model?: string;
  apiKey?: string;
}

export interface TTSResponse {
  audios: string[]; // Base64 audio strings
}

export interface TTSSession {
  id: string;
  text: string;
  languageCode: string;
  speaker: TTSSpeaker;
  audioUrl: string;
  createdAt: number;
  charCount: number;
}
