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
      className={`min-h-[72px] w-full rounded-3xl px-5 py-4 text-xl font-bold leading-snug shadow-md disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [say, setSay] = useState("");
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState(null);
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

  if (screen === "splash") {
    return (
      <main className="flex min-h-svh items-stretch bg-amber-50 p-4">
        <button
          type="button"
          onClick={startTalk}
          className="flex min-h-[88vh] w-full flex-col items-center justify-center gap-8 rounded-[2.5rem] bg-orange-800 px-6 text-amber-50 shadow-xl"
        >
          <Volume2 className="h-28 w-28" strokeWidth={1.75} />
          <span className="text-4xl font-black leading-tight">பேசத் தொடங்கு</span>
          <span className="text-xl font-semibold opacity-90">சகி · அரசு உதவி</span>
        </button>
      </main>
    );
  }

  if (screen === "result" && result) {
    return (
      <main className="mx-auto min-h-svh max-w-lg bg-amber-50 px-4 py-6 text-stone-900">
        <h1 className="mb-4 text-center text-3xl font-black">
          {result.eligible ? "உதவி கிடைக்கலாம்" : "உறுதி செய்யவும்"}
        </h1>
        <div className="space-y-4">
          <ResultCard
            icon={Baby}
            title="பண உதவி"
            body={result.benefit}
            ok={result.eligible}
          />
          <ResultCard icon={FileText} title="ஆவணங்கள்" body={result.documents.join(" · ")} />
          <ResultCard icon={MapPin} title="எங்கே போவது" body={result.where_to_go} />
          <ResultCard icon={ListChecks} title="அடுத்த படி" body={result.next_step} />
        </div>
        <div className="mt-6 space-y-3">
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
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-svh max-w-lg flex-col overflow-hidden bg-amber-50 px-4 py-5 text-stone-900">
      <p className="mb-3 shrink-0 text-center text-lg font-bold text-orange-900">சகி</p>
      <section className="min-h-0 flex-1 overflow-y-auto rounded-3xl bg-white p-5 text-2xl font-semibold leading-relaxed shadow-sm">
        {loading ? WAIT_TA : say || WAIT_TA}
      </section>

      {error ? (
        <p className="mt-3 flex shrink-0 items-center gap-2 text-lg font-semibold text-rose-800">
          <AlertCircle className="h-6 w-6 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="mt-4 shrink-0">
        <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onMic}
          disabled={loading}
          className={`col-span-2 flex min-h-[96px] items-center justify-center gap-3 rounded-full bg-orange-700 text-2xl font-black text-amber-50 ${
            listening ? "mic-pulse" : ""
          }`}
        >
          {loading ? <Loader2 className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
          {listening ? "கேட்கிறேன்" : "பேசு"}
        </button>
        <BigButton
          onClick={() => speakNow(say)}
          disabled={!say || loading}
          className="flex items-center justify-center gap-2 bg-amber-200 text-stone-900"
        >
          <RotateCcw className="h-8 w-8" /> மீண்டும்
        </BigButton>
        <BigButton
          onClick={startOver}
          className="flex items-center justify-center gap-2 bg-stone-200 text-stone-900"
        >
          <RefreshCw className="h-8 w-8" /> தொடக்கம்
        </BigButton>
        <BigButton
          onClick={() => onChoice("ஆம்")}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-green-700 text-white"
        >
          <Check className="h-10 w-10" /> ஆம்
        </BigButton>
        <BigButton
          onClick={() => onChoice("இல்லை")}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-rose-800 text-white"
        >
          <X className="h-10 w-10" /> இல்லை
        </BigButton>
      </div>

      {options.filter((o) => o !== "ஆம்" && o !== "இல்லை").length ? (
        <div className="mt-3 space-y-3">
          {options
            .filter((o) => o !== "ஆம்" && o !== "இல்லை")
            .map((o) => (
              <BigButton
                key={o}
                onClick={() => onChoice(o)}
                disabled={loading}
                className="bg-orange-100 text-orange-950"
              >
                {o}
              </BigButton>
            ))}
        </div>
      ) : null}
      </div>
    </main>
  );
}

function ResultCard({ icon: Icon, title, body, ok }) {
  return (
    <article className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
          ok === false ? "bg-rose-100 text-rose-800" : "bg-orange-100 text-orange-800"
        }`}
      >
        <Icon className="h-9 w-9" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-orange-950">{title}</h2>
        <p className="text-lg font-medium leading-snug">{body}</p>
      </div>
    </article>
  );
}
