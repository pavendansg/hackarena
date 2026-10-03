// api/tts.js — text-to-speech fallback for Tamil, Hindi, Telugu and English.
// Used only when the browser has no real voice for that language.

const ALLOWED = new Set(["ta", "hi", "te", "en"]);

export default async function handler(req, res) {
  const q = String(req.query.q || "").slice(0, 200).trim();
  const tl = ALLOWED.has(req.query.tl) ? req.query.tl : "ta";

  if (!q) return res.status(400).send("missing q");

  try {
    const url =
      "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob" +
      `&tl=${tl}&q=${encodeURIComponent(q)}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://translate.google.com/",
      },
    });

    if (!r.ok) return res.status(502).send("tts upstream error " + r.status);

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, s-maxage=86400, max-age=3600");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).send("tts failed");
  }
}