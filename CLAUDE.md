# GMAPz Scout — Project Constitution

> Drop this file in the project root. Claude Code reads it every session. Keep it current.

## What this is
A photorealistic **location-scouting + shot-blocking** tool for AI filmmaking. You fly a virtual
camera over real Earth, block a shot like a DP, lock the real sun, drop in cast/prop stand-ins,
apply a look, **capture the actual rendered frame**, assemble the frames into a cut, and export
that cut — frames, animatic and machine-readable specs — for downstream image-to-video (i2v)
engines and the user's other tools.

Part of the user's "Mobile Hollywood" line (alongside Cineflow, VCO / Director's Chair,
VCS-15, World Builder).

## The one rule that governs every decision
**The map is not the product. The captured reference frame + the shot spec are the product.**
Everything — camera, light, look, cast — exists to produce honest rendered frames and honest
machine-readable specs. If a feature doesn't improve the frame or the spec, it's out of scope.

## Why this tool survives a better model, and the others didn't
The user has built several tools in this space (VCO / Director's Chair, World Builder,
Cineflow) and shelved them each time a large player shipped something adjacent. Scout is a
different bet, and the difference is structural rather than motivational:

- Those tools **organise prompts**. That is the first thing a model company builds around its
  own model, so it was always going to be taken.
- Scout is a **measuring instrument**. It produces a real rendered frame of a real place, at a
  real lens, under the real sun for a real date, plus a machine-readable record of the physical
  facts behind it. No model company ships that, because it is a geometry-and-honesty problem,
  not a model problem.

The consequence, and the reason to keep going: **a better generator makes Scout more valuable,
not less.** A controlled start frame is worth more to Veo 4 than to Veo 3. Prompt-organisers
lose ground as models improve; measuring instruments gain it.

## Sovereignty — depend on as little as possible, and show what's left
Every dependency is visible and, where it can be, optional.

- **The engine is local-first.** `CESIUM_SOURCES` tries `./cesium/` before either CDN.
  CesiumJS is Apache-2.0 and copyable, so dropping `Build/Cesium` beside the HTML makes Scout
  run forever with the network off. Skip it and the CDNs still work. Never remove the
  fallbacks — add lanes, don't replace the road.
- **The readout names its own source.** `engine  local copy · earth photoreal`. Whether you
  are currently depending on anyone is a fact on screen, not an assumption.
- **Google Photorealistic 3D Tiles is the one hard dependency**, and it is confined to a single
  `EARTH.mode`. Every other mode works without it; every spec records `earth_source`. The
  architecture is already shaped to accept a replacement (see `docs/ZEARTH-INTEGRATION.md`).

## The core loop (must always work end to end)
Aim at a real place → block the camera (size / angle / lens / height / move) → lock the light
(date + time → real sun) → capture the rendered frame → put it in the cut → export the cut.
Everything else is layered on top of this loop and must never break it.

## Hard constraints
- **Stack: one self-contained `gmapz_scout.html`.** Vanilla JS, hand-written CSS, CesiumJS from
  CDN with a second CDN as fallback. No build step, no bundler, no framework, no npm install.
  It opens by double-click and runs better behind `python3 -m http.server`. Do not introduce a
  toolchain unless the user asks — "it doesn't require a rebuild to demo" is part of done.
- **Imperative Cesium, simple state.** One central `S` object; functions read/write it and call
  `flyToParams()` / `getCurrent()` / `syncCamUI()`. No state framework.
- **Keys are pasted into the app's own fields** and remembered in `localStorage` per device.
  Never hardcoded, never committed, never printed into chat.
- **Capture must be the exact on-screen frame.** Viewer created with
  `contextOptions:{ webgl:{ preserveDrawingBuffer:true } }`.
- **Epistemic honesty in exports** (see *Ground truth* below): Scout output is
  **PLANNED / AUTHORITATIVE**, never "observed." Never fabricate speaker attribution, ambience,
  geometry or anything else the user didn't set and the app can't derive.
- **`window.gmapz` is the test surface.** Anything the headless harness must reach goes there.

