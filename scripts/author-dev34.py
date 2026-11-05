"""Package original generated albedos as seamless PBR banks; source PNG cache is ignored."""
from pathlib import Path
import numpy as np,json,hashlib
from PIL import Image,ImageFilter
R=Path(__file__).resolve().parents[1];out=R/'web/assets/field34';out.mkdir(exist_ok=True);manifest={}
for source,name in [('meadow','meadow'),('gravel','gravel'),('salvaged-steel','steel'),('stock-wood','wood')]:
 p=R/f'.artifacts/dev34/{source}.png'
 if not p.exists():raise FileNotFoundError('Original generated source missing: '+str(p))
 im=Image.open(p).convert('RGB').resize((512,512),Image.Resampling.LANCZOS);a=np.array(im)/255
 # Periodic edge correction: spread the boundary difference smoothly across the tile.
 for axis in [0,1]:
  diff=np.take(a,-1,axis=axis)-np.take(a,0,axis=axis);weight=np.linspace(-.5,.5,512)
  a-=weight[:,None,None]*diff[None,:,:] if axis==0 else weight[None,:,None]*diff[:,None,:]
 a=np.clip(a,0,1);lum=a@np.array([.2126,.7152,.0722]);h=np.asarray(Image.fromarray(np.uint8(lum*255)).filter(ImageFilter.GaussianBlur(1.2)))/255;dx=(np.roll(h,-1,1)-np.roll(h,1,1))*.65;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*.65;n=np.stack([-dx,-dy,np.ones_like(h)],-1);n/=np.linalg.norm(n,axis=-1,keepdims=True)
 rust=(a[:,:,0]>a[:,:,2]*1.2)&(a[:,:,0]>a[:,:,1]*1.05);rough=np.where(rust,.98,.78) if name=='steel' else np.ones_like(h)*.96;metal=np.where(rust,.05,.24) if name=='steel' else np.zeros_like(h);orm=np.stack([np.ones_like(h),rough,metal],-1)
 for suffix,data in [('color',a),('normal',n*.5+.5),('orm',orm)]:
  file=out/f'{name}-{suffix}.webp';Image.fromarray(np.uint8(np.clip(data,0,1)*255)).save(file,quality=94,method=6);manifest[file.name]=hashlib.sha256(file.read_bytes()).hexdigest()
(out/'manifest.json').write_text(json.dumps({'source':'Original generated albedos, not extracted from Rust; sources in ignored .artifacts/dev34','method':'512px, periodic edge correction, subtle normal, roughness/metallic channels','files':manifest},indent=2)+'\n')
