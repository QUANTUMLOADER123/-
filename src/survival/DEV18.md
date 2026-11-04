# DEV18 — desert cacti, beach selection and non-lattice roads

## Validation boundary

Only source inspection, authored geometry, JavaScript syntax checks, esbuild and
build-only APK / portable EXE packaging. No tests, game/browser/emulator/device,
visual gameplay or listening checks. No measured FPS or verified traversability.

## Why the previous spawn favoured the desert

The old sampler used angles 0.12 through 2.97 radians, not the full coastline,
and exited on the first low-error beach. It had no biome preference and cached
that one location for every respawn. Southeastern coast could win repeatedly.

The replacement samples 128 directions around the full coast, selecting flat,
dry beach points away from roads, RT/guards, house plots and the river channel.
Actual beach and landward biome are checked through the SAME pure classifier as
vegetation / HUD (`biome18.js`); biome boundaries themselves are unchanged.
Temperate beaches are preferred, then non-desert candidates, with a safe-beach
fallback if the preferred pool is empty. This is not a claim that every arbitrary
seed is guaranteed to have a temperate beach. Default selection is deterministic
for new-game starter salvage; persisted `respawns18` rotates the candidate pool.
Continuing a live save does not teleport its player to a new spawn.

Revision-9 height / beach caches include the map-layout generation, preventing
an early menu-time query from retaining the temporary legacy road cuts after the
actual new layout has been configured. Old height formulas are not changed.

## Cacti

Replace the old 90 fixed-seed, limited-rectangle Cactus_1 placements with original
ribbed three-dimensional saguaro, one-armed and barrel-cactus templates. Upright
stems, curved rising arms, rounded crowns and light spine clusters have authored
green vertex colours and rough material. They bypass the tree/bark override and
leaf wind shader. Templates are instanced by variant in 64m groups, using normal
visibility budgets rather than individual per-spine draw calls.

Candidates cover the whole arid biome using the world seed, with density scaled
by world size (target 150–1300, not a guaranteed accepted count). They reject roads,
RT, rivers, steep ground, resource/scenery overlap, house plots and saved player
buildings. Finite trunk colliders use the same circle convention as DEV17. New
construction locally hides intersecting cacti and removes their colliders. Cacti
are decorative solid vegetation, not a new harvestable resource or damage system.
They also apply to continued old worlds, without moving resource/loot/house IDs.

## Why the roads looked like a ring and repeated squares

`roadSamples()` authored a closed coastal ring. `extendRoads10()` then added a
5×5 row/column graph, producing 4×4 repetitive cells. Random jitter did not change
that topology. Those functions remain only for saved content revisions 1–8.

New worlds use content revision **9** and `roadNetwork18()`:

- One land arterial connection between distant inland RT access points.
- Further RT access roads attach to the nearest reachable existing segment,
  forming branches rather than an outer ring or a rectangular mesh.
- Bounded A* routes avoid compound/camp bounds and the sea, with river-crossing
  cost. The search grid is internal, not a rendered street lattice.
- Visible paths are shortened by clear-line checks and conservatively rounded;
  exact endpoints / shared host vertices do not move.
- A branch stops at its FIRST existing road intersection, including collinear
  overlap, rather than drawing a second strip over it or closing a forced loop.
- Incidental crossings are split and true shared junctions get common elevations.
- Six-metre arterial / 4.5m access strips retain bridge, floor and roadside-loot
  generation. RT fronts use their existing nearest-road orientation logic.
- New settlements are placed AFTER the frozen network, using road exclusion, so
  the network is not driven through house plots. These are still 120 houses, not
  a new AI population. Road IDs are deterministic within the new revision.

**A new world is required for the new road topology.** Existing revision-8 worlds
retain their roads, cuts, houses and road-loot IDs to avoid moving saved bases or
inventories. Sharp terrain, 20 authored RT, two safe shops, oil rigs, four guards,
combat/audio/contact fixes and DEV17 assets remain. No global road/terrain
migration is performed on an existing save.

## Delivery

0.19.0-dev18, Android version code 20; same application IDs and save directory.
Build-only GitHub workflow on the session branch, no tests and no store/release
publication. Compile success is not a runtime check of generator connectivity,
spawn safety, cactus appearance or performance on a specific device.
