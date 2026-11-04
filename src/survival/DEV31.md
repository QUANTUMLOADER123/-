# DEV31 — offshore platforms rebuilt / 0.31.0-dev31 / Android 33

## Research and provenance

The reference direction is a fixed steel jacket supporting modular topsides: tubular foundations and diagonal bracing, separate process/utility/control spaces, cranes, drilling derrick, boat landing and helideck. Research references:

- [1 — Topside structure and separation of drilling/accommodation/process modules](https://www.investopedia.com/terms/t/topside.asp).
- [2 — Jacket, water-level boat landings, risers, crane and flare-boom arrangement](https://wonews.com/the-wheelhouse-scoop-anatomy-of-an-oil-rig/).
- [2 — Rust large-rig circulation, multiple stair connections and elevated helipad](https://rust420.com/news/rust-large-oil-rig-monument-guide/).
- [4 — Rust small-rig levels and staircase access](https://www.corrosionhour.com/rust-small-oil-rig-monument-guide/).

Photographic/screenshot references inspected for proportions and silhouette: [real offshore staircase/helideck](https://safeguard-technology.com/markets/offshore), [Rust large-rig overview](https://www.bisecthosting.com/blog/rust-oil-rig-monument-guide-small-large-rigs-walkthrough). Reference downloads stay in ignored `image-search/`; none are embedded, traced into a texture, or distributed as game assets. All new geometry is procedural original work in `oilrig31.js`, using existing original/licensed material banks. This is not an engineering-certified model or a copy of Facepunch's layout, meshes, logos or textures.

## Layout

| Element | Small | Large |
| --- | --- | --- |
| Main deck count | 4 | 6 |
| Main deck elevations | 5.2, 9.2, 13.2, 17.2 m | 5.2, 9.2, 13.2, 17.2, 21.2, 25.2 m |
| Water-level boat landing | 1.2 m | 1.2 m |
| Separate helideck elevation | 20.4 m | 28.4 m |
| Unscaled deck footprint | 28 × 24 m | 36 × 30 m |
| External stair towers | 2 | 2 |
| Loot crates / barrels | 10 / 8 | 20 / 12 |

The existing DEV25 horizontal site scale (1.5 for current islands) remains applied by `Site17`, as does coast-facing yaw; elevations are not scaled. No terrain/content revision increment or island regeneration. The main path starts at the dock and connects every deck. The opposite tower connects the first main deck to every higher deck, allowing a perimeter loop rather than a single dead-end ascent.

Each 4 m storey is split into two 2 m flights with ten 0.20 m rises, 0.35 m local treads and a return landing. Flights run in adjacent lanes outside the main rectangle. Near landings occupy local Z 0–2.5; flights span 2.5–6; intermediate landings span 6–8. This avoids cutting a stair through a solid higher slab or placing a rail across an entrance. Main slabs have true four-piece openings around the conductor bay. The helideck begins at the top endpoint of its dedicated 3.2 m stair, not above that stair's approach. Door/corridor/perimeter spacing was reviewed in source, not walked in the game.

## Construction and dressing

- Seabed-founded cylindrical jacket legs, X-bracing, upper columns, deck beams/fascia, flange rings and production risers.
- Guarded central conductor bay extending through the decks; tapered braced derrick over the upper working deck.
- Textured horizontal vessels with rounded end caps and saddles, generator housings/alternators/vents, tanks, valves and overhead pipe racks.
- Workshop and top control cabin on both rigs; a furnished bunk module on the large rig. Control cabinets, screens, desks, seating and shelves use the existing material palette.
- Pedestal lattice-boom crane with cable/hook and counterweight; idle darkened flare boom. No active fuel-producing machinery is implied.
- External helideck with braced supports, perimeter rails, tube-circle and geometric H marking, small emissive fittings without extra shadow lights. It remains scenery/walkable space, not a helicopter vehicle or reinforcement event.
- Deck numbers are small painted geometry on the fascia, not large monument advertising boards or new icon assets.

## Collision, loot and lifecycle

Floors/colliders/interactables are derived from final world matrices by the existing `Site17.finish()` path. Decks/landings/helideck are explicitly tagged for recovery; stair treads remain individual physical floors. Horizontal rails have narrow yaw-aligned collision proxies matching their individual tubes, not a full-height invisible wall. Stair rail collisions use the existing conservative tilted-member bounds. Stair stringers, fine riser brackets, crane cables and other thin dressing are not blanket player blockers.

Loot retains existing seeded tiers, contents generation, stack caps, depletion and persistent transfer behavior. Legacy crate IDs 0–2 / 0–4 remain; additional floors add distinct IDs. Authored oil-rig loot is marked fixed-support so stale saved prop offsets cannot drop a crate onto an unrelated new deck. This does not make barrels unbreakable or refill emptied crates. Oil loot collider radii follow the existing horizontal site scale. No new NPC populations, card puzzles, locked-crate timers, attack-helicopter events or Rust scientists are introduced.

Geometry is merged by existing material/XZ cells with an additional 6 m height key for offshore sites; no new per-frame rig simulation, shadow lights, remote requests or required texture paths. Thin hidden rail proxies are invisible but retained for lifecycle disposal. Structural collision remains independent of render visibility. No measured draw-call/FPS claim.

## Save compatibility

New games start with `oilRevision31:31`. On first entry of an older save, only a living on-foot position already in an old rig's footprint and above the water is eligible for relocation. Candidate points on new deck/landing rectangles are ranked by horizontal/vertical proximity and accepted through the existing standing-volume collision functions, falling back to the clear dock if needed. This also runs when the old DEV17 site-recovery marker already exists; the new marker prevents repeating the relocation. Boats and swimmers are not repositioned. Inventory, terrain, buildings, emptied-container flags, active transfers and other monuments are not reset. Existing personal construction is not silently demolished or regenerated to fit a new monument.

## Validation boundary

Changed JavaScript parsed with `node --check`; esbuild compilation and whitespace/diff inspection. Native CI compiles Android with `assembleDebug` and packages Electron portable Windows, then publishes standalone APK/EXE and hashes. **No unit/browser/native/emulator/smoke/runtime/visual/gameplay tests, app launch or FPS measurement.** Source-level geometric clearance reasoning is not device validation. Install over the previous version without uninstalling/clearing application data. DEV30's mandatory texture path correction and visible entry-error report are preserved.