## House style (match the user's existing tools)
- Background `zinc-950` (#0a0a0a). Panels `#09090b` / borders `#27272a`.
- Accents: yellow `#facc15` (primary), emerald `#34d399` (confirm/active), amber `#fbbf24`
  (a caveat), red `#f87171` (a failure — never fades, never wears a tick).
- Pipeline export buttons keep their lineage colors: **VCS-15 = #FB923C**, **VCO = #e8a23c**.
- Display font: Space Grotesk. Mono: ui-monospace.
- Dense, professional, dark. No rounded-cartoon UI. Think DaVinci Resolve, not a toy.
- **A panel offers only what it can currently do.** Controls that cannot act on the present state
  stay hidden rather than sit there dead. Nine live controls read as clutter; four read as a
  sequence.
- **A `.fold` is subordinate, never a rival entry point.** If feature B's only output is feature
  A's input, B is a fold inside A — not a sibling tab.

## Photoreal Earth setup
Primary: Google Photorealistic 3D Tiles.
```js
Cesium.GoogleMaps.defaultApiKey = S.google;                     // pasted in the Scout panel
const tileset = await Cesium.createGooglePhotorealistic3DTileset();
viewer.scene.primitives.add(tileset);
viewer.scene.globe.show = false;   // 3D tiles replace the globe
```
The key must have **Map Tiles API** enabled, with billing on. Google's console lists hundreds of
APIs and this is the only one that works here — a key that is valid for Maps JavaScript, Static
Maps, Places or Geocoding is still rejected. Say this in the UI, by name, every time it fails.

Fallback order: Cesium World Terrain + OSM buildings (`VITE`-free ion token, pasted like the
Google key) → keyless ESRI satellite drape.

**Three earth states, and they must never be confusable** (`EARTH.mode`, `setEarthMode`):

| mode | what you are shooting | treatment |
|---|---|---|
| `photoreal` | real 3D geometry | green, **the only state that gets a ✓** |
| `terrain` | real elevation, blocky buildings | green ✓ |
| `flat` | 2D imagery on a sphere, no geometry | amber `◇`, says it has no geometry |
| `rejected` | flat, but you supplied a key and think otherwise | **red, no tick, stage banner, never fades** |

`rejected` is the dangerous one. An earlier build painted it green and truncated the pill with
`text-overflow: ellipsis`, and a whole session got shot on flat drape by someone who believed
they had 3D. Never truncate a warning; never let a fallback wear a success mark.

Real lighting always on: `viewer.scene.globe.enableLighting = true`.

## Ground truth (the class of bug that has cost the most)
Names must mean what they say. Three separate quantities were once conflated into `altitude_m`:

- **`camera.altitude_m`** — the camera's real height above sea level.
- **`camera.height_above_ground_m`** — the camera's height above the dirt beneath it.
- **`camera.target_distance_m`** — how far the camera is from the point it is aimed at (`S.range`).

`camera{}` is **where the camera is**. `location{}` is **what it aims at**. They are different
places and must never share a field.

- The look-at point is on the **surface**, not the ellipsoid. `Cartesian3.fromDegrees(lon,lat)`
  with no third argument means sea level; at a location 425 m ASL that aims a quarter-kilometre
  underground and drags the camera down after it at low tilt. Use `targetGround()`.
- `groundAt()` **short-circuits to 0 on flat drape** — the imagery genuinely is painted at height
  0 and sampling it returns the chord of whatever coarse tile is loaded (Chicago comes back as
  −5483 m) which moves as tiles refine. Samples outside −450…9000 m are not places on Earth and
  are discarded.
- Picking the rendered world (`right-click`, double-click, `getCurrent`) yields a **measured**
  elevation. Store it on `S.target.h` and prefer it over any resample.
- A camera below `EYE_FLOOR_M` (1.6 m) above ground is buried, not low. `enforceEyeFloor()`.
- **`S.fov` is in DEGREES** everywhere in state; only `viewer.camera.frustum.fov` is radians.

## Lens → FOV (full-frame 36×24mm)
```js
// S.fov is degrees; convert at the frustum boundary only
const lensToFov = (mm, sensor) => 2 * Math.atan((sensor || sensorW()) / (2 * mm)) * 180 / Math.PI;
// In landscape the frustum fov is horizontal; in portrait, vertical. Pick sensor dim by aspect.
```
Lens presets: 24 / 35 / 50 / 70 / 85mm + Anamorphic. **Anamorphic is a delivery format (snap to
2.39:1), not a focal length** — keep them separate controls.

## Sun + golden hour
Sun position is physically accurate to `viewer.clock.currentTime`. **The date/time controls are
UTC** — the label says so out loud and shows longitude-derived local beside it, and the spec
records `tz: "UTC"`. Golden-hour finder: for the camera's lat/lng/date, sample the day and report
the windows where sun elevation is roughly −6°…+8°. Cesium has the ephemeris built in — no
external solar lib.

## The panels, in the order you work in
`Scout → Camera → Cast → Path & coverage → Light → Style → Post → Export`

**Path & coverage is one panel.** The director's five recipes (Classic, Fincher, Handheld,
Documentary, Aerial epic) produce nothing but dots on the path, so they are a fold underneath the
dots, labelled with what they will do to the dots that exist right now. They still plot a fresh
sequence from cold. "Saved runs" are the user's own named sequences — never call those presets,
the word already belongs to the recipes.

