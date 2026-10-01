import { useEffect, useState } from "react";
import {
  Volume2, Mic, Search, Baby, GraduationCap, Flower2, Accessibility, Users, PiggyBank,
  ArrowLeft, ShieldCheck, Loader2, MapPin, ListChecks, Wallet, UserCheck, Info,
  FileText, ExternalLink, Sparkles, Heart, Landmark, Square, ChevronRight,
} from "lucide-react";
import {
  callAi,
  parseAiJson,
  listenTamil,
  canListen,
  speakText,
  speakQuestionOnly,
  speakSequence,
  schemeSpeechItems,
  stopSpeak,
} from "./sakhi.js";

/* ---------- compat exports for App.jsx ---------- */
export const infoText = (s) => s?.title || "";
export function InfoScreen() { return null; }

/* ---------- UI text ---------- */
const T = {
  ta: {
    hero: "உங்களுக்கு கிடைக்கக்கூடிய அரசு திட்டங்களை கண்டுபிடிப்போம்",
    sub: "தமிழில் பேசுங்கள் அல்லது எழுதுங்கள்.",
    speak: "பேச தொடங்குங்கள்", listening: "கேட்கிறேன்...", stop: "நிறுத்து",
    ph: "உங்கள் கேள்வியை எழுதுங்கள்...", go: "தேடு",
    back: "திரும்ப", cats: "தலைப்புகள்", popular: "பிரபலமான திட்டங்கள்",
    all: "அனைத்து அரசு திட்டங்கள்", viewAll: "அனைத்து திட்டங்களும்", view: "விவரங்களைப் பார்க்க",
    find: "எனக்கு ஏற்ற திட்டத்தை கண்டுபிடி", count: "திட்டங்கள்", allChip: "அனைத்தும்",
    what: "இந்த திட்டம் என்ன?", benefit: "கிடைக்கும் உதவி", who: "யாருக்கு?", docs: "தேவையான ஆவணங்கள்",
    where: "எங்கே செல்ல வேண்டும்?", next: "அடுத்த படி", listen: "கேட்க", official: "அதிகாரப்பூர்வ தகவல்",
    again: "மீண்டும் கேள்", voiceCheck: "குரலில் தகுதி சரிபார்", wait: "ஒரு நிமிடம்...",
    results: "உங்களுக்கு பொருந்தக்கூடிய திட்டங்கள்",
    maybe: "நீங்கள் வழங்கிய தகவலின் அடிப்படையில் இந்த திட்டம் உங்களுக்கு பொருந்தக்கூடும். அதிகாரப்பூர்வ தகுதியை சரிபார்க்கவும்.",
    empty: "பொருந்தும் திட்டம் இல்லை. கீழே உள்ள எல்லாத் திட்டங்களையும் பாருங்கள்.",
    micFail: "குரல் கிடைக்கவில்லை. Chrome அல்லது Edge-இல் மைக் அனுமதி கொடுங்கள், அல்லது எழுதுங்கள்.",
    noMic: "இந்த உலாவியில் குரல் வசதி இல்லை. Chrome அல்லது Edge பயன்படுத்துங்கள், அல்லது எழுதுங்கள்.",
    trust1: "மகளிர் துணை உங்கள் Aadhaar எண் அல்லது OTP-ஐ கேட்காது.",
    trust2: "தகவல்கள் அரசு ஆதாரங்களில் இருந்து பெறப்பட்டவை. இறுதி தகுதியை அரசு அதிகாரப்பூர்வமாக சரிபார்க்க வேண்டும்.",
    docsUnknown: "ஆவணப் பட்டியலை அலுவலகத்தில் உறுதி செய்யுங்கள்.",
    startOver: "முதலில் இருந்து", q: "கேள்வி",
    ex: ["பெண்களுக்கு என்ன உதவி கிடைக்கும்?", "நான் கல்லூரியில் படிக்கிறேன்", "நான் கர்ப்பமாக இருக்கிறேன்"],
    yes: "ஆம்", no: "இல்லை",
    fq: [
      { k: "studying", t: "நீங்கள் படிக்கிறீர்களா?", o: ["ஆம்", "இல்லை"] },
      { k: "pregnant", t: "நீங்கள் கர்ப்பமாக இருக்கிறீர்களா?", o: ["ஆம்", "இல்லை"] },
      { k: "age", t: "உங்கள் வயது?", o: ["18–25", "26–40", "41–59", "60+"] },
      { k: "need", t: "என்ன உதவி வேண்டும்?", o: ["பணம்", "கல்வி", "ஓய்வூதியம்", "மருத்துவம்"] },
    ],
  },
  en: {
    hero: "Find government schemes available to you",
    sub: "Speak or type your question.",
    speak: "Start speaking", listening: "Listening...", stop: "Stop",
    ph: "Type your question...", go: "Search",
    back: "Back", cats: "Topics", popular: "Popular schemes",
    all: "All Government Schemes", viewAll: "View all schemes", view: "View details",
    find: "Find schemes for me", count: "schemes", allChip: "All",
    what: "What is this scheme?", benefit: "Benefit", who: "Who may qualify?", docs: "Required documents",
    where: "Where to apply?", next: "Next step", listen: "Listen", official: "Official information",
    again: "Listen again", voiceCheck: "Check eligibility by voice", wait: "One moment...",
    results: "Potential schemes for you",
    maybe: "Based on what you shared, this scheme may suit you. Please verify official eligibility.",
    empty: "No matching scheme. See all schemes below.",
    micFail: "Could not hear you. Allow the mic in Chrome or Edge, or type instead.",
    noMic: "Voice is not supported in this browser. Use Chrome or Edge, or type.",
    trust1: "Magalir Thunai will never ask for your Aadhaar number or OTP.",
    trust2: "Information is based on government sources. Final eligibility must be verified through the official government process.",
    docsUnknown: "Confirm the document list at the office.",
    startOver: "Start over", q: "Question",
    ex: ["What help is available for women?", "I am a college student", "I am pregnant"],
    yes: "Yes", no: "No",
    fq: [
      { k: "studying", t: "Are you studying?", o: ["Yes", "No"] },
      { k: "pregnant", t: "Are you pregnant?", o: ["Yes", "No"] },
      { k: "age", t: "Your age group?", o: ["18–25", "26–40", "41–59", "60+"] },
      { k: "need", t: "What help do you need?", o: ["Money", "Education", "Pension", "Medical"] },
    ],
  },
};

