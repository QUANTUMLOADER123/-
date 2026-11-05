"""Prepare original generated ground albedos, not extracted game assets. Pillow/numpy authoring only."""
from pathlib import Path
import numpy as np, json, hashlib
from PIL import Image,ImageFilter
R=Path(__file__).resolve().parents[1];out=R/'web/assets/ground39';out.mkdir(exist_ok=True);files={}
for name in ['turf','loam']:
 im=Image.open(R/f'.artifacts/dev39/{name}.png').convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS)
 a=np.asarray(im,dtype=float)/255
 # Poisson periodic/smooth decomposition (not stretched edge pixel differences,
 # which create horizontal/vertical stripes and a visible grid at distance).
 v=np.zeros_like(a);v[0]=a[-1]-a[0];v[-1]=-v[0];v[:,0]+=a[:,-1]-a[:,0];v[:,-1]-=a[:,-1]-a[:,0]
 freq=np.cos(2*np.pi*np.arange(1024)/1024);den=2*freq[:,None]+2*freq[None,:]-4;den[0,0]=1
 smooth=np.fft.ifft2(np.fft.fft2(v,axes=(0,1))/den[:,:,None],axes=(0,1)).real
 a-=smooth
 a=np.clip(a,0,1)
 if name=='turf':a=np.clip(a*np.array([1.02,1.10,.91]),0,1)
 color=Image.fromarray(np.uint8(a*255));height=color.resize((512,512),Image.Resampling.LANCZOS).convert('L').filter(ImageFilter.GaussianBlur(.6));h=np.asarray(height)/255
 dx=(np.roll(h,-1,1)-np.roll(h,1,1))*.24;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*.24;n=np.stack([-dx,-dy,np.ones_like(h)],-1);n/=np.linalg.norm(n,axis=-1,keepdims=True)
 for suffix,image in [('color',color),('normal',Image.fromarray(np.uint8((n*.5+.5)*255)))]:
  p=out/f'{name}-{suffix}.webp';image.save(p,quality=94,method=6);files[p.name]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'width':image.width,'height':image.height}
(out/'manifest.json').write_text(json.dumps({'source':'Original AI-generated material scan style albedos; not Rust/Facepunch assets','processing':'Poisson periodic/smooth decomposition, 1024px albedo, subtle 512px normal; runtime mipmaps','files':files},indent=2)+'\n')
