# DEV16 original item/vehicle surfaces and icons

Original offline-authored assets for Oskol; no extracted Rust/Facepunch art, scanned cars, downloaded weapon models or additional third-party packs.

- Nine periodic 256×256 PBR sets: steel, wood, polymer, cloth, rust, paint, rubber, brass, organic. `*-color.webp` is sRGB; normal/ORM are linear data. ORM = red ambient occlusion, green roughness, blue metalness. Authoring: `scripts/author-items16.py`; SHA-256 per surface in `manifest.json`.
- Four individually colored, transparent inventory illustrations: AK-47, compact SMG, antiseptic, trauma kit. Original SVG plus lossless WebP. Inventory provenance and hashes are also recorded in the complete `../items/manifest.json`. These four are authored vectors, **not AI-generated images**.
- 3D geometry is authored in `src/survival/items16.js` / `vehicles16.js`; textures are shared, movable mechanisms are not baked into the static receiver, and car geometry is cached by world.

Regenerate assets without importing/executing the game:

```sh
.venv-art/bin/python scripts/author-items16.py
```

Builds consume shipped WebP files and do not require Python, Pillow or resvg. Asset preparation is not a visual/gameplay test.