const CATS = [
  { id: "women", icon: Users, ta: "பெண்கள்", en: "Women" },
  { id: "edu", icon: GraduationCap, ta: "கல்வி", en: "Education" },
  { id: "preg", icon: Baby, ta: "கர்ப்பம் & குழந்தைகள்", en: "Pregnancy & Children" },
  { id: "money", icon: Wallet, ta: "நிதி உதவி", en: "Financial Assistance" },
  { id: "pension", icon: Heart, ta: "ஓய்வூதியம்", en: "Pension" },
  { id: "disab", icon: Accessibility, ta: "மாற்றுத்திறனாளிகள்", en: "Disability" },
];

const CHECK_TA = "இறுதி தகுதியை அரசு அலுவலகத்தில் உறுதி செய்யுங்கள்.";
const CHECK_EN = "Confirm final eligibility at the government office.";
const OFFICE_TA = "e-Sevai மையம் அல்லது அருகிலுள்ள அரசு அலுவலகம்.";
const OFFICE_EN = "e-Sevai centre or the nearest government office.";
const AMT_TA = "மாதாந்திர ஓய்வூதியம். தொகையை அலுவலகத்தில் உறுதி செய்யுங்கள்.";
const AMT_EN = "Monthly pension. Confirm the amount at the office.";

