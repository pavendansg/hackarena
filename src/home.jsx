import { useEffect, useRef, useState } from "react";
import {
  Volume2, Mic, Search, ArrowLeft, ShieldCheck, Loader2, MapPin, ListChecks, Wallet,
  UserCheck, Info, FileText, ExternalLink, Sparkles, Square, ChevronRight, ChevronDown,
  Flower2, Globe, Check, Languages, Share2,
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
import { LANGS, BCP, AI_LANG, BRAND, T } from "./i18n.js";
import { CATS, S, getS, matchSchemes } from "./catalogue.js";

/* ---------- compat exports for App.jsx ---------- */
export const infoText = (s) => s?.title || "";
export function InfoScreen() { return null; }

/* ---------- helpers ---------- */
const catName = (c, l) => c[l];
const countLabel = (n, t) => `${n} ${n === 1 ? t.count1 : t.count}`;
const altLang = (l) => (l === "en" ? "ta" : "en");

// /s/kmut?lang=hi  or  /?scheme=kmut&lang=hi — a shared link opens the right scheme in the right language
function readUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    const lang = p.get("lang");
    const scheme =
      p.get("scheme") || (window.location.pathname.match(/^\/s\/([\w-]+)\/?$/) || [])[1];
    return {
      lang: LANGS.some((x) => x.id === lang) ? lang : null,
      scheme: scheme && getS(scheme) ? scheme : null,
    };
  } catch {
    return { lang: null, scheme: null };
  }
}

// WhatsApp message: title, benefit, documents, a reminder to confirm, and a link
function whatsappUrl(s, l, t) {
  const d = s[l];
  const lines = [`*${d.title}*`, d.benefit, ""];
  if (d.docs?.length) {
    lines.push(`${t.docs}:`);
    d.docs.forEach((x) => lines.push(`• ${x}`));
    lines.push("", t.docsNote);
  }
  lines.push(
    t.notOfficial,
    "",
    `${BRAND[l]}: ${window.location.origin}/s/${s.id}?lang=${l}`
  );
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}

