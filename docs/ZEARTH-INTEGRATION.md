# Z-Earth ↔ Scout — where the two projects meet

> Read alongside `Horusgrey/ZEarth` (`docs/CURRENT-STATE.md`, `docs/RENDERER-ECOSYSTEM-AUDIT.md`,
> `docs/OFFLINE-DATA-CONTRACT.md`). Assessment made against ZEarth `45b8d05`, v0.3.0-dev.

## The question

Can Z-Earth replace CesiumJS and the Google Map Tiles key inside Scout?

## The short answer

**Not yet, and not by swapping the renderer — by supplying the data.** Z-Earth is a real,
disciplined project, and it is solving a problem Scout genuinely has. But the two projects want
different things from a globe, and the gap between them is a *data* gap, not a software one.

## What Scout needs from a globe, in the order that matters to a frame

| # | Need | Why the frame needs it | Scout today | Z-Earth today |
|---|---|---|---|---|
| 1 | **Photographic ground** | Without it the picture is a map, not a location. | keyless ESRI satellite drape | **none** — the world style is 6 vector layers: ocean, land, lakes, rivers, boundaries, place dots |
| 2 | **Real elevation** | A camera at eye level must stand *on* the hill. | Cesium World Terrain (ion token) | Terrarium DEM PMTiles — one bounded Minneapolis fixture, USGS 3DEP pipeline designed but unbuilt |
| 3 | **Building geometry** | Sides, occlusion, shadows. | OSM Buildings (ion) | planned OSM extrusions, "approved, not yet built" |
| 4 | **Photogrammetric mesh** | The thing that makes a Google photoreal frame read as a *place*. | Google Photorealistic 3D Tiles | "High-detail buildings/models … **Deferred**" |

Scout's three earth modes map onto rows 1–4: `flat` is row 1, `terrain` is rows 2–3, `photoreal`
is row 4. Z-Earth currently sits **below** row 1 for Scout's purposes — it has better elevation
than Scout's keyless mode and no imagery at all.

## Why swapping the renderer would be the wrong move

Z-Earth's own audit says it, in its own words:

- MapLibre: *"browser-first rendering is not native 3D Tiles infrastructure"*
- OpenGlobus: *"no native 3D Tiles claim in this harness"*
- CesiumJS: *"strongest native 3D Tiles and planet-scale precision story"*

Google Photorealistic 3D Tiles **are** OGC 3D Tiles. Moving Scout from Cesium to MapLibre would
move it off the only engine in that list that can read its primary data source. Z-Earth's
renderer bake-off may well pick MapLibre for Z-Earth — Z-Earth is a map application and MapLibre
is the right tool for a map. Scout is a camera, and a camera needs the mesh.

## The integration that is actually worth building

Z-Earth's `OFFLINE-DATA-CONTRACT.md` already defines a **region pack**: bounded geography with a
manifest, checksums, licence provenance, and a local byte-range server. That container is exactly
the right shape for Scout — it just needs formats Cesium reads natively.

**Two asks of Z-Earth, both already named as candidates in its own docs:**

1. **Quantized-mesh terrain output** alongside Terrarium.
   `OFFLINE-DATA-CONTRACT.md` already says *"quantized mesh remains a benchmark candidate"*.
   Cesium reads quantized-mesh natively via `CesiumTerrainProvider`; Terrarium needs a custom
   provider. This one output format is the whole bridge for elevation.
2. **A raster imagery pack** (aerial/satellite, PMTiles or plain XYZ over the local server).
   Scout drapes imagery with `UrlTemplateImageryProvider`, which is a URL template — a Z-Earth
   server on `127.0.0.1:8765` satisfies it with no new code in Scout beyond the URL.

**On Scout's side that is a fourth earth mode**, sitting between `terrain` and `photoreal`:

```
photoreal   Google 3D Tiles          real mesh                  ✓ green
local       Z-Earth region pack      real elevation + imagery,  ✓ green
                                     offline, no key
terrain     Cesium ion + OSM         real elevation, box bldgs  ✓ green
flat        ESRI drape               no geometry                ◇ amber
```

It slots into `setEarthMode` and `EARTH_SOURCE` as one more entry, and
`location.earth_source` would record `zearth_region_pack` so a frame still says which Earth it
was shot on. That is the whole change on Scout's side — the honesty machinery already exists.

## About "our own Google Earth"

Worth separating cleanly, because it changes what is achievable:

- **Rows 1–3 are a software and pipeline problem.** Open data exists — Natural Earth, USGS 3DEP,
  OSM, NAIP and state aerial imagery for the US. Z-Earth is already building exactly this. It is
  work, but it is tractable work with a known end.
- **Row 4 is a capital problem, not a code problem.** Google's photoreal mesh is aerial
  photogrammetry flown over ~2,500 cities. No open dataset is its global equivalent, and no
  renderer choice creates one.

But Scout does not need a global photoreal Earth. It needs **the locations in the film** — Lake
Rachel, that bridge, wherever the next scene is. That is a handful of places, and a handful of
places is precisely what a region pack is for. Where a city publishes a photogrammetry mesh, or
where drone photogrammetry is flown and processed into 3D Tiles, that becomes a region pack —
and Scout renders it today, unchanged, because Cesium reads 3D Tiles natively.

So the honest framing is not "how do we replace Google" but **"which locations do we need to own,
and can we produce a 3D Tiles pack for each one."** Z-Earth's architecture already answers the
second half.

## The bar before Scout swaps anything

Scout stays on Cesium + Google tiles until a Z-Earth pack can do all of this for one real
location, verified by capture:

- [ ] serves a raster imagery layer Scout can drape (`UrlTemplateImageryProvider`)
- [ ] serves terrain Cesium reads natively (quantized mesh), or ships a tested Terrarium provider
- [ ] `groundAt()` returns plausible elevations across the pack's bounds (−450…9000 m, stable
      as tiles refine — see *Ground truth* in `CLAUDE.md`)
- [ ] a captured frame at eye level stands **on** the ground, not in it
- [ ] the whole thing works with the network off
- [ ] `location.earth_source` records the pack, its version and its checksum, so an export can
      never claim geometry it did not have

Until every box is ticked, adding it as a fourth mode costs nothing and risks nothing — the
existing modes stay exactly as they are. That is the safe order: **add a lane, don't replace the
road.**