const S = [
  {
    id: "kmut", icon: Flower2, cats: ["women", "money"], url: "https://www.tnesevai.tn.gov.in/",
    kw: ["பெண்", "மகளிர்", "மாதம்", "பணம்", "உரிமை", "தலைவி", "women", "woman", "monthly", "money", "financial", "cash", "help", "urimai"],
    ta: { title: "கலைஞர் மகளிர் உரிமைத் தொகை", desc: "தமிழ்நாடு அரசின் மாதாந்திர நிதி உதவித் திட்டம்.", benefit: "மாதம் 1,000 ரூபாய் வங்கிக் கணக்கில்.", who: "தகுதியுள்ள குடும்பங்களின் பெண் தலைவிகளுக்கு.", where: OFFICE_TA, next: "தகுதி விதிகள் மாறியிருக்கலாம். இப்போதைய விதிகளை அலுவலகத்தில் கேளுங்கள்.", docs: null },
    en: { title: "Kalaignar Magalir Urimai Thittam", desc: "Tamil Nadu government's monthly financial assistance for women.", benefit: "Rs 1,000 per month to the bank account.", who: "Women heads of eligible families.", where: OFFICE_EN, next: "Rules may have changed. Ask for the current rules at the office.", docs: null },
  },
  {
    id: "pudhumai", icon: GraduationCap, cats: ["women", "edu", "money"], url: "https://www.tnesevai.tn.gov.in/",
    kw: ["கல்லூரி", "படிக்க", "படிப்பு", "மாணவி", "கல்வி", "புதுமை", "college", "student", "study", "studying", "education", "pudhumai"],
    ta: { title: "புதுமைப் பெண் திட்டம்", desc: "உயர்கல்வி படிக்கும் மாணவிகளுக்கான உதவித்தொகை.", benefit: "மாதம் 1,000 ரூபாய்.", who: "அரசுப் பள்ளியில் 6 முதல் 12 வரை படித்து, உயர்கல்வியில் சேர்ந்த மாணவிகளுக்கு.", where: "உங்கள் கல்லூரி அலுவலகம்.", next: "கல்லூரி அலுவலகத்தில் விண்ணப்ப முறையைக் கேளுங்கள்.", docs: null },
    en: { title: "Pudhumai Penn Scheme", desc: "Monthly support for girls pursuing higher education.", benefit: "Rs 1,000 per month.", who: "Girls who studied Classes 6 to 12 in government schools and joined higher education.", where: "Your college office.", next: "Ask your college office how to apply.", docs: null },
  },
  {
    id: "pmmvy", icon: Baby, cats: ["women", "preg", "money"], voice: true, url: "https://spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs",
    kw: ["கர்ப்ப", "குழந்தை", "பிரசவ", "மகப்பேறு", "தாய்", "மாத்ரு", "pregnant", "pregnancy", "baby", "child", "maternity", "mother", "delivery"],
    ta: { title: "மாத்ரு வந்தனா யோஜனா (PMMVY)", desc: "கர்ப்பிணி மற்றும் பாலூட்டும் தாய்மார்களுக்கான மத்திய அரசு உதவி.", benefit: "முதல் குழந்தைக்கு 5,000 ரூபாய் இரண்டு தவணையில்.", who: "குரலில் உங்கள் தகுதியை சரிபார்க்கலாம்.", where: "அருகிலுள்ள அங்கன்வாடி நிலையம்.", next: "குரல் சரிபார்ப்பைத் தொடங்குங்கள்.", docs: ["ஆதார் அட்டை", "ஆதாருடன் இணைந்த வங்கி அல்லது அஞ்சலக கணக்கு", "கைபேசி எண்", "தாய்-சேய் நல அட்டை"] },
    en: { title: "PM Matru Vandana Yojana (PMMVY)", desc: "Central government support for pregnant and nursing mothers.", benefit: "Rs 5,000 in two instalments for the first child.", who: "You can check your eligibility by voice.", where: "Nearest Anganwadi centre.", next: "Start the voice eligibility check.", docs: ["Aadhaar card", "Bank or post office account linked to Aadhaar", "Mobile number", "Mother-child protection card"] },
  },
  {
    id: "widow", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
    kw: ["விதவை", "கணவர் இறந்த", "கணவன் இறந்த", "ஓய்வூதியம்", "பென்ஷன்", "widow", "husband died", "pension"],
    ta: { title: "ஆதரவற்ற விதவை ஓய்வூதியம்", desc: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT_TA, who: "ஆதரவற்ற விதவைகளுக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் கேளுங்கள்.", where: OFFICE_TA, next: CHECK_TA, docs: null },
    en: { title: "Destitute Widow Pension", desc: "Tamil Nadu social security scheme.", benefit: AMT_EN, who: "Destitute widows. Ask about age and income rules at the office.", where: OFFICE_EN, next: CHECK_EN, docs: null },
  },
  {
    id: "deserted", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
    kw: ["கைவிடப்பட்ட", "விவாகரத்து", "ஓய்வூதியம்", "பென்ஷன்", "deserted", "divorce", "divorced", "pension"],
    ta: { title: "ஆதரவற்ற / கைவிடப்பட்ட பெண்கள் ஓய்வூதியம்", desc: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT_TA, who: "கைவிடப்பட்ட அல்லது விவாகரத்தான பெண்களுக்கு. நிபந்தனைகளை அலுவலகத்தில் கேளுங்கள்.", where: OFFICE_TA, next: CHECK_TA, docs: null },
    en: { title: "Destitute / Deserted Women Pension", desc: "Tamil Nadu social security scheme.", benefit: AMT_EN, who: "Deserted or divorced women. Ask about the conditions at the office.", where: OFFICE_EN, next: CHECK_EN, docs: null },
  },
  {
    id: "unmarried", icon: Users, cats: ["women", "pension", "money"], url: "https://cra.tn.gov.in/",
    kw: ["திருமணமாகாத", "ஓய்வூதியம்", "பென்ஷன்", "unmarried", "single", "pension"],
    ta: { title: "திருமணமாகாத ஏழைப் பெண்கள் ஓய்வூதியம்", desc: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT_TA, who: "ஏழ்மையில் உள்ள திருமணமாகாத மூத்த பெண்களுக்கு. வயது விதியை அலுவலகத்தில் கேளுங்கள்.", where: OFFICE_TA, next: CHECK_TA, docs: null },
    en: { title: "Unmarried Poor Women Pension", desc: "Tamil Nadu social security scheme.", benefit: AMT_EN, who: "Poor unmarried older women. Ask about the age rule at the office.", where: OFFICE_EN, next: CHECK_EN, docs: null },
  },
  {
    id: "oldage", icon: Landmark, cats: ["pension", "money"], url: "https://cra.tn.gov.in/",
    kw: ["முதியோர்", "வயதான", "மூத்த", "ஓய்வூதியம்", "பென்ஷன்", "old age", "elderly", "senior", "pension"],
    ta: { title: "முதியோர் ஓய்வூதியம்", desc: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT_TA, who: "ஆதரவு தேவைப்படும் முதியோருக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் கேளுங்கள்.", where: OFFICE_TA, next: CHECK_TA, docs: null },
    en: { title: "Old Age Pension", desc: "Tamil Nadu social security scheme.", benefit: AMT_EN, who: "Elderly people in need. Ask about age and income rules at the office.", where: OFFICE_EN, next: CHECK_EN, docs: null },
  },
  {
    id: "disab", icon: Accessibility, cats: ["disab", "pension", "money"], url: "https://cra.tn.gov.in/",
    kw: ["மாற்றுத்திறன", "ஊனம்", "ஓய்வூதியம்", "disabled", "disability", "differently", "pension"],
    ta: { title: "மாற்றுத்திறனாளி ஓய்வூதியம்", desc: "மாற்றுத்திறனாளிகளுக்கான சமூகப் பாதுகாப்புத் திட்டம்.", benefit: AMT_TA, who: "தகுதியுள்ள மாற்றுத்திறனாளிகளுக்கு.", where: OFFICE_TA, next: CHECK_TA, docs: null },
    en: { title: "Differently-Abled Pension", desc: "Social security scheme for persons with disabilities.", benefit: AMT_EN, who: "Eligible differently-abled persons.", where: OFFICE_EN, next: CHECK_EN, docs: null },
  },
  {
    id: "ssy", icon: PiggyBank, cats: ["women", "money"], url: null,
    kw: ["பெண் குழந்தை", "சேமிப்பு", "செல்வமகள்", "மகள்", "girl child", "daughter", "savings", "sukanya"],
    ta: { title: "செல்வமகள் சேமிப்புத் திட்டம்", desc: "பெண் குழந்தையின் எதிர்காலத்துக்கான மத்திய அரசு சேமிப்புத் திட்டம்.", benefit: "பெண் குழந்தையின் பெயரில் சிறு சேமிப்புக் கணக்கு.", who: "பெண் குழந்தையின் பெற்றோர் அல்லது பாதுகாவலருக்கு.", where: "அஞ்சலகம் அல்லது வங்கி.", next: "வட்டி விகிதம், விதிகளை அங்கே கேளுங்கள்.", docs: null },
    en: { title: "Sukanya Samriddhi Scheme", desc: "Central government savings scheme for a girl child's future.", benefit: "A small savings account in the girl child's name.", who: "Parents or guardians of a girl child.", where: "Post office or bank.", next: "Ask about interest rates and rules there.", docs: null },
  },
];

