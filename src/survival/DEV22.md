# DEV22 — grass quality and bounded single-cover streaming

0.23.0-dev22 / Android versionCode 24. Static source inspection, syntax checks, esbuild and build-only Android/Windows packaging. No generator execution, tests, game/browser/emulator/device launch, visual/audio inspection or FPS measurements.

## Source issues addressed

The previous active grass path generated up to 90k–110k all-island instances, then added another 7k/12k/18k near-camera field. Both covered the same ground with independently randomized tufts. Moving 20m restarted the local field in place, overwriting it progressively. All grass used one nine-blade mesh whose draw range was cut for quality levels; nearby grass had no dedicated lower-detail far representation. Terrain normals were sampled twice per accepted local tuft.

The new grass replaces both old paths; it does not stack a third layer on top. Unused all-island and original legacy grass constructors were removed. Existing terrain revision 12, houses, resources, harvest IDs, inventory, weather, trees, physics and saves remain unchanged. **No new world is required**, including when continuing older terrain revisions.

## Appearance

- Original opaque geometry, not transparent rectangular texture cards: tapered, curved ribbons with a folded central ridge on medium/high. Tip vertices are single points, not doubled zero-width quads.
- Near models: 5 simple blades on low, 7 folded blades on medium, 9 folded blades on high. Far models use 3 simple curved ribbons.
- Tufts vary in yaw, width and height; density/height/tint respond to smooth seeded patches. Green meadow grass blends toward dry/straw accents; coast, desert and snow retain their own tint and real biome spawn probabilities.
- Dark root-to-light tip gradient, high roughness, approximate sun-facing light transmission, and subtle rain darkening. Medium/high receive the existing scene shadows. Grass does not cast its own costly shadow field. Lighting and bending are approximations, not physically exact botanical rendering.
- Two wind frequencies plus broad travelling gusts. Wind displacement is transformed back into the rotated/slope-aligned tuft frame, keeping a coherent world-space wind direction. Roots remain anchored.
- Gentle radial displacement/height reduction within 0.82m of the main camera/player. Purely visual bending, not collision, persistent footprints, or flattened saved trails.

## LOD and spatial work budgets

| Quality | Candidate grid per 18m tile | Near/far transition | Outer range | Resident tile cap |
|---|---:|---:|---:|---:|
| Low | 12×12 | 17–26m | 56m | 56 |
| Medium | 14×14 | 27–39m | 82m | 100 |
| High | 16×16 | 35–49m | 108m | 156 |

Caps include empty ocean/road/building tiles. Actual tuft counts are lower than candidate counts because of biome, patch, water, road, slope and building rejection. These are code budgets, **not measured device results**.

Each tile generates one set of positions, transformations and instance colours. Its two LOD meshes share those GPU attribute buffers; there are not two independent grass populations. Ordered 4×4 screen-space discard blends detailed and simple ribbons. No alpha blending or transparent-card sorting is used; the transition still costs fragments and can show dither texture. At the outer range the geometry shrinks toward its root over roughly 16m, rather than disappearing as a full-height wall.

Only nearby tiles exist, regardless of island size. Retained world-space tiles are stable while walking; plans refresh in 6m camera cells, tile coordinates remain 18m. New jobs are nearest-first, **at most one tile per rendered main frame**, with a frame guard against duplicate loading/render calls. Initial entry prepares the bounded neighborhood four tiles per cooperative loading yield. Each candidate has its own stable seeded RNG, so excluding a newly built foundation does not reshuffle unrelated tuft positions in the same tile.

Frustum bounds include a conservative animation margin. Near/far draw visibility is gated per tile; no far tile submits the folded near geometry. Shared geometry/material variants are reused across tiles; leaving tiles dispose their instance resources, world disposal also releases all cached profile geometry and materials. Extra folded geometry and two LOD draw objects still have a cost; lower total GPU/CPU time is not guaranteed without measurement.

## Grounding and exclusions

Roads, water, very steep slopes, RT pads, house plots and player structures remain excluded. Revision-11+ house exclusions now use the actual rotated cell plans and outside buffer margins rather than only a seven-metre circle. Terrain gradient samples are reused for both slope rejection and orientation. Spatial exclusion records consult live building HP rather than stale copied HP. Depleted floor records do not keep blocking grass forever.

Own-building footprint changes are detected at bounded intervals (0.75s). Dirty tiles are refreshed nearest-first while retaining their previous meshes until replacement is ready; moving into another planning cell does not lose pending dirty jobs. This is not an instantaneous building mask: a brief delay before every affected tile is refreshed is possible. Quality switches select the corresponding cached geometry and rebuild the bounded neighborhood; a quality-change refill can be visible.

Grass owns its wind/colour/LOD/rain shader and explicitly bypasses the general wet-surface shader wrapper, avoiding duplicate patch chains. The rest of the world's PBR/wet materials is unchanged.

## Validation boundary

Syntax checks, `git diff --check`, esbuild, Gradle assembleDebug and Electron packaging only. No tests or application execution. Successful compilation does not establish shader linking on each GPU, actual appearance, absence of shimmer/pop-in, device frame time, memory consumption, loading duration or FPS. This update makes no measured speedup, AAA-quality or hardware compatibility guarantee.
