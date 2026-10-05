/* -------------------------------------------------------
   Speech output — Magalir Thunai
   Languages: Tamil (ta), Hindi (hi), Telugu (te), English (en)

   ta / hi / te : a REAL browser voice for that language only,
                  otherwise the /api/tts fallback.
                  Never an English voice for Indian-language text.
   en           : en-IN, then en-GB / en-US / en.

   Question and answer are separate utterances/clips so they
   can use different voices.

   Order for every piece of speech:
     1. pre-recorded clip   (public/audio, made by scripts/generate_audio.py)
     2. real browser voice  (ta / hi / te / en)
     3. /api/tts fallback   (Tamil, Hindi, Telugu only)
------------------------------------------------------- */

let token = 0;
let audioEl = null;
let pending = null;

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NATIVE = {
  ta: { re: /[\u0B80-\u0BFF]/, voice: /^ta(-|$)/, bcp: "ta-in", rupee: "ரூபாய் " },
  hi: { re: /[\u0900-\u097F]/, voice: /^hi(-|$)/, bcp: "hi-in", rupee: "रुपये " },
  te: { re: /[\u0C00-\u0C7F]/, voice: /^te(-|$)/, bcp: "te-in", rupee: "రూపాయలు " },
};

/* ---------- pre-recorded clips ----------
   public/audio/manifest.json lists the clips that exist. A clip is found by
   a hash of the exact text, so text that changed (or was never recorded)
   simply falls back to live speech. */

// 53-bit string hash (cyrb53): gives the same result in the browser and Node
function hash53(str) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/* "ta/q-1abc2d": language / role (q = heading, a = content) / text hash */
export function clipKey(target, role, text) {
  return `${target}/${role}-${hash53(String(text).trim())}`;
}

const EMPTY_MANIFEST = { v: 0, clips: {} };
let manifestPromise = null;

function loadManifest() {
  if (typeof fetch === "undefined") return Promise.resolve(EMPTY_MANIFEST);
  if (!manifestPromise) {
    manifestPromise = fetch("/audio/manifest.json", { cache: "no-cache" }).then(
      (r) =>
        r.ok
          ? r
              .json()
              .then((m) => (m && typeof m.clips === "object" ? m : EMPTY_MANIFEST))
              .catch(() => EMPTY_MANIFEST) // e.g. the SPA rewrite returned index.html
          : EMPTY_MANIFEST,
      () => {
        manifestPromise = null; // network blip: try again next time
        return EMPTY_MANIFEST;
      }
    );
  }
  return manifestPromise;
}

const clipUrl = (m, key) => `/audio/clips/${key}.mp3?v=${m.v || 0}`;

/* start downloading a clip we are about to need (best effort) */
function warm(text, role, lang) {
  text = String(text || "").trim();
  if (!text || typeof fetch === "undefined") return;
  const target = resolveLang(text, lang);
  loadManifest().then((m) => {
    const key = clipKey(target, role, text);
    if (m.clips[key]) fetch(clipUrl(m, key)).catch(() => {});
  });
}

/* ---------- text helpers ---------- */

function chunk(text, max = 180) {
  const parts = text.match(/[^.?!।\n]+[.?!।]?/g) || [text];
  const out = [];

  for (let p of parts) {
    p = p.trim();

    while (p.length > max) {
      let i = p.lastIndexOf(" ", max);
      if (i < 1) i = max;
      out.push(p.slice(0, i));
      p = p.slice(i).trim();
    }

    if (p) out.push(p);
  }

  return out;
}

function resolveLang(text, lang) {
  if (lang === "en") return "en";
  if (lang && NATIVE[lang] && NATIVE[lang].re.test(text)) return lang;
  for (const k of Object.keys(NATIVE)) {
    if (NATIVE[k].re.test(text)) return k;
  }
  return "en";
}

function normalize(text, target) {
  const s = String(text);

  if (target === "en") {
    return s.replace(
      /(?:₹|\bRs\.?)\s?([\d,]+)/gi,
      (m, n) => `${n.replace(/,/g, "")} rupees`
    );
  }

  return s
    .replace(/(?:₹|\bRs\.?)\s?/gi, NATIVE[target].rupee)
    .replace(/(\d),(?=\d{3}\b)/g, "$1");
}

/* ---------- voices ---------- */

