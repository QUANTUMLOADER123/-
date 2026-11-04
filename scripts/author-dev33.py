"""Deterministic original granite PBR and reference-generated icon alpha packaging."""
from pathlib import Path
import numpy as np,json,hashlib,argparse,sys
from PIL import Image,ImageFilter
from scipy.ndimage import gaussian_filter,label
R=Path(__file__).resolve().parents[1];parser=argparse.ArgumentParser();parser.add_argument('--rocks-only',action='store_true');args=parser.parse_args();sources=sorted((R/'.artifacts/dev33/icons').glob('*.png'));
if not args.rocks_only and len(sources)!=10:raise FileNotFoundError('Ten original PNG icons are required in the ignored .artifacts/dev33/icons cache; use --rocks-only to rebuild granite alone.')
rng=np.random.default_rng(33041);N=512;y,x=np.mgrid[:N,:N]/N
noise=lambda sigma:gaussian_filter(rng.random((N,N)),sigma,mode='wrap')
def norm(a):return (a-a.min())/(a.max()-a.min())
macro=norm(noise(22));mineral=norm(noise(1.4));grain=rng.random((N,N));a=.26+.18*macro+.10*mineral+.05*(grain-.5)
# Non-orthogonal natural mineral veins, not brick courses or rectangular mortar.
vein=np.exp(-((np.sin(x*17+y*9+macro*5)+np.sin(x*8-y*14+macro*3))/.12)**2)
quartz=np.clip((mineral-.64)*4,0,1);mica=np.clip((.36-mineral)*4,0,1)
color=np.stack([a*.98,a,a*1.01],-1)+quartz[...,None]*.14-mica[...,None]*.12-vein[...,None]*.035
height=macro*.10+mineral*.08+grain*.025-vein*.014;dx=(np.roll(height,-1,1)-np.roll(height,1,1))*2;dy=(np.roll(height,-1,0)-np.roll(height,1,0))*2;normal=np.stack([-dx,-dy,np.ones_like(dx)],-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
out=R/'web/assets/nature33';out.mkdir(exist_ok=True)
files={}
for kind,data in [('color',color),('normal',normal*.5+.5),('orm',np.stack([np.ones_like(a),np.ones_like(a)*.93,np.zeros_like(a)],-1))]:
 p=out/f'granite-{kind}.webp';Image.fromarray(np.uint8(np.clip(data,0,1)*255)).save(p,quality=95,method=6);files[p.name]=hashlib.sha256(p.read_bytes()).hexdigest()
(out/'manifest.json').write_text(json.dumps({'license':'Original procedural granite, DEV33; no masonry pattern','files':files},indent=2)+'\n')
if args.rocks_only:sys.exit(0)
items={};out=R/'web/assets/items33';out.mkdir(exist_ok=True)
for src in sources:
 im=Image.open(src).convert('RGB');a=np.asarray(im);white=a.min(2)>211;components,_=label(white);border=np.unique(np.concatenate([components[0],components[-1],components[:,0],components[:,-1]]));bg=white if src.stem in ['bearingSet','copperWire'] else np.isin(components,border[border!=0]);alpha=Image.fromarray(np.uint8(~bg)*255).filter(ImageFilter.GaussianBlur(.45));rgba=im.convert('RGBA');rgba.putalpha(alpha);box=alpha.getbbox();rgba=rgba.crop(box);rgba=rgba.rotate(-24,resample=Image.Resampling.BICUBIC,expand=True) if src.stem=='berryJuice' else rgba;rgba.thumbnail((224,224),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(256,256));canvas.alpha_composite(rgba,((256-rgba.width)//2,(256-rgba.height)//2));p=out/(src.stem+'.webp');canvas.save(p,lossless=True,method=6);items[src.stem]={'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'manifest.json').write_text(json.dumps({'reference':'.artifacts/items26/reference/approved-style.png','method':'individual generation, border-connected alpha extraction','items':items},indent=2)+'\n')
