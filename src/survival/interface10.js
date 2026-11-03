import {paintLoading11,startGallery11,nextGallery11} from './loading11.js';
import {MAP_SIZES,MAP_SEED,WORLD_RADIUS,ROADS,MONUMENTS} from './map-data.js';
import {terrainHeight} from './state.js';
import {biomeAt,worldTime} from './environment.js';
const $=id=>document.getElementById(id);
const TIPS=[
 'Начни с камня и факела. Дерево и камень нужны для первых инструментов.',
 'Дороги соединяют районы острова. Ищи бочки и ящики у дорожного мусора.',
 'На карте отмечены РТ, но не чужие дома. Свои метки можно поставить вручную.',
 'Под водой следи за воздухом. Space — всплыть, Ctrl — погрузиться.',
 'Спринт опускает оружие. Перед выстрелом отпусти Shift.',
 'Строительный план использует ресурсы напрямую. Киянка улучшает постройки.',
 'В мирных зонах оружие запрещено. Торговцы обменивают металлолом на припасы.'
];
let tip=0,progress=0,loadingAt=0,lastSecond=-1;
export function loading10(world){
 progress=0;loadingAt=performance.now();lastSecond=-1;startGallery11();
 $('loading-progress').style.transition='none';$('loading-progress').style.width='0%';
 $('loading-progress').offsetWidth; // Commit the reset before a second island starts loading.
 $('loading-progress').style.transition='';
 $('loading-meter10').setAttribute('aria-valuenow','0');$('loading-percent10').textContent='0%';
 $('loading-title10').textContent='ЗАГРУЗКА ОСТРОВА';$('loading-text').textContent='Подготовка локального мира…';
 $('loading-meta10').textContent=(MAP_SIZES[world?.size]?.width||650)+' М · ЗЕРНО '+(world?.seed||MAP_SEED)+' · OFFLINE';
 $('loading-tip10').textContent=TIPS[tip%TIPS.length];$('loading-time10').textContent='00:00';
 document.querySelectorAll('[data-load-step10]').forEach(el=>{el.classList.remove('done','active');});
 updateLoading10(0,'Подготовка локального мира…');
}
export function updateLoading10(ratio,label,stageRatio=ratio){
 // LoadingManager can discover embedded textures later; never let its changing total rewind the bar.
 progress=Math.max(progress,Math.min(1,Math.max(0,ratio)));
 const pct=Math.round(progress*100),phase=stageRatio<.86?0:stageRatio<.94?1:stageRatio<.98?2:3;
 $('loading-progress').style.width=pct+'%';$('loading-percent10').textContent=pct+'%';
 $('loading-meter10').setAttribute('aria-valuenow',String(pct));$('loading-text').textContent=label;
 $('loading-title10').textContent=progress>=1?'ОСТРОВ ГОТОВ':['ЗАГРУЗКА РЕСУРСОВ','СОЗДАНИЕ МИРА','ПОДГОТОВКА СНАРЯЖЕНИЯ','ПОДГОТОВКА ГРАФИКИ'][phase];
 document.querySelectorAll('[data-load-step10]').forEach((el,i)=>{el.classList.toggle('done',i<phase||progress>=1);el.classList.toggle('active',i===phase&&progress<1);});
 tickLoading10(performance.now());
}
export function tickLoading10(now){
 if($('loading').hidden)return;const seconds=Math.max(0,Math.floor((now-loadingAt)/1000));if(seconds===lastSecond)return;lastSecond=seconds;
 $('loading-time10').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
export function frontTab10(tab){
 for(const name of['news','play']){$('front-'+name+'10').hidden=name!==tab;$('nav-'+name+(name==='news'?'10':'')).classList.toggle('active',name===tab);$('nav-'+name+(name==='news'?'10':'')).setAttribute('aria-pressed',String(name===tab));}
 if(tab==='play')drawFrontMap10();
}
export function refreshFront10(saved){
 previewWorld11=saved;
 const size=MAP_SIZES[saved?.size||'small'],day=worldTime(saved?.elapsed||0).day;
 $('start-label').textContent=saved?'ПРОДОЛЖИТЬ':'СОЗДАТЬ МИР';
 $('front-world-name10').textContent=saved?'ОСТРОВ · '+saved.seed:'НОВЫЙ ОСТРОВ';
 $('front-world-state10').textContent=saved?((saved.contentRevision||3)>=6?'НОВЫЙ РЕЛЬЕФ · РЕВИЗИЯ 6':'ПРЕЖНИЙ РЕЛЬЕФ · БАЗА СОХРАНЕНА'):'НОВАЯ ГЕНЕРАЦИЯ · РЕВИЗИЯ 6';
 $('front-save-info10').textContent=saved?size.width+' × '+size.width+' М · ДЕНЬ '+day:'СОЗДАЙ СВОЙ ПЕРВЫЙ МИР';
 $('front-seed10').textContent=saved?String(saved.seed):'ВЫБИРАЕТСЯ ПРИ СОЗДАНИИ';
 $('front-size10').textContent=size.width+' × '+size.width+' М';
 $('front-multiplier10').textContent='×'+(saved?.multiplier||1);
 $('front-day10').textContent=saved?'ДЕНЬ '+day:'НОВАЯ ИГРА';
 $('front-map-note10').textContent=saved?'КАРТА СОХРАНЁННОГО ОСТРОВА':'ПРЕДПРОСМОТР · РАЗМЕР И ЗЕРНО МОЖНО ИЗМЕНИТЬ';
 $('world-select10').setAttribute('aria-label',saved?'Продолжить сохранённый мир':'Открыть создание нового мира');
 if(!$('front-play10').hidden)drawFrontMap10();
}
const previewKey11=s=>s?s.size+':'+s.seed+':'+s.contentRevision+':roads10':null;
let previewWorld11=null;
function drawFrontMap10(){
 const c=$('front-map10'),ctx=c.getContext('2d');ctx.fillStyle='#1a241b';ctx.fillRect(0,0,c.width,c.height);
 ctx.fillStyle='#8d9d79';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText('КАРТА ГОТОВИТСЯ ПРИ ВХОДЕ',c.width/2,c.height/2);ctx.textAlign='start';
 $('front-map-note10').textContent='ГЕНЕРАЦИЯ И ПРЕДПРОСМОТР — ПРИ ВХОДЕ НА ОСТРОВ';
 try{const cached=JSON.parse(localStorage.getItem('oskol.map-preview11'));if(!cached||cached.key!==previewKey11(previewWorld11)||typeof cached.image!=='string'||!cached.image.startsWith('data:image/jpeg;'))return;const key=cached.key,img=new Image();img.onload=()=>{if(key!==previewKey11(previewWorld11))return;ctx.drawImage(img,0,0,c.width,c.height);$('front-map-note10').textContent='СОХРАНЁННЫЙ ПРЕДПРОСМОТР · БЕЗ ГЕНЕРАЦИИ В МЕНЮ';};img.src=cached.image;}catch{}
}
export function cacheMapPreview11(state){
 const c=$('front-map10');renderTerrainPreview11();try{localStorage.setItem('oskol.map-preview11',JSON.stringify({key:previewKey11(state),image:c.toDataURL('image/jpeg',.7)}));}catch{}
}
function renderTerrainPreview11(){
 const c=$('front-map10'),ctx=c.getContext('2d'),s=c.width/(WORLD_RADIUS*2.18),ox=c.width/2,oz=c.height/2,step=WORLD_RADIUS/48;
 ctx.fillStyle='#263b3d';ctx.fillRect(0,0,c.width,c.height);
 for(let x=-WORLD_RADIUS;x<WORLD_RADIUS;x+=step)for(let z=-WORLD_RADIUS;z<WORLD_RADIUS;z+=step){
  const h=terrainHeight(x,z);if(h<.1)continue;const b=biomeAt(x,z).id;
  ctx.fillStyle=h<.85?'#b5ab89':b==='snow'?'#c5cec9':b==='arid'?'#ad9569':'#65735a';ctx.fillRect(ox+x*s,oz+z*s,step*s+1,step*s+1);
 }
 ctx.lineWidth=1;ctx.strokeStyle='#d6c6a2a6';
 for(const path of Object.values(ROADS)){ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(ox+p.x*s,oz+p.z*s):ctx.moveTo(ox+p.x*s,oz+p.z*s));ctx.stroke();}
 for(const m of MONUMENTS){if(m.kind==='oilrig')continue;ctx.fillStyle=m.safe?'#a7ce6b':'#d3c9ac';ctx.fillRect(ox+m.x*s-1.5,oz+m.z*s-1.5,3,3);}
 ctx.strokeStyle='#c8d0bc14';ctx.lineWidth=1;for(let i=0;i<c.width;i+=c.width/8){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,c.height);ctx.moveTo(0,i);ctx.lineTo(c.width,i);ctx.stroke();}
 ctx.fillStyle='#e0dfd3';ctx.font='bold 13px sans-serif';ctx.fillText('N ↑',c.width-36,22);
}
export function installInterface10(){
 $('loading-next-art11').addEventListener('click',nextGallery11);
 $('nav-news10').addEventListener('click',()=>frontTab10('news'));
 $('nav-play').addEventListener('click',()=>frontTab10('play'));
 $('front-play-button10').addEventListener('click',()=>frontTab10('play'));
 $('world-select10').addEventListener('click',()=>$('start').click());
 $('loading-next-tip10').addEventListener('click',()=>{$('loading-tip10').textContent=TIPS[++tip%TIPS.length];});
}

// Give the browser a paint opportunity before each CPU-heavy construction phase.
export const paintLoading10=paintLoading11;
