import axios from 'axios';
import type { LanguageMode } from '../types';

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';
const SARVAM_BATCH_URL = 'https://api.sarvam.ai/speech-to-text/batch';

/**
 * Gets the active API key either from user settings/localStorage or Vite environment
 */
export function getSarvamApiKey(): string {
  const customKey = localStorage.getItem('tva_custom_sarvam_key');
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return (import.meta.env.VITE_SARVAM_API_KEY || '').trim();
}

/**
 * Sets a custom Sarvam API key in localStorage
 */
export function setCustomSarvamApiKey(key: string): void {
  if (key) {
    localStorage.setItem('tva_custom_sarvam_key', key.trim());
  } else {
    localStorage.removeItem('tva_custom_sarvam_key');
  }
}

export interface SarvamTranscribeParams {
  audioBlob: Blob;
  languageMode: LanguageMode;
  apiKey?: string;
  onProgress?: (progress: number) => void;
}

export interface SarvamResponse {
  transcript: string;
  language_code?: string;
  timestamps?: Array<{ word: string; start: number; end: number }>;
}

/**
 * Transcribes short audio (<=30s) via synchronous REST endpoint
 */
export async function transcribeShortAudio({
  audioBlob,
  languageMode,
  apiKey,
  onProgress,
}: SarvamTranscribeParams): Promise<SarvamResponse> {
  const activeKey = apiKey || getSarvamApiKey();

  if (!activeKey) {
    throw new Error('Sarvam API key is missing. Please add VITE_SARVAM_API_KEY in .env or set it in the API Key settings modal.');
  }

  // Determine file format & filename from blob type
  let filename = 'recording.webm';
  if (audioBlob.type.includes('wav')) filename = 'recording.wav';
  else if (audioBlob.type.includes('mp3')) filename = 'recording.mp3';
  else if (audioBlob.type.includes('ogg')) filename = 'recording.ogg';

  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('model', 'saaras:v3');

  // Configure Sarvam mode & language_code according to specification:
  // - codemix: for Tanglish (keeps natural code-mixed Tamil/English)
  // - ta-IN: transcribe mode pinned to Tamil
  // - en-IN: transcribe mode pinned to English
  if (languageMode === 'codemix') {
    formData.append('mode', 'codemix');
    formData.append('language_code', 'unknown'); // or let auto-detect codemix
  } else if (languageMode === 'ta-IN') {
    formData.append('mode', 'transcribe');
    formData.append('language_code', 'ta-IN');
  } else if (languageMode === 'en-IN') {
    formData.append('mode', 'transcribe');
    formData.append('language_code', 'en-IN');
  }

  try {
    const response = await axios.post<SarvamResponse>(SARVAM_STT_URL, formData, {
      headers: {
        'api-subscription-key': activeKey,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
      timeout: 45000,
    });

    if (response.data && typeof response.data.transcript === 'string') {
      return response.data;
    }

    throw new Error('Invalid response format received from Sarvam API.');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorDetail = error.response.data?.message || error.response.data?.error || error.response.statusText;
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Invalid or expired Sarvam API Key. Please check your key in settings.');
        }
        if (error.response.status === 400) {
          throw new Error(`Sarvam STT bad request: ${errorDetail || 'Check audio format or duration.'}`);
        }
        throw new Error(`Sarvam STT Error (${error.response.status}): ${errorDetail}`);
      } else if (error.request) {
        throw new Error('Network error connecting to Sarvam AI. Please verify your internet connection.');
      }
    }
    throw new Error(error.message || 'An unexpected error occurred during transcription.');
  }
}

/**
 * Handles batch / long audio processing (>30s)
 */
export async function transcribeBatchAudio({
  audioBlob,
  languageMode,
  apiKey,
  onStatusUpdate,
}: SarvamTranscribeParams & { onStatusUpdate?: (status: string, percent?: number) => void }): Promise<SarvamResponse> {
  const activeKey = apiKey || getSarvamApiKey();

  if (!activeKey) {
    throw new Error('Sarvam API key is missing. Please configure it in settings.');
  }

  onStatusUpdate?.('Uploading audio file to Sarvam Batch...', 20);

  const formData = new FormData();
  formData.append('file', audioBlob, 'long_audio.wav');
  formData.append('model', 'saaras:v3');

  if (languageMode === 'codemix') {
    formData.append('mode', 'codemix');
  } else {
    formData.append('mode', 'transcribe');
    formData.append('language_code', languageMode);
  }

  try {
    // Attempt batch endpoint if available, fallback to short audio sync endpoint
    try {
      const initRes = await axios.post(SARVAM_BATCH_URL, formData, {
        headers: {
          'api-subscription-key': activeKey,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (initRes.data?.job_id) {
        const jobId = initRes.data.job_id;
        onStatusUpdate?.('Processing batch transcription...', 50);

        // Polling loop for batch completion
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          attempts++;
          onStatusUpdate?.(`Transcribing audio (Job ${jobId})...`, Math.min(50 + attempts * 2, 95));

          const statusRes = await axios.get(`${SARVAM_BATCH_URL}/${jobId}`, {
            headers: { 'api-subscription-key': activeKey },
          });

          if (statusRes.data?.status === 'completed' || statusRes.data?.transcript) {
            onStatusUpdate?.('Completed!', 100);
            return {
              transcript: statusRes.data.transcript || statusRes.data.results?.[0]?.transcript || '',
            };
          }

          if (statusRes.data?.status === 'failed') {
            throw new Error(`Batch processing failed: ${statusRes.data.error || 'Unknown error'}`);
          }
        }
      }
    } catch (batchErr: any) {
      // If batch endpoint is not enabled on standard plan or 404s, seamlessly fallback to REST STT
      console.warn('Batch endpoint fallback to standard endpoint:', batchErr.message);
    }

    // Direct STT call fallback
    onStatusUpdate?.('Transcribing via Sarvam Saaras:v3...', 60);
    const directResult = await transcribeShortAudio({
      audioBlob,
      languageMode,
      apiKey: activeKey,
      onProgress: (p) => onStatusUpdate?.('Uploading...', p),
    });

    onStatusUpdate?.('Transcription completed!', 100);
    return directResult;
  } catch (error: any) {
    throw error;
  }
}