### The One Road model (`design/GMAPz_One_Road_Sequence_Model.pptx`)
The user's own product model, and the reason the panel is shaped this way. **One sequence
object: a path of stations. Everything else is a way to fill it.** All five of its build-order
items are shipped — camera type per dot, recipes that plot dots, saved runs, dot colour by rig,
per-dot cast — and its two design laws govern the dot list:

- **A dot's fill is its rig family; the ring around it is its state.** Two channels, never one.
  Three families only — `RIG_FAMILY`: aerial `#60a5fa` (drone, FPV, crane), ground `#f59e0b`
  (handheld, dolly, steadicam), static `#71717a` (locked-off). Seven per-rig hues used to
  include the emerald that means *this dot has a frame* and the yellow that means *the camera is
  here now*, so a steadicam dot and a shot dot were the same green. **Never spend a state colour
  on a category.** A per-dot override still beats both.
- **The dot list is a table, not a sentence.** `Pt · Point · Lens · State` on one grid, so every
  row's lens lands under every other row's. Values that share a column get shortened to fit
  (`EWS / WS / MS / CU`) rather than truncated — the only thing allowed to ellipsis is a name.

## Export — the cut (.zip), the primary deliverable
```
frames/     the real captured PNGs, numbered in cut order
specs/      gmapz.capture.v2.1, one per frame
prompts/    one document per engine, naming its start frame by exact filename
cut.json    gmapz.cut.v1 — order, beats, and the shared world lock
previs.gif  the cut as a looping animatic at your beats — PREVIS ONLY, not generated motion
README.txt  describes exactly the files that are present, and nothing else
```
Studio handoffs (below) ride along **only when the user turns them on**.

