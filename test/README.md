# Suites

Headless Chromium (Playwright) against a locally served copy of `gmapz_scout.html`.
**Zero page errors is part of green.**

```
./test/run.sh              # everything
./test/run.sh linetest     # one suite
```

`run.sh` writes the served copy itself and fetches CesiumJS on first run. It drops only
the Google-hosted webfont link — the Cesium loader is left exactly as shipped, so the
suites exercise the real local-first path a user with a vendored copy would get.

## Why these live in the repo

They used to live in a scratch directory. That directory has now been wiped twice by a
container recycle, the first time taking sixteen suites and 484 assertions with it. A
test you cannot re-run after a restart is a test you do not have. They are committed.

## The suites

| suite | what it holds down |
|---|---|
| `core` | the loop end to end; earth-state honesty; `S.fov` is degrees; `camera{}` vs `location{}`; soft frames; the path's two products; cut integrity; saying nothing that cannot be known; the zip is a real zip |
| `linetest` | THE LINE — the projection arithmetic, the action axis, crossing, the 30° rule, screen direction, and that all of it reaches the prompt, the report and `cut.json` |

Suites still to rebuild after the wipe: `truthtest`, `pathtest`, `exporttest`, `keytest`,
`keyverdict`, `fileproto`, `qualitytest`, `reftest`, `realcuttest`, `forgetest`,
`blurtest`, `movetest`, `kindtest`, `casttest`, `nexttest`, `roomtest`. `core` covers
the highest-value assertions from several of them; the rest is real lost coverage and is
listed here so it is not quietly forgotten.

## When a suite disagrees with the app, suspect the suite first

Logged false positives, every one of which cost real time:

- radians injected into a degrees field
- racing an 800ms autosave debounce
- reading a CSS transition mid-flight
- forgetting `vco()`, `worldBuilderProject()` and `saveShot()` are async
- reading `spec` off `capture()`'s return value when it is only on the stored record
- measuring an `<img>` before it decoded — a 2px box passes "is it under a third of the screen"
- `offsetParent` is null while a `<details>` is collapsed, so everything reads as hidden
- **passing `{lat,lon}` objects to `startPath()` / `addPathPoint()`, which take two numbers**
- matching a disclaimer as if it were an assertion: the soundscape's own note says Scout
  "does not know whether this location is urban or rural", and a whole-object regex for
  `/urban/` read that as the app claiming a city

## The test surface

`window.gmapz`. Anything a suite must reach goes there — see the export block at the
bottom of the app.
