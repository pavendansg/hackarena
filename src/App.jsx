import { useEffect, useRef, useState } from "react";
import {
  Volume2,
  Mic,
  RotateCcw,
  Check,
  X,
  Baby,
  FileText,
  MapPin,
  ListChecks,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  WAIT_TA,
  ERROR_TA,
  MIC_FAIL_TA,
  buildSystemPrompt,
  askModel,
  unlockAudio,
  speakTamil,
  stopSpeak,
  canListen,
  listenTamil,
  fallback,
} from "./sakhi.js";

function BigButton({ onClick, className, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[64px] w-full rounded-2xl px-4 py-3 text-xl font-bold leading-snug shadow-md transition active:scale-95 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

const Shell = ({ children, className = "" }) => (
  <div className="min-h-svh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100">
    <main className={`mx-auto w-full px-4 text-stone-900 ${className}`}>{children}</main>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [say, setSay] = useState("");
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState(null);
  const [qNum, setQNum] = useState(0);
  const messagesRef = useRef([]);
  const fallbackAnswers = useRef({});
  const fallbackIndex = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    const load = () => window.speechSynthesis?.getVoices?.();
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
      stopSpeak();
    };
  }, []);

  async function speakNow(text) {
    setSay(text);
    await speakTamil(text);
  }

  function enterFallback(reason) {
    setOffline(true);
    setError(reason || ERROR_TA);
    fallbackAnswers.current = {};
    fallbackIndex.current = 0;
    setResult(null);
    setQNum(1);
    setScreen("talk");
    const first = fallback.steps[0];
    setOptions(first.options);
    setSay(first.say);
    speakTamil(`${ERROR_TA} ${fallback.intro} ${first.say}`);
  }

  async function sendToAi(userText) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    speakTamil(WAIT_TA);
    try {
      messagesRef.current = [
        ...messagesRef.current,
        { role: "user", content: userText },
      ];
      const { parsed, messages } = await askModel(messagesRef.current);
      messagesRef.current = messages;
      setOptions(parsed.options.length ? parsed.options : ["ஆம்", "இல்லை"]);
      if (parsed.stage === "result" && parsed.result) {
        setResult(parsed.result);
        setScreen("result");
        await speakNow(parsed.say_ta);
      } else {
        setQNum((n) => n + 1);
        setScreen("talk");
        await speakNow(parsed.say_ta);
      }
    } catch (err) {
      enterFallback(err?.status === 429 ? "சேவை நெரிசல். பொத்தானை அழுத்துங்கள்." : ERROR_TA);
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }

  async function startTalk() {
    unlockAudio();
    setOffline(false);
    setError("");
    setResult(null);
    setQNum(0);
    setScreen("talk");
    messagesRef.current = [{ role: "system", content: buildSystemPrompt() }];
    await sendToAi("வணக்கம். பிஎம் மாத்ரு வந்தனா யோஜனா பற்றி எளிய தமிழில் உதவுங்கள். ஒவ்வொன்றாகக் கேளுங்கள்.");
  }

  function startOver() {
    stopSpeak();
    busy.current = false;
    setListening(false);
    setLoading(false);
    setError("");
    setOffline(false);
    setSay("");
    setOptions([]);
    setResult(null);
    setQNum(0);
    messagesRef.current = [];
    fallbackAnswers.current = {};
    fallbackIndex.current = 0;
    setScreen("splash");
  }

  async function onFallbackChoice(label) {
    const step = fallback.steps[fallbackIndex.current];
    fallbackAnswers.current[step.id] = label;
    const next = fallbackIndex.current + 1;
    if (next >= fallback.steps.length) {
      const parsed = fallback.resultFor(fallbackAnswers.current);
      setResult(parsed.result);
      setScreen("result");
      setOptions([]);
      await speakNow(parsed.say_ta);
      return;
    }
    fallbackIndex.current = next;
    setQNum(next + 1);
    const q = fallback.steps[next];
    setOptions(q.options);
    await speakNow(q.say);
  }

  async function onChoice(label) {
    if (loading) return;
    if (offline) {
      await onFallbackChoice(label);
      return;
    }
    await sendToAi(label);
  }

  async function onMic() {
    if (loading || listening) return;
    if (!canListen()) {
      setError(MIC_FAIL_TA);
      await speakTamil(MIC_FAIL_TA);
      return;
    }
    stopSpeak();
    setListening(true);
    setError("");
    try {
      const text = await listenTamil();
      setListening(false);
      if (!text) {
        setError(MIC_FAIL_TA);
        return;
      }
      if (offline) {
        const step = fallback.steps[fallbackIndex.current];
        const match = step.options.find((o) => text.includes(o) || o.includes(text));
        await onFallbackChoice(match || text);
        return;
      }
      await sendToAi(text);
    } catch {
      setListening(false);
      setError(MIC_FAIL_TA);
      await speakTamil(MIC_FAIL_TA);
    }
  }

  /* ---------------- SPLASH ---------------- */
  if (screen === "splash") {
    return (
      <Shell className="flex min-h-svh max-w-2xl flex-col items-center justify-between py-10 text-center md:justify-center md:gap-12">
        <div>
          <p className="mx-auto inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-bold text-orange-900">
            பிரதம மந்திரி மாத்ரு வந்தனா யோஜனா
          </p>
          <h1 className="mt-5 text-6xl font-black text-orange-900 md:text-8xl">சகி</h1>
          <p className="mt-3 text-xl font-semibold leading-relaxed text-stone-700">
            உங்கள் மொழியில், உங்கள் குரலில்
            <br />
            அரசு உதவி அறிந்துகொள்ளுங்கள்
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={startTalk}
            aria-label="பேசத் தொடங்கு"
            className="mic-pulse flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-900 text-amber-50 shadow-2xl ring-8 ring-orange-200 transition active:scale-95"
          >
            <Volume2 className="h-24 w-24" strokeWidth={1.75} />
          </button>
          <span className="text-3xl font-black text-orange-900">பேசத் தொடங்கு</span>
          <span className="text-base font-medium text-stone-600">இந்தப் பொத்தானை ஒரு முறை அழுத்துங்கள்</span>
        </div>

        <p className="text-sm text-stone-500">எழுத வேண்டாம் · ஆங்கிலம் வேண்டாம் · பேசினால் போதும்</p>
      </Shell>
    );
  }

  /* ---------------- RESULT ---------------- */
  if (screen === "result" && result) {
    const docs = Array.isArray(result.documents) ? result.documents : [];
    return (
      <Shell className="max-w-4xl py-6 md:py-10">
        <div
          className={`mb-5 flex items-center gap-4 rounded-3xl p-5 text-white shadow-lg ${
            result.eligible ? "bg-green-700" : "bg-amber-600"
          }`}
        >
          {result.eligible ? (
            <CheckCircle2 className="h-14 w-14 shrink-0" />
          ) : (
            <Info className="h-14 w-14 shrink-0" />
          )}
          <h1 className="text-3xl font-black leading-tight">
            {result.eligible ? "உங்களுக்கு உதவி கிடைக்கலாம்" : "அங்கன்வாடியில் உறுதி செய்யவும்"}
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ResultCard icon={Baby} title="பண உதவி" ok={result.eligible}>
            <p className="text-lg font-medium leading-snug">{result.benefit}</p>
          </ResultCard>

          <ResultCard icon={FileText} title="எடுத்துச் செல்ல வேண்டியவை">
            <ul className="space-y-2">
              {docs.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-lg font-medium leading-snug">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-green-700" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard icon={MapPin} title="எங்கே போவது">
            <p className="text-lg font-medium leading-snug">{result.where_to_go}</p>
          </ResultCard>

          <ResultCard icon={ListChecks} title="அடுத்த படி">
            <p className="text-lg font-medium leading-snug">{result.next_step}</p>
          </ResultCard>
        </div>

        <div className="mx-auto mt-6 max-w-xl space-y-3">
          <BigButton
            onClick={() => speakNow(say)}
            className="flex items-center justify-center gap-3 bg-orange-800 text-amber-50"
          >
            <Volume2 className="h-8 w-8" /> மீண்டும் கேள்
          </BigButton>
          <BigButton
            onClick={startOver}
            className="flex items-center justify-center gap-3 bg-stone-800 text-amber-50"
          >
            <RefreshCw className="h-8 w-8" /> முதலில் இருந்து
          </BigButton>
        </div>
      </Shell>
    );
  }

  /* ---------------- QUESTION ---------------- */
  const extra = options.filter((o) => o !== "ஆம்" && o !== "இல்லை");

  return (
    <Shell className="flex min-h-svh max-w-2xl flex-col py-5 md:py-8">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-2xl font-black text-orange-900">சகி</span>
        {qNum > 0 ? (
          <span className="rounded-full bg-orange-100 px-4 py-1 text-base font-bold text-orange-900">
            கேள்வி {qNum}
          </span>
        ) : null}
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl bg-white p-6 text-center shadow-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-800">
          {loading ? <Loader2 className="h-9 w-9 animate-spin" /> : <Volume2 className="h-9 w-9" />}
        </div>
        <p className="text-2xl font-bold leading-relaxed text-stone-900 md:text-4xl">
          {loading ? WAIT_TA : say || WAIT_TA}
        </p>
      </section>

      {error ? (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-lg font-semibold text-rose-800">
          <AlertCircle className="h-6 w-6 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <BigButton
            onClick={() => onChoice("ஆம்")}
            disabled={loading}
            className="flex min-h-[84px] items-center justify-center gap-2 bg-green-700 text-2xl text-white"
          >
            <Check className="h-10 w-10" /> ஆம்
          </BigButton>
          <BigButton
            onClick={() => onChoice("இல்லை")}
            disabled={loading}
            className="flex min-h-[84px] items-center justify-center gap-2 bg-rose-800 text-2xl text-white"
          >
            <X className="h-10 w-10" /> இல்லை
          </BigButton>
        </div>

        {extra.map((o) => (
          <BigButton
            key={o}
            onClick={() => onChoice(o)}
            disabled={loading}
            className="bg-orange-100 text-orange-950"
          >
            {o}
          </BigButton>
        ))}

        <button
          type="button"
          onClick={onMic}
          disabled={loading}
          className={`flex min-h-[80px] w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-800 text-2xl font-black text-amber-50 shadow-lg transition active:scale-95 disabled:opacity-50 ${
            listening ? "mic-pulse" : ""
          }`}
        >
          <Mic className="h-10 w-10" />
          {listening ? "கேட்கிறேன்..." : "பேசி பதில் சொல்லுங்கள்"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <BigButton
            onClick={() => speakNow(say)}
            disabled={!say || loading}
            className="flex min-h-[56px] items-center justify-center gap-2 bg-amber-200 text-lg text-stone-900"
          >
            <RotateCcw className="h-6 w-6" /> மீண்டும்
          </BigButton>
          <BigButton
            onClick={startOver}
            className="flex min-h-[56px] items-center justify-center gap-2 bg-stone-200 text-lg text-stone-900"
          >
            <RefreshCw className="h-6 w-6" /> தொடக்கம்
          </BigButton>
        </div>
      </div>
    </Shell>
  );
}

function ResultCard({ icon: Icon, title, ok, children }) {
  return (
    <article className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
          ok === false ? "bg-rose-100 text-rose-800" : "bg-orange-100 text-orange-800"
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="mb-1 text-xl font-black text-orange-950">{title}</h2>
        {children}
      </div>
    </article>
  );
}