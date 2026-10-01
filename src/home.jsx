import { useState } from "react";
import {
  Volume2, Mic, Search, Baby, GraduationCap, Flower2, Accessibility, Users, PiggyBank,
  ArrowLeft, ShieldCheck, Loader2, MapPin, ListChecks, Wallet, UserCheck, Info,
} from "lucide-react";
import { callAi, parseAiJson, listenTamil, canListen, speakTamil, stopSpeak } from "./sakhi.js";

export const SCHEMES = [
  {
    id: "kmut", icon: Flower2, tag: "பெண்கள்", cats: ["women", "money"],
    kw: ["பெண்", "மகளிர்", "மாதம்", "பணம்", "உரிமை", "குடும்பத் தலைவி", "குடும்ப தலைவி", "உதவித்தொகை"],
    title: "கலைஞர் மகளிர் உரிமைத் தொகை",
    benefit: "மாதம் 1,000 ரூபாய் வங்கிக் கணக்கில்.",
    desc: "தமிழ்நாடு அரசின் மாதாந்திர நிதி உதவித் திட்டம்.",
    who: "தகுதியுள்ள குடும்பங்களின் பெண் தலைவிகளுக்கு.",
    where: "e-Sevai மையம் அல்லது அருகிலுள்ள அரசு அலுவலகத்தில் கேளுங்கள்.",
    next: "தகுதி விதிகள் மாறியிருக்கலாம். அலுவலகத்தில் இப்போதைய விதிகளைக் கேளுங்கள்.",
  },
  {
    id: "pudhumai", icon: GraduationCap, tag: "கல்வி", cats: ["women", "edu", "money"],
    kw: ["கல்லூரி", "படிக்க", "படிப்பு", "மாணவி", "கல்வி", "புதுமை", "பள்ளி"],
    title: "புதுமைப் பெண் திட்டம்",
    benefit: "மாதம் 1,000 ரூபாய்.",
    desc: "உயர்கல்வி படிக்கும் மாணவிகளுக்கான உதவித்தொகை.",
    who: "அரசுப் பள்ளியில் 6 முதல் 12 வரை படித்து, உயர்கல்வியில் சேர்ந்த மாணவிகளுக்கு.",
    where: "உங்கள் கல்லூரி அலுவலகத்தில் கேளுங்கள்.",
    next: "கல்லூரி அலுவலகத்தில் விண்ணப்ப முறையைக் கேளுங்கள்.",
  },
  {
    id: "pmmvy", icon: Baby, tag: "கர்ப்பம் & குழந்தை", cats: ["women", "preg", "money"], voice: true,
    kw: ["கர்ப்ப", "குழந்தை", "பிரசவ", "மகப்பேறு", "தாய்", "மாத்ரு", "பிறக்க"],
    title: "மாத்ரு வந்தனா யோஜனா",
    benefit: "முதல் குழந்தைக்கு 5,000 ரூபாய் இரண்டு தவணையில்.",
    desc: "கர்ப்பிணி மற்றும் பாலூட்டும் தாய்மார்களுக்கான மத்திய அரசு உதவி.",
    who: "குரலில் உங்கள் தகுதியை சரிபார்க்கலாம்.",
    where: "அருகிலுள்ள அங்கன்வாடி நிலையம்.",
    next: "குரல் சரிபார்ப்பைத் தொடங்குங்கள்.",
  },
  {
    id: "widow", icon: Users, tag: "ஓய்வூதியம்", cats: ["women", "pension", "money"],
    kw: ["விதவை", "கணவர் இறந்த", "கணவன் இறந்த", "ஓய்வூதியம்", "பென்ஷன்", "ஆதரவற்ற"],
    title: "ஆதரவற்ற விதவை ஓய்வூதியம்",
    benefit: "மாதாந்திர ஓய்வூதியம். தொகையை அலுவலகத்தில் உறுதி செய்யுங்கள்.",
    desc: "தமிழ்நாடு அரசின் சமூகப் பாதுகாப்புத் திட்டம்.",
    who: "ஆதரவற்ற விதவைகளுக்கு. வயது, வருமான விதிகளை அலுவலகத்தில் கேளுங்கள்.",
    where: "e-Sevai மையம் அல்லது வட்டாட்சியர் அலுவலகம்.",
    next: "அங்கே தகுதி விதிகளையும் ஆவணங்களையும் கேளுங்கள்.",
  },
  {
    id: "disab", icon: Accessibility, tag: "மாற்றுத்திறனாளி", cats: ["pension", "money"],
    kw: ["மாற்றுத்திறன", "ஊனம்", "ஊனமுற்ற", "ஓய்வூதியம்", "பென்ஷன்"],
    title: "மாற்றுத்திறனாளி ஓய்வூதியம்",
    benefit: "மாதாந்திர ஓய்வூதியம். தொகையை அலுவலகத்தில் உறுதி செய்யுங்கள்.",
    desc: "மாற்றுத்திறனாளிகளுக்கான சமூகப் பாதுகாப்புத் திட்டம்.",
    who: "தகுதியுள்ள மாற்றுத்திறனாளிகளுக்கு.",
    where: "e-Sevai மையம் அல்லது மாவட்ட மாற்றுத்திறனாளி நல அலுவலகம்.",
    next: "அங்கே தகுதி விதிகளையும் ஆவணங்களையும் கேளுங்கள்.",
  },
  {
    id: "ssy", icon: PiggyBank, tag: "பெண் குழந்தை", cats: ["women", "money"],
    kw: ["பெண் குழந்தை", "சேமிப்பு", "செல்வமகள்", "மகள்"],
    title: "செல்வமகள் சேமிப்புத் திட்டம்",
    benefit: "பெண் குழந்தையின் பெயரில் சிறு சேமிப்புக் கணக்கு.",
    desc: "பெண் குழந்தையின் எதிர்காலத்துக்கான மத்திய அரசு சேமிப்புத் திட்டம்.",
    who: "பெண் குழந்தையின் பெற்றோர் அல்லது பாதுகாவலருக்கு.",
    where: "அஞ்சலகம் அல்லது வங்கி.",
    next: "அங்கே வட்டி விகிதம், விதிகளைக் கேளுங்கள்.",
  },
];

