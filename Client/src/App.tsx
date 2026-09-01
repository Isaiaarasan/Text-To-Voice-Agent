import { useState, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { ModeSelector } from './components/controls/ModeSelector';
import { Recorder } from './components/recorder/Recorder';
import { FileUpload } from './components/recorder/FileUpload';
import { TranscriptPanel } from './components/transcript/TranscriptPanel';
import { TTSPanel } from './components/tts/TTSPanel';
import { ExportBar } from './components/export/ExportBar';
import { HistorySidebar } from './components/history/HistorySidebar';
import { StatusBar } from './components/status/StatusBar';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { VoiceCommandsModal } from './components/modals/VoiceCommandsModal';

import { useDarkMode } from './hooks/useDarkMode';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { useSarvamSTT } from './hooks/useSarvamSTT';
import { useSarvamTTS } from './hooks/useSarvamTTS';
import { useTranscriptHistory } from './hooks/useTranscriptHistory';
import { getSarvamApiKey } from './services/sarvamApi';
import type { AppMode, LanguageMode, InputMode, TranscriptSession } from './types';

export default function App() {
  // Theme state
  const { isDark, toggleDarkMode } = useDarkMode();

  // App Studio Mode: 'dual' (both), 'tts' (text-to-voice), 'stt' (voice-to-text)
  const [appMode, setAppMode] = useState<AppMode>('dual');

  // Shared Language state
  const [languageMode, setLanguageMode] = useState<LanguageMode>('codemix');

  // STT Control states
  const [inputMode, setInputMode] = useState<InputMode>('record');
  const [isStreamingMode, setIsStreamingMode] = useState<boolean>(false);
  const [enableVoiceCommands, setEnableVoiceCommands] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modal / Drawer states
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isVoiceCommandsModalOpen, setIsVoiceCommandsModalOpen] = useState<boolean>(false);

  // Check if API key is configured
  const hasApiKey = useMemo(() => {
    return Boolean(getSarvamApiKey());
  }, [isApiKeyModalOpen]);

  // Media recorder hook
  const {
    recordingState,
    duration,
    audioBlob,
    audioUrl: recordedAudioUrl,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error: recordingError,
  } = useMediaRecorder();

  // Sarvam STT hook
  const {
    transcript,
    interimTranscript,
    setTranscript,
    isLoading: isSttLoading,
    progress,
    error: sttError,
    transcribeAudio,
    startStreaming,
    stopStreaming,
    isStreaming,
    streamingStatus,
    clearTranscript,
  } = useSarvamSTT();

  // Sarvam TTS hook
  const {
    inputText: ttsInputText,
    setInputText: setTtsInputText,
    selectedSpeaker,
    setSelectedSpeaker,
    pace,
    setPace,
    pitch,
    setPitch,
    isGenerating: isTtsGenerating,
    isPlaying: isTtsPlaying,
    audioUrl: ttsAudioUrl,
    error: ttsError,
    ttsHistory,
    generateSpeech,
    playAudio: playTtsAudio,
    pauseAudio: pauseTtsAudio,
    downloadAudio: downloadTtsAudio,
    clearHistory: clearTtsHistory,
  } = useSarvamTTS();

  // History hook
  const { history, saveSession, deleteSession, clearHistory } = useTranscriptHistory();

  // STT Handlers
  const handleTranscribeRecorded = async () => {
    if (!audioBlob) return;
    try {
      await transcribeAudio(audioBlob, duration, languageMode, enableVoiceCommands);
    } catch {}
  };

  const handleTranscribeFile = async () => {
    if (!selectedFile) return;
    try {
      const estimatedDuration = selectedFile.size > 2 * 1024 * 1024 ? 35 : 15;
      await transcribeAudio(selectedFile, estimatedDuration, languageMode, enableVoiceCommands);
    } catch {}
  };

  const handleStartStreaming = async () => {
    await startStreaming(languageMode);
  };

  const handleStopStreaming = () => {
    stopStreaming(enableVoiceCommands);
  };

  const handleSaveToHistory = () => {
    if (!transcript.trim()) return;
    saveSession(transcript, languageMode, duration);
  };

  const handleSelectHistorySession = (session: TranscriptSession) => {
    setTranscript(session.text);
    setLanguageMode(session.languageMode);
  };

  // Cross-panel flow: Send text from STT transcript to TTS input and speak
  const handleSendTranscriptToTTS = (text: string) => {
    setTtsInputText(text);
    if (appMode === 'stt') {
      setAppMode('tts');
    }
  };

  // Cross-panel flow: Send TTS text to STT transcript editor
  const handleSendTtsToTranscript = (text: string) => {
    setTranscript((prev) => (prev.trim() ? `${prev}\n\n${text}` : text));
    if (appMode === 'tts') {
      setAppMode('stt');
    }
  };

  const currentError = recordingError || sttError;

  return (
    <div className="min-h-screen flex flex-col hero-bg text-foreground transition-colors duration-200">
      {/* Sleek Navigation Bar */}
      <Header
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenVoiceCommandsModal={() => setIsVoiceCommandsModalOpen(true)}
        historyCount={history.length}
        hasApiKey={hasApiKey}
        appMode={appMode}
        onChangeAppMode={setAppMode}
        languageMode={languageMode}
        onChangeLanguageMode={setLanguageMode}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* DUAL MODE LAYOUT: Integrated side-by-side workspace */}
        {appMode === 'dual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 Cols): Text to Voice Studio */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <section className="glass-card p-5 sm:p-6 shadow-sm">
                <TTSPanel
                  languageMode={languageMode}
                  inputText={ttsInputText}
                  onChangeInputText={setTtsInputText}
                  selectedSpeaker={selectedSpeaker}
                  onChangeSpeaker={setSelectedSpeaker}
                  pace={pace}
                  onChangePace={setPace}
                  pitch={pitch}
                  onChangePitch={setPitch}
                  isGenerating={isTtsGenerating}
                  isPlaying={isTtsPlaying}
                  audioUrl={ttsAudioUrl}
                  error={ttsError}
                  onGenerate={() => generateSpeech(ttsInputText, languageMode)}
                  onPlay={playTtsAudio}
                  onPause={pauseTtsAudio}
                  onDownload={() => downloadTtsAudio(`sarvam_speech_${selectedSpeaker}.wav`)}
                  ttsHistory={ttsHistory}
                  onClearHistory={clearTtsHistory}
                  onSendToTranscript={handleSendTtsToTranscript}
                />
              </section>
            </div>

            {/* Right Column (7 Cols): Voice to Text Studio */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* STT Input Selector & Recording Box */}
              <section className="glass-card p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                <ModeSelector
                  inputMode={inputMode}
                  onChangeInputMode={setInputMode}
                  isStreamingMode={isStreamingMode}
                  onToggleStreamingMode={() => setIsStreamingMode((prev) => !prev)}
                  enableVoiceCommands={enableVoiceCommands}
                  onToggleVoiceCommands={() => setEnableVoiceCommands((prev) => !prev)}
                  disabled={recordingState === 'recording' || isStreaming || isSttLoading}
                />

                <div className="pt-2">
                  {inputMode === 'record' ? (
                    <Recorder
                      recordingState={recordingState}
                      duration={duration}
                      audioBlob={audioBlob}
                      audioUrl={recordedAudioUrl}
                      analyserNode={analyserNode}
                      isStreaming={isStreaming}
                      streamingStatus={streamingStatus}
                      isLoading={isSttLoading}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecording}
                      onPauseRecording={pauseRecording}
                      onResumeRecording={resumeRecording}
                      onResetRecording={resetRecording}
                      onTranscribe={handleTranscribeRecorded}
                      onStartStreaming={handleStartStreaming}
                      onStopStreaming={handleStopStreaming}
                      isStreamingMode={isStreamingMode}
                    />
                  ) : (
                    <FileUpload
                      selectedFile={selectedFile}
                      onFileSelected={(file) => setSelectedFile(file)}
                      onClearFile={() => setSelectedFile(null)}
                      isLoading={isSttLoading}
                      onTranscribe={handleTranscribeFile}
                    />
                  )}
                </div>
              </section>

              {/* Status & Progress indicator */}
              <StatusBar
                isLoading={isSttLoading}
                progress={progress}
                error={currentError}
                onRetry={inputMode === 'record' ? handleTranscribeRecorded : handleTranscribeFile}
              />

              {/* Transcripts Panel (Raw Editor & Live Markdown Preview) */}
              <section className="glass-card p-4 sm:p-5 shadow-sm">
                <TranscriptPanel
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  onTranscriptChange={setTranscript}
                  onClear={clearTranscript}
                  onSaveToHistory={handleSaveToHistory}
                  isLoading={isSttLoading}
                  onSendToTTS={handleSendTranscriptToTTS}
                />
              </section>

              {/* Export & Actions Toolbar */}
              <section>
                <ExportBar
                  content={transcript}
                  filename={`transcript_${new Date().toISOString().slice(0, 10)}`}
                  disabled={isSttLoading}
                />
              </section>
            </div>
          </div>
        )}

        {/* FOCUSED TEXT TO VOICE (TTS) MODE */}
        {appMode === 'tts' && (
          <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 animate-scale-in">
            <section className="glass-card p-6 sm:p-8 shadow-sm">
              <TTSPanel
                languageMode={languageMode}
                inputText={ttsInputText}
                onChangeInputText={setTtsInputText}
                selectedSpeaker={selectedSpeaker}
                onChangeSpeaker={setSelectedSpeaker}
                pace={pace}
                onChangePace={setPace}
                pitch={pitch}
                onChangePitch={setPitch}
                isGenerating={isTtsGenerating}
                isPlaying={isTtsPlaying}
                audioUrl={ttsAudioUrl}
                error={ttsError}
                onGenerate={() => generateSpeech(ttsInputText, languageMode)}
                onPlay={playTtsAudio}
                onPause={pauseTtsAudio}
                onDownload={() => downloadTtsAudio(`sarvam_speech_${selectedSpeaker}.wav`)}
                ttsHistory={ttsHistory}
                onClearHistory={clearTtsHistory}
                onSendToTranscript={handleSendTtsToTranscript}
              />
            </section>
          </div>
        )}

        {/* FOCUSED VOICE TO TEXT (STT) MODE */}
        {appMode === 'stt' && (
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-5 animate-scale-in">
            {/* STT Input Selector & Recording Box */}
            <section className="glass-card p-6 sm:p-7 flex flex-col gap-4 shadow-sm">
              <ModeSelector
                inputMode={inputMode}
                onChangeInputMode={setInputMode}
                isStreamingMode={isStreamingMode}
                onToggleStreamingMode={() => setIsStreamingMode((prev) => !prev)}
                enableVoiceCommands={enableVoiceCommands}
                onToggleVoiceCommands={() => setEnableVoiceCommands((prev) => !prev)}
                disabled={recordingState === 'recording' || isStreaming || isSttLoading}
              />

              <div className="pt-2">
                {inputMode === 'record' ? (
                  <Recorder
                    recordingState={recordingState}
                    duration={duration}
                    audioBlob={audioBlob}
                    audioUrl={recordedAudioUrl}
                    analyserNode={analyserNode}
                    isStreaming={isStreaming}
                    streamingStatus={streamingStatus}
                    isLoading={isSttLoading}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    onPauseRecording={pauseRecording}
                    onResumeRecording={resumeRecording}
                    onResetRecording={resetRecording}
                    onTranscribe={handleTranscribeRecorded}
                    onStartStreaming={handleStartStreaming}
                    onStopStreaming={handleStopStreaming}
                    isStreamingMode={isStreamingMode}
                  />
                ) : (
                  <FileUpload
                    selectedFile={selectedFile}
                    onFileSelected={(file) => setSelectedFile(file)}
                    onClearFile={() => setSelectedFile(null)}
                    isLoading={isSttLoading}
                    onTranscribe={handleTranscribeFile}
                  />
                )}
              </div>
            </section>

            {/* Status & Progress indicator */}
            <StatusBar
              isLoading={isSttLoading}
              progress={progress}
              error={currentError}
              onRetry={inputMode === 'record' ? handleTranscribeRecorded : handleTranscribeFile}
            />

            {/* Transcripts Panel (Raw Editor & Live Markdown Preview) */}
            <section className="glass-card p-4 sm:p-5 shadow-sm">
              <TranscriptPanel
                transcript={transcript}
                interimTranscript={interimTranscript}
                onTranscriptChange={setTranscript}
                onClear={clearTranscript}
                onSaveToHistory={handleSaveToHistory}
                isLoading={isSttLoading}
                onSendToTTS={handleSendTranscriptToTTS}
              />
            </section>

            {/* Export & Actions Toolbar */}
            <section>
              <ExportBar
                content={transcript}
                filename={`transcript_${new Date().toISOString().slice(0, 10)}`}
                disabled={isSttLoading}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-muted-foreground border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <p className="font-medium">
          Voice AI Studio • Text to Voice &amp; Speech to Text • Powered by Sarvam AI
        </p>
      </footer>

      {/* Slide-in History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={history}
        onSelectSession={handleSelectHistorySession}
        onDeleteSession={deleteSession}
        onClearHistory={clearHistory}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Voice Commands Cheat Sheet Modal */}
      <VoiceCommandsModal
        isOpen={isVoiceCommandsModalOpen}
        onClose={() => setIsVoiceCommandsModalOpen(false)}
      />
    </div>
  );
}
