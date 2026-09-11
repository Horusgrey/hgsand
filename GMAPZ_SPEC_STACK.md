# GMAPz Scout — Spec Stack

The data contracts GMAPz Scout emits. One capture produces a frame plus a structured
record; everything else is a **view** of that record for a downstream tool. The frames and
`gmapz.capture.v2.1` are the product; the cut zip is how they leave the building.

```
                          ┌────────────────────────────┐
   block the shot  ─────► │  gmapz.capture.v2.1 (core) │ ─────► reference_frame.png
                          └─────────────┬──────────────┘
                                        │  derived views
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
  the cut (.zip)                 i2v prompt (txt)              studio handoffs
  frames · previs.gif                                     VCS-15 · Director's Chair
  specs · prompts · cut.json                              World Builder  (PARKED,
        │                               │                  opt-in — see §5)
        └──────────── session.json wraps state + markers + looks + shots ┘
```

The zip is the primary deliverable. The three studio handoffs are built and verified against
their real loaders but are **off by default**, both as buttons (folded away) and in the zip
(`In the zip: OFF`). Their contracts in §4–5.1 are still current; they are simply not what
the tool leads with today.

---

## 1. Core contract — `gmapz.capture.v2.1`

Emitted by **Spec only — gmapz.capture.v2.1 (.json)** and embedded inside every saved shot.

> **2.1 is a semantic correction, not an addition.** Up to v2, `camera.lng/lat` held the
> *look-at* point and `camera.altitude_m` held the *orbit distance* — so a recorded
> `altitude_m: 60` was a camera 5.2 m off the ground and `4500` was 2581 m, wrong by
> sin(tilt) every time. In 2.1 **`camera{}` is where the camera is** and **`location{}` is
> what it aims at**, and the orbit distance has its own name. Read the migration note under
> the field table before consuming either revision.

```json
{
  "spec": "gmapz.capture.v2.1",
  "id": "cap1719360000000",
  "captured_at": "2026-06-26T17:00:00.000Z",

  "location": {
    "name": "Marina City Chicago",
    "lng": -87.6345,
    "lat": 41.8885,
    "ground_elevation_m": 181.4,
    "earth_source": "google_photoreal_3d",
    "geometry": "3d"
  },

  "camera": {
    "lng": -87.6398,
    "lat": 41.8832,
    "altitude_m": 316.5,
    "height_above_ground_m": 135.1,
    "aim_lng": -87.6345,
    "aim_lat": 41.8885,
    "target_distance_m": 650,
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

  "look":     { "style": "cinematic", "grade": "none", "atmosphere": "clear", "terrain_exaggeration": 1 },
  "delivery": { "aspect": "2.39:1", "resolution": [2048, 857], "capture_px": [996, 417] },

  "subjects": [
    { "id": "m1719360000123", "type": "person", "label": "subject", "name": "Person 1",
      "lng": -87.6346, "lat": 41.8884, "scale": 1,
      "height_m": 1.8, "width_m": 0.66, "elevation_offset_m": 0 }
  ],

  "scene_description": "",
  "reference_frame": "cap1719360000000.png"
}
```

### Field reference

