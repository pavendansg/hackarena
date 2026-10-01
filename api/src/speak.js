let audio = null;

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
  speechSynthesis.cancel();
  if (audio) { audio.pause(); audio = null; }
}

export async function speakTa(text) {
  stopSpeaking();
  const voice = speechSynthesis.getVoices().find(v => v.lang.startsWith("ta"));
  if (voice) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ta-IN";
    u.voice = voice;
    speechSynthesis.speak(u);
    return;
  }
  for (const c of chunk(text)) {
    await new Promise(resolve => {
      audio = new Audio(`/api/tts?q=${encodeURIComponent(c)}`);
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
    });
  }
}
