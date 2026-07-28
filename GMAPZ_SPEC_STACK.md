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
    "move": "static"
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
  "delivery": { "aspect": "2.39:1", "resolution": [2048, 857] },

  "subjects": [
    { "type": "person", "label": "subject", "lng": -87.6346, "lat": 41.8884, "scale": 1, "height_m": 0 }
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
| `camera.move` | string | `static` for stills; coverage rolls write the setup's move (`push-in`, `pull-out`, `orbit L`, `orbit R`, `crane down`); path builds write `path`. |
| `light.date/time` | string | As entered; pair with `tz`. |
| `light.tz` | string | Always `UTC` in this build. |
| `light.sun_azimuth_deg` | number | 0 = north, clockwise. |
| `light.sun_elevation_deg` | number | Degrees above horizon; negative = below. |
| `light.phase` | enum | `night` / `blue` / `golden` / `day` (from elevation). |
| `look.style` | enum | See §2. |
| `look.grade` | enum | Baked into the PNG at capture. |
| `look.atmosphere` | enum | Fog density + capture tint. |
| `delivery.aspect` | enum | The PNG is cropped to this. |
| `delivery.resolution` | [w,h] | Nominal target res for the aspect. |
| `subjects[]` | array | One per marker. |
| `subjects[].type` | string | `person` / `prop` / `light` / `vfx` (normalized from sticker). |
| `subjects[].label` | string | The marker's assigned shot type. |
| `subjects[].lng/lat` | number | Ground position. |
| `subjects[].scale` | number | Stand-in scale multiplier (1 = life-size: person 1.8m, vehicle 4.6m). |
| `subjects[].height_m` | number | Raised height (Alt+scroll / slider / snap). |
| `scene_description` | string | Free text from the Style panel. |
| `reference_frame` | string | `<id>.png` — the captured frame this record describes. |

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

> **Alignment target (planned).** The standalone VCS-15 app's FORGE schema uses
> `character_lock`, `prop_lock`, `timeline`, `continuity_anchors`, `generation_risks`,
> `next_sequence_handoff`, and `clip_type`. Scout currently emits the near-equivalent
> `characters` / `props` / `shot_timeline` / `continuity_handoff`. Renaming Scout's fields to
> match makes the Scout→VCS-15 handoff byte-clean (a `status: planned|observed` flag then
> distinguishes the two) — the first step of the shared studio bible (see `ROADMAP.md`).

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

Round-trips the full working state. Versioned `v: 2` (adds `sensor` + `looks`).

```json
{
  "v": 2,
  "state": {
    "shotSize": "medium", "angle": "eye", "fov": 54, "sensor": "full",
    "target": { "lat": 41.8885, "lon": -87.6345 },
    "head": 30, "tilt": -12, "range": 650, "roll": 0,
    "style": "cinematic", "grade": "none", "atmos": "clear",
    "delivery": "2.39:1", "sceneDesc": "", "date": "2026-06-26", "time": "23:30"
  },
  "markers": [ { "id": "...", "lon": -87.6346, "lat": 41.8884, "height": 0, "type": "person", "shotType": "subject" } ],
  "looks":   [ { "name": "Tower low", "target": {"lat": 0,"lon": 0}, "head": 30, "tilt": 6, "range": 240, "fov": 40, "sensor": "s35" } ],
  "shots":   [ { "name": "01 — establish", "spec": { "...gmapz.capture.v2..." }, "thumb": "data:image/png;base64,…" } ]
}
```

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
| session | `v:1`, no looks | `v:2`, `looks[]` + `state.sensor` |

Consumers keying on `spec` should accept `v1` and treat missing `sensor_width_mm` as `36`.

**2026-07 polish build:** adds `grok` to the engine enum, real values in `camera.move`
(coverage moves + `path`), the Prompt Studio bundle format (§3), and the `gmapz.shot.v1` /
`gmapz.path.v1` path bundle (§3.1). No breaking changes to `gmapz.capture.v2`.

**2026-07 operator build:** `camera.roll_deg` is now live (Dutch angle, rendered + round-tripped)
and `session.state.roll` persists it. Adds operator feel (eased motion + establishing arc,
subject-orbit with momentum, double-click refocus), a viewfinder overlay (thirds, artificial
horizon, sun-in-frame), sun-aware contact shadows under the cast, and a discovery coach. These
are behavioral/visual — the only spec-surface changes are `roll_deg` (now meaningful) and
`session.state.roll`.
