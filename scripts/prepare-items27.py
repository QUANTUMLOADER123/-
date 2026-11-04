"""Offline asset authoring only: key/resize the DEV27 approved-reference sleeping bag.
Does not load the game, renderer, or tests; keeps all 155 DEV26 images untouched.
Run: .venv-art/bin/python scripts/prepare-items27.py
"""
from pathlib import Path
import hashlib
import json
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
source = ROOT / '.artifacts/items27/sleepingBag-raw.png'
out = ROOT / 'web/assets/items27'
out.mkdir(parents=True, exist_ok=True)
image = Image.open(source).convert('RGBA')
data = []
for r, g, b, a in (getattr(image, 'get_flattened_data', None) or image.getdata)():
    data.append((0, 0, 0, 0) if r > 100 and b > 90 and min(r, b)-g > 40 else (r, g, b, a))
image.putdata(data)
bounds = image.getbbox()
if bounds is None:
    raise ValueError('Empty sleeping bag source')
image = image.crop(bounds)
image.thumbnail((224, 224), Image.Resampling.LANCZOS)
canvas = Image.new('RGBA', (256, 256))
canvas.alpha_composite(image, ((256-image.width)//2, (256-image.height)//2))
destination = out / 'sleepingBag.webp'
canvas.save(destination, 'WEBP', lossless=True, method=6, exact=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = {'schema': 1, 'status': 'integrated-dev27', 'method': 'individual-ai-generation-with-user-approved-reference',
            'reference': '../items26/style-reference.webp',
            'referenceSha256': sha(ROOT / '.artifacts/items26/reference/approved-style.png'),
            'width': 256, 'height': 256, 'alpha': True,
            'items': {'sleepingBag': {'file': destination.name, 'label': 'Спальный мешок', 'fitPx': 224,
                                    'bytes': destination.stat().st_size, 'sha256': sha(destination), 'sourceSha256': sha(source)}}}
(out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
registry = ROOT / 'src/survival/item-art.js'
text = registry.read_text()
line = '  "sleepingBag": "assets/items27/sleepingBag.webp?v='+sha(destination)[:10]+'",\n'
if '"sleepingBag":' not in text:
    registry.write_text(text.replace('export const ITEM_ART=Object.freeze({\n', 'export const ITEM_ART=Object.freeze({\n'+line))
print(destination, destination.stat().st_size)