function loadVoices() {
  return new Promise((resolve) => {
    if (!synth) return resolve([]);

    const now = synth.getVoices();
    if (now.length) return resolve(now);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        synth.removeEventListener("voiceschanged", finish);
      } catch {}
      resolve(synth.getVoices());
    };

    try {
      synth.addEventListener("voiceschanged", finish);
    } catch {}

    setTimeout(finish, 800);
  });
}

const norm = (v) => (v.lang || "").replace("_", "-").toLowerCase();

function twoVoices(pool) {
  const question = pool[0] || null;
  const answer = pool.find((v) => v.name !== question?.name) || question;
  return { question, answer };
}

/* Only genuine voices of that language. Never a non-matching voice. */
function pickNative(voices, target) {
  const cfg = NATIVE[target];
  const pool = voices
    .filter((v) => cfg.voice.test(norm(v)))
    .sort((a, b) => (norm(b) === cfg.bcp) - (norm(a) === cfg.bcp));
  return twoVoices(pool);
}

function pickEnglish(voices) {
  const order = ["en-in", "en-gb", "en-us", "en"];
  const rank = (v) => {
    const i = order.findIndex(
      (c) => norm(v) === c || norm(v).startsWith(c + "-")
    );
    return i === -1 ? 99 : i;
  };

  const pool = voices
    .filter((v) => rank(v) < 99)
    .sort((a, b) => rank(a) - rank(b));

  return twoVoices(pool);
}

/* ---------- low-level players ---------- */

