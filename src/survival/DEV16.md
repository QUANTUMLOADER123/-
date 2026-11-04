# DEV16 — object visibility, authored items and new-world terrain

## Input ownership

Desktop mouse down/up events handle independent LMB/RMB transitions. A mouse
PointerEvent down only occurs when the first button is pressed: it cannot implement
RMB + LMB chords. World PointerEvents now ignore mouse down/up, but keep mouse
movement / pointer lock and touch camera gestures. Compatibility touch-generated
mouse events are ignored. Releasing RMB does not stop automatic fire, and releasing
LMB does not stop ADS. Existing focus/overlay/pointer-lock reset remains authoritative.
Attack and swim-up touch buttons track separate pointer IDs and capture their own
pointer; releasing the look finger or movement pad does not release either button.

## Models, materials and controller ownership

`items16.js` replaces the complete held firearm factory (14 IDs), plus axe,
pickaxe and hammer. Receiver/stock/blade silhouettes use bevelled extrusions;
barrels have recessed openings; the AK has a curved removable magazine. Revolver
cylinder, bolt, slide, fore-end, feed box and detachable magazines retain DEV14
mechanism references. Static meshes are merged by material without merging moving
parts. Flash positions come from the authored muzzle, not a shared hardcoded length.

Axes are +Y up, guns -Z forward. Models declare `opticMount16`, `muzzle16`,
`rightGrip16` and optional `supportGrip16`. The optic base meets the top rail;
launcher rail is centred rather than an unsupported lateral optic. Pistol rail and
optic travel together with the slide. Tool hands are transformed from explicit
model-space sockets, including the left-side shaft grip for axe/pickaxe.

DEV14 is still the **only** per-frame first-person pose/IK controller. DEV16
replaces factories and supplies sockets/profiles; it does not add another animation
update layer. Medical items have a short presentation-only use gesture; healing
remains immediate. This is not delayed treatment, bleeding or a new medical system.

Nine original periodic 256px surfaces (color, normal, ORM) supply wood, steel,
polymer, rubber, cloth, paint, rust, brass and organic detail. Shared textures are
loaded locally during world entry, not remotely or via runtime thumbnail rendering.
Item and vehicle caches are world-scoped / released, not tied to disposed textures.
Four new colored inventory vectors extend the mixed-provenance icon catalog to 92:
20 existing individual AI illustrations + 72 original authored vectors. No new
Quaternius/Facepunch/model-library assets were downloaded for this iteration.

## Content and saves

- `akRifle`: 30 rifle rounds, 38 base damage, .15s automatic interval, 2.9s reload.
- `compactSmg`: 32 pistol rounds, 18 damage, .078s interval, 2.4s reload.
- `antiseptic`: 45 HP; `traumaKit`: 90 HP; normal maximum remains 100.
- Existing syringe (25 HP) and medkit (65 HP) gain models and crate availability.
- New guns have recipes with mandatory firearm components, loot pools, profiles,
  ammunition, ballistics, sounds, icons, save/magazine/condition support.
- Random containers still normalize to at most one gun; guns/tools are not multiplied.
- New medicine stacks use 20. Historical oversized syringe/medkit player slots up
  to their old 1000 limit are accepted and grandfathered, not discarded or used as
  a reason to reject a save. Taking new items never adds to an oversized stack.
- Healing toasts show actual gained HP, not a hardcoded +35 for every consumable.

## World

Terrain revision 7 adds broad ridges, hills and smaller folds, protects the shoreline
and river channel, and reduces the camp grading shoulder (40m vs revision 6's 63m).
New uplifts fade away near the camp to avoid adding a ridge to the pad transition.
Only **new worlds** get revision 7. `terrain13.js` and all revision <=6 formula
branches are preserved. Existing saved bases keep their terrain; menu explicitly
labels the saved revision. Geometry, movement, props, roads and beaches continue
to share `terrainGrid08` triangle interpolation.

Edible mushrooms now have a pale stalk below a rounded, outward-normal lathed cap;
no whole-plant upside-down transform. Other edible models have textured surfaces.

Original static sedan/pickup wrecks have wheel arches, sloping glazing/pillars,
mirrors, rims, hubs, lights, bumpers, door handles, corrosion and an open pickup bed.
Geometry is cached by world and merged by material; roadside yaw follows the road
with a small deterministic offset. Existing world IDs/loot positions and OBB
collision/walk surfaces remain. These are authored stylized wrecks, not scanned
vehicles, drivable cars or a new suspension/ground-contact solver.

## Render-only distance policy

| Profile | Tree-centre budget | Props / wrecks | Detailed houses | House proxies | Sites |
| --- | ---: | ---: | ---: | ---: | ---: |
| Near | 125m | 100m | 95m | 190m | 190m |
| Balanced | 235m | 160m | 145m | 320m | 360m |
| Far | 360m | 230m | 190m | 520m | 650m |

Tree/proxy chunk radii expand the approximate centre budgets; Three.js still applies
frustum culling. Trees use existing 80m cells; settlement proxies now use 96m cells
per tier instead of three island-wide instances. Only near tree chunks cast shadows.
Visibility is refreshed at 120ms intervals or after significant displacement, and
forced following dormancy/state changes. Detail streaming respects the profile and
existing quality-dependent house counts. Projectile-requested detail remains in
simulation; its render root can be hidden and a proxy retained.

Distance hiding never removes collision, floor, inventory, damage or support state.
Targeting distinguishes a render-only hidden ancestor from a destroyed/inactive
object. No fog was added. Settings are persisted separately from world saves.

## What has NOT been verified

Only source/asset authoring, static inspection, compilation and build-only CI are
allowed. No unit/browser/native/emulator/smoke/game/device/audio/visual runs.
No measured FPS gains, visual grip/optic perfection, suspension alignment or
terrain traversability claims. A successful compiler/package build does not verify
those things. Bots, multiplayer and a full-body animation system remain out of scope.
