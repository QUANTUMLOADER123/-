# DEV17 — rebuilt sites, terrain, combat, contact and presentation

## Scope / validation boundary

Source and asset authoring, static inspection, esbuild compilation and build-only
Android / Windows packaging. **No tests, game, browser, emulator, native smoke,
visual gameplay, listening or audio-device checks.** Compilation is not evidence of
FPS, traversability, correct appearance on a GPU, or disappearance of intermittent
black squares. Bots are not redesigned: the same four high-risk RT guards remain.

## All 20 RT layouts replace, rather than overlay, the old factories

`content.js` no longer invokes the DEV03/04/08 site/detail layers. Roads, bridges,
settlements, loot tables, stable IDs, safe zones and boats remain.

| RT | Authored silhouette / circulation / detail |
|---|---|
| Lighthouse | Hollow segmented tower, 100 spiral treads, open-centre upper ring, lantern and keeper cottage |
| Harbor | Brick warehouse, open corrugated containers, lattice crane and sea-facing timber pier |
| Airfield | Marked runway and lights, extruded arched hangar, control tower and exterior stairs |
| Power | Turbine hall, paired tall stacks, transformers, insulators and maintenance platform |
| Quarry | Retaining terraces, hopper/crusher, inclined roller conveyor and timber office |
| Radar | Tilted parabolic dish with feed/ribs, open lattice tower, stairs and control lab |
| Waterworks | Paired circular basins, connected T catwalks, pipe valves and sampling lab |
| Gas station | Forecourt canopy, pumps/hoses, shop and wreck |
| Junkyard | Distinct vehicle yard, crane, tire stacks and salvage shed |
| Bunker | Wide concrete doorway, separated interior baffles, roof route and barricades |
| Supermarket | Broad entrance, separate aisle shelves, checkout counters and rear supplies |
| Satellite | Two smaller independently yawed dishes and shared equipment hut |
| Trainyard | Two rail lines, raised open freight cars, connecting entry landings and station |
| Mining village | Paired timber huts, braced headframe, winding wheel and sealed shaft mouth |
| Wreckyard | Staggered truck/car convoy, service container and concrete road barriers |
| Water tower | Braced legs, tapered cylindrical tank and roof, side stair and corner maintenance loot |
| Outpost | Walled courtyard, three separate services, lateral stair routes to watch platforms |
| Market | Timber central recycler hall, inward-facing striped market stalls and seating |
| Small oil rig | Narrow offshore deck, terrain-founded legs, lower dock, upper control room and derrick |
| Large oil rig | Wider working deck, taller derrick, helipad, crane and different tank/service arrangement |

`Site17` owns one root transform. Mesh matrices generate world OBBs, upright
cylinder bounds, floor footprints, item coordinates, dock and guard positions.
Land entrances face the nearest road segment; harbor faces outwards, oil docks
face land. Actual stair endpoints determine landings; upper landings do not cover
the lower stair approach. Room floors have a small height separation from pads to
avoid coplanar surfaces. Ground-level authored barrels are not tilted into their
pads by the old roadside-barrel terrain pass.

Static details batch by material and 10m cell. Vehicles, stations, signs and loot
keep their own roots; replaced loot models are not retained in occluder arrays.
`rayObstacle17` shares inverse-yaw OBB / finite-cylinder math between ballistics and
LOS. Broad spatial indexing retains world AABBs; exact footprint checks use the
original dimensions/yaw. Decorative handrails and some thin detail are visual,
not every visible triangle is a physical collider. Vehicles/boulders still use
conservative volumes, not a triangle-level contact solver.

Stable `rt-*`, `rt-barrel-*`, `shop-*` and guard IDs preserve inventories/depletion.
The one-time `siteRevision17` recovery only relocates an old blocked player near
the same site; it does not reset inventory, builds, terrain revision or boats.
Guard spawn coordinates are transformed local clear areas, including sync/reset.

## New-world terrain revision 8