| Path | Type | Notes |
|---|---|---|
| `spec` | string | `gmapz.capture.v2.1`. Version gate for consumers — see the migration note below. |
| `id` | string | Stable per capture; also the PNG basename. |
| `captured_at` | ISO 8601 | UTC timestamp. |
| `location.name` | string | From the search field; may be empty. |
| `location.lng/lat` | number | The look-at target — the point on the ground the camera is aimed at. |
| `location.ground_elevation_m` | number | **Real, sampled.** Metres above sea level at the aim point. Honestly `0` on flat imagery, where the drape genuinely is painted at sea level. |
| `location.earth_source` | enum | **New in 2.1.** `google_photoreal_3d` / `cesium_terrain_osm` / `esri_flat_imagery`. Which Earth this frame was actually shot on. |
| `location.geometry` | enum | **New in 2.1.** `3d` or `flat_2d_imagery`. A frame can never imply geometry it did not have. |
| `camera.lng/lat` | number | **Changed in 2.1.** Where the camera *is*. Up to v2 this was the aim point. |
| `camera.altitude_m` | number | **Changed in 2.1.** The camera's real altitude, metres above sea level. Up to v2 this field held the orbit distance. |
| `camera.height_above_ground_m` | number \| null | **New in 2.1.** Camera height above the ground beneath it. `null` when the surface could not be sampled. |
| `camera.aim_lng/aim_lat` | number | **New in 2.1.** The aim point, duplicated here so a consumer reading only `camera{}` still has both ends of the look vector. Same values as `location.lng/lat`. |
| `camera.target_distance_m` | number | **New in 2.1.** Eye-to-target distance — the value v2 called `altitude_m`. This is the field to read for "how far from the subject". |
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
| `subjects[].label` | string | The marker's assigned shot type (its *role*: `subject`, `foreground`, `background`…). Not unique. |
| `subjects[].name` | string | **New in 2.1.** A distinct name per stand-in (`Person 1`, `Person 2`, `White Mini Cooper`). Use this to tell two of the same thing apart. |
| `subjects[].lng/lat` | number | Ground position. |
| `subjects[].scale` | number | Stand-in scale multiplier (1 = life-size). |
| `subjects[].height_m` | number \| null | **Changed in 2.1.** How tall the thing IS, in metres, after scale. Up to v2 this field held the raise-above-ground offset, which nobody sets — so every subject in every v2 export reads `0`. `null` for stand-ins with no real-world size (a pin). |
| `subjects[].width_m` | number \| null | **New in 2.1.** How wide/long it is, after scale. |
| `subjects[].elevation_offset_m` | number | **New in 2.1.** How far it was raised off the ground (Alt+scroll / slider / snap) — the value v2 called `height_m`. |
| `scene_description` | string | Free text from the Style panel. |
| `reference_frame` | string | `<id>.png` — the captured frame this record describes. |

### Migrating a v2 (or v1) record

Detect by presence, not by string compare — `camera.target_distance_m === undefined` means
pre-2.1. Then:

| you want | pre-2.1 | 2.1 |
|---|---|---|
| the aim point | `camera.lng/lat` | `location.lng/lat` (or `camera.aim_lng/aim_lat`) |
| eye-to-target distance | `camera.altitude_m` | `camera.target_distance_m` |
| the camera's real altitude | *not recorded* | `camera.altitude_m` |
| a stand-in's real size | *not recorded* | `subjects[].height_m` / `width_m` |
| how far a stand-in was raised | `subjects[].height_m` | `subjects[].elevation_offset_m` |

Scout does this itself in `recallCamera(spec)` and `camDistance(camera)`, so reopening an
old project puts the camera back exactly where it was.


---

## Export 5 — `gmapz.cut.v1` (the whole cut, inside the handoff zip)

`Export the cut (.zip)` writes one archive containing everything a downstream engine
needs. `cut.json` is its index:

```json
{
  "spec": "gmapz.cut.v1",
  "exported_at": "<ISO8601>",
  "location": { "...": "same shape as capture.v2.1 location" },
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
  "start": { "...gmapz.capture.v2.1 (camera.move = \"path\")..." : "..." },
  "end":   { "...gmapz.capture.v2.1..." : "..." },
  "path": {
    "spec": "gmapz.path.v1",
    "camera_type": "drone",
    "camera_feel": "smooth aerial drone shot, …",
    "duration_seconds": 4,
    "length_m": 180,
    "points": [ { "lng": 0, "lat": 0, "height_above_ground_m": 120, "ground_elevation_m": 181.4 } ],
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

`vcs15(spec)` takes the spec it should describe; callers that own a shot pass it, and the
Export panel button passes nothing and gets the current setup. The whole document always
describes exactly one frame.

VCS-15 titles two of these panes **"Recreation Prompt"** (MATCH) and **"Next 15s Prompt"**
(NEXT), and its GEN-HANDOFF button exports NEXT's body verbatim as `prompt`. Both therefore
hold prompts — a coverage note in NEXT would have shipped to a generator as if it were one.

```
# VCS-15 HANDOFF — <id>

## VCS-OBS      PLANNED observation: scene + location + light phase
## VCS-SAL      UNKNOWN — no speaker attribution asserted at previs
## VCS-CPAS     camera: shot · angle · lens(fov) · heading · tilt
## VCS-STYLE    style · grade · atmosphere · delivery aspect
## VCS-FORGE    ```json … FORGE block (below) … ```
## VCS-MATCH    a recreation prompt for this frame, then an ANCHORS line
## VCS-NEXT     the next shot's prompt — or, if nothing follows, recommended
                coverage clearly labelled NOT YET BLOCKED
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
    "location": { "name": "", "lng": -87.6345, "lat": 41.8885, "ground_elevation_m": 181.4,
                   "earth_source": "google_photoreal_3d" },
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

