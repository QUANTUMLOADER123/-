"""Update catalog progress and package all completed art, plus a batch preview.
python scripts/package-item-art.py --part 2 --items berries water bandage ...
Preparation/review tool only; requires Pillow and previously processed images.
"""
import argparse,json,math,subprocess,zipfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--part',type=int,required=True);parser.add_argument('--items',nargs='+',required=True);args=parser.parse_args()
work=ROOT/'.artifacts/item-art';work.mkdir(parents=True,exist_ok=True)
assets=ROOT/'web/assets/items';manifest=json.loads((assets/'manifest.json').read_text());ready=manifest['items']
items=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {ITEMS} from './src/survival/state.js';console.log(JSON.stringify(ITEMS))"],cwd=ROOT))
for key in args.items:
    if key not in ready:raise ValueError('Unprepared item: '+key)
pending=[i for i in items if i not in ready]
text='# Цветные предметные иконки ОСКОЛ\n\nГотово: **%d / %d**. Остальные пока используют прежнее оформление.\n\n'%(len(ready),len(items))
text+='Индивидуальная AI-генерация для проекта; не ассеты Facepunch. Прозрачный фон, lossless WebP 256×256, локальная загрузка без сети. Исходный магентовый фон удалён; RGB-фон не попадает в игру.\n\nОбработка: `python scripts/process-item-art.py .artifacts/item-art/raw` (Pillow, только для подготовки). Упаковка и превью: `python scripts/package-item-art.py --part N --items id ...`. Сборка игры не требует Python. `manifest.json` содержит контрольные суммы. Исходные большие PNG не включены в приложение.\n\nЕдиный стиль для следующих партий: отдельный предмет в трёхчетвертном ракурсе, реалистичная цветная игровая иллюстрация, мягкий студийный свет, читаемый силуэт, без текста/логотипов/рамки; чистый #ff00ff фон для удаления. Не лист вариантов.\n\n## Готово\n'
text+=''.join('- [x] `%s` — %s\n'%(i,items[i]['name']) for i in items if i in ready)
text+='\n## Осталось сгенерировать\n'+''.join('- [ ] `%s` — %s\n'%(i,items[i]['name']) for i in pending)
(assets/'README.md').write_text(text)
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def make_preview(keys,target,title):
    preview=Image.new('RGB',(1250,65+math.ceil(len(keys)/5)*248),'#20272b');draw=ImageDraw.Draw(preview)
    draw.text((24,15),title,font=ImageFont.truetype(fontpath,23),fill='#eee9d9')
    for n,i in enumerate(keys):
        x=10+n%5*248;y=55+n//5*248;draw.rounded_rectangle((x,y,x+238,y+237),radius=7,fill='#323a3e')
        im=Image.open(assets/(i+'.webp')).convert('RGBA');im.thumbnail((195,195));preview.paste(im,(x+(238-im.width)//2,y+6),im)
        label=items[i]['name'];size=17
        while True:
            font=ImageFont.truetype(fontpath,size);box=draw.textbbox((0,0),label,font=font)
            if box[2]-box[0]<226 or size<=11:break
            size-=1
        draw.text((x+(238-(box[2]-box[0]))/2,y+207),label,font=font,fill='#eee9d9')
    preview.save(target)
make_preview(args.items,work/f'preview-part{args.part}.png',f'ОСКОЛ · цветные предметы · партия {args.part} / 5')
make_preview([i for i in items if i in ready],work/'preview-all.png',f'ОСКОЛ · готово {len(ready)} / {len(items)} предметов')
archive=work/f'Oskol-colored-items-{len(ready)}-of-{len(items)}.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for i in ready:
        p=work/'transparent'/(i+'.png')
        if not p.exists():raise ValueError('Missing 1024px source: '+str(p))
        z.write(p,'PNG-1024/'+p.name);z.write(assets/(i+'.webp'),'Game-WebP-256/'+i+'.webp')
    for name in ['README.md','manifest.json']:z.write(assets/name,'Game-WebP-256/'+name)
    z.write(work/'preview-all.png','preview-all.png');z.write(work/f'preview-part{args.part}.png',f'preview-part{args.part}.png')
print(f'Packaged {len(ready)}/{len(items)} icons: {archive} ({archive.stat().st_size:,} bytes)')
