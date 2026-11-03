import {stackLimit} from './inventory.js';
import {riverAt} from './map-data.js';
import { MONUMENTS, BOT_BASES, ROADS, WORLD_RADIUS, monumentAt, distanceToRoad, MAP_SCALE, MAP_SEED, MAP_SIZES, configureMap } from './map-data.js';
export {MONUMENTS,BOT_BASES,ROADS,WORLD_RADIUS,MAP_SIZES,configureMap};
export const SAVE_KEY='oskol.survival.v2';
export const WORLD_SEED=27182;
export const MULTIPLIERS=[1,2,5,10,50];
export const ITEMS={wood:{name:'Древесина',icon:'wood'},stone:{name:'Камень',icon:'stone'},metalOre:{name:'Металлическая руда',icon:'ore'},sulfurOre:{name:'Серная руда',icon:'ore'},metal:{name:'Фрагменты металла',icon:'scrap'},sulfur:{name:'Сера',icon:'ore'},charcoal:{name:'Уголь',icon:'stone'},gunpowder:{name:'Порох',icon:'powder'},fiber:{name:'Волокно',icon:'fiber'},scrap:{name:'Металлолом',icon:'scrap'},berries:{name:'Ягоды',icon:'berries'},water:{name:'Вода',icon:'water'},bandage:{name:'Бинт',icon:'bandage'},axe:{name:'Топор',icon:'axe'},pickaxe:{name:'Кирка',icon:'pickaxe'},hammer:{name:'Киянка',icon:'hammer'},rifle:{name:'Самодельная винтовка',icon:'rifle'},ammo:{name:'Патроны',icon:'ammo'},satchel:{name:'Взрывной заряд',icon:'satchel'},armor:{name:'Кожаная броня',icon:'armor'},foundation:{name:'Фундамент',icon:'foundation'},wall:{name:'Стена',icon:'wall'},door:{name:'Вход с дверью',icon:'door'},roof:{name:'Крыша',icon:'roof'},campfire:{name:'Костёр',icon:'fire'},furnace:{name:'Печь',icon:'furnace'},workbench:{name:'Верстак',icon:'workbench'},battery:{name:'Аккумулятор',icon:'battery'},rock:{name:'Камень в руке',icon:'stone'},torch:{name:'Факел',icon:'torch'}};
export const RECIPES={
 axe:{name:'Каменный топор',category:'tools',cost:{wood:15,stone:8,fiber:4},description:'Вдвое быстрее добывает древесину.'},
 pickaxe:{name:'Каменная кирка',category:'tools',cost:{wood:15,stone:15,fiber:4},description:'Вдвое быстрее добывает камень, железную и серную руду.'},
 hammer:{name:'Строительная киянка',category:'tools',cost:{wood:12,stone:4},description:'Возьми в руку и наведи на элемент: улучшение, ремонт, демонтаж.'},
 bandage:{name:'Бинт',category:'tools',cost:{fiber:6},description:'Восстанавливает 35 здоровья.'},
 armor:{name:'Кожаная броня',category:'tools',cost:{fiber:30,scrap:10},description:'Надета автоматически. Снижает урон от ботов на 30%.'},
 rifle:{name:'Самодельная винтовка',category:'tools',station:'workbench',cost:{wood:30,metal:35,scrap:20},description:'Нужен верстак рядом. ЛКМ / удар — выстрел, R — перезарядка. 6 патронов.'},
 satchel:{name:'Взрывной заряд',category:'tools',station:'workbench',cost:{gunpowder:30,fiber:15,metal:10},description:'Урон постройке 300. Прицелься в дверь / стену и используй. Не стой рядом.'},
 campfire:{name:'Костёр',category:'build',cost:{wood:16,stone:8},description:'Свет и восстановление здоровья рядом.'},
 foundation:{name:'Фундамент',category:'build',cost:{wood:25},description:'Основание 3 × 3 м. Ставится сеткой; соседние основания соединяются.'},
 wall:{name:'Стена',category:'build',cost:{wood:15},description:'Привязывается к краю фундамента.'},
 door:{name:'Вход с дверью',category:'build',cost:{wood:18,fiber:4},description:'Дверь открывается действием. Чужую придётся разрушить.'},
 roof:{name:'Крыша',category:'build',cost:{wood:20},description:'Привязывается над фундаментом.'},
 furnace:{name:'Каменная печь',category:'build',cost:{stone:40,wood:30,scrap:10},description:'Установи, подойди и открой действие: переплавка руды с расходом дерева.'},
 workbench:{name:'Верстак',category:'build',cost:{wood:50,scrap:20,metal:10},description:'Открывает изготовление винтовки и зарядов, пока ты рядом.'},
 metal:{name:'Металл ×5',category:'process',station:'furnace',cost:{metalOre:5,wood:2},output:5,description:'Печь рядом. Из пяти единиц руды — пять фрагментов.'},
 sulfur:{name:'Сера ×5',category:'process',station:'furnace',cost:{sulfurOre:5,wood:2},output:5,description:'Печь рядом. Переплавка серной руды.'},
 charcoal:{name:'Уголь ×5',category:'process',station:'furnace',cost:{wood:4},output:5,description:'Обжиг древесины в установленной печи.'},
 gunpowder:{name:'Порох ×10',category:'process',cost:{sulfur:5,charcoal:5},output:10,description:'Компонент патронов и взрывного заряда.'},
 ammo:{name:'Патроны ×6',category:'process',cost:{metal:2,gunpowder:3},output:6,description:'Для самодельной винтовки. Перезарядка — R.'},
 battery:{name:'Аккумулятор передатчика',category:'tools',cost:{scrap:6,fiber:8},description:'Верни питание радиостанции возле лагеря.'}
};
export const TIERS=[{name:'ВЕТКИ',hp:75,cost:null,color:0x847250},{name:'ДЕРЕВО',hp:250,cost:{wood:20},color:0x6f684c},{name:'КАМЕНЬ',hp:550,cost:{stone:35},color:0x737971},{name:'МЕТАЛЛ',hp:1100,cost:{metal:30},color:0x5b6665}];
export const BUILD_KINDS=['foundation','wall','door','roof','campfire','furnace','workbench'];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function randomSeed(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const smooth=t=>t*t*(3-2*t);
function hash(x,z){return(randomSeed(Math.imul(x,374761393)^Math.imul(z,668265263)^MAP_SEED))();}
export function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b);return(hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;}
function rawHeight(x,z){x/=MAP_SCALE;z/=MAP_SCALE;const r=Math.hypot(x*.97,z);let hills=2.4+noise(x*.013,z*.013)*13+noise(x*.045,z*.045)*2.6;if(MAP_SCALE>3){hills+=165*Math.exp(-((x+125)**2/2600+(z+110)**2/3800))+115*Math.exp(-((x-140)**2/2000+(z+145)**2/2400));const river=riverAt(x*MAP_SCALE,z*MAP_SCALE);if(river){const blend=1-smooth(clamp((river.distance/MAP_SCALE-2.7)/4,0,1));hills=hills*(1-blend)+(river.water-1.2)*blend;}}return(hills+3)*(1-smooth(clamp((r-252)/66,0,1)))-3;}
export function terrainHeight(x,z){let h=rawHeight(x,z);const d=Math.hypot(x+6,z+3),flat=1-smooth(clamp((d-22)/20,0,1));h=h*(1-flat)+1.7*flat;
 for(const m of [...MONUMENTS,...BOT_BASES]){const dist=Math.hypot(x-m.x,z-m.z),rad=m.radius||12;if(dist<rad+9){const f=1-smooth(clamp((dist-rad)/9,0,1));h=h*(1-f)+rawHeight(m.x,m.z)*f;}}
 return h;
}
export function newGame({multiplier=1,size='small',seed=27182,difficulty='standard'}={}){return{version:2,seed:Number.isInteger(seed)&&seed>=1&&seed<=999999999?seed:27182,size:Object.hasOwn(MAP_SIZES,size)?size:'small',difficulty:['peaceful','standard','hard'].includes(difficulty)?difficulty:'standard',multiplier:MULTIPLIERS.includes(multiplier)?multiplier:1,position:{x:4,z:21},yaw:-.18,pitch:0,health:100,hunger:90,thirst:85,stamina:100,elapsed:0,inventory:Object.fromEntries(Object.keys(ITEMS).map(k=>[k,({rock:1,torch:1,berries:4,water:2,bandage:1})[k]||0])),depleted:[],buildings:[],looted:[],visited:[],gathered:{wood:0,stone:0,fiber:0},nodeDamage:{},botState:{},structureDamage:{},botStores:{},magazine:0,radioFixed:false,selected:'rock',dead:false};}
export function nearStation(state,kind){return state.buildings.some(b=>b.kind===kind&&b.hp>0&&Math.hypot(b.x-state.position.x,b.z-state.position.z)<5);}
export function canCraft(state,id){const r=RECIPES[id];return !!r&&(!r.station||nearStation(state,r.station))&&Object.entries(r.cost).every(([item,n])=>(state.inventory[item]||0)>=n);}
export function craft(state,id){if(!canCraft(state,id))return false;const r=RECIPES[id];for(const[item,n]of Object.entries(r.cost))state.inventory[item]-=n;state.inventory[id]+=(r.output||1);return true;}
export function consume(state,id){if(!(state.inventory[id]>0))return false;if(id==='berries'){state.hunger=clamp(state.hunger+18,0,100);state.thirst=clamp(state.thirst+3,0,100);}else if(id==='water'){state.thirst=clamp(state.thirst+40,0,100);}else if(id==='bandage'){if(state.health>=100)return false;state.health=clamp(state.health+35,0,100);}else return false;state.inventory[id]--;return true;}
export function tick(state,dt,{sprinting=false,nearFire=false,inWater=false}={}){if(state.dead)return;dt=clamp(dt,0,.25);state.elapsed+=dt;state.hunger=clamp(state.hunger-dt*.022,0,100);state.thirst=clamp(state.thirst-dt*.035,0,100);state.stamina=clamp(state.stamina+(sprinting?-15:10)*dt,0,100);if(state.hunger<=0||state.thirst<=0||inWater)state.health=clamp(state.health-dt*(inWater?5:1.5),0,100);else if(nearFire&&state.hunger>20&&state.thirst>20)state.health=clamp(state.health+dt*1.5,0,100);if(state.health<=0)state.dead=true;}
export function resourceNodes(){const rand=randomSeed(MAP_SEED),nodes=[];const add=(id,type,x,z)=>nodes.push({id,type,x,z,hp:type==='tree'?5:['rock','metalOre','sulfurOre'].includes(type)?4:1,remaining:type==='tree'?5:['rock','metalOre','sulfurOre'].includes(type)?4:1});
 add('tree-start','tree',1,14);add('rock-start','rock',8,15);add('fiber-start','fiber',3,17);add('berries-start','berries',-1,18);add('metal-start','metalOre',16,22);add('sulfur-start','sulfurOre',-16,22);
 for(let i=0;i<330;i++){const a=rand()*Math.PI*2,r=i<115?23+rand()*80:60+rand()*210*MAP_SCALE,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x+6,z+3)<22||terrainHeight(x,z)<1.1||monumentAt(x,z)||BOT_BASES.some(b=>Math.hypot(b.x-x,b.z-z)<14)||distanceToRoad(x,z,6)<5)continue;add('tree-'+i,'tree',x,z);}
 for(let i=0;i<120;i++){const x=(rand()-.5)*550*MAP_SCALE,z=(rand()-.5)*550*MAP_SCALE;if(terrainHeight(x,z)<1.2||Math.hypot(x+6,z+3)<14||monumentAt(x,z)||distanceToRoad(x,z,6)<5)continue;add('ore-'+i,i%3===0?'metalOre':i%3===1?'sulfurOre':'rock',x,z);}
 for(let i=0;i<90;i++){const x=(rand()-.5)*470*MAP_SCALE,z=(rand()-.5)*470*MAP_SCALE;if(terrainHeight(x,z)<1.2||monumentAt(x,z)||distanceToRoad(x,z,6)<3)continue;add('plant-'+i,i%4===0?'berries':'fiber',x,z);}
 for(let i=0;i<12;i++){const q=MONUMENTS.find(m=>m.kind==='quarry'),a=i*Math.PI/6;add('quarry-ore-'+i,['rock','metalOre','sulfurOre'][i%3],q.x+Math.cos(a)*11,q.z+Math.sin(a)*11);}
 // Independent RNG: adding forests must not move old resource IDs or invalidate saves.
 const extra=randomSeed(MAP_SEED^0x3bf28);for(let i=0;i<Math.min(6000,Math.round(900*MAP_SCALE));i++){
  const x=(extra()-.5)*550*MAP_SCALE,z=(extra()-.5)*550*MAP_SCALE;
  if(Math.hypot(x+6,z+3)<42||terrainHeight(x,z)<1.2||monumentAt(x,z)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<17)||distanceToRoad(x,z,6)<5)continue;
  add('forest-'+i,'tree',x,z);
 }
 return nodes;
}
export function grantLoot(state,table){const result=[];for(const[item,base]of Object.entries(table)){if(!(item in ITEMS)||!Number.isFinite(base)||base<=0)continue;const amount=Math.floor(base*state.multiplier);state.inventory[item]+=amount;result.push({item,amount});}return result;}
export function harvest(state,node){if(state.dead||state.depleted.includes(node.id))return null;const ore=['rock','metalOre','sulfurOre'].includes(node.type),power=node.type==='tree'&&state.selected==='axe'&&state.inventory.axe>0||ore&&state.selected==='pickaxe'&&state.inventory.pickaxe>0?2:1;const item=node.type==='tree'?'wood':node.type==='rock'?'stone':node.type==='berries'?'berries':node.type==='metalOre'?'metalOre':node.type==='sulfurOre'?'sulfurOre':'fiber';const base=node.type==='tree'?5:ore?4:node.type==='fiber'?5:4;const gain=base*power*state.multiplier;state.inventory[item]+=gain;if(item in state.gathered)state.gathered[item]+=gain;node.remaining=Math.max(0,(state.nodeDamage[node.id]??node.remaining)-power);state.nodeDamage[node.id]=node.remaining;if(node.remaining===0)state.depleted.push(node.id);return{item,amount:gain,depleted:node.remaining===0};}
export const buildingHeight=b=>Number.isFinite(b.y)?b.y:terrainHeight(b.x,b.z);
export function placementHeight(state,kind,x,z,lift=0){
 const bases=state.buildings.filter(b=>b.kind==='foundation'&&b.hp>0).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)||buildingHeight(b)-buildingHeight(a));
 const near=bases.find(b=>Math.hypot(b.x-x,b.z-z)<(kind==='foundation'?4.4:2.3));
 if(kind==='foundation'){const ground=Math.max(...[-1.5,1.5].flatMap(dx=>[-1.5,1.5].map(dz=>terrainHeight(x+dx,z+dz))));return(near?buildingHeight(near):ground+.04)+Math.max(0,Math.min(2,lift));}
 return near&&['wall','door','roof'].includes(kind)?buildingHeight(near):terrainHeight(x,z);
}
export function placementCheck(state,kind,x,z,rotation=0,y=placementHeight(state,kind,x,z)){
 if(!BUILD_KINDS.includes(kind))return{ok:false,reason:'Неизвестная постройка'};if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(rotation))return{ok:false,reason:'Неверная позиция'};
 if(!Number.isFinite(y)||Math.abs(y-terrainHeight(x,z))>3)return{ok:false,reason:'Слишком высокая опора'};
 if(!(state.inventory[kind]>0))return{ok:false,reason:'Сначала создай предмет'};if(Math.hypot(x-state.position.x,z-state.position.z)>7)return{ok:false,reason:'Слишком далеко'};if(terrainHeight(x,z)<.65)return{ok:false,reason:'Нужна сухая поверхность'};
 if(monumentAt(x,z)||BOT_BASES.some(b=>Math.hypot(b.x-x,b.z-z)<14))return{ok:false,reason:'Территория РТ или чужой базы'};
 if(distanceToRoad(x,z,6)<4)return{ok:false,reason:'Нельзя перекрывать дорогу'};
 const alive=state.buildings.filter(b=>b.hp>0);
 if(kind==='foundation'){if([-1.5,1.5].some(dx=>[-1.5,1.5].some(dz=>terrainHeight(x+dx,z+dz)>y+.12)))return{ok:false,reason:'Фундамент в земле: подними уровень Q / +'};if(Math.abs(terrainHeight(x+1.5,z+1.5)-terrainHeight(x-1.5,z-1.5))>1.4)return{ok:false,reason:'Слишком крутой склон'};if(alive.some(b=>b.kind==='foundation'&&Math.hypot(b.x-x,b.z-z)<2.9))return{ok:false,reason:'Здесь уже есть фундамент'};}
 else if(['wall','door','roof'].includes(kind)){const base=alive.find(b=>b.kind==='foundation'&&Math.hypot(b.x-x,b.z-z)<2.3);if(!base)return{ok:false,reason:'Нужен фундамент рядом'};if(alive.some(b=>['wall','door','roof'].includes(b.kind)&&Math.hypot(b.x-x,b.z-z)<.3&&(b.kind==='roof'||Math.abs(Math.sin((b.rotation||0)-rotation))<.1)))return{ok:false,reason:'Место занято'};}
 return{ok:true};
}
export function placeBuilding(state,kind,x,z,rotation=0,y=placementHeight(state,kind,x,z)){const check=placementCheck(state,kind,x,z,rotation,y);if(!check.ok)return check;state.inventory[kind]--;const building={id:'build-'+(Math.max(0,...state.buildings.map(b=>Number(b.id.split('-')[1])||0))+1),kind,x,z,y,rotation,open:false,tier:0,hp:TIERS[0].hp};state.buildings.push(building);return{ok:true,building};}
export function upgradeBuilding(state,b){if(!b||!state.buildings.includes(b)||b.hp<=0||!['foundation','wall','door','roof'].includes(b.kind))return{ok:false,reason:'Нельзя улучшить'};if(Math.hypot(b.x-state.position.x,b.z-state.position.z)>6)return{ok:false,reason:'Слишком далеко'};const tier=TIERS[b.tier+1];if(!tier)return{ok:false,reason:'Максимальный уровень'};if(!Object.entries(tier.cost).every(([id,n])=>state.inventory[id]>=n))return{ok:false,reason:'Не хватает ресурсов'};for(const[id,n]of Object.entries(tier.cost))state.inventory[id]-=n;b.tier++;b.hp=tier.hp;return{ok:true};}
export function repairBuilding(state,b){if(!b||!state.buildings.includes(b)||b.hp<=0||Math.hypot(b.x-state.position.x,b.z-state.position.z)>6)return false;const max=TIERS[b.tier].hp;if(b.hp>=max)return false;const id=b.tier>=3?'metal':b.tier===2?'stone':'wood',cost=Math.ceil((max-b.hp)/50);if(state.inventory[id]<cost)return false;state.inventory[id]-=cost;b.hp=max;return true;}
export function damageStructure(state,structure,amount){if(!structure||!Number.isFinite(amount)||amount<=0)return 0;const max=TIERS[structure.tier??0].hp;const current=structure.owner?(state.structureDamage[structure.id]??max):structure.hp;if(current<=0)return 0;const hp=Math.max(0,current-amount);if(structure.owner){state.structureDamage[structure.id]=hp;if(hp===0&&!state.depleted.includes(structure.id))state.depleted.push(structure.id);}else structure.hp=hp;return hp;}
export function reload(state){if(!state.inventory.rifle||state.magazine>=6||state.inventory.ammo<=0)return 0;const n=Math.min(6-state.magazine,state.inventory.ammo);state.inventory.ammo-=n;state.magazine+=n;return n;}
export function missionProgress(state){return[
 {id:'gather',title:'Заготовь дерево и камень',detail:`${Math.min(state.gathered.wood,15)}/15 дерева · ${Math.min(state.gathered.stone,8)}/8 камня`,done:state.gathered.wood>=15&&state.gathered.stone>=8},
 {id:'shelter',title:'Укрытие и первая печь',detail:'Фундамент, костёр, печь',done:['foundation','campfire','furnace'].every(k=>state.buildings.some(b=>b.kind===k&&b.hp>0))},
 {id:'explore',title:'Разведай десять РТ',detail:`Исследовано ${state.visited.length} / ${MONUMENTS.length} · M — карта`,done:state.visited.length>=MONUMENTS.length},
 {id:'radio',title:'Верни питание передатчику',detail:'Собери аккумулятор из металлолома и волокна',done:state.radioFixed}
 ];}