## 5. Derived view — Director's Chair project (`.json`)

**No envelope.** Director's Chair's importer is `loadProject(d) → setProject(d)`, which reads
the *root* of the file. An earlier version of this export wrapped everything in
`{"project": {…}}`; the app reported "Project loaded successfully" and showed an empty
project, because every field landed one level too deep.

```json
{
  "brief": {
    "title": "Marina City, Chicago — 5 shots",
    "logline": "<scene_description, or an auto summary>",
    "format": "Pre-vis sequence · 2.39:1",
    "tone": "A24",
    "duration": "7.1s across 5 setups",
    "engine": "Veo 3",
    "worldContext": "Real geography at … · <light line> · PLANNED, never observed",
    "canon": "Hold the geography, the sun and the look constant across every shot. …"
  },
  "bible": {
    "world_name": "…", "core_premise": "…", "time_period": "2026-09-18",
    "setting": "…", "tone_contract": "A24: …",
    "visual_language": {
      "palette":         ["#0b100b", "#142e1f", "#1a3d2a", "#224e36", "#2e6245"],
      "forbidden_drift": ["neon cyberpunk", "glossy futurism", "invented geography", "…"],
      "lighting_rules":  ["golden light throughout", "sun azimuth 265.7°, elevation 7.8°", "…"]
    },
    "canon_rules": ["…"], "global_veo_rule": "…", "continuity_locks": ["…"],
    "sound_language": { "...gmapz.audio.v1..." }
  },
  "characters": [
    { "name": "Courier", "role": "subject",
      "visual_description": "Courier · 1.80×0.72m, life-size · placed at 41.88872, -87.63432 · lit from camera left at 8° · blocking reference — pose and wardrobe not specified by Scout",
      "planned_stand_in": true }
  ],
  "shots": [
    { "id": "<id>", "scene": "SCENE 1 — Marina City", "shot_type": "wide", "duration": "2s",
      "description": "<name> — <engine prompt>",
      "camera":   "24mm (73.7°) · ewide · aerial angle · heading 48° · tilt -35° · drone · 480m",
      "lighting": "golden · sun az 265.7° el 7.8° · 2026-09-18 23:10 UTC · key from camera left at 8°",
      "camera_spec": { "...": "..." }, "light_spec": { "...": "..." },
      "reference_frame": "<id>.png" }
  ],
  "script": null, "storyboard": null, "score": null,
  "tags": { "@image1": { "...": "..." }, "@location_scout": { "...": "..." } }
}
```

Three contracts this export exists to satisfy, all read off the app's own code:

| Contract | Why |
|---|---|
| No `project` wrapper | `setProject(d)` takes the root. |
| `brief` is an **object** | The Brief stage binds `d.title` / `d.logline` / `d.duration` / `d.engine` / `d.worldContext` / `d.canon`. `engine` must be one of `Sora · Kling · Runway · Veo 3 · Grok Aurora · Gemini Flow`. |
| `shots[].camera` and `.lighting` are **strings** | `ShotsStage` renders `{shot.camera}` as a React child. An object there is React error #31 and a blank stage. The originals ride alongside as `camera_spec` / `light_spec`, so nothing is lost to a machine reader. |

`visual_language.palette` is **sampled from the captured frame** via the median-cut palette
the GIF encoder already uses — a flat frame honestly yields two colours rather than five
invented ones. `forbidden_drift`, `lighting_rules` and `canon_rules` are arrays, matching
the app's own bible.

People markers map to `@image{n}` (type `image`); other stickers keep their type. The scouted
location is always `@location_scout`, `veoRef` pointing at the captured frame.

Characters carry only what Scout can know — what the stand-in is, how big it really is, where
it stands, and how the light hits it. No age, gender, personality or backstory: those fields
exist in Director's Chair and are deliberately left unwritten rather than invented.

---

## 5.1 Derived view — World Builder / Visual Co project (`.json`)

The one handoff in the studio that **costs no API key**. World Builder's importer reads
`styleSeed`, `scenes`, `characters`, `script`, `storyboard` and `postProduction` off the root
and saves them — it calls no model. A scene that arrives *with* its image is a scene that has
already been made.

