import {landscape36} from './landscape36.js';
import {USE33} from './supplies37.js';
import {resourceAllowed32,slopeAt32} from './ecology32.js';
import {landscape34} from './landscape34.js';
import {landscape32} from './landscape32.js';
import {validTactics27} from './tactics-schema27.js';
import {bagPlacement27,validBagSave27} from './sleeping-bags27.js';
import {validSociety26} from './ai-schema26.js';
import {landscape26} from './landscape26.js';
import {MODS25,modCompatible25} from './attachments25.js';
import {CLOTHING_ITEMS24,CLOTHING_RECIPES24,wearValid24} from './clothing24.js';
import {landscape21} from './landscape21.js';
import {stationContext20} from './station-context20.js';
import {landscape20,gradeRoad20} from './landscape20.js';
import {landscape19} from './landscape19.js';
import {biomeRegion18} from './biome18.js';
import {naturalHeight17} from './terrain17.js';
import {naturalHeight16} from './terrain16.js';
import {naturalHeight13,coastDistance13} from './terrain13.js';
import {lootAmount} from './loot-policy.js';
import {isFoundation,isFloor,isStructural} from './expansion.js';
import {EXTRA_ITEMS,EXTRA_RECIPES,MEDICAL16,WEAPONS,BUILD_COSTS,isGun,magazine,setMagazine,weaponCapacity25} from './catalog.js';
import {advanceFurnaces} from './machines.js';
import {recordDamage} from './health.js';
import {stackLimit} from './inventory.js';
import {riverAt} from './map-data.js';
import { MONUMENTS, BOT_BASES, ROADS, WORLD_RADIUS, monumentAt, distanceToRoad, MAP_SCALE, MAP_REVISION, MAP_LAYOUT18, MAP_SEED, MAP_SIZES, configureMap } from './map-data.js';
export {MONUMENTS,BOT_BASES,ROADS,WORLD_RADIUS,MAP_SIZES,configureMap};
export const SAVE_KEY='oskol.survival.v2';
export const WORLD_SEED=27182;
export const MULTIPLIERS=[1,2,5,10,50];
export const ITEMS={wood:{name:'Древесина',icon:'wood'},stone:{name:'Камень',icon:'stone'},metalOre:{name:'Металлическая руда',icon:'ore'},sulfurOre:{name:'Серная руда',icon:'ore'},metal:{name:'Фрагменты металла',icon:'scrap'},sulfur:{name:'Сера',icon:'ore'},charcoal:{name:'Уголь',icon:'stone'},gunpowder:{name:'Порох',icon:'powder'},fiber:{name:'Ткань',icon:'fiber'},scrap:{name:'Металлолом',icon:'scrap'},berries:{name:'Ягоды',icon:'berries'},water:{name:'Вода',icon:'water'},bandage:{name:'Бинт',icon:'bandage'},axe:{name:'Топор',icon:'axe'},pickaxe:{name:'Кирка',icon:'pickaxe'},hammer:{name:'Киянка',icon:'hammer'},rifle:{name:'Охотничья снайперская В-6',icon:'rifle'},ammo:{name:'Патроны',icon:'ammo'},satchel:{name:'Взрывной заряд',icon:'satchel'},armor:{name:'Кожаная броня',icon:'armor'},foundation:{name:'Фундамент',icon:'foundation'},wall:{name:'Стена',icon:'wall'},door:{name:'Вход с дверью',icon:'door'},roof:{name:'Крыша',icon:'roof'},campfire:{name:'Костёр',icon:'fire'},furnace:{name:'Печь',icon:'furnace'},workbench:{name:'Верстак',icon:'workbench'},battery:{name:'Аккумулятор',icon:'battery'},rock:{name:'Камень в руке',icon:'stone'},torch:{name:'Факел',icon:'torch'}};
export const RECIPES={
 axe:{name:'Каменный топор',category:'tools',cost:{wood:15,stone:8,fiber:4},description:'Вдвое быстрее добывает древесину.'},
 pickaxe:{name:'Каменная кирка',category:'tools',cost:{wood:15,stone:15,fiber:4},description:'Вдвое быстрее добывает камень, железную и серную руду.'},
 hammer:{name:'Строительная киянка',category:'tools',cost:{wood:12,stone:4},description:'Возьми в руку и наведи на элемент: улучшение, ремонт, демонтаж.'},
 bandage:{name:'Бинт',category:'tools',cost:{fiber:6},description:'Восстанавливает 35 здоровья.'},
 armor:{name:'Кожаная броня',category:'clothing',cost:{fiber:30,scrap:10},description:'Надень в слот верхней одежды / брони. В рюкзаке защита не действует.'},
 rifle:{name:'Охотничья снайперская В-6',category:'tools',station:'workbench',cost:{wood:30,metal:35,scrap:20},description:'Нужен верстак рядом. ЛКМ / удар — выстрел, R — перезарядка. 6 патронов. Съёмная оптика ×4/×8 крафтится отдельно.'},
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
const LEGACY_KEYS=Object.keys(ITEMS);Object.assign(ITEMS,EXTRA_ITEMS);Object.assign(RECIPES,EXTRA_RECIPES);Object.assign(ITEMS,CLOTHING_ITEMS24);Object.assign(RECIPES,CLOTHING_RECIPES24);for(const k of [...Object.keys(BUILD_COSTS),'metal','sulfur','charcoal'])delete RECIPES[k];
export const TIERS=[{name:'СОЛОМА',hp:75,cost:null,color:0x847250},{name:'ДЕРЕВО',hp:250,cost:{wood:20},color:0x6f684c},{name:'КАМЕНЬ',hp:550,cost:{stone:35},color:0x737971},{name:'МЕТАЛЛ',hp:1100,cost:{metal:30},color:0x9d502e},{name:'БРОНЯ HQM',hp:2200,cost:{highMetal:12},color:0x676b70}];
export const BUILD_KINDS=[...Object.keys(BUILD_COSTS),'door','campfire','furnace','workbench','storage','largeStorage','cupboard','recycler','repairBench','sleepingBag'];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function randomSeed(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const smooth=t=>t*t*(3-2*t);
function hash(x,z){return(randomSeed(Math.imul(x,374761393)^Math.imul(z,668265263)^MAP_SEED))();}
export function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b);return(hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;}
function rawHeight(x,z){if(MAP_REVISION>=8)return naturalHeight17(x,z,MAP_SCALE,MAP_SEED,noise,riverAt,distanceToRoad);if(MAP_REVISION>=7)return naturalHeight16(x,z,MAP_SCALE,MAP_SEED,noise,riverAt);if(MAP_REVISION>=6)return naturalHeight13(x,z,MAP_SCALE,MAP_SEED,noise,riverAt);x/=MAP_SCALE;z/=MAP_SCALE;const r=Math.hypot(x*.97,z);let hills=2.4+noise(x*.013,z*.013)*13+noise(x*.045,z*.045)*2.6;if(MAP_REVISION>=5){const ridge=Math.pow(1-Math.abs(noise(x*.018+18,z*.018-8)*2-1),3);hills+=ridge*24+noise(x*.038-45,z*.038+5)*12+noise(x*.085,z*.085)*4;hills+=32*Math.exp(-((x-110)**2+(z-65)**2)/1800)+26*Math.exp(-((x+135)**2+(z-75)**2)/1300)+38*Math.exp(-((x+40)**2+(z+125)**2)/1600);}
 if(MAP_SCALE>3){hills+=165*Math.exp(-((x+125)**2/2600+(z+110)**2/3800))+115*Math.exp(-((x-140)**2/2000+(z+145)**2/2400));const river=riverAt(x*MAP_SCALE,z*MAP_SCALE);if(river){const blend=1-smooth(clamp((river.distance/MAP_SCALE-2.7)/4,0,1));hills=hills*(1-blend)+(river.water-1.2)*blend;}}return(hills+3)*(1-smooth(clamp((r-252)/66,0,1)))-3;}
function authoredHeight08(x,z){
 if(MAP_REVISION>=11){const landscape=MAP_REVISION>=17?landscape36:MAP_REVISION>=16?landscape34:MAP_REVISION>=15?landscape32:MAP_REVISION>=14?landscape26:MAP_REVISION>=12?landscape21:landscape20,base=(a,b)=>landscape(a,b,MAP_SCALE,MAP_SEED,noise,MONUMENTS);return gradeRoad20(x,z,base(x,z),{roads:ROADS,key:MAP_LAYOUT18,base,river:riverAt,sites:MONUMENTS,shoulder:MAP_REVISION>=16?24:10});}
 if(MAP_REVISION>=10)return landscape19(x,z,MAP_SCALE,MAP_SEED,noise,MONUMENTS);
 if(MAP_REVISION>=6){
  let h=rawHeight(x,z);const camp=1-smooth(clamp((Math.hypot(x+6,z+3)-22)/(MAP_REVISION>=7?40:63),0,1));h=h*(1-camp)+1.7*camp;
  let coast,channel;
  // Wide pad shoulders replace the former nine-metre walls around flat RT pads.
  // Protect the channel and shoreline from pad grading; old revisions keep their exact formula.
  for(const m of MONUMENTS){if(m.kind==='oilrig')continue;const dist=Math.hypot(x-m.x,z-m.z),rad=m.radius||12,shoulder=Math.max(28,rad*1.2);
   if(dist<rad+shoulder){if(coast===undefined){coast=clamp(coastDistance13(x,z,MAP_SCALE,MAP_SEED)/18,0,1);const r=riverAt(x,z);channel=r?smooth(clamp((r.distance-r.width*.5-3)/15,0,1)):1;}const f=(1-smooth(clamp((dist-rad)/shoulder,0,1)))*coast*channel;m.terrainHeight13??=rawHeight(m.x,m.z);h=h*(1-f)+m.terrainHeight13*f;}
  }
  return h;
 }
 let h=rawHeight(x,z);const d=Math.hypot(x+6,z+3),flat=1-smooth(clamp((d-22)/20,0,1));h=h*(1-flat)+1.7*flat;
 for(const m of MONUMENTS){const dist=Math.hypot(x-m.x,z-m.z),rad=m.radius||12;if(dist<rad+9){const f=1-smooth(clamp((dist-rad)/9,0,1));h=h*(1-f)+rawHeight(m.x,m.z)*f;}}
 return h;
}
// Physics, vegetation, roads and rendered terrain use the SAME triangle surface.
// Grid resolution is independent of graphics quality; no analytic-vs-mesh penetration.
export function terrainGrid08(){const size=MAP_REVISION>=6?Math.max(WORLD_RADIUS*2.15,WORLD_RADIUS*2+300):WORLD_RADIUS*2.15,segments=Math.min(768,Math.ceil(size/(MAP_SCALE>3?7:2)));return{size,segments,step:size/segments};}
let terrainCache08=null;
export function terrainHeight(x,z){
 const {size,segments:n,step}=terrainGrid08(),key=MAP_SEED+':'+MAP_SCALE+':'+MAP_REVISION+':'+(MAP_REVISION>=9?MAP_LAYOUT18:0);
 if(!terrainCache08||terrainCache08.key!==key)terrainCache08={key,values:new Float32Array((n+1)*(n+1)),ready:new Uint8Array((n+1)*(n+1))};
 const u=(x+size/2)/step,v=(z+size/2)/step;if(u<0||v<0||u>n||v>n)return authoredHeight08(x,z);
 const ix=Math.min(n-1,Math.floor(u)),iz=Math.min(n-1,Math.floor(v)),fx=u-ix,fz=v-iz,c=terrainCache08;
 const sample=(a,b)=>{const i=b*(n+1)+a;if(!c.ready[i]){c.values[i]=authoredHeight08(Math.fround(a*step-size/2),Math.fround(b*step-size/2));c.ready[i]=1;}return c.values[i];};
 const a=sample(ix,iz),b=sample(ix,iz+1),d=sample(ix+1,iz);if(fx+fz<=1)return a+(d-a)*fx+(b-a)*fz;const q=sample(ix+1,iz+1);return q+(b-q)*(1-fx)+(d-q)*(1-fz);
}
export function newGame({multiplier=1,size='small',seed=27182,difficulty='standard',botLimit26=32,deferSpawn=false}={}){return{version:2,contentRevision:17,oilRevision31:31,botLimit26:Math.max(0,Math.min(96,Math.floor(Number(botLimit26)||0))),densityRevision:6,seed:Number.isInteger(seed)&&seed>=1&&seed<=999999999?seed:27182,size:Object.hasOwn(MAP_SIZES,size)?size:'small',difficulty:['peaceful','standard','hard'].includes(difficulty)?difficulty:'standard',multiplier:MULTIPLIERS.includes(multiplier)?multiplier:1,position:deferSpawn?{x:0,z:0}:beachSpawn(),yaw:-.18,pitch:0,health:100,hunger:90,thirst:85,stamina:100,elapsed:0,inventory:Object.fromEntries(Object.keys(ITEMS).map(k=>[k,({rock:1,torch:1})[k]||0])),attachments25:{},laserEnabled25:true,wear24:Array(7).fill(null),depleted:[],buildings:[],looted:[],visited:[],gathered:{wood:0,stone:0,fiber:0},nodeDamage:{},botState:{},structureDamage:{},botStores:{},magazine:0,radioFixed:false,selected:'rock',dead:false};}
export function nearStation(state,kind){return [...state.buildings,...stationContext20(state)].some(b=>b.kind===kind&&b.hp>0&&!state.depleted.includes(b.id)&&Math.abs((b.y??terrainHeight(b.x,b.z))-(state.feetY??terrainHeight(state.position.x,state.position.z)))<2.2&&Math.hypot(b.x-state.position.x,b.z-state.position.z)<3.2);}
export function canCraft(state,id,quantity=1){const r=RECIPES[id];quantity=Math.max(1,Math.min(100,Math.floor(quantity)||1));return !!r&&(!r.station||nearStation(state,r.station))&&Object.entries(r.cost).every(([item,n])=>(state.inventory[item]||0)>=n*quantity);}
export function craft(state,id,quantity=1){quantity=Math.max(1,Math.min(100,Math.floor(quantity)||1));if(!canCraft(state,id,quantity))return false;const r=RECIPES[id];for(const[item,n]of Object.entries(r.cost))state.inventory[item]-=n*quantity;state.inventory[id]+=(r.output||1)*quantity;return true;}
export function consume(state,id){if(!(state.inventory[id]>0))return false;if(Object.hasOwn(USE33,id)){const effect=USE33[id];if(effect.medical&&!['health','hunger','thirst'].some(k=>effect[k]>0&&state[k]<100))return false;for(const key of ['health','hunger','thirst'])if(effect[key])state[key]=clamp(state[key]+effect[key],0,100);}else if(Object.hasOwn(MEDICAL16,id)){if(state.health>=100)return false;state.health=clamp(state.health+MEDICAL16[id],0,100);}else if(id==='cactusFlesh'){state.hunger=clamp(state.hunger+7,0,100);state.thirst=clamp(state.thirst+12,0,100);}else if(['mushroom','pumpkin','corn','cookedMeat','meat'].includes(id)){state.hunger=clamp(state.hunger+({mushroom:10,pumpkin:35,corn:20,cookedMeat:45,meat:8})[id],0,100);if(id==='cookedMeat')state.health=clamp(state.health+10,0,100);}else if(id==='cannedFood'){state.hunger=clamp(state.hunger+45,0,100);}else if(id==='berries'){state.hunger=clamp(state.hunger+18,0,100);state.thirst=clamp(state.thirst+3,0,100);}else if(id==='water'){state.thirst=clamp(state.thirst+40,0,100);}else if(id==='bandage'){if(state.health>=100)return false;state.health=clamp(state.health+35,0,100);}else return false;state.inventory[id]--;return true;}
export function tick(state,dt,{sprinting=false,nearFire=false,underwater=false}={}){if(state.dead)return;dt=clamp(dt,0,.25);state.elapsed+=dt;state.hunger=clamp(state.hunger-dt*.022,0,100);state.thirst=clamp(state.thirst-dt*.035,0,100);state.stamina=100;state.oxygen=clamp((Number.isFinite(state.oxygen)?state.oxygen:100)+dt*(underwater?-100/28:32),0,100);const drowning=underwater&&state.oxygen<=0;const source=drowning?'drowning':state.hunger<=0?'hunger':state.thirst<=0?'thirst':null;if(source){const damage=dt*(drowning?8:1);state.health=clamp(state.health-damage,0,100);recordDamage(state,damage,source);}else if(nearFire&&state.hunger>20&&state.thirst>20)state.health=clamp(state.health+dt*1.5,0,100);advanceFurnaces(state,dt);if(state.health<=0)state.dead=true;}
export function resourceNodes(){const rand=randomSeed(MAP_SEED),nodes=[];const add=(id,type,x,z)=>nodes.push({id,type,x,z,hp:type==='tree'?5:['rock','copperOre','metalOre','sulfurOre','highMetalOre'].includes(type)?4:1,remaining:type==='tree'?5:['rock','copperOre','metalOre','sulfurOre','highMetalOre'].includes(type)?4:1});
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
 const hemp=randomSeed(MAP_SEED^7331);for(let i=0;i<450;i++){const a=hemp()*Math.PI*2,r=i<200?24+hemp()*140:hemp()*WORLD_RADIUS*.9,x=Math.cos(a)*r,z=Math.sin(a)*r;if(terrainHeight(x,z)<1.1||monumentAt(x,z)||distanceToRoad(x,z,6)<4||Math.hypot(x+6,z+3)<16)continue;add('hemp-'+i,'fiber',x,z);}
 if(MAP_REVISION>=14){const ore26=randomSeed(MAP_SEED^0x2619);for(let i=0;i<Math.floor(420*Math.min(6,MAP_SCALE*MAP_SCALE));i++){const x=(ore26()-.5)*WORLD_RADIUS*1.85,z=(ore26()-.5)*WORLD_RADIUS*1.85;if(terrainHeight(x,z)>1.4&&!monumentAt(x,z)&&!BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<13)&&distanceToRoad(x,z,6)>6)add('ore26-'+i,['rock','metalOre','sulfurOre','metalOre','sulfurOre','highMetalOre'][i%6],x,z);}}
 const copper37=randomSeed(MAP_SEED^0x3719);for(let i=0;i<Math.floor(140*Math.min(4,MAP_SCALE*MAP_SCALE));i++){const x=(copper37()-.5)*WORLD_RADIUS*1.7,z=(copper37()-.5)*WORLD_RADIUS*1.7;if(terrainHeight(x,z)>1.5&&!monumentAt(x,z)&&!BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<14)&&distanceToRoad(x,z,6)>7)add('copper37-'+i,'copperOre',x,z);}
 const rich=randomSeed(MAP_SEED^0x4219);for(let i=0;i<70;i++){const x=(rich()-.5)*WORLD_RADIUS*1.5,z=(rich()-.5)*WORLD_RADIUS*1.5;if(terrainHeight(x,z)>1.5&&!monumentAt(x,z)&&!BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<10)&&distanceToRoad(x,z,6)>5)add('rich-ore-'+i,'highMetalOre',x,z);}
 const beach=beachSpawn();for(let i=0;i<20;i++){const a=i*.77,x=beach.x+Math.cos(a)*(5+i*1.3),z=beach.z+Math.sin(a)*(5+i*1.3);if(terrainHeight(x,z)>.25&&terrainHeight(x,z)<1.4)add('shore-salvage-'+i,i%2?'rock':'driftwood',x,z);}
 const foods=randomSeed(MAP_SEED^0x719);for(let i=0;i<400;i++){const x=(foods()-.5)*WORLD_RADIUS*1.7,z=(foods()-.5)*WORLD_RADIUS*1.7;if(terrainHeight(x,z)>1&&!monumentAt(x,z)&&!BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<9)&&distanceToRoad(x,z,6)>4)add('food-'+i,['mushroom','pumpkin','corn'][i%3],x,z);}
 return nodes.filter(n=>resourceAllowed32(n.type,biomeRegion18(n.x,n.z,MAP_SCALE,MAP_REVISION,MAP_SEED,noise),terrainHeight(n.x,n.z),['fiber','berries','mushroom','pumpkin','corn'].includes(n.type)?slopeAt32(terrainHeight,n.x,n.z):0));
}
export function grantLoot(state,table){const result=[];for(const[item,base]of Object.entries(table)){if(!(item in ITEMS)||!Number.isFinite(base)||base<=0)continue;const amount=lootAmount(item,base,state.multiplier);state.inventory[item]+=amount;result.push({item,amount});}return result;}
export function harvest(state,node){if(state.dead||state.depleted.includes(node.id))return null;if(node.type==='cactus'){const left=state.nodeDamage[node.id]??node.remaining??3,power=Math.min(left,state.selected==='axe'&&state.inventory.axe>0?2:1);if(power<=0)return null;const amount=power*2*state.multiplier,cloth=power*state.multiplier;state.inventory.cactusFlesh=(state.inventory.cactusFlesh||0)+amount;state.inventory.fiber=(state.inventory.fiber||0)+cloth;node.remaining=left-power;state.nodeDamage[node.id]=node.remaining;if(!node.remaining)state.depleted.push(node.id);return{item:'cactusFlesh',amount,bonus:[{item:'fiber',amount:cloth}],depleted:!node.remaining};}const ore=['rock','copperOre','metalOre','sulfurOre','highMetalOre'].includes(node.type),power=node.type==='tree'&&state.selected==='axe'&&state.inventory.axe>0||ore&&state.selected==='pickaxe'&&state.inventory.pickaxe>0?2:1;const item=['tree','driftwood'].includes(node.type)?'wood':node.type==='rock'?'stone':node.type==='berries'?'berries':node.type==='metalOre'?'metalOre':node.type==='sulfurOre'?'sulfurOre':['copperOre','highMetalOre','mushroom','pumpkin','corn'].includes(node.type)?node.type:'fiber';const base=node.type==='tree'?5:ore?4:node.type==='fiber'?5:4;const gain=base*power*state.multiplier;state.inventory[item]+=gain;if(item in state.gathered)state.gathered[item]+=gain;node.remaining=Math.max(0,(state.nodeDamage[node.id]??node.remaining)-power);state.nodeDamage[node.id]=node.remaining;if(node.remaining===0)state.depleted.push(node.id);return{item,amount:gain,depleted:node.remaining===0};}
export const buildingHeight=b=>Number.isFinite(b.y)?b.y:terrainHeight(b.x,b.z);
export function placementHeight(state,kind,x,z,lift=0){
 const supports=state.buildings.filter(b=>b.hp>0&&(isFoundation(b.kind)||isFloor(b.kind))).map(b=>({...b,level:buildingHeight(b)+(isFloor(b.kind)?3:0)})).filter(b=>b.level<=(state.feetY??terrainHeight(state.position.x,state.position.z))+.9).sort((a,b)=>b.level-a.level||Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));
 const near=supports.find(b=>Math.hypot(b.x-x,b.z-z)<(isFoundation(kind)?4.4:2.5));
 if(isFoundation(kind)){const ground=Math.max(...[-1.5,1.5].flatMap(dx=>[-1.5,1.5].map(dz=>terrainHeight(x+dx,z+dz))));return(near?near.level:ground+.04)+Math.max(0,Math.min(2,lift));}
 return near?near.level+(kind==='sleepingBag'?(isFoundation(near.kind)?.38:.11):0):terrainHeight(x,z);
}
export function placementCheck(state,kind,x,z,rotation=0,y=placementHeight(state,kind,x,z)){
 if(!BUILD_KINDS.includes(kind)||![x,z,rotation,y].every(Number.isFinite))return{ok:false,reason:'Неверная постройка'};
 if(Math.abs(y-terrainHeight(x,z))>(isFoundation(kind)?3:24))return{ok:false,reason:'Слишком высокая опора'};
 if(BUILD_COSTS[kind]){if(!state.inventory.plan)return{ok:false,reason:'Нужен строительный план'};if(!Object.entries(BUILD_COSTS[kind]).every(([k,n])=>state.inventory[k]>=n))return{ok:false,reason:'Не хватает ресурсов'};}else if(!(state.inventory[kind]>0))return{ok:false,reason:'Сначала создай предмет'};
 if(Math.hypot(x-state.position.x,z-state.position.z)>7)return{ok:false,reason:'Слишком далеко'};if(terrainHeight(x,z)<.3)return{ok:false,reason:'Нужна суша'};
 if(monumentAt(x,z))return{ok:false,reason:'Территория РТ или мирной зоны'};
 if(BOT_BASES.some(b=>Math.hypot(b.x-x,b.z-z)<14&&!state.authorizedBases?.includes(b.id)&&!state.depleted.includes('tc-'+b.id)))return{ok:false,reason:'Чужой шкаф: нет авторизации'};
 if(distanceToRoad(x,z,6)<4)return{ok:false,reason:'Нельзя перекрывать дорогу'};
 const alive=state.buildings.filter(b=>b.hp>0);
 if(kind==='sleepingBag'){const check=bagPlacement27(state,x,z,rotation,y,terrainHeight);if(!check.ok)return check;}
 if(isFoundation(kind)){if([-1.5,1.5].some(dx=>[-1.5,1.5].some(dz=>terrainHeight(x+dx,z+dz)>y+.12)))return{ok:false,reason:'Подними фундамент Q / Z'};if(alive.some(b=>isFoundation(b.kind)&&Math.hypot(b.x-x,b.z-z)<2.7))return{ok:false,reason:'Основание уже занято'};}
 else if(isStructural(kind)||['door','cupboard'].includes(kind)){
  if(!alive.some(b=>(isFoundation(b.kind)||isFloor(b.kind))&&Math.hypot(b.x-x,b.z-z)<2.6))return{ok:false,reason:'Нужен свой фундамент или перекрытие'};
  if(alive.some(b=>b.kind===kind&&Math.hypot(b.x-x,b.z-z)<.3&&Math.abs(buildingHeight(b)-y)<.3&&Math.abs(Math.sin((b.rotation||0)-rotation))<.1))return{ok:false,reason:'Место занято'};
  if(kind==='door'&&!alive.some(b=>b.kind==='doorway'&&Math.hypot(b.x-x,b.z-z)<.4&&Math.abs(buildingHeight(b)-y)<.3))return{ok:false,reason:'Дверь ставится в дверной проём'};
 }
 if(alive.some(b=>b.kind==='cupboard'&&kind==='cupboard'&&Math.hypot(b.x-x,b.z-z)<20))return{ok:false,reason:'Рядом уже есть свой шкаф'};
 return{ok:true};
}
export function placeBuilding(state,kind,x,z,rotation=0,y=placementHeight(state,kind,x,z)){const check=placementCheck(state,kind,x,z,rotation,y);if(!check.ok)return check;if(BUILD_COSTS[kind]){for(const [k,n]of Object.entries(BUILD_COSTS[kind]))state.inventory[k]-=n;}else state.inventory[kind]--;const building={id:'build-'+(Math.max(0,...state.buildings.map(b=>Number(b.id.split('-')[1])||0))+1),kind,x,z,y,rotation,open:false,tier:isStructural(kind)||kind==='sleepingBag'?0:1,hp:TIERS[isStructural(kind)||kind==='sleepingBag'?0:1].hp};state.buildings.push(building);return{ok:true,building};}
export function upgradeBuilding(state,b){if(!b||!state.buildings.includes(b)||b.hp<=0||!isStructural(b.kind))return{ok:false,reason:'Нельзя улучшить'};if(Math.hypot(b.x-state.position.x,b.z-state.position.z)>6)return{ok:false,reason:'Слишком далеко'};const tier=TIERS[b.tier+1];if(!tier)return{ok:false,reason:'Максимальный уровень'};if(!Object.entries(tier.cost).every(([id,n])=>state.inventory[id]>=n))return{ok:false,reason:'Не хватает ресурсов'};for(const[id,n]of Object.entries(tier.cost))state.inventory[id]-=n;b.tier++;b.hp=tier.hp;return{ok:true};}
export function repairBuilding(state,b){if(!b||!state.buildings.includes(b)||b.hp<=0||Math.hypot(b.x-state.position.x,b.z-state.position.z)>6)return false;const max=TIERS[b.tier].hp;if(b.hp>=max)return false;const id=b.tier===4?'highMetal':b.tier>=3?'metal':b.tier===2?'stone':'wood',cost=Math.ceil((max-b.hp)/(b.tier===4?180:50));if(state.inventory[id]<cost)return false;state.inventory[id]-=cost;b.hp=max;return true;}
export function damageStructure(state,structure,amount){if(!structure||!Number.isFinite(amount)||amount<=0)return 0;const max=TIERS[structure.tier??0].hp;const current=structure.owner?(state.structureDamage[structure.id]??max):structure.hp;if(current<=0)return 0;const hp=Math.max(0,current-amount);if(structure.owner){state.structureDamage[structure.id]=hp;if(state.buildings.includes(structure))structure.hp=hp;if(hp===0&&!state.depleted.includes(structure.id))state.depleted.push(structure.id);}else structure.hp=hp;return hp;}
export function reload(state){const id=isGun(state.selected)?state.selected:'rifle',w=WEAPONS[id],ammo=id==='rocketLauncher'?(state.rocketAmmo||'rocket'):w.ammo,loaded=magazine(state,id);if(!state.inventory[id]||!(state.inventory[ammo]>0))return 0;let current=loaded;if(id==='rocketLauncher'&&loaded&&ammo!==(state.loadedRocketType||'rocket')){state.inventory[state.loadedRocketType||'rocket']+=loaded;current=0;}if(current>=weaponCapacity25(state,id))return 0;const n=Math.min(weaponCapacity25(state,id)-current,state.inventory[ammo]);state.inventory[ammo]-=n;setMagazine(state,id,current+n);if(id==='rocketLauncher')state.loadedRocketType=ammo;return n;}
export function missionProgress(state){return[
 {id:'gather',title:'Заготовь дерево и камень',detail:`${Math.min(state.gathered.wood,15)}/15 дерева · ${Math.min(state.gathered.stone,8)}/8 камня`,done:state.gathered.wood>=15&&state.gathered.stone>=8},
 {id:'shelter',title:'Укрытие и первая печь',detail:'Фундамент, костёр, печь',done:['foundation','campfire','furnace'].every(k=>state.buildings.some(b=>b.kind===k&&b.hp>0))},
 {id:'explore',title:'Разведай '+MONUMENTS.length+' РТ',detail:`Исследовано ${state.visited.length} / ${MONUMENTS.length} · M — карта`,done:state.visited.length>=MONUMENTS.length},
 {id:'radio',title:'Верни питание передатчику',detail:'Собери аккумулятор из металлолома и волокна',done:state.radioFixed}
 ];}