function speakBrowser(text, voice, { pitch = 1, rate = 0.92, lang = "en-IN" } = {}) {
  return new Promise((resolve) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang || lang;
      if (voice) u.voice = voice;
      u.pitch = pitch;
      u.rate = rate;
      u.volume = 1;
      u.onend = u.onerror = () => resolve();
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}

function playUrl(url, rate = 1) {
  return new Promise((resolve) => {
    if (!audioEl) audioEl = new Audio();
    const a = audioEl;

    // resolves true only if the clip played to the end
    const done = (ok) => {
      a.onended = null;
      a.onerror = null;
      pending = null;
      resolve(ok === true);
    };

    pending = done;
    a.onended = () => done(true);
    a.onerror = () => done(false);
    a.src = url;
    a.defaultPlaybackRate = rate;
    a.playbackRate = rate;
    a.play().catch(() => done(false));
  });
}

/* Some browsers (iOS Safari) only allow audio that starts inside a tap.
   Playing a silent clip on the tap "unlocks" the shared audio element. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
let primed = false;

function primeAudio() {
  if (primed || typeof Audio === "undefined") return;
  primed = true;
  try {
    if (!audioEl) audioEl = new Audio();
    audioEl.src = SILENT_WAV;
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => {});
  } catch {}
}

/* ---------- stop ---------- */

export function stopSpeaking() {
  token++;

  try {
    synth?.cancel();
  } catch {}

  if (audioEl) {
    try {
      audioEl.pause();
    } catch {}
  }

  if (pending) pending();
}

/* ---------- core: speak one piece (role: "q" or "a") ---------- */

async function say(text, role, my, lang) {
  text = String(text || "").trim();
  if (!text) return;

  const target = resolveLang(text, lang);

  // 1. pre-recorded clip (best quality, needs no browser voice)
  const manifest = await loadManifest();
  if (my !== token) return;
  const key = clipKey(target, role, text);
  if (manifest.clips[key]) {
    const ok = await playUrl(clipUrl(manifest, key), 1);
    if (my !== token) return;
    if (ok) return;
    // the clip could not be loaded or played: fall back to live speech
  }

  const clean = normalize(text, target);

  const voices = synth ? await loadVoices() : [];
  if (my !== token) return;

  const picked = target === "en" ? pickEnglish(voices) : pickNative(voices, target);
  const voice = role === "q" ? picked.question : picked.answer;
  const distinct =
    picked.question && picked.answer && picked.question.name !== picked.answer.name;

  const opts = {
    pitch: role === "q" && !distinct ? 1.12 : 1,
    rate: role === "q" ? 0.95 : 0.9,
    lang: target === "en" ? "en-IN" : NATIVE[target].bcp.replace(/-in$/, "-IN"),
  };

  for (const c of chunk(clean)) {
    if (my !== token) return;

    if (voice) {
      await speakBrowser(c, voice, opts);
    } else if (target !== "en") {
      // No real browser voice for this language: server TTS, never an English voice.
      await playUrl(
        `/api/tts?tl=${target}&q=${encodeURIComponent(c)}`,
        role === "q" ? 1.05 : 1
      );
    } else if (synth) {
      await speakBrowser(c, null, opts);
    }
  }
}

async function run(items, my, lang) {
  for (let i = 0; i < items.length; i++) {
    const { q, a } = items[i];
    if (my !== token) return;

    warm(a, "a", lang);
    if (items[i + 1]) {
      warm(items[i + 1].q, "q", lang);
      warm(items[i + 1].a, "a", lang);
    }

    if (q) {
      await say(q, "q", my, lang);
      if (my !== token) return;
      if (a) await sleep(300);
    }

    if (a) await say(a, "a", my, lang);
    if (my !== token) return;

    await sleep(350);
  }
}

/* ---------- public API ---------- */

/* items: [{ q, a }] — spoken one after another; stops any earlier speech. */
export function speakSequence(items, lang) {
  stopSpeaking();
  primeAudio();
  return run(items, token, lang);
}

export const speakQuestionAnswer = (q, a, lang) =>
  speakSequence([{ q, a }], lang);

export const speakQuestionOnly = (q, lang) =>
  speakSequence([{ q, a: "" }], lang);

export const speakQuestion = speakQuestionOnly;

export function speakText(text, lang) {
  stopSpeaking();
  primeAudio();
  return say(text, "a", token, lang);
}

export const speakAnswer = speakText;

/* Backward-compatible name */
export function speakTa(text) {
  return speakText(text, "ta");
}

/* ---------- scheme speech (same data + labels as on screen) ---------- */

const SPEECH_Q = {
  ta: {
    what: "இந்த திட்டம் என்ன?",
    benefit: "கிடைக்கும் உதவி என்ன?",
    who: "யாருக்கு இந்த திட்டம்?",
    docs: "தேவையான ஆவணங்கள் என்ன?",
    where: "எங்கே செல்ல வேண்டும்?",
    next: "அடுத்து என்ன செய்ய வேண்டும்?",
  },
  en: {
    what: "What is this scheme?",
    benefit: "What is the benefit?",
    who: "Who may qualify?",
    docs: "What documents are required?",
    where: "Where should I go?",
    next: "What should I do next?",
  },
  hi: {
    what: "यह योजना क्या है?",
    benefit: "क्या मदद मिलेगी?",
    who: "यह किसके लिए है?",
    docs: "कौन से दस्तावेज़ चाहिए?",
    where: "कहाँ जाना है?",
    next: "आगे क्या करना है?",
  },
  te: {
    what: "ఈ పథకం ఏమిటి?",
    benefit: "ఏ సహాయం లభిస్తుంది?",
    who: "ఎవరికి ఈ పథకం?",
    docs: "ఏ పత్రాలు కావాలి?",
    where: "ఎక్కడికి వెళ్లాలి?",
    next: "తర్వాత ఏమి చేయాలి?",
  },
};

const toText = (v) =>
  v == null
    ? ""
    : Array.isArray(v)
      ? v.map(toText).filter(Boolean).join(". ")
      : String(v).trim();

/* data = s[l]  ({ desc, benefit, who, docs, where, next }) */
export function schemeSpeechItems(data, lang) {
  const Q = SPEECH_Q[lang] || SPEECH_Q.en;

  return [
    ["what", data?.desc],
    ["benefit", data?.benefit],
    ["who", data?.who],
    ["docs", data?.docs],
    ["where", data?.where],
    ["next", data?.next],
  ]
    .map(([k, v]) => ({ q: Q[k], a: toText(v) }))
    .filter((x) => x.a);
}

/* used by scripts/audio-texts.mjs so recorded text matches spoken text exactly */
export { normalize as normalizeForSpeech, resolveLang };

/* ---------- debug: run voiceDebug() in the browser console ---------- */

export async function voiceDebug() {
  const v = await loadVoices();
  console.table(
    v.map((x) => ({ name: x.name, lang: x.lang, local: x.localService }))
  );
  return v;
}

if (typeof window !== "undefined") window.voiceDebug = voiceDebug;