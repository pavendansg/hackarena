import {
    Volume2, Mic, CheckCircle2, Baby, HeartPulse, Flame, PiggyBank, ArrowLeft, ShieldCheck,
  } from "lucide-react";
  
  export const SCHEMES = [
    {
      id: "pmmvy", icon: Baby, tag: "தாய்மார்களுக்கு", voice: true,
      title: "மாத்ரு வந்தனா யோஜனா",
      desc: "முதல் குழந்தைக்கு பண உதவி. உங்கள் தகுதியை குரலில் சரிபார்க்கலாம்.",
    },
    {
      id: "jay", icon: HeartPulse, tag: "மருத்துவம்",
      title: "ஆயுஷ்மான் பாரத்",
      desc: "தகுதியுள்ள குடும்பத்துக்கு ஆண்டுக்கு 5 லட்சம் ரூபாய் வரை இலவச மருத்துவக் காப்பீடு.",
      where: "அரசு மருத்துவமனை அல்லது பொது சேவை மையத்தில் கேளுங்கள்.",
    },
    {
      id: "ujjwala", icon: Flame, tag: "சமையல் எரிவாயு",
      title: "உஜ்வாலா யோஜனா",
      desc: "தகுதியுள்ள ஏழைக் குடும்பப் பெண்களுக்கு இலவச சமையல் எரிவாயு இணைப்பு.",
      where: "எரிவாயு விநியோகஸ்தர் அல்லது பொது சேவை மையத்தில் கேளுங்கள்.",
    },
    {
      id: "ssy", icon: PiggyBank, tag: "பெண் குழந்தை",
      title: "செல்வமகள் சேமிப்புத் திட்டம்",
      desc: "பெண் குழந்தையின் எதிர்காலத்துக்கான சிறு சேமிப்புத் திட்டம்.",
      where: "அஞ்சலகம் அல்லது வங்கியில் கேளுங்கள்.",
    },
  ];
  
  export const infoText = (s) =>
    `${s.title}. ${s.desc} ${s.where} தகுதி மற்றும் ஆவணங்களை அங்கே உறுதி செய்யுங்கள்.`;
  
  const Wrap = ({ children }) => (
    <div className="min-h-svh bg-gradient-to-b from-amber-50 via-orange-50 to-orange-100 text-stone-900">
      {children}
    </div>
  );
  
  export function Home({ onStart, onInfo }) {
    const steps = [
      { icon: Volume2, t: "பொத்தானை அழுத்துங்கள்", d: "சகி தமிழில் பேசும்" },
      { icon: Mic, t: "பேசுங்கள் அல்லது தொடுங்கள்", d: "ஆம் / இல்லை போதும்" },
      { icon: CheckCircle2, t: "முடிவைக் கேளுங்கள்", d: "பணம், ஆவணம், இடம்" },
    ];
    return (
      <Wrap>
        <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-3xl font-black text-orange-900">சகி</span>
          <span className="hidden rounded-full bg-orange-100 px-4 py-1 text-sm font-bold text-orange-900 md:block">
            எழுத வேண்டாம் · ஆங்கிலம் வேண்டாம்
          </span>
        </header>
  
        <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:py-14">
          <div>
            <p className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-bold text-orange-900">
              AI · குரல் · தமிழ்
            </p>
            <h1 className="text-4xl font-black leading-tight text-orange-950 md:text-6xl">
              உங்கள் குரலே<br />உங்கள் வழிகாட்டி
            </h1>
            <p className="mt-4 text-xl font-semibold leading-relaxed text-stone-700">
              அரசு உதவிகளை உங்கள் மொழியில் கேட்டு அறிந்துகொள்ளுங்கள். யாரிடமும் கேட்க வேண்டியதில்லை.
            </p>
            <button
              onClick={onStart}
              className="mt-6 flex min-h-[72px] items-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-900 px-8 text-2xl font-black text-amber-50 shadow-xl transition active:scale-95"
            >
              <Volume2 className="h-9 w-9" /> பேசத் தொடங்கு
            </button>
          </div>
          <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-[3rem] bg-gradient-to-br from-orange-500 to-rose-700 shadow-2xl md:h-96 md:w-96">
            <div className="mic-pulse flex h-40 w-40 items-center justify-center rounded-full bg-amber-50 text-orange-800 md:h-52 md:w-52">
              <Mic className="h-20 w-20 md:h-28 md:w-28" />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-4 py-2 text-lg font-black text-green-700 shadow-lg">
              ✓ ஆம்
            </div>
            <div className="absolute -right-3 top-8 rounded-2xl bg-white px-4 py-2 text-lg font-black text-orange-800 shadow-lg">
              🔊 தமிழ்
            </div>
          </div>
        </section>
  
        <section className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="mb-4 text-3xl font-black text-orange-950">எப்படி வேலை செய்கிறது?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
                  <s.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-700">படி {i + 1}</p>
                  <p className="text-lg font-black leading-snug">{s.t}</p>
                  <p className="text-base font-medium text-stone-600">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="mb-4 text-3xl font-black text-orange-950">அரசுத் திட்டங்கள்</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {SCHEMES.map((s) => (
              <article key={s.id} className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 text-orange-800">
                    <s.icon className="h-9 w-9" />
                  </div>
                  <div>
                    <span className="rounded-full bg-orange-100 px-3 py-0.5 text-sm font-bold text-orange-900">
                      {s.tag}
                    </span>
                    <h3 className="mt-1 text-xl font-black leading-snug">{s.title}</h3>
                  </div>
                </div>
                <p className="text-lg font-medium leading-snug text-stone-700">{s.desc}</p>
                <button
                  onClick={() => (s.voice ? onStart() : onInfo(s))}
                  className={`mt-auto flex min-h-[56px] items-center justify-center gap-2 rounded-2xl text-lg font-black text-white shadow ${
                    s.voice ? "bg-green-700" : "bg-orange-800"
                  }`}
                >
                  {s.voice ? <Mic className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  {s.voice ? "தகுதியை சரிபார்" : "கேளுங்கள்"}
                </button>
              </article>
            ))}
          </div>
        </section>
  
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
          <p className="flex items-center justify-center gap-2 text-base font-bold text-stone-600">
            <ShieldCheck className="h-5 w-5" /> தகவல்கள் சரிபார்க்கப்பட்ட அரசு ஆதாரங்களிலிருந்து மட்டுமே
          </p>
          <p className="mt-1 text-sm text-stone-500">SDG 4 · SDG 5 · SDG 10 · PromptWars × HackArena 2026</p>
        </footer>
      </Wrap>
    );
  }
  
  export function InfoScreen({ s, onBack, onListen }) {
    if (!s) return null;
    return (
      <Wrap>
        <main className="mx-auto max-w-2xl px-4 py-6 md:py-12">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-lg font-black text-orange-900">
            <ArrowLeft className="h-6 w-6" /> திரும்பு
          </button>
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-rose-700 text-white">
              <s.icon className="h-14 w-14" />
            </div>
            <h1 className="mt-4 text-3xl font-black leading-snug text-orange-950">{s.title}</h1>
            <p className="mt-3 text-xl font-medium leading-relaxed">{s.desc}</p>
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-lg font-semibold">📍 {s.where}</div>
            <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-lg font-semibold">
              தகுதி மற்றும் ஆவணங்களை அங்கே உறுதி செய்யுங்கள்.
            </div>
            <button
              onClick={onListen}
              className="mt-5 flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-orange-800 text-xl font-black text-amber-50"
            >
              <Volume2 className="h-8 w-8" /> மீண்டும் கேள்
            </button>
          </div>
        </main>
      </Wrap>
    );
  }