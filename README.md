# Sakhi (placeholder)

Voice-first Tamil helper so a first-time woman user, with no typing or login, can check **one** scheme: Pradhan Mantri Matru Vandana Yojana (PMMVY).

## Problem

Government maternity benefits exist, but the path is portals, forms, and English. A user who has never used a smartphone cannot start there.

## Solution

One full-screen speaker button starts the app. The assistant speaks simple Tamil, asks one short question at a time, and always offers giant Yes / No (and extra) buttons. At the end it shows eligibility, documents, where to go, and the next step — then reads them aloud.

If the mic or the AI call fails, a hardcoded Tamil button flow still works.

## Architecture

- **Vite + React + Tailwind** UI (`src/App.jsx`)
- **Facts** in `src/data/schemes.json` (eligibility, amounts, installments, documents, Anganwadi, helpline 181)
- **Prompt + voice + API client** in `src/sakhi.js`
- **Vercel serverless proxy** `POST /api/ai` (`api/ai.js`) — Groq key stays on the server (`GROQ_API_KEY`, `GROQ_MODEL`). Never put keys in client code.

```
Phone  →  React (speech in/out, buttons)
              ↓ POST { messages, json: true }
         /api/ai  →  Groq (reasoning_effort: low)
              ↓ { text } JSON
         Parse (strip fences, retry once) → speak + UI
```

## How AI is used

The system prompt is built from `schemes.json`. The model must:

- speak very simple Tamil
- ask one question at a time (at most 3–4 eligibility questions)
- answer only from that file; if a fact is missing, send the user to the Anganwadi centre
- return strict JSON:

```json
{
  "say_ta": "string",
  "options": ["ஆம்", "இல்லை"],
  "stage": "ask",
  "result": null
}
```

`result` is filled when `stage` is `"result"`.

## Setup

```bash
npm install
copy .env.example .env
```

In `.env` (server only, used by Vercel / `vercel dev`):

```
GROQ_API_KEY=your_key
GROQ_MODEL=openai/gpt-oss-120b
```

On Vercel: Project Settings → Environment Variables → same two names.

## Run

**UI only** (buttons + speech; `/api/ai` will fail unless the proxy is up, then the app falls back to the hardcoded flow):

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**UI + Groq proxy** (needed for the live model):

```bash
npx vercel dev
```

Open the URL Vercel prints (usually `http://localhost:3000`).  
`vite.config.js` also proxies `/api` from port 5173 → 3000 if both are running.

## Verify

1. Splash: one giant Tamil **பேசத் தொடங்கு** button. Tap it (this unlocks audio).
2. You should hear **ஒரு நிமிடம்**, then a short Tamil question. Mic pulses while listening.
3. Answer with **ஆம் / இல்லை**, extra option buttons, or the mic (`ta-IN`). Use **மீண்டும்** to replay.
4. After a few questions, result screen: benefit, documents, where to go, next step. **மீண்டும் கேள்** and **முதலில் இருந்து**.
5. Kill the API or omit the key: friendly Tamil error, then the same questions as buttons only. Result still uses amounts from `schemes.json` only.
6. Chrome/Edge on Android or desktop; SpeechRecognition needs Chrome. HTTPS or localhost for mic.