## Export 1 — `gmapz.capture.v2.1` (neutral spec, always emitted)
```json
{
  "spec": "gmapz.capture.v2.1",
  "id": "scout_<timestamp>",
  "captured_at": "<ISO8601>",
  "location": {
    "name": "", "lng": 0, "lat": 0,
    "ground_elevation_m": 0,
    "earth_source": "google_photoreal_3d|cesium_terrain_osm|esri_flat_imagery",
    "geometry": "3d|flat_2d_imagery"
  },
  "camera": {
    "lng": 0, "lat": 0,
    "altitude_m": 0, "height_above_ground_m": 0,
    "aim_lng": 0, "aim_lat": 0, "target_distance_m": 0,
    "heading_deg": 0, "pitch_deg": 0, "roll_deg": 0,
    "lens_mm": 35, "fov_deg": 0, "sensor": "full-frame", "sensor_width_mm": 36,
    "shot_size": "ewide|wide|medium|close", "angle": "eye|low|high|aerial",
    "move": "static|push|pull|orbit|crane|aerial|path"
  },
  "light": { "date": "", "time": "", "tz": "UTC", "sun_azimuth_deg": 0, "sun_elevation_deg": 0, "phase": "golden|blue|day|night" },
  "look": { "style": "", "grade": "", "atmosphere": "", "terrain_exaggeration": 1 },
  "delivery": { "aspect": "2.39:1|16:9|9:16|1:1", "resolution": [1920, 1080], "capture_px": [0, 0] },
  "subjects": [ {
    "id": "", "type": "person|prop|object", "label": "", "name": "",
    "lng": 0, "lat": 0, "scale": 1,
    "height_m": 1.80, "width_m": 0.66, "elevation_offset_m": 0
  } ],
  "scene_description": "",
  "reference_frame": "scout_<timestamp>.png"
}
```
`resolution` is the delivery **target**; `capture_px` is what the PNG actually is — a consumer
must never have to guess which it holds. `height_m`/`width_m` are the stand-in's real-world size
after scale; `elevation_offset_m` is how far it was raised off the ground. `earth_source` exists
so a frame can never claim geometry it did not have.

**Reading a spec back:** use `recallCamera(spec)`. Pre-2.1 files put the aim point in
`camera.lat/lng` and the orbit distance in `altitude_m`; they are detected and read the old way,
so an old project does not jump when reopened. `camDistance(camera)` does the same for the range.

## Export 2 — i2v prompts (per engine)
From the spec, generate an engine-tuned prompt string + the captured PNG as the start frame, for:
**Runway Gen-4, Kling, Veo 3, Sora, Luma, Grok Imagine**. Same scene facts, phrased for each
engine's strengths (camera-move verbs, duration hints, etc.). The PNG is the start/reference frame.

## Exports 3–5 — studio handoffs (PARKED, opt-in)
All three are built, verified against the real loaders, and folded away in the Export panel with
`In the zip: OFF` by default. They are not deleted and the schemas below are still correct — they
are simply not what this tool is for today. **Unpark only on the user's say-so.**

### Export 3 — VCS-15 handoff (.md, button color #FB923C)
Eight sections, fixed order. Scout fills what it knows as **PLANNED/AUTHORITATIVE**; SAL stays
UNKNOWN at pre-vis. VCS-MATCH and VCS-NEXT hold **prompts**, not notes — VCS-15's GEN-HANDOFF
exports NEXT verbatim as `prompt`.
```
## VCS-OBS        (planned scene observation: location, time, light)
## VCS-SAL        (speaker attribution — UNKNOWN at pre-vis, do not fake)
## VCS-CPAS       (camera/pose/angle/size — from camera{})
## VCS-STYLE      (look{} + delivery{})
## VCS-FORGE      (JSON: project_id, clip_id, world_lock, characters, props,
                   shot_timeline, camera_continuity, style_lock, continuity_handoff)
## VCS-MATCH      (continuity refs — frame id, sun az/el, lens)
## VCS-NEXT       (suggested next coverage, as a pasteable prompt)
## CONTINUITY RISKS
```

### Export 4 — Director's Chair (.json, button color #e8a23c)
Shapes below are what the **shipped app actually reads** — verified by importing into it, not
by matching this doc. Where the two disagreed, the app won.
```
{ brief{}, bible{}, characters[], shots[], script:null, storyboard:null, score:null, tags{} }
   ^ no "project" wrapper — loadProject(d) does setProject(d) on the root
brief{}  { title, logline, format, tone, duration, engine, worldContext, canon }
         engine ∈ Sora | Kling | Runway | Veo 3 | Grok Aurora | Gemini Flow
shots[]  { id, scene, shot_type, duration, description,
           camera:"<string>", lighting:"<string>",   ← ShotsStage renders these as React
           camera_spec{}, light_spec{}, reference_frame }   children; objects throw #31
tags{}   @imageN/@location_/@prop_/@system → { type, displayName, description, vcsLocked, veoRef }
bible.visual_language { palette[], forbidden_drift[], lighting_rules[] }   ← arrays
```
`palette` is sampled from the captured frame (median-cut), never invented. Characters carry
only what Scout can know — what, how big, where, and how it's lit. `age`/`gender`/
`personality`/`backstory` exist in that app and stay unwritten. With no scene written, `logline`
comes from `autoLogline()` and says there is no scene yet — it does not paste a raw enum next to
raw coordinates.

