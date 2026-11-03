# DEV07 — recorded audio, not synthesizer gunshots

**90 individual mono PCM16 / 44.1 kHz clips, about 2.5 MB encoded.** All downloaded original media are CC0. No Facepunch audio, no extracted commercial game assets. App plays these files offline; there are no requests to audio providers at runtime.

## Sources and edits

| Output groups | Original author and recording | License / original publication |
| --- | --- | --- |
| pistol | Walther PPQ, X_39P | Ben Jaszczak, Brian Nelson, Kevin Heras, Matthew Nanney — [The Free Firearm Sound Library](https://opengameart.org/content/the-free-firearm-sound-library), CC0 |
| heavy-pistol | 1911, A_34P | same library, CC0 |
| revolver | Smith & Wesson 642, V_22P | same library, CC0 |
| assault | AK-47, C_28P | same library, CC0 |
| smg | Carl Gustav M45, G_31P | same library, CC0 |
| marksman | SKS, U_14P | same library, CC0 |
| bolt | Mosin Nagant, M_21P | same library, CC0 |
| shotgun | Benelli Nova, O_21P | same library, CC0 |
| reload-rifle / reload-pistol / pump | assaultriflereload1, gunreload1, shotguncock | [SpringySpringo, Gun reload sounds](https://opengameart.org/content/gun-reload-sounds), CC0; handling recordings are **airsoft**, not a live-fire reload |
| step-grass / step-stone / step-wood / step-snow | footstep_grass, footstep_concrete, footstep_wood, footstep_snow | [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds), CC0 |
| hit-wood / hit-metal / hit-barrel / hit-stone / door / drop-wood / rustle / cloth / hurt / click / debris | corresponding impact_wood_heavy, impact_metal_medium, impact_tin_medium, impact_mining, impact_plank_medium, impact_wood_light, footstep_carpet, impact_soft_medium, impact_punch_medium, impact_generic_light, impact_plate_heavy | same Kenney pack, CC0 |
| explosion | cannon_01, cannon_02 | [rubberduck, 25 CC0 bang / firework SFX](https://opengameart.org/content/25-cc0-bang-firework-sfx), CC0; recorded firework/cannon bangs, **not military explosive recordings** |

Each output retains its source filename, cut times, original blob and SHA-256 in `recorded07/manifest.json`. Cuts are converted to mono, resampled with a polyphase low-pass, DC-cleaned/high-passed at 38 Hz, peak-normalized and faded only at the boundaries. Attack transients and original outdoor tails are retained; there is no synthesizer replacing the shot. No code or prepared derivatives from unrelated games are reused.

Downloads use pinned GitHub mirrors of the original packs, not unrestricted remote URLs. The source manifest in the repository is `scripts/audio07-sources.json`; it includes mirror repository, immutable revision, original path, blob SHA and SHA-256. Sources are cached under ignored `.artifacts/audio07/sources`, **not bundled into the APK/EXE**. The full original recordings are large; only the edited clips ship.

- Firearm mirror: [buddingmonkey/FreeFirearmsSFXLibrary](https://github.com/buddingmonkey/FreeFirearmsSFXLibrary), revision `beb2f4041f3d6740fa0aeaf0e71159bd65a78c1b`.
- Kenney mirror + CC0 legal text: [Boyquotes/kenney-impact-sounds-for-godot](https://github.com/Boyquotes/kenney-impact-sounds-for-godot), revision `999dd1684873f8b020a3aa5b26e713da21688924`.
- Original reload files mirrored at `fighter-435/Break-the-Battle-Formation`, revision `cc899ce7e9eeb2e127d677b24f0bc2420452142c`, `sci-fi-fps/assets/audios/Gun reload sounds/1/`. No game code/assets from that repository are used otherwise.
- Original cannon files mirrored at `VSHT3/goorcs`, revision `e623405157f81faa0d49176200f1f42a067364c5`, `assets/audio/sfx/`. No game code/assets from that repository are used otherwise.

## In-game adaptations and honest limits

Fictional game weapons share the nearest recording family; not every model is an exact recording of its real-world counterpart. Machine gun uses a slightly lower-pitched AK shot. The launcher uses a processed recorded cannon bang and metal handling, not an authentic RPG launch recording. Metal steps combine a concrete boot take with a quiet metal resonance. Landing combines a boot and a soft recorded impact. Door sounds are plank/metal impact plus a latch-like mechanism, not a continuous physical hinge simulation. There are no invented claims that all these effects were recorded by the game author.

No repeated electronic beeps for pickups/crafting, no oscillating wind hiss, and no procedural-noise fallback when a sample is still loading. Initial decode is asynchronous; stale late events are discarded instead of sounding out of sync. Master / effects / footsteps volume, non-repeating variants, 24-voice limit, fade-out when stealing voices, compressor, distance low-pass and stereo panning are implemented in `src/survival/audio.js`.

## Rebuilding (asset authoring, not game tests)

```sh
python -m venv /home/user/.venv-audio07
/home/user/.venv-audio07/bin/pip install numpy scipy soundfile
/home/user/.venv-audio07/bin/python scripts/prepare-audio07.py --fetch
```

The build does not need Python or internet audio downloads. Historical `scripts/make-sounds05.py` is obsolete and is not called by builds. No gameplay/browser/native/audio-device tests were run for DEV07, as requested. Offline waveform editing is asset preparation, not an in-game listening or device-loudness check.
