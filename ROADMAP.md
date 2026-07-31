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

## Needs the user (can't be done headlessly)

1. **Run it with the real Google key** on a place you care about — the only ground truth for
   the *feel*: motion/arc, tile quality, sun, and whether the contact shadows read right.
2. **The output test** — one Scout frame + prompt through Runway/Kling vs. prompting blind.
   Whatever you see reorders this whole backlog.
3. **Decisions that are yours** — the merge question (currently: not merging), and when the
   Phase-5 gate is proven enough to open.
