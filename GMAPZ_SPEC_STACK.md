# GMAPz Scout — Spec Stack

The data contracts GMAPz Scout emits. One capture produces a frame plus a structured
record; everything else is a **view** of that record for a downstream tool. The frame +
`gmapz.capture.v2` are the product — the prompt, the VCS-15 handoff, and the VCO project
are derived from it.

```
                          ┌──────────────────────────┐
   block the shot  ─────► │  gmapz.capture.v2 (core) │ ─────► reference_frame.png
                          └────────────┬─────────────┘
                                       │  derived views
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                         ▼
        i2v prompt (txt)        VCS-15 handoff (.md)        VCO project (.json)
              │                        │                         │
              └──────────── session.json wraps state + markers + looks + shots ┘
```

---

## 1. Core contract — `gmapz.capture.v2`

Emitted by **Export gmapz.capture.v2 (.json)** and embedded inside every saved shot.

```json
{
  "spec": "gmapz.capture.v2",
  "id": "cap1719360000000",
  "captured_at": "2026-06-26T17:00:00.000Z",

  "location": {
    "name": "Marina City Chicago",
    "lng": -87.6345,
    "lat": 41.8885,
    "ground_elevation_m": 0
  },

  "camera": {
    "lng": -87.6345,
    "lat": 41.8885,
    "altitude_m": 650,
    "heading_deg": 30,
    "pitch_deg": -12,
    "roll_deg": 0,
    "lens_mm": 35,
    "fov_deg": 54,
    "sensor": "Full 36",
    "sensor_width_mm": 36,
    "shot_size": "medium",
    "angle": "eye",
    "move": "static",
    "camera_type": "drone",
    "rig_feel": "smooth aerial drone shot, gentle float, no jitter, cinematic stability"
  },

  "light": {
    "date": "2026-06-26",
    "time": "23:30",
    "tz": "UTC",
    "sun_azimuth_deg": 296.4,
    "sun_elevation_deg": 6.2,
    "phase": "golden"
  },

  "look":     { "style": "cinematic", "grade": "none", "atmosphere": "clear" },
  "delivery": { "aspect": "2.39:1", "resolution": [2048, 857], "capture_px": [996, 417] },

  "subjects": [
    { "id": "m1719360000123", "type": "person", "label": "subject", "lng": -87.6346, "lat": 41.8884, "scale": 1, "height_m": 0 }
  ],

  "scene_description": "",
  "reference_frame": "cap1719360000000.png"
}
```

### Field reference

