// api/share.js
//
// Link-preview page for shared schemes.
//   https://<site>/s/kmut?lang=hi   (rewritten to this function by vercel.json)
//
// WhatsApp, Telegram and Facebook read the Open Graph tags from the HTML and
// do not run JavaScript, so this returns the scheme's title and benefit in the
// sender's language. People who open the link are sent straight to the app.
//
// The data comes from api/_share-data.js, made by scripts/share-data.mjs.
import data from "./_share-data.js";

const LANGS = ["ta", "en", "hi", "te"];
const LOCALE = { ta: "ta_IN", en: "en_IN", hi: "hi_IN", te: "te_IN" };

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export default function handler(req, res) {
  const q = req.query || {};
  const lang = typeof q.lang === "string" && LANGS.includes(q.lang) ? q.lang : "en";
  const id = typeof q.scheme === "string" && has(data.schemes, q.scheme) ? q.scheme : null;

  const site = data.site;
  const brand = data.brand[lang];

  let title;
  let description;
  let shareUrl;
  let appPath;

  if (id) {
    const s = data.schemes[id][lang];
    title = s.title;
    description = `${s.benefit} ${data.notOfficial[lang]}`;
    shareUrl = `${site}/s/${id}?lang=${lang}`;
    appPath = `/?scheme=${id}&lang=${lang}`;
  } else {
    title = brand;
    description = `${data.hero[lang]}. ${data.notOfficial[lang]}`;
    shareUrl = `${site}/`;
    appPath = `/?lang=${lang}`;
  }

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(brand)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(site + appPath)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(brand)}">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(shareUrl)}">
<meta property="og:image" content="${esc(site)}/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(brand)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(site)}/og-image.png">
<meta http-equiv="refresh" content="0;url=${esc(appPath)}">
</head>
<body>
<p><a href="${esc(appPath)}">${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(appPath).replace(/</g, "\\u003c")});</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}