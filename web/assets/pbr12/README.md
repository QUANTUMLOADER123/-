# Original material library · DEV12 · 2026-11-04

Six original AI-generated diffuse sources were authored specifically for Oskol: weathered timber boards, irregular fieldstone masonry, corrugated zinc with localized rust, porous concrete, mossy forest earth, and unmarked aged asphalt. No Rust/Facepunch imagery was copied. These are synthesized artwork, **not photographs, photogrammetry, measured materials or certified PBR scans**.

## Shipped maps

Each material has three WebP files (18 maps, 16,888,310 bytes altogether):

- `*-color.webp`: 1024 × 1024, sRGB, edge-blended tileable diffuse artwork, quality 91.
- `*-normal.webp`: 1024 × 1024, lossless, linear data, OpenGL tangent-space convention. Relief is **estimated artistically from the diffuse image**, with additional periodic corrugation for metal. It is not a recovered geometric scan.
- `*-orm.webp`: 512 × 512, lossless linear data. R = conservative cavity/AO approximation, G = artistic roughness, B = metal mask (zero on nonmetals; attenuated at reddish rust on zinc).

The AO is texture-scale cavity shading, not screen-space or geometry-based AO. Materials remain Three.js MeshStandardMaterial with image-based lighting; rain changes their roughness and tint. Normal/ORM maps must **not** be marked as sRGB.

`manifest.json` lists exact shipped file hashes/sizes. `sources.json` records hashes and descriptions of the six raw generation inputs. Large original PNG working files remain outside Git in ignored `.artifacts/dev12/raw/`. Final diffuse maps are committed; reproducing a new AI generation is not deterministic.

## Offline authoring

Authoring only, not a build/runtime dependency and not a test:

```sh
python -m venv .venv-art
.venv-art/bin/pip install Pillow==13.0.0 numpy==2.4.6
# Re-derive normal and ORM maps from the committed albedo:
.venv-art/bin/python scripts/author-materials12.py
# To author the albedos again, supply the original six PNG inputs:
.venv-art/bin/python scripts/author-materials12.py --source-dir .artifacts/dev12/raw
```

Periodic edge blending, luminance-derived relief, wrapping finite differences, material-specific roughness and the rust mask are implemented in that script. Standard `npm run build` does not need Python and does not regenerate images.

## Integration and limits

- Low graphics downsamples new 1024 maps to 512 on entry; the other modes keep 1024. Switching texture resolution requires re-entering the island. ORM is always 512.
- Terrain blends earth/rock/sand/snow using world-space detail, slope, height and the existing biome attribute. It does not move terrain vertices or change collisions/save layout. Rock/sand and bark also use the **existing attributed BabylonJS CC BY 4.0 assets**, whose licenses remain in `../credits.html` and `../licenses/`.
- Terrain triplanar projection is used for rock diffuse on medium/high; detail normals are tangent-space approximations, not full triplanar normal reconstruction.
- Rain uses a local 80 × 80, 48 m height field for terrain/water/floors/roofs; rotated walk floors are footprint-tested. Static RT roof bounds are conservative AABBs. Small openings, sloped/intersecting roofs and moving occluders are approximate, not traced per drop. Outside this local field, the wetness shader does not resolve shelter.
- Water has analytic animated micro-wave normals, transparent shallows, depth tint and coastal foam from a 512² approximate bed field. There is no new wave physics, refraction pass, SSR, ray tracing or volumetric fog.
- High quality additionally renders a 512 px-wide planar **sea-level** reflection (height aspect-limited to 256–768), scheduled about every 180 ms or on significant camera motion, while the camera is 0.15–35 m above sea level and float rendering is supported. Rivers use sky/Fresnel shading, not a separate correctly elevated planar reflection. This costs an extra scene render; performance has not been measured.
- Procedural clouds are layered noise with approximate self-shading, not ray-marched volumetric clouds. Sky-only PMREM updates are rate-limited and respond to weather/daylight. Bloom is subtle and restricted to high quality + maximum AA + float-buffer support.

**No game, browser, GPU/visual, native, emulator or audio tests/runs were performed for DEV12. JS compilation and platform packaging do not validate GLSL on the user's device, appearance, rain occlusion, reflection artifacts, physics or FPS.**

## DEV17 surface replacements

Soil, stone and wood now use original procedural 1024px color/normal/ORM maps,
not the previous source textures for those surfaces. Item wood is also 1024px;
other DEV16 item surfaces remain 256px. Authoring: `scripts/author-surfaces17.py`;
current replacement hashes/provenance: `web/assets/pbr12/surfaces-manifest.json`.
Legacy surface manifests were refreshed for the replaced files. No game/render
checks were performed.
