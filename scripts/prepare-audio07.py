"""Offline asset authoring only; no game/test runner.
Requires numpy, scipy, soundfile (libsndfile). Sources are pinned in audio07-sources.json.
Fetch with --fetch (GitHub CLI); source cache lives in ignored .artifacts/audio07/sources.
Outputs real-recording derivatives, mono PCM16 44.1k, short fades, no synthetic gunshots.
"""
from pathlib import Path
import json, hashlib, subprocess, base64, argparse, math
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
ROOT=Path(__file__).resolve().parents[1]; SRC=ROOT/'.artifacts/audio07/sources'; OUT=ROOT/'web/assets/audio/recorded07';OUT.mkdir(parents=True,exist_ok=True)
SOURCES=json.loads((ROOT/'scripts/audio07-sources.json').read_text()); by_name={j['local']:j for j in SOURCES}; SR=44100; manifest={}; groups={}
parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');args=parser.parse_args()
if args.fetch:
 SRC.mkdir(parents=True,exist_ok=True)
 for j in SOURCES:
  p=SRC/j['local']
  if not p.exists():p.write_bytes(base64.b64decode(subprocess.check_output(['gh','api',f"repos/{j['repo']}/git/blobs/{j['blob']}",'--jq','.content'])))
def read(name):
 p=SRC/name
 if hashlib.sha256(p.read_bytes()).hexdigest()!=by_name[name]['sha256']:raise ValueError('Source changed: '+name)
 x,sr=sf.read(p,always_2d=True);x=x.mean(axis=1);x-=np.mean(x)
 return resample_poly(x,SR//math.gcd(SR,sr),sr//math.gcd(SR,sr))
def write(name,x,source,group,cut=None,peak=.89):
 x=np.asarray(x).copy();x=sosfilt(butter(2,38,fs=SR,btype='highpass',output='sos'),x)
 if len(x)<100:raise ValueError('Empty authored clip')
 # Remove silence before the transient, but keep 2 ms of the original attack.
 hits=np.flatnonzero(np.abs(x)>max(np.max(np.abs(x))*.008,.00003))
 if len(hits):x=x[max(0,hits[0]-int(.002*SR)):min(len(x),hits[-1]+int(.035*SR))]
 x*=peak/max(np.max(np.abs(x)),.00001);fade=min(int(.024*SR),len(x)//5);x[-fade:]*=np.linspace(1,0,fade);x[:16]*=np.linspace(0,1,16)
 p=OUT/(name+'.wav');sf.write(p,x,SR,subtype='PCM_16');j=by_name[source]
 manifest[name]={'file':'assets/audio/recorded07/'+p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'seconds':round(len(x)/SR,4),'source':source,'sourceSha256':j['sha256'],'sourceBlob':j['blob'],'license':j['license'],'author':j['author'],'edit':'mono, DC/high-pass cleanup, attack trim, peak normalization, end fade','cutSeconds':cut};groups.setdefault(group,[]).append(name)
def gun(group,source,times,length):
 x=read(source)
 for i,t in enumerate(times):
  # Locate the actual start before the 10 ms peak bin, keeping the entire crack.
  start=max(0,t-.035);seg=x[int(start*SR):int((t+length)*SR)];write(group+'-'+str(i+1),seg,source,group,[round(start,4),round(t+length,4)])
gun('pistol','X_39P.wav',[1.4,6.44,10.66],1.10)
gun('heavy-pistol','A_34P.wav',[1.54,6.65],1.35)
gun('revolver','V_22P.wav',[.67,5.5],1.35)
gun('assault','C_28P.wav',[.61,3.26,6.02,9.16],1.35)
gun('smg','G_31P.wav',[.31,3.5,6.72],.95)
gun('marksman','U_14P.wav',[3.57,6.75,10.21],1.5)
gun('bolt','M_21P.wav',[1.03,5.02,9.16,14.13],1.65)
gun('shotgun','O_21P.wav',[.43,3.46],1.55)
for surface,prefix in [('grass','footstep_grass'),('stone','footstep_concrete'),('wood','footstep_wood'),('snow','footstep_snow')]:
 for i in range(4):
  f=f'{prefix}_{i:03}.ogg';write('step-'+surface+'-'+str(i+1),read(f),f,'step-'+surface)
for group,prefix in [('hit-metal','impact_metal_medium'),('hit-barrel','impact_tin_medium'),('hit-wood','impact_wood_heavy'),('cloth','impact_soft_medium'),('hurt','impact_punch_medium'),('click','impact_generic_light'),('debris','impact_plate_heavy'),('hit-stone','impact_mining'),('door','impact_plank_medium'),('drop-wood','impact_wood_light'),('rustle','footstep_carpet')]:
 for i in range(4):
  f=f'{prefix}_{i:03}.ogg';write(group+'-'+str(i+1),read(f),f,group,peak=.78)
for group,f in [('reload-rifle','assaultriflereload1.wav'),('reload-pistol','gunreload1.wav')]:
 x=read(f)
 for stage,a,b in [('out',0,.62),('in',.72,1.55)]:write(group+'-'+stage,x[int(a*SR):int(b*SR)],f,group+'-'+stage,[a,b])
write('pump',read('shotguncock.wav'),'shotguncock.wav','pump')
for i in [1,2]:
 f=f'cannon_0{i}.wav';write('explosion-'+str(i),read(f),f,'explosion',[0,.61])
(OUT/'manifest.json').write_text(json.dumps({'sampleRate':SR,'format':'PCM_16 mono','groups':groups,'clips':manifest},indent=2,ensure_ascii=False)+'\n')
(ROOT/'src/survival/audio-manifest07.js').write_text('// Authored from CC0 recordings. Rebuild: scripts/prepare-audio07.py\nexport const AUDIO_GROUPS07='+json.dumps(groups,separators=(',',':'))+';\nexport const AUDIO_FILES07='+json.dumps({k:v['file'] for k,v in manifest.items()},separators=(',',':'))+';\n')
print('Authored',len(manifest),'clips;',sum(p.stat().st_size for p in OUT.glob('*.wav')),'bytes. Offline media processing only.')