// Google Maps search for the nearest office / centre
const mapsUrl = (s) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.map)}`;

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
    r.lang = BCP[lang] || "en-IN";
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
function StatusChip({ s, t }) {
  if (!s.status) return null;
  const cls =
    s.status === "change"
      ? "bg-amber-100 text-amber-900"
      : s.status === "new"
        ? "bg-sky-100 text-sky-900"
        : "bg-green-100 text-green-800";
  const label = s.status === "change" ? t.stChange : s.status === "new" ? t.stNew : t.stActive;
  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {label}
    </span>
  );
}

function Card({ s, l, t, onOpen, compact }) {
  const d = s[l];
  return (
    <article className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
          <s.icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold leading-snug text-orange-950">{d.title}</h3>
          <p className="truncate text-xs font-semibold text-stone-500">{s[altLang(l)].title}</p>
        </div>
      </div>
      <StatusChip s={s} t={t} />
      {!compact && <p className="text-sm font-medium leading-snug text-stone-700">{d.desc}</p>}
      <div className="flex items-start gap-2 rounded-xl bg-green-50 p-2.5 text-sm font-bold leading-snug text-green-900">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{d.benefit}</span>
      </div>
      <button
        onClick={() => onOpen(s)}
        className="mt-auto flex min-h-[44px] items-center justify-center gap-1 rounded-xl bg-orange-800 text-sm font-extrabold text-white transition hover:bg-orange-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      >
        {t.view} <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}

const Block = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl bg-orange-50 p-4">
    <p className="mb-1.5 flex items-center gap-2 text-base font-extrabold text-orange-900">
      <Icon className="h-5 w-5" aria-hidden="true" /> {title}
    </p>
    <div className="text-base font-semibold leading-relaxed text-stone-800">{children}</div>
  </div>
);

/* ---------- main ---------- */
export function Home({ onStart }) {
  const urlInit = useRef(null);
  if (urlInit.current === null) urlInit.current = readUrl();
  const initRef = useRef(false);

  const [l, setL] = useState(() => {
    if (urlInit.current.lang) return urlInit.current.lang;
    try {
      const v = localStorage.getItem("sakhi_lang");
      return LANGS.some((x) => x.id === v) ? v : "ta";
    } catch { return "ta"; }
  });
  const [firstVisit, setFirstVisit] = useState(() => {
    if (urlInit.current.lang) return false;
    try { return localStorage.getItem("sakhi_lang") === null; } catch { return false; }
  });
  const t = T[l];
  const [nav, setNav] = useState(() =>
    urlInit.current.scheme ? { name: "scheme", id: urlInit.current.scheme } : { name: "home" }
  );
  const [q, setQ] = useState("");
  const [list, setList] = useState(null);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [fi, setFi] = useState(0);
  const [fa, setFa] = useState({});
  const [langOpen, setLangOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const langRef = useRef(null);
  const spRef = useRef(0);

  // stop everything (speech + the "speaking" indicator)
  const stopAll = () => {
    spRef.current++;
    setSpeaking(false);
    stopSpeak();
  };

  // speak something and show the "speaking" state until it finishes
  const speakNow = (fn) => {
    const id = ++spRef.current;
    setSpeaking(true);
    Promise.resolve(fn()).finally(() => {
      if (spRef.current === id) setSpeaking(false);
    });
  };

  useEffect(() => { document.documentElement.lang = l; }, [l]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      window.history.replaceState({ name: "home" }, "", "/");
      if (urlInit.current.scheme) {
        window.history.pushState({ name: "scheme", id: urlInit.current.scheme }, "");
      }
    }
    const h = (e) => { stopAll(); setNav(e.state || { name: "home" }); };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stop any speech when the component unmounts
  useEffect(() => () => stopSpeak(), []);

  // close the language menu when clicking outside
  useEffect(() => {
    if (!langOpen) return undefined;
    const h = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [langOpen]);

  const go = (v) => {
    stopAll();
    window.history.pushState(v, "");
    setNav(v);
    window.scrollTo(0, 0);
  };
  const back = () => window.history.back();
  const switchLang = (x) => {
    setL(x);
    try { localStorage.setItem("sakhi_lang", x); } catch { /* ignore */ }
    stopAll();
    setList(null);
    setSummary("");
    setErr("");
    setFi(0);
    setFa({});
  };
  const openScheme = (s) => go({ name: "scheme", id: s.id });

  async function run(text, forced) {
    const query = (text ?? q).trim();
    if (!query && !forced) return;
    stopAll();
    setErr("");
    setBusy(true);
    let found = forced || matchSchemes(query);
    const miss = !found.length;
    if (miss) found = S;
    setList(found);
    if (nav.name !== "results") go({ name: "results" });
    const base = miss ? t.empty : t.found(found.length, found[0][l].title);
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
                `. Reply in very simple spoken ${AI_LANG[l]}, max 2 short sentences, say which schemes may suit her and that final eligibility must be confirmed at the office. Never invent amounts. Return JSON only: {"say_ta": string, "options": [], "stage": "ask", "result": null}`,
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
    stopAll();
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
    if (next.pregnant === 0) { ids.add("pmmvy"); ids.add("muthulakshmi"); }
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
  const LangMenu = (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold text-orange-900 shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {LANGS.find((x) => x.id === l).label}
        <ChevronDown className={`h-4 w-4 transition ${langOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {langOpen && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-2xl bg-white p-1 shadow-lg ring-1 ring-orange-100"
        >
          {LANGS.map((x) => (
            <li key={x.id} role="option" aria-selected={l === x.id}>
              <button
                type="button"
                onClick={() => { switchLang(x.id); setLangOpen(false); }}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-base font-bold ${l === x.id ? "bg-orange-50 text-orange-900" : "text-stone-800 hover:bg-orange-50"}`}
              >
                {x.label}
                {l === x.id && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const Header = (
    <header className="sticky top-0 z-10 border-b border-orange-100 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <button
          onClick={() => { stopAll(); setList(null); go({ name: "home" }); }}
          className="flex min-w-0 items-center gap-2 text-xl font-black text-orange-900 sm:text-2xl"
        >
          <Flower2 className="h-7 w-7 shrink-0 text-orange-600" aria-hidden="true" />
          <span className="truncate">{BRAND[l]}</span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => go({ name: "help" })}
            aria-label={t.helpLink}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-orange-900 shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Info className="h-5 w-5" aria-hidden="true" />
          </button>
          {LangMenu}
        </div>
      </div>
    </header>
  );

  const BackBtn = (
    <button
      type="button"
      onClick={back}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-base font-extrabold text-orange-900 transition hover:bg-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" /> {t.back}
    </button>
  );

  const allItems = () =>
    S.filter((s) => filter === "all" || s.cats.includes(filter)).filter((s) => {
      const k = q.toLowerCase().trim();
      return !k || s[l].title.toLowerCase().includes(k) || s[l].desc.toLowerCase().includes(k) || matchSchemes(k).includes(s);
    });

  // what "Listen to this page" reads: heading (question voice) + content (answer voice)
  const pageItems = () => {
    const names = (arr) => arr.map((x) => x[l].title).join(". ");
    if (nav.name === "home") {
      return [
        { q: t.hero, a: t.sub },
        { q: t.cats, a: CATS.map((c) => c[l]).join(", ") },
        { q: t.popular, a: names([getS("kmut"), getS("payanam"), getS("pudhumai")]) },
      ];
    }
    if (nav.name === "category") {
      const c = CATS.find((x) => x.id === nav.id);
      return [{ q: c[l], a: names(S.filter((x) => x.cats.includes(c.id))) }];
    }
    if (nav.name === "all") return [{ q: t.all, a: names(allItems()) }];
    if (nav.name === "results") {
      return [
        { q: t.results, a: busy ? "" : summary },
        { q: "", a: names(list || S) },
      ];
    }
    if (nav.name === "find") return [{ q: t.fq[fi].t, a: t.fq[fi].o.join(", ") }];
    if (nav.name === "help") {
      return [
        { q: t.aboutTitle, a: t.aboutText },
        ...t.faq.map((f) => ({ q: f.q, a: f.a })),
        { q: t.privTitle, a: t.priv.join(" ") },
      ];
    }
    return [];
  };

  const PageListen =
    nav.name === "scheme" ? null : (
      <button
        type="button"
        onClick={() => (speaking ? stopAll() : speakNow(() => speakSequence(pageItems(), l)))}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-orange-100 px-4 text-base font-extrabold text-orange-900 transition hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {speaking ? (
          <Square className="h-4 w-4" fill="currentColor" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
        {speaking ? t.stop : t.listenPage}
      </button>
    );

  const TopRow = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      {BackBtn}
      {PageListen}
    </div>
  );

  const pickLang = (x) => {
    switchLang(x);
    setFirstVisit(false);
    speakNow(() => sayText(T[x].welcome, x));
  };

  // first visit: big, simple language choice (no dropdown to find)
  const Picker = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose your language"
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100"
    >
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-5 px-5 py-8 text-center">
        <Flower2 className="h-12 w-12 text-orange-600" aria-hidden="true" />
        <h1 className="text-3xl font-black text-orange-900">மகளிர் துணை</h1>
        <p className="-mt-3 text-sm font-bold text-stone-600">Magalir Thunai</p>
        <div className="space-y-1 text-lg font-extrabold leading-snug text-orange-950">
          <p>உங்கள் மொழியைத் தேர்ந்தெடுங்கள்</p>
          <p>Choose your language</p>
          <p>अपनी भाषा चुनें</p>
          <p>మీ భాషను ఎంచుకోండి</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          {LANGS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => pickLang(x.id)}
              className="min-h-[72px] rounded-2xl bg-white text-2xl font-black text-orange-900 shadow-md ring-2 ring-orange-200 transition hover:bg-orange-50 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const SearchBox = (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-md ring-2 ring-orange-200 focus-within:ring-orange-400">
        <Search className="h-5 w-5 shrink-0 text-orange-700" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={t.ph}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base font-semibold outline-none placeholder:text-stone-400"
        />
        <button onClick={onMic} aria-label={t.speak} className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-800 transition hover:bg-orange-200">
          <Mic className="h-5 w-5" aria-hidden="true" />
        </button>
        <button onClick={() => run()} className="rounded-full bg-orange-800 px-5 py-2.5 text-base font-extrabold text-white transition hover:bg-orange-900">
          {t.go}
        </button>
      </div>
    </div>
  );

  const Footer = (
    <footer className="mx-auto max-w-6xl space-y-1 px-4 pb-8 pt-4 text-center">
      <p className="flex items-center justify-center gap-2 text-sm font-bold text-stone-700">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {t.trust1}
      </p>
      <p className="text-xs text-stone-500">{t.trust2}</p>
      <p className="text-xs font-semibold text-stone-600">{t.notOfficial}</p>
      <button
        type="button"
        onClick={() => go({ name: "help" })}
        className="mx-auto inline-flex min-h-[44px] items-center px-3 text-sm font-extrabold text-orange-800 underline decoration-orange-300"
      >
        {t.helpLink}
      </button>
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
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[[Mic, t.chipVoice], [Languages, t.chipLang], [ShieldCheck, t.chipSafe]].map(([Icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-orange-900 ring-1 ring-orange-100">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-center">{PageListen}</div>
          <div className="mt-4 flex flex-col items-center gap-1">
            <button
              onClick={onMic}
              aria-label={t.speak}
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-red-800 text-amber-50 shadow-xl ring-4 ring-orange-200 transition active:scale-95 ${listening ? "mic-pulse" : ""}`}
            >
              {listening ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
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
            <Sparkles className="h-5 w-5" aria-hidden="true" /> {t.find}
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
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.tint}`}><c.icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="text-sm font-extrabold leading-tight text-orange-950">{catName(c, l)}</span>
                <span className="text-xs font-semibold text-stone-500">{countLabel(S.filter((s) => s.cats.includes(c.id)).length, t)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black text-orange-950">{t.popular}</h2>
            <button onClick={() => go({ name: "all" })} className="flex items-center gap-1 text-sm font-extrabold text-orange-800">
              {t.viewAll} ({S.length}) <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <Grid items={[getS("kmut"), getS("payanam"), getS("pudhumai")]} />
        </section>
      </>
    );
  }

  if (nav.name === "category") {
    const c = CATS.find((x) => x.id === nav.id);
    body = (
      <section className="mx-auto max-w-6xl px-4 py-6">
        {TopRow}
        <h1 className="mb-4 text-2xl font-black text-orange-950">{catName(c, l)}</h1>
        <Grid items={S.filter((s) => s.cats.includes(c.id))} />
      </section>
    );
  }

  if (nav.name === "all") {
    const items = allItems();
    body = (
      <section className="mx-auto max-w-6xl px-4 py-6">
        {TopRow}
        <h1 className="mb-1 text-2xl font-black text-orange-950">{t.all}</h1>
        <p className="mb-3 text-sm font-semibold text-stone-500">{countLabel(items.length, t)}</p>
        <div className="mb-3">{SearchBox}</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ id: "all", ta: t.allChip, en: t.allChip, hi: t.allChip, te: t.allChip }, ...CATS].map((c) => (
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
        {TopRow}
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
        {TopRow}
        <p className="mb-2 text-sm font-extrabold text-orange-700">{t.q} {fi + 1} / {t.fq.length}</p>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-orange-100">
          <div
            className="h-full rounded-full bg-orange-700 transition-all"
            style={{ width: `${((fi + 1) / t.fq.length) * 100}%` }}
          />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-orange-100">
          <p className="text-2xl font-black leading-snug text-orange-950">{f.t}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {f.o.map((o, i) => (
              <button key={o} onClick={() => answer(o, i)} className="min-h-[60px] rounded-2xl bg-orange-800 text-lg font-extrabold text-white transition hover:bg-orange-900 active:scale-95">{o}</button>
            ))}
          </div>
          <button onClick={() => sayQuestion(f.t, l)} className="mt-4 flex items-center gap-2 text-sm font-extrabold text-orange-900"><Volume2 className="h-4 w-4" aria-hidden="true" /> {t.again}</button>
        </div>
      </section>
    );
  }

  if (nav.name === "help") {
    body = (
      <section className="mx-auto max-w-2xl px-4 py-6">
        {TopRow}
        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-orange-100">
          <h1 className="text-2xl font-black text-orange-950">{t.aboutTitle}</h1>
          <p className="text-base font-semibold leading-relaxed text-stone-800">{t.aboutText}</p>
          <button
            type="button"
            onClick={() => speakNow(() => sayText(t.aboutText, l))}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-orange-100 px-4 text-base font-extrabold text-orange-900"
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" /> {t.listen}
          </button>
          <h2 className="pt-2 text-xl font-black text-orange-950">{t.faqTitle}</h2>
          <div className="space-y-2">
            {t.faq.map((f) => (
              <details key={f.q} className="rounded-xl bg-orange-50 p-4">
                <summary className="cursor-pointer text-base font-extrabold text-orange-900">{f.q}</summary>
                <p className="mt-2 text-base font-semibold leading-relaxed text-stone-800">{f.a}</p>
              </details>
            ))}
          </div>
          <h2 className="flex items-center gap-2 pt-2 text-xl font-black text-orange-950">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" /> {t.privTitle}
          </h2>
          <ul className="space-y-2">
            {t.priv.map((x) => (
              <li key={x} className="flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-base font-semibold leading-relaxed text-stone-800">
                <Check className="mt-1 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (nav.name === "scheme") {
    const s = getS(nav.id);
    const d = s[l];
    body = (
      <section className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4">{BackBtn}</div>
        <div className="space-y-3 rounded-3xl bg-white p-5 shadow-md ring-1 ring-orange-100">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-700 text-white"><s.icon className="h-9 w-9" aria-hidden="true" /></div>
            <div className="min-w-0">
              <h1 className="text-xl font-black leading-snug text-orange-950 md:text-2xl">{d.title}</h1>
              <p className="text-sm font-semibold text-stone-500">{s[altLang(l)].title}</p>
              <div className="mt-1"><StatusChip s={s} t={t} /></div>
            </div>
          </div>

          <Block icon={Info} title={t.what}>{d.desc}</Block>

          <div className="rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
            <p className="mb-1 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-green-800">
              <Wallet className="h-4 w-4" aria-hidden="true" /> {t.youGet}
            </p>
            <p className="text-lg font-black leading-snug text-green-950">{d.benefit}</p>
          </div>

          <Block icon={UserCheck} title={t.who}>{d.who}</Block>

          <Block icon={FileText} title={t.docs}>
            {d.docs?.length ? (
              <>
                <ul className="space-y-2">
                  {d.docs.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-semibold text-stone-500">{t.docsNote}</p>
              </>
            ) : t.docsUnknown}
          </Block>

          <Block icon={MapPin} title={t.where}>
            <p>{d.where}</p>
            {s.map && (
              <a
                href={mapsUrl(s)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-orange-300 bg-white px-4 text-base font-extrabold text-orange-900 transition hover:bg-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <MapPin className="h-5 w-5" aria-hidden="true" /> {t.nearMap}
              </a>
            )}
          </Block>
          <Block icon={ListChecks} title={t.next}>{d.next}</Block>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => speakNow(() => speakSummary(s, l, t))}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-orange-800 text-base font-extrabold text-white transition hover:bg-orange-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <Volume2 className={`h-5 w-5 ${speaking ? "animate-pulse" : ""}`} aria-hidden="true" />
              {speaking ? t.speaking : t.listen}
            </button>
            {s.voice && (l === "ta" || l === "en") ? (
              <button onClick={onStart} className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-green-700 text-base font-extrabold text-white">
                <Mic className="h-5 w-5" aria-hidden="true" /> {t.voiceCheck}
              </button>
            ) : s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-stone-800 text-base font-extrabold text-white">
                <ExternalLink className="h-5 w-5" aria-hidden="true" /> {t.official}
              </a>
            ) : null}
          </div>
          {s.voice && s.url && (l === "ta" || l === "en") && (
            <a href={s.url} target="_blank" rel="noreferrer" className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-stone-800 text-base font-extrabold text-white">
              <ExternalLink className="h-5 w-5" aria-hidden="true" /> {t.official}
            </a>
          )}
          {s.voice && s.url && !(l === "ta" || l === "en") && (
            <a href={s.url} target="_blank" rel="noreferrer" className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-stone-800 text-base font-extrabold text-white">
              <ExternalLink className="h-5 w-5" aria-hidden="true" /> {t.official}
            </a>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappUrl(s, l, t)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-green-700/40 bg-white px-4 text-base font-extrabold text-green-800 transition hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" /> {t.shareWa}
            </a>
            <button
              type="button"
              onClick={stopAll}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-red-900/30 bg-white px-4 text-base font-extrabold text-red-900 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Square className="h-4 w-4" fill="currentColor" aria-hidden="true" /> {t.stop}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-stone-900">
      {Header}
      {body}
      {Footer}
      {firstVisit && Picker}
    </div>
  );
}