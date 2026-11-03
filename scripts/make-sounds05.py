"""Original offline PCM foley and layered impulse effects, not samples from other games."""
from pathlib import Path
import math,random,wave,struct
out=Path('web/assets/audio');out.mkdir(parents=True,exist_ok=True)
rate=24000
profiles={'pistol':(.38,130,.11),'rifle':(.65,84,.19),'shotgun':(.8,63,.26),'smg':(.32,155,.08),'rocket':(1.0,43,.4),'explosion':(1.4,39,.6),'landing':(.35,68,.12),'step':(.12,115,.035),'metal':(.42,740,.16),'wood':(.25,160,.065),'cloth':(.21,80,.035),'reload':(.5,1100,.05),'door':(.5,120,.15),'collapse':(1.2,58,.35)}
for name,(duration,f,decay) in profiles.items():
 r=random.Random(371+sum(map(ord,name)));n=int(rate*duration);data=[];last=0
 for i in range(n):
  t=i/rate;noise=r.uniform(-1,1);last=.82*last+.18*noise
  attack=min(1,t/.0008);env=math.exp(-t/decay);body=math.sin(2*math.pi*f*t+5*math.exp(-t*20))
  v=(noise*.55+last*.7+body*.35)*env*attack
  if name in ['rifle','pistol','shotgun','smg']:v+=noise*.65*math.exp(-t/.009)+body*.4*math.exp(-t/.055)
  if name in ['metal','reload']:v=.5*noise*math.exp(-t/.009)+sum(math.sin(t*2*math.pi*f*k)*.13*math.exp(-t/(decay/k)) for k in[1,1.47,2.13,3.1])
  if name=='reload':v+=(noise*.6+body*.3)*math.exp(-max(0,t-.28)/.022)*(1 if t>=.28 else 0)
  if name=='cloth':v=last*2*env
  data.append(v)
 if name in ['rifle','shotgun','pistol','explosion','rocket']:
  dry=data[:]
  for delay,gain in[(.023,.22),(.051,.15),(.092,.09),(.151,.05)]:
   shift=int(delay*rate)
   for i in range(shift,n):data[i]+=dry[i-shift]*gain
 peak=max(abs(v) for v in data) or 1
 with wave.open(str(out/(name+'.wav')),'wb') as w:w.setparams((1,2,rate,n,'NONE','not compressed'));w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v/peak*.88))*32767)) for v in data))
(out/'LICENSE.txt').write_text('Oskol DEV05 original synthesized PCM effects. Generated with scripts/make-sounds05.py. No Facepunch or third-party recordings. Same license as project source.\n')
