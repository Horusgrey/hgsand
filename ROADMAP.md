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
| **UX** | Welcome slate, empty states, autosave + restore, drag-reorder shots, discovery coach, Esc exits modes, mobile-aware |

---

## Backlog (Scout)

Ordered by leverage. Nothing here is required for the tool to work — it works now.

1. **Contact-shadow tuning** *(needs real tiles)* — the shadow logic is verified, but alpha,
   size, and pool-direction want a human eye on real Google photoreal tiles. One quick pass
   after the first real-tile test.
2. **VCS-15 export alignment** *(backbone)* — align Scout's VCS-FORGE field names to the real
   VCS-15 app schema (`character_lock`, `prop_lock`, `timeline`, `continuity_anchors`,
   `generation_risks`, `next_sequence_handoff`, `clip_type`) so the handoff is byte-clean.
   This is the **first concrete step toward the shared studio bible** (below).
3. **Location-aware audio spec** — Scout knows the place, time, and light; it could emit an
   ambient/environmental audio spec (harbor at dusk, city at night) for VCO/Veo to perform.
   The audio *authoring* stays in VCO; Scout contributes the location-derived spec.
4. **KML → scout targets** — parse imported KML placemarks into a clickable fly-to list, so a
   coordinate set (from any tool) becomes a batch of locations to block. Fixes the
   clamp-to-ground-in-3D-mode gap at the same time.
5. **Surface-more / stand-in polish** — continued refinement of discoverability and how the
   captured cast reads to i2v engines.

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
