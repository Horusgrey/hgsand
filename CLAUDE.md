# GMAPz Scout — Project Constitution

> Drop this file in the project root. Claude Code reads it every session. Keep it current.

## What this is
A photorealistic **location-scouting + shot-blocking** tool for AI filmmaking. You fly a virtual
camera over real Earth, block a shot like a DP, lock the real sun, drop in cast/prop stand-ins,
apply a look, **capture the actual rendered frame**, and export a structured shot spec that
downstream image-to-video (i2v) engines and the user's other tools can read.

Part of the user's "Mobile Hollywood" line (alongside Cineflow, VCO, VCS-15).

## The one rule that governs every decision
**The map is not the product. The captured reference frame + the shot spec are the product.**
Everything — camera, light, look, cast — exists to produce one honest rendered frame and one
machine-readable spec. If a feature doesn't improve the frame or the spec, it's out of scope.

## The core loop (must always work end to end)
Aim at a real place → block the camera (size / angle / lens / height / move) → lock the light
(date + time → real sun) → capture the rendered frame → emit the spec. Everything else is layered
on top of this loop and must never break it.

## Hard constraints
- **Stack:** Vite + vanilla JS + Tailwind + CesiumJS. No React unless the user later asks.
- **Imperative Cesium, simple state.** One central `state` object; functions read/write it and
  call `applyToCamera()` / `syncFromCamera()`. No state framework.
- **Keys come from `.env`** (`VITE_*`), never hardcoded. `.env` is gitignored.
- **Capture must be the exact on-screen frame.** Viewer created with
  `contextOptions:{ webgl:{ preserveDrawingBuffer:true } }`.
- **Epistemic honesty in exports** (see schemas): Scout output is **PLANNED / AUTHORITATIVE**,
  never "observed." Never fabricate speaker attribution or things the user didn't set.

## House style (match the user's existing tools)
- Background `zinc-950` (#0a0a0a). Panels `#09090b` / borders `#27272a`.
- Accents: yellow `#facc15` (primary), emerald `#34d399` (confirm/active).
- Pipeline export buttons keep their lineage colors: **VCS-15 = #FB923C**, **VCO = #e8a23c**.
- Display font: Space Grotesk. Mono: ui-monospace.
- Dense, professional, dark. No rounded-cartoon UI. Think DaVinci Resolve, not a toy.

## Photoreal Earth setup
Primary: Google Photorealistic 3D Tiles.
```js
Cesium.GoogleMaps.defaultApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const tileset = await Cesium.createGooglePhotorealistic3DTileset();
viewer.scene.primitives.add(tileset);
viewer.scene.globe.show = false; // 3D tiles replace the globe
```
Fallback (no Google key): Cesium World Terrain + Bing/ion imagery via `VITE_CESIUM_ION_TOKEN`.
Real lighting always on: `viewer.scene.globe.enableLighting = true` (or sun lighting on the tileset).

## Lens → FOV (full-frame 36×24mm)
```js
// returns radians; set on viewer.camera.frustum.fov
const lensToFov = (mm, sensor = 36) => 2 * Math.atan(sensor / (2 * mm));
// In landscape the frustum fov is horizontal; in portrait, vertical. Pick sensor dim by aspect.
```
Lens presets: 24 / 35 / 50 / 70 / 85mm + Anamorphic. **Anamorphic is a delivery format (snap to
2.39:1), not a focal length** — keep them separate controls.

## Sun + golden hour
Sun position is physically accurate to `viewer.clock.currentTime`. Set time from the date/time
controls. Golden-hour finder: for the camera's lat/lng/date, sample the day and report the
windows where sun elevation is roughly -6°…+6° (civil twilight → low sun). Cesium has the
ephemeris built in — no external solar lib.

## Export 1 — `gmapz.capture.v1` (neutral spec, always emitted)
```json
{
  "spec": "gmapz.capture.v1",
  "id": "scout_<timestamp>",
  "captured_at": "<ISO8601>",
  "location": { "name": "", "lng": 0, "lat": 0, "ground_elevation_m": 0 },
  "camera": {
    "lng": 0, "lat": 0, "altitude_m": 0,
    "heading_deg": 0, "pitch_deg": 0, "roll_deg": 0,
    "lens_mm": 35, "fov_deg": 0, "sensor": "full-frame",
    "shot_size": "wide|medium|close", "angle": "eye|low|high|aerial",
    "move": "static|push|pull|orbit|crane|aerial"
  },
  "light": { "date": "", "time": "", "tz": "", "sun_azimuth_deg": 0, "sun_elevation_deg": 0, "phase": "golden|blue|day|night" },
  "look": { "style": "", "grade": "", "atmosphere": "" },
  "delivery": { "aspect": "2.39:1|16:9|9:16|1:1", "resolution": [1920, 1080] },
  "subjects": [ { "type": "person|prop", "label": "", "lng": 0, "lat": 0, "scale": 1 } ],
  "scene_description": "",
  "reference_frame": "scout_<timestamp>.png"
}
```

## Export 2 — i2v prompts (per engine)
From the spec, generate an engine-tuned prompt string + the captured PNG as the start frame, for:
Runway Gen-4, Kling, Veo 3, Sora, Luma. Same scene facts, phrased for each engine's strengths
(camera-move verbs, duration hints, etc.). The PNG is the start/reference frame.

## Export 3 — VCS-15 handoff (.md, button color #FB923C)
Eight sections, fixed order. Scout fills what it knows as **PLANNED/AUTHORITATIVE**; SAL stays
UNKNOWN at pre-vis.
```
## VCS-OBS        (planned scene observation: location, time, light)
## VCS-SAL        (speaker attribution — UNKNOWN at pre-vis, do not fake)
## VCS-CPAS       (camera/pose/angle/size — from camera{})
## VCS-STYLE      (look{} + delivery{})
## VCS-FORGE      (JSON: project_id, clip_id, world_lock, characters, props,
                   shot_timeline, camera_continuity, style_lock, continuity_handoff)
## VCS-MATCH      (continuity refs — frame id, sun az/el, lens)
## VCS-NEXT       (suggested next coverage)
## CONTINUITY RISKS
```

## Export 4 — VCO / Director's Chair (.json, button color #e8a23c)
```
project { brief, bible, characters, shots[], script:null, storyboard:null, score:null, tags{} }
shots[]  { id, scene, shot_type, duration, description, camera, lighting }
tags{}   @imageN/@location_/@prop_/@system → { type, displayName, description, vcsLocked, veoRef }
bible.visual_language { palette, forbidden_drift, lighting_rules }
```
Scout fills `shots`, `tags`, `bible.visual_language`, `brief`. Leaves `script/storyboard/score`
null and `characters` as honest stubs.

## Definition of done (per feature)
A feature is done when: it works in the core loop, it's reflected in `gmapz.capture.v1`, it
matches house style, and it doesn't require a rebuild to demo. If you can't capture a frame that
proves it, it's not done.

## Anti-scope-creep guardrail
Phases 0–4 are a shippable tool. Do not start 5–9 until the user has captured a real location and
exported one spec. Resist adding settings, abstractions, or "engines" the loop doesn't need.
