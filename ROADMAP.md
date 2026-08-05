# GMAPz Scout — Roadmap

Where Scout is, what's next, and how it fits the **Hollywood by HG** studio. This is the
living plan; the constitution (`CLAUDE.md`) is the law it operates under.

---

## Where we are

**Scout is feature-complete and stable as a standalone tool.** The core loop runs end to
end and every feature is reflected in the capture spec, matches house style, and demos
without a rebuild. All work lives on `claude/gmapz-scout-final-polish-ch5pj7` (open draft
PR #1, mergeable, not being merged by choice — it accumulates there).

Every commit was verified headlessly before landing (Playwright + local Cesium 1.131);
the full regression — coverage roll, Prompt Studio, props, shutter, spec, orbit, roll,
viewfinder, coach, shadows — stays green with zero page errors.

### Built and working

| System | What's in it |
|---|---|
| **Earth & feel** | Google Photorealistic 3D Tiles (keyless ESRI fallback), cursor-anchored zoom, nav cluster, distance-scaled swoop flights, eased cinematic motion + establishing arc |
| **Operator** | Subject-orbit (drag to circle, scroll to dolly, flick-momentum), double-click to refocus, Dutch roll |
| **Camera** | Shot size / angle / lens presets, FOV, film-back sensor, exact param panel, saved looks |
| **Light** | Physically-accurate sun from date+time, golden/blue-hour finder, local solar time, continuity checker |
| **Viewfinder** | Rule-of-thirds + center, artificial horizon, live sun-in-frame readout, level/Dutch badge |
| **Cast & props** | Ghost placement, life-size mannequins, drag/scale/rotate/raise, honest captures, sun-aware contact shadows |
| **Coverage** | Recipe → editable plan → preview → roll a whole scene into the sequence |
| **Exports** | `gmapz.capture.v2`, six-engine Prompt Studio, VCS-15 handoff, VCO project, contact sheet, PDF report, session save/load |
| **Post** | Frame bin (every frame you've shot, one click in or out of the cut), the cut with per-shot beat, take player, GIF + video render, contact sheet, PDF report |
| **UX** | Welcome slate, empty states, autosave + restore, drag-reorder shots, discovery coach, Esc exits modes, mobile-aware |

### The panel, as of this pass

The rail is nine buttons and three hairline dividers — no headings. A heading in a
column of buttons reads as a dead button, which is exactly how the old `Where / Look /
Who / Move / Out` labels landed. Order follows how you actually work:

**Scout** → **Camera** → **Cast** → **Path** ┊ **Light** → **Style** → **Coverage** ┊ **Post** → **Export**

Find the place, choose the shot, put people in it, lay the path they're shot along; then
light it, grade it, add coverage; then look at the frames and send them out.

Capture is not a section. It's a bar pinned to the top of the panel — visible from every
section — plus the labelled on-stage shutter and `C`. Snapping a frame anywhere, any
time, at any point in the workflow, is the one thing that must never be more than one
click away. Scratch frames are full-opacity in the strip and the bin, with a `+` that
promotes them into the cut; nothing you shoot is treated as a reject.

---

## Backlog (Scout)

Everything that could be built without real photoreal tiles is done.

| Item | State |
|---|---|
| VCS-15 export alignment | ✅ FORGE now speaks the real VCS-15 schema (`character_lock`, `prop_lock`, `timeline`, `continuity_anchors`, `generation_risks`, `next_sequence_handoff`, `clip_type`, `status`) |
| Location-aware audio spec | ✅ `gmapz.audio.v1` — soundscape derived from place, clock, weather and what's in frame; rides in the VCS handoff and the VCO bible |
| KML → scout targets | ✅ placemarks become a clickable fly-to list; ground-clamping now skipped when the globe is hidden in photoreal mode |
| Sequence-aware prompts | ✅ the cut exports as one document with a world lock and per-cut continuity lines |
| Per-shot beat | ✅ drives the take player, video render and GIF frame delays |
| Sun re-light | ✅ re-shoots the sequence under one sun rather than relabelling specs |
| Drag to place | ✅ stand-ins onto the globe; lens/size/angle chips onto a station |
| Panel / rail rebuild | ✅ dividers not headings, workflow order, capture bar pinned above every section, Post panel |
| One roll, anchored on the path | ✅ the rival `rollCoverage` is gone; recipes plot dots, the path rolls them |
| Camera type per dot | ✅ "pt 1 is a 35mm tracking drone, pt 4 is handheld at eye level" |
| Dot colour | ✅ reads the rig by default, overridable per dot |
| Sequence presets | ✅ save the shape + every dot's shot, lay it down anywhere |
| Per-dot cast | ✅ who's in frame at which dot; the spec lists only who was visible |
| Cast & upload cleanup | ✅ named tiles with artwork, one add control (click / drop / paste), live cutout preview, removable uploads |
| Full-journey shakedown | ✅ seven defects found by driving it end to end and reading the output — see below |
| Flow pass | ✅ station rows collapse, Lock walks you on, Path taught at the first dot, `file://` says so up front |
| Second shakedown | ✅ four more defects, including a spec that recorded the wrong hemisphere's sun — see below |
| Third shakedown (adversarial) | ✅ deleting and emptying things — ghost cast ids, no way to drop one dot, a player left on a dead frame |
| Fourth shakedown (optical) | ✅ looks dropped the cant; the spec claimed a resolution its PNG didn't have |
| UI hierarchy pass | ✅ one primary per panel, no control offered twice, no raw file inputs, labels that fit |
| **Cut handoff (.zip)** | ✅ the whole cut in one file — frames, prompts, specs, VCS, VCO, README, filenames matching by construction |
| **Contact-shadow tuning** | ⏳ **needs real tiles** — alpha, size and pool direction want a human eye |

---

## The sequence, as of this pass

Free roam and the shutter are always live — fly anywhere, snap anything, at any point.
Everything below is the *other* mode, and it is one road, not two.

**A dot is a shot.** Plot dots on the map; each one owns:

| On the dot | Default |
|---|---|
| **Rig** — drone / handheld / dolly / crane / steadicam / FPV / locked | whatever chip was armed when you dropped it |
| **Colour** | the rig's colour — override per dot, shift-click the swatch to put it back |
| **Lens, shot size, angle** | inherited from your current framing; drag a chip onto the dot to set it |
| **Cast** | everyone visible — a dot only carries a cast list once you switch someone off at it |
| **Beat** | the player speed, until you set one in Post |

Changing a dot's rig changes its **height** — that's what a drone or a handheld *is* —
and leaves your lens, size and angle alone. A locked dot is never touched; it says so.

**One Roll.** `Roll every station` flies dot 1→N with the cinematic move and captures
each with that dot's own setup. It lives on the path and nowhere else.

**Recipes are a head start, not a rule.** Fincher / Classic / Documentary / Aerial epic
no longer carry their own anchor. Pick one and it **plots dots**: with no path it lays a
fresh sequence (fanned a few metres so each dot is separately draggable — at these shot
ranges the offset changes nothing); with a path already down it fills *only* the dots you
haven't set and leaves everything you locked exactly as you locked it.

**Sequence presets.** Save a plotted move — the shape plus every dot's rig, lens, size,
angle and colour — and lay it down at any other location. It's stored relative to dot 1
and to the heading you blocked it at, so it re-lays rotated to wherever you're now
looking, and it always arrives **unlocked**. Nothing is decided for you.

**Working a station.** A row you aren't on is a **one-liner** — number, label, rig glyph
and framing. Only the active row opens into its full controls, the same rule the cast
list already followed. Ten dots read as a list, not as ten stacked panels.

The active row's primary action is **`Lock shot →`**, and the arrow is literal: locking a
station you hadn't locked before walks you to the next open dot. **Re-locking** one you're
refining leaves you exactly where you are — being thrown to another dot mid-tune would be
hostile — and its button says `Re-lock`. Roll drives its own walk, so it is never affected.

Drop your first dot and a one-time coach says what the keys are: `Enter` locks the station
you're on, `N` jumps to the next open dot, Roll shoots them all. Taught at the moment of
need rather than on a welcome card nobody reads before they've seen the map.

**Opened as a file?** Scout says so on arrival — a single line on the stage, not a modal —
because browsers block saving the map canvas from `file://`. Clicking it opens the
30-second fix. Everything else works either way; only frame capture needs a local server.

**Cast is placed before the shutter fires**, because the capture is the actual rendered
frame, not a composite. A dot decides *who is in it*, not who gets added afterward. The
spec for a locked dot lists only the stand-ins that were visible when it shot.

### The cast picker

Stand-ins are **tiles with their own artwork and their real size on them** — `Person ·
standing 1.80m`, `Car · 4.6 × 1.45m` — not internal keys like `person2` or `vehicle_up3`.
Drag one onto the globe, or tap it and use Place mode.

Adding a picture is **one control with three gestures**: click it, drop a file on it, or
paste from the clipboard (paste jumps you to Cast automatically). The raw file input is
gone. The dialog **shows the background cutout instead of promising it** — toggle it and
the preview re-renders, so you find out before committing whether it ate your subject.
You name the picture there too, so it lands as "Hero car", not "Vehicle 3".

Your uploads sit on their own shelf below the built-ins, each removable. Removing one
takes it out of the picker and leaves anything already placed standing — deleting a
source picture must not quietly empty your scene.

**Explicitly out of scope** (per the anti-scope-creep guardrail): new engines, a framework
migration, monetization/packaging work, or anything that doesn't improve the frame or the spec.

---

## What the end-to-end shakedown found

Driving Scout the way a director would — plot five dots on mixed rigs, cast it, roll it,
read every export, reload — turned up seven defects that no unit assertion had caught,
because each one is only visible in the *output*.

| Defect | Why it mattered |
|---|---|
| Every shot in a mixed-rig sequence carried the **first** dot's rig prose | The headline feature reached the spec but not the prompt: a crane, a steadicam and a handheld all read "smooth aerial drone shot" |
| Any stand-in whose role wasn't `subject` / `foreground` / `background` was **silently dropped from every prompt** | Three of the six shot-types (`vehicle`, `light`, `vfx`) never made it into a single engine prompt |
| The world lock listed only **shot 1's** cast | With per-dot cast the cut's roster varies; the lock has to name everyone and say so |
| CONTINUITY claimed "same subjects" **through a cast change** | The one thing a continuity line must never do is lie |
| **The plotted path did not survive a reload** | Five dots, every rig, colour, framing and cast list — gone. The plotting *is* the work |
| **Uploads did not survive a reload** | A named, life-size "Hero car" came back as a screen-space map pin labelled `vehicle_up1` |
| The rail forced a **528px page on a 420px phone**, and the mobile CSS block sat first in the stylesheet so `#navCluster` and `.thumbs` lost their overrides on source order | Sideways scroll, and a nav cluster that was supposed to be hidden on touch eating the small stage |

All seven fixed and re-verified against the same journey. The lesson repeats from earlier
passes: **read the artifact, not the assertion.** Green tests said the rig was on the spec;
only the prompt text showed it never reached the sentence a human would read.

## What the second shakedown found

The first shakedown drove the sequence road. This one drove everything else — free roam,
recipes, undo, golden hour, KML, the single-frame studio, the PDF report, re-light, and a
preset across a reload. Four more defects, and the first is the most serious yet.

**The spec recorded the wrong place's sun.** `S._sun` was a cache with no key. It was
refreshed when you changed the date or time, and never when you *moved*. So: scout Chicago
at 18:40, fly to Paris, capture — and the frame ships with Chicago's sun. Measured, before
the fix: az 201.1° / el 48.3° for both. Paris at that instant is az 281.8° / el −7.4° —
below the horizon. The light block is what every downstream engine locks to, and it could
be for the wrong hemisphere. The cache is now keyed on target *and* clock, so it can be a
cache without ever being wrong. Six assertions guard it permanently (`suntest`).

**Re-light showed the wrong cast.** It called `travelCast` but not `applyStationCast`, so
a re-lit frame captured whoever happened to be visible rather than that station's own cast
list — and the spec then listed them.

**Re-light stripped the rig.** It rebuilt each spec with `buildSpec`, which cannot see
`camera_type` or `rig_feel` (those are written at lock time). Re-lighting a path sequence
silently reverted every shot's prompt to a generic camera. Re-light moves the sun; it now
carries the blocking forward untouched.

**A recipe picked its rig from the move verb alone.** "Aerial epic / High orbit" — an
establishing shot at an *aerial* angle — came out as a **steadicam**. Rig selection now
reads the whole step (angle, move, and an explicit `rig` when a recipe wants to name one),
so the aerial orbit is a drone, the crane reveal is a crane, and the Handheld recipe says
handheld instead of hoping the verb implies it.

Plus one hardening the run suggested rather than proved: autosave debounces 800ms, so the
last moment of work was always unwritten. It now flushes on `pagehide` and on the tab
being hidden — closing the tab or the phone locking can no longer land in that window.

## What the third shakedown found

This one was adversarial: delete things that other things reference, feed junk, hammer
keys, empty the cut mid-playback. Four defects, all of the same family — **the app was
fine as long as you only ever added**.

**Deleting a stand-in left its ghost in every dot that named it.** Cast lists store marker
ids. Delete the person, and dot 1's list still read `[person]` — so the *car*, the one
still on the globe, silently vanished from that dot's frames. Nothing said so. Deletion
now purges the id everywhere, and a list that ends up covering everyone goes back to
meaning "everyone". Clearing the whole cast clears every list. The shadow entity goes too.

**The Path panel kept a chip for a stand-in that no longer existed.** The marker list
repainted; the path list didn't.

**One wrong dot cost you the whole path.** There was no way to remove a single dot — only
`Clear`, which takes all of them. Every row now has a `×`. Removing a dot takes its shot
out of the sequence and shuffles the later shots' indices down, so the cut stays in path
order. Removing the last dot clears the path cleanly. The `⌫` next to it still means the
older thing: clear this dot's *shot*, keep the dot.

**The take player sat on a dead frame.** Empty the cut while it's open and it kept showing
a shot that no longer existed. It follows the cut now — shrinks onto a real shot, closes
when there's nothing left.

Nine degenerate calls (roll with no path, unknown recipe, unknown preset, remove dot −1,
remove dot 99, cast on no path, prompts on an empty cut) all return quietly rather than
throwing. Fifteen assertions guard it (`edgetest`).

Two things I *thought* were bugs and weren't: the FOV and lens readings looked wildly
wrong until I checked — `lensToFov` returns **degrees**, `S.fov` is degrees throughout, and
my harness had been injecting radians. And the autosave "regression" was my test racing an
800ms debounce. Worth recording: two of six suspicions were mine, not the app's.

## What the fourth shakedown found

The optical and honesty surface: film backs, whether the PNG matches what the spec claims,
saved looks, rolling twice, twenty dots, and whether a grade reaches the pixels.

**A saved look dropped the cant.** It stored name, target, head, tilt, range, fov and
sensor — and nothing else. So a deliberately Dutched close-up came back level, relabelled
as whatever size and angle you happened to be on. Looks carry `roll`, `shotSize` and
`angle` now, the row shows the cant before you load it, and looks saved before this still
load (they just come back level, which is what they were).

While fixing it I removed a second source of truth: the look briefly stored `lensMm`
*and* `fov`, which promptly disagreed with each other in testing. The lens is fov plus
film back; it's derived on load and stored once.

**The spec claimed a resolution the file didn't have.** `delivery.resolution` read
`[2048, 857]` for a PNG that was actually `996×417`. It's documented as the nominal
delivery target, but nothing recorded the real thing, so a consumer had no way to tell
intent from fact. Specs now carry `delivery.capture_px` — the actual pixel size of that
frame — beside the nominal target. Every path that makes a spec from a capture passes it.

Four things checked out clean and are worth recording as *not* bugs: changing the film
back correctly keeps the lens and narrows the field (same lens, smaller sensor), and the
spec records the right sensor width; every delivery aspect crops to the right ratio;
rolling a path twice after adding dots produces no duplicates and keeps path order; and
twenty dots render in ~11ms, all collapsed.

**A false alarm worth logging:** the `warm` grade looked like a no-op. It isn't — it's
only invisible on *pure blue*, which is exactly what a tile-less sandbox renders. On grey
it goes `[143,138,126]` and on skin `[223,163,119]`, both correctly warmer. That is the
third suspicion this session that turned out to be my test surface rather than the app.

## The studio spine (cross-engine)

The moat isn't any one tool — it's **shared memory across all four**. Today each engine
defines the same entities differently and stores them in its own silo:

| Engine | Role | Owns |
|---|---|---|
| **World Builder** | bible / identity | characters, costumes, scenes, relationships |
| **Scout** | location / camera / light | world_lock, camera_continuity, style, the captured frame |
| **VCS-15** | continuity observe / handoff | reads generated video, extracts drift, hands the baton |
| **VCO / Director's Chair** | performance / assembly | script, voice, video gen, storyboard, post |

**The plan: one canonical contract they all read and write** — a single `Character`,
`Location`, `StyleLock`, and `Shot/continuity` object, each with a **stable ID**. Define a
character once (World Builder), and Scout places that ID, VCO voices it, VCS-15 checks
against it. Same document, different tense: Scout emits it **PLANNED**, VCS-15 emits it
**OBSERVED**; diff the two and you have a continuity-error detector.

**Sequencing** (do not skip ahead):
- **S1 — align field names.** Scout's VCS-FORGE → VCS-15's real schema (backlog #2). Small,
  verifiable, no new concepts.
- **S2 — stable IDs.** Give characters/locations a shared ID scheme; Scout references World
  Builder character IDs in `subjects[]` instead of ad-hoc labels.
- **S3 — the bible file.** A tiny, boring, versioned JSON standard (`hgstudio.bible.v1`) that
  every app imports/exports. Unglamorous; it's the whole ballgame.
- **S4 — closed loop.** VCS-NEXT handoff feeds back into Scout to author the next shot.

Consolidation is **not** a goal — the apps can keep different stacks. Only the *data* converges.

---

## Phase gates (from the constitution)

Phases 0–4 are the shippable tool; **that gate is cleared** — Scout runs the loop. The next
gate (5–9) opens only after a real location is captured and one spec is exported *and used*.

| Phase | State |
|---|---|
| 0–4 Core tool | ✅ Done — loop works, spec emits, house style holds |
| **Gate** | ⏳ Open once a real location + spec goes through a downstream engine |
| 5–9 | Not started (correctly) — resist until the gate is proven |

---

## The handoff, in one motion

The constitution says the captured frame **plus** the spec is the product. Until now the
product could not actually be handed over: a five-shot cut meant downloading five PNGs
one at a time from the stage strip, copying a prompt document out of a modal, exporting
specs one by one, and then matching filenames by hand against the `start frame:` lines.
About a dozen interactions to assemble what Scout already knew.

**Export the cut (.zip)** does it in one:

```
frames/01_<shot>.png …   the real rendered frames, numbered in cut order
prompts/<engine>.txt     one document per engine, each naming its start frame
                         by the exact path in frames/
specs/01_<shot>.json     gmapz.capture.v2 per shot
cut.json                 gmapz.cut.v1 — order, beats, rigs, the shared world lock
vcs15.md · vco.json      the two studio handoffs
README.txt               what's in here, and the PLANNED-not-observed rule
```

The zip is written by hand — store-only, CRC32, real DOS timestamps, no dependency.
PNGs are already compressed, so deflate would buy nothing and cost a lot of code.

The part that matters is **one function decides a frame's filename**, and both the zip
and the prompt documents ask it. They cannot drift apart, because there is nothing to
keep in sync. That is the same rule that fixed the lens two passes ago: when two things
must agree, don't store both — derive one.

Verified with real tools rather than my own writer: `unzip -t` passes, all six prompt
documents name three frames that exist, `cut.json` points only at files in the archive,
the frames are real PNGs by magic number, and an empty cut writes nothing at all.

This is also the thing standing between the user and the output test below. Putting a
Scout sequence through Runway or Kling no longer requires assembling the handoff by hand.

## Needs the user (can't be done headlessly)

1. **Run it with the real Google key** on a place you care about — the only ground truth for
   the *feel*: motion/arc, tile quality, sun, and whether the contact shadows read right.
2. **The output test** — one Scout frame + prompt through Runway/Kling vs. prompting blind.
   Whatever you see reorders this whole backlog.
3. **Decisions that are yours** — the merge question (currently: not merging), and when the
   Phase-5 gate is proven enough to open.

---

## Shakedown 5 — measuring the aesthetic, and auditing the studio bridges

Two questions were open: does the look you pick actually reach the frame, and does what
Scout writes actually load into the other tools. Both were answered by measuring rather
than asserting.

### The look: half of it was invisible

Same camera, same ground, same sun; only the look changed. Mean pixel values from the
decoded PNGs:

| look | mean RGB | warmth (R−B) | saturation | luminance |
|---|---|---|---|---|
| neutral (none / clear) | 19.2 / 29.8 / 24.9 | −5.7 | 0.358 | 27.2 |
| A24 · warm · golden | 17.4 / 25.3 / 17.5 | −0.1 | 0.341 | 23.0 |
| noir · storm | 4.8 / 4.8 / 4.8 | 0.0 | **0.000** | 4.8 |
| Kodak · bleach · haze | 12.7 / 15.6 / 14.0 | −1.3 | 0.063 | 14.8 |

The grade genuinely lands: noir returns R=G=B exactly, warm/golden moves warmth +5.6,
bleach drops saturation by 0.295. **But `applyGrade()` was a stub** — it set an empty
overlay's opacity to 0 and did nothing else, so the monitor showed an ungraded picture
and you only discovered your frame was monochrome after the shutter fired. For a tool
whose product *is* the captured frame, that is the wrong way round.

Now `lookFilter()` builds the string once and there are two consumers: the capture bakes
it into the PNG, the monitor shows it as a **view LUT** (`L`, or the button by the guides).
They cannot drift because there is only one string. The LUT is a monitor control — turning
it off never changes the file. A neutral look applies no filter at all, so it costs nothing.

Worth stating plainly: **`style` is words, `grade`/`atmosphere` are pixels.** A24 vs Kodak
never touches the PNG — it's an instruction to the generator. That's correct, but it should
not be a surprise.

Also fixed, on the surface a human actually reads: *"a car and a car enters frame"* is now
*"two cars enter frame"*, with the verb agreed and the world-lock line counting too
(`a person as subject, two cars as vehicle`).

### The studio bridges: one works, one is aimed at the wrong target

Read from the real archives, not from memory:

- **VCS-15 parses what Scout writes.** Its section regex is
  `/^##\s+(VCS-OBS|VCS-SAL|VCS-CPAS|VCS-STYLE|VCS-FORGE|VCS-MATCH|VCS-NEXT|CONTINUITY RISKS)/gm`
  and Scout's `vcs15.md` headings match exactly. This integration is real today.
  One mismatch of *intent*: VCS-15 titles MATCH "Recreation Prompt" and NEXT "Next 15s
  Prompt"; Scout fills them with a continuity reference and a coverage note. It renders,
  but those panes want prompts.
- **There are two different VCOs, and `vco.json` fits neither exactly.**
  - *Director's Chair* (`directorschair.html`) is the one that shares Scout's vocabulary —
    `brief / bible / characters / shots / script / storyboard / score / tags`, with
    `vcsLocked` and `veoRef` on every tag. But its loader is `setProject(jsonData)` on the
    **top level**, and Scout emits `{ "project": { … } }` — one wrapper too deep, so every
    field lands as `undefined`. Its `brief` is an object (`title`, `logline`, `format`,
    `tone`), Scout's is a string; its `bible.visual_language` fields are arrays, Scout's
    are strings.
  - *VCO / Visual Copilot* (the React app) is a different program: its units are
    `Scene {prompt, image}`, `Character {lookPrompt, image, voiceName}`, `ScriptLine`,
    `StoryboardPanel`, `PostProductionTrack`, stored in IndexedDB and exported as
    `{styleSeed, scenes, characters, script, storyboard}`. No camera, no geo, no sun.
    Scout has nothing in that shape today — the honest bridge would be a `styleSeed`
    plus `scenes[]`, where each scene's `image` is a captured frame.

None of this is speculative; it's read off the loaders. It is also small work: the
Director's Chair fix is an unwrap plus two field shapes.

### Not a problem after all

Prompt length was a suspicion, not a defect — measured per engine across five shots the
bodies run 296–468 characters (longest 683, Sora). Nothing is over-long for any engine,
Grok Imagine included.

---

## The studio bridges, aimed at the real loaders

Reading the shipped code told us the shapes. Running the shipped code told us what actually
happened — and the two were not the same story.

### Three variants through the real Director's Chair

The app itself (React vendored locally, its two cosmetic CDNs dropped) importing three files:

| File | React errors | What you get |
|---|---|---|
| As Scout shipped it — `{project:{…}}`, `camera` an object | 0 | **"Project loaded successfully"** and an empty project. Blank brief, no bible, "GENERATE SHOT LIST". |
| Unwrapped only — root keys, `camera` still an object | **1** — React error #31 | Blank stage. Fixing the wrapper alone would have traded silent data loss for a crash. |
| This pass — root keys, `camera` a string | 0 | The shot list renders with the real lens, angle, rig and altitude. |

That middle row is the reason to run things rather than reason about them. The wrapper bug
was *masking* the camera bug: with no shots reaching `ShotsStage`, the object never rendered.
Both had to be fixed in the same motion or the first fix would have made things worse.

The full walk — all eight stages, Brief through Export — now runs with zero React errors, and
no rendered field anywhere reads `[object Object]` or `undefined`.

### World Builder: the keyless handoff

`handleImportProject` reads `styleSeed` / `scenes` / `characters` off the root and saves them.
It calls no model. So handing it scenes that already carry their images is a complete project
for zero API spend — the only handoff in the studio that costs nothing to receive.

Three details decided whether it landed, and all three are now asserted against the app's own
code rather than against a guess: bare base64 (its `fileToBase64` keeps only what follows the
comma), JPEG (every `<img>` is hardcoded to `data:image/jpeg`, and the compositing call
declares that mimetype to the model), and no wrapper. Every image in the export is verified to
begin `/9j/` — the base64 signature of a real JPEG — and to decode through World Builder's own
`<img>` form.

The character bridge is the part worth having. World Builder asks a model to place a character
"on the left" and "match lighting and style". Scout hands it the stand-in's real height in
metres, its exact position, and the key **relative to the lens** — "lit from camera left at 8°",
not a compass bearing. Its weakest input is Scout's strongest output.

Nothing is invented on the way across: `age`, `gender`, `personality` and `backstory` all exist
in these apps and all stay unwritten. `script` and `storyboard` ship empty because Scout has no
dialogue.

### VCS-15: MATCH and NEXT are prompts

VCS-15 titles those panes "Recreation Prompt" and "Next 15s Prompt", and its GEN-HANDOFF button
exports NEXT's body **verbatim** as `prompt`. Scout was filling them with a continuity reference
and a coverage note — so a coverage note would have shipped to a generator as if it were a
prompt. MATCH is now a recreation prompt with the anchors beneath it; NEXT is the following
shot's actual prompt, or, when nothing follows, recommended coverage labelled
`NOT YET BLOCKED` so it can't be mistaken for one.

While there: the cut bundle already called `vcs15(first)`, but `vcs15` took no arguments and
rebuilt from the live camera — so the handoff inside the zip described wherever the camera
happened to be parked rather than the cut it shipped with. It takes the spec now.

### What's still the user's call

The four World Builder forks are one program and should be one program (trunk =
`vcofullfeats1`, harvest WB2025's asset store and `mainwbakavc`'s PWA shell, retire
`Visual-Co-WB-main`). That's real work in a different repo and wants its own session.

---

## Correction: `Visual-Co-main` is the trunk, not `vcofullfeats1`

A fifth archive lands and supersedes the recommendation two sections up. `Visual-Co-main`
(AI Studio name "VCO FULL FEATS") is a strict superset of everything reviewed before:

| | vcofullfeats1 | **Visual-Co-main** |
|---|---|---|
| Gemini service fns | 16 | **26** |
| `App.tsx` | 15,025 B | 18,343 B |
| `types.ts` | 1,841 B | **4,299 B** |
| Persistence | IndexedDB | IndexedDB **+ Firebase** (`firebase.ts`, `firestore.rules`, blueprint + applet config) |
| Continuity | — | **`ContinuityEngine.tsx`** |
| Grounding | text only | **`GroundingTool.tsx`**, `mapsGrounding`, `searchGrounding` |
| Video | i2v | i2v **+ t2v** (`generateVideoFromPrompt`) |
| Image | generate / edit | **+ `generateImagePro`, `editImagePro`, `analyzeImage`** |
| Cineflow | — | **`generateCineflowForge`** + the whole `CF*` type family |

So the consolidation target changes: **trunk = `Visual-Co-main`**, harvest WB2025's asset-store
GC if it isn't already there, retire the rest. The earlier table's *method* stands; only the
winner moved.

### Two things this changes about the suite

**VCS-15 is already inside World Builder.** `ContinuityEngine.tsx` is titled, in its own
markup, "VCS-15 Continuity Engine", renders OBS / FORGE / STYLE badges, and generates
**CINEFLOW CF-FORGE** JSON against a typed `CFForge` interface. The merge that was being
debated has partly happened already — and it reaches Cineflow too. The three-band map
(plan → generate → continuity as a separate app) needs redrawing: continuity now sits inside
band 2, and the standalone VCS-15 is the *observation* half.

**The JPEG decision turned out to be load-bearing.** `analyzeScene` sends
`{ inlineData: { data: scene.image, mimeType: 'image/jpeg' } }` straight to Gemini. A PNG
mislabelled as JPEG would have been a model-side failure, not just a rendering quirk — the
re-encode was required, not cosmetic.

### `continuityStack[]` — the fifth key

That version's `handleImportProject` reads one key the others don't: `continuityStack`. Its
ContinuityEngine fills it by shipping each frame to a vision model and asking it to infer OBS /
FORGE / STYLE. For a Scout scene every one of those is already known for certain, so Scout
writes them directly — no model call, and authored beats inferred:

```
OBS   PLANNED, not observed. A courier crosses the plaza at golden hour. In frame: a person
      and a car. Real geography at 41.88820, -87.63500. Golden light, sun azimuth 265.7°
      elevation 7.8° — key from camera left at 8°. Medium on 24mm, eye angle, heading 48°.
FORGE Smooth aerial drone shot, gentle float, no jitter, cinematic stability. At the next cut:
      same location, same subjects, same light; the lens tightens to 50mm, the camera has
      moved about 67m along the route.
STYLE A24 — naturalistic, restrained palette, available light… warm grade, golden atmosphere.
      24mm on Full 36, 2.39:1. Palette sampled from the frame: #0b100b #13291c #1a3827 …
```

`enginePrompt` is the same string the scene carries, so the stack and the scene can't drift.
The last entry says the frame holds rather than inventing a shot after it.

### Repositories now reachable from this session

`list_repos` shows the studio, and any of them can be pulled in with `add_repo`:
`Visual-Co-WB` (public), `Visual-Co` (private), `VCS` and `VCS-2` (private), `Zips`,
`HGplay` — and **`ZEarth`** (private), pushed within minutes of this session's own work,
which is presumably Codex's Earth. When it's ready it goes into Scout's existing provider
slot beside Google tiles and the ESRI fallback, and Scout becomes keyless end to end.

---

## The lab copy — `gmapz_scout_lab.html`

A second file, so the shipped one can't be broken while an idea is being tried. Same
single-file discipline; it starts as a byte copy of `gmapz_scout.html` and diverges only
where the experiment lives. If an experiment earns its place, it gets ported back with its
tests. If it doesn't, the file gets deleted and nothing was risked.

### First experiment: the cut strip shows its holes

Post used to show what you shot. Plot ten dots, lock eight, and it showed eight cards —
nothing on that screen said two beats were missing. You'd have to go back to Path and
count, which is the wrong place to find out, because Post is where you decide to render.

The strip is now a list of **slots**, not shots:

```
10 points · 8 locked · 2 open — the take and the GIF render the 8 filled cells, left to right.

 ┌────┐ ┌────┐ ┌╌╌╌╌┐ ┌────┐ ┌────┐ ┌────┐ ┌╌╌╌╌┐ ┌────┐ ┌────┐ ┌────┐
 │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │ │ 7  │ │ 8  │ │ 9  │ │ 10 │
 │thumb│ │thumb│ │ 🚶 │ │thumb│ │thumb│ │thumb│ │ ⚡ │ │thumb│ │thumb│ │thumb│
 │24mm│ │28mm│ │OPEN│ │50mm│ │50mm│ │85mm│ │OPEN│ │100 │ │135 │ │135 │
 └────┘ └────┘ └╌╌╌╌┘ └────┘ └────┘ └────┘ └╌╌╌╌┘ └────┘ └────┘ └────┘
```

- An **open** cell is an outline, not a card — a hole reads as a hole.
- It sits in its **path position**, so a gap in the middle looks like a gap in the middle
  rather than getting dumped at the end.
- Clicking it **flies you to that dot** and hands you its blocking; Enter locks it and the
  hole fills.
- **Free-roam frames** — flown to and saved with `S`, belonging to no dot — ride along in
  cut order marked `✦`. You can still shoot anywhere, with no path at all.

Both ways of filling a slot already existed and both still work: `Roll every station`
flies the whole path and locks each dot in turn, or you fly to one dot, block it your way
with its own rig / lens / cast / light, and lock it alone. **The export did not change** —
the GIF still renders `S.shots` with frames, in order. What changed is that you can see
what isn't in it yet.

### One defect the test found

The first build numbered filled cells by **cut position** and open cells by **dot** — so a
cell labelled `3` could sit next to another cell labelled `3` and neither number meant
anything. The cell number is the dot now, always; a free-roam frame gets `✦` instead of a
number it would have to share.

29 assertions in `striptest.mjs`, zero page errors, including: ten dots plotted and none
locked, eight locked deliberately out of order, the holes landing in path position, the
GIF holding eight frames rather than ten, clicking a hole flying the camera to that dot,
locking it closing the hole, and free roam still working with no path at all.

### Second lab pass — the strip leads, and the cells are readable

Two changes only, both requested, both lab-only.

**Higher.** The strip sat under the shot list at the bottom of a long panel, so on a
laptop you scrolled past everything to reach the thing that tells you what the GIF will
contain. It now sits directly under "The cut", above the list — `strip y=402, list y=622`,
asserted rather than eyeballed.

**Bigger.** 96px cells with 54px thumbs were chips; you couldn't judge a frame from one,
and judging frames is the entire reason to look. Now 132px with an 84px thumb, and open
cells grew to match (126px tall) so a hole reads as the same size as the thing missing
from it.

Explicitly **not** done: drag-reorder on the strip. Reorder stays in the list — one
surface owns it, on purpose. Asserted: zero draggable nodes inside `#timeline`, and the
list still has its handles.

One thing caught on the way: with the extra room I added the rig to the cell caption, and
it immediately truncated — because the shot *name* already ends in the rig. Cell 1 read
"Start · Drone" above "24mm · medium · Dro…". Reverted; the caption is lens and size only.

38 assertions, zero page errors. `gmapz_scout.html` is byte-identical to its last commit.

**Still true, both invariants:** path order *is* cut order, and locking a dot fills that
dot's slot. Nothing in either lab pass touched `lockStation`, `rollStations` or the export
path — `cutCells()` only *reads* `S.path.points` and `S.shots[].stationIdx` to decide what
to draw.

## QA pass — `gmapz_scout_lab.html`

Parts 2 and 3 of the QA brief, run headlessly. 33 assertions, **1 failure**, zero page
errors. Part 1A (real tiles) cannot be run here and is not claimed.

| § | Result |
|---|---|
| A Globe / real tiles | **BLOCKED** — no Google key and the sandbox cannot reach tile servers |
| B Path persistence | **PASS** — real `page.reload()`, 6 dots and 4 locks restored, strip repainted with the same two holes |
| C Lock + cut strip | **PASS** — numbers 1–6 = dots, holes at the unlocked dots, in path position, click flies there |
| D GIF | **PASS** on count (5 image blocks, parsed from the GIF block structure). **PARTIAL** on labelling |
| E Export cut package | **FAIL** — `previs.gif` is not in the zip |
| F CONTINUITY | **PASS** — enter/leave counted, no "a car and a car", rig and lens per shot |
| G `file://` | **INCONCLUSIVE** — Cesium's CDN is proxy-blocked here, so this isn't the failure a real `file://` load would show |

### Two findings, neither fixed (brief said report, then stop)

**1. `previs.gif` missing from the cut zip.** The brief's manifest expects it. The zip
carries `frames/ specs/ prompts/ cut.json vcs15.md directors_chair.json worldbuilder.json
README.txt` — the GIF is a separate download. Counts otherwise match: 5 frames, 5 specs,
5 `cut.json` entries for 4 locked dots plus 1 free-roam frame.

**2. Duplicate subject labels.** Two cars both carry `label: "vehicle"`, so
`subjects[].label` reads `subject, vehicle, vehicle`. Not currently breaking anything —
every subject has a unique `id`, and the continuity language counts rather than names them
("two cars are no longer in frame") — but a consumer keying on `label` would collide.

### Labelling note (§D)

`README.txt` is explicit: *"Everything here is PLANNED and AUTHORITATIVE — blocking
authored in Scout. Nothing in it was observed from generated footage."* The GIF file itself
downloads as `directors_take_<ts>.gif`, which doesn't claim to be final film but doesn't
say previs either.

### One harness bug found and fixed

The reload test failed on first run — `page.addInitScript` re-runs on **every** navigation
including reloads, so it was clearing `localStorage` immediately before the reload it was
meant to verify. The autosave was fine. Fourth harness false-positive of the project; the
fix is to clear storage once, guarded by `sessionStorage`.

## Driving the app myself — Lake Rachel, Holmes City

Not a scripted happy path: the app used the way a person would, with every friction point
logged instead of scripted around. The brief was a white Mini Cooper with a black
convertible top running the length of an island and out across a bridge, drone tracking.

Sandbox truths stated rather than hidden: **no tile server and no geocoder reach this box**,
so the lake, the island and the bridge are drawn as local Cesium entities and the
coordinates for Holmes City are approximate and unverified. Everything else — the camera,
the car at life size, the eight captures, the GIF, the zip — is real.

### Two defects, both found by using it and neither by a test

**1. "A figure."** The single worst kind of bug this product can have. I uploaded a car,
named it, placed it, rolled eight drone shots — and every prompt called it *"A figure."*

An upload is keyed `<kind>_upN`. The spec builder derived a subject's type by strict
string match:

```js
type: isPersonType(m.type) ? 'person' : (m.type === 'vehicle' ? 'prop' : m.type)
```

`'vehicle_up1'` is not `'vehicle'`, so it fell through to `type:'vehicle_up1'`, missed
`SPEC_NOUN`, and every consumer defaulted to `'figure'`. **Every uploaded vehicle and prop
lost its identity** — in the spec, in all six prompt documents, in the continuity lines
and in the world lock. Uploaded people escaped only by accident, because `isPersonType` is
a `/^person|avatar/` prefix test that `person_up1` happens to satisfy.

`specSubjectType()` now asks the upload what it is — `UPLOADS[key].kind` was there the
whole time. One enum was added, `object`, because an uploaded prop is not a car and this
vocabulary's `prop` already means vehicle. 10 assertions; "figure" can no longer appear
anywhere in a document for a registered upload.

**2. The beat dropdown lied.** The strip showed `1.6s` and `0.7s`; the list dropdowns next
to them read `beat`. `BEATS` offers six presets and the `selected` test was exact
equality, so any beat arriving from a session, an import or a preset outside that list
displayed as unset while the cut really held it. The dropdown now carries the actual value
as its own option. 4 assertions.

### Friction worth naming, not yet fixed

- **Upload sizing takes the image's aspect, not the kind.** A vehicle upload came out
  2.73 m long; a Mini is 3.85 m. The height (1.50 m) is right and the width follows the
  picture, which is defensible — but there is **no field to type a real-world size**, so
  you take what the crop gives you. For a tool whose case is *life-size blocking*, that is
  the gap I would close next.
- **Search is unexercised here.** Both geocoders are proxy-blocked in this sandbox.

### Health

Zero page errors across the whole drive. The 17 console errors are all
`ERR_CERT_AUTHORITY_INVALID` from the sandbox's TLS interception of ESRI tiles and Google
Fonts — environmental, and incidentally proof the keyless imagery fallback is trying.

Regression after both fixes: strip 38, LUT 29, beat 4, noun 10, QA 33 — all green, with
the one known QA failure (duplicate subject labels) unchanged and still unfixed.

## Gaps closed in the lab

All three gaps QA named, plus one the first fix exposed. **Lab only** — none of this is in
the shipped spec yet, and `gmapz_scout.html` is untouched.

### 1. An upload can be told how big it really is

A Mini came out 2.73 m long. A Mini is 3.85 m. Height came from the kind and width from the
image's aspect ratio, so a picture with generous margins produced a small car and there was
no way to say otherwise. For a tool whose entire case is life-size blocking, that was the
wrong thing to be guessing.

Each kind now knows **which dimension a person actually knows**: you know a car is 3.9 m
long and you have never once thought about how tall it is; you know someone is 1.8 m and
have never thought about their width.

```
What is it?   [ Person ]  [ Vehicle ]  [ Prop ]
Length (m)    [ 3.85 ]
→ 3.85m long × 1.49m tall — the other dimension comes from the picture
```

The dimension you typed is never recomputed away; the aspect ratio decides the other one,
live, before you commit.

### 2. …and the aspect it uses is real

The first version of that field reported a Mini as **2.12 m tall**. The number was honest
arithmetic on a dishonest input: the PNG had transparent margin, and margin is not part of
the car. Left in it lies twice — the aspect comes out wrong, and padding below the wheels
**lifts the sprite off the ground in world space**.

`trimAlpha()` crops every upload to its opaque bounding box before anything is measured.
Same picture, same typed length: **3.85 m × 1.49 m**. A real Mini.

### 3. Two of the same thing are distinguishable

`subjects[].label` is the **role** — subject, vehicle, background — and the spec documents
it that way, so two cars really are both `"vehicle"`. Suffixing it to `"vehicle 2"` would
have corrupted a published field to satisfy a test.

Subjects gained a `name` instead: what the stand-in is actually called, made unique within
the scene. `["White Mini Cooper — black soft top", "Car 1", "Car 2", "Person"]`. The prompt
still counts rather than listing ("two cars enter frame") — names are for the machines that
need to follow one car across a cut.

The QA assertion was rewritten to test the requirement (*two vehicles must be
distinguishable*) rather than my earlier guess at which field would carry it.

### 4. `previs.gif` rides in the cut zip

The encoder was welded to a download, which is why the zip had no animatic in it. Split:
`buildTakeGif()` returns bytes, `exportTakeGifFile()` downloads them, `exportBundle()`
embeds them. One encoder, three callers, no duplicated body.

The download is named `previs_take_*.gif` now, and the README says
*"PREVIS ONLY — blocking playback, not generated motion."*

### Where that leaves the QA brief

**45 assertions, 0 failures.** The manifest check now reads the zip's own central directory
rather than trusting the writer: `cut.json`, `README.txt`, `previs.gif`, `vcs15.md`,
`frames/`, `specs/`, `prompts/`, five frames and five specs for five filled cells.

Re-driving Lake Rachel end to end: friction log down from three items to one, and that one
is environmental — both geocoders are proxy-blocked here, so search still cannot be
exercised in this sandbox. Zero page errors.

## Post-production shakedown — uploads, the bin, the GIF, the cut

Adversarial pass over the four surfaces, doing what a person does by accident rather than
what a script does on purpose. **Lab only.**

### The find: deleting an upload orphaned everything already placed from it

`removeUpload` was already trying to be careful. It keeps `WORLD_PROPS` so the survivor
draws at the right size, and its own confirm text promises *"anything already placed keeps
standing."* It does keep standing. It just forgets what it is:

```
before delete   name "White Mini Cooper"   type prop          → "A car."
after delete    name "vehicle_up1"         type vehicle_up1   → "A figure."
```

`UPLOADS[key]` is the only record of an upload's name and kind, so deleting it leaked an
internal key into `subjects[].name` and the marker list — and **re-opened the "A figure."
bug through a side door**, one pass after it was fixed.

An entry with something standing on it is **retired**, not deleted: gone from the picker,
still able to say what it is. Nothing placed and it really goes. The flag survives a
save/restore too, or a reload would put a deleted stand-in back in the picker while the
thing it belongs to is still in the scene.

### And a stand-in could be 99,999 metres long

The size field added last pass took any number at all. A stray digit gave a car the length
of a mountain range, silently. Clamped to 5 cm – 200 m — a doorknob to a container ship —
on both the dimension you type and the one the aspect ratio implies. A real number is left
exactly alone: 12 m stays 12 m.

### What held up

Everything else on those four surfaces survived: unnamed uploads still get names, two
uploads of one picture stay distinct, size 0 and −5 fall back, a 600×8 image and a fully
transparent one are both handled, bin cells match captures, deleting a bin entry doesn't
blank the shot using it, HQ genuinely captures 4× the pixels and records them, a one-frame
cut still makes a GIF, mixed aspect ratios letterbox into one canvas, an empty cut renders
nothing rather than throwing, 99 s and 0.01 s beats both encode, a reordered cut carries
through to the strip and the GIF, and emptying the cut closes the take player.

### Harness note

`capture()` **returns** `{id,url,w,h}` and **stores** `{…,spec}`. Reading the spec off the
return value gives `undefined`, which I misread as a null `capture_px` — twice. The
shakedown now reads the stored record and carries a comment saying why, so the file doesn't
hand the next person a false finding.

Suites: strip 38 · LUT 29 · beat 4 · noun 10 · gaps 15 · orphan 15 · QA 45 — all green,
zero page errors, shakedown findings back to zero.