const CATS = [
  { id: "women", t: "பெண்கள்" },
  { id: "preg", t: "கர்ப்பம்" },
  { id: "edu", t: "கல்வி" },
  { id: "money", t: "நிதி உதவி" },
  { id: "pension", t: "ஓய்வூதியம்" },
];

const EXAMPLES = ["கர்ப்பமாக இருக்கிறேன்", "நான் கல்லூரியில் படிக்கிறேன்", "மாதம் பணம் கிடைக்குமா"];

export const infoText = (s) =>
  `${s.title}. ${s.benefit} ${s.who} ${s.where} இறுதி தகுதியை அரசு அலுவலகத்தில் உறுதி செய்யுங்கள்.`;

function matchSchemes(q) {
  const t = q.trim();
  if (!t) return [];
  const scored = SCHEMES.map((s) => ({
    s,
    score: s.kw.reduce((n, k) => n + (t.includes(k) ? 2 : 0), 0) + (t.includes(s.title) ? 5 : 0),
  })).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.s);
}

const Wrap = ({ children }) => (
  <div className="min-h-svh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-stone-900">{children}</div>
);

function SchemeCard({ s, onOpen, note }) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
          <s.icon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <span className="rounded-full bg-orange-100 px-3 py-0.5 text-sm font-bold text-orange-900">{s.tag}</span>
          <h3 className="mt-1 text-xl font-black leading-snug text-orange-950">{s.title}</h3>
        </div>
      </div>
      <p className="flex items-start gap-2 text-lg font-bold text-green-800">
        <Wallet className="mt-1 h-5 w-5 shrink-0" /> {s.benefit}
      </p>
      <p className="text-base font-medium leading-snug text-stone-700">{note || s.desc}</p>
      <button
        onClick={() => onOpen(s)}
        className="mt-auto flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-orange-800 text-lg font-black text-white shadow"
      >
        {s.voice ? <Mic className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        {s.voice ? "குரலில் தகுதி சரிபார்" : "விவரங்களைப் பார்க்க"}
      </button>
    </article>
  );
}