`terrain17.js` replaces soft broad additions with narrow crests, broken ridges,
steep 8m shelves and sharper secondary folds. Coastal/river/camp protection and
road cuts remain. Height still feeds the same triangle surface for rendering and
movement. `rockfields17.js` adds deterministic separate boulders and taller rock
outcrops, avoiding roads, RT, river and house clearances. Templates are instanced
in 80m spatial groups, with finite solid bounds and occlusion.

**Only newly created revision-8 worlds get the new heights and rockfields.** Saved
revisions 1–7 keep their previous terrain formulas and do not receive new boulder
colliders under existing builds. RT replacements, combat, sound and textures also
apply when continuing a save. No promise that every natural cliff is climbable;
steep terrain intentionally remains an obstacle.

## Collision after jumping onto objects

The former vehicle walk footprint did not include the capsule contact margin,
while its side collision did. Falling was checked against ground, but could enter
an object's volume from above near its edge. Vehicle support now has a 0.28m
contact margin; finite scenery/crate tops also provide landing support using the
same yaw/circle convention. Falling motion checks the next capsule position and
lands on a valid top instead of entering it. An already invalid capsule first
tries its recent clear position, then a bounded, throttled local recovery. New
RT vehicles have both lower-hull and cabin volumes, not just the lower hull.
These source corrections are not runtime proof that every collision case is gone.

## Combat and sound

All weapon intervals are multiplied by 0.78 (roughly 28% higher nominal rate),
with a 0.055s minimum. Magazine, ammo, components, damage, reload and sprint blocks
remain. Semi-auto weapons still require a new press. Directional recoil is actual
camera aim, not just decorative weapon roll: rifles/AK/LMG up-right, pistols and
revolver up, SMGs/shotguns/launcher up-left. Signed yaw respects Three's YXZ axes;
ADS scales the impulse to 82%, without removing direction.

Death opened a paused overlay, but the respawn handler manually hid it without
resuming audio. Respawn now uses the normal close-overlay path, explicitly resumes
in the user gesture, cancels obsolete reload audio and resets attack cooldown.
Sound enable/volume and background-tab pause still apply.

## Textured explosive props and surfaces

`explosives17.js` is a single metre-space factory for timed charge, satchel,
fragmentation grenade, improvised can and the fictional explosive component.
Bevelled wrapping, straps, buckles, panel, curved decorative leads, casing bands,
rolled rims and pull ring use existing cloth/steel/paint/rubber/rust PBR maps.
Hand, inventory and thrown/stuck models share these assets; fuse/damage logic and
sticky attachment remain separate. These are fictional visual props, not a real
explosive circuit or manufacturing guide.

`author-surfaces17.py` authors 1024px tileable soil/gravel, irregular wood grain and
knots, and weathered stone maps. New albedo/normal/ORM replaces soil, construction
wood, item wood and stone; legacy boat wood is updated too. Terrain rock blending
uses the new stone maps. Original procedural provenance and SHA-256 are in
`web/assets/pbr12/surfaces-manifest.json`. Other item surfaces/icons are retained.

## Camera / conservative render hardening

Idle camera bob no longer uses a near-zero speed as a truthy walking flag. Phase
and amplitude depend on real grounded speed, residual velocity snaps to zero, and
feet-camera settling snaps within 0.5mm. Crouch and the DEV14 sole rig remain.

The reported black-square root cause is **not confirmed**. Remove singular zero-
scale instance matrices, discard invalid/near-plane casings, use RGBA8 composer,
SMAA and reflection targets, intersect supported color/depth MSAA sample counts
(up to 4), remove HDR/bloom, and restore render state in finally. These remove
specific numerical/target compatibility risks, not a verified device-level cure.

## Branding / delivery

The user-selected AI coastal title image is retained as `oskol-logo.png`, with a
compressed key-art JPEG, transparently extracted original lettering and app mark
from its fractured first O. Menu/loading wordmarks and Android/Windows icons use
these; the DEV15 dark night gallery remains. Key art is not a game screenshot.
Version 0.18.0-dev17 / Android code 19; same package IDs and save storage. APK and
portable EXE workflow is build-only and does not publish a store/release.
