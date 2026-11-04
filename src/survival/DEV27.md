# DEV27 — 0.28.0-dev27 / Android 29

## Household tactics (experimental)

`tactics27.js` coordinates home alarms and finite-inventory squads. Orders: rally at the actual depot, scout, breach, cover, assault/loot, withdraw. At most four eligible living, armed members per squad; home alarm interrupts a raid. Initial ground-floor door preference includes distance to the exterior entry. Breachers must physically approach and have an unobstructed segment to the target surface before consuming one carried satchel. Existing delayed explosion damages an actual part, with actual attacker position passed to the alarm hook. Failed routes/timeouts are not bypassed with teleportation or wall penetration.

Defenders reserve authored ground-floor window posts, follow cell/entry waypoints, open their own real doors nearby, and close doors after others clear the opening. After the alarm they route back through the entry rather than remaining trapped indoors. Colliders now match actual window sides, sill, lintel and bars; open-door frames remain in LOS. Post scoring uses contact visibility, distance and reservation; posts periodically reconsider, low cover pauses fire, low ammunition triggers physical resupply from finite stocks. A repair role spends carried material obtained from the depot and repairs nearby living ground-floor walls/doors during quiet gaps. No destroyed part reconstruction.

Movement samples the travelled segment at ≤0.18 m, with a bounded 0.5 m interior fallback grid; changing goals invalidates old routes. Tactical movement cannot be overwritten by generic combat flanking. Crouched actors use their own low capsule and procedural squat/weapon-height adjustment, not the player's current stance. NPC-to-NPC visibility uses the same aim height as its simplified damage shot.

Household signals originate from nearby hostile shots, damage to a resident, or damage/charge placement on owned structures. Sound alarms are approximate last-contact positions, not omniscient knowledge of the whole map. Detailed siege retention is capped at six pinned houses, in addition to the existing distance streamer; active interior exits take priority. Coordination runs every two simulation seconds. No background/paused/offline progress.

## Sleeping bags

- `sleepingBag`: 40 fiber + 1 sewing kit; construction crafting category; stack limit one, max eight live player bags.
- Place on flat dry land, own intact foundation or square roof with the full footprint supported. Crafting consumes the recipe and placement consumes the item. Foundation/roof tops use actual +0.38/+3.11 m heights.
- Rounded cloth world model and build preview. E selects a preferred badge; the death screen explicitly offers every live bag and the beach. The badge does not force an automatic respawn.
- Persistent building data and `preferredBag27`; optional tactical metadata is validated after baseline society metadata. Existing DEV26 saves remain eligible, with no map/terrain revision bump and no reset/reseeding of inventories or inhabitants.
- A bag destroyed directly or with its supporting floor cannot respawn the player. Spawn candidates stay within the bag's footprint and on its saved floor; require collision-free standing/headroom. Blocked candidates disable that button and are rechecked on click. No search into adjacent rooms, different floors or the other side of a wall. No bag cooldown; death pauses the simulation clock.
- Health/food/equipment respawn rules otherwise preserved. No new items awarded on respawn.
- New individually generated sleeping-bag illustration uses the same approved reference; offline key/resize in `scripts/prepare-items27.py`, transparent 256 px WebP and provenance hashes in `web/assets/items27/manifest.json`. All 155 DEV26 icon files remain unchanged.

## Limits and verification

This is local, bounded tactical logic, not human-level AI or a neural agent. Only ground-floor house tactical metadata is authored; no upper-floor assault, ladder/stair navigation or full arbitrary-base planning. Limited navigation/furniture/honeycomb/closed extra doors can prevent a raid from succeeding; a raid does not guarantee loot. Finite supplies can run out. The depot remains the existing real external shared inventory; this is not a new system of raiding every furnished interior container. NPC-NPC combat still uses LOS-gated probabilistic damage, not new projectile physics. Character animation remains procedural, without IK or motion-captured clips.

Per user instruction: static inspection, `node --check`, `git diff --check`, asset authoring, esbuild and build-only GitHub CI. No unit/browser/native/smoke/emulator/runtime/visual/audio checks, no measured FPS or verified gameplay/spawn/animation claims. Bundle-size warning is not a gameplay measurement. APK and unsigned Windows portable packaging preserve application/save identity and the existing public Android development signing key.
