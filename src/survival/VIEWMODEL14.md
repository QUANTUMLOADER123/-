# DEV14 — first-person hands and animation ownership

## Scope and provenance

Original procedural meshes/curves and authored procedural microdetail, implemented in `rig14.js`, `pose14.js`, `reload14.js`, `effects14.js`, `viewmodel14.js`. No downloaded hands, motion capture, Facepunch assets or proprietary animation code. Existing original weapon models and licensed tool models remain in use. This is a stylized first-person rig, not a scanned character or complete full-body animation system.

Changes apply to every loaded world, including legacy saves. No terrain/content revision, storage key, signing key, application ID, loot generation or world placement changes are needed. DEV13's revision-6 terrain remains a new-world feature; DEV14 does not regenerate an existing island. Bots are not reworked in this iteration.

## A single pose owner

`installViewmodel14` is installed last in `world.js`. It preserves the legacy model-construction/optic metadata factories, removes and disposes the obsolete visible hand/arm rigs, and **replaces** `updateArms04` without calling the earlier pose updater. Base `world.update` skips its old root bob when `viewmodel14` is active. The old pose functions remain in source for historical reference, not as additive update layers.

Frame order:

1. Actual accepted action events arrive from `main.js`; rejected input, dry fire and sprint-blocked input do not create animation impulses.
2. The motor provides transient camera-independent velocity/grounded data on `world.locomotion14`, not in the save schema.
3. Equip, locomotion, sprint, crouch, air, landing, turn lag and weapon recoil construct one root pose. Analytic critically damped springs and exponential damping accept elapsed time up to the same 0.1-second bound as the game loop; they do not depend on a fixed frame count.
4. The selected model's mechanisms reset to captured rest transforms. Actual reload progress or time since the accepted shot drives its current mechanism pose.
5. ADS solves the transformed optical center, including slide motion for slide-mounted pistol optics. FOV changes smoothly. Sprint, reload, swimming and draw readiness gate ADS; `aimBlend08` also informs the HUD.
6. Hand sockets and grasp orientation are transformed by the model once. The reload hand follows the moving magazine's geometry-derived contact point and orientation rather than its arbitrary mesh origin.
7. Swimming retains occupied grips and visible items, because existing gameplay permits firing/using them in water. Only free hands paddle. This avoids an invisible firing weapon. Two-handed items remain held while swimming.
8. Fingers flex; the final camera-space IK places the sleeve wrists on the hand wrist anchors. Arms are camera children, not children of the moving item root.

`world.sprintBlend06` remains available to the original shooting/use/reload-start blockers. Sprint lowers the root by 30 degrees and suppresses new melee/reach pose energy. Existing Ctrl/mobile camera stance remains the only eye-height controller.

## Hand and arm spaces

Hand local `+Y` is toward the fingertips, `+Z` is palmar, and `-Z` is dorsal/nail-facing. Positive X flex bends fingers toward the palm. The index and thumb share the same mirrored anatomical edge. There are three skinning bones per finger, with blended weights around the PIP/DIP regions; thumb opposition is separately oriented. Palm, finger and sleeve surfaces are lofted, not stacked joint capsules. Finger roots overlap the palm under the fingerless glove; this is not a single welded full-hand production mesh.

Weapon support-under, side-of-magazine and over-the-receiver grasps have different right-handed quaternion bases. Twelve explicit weapon profiles specify support points, presentation reload categories and recoil weights. Tool shaft points are derived from wood/handle geometry in model space and transformed by the authored tool orientation/scale. Rock/plan/explosives use authored independent holds.

Sleeve segment lengths are 0.36 m and 0.34 m. A stable outward/downward elbow pole and a smooth hidden-shoulder reach compensation avoid disconnected capsule joints, wrist lag and visible segment stretching. The mesh blends upper-arm/forearm/wrist bones and has a wrist-oriented cuff. Very short target distances are also compensated at the hidden shoulder. This is a viewmodel accommodation, not realistic shoulder-body constraints for a third-person character.

## Reload ownership and milestones

The source of truth is the existing `reloadTask` / `reloadState04.progress`; `needed` is captured from actual missing rounds and available ammunition. This module never mutates inventory or magazine counts. Existing completion/cancellation, cooldowns, sound dispatch and rocket-ammunition selection remain in `main.js`.

| Presentation category | Motion |
| --- | --- |
| Detachable magazine (including combat shotgun) / ammo box | Support hand reaches the actual mesh bounds; extracts, lowers, replaces and seats at progress .52. The hand follows mesh rotation as well as position. Pistol slide or charging handle closes at .83. |
| Revolver cylinder | Barrel-axis cylinder swings left; a six-round visual carrier approaches and seats at .52; cylinder closes at .83. No per-shot casing ejection. |
| Internal magazine / tube | Individual visual rounds are presented according to the captured missing-round count; right hand operates a manual bolt, or the support hand returns to the pump. Bolt/pump closes at .83. |
| Launcher | Breech opens; a visible rocket enters and seats at .52; cap closes at .83; the support hand returns to its hold. |

The original three sound cue dispatches (`out`, `in` at .52, `bolt` at .83) are retained. Per-round feeding remains a presentation of the pre-existing **atomic** reload: it does not add partially retained cartridges on cancellation. Revolver visuals show a full carrier, not a per-chamber simulation of the exact partial load. Existing simple receivers do not gain real interior cutaways, magazine retention or mechanically complete fire-control parts.

## Shots, impacts and release

An accepted fire event gives bounded spring impulses; it does not call ballistics or apply camera recoil a second time. Existing camera recoil remains in `main.js`. The pistol slide, manual bolt and pump have separate short mechanism curves. The casing pool is limited to eight instances with 0.65 s lifetime, separate pistol/rifle/hull size/color and delayed ejection for manually cycled guns. Casings are purely visual: no hitboxes, terrain collisions, pickup objects or inventory entries. Flash material and instanced-color variants are included in entry-time compilation; there is no new asset download during a shot.

Melee/reach/throw events animate the accepted action and follow-through. **Melee damage and projectile launch retain their original immediate gameplay timing.** There are no delayed melee hit windows, new projectile origins, changed damage, new fire/reload intervals or new physics. Consequently this is not a claim of frame-exact impact synchronization with every world target.

The last thrown grenade may already have been removed from the belt: its visual ID remains through the open-hand release. The consumed model is hidden during release and the next held item draws from below, rather than cutting the gesture off or leaving a second grenade floating in the hand.

## Lifetime and limitations

Removed old rigs dispose deduplicated geometry/material/skeleton objects. On world teardown the new skeletons are disposed before the existing scene/material/texture disposer; the existing instanced-mesh disposer also releases the casing pool. New microdetail textures are reachable from scene materials, so the standard texture collector owns them. Loading remains deferred until entering a world; the menu does not generate rigs or terrain.

**No unit/browser/native/smoke/emulator/runtime/visual/audio runs or listening were performed for DEV14.** Only source inspection, source formatting, JS compilation and build-only APK/EXE packaging are authorized. Compilation does not verify shader execution, perfect contacts, absence of mesh penetration at all phases/aspect ratios, sound balance/synchronization, convincing anatomy, device performance or precise screen framing. Static socket/curve calibration is not a substitute for viewing the animation on the user's device. No AAA/mocap/photorealism or “perfectly verified” claim is made.
