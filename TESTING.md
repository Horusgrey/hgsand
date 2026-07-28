# GMAPz Scout — Test & Feedback Pass

A checklist for driving the tool on **real photoreal tiles** — the things I can't verify
headlessly. Work top to bottom; jot anything that feels off next to the item. The two starred
tests matter most.

---

## Setup

```bash
python3 -m http.server 8080
# open http://localhost:8080/gmapz_scout.html
```

Paste your **Google Map Tiles API key** into the Scout panel → **Apply keys & reload Earth**.
(Billing must be enabled; see README for the "keep it free" quota caps.) Wait for the status
pill to settle to **✓ photoreal Earth**.

---

## ★ Test 1 — Does it feel like operating a camera?

Fly somewhere you know, then work a shot. Rate each **feel**, not just "does it work":

- [ ] **Establishing arc** — fly to a new city (search a place). Does the rise-and-settle feel
      cinematic, or too much / too little swoop? _(tune: flight durations + `pitchAdjustHeight`)_
- [ ] **Orbit** — press **O**, drag a slow circle around a real building. Does the subject stay
      centered and the motion feel weighted? Scroll to dolly — natural?
- [ ] **Orbit momentum** — flick and release. Does it glide and settle gracefully, or over-spin /
      stop dead? _(tune: launch scale `0.45`, decay `0.88`)_
- [ ] **Double-click** any point — recenters and eases in. Right amount of push-in?
- [ ] **Dutch roll** — `[` / `]` to cant, `\` to level. Smooth? Horizon behave as expected?

**Report:** which motions feel right, which want tuning, and in which direction.

---

## ★ Test 2 — The output test (the one that matters)

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

## Test 3 — Viewfinder & light (press **V**)

- [ ] **Thirds / center** align to the letterboxed frame at each delivery aspect.
- [ ] **Artificial horizon** — cant the roll; does the line show true level clearly?
- [ ] **Sun-in-frame** — sweep the time slider and pan around. Does the readout correctly call
      *in frame / behind camera / off-frame / below horizon*? Does the sun marker land where the
      real sun visually is?
- [ ] **Golden hour** — Find golden hour, set it, and check the light on the tiles looks the part.

---

## Test 4 — Cast & contact shadows *(needs your eyes on real tiles)*

- [ ] Place a person and a vehicle. Do the **contact shadows** ground them believably?
- [ ] Sweep the time slider — do shadows **lengthen toward sunset** and vanish at night?
- [ ] Direction — do they pool roughly **away from the sun**?
- [ ] **Too dark / too light / wrong angle?** Note it — quick tune of alpha (`0.3`), size, and
      whether to add true directional rotation.
- [ ] Capture a frame — do the shadows help the cast sit in the shot, or distract?

---

## Test 5 — Coverage, exports, session

- [ ] **Coverage** — pick a recipe, preview steps, roll it; shots land with locked light.
- [ ] **Exports** — pull a `gmapz.capture.v2`, a VCS-15 `.md`, and a VCO `.json`. Do they open
      cleanly in / feed into your other tools? _(Note any field-name friction — that's backlog #2.)_
- [ ] **Session** — save, reload the page (autosave should restore), then **New** to clear.
- [ ] **Coach** — on a fresh browser profile, do the Prompt Studio / Coverage nudges appear once
      at the right moments and not nag?

---

## What to send back

Even a few lines helps. Most useful:
1. **Feel** — the motions that want tuning and which way (Test 1).
2. **The output verdict** — did the frame+prompt beat prompting blind (Test 2)?
3. **Shadows** — read right on real tiles, or need a tune (Test 4)?
4. **Export friction** — anything your other engines choke on.
5. **Where you stalled** — any moment the tool made you stop and think "how do I…".
