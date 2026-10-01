import scheme from "./data/schemes.json";

export const WAIT_TA = "ஒரு நிமிடம்";
export const ERROR_TA =
  "இப்போது பேச முடியவில்லை. கவலை வேண்டாம். பெரிய பொத்தானை அழுத்தி தொடரலாம்.";
export const MIC_FAIL_TA =
  "குரல் கிடைக்கவில்லை. ஆம் அல்லது இல்லை பொத்தானை அழுத்துங்கள்.";

export function buildSystemPrompt() {
  return [
    "You are Sakhi, a voice-first helper for a first-time woman user with zero digital knowledge.",
    "Language: very simple spoken Tamil. Short sentences. No English words except numbers and scheme name if needed.",
    "Ask ONE short question at a time. Maximum 3 or 4 eligibility questions, then give a result.",
    "Answer ONLY using SCHEME_FACTS below. Never invent amounts, rules, dates, or addresses.",
    "If a fact is missing, tell her to ask at the Anganwadi centre.",
    "Yes/no questions must include ஆம் and இல்லை in options.",
    "",
    "SCHEME_FACTS:",
    JSON.stringify(scheme),
    "",
    "Return STRICT JSON only, no markdown:",
    '{"say_ta": string, "options": string[], "stage": "ask"|"result", "result": null | {"eligible": boolean, "benefit": string, "documents": string[], "where_to_go": string, "next_step": string}}',
  ].join("\n");
}

export function parseAiJson(text) {
  if (!text || typeof text !== "string") return null;
  let raw = text.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    if (typeof obj.say_ta !== "string" || !obj.say_ta.trim()) return null;
    const stage = obj.stage === "result" ? "result" : "ask";
    const options = Array.isArray(obj.options)
      ? obj.options.filter((o) => typeof o === "string" && o.trim()).slice(0, 4)
      : [];
    let result = null;
    if (stage === "result" && obj.result && typeof obj.result === "object") {
      result = {
        eligible: Boolean(obj.result.eligible),
        benefit:
          typeof obj.result.benefit === "string"
            ? obj.result.benefit
            : scheme.benefits.first_child_ta,
        documents: Array.isArray(obj.result.documents)
          ? obj.result.documents.filter((d) => typeof d === "string")
          : scheme.documents_ta,
        where_to_go:
          typeof obj.result.where_to_go === "string"
            ? obj.result.where_to_go
            : scheme.where_to_apply_ta,
        next_step:
          typeof obj.result.next_step === "string"
            ? obj.result.next_step
            : "அங்கன்வாடிக்குச் சென்று ஆதார் மற்றும் வங்கி புத்தகத்தைக் காட்டுங்கள்.",
      };
    }
    return { say_ta: obj.say_ta.trim(), options, stage, result };
  } catch {
    return null;
  }
}

export async function callAi(messages) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, json: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "AI failed");
    err.status = res.status;
    throw err;
  }
  return data.text || "";
}

export async function askModel(messages) {
  const first = await callAi(messages);
  let parsed = parseAiJson(first);
  if (parsed) return { parsed, messages: [...messages, { role: "assistant", content: first }] };

  const retryMessages = [
    ...messages,
    { role: "assistant", content: first },
    {
      role: "user",
      content: "பிழை. JSON மட்டும் திருப்பு. வேறு உரை வேண்டாம்.",
    },
  ];
  const second = await callAi(retryMessages);
  parsed = parseAiJson(second);
  if (!parsed) throw new Error("parse");
  return { parsed, messages: [...retryMessages, { role: "assistant", content: second }] };
}

export function pickTamilVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("ta")) ||
    voices.find((v) => /tamil/i.test(v.name)) ||
    null
  );
}

