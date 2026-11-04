"""Prepare the selected AI key art, extract its actual lettering and make app icons.
Asset authoring only. Does not import or execute game code. Requires Pillow.
"""
from pathlib import Path
from PIL import Image,ImageFilter
import hashlib,json
R=Path(__file__).resolve().parents[1];D=R/'web/assets/branding17'
source=D/'oskol-logo.png';im=Image.open(source).convert('RGB')
im.save(D/'oskol-keyart.jpg',quality=92,optimize=True)
# The selected 1376x768 artwork has warm light letters on cool, dark sky.
# Retain the generated lettering itself, including fractures; no replacement font.
crop=im.crop((378,92,1002,363)).convert('RGBA');alpha=Image.new('L',crop.size);raw=crop.tobytes();mask=[]
for r,g,b,a in zip(raw[0::4],raw[1::4],raw[2::4],raw[3::4]):
    warm=max(0,min(1,((r+g)*.5-b-2)/9));light=max(0,min(1,(max(r,g,b)-42)/40));mask.append(round(255*warm*light))
alpha.putdata(mask);crop.putalpha(alpha);crop.save(D/'wordmark.webp',lossless=True)
# App mark is the fractured first O from the same selected artwork.
letter=crop.crop((9,17,133,263));letter.thumbnail((220,394),Image.Resampling.LANCZOS)
icon=Image.new('RGBA',(512,512),'#101d24');icon.alpha_composite(letter,((512-letter.width)//2,(512-letter.height)//2))
icon.convert('RGB').save(R/'desktop/icon.png');icon.save(R/'desktop/icon.ico',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
for n in [192,512]:icon.resize((n,n),Image.Resampling.LANCZOS).save(D/f'icon-{n}.png')
android=R/'android/app/src/main/res/drawable-nodpi';android.mkdir(exist_ok=True);icon.save(android/'oskol_mark17.png')
manifest={'source':'User-selected AI generation, option 1. Original Oskol key art; not a game screenshot.','title':'ОСКОЛ','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in D.iterdir() if p.suffix in ['.png','.jpg','.webp']}}
(D/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Prepared selected key art, extracted wordmark and app icons. No game execution.')
