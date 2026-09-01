import axios from 'axios';
import { getSarvamApiKey } from './sarvamApi';
import type { TTSRequestParams, TTSSpeakerOption } from '../types';

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

export const TTS_SPEAKERS: TTSSpeakerOption[] = [
  { id: 'meera', name: 'Meera', gender: 'female', recommendedFor: 'English & Tanglish', description: 'Clear, modern & natural' },
  { id: 'anushka', name: 'Anushka', gender: 'female', recommendedFor: 'Tamil (தமிழ்)', description: 'Melodious, expressive Indian tone' },
  { id: 'pavithra', name: 'Pavithra', gender: 'female', recommendedFor: 'Tamil & General', description: 'Warm, soft & articulate' },
  { id: 'arvind', name: 'Arvind', gender: 'male', recommendedFor: 'English & Tamil', description: 'Deep, professional & crisp' },
  { id: 'amartya', name: 'Amartya', gender: 'male', recommendedFor: 'Narration', description: 'Authoritative, clear broadcast voice' },
  { id: 'diya', name: 'Diya', gender: 'female', recommendedFor: 'Casual / Assistant', description: 'Energetic, cheerful & friendly' },
  { id: 'arun', name: 'Arun', gender: 'male', recommendedFor: 'Tamil / English', description: 'Natural conversational pace' },
  { id: 'roopa', name: 'Roopa', gender: 'female', recommendedFor: 'Tamil & Southern', description: 'Smooth, calm & composed' },
  { id: 'chitresh', name: 'Chitresh', gender: 'male', recommendedFor: 'General Voice', description: 'Dynamic and clear diction' },
];

/**
 * Converts base64 string to a Blob URL suitable for HTML5 audio
 */
export function base64ToAudioUrl(base64Data: string, mimeType: string = 'audio/wav'): string {
  // Clean base64 if it has header
  const cleanBase64 = base64Data.replace(/^data:audio\/\w+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Converts text to voice using Sarvam AI Bulbul:v1 model
 */
export async function convertTextToSpeech({
  text,
  targetLanguageCode,
  speaker = 'meera',
  pace = 1.0,
  pitch = 0,
  loudness = 1.5,
  speechSampleRate = 22050,
  model = 'bulbul:v1',
  apiKey,
}: TTSRequestParams): Promise<{ audioUrl: string; base64Audio: string; isFallback?: boolean }> {
  const activeKey = apiKey || getSarvamApiKey();

  if (!text.trim()) {
    throw new Error('Please enter text to convert to voice.');
  }

  // Resolve language code
  let langCode = targetLanguageCode;
  if (langCode === 'codemix') {
    langCode = 'en-IN'; // Sarvam TTS expects valid ISO code like en-IN or ta-IN
  }

  // If no API key is provided, provide graceful Web Speech API fallback
  if (!activeKey) {
    return playBrowserFallbackTTS(text, langCode);
  }

  const payload = {
    inputs: [text.trim()],
    target_language_code: langCode,
    speaker: speaker,
    pitch: pitch,
    pace: pace,
    loudness: loudness,
    speech_sample_rate: speechSampleRate,
    enable_preprocessing: true,
    model: model,
  };

  try {
    const response = await axios.post(SARVAM_TTS_URL, payload, {
      headers: {
        'api-subscription-key': activeKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (response.data?.audios && response.data.audios.length > 0) {
      const base64Audio = response.data.audios[0];
      const audioUrl = base64ToAudioUrl(base64Audio, 'audio/wav');
      return { audioUrl, base64Audio, isFallback: false };
    }

    throw new Error('No audio returned by Sarvam TTS.');
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorDetail =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.statusText;
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Invalid or expired Sarvam API Key. Please verify your key in settings.');
        }
        if (error.response.status === 400) {
          throw new Error(`Sarvam TTS error: ${errorDetail || 'Check input text and language code.'}`);
        }
        throw new Error(`Sarvam TTS (${error.response.status}): ${errorDetail}`);
      }
    }
    throw error;
  }
}

/**
 * Fallback browser speech synthesis when no API key is available
 */
export async function playBrowserFallbackTTS(text: string, langCode: string): Promise<{ audioUrl: string; base64Audio: string; isFallback: boolean }> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Sarvam API key is required and browser SpeechSynthesis is not supported.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'ta-IN' ? 'ta-IN' : 'en-US';
    utterance.rate = 1.0;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      // Done speaking
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    // Return empty url since it is synthesized natively
    resolve({
      audioUrl: '',
      base64Audio: '',
      isFallback: true,
    });
  });
}
