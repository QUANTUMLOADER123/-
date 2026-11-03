import { StackGame, BASE_SIZE, BLOCK_HEIGHT, dailySeed } from './engine.js';
const $ = id => document.getElementById(id);
const canvas=$('game'), ctx=canvas.getContext('2d',{alpha:false});
const storage={get(k,fallback){try{return localStorage.getItem('layer.'+k)??fallback;}catch{return fallback;}},set(k,v){try{localStorage.setItem('layer.'+k,String(v));}catch{}}};
let sound=storage.get('sound','on')==='on', audio, state='home', game, daily=false, paused=false;
let width=0,height=0,dpr=1,scale=1,camera=0,lastTime=0,clock=0,feedbackUntil=0,finishAt=0,bounce=0;
let particles=[],cuts=[],rings=[],lastFocus=null;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const today=dailySeed();
$('daily-date').textContent=new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'});
function bestKey(){return daily?'daily.'+today:'best';}
function best(){return Number(storage.get(bestKey(),'0'))||0;}
function updateBest(){ $('best').textContent=best(); }
function updateSound(){ $('sound').classList.toggle('muted',!sound);$('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');$('sound').setAttribute('aria-pressed',String(sound)); }
function initAudio(){try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function note(freq,delay=0,duration=.13,volume=.05,type='sine'){
  if(!sound||!audio||audio.state!=='running')return;
  try{const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+duration+.01);}catch{}
}
function haptic(ms){try{if(window.AndroidBridge)window.AndroidBridge.vibrate(ms);else navigator.vibrate?.(ms);}catch{}}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);scale=Math.min(1.2,width/440,height/680);render(0);}
new ResizeObserver(resize).observe(canvas);
function showFeedback(text,sub=''){ $('live-feedback').replaceChildren(document.createTextNode(text));if(sub){const el=document.createElement('small');el.textContent=sub;$('live-feedback').append(el);}$('live-feedback').classList.add('show');feedbackUntil=clock+1.05; }
function setScore(){ $('score').textContent=String(game?.score||0).padStart(2,'0');$('shield').hidden=!game?.shield;updateBest(); }
function start(isDaily=false){
  initAudio();daily=isDaily;game=new StackGame({seed:daily?today:Date.now(),daily});state='playing';paused=false;
  particles=[];cuts=[];rings=[];camera=0;bounce=0;finishAt=0;feedbackUntil=0;
  $('live-feedback').classList.remove('show');$('home').hidden=true;$('result').hidden=true;$('modal').hidden=true;
  $('playing-hint').hidden=false;$('pause').hidden=false;$('help').hidden=true;$('shield').hidden=true;
  $('mode-label').textContent=daily?'ВЫЗОВ ДНЯ · '+$('daily-date').textContent:'ОДИН ТАП ДО НЕБА';
  $('level-label').textContent=daily?'ОДИН ДЕНЬ. ОДНИ УСЛОВИЯ.':'JUST ONE MORE.';
  $('share-status').textContent='';setScore();note(261.63);note(392,.08);canvas.focus?.();
}
function goHome(){state='home';paused=false;game=null;camera=0;cuts=[];particles=[];rings=[];$('home').hidden=false;$('result').hidden=true;$('playing-hint').hidden=true;$('pause').hidden=true;$('help').hidden=false;$('shield').hidden=true;$('live-feedback').classList.remove('show');$('mode-label').textContent='ТВОЙ СЛЕДУЮЩИЙ РЕКОРД';$('score').textContent='00';daily=false;updateBest();$('start').focus({preventScroll:true});}
function drop(){
  if(state!=='playing'||paused||!$('modal').hidden)return;
  const event=game.place();
  if(event.type==='save'){showFeedback('ЕЩЁ ЖИВОЙ','СТРАХОВКА ИСПОЛЬЗОВАНА');haptic(30);note(392);note(523,.1);setScore();return;}
  if(event.type==='miss'){
    cuts.push({block:{...event.block},vx:game.direction*50,vy:0,life:1.5});state='falling';finishAt=clock+.75;
    $('playing-hint').hidden=true;$('pause').hidden=true;haptic(60);note(130,0,.3,.05,'triangle');note(98,.12,.4,.04,'triangle');return;
  }
  bounce=reduced?0:5;
  if(event.cut)cuts.push({block:{...event.cut},vx:Math.sign(event.delta)*65,vy:0,life:1.6,axis:game.axis==='x'?'z':'x'});
  if(event.type==='perfect'){
    showFeedback(event.combo>1?`ИДЕАЛЬНО ×${event.combo}`:'ИДЕАЛЬНО',event.restored?'БАШНЯ СТАЛА ШИРЕ':event.combo===5?'ТЕПЕРЬ У ТЕБЯ ЕСТЬ ВТОРОЙ ШАНС':'+ РИТМ ПОЙМАН');
    const p=project(event.block.x,event.block.z,event.block.y);
    if(!reduced){for(let i=0;i<18;i++)particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*160,vy:-Math.random()*130-15,life:.8,max:.8,size:1.5+Math.random()*2});rings.push({block:{...event.block},life:.6});}
    const freq=261.63*Math.pow(2,Math.min(event.combo,12)/12);note(freq,0,.22,.065);note(freq*1.5,.055,.25,.025);haptic(12);
  }else{note(174.61*Math.pow(2,game.score%7/12),0,.12,.045,'triangle');haptic(7);}
  const record=best();if(game.score>record)storage.set(bestKey(),game.score);setScore();
  if(game.score%10===0){$('level-label').textContent=`ВЫСОТА ${game.score} · ПОЛЁТ НОРМАЛЬНЫЙ`;if(event.type!=='perfect')showFeedback('ВЫШЕ И ВЫШЕ',`${game.score} СЛОЁВ. НЕ ОСТАНАВЛИВАЙСЯ.`);}
}
function finish(){
  state='over';$('result').hidden=false;$('result-score').textContent=game.score;$('result-best').textContent=best();$('result-perfect').textContent=game.perfects;
  const isBest=game.score>0&&game.score===best();$('result-title').textContent=isBest?'Новая высота.':'Ещё один?';
  $('result-caption').textContent=isBest?'ЛИЧНЫЙ РЕКОРД · ВОТ ЭТО МОМЕНТ':game.score===0?'ПЕРВЫЙ СЛОЙ — САМЫЙ ХИТРЫЙ':'СЛОЁВ БЛИЖЕ К НЕБУ';
  $('retry').focus({preventScroll:true});
}
function openModal(isPause=false){
  lastFocus=document.activeElement;paused=state==='playing'||state==='falling';
  $('modal-title').textContent=isPause?'Выдохни. Ты выше.':'Поймай момент.';
  $('instructions').hidden=isPause;$('modal-close').firstElementChild.textContent=isPause?'ПРОДОЛЖИТЬ':'ПОНЯТНО';
  $('modal').hidden=false;$('modal-close').focus({preventScroll:true});
}
function closeModal(){ $('modal').hidden=true;paused=false;lastFocus?.focus?.({preventScroll:true});lastTime=performance.now(); }
$('start').addEventListener('click',()=>start(false));$('daily').addEventListener('click',()=>start(true));$('retry').addEventListener('click',()=>start(daily));$('to-home').addEventListener('click',goHome);
$('sound').addEventListener('click',()=>{initAudio();sound=!sound;storage.set('sound',sound?'on':'off');updateSound();if(sound)note(440);});
$('help').addEventListener('click',()=>openModal());$('pause').addEventListener('click',()=>openModal(true));$('modal-close').addEventListener('click',closeModal);
canvas.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();drop();});
document.addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(!$('modal').hidden)closeModal();else if(state==='playing')openModal(true);return;}
  if(e.code==='Space'&&!e.repeat&&!['BUTTON','A','INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(state==='playing')drop();else if(state==='home')start();}
  if(e.code==='Tab'&&!$('modal').hidden){e.preventDefault();$('modal-close').focus();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='playing'||state==='falling')&&$('modal').hidden)openModal(true);lastTime=performance.now();});
