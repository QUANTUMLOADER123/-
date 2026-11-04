# DEV21 — repeated trees, over-flattened terrain, missing-house visibility

Version 0.22.0-dev21; Android versionCode 23. Static inspection, syntax checking, esbuild and build-only APK/EXE packaging. No tests, generator execution, game/browser/emulator launch, screenshots, listening, native smoke checks or FPS measurements.

## Source findings and scope

- `forest19` cached one fixed shape per model name: mostly two broadleaf shapes, plus near-identical pine/snow geometry. Scaling/rotation alone did not provide different species silhouettes.
- Revision 11 reused the low-relief `naturalHeight13` field, then applied every RT pad in sequence with at least 45m of blending shoulder. On a small island these overlapping pads flattened a substantial fraction of already low land. A fixed 1.7m camp target further suppressed central variation.
- Old plot candidates stopped at a normalized radius of 269m. On the 8km island the 30–40 normalized metres between this boundary and the shore become hundreds of actual metres, beyond the default 320m proxy radius. Thus homes can exist in the data yet be absent from the coastal view. This explains a source-level visibility problem, **not a runtime determination of every cause of the user's missing houses**.
- Detailed house/proxy rendering also depended on mutable instanced frustum bounds and hid the proxy at the beginning of house loading. This patch hardens both paths; no claim that these were the sole observed cause.

## Seven tree silhouettes, all saves

`forest21.js` authors separate oak, birch, aspen, maple, spruce, Scots-pine and fir forms. Each has its own branch count, crown starting height, spread, height ratio and foliage proportions; birch has an original white/black bark atlas. Curved segmented trunks, small root flares and original masked leaf/needle cards use shared per-species templates. Not seven colour filters over the same geometry, not imported Facepunch assets.

Species selection is hashed from stable resource IDs rather than array ordering. Per-tree height, width, depth and yaw vary independently; both material parts use the same transform. Tree harvest IDs, saved depletion, loot and instance removal remain unchanged. Small/medium/large and streamed 4–8km forests use the same species grouping. Broadleaf work is grouped once, not duplicated across two old model-name passes. Geometry/material/depth caching and existing chunk/visibility budgets remain; extra silhouettes can increase draw calls and there is **no measured performance guarantee**.

## Revision 12 terrain and plots — new worlds only

`landscape21.js` adds four seeded, broad Gaussian uplands, rounded valleys and world-space smaller undulation above the existing coastal/river base. No sharp DEV17 teeth or narrow high spires are restored. Extra relief fades toward the coast and river. Pads use 18m-or-radius-relative shoulders and only the strongest pad influence instead of cumulative sequential flattening. The camp blends to its natural local height, not an artificial deep bowl at 1.7m.

Road A* receives this same height field; `gradeRoad20` still performs bounded grade relaxation and terrain shoulder shaping. Asphalt stays clipped to real terrain triangles. The 0.16 profile grade is an iterative target, not a proven universal maximum, road-drivability or connectivity guarantee.

`settlement-plots21.js` uses an actual-metre coast setback, a size-aware candidate lattice, coastal sectors, inland sectors and random infill. Houses avoid RT, road centre corridors, river banks and unsuitable sampled foundation slopes on the road-graded height field. Layout-cache generations advance before construction, so a cancelled/failed entry cannot reuse the previous attempt’s road profile. There are 120 accepted plots or world creation fails with an explanation **before replacing the previous save**; it does not silently accept an empty/partial island. This is a construction invariant, not a generator test result. House material/wealth systems, 1–5 storeys with 50/20/10/15/5% selection probabilities, buffers, jump-up routes, cupboards, furniture and persistent loot remain.

No silent migration: revisions ≤11 keep their coordinates, height fields and saved player bases. A **new world is required for new relief and plot distribution**. The setup screen explicitly states this. New tree forms and visibility fixes work when continuing old worlds.

## House visibility hardening, all saves

- Distant house proxy range grows with square root of map scale, capped at 1800m. Only cheap bounded proxy boxes gain this range, not all detailed houses or physics.
- Proxy materials are ordinary opaque Lambert shaders; they do not depend on the damage/weather shader patch chain just to show a distant house silhouette.
- Proxy chunks and bounded detailed-house instance batches use explicit CPU range/root visibility rather than relying on mutable instance frustum bounds.
- Revision-11+ house roots expose readiness. A proxy is hidden only after geometry, instances, furniture and materials are fully assembled; streaming invalidates the visibility cache.
- Existing destruction flags, support collapse and house-coordinate/loot persistence remain. No restoring deliberately destroyed houses, adding house map dots, teleporting players or force-resetting inventory.

## Validation

Syntax checks, `git diff --check`, esbuild and build-only CI packaging only. Compilation cannot establish actual visible house counts, visual quality, all seed placement success, playable road gradients, shader linking on every GPU, jump routes, collision correctness, audio or FPS. No game, renderer, procedural generator or tests were executed for verification.
