# DEV19 — woodland, terrain-conforming roads and bounded prop physics

Version 0.20.0-dev19 / Android versionCode 21. Static review, original geometry/material authoring, syntax checking, compilation and build-only packaging. No tests, generator execution, game/browser/emulator/device launch, screenshot comparison, audio or performance measurements.

## Root cause and save boundary

`terrain17.js` multiplied the entire added mountain relief by a road-distance mask: zero below 5m, full height at 14m. On an 80m ridge this excavated a deep slot, not a plausible road shoulder. A separate maximum-height strip/junction disc then bridged uneven terrain. Compilation of earlier builds never established their appearance or traversability.

New world content revision **10** calls `landscape19.js`: the same sharp landscape without that road mask. RT pad targets use the lower middle of nine local height samples rather than lifting a whole compound onto an isolated narrow peak. Routing receives the same seeded noise/landscape, penalizes squared grade, and rejects steep *shortcuts*. This is not a maximum-grade proof: A* connections remain possible through steep terrain when no gentle path is available. No ring/grid is reintroduced.

`road-surface19.js` clips land asphalt, paint and junction polygons against the exact two triangles in each shared terrain cell. Every generated fragment lies on the physics terrain plus a small surface offset. It does not just interpolate two potentially unsupported edge heights. Land roads add no phantom flat walking decks; river bridges retain explicit raised walking/collision decks and piers.

Saved revisions 1–9 retain their original height fields, road graph, house positions and road rendering. **An existing DEV18 island keeps its old road trenches. A new world is necessary for this terrain repair.** No silent terrain migration, base relocation, inventory reset or forced player teleport. The setup UI explains replacement of the single active world.

## Forest and ground cover

- `forest19.js`: original tapered trunks, branches and crossed leaf/needle clusters; original 256px canvas leaf atlases, alpha testing/depth writing, matching masked wind-animated depth pass. Not solid cone/cube stacks; not Facepunch assets. Existing arid dead trees and DEV18 cacti remain desert-specific.
- Small/medium/large islands append independently seeded, spaced woodland nodes. Existing resource IDs/RNG and harvested records are retained. New placements avoid roads, banks, RT, houses, steep faces and saved player buildings.
- Huge/vast islands use `forest-stream19.js`: deterministic 72m chunks, 6m candidate cells, ordinary harvestable tree IDs/colliders, near-first generation (two chunks per playing frame after initial seeding), and bounded active chunks (40/72/96 for near/balanced/far). Unloading removes nodes, collision entries, instance buffers and owned geometry/material/depth resources. Harvested IDs remain depleted across re-entry and save/load. A fixed tree cap is no longer diluted over the full 4–8km map.
- `understory19.js`: original frond/leaflet ferns and occasional small flowers, instanced and distance culled. No added resource economy or invisible blocking colliders.
- Grass tufts: nine wider curved blades instead of five thin blades; denser local coverage, seeded variation, shadow reception and wind. `ground-cover19.js` uses spatial exclusions for RT/houses/player deployables and nearby floor slabs, avoiding water and very steep faces. Desert grass uses its actual low biome probability, rather than a forced 13% minimum.
- Meadow pigmentation adds green/soil patches on temperate, shallow terrain; not a global green tint on desert or snow. New revision-10 worlds have more solid outcrops, with saved-building exclusions.
- Tree shadows are enabled on medium/high, still disabled on low. Quality draw ranges are bounded by the real index buffer. Existing distance and shadow budgets retained; no measured FPS or visual quality guarantee.

## Gravity and contact

`physics19.js` adds bounded kinematic/dynamic prop settling, not a general-purpose rigid-body engine:

- Loose random crates/barrels, dropped bags, and player storage/workbench/furnace/cupboard/recycler/repair-bench interactables are registered by stable ID. Authored shop terminals and locked, unraided house loot are not freely movable.
- Gravity 18m/s², maximum downward speed 35m/s, substeps up to 1/90s with a 60ms frame budget. At most 48 nearby bodies are simulated per frame within 105m. Far loose props are support-seated at registration, then sleep; sleeping nearby props periodically recheck support.
- Five oriented bottom contact samples consult the actual triangle terrain, finite transformed floor tops and non-depleted collider caps. The same-model collider is excluded; overhead floors are not chosen as ground. Loose props align to their support slope, have small impact rebound, ground friction and a simple steep-slope slide response.
- Hit effects can impart a bounded impulse to unowned loose props; side obstruction and short substeps restrict crossing walls. This is not continuous convex-shape collision, exact rolling, torque/inertia, arbitrary stacking or destructible-world rigid-body simulation.
- Collider world heights/positions follow the model. Horizontal movement invalidates spatial targeting/collision caches. Player deployables update their saved `y`; loose prop positions use validated `propPhysics19`; bags update their existing records. Inventories are never regenerated/multiplied/moved to a second container.
- Hand-dropped bags start slightly above the feet and fall. Destruction/collapse retains the existing one-bag/content-transfer rules. Foundations, RT, trees and buildings remain static/structural; the established collapse subsystem still handles destroyed support. Existing player movement, swimming, boats/buoyancy, projectiles and explosives retain their own physics paths.
- Military/elite loot uses an original folded-fabric supply crate with slats, pallet, webbing and buckles, merged by material. Tier weights and contents are unchanged.

## Retained and limitations

120 houses, 20 RT, two shops, two oilrigs, four RT guards/no house bots, DEV14 viewmodel/controller, gallery, aim/ADS/input/audio paths, existing inventories, harvesting multipliers and persistence are retained. No new bots in this update.

Build success only establishes bundling/packaging. Shader compilation on a device, actual visuals, geometry contact, connectivity for every seed, streaming hitches, memory use and FPS have **not** been exercised. This update does not claim Rust graphics or that every possible floating/interpenetrating object is eliminated.
