# DEV29 — 0.30.0-dev29 / Android 31

## Validation boundary

This iteration uses static source inspection, JavaScript syntax checking, offline media authoring and compilation only. **No unit, browser, native, emulator, smoke, gameplay, visual or audio-listening tests.** A successful package build does not validate appearance, combat/IK correctness on device, frame rate, performance improvement or physical behaviour. Terrain revision 14, seed identity and all 155 approved inventory illustrations remain unchanged. DEV28 graphics, sight anchors, surface cracks and 3D inventory preview are included.

## Physical NPC shooting

`society26.js` no longer applies probabilistic direct NPC-to-NPC damage. Per-frame firing clocks use the actual weapon interval, independent of the slower perception/navigation tick. Finite ammunition is spent only after checking eye → actual authored muzzle → target. The projectile starts exactly at that muzzle, not 45 cm ahead of it. `main.js` captures weapon damage at launch, so death or a weapon change cannot alter an in-flight bullet. Player shotgun damage is divided by pellet count; NPC damage already uses the projectile attenuation/pellet factor.

`spatial17.js` returns a zero-distance obstruction when the origin is inside a box/cylinder. `solids29.js` adds cached convex slab queries for roofs, foundations, triangle floors and inclined decks to both LOS and swept ballistics; these were previously walking surfaces without corresponding bullet obstruction. Structural metadata links slabs to actual destruction IDs and damage targets. The spatial broad phase indexes full floor footprints. NPC distance culling is explicitly render-only; distant hidden models keep their world positions for physical projectile targeting.

These are implementation changes, not proof that every possible legacy prop/collision discrepancy is fixed. No gameplay test has been run.

## Defence, work and finite resources

Window posts are reserved by ID. Excess defenders and one quarter of residents patrol outside rather than intentionally sharing a port. Leases last 4–6 seconds, favour changing posts, and no-progress posts are blacklisted for 25 seconds. Rally/scout/cover points use separate squad offsets. Existing alarms, repair costs, breach charges, retreat and actual door opening remain.

One worker per faction can upgrade a deterministic subset of ground-floor walls and ceilings, alternating preferences. Tasks need a funded material cost, have a 65-second timeout and a 24-second completion cooldown. The actor collects supplies from the existing depot, uses home doors/local room paths when necessary, approaches within 2.7 metres with LOS, and spends two seconds working with a visibly held hammer. A hammer is transferred from stock or crafted from the existing recipe; it is not granted for free. Material is debited only on completion. Combat/raid work takes priority. No more than 128 static upgrade records per faction are stored. Expansion modules retain their existing resource-accounted construction.

Static upgrades are persisted by deterministic piece ID and tier. Individual upgraded pieces move between variant/tier instance batches, not one permanent draw call per upgraded wall. Damage attribute capacity includes future instance slots. Reloading a streamed house reconstructs mixed tiers. Source and derived materials are tracked for disposal. Destroyed parts are not reconstructed by upgrades. NPC work is deliberately bounded to reachable ground-floor structures, not a new multi-storey construction planner.

## Human models, equipment and grip

All society actors use the existing licensed CC0 Adventurer human model. Cloth colour is assigned, not multiplied into the source's dark colour. Skin is not covered by the clothing texture. Equipped garment colours are selected from the actual carried inventory. Bone-attached category meshes show headgear, face cover, outer vest and gloves; torso/legs/feet use the character's own meshes and cloth textures. These are bounded category representations, not 56 bespoke authored outfits or simulated cloth.

`bots29.js` solves upper arm → forearm → hand to world-space grip targets using a two-segment analytic IK solution with outward/downward elbow poles. Weapon placement is anchored to the right grip, with the support hand using the authored foregrip. Pitch follows the current firing target within a bounded range. The hammer uses its own grip and procedural work swing. Existing procedural leg locomotion and crouching remain; no mocap clips have been added.

## Lootable falling bodies — not a physics ragdoll

On death, the actor's **existing inventory object** is moved into one persistent `drop-ai26-*` container, and the actor inventory is emptied before the legacy bag fallback. No second gun, clothing set or medicine table is generated. Existing container transfer rules still own looting, empty-container depletion and persistence. Clothing and the visible dropped gun reflect remaining contents.

