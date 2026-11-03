"""Offline asset authoring, NOT a runtime/test. Requires Pillow + numpy.
Optional --source-dir contains six original AI diffuse inputs. With no inputs,
rebuild normal/ORM maps deterministically from the committed albedo WebPs.
The derived relief/roughness are artistic approximations, not measured scans.
"""
import argparse, json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
p=argparse.ArgumentParser();p.add_argument('--source-dir',type=Path);p.add_argument('--output',type=Path,default=Path('web/assets/pbr12'));a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
materials=['wood','stone','metal','concrete','soil','asphalt']
def blur(v,r):return np.asarray(Image.fromarray(np.uint8(np.clip(v,0,1)*255)).filter(ImageFilter.GaussianBlur(r)),dtype=np.float32)/255
for name in materials:
 albedo=a.output/(name+'-color.webp')
 if a.source_dir:
  im=Image.open(a.source_dir/(name+'.png')).convert('RGB');s=min(im.size);im=im.crop(((im.width-s)//2,(im.height-s)//2,(im.width+s)//2,(im.height+s)//2)).resize((1024,1024),Image.Resampling.LANCZOS)
  v=np.asarray(im,dtype=np.float32);shift=np.roll(v,512,axis=1);x=np.arange(1024)/1024;weight=np.exp(-np.minimum(x,1-x)**2/.004)[:,None]
  # Blend opposite quadrants at the tile edges; retain most original texture detail.
  v=v*(1-weight[None,:,:])+shift*weight[None,:,:];shift=np.roll(v,512,axis=0);v=v*(1-weight[:,None,:])+shift*weight[:,None,:]
  # Match the very last/first pixels exactly to prevent mipmap seams.
  edge=(v[0]+v[-1])/2;v[0]=v[-1]=edge;edge=(v[:,0]+v[:,-1])/2;v[:,0]=v[:,-1]=edge
  Image.fromarray(np.uint8(v)).save(albedo,quality=91,method=6)
 rgb=np.asarray(Image.open(albedo).convert('RGB'),dtype=np.float32)/255;luma=rgb@np.array([.2126,.7152,.0722],dtype=np.float32)
 low=blur(luma,3);detail=luma-blur(luma,1.2);height=np.clip(low*.65+detail*.6,0,1)
 if name=='metal':
  x=np.arange(1024)/1024;corrugation=(np.sin(x*2*np.pi*16)*.5+.5)[None,:];height=height*.3+corrugation*.35
 strength={'wood':3.5,'stone':5.0,'metal':3.8,'concrete':2.8,'soil':3.1,'asphalt':2.2}[name]
 dx=(np.roll(height,-1,1)-np.roll(height,1,1))*strength;dy=(np.roll(height,-1,0)-np.roll(height,1,0))*strength
 n=np.stack([-dx,dy,np.ones_like(dx)],axis=-1);n/=np.maximum(np.linalg.norm(n,axis=-1,keepdims=True),1e-6);normal=np.uint8(np.clip(n*.5+.5,0,1)*255)
 Image.fromarray(normal).save(a.output/(name+'-normal.webp'),lossless=True,method=6)
 cavity=np.clip((luma-low)*2,-.2,.1);ao=np.clip(.94+cavity,.65,1)
 rough=np.clip({'wood':.84,'stone':.91,'metal':.43,'concrete':.9,'soil':.96,'asphalt':.83}[name]+(1-luma)*.1+detail*.4,.18,1)
 metal=np.zeros_like(luma)
 if name=='metal':
  rust=np.clip((rgb[:,:,0]-rgb[:,:,2]-.025)*5,0,1);metal=.84*(1-rust);rough=np.clip(rough+rust*.4,.22,.96)
 orm=np.stack([ao,rough,metal],axis=-1);Image.fromarray(np.uint8(orm*255)).resize((512,512),Image.Resampling.LANCZOS).save(a.output/(name+'-orm.webp'),lossless=True,method=6)
manifest=[{'file':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in sorted(a.output.glob('*.webp'))]
(a.output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Authored',len(manifest),'material maps;',sum(f['bytes'] for f in manifest),'bytes')