export function Home({ onStart, onInfo }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState("home");
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState("");

  const open = (s) => (s.voice ? onStart() : onInfo(s));

  async function run(text, forced) {
    const query = (text ?? q).trim();
    if (!query && !forced) return;
    stopSpeak();
    setErr("");
    setBusy(true);
    let found = forced || matchSchemes(query);
    let miss = false;
    if (!found.length) {
      found = SCHEMES;
      miss = true;
    }
    setList(found);
    setView("results");
    const base = miss
      ? "உங்கள் கேள்விக்குப் பொருந்தும் திட்டம் தெரியவில்லை. எங்களிடம் உள்ள திட்டங்களைக் காட்டுகிறேன்."
      : `உங்களுக்குப் பொருந்தக்கூடிய ${found.length} திட்டங்கள் உள்ளன. ${found[0].title} முதலில் பாருங்கள்.`;
    setSummary(base);
    let say = base;
    if (!miss) {
      try {
        const facts = found.map((s) => ({ திட்டம்: s.title, உதவி: s.benefit, யாருக்கு: s.who }));
        const raw = await Promise.race([
          callAi([
            {
              role: "system",
              content:
                'You are Sakhi. Using ONLY these verified facts: ' + JSON.stringify(facts) +
                '. Reply in very simple spoken Tamil, max 2 short sentences, tell her which schemes may suit her and that final eligibility must be confirmed at the office. Never invent amounts. Return JSON only: {"say_ta": string, "options": [], "stage": "ask", "result": null}',
            },
            { role: "user", content: query },
          ]),
          new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 6000)),
        ]);
        const p = parseAiJson(raw);
        if (p?.say_ta) say = p.say_ta;
      } catch {
        /* keep template */
      }
    }
    setSummary(say);
    setBusy(false);
    await speakTamil(say);
  }

  async function onMic() {
    if (listening) return;
    if (!canListen()) {
      setErr("இந்த உலாவியில் குரல் வசதி இல்லை. Chrome அல்லது Edge பயன்படுத்துங்கள், அல்லது எழுதுங்கள்.");
      return;
    }
    stopSpeak();
    setListening(true);
    setErr("");
    try {
      const text = await listenTamil();
      setListening(false);
      if (!text) throw new Error("empty");
      setQ(text);
      await run(text);
    } catch {
      setListening(false);
      setErr("குரல் கிடைக்கவில்லை. மீண்டும் முயலுங்கள் அல்லது எழுதுங்கள்.");
    }
  }

  const Search_ = (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-lg ring-2 ring-orange-200">
        <Search className="h-6 w-6 shrink-0 text-orange-700" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="உங்கள் கேள்வியை எழுதுங்கள்..."
          className="min-w-0 flex-1 bg-transparent py-3 text-lg font-semibold outline-none placeholder:text-stone-400"
        />
        <button
          onClick={() => run()}
          className="rounded-full bg-orange-800 px-5 py-3 text-lg font-black text-white"
        >
          தேடு
        </button>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setQ(c.t);
              run(c.t, SCHEMES.filter((s) => s.cats.includes(c.id)));
            }}
            className="rounded-full bg-white px-4 py-2 text-base font-bold text-orange-900 shadow-sm ring-1 ring-orange-200"
          >
            {c.t}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Wrap>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <button onClick={() => { stopSpeak(); setView("home"); }} className="text-3xl font-black text-orange-900">
          சகி
        </button>
        <span className="rounded-full bg-orange-100 px-4 py-1 text-sm font-bold text-orange-900">
          எழுத வேண்டாம் · பேசினால் போதும்
        </span>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-6 pt-2 text-center">
        <h1 className="mx-auto max-w-3xl text-3xl font-black leading-snug text-orange-950 md:text-5xl">
          உங்களுக்கு கிடைக்கக்கூடிய அரசு திட்டங்களை கண்டுபிடிப்போம்
        </h1>
        <p className="mt-2 text-lg font-semibold text-stone-700">தமிழில் பேசுங்கள் அல்லது எழுதுங்கள்.</p>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            onClick={onMic}
            aria-label="பேச தொடங்குங்கள்"
            className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-red-800 text-amber-50 shadow-2xl ring-8 ring-orange-200 transition active:scale-95 ${
              listening ? "mic-pulse" : ""
            }`}
          >
            {listening ? <Loader2 className="h-14 w-14 animate-spin" /> : <Mic className="h-14 w-14" />}
          </button>
          <span className="text-2xl font-black text-orange-900">
            {listening ? "கேட்கிறேன்..." : "பேச தொடங்குங்கள்"}
          </span>
        </div>

        <p className="my-4 text-base font-bold text-stone-500">அல்லது கீழே எழுதுங்கள்</p>
        {Search_}

        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm font-semibold text-stone-600">
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => { setQ(e); run(e); }} className="underline decoration-orange-300">
              “{e}”
            </button>
          ))}
        </div>
        {err ? <p className="mx-auto mt-3 max-w-xl rounded-2xl bg-rose-50 p-3 font-semibold text-rose-800">{err}</p> : null}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-6">
        {view === "results" ? (
          <>
            <div className="mb-4 flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm">
              {busy ? <Loader2 className="mt-1 h-6 w-6 animate-spin text-orange-700" /> : <Volume2 className="mt-1 h-6 w-6 text-orange-700" />}
              <p className="flex-1 text-lg font-bold leading-snug">{busy ? "ஒரு நிமிடம்..." : summary}</p>
              {!busy ? (
                <button onClick={() => speakTamil(summary)} className="rounded-full bg-orange-100 px-4 py-2 font-black text-orange-900">
                  மீண்டும் கேள்
                </button>
              ) : null}
            </div>
            <h2 className="mb-3 text-2xl font-black text-orange-950">உங்களுக்கு பொருந்தக்கூடிய திட்டங்கள்</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((s) => (
                <SchemeCard key={s.id} s={s} onOpen={open} note="அதிகம் பொருந்தலாம். இறுதி தகுதியை அலுவலகத்தில் உறுதி செய்யுங்கள்." />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-2xl font-black text-orange-950">பிரபலமான திட்டங்கள்</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {SCHEMES.slice(0, 3).map((s) => (
                <SchemeCard key={s.id} s={s} onOpen={open} />
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="mx-auto max-w-5xl space-y-1 px-4 pb-10 pt-2 text-center">
        <p className="flex items-center justify-center gap-2 text-base font-bold text-stone-700">
          <ShieldCheck className="h-5 w-5" /> சகி உங்கள் ஆதார் எண் அல்லது OTP-ஐ கேட்காது.
        </p>
        <p className="text-sm text-stone-500">
          இது வழிகாட்டுதலுக்காக மட்டுமே. இறுதி தகுதியை அரசு அதிகாரப்பூர்வமாக சரிபார்க்கும்.
        </p>
        <p className="text-xs text-stone-400">SDG 4 · SDG 5 · SDG 10 · PromptWars × HackArena 2026</p>
      </footer>
    </Wrap>
  );
}

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl bg-orange-50 p-4">
    <p className="mb-1 flex items-center gap-2 text-lg font-black text-orange-900">
      <Icon className="h-5 w-5" /> {title}
    </p>
    <p className="text-lg font-semibold leading-relaxed">{children}</p>
  </div>
);

export function InfoScreen({ s, onBack, onListen }) {
  if (!s) return null;
  return (
    <Wrap>
      <main className="mx-auto max-w-2xl px-4 py-6 md:py-12">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-lg font-black text-orange-900">
          <ArrowLeft className="h-6 w-6" /> திரும்பு
        </button>
        <div className="space-y-3 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-rose-700 text-white">
              <s.icon className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-black leading-snug text-orange-950 md:text-3xl">{s.title}</h1>
          </div>
          <Section icon={Info} title="இந்த திட்டம் என்ன?">{s.desc}</Section>
          <Section icon={Wallet} title="கிடைக்கும் உதவி">{s.benefit}</Section>
          <Section icon={UserCheck} title="யாருக்கு?">{s.who}</Section>
          <Section icon={MapPin} title="எங்கே செல்ல வேண்டும்?">{s.where}</Section>
          <Section icon={ListChecks} title="அடுத்த படி">{s.next}</Section>
          <p className="rounded-2xl bg-amber-50 p-3 text-base font-semibold text-stone-700">
            இது வழிகாட்டுதலுக்காக மட்டுமே. ஆவணங்கள், இறுதி தகுதியை அரசு அலுவலகத்தில் உறுதி செய்யுங்கள்.
          </p>
          <button
            onClick={onListen}
            className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-orange-800 text-xl font-black text-amber-50"
          >
            <Volume2 className="h-8 w-8" /> கேட்க
          </button>
        </div>
      </main>
    </Wrap>
  );
}