---
name: hg-studio
description: Operating procedure for the Hollywood-by-HG tool line — GMAPz Scout, GMAPz Turnover, VCS-15, VCO/Director's Chair, World Builder, Z-Earth. Use at the START of any session touching these tools, before writing code or answering a direction question, and at the END of any session that changed something. Covers where files live, how to hand a build to a Chromebook, what a "copy" or "branch" actually means here, the house build discipline, and the session-notes artifact that must be published every time.
---

# Hollywood by HG — how we work

The user is a director-brain, not a build-engineer. He holds the complete product vision and
should never have to leave it to manage process, storage, file naming or handoff mechanics.
**That work is yours.** If a turn would force him to think about git, folders or where a file
went, you have already made a mistake — fix it on your side and hand him something openable.

He has explicitly said: *"I don't want a stooge or assistant. I want a co-partner."* Argue when
you disagree, bring evidence, and never soften a finding to be agreeable.

## At the start of a session

1. `git -C /home/user/hgsand log --oneline -8` and `git status` — know what state you inherited.
2. Read `CLAUDE.md` (the constitution) if anything about direction is in play.
3. Do **not** ask him where files are or which version is current. Find out yourself.

## At the end of any session that changed something — REQUIRED

Publish a **session-notes artifact** with the `Artifact` tool. Not optional, not only when
asked. He has asked for this explicitly and it is how he keeps continuity across threads.

**The log lives here — update it, never republish a new one:**
`https://claude.ai/code/artifact/c1e4ca45-0427-4494-b119-6489854003cf` ("Mobile Hollywood Build
Log"). Pass that as `url`. One running log, newest session first, not a new page per session.
If the URL ever falls out of context, find it with `Artifact action:"list"`.

It must carry, newest session first:
- date, the commits made (SHAs + one-line each), the suite count
- **what changed, in product terms** — what he can now do that he could not before
- **what broke and what it cost** — including your own mistakes, named
- **what is open** — decisions waiting on him, phrased as a question he can answer in a sentence
- **exactly what to open and where** — URL or filename, never "the repo"

## Files, branches, copies — what to actually do

The repo is `Horusgrey/hgsand`, working branch
`claude/gmapz-scout-final-polish-ch5pj7`. One product = one self-contained HTML file at the
repo root. There is no build step and there never should be.

| He says | You do | You tell him |
|---|---|---|
| "make a copy" | commit current state, keep working on the same file | the SHA that holds the old state and the one command to get it back |
| "keep this version" | `git tag` locally **and** write the SHA into `ROADMAP.md` — tag pushes are rejected by this repo's credential, the SHA in a doc is what survives | the SHA and what it contains |
| "which version am I testing" | send him the actual file | the filename and the URL, nothing else |
| "new build on netlify" | prepare a folder with `index.html`, hand it over | that Netlify's servers are unreachable from the sandbox, so he drags the folder |

**Never leave two near-identical HTML files in the repo.** A lab copy is for one unproven
experiment; the moment it lands, delete it. Two files that must be edited in lockstep diverge
the first time somebody forgets.

## Handing a build to a Chromebook

This is his machine. Assume it every time.

- **Attach the file directly** with `SendUserFile`. Never say "pull the repo".
- **Zips often fail to download on ChromeOS.** Send plain `.html`. If a folder is needed for a
  deploy, send the file already named `index.html` and tell him to make a folder around it.
- `file://` does not work — Cesium's workers are blocked, tiles never sharpen, ground height
  cannot be measured. Scout says so in red; do not let him test that way.
- The serve command needs the ChromeOS-specific step that nobody guesses:
  Files → right-click **Downloads** → **Share with Linux**, then
  `cd /mnt/chromeos/MyFiles/Downloads && python3 -m http.server 8080`.

## Build discipline

- **Patch scripts, not hand edits.** A Python script with `rep(old, new, label)` asserting each
  anchor matches exactly once, `sys.exit(1)` before any write, so a failed anchor writes
  nothing. Anchors must match literal bytes — the files mix `—` with `&mdash;` and `·` with
  `&middot;`; check with `grep`/`cat -A` before assuming.
- **Headless verification every time.** Playwright at
  `/opt/node22/lib/node_modules/playwright/index.mjs`, Chromium at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, flags
  `--use-gl=swiftshader --enable-unsafe-swiftshader --no-sandbox --no-proxy-server`,
  local server on port 8123 serving `scratchpad/serve/`. **Zero page errors is part of green.**
- **Read the real artifact.** Walk the actual zip's central directory; read the stored bytes.
  A spy on an internal will not fire if the code calls the closure directly — that has happened.
- **When a suite disagrees with the app, suspect the suite first.** Logged false positives:
  radians injected into a degrees field, racing an 800ms debounce, reading a CSS transition
  mid-flight, forgetting `vco()` and `worldBuilderProject()` are async, reading `spec` off
  `capture()`'s return value when it is only on the stored record, and measuring an `<img>`
  before it decoded — a 2px box passes "is it under a third of the screen" for the wrong reason.
- **Look at it.** Screenshot the app after any change to layout or a panel. A green suite proves
  the words are right; it does not prove the room reads. Both real defects in Turnover's first
  pass — the reference frame pushing the authored fields off-screen, and a shot row wrapping onto
  a second line — were invisible to 85 passing assertions and obvious in one screenshot.
- Commit messages explain **why**, in prose, at length. They are the project's memory.
- Never print an API key into chat or a commit. Keys live in the app's own fields.

## Artifacts and skills — when, without being asked

- **Artifact** whenever the output is a deliverable with an audience or a reference he will
  return to: session notes (always), strategy or direction documents, defect reports with
  evidence, wireframes, comparisons across versions. Not for a two-line answer.
- **Skill** whenever you catch yourself re-explaining a process, or he says some version of
  *"I shouldn't have to keep telling you this."* Encode it here instead.

## The rule that governs the product line

**The map is not the product. The captured reference frame + the shot spec are the product.**
Everything else is plumbing. See `CLAUDE.md` for the full constitution, the ground-truth rules,
and the parked-work order.
