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

Paste a key into the **Google Map Tiles API key** field in the Scout panel and hit
**Apply keys & reload Earth**. It's remembered on that device and auto-loads next time.

### Using your Google key (and keeping it free)

Photorealistic 3D Tiles is a Google "Enterprise" API, so it **requires a billing account
with a card on file** — even to use the free tier. That's fine for solo use, because of how
it's billed:

- **You're charged once per page load, not per tile.** One "root tileset request" covers
  ~3 hours of unlimited flying, orbiting, zooming and capturing. Everything you *do* in the
  tool is free — only *loading / reloading* the page starts a new billable session. (The
  **New** session button and browser refreshes each count as one.)
- **The free allowance is ~1,000 of those sessions per month.** Solo scouting won't come
  close.

To guarantee a $0 bill, in the [Google Cloud Console](https://console.cloud.google.com):

1. **Hard-cap the daily quota** (the real guarantee): *APIs & Services → Map Tiles API →
   Quotas* → set **Photorealistic 3D Tiles root tileset requests per day** to ~20–30. Far
   more than you'll use, and it keeps you inside the free monthly allowance. Hit the cap and
   tiles just stop loading — never a charge.
2. **Set a $1 budget alert**: *Billing → Budgets & alerts*. (Budgets only notify; the quota
   cap above is the actual stop.)
3. **Restrict the key**: limit it to the **Map Tiles API** and to an **HTTP referrer** for
   `localhost` / your domain. The key lives in the page HTML, so restriction stops a leaked
   key being usable elsewhere.

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
`O` orbit the framed subject (drag to circle, scroll to dolly) · `T` top-down / oblique ·
`[` `]` Dutch roll · `\` level horizon · `V` framing guides (thirds, level, sun-in-frame) ·
double-click to recenter and ease in ·
`Arrows` pan · `+ −` zoom (wheel dives at the cursor) · `R` reset · `L` load KML · `?` help ·
`Alt+scroll` raise/lower selected prop · on-stage shutter (Shift-click = HQ) ·
`Cmd/Ctrl+Z` undo · `Esc` exits any mode

## Epistemic rules

Scout output is **PLANNED / AUTHORITATIVE previs**, never "observed." Speaker attribution
is never fabricated (VCS-SAL stays UNKNOWN at pre-vis). The sun is computed, not measured —
lock the captured frame.
