# DEV32 — terrain, ecology, foundation sealing and validated delivery

Version **0.32.0-dev32**, Android version code **34**. Application ID, development signing key and Windows save directory are unchanged.

## Changes

- Revision 15 terrain: bounded, broad rounded relief, gradual coastline/river banks and broad RT pads. Both road grading and settlement placement sample this terrain. New routing can choose another perimeter gate when neighbouring RT enclose its preferred gate. Small islands retry uniform safe packing rather than entering with fewer than 120 houses.
- **Only new worlds use revision 15.** Continuing an older save retains its terrain revision and successful historical plot/routing algorithm. Export the old save before replacing it. Previously invalid historical seeds are not silently regenerated.
- Hemp, berries, mushrooms, pumpkins and corn are restricted to suitable forest ground, away from desert/snow transitions and excessive slopes. Stable resource IDs and depletion remain in saves.
- Cacti are harvestable with finite work: total 6 flesh + 3 cloth at ×1; axe speeds work without increasing the total. Flesh restores 7 hunger / 12 thirst. Depleted instanced cacti and their collision are removed; save/load retains depletion. New icon uses the approved item-art reference.
- Natural terrain rock textures are restored separately under `assets/nature32`. Mineable-rock textures are unchanged. Generated building stone/metal textures remain construction-only. Original soil restored. Colour photos are generated artwork, with derived luminance normals/ORM, **not scanned photogrammetry**. Provenance/hashes are recorded in asset manifests.
- Ground barrels/crates relocate to gentle terrain, or are omitted if no safe candidate exists. They remain upright instead of inheriting a slope tilt below scaled parents. RT/platform loot, owned furniture and player bags are not randomly relocated.
- Water waves/foam use screen-derivative attenuation and distance fading, with non-parallel lower frequencies. Existing bilinear depth lookup is retained. This targets line/moire interference; no device-wide guarantee of its absence.
- One iron-sight assembly per firearm, explicit receiver-top mounting metadata, connected front posts/feet and optic risers. Revolver rail/hammer height corrected; machine-gun carrying handle moved aside from the sight line. Functional attachments remain separate and paid. Fifteen non-launcher assemblies pass geometric mounting checks; this is not an exhaustive visual ADS test on every device.
- RT discovery no longer produces a toast/pickup sound. Exploration/mission tracking remains.
- Square and triangular player/NPC foundations have closed, ground-reaching perimeter skirts instead of supporting posts. Rotated collision/LOS and foundation-linked depletion/unloading are preserved; NPC skirts can be targeted as their parent foundation.
- Cupboards occupy a deep main room with internal doors. Furnishings use actual footprint bounds, collision-free placement and doorway clearance rather than overlapping fixed offsets. Optional furnishings are omitted if they cannot fit safely. Existing container IDs/contents are retained.

## Performance and compilation

- Loose-object registration is invalidated by real source/count/depletion changes instead of rebuilt every frame. Distance/sleep filtering happens before world-matrix queries; nearby simulation work is bounded.
- Corpse resync is no longer scheduled when no corpses exist. Ground-bag sync preserves its object-list identity when nothing was removed.
- Exact terrain triangles are split into frustum-cullable patches with copied seam normals; physical/rendered geometry is unchanged. Static merged RT matrices are frozen only after their correct world transform has been computed.
- Offshore far silhouettes avoid drawing the detailed rigs at long range. Detailed near rigs, their floors, loot and collision are retained. Economy graphics use simpler tree templates at world creation.
- Local esbuild runs were approximately 0.23–0.47 seconds; this is not a native packaging benchmark. CI caches npm, Electron/Electron Builder downloads and Gradle build/configuration data. Windows no longer runs a redundant explicit web build before `build:windows`.
- Delivery is gated **validation → Windows EXE compilation → Android APK compilation → standalone release publication**. No APK is published if validation or Windows compilation fails.

### Important performance limitation

The sandbox uses headless software WebGL. CPU profiles were dominated by idle/driver wait, with very slow frames; they do **not** establish normal hardware FPS. Early captures also had a terrain shader failure, so their frame times are not a valid before/after speed comparison. The terrain shader failure on economy detail-map settings was fixed and subsequent browser smoke reported no GLSL errors. **Elimination of all two-second hitches on the user's PC/phone is not verified.** No numeric FPS improvement or successful native-device playtest is claimed.

## Validation actually performed before delivery

- `npm run test:release`: **23 passed, 0 failed**. Includes 35 size/seed generation cases, two previously failing seeds, connected RT routing, biome/resource policy, cactus totals/consumption/save depletion, old revision retention, instanced cactus targeting/hiding, rotated square/triangle skirts, player skirt ownership, exact terrain triangle/edge copying, natural-vs-construction textures, icon hashes/alpha/dimensions and engine tests.
- `npm run build`: passed.
- `SMOKE_URL=http://localhost:3000 node scripts/dev32-smoke.mjs`: passed **small/economy** and **large/balanced**, 32 inhabitants plus separate guards; entry, 120 bases / 20 RT, cacti, two rigs, skirted loaded houses, one cupboard per loaded house, non-overlapping furniture, automatic save decoding, inventory open/close. **No browser, asset HTTP or GLSL errors.** Six loaded houses were checked per case; this is not all 120 interiors.
- Browser fixture: **15 firearm assemblies**, seven iron components each, bounded receiver gap and connected front post/foot/stalk.
- Inspected generated cactus icon and browser captures locally. No native Android/Windows game launch, audio listening, long-duration raid/navigation playtest, elevated-ocean pixel comparison or comprehensive weapon ADS screenshot review was performed.

### Historical test debt, not hidden

The unchanged DEV31 checkout was run separately: **25 passed / 22 failed** in its old full suite. The current full `npm test` run is **39 passed / 19 failed** (58 total); the remaining failures are old assumptions/fixtures such as starter supplies/stamina, monument counts, station/placement expectations and browser-only models run without a DOM. Current icon tests were updated to actual DEV26/27/32 paths and fingerprints. CI gates the explicitly named current release suite and browser smoke; **it does not claim that the entire historical suite is green**.

Generated CPU profiles, screenshots and test logs are development artifacts under `.artifacts/dev32`, excluded from Git. Native Windows/Android build outcomes are reported by the linked release workflow, not inferred from the web build.
