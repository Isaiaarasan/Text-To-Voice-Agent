# 🎙️ Voice-to-Text Agent

A local-first voice-to-text app built with **React + Tailwind CSS**, powered by the **Sarvam AI Speech-to-Text API** — with native support for **English**, **Tamil**, and **Tanglish (code-mixed Tamil-English)**, plus live Markdown rendering of the transcript.

> Speak naturally in English, Tamil, or a mix of both — get clean, formatted Markdown out.

---

## ✨ Features

- 🎤 **In-browser audio recording** — no extra software needed
- 🌐 **Multi-language STT** — English, Tamil, and code-mixed Tanglish via Sarvam's `saaras:v3` model
- 📝 **Markdown intake** — transcripts render live as formatted Markdown (headings, lists, bold, tables, etc.)
- 🔁 **Editable transcript** — fix STT mistakes inline before exporting
- 📋 **Copy / Export** — copy to clipboard or download as a `.md` file
- ⚡ **Fast local dev** — Vite-powered React setup, Tailwind for styling
- 🔒 **Local-first** — your API key stays in your own `.env`, nothing leaves your machine except the Sarvam API call

---

## 🧰 Tech Stack

- [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- [Tailwind CSS](https://tailwindcss.com/)
- [Sarvam AI Speech-to-Text API](https://docs.sarvam.ai/)
- [`react-markdown`](https://github.com/remarkjs/react-markdown) + `remark-gfm`

---

## 📦 Prerequisites

- Node.js 18+
- A [Sarvam AI](https://www.sarvam.ai/) account and API key

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/voice-to-text-agent.git
cd voice-to-text-agent

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then open .env and add your Sarvam API key

# 4. Run the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
VITE_SARVAM_API_KEY=your_sarvam_api_key_here
```

> ⚠️ `.env` is gitignored by default. Never commit real API keys.

---

## 🗣️ Language Modes

| Mode | What it does |
|---|---|
| **Auto (Tanglish)** | Uses Sarvam's `codemix` mode — transcribes natural code-mixed Tamil/English speech as-is |
| **Tamil** | Forces `language_code=ta-IN`, pure Tamil script output |
| **English** | Forces `language_code=en-IN`, pure English output |

Switch modes from the toggle in the top bar before or during recording.

---

## 📁 Project Structure

```
voice-to-text-agent/
├── src/
│   ├── components/       # Recorder, LanguageToggle, TranscriptEditor, MarkdownPreview
│   ├── hooks/             # useSarvamSTT.js
│   ├── services/          # sarvamApi.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

See [`info.md`](./info.md) for the full technical spec, API integration details, and roadmap.

---

## 🛣️ Roadmap

- [ ] Streaming/live transcription (Sarvam Realtime WebSocket API)
- [ ] Voice-command-driven Markdown formatting ("bullet point", "new heading")
- [ ] Long-audio support via Sarvam Batch API
- [ ] Transcript history (local storage)
- [ ] Export to PDF/DOCX
- [ ] Dark mode

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](../../issues).

---

## 📄 License

[MIT](./LICENSE)

---

## 🙏 Acknowledgements

- [Sarvam AI](https://www.sarvam.ai/) for the Indian-language speech models
- Built with React, Vite, and Tailwind CSS
