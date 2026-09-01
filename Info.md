# Voice-to-Text Agent — Project Spec (info.md)

Internal planning doc. Not meant for GitHub visitors — see `README.md` for that.

## 1. Goal

A browser-based voice-to-text agent that:
- Records/uploads audio from the user
- Transcribes it via the **Sarvam AI Speech-to-Text API**
- Supports **English**, **Tamil**, and **Tanglish (code-mixed Tamil-English)**
- Renders the transcript as **live-parsed Markdown** (headings, lists, bold, code blocks, etc. spoken/dictated by the user get formatted)
- Runs locally first (`localhost`), built with **React + Tailwind CSS**

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React (Vite) | Fast local dev server, no CRA bloat |
| Styling | Tailwind CSS | Utility-first, dark mode support |
| Markdown rendering | `react-markdown` + `remark-gfm` | For live preview of transcribed Markdown |
| Audio capture | Web `MediaRecorder` API | Native browser recording, no extra deps |
| STT Provider | Sarvam AI (`saaras:v3` model) | Handles English, Tamil, and code-mixed audio |
| HTTP client | `axios` or native `fetch` | For calling Sarvam REST endpoint |
| State management | React `useState` / `useReducer` | App is small enough to avoid Redux/Zustand initially |
| Env vars | `.env` (Vite: `VITE_SARVAM_API_KEY`) | **Never commit this file** |

## 3. Sarvam API — Integration Notes

Sarvam AI's Speech-to-Text is built on the `saaras:v3` model and natively covers Tamil, English, and 20+ other Indian languages from a single endpoint.

**Endpoint (REST, short audio ≤30s):**
```
POST https://api.sarvam.ai/speech-to-text
```

**Auth header:**
```
api-subscription-key: <YOUR_SARVAM_API_KEY>
```

**Key request params:**
| Param | Value | Purpose |
|---|---|---|
| `model` | `saaras:v3` | Latest recommended STT model |
| `mode` | `transcribe` \| `translate` \| `verbatim` \| `transliterate` \| `codemix` | **`codemix` is the mode you want for Tanglish** — it keeps the code-mixed Tamil/English text natural instead of forcing pure Tamil script or pure English |
| `input_audio_codec` | required only for raw PCM | e.g. `pcm_s16le` at 16kHz |
| `language_code` | e.g. `ta-IN`, `en-IN` | Can often be auto-detected; pin it for higher accuracy on Tamil |

**Supported audio formats:** WAV, MP3, AAC, AIFF, OGG, OPUS, FLAC, MP4/M4A, AMR, WMA, WebM, PCM (16kHz for PCM). `MediaRecorder` in Chrome/Edge outputs WebM/Opus by default — this is directly supported, no client-side transcoding needed.

**For audio > 30 seconds:** switch to the **Batch API** (async job + polling) instead of the REST sync endpoint. Plan for this in v2 if you expect long dictations.

**For live/streaming transcription (future):** Sarvam offers a WebSocket-based Realtime API (`saaras:v3-realtime`) with interim/partial transcripts — worth evaluating once the MVP (record → stop → transcribe) is stable.

> ⚠️ Always re-check `https://docs.sarvam.ai` before implementation — Sarvam ships fast and deprecates older models (e.g. Saarika v2.5, Saaras v2.5) in favor of v3.

## 4. Tamil / English / Tanglish Strategy

1. **Default mode:** `codemix` — this is the single mode that gets you natural Tanglish output (e.g. "naan office ku poren" transcribed as typed/spoken, not force-translated).
2. **Pure Tamil dictation:** set `mode=transcribe` with `language_code=ta-IN` for users who want full Tamil script output.
3. **Pure English dictation:** `mode=transcribe`, `language_code=en-IN`.
4. **Auto mode toggle in UI:** Give the user a 3-way switch — `Auto (Tanglish)` / `Tamil` / `English` — mapped to the params above.
5. **Script preference:** Some users may want Tanglish typed in **Latin script** (romanized Tamil) rather than Tamil Unicode. Check Sarvam's `transliterate` mode if this is a hard requirement — flag as a stretch goal.

## 5. Markdown Intake

- Transcribed text lands in a `contentEditable` / `textarea` buffer.
- Pipe raw text through `react-markdown` (with `remark-gfm` for tables/strikethrough/task lists) into a live preview pane.
- Support two panes: **Raw transcript (editable)** ↔ **Rendered Markdown (preview)**, side-by-side or toggleable on mobile.
- Voice commands worth mapping later (stretch goal): saying "new line", "bullet point", "heading one" → auto-insert Markdown syntax (`\n`, `- `, `# `). Not required for MVP; do plain dictation first.

## 6. Suggested Folder Structure

```
voice-to-text-agent/
├── public/
├── src/
│   ├── components/
│   │   ├── Recorder.jsx        # mic button, MediaRecorder logic
│   │   ├── LanguageToggle.jsx  # Auto/Tamil/English switch
│   │   ├── TranscriptEditor.jsx
│   │   └── MarkdownPreview.jsx
│   ├── hooks/
│   │   └── useSarvamSTT.js     # API call + loading/error state
│   ├── services/
│   │   └── sarvamApi.js        # axios/fetch wrapper, env key read
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Tailwind directives
├── .env                        # VITE_SARVAM_API_KEY=... (gitignored)
├── .env.example
├── .gitignore
├── tailwind.config.js
├── vite.config.js
├── package.json
├── README.md
└── info.md
```

## 7. MVP Feature Checklist

- [ ] Set up Vite + React + Tailwind
- [ ] Record audio via `MediaRecorder`, show waveform/level indicator (optional)
- [ ] Send recorded blob to Sarvam `/speech-to-text` with correct `mode`/`language_code`
- [ ] Display raw transcript in an editable textarea
- [ ] Render transcript as live Markdown preview
- [ ] Language mode toggle (Auto/Tanglish, Tamil, English)
- [ ] Loading/error states for API calls
- [ ] Copy-to-clipboard + download-as-`.md` button
- [ ] `.env`-based API key handling, never hardcoded

## 8. Stretch Goals (v2+)

- Streaming/live transcription via Sarvam's Realtime WebSocket API
- Voice-command-driven Markdown formatting ("bullet point", "bold that")
- Long-audio support via Sarvam Batch API + polling UI
- Local transcript history (IndexedDB or localStorage)
- Export to `.docx`/`.pdf` in addition to `.md`
- Dark mode via Tailwind `dark:` classes

## 9. Environment Setup Notes

- Get a Sarvam API key from the Sarvam AI dashboard.
- Store as `VITE_SARVAM_API_KEY` in `.env` (Vite exposes only `VITE_`-prefixed vars to client code).
- **Security note:** calling Sarvam directly from the browser exposes the key in network requests. For a local personal project this is acceptable; before deploying publicly, add a thin backend/proxy (Node/Express or a serverless function) to hold the key server-side.