$('share').addEventListener('click',async()=>{
  const text=`ЕЩЁ СЛОЙ ↗ Моя башня — ${game.score} слоёв${daily?' в вызове дня':''}. Сможешь выше?`;
  try{
    if(window.AndroidBridge?.share){window.AndroidBridge.share(text);return;}
    if(navigator.share){await navigator.share({title:'ЕЩЁ СЛОЙ',text});return;}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);$('share-status').textContent='Результат скопирован. Отправь другу ↗';}
    else $('share-status').textContent=text;
  }catch(error){if(error.name!=='AbortError')$('share-status').textContent=text;}
});
// Lightweight isometric renderer: no images, fonts, network or game framework.
function project(x,z,y){return{x:width/2+(x-z)*.866*scale,y:height*(state==='home'?.64:.58)+((x+z)*.40-y*.85+camera)*scale};}
function path(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
function corners(b,y=b.y){return[project(b.x-b.w/2,b.z-b.d/2,y),project(b.x+b.w/2,b.z-b.d/2,y),project(b.x+b.w/2,b.z+b.d/2,y),project(b.x-b.w/2,b.z+b.d/2,y)];}
function drawBlock(b,index,{active=false,alpha=1,fall=false}={}){
  const top=corners(b),bottom=corners(b,b.y-BLOCK_HEIGHT+1);
  ctx.save();ctx.globalAlpha=alpha;
  const hue=267+Math.sin(index*.17)*16;
  const colors=active?['#ffcfaa','#ee9167','#d5775d']:[`hsl(${hue},${57-index%4*3}%,${74-index%3*3}%)`,`hsl(${hue},46%,${58-index%3*2}%)`,`hsl(${hue},39%,${49-index%3*2}%)`];
  path([top[1],top[2],bottom[2],bottom[1]]);ctx.fillStyle=colors[2];ctx.fill();
  path([top[2],top[3],bottom[3],bottom[2]]);ctx.fillStyle=colors[1];ctx.fill();
  path(top);ctx.fillStyle=colors[0];ctx.fill();
  ctx.lineWidth=.7;ctx.strokeStyle=active?'#ffe6d0aa':'#efe3ff55';ctx.stroke();
  if(active&&!fall){ctx.beginPath();ctx.moveTo(top[3].x,top[3].y);ctx.lineTo(top[2].x,top[2].y);ctx.lineTo(top[1].x,top[1].y);ctx.strokeStyle='#ffead2';ctx.lineWidth=1;ctx.stroke();}
  ctx.restore();
}
function background(){
  const g=ctx.createLinearGradient(0,0,width*.3,height);g.addColorStop(0,'#f0eaf6');g.addColorStop(.55,'#e8dcf3');g.addColorStop(1,'#dfd0ee');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
  const halo=ctx.createRadialGradient(width*.5,height*.54,0,width*.5,height*.54,width*.64);halo.addColorStop(0,'#fbf3ff90');halo.addColorStop(1,'#e6d7f000');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  ctx.save();ctx.strokeStyle='#b7a0cc';ctx.globalAlpha=.12;ctx.lineWidth=.6;
  const floorY=state==='home'?-BLOCK_HEIGHT*1.25:-BLOCK_HEIGHT*1.25;
  for(let v=-650;v<=650;v+=78){let a=project(v,-650,floorY),b=project(v,650,floorY);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();a=project(-650,v,floorY);b=project(650,v,floorY);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  ctx.restore();
  const shadow=project(0,0,-BLOCK_HEIGHT*1.8);ctx.save();ctx.translate(shadow.x,shadow.y);ctx.scale(1,.35);const s=ctx.createRadialGradient(0,0,0,0,0,150*scale);s.addColorStop(0,'#76509830');s.addColorStop(1,'#76509800');ctx.fillStyle=s;ctx.fillRect(-160*scale,-160*scale,320*scale,320*scale);ctx.restore();
  ctx.fillStyle='#ffffff88';for(let i=0;i<19;i++){const x=(i*173.73+41)%width,y=(i*91.17+71)%height;const a=reduced?1:.5+Math.sin(clock*.6+i)*.3;ctx.globalAlpha=a;ctx.fillRect(x,y,i%3===0?2:1,i%3===0?2:1);}ctx.globalAlpha=1;
}
function render(dt){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const target=state==='home'?0:(game?.score||0)*BLOCK_HEIGHT*.85;
  camera+=(target-camera)*Math.min(1,dt*7);bounce*=Math.exp(-dt*12);
  background();
  if(state==='home'){
    for(let i=0;i<4;i++)drawBlock({x:0,z:0,w:BASE_SIZE,d:BASE_SIZE,y:i*BLOCK_HEIGHT},i);
    const offset=reduced?44:Math.sin(clock*.85)*130;
    drawBlock({x:offset,z:0,w:BASE_SIZE,d:BASE_SIZE,y:4*BLOCK_HEIGHT+8},4,{active:true});
    // Dotted alignment guide under the moving piece.
    ctx.save();ctx.setLineDash([2,5]);ctx.lineWidth=1;ctx.strokeStyle='#a284c366';const a=project(0,0,4*BLOCK_HEIGHT),b=project(offset,0,4*BLOCK_HEIGHT);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  }else if(game){
    const start=Math.max(0,game.blocks.length-Math.ceil(height/(BLOCK_HEIGHT*.85*scale))-3);
    for(let i=start;i<game.blocks.length;i++)drawBlock({...game.blocks[i],y:game.blocks[i].y-bounce},i);
    for(const cut of cuts){cut.vy+=dt*660;cut.block.y-=cut.vy*dt;cut.block[cut.axis||'x']+=cut.vx*dt;cut.life-=dt;drawBlock(cut.block,game.score,{active:true,alpha:Math.min(1,cut.life*2),fall:true});}
    cuts=cuts.filter(c=>c.life>0);
    if(!game.over)drawBlock(game.moving,game.score+1,{active:true});
    for(const ring of rings){ring.life-=dt;ctx.save();ctx.globalAlpha=Math.max(0,ring.life/.6);const spread=(.6-ring.life)*65;path(corners({...ring.block,w:ring.block.w+spread,d:ring.block.d+spread}));ctx.strokeStyle='#fff8ed';ctx.lineWidth=2;ctx.stroke();ctx.restore();}rings=rings.filter(r=>r.life>0);
    for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle='#fff7dc';ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
  }
}
function frame(time){
  const dt=lastTime?Math.min((time-lastTime)/1000,.05):.016;lastTime=time;
  if(!paused){clock+=dt;if(state==='playing')game.update(dt);if(state==='falling'&&clock>=finishAt)finish();}
  if(clock>feedbackUntil)$('live-feedback').classList.remove('show');render(paused?0:dt);requestAnimationFrame(frame);
}
updateSound();updateBest();resize();requestAnimationFrame(frame);
window.pauseLayer=()=>{if((state==='playing'||state==='falling')&&$('modal').hidden)openModal(true);};
window.layerBack=()=>{if(!$('modal').hidden){closeModal();return true;}if(state==='playing'||state==='falling'){openModal(true);return true;}if(state==='over'){goHome();return true;}return false;};
