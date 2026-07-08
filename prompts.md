# GMAPz Scout — Claude Code Build Prompts

Feed these to Claude Code **in order**, one at a time. Each ends in a verifiable state — actually
check it before moving on. `CLAUDE.md` must be in the project root first.

> **SHIP GATE:** Phases 0–4 = a working scout-and-capture tool. After Phase 4, stop, open a real
> location, capture a frame, export a spec. Only then start Phase 5. (Your freeze-clause: respect it.)

---

## Setup (terminal, once)
```bash
mkdir ~/gmapz-scout && cd ~/gmapz-scout
# put CLAUDE.md in this folder
claude
```
Get keys before Phase 1:
- **Google Map Tiles API key:** console.cloud.google.com → new project → enable "Map Tiles API"
  → Credentials → create API key → restrict to Map Tiles API. (Free tier ~hundreds of sessions/mo.)
- **Cesium ion token (fallback):** ion.cesium.com/signup → Access Tokens → copy default token.

---

## Phase 0 — Scaffold + globe
```
Read CLAUDE.md fully before doing anything.

Scaffold a Vite vanilla-JS project in this folder. Install `cesium` and `vite-plugin-cesium`,
and wire the plugin in vite.config.js. Create:
- index.html: full-viewport #cesium div, plus an empty left control panel shell (.panel) styled
  with the house-style tokens from CLAUDE.md (zinc-950 bg, yellow/emerald accents, Space Grotesk).
- src/main.js: create a Cesium Viewer on #cesium with
  contextOptions:{ webgl:{ preserveDrawingBuffer:true } } and hide ALL default widgets
  (timeline, animation, baseLayerPicker, geocoder, homeButton, sceneModePicker,
  navigationHelpButton, fullscreenButton, infoBox, selectionIndicator). Read
  VITE_CESIUM_ION_TOKEN from .env into Cesium.Ion.defaultAccessToken.
- .env.example (VITE_GOOGLE_MAPS_API_KEY=, VITE_CESIUM_ION_TOKEN=), and .gitignore
  (.env, node_modules, dist).

`npm run dev` must render the Cesium globe with no default UI chrome. Then STOP and tell me to
verify before continuing.
```

## Phase 1 — Photoreal Earth
```
Add Google Photorealistic 3D Tiles per CLAUDE.md: set Cesium.GoogleMaps.defaultApiKey from
VITE_GOOGLE_MAPS_API_KEY, await createGooglePhotorealistic3DTileset(), add it, hide the default
globe, enable real sun lighting. If the Google key is missing, fall back to ion terrain+imagery
and log a clear console note. Add a flyTo() helper and on load fly the camera to Marina City,
Chicago (lng -87.6345, lat 41.8885) at a cinematic low oblique angle. STOP and let me verify I see
photoreal Chicago.
```

## Phase 2 — Camera blocking panel
```
Build the camera-blocking controls in the left panel, bound to a central `state` object with
applyToCamera() and syncFromCamera() (two-way: moving the camera updates the controls, and vice
versa). Controls:
- Shot size: Wide / Medium / Close (presets that set distance + pitch)
- Angle: Eye / Low / High / Aerial (sets pitch)
- Lens mm: 24/35/50/70/85 buttons + a fine slider; map mm→FOV with lensToFov() from CLAUDE.md and
  set viewer.camera.frustum.fov. Choose horizontal vs vertical fov based on current delivery aspect.
- Camera height (altitude) slider, and heading dial/slider (0–360).
- A readout strip showing live lng/lat/alt/heading/pitch/lens/fov.
Keep it imperative and simple. STOP and let me verify controls drive the camera and vice versa.
```

## Phase 3 — Sun + golden-hour finder
```
Add date + time inputs that set viewer.clock.currentTime so the rendered sun is physically
accurate. Add a "Find golden hour" button: for the camera's current lat/lng and selected date,
sample the day using Cesium's sun ephemeris and report the windows where sun elevation is about
-6° to +6°; clicking a window sets the time. Show live sun azimuth/elevation and a phase label
(golden/blue/day/night) in the readout. STOP and let me verify the sun matches the time and the
finder jumps me to golden hour.
```

## Phase 4 — Capture + reference frame  ← SHIP HERE
```
Add the capture system. A "Capture frame" button grabs the exact rendered Cesium canvas (works
because preserveDrawingBuffer is on), crops to the selected delivery aspect (2.39:1 / 16:9 / 9:16
/ 1:1), and downloads a PNG named scout_<timestamp>.png. Show captured thumbnails in a strip.
Build the gmapz.capture.v1 object (CLAUDE.md schema) from current state and let me download it as
JSON alongside the PNG. STOP. This is the shippable core loop — I will test it on a real location
before we continue.
```

## Phase 5 — Cast + prop stand-ins
```
Add a sticker bank (person silhouettes, vehicle, light stand, marker). In "Place" mode, clicking
the ground drops a ground-locked billboard at that lng/lat; selected stickers can be dragged and
scaled. They render in the scene so they appear in captures automatically. Push each into
state.subjects[] for the spec. STOP and verify a placed figure shows up in a captured frame.
```

## Phase 6 — Look + atmosphere
```
Add a look/mood layer: a set of named CSS look-grades (e.g. Cinematic, Bleach, Teal-Orange,
Noir, Warm Doc) applied as a canvas overlay that is composited INTO the captured PNG, not just
shown on screen. Add Cesium atmosphere controls (fog/haze density, golden/blue/night presets,
optional rain/snow descriptor). Record style/grade/atmosphere into look{} in the spec. STOP and
verify the look changes the exported frame.
```

## Phase 7 — i2v bridge
```
Add an i2v export panel. From the gmapz.capture.v1 spec, generate an engine-tuned prompt string
for each of: Runway Gen-4, Kling, Veo 3, Sora, Luma (same scene facts, phrased per engine, with
the camera move as the motion cue). For the selected engine, let me copy the prompt and download
the captured PNG as the start frame, plus the spec JSON. STOP and verify all three come out.
```

## Phase 8 — Pipeline bridges (VCS-15 + VCO)
```
Add two export buttons matching CLAUDE.md schemas and colors:
- VCS-15 Handoff (.md, #FB923C): emit the 8 fixed sections; fill camera/style/light as
  PLANNED/AUTHORITATIVE; leave VCS-SAL as UNKNOWN (do not fabricate speaker attribution);
  build VCS-FORGE JSON.
- VCO / Director's Chair (.json, #e8a23c): emit project{} with shots[], tags{},
  bible.visual_language, brief; script/storyboard/score = null; characters as honest stubs.
STOP and verify both files validate against the schemas in CLAUDE.md.
```

## Phase 9 — Polish + persistence
```
Add: a preset/location library (save + reload named camera+light+look setups), packet
save/load (export/import the full session as JSON), a contact-sheet PNG of all captures, and
keyboard shortcuts (C capture, G golden hour, 1–5 lens). Keep it lean — no new dependencies
unless required. STOP and let me do a full pass.
```

---

## How to drive Claude Code well here
- Paste **one phase at a time.** Let it finish, then you verify, then paste the next.
- When something's off, describe the *symptom* ("the captured PNG is blank") — it'll debug faster
  than if you guess the cause.
- Commit after each green phase: `git add -A && git commit -m "phase N"`. (Local only — no remote,
  so Odin is never touched.)
- If it tries to add a framework, a state library, or a second map engine: say no. The stack is
  fixed in CLAUDE.md.
- First real test after Phase 4: Marina City Chicago → Low angle → golden hour → capture → drop
  the PNG + prompt into Runway Gen-4.
