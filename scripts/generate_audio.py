#!/usr/bin/env python3
"""scripts/generate_audio.py

Makes the pre-recorded audio for Magalir Thunai.

  1. node scripts/audio-texts.mjs        -> scripts/audio-todo.json
  2. python scripts/generate_audio.py    -> public/audio/clips/**.mp3
                                            public/audio/manifest.json

Voices: Microsoft Edge neural voices through the `edge-tts` package
(pip install edge-tts). No account or API key. It uses Edge's online
read-aloud service, which is unofficial: fine for a demo, but check the terms
(or use Azure Speech with the same voices) before commercial use.

Question/heading clips use the "q" voice, answers use the "a" voice, so the
two-voice experience also works on phones that have no Tamil/Hindi/Telugu voice.

Options:
  --check-voices    check that the configured voices exist, then stop
  --dry-run         show what would be generated, generate nothing
  --langs ta,hi     only these languages (default: ta,en,hi,te)
  --force           regenerate clips that already exist
  --prune           delete clips the app no longer uses
  --manifest-only   just rebuild public/audio/manifest.json from the files on disk
  --concurrency 3   parallel requests (keep it small)
"""
import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
# the project folder is the one that has src/i18n.js (works from anywhere)
ROOT = next(
    (d for d in (Path.cwd(), HERE, HERE.parent) if (d / "src" / "i18n.js").exists()),
    HERE.parent,
)
TODO = ROOT / "scripts" / "audio-todo.json"
OUT = ROOT / "public" / "audio"
CLIPS = OUT / "clips"
MANIFEST = OUT / "manifest.json"

# q = heading voice, a = content voice. Swap them here if you prefer.
VOICES = {
    "ta": {"q": "ta-IN-ValluvarNeural", "a": "ta-IN-PallaviNeural"},
    "hi": {"q": "hi-IN-MadhurNeural", "a": "hi-IN-SwaraNeural"},
    "te": {"q": "te-IN-MohanNeural", "a": "te-IN-ShrutiNeural"},
    "en": {"q": "en-IN-PrabhatNeural", "a": "en-IN-NeerjaNeural"},
}
# content is read a little slower for first-time users
RATE = {"q": "+0%", "a": "-5%"}

try:  # Windows consoles: avoid UnicodeEncodeError
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def need_edge_tts():
    try:
        import edge_tts  # noqa: F401

        return edge_tts
    except ImportError:
        sys.exit("edge-tts is not installed. Run:  pip install edge-tts")


def load_todo():
    if not TODO.exists():
        sys.exit("scripts/audio-todo.json not found. Run first:  node scripts/audio-texts.mjs")
    return json.loads(TODO.read_text(encoding="utf-8"))


def clip_path(key):
    return CLIPS / (key + ".mp3")


def write_manifest():
    """Manifest = every clip that exists on disk. `v` changes only when the set
    of clips changes, so browsers can cache clips for a long time."""
    clips = {}
    for p in CLIPS.rglob("*.mp3"):
        if p.stat().st_size > 500:
            clips[p.relative_to(CLIPS).with_suffix("").as_posix()] = 1

    old_v, old_keys = 0, set()
    if MANIFEST.exists():
        try:
            old = json.loads(MANIFEST.read_text(encoding="utf-8"))
            old_v, old_keys = int(old.get("v", 0)), set(old.get("clips", {}))
        except Exception:
            pass

    v = old_v if set(clips) == old_keys and old_v else int(time.time())
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps({"v": v, "clips": clips}, sort_keys=True, separators=(",", ":")),
        encoding="utf-8",
    )
    return len(clips)


async def check_voices():
    edge_tts = need_edge_tts()
    available = {v["ShortName"] for v in await edge_tts.list_voices()}
    all_ok = True
    for lang, roles in VOICES.items():
        for role, name in roles.items():
            ok = name in available
            all_ok &= ok
            print(("OK      " if ok else "MISSING ") + f"{lang} {role} {name}")
    if not all_ok:
        print("\nEdit VOICES at the top of this file, using names from:  edge-tts --list-voices")
        sys.exit(1)
    print("\nAll voices found.")


async def generate(missing, concurrency):
    edge_tts = need_edge_tts()
    sem = asyncio.Semaphore(concurrency)
    stats = {"ok": 0, "fail": []}
    total = len(missing)

    async def one(item):
        path = clip_path(item["key"])
        voice = VOICES[item["lang"]][item["role"]]
        rate = RATE[item["role"]]
        async with sem:
            for attempt in (1, 2, 3):
                try:
                    path.parent.mkdir(parents=True, exist_ok=True)
                    tmp = path.with_suffix(".tmp")
                    await edge_tts.Communicate(item["tts"], voice, rate=rate).save(str(tmp))
                    if tmp.stat().st_size < 500:
                        raise RuntimeError("audio too small")
                    tmp.replace(path)
                    stats["ok"] += 1
                    done = stats["ok"] + len(stats["fail"])
                    if done % 10 == 0 or done == total:
                        print(f"  {done}/{total}")
                    return
                except Exception as e:  # network hiccup, rate limit ...
                    if attempt == 3:
                        stats["fail"].append((item["key"], str(e)[:80]))
                    else:
                        await asyncio.sleep(2 * attempt)

    await asyncio.gather(*(one(i) for i in missing))
    return stats


def main():
    ap = argparse.ArgumentParser(description="Generate pre-recorded audio clips")
    ap.add_argument("--check-voices", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--manifest-only", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--langs", default="ta,en,hi,te")
    ap.add_argument("--concurrency", type=int, default=3)
    args = ap.parse_args()

    if args.check_voices:
        asyncio.run(check_voices())
        return

    if args.manifest_only:
        print(f"manifest written: {write_manifest()} clips")
        return

    todo = load_todo()
    langs = {x.strip() for x in args.langs.split(",") if x.strip()}
    items = [i for i in todo if i["lang"] in langs]
    missing = [i for i in items if args.force or not clip_path(i["key"]).exists()]
    chars = sum(len(i["tts"]) for i in missing)
    print(f"{len(items)} clips needed, {len(missing)} to generate ({chars} characters)")

    if args.dry_run:
        return

    stats = {"ok": 0, "fail": []}
    if missing:
        stats = asyncio.run(generate(missing, max(1, args.concurrency)))

    pruned = 0
    if args.prune:
        keep = {i["key"] for i in todo}
        for p in list(CLIPS.rglob("*.mp3")):
            if p.relative_to(CLIPS).with_suffix("").as_posix() not in keep:
                p.unlink()
                pruned += 1

    count = write_manifest()
    size = sum(p.stat().st_size for p in CLIPS.rglob("*.mp3")) / (1024 * 1024)
    print(f"generated {stats['ok']}, failed {len(stats['fail'])}, pruned {pruned}")
    print(f"manifest: {count} clips, {size:.1f} MB in public/audio")

    if stats["fail"]:
        print("\nFailed clips (run the same command again to retry just these):")
        for key, msg in stats["fail"]:
            print(f"  {key}: {msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()