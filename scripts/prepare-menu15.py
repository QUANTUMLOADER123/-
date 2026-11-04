"""Author the DEV15 night illustration for shipping, not a game/runtime check.
Usage: .venv-art/bin/python scripts/prepare-menu15.py input.png output.jpg
The large AI source stays outside Git; only the compressed authored image ships.
"""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
args = parser.parse_args()
image = ImageOps.exif_transpose(Image.open(args.source)).convert('RGB')
# Suppress ambient/armor exposure while preserving tiny green NVG points and laser lines.
pixels = []
data = image.tobytes()
for r, g, b in zip(data[0::3], data[1::3], data[2::3]):
    green = max(0.0, min(1.0, (g - max(r, b) * 1.15) / 18.0))
    ambient = tuple(round(255 * (c / 255) ** 1.08 * .72) for c in (r, g, b))
    pixels.append(tuple(round(a * (1 - green) + c * green) for a, c in zip(ambient, (r, g, b))))
image.putdata(pixels)
args.destination.parent.mkdir(parents=True, exist_ok=True)
image.save(args.destination, 'JPEG', quality=94, subsampling=0, optimize=True)
print(f'Authored {args.destination}: {image.width}x{image.height}, {args.destination.stat().st_size} bytes')
