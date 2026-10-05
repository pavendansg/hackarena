#!/usr/bin/env node
/* audio-texts.mjs   (save it as scripts/audio-texts.mjs)

   Collects every text the app speaks (all schemes in all four languages, plus
   headings, welcome, find-my-scheme questions, help page ...) and writes
   scripts/audio-todo.json for scripts/generate_audio.py.

   It reuses the app's own code (src/i18n.js, src/catalogue.js, src/speak.js),
   so the recorded text always matches the spoken text.

   Run it from the project folder:
     node scripts/audio-texts.mjs            write scripts/audio-todo.json
     node scripts/audio-texts.mjs --stats    only print the numbers
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

class UserError extends Error {}
const fail = (msg) => {
  throw new UserError(msg);
};

const here = path.dirname(fileURLToPath(import.meta.url));
const statsOnly = process.argv.includes("--stats");
let tmp = null;

function cleanup() {
  if (!tmp) return;
  try {
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    /* a leftover temp folder is harmless */
  }
}

// Find the project folder: the one that contains src/i18n.js
function findRoot() {
  for (const start of [process.cwd(), here]) {
    let dir = start;
    for (let i = 0; i < 5; i++) {
      if (fs.existsSync(path.join(dir, "src", "i18n.js"))) return dir;
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  return null;
}

function readSource(root, file) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) fail(`${file} was not found in ${root}`);
  return fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
}

// Load a src file as an ES module, whatever package.json "type" says.
async function load(root, file, transform = (x) => x) {
  const out = path.join(tmp, path.basename(file, path.extname(file)) + ".mjs");
  fs.writeFileSync(out, transform(readSource(root, file)), "utf8");
  try {
    return await import(pathToFileURL(out).href);
  } catch (e) {
    return fail(`${file} could not be loaded: ${e.message}`);
  }
}

// catalogue.js imports icon components; this script only needs the data.
const stubIcons = (src) =>
  src.replace(/import\s*\{([^}]*)\}\s*from\s*["']lucide-react["'];?/g, (m, names) =>
    "const " +
    names.split(",").map((n) => n.trim()).filter(Boolean).map((n) => `${n}=0`).join(",") +
    ";"
  );

function requireExports(mod, names, file, hint) {
  const missing = names.filter((n) => !(n in mod));
  if (missing.length) fail(`${file} does not export: ${missing.join(", ")}.\n${hint}`);
}

