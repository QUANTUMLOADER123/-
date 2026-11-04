"""Package generated building photos; restore nature separately. Original image derivatives."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image,ImageFilter
R=Path(__file__).resolve().parents[1];files={}
for kind,src,metal in [('metal','material-metal.png',.65),('stone','material-brick.png',0)]:
 im=Image.open(R/'.artifacts/dev32'/src).convert('RGB').resize((512,512),Image.Resampling.LANCZOS)
 a=np.asarray(im).astype(float)/255
 # Smooth periodic crossfade at borders, rather than assuming generator tileability.
 for axis in [0,1]:
  a=np.swapaxes(a,0,axis)
  for i in range(24):
   weight=(24-i)/24*.5;lo=a[i].copy();hi=a[-1-i].copy();a[i]=lo*(1-weight)+hi*weight;a[-1-i]=hi*(1-weight)+lo*weight
  a=np.swapaxes(a,0,axis)
 h=np.asarray(Image.fromarray(np.uint8(a.mean(2)*255)).filter(ImageFilter.GaussianBlur(1))).astype(float)/255
 dx=(np.roll(h,-1,1)-np.roll(h,1,1))*.75;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*.75
 normal=np.stack([-dx,-dy,np.ones_like(h)],-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
 orm=np.stack([np.ones_like(h),np.ones_like(h)*.91,np.ones_like(h)*metal],-1)
 for suffix,data in [('color',a),('normal',normal*.5+.5),('orm',orm)]:
  p=R/'web/assets/pbr12'/f'{kind}-{suffix}.webp';Image.fromarray(np.uint8(np.clip(data,0,1)*255)).save(p,quality=93,method=6);files[str(p.relative_to(R))]=hashlib.sha256(p.read_bytes()).hexdigest()
im=Image.open(R/'.artifacts/dev32/cactus-flesh.png').convert('RGB');a=np.asarray(im).astype(float);bg=np.median(np.concatenate([a[:10].reshape(-1,3),a[-10:].reshape(-1,3),a[:,:10].reshape(-1,3),a[:,-10:].reshape(-1,3)]),axis=0);alpha=np.clip((np.linalg.norm(a-bg,axis=-1)-18)/28,0,1);rgba=np.dstack([a,alpha*255]).astype('uint8');im=Image.fromarray(rgba);bbox=im.getchannel('A').getbbox();im=im.crop(bbox);im.thumbnail((208,208),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(256,256));canvas.alpha_composite(im,((256-im.width)//2,(256-im.height)//2));p=R/'web/assets/items32/cactusFlesh.webp';p.parent.mkdir(exist_ok=True);canvas.save(p,lossless=True,method=6);files[str(p.relative_to(R))]=hashlib.sha256(p.read_bytes()).hexdigest()
(R/'web/assets/nature32/manifest.json').write_text(json.dumps({'naturalSource':'670e112: original DEV28 stone PBR; rockyGround textures unchanged','buildingImages':'AI-generated source images; periodic edge blending; derived luminance normals, not measured photogrammetry','iconReference':'.artifacts/items26/reference/approved-style.png','files':files},indent=2)+'\n')
