/** Tiny local WebAudio soundscape; no downloads or recorded third-party audio. */
export class SurvivalAudio {
 constructor(){this.enabled=true;this.ctx=null;}
 init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return;}try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.22:0;this.master.connect(this.ctx.destination);
  const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*4,this.ctx.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.12-.06)/1.03;data[i]=last;}
  this.noise=buffer;const wind=this.ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=340;const gain=this.ctx.createGain();gain.gain.value=.12;wind.connect(filter);filter.connect(gain);gain.connect(this.master);wind.start();this.windGain=gain;
  const lfo=this.ctx.createOscillator(),lg=this.ctx.createGain();lfo.frequency.value=.09;lg.gain.value=.035;lfo.connect(lg);lg.connect(gain.gain);lfo.start();this.ctx.resume().catch(()=>{});
 }catch{this.ctx=null;}}
 setEnabled(v){this.enabled=v;if(this.master)this.master.gain.setTargetAtTime(v?.22:0,this.ctx.currentTime,.1);}
 tone(f=440,d=.12,vol=.2,type='sine',delay=0){if(!this.ctx||!this.enabled)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.6,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.01);}
 burst(duration=.12,volume=.3,frequency=1000){if(!this.ctx||!this.enabled||!this.noise)return;const t=this.ctx.currentTime,s=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();s.buffer=this.noise;filter.type='lowpass';filter.frequency.value=frequency;gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);s.connect(filter);filter.connect(gain);gain.connect(this.master);s.start(t,Math.random()*2);s.stop(t+duration);}
 hit(type){this.burst(type==='tree'?.14:.09,.55,type==='tree'?750:2100);this.tone(type==='tree'?110:220,.12,.16,'triangle');}
 step(){this.burst(.075,.14,580);}
 craft(){this.tone(330,.16,.18,'triangle');this.tone(495,.2,.12,'sine',.12);}
 pickup(){this.tone(560,.1,.13,'sine');}
 damage(){this.burst(.25,.55,350);this.tone(85,.2,.3,'triangle');}
}
