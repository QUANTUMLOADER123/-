"""Master existing licensed recording derivatives; never claims new firearm recordings."""
from pathlib import Path
import json,hashlib,math
import numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt,resample_poly
R=Path(__file__).resolve().parents[1];out=R/'web/assets/audio/master33';out.mkdir(exist_ok=True);files={};clips={}
for folder in ['recorded07','weapons29']:
 for p in sorted((R/'web/assets/audio'/folder).glob('*.wav')):
  x,sr=sf.read(p,always_2d=True);x=x.mean(1);x-=x.mean();x=sosfilt(butter(2,45,fs=sr,btype='highpass',output='sos'),x)
  gun=p.stem.startswith('gun29-');x=sosfilt(butter(2,11000 if gun else 13000,fs=sr,output='sos'),x)
  # Retain the recorded crack; mild body lift rather than synthetic oscillator layers.
  if gun:x+=sosfilt(butter(2,[110,430],fs=sr,btype='bandpass',output='sos'),x)*.20
  peak=np.max(np.abs(x));hits=np.flatnonzero(np.abs(x)>max(peak*.0013,1e-6));a=max(0,int(hits[0]) if len(hits) else 0)-int(sr*.002);a=max(a,0);b=min(len(x),(int(hits[-1]) if len(hits) else len(x)-1)+int(sr*.025));x=x[a:b];x*=.82/max(np.max(np.abs(x)),1e-9)
  n=min(int(sr*.018),len(x)//8);x[-n:]*=np.linspace(1,0,n);x[:min(24,len(x))]*=np.linspace(0,1,min(24,len(x)))
  target=32000;x=resample_poly(x,target//math.gcd(target,sr),sr//math.gcd(target,sr));x*=min(1,.86/max(np.max(np.abs(x)),1e-9));q=out/p.name;sf.write(q,x,target,subtype='PCM_16');files[p.stem]='assets/audio/master33/'+q.name
  clips[p.stem]={'source':str(p.relative_to(R)),'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sha256':hashlib.sha256(q.read_bytes()).hexdigest(),'seconds':round(len(x)/target,4),'peak':round(float(np.max(np.abs(x))),5),'rms':round(float(np.sqrt(np.mean(x*x))),5),'edit':'DC/rumble cleanup, gentle HF control, gun-only 110–430 Hz body lift, -1.3 dBFS peak ceiling, silence trim, 18 ms fade, PCM16 mono 32 kHz'}
(out/'manifest.json').write_text(json.dumps({'provenance':'CC0 derivative chain: recorded07/manifest.json and authored29 manifest; no newly recorded/authentic model-specific claims','clips':clips},indent=2)+'\n')
(R/'src/survival/audio-manifest33.js').write_text('// Reproducible mastering of existing CC0 recordings. scripts/master-audio33.py\nexport const AUDIO_FILES33='+json.dumps(files,separators=(',',':'))+';\n')
print(len(clips),'clips mastered,',sum(p.stat().st_size for p in out.glob('*.wav')),'bytes')