| Path | Type | Notes |
|---|---|---|
| `spec` | string | Always `gmapz.capture.v2`. Version gate for consumers. |
| `id` | string | Stable per capture; also the PNG basename. |
| `captured_at` | ISO 8601 | UTC timestamp. |
| `location.name` | string | From the search field; may be empty. |
| `location.lng/lat` | number | The look-at target (not the camera eye). |
| `location.ground_elevation_m` | number | Reserved; `0` unless terrain-sampled. |
| `camera.lng/lat` | number | Target the camera is framed on. |
| `camera.altitude_m` | number | `range` — eye-to-target distance, not AGL height. |
| `camera.heading_deg` | number | 0 = north, clockwise. |
| `camera.pitch_deg` | number | Negative = looking down (Cesium tilt). |
| `camera.roll_deg` | number | Dutch-angle cant, ±30° (Camera panel slider · `[` `]` · `\` to level). `0` = level. Rendered into the frame and round-tripped through saved shots. |
| `camera.lens_mm` | number | Derived from `fov_deg` + `sensor_width_mm`. |
| `camera.fov_deg` | number | Horizontal FOV, source of truth in the engine. |
| `camera.sensor` | string | Film-back label (`Full 36`, `S35 24.9`, `APS-C 23.5`, `M4/3 17.3`). |
| `camera.sensor_width_mm` | number | **New in v2.** Drives the lens↔FOV math. |
| `camera.shot_size` | enum | See §2. |
| `camera.angle` | enum | See §2. |
| `camera.move` | string | `static` for stills; path shots (including recipe-plotted dots) write `path`. |
| `camera.camera_type` | enum | **Path shots only.** The rig that shot this dot: `drone` / `handheld` / `dolly` / `crane` / `steady` / `fpv` / `locked`. Set per dot, not per path. |
| `camera.rig_feel` | string | **Path shots only.** The prose the rig contributes to i2v prompts. Derived from `camera_type`; never authored by hand. |
| `light.date/time` | string | As entered; pair with `tz`. |
| `light.tz` | string | Always `UTC` in this build. |
| `light.sun_azimuth_deg` | number | 0 = north, clockwise. Computed for the spec's own `location` at its own `date`/`time` — the sun is re-derived whenever either changes, so a frame can never carry another place's light. |
| `light.sun_elevation_deg` | number | Degrees above horizon; negative = below. |
| `light.phase` | enum | `night` / `blue` / `golden` / `day` (from elevation). |
| `look.style` | enum | See §2. **Words only** — a style is an instruction to the generator, never a pixel change. The PNG is untouched by it. |
| `look.grade` | enum | **Pixels.** Baked into the PNG at capture. |
| `look.atmosphere` | enum | **Pixels + scene.** Fog density in the render, plus a tint baked into the PNG. |

`grade` and `atmosphere` are one filter string built by `lookFilter()`. The capture bakes
it into the PNG and the monitor displays it as a view LUT (`L`), so what you frame is what
you get. The LUT is a monitor control only — turning it off changes nothing about the file.
| `delivery.aspect` | enum | The PNG is cropped to this. |
| `delivery.resolution` | [w,h] | Nominal target res for the aspect — what you're delivering *to*, not what this file is. |
| `delivery.capture_px` | [w,h] \| null | **What this PNG actually is.** Set whenever the spec belongs to a real capture; `null` for a spec built without one. Never guess which of the two you're holding — `resolution` is the intent, `capture_px` is the fact. |
| `subjects[]` | array | One per marker **that was visible when the shutter fired**. A path dot with its own cast list emits only the stand-ins in that list — the frame is the truth, so the spec never claims someone who wasn't in it. |
| `subjects[].id` | string | Stable marker id, so a consumer can follow the same stand-in across shots. |
| `subjects[].type` | string | `person` / `prop` / `light` / `vfx` (normalized from sticker). |
| `subjects[].label` | string | The marker's assigned shot type. |
| `subjects[].lng/lat` | number | Ground position. |
| `subjects[].scale` | number | Stand-in scale multiplier (1 = life-size: person 1.8m, vehicle 4.6m). |
| `subjects[].height_m` | number | Raised height (Alt+scroll / slider / snap). |
| `scene_description` | string | Free text from the Style panel. |
| `reference_frame` | string | `<id>.png` — the captured frame this record describes. |


---

## Export 5 — `gmapz.cut.v1` (the whole cut, inside the handoff zip)

`Export the cut (.zip)` writes one archive containing everything a downstream engine
needs. `cut.json` is its index:

```json
{
  "spec": "gmapz.cut.v1",
  "exported_at": "<ISO8601>",
  "location": { "...": "same shape as capture.v2 location" },
  "world_lock": { "light": {}, "look": {}, "delivery": {} },
  "shots": [
    { "n": 1, "name": "Pt 1 — Start · Drone",
      "frame": "frames/01_Pt_1_Start_Drone.png",
      "spec":  "specs/01_Pt_1_Start_Drone.json",
      "beat_s": 1.2, "camera_type": "drone",
      "lens_mm": 24, "shot_size": "ewide", "angle": "aerial" }
  ]
}
```

| Path | Notes |
|---|---|
| `world_lock` | Taken from shot 1 — the light, look and delivery every shot shares. |
| `shots[].frame` / `.spec` | Archive-relative paths. **The same filenames the prompt documents print after `start frame:`** — one function generates both, so they cannot disagree. |
| `shots[].beat_s` | `null` unless a beat was set; the player speed applies otherwise. |
| `shots[].camera_type` | `null` for free-roam frames; set for path shots. |

Archive layout: `frames/`, `prompts/<engine>.txt` (all six), `specs/`, `cut.json`,
`vcs15.md`, `vco.json`, `README.txt`. Store-only zip, no compression — the PNGs are
already compressed.

### Lens ↔ FOV math

```
fov_deg  = 2 · atan( sensor_width_mm / (2 · lens_mm) ) · 180/π
lens_mm  = sensor_width_mm / ( 2 · tan( fov_deg · π/360 ) )
```

Changing the sensor holds `lens_mm` constant and recomputes `fov_deg` — the same lens reads
tighter on a smaller sensor.

---

## 2. Controlled vocabularies

Consumers should treat these as the closed enums GMAPz emits.

| Set | Keys → meaning |
|---|---|
| **shot_size** | `ewide` Establishing · `wide` · `medium` · `close` · `detail` (default orbit range, m: 4500 / 1600 / 650 / 240 / 90) |
| **angle** | `aerial` −72° · `high` −45° · `eye` −12° · `low` +6° · `worm` +22° (values are pitch/tilt) |
| **lens** (mm) | 16 · 24 · 35 · 50 · 70 · 85 · 135 (FOV slider 8–120° overrides) |
| **sensor** | `Full 36` 36mm · `S35 24.9` 24.9mm · `APS-C 23.5` 23.5mm · `M4/3 17.3` 17.3mm |
| **style** | `a24` · `panavision` · `pixar` · `realistic` · `cinematic` |
| **grade** | `none` · `cinematic` · `teal` · `bleach` · `noir` · `warm` (baked via canvas filter) |
| **atmosphere** | `clear` · `haze` · `golden` · `blue` · `storm` · `night` |
| **phase** | `night` (el < −6°) · `blue` (−6…0°) · `golden` (0…8°) · `day` (≥ 8°) |
| **delivery aspect** | `2.39:1` [2048×857] · `1.85:1` [1998×1080] · `16:9` [1920×1080] · `4:3` [1440×1080] · `1:1` [1080×1080] · `9:16` [1080×1920] |
| **sticker** (marker type) | `person` · `person2` · `vehicle` · `light` · `marker` |
| **subject label** (shot type) | `subject` · `background` · `foreground` · `vehicle` · `light` · `vfx` |
| **i2v engine** | `runway` Runway Gen-4 · `kling` · `veo` Veo 3 · `sora` · `luma` · `grok` Grok Imagine |
| **camera move** | `static` · `push-in` · `pull-out` · `orbit L` · `orbit R` · `crane down` · `path` (from a drawn camera path) |

---

## 3. Derived view — i2v prompts (Prompt Studio)

Built by **Prompt studio — frame + all engines**. One capture feeds a per-engine builder
for every engine in the enum; each speaks that engine's native prompt dialect rather than
sharing a base string:

| engine | dialect |
|---|---|
| `runway` | Terse keyword-comma; the image carries the look, the prompt carries motion. |
| `kling` | Full sentences in subject → scene → camera order, explicit camera sentence, 5s. |
| `veo` | Rich prose **plus an `Audio:` line** — Veo 3 generates sound. |
| `sora` | Narrative scene description stressing world coherence and plausible physics. |
| `luma` | Concise mood + motion phrases, keyframe-friendly. |
| `grok` | Direct photoreal description with one clear camera-motion statement. |

If a camera path exists, its motion clause (feel + distance + compass bearing + duration,
"between the supplied start and end frames") feeds every builder. The **Download .txt**
bundle concatenates all engines:

```
=== Runway Gen-4 ===
<prompt>

=== Kling ===
<prompt>
…
```

### 3.1 Path shot bundle — `gmapz.shot.v1`

**Build shot** on a drawn camera path captures both ends and emits one JSON bundle plus
`_start.png`, `_end.png`, and the all-engine `_prompts.txt`:

```json
{
  "spec": "gmapz.shot.v1",
  "id": "shot_<ms>",
  "created": "<ISO8601>",
  "start": { "...gmapz.capture.v2 (camera.move = \"path\")..." : "..." },
  "end":   { "...gmapz.capture.v2..." : "..." },
  "path": {
    "spec": "gmapz.path.v1",
    "camera_type": "drone",
    "camera_feel": "smooth aerial drone shot, …",
    "duration_seconds": 4,
    "length_m": 180,
    "points": [ { "lng": 0, "lat": 0, "altitude_m": 120 } ],
    "bearing_start_deg": 30,
    "bearing_end_deg": 42,
    "start_frame": "<id>.png",
    "end_frame": "<id>.png"
  },
  "scene_description": ""
}
```

---

## 4. Derived view — VCS-15 handoff (`.md`)

Eight fixed sections. Continuity stays honest: planned previs is authoritative, speaker
attribution is never invented.

```
# VCS-15 HANDOFF — <id>

## VCS-OBS      PLANNED observation: scene + location + light phase
## VCS-SAL      UNKNOWN — no speaker attribution asserted at previs
## VCS-CPAS     camera: shot · angle · lens(fov) · heading · tilt
## VCS-STYLE    style · grade · atmosphere · delivery aspect
## VCS-FORGE    ```json … FORGE block (below) … ```
## VCS-MATCH    reference frame · sun az/el · lens
## VCS-NEXT     suggested coverage (reverse / insert / push|pull)
## CONTINUITY RISKS   sun drifts with time-of-day; tile LOD varies by altitude
```

FORGE block:

```json
{
  "project_id": "GMAPZ",
  "clip_id": "<id>",
  "duration_seconds": 4,
  "fps": 24,
  "resolution": [2048, 857],
  "world_lock": {
    "location": { "name": "", "lng": -87.6345, "lat": 41.8885, "ground_elevation_m": 0 },
    "heading_deg": 30, "sun_azimuth_deg": 296.4, "sun_elevation_deg": 6.2
  },
  "characters": [ { "label": "subject", "planned": true } ],
  "props":      [ { "label": "vehicle", "type": "vehicle" } ],
  "shot_timeline": [ { "t": 0, "event": "medium / eye" } ],
  "speaker_attribution": "UNKNOWN",
  "camera_continuity": { "...capture.camera..." : "..." },
  "style_lock": { "style": "cinematic", "grade": "none", "atmosphere": "clear" },
  "continuity_handoff": "authoritative_previs"
}
```

> **Aligned.** The FORGE block now emits the standalone VCS-15 app's field names —
> `clip_type`, `status`, `world_lock`, `character_lock`, `prop_lock`, `timeline`,
> `camera_continuity`, `style_lock`, `audio_bed`, `continuity_anchors`, `generation_risks`,
> `next_sequence_handoff` — so a Scout handoff drops straight into VCS-15. Scout always writes
> `status: "planned"`; VCS-15 writes `"observed"` for the same document after generation, and
> diffing the two is a continuity-error check. `next_sequence_handoff` points at the following
> shot in the sequence when there is one, otherwise carries the suggested next coverage.

### 4.1 Soundscape — `gmapz.audio.v1`

Emitted inside `audio_bed` (VCS-15 FORGE) and `bible.sound_language` (VCO). Derived from the
location, clock, weather and what is in frame — never a recording.

```json
{ "spec":"gmapz.audio.v1",
  "location":{"lat":0,"lng":0,"name":""},
  "time":{"date":"","time":"","tz":"UTC","phase":"golden"},
  "weather":"storm",
  "bed":["steady city ambience, traffic a few streets away","wind gusting in the open, low thunder rolling under it"],
  "perspective":"ground level — close detail present",
  "exclude":["music","score","narration","dialogue"],
  "note":"PLANNED from location, clock and weather — not a recording of this place." }
```

---

## 5. Derived view — VCO project (`.json`)

A `project{}` envelope with the pipeline stages stubbed and an `@tag` asset table.

```json
{
  "project": {
    "brief": "<scene_description or auto summary>",
    "bible": {
      "visual_language": {
        "palette": "Cinematic",
        "forbidden_drift": "no neon cyberpunk, no glossy futurism",
        "lighting_rules": "golden light, sun el 6.2°"
      }
    },
    "characters": [ { "name": "subject", "stub": true } ],
    "shots": [
      { "id": "<id>", "scene": 1, "shot_type": "medium", "duration": 4,
        "description": "<basePrompt>", "camera": { "...": "..." }, "lighting": { "...": "..." } }
    ],
    "script": null, "storyboard": null, "score": null,
    "tags": {
      "@image1":         { "type": "image",    "displayName": "subject", "description": "...", "vcsLocked": true, "veoRef": null },
      "@location_scout": { "type": "location", "displayName": "scout",   "description": "...", "vcsLocked": true, "veoRef": "<id>.png" }
    }
  }
}
```

People markers map to `@image{n}` (type `image`); other stickers keep their type. The scouted
location is always `@location_scout`, `veoRef` pointing at the captured frame.

---

## 6. Session file (`.json`)

Round-trips the full working state. Versioned `v: 3` (adds the path, the uploaded stand-ins
and the rig/monitor settings — before v3 a plotted sequence and a life-size upload did not
survive a reload).

```json
{
  "v": 3,
  "state": {
    "shotSize": "medium", "angle": "eye", "fov": 54, "sensor": "full",
    "target": { "lat": 41.8885, "lon": -87.6345 },
    "head": 30, "tilt": -12, "range": 650, "roll": 0,
    "style": "cinematic", "grade": "none", "atmos": "clear",
    "delivery": "2.39:1", "sceneDesc": "", "date": "2026-06-26", "time": "23:30",
    "cameraType": "drone", "pathDuration": 4, "autoFrame": true, "viewLut": true
  },
  "markers": [ { "id": "...", "lon": -87.6346, "lat": 41.8884, "height": 0, "type": "person", "shotType": "subject" } ],
  "looks":   [ { "name": "Tower low", "target": {"lat": 0,"lon": 0}, "head": 30, "tilt": 6, "range": 240, "fov": 40, "sensor": "s35", "roll": -8, "shotSize": "close", "angle": "low" } ],
  "path":    { "points": [ { "lon": 0, "lat": 0, "ct": "crane", "color": "#f472b6", "cam": { "lensMm": 35, "shotSize": "wide", "angle": "high" }, "cast": ["marker-id"] } ] },
  "uploads": { "up1": { "name": "Courier", "kind": "person", "w": 0.72, "h": 1.8, "img": "data:image/png;base64,…" } },
  "shots":   [ { "name": "01 — establish", "spec": { "...gmapz.capture.v2..." }, "beat": 2, "stationIdx": 0, "thumb": "data:image/png;base64,…" } ]
}
```

Marker ids are restored verbatim, because a path dot's `cast` list references them. A look
carries its `roll` / `shotSize` / `angle` so a Dutched close-up comes back Dutched.

> `state.sensor` stores the **key** (`full` / `s35` / `apsc` / `m43`), while `capture.camera.sensor`
> stores the human **label** (`Full 36` …). Map via §2.
>
> Shots saved from a coverage roll also carry `move` (the setup's camera move), and shots
> saved from a path build carry `pathBundle` (the full `gmapz.shot.v1` record).

---

## 7. Epistemic rules (carry these downstream)

- **The frame + spec are the product.** The globe is the instrument, not the deliverable.
- **Scout output is PLANNED / AUTHORITATIVE previs** — exact, reusable, but not final footage.
- **Never fabricate speaker attribution.** VCS-SAL stays `UNKNOWN`; only VCS-OBS/CPAS/STYLE are asserted.
- **Sun is computed, not measured.** `sunPos` is a NOAA approximation — solid for blocking,
  loosest at extreme latitudes. Lock the captured frame; don't trust the live sun past it.
- **Resolution fields are nominal targets**, not the actual PNG dimensions (those depend on the
  canvas size at capture; HQ mode renders at 2×).

---

## 8. Version delta

| | v1 | v2 |
|---|---|---|
| `spec` | `gmapz.capture.v1` | `gmapz.capture.v2` |
| `camera.sensor` | `"full-frame"` (fixed) | film-back label |
| `camera.sensor_width_mm` | — | **added** |
| session | `v:1`, no looks | `v:3`, `looks[]` + `state.sensor` + `path` + `uploads` + per-shot `beat`/`stationIdx` |

Consumers keying on `spec` should accept `v1` and treat missing `sensor_width_mm` as `36`.

**2026-07 polish build:** adds `grok` to the engine enum, real values in `camera.move`
(coverage moves + `path`), the Prompt Studio bundle format (§3), and the `gmapz.shot.v1` /
`gmapz.path.v1` path bundle (§3.1). No breaking changes to `gmapz.capture.v2`.

**2026-07 sequence build:** the Shots panel exports the whole cut as one
sequence-prompt document (world lock + per-cut continuity lines, all six engines); each shot
carries an optional `beat` (seconds) that drives the take player, video render and GIF frame
delays; path stations carry their own framing; and the VCS-15 FORGE block is aligned to the
real VCS-15 schema with a `gmapz.audio.v1` soundscape attached.

**2026-07 operator build:** `camera.roll_deg` is now live (Dutch angle, rendered + round-tripped)
and `session.state.roll` persists it. Adds operator feel (eased motion + establishing arc,
subject-orbit with momentum, double-click refocus), a viewfinder overlay (thirds, artificial
horizon, sun-in-frame), sun-aware contact shadows under the cast, and a discovery coach. These
are behavioral/visual — the only spec-surface changes are `roll_deg` (now meaningful) and
`session.state.roll`.