export function encodeSave(state){return JSON.stringify({...state,version:2});}
export function decodeSave(raw){try{
 const s=JSON.parse(raw);if(!s||s.version!==2||!Number.isInteger(s.seed)||s.seed<1||s.seed>999999999||!Object.hasOwn(MAP_SIZES,s.size)||!['peaceful','standard','hard'].includes(s.difficulty)||!MULTIPLIERS.includes(s.multiplier))return null;const out=newGame();
 const coord=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.hypot(p.x,p.z)<=325*MAP_SIZES[s.size].scale+5;
 if(!coord(s.position)||s.feetY!==undefined&&(!Number.isFinite(s.feetY)||s.feetY< -5||s.feetY>350))return null;for(const k of['health','hunger','thirst','stamina'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>100)return null;
 if(!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>1e8||!Number.isFinite(s.yaw)||!Number.isFinite(s.pitch))return null;
 if(!s.inventory||Object.keys(out.inventory).some(k=>!Number.isInteger(s.inventory[k])||s.inventory[k]<0||s.inventory[k]>1e8))return null;
 const ids=a=>Array.isArray(a)&&a.length<=12000&&a.every(x=>typeof x==='string'&&x.length<100);
 if(!ids(s.depleted)||!ids(s.looted)||!ids(s.visited)||s.visited.some(id=>!MONUMENTS.some(m=>m.id===id))||!Array.isArray(s.buildings)||s.buildings.length>400)return null;
 for(const b of s.buildings)if(!b||!BUILD_KINDS.includes(b.kind)||typeof b.id!=='string'||!coord(b)||!Number.isFinite(b.rotation)||(b.y!==undefined&&(!Number.isFinite(b.y)||b.y< -10||b.y>350))||!Number.isInteger(b.tier)||b.tier<0||b.tier>3||!Number.isFinite(b.hp)||b.hp<0||b.hp>TIERS[b.tier].hp)return null;
 if(!s.gathered||Object.keys(out.gathered).some(k=>!Number.isInteger(s.gathered[k])||s.gathered[k]<0||s.gathered[k]>1e8))return null;
 for(const key of['nodeDamage','structureDamage','botStores'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])||Object.keys(s[key]).length>12000||Object.values(s[key]).some(n=>!Number.isFinite(n)||n<0||n>1e8))return null;
 if(!s.botState||typeof s.botState!=='object'||Object.keys(s.botState).length>40||Object.values(s.botState).some(b=>!b||!Number.isFinite(b.hp)||b.hp<0||b.hp>120))return null;
 const validItems=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.entries(o).every(([k,n])=>Object.hasOwn(ITEMS,k)&&Number.isInteger(n)&&n>0&&n<=1e8);
 if(s.containers!==undefined&&(!s.containers||typeof s.containers!=='object'||Array.isArray(s.containers)||Object.keys(s.containers).length>10000||Object.entries(s.containers).some(([id,o])=>id.length>100||!validItems(o))))return null;
 if(s.slots!==undefined&&(!Array.isArray(s.slots)||s.slots.length!==36||s.slots.some(o=>o!==null&&(!o||!Object.hasOwn(ITEMS,o.item)||!Number.isInteger(o.count)||o.count<1||o.count>stackLimit(o.item)))))return null;
 if(s.markers!==undefined&&(!Array.isArray(s.markers)||s.markers.length>16||s.markers.some(m=>!coord(m)||typeof m.label!=='string'||m.label.length>40)))return null;
 if(s.groundBags!==undefined&&(!Array.isArray(s.groundBags)||s.groundBags.length>500||s.groundBags.some(b=>!coord(b)||typeof b.id!=='string'||b.id.length>100)))return null;
 if(!Number.isInteger(s.magazine)||s.magazine<0||s.magazine>6||!Object.hasOwn(ITEMS,s.selected))return null;
 // Validation is pure: reading a backup must never change the active map globals.
 return{...out,...s,inventory:{...s.inventory},yaw:s.yaw%(Math.PI*2),pitch:clamp(s.pitch,-1.4,1.4),dead:s.health<=0,radioFixed:!!s.radioFixed};
 }catch{return null;}}