```json
{
  "styleSeed": { "image": "<bare base64 JPEG>", "mimeType": "image/jpeg",
                 "prompt": "A24 · warm grade · golden · 2.39:1 · golden light, sun el 7.8° — …" },
  "scenes":    [ { "id": "<spec id>", "prompt": "<Veo-flavoured shot prompt>",
                   "image": "<bare base64 JPEG of the captured frame>" } ],
  "characters":[ { "id": "<marker id>", "name": "Courier", "role": "subject",
                   "lookPrompt": "Courier · 1.80×0.72m, life-size · placed at … · lit from camera left at 8° · …",
                   "image": "<bare base64 JPEG of the stand-in>" } ],
  "continuityStack": [ { "id": "stack_<spec id>", "sceneId": "<spec id>",
                         "metadata": { "obs": "…", "forge": "…", "style": "…" },
                         "enginePrompt": "<the same Veo prompt the scene carries>" } ],
  "script": [], "storyboard": {}, "postProduction": {}
}
```

| Contract | Why |
|---|---|
| **Bare base64** — no `data:` prefix | `fileToBase64` resolves `reader.result.split(',')[1]`, so that's what every stored image is. |
| **JPEG** | Every `<img>` is written `data:image/jpeg;base64,${…}` and `mergeCharacterAndScene` declares `mimeType: 'image/jpeg'` to the model. Scout's frames are PNG, so this export re-encodes rather than mislabels. |
| No wrapper | `handleImportProject` reads the root. |

`script` / `storyboard` / `postProduction` ship empty because Scout has no dialogue — an empty
array is the honest value, not a placeholder line.

### `continuityStack[]` — authored, not inferred

The newest Visual Co (`Visual-Co-main`) has a **ContinuityEngine** that ships each scene image
to Gemini and asks it to infer OBS / FORGE / STYLE plus an engine prompt. For a Scout scene
that's a vision model guessing at what Scout authored:

| field | ContinuityEngine infers | Scout knows |
|---|---|---|
| `obs` | subjects, environment, lighting, from pixels | the cast list, the real coordinates, the computed sun azimuth/elevation, and the key **relative to the lens** |
| `forge` | "implied motion or next logical action" | the rig's actual motion, and the exact continuity clause to the next dot |
| `style` | "artistic style, lens, colour palette" | the style, grade, atmosphere, focal length, film back, aspect — and a palette sampled from the frame |
| `enginePrompt` | a fresh generation | the same Veo prompt the scene already carries, so the two cannot disagree |

`obs` opens with **"PLANNED, not observed."** so nothing downstream can mistake authored
blocking for analysis of footage. The last entry says the frame holds rather than inventing a
shot that follows it. Older builds ignore the key harmlessly.

**Why this is the bridge worth having:** World Builder's compositing step asks a model to place
a character "on the left" and "match lighting and style". Scout knows the stand-in's real height
in metres, its exact position, and where the sun was — so `lookPrompt` states the key relative to
the lens (`sunSide()`), not as a compass bearing.

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
  "shots":   [ { "name": "01 — establish", "spec": { "...gmapz.capture.v2.1..." }, "beat": 2, "stationIdx": 0, "thumb": "data:image/png;base64,…" } ]
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

| | v1 | v2 | v2.1 |
|---|---|---|---|
| `spec` | `gmapz.capture.v1` | `gmapz.capture.v2` | `gmapz.capture.v2.1` |
| `camera.sensor` | `"full-frame"` (fixed) | film-back label | film-back label |
| `camera.sensor_width_mm` | — | **added** | |
| `camera.lng/lat` | the aim point | the aim point | **the camera** |
| `camera.altitude_m` | orbit distance | orbit distance | **real altitude ASL** |
| `camera.target_distance_m` | — | — | **added** (the old `altitude_m`) |
| `camera.height_above_ground_m` | — | — | **added** |
| `camera.aim_lng/aim_lat` | — | — | **added** |
| `location.ground_elevation_m` | literal `0` | literal `0` | **sampled** |
| `location.earth_source` / `geometry` | — | — | **added** |
| `subjects[].name` | — | — | **added** |
| `subjects[].height_m` | raise offset | raise offset | **real stature** |
| `subjects[].width_m` | — | — | **added** |
| `subjects[].elevation_offset_m` | — | — | **added** (the old `height_m`) |
| session | `v:1`, no looks | `v:3`, `looks[]` + `state.sensor` + `path` + `uploads` + per-shot `beat`/`stationIdx` | |

Consumers keying on `spec` should accept `v1` and treat missing `sensor_width_mm` as `36`.
**v2.1 is the only revision in which the field names mean what they say** — see the
migration table in §1 before reading a camera position out of an older record.

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
