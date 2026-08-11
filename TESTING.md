# GMAPz Scout — Test & Feedback Pass

A checklist for driving the tool on **real photoreal tiles** — the things I can't verify
headlessly. Work top to bottom; jot anything that feels off next to the item. The three
starred tests matter most.

---

## Setup

```bash
python3 -m http.server 8080
# open http://localhost:8080/gmapz_scout.html
```

Paste your **Google Map Tiles API key** into the Scout panel → **Apply keys & reload Earth**.

> **Which key?** Google Cloud lists hundreds of APIs and only one works here:
> *APIs & Services → **Map Tiles API** → Enable*, with billing on. A key that works for Maps
> JavaScript, Static Maps, Places or Geocoding will be **rejected** by this. See the README for
> the quota cap that keeps the bill at $0.

**Check the key before you Apply.** The Scout panel has a **Test key** button beside Apply. It
asks Google's own tile endpoint whether this key can fetch Photorealistic 3D Tiles and repeats
what Google says — API not enabled / no billing / referrer refused / key not recognised — with
the one thing to go and change. It costs nothing: it fetches the same root manifest Cesium
fetches first, no tiles, no reload.

You can also ask Google directly in a browser tab:

```
https://tile.googleapis.com/v1/3dtiles/root.json?key=YOUR_KEY
```

JSON back with `asset` and `root` means the key works. Anything else, read the `error.message`.

Wait for the status pill (top-left of the stage) to read **✓ Photoreal 3D Earth — real building
geometry**. That green tick is the only state that means you have 3D.

---

## ★ Test 0 — Do you actually have 3D? *(the one that invalidates everything else)*

The last real session was shot entirely on flat 2D satellite drape because the app put a green
tick on a rejected key and truncated the explanation. That's fixed; this test checks the fix.

- [ ] **With your good key** — pill is green and says *Photoreal 3D Earth*. Fly low past a
      building: does it have **sides**, or is the roof painted on the ground?
- [ ] **Now break it on purpose** — paste any wrong string into the key field and Apply.
      Do you get a **red pill** and a **red banner on the stage** naming *Map Tiles API*?
      Is it impossible to mistake for success?
- [ ] Dismiss the banner ("Shoot flat anyway") — does it stay gone until the next failure?
- [ ] Put the good key back. Green again?

**Report:** anything about that failure state that is still ambiguous, or any wording that
would have saved you last time.

---

## ★ Test 1 — Are you on the ground, or in it?

The look-at point used to sit at sea level, so at a place 425 m up the camera aimed a
quarter-kilometre underground and followed it down.

- [ ] Find somewhere with real elevation. **Right-click** a hillside to aim there.
- [ ] Set **angle: eye** and pull the range right down. Do you end up **standing on** the
      ground, or inside it?
- [ ] Try it on a **rooftop**, on a **road**, and on **water**.
- [ ] Push all the way down — you should get lifted with *"Lifted to eye height"* rather than
      going under. Does that ever fire when it shouldn't?
- [ ] Capture a frame. In the spec (**Export → Spec only**), does `location.ground_elevation_m`
      look like the real elevation of that spot? Does `camera.altitude_m` look like a real
      altitude, and `camera.height_above_ground_m` like a real height?

**Report:** any place you still end up buried, and any elevation number that looks wrong.

---

## ★ Test 2 — The output test (the one that decides the premise)

1. Block a real shot: location, lens, shot size, angle, lock the sun (try golden hour).
2. Place a cast stand-in or two.
3. Capture (**C** or the shutter; Shift-click = HQ).
4. Open **Prompt Studio** (⚡ on the thumbnail) → copy the Runway or Kling prompt.
5. Generate the shot in that engine using **the captured frame as the start image**.
6. Now generate the *same idea* from a **text prompt only**, no Scout frame.
7. Compare.

**Report:** is the Scout version visibly more controlled — composition, geography, light
direction, the Dutch angle holding? This answers whether the whole premise works.

---

## Test 3 — Path & coverage (now one panel)

- [ ] With nothing plotted, does the panel show only what you need to start?
- [ ] Drag a camera type onto the globe, click a few dots, double-click to finish.
- [ ] Open **Let the director set up N open dots** and fill them from a recipe. Does it leave
      the dots you'd already set alone?
- [ ] **Roll all N dots.** Does the button say what it's about to do, before and after?
- [ ] Place a stand-in. Does the panel tell you nobody is riding the path, and does
      **send them along** work in one click? *(This is the thing you were reaching for by
      clicking the avatar four times.)*
- [ ] Save a **run**, clear the path, load it back somewhere else. Does it re-lay correctly?

**Report:** anything that still needs two panels' worth of hunting, and whether the fold reads
as "underneath the dots" or as a second entry point.

---

## Test 4 — Viewfinder & light (press **V**)

- [ ] **Thirds / center** align to the letterboxed frame at each delivery aspect.
- [ ] **Artificial horizon** — cant the roll; does the line show true level clearly?
- [ ] **Sun-in-frame** — sweep the time slider and pan around. Does the readout correctly call
      *in frame / behind camera / off-frame / below horizon*? Does the sun marker land where the
      real sun visually is?
- [ ] **Golden hour** — Find golden hour, set it, and check the light on the tiles looks the part.
- [ ] **View LUT (`L`)** — toggle it. Does the monitor match what the capture actually bakes?
      *(`L` only started working this pass — it was shadowed by the KML shortcut, which is now `K`.)*

---

## Test 5 — Cast & contact shadows *(needs your eyes on real tiles)*

- [ ] Place a person and a vehicle. Do the **contact shadows** ground them believably?
- [ ] Sweep the time slider — do shadows **lengthen toward sunset** and vanish at night?
- [ ] Direction — do they pool roughly **away from the sun**?
- [ ] Are they **life-size** against real buildings and cars? Check `height_m` / `width_m` in the
      spec against what you see.
- [ ] Capture a frame — do the cast help the shot, or distract?

> The avatar/cast overhaul is deliberately parked. Note what's wrong, don't expect it fixed yet.

---

## Test 6 — The cut and the export

- [ ] Build a cut of 4–6 shots in **Post**. Does the strip read left-to-right as the animatic will?
- [ ] Deliberately shoot the **same framing twice**. Does the line above the strip warn you, and
      name the count of distinct cameras?
- [ ] Change **delivery aspect** halfway through the cut. Does it flag the drift?
- [ ] **Check the cut** — does the modal cover light, framing and delivery, and are the flags true?
- [ ] **Export the cut (.zip)** — open it. Are the frames the real captures? Does `previs.gif`
      play as your beats? Does the README describe exactly the files that are in there?
- [ ] Turn **In the zip: ON** under Studio handoffs and export again. Do the three extra files
      appear, and do they still open in VCS-15 / Director's Chair / World Builder?
- [ ] **Session** — save, reload the page (autosave should restore), then **New** to clear.

---

## What to send back

Even a few lines helps. Most useful:
1. **Test 0** — is the "you don't have 3D" state now impossible to miss?
2. **Test 1** — anywhere you still end up in the ground, and any elevation that looks wrong.
3. **The output verdict** — did the frame+prompt beat prompting blind (Test 2)?
4. **Path** — does the merged panel read as one sequence now?
5. **Where you stalled** — any moment the tool made you stop and think "how do I…".

And if you can, send the **zip** — reading the real artifact has caught more than any
description of it.