### Export 5 — World Builder / Visual Co (.json, button color #e8a23c)
The one handoff that **costs no API key**: its importer reads the root and calls no model, so
scenes that arrive with their images are scenes already made.
```
{ styleSeed{image,mimeType,prompt}, scenes[], characters[], script:[], storyboard:{}, postProduction:{} }
scenes[]     { id, prompt, image }
characters[] { id, name, role, lookPrompt, image? }
```
Every `image` is **bare base64 JPEG** — no `data:` prefix (its `fileToBase64` keeps only what
follows the comma) and genuinely JPEG (every `<img>` is hardcoded to `data:image/jpeg`).
`lookPrompt` states the key **relative to the lens** ("lit from camera left at 8°"), which is
the thing World Builder's compositing step otherwise has to guess.

## Never say what you cannot know
The soundscape (`gmapz.audio.v1`) and every prompt derive from the clock, the weather, the camera
geometry and what was actually placed — nothing else. Scout does not know whether a location is
urban or rural, so it never says. A subject 2.5 km from the lens does not make footsteps you can
hear; gate close detail on `target_distance_m`. A camera 1.4 km above ground is not "ground
level"; gate perspective on `height_above_ground_m`, not tilt. Emit `derived_from` so a reader
can see what the guess was and wasn't built on.

## Checking the cut
The animatic is the deliverable, so the cut's integrity is the product's integrity.
`cutIssues()` reports, live, above the strip and in **Check the cut**:
- **repeated framings** — same place, heading ±3°, tilt ±3°, lens ±2mm, same size. A 1° nudge is
  not new coverage. (A real user cut once had 11 shots and 4 distinct cameras, silently.)
- **delivery drift** — `cut.json` locks the first shot's aspect, so any later change disagrees
  with its own world lock.
- **light continuity** — phase changes, >15° elevation or >45° azimuth jumps, date changes; with
  a genuine re-shoot (never a relabel) offered as the fix.

## Definition of done (per feature)
A feature is done when: it works in the core loop, it's reflected in `gmapz.capture.v2.1`, it
matches house style, it's covered by the headless suites, and it doesn't require a rebuild to
demo. If you can't capture a frame that proves it, it's not done.

## Testing
Headless Chromium via Playwright against a locally served copy. Four suites, 188 assertions:
`core` (the whole loop end to end), `truthtest` (earth state, ground truth, spec honesty),
`pathtest` (the merged Path panel), `exporttest` (the zip, cut integrity, prose). **Zero page
errors is part of green.** Read the real artifact where you can — the zip suite walks the actual
central directory rather than spying on an internal.

When a suite disagrees with the app, suspect the suite first: past false positives include
injecting radians into a degrees field, racing an 800ms autosave debounce, reading a CSS
transition mid-flight, and forgetting that `vco()` and `worldBuilderProject()` are async.

## Anti-scope-creep guardrail
The frames and the animatic come first, and everything else waits its turn. Currently parked by
the user's explicit decision, in this order:

1. **Avatar / cast overhaul** — placement, posing, and making a stand-in read as a person.
2. **Frame-by-frame motion capture** — capturing *during* the fly rather than only at locked
   dots, so the GIF is the shot moving rather than a slideshow of its beats. This is a real build,
   not a toggle: deterministic camera stepping instead of animated flight, waiting for tiles per
   frame, cast interpolating on the same clock, and a size story (GIF caps out fast — offer the
   PNG sequence, and look at WebCodecs for MP4).
3. **Unparking the studio handoffs.**

Resist adding settings, abstractions, or "engines" the loop doesn't need.
