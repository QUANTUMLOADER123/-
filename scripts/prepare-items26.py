"""Offline packaging of the individually generated, USER-APPROVED-style icons.
No game imports/execution, browser, renderer, or tests. Pillow is authoring-only.
Usage: .venv-art/bin/python scripts/prepare-items26.py
Only .artifacts/items26/approved-raw is accepted by default: rejected styles stay out.
Does not change the live ITEM_ART registry until the complete catalog is ready.
"""
from pathlib import Path
import hashlib
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.artifacts/items26'
RAW = WORK / 'approved-raw'
OUT = ROOT / 'web/assets/items26'
OUT.mkdir(parents=True, exist_ok=True)
catalog = json.loads((OUT / 'catalog.json').read_text())
manifest_path = OUT / 'manifest.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {
    'schema': 1,
    'status': 'partial-not-live',
    'method': 'individual-ai-generation-with-user-approved-reference',
    'reference': 'style-reference.webp',
    'style': 'Muted hand-painted survival inventory, thin dark contour, soft wear patches, diagonal three-quarter orientation; not photographic or glossy.',
    'width': 256, 'height': 256, 'alpha': True,
    'items': {}
}
labels = {
    'metalBlade': 'Лезвие тесака', 'metalPipe': 'Полая труба',
    'metalCylinder': 'Газовый баллон', 'gears': 'Шестерня',
    'spring': 'Пружина', 'rifleBody': 'Корпус винтовки',
    'smgBody': 'Корпус ПП', 'semiBody': 'Полуавтоматический корпус',
    'metalSheet': 'Листовой металл', 'techParts': 'Электронная плата',
    'rope': 'Верёвка', 'sewingKit': 'Швейный набор',
    'tarp': 'Брезент', 'ductTape': 'Изолента',
    'highMetal': 'Высококачественный металл',
    'akRifle': 'Автомат АК', 'compactSmg': 'Компактный ПП',
    'antiseptic': 'Антисептик', 'traumaKit': 'Травмонабор',
    'wood': 'Древесина',
    'stone': 'Камень', 'metalOre': 'Железная руда',
    'sulfurOre': 'Серная руда', 'metal': 'Фрагменты металла',
    'sulfur': 'Сера', 'charcoal': 'Уголь',
    'gunpowder': 'Порох', 'fiber': 'Ткань',
    'scrap': 'Металлолом', 'berries': 'Ягоды',
    'water': 'Вода', 'bandage': 'Бинт',
    'axe': 'Топор', 'pickaxe': 'Кирка',
    'hammer': 'Строительная киянка', 'rifle': 'Самодельная винтовка',
    'ammo': 'Винтовочные патроны', 'satchel': 'Взрывной заряд',
    'armor': 'Кожаная броня', 'foundation': 'Фундамент',
    'wall': 'Стена', 'door': 'Вход с дверью',
    'roof': 'Крыша', 'campfire': 'Костёр',
    'furnace': 'Печь', 'workbench': 'Верстак',
    'battery': 'Аккумулятор', 'rock': 'Камень в руке',
    'torch': 'Факел', 'pistol': 'Пистолет',
    'revolver': 'Револьвер', 'smg': 'Пистолет-пулемёт',
    'shotgun': 'Помповый дробовик', 'assaultRifle': 'Штурмовая винтовка',
    'boltRifle': 'Болтовая винтовка', 'semiRifle': 'Полуавтоматическая винтовка',
    'heavyPistol': 'Тяжёлый пистолет', 'combatShotgun': 'Боевой дробовик',
    'machineGun': 'Пулемёт', 'rocketLauncher': 'Ракетница',
    'plan': 'Строительный план', 'storage': 'Малый ящик',
    'largeStorage': 'Большой ящик', 'pistolAmmo': 'Пистолетные патроны',
    'shells': 'Дробовые патроны', 'syringe': 'Шприц',
    'medkit': 'Аптечка', 'cannedFood': 'Консервы',
    'lowFuel': 'Топливо', 'highMetalOre': 'Богатая металлическая руда',
    'explosives': 'Взрывчатое вещество', 'rocket': 'Обычная ракета',
    'hvRocket': 'Скоростная ракета', 'incendiaryRocket': 'Зажигательная ракета',
    'timedCharge': 'Подрывной заряд', 'f1Grenade': 'Осколочная граната',
    'beancan': 'Самодельная граната', 'mushroom': 'Гриб',
    'pumpkin': 'Тыква', 'corn': 'Кукуруза',
    'meat': 'Сырое мясо', 'cookedMeat': 'Приготовленное мясо',
    'cupboard': 'Шкаф обслуживания', 'recycler': 'Переработчик',
    'repairBench': 'Ремонтный стол', 'triangleFoundation': 'Треугольный фундамент',
    'halfWall': 'Полустена', 'doorway': 'Дверной проём',
    'triangleRoof': 'Треугольная крыша', 'roofSlope': 'Скат крыши',
    'stairs': 'Лестница', 'ramp': 'Пандус',
    'clothCap': 'Тканевая кепка', 'woolHat': 'Вязаная шапка',
    'furHat': 'Меховая ушанка', 'leatherHelmet': 'Кожаный шлем',
    'salvageHelmet': 'Каска из лома', 'riotHelmet': 'Шлем штурмовика',
    'kevlarHelmet': 'Кевларовый шлем', 'ceramicHelmet': 'Композитный шлем',
    'clothBandana': 'Тканевая бандана', 'desertScarf': 'Пустынный шарф',
    'balaclava': 'Балаклава', 'snowMask': 'Северная маска',
    'leatherMask': 'Кожаная полумаска', 'weldMask': 'Сварочная маска',
    'kevlarMask': 'Кевларовая маска', 'steelMask': 'Стальная лицевая пластина',
    'ragShirt': 'Лоскутная рубаха', 'cottonShirt': 'Хлопковая футболка',
    'stripedShirt': 'Морская тельняшка', 'workShirt': 'Рабочая рубашка',
    'hoodie': 'Толстовка с капюшоном', 'fleeceShirt': 'Флисовая кофта',
    'combatShirt': 'Боевая рубашка', 'paddedShirt': 'Стёганый поддоспешник',
    'rainPoncho': 'Брезентовый пончо', 'travelCloak': 'Плащ странника',
    'winterCoat': 'Меховой плащ', 'scrapVest': 'Нагрудник из лома',
    'riotVest': 'Противоударный жилет', 'kevlarVest': 'Кевларовый бронежилет',
    'ceramicVest': 'Керамический плитник', 'ragPants': 'Лоскутные штаны',
    'linenPants': 'Льняные брюки', 'jeans': 'Плотные джинсы',
    'cargoPants': 'Брюки карго', 'winterPants': 'Зимние штаны',
    'leatherPants': 'Кожаные поножи', 'riotPants': 'Штурмовые поножи',
    'kevlarPants': 'Кевларовые поножи', 'clothWraps': 'Тканевые обмотки',
    'knitGloves': 'Вязаные перчатки', 'workGloves': 'Рабочие перчатки',
    'leatherGloves': 'Кожаные перчатки', 'winterGloves': 'Зимние рукавицы',
    'tacticalGloves': 'Тактические перчатки',
    'kevlarGloves': 'Кевларовые перчатки', 'steelGauntlets': 'Бронированные перчатки',
    'clothShoes': 'Тканевые башмаки', 'sandals': 'Кожаные сандалии',
    'sneakers': 'Кеды', 'workBoots': 'Рабочие ботинки',
    'leatherBoots': 'Кожаные сапоги', 'snowBoots': 'Зимние сапоги',
    'combatBoots': 'Боевые берцы', 'armoredBoots': 'Бронированные сапоги',
    'holoSight': 'Голографический прицел', 'reflexSight': 'Коллиматорный прицел',
    'scope4x': 'Прицел 4×', 'suppressor': 'Глушитель',
    'muzzleBrake': 'Дульный тормоз', 'flashHider': 'Пламегаситель',
    'laserSight': 'Лазерный целеуказатель', 'extendedMag': 'Увеличенный магазин'
}