export function unlockAudio() {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(".");
    u.volume = 0;
    u.lang = "ta-IN";
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function speakTamil(text) {
  return new Promise((resolve) => {
    if (!text || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ta-IN";
    const voice = pickTamilVoice();
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeak() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function canListen() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function listenTamil() {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      reject(new Error("no-speech"));
      return;
    }
    const rec = new SR();
    rec.lang = "ta-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let finished = false;
    rec.onresult = (e) => {
      finished = true;
      const t = e.results?.[0]?.[0]?.transcript || "";
      resolve(t.trim());
    };
    rec.onerror = (e) => {
      finished = true;
      reject(new Error(e.error || "mic"));
    };
    rec.onend = () => {
      if (!finished) reject(new Error("no-speech"));
    };
    try {
      rec.start();
    } catch (err) {
      reject(err);
    }
  });
}

export const fallback = {
  intro: `${scheme.short_ta} நான் கேள்விகள் கேட்கிறேன். பொத்தானை அழுத்துங்கள்.`,
  steps: [
    {
      id: "preg",
      say: "நீங்கள் கர்ப்பமாக இருக்கிறீர்களா அல்லது சமீபத்தில் குழந்தை பெற்றீர்களா?",
      options: ["ஆம்", "இல்லை"],
    },
    {
      id: "child",
      say: "இது உங்கள் முதல் குழந்தையா? அல்லது இரண்டாவது பெண் குழந்தையா?",
      options: ["முதல் குழந்தை", "இரண்டாவது பெண் குழந்தை", "வேறு"],
    },
    {
      id: "age",
      say: "உங்கள் வயது 19க்கு மேலா?",
      options: ["ஆம்", "இல்லை"],
    },
    {
      id: "job",
      say: "அரசு வேலையில் முழு சம்பளத்துடன் மகப்பேறு விடுப்பு ஏற்கனவே கிடைக்கிறதா?",
      options: ["ஆம்", "இல்லை"],
    },
  ],
  resultFor(answers) {
    const preg = answers.preg === "ஆம்";
    const childOk =
      answers.child === "முதல் குழந்தை" || answers.child === "இரண்டாவது பெண் குழந்தை";
    const ageOk = answers.age === "ஆம்";
    const alreadyPaid = answers.job === "ஆம்";
    const eligible = preg && childOk && ageOk && !alreadyPaid;

    let benefit = scheme.missing_fact_ta;
    if (eligible && answers.child === "முதல் குழந்தை") {
      benefit = `${scheme.benefits.first_child_ta} ${scheme.benefits.first_installments_ta}`;
    } else if (eligible && answers.child === "இரண்டாவது பெண் குழந்தை") {
      benefit = scheme.benefits.second_girl_ta;
    } else if (!preg) {
      benefit = "இந்தத் திட்டம் கர்ப்பிணி அல்லது பச்சிளம் குழந்தை தாய்க்கு.";
    } else if (!childOk) {
      benefit = "இந்தப் பிறப்புக்கு உதவி பொருந்தாமல் இருக்கலாம். அங்கன்வாடியில் உறுதி செய்யவும்.";
    } else if (!ageOk) {
      benefit = `${scheme.eligibility.age_ta}`;
    } else if (alreadyPaid) {
      benefit = scheme.eligibility.not_for_ta;
    }

    const say = eligible
      ? `நீங்கள் உதவி பெறலாம். ${benefit} ஆவணங்களுடன் அங்கன்வாடிக்குச் செல்லுங்கள்.`
      : `இப்போது உதவி உறுதி இல்லை. ${benefit} அங்கன்வாடியில் கேளுங்கள்.`;

    return {
      say_ta: say,
      options: [],
      stage: "result",
      result: {
        eligible,
        benefit,
        documents: scheme.documents_ta,
        where_to_go: `${scheme.where_to_apply_ta} ${scheme.helpline_ta}`,
        next_step: "அங்கன்வாடிக்குச் சென்று ஆதார் மற்றும் வங்கி புத்தகத்தைக் காட்டுங்கள்.",
      },
    };
  },
};

export { scheme };
