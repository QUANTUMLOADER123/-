"""Deterministic offline media authoring only. No renderer, game, tests or audio playback.
Original seamless log/brick/rusted-pipe/HQM PBR, per-gun steel finishes and CC0 recording edits.
Requires numpy, Pillow, scipy, soundfile. Rebuild also recreates the DEV17 source surfaces.
"""
from pathlib import Path
import runpy,json,hashlib,re
import numpy as np
from PIL import Image
from scipy.signal import butter,sosfilt,resample_poly
import soundfile as sf
R=Path(__file__).resolve().parents[1]
a=runpy.run_path(str(R/'scripts/author-surfaces17.py'))
x,y,N=a['x'],a['y'],a['N'];noise=a['noise'];fine=a['fine'];grain=a['grain']
manifest={'license':'CC0-1.0','author':'Oskol original deterministic surface authoring','files':{},'audio':{}}
def record(p):manifest['files'][str(p.relative_to(R))]=hashlib.sha256(p.read_bytes()).hexdigest()
def save(kind,color,height,rough,metal=0):
 folder=R/'web/assets/pbr12';dx=(np.roll(height,-1,axis=1)-np.roll(height,1,axis=1))*4;dy=(np.roll(height,-1,axis=0)-np.roll(height,1,axis=0))*4
 norm=np.stack([-dx,-dy,np.ones_like(height)],axis=-1);norm/=np.linalg.norm(norm,axis=-1,keepdims=True)
 orm=np.stack([np.clip(.83+height*.16,0,1),np.clip(np.zeros_like(height)+rough,0,1),np.clip(np.zeros_like(height)+metal,0,1)],axis=-1)
 for suffix,data in [('color',color),('normal',norm*.5+.5),('orm',orm)]:
  p=folder/f'{kind}-{suffix}.webp';Image.fromarray(np.uint8(np.clip(data,0,1)*255)).save(p,quality=94,method=6);record(p)
# Rounded horizontal timbers, sealed chinking, long fibres and narrow drying splits.
t=(y*15)%1;roundness=np.sqrt(np.clip(1-(t*2-1)**2,0,1));fibres=np.sin(y*2*np.pi*387+(noise(8)-.5)*13)
h=.55*roundness+.025*fibres+.04*fine
wood=np.array([.29,.215,.145])[None,None,:]+roundness[...,None]*np.array([.125,.100,.070])+(fibres*.015+noise(12)*.025+grain*.018)[...,None]
wood*=np.where((t<.035)|(t>.965),.42,1)[...,None]
save('wood',wood,h,.88)
# Staggered gray brick courses; no muddy yellow stone tint.
row=(y*8).astype(int);bx=(x*5+(row%2)*.5)%1;by=(y*8)%1
edge=np.minimum.reduce([bx,1-bx,by,1-by]);brick=np.clip((edge-.018)/.04,0,1)
h=.60*brick+.055*fine+.025*grain
c=.33+.13*brick+(noise(32)-.5)*.065+(grain-.5)*.025
stone=np.stack([c*.985,c,c*1.015],axis=-1);save('stone',stone,h,.95)
# Orange/red rusty vertical reclaimed pipes with collars, pitting and exposed gray steel.
px=(x*12)%1;bulge=np.sqrt(np.clip(1-(px*2-1)**2,0,1));rust=np.clip((noise(12)*.6+noise(57)*.4-.16)*1.6,0,1)
collar=np.exp(-((np.minimum((y*4)%1,1-(y*4)%1))/.045)**2)
h=.60*bulge+.18*collar+.05*fine
base=np.array([.43,.455,.46])[None,None,:];rcol=np.array([.59,.235,.095])[None,None,:]
metal=(base*(1-rust[...,None])+rcol*rust[...,None])*(.63+.36*bulge[...,None])+(noise(64)-.5)[...,None]*.065
metal*=1-collar[...,None]*.2;save('metal',metal,h,.70+rust*.22,.82-rust*.63)
# Neutral gray armoured panels, welded seams and four recessed fastening heads per panel.
u=(x*2)%1;v=(y*2)%1;edge=np.minimum.reduce([u,1-u,v,1-v]);plate=np.clip((edge-.012)/.018,0,1)
bolts=np.zeros_like(x)
for cx in [.06,.94]:
 for cy in [.06,.94]:bolts=np.maximum(bolts,np.clip((.025-np.hypot(u-cx,v-cy))/.006,0,1))