export function encodeSave(state){return JSON.stringify({...state,version:2});}
export function decodeSave(raw){try{
 const s=JSON.parse(raw);if(!s||s.version!==2||!Number.isInteger(s.seed)||s.seed<1||s.seed>999999999||!Object.hasOwn(MAP_SIZES,s.size)||!['peaceful','standard','hard'].includes(s.difficulty)||!MULTIPLIERS.includes(s.multiplier))return null;const out=newGame({deferSpawn:true});
 const deepTerrain13=Number.isInteger(s.contentRevision)&&s.contentRevision>=6;
 const coord=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.hypot(p.x,p.z)<=325*MAP_SIZES[s.size].scale*1.5+5;
 if(s.botLimit26!==undefined&&(!Number.isInteger(s.botLimit26)||s.botLimit26<0||s.botLimit26>96)||!validSociety26(s.society26,ITEMS,coord,WEAPONS))return null;
 if(!validTactics27(s.society26,coord))return null;
 if(!validBagSave27(s))return null;
 if(!coord(s.position)||s.feetY!==undefined&&(!Number.isFinite(s.feetY)||s.feetY<(deepTerrain13?-40:-5)||s.feetY>350))return null;for(const k of['health','hunger','thirst','stamina'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>100)return null;
 if(!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>1e8||!Number.isFinite(s.yaw)||!Number.isFinite(s.pitch))return null;
 if(!s.inventory||LEGACY_KEYS.some(k=>!Object.hasOwn(s.inventory,k))||Object.entries(s.inventory).some(([k,n])=>!Object.hasOwn(ITEMS,k)||!Number.isInteger(n)||n<0||n>1e8))return null;
 if(s.attachments25!==undefined&&(!s.attachments25||typeof s.attachments25!=='object'||Array.isArray(s.attachments25)||Object.entries(s.attachments25).some(([gun,a])=>!isGun(gun)||!Array.isArray(a)||a.length!==4||a.some((id,i)=>id!==null&&(!MODS25[id]||MODS25[id].slot!==i||!modCompatible25(gun,id))))))return null;
 if(s.laserEnabled25!==undefined&&typeof s.laserEnabled25!=='boolean')return null;
 if(s.wear24!==undefined&&!wearValid24(s.wear24))return null;
 const ids=a=>Array.isArray(a)&&a.length<=300000&&a.every(x=>typeof x==='string'&&x.length<100);
 if(!ids(s.depleted)||!ids(s.looted)||!ids(s.visited)||s.visited.some(id=>!MONUMENTS.some(m=>m.id===id))||!Array.isArray(s.buildings)||s.buildings.length>400)return null;
 for(const b of s.buildings)if(!b||!BUILD_KINDS.includes(b.kind)||typeof b.id!=='string'||!coord(b)||!Number.isFinite(b.rotation)||(b.y!==undefined&&(!Number.isFinite(b.y)||b.y< -10||b.y>350))||!Number.isInteger(b.tier)||b.tier<0||b.tier>4||!Number.isFinite(b.hp)||b.hp<0||b.hp>TIERS[b.tier].hp)return null;
 if(!s.gathered||Object.keys(out.gathered).some(k=>!Number.isInteger(s.gathered[k])||s.gathered[k]<0||s.gathered[k]>1e8))return null;
 for(const key of['nodeDamage','structureDamage','botStores'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])||Object.keys(s[key]).length>150000||Object.values(s[key]).some(n=>!Number.isFinite(n)||n<0||n>1e8))return null;
 if(!s.botState||typeof s.botState!=='object'||Object.keys(s.botState).length>160||Object.values(s.botState).some(b=>!b||!Number.isFinite(b.hp)||b.hp<0||b.hp>120))return null;
 const validItems=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.entries(o).every(([k,n])=>Object.hasOwn(ITEMS,k)&&Number.isInteger(n)&&n>0&&n<=1e8);
 if(s.containers!==undefined&&(!s.containers||typeof s.containers!=='object'||Array.isArray(s.containers)||Object.keys(s.containers).length>30000||Object.entries(s.containers).some(([id,o])=>id.length>100||!validItems(o))))return null;
 if(s.slots!==undefined&&(!Array.isArray(s.slots)||s.slots.length!==36||s.slots.some(o=>o!==null&&(!o||!Object.hasOwn(ITEMS,o.item)||!Number.isInteger(o.count)||o.count<1||o.count>(['syringe','medkit'].includes(o.item)?1000:stackLimit(o.item,s))))))return null;
 if(s.markers!==undefined&&(!Array.isArray(s.markers)||s.markers.length>16||s.markers.some(m=>!coord(m)||typeof m.label!=='string'||m.label.length>40)))return null;
 if(s.groundBags?.some?.(b=>b?.corpse29&&(!b.corpse29||!wearValid24(b.corpse29.wear)||typeof b.corpse29.gun!=='string'||b.corpse29.gun&&!Object.hasOwn(WEAPONS,b.corpse29.gun)||!Number.isFinite(b.corpse29.yaw)||!Number.isFinite(b.corpse29.seed)||!Number.isFinite(b.corpse29.at))))return null;
 if(s.groundBags!==undefined&&(!Array.isArray(s.groundBags)||s.groundBags.length>10000||s.groundBags.some(b=>!coord(b)||typeof b.id!=='string'||b.id.length>100||b.y!==undefined&&(!Number.isFinite(b.y)||b.y<(deepTerrain13?-40:-10)||b.y>350)||b.source!==undefined&&(typeof b.source!=='string'||b.source.length>100))))return null;
 if(s.recyclers20!==undefined&&(!s.recyclers20||typeof s.recyclers20!=='object'||Array.isArray(s.recyclers20)||Object.keys(s.recyclers20).length>1000||Object.entries(s.recyclers20).some(([id,f])=>id.length>100||!f||typeof f.on!=='boolean'||!Number.isFinite(f.progress)||f.progress<0||f.progress>2.5||!Array.isArray(f.slots)||f.slots.length!==12||f.slots.some(a=>a&&(!Object.hasOwn(ITEMS,a.item)||!Number.isInteger(a.count)||a.count<1||a.count>stackLimit(a.item,s))))))return null;
 if(s.propPhysics19!==undefined&&(!s.propPhysics19||typeof s.propPhysics19!=='object'||Array.isArray(s.propPhysics19)||Object.keys(s.propPhysics19).length>30000||Object.entries(s.propPhysics19).some(([id,p])=>id.length>100||!coord(p)||!Number.isFinite(p.y)||p.y< -40||p.y>350)))return null;
 if(s.authorizedBases!==undefined&&!ids(s.authorizedBases))return null;
 if(s.upkeep!==undefined&&(!s.upkeep||typeof s.upkeep!=='object'||Array.isArray(s.upkeep)||Object.keys(s.upkeep).length>1800||Object.entries(s.upkeep).some(([id,r])=>id.length>100||!r||typeof r!=='object'||!r.credit||typeof r.credit!=='object'||Array.isArray(r.credit)||Object.entries(r.credit).some(([k,n])=>!['wood','stone','metal','highMetal'].includes(k)||!Number.isFinite(n)||n<0||n>1e7))))return null;
 if(s.condition!==undefined&&(!s.condition||typeof s.condition!=='object'||Array.isArray(s.condition)||Object.entries(s.condition).some(([id,n])=>!isGun(id)||!Number.isFinite(n)||n<0||n>100)))return null;
 for(const k of['rocketAmmo','loadedRocketType'])if(s[k]!==undefined&&!['rocket','hvRocket','incendiaryRocket'].includes(s[k]))return null;
 if(s.doors!==undefined&&(!s.doors||typeof s.doors!=='object'||Array.isArray(s.doors)||Object.keys(s.doors).length>60000||Object.entries(s.doors).some(([id,v])=>id.length>100||typeof v!=='boolean')))return null;
 if(s.magazines!==undefined&&(!s.magazines||typeof s.magazines!=='object'||Object.entries(s.magazines).some(([k,n])=>!isGun(k)||!Number.isInteger(n)||n<0||n>weaponCapacity25(s,k))))return null;
 if(s.furnaces!==undefined&&(!s.furnaces||typeof s.furnaces!=='object'||Object.keys(s.furnaces).length>1000||Object.values(s.furnaces).some(f=>!f||!Array.isArray(f.slots)||f.slots.length!==6||typeof f.on!=='boolean'||!Number.isFinite(f.progress)||f.progress<0||f.progress>4||!Number.isFinite(f.fuelTime)||f.fuelTime<0||f.fuelTime>8||f.slots.some((a,i)=>a&&(!Object.hasOwn(ITEMS,a.item)||!Number.isInteger(a.count)||a.count<1||a.count>stackLimit(a.item,s)||i===0&&a.item!=='wood'||i>0&&i<3&&!['copperOre','metalOre','sulfurOre','highMetalOre'].includes(a.item)||i>=3&&!['copperIngot','metal','sulfur','highMetal','charcoal'].includes(a.item))))))return null;
 if(s.boat!==undefined&&s.boat!==null&&!/^boat-[0-3]$/.test(s.boat))return null;
 if(s.boatState!==undefined&&(!s.boatState||typeof s.boatState!=='object'||Object.entries(s.boatState).some(([id,p])=>!/^boat-[0-3]$/.test(id)||!coord(p))))return null;
 if(s.lastDamage!==undefined&&(!s.lastDamage||!['water','drowning','hunger','thirst','bot','wolf','explosion','fall'].includes(s.lastDamage.source)||!Number.isFinite(s.lastDamage.at)||s.lastDamage.at<0||!Number.isFinite(s.lastDamage.amount)||s.lastDamage.amount<0))return null;
 if(!Number.isInteger(s.magazine)||s.magazine<0||s.magazine>weaponCapacity25(s,'rifle')||!Object.hasOwn(ITEMS,s.selected))return null;
 if(s.oxygen!==undefined&&(!Number.isFinite(s.oxygen)||s.oxygen<0||s.oxygen>100))return null;
 const inventory={...out.inventory,...s.inventory};if(!Object.hasOwn(s.inventory,'plan'))for(const [kind,cost]of Object.entries(BUILD_COSTS)){for(const [k,n]of Object.entries(cost))inventory[k]+=(inventory[kind]||0)*n;inventory[kind]=0;}
 const wear24=s.wear24===undefined?Array(7).fill(null):[...s.wear24];
 // One-time migration of the old automatically active leather armour; no free duplicate.
 if(s.wear24===undefined&&inventory.armor>0){inventory.armor--;wear24[3]='armor';}
 // Validation is pure: reading a backup must never change the active map globals.
 return{...out,...s,densityRevision:Number.isInteger(s.densityRevision)?s.densityRevision:0,contentRevision:Number.isInteger(s.contentRevision)?s.contentRevision:3,inventory,wear24,yaw:s.yaw%(Math.PI*2),pitch:clamp(s.pitch,-1.4,1.4),dead:s.health<=0,radioFixed:!!s.radioFixed};
 }catch{return null;}}

