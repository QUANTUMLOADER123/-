import {AUDIO_GROUPS07 as GROUPS,AUDIO_FILES07 as FILES} from './audio-manifest07.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const gunGroup=id=>({carbine26:'assault',pdw26:'smg',pistol:'pistol',heavyPistol:'heavy-pistol',revolver:'revolver',smg:'smg',compactSmg:'smg',akRifle:'assault',assaultRifle:'assault',machineGun:'assault',boltRifle:'bolt',rifle:'marksman',semiRifle:'marksman',shotgun:'shotgun',combatShotgun:'shotgun'})[id]||'assault';
/** Local recorded samples only: no oscillator beeps and no procedural noise fallback. */
export class SurvivalAudio {
 constructor(){this.enabled=true;this.paused=false;this.ctx=null;this.buffers=new Map();this.pending=new Map();this.failures=new Set();this.voices=[];this.previous={};this.epochs={};this.listener={x:0,y:0,z:0,yaw:0};this.levels={master:.75,effects:1,steps:.65};}
 init(signal){
  if(!this.enabled)return;
  if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});if(!this.prepared11&&!this.warming11)this.warm11(signal);return;}
  try{
   this.ctx=new(window.AudioContext||window.webkitAudioContext)();
   this.master=this.ctx.createGain();this.master.gain.value=this.levels.master;
   this.limiter=this.ctx.createDynamicsCompressor();this.limiter.threshold.value=-5;this.limiter.knee.value=8;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.16;this.limiter.connect(this.master);this.master.connect(this.ctx.destination);
   this.buses={};for(const id of ['weapons','impacts','steps','ui']){const gain=this.ctx.createGain();gain.connect(this.limiter);this.buses[id]=gain;}this.configure(this.levels);
   this.ctx.resume().catch(()=>{});
   this.warm11(signal);
  }catch{this.ctx=null;}
 }
 warm11(signal){
  const priority=['step-grass','step-stone','hit-wood','hit-metal','hurt','click','pistol','assault'],first=priority.flatMap(k=>(GROUPS[k]||[]).slice(0,1)),queue=[...new Set([...first,...Object.keys(FILES)])].filter(k=>!this.buffers.has(k));this.warming11=true;
  this.ready=Promise.all(Array.from({length:4},async()=>{while(queue.length&&!signal?.aborted)await this.load(queue.shift(),signal);})).finally(()=>{this.warming11=false;this.prepared11=!signal?.aborted;});
 }
 configure({master=this.levels.master,effects=this.levels.effects,steps=this.levels.steps}={}){
  this.levels={master:clamp(master),effects:clamp(effects),steps:clamp(steps)};
  if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.enabled?this.levels.master:0,t,.025);
  for(const [id,value]of Object.entries({weapons:.9*this.levels.effects,impacts:.7*this.levels.effects,steps:.45*this.levels.steps,ui:.22*this.levels.effects}))this.buses[id].gain.setTargetAtTime(value,t,.025);
 }
 setEnabled(value){this.enabled=!!value;if(!value)this.stopAll();this.configure();}
 setPaused(value){this.paused=!!value;if(value)this.stopAll(false);else if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});}
 updateListener(position,yaw){Object.assign(this.listener,{x:position.x,y:position.y,z:position.z,yaw});}
 async load(name,signal){
  if(!name||!this.ctx)return null;if(this.buffers.has(name))return this.buffers.get(name);if(this.pending.has(name))return this.pending.get(name);
  const promise=(async()=>{try{const r=await fetch(FILES[name],{signal});if(!r.ok)throw new Error('Audio asset unavailable');const buffer=await this.ctx.decodeAudioData(await r.arrayBuffer());this.buffers.set(name,buffer);return buffer;}catch{if(!signal?.aborted)this.failures.add(name);return null;}finally{this.pending.delete(name);}})();this.pending.set(name,promise);return promise;
 }
 choose(group){const names=GROUPS[group]||[];if(!names.length)return null;let i=Math.floor(Math.random()*names.length);if(names.length>1&&i===this.previous[group])i=(i+1+Math.floor(Math.random()*(names.length-1)))%names.length;this.previous[group]=i;return names[i];}
 play(group,{bus='impacts',volume=.5,rate=1,variation=.025,delay=0,position=null,maxDistance=180,key=group,cap=3,priority=1,tag=null}={}){
  if(!this.ctx||!this.enabled||this.levels.master===0||document.hidden||this.paused&&bus!=='ui')return;
  const name=this.choose(group);if(!name)return;const requested=this.ctx.currentTime,epoch=this.epochs[tag]||0;
  const start=buffer=>{
   if(!buffer||!this.enabled||document.hidden||this.paused&&bus!=='ui'||(this.epochs[tag]||0)!==epoch||this.ctx.currentTime-requested>.18)return;
   let attenuation=1,pan=0,cutoff=21000;
   if(position){const dx=position.x-this.listener.x,dz=position.z-this.listener.z,dy=(position.y||0)-this.listener.y,d=Math.hypot(dx,dy,dz);if(d>maxDistance)return;attenuation=1/(1+(d/18)**1.6);pan=clamp((dx*Math.cos(this.listener.yaw)-dz*Math.sin(this.listener.yaw))/Math.max(1,Math.hypot(dx,dz)),-.95,.95);cutoff=Math.max(1000,20000/(1+d/22));}
   const same=this.voices.filter(v=>v.key===key);if(same.length>=cap)this.stop(same[0]);
   if(this.voices.length>=24){const victim=[...this.voices].sort((a,b)=>a.priority-b.priority||a.at-b.at)[0];if(victim.priority>priority)return;this.stop(victim);}
   const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;source.playbackRate.value=rate*(1+(Math.random()*2-1)*variation);gain.gain.value=clamp(volume,0,1.5)*attenuation*(.96+Math.random()*.08);filter.type='lowpass';filter.frequency.value=Math.min(cutoff,this.ctx.sampleRate*.48);source.connect(filter);filter.connect(gain);
   const panner=this.ctx.createStereoPanner?.();if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(this.buses[bus]);}else gain.connect(this.buses[bus]);
   const voice={source,gain,filter,panner,key,tag,bus,priority,at:this.ctx.currentTime};this.voices.push(voice);
   source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();panner?.disconnect();this.voices=this.voices.filter(v=>v!==voice);};source.start(this.ctx.currentTime+Math.max(0,delay));return voice;
  };
  const buffer=this.buffers.get(name);if(buffer)return start(buffer);this.load(name).then(start);
 }
 stop(v){try{const t=this.ctx.currentTime;v.gain.gain.cancelScheduledValues(t);v.gain.gain.setTargetAtTime(0,t,.004);v.source.stop(t+.02);}catch{}this.voices=this.voices.filter(x=>x!==v);}
 stopAll(includeUI=true){for(const v of [...this.voices])if(includeUI||v.bus!=='ui')this.stop(v);for(const tag of ['reload','shot'])this.epochs[tag]=(this.epochs[tag]||0)+1;}
 cancelReload(){this.epochs.reload=(this.epochs.reload||0)+1;for(const v of [...this.voices])if(v.tag==='reload')this.stop(v);}
 fire(id,{position=null,remote=false,suppressed=false}={}){
  if(id==='rocketLauncher'){this.play('explosion',{bus:'weapons',volume:.68,rate:.78,position,key:'launch',cap:2,priority:3});this.play('debris',{bus:'weapons',volume:.18,rate:.65,delay:.045,position,priority:2});return;}
  this.play(gunGroup(id),{bus:'weapons',volume:suppressed?.24:remote?.78:.88,rate:suppressed?.87:id==='machineGun'?.90:1,position,key:remote?'gun:remote':'gun:self',cap:remote?6:7,priority:3,tag:'shot'});
  if(!remote&&id==='shotgun')this.play('pump',{bus:'weapons',volume:.46,delay:.22,key:'pump',cap:1,priority:2,tag:'shot'});
  if(!remote&&['boltRifle','rifle'].includes(id))this.play('reload-rifle-in',{bus:'weapons',volume:.22,rate:1.15,delay:.32,key:'bolt',cap:1,tag:'shot'});
 }
 surface(material){return material==='metal'?'metal':material==='wood'?'wood':material==='snow'?'snow':['stone','arid','coast','sand','concrete'].includes(material)?'stone':'grass';}
 step(material='grass',sprint=false,crouched=false){const surface=this.surface(material);if(surface==='metal'){this.play('step-stone',{bus:'steps',volume:sprint?.65:.48,key:'footstep',cap:2});this.play('hit-metal',{bus:'steps',volume:.11,rate:.92,key:'metal-step',cap:2});}else this.play('step-'+surface,{bus:'steps',volume:crouched?.30:sprint?.75:.52,rate:sprint?1.03:1,key:'footstep',cap:2});}
 landing(speed,material){const force=clamp(speed/13,.25,1),surface=this.surface(material);this.play('step-'+(surface==='metal'?'stone':surface),{bus:'steps',volume:force,rate:.88,key:'landing-foot',cap:1,priority:2});this.play(surface==='metal'?'hit-metal':'cloth',{bus:'impacts',volume:force*.38,rate:.82,key:'landing-body',cap:1,priority:2});}
 hit(type,tool='rock'){
  const group=['fiber','berries','mushroom','pumpkin','corn'].includes(type)?'rustle':['tree','driftwood','wood'].includes(type)?'hit-wood':['metal','metalOre','highMetalOre','barrel'].includes(type)?'hit-barrel':['body','wolf','bot'].includes(type)?'hurt':'hit-stone';
  this.play(group,{volume:tool==='rock'?.5:.62,rate:tool==='pickaxe'?1.1:tool==='axe'?.93:1,key:'impact',cap:3,priority:2});
 }
 break(material='wood'){this.play(material==='metal'?'debris':'hit-wood',{volume:.74,rate:.72,key:'break',cap:2,priority:2});}
 reload(id='rifle',stage='out'){const short=['pistol','heavyPistol','revolver'].includes(id),group=stage==='bolt'?'pump':`reload-${short?'pistol':'rifle'}-${stage}`;this.play(group,{bus:'weapons',volume:stage==='bolt'?.25:.47,rate:stage==='bolt'?1.25:1,key:'reload',cap:2,priority:2,tag:'reload'});}
 explosion(position){this.play('explosion',{bus:'weapons',volume:1.0,rate:.80,position,maxDistance:280,key:'explosion',cap:3,priority:4});this.play('debris',{volume:.27,rate:.70,delay:.10,position,key:'explosion-debris',cap:2,priority:2});}
 collapse(position=null,tier=1){const now=this.ctx?.currentTime||0;if(this.lastCollapse!==undefined&&now-this.lastCollapse<.3)return;this.lastCollapse=now;this.play(tier>=3?'hit-metal':'hit-wood',{volume:.65,rate:.72,position,key:'collapse',cap:2,priority:2});this.play('debris',{volume:.35,rate:.82,delay:.07,position,key:'collapse-debris',cap:2});}
 door(tier=1,open=true,position=null){this.play(tier>=3?'hit-metal':'door',{volume:open?.28:.48,rate:open?1:.85,position,key:'door',cap:2});this.play('reload-pistol-in',{volume:.11,rate:1.2,delay:open?0:.08,position,key:'latch',cap:1});}
 drop(item){this.play(['fiber','bandage','armor','rope','berries'].includes(item)?'rustle':['wood','storage','largeStorage','cupboard','door','plan'].includes(item)?'drop-wood':'hit-metal',{volume:.3,key:'drop',cap:3});}
 swing(){this.play('rustle',{volume:.13,rate:1.15,key:'swing',cap:1});}
 jump(){this.play('rustle',{volume:.12,rate:1.05,key:'jump',cap:1});}
 craft(){this.play('click',{bus:'ui',volume:.65,key:'ui',cap:2});}
 pickup(){this.play('click',{bus:'ui',volume:.4,rate:1.12,key:'ui',cap:2});}
 damage(){this.play('hurt',{volume:.58,rate:.91,key:'hurt',cap:2,priority:2});}
 // Compatibility for old callers: recorded taps/swish, never electronic tones/noise.
 tone(){this.pickup();}
 burst(){this.swing();}
}