h=.56*plate+.15*bolts+.012*fine
c=(.31+.085*plate+(noise(16)-.5)*.025+(grain-.5)*.012)*(1-bolts*.23)
save('hqm',np.stack([c*.98,c,c*1.025],axis=-1),h,.63,.88)
# Muted meadow-compatible soil; terrain and resource IDs remain unchanged.
p=R/'web/assets/pbr12/soil-color.webp';old=np.asarray(Image.open(p).convert('RGB'))/255
soil=old*.60+np.array([.245,.275,.205])[None,None,:]*.40
Image.fromarray(np.uint8(np.clip(soil,0,1)*255)).save(p,quality=94,method=6);record(p)
ids=re.findall(r'^ ([a-zA-Z0-9]+):\{', (R/'src/survival/weapon-profiles29.js').read_text(),re.M)
folder=R/'web/assets/weapons29';folder.mkdir(exist_ok=True)
for i,id in enumerate(ids):
 rng=np.random.default_rng(29000+i);n=512;yy,xx=np.mgrid[0:n,0:n]/n
 scratches=np.maximum(0,np.sin(xx*np.pi*2*(97+i*2)+np.sin(yy*np.pi*2)*1.8)-.975)*15
 patina=(np.sin(xx*np.pi*2*(3+i%4))*np.sin(yy*np.pi*2*(4+i%3))*.5+.5)
 spots=np.clip((rng.random((n,n))-.88)*7,0,1);rust=np.clip(patina**3*.5+spots*.25,0,.70)
 gray=np.array([.43+i%3*.025,.45+i%4*.012,.445+i%2*.02]);warm=np.array([.42+i%3*.035,.23+i%2*.03,.12])
 color=gray[None,None,:]*(1-rust[...,None])+warm[None,None,:]*rust[...,None]
 color+=(rng.random((n,n))-.5)[...,None]*.055+scratches[...,None]*.10
 # Worn stamped seams differ per receiver, while preserving tileability.
 seam=np.exp(-((np.minimum((yy*(2+i%3))%1,1-(yy*(2+i%3))%1))/.008)**2)
 color*=1-seam[...,None]*.28
 p=folder/f'{id}-color.webp';Image.fromarray(np.uint8(np.clip(color,0,1)*255)).save(p,quality=93,method=6);record(p)
# Unique recording-derived timbres, not oscillator/noise substitutes. No playback.
profiles=[('rifle','marksman',.92,2400,.08),('pistol','pistol',1.04,5300,.04),('revolver','revolver',.93,4100,.07),('smg','smg',1.10,4900,.035),('shotgun','shotgun',.94,3400,.10),('assaultRifle','assault',1.02,6200,.045),('boltRifle','bolt',.91,4700,.11),('carbine26','assault',1.12,5500,.025),('pdw26','smg',1.18,6100,.025),('semiRifle','marksman',1.05,5100,.06),('heavyPistol','heavy-pistol',.92,3800,.08),('combatShotgun','shotgun',1.09,4400,.07),('machineGun','assault',.89,3200,.09),('rocketLauncher','explosion',.86,2100,.15),('akRifle','assault',.97,4300,.055),('compactSmg','smg',1.23,7200,.020)]
folder=R/'web/assets/audio/weapons29';folder.mkdir(exist_ok=True);groups={};files={};sr=44100
for i,(id,source,rate,cutoff,echo) in enumerate(profiles):
 for variant in range(2):
  original=R/f'web/assets/audio/recorded07/{source}-{1+variant}.wav';sig,sr=sf.read(original)
  sig=resample_poly(sig,1000,int(rate*1000));sig=sosfilt(butter(2,cutoff,fs=sr,output='sos'),sig)
  sig=sosfilt(butter(1,70+(i%4)*24,fs=sr,btype='highpass',output='sos'),sig)
  # Finite low-level room tail made from the recording itself.
  delay=int(sr*(.025+(i%5)*.007));out=np.pad(sig,(0,delay));out[delay:]+=sig*echo
  out*=.83/max(.001,np.max(np.abs(out)));fade=min(int(sr*.035),len(out)//5);out[-fade:]*=np.linspace(1,0,fade);out[:16]*=np.linspace(0,1,16)
  name=f'gun29-{id}-{variant+1}';p=folder/f'{name}.wav';sf.write(p,out,sr,subtype='PCM_16');record(p)
  groups.setdefault('gun29-'+id,[]).append(name);files[name]='assets/audio/weapons29/'+p.name
  manifest['audio'][name]={'source':str(original.relative_to(R)),'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'license':'CC0-1.0; upstream provenance: audio/recorded07/manifest.json','edit':{'rate':rate,'lowPassHz':cutoff,'tailGain':echo,'variant':variant+1}}
(R/'src/survival/audio-manifest29.js').write_text('// Recording derivatives; author-dev29.py. No audio playback performed.\nexport const AUDIO_GROUPS29='+json.dumps(groups,separators=(',',':'))+';\nexport const AUDIO_FILES29='+json.dumps(files,separators=(',',':'))+';\n')
surface_manifest=R/'web/assets/pbr12/surfaces-manifest.json'
surface_doc=json.loads(surface_manifest.read_text());surface_doc['dev29']='Rounded logs, gray bricks, orange/red rusted pipes, gray HQM; original deterministic authoring.';surface_doc['files'].update({k:v for k,v in manifest['files'].items() if k.startswith('web/assets/pbr12/')});surface_manifest.write_text(json.dumps(surface_doc,indent=2)+'\n')
(R/'web/assets/weapons29/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Authored {len(ids)} weapon textures, 32 shot recordings, 4 building PBR sets and muted soil. No game execution or listening.')
