# STATUS

## Done (MVP)

- Splash: full-screen speaker + Tamil **பேசத் தொடங்கு** (user gesture unlocks `speechSynthesis`).
- Voice: `SpeechRecognition` `ta-IN`, `speechSynthesis` `ta-IN` (Tamil voice if the browser has one). Auto-speak every assistant line. Giant mic (pulse while listening), repeat, Yes/No, extra option buttons.
- Facts: `src/data/schemes.json` (PMMVY 2.0 from WCD: ₹5000 first child in two instalments ₹3000+₹2000; ₹6000 second child if girl; documents; Anganwadi / pmmvy.wcd.gov.in; helpline 181). Prompt is built from this file.
- `POST /api/ai` with `{ messages, json: true }`. Proxy sends `reasoning_effort: "low"` and `process.env.GROQ_MODEL`. Client parses JSON (strips fences) and retries once.
- Result screen: icons + short Tamil, listen again, start over.
- Loading speaks **ஒரு நிமிடம்**. 429/5xx/parse/mic failure → Tamil error + hardcoded 4-question button flow.
- Mobile-first, large targets, warm high-contrast colors, lucide-react. Only animation: mic pulse.

## Not in this MVP

- Login, typing, extra schemes, maps, SMS, real Aadhaar/status lookup.

## How to run

```bash
npm install
copy .env.example .env
# set GROQ_API_KEY and GROQ_MODEL in .env
npm run dev
```

For live Groq: `npx vercel dev` (and set the same env vars on Vercel for deploy).

## How to verify

1. `npm run dev` → open local URL → tap splash → audio starts.
2. Without API key / with Vite only: fallback button flow still finishes with a result screen.
3. With `vercel dev` + Groq: questions come from the model JSON; result fields stay within scheme facts.
4. Chrome mic permission: speak Tamil or tap Yes/No.
5. `npm run build` should succeed.