A human body relaxes its limb pose and procedurally falls over about 0.65 seconds. Saved death time prevents old bodies from standing/falling again when streamed in. Up to 12 detailed bodies are shown within 110 m; other bodies keep an ordinary bag representation with the same container contents. Detailed bodies opt out of loose-crate physics. Their materials, generated gear, weapon geometry and skeleton textures are released when replaced or disposed.

**This is not a physically simulated articulated ragdoll.** There are no joint constraints, force-driven bone bodies, impulse reactions or obstacle-conforming limbs. Floor height places the body root, but poses can still intersect scenery or slopes. The user was told this limitation before implementation; do not describe this release as full ragdoll physics.

## Individual scrap-built weapons and audio

Sixteen IDs have separate profiles, receiver contours/widths, lengths and construction details: rifle, pistol, revolver, SMG, shotgun, assault rifle, bolt rifle, carbine, PDW, semi rifle, heavy pistol, combat shotgun, machine gun, launcher, AK-style rifle and compact SMG. The carbine/PDW now use original field-built geometry, not the previous sci-fi source adapter. Existing licensed source assets/credits are retained. Original features include pipe receivers, collars, wire stocks, wooden cheek pieces, welded seams, ventilated shrouds, gas tubes, shell holders, belt-feed details and launcher reinforcement. Static pieces are merged by material; magazines, pumps, slides, bolts and feed boxes remain separate for animation. Authored muzzle and optic metadata remain.

`weapon-profiles29.js` is plain data to avoid loading Three in the front menu through the catalog. `weapons29.js` contains geometry. Each gun has an original 512 px steel albedo, combined with existing material normal/roughness maps. Different reload tilt vectors now rotate and lower the entire weapon while existing hand/mechanism phases continue.

There are 32 new PCM16 mono shot files (two per ID), derived from the already licensed CC0 recordings with distinct resampling, filtering and short recording-derived tails. They are not 16 newly recorded/authentic real firearms, oscillator-generated shots or just renamed sample groups. `audio-manifest29.js` registers them for player and NPC use. No audio playback/listening was performed. Per-file hashes and upstream recording hashes are in `web/assets/weapons29/manifest.json`; original recording provenance remains in `audio/recorded07/manifest.json`.

## Building surfaces and HQM

Original PBR sets replace wood with rounded horizontal timber/chinking, stone with neutral gray staggered bricks, metal with orange/red corroded vertical pipe relief. Wooden wall/frame geometry uses merged rounded timbers while retaining sealed collision footprints; higher player-wall tiers replace timber relief with a flat structural core. Gray HQM is a separate seventh PBR family.

Tier 4 is a real persistent building level: 2200 HP, upgrade cost 12 highMetal, repair paid in highMetal (one per 180 missing HP), upkeep 0.5 highMetal/hour per assigned piece. Save validation, upkeep credits, rendering and NPC repairs support it. Existing tiers and IDs are retained; no new inventory icon is required because highMetal already exists. Geometry/textures are stylized original authoring, not Facepunch assets.

Rebuild offline media with a Python environment containing numpy, Pillow, scipy and soundfile:

```sh
python scripts/author-dev29.py
```

This also deterministically recreates the DEV17 base surface inputs before applying the DEV29 edits. Updated surface hashes are written to `pbr12/surfaces-manifest.json`.

## Foliage, ground and sea budgets

Ground albedo and meadow pigment use muted gray/olive tones without modifying terrain topology. Tree leaf cards per branch are reduced from 5 → 3 for conifers and 6 → 4 for broadleaf recipes, with adjusted card coverage. Leaf shadow chunks have a shorter near budget than trunks. No claim of a measured FPS increase is made.

The sea retains existing resolution/frequency/off controls. A cached sparse camera/terrain visibility estimate gates the expensive mirrored-scene pass; water itself always renders with the sky fallback. Sparse sampling can miss a thin inlet, which then uses the fallback rather than disappearing. Fine grass, biome undergrowth and rain meshes are omitted from the mirror pass; distant wave detail and dry-weather rain ripple work are skipped. Main-view vegetation and gameplay resources are not deleted by reflection budgets.

## Delivery

The existing build-only workflow packages Android debug APK and Windows x64 portable EXE from branch `arena/ce299f3a-repo`. No tests or application launch are included. Android application ID, development signing key and Windows save path remain unchanged. There is no store submission or automatic public release.