async function main() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) fail(`Node ${process.versions.node} is too old. Use Node 18 or newer.`);

  const root = findRoot();
  if (!root) {
    fail(
      "Could not find the project folder (a folder that has src/i18n.js).\n" +
        `Open PowerShell in your project folder (for example C:\\hackarena\\hackarena-app) and run:\n` +
        "  node scripts/audio-texts.mjs"
    );
  }
  console.log("project: " + root);

  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "thunai-audio-"));

  const i18n = await load(root, "src/i18n.js");
  const cat = await load(root, "src/catalogue.js", stubIcons);
  const spk = await load(root, "src/speak.js");

  requireExports(i18n, ["T", "LANGS"], "src/i18n.js", "Replace src/i18n.js with the latest i18n.js.");
  requireExports(cat, ["S", "CATS", "getS"], "src/catalogue.js", "Replace src/catalogue.js with the latest catalogue.js.");
  requireExports(
    spk,
    ["schemeSpeechItems", "normalizeForSpeech", "resolveLang", "clipKey"],
    "src/speak.js",
    "This is the OLD speak.js. Replace src/speak.js with the new speak.js (the pre-recorded audio version), then run this again."
  );

  const { T, LANGS } = i18n;
  const { S, CATS, getS } = cat;
  const { schemeSpeechItems, normalizeForSpeech, resolveLang, clipKey } = spk;

  const NEEDED = [
    "welcome", "hero", "sub", "cats", "popular", "all", "results", "maybe", "empty",
    "aboutTitle", "aboutText", "privTitle", "priv", "faq", "fq", "docsUnknown",
  ];
  for (const { id } of LANGS) {
    const missing = NEEDED.filter((k) => !(k in T[id]));
    if (missing.length) {
      fail(`src/i18n.js (${id}) is missing: ${missing.join(", ")}.\nReplace src/i18n.js with the latest i18n.js.`);
    }
  }

  const todo = new Map();

  // role "q" = heading / question voice, role "a" = content / answer voice
  function add(lang, role, text) {
    text = String(text ?? "").trim();
    if (!text) return;
    const target = resolveLang(text, lang); // same decision the app makes
    const key = clipKey(target, role, text);
    if (todo.has(key)) return;
    todo.set(key, { key, lang: target, role, text, tts: normalizeForSpeech(text, target) });
  }

  const names = (arr, l) => arr.map((x) => x[l].title).join(". ");

  for (const { id: l } of LANGS) {
    const t = T[l];

    // 1. scheme pages: the "Listen" button (same builder as src/home.jsx)
    for (const s of S) {
      const d = s[l];
      const items = schemeSpeechItems(
        { ...d, docs: d.docs?.length ? d.docs : t.docsUnknown },
        l
      );
      for (const it of items) {
        add(l, "q", it.q);
        add(l, "a", it.a);
      }
    }

    // 2. spoken right after choosing a language
    add(l, "a", t.welcome);

    // 3. find-my-scheme: each question, and its options for "Listen to this page"
    for (const f of t.fq) {
      add(l, "q", f.t);
      add(l, "a", f.o.join(", "));
    }

    // 4. results page texts that never change
    add(l, "q", t.results);
    add(l, "a", t.maybe);
    add(l, "a", t.empty);

    // 5. "Listen to this page": home, topics, all schemes (unfiltered), help
    add(l, "q", t.hero);
    add(l, "a", t.sub);
    add(l, "q", t.cats);
    add(l, "a", CATS.map((c) => c[l]).join(", "));
    add(l, "q", t.popular);
    add(l, "a", names(["kmut", "payanam", "pudhumai"].map((id) => getS(id)), l));

    for (const c of CATS) {
      add(l, "q", c[l]);
      add(l, "a", names(S.filter((s) => s.cats.includes(c.id)), l));
    }

    add(l, "q", t.all);
    add(l, "a", names(S, l));

    add(l, "q", t.aboutTitle);
    add(l, "a", t.aboutText);
    for (const f of t.faq) {
      add(l, "q", f.q);
      add(l, "a", f.a);
    }
    add(l, "q", t.privTitle);
    add(l, "a", t.priv.join(" "));
  }

  const list = [...todo.values()].sort((a, b) => a.key.localeCompare(b.key));

  // numbers
  const by = {};
  let chars = 0;
  for (const it of list) {
    by[it.lang] = by[it.lang] || { clips: 0, chars: 0 };
    by[it.lang].clips++;
    by[it.lang].chars += it.tts.length;
    chars += it.tts.length;
  }
  console.log(`${list.length} clips, ${chars} characters`);
  for (const [lang, v] of Object.entries(by)) {
    console.log(`  ${lang}: ${v.clips} clips, ${v.chars} characters`);
  }
  const seconds = chars / 13; // rough speaking speed
  console.log(
    `about ${Math.round(seconds / 60)} minutes of audio, roughly ${Math.round((seconds * 6) / 1024)} MB`
  );

  if (!statsOnly) {
    const dir = path.join(root, "scripts");
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, "audio-todo.json");
    fs.writeFileSync(out, JSON.stringify(list, null, 1), "utf8");
    console.log("wrote " + path.relative(root, out));
    console.log("\nnext:  python scripts/generate_audio.py --check-voices");
  }
}

try {
  await main();
} catch (e) {
  if (e instanceof UserError) {
    console.error("\nERROR: " + e.message + "\n");
  } else {
    console.error("\nUnexpected error:", e);
  }
  process.exitCode = 1;
} finally {
  cleanup();
}