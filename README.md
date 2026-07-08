# GMAPz Scout

Photorealistic **location-scouting + shot-blocking** for AI filmmaking. Fly a virtual camera
over real Earth, block a shot like a DP, lock the real sun, drop in cast/prop stand-ins,
capture the actual rendered frame, and export a structured shot spec that i2v engines and
the rest of the Mobile Hollywood pipeline (VCS-15, VCO) can read.

**The map is not the product. The captured reference frame + the shot spec are the product.**

## Run it

The whole tool is one file: `gmapz_scout.html`. Serve it from any static server so the
map tiles and frame capture work cleanly:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/gmapz_scout.html
```

It also opens by double-click, but frame capture requires the server (the in-app help
explains the one-time fix if you forget).

### Keys (optional, pasted into the Scout panel)

| Key | Gets you |
|---|---|
| Google Map Tiles API key | Photorealistic 3D Earth |
| Cesium ion token | World terrain + OSM buildings (fallback) |
| *no keys* | Keyless ESRI satellite imagery — everything still works |

## The core loop

Aim at a real place → block the camera (size / angle / lens / height / move) → lock the
light (date + time → real sun, golden-hour finder) → place cast/props → **capture the
rendered frame** → open the Prompt Studio / export the spec.

## What it does

- **Camera blocking** — shot-size / angle / lens chips, film-back selection, exact
  lat/lon/heading/tilt/range params, saved camera looks, live director's slate HUD.
- **Real light** — physically accurate sun from date + time, golden/blue-hour finder,
  light-continuity checker across a shot sequence.
- **Director auto-coverage** — pick a recipe (Classic, Fincher, Handheld, Documentary,
  Aerial Epic), get an editable shot plan around your framing: preview each setup, toggle
  any off, re-anchor, then roll. Shots land in the sequence with your locked light.
- **Cast & props** — ghost-cursor placement, drag / scale / rotate / raise, photo-avatar
  stickers, everything renders into the captured frame.
- **Camera paths** — drag a camera type (drone, dolly, crane, FPV…) onto the globe, draw a
  move, and build a shot: start frame + end frame + path bundle + all-engine prompts.
- **Prompt Studio** — one capture feeds engine-native prompts for Runway Gen-4, Kling,
  Veo 3 (with audio line), Sora, Luma, and Grok Imagine. Tabbed, editable, per-engine
  tips, copy / copy-all / download bundle.
- **Exports** — `gmapz.capture.v2` spec (JSON), VCS-15 handoff (.md), VCO / Director's
  Chair project (.json), contact sheet PNG, PDF blocking report, full session save/load.

Schemas and controlled vocabularies live in [`GMAPZ_SPEC_STACK.md`](GMAPZ_SPEC_STACK.md).
Project rules live in [`CLAUDE.md`](CLAUDE.md). The phased build playbook that produced
this tool is [`prompts.md`](prompts.md).

## Shortcuts

`G` get camera · `F` fly to params · `C` capture · `S` save shot · `1–7` lens presets ·
`R` reset · `L` load KML · `?` help · `Alt+scroll` raise/lower selected prop ·
on-stage shutter (Shift-click = HQ) · `Cmd/Ctrl+Z` undo

## Epistemic rules

Scout output is **PLANNED / AUTHORITATIVE previs**, never "observed." Speaker attribution
is never fabricated (VCS-SAL stays UNKNOWN at pre-vis). The sun is computed, not measured —
lock the captured frame.
