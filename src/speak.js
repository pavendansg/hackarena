let audio = null;
let token = 0;

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

export function stopSpeaking() {
  token++;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  if (audio) { audio.pause(); audio = null; }
}

export async function speakTa(text) {
  if (!text) return;
  stopSpeaking();
  const my = token;
  const voice = window.speechSynthesis
    ?.getVoices?.()
    .find((v) => v.lang.toLowerCase().startsWith("ta"));

  if (voice) {
    await new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ta-IN";
      u.voice = voice;
      u.rate = 0.9;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    });
    return;
  }

  for (const c of chunk(text)) {
    if (my !== token) return;
    await new Promise((resolve) => {
      const a = new Audio(`/api/tts?q=${encodeURIComponent(c)}`);
      audio = a;
      a.onended = resolve;
      a.onerror = resolve;
      a.play().catch(resolve);
    });
  }
}