let beachCache=null;
/** Sample the entire coast; cache a pool, not the first adequate desert point.
 * Default remains deterministic for starter salvage. Respawns rotate the pool. */
export function beachSpawn({sequence=0}={}){
 const key=MAP_SEED+':'+MAP_SCALE+':'+MAP_REVISION+':'+(MAP_REVISION>=9?MAP_LAYOUT18:0);
 if(beachCache?.key!==key){
  const random=randomSeed(MAP_SEED^0x18beac),phase=random()*Math.PI*2,pool=[];
  for(let i=0;i<128;i++){
   const a=phase+i*Math.PI*2/128,co=Math.cos(a),si=Math.sin(a);let best=null;
   for(let radius=WORLD_RADIUS*1.18;radius>=WORLD_RADIUS*.65;radius-=Math.max(.8,MAP_SCALE*.65)){
    const x=co*radius,z=si*radius,h=terrainHeight(x,z);
    if(h<.38||h>1.0)continue;
    const river=riverAt(x,z);if(monumentAt(x,z)||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+12)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<19)||distanceToRoad(x,z,6)<5||river&&river.distance<river.width*.5+5)continue;
    const slope=Math.max(...[[.7,0],[-.7,0],[0,.7],[0,-.7]].map(([dx,dz])=>Math.abs(terrainHeight(x+dx,z+dz)-h)));if(slope>.22)continue;
    const actual=biomeRegion18(x,z,MAP_SCALE,MAP_REVISION,MAP_SEED,noise).id,inland=biomeRegion18(x*.97,z*.97,MAP_SCALE,MAP_REVISION,MAP_SEED,noise).id,biome=[actual,inland].includes('arid')?'arid':[actual,inland].includes('snow')?'snow':actual,score=Math.abs(h-.65)+slope*.8;
    if(!best||score<best.score)best={x,z,biome,score};
   }
   if(best)pool.push(best);
  }
  if(!pool.length)throw new Error('Не удалось найти безопасный пляж для этого зерна');
  const temperate=pool.filter(p=>!['arid','snow'].includes(p.biome)),nonDesert=pool.filter(p=>p.biome!=='arid'),chosen=temperate.length?temperate:nonDesert.length?nonDesert:pool;
  for(let i=chosen.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
  beachCache={key,positions:chosen};
 }
 const positions=beachCache.positions,index=Math.max(0,Math.trunc(Number.isFinite(sequence)?sequence:0))%positions.length,p=positions[index];return{x:p.x,z:p.z};
}