for source in sorted(RAW.glob('*.png')):
    item = source.stem
    if item not in catalog:
        raise ValueError('Not a catalog item: ' + item)
    image = Image.open(source).convert('RGBA')
    # Key internal holes as well as outside. Transparent RGB is cleared before
    # resampling to keep chroma colour out of thumbnail edges.
    data = []
    for r, g, b, a in (getattr(image, 'get_flattened_data', None) or image.getdata)():
        if r > 100 and b > 90 and min(r, b) - g > 40:
            data.append((0, 0, 0, 0))
        else:
            data.append((r, g, b, a))
    image.putdata(data)
    bounds = image.getbbox()
    if bounds is None:
        raise ValueError('Empty source: ' + item)
    image = image.crop(bounds)
    # Honour explicit user-requested scale corrections after trimming the background.
    # Source padding alone would be lost when cropped to its object bounds.
    fit = manifest.get('fitBounds', {}).get(item, manifest.get('fitBounds', {}).get('default', 224))
    image.thumbnail((fit, fit), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (256, 256))
    canvas.alpha_composite(image, ((256-image.width)//2, (256-image.height)//2))
    destination = OUT / (item + '.webp')
    canvas.save(destination, 'WEBP', lossless=True, method=6, exact=True)
    manifest['items'][item] = {
        'file': destination.name, 'label': labels.get(item, item),
        'bytes': destination.stat().st_size, 'fitPx': fit,
        'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest()
    }

reference = WORK / 'reference/approved-style.png'
if reference.exists():
    image = Image.open(reference).convert('RGB')
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    image.save(OUT / 'style-reference.webp', 'WEBP', quality=88, method=6)
    manifest['referenceSha256'] = hashlib.sha256(reference.read_bytes()).hexdigest()

ready = [item for item in catalog if item in manifest['items']]
manifest['ready'] = len(ready)
manifest['total'] = len(catalog)
manifest['pending'] = [item for item in catalog if item not in manifest['items']]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

# A deliverable art sheet, not a game/visual test or screenshot.
font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font = ImageFont.truetype(font_path, 16)
heading = ImageFont.truetype(font_path, 22)
width, cell, cols = 1200, 236, 5
height = 75 + ((len(ready)+cols-1)//cols)*cell
sheet = Image.new('RGB', (width, max(height, 100)), '#252922')
draw = ImageDraw.Draw(sheet)
draw.text((20, 20), f'ОСКОЛ · выбранный стиль · {len(ready)} / {len(catalog)}', fill='#e0dfce', font=heading)
for n, item in enumerate(ready):
    x, y = 12+(n % cols)*cell, 65+(n//cols)*cell
    draw.rounded_rectangle((x, y, x+226, y+226), radius=5, fill='#3b3d34')
    icon = Image.open(OUT / (item+'.webp')).convert('RGBA')
    icon.thumbnail((184, 184), Image.Resampling.LANCZOS)
    sheet.paste(icon, (x+(226-icon.width)//2, y+5), icon)
    text = labels.get(item, item)
    size = 16
    while draw.textbbox((0, 0), text, font=font)[2] > 218 and size > 11:
        size -= 1
        font = ImageFont.truetype(font_path, size)
    draw.text((x+6, y+196), text, fill='#dfdfd1', font=font)
    font = ImageFont.truetype(font_path, 16)
sheet.save(WORK / 'approved-icons-progress.png', optimize=True)
archive = WORK / f'Oskol-approved-icons-{len(ready)}-of-{len(catalog)}.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for item in ready:
        z.write(OUT/(item+'.webp'), 'WebP-256/'+item+'.webp')
    z.write(manifest_path, 'manifest.json')
    z.write(OUT/'catalog.json', 'catalog.json')
    z.write(WORK/'approved-icons-progress.png', 'preview.png')
print(f'Prepared {len(ready)}/{len(catalog)} icons; {len(manifest["pending"])} pending.')
print('Game asset bytes:', sum(manifest['items'][i]['bytes'] for i in ready))
print('Archive:', archive.relative_to(ROOT))
