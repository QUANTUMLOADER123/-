# DEV20 — terrain, player volume, recycler and inhabited bases

0.21.0-dev20 / Android versionCode 22. Static source review, original asset authoring, syntax checks, compilation and build-only packaging. No tests or generator execution, game/browser/emulator/device launch, visual comparison, listening or FPS measurements.

## Revision 11 / save boundary

New worlds use low, naturally varied `terrain13` hills rather than the sharp DEV17 peak/shelf layer. Rounded, shorter revision-11 boulders replace the tall pointed outcrops. Road routing penalizes grades; road junctions share height vertices, road profiles receive 64 relaxation passes with a 0.16 target grade, and terrain is blended into broad shoulders. RT foundations are protected from shoulder grading. Asphalt remains triangle-clipped to the actual terrain. This is an iterative construction, **not a proven universal maximum grade, connectivity or driving guarantee**. There is no ring road or repeating square road grid.

Saved revisions ≤10 keep their height fields, house positions, floor counts and generation. A **new world** is required for these terrain/house changes; continuing a saved world does not relocate its bases. Creating a world replaces the single active world only after successful entry. No forced migration/reset.

## Movement, aiming and building wear

- Local player uses a 0.60m horizontal AABB, 1.78m standing / 1.10m crouched volume, obstacle-circle / oriented-box overlap and five footprint floor/ceiling probes. Standing up also checks the full volume. Narrow gaps can retain corner support rather than requiring only the feet centre. This is not continuous swept convex collision or an exhaustive terrain-gap guarantee.
- Interaction/harvesting ray range 2.35m; crosshair prompts and HP range 2.15m. Ballistic target queries remain separate and retain firearm ranges. World RT text signs are suppressed; the helipad H landing marking is retained.
- Per-weapon cone spread combines ADS, movement, crouching and airborne factors with existing recoil/projectiles. Spread is not a replacement for recoil.
- Tier-relative HP drives darkened cracks and jagged visual/shadow holes on walls, half-walls, doors and roofs, including instanced NPC pieces. Raided new houses start with seeded damage. Wear uses wet/PBR-aware material variants and matching shadow shaders. **Holes are cosmetic/shadow-only: they do not become body/bullet passages until structural destruction.**

## Recycler

Original procedural olive/yellow industrial model: open tapered hopper, paired toothed rollers, motor/cooling rings, legs, controls and cable. Rollers animate while processing. No Facepunch models or textures.

Separate persisted six-input/six-output inventory, toggle controls, slot transfers/dragging, progress and atomic output-capacity checks. One eligible component processes every 2.5 seconds; full output stops the machine without consuming its input. Output is not multiplied again. Contents join the existing destruction/drop-bag path. New and saved player recyclers and shop terminals use the model. Processing follows active play/inventory updates, not offline elapsed wall-clock time.

## Houses

120 target homes, eight seeded cell plans, cardinal rotations, optional real two-door airlocks. New floor count selection weights: **1:50%, 2:20%, 3:10%, 4:15%, 5:5%**. These are probabilities, not an exact quota of 60/24/12/18/6 in every seed.

No generated stairs: alternating half-wall + landing jump-up routes connect open shaft cells and adjacent floor decks. Jump impulse 7.7m/s supports the nominal 1.5m steps; traversability is not play-tested. Player building-plan stairs and old saved stair pieces remain available/compatible. Selected outside wall edges receive sealed triangular foundation/cap buffer cells with two exterior walls, no doors or loot access.

Seeded poor/ordinary/rich cupboards contain wood, stone, metal, cloth/fiber, fuel and varied weapon/utility components, not only upkeep materials. Wealth changes crate tiers, counts and extra resources. Workbenches, occasional repair benches and furnaces furnish the houses; loaded live stations participate in crafting proximity and furnace advancement without storing scene references in saves. Furnace validation capacity increased to accommodate NPC machines. Unopened storage remains on the existing content-initializing collapse path rather than being depleted prematurely as a static wall.

Existing 40/40/20 house material distribution, 25% raided/50% leftovers logic, save/container rules, guards/no house bots, forests/grass, bounded prop gravity, loot multipliers and offline UI/gameplay remain. Furnished houses and jump routes are authored procedural geometry, not imported Rust prefabs.

## Component artwork

15 individually authored original SVG illustrations, rasterized to lossless 256px WebP: pipe, cylinder, sheet, blade, rifle/SMG/semi bodies, electronics, spring, gears, rope, tarp, tape, sewing kit and high-grade metal. `scripts/author-components20.py` is the standalone source; `web/assets/components20/manifest.json` records provenance and SHA-256. Runtime item art explicitly overrides these IDs. **These 15 are original vector assets, not AI-generated images or photographs.**

## Validation limitations

Only syntax, static inspection, esbuild and native packaging are used. Successful compilation does not establish actual appearance, collision correctness, shader linking on devices, physics, jump accessibility, road slopes, audio or performance. Limited prop physics is still not a complete rigid-body engine. No measured FPS/device guarantees or multiplayer/AAA claims.
