/* -------------------------------------------------------
   Unified speech output — Magalir Thunai (மகளிர் துணை)

   Tamil  : real Tamil browser voice (ta-*) ONLY, otherwise /api/tts.
            Never an English voice.
   English: en-IN, then en-GB / en-US / en.
   Question and answer are separate utterances/clips so
   they can use different voices.
------------------------------------------------------- */

let token = 0;
let audioEl = null;
let pending = null;

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : null;

const TA_RE = /[\u0B80-\u0BFF]/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function normalizeTa(t) {
  return String(t)
    .replace(/(?:₹|\bRs\.?)\s?/gi, "ரூபாய் ")
    .replace(/(\d),(?=\d{3}\b)/g, "$1");
}

function normalizeEn(t) {
  return String(t).replace(
    /(?:₹|\bRs\.?)\s?([\d,]+)/gi,
    (m, n) => `${n.replace(/,/g, "")} rupees`
  );
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

/* Only genuine Tamil voices. Never falls back to a non-Tamil voice. */
function pickTamil(voices) {
  const pool = voices
    .filter((v) => /^ta(-|$)/.test(norm(v)))
    .sort((a, b) => (norm(b) === "ta-in") - (norm(a) === "ta-in"));

  const question = pool[0] || null;
  const answer = pool.find((v) => v.name !== question?.name) || question;
  return { question, answer };
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

  const question = pool[0] || null;
  const answer = pool.find((v) => v.name !== question?.name) || question;
  return { question, answer };
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

    const done = () => {
      a.onended = null;
      a.onerror = null;
      pending = null;
      resolve();
    };

    pending = done;
    a.onended = done;
    a.onerror = done;
    a.src = url;
    a.defaultPlaybackRate = rate;
    a.playbackRate = rate;
    a.play().catch(done);
  });
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

  const ta = lang === "en" ? false : TA_RE.test(text);
  const clean = ta ? normalizeTa(text) : normalizeEn(text);

  const voices = synth ? await loadVoices() : [];
  if (my !== token) return;

  const picked = ta ? pickTamil(voices) : pickEnglish(voices);
  const voice = role === "q" ? picked.question : picked.answer;
  const distinct =
    picked.question && picked.answer && picked.question.name !== picked.answer.name;

  const opts = {
    pitch: role === "q" && !distinct ? 1.12 : 1,
    rate: role === "q" ? 0.95 : 0.9,
    lang: ta ? "ta-IN" : "en-IN",
  };

  for (const c of chunk(clean)) {
    if (my !== token) return;

    if (voice) {
      await speakBrowser(c, voice, opts);
    } else if (ta) {
      // No real Tamil browser voice: server TTS, never an English voice.
      await playUrl(
        `/api/tts?tl=ta&q=${encodeURIComponent(c)}`,
        role === "q" ? 1.05 : 1
      );
    } else if (synth) {
      await speakBrowser(c, null, opts);
    }
  }
}

async function run(items, my, lang) {
  for (const { q, a } of items) {
    if (my !== token) return;

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
  return run(items, token, lang);
}

export const speakQuestionAnswer = (q, a, lang) =>
  speakSequence([{ q, a }], lang);

export const speakQuestionOnly = (q, lang) =>
  speakSequence([{ q, a: "" }], lang);

export const speakQuestion = speakQuestionOnly;

export function speakText(text, lang) {
  stopSpeaking();
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

/* ---------- debug: run voiceDebug() in the browser console ---------- */

export async function voiceDebug() {
  const v = await loadVoices();
  console.table(
    v.map((x) => ({ name: x.name, lang: x.lang, local: x.localService }))
  );
  return v;
}

if (typeof window !== "undefined") window.voiceDebug = voiceDebug;