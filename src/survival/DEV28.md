# DEV28 — 0.29.0-dev28 / Android 30

## ADS / weapon model corrections

The old iron anchor was `optic.position.y - .075`, below the actual receiver/cover. `weapon-mods25.js` now measures receiver triangles intersecting the central receiver region in model space, excluding optic geometry; rear notch/front post use a sight line above that surface. An optic riser connects the raised holographic body to the receiver; a separate scope foot supports the scope. Mechanical geometry is shown only without a sight module. ADS still resolves the selected visible optic or the iron anchor through model and hand-root transforms in `viewmodel14.js`, rather than using a screen-space fake dot. No free holographic module is added.

Procedural pistol/revolver/long-gun/launcher models now publish their actual authored muzzle positions. Attachments, first-person flashes and new front sight supports no longer use a long-rifle fallback for every pistol. Imported CC0 carbine/PDW metadata remains intact. These are static geometric corrections; ADS appearance/alignment was not viewed or runtime-tested.

## Surface damage

`damage20.js` no longer discards fragments or opens artificial holes. Damage darkens narrow main/branch fissures on the intact surface. Depth/shadow geometry remains intact until existing destruction/collapse removes the actual part. HP, repair, ownership and collision rules remain unchanged. A per-entry HP/tier/model stamp skips unchanged mesh traversals and updates instanced damage attributes only when their value changes.

## Detailed graphics / memory controls

Plain `settings28.js` is safe to import in the front menu without Three or a renderer. Existing settings are validated/migrated; new installations default to Balanced, not maximum combined AA. Presets apply real options, custom values persist locally:

- Off, FXAA, SMAA, MSAA 2x, MSAA 4x, or MSAA 4x + SMAA. Native context AA is disabled; explicit off is truly off. MSAA is clamped to common RGBA8/depth sample counts supported by the GPU. Switching disposes old composer targets/passes. FXAA follows OutputPass and uses actual drawing-buffer resolution.
- Render scale 50/67/85/100/125 percent, multiplied by device DPR capped at 1.5. Scales world and hands together, not the HTML HUD.
- Texture divisor 1/2/4/8 **per side**. ÷8 means approximately 1/64 pixels for a divisible source, not 64x FPS. Applies to loaded terrain/prop/item images and embedded GLTF texture images before first upload, retaining aspect ratio, UV repeat, filters and colour-space metadata. UI icons, reticles and internal data/height/render-target textures are not degraded. Decoded shared images are reduced once through a WeakMap. Raw images are not deliberately retained for reverse switching. **Requires saving, returning to menu and re-entering the world**; the settings panel explicitly indicates the pending change. Compressed package/download size is unchanged, and initial source decode still happens; this is not a guarantee about peak browser memory.
- Anisotropy 1/2/4/8 limited by GPU; detailed normal/AO/roughness/metalness maps enabled/disabled on standard materials. Backups are held in a WeakMap (not JSON-cloned material userData); these detail toggles reduce sampling, not a promise that all texture memory is freed. Custom shader sampling is not universally rewritten.
- Shadows off/512/1024/2048, refresh 5/10/15/30 Hz. Disabling frees the existing shadow target. Water reflections off/256/512/1024, hard refresh cap 2/5/10 Hz; off shrinks the target to 1 px while sky/Fresnel water remains. Reflection frequency may visibly lag during camera motion by design.
- Grass off/low/medium/high, decorative undergrowth off/on, rain particles off/low/full, existing object-distance and weather controls. Decorative undergrowth generation is skipped when disabled, but independent food/hemp RNG domains and IDs remain; switching graphics does not reseed finite resources. Old instanced decorative undergrowth is hidden separately from real trees/resources.
- Frame limit 30/45/60/90 or uncapped: limits frame-loop updates/renders while playing, does not advertise guaranteed throughput, and does not advance simulation offline. Browser refresh scheduling can yield a lower effective cap.

## CPU/GPU work reduction

`spatial28.js` indexes full static collider footprints in 32 m cells. LOS collects a conservative corridor around the segment instead of every collider/tree in the island; exact ray/OBB and tree intersections, terrain checks, door panels/frames and depletion rules remain authoritative. Big rotated obstacles are indexed across their occupied cells. Indices invalidate on array identity/count changes (the existing house/node streaming conventions). This is a static broad phase, not a replacement for tracking moving dynamic obstacle transforms.

World loading uses a shared 2-job (economical) / 3-job decode/parse gate across model and texture jobs, including cancellation paths, instead of unbounded concurrent decoding. AA avoids a hidden native-MSAA-plus-post stack. Damaged-geometry state is cached. Shadows/reflections have independent update budgets, and disabled reflection/shadow targets are released/shrunk. No simulation, loot, colliders, weapon physics or NPC limits are silently removed by a visual preset. No FPS or memory benchmark has been performed.

## Actual 3D inventory preview

`player-preview28.js` clones the existing licensed Quaternius Adventurer skeleton, hides its default backpack, and uses a static relaxed arm pose. Equipped shirt/legs/shoes recolour actual character meshes; selected apparel adds curved sleeves, headwear/masks, lathed torso shells, pouches/straps, kneepads and boot cuffs. Gloves use filtered actual skinned hand/finger triangles with a thin surface offset, not a paper-doll icon. All seven wear slots read the same `wear24` equipment as protection/first-person sleeves. Rotation and zoom are available through pointer drag and accessible buttons.

It is a real Three-rendered stylized character, not a new photorealistic avatar: common category meshes/materials represent item variants, not 56 independently modelled clothing assets. No cloth simulation/IK or new full third-person gameplay body. Bare slots retain simplified base body/work-trouser presentation. Selected but unequipped inventory clothing is not falsely shown as equipped.

The preview uses the **existing world renderer/context**, small fixed 240x360 offscreen buffers and the standard OutputPass. It copies the resulting pixels to the inventory canvas only on open/equipment change/rotation/zoom; no continuous idle rendering or second WebGL renderer. Drag redraw is bounded to ~15 Hz plus the final input frame. The world render target/clear/shadow state is restored. Gear changes dispose replaced geometry/materials; closing releases input handlers; world disposal releases preview targets and cloned resources. Unchanged poses reuse a cached image without another GPU readback. A 240x360 pixel GPU readback still has a cost during interaction; it is not a zero-cost preview.

## Build-only verification / compatibility

Only static source/GLB metadata inspection, `node --check`, `git diff --check`, esbuild and build-only APK/Windows packaging. No unit/browser/native/emulator/smoke/runtime/visual/audio tests, measurements or gameplay claims. The esbuild bundle-size warning remains. Saving, bags, tactical NPC systems, previous art, ownership and terrain revision 14 remain; no new world is required. Existing app/save identity and public Android development signing are unchanged.
