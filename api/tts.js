export default async function handler(req, res) {
    const text = String(req.query.q || "").slice(0, 200);
    if (!text) return res.status(400).end();
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ta&q=${encodeURIComponent(text)}`;
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) return res.status(502).end();
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buf);
    } catch {
      res.status(500).end();
    }
  }