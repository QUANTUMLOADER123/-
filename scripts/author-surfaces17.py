"""Original tileable ground/wood/stone PBR authoring. No game or tests executed.
Dependencies: numpy, Pillow. Coordinates/noise wrap in both axes.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import json,hashlib
R=Path(__file__).resolve().parents[1];N=1024;rng=np.random.default_rng(17083)
y,x=np.mgrid[0:N,0:N]/N

def noise(n):
    grid=rng.random((n,n));X=x*n;Y=y*n;i=X.astype(int);j=Y.astype(int);u=X-i;v=Y-j;u=u*u*(3-2*u);v=v*v*(3-2*v)
    return ((1-u)*grid[j%n,i%n]+u*grid[j%n,(i+1)%n])*(1-v)+((1-u)*grid[(j+1)%n,i%n]+u*grid[(j+1)%n,(i+1)%n])*v

macro=noise(7);medium=noise(43);fine=noise(256);grain=rng.random((N,N))
soil_h=.30*medium+.36*fine+.13*grain
pebbles=np.clip((noise(144)-.72)*6,0,1);soil_h+=pebbles*.30
soil=np.stack([.27+macro*.10,.23+macro*.085,.16+macro*.06],axis=-1)
soil+=(medium-.5)[...,None]*.10+(grain-.5)[...,None]*.055+pebbles[...,None]*np.array([.12,.115,.10])
# Long, irregular growth fibres, fine pores and widely separated knots.
warp=(noise(8)-.5)*.021+(noise(24)-.5)*.006
annual=np.sin(2*np.pi*(x*39+warp*28+np.sin(y*2*np.pi)*.8));fibres=np.sin(2*np.pi*(x*213+warp*73))
wood_h=.24*annual+.075*fibres+.065*fine
wood=np.stack([.39+.075*annual,.27+.053*annual,.16+.032*annual],axis=-1)
wood+=(macro-.5)[...,None]*.10+(fine-.5)[...,None]*.045
for cx,cy in [(0.22,.31),(.73,.77)]:
    dx=np.minimum(abs(x-cx),1-abs(x-cx));dy=np.minimum(abs(y-cy),1-abs(y-cy));d=np.sqrt((dx/.037)**2+(dy/.13)**2)
    knot=np.exp(-d*d*1.1);rings=np.sin(d*16)*np.exp(-d*d*.5);wood-=knot[...,None]*.11;wood+=rings[...,None]*.023;wood_h+=rings*.065
stone_h=medium*.50+fine*.19+grain*.035
veins=np.exp(-abs(np.sin(2*np.pi*(x*4+y*3+(macro-.5)*1.8)))*35)
stone=np.stack([.37+macro*.10,.38+macro*.09,.37+macro*.07],axis=-1);stone+=(medium-.5)[...,None]*.13;stone-=veins[...,None]*.10;stone_h-=veins*.07
manifest={'provenance':'Original procedural tileable surfaces authored for Oskol DEV17. No third-party photographs or game textures.','size':N,'files':{}}

def save_set(folder,kind,color,height,roughness,strength=4):
    folder.mkdir(parents=True,exist_ok=True)
    dx=(np.roll(height,-1,axis=1)-np.roll(height,1,axis=1))*strength;dy=(np.roll(height,-1,axis=0)-np.roll(height,1,axis=0))*strength
    normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
    orm=np.stack([np.clip(.93+height*.065,0,1),np.clip(roughness+.055*(fine-.5),0,1),np.zeros_like(dx)],axis=-1)
    for suffix,data in [('color',color),('normal',normal*.5+.5),('orm',orm)]:
        p=folder/f'{kind}-{suffix}.webp';Image.fromarray(np.uint8(np.clip(data,0,1)*255)).save(p,quality=95,method=6)
        manifest['files'][str(p.relative_to(R))]=hashlib.sha256(p.read_bytes()).hexdigest()

save_set(R/'web/assets/pbr12','soil',soil,soil_h,.92,3)
save_set(R/'web/assets/pbr12','wood',wood,wood_h,.83,3)
save_set(R/'web/assets/items16','wood',wood,wood_h,.79,3)
save_set(R/'web/assets/pbr12','stone',stone,stone_h,.94,4)
Image.fromarray(np.uint8(np.clip(wood,0,1)*255)).save(R/'web/assets/textures/wood.jpg',quality=94)
D=R/'web/assets/pbr12';D.mkdir(exist_ok=True);(D/'surfaces-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Authored 4 PBR sets (12 maps) and replacement legacy wood. No game execution.')
