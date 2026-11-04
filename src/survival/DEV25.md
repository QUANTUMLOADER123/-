# DEV25 — 0.26.0-dev25 / Android 27

## Changes and boundaries

- E and the touch interaction button stop before the held-item/attack branches. Plan placement is an attack action too. Safe-zone interaction is not rejected just because a plan is held. No runtime validation was performed.
- `stackLimit(item, state)` / `lootLimit(item, state)` use the state's multiplier, never a mutable module-wide setting. Stackable capacities are multiplied by 1/2/5/10/50. Existing random loot is capped, not multiplied a second time; the one-gun and one-ammo-stack-per-type rules remain. Containers, machine insert/output/take operations, inventory packing, clothing swaps and save-slot validation pass their own state. A legacy syringe/medkit save allowance remains for older saves.
- Shared cached hemp mesh is scaled 2.05: original 0.845 m stem becomes about 1.73 m. Original resource IDs stay; each eligible legacy fiber node gets a deterministic `-pair25` partner. Extra 48 m streamed colonies contain two plants, 0.68–1.06 m apart, with independent seed/IDs (`hemp25-TXcTZgGpP`), graphics-quality-independent positions and depletion. Both positions must pass the existing road/terrain/foundation masks. Forest acceptance .86, coast .55, snow .14, desert .055, two candidate colonies/tile. A harvested member does not respawn when the tile is reloaded.
- Biomes share smoothly blended forest/snow/arid/coast weights. Warped fields replace straight climate cuts; blended RGB is shared by map and ground, and `climate25` drives terrain snow/arid shading. Dominant IDs still select regional plant species/gameplay; this is not a new terrain-height formula.
- Road cluster crate keeps its ID and contents and is parented to the vehicle's rear deck; model bounding-box bottom is aligned to the authored deck height. RT vehicle crates have stable additional IDs. These crates are fixed to a static vehicle support, excluded from loose-prop settling and static batching. Individual car meshes remain occluders, not the future loot subtree. Destroyed/depleted loot does not leave a new static occluder.

## Attachments

Four saved slots per weapon **type**, matching existing magazine/condition granularity, not per-instance serialized weapons: optic, muzzle, laser, extended magazine. Eight original item definitions/recipes/icons: holo, reflex, 4× scope, suppressor, brake, flash hider, laser, extended mag. Items do not stack or receive multiplied loot quantities. New deterministic crate rolls, workbench recipes, four shop offers; already-owned container contents are not rerolled.

Inventory: select a gun → ОБВЕСЫ. Explicit fit/remove actions transfer ownership between inventory and `attachments25`. Replacement reserves the incoming module's slot for the outgoing module; removal needs a backpack slot and reserves it before returning excess ammunition. Excess ammo is reconciled through the existing overflow-ground-bag path, never silently discarded. Losing the last gun of a type releases its modules back through the same inventory reconciliation. Saves validate slot/type compatibility and extended magazine counts without changing the active map.

- No built-in/free holographic sight. The existing authored holo is hidden until installed; iron ADS uses a dedicated socket and rear posts. RPG retains its native ladder sight, not a free removable module.
- Holo 1.45×, reflex 1.2×, scope 4× zoom. Muzzle brake multiplies recoil by .74; suppressor scales outgoing shot damage by .93 and uses quieter/slower playback of the existing licensed sample. Suppressor/flash hider hide the main muzzle flash. Suppressor, brake and flash hider share a procedurally authored muzzle body at different lengths, not imported proprietary models.
- Laser housing, visible ray and impact dot; L switches it off/on. Active laser multiplies hip cone by .72, not aimed spread or bot shots. Collision/terrain probe runs at most about 15 Hz over nearby collision buckets, not a scene-wide per-frame triangle query. Shotgun pellet pattern is not tightened by this module.
- Extended magazine uses ceil(base × 1.5), actual reload/HUD/save limits and a visible extension parented to the animated magazine. Removal returns excess loaded rounds; fitting does not create any rounds. Tube shotguns, revolver, bolt rifle and launcher are incompatible with the extended-mag slot; launcher accepts no modules.
- New original stamped receiver covers/rivets/bindings and field-repaired firearm accents. Non-reload support grip derives from the authored fore-end geometry. Existing DEV14 reload/fire/IK ownership and DEV24 glove/sleeve materials remain.
- Existing licensed/original audio only. No Facepunch assets were downloaded/extracted; this is not Rust's proprietary sound pack, and no listening/device checks were performed.

## New-world geometry and optimization

`contentRevision:13` is used only by new games. Continue/load keeps its own revision. Monument reservation radii and horizontal dimensions are enlarged **before** river-safe placement, terrain shaping, roads and settlement reservation. Root Y scale stays 1 so 20 cm stair risers stay 20 cm. Floor extents now use world scale; solid collider extents already did. Entry/perimeter coordinates use local, not double-scaled, radii. Existing site IDs, shop count and saved ownership are retained. Export a save before replacing the world.

- Most RT have 1.8× horizontal scale; airfield 2.2×; lighthouse/gas/market/outpost and offshore rigs 1.5×.
- New radar replacement: original industrial sphere, about **61.2 m horizontal diameter**, **40 m high** before its small ground offset. Three interior decks at 10.2 / 17 / 23.8 m, stairs with ≤.20 m rise, genuine lower opening/entrance cutout, segmented wall colliders, machinery and service room. Reservation radius 68 m includes the long approach stair. Old-world radar and all old-world site dimensions stay as before; installing this update alone does not resize the saved world.
- Terrain is already a single indexed surface. Retain 10 m material/spatial RT batches, cached vehicle geometry, streamed/instanced vegetation and independent loot/doors/destruction. DEV25 reindexes the merged RT/car geometry using full position/normal/UV attributes, without smoothing hard seams. Do not turn the whole island into one giant uncullable mesh.

## Validation policy

Only source inspection, `node --check`, `git diff --check`, esbuild compilation and build-only APK/EXE CI. **No unit/browser/native/emulator/smoke/game/visual/audio/FPS tests or device launches.** Compiling does not establish playability, appearance, floor collision correctness or improved FPS. DEV24 seven-slot/56-item clothing, atomic swaps and hidden quickcraft in external loot contexts are retained.