/* ---------- helpers ---------- */
const catName = (c, l) => c[l];
const getS = (id) => S.find((x) => x.id === id);

function matchSchemes(q) {
  const t = q.toLowerCase().trim();
  if (!t) return [];
  return S.map((s) => ({
    s,
    n: s.kw.reduce((a, k) => a + (t.includes(k.toLowerCase()) ? 2 : 0), 0),
  }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.s);
}

/* ---------- speech (all through speak.js) ---------- */

// general text (summaries, results)
function sayText(text, lang) {
  return speakText(text, lang);
}

// find-my-scheme: speak ONLY the question, in the "question" voice
function sayQuestion(text, lang) {
  return speakQuestionOnly(text, lang);
}

function listenIn(lang) {
  if (lang === "ta") return listenTamil();
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject(new Error("no-speech"));
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    let done = false;
    r.onresult = (e) => { done = true; resolve((e.results?.[0]?.[0]?.transcript || "").trim()); };
    r.onerror = (e) => { done = true; reject(new Error(e.error || "mic")); };
    r.onend = () => { if (!done) reject(new Error("no-speech")); };
    try { r.start(); } catch (e) { reject(e); }
  });
}

// scheme "Listen": question then answer for every section, built from the
// same data (s[l]) that is rendered on screen
const speakSummary = (s, l, t) => {
  const d = s[l];
  return speakSequence(
    schemeSpeechItems(
      { ...d, docs: d.docs?.length ? d.docs : t.docsUnknown },
      l
    ),
    l
  );
};

