import { IslandWorld } from './world.js';
import { SurvivalAudio } from './audio.js';
import {monumentAt,locationName} from './map-data.js';
import {LOOT_TABLES} from './content.js';
import { icon } from './icons.js';
import { SAVE_KEY, ITEMS, RECIPES, newGame, canCraft, craft, consume, tick, harvest, placementCheck, placeBuilding, missionProgress, encodeSave, decodeSave, terrainHeight, clamp, MULTIPLIERS, MAP_SIZES, configureMap, MONUMENTS, BOT_BASES, ROADS, WORLD_RADIUS, BUILD_KINDS, TIERS, grantLoot, upgradeBuilding, repairBuilding, damageStructure, reload, nearStation } from './state.js';
const $=id=>document.getElementById(id);
const safeStorage={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);return true;}catch{return false;}}};
let settings;try{settings=JSON.parse(safeStorage.get('oskol.settings'))||{};}catch{settings={};}
settings={quality:['low','medium','high'].includes(settings.quality)?settings.quality:'high',sensitivity:clamp(Number(settings.sensitivity)||1,.3,2),sound:settings.sound!==false,haptics:settings.haptics!==false};
const query=new URLSearchParams(location.search);if(['low','medium','high'].includes(query.get('quality')))settings.quality=query.get('quality');
const audio=new SurvivalAudio();audio.setEnabled(settings.sound);
let world,state=newGame(),saved=decodeSave(safeStorage.get(SAVE_KEY)),mode='loading',ready=false,activeOverlay=null,settingsFrom='front',tab='items',recipeSelected='axe',lastTime=0,playTime=0,uiTimer=0,saveTimer=0,stepTimer=0,attackCooldown=0,jumpHeight=0,jumpVelocity=0,lastVitals='',lastInventory='',lastMissions='',lastTarget=null,preview=null,buildRotation=0,toastUntil=0,pickupTimers=[];
const keys=new Set(),touch={x:0,z:0,sprint:false},pointer={id:null,x:0,y:0,moved:false,down:false};let resumeFocus=null;
let lastFrameMs=0,smoothedFps=60,lastRendered=0;
const BUILD_ITEMS=BUILD_KINDS;
let setup={multiplier:1,size:'small',difficulty:'standard',seed:27182},starting=false,activeStructure=null;
const HOTBAR=['rock','axe','bandage','berries','foundation','torch'];
function initIcons(){document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
initIcons();
function haptic(ms=15){if(!settings.haptics)return;try{if(window.AndroidBridge)window.AndroidBridge.vibrate(ms);else navigator.vibrate?.(ms);}catch{}}
function toast(text,seconds=3){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=performance.now()+seconds*1000;}
function pickup(item,amount){const el=document.createElement('div');el.className='pickup';el.innerHTML=icon(ITEMS[item]?.icon||item)+`<span>${ITEMS[item]?.name||item}</span><b>+${amount}</b>`;$('pickup-feed').append(el);while($('pickup-feed').children.length>5)$('pickup-feed').firstChild.remove();pickupTimers.push({el,until:performance.now()+3200});}
function persistSettings(){safeStorage.set('oskol.settings',JSON.stringify(settings));}
function saveGame(notify=false){if(!ready||mode==='front'||mode==='loading')return false;const previous=safeStorage.get(SAVE_KEY);if(previous)safeStorage.set(SAVE_KEY+'.backup',previous);const okay=safeStorage.set(SAVE_KEY,encodeSave(state));$('save-status').textContent=okay?'МИР СОХРАНЁН НА УСТРОЙСТВЕ':'НЕ УДАЛОСЬ СОХРАНИТЬ: ХРАНИЛИЩЕ НЕДОСТУПНО';if(okay)saved=decodeSave(encodeSave(state));if(notify)toast(okay?'Мир сохранён.':'Хранилище недоступно. Прогресс не сохранён.',4);return okay;}
function releasePointer(){if(document.pointerLockElement)document.exitPointerLock?.();keys.clear();touch.x=touch.z=0;pointer.id=null;pointer.down=false;$('move-knob').style.transform='';}
function openOverlay(id){if(!ready)return;resumeFocus=document.activeElement;activeOverlay=id;releasePointer();$(id).hidden=false;if(id==='inventory')renderInventory();if(id==='map')drawMap();if(id==='settings')syncSettings();const focus=$(id).querySelector('button:not([disabled])');focus?.focus({preventScroll:true});}
function closeOverlay(){if(!activeOverlay)return;$(activeOverlay).hidden=true;activeOverlay=null;lastTime=performance.now();if(mode==='playing'&&state.dead){openOverlay('death');return;}resumeFocus?.focus?.({preventScroll:true});}
function syncSettings(){document.querySelectorAll('[data-quality]').forEach(b=>b.classList.toggle('active',b.dataset.quality===settings.quality));$('sensitivity').value=settings.sensitivity;$('audio-enabled').checked=settings.sound;$('haptics-enabled').checked=settings.haptics;document.body.classList.toggle('quality-low',settings.quality==='low');}
function showFront(){mode='front';activeOverlay=null;document.querySelectorAll('.overlay').forEach(el=>el.hidden=true);$('front').hidden=false;$('hud').hidden=true;$('cinematic-shade').hidden=false;world.clearPreview();preview=null;releasePointer();$('start-label').textContent=saved?'ПРОДОЛЖИТЬ ЖИЗНЬ':'НАЧАТЬ ВЫЖИВАНИЕ';$('new-game').hidden=!saved;$('rotate-warning').hidden=true;}
async function startGame(fresh=false,options=setup){
 if(!ready||starting)return;starting=true;audio.init();audio.setEnabled(settings.sound);
 const next=fresh?newGame(options):(saved?decodeSave(encodeSave(saved)):newGame(options));
 try{
  if(world.mapSignature!==next.size+'-'+next.seed){
   ready=false;mode='loading';releasePointer();document.querySelectorAll('.overlay').forEach(el=>el.hidden=true);$('front').hidden=true;$('hud').hidden=true;$('loading').hidden=false;$('loading-text').textContent='Создаём новый остров…';
   world.dispose();configureMap(next.size,next.seed);world=new IslandWorld($('world'),settings);await world.init((r,label)=>{$('loading-progress').style.width=Math.round(r*100)+'%';$('loading-text').textContent=label;});world.mapSignature=next.size+'-'+next.seed;ready=true;$('loading').hidden=true;
  }
  state=next;if(state.dead){state.dead=false;state.health=65;state.hunger=Math.max(40,state.hunger);state.thirst=Math.max(40,state.thirst);state.position={x:4,z:21};}
  world.syncState(state);mode='playing';activeOverlay=null;document.querySelectorAll('.overlay').forEach(el=>el.hidden=true);$('front').hidden=true;$('hud').hidden=false;$('cinematic-shade').hidden=true;lastTime=performance.now();saveTimer=0;uiTimer=0;lastInventory='';lastMissions='';world.camera.position.set(state.position.x,world.floorHeight(state.position.x,state.position.z,state)+1.72,state.position.z);world.camera.rotation.set(state.pitch,state.yaw,0,'YXZ');
  if(!window.matchMedia('(pointer:coarse)').matches)$('look-hint').hidden=false;updateHUD();saveGame();checkRotate();toast(fresh?'Остров создан. Добыча ×'+state.multiplier+' · '+MAP_SIZES[state.size].name+' мир':'Ты снова на острове. Добыча ×'+state.multiplier,5);
 }catch(error){console.error(error);$('fatal').hidden=false;$('fatal-text').textContent='Не удалось создать мир. Попробуй меньший размер или более низкую графику.';}finally{starting=false;}
}
function chooseItem(item){if(!(state.inventory[item]>0)&&!BUILD_ITEMS.includes(item)){toast(item==='axe'?'Сначала создай топор в рюкзаке.':'Этого предмета нет в рюкзаке.');return;}
 if(item==='rifle'&&state.selected==='rifle'){doReload();return;}
 if(['berries','water','bandage'].includes(item)){if(consume(state,item)){audio.pickup();toast(item==='berries'?'Голод отступает.':item==='water'?'Жажда утолена.':'Рана перевязана. +35 здоровья');haptic(10);updateHUD();}else toast(item==='bandage'?'Здоровье уже полное.':'Предмет закончился.');return;}
 state.selected=item;buildRotation=0;world.clearPreview();preview=null;updateHUD();if(BUILD_ITEMS.includes(item)&&!(state.inventory[item]>0))toast('Сначала создай эту постройку в разделе «Стройка».');}
function targetLabel(target){if(!target)return null;
 if(target.type==='structure'){const b=target.data,hp=b.owner?(state.structureDamage[b.id]??TIERS[b.tier].hp):b.hp;return[(b.owner?'ЧУЖОЙ ':'')+(ITEMS[b.kind]?.name||'ПОСТРОЙКА').toUpperCase()+' / '+TIERS[b.tier].name,`${Math.ceil(hp)} / ${TIERS[b.tier].hp} HP · `+(b.owner?'УДАР — РАЗРУШИТЬ':state.selected==='hammer'?'E — УЛУЧШИТЬ / РЕМОНТ':'КИЯНКА — УЛУЧШЕНИЕ')];}
 if(target.type==='bot')return['СКИТАЛЕЦ / '+({patrol:'ПАТРУЛЬ',gather:'ДОБЫЧА',return:'ВОЗВРАЩАЕТСЯ',defend:'ЗАЩИЩАЕТ БАЗУ'}[target.bot.mode]||'ОХРАНА'),'ВОЗЛЕ ЧУЖОЙ БАЗЫ ОПАСНО'];
 return({tree:['ДЕРЕВО','УДАР — ДОБЫТЬ ДРЕВЕСИНУ'],rock:['КАМЕННЫЙ ВЫХОД','УДАР — ДОБЫТЬ КАМЕНЬ'],metalOre:['МЕТАЛЛИЧЕСКАЯ РУДА','КИРКА УСКОРИТ ДОБЫЧУ'],sulfurOre:['СЕРНАЯ РУДА','ДЛЯ ПЕРЕПЛАВКИ В ПЕЧИ'],fiber:['ДИКОЕ ВОЛОКНО','E / ДЕЙСТВИЕ — СОБРАТЬ'],berries:['ЯГОДНЫЙ КУСТ','E / ДЕЙСТВИЕ — СОБРАТЬ'],crate:[target.owner?'ЯЩИК ЧУЖОЙ БАЗЫ':'ЗАБЫТЫЙ ЯЩИК','E / ДЕЙСТВИЕ — ОБЫСКАТЬ'],barrel:['РЖАВАЯ БОЧКА','УДАР — РАЗБИТЬ И ЗАБРАТЬ ЛУТ'],radio:['РАДИОСТАНЦИЯ',state.radioFixed?'СИГНАЛ ВОССТАНОВЛЕН':'E — ПОДКЛЮЧИТЬ АККУМУЛЯТОР'],door:['ДЕРЕВЯННАЯ ДВЕРЬ','E — '+(target.data?.open?'ЗАКРЫТЬ':'ОТКРЫТЬ')],furnace:['КАМЕННАЯ ПЕЧЬ','E — ПЕРЕПЛАВКА РУДЫ'],workbench:['ВЕРСТАК','E — ПРОДВИНУТЫЙ КРАФТ'],wolf:['ДИКИЙ ВОЛК','УДАР — ЗАЩИЩАТЬСЯ']})[target.type];}
function award(table){for(const result of grantLoot(state,table))pickup(result.item,result.amount);updateHUD();}
function alertBots(bot){bot.alertUntil=world.time+70;for(const other of world.bots)if(other.base&&other.base===bot.base)other.alertUntil=world.time+70;}
function hitBot(bot,amount){alertBots(bot);bot.hp=Math.max(0,bot.hp-amount);state.botState[bot.id]={hp:bot.hp};world.hitEffect(bot,0x9d8a6c);if(bot.hp<=0){bot.dead=true;bot.model.visible=bot.weapon.visible=false;award({scrap:3,fiber:4,ammo:5});toast('Скиталец повержен. Его база остаётся на острове.');saveGame();}}
function refreshStructure(b){const entry=world.built.get(b.id)||world.staticStructures.find(e=>e.data.id===b.id);if(!entry)return;if(b.owner?state.depleted.includes(b.id):b.hp<=0){entry.model.visible=false;world.interactables=world.interactables.filter(i=>i.id!==b.id);}else world.applyBuildingTier(entry);}
function hitStructure(b,amount){const hp=damageStructure(state,b,amount);world.hitEffect(b,b.tier>=2?0x8d9185:0x8d7250);if(hp<=0){refreshStructure(b);toast('Проход открыт. Постройка разрушена.');saveGame();}}
function doReload(){if(state.selected!=='rifle'||activeOverlay)return;if(reload(state)){attackCooldown=1.1;audio.burst(.2,.25,1800);toast('Перезарядка · '+state.magazine+' / 6',1.2);updateHUD();}else toast('Нет подходящих патронов или магазин полон.');}
function doAction(isAttack=false){
 if(mode!=='playing'||activeOverlay||state.dead)return;audio.init();
 if(BUILD_ITEMS.includes(state.selected)){placePreview();return;}
 const target=world.target(state);
 if(!isAttack&&target?.type==='crate'){
  if(state.looted.includes(target.id))return;
  if(target.owner){const closed=world.staticStructures.filter(e=>e.data.owner===target.owner&&['door','wall'].includes(e.data.kind)).every(e=>!state.depleted.includes(e.data.id));if(closed){toast('Чужая база закрыта. Разрушь дверь или стену.');return;}}
  state.looted.push(target.id);const table=target.lootType?{...LOOT_TABLES[target.lootType],...target.special}:{scrap:target.id==='crate-tower'?4:2,fiber:3,water:1};if(target.owner)table.wood=15+(state.botStores[target.owner]||0);award(table);audio.pickup();haptic();target.model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.multiplyScalar(.55);}});saveGame();return;
 }
 if(!isAttack&&target?.type==='radio'){if(state.radioFixed){toast('Передатчик работает.');return;}if(state.inventory.battery<=0){toast('Собери аккумулятор: 6 металлолома + 8 волокна.',4);return;}state.inventory.battery--;state.radioFixed=true;audio.craft();saveGame();updateHUD();openOverlay('victory');return;}
 if(!isAttack&&['furnace','workbench'].includes(target?.type)){tab=target.type==='furnace'?'process':'craft';openOverlay('inventory');return;}
 if(!isAttack&&target?.type==='door'){target.data.open=!target.data.open;target.model.userData.doorPivot.rotation.y=target.data.open?1.6:0;audio.burst(.2,.18,400);return;}
 if(!isAttack&&target?.type==='structure'){
  if(target.data.owner){toast('Чужой элемент. Вскрывай инструментом или зарядом.');return;}
  if(state.selected==='hammer'){activeStructure=target.data;openStructurePanel();return;}
  if(target.data.kind==='door'){target.data.open=!target.data.open;target.model.userData.doorPivot.rotation.y=target.data.open?1.6:0;return;}
  toast('Возьми киянку для улучшения или ремонта.');return;
 }
 if(attackCooldown>0)return;
 if(state.selected==='rifle'){
  if(!state.inventory.rifle)return;if(state.magazine<=0){toast('Магазин пуст. R — перезарядка. На телефоне нажми слот винтовки.',2);return;}
  state.magazine--;attackCooldown=.37;world.swing=.22;audio.burst(.22,1,3100);audio.tone(80,.15,.4,'sawtooth');haptic(35);
  const direction=world.camera.getWorldDirection(new world.camera.position.constructor());const end=target?new world.camera.position.constructor(target.x,terrainHeight(target.x,target.z)+1,target.z):world.camera.position.clone().addScaledVector(direction,80);world.tracer(world.camera.position.clone().addScaledVector(direction,.7),end);
  if(target?.type==='bot')hitBot(target.bot,42);if(target?.type==='wolf'){target.wolf.hp-=45;if(target.wolf.hp<=0){target.wolf.dead=true;target.wolf.model.visible=false;state.depleted.push(target.wolf.id);}}if(target?.type==='structure')hitStructure(target.data,target.data.tier===3?2:12);updateHUD();return;
 }
 if(state.selected==='satchel'){
  if(!target||target.type!=='structure'){toast('Наведи заряд на дверь или стену с расстояния до 5 м.');return;}if(!state.inventory.satchel)return;state.inventory.satchel--;attackCooldown=1.7;audio.burst(.6,1.2,220);haptic(80);hitStructure(target.data,300);if(Math.hypot(target.x-state.position.x,target.z-state.position.z)<3)takeDamage(20);updateHUD();return;
 }
 attackCooldown=state.selected==='axe'||state.selected==='pickaxe'?.43:.62;world.swing=1;
 if(target?.type==='structure'){hitStructure(target.data,state.selected==='axe'?22:state.selected==='pickaxe'?28:8);audio.hit('rock');haptic(20);return;}
 if(target?.type==='bot'){hitBot(target.bot,state.selected==='axe'?28:state.selected==='pickaxe'?24:14);audio.hit('tree');haptic(25);return;}
 if(target?.type==='barrel'){const remain=(state.nodeDamage[target.id]??3)-(state.selected==='axe'||state.selected==='pickaxe'?2:1);state.nodeDamage[target.id]=Math.max(0,remain);audio.hit('rock');haptic(20);world.hitEffect(target,0x785c43);if(remain<=0){state.looted.push(target.id);state.depleted.push(target.id);target.model.visible=false;award(LOOT_TABLES.barrel);saveGame();}return;}
 if(target?.type==='wolf'){const wolf=target.wolf;wolf.hp-=state.selected==='axe'?28:14;world.hitEffect(wolf,0xb39a78);audio.hit('tree');haptic(25);if(wolf.hp<=0){wolf.dead=true;wolf.model.visible=false;state.depleted.push(wolf.id);saveGame();}return;}
 if(target&&['tree','rock','metalOre','sulfurOre','fiber','berries'].includes(target.type)){
  const result=harvest(state,target);if(!result)return;pickup(result.item,result.amount);audio.hit(target.type);haptic(18);world.hitEffect(target,target.type==='tree'?0xb7a178:0x929384);$('crosshair').classList.add('hit');setTimeout(()=>$('crosshair').classList.remove('hit'),140);if(result.depleted)world.hideNode(target);updateHUD();return;
 }
 audio.burst(.11,.12,700);if(!isAttack)toast('Наведи прицел на ресурс, ящик, бочку или постройку.',2);
}
function openStructurePanel(){renderStructurePanel();openOverlay('structure-panel');}
function renderStructurePanel(){const b=activeStructure;if(!b)return;const tier=TIERS[b.tier],next=TIERS[b.tier+1];$('structure-title').textContent=ITEMS[b.kind].name.toUpperCase();$('structure-details').textContent=`${tier.name} · ${Math.ceil(b.hp)} / ${tier.hp} HP\n`+(next?'Следующий уровень: '+next.name+'\n'+Object.entries(next.cost).map(([k,n])=>ITEMS[k].name+': '+state.inventory[k]+' / '+n).join(' · '):'Максимальный уровень.');$('upgrade-structure').disabled=!next||!Object.entries(next.cost).every(([k,n])=>state.inventory[k]>=n);}
$('upgrade-structure').addEventListener('click',()=>{const result=upgradeBuilding(state,activeStructure);if(result.ok){refreshStructure(activeStructure);audio.craft();saveGame();renderStructurePanel();}else toast(result.reason);});
$('repair-structure').addEventListener('click',()=>{if(repairBuilding(state,activeStructure)){saveGame();renderStructurePanel();}else toast('Не нужен ремонт или не хватает ресурсов.');});
$('demolish-structure').addEventListener('click',()=>{if(activeStructure){activeStructure.hp=0;refreshStructure(activeStructure);saveGame();closeOverlay();updateHUD();}});$('structure-close').addEventListener('click',closeOverlay);
function getPreview(){
 const kind=state.selected;if(!BUILD_ITEMS.includes(kind))return null;
 const dist=kind==='campfire'?3.2:4.4;let x=state.position.x-Math.sin(state.yaw)*dist,z=state.position.z-Math.cos(state.yaw)*dist,rotation=buildRotation;
 if(kind==='foundation'){x=Math.round(x/3)*3;z=Math.round(z/3)*3;}
 if(['wall','door','roof'].includes(kind)){
  const bases=state.buildings.filter(b=>b.kind==='foundation');let base=null,nearest=5;
  for(const b of bases){const d=Math.hypot(b.x-x,b.z-z);if(d<nearest){nearest=d;base=b;}}
  if(base){if(kind==='roof'){x=base.x;z=base.z;rotation=0;}else{const edge=Math.round((Math.atan2(x-base.x,z-base.z)+buildRotation)/(Math.PI/2));const angle=edge*Math.PI/2;x=base.x+Math.sin(angle)*1.5;z=base.z+Math.cos(angle)*1.5;rotation=angle;}}
 }
 let check=placementCheck(state,kind,x,z,rotation);
 if(check.ok&&Math.hypot(x+7,z+5)<6)check={ok:false,reason:'Место занято лагерем'};
 if(check.ok&&world.nodes.some(n=>!state.depleted.includes(n.id)&&['tree','rock','metalOre','sulfurOre'].includes(n.type)&&Math.hypot(n.x-x,n.z-z)<(kind==='foundation'?2:.7)))check={ok:false,reason:'Сначала убери дерево или камень'};
 if(check.ok&&kind==='campfire'&&state.buildings.some(b=>Math.hypot(b.x-x,b.z-z)<1.1))check={ok:false,reason:'Слишком близко к постройке'};
 return{kind,x,z,rotation,...check};
}
function placePreview(){preview=getPreview();if(!preview)return;if(!preview.ok){toast(preview.reason);return;}if(state.buildings.length>=400){toast('Лимит текущей итерации: 400 элементов постройки.');return;}const result=placeBuilding(state,preview.kind,preview.x,preview.z,preview.rotation);if(result.ok){world.addBuilding(result.building);audio.craft();haptic(25);toast('Установлено: '+ITEMS[preview.kind].name);saveGame();if(!state.inventory[preview.kind]){state.selected=state.inventory.axe>0?'axe':'rock';world.clearPreview();}updateHUD();}}
function rotateBuild(){buildRotation+=Math.PI/2;audio.tone(300,.05,.05);}
function takeDamage(amount){if(state.dead)return;state.health=Math.max(0,state.health-amount*(state.inventory.armor>0?.7:1));audio.damage();haptic(45);$('damage-flash').style.opacity='.6';setTimeout(()=>$('damage-flash').style.opacity='0',180);if(state.health<=0)state.dead=true;}
function renderHotbar(){
 const selected=state.selected;const signature=JSON.stringify([state.inventory,selected,state.magazine]);if(signature===lastInventory)return;lastInventory=signature;
 const slots=[...HOTBAR];if(['pickaxe','hammer'].includes(selected))slots[0]=selected;if(selected==='rifle'||state.inventory.rifle>0)slots[1]='rifle';if(selected==='satchel')slots[3]='satchel';if(BUILD_ITEMS.includes(selected))slots[4]=selected;
 $('hotbar').innerHTML=slots.map((item,index)=>`<button class="hotbar-slot ${selected===item?'active':''} ${!state.inventory[item]?'empty':''}" data-item="${item}" aria-label="${ITEMS[item].name}" title="${ITEMS[item].name}"><span class="slot-num">${index+1}</span>${icon(ITEMS[item].icon)}<span class="slot-count">${item==='rifle'?state.magazine+'/6':state.inventory[item]||''}</span></button>`).join('');
 $('equipped-label').textContent=ITEMS[selected]?.name.toUpperCase()||'КАМЕНЬ В РУКЕ';$('build-hint').hidden=!BUILD_ITEMS.includes(selected);$('rotate-build').hidden=!BUILD_ITEMS.includes(selected);$('build-name').textContent=ITEMS[selected]?.name.toUpperCase()||'';
}
function updateHUD(){
 renderHotbar();for(const[k,name]of[['health','health'],['hunger','hunger'],['thirst','thirst']]){$(name+'-value').textContent=Math.ceil(state[k]);$(name+'-bar').style.width=state[k]+'%';}$('stamina-bar').style.width=state.stamina+'%';
 const missions=missionProgress(state),signature=JSON.stringify(missions);if(signature!==lastMissions){lastMissions=signature;let active=missions.find(m=>!m.done)?.id;$('mission-list').innerHTML=missions.map(m=>`<div class="mission-row ${m.done?'done':''} ${m.id===active?'current':''}"><span class="check"></span><div>${m.title}<small>${m.detail}</small></div></div>`).join('');$('mission-count').textContent=missions.filter(m=>m.done).length+' / 4';}
 const elapsedMinutes=8*60+35+state.elapsed/1200*1440,minutes=Math.floor(elapsedMinutes%1440);$('location-name').textContent=locationName(state.position.x,state.position.z).toUpperCase();$('clock').textContent=`ДЕНЬ ${String(1+Math.floor(elapsedMinutes/1440)).padStart(2,'0')} · ${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
 const heading=(((-state.yaw*180/Math.PI)%360)+360)%360;const labels=['N','NE','E','SE','S','SW','W','NW'];$('heading').textContent=labels[Math.round(heading/45)%8]+' · '+String(Math.round(heading)).padStart(3,'0')+'°';$('compass-ticks').textContent=labels.map((_,i)=>labels[(Math.floor(heading/45)+i+5)%8]).join(' ┆ ');
 const target=world.target(state),label=targetLabel(target);lastTarget=target;$('target-card').hidden=!label;if(label){$('target-name').textContent=label[0];$('target-action').textContent=label[1];$('target-health').style.width=(target.hp?target.remaining/target.hp*100:100)+'%';}
 if(BUILD_ITEMS.includes(state.selected)){
  preview=getPreview();world.preview(preview.kind,preview,preview.rotation,preview.ok);$('build-name').textContent=ITEMS[state.selected].name.toUpperCase();$('build-hint').firstChild.textContent=preview.ok?'МОЖНО УСТАНОВИТЬ':'НЕЛЬЗЯ: '+preview.reason.toUpperCase();
 }else world.clearPreview();
}
function renderInventory(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const host=$('inventory-content');
 if(tab==='items'){
  const ids=Object.keys(ITEMS);host.innerHTML='<div class="item-grid">'+ids.map(id=>`<button class="item-card ${state.inventory[id]?'':'unavailable'}" data-use="${id}"><span class="item-count">${state.inventory[id]||0}</span>${icon(ITEMS[id].icon)}<span class="item-label">${ITEMS[id].name}</span></button>`).join('')+'</div><p class="inventory-help">Нажми на воду, ягоды или бинт, чтобы использовать. Топор и камень — взять в руку. Элемент постройки — перейти к установке.<br>Волокно добывается с низких растений. Ящики в лагере и у радиомачты содержат металл, воду и ткань.</p>';
 }else{
  const category=tab==='build'?'build':tab==='process'?'process':'tools',recipes=Object.entries(RECIPES).filter(([,r])=>r.category===category);if(!recipes.some(([id])=>id===recipeSelected))recipeSelected=recipes[0][0];
  const recipe=RECIPES[recipeSelected],available=canCraft(state,recipeSelected),owned=state.inventory[recipeSelected]||0;
  host.innerHTML=`<div class="recipes-layout"><div class="recipe-list">${recipes.map(([id,r])=>`<button class="recipe-row ${id===recipeSelected?'active':''}" data-recipe="${id}">${icon(ITEMS[id].icon)}<span>${r.name}</span><small>${canCraft(state,id)?'+' : '—'}</small></button>`).join('')}</div><div class="recipe-detail"><div class="recipe-hero-icon">${icon(ITEMS[recipeSelected].icon)}</div><h3>${recipe.name}</h3><p>${recipe.description}${recipe.station&&!nearStation(state,recipe.station)?'<br>НУЖНО ПОДОЙТИ К УСТАНОВЛЕННОЙ СТАНЦИИ':''}${owned?`<br>В рюкзаке: ${owned}`:''}</p><div class="recipe-cost">${Object.entries(recipe.cost).map(([id,n])=>`<div class="cost-row ${(state.inventory[id]||0)<n?'missing':''}">${icon(ITEMS[id].icon)}<span>${ITEMS[id].name}</span><b>${state.inventory[id]||0} / ${n}</b></div>`).join('')}</div><button id="craft-item" class="orange-button" ${available?'':'disabled'}><span>${available?'СОЗДАТЬ':'НЕ ХВАТАЕТ РЕСУРСОВ'}</span><span>↗</span></button>${owned&&tab==='build'?'<button id="equip-building" class="menu-row">ВЗЯТЬ И УСТАНОВИТЬ <span>↗</span></button>':''}</div></div>`;
  $('craft-item')?.addEventListener('click',()=>{if(craft(state,recipeSelected)){audio.craft();haptic(15);if(['axe','pickaxe','hammer','rifle'].includes(recipeSelected))state.selected=recipeSelected;pickup(recipeSelected,RECIPES[recipeSelected].output||1);renderInventory();updateHUD();saveGame();}});
  $('equip-building')?.addEventListener('click',()=>{chooseItem(recipeSelected);closeOverlay();});
 }
}
function drawMap(){
 const c=$('map-canvas'),ctx=c.getContext('2d');ctx.fillStyle='#172f2b';ctx.fillRect(0,0,600,520);const unit=235/WORLD_RADIUS,ox=300,oz=260;
 for(let x=-WORLD_RADIUS;x<WORLD_RADIUS;x+=WORLD_RADIUS/90)for(let z=-WORLD_RADIUS;z<WORLD_RADIUS;z+=WORLD_RADIUS/90){const h=terrainHeight(x,z);if(h<.1)continue;const n=clamp((h+1)/9,0,1);ctx.fillStyle=h<1?'#79795a':`rgb(${38+n*58},${61+n*56},${38+n*32})`;ctx.fillRect(ox+x*unit,oz+z*unit,unit*WORLD_RADIUS/90+1,unit*WORLD_RADIUS/90+1);}
 ctx.strokeStyle='#d3ddaa16';ctx.lineWidth=1;for(let i=0;i<600;i+=50){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,520);ctx.stroke();}for(let i=0;i<520;i+=50){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(600,i);ctx.stroke();}
 const marker=(x,z,text,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(ox+x*unit,oz+z*unit,4,0,6.28);ctx.fill();ctx.font='9px Arial';ctx.fillText(text,ox+x*unit+10,oz+z*unit+3);};
 for(const path of Object.values(ROADS)){ctx.strokeStyle='#b2a67999';ctx.lineWidth=2;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(ox+p.x*unit,oz+p.z*unit):ctx.moveTo(ox+p.x*unit,oz+p.z*unit));ctx.stroke();}for(const m of MONUMENTS)marker(m.x,m.z,m.name,state.visited.includes(m.id)?'#d2bd8e':'#8c9e89');for(const b of BOT_BASES)marker(b.x,b.z,'БАЗА','#a56a54');marker(-7,-5,'ЛАГЕРЬ','#c9c9a5');marker(-31,-31,'ПЕРЕДАТЧИК','#dda06e');for(const b of state.buildings)if(b.kind==='foundation')marker(b.x,b.z,'УКРЫТИЕ','#a6bc82');marker(state.position.x,state.position.z,'ТЫ','#ee8b51');ctx.save();ctx.translate(ox+state.position.x*unit,oz+state.position.z*unit);ctx.rotate(-state.yaw);ctx.fillStyle='#ee8b5177';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-8,-19);ctx.lineTo(8,-19);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#aaba93';ctx.font='11px Arial';ctx.fillText('N ↑',560,27);ctx.font='8px Arial';ctx.fillStyle='#92a883';ctx.fillText('0 ───────── 50 м',23,496);
}
function openInventory(nextTab='items'){if(mode!=='playing'||activeOverlay)return;tab=nextTab;openOverlay('inventory');}
document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{setup.size=b.dataset.size;document.querySelectorAll('[data-size]').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelectorAll('[data-multiplier]').forEach(b=>b.addEventListener('click',()=>{setup.multiplier=Number(b.dataset.multiplier);document.querySelectorAll('[data-multiplier]').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelectorAll('[data-difficulty]').forEach(b=>b.addEventListener('click',()=>{setup.difficulty=b.dataset.difficulty;document.querySelectorAll('[data-difficulty]').forEach(x=>x.classList.toggle('active',x===b));}));
$('random-seed').addEventListener('click',()=>{$('world-seed').value=1+Math.floor(Math.random()*999999998);});$('setup-close').addEventListener('click',closeOverlay);
$('world-create').addEventListener('click',()=>{const seed=Number($('world-seed').value);if(!Number.isInteger(seed)||seed<1||seed>999999999){toast('Зерно — целое число от 1 до 999999999.');return;}setup.seed=seed;startGame(true,setup);});
$('start').addEventListener('click',()=>{if(saved)startGame();else openOverlay('world-setup');});$('new-game').addEventListener('click',()=>openOverlay('confirm-new'));$('confirm-reset').addEventListener('click',()=>{closeOverlay();openOverlay('world-setup');});$('cancel-reset').addEventListener('click',closeOverlay);
$('nav-play').addEventListener('click',()=>{});$('nav-journal').addEventListener('click',()=>openOverlay('journal'));$('journal-close').addEventListener('click',closeOverlay);
$('nav-settings').addEventListener('click',()=>{settingsFrom='front';openOverlay('settings');});$('pause-settings').addEventListener('click',()=>{$('pause').hidden=true;settingsFrom='pause';openOverlay('settings');});
function closeSettings(){closeOverlay();if(settingsFrom==='pause')openOverlay('pause');}
$('settings-close').addEventListener('click',closeSettings);$('settings-done').addEventListener('click',closeSettings);
document.querySelectorAll('[data-quality]').forEach(b=>b.addEventListener('click',()=>{settings.quality=b.dataset.quality;world.applyQuality(settings.quality);syncSettings();persistSettings();}));
$('sensitivity').addEventListener('input',e=>{settings.sensitivity=Number(e.target.value);persistSettings();});$('audio-enabled').addEventListener('change',e=>{settings.sound=e.target.checked;audio.init();audio.setEnabled(settings.sound);persistSettings();});$('haptics-enabled').addEventListener('change',e=>{settings.haptics=e.target.checked;persistSettings();});
$('pause-button').addEventListener('click',()=>openOverlay('pause'));$('resume').addEventListener('click',closeOverlay);$('restore-backup').addEventListener('click',()=>{if(!safeStorage.get(SAVE_KEY+'.backup')){toast('Резервной копии пока нет.');return;}$('pause').hidden=true;openOverlay('backup-confirm');});$('cancel-backup').addEventListener('click',()=>{closeOverlay();openOverlay('pause');});$('confirm-backup').addEventListener('click',()=>{const backup=decodeSave(safeStorage.get(SAVE_KEY+'.backup'));if(!backup){toast('Копия повреждена или несовместима.');return;}saved=backup;closeOverlay();startGame();});
$('save-now').addEventListener('click',()=>saveGame(true));$('save-exit').addEventListener('click',()=>{saveGame();showFront();});
$('inventory-button').addEventListener('click',()=>openInventory());$('inventory-close').addEventListener('click',closeOverlay);$('inventory-return').addEventListener('click',closeOverlay);
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;renderInventory();}));
$('inventory-content').addEventListener('click',e=>{const r=e.target.closest('[data-recipe]');if(r){recipeSelected=r.dataset.recipe;renderInventory();return;}const item=e.target.closest('[data-use]');if(item&&state.inventory[item.dataset.use]>0){const id=item.dataset.use;if(['water','berries','bandage'].includes(id)){chooseItem(id);renderInventory();}else if(['rock','axe','pickaxe','hammer','rifle','satchel','torch',...BUILD_ITEMS].includes(id)){chooseItem(id);closeOverlay();}}});
$('hotbar').addEventListener('click',e=>{const item=e.target.closest('[data-item]');if(item)chooseItem(item.dataset.item);});
$('map-button').addEventListener('click',()=>openOverlay('map'));$('map-close').addEventListener('click',closeOverlay);
$('respawn').addEventListener('click',()=>{state.dead=false;state.health=70;state.hunger=Math.max(50,state.hunger);state.thirst=Math.max(50,state.thirst);state.position={x:4,z:21};state.pitch=0;state.yaw=-.18;jumpHeight=jumpVelocity=0;$('death').hidden=true;activeOverlay=null;updateHUD();saveGame();toast('Берег дал тебе ещё один шанс.');});
$('continue-world').addEventListener('click',closeOverlay);
$('attack-button').addEventListener('pointerdown',e=>{e.preventDefault();doAction(true);});$('interact-button').addEventListener('pointerdown',e=>{e.preventDefault();doAction();});$('jump-button').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('sprint-button').addEventListener('click',()=>{touch.sprint=!touch.sprint;$('sprint-button').classList.toggle('active',touch.sprint);});$('rotate-build').addEventListener('click',rotateBuild);
function jump(){if(mode==='playing'&&!activeOverlay&&jumpHeight<=.01){jumpVelocity=4.4;audio.burst(.08,.1,430);}}
function look(dx,dy){state.yaw-=dx*.0024*settings.sensitivity;state.pitch=clamp(state.pitch-dy*.0024*settings.sensitivity,-1.35,1.35);$('look-hint').hidden=true;}
function lockPointer(){if(window.matchMedia('(pointer:coarse)').matches)return;try{const p=$('world').requestPointerLock?.();p?.catch(()=>{});}catch{}}
$('look-hint').addEventListener('click',()=>{lockPointer();$('look-hint').hidden=true;});
$('world').addEventListener('pointerdown',e=>{
 if(mode!=='playing'||activeOverlay||e.pointerType==='touch'&&e.clientX<window.innerWidth*.42)return;
 audio.init();if(document.pointerLockElement===$('world')){if(e.button===0)doAction(true);return;}
 pointer.id=e.pointerId;pointer.x=e.clientX;pointer.y=e.clientY;pointer.moved=false;pointer.down=true;try{$('world').setPointerCapture(e.pointerId);}catch{}
});
$('world').addEventListener('pointermove',e=>{
 if(mode!=='playing'||activeOverlay)return;
 if(document.pointerLockElement===$('world')){look(e.movementX,e.movementY);return;}
 if(pointer.id===e.pointerId&&pointer.down){const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)+Math.abs(dy)>2)pointer.moved=true;look(dx*(e.pointerType==='touch'?1.5:1),dy*(e.pointerType==='touch'?1.5:1));pointer.x=e.clientX;pointer.y=e.clientY;}
});
$('world').addEventListener('pointerup',e=>{if(pointer.id!==e.pointerId)return;if(!pointer.moved&&mode==='playing'&&!activeOverlay){if(e.pointerType==='touch')doAction(true);else{lockPointer();$('look-hint').hidden=true;}}pointer.down=false;pointer.id=null;});
$('world').addEventListener('pointercancel',()=>{pointer.down=false;pointer.id=null;});$('world').addEventListener('contextmenu',e=>e.preventDefault());
const pad=$('move-pad');let padPointer=null;
function movePad(e){const b=pad.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;let x=e.clientX-cx,z=e.clientY-cy;const max=b.width*.34,len=Math.hypot(x,z);if(len>max){x=x/len*max;z=z/len*max;}touch.x=x/max;touch.z=z/max;$('move-knob').style.transform=`translate(${x}px,${z}px)`;}
pad.addEventListener('pointerdown',e=>{e.preventDefault();padPointer=e.pointerId;pad.setPointerCapture(e.pointerId);movePad(e);});pad.addEventListener('pointermove',e=>{if(e.pointerId===padPointer)movePad(e);});
function stopPad(e){if(e.pointerId!==padPointer)return;padPointer=null;touch.x=touch.z=0;$('move-knob').style.transform='';}pad.addEventListener('pointerup',stopPad);pad.addEventListener('pointercancel',stopPad);
document.addEventListener('keydown',e=>{
 if(e.code==='Escape'){e.preventDefault();if(activeOverlay==='settings')closeSettings();else if(activeOverlay)closeOverlay();else if(mode==='playing')openOverlay('pause');return;}
 if(activeOverlay){if(e.code==='Tab'){const focusable=[...$(activeOverlay).querySelectorAll('button:not([disabled]),input,summary,a')].filter(el=>el.offsetParent!==null);const i=focusable.indexOf(document.activeElement);if(focusable.length){e.preventDefault();focusable[(i+(e.shiftKey?-1:1)+focusable.length)%focusable.length].focus();}}return;}
 if(mode!=='playing')return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;
 if(e.code==='KeyE')doAction();if(e.code==='KeyF')doAction(true);if(e.code==='KeyI'||e.code==='Tab'){e.preventDefault();openInventory();}if(e.code==='KeyC')openInventory('craft');if(e.code==='KeyB')openInventory('build');if(e.code==='KeyM')openOverlay('map');if(e.code==='KeyR'){if(BUILD_ITEMS.includes(state.selected))rotateBuild();else doReload();}if(e.code==='Space')jump();if(e.code==='KeyT')chooseItem(state.selected==='torch'?'rock':'torch');if(/^Digit[1-6]$/.test(e.code)){const n=Number(e.code.slice(-1))-1;const item=$('hotbar').children[n]?.dataset.item;if(item)chooseItem(item);}
});
document.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&mode==='playing'&&!activeOverlay)$('look-hint').hidden=false;});
window.addEventListener('blur',()=>{if(mode==='playing'&&!activeOverlay)openOverlay('pause');});
function pauseNative(){if(mode==='playing'){saveGame();if(!activeOverlay)openOverlay('pause');}}
window.pauseLayer=pauseNative;window.pauseOskol=pauseNative;window.layerBack=()=>{if(activeOverlay==='settings'){closeSettings();return true;}if(activeOverlay){closeOverlay();return true;}if(mode==='playing'){openOverlay('pause');return true;}return false;};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseNative();lastTime=performance.now();});window.addEventListener('pagehide',()=>saveGame());
function checkRotate(){$('rotate-warning').hidden=!(mode==='playing'&&window.matchMedia('(pointer:coarse)').matches&&window.innerHeight>window.innerWidth&&!document.body.classList.contains('portrait-okay'));}
$('portrait-play').addEventListener('click',()=>{document.body.classList.add('portrait-okay');checkRotate();});window.addEventListener('resize',()=>{world?.resize();checkRotate();});
window.addEventListener('oskol-context-lost',()=>{pauseNative();$('fatal').hidden=false;$('fatal-text').textContent='Видеоконтекст потерян. Прогресс сохранён, если хранилище доступно. Перезагрузи игру; при повторении выбери более низкую графику.';});
function frame(time){
 const dt=lastTime?Math.min((time-lastTime)/1000,.05):.016;lastTime=time;lastFrameMs=dt*1000;smoothedFps+=(1/Math.max(.001,dt)-smoothedFps)*.02;
 const running=mode==='playing'&&!activeOverlay&&!state.dead&&$('rotate-warning').hidden;
 if(ready){
  if(running){
   attackCooldown=Math.max(0,attackCooldown-dt);let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x,z=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touch.z;const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}
   const moving=Math.min(1,len),sprint=(keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.sprint)&&state.stamina>2&&moving>.1,speed=(sprint?7.8:3.8)*(world.floorHeight(state.position.x,state.position.z,state)<.3?.55:1);
   const dx=(x*Math.cos(state.yaw)+z*Math.sin(state.yaw))*speed*dt,dz=(-x*Math.sin(state.yaw)+z*Math.cos(state.yaw))*speed*dt;
   if(world.canMove(state.position.x+dx,state.position.z,state))state.position.x+=dx;if(world.canMove(state.position.x,state.position.z+dz,state))state.position.z+=dz;
   jumpVelocity-=dt*10;jumpHeight=Math.max(0,jumpHeight+jumpVelocity*dt);if(jumpHeight===0)jumpVelocity=0;
   world.camera.position.set(state.position.x,world.floorHeight(state.position.x,state.position.z,state)+1.72+jumpHeight+(moving?Math.sin(playTime*(sprint?12:8))*.025:0),state.position.z);world.camera.rotation.set(state.pitch,state.yaw,0,'YXZ');playTime+=dt;
   const nearFire=world.fires.some(f=>Math.hypot(f.x-state.position.x,f.z-state.position.z)<4),inWater=terrainHeight(state.position.x,state.position.z)<-.35;tick(state,dt,{sprinting:sprint,nearFire,inWater});
   stepTimer-=dt;if(moving>.15&&jumpHeight<=.01&&stepTimer<=0){audio.step();stepTimer=sprint?.30:.47;}
   world.update(dt,state,true,{moving,damage:takeDamage});const site=monumentAt(state.position.x,state.position.z);if(site&&!state.visited.includes(site.id)){state.visited.push(site.id);toast('ОТКРЫТО РТ: '+site.name+' · '+state.visited.length+'/10',4);audio.pickup();}uiTimer+=dt;saveTimer+=dt;if(uiTimer>.16){uiTimer=0;updateHUD();}if(saveTimer>15){saveTimer=0;saveGame();}
   if(state.dead){saveGame();openOverlay('death');}
  }else if(mode==='front'&&!activeOverlay){world.menuCamera(time/1000);world.update(dt,state,false);}
  if((mode==='front'&&!activeOverlay||running)&&(time-lastRendered>(mode==='front'?(settings.quality==='low'?100:50):(settings.quality==='low'?40:settings.quality==='medium'?28:16)))||world.needsRender){world.render();lastRendered=time;}
 }
 if(time>toastUntil)$('toast').classList.remove('show');pickupTimers=pickupTimers.filter(p=>{if(time>p.until){p.el.remove();return false;}return true;});requestAnimationFrame(frame);
}
$('fatal').querySelector('button').addEventListener('click',()=>location.reload());
async function boot(){
 try{
  syncSettings();configureMap(saved?.size||'small',saved?.seed||27182);world=new IslandWorld($('world'),settings);requestAnimationFrame(frame);
  await world.init((ratio,label)=>{$('loading-progress').style.width=Math.round(ratio*100)+'%';$('loading-text').textContent=label;});
  world.mapSignature=(saved?.size||'small')+'-'+(saved?.seed||27182);ready=true;$('start').disabled=false;$('loading').hidden=true;showFront();
  // Read-only diagnostics for browser and packaged-device smoke tests. No cheats or resource grants.
  window.oskol={get ready(){return ready;},snapshot:()=>({mode,overlay:activeOverlay,health:state.health,position:{...state.position},yaw:state.yaw,pitch:state.pitch,bots:world.bots.map(b=>({id:b.id,x:b.x,z:b.z,hp:b.hp,dead:b.dead,mode:b.mode,base:b.base})),selected:state.selected,inventory:{...state.inventory},buildings:state.buildings.length,radioFixed:state.radioFixed,multiplier:state.multiplier,size:state.size,seed:state.seed,magazine:state.magazine,visited:[...state.visited],stats:world.stats,saved:!!decodeSave(safeStorage.get(SAVE_KEY))})};
 }catch(error){console.error('OSKOL initialization failed:',error);$('loading').hidden=true;$('fatal').hidden=false;$('fatal-text').textContent='Не удалось подготовить 3D-мир. '+(String(error.message).includes('WebGL')?'Нужны WebGL 2 и обновлённый Chrome / Android System WebView.':'Проверь целостность файлов игры и попробуй перезапуск.');}
}
boot();
