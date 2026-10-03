/* -------------------------------------------------------
   Speech output — Magalir Thunai
   Languages: Tamil (ta), Hindi (hi), Telugu (te), English (en)

   ta / hi / te : a REAL browser voice for that language only,
                  otherwise the /api/tts fallback.
                  Never an English voice for Indian-language text.
   en           : en-IN, then en-GB / en-US / en.

   Question and answer are separate utterances/clips so they
   can use different voices.
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

  const target = resolveLang(text, lang);
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

/* ---------- debug: run voiceDebug() in the browser console ---------- */

export async function voiceDebug() {
  const v = await loadVoices();
  console.table(
    v.map((x) => ({ name: x.name, lang: x.lang, local: x.localService }))
  );
  return v;
}

if (typeof window !== "undefined") window.voiceDebug = voiceDebug;