/* ---------- small components ---------- */
function Card({ s, l, t, onOpen, compact }) {
  const d = s[l];
  return (
    <article className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
          <s.icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold leading-snug text-orange-950">{d.title}</h3>
          <p className="truncate text-xs font-semibold text-stone-500">{s[l === "ta" ? "en" : "ta"].title}</p>
        </div>
      </div>
      {!compact && <p className="text-sm font-medium leading-snug text-stone-700">{d.desc}</p>}
      <p className="flex items-start gap-1.5 text-sm font-bold text-green-800">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0" /> {d.benefit}
      </p>
      <button
        onClick={() => onOpen(s)}
        className="mt-auto flex min-h-[44px] items-center justify-center gap-1 rounded-xl bg-orange-800 text-sm font-extrabold text-white transition hover:bg-orange-900"
      >
        {t.view} <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );
}

const Block = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl bg-orange-50 p-4">
    <p className="mb-1 flex items-center gap-2 text-base font-extrabold text-orange-900">
      <Icon className="h-5 w-5" /> {title}
    </p>
    <div className="text-base font-semibold leading-relaxed text-stone-800">{children}</div>
  </div>
);

/* ---------- main ---------- */
export function Home({ onStart }) {
  const [l, setL] = useState(() => {
    try { return localStorage.getItem("sakhi_lang") || "ta"; } catch { return "ta"; }
  });
  const t = T[l];
  const [nav, setNav] = useState({ name: "home" });
  const [q, setQ] = useState("");
  const [list, setList] = useState(null);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [fi, setFi] = useState(0);
  const [fa, setFa] = useState({});

  useEffect(() => {
    window.history.replaceState({ name: "home" }, "");
    const h = (e) => { stopSpeak(); setNav(e.state || { name: "home" }); };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);

  // stop any speech when the component unmounts
  useEffect(() => () => stopSpeak(), []);

  const go = (v) => {
    stopSpeak();
    window.history.pushState(v, "");
    setNav(v);
    window.scrollTo(0, 0);
  };
  const back = () => window.history.back();
  const switchLang = (x) => {
    setL(x);
    try { localStorage.setItem("sakhi_lang", x); } catch { /* ignore */ }
    stopSpeak();
    setList(null);
    setSummary("");
    setErr("");
  };
  const openScheme = (s) => go({ name: "scheme", id: s.id });

  async function run(text, forced) {
    const query = (text ?? q).trim();
    if (!query && !forced) return;
    stopSpeak();
    setErr("");
    setBusy(true);
    let found = forced || matchSchemes(query);
    const miss = !found.length;
    if (miss) found = S;
    setList(found);
    if (nav.name !== "results") go({ name: "results" });
    const base = miss
      ? t.empty
      : l === "ta"
        ? `உங்களுக்குப் பொருந்தக்கூடிய ${found.length} திட்டங்கள் உள்ளன. ${found[0].ta.title} முதலில் பாருங்கள். இறுதி தகுதியை அலுவலகத்தில் உறுதி செய்யுங்கள்.`
        : `${found.length} schemes may suit you. Start with ${found[0].en.title}. Please confirm final eligibility at the office.`;
    setSummary(base);
    let say = base;
    if (!miss && query) {
      try {
        const facts = found.map((s) => ({ scheme: s[l].title, benefit: s[l].benefit, who: s[l].who }));
        const raw = await Promise.race([
          callAi([
            {
              role: "system",
              content:
                "You are Magalir Thunai. Use ONLY these verified facts: " + JSON.stringify(facts) +
                `. Reply in very simple spoken ${l === "ta" ? "Tamil" : "English"}, max 2 short sentences, say which schemes may suit her and that final eligibility must be confirmed at the office. Never invent amounts. Return JSON only: {"say_ta": string, "options": [], "stage": "ask", "result": null}`,
            },
            { role: "user", content: query },
          ]),
          new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 6000)),
        ]);
        const p = parseAiJson(raw);
        if (p?.say_ta) say = p.say_ta;
      } catch { /* keep template */ }
    }
    setSummary(say);
    setBusy(false);
    await sayText(say, l);
  }

  async function onMic() {
    if (listening) return;
    if (!canListen()) { setErr(t.noMic); return; }
    stopSpeak();
    setListening(true);
    setErr("");
    try {
      const text = await listenIn(l);
      setListening(false);
      if (!text) throw new Error("empty");
      setQ(text);
      await run(text);
    } catch {
      setListening(false);
      setErr(t.micFail);
    }
  }

  /* find-my-scheme */
  function answer(opt, idx) {
    const k = t.fq[fi].k;
    const next = { ...fa, [k]: idx };
    setFa(next);
    if (fi + 1 < t.fq.length) { setFi(fi + 1); sayQuestion(t.fq[fi + 1].t, l); return; }
    const ids = new Set();
    if (next.studying === 0) ids.add("pudhumai");
    if (next.pregnant === 0) ids.add("pmmvy");
    if (next.age === 3) ids.add("oldage");
    if (next.need === 0) { ids.add("kmut"); }
    if (next.need === 1) ids.add("pudhumai");
    if (next.need === 2) ["widow", "deserted", "unmarried", "oldage", "disab"].forEach((i) => ids.add(i));
    const found = ids.size ? S.filter((s) => ids.has(s.id)) : S.filter((s) => s.cats.includes("women"));
    setList(found);
    setSummary(t.maybe);
    setFi(0);
    setFa({});
    go({ name: "results" });
    sayText(t.maybe, l);
  }

  const startFind = () => { setFi(0); setFa({}); go({ name: "find" }); sayQuestion(t.fq[0].t, l); };

  /* ---------- pieces ---------- */
  const Header = (
    <header className="sticky top-0 z-10 border-b border-orange-100 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button onClick={() => { stopSpeak(); setList(null); go({ name: "home" }); }} className="flex items-center gap-2 text-2xl font-black text-orange-900">
          <Flower2 className="h-7 w-7 text-orange-600" /> {l === "ta" ? "மகளிர் துணை" : "Magalir Thunai"}
        </button>
        <div className="flex overflow-hidden rounded-full bg-white text-sm font-extrabold shadow-sm ring-1 ring-orange-200">
          {["ta", "en"].map((x) => (
            <button
              key={x}
              onClick={() => switchLang(x)}
              className={`px-4 py-2 transition ${l === x ? "bg-orange-800 text-white" : "text-orange-900"}`}
            >
              {x === "ta" ? "தமிழ்" : "English"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );

  const BackBtn = (
    <button
      type="button"
      onClick={back}
      className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-base font-extrabold text-orange-900 transition hover:bg-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" /> {t.back}
    </button>
  );

  const SearchBox = (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-md ring-2 ring-orange-200">
        <Search className="h-5 w-5 shrink-0 text-orange-700" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={t.ph}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base font-semibold outline-none placeholder:text-stone-400"
        />
        <button onClick={onMic} aria-label="mic" className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-800">
          <Mic className="h-5 w-5" />
        </button>
        <button onClick={() => run()} className="rounded-full bg-orange-800 px-5 py-2.5 text-base font-extrabold text-white">
          {t.go}
        </button>
      </div>
    </div>
  );

  const Footer = (
    <footer className="mx-auto max-w-6xl space-y-1 px-4 pb-8 pt-4 text-center">
      <p className="flex items-center justify-center gap-2 text-sm font-bold text-stone-700">
        <ShieldCheck className="h-4 w-4" /> {t.trust1}
      </p>
      <p className="text-xs text-stone-500">{t.trust2}</p>
      <p className="text-xs text-stone-400">SDG 4 · SDG 5 · SDG 10 · PromptWars × HackArena 2026</p>
    </footer>
  );

  const Grid = ({ items }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => <Card key={s.id} s={s} l={l} t={t} onOpen={openScheme} />)}
    </div>
  );

  let body = null;

  if (nav.name === "home") {
    body = (
      <>
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-6 text-center">
          <h1 className="mx-auto max-w-2xl text-2xl font-black leading-snug text-orange-950 md:text-4xl">{t.hero}</h1>
          <p className="mt-2 text-base font-semibold text-stone-600">{t.sub}</p>
          <div className="mt-4 flex flex-col items-center gap-1">
            <button
              onClick={onMic}
              aria-label={t.speak}
              className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-red-800 text-amber-50 shadow-xl ring-4 ring-orange-200 transition active:scale-95 ${listening ? "mic-pulse" : ""}`}
            >
              {listening ? <Loader2 className="h-12 w-12 animate-spin" /> : <Mic className="h-12 w-12" />}
            </button>
            <span className="text-lg font-extrabold text-orange-900">{listening ? t.listening : t.speak}</span>
          </div>
          <div className="mt-4">{SearchBox}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-stone-600">
            {t.ex.map((e) => (
              <button key={e} onClick={() => { setQ(e); run(e); }} className="underline decoration-orange-300">“{e}”</button>
            ))}
          </div>
          {err && <p className="mx-auto mt-3 max-w-xl rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">{err}</p>}
          <button onClick={startFind} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-base font-extrabold text-white shadow transition hover:bg-green-800">
            <Sparkles className="h-5 w-5" /> {t.find}
          </button>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-4">
          <h2 className="mb-3 text-xl font-black text-orange-950">{t.cats}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => go({ name: "category", id: c.id })}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-800"><c.icon className="h-6 w-6" /></span>
                <span className="text-sm font-extrabold leading-tight text-orange-950">{catName(c, l)}</span>
                <span className="text-xs font-semibold text-stone-500">{S.filter((s) => s.cats.includes(c.id)).length} {t.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black text-orange-950">{t.popular}</h2>
            <button onClick={() => go({ name: "all" })} className="flex items-center gap-1 text-sm font-extrabold text-orange-800">
              {t.viewAll} ({S.length}) <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Grid items={[getS("kmut"), getS("pudhumai"), getS("pmmvy")]} />
        </section>
      </>
    );
  }

  if (nav.name === "category") {
    const c = CATS.find((x) => x.id === nav.id);
    body = (
      <section className="mx-auto max-w-6xl px-4 py-6">
        {BackBtn}
        <h1 className="mb-4 text-2xl font-black text-orange-950">{catName(c, l)}</h1>
        <Grid items={S.filter((s) => s.cats.includes(c.id))} />
      </section>
    );
  }

  if (nav.name === "all") {
    const items = S.filter((s) => filter === "all" || s.cats.includes(filter)).filter((s) => {
      const k = q.toLowerCase().trim();
      return !k || s[l].title.toLowerCase().includes(k) || s[l].desc.toLowerCase().includes(k) || matchSchemes(k).includes(s);
    });
    body = (
      <section className="mx-auto max-w-6xl px-4 py-6">
        {BackBtn}
        <h1 className="mb-1 text-2xl font-black text-orange-950">{t.all}</h1>
        <p className="mb-3 text-sm font-semibold text-stone-500">{items.length} {t.count}</p>
        <div className="mb-3">{SearchBox}</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ id: "all", ta: t.allChip, en: t.allChip }, ...CATS].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ring-1 ring-orange-200 ${filter === c.id ? "bg-orange-800 text-white" : "bg-white text-orange-900"}`}
            >
              {c[l]}
            </button>
          ))}
        </div>
        <Grid items={items} />
      </section>
    );
  }

  if (nav.name === "results") {
    const items = list || S;
    body = (
      <section className="mx-auto max-w-6xl px-4 py-6">
        {BackBtn}
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
          {busy ? <Loader2 className="mt-1 h-5 w-5 animate-spin text-orange-700" /> : <Volume2 className="mt-1 h-5 w-5 text-orange-700" />}
          <p className="flex-1 text-base font-bold leading-snug">{busy ? t.wait : summary}</p>
          {!busy && (
            <button onClick={() => sayText(summary, l)} className="rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-900">{t.again}</button>
          )}
        </div>
        <h1 className="mb-1 text-xl font-black text-orange-950">{t.results}</h1>
        <p className="mb-3 text-sm font-semibold text-stone-600">{t.maybe}</p>
        <Grid items={items} />
      </section>
    );
  }

  if (nav.name === "find") {
    const f = t.fq[fi];
    body = (
      <section className="mx-auto max-w-xl px-4 py-6">
        {BackBtn}
        <p className="mb-2 text-sm font-extrabold text-orange-700">{t.q} {fi + 1} / {t.fq.length}</p>
        <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-orange-100">
          <p className="text-2xl font-black leading-snug text-orange-950">{f.t}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {f.o.map((o, i) => (
              <button key={o} onClick={() => answer(o, i)} className="min-h-[60px] rounded-2xl bg-orange-800 text-lg font-extrabold text-white transition hover:bg-orange-900 active:scale-95">{o}</button>
            ))}
          </div>
          <button onClick={() => sayQuestion(f.t, l)} className="mt-4 flex items-center gap-2 text-sm font-extrabold text-orange-900"><Volume2 className="h-4 w-4" /> {t.again}</button>
        </div>
      </section>
    );
  }

  if (nav.name === "scheme") {
    const s = getS(nav.id);
    const d = s[l];
    body = (
      <section className="mx-auto max-w-2xl px-4 py-6">
        {BackBtn}
        <div className="space-y-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-orange-100">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-700 text-white"><s.icon className="h-9 w-9" /></div>
            <div>
              <h1 className="text-xl font-black leading-snug text-orange-950 md:text-2xl">{d.title}</h1>
              <p className="text-sm font-semibold text-stone-500">{s[l === "ta" ? "en" : "ta"].title}</p>
            </div>
          </div>
          <Block icon={Info} title={t.what}>{d.desc}</Block>
          <Block icon={Wallet} title={t.benefit}>{d.benefit}</Block>
          <Block icon={UserCheck} title={t.who}>{d.who}</Block>
          <Block icon={FileText} title={t.docs}>
            {d.docs ? (
              <ul className="list-disc space-y-1 pl-5">{d.docs.map((x) => <li key={x}>{x}</li>)}</ul>
            ) : t.docsUnknown}
          </Block>
          <Block icon={MapPin} title={t.where}>{d.where}</Block>
          <Block icon={ListChecks} title={t.next}>{d.next}</Block>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => speakSummary(s, l, t)} className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-orange-800 text-base font-extrabold text-white">
              <Volume2 className="h-5 w-5" /> {t.listen}
            </button>
            {s.voice ? (
              <button onClick={onStart} className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-green-700 text-base font-extrabold text-white">
                <Mic className="h-5 w-5" /> {t.voiceCheck}
              </button>
            ) : s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-stone-800 text-base font-extrabold text-white">
                <ExternalLink className="h-5 w-5" /> {t.official}
              </a>
            ) : null}
          </div>
          {s.voice && s.url && (
            <a href={s.url} target="_blank" rel="noreferrer" className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-stone-800 text-base font-extrabold text-white">
              <ExternalLink className="h-5 w-5" /> {t.official}
            </a>
          )}
          <button
            type="button"
            onClick={() => stopSpeak()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-red-900/30 bg-white px-4 text-base font-extrabold text-red-900 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Square className="h-4 w-4" fill="currentColor" aria-hidden="true" /> {t.stop}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-stone-900">
      {Header}
      {body}
      {Footer}
    </div>
  );
}