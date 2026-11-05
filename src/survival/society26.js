import {clanHomes38,clanSite38} from './clan-sites38.js';
/** Autonomous finite-inventory settlers. All decisions run on the local simulation clock.
 * No network/LLM, no off-screen income or loot teleportation. World adapter owns visuals.
 */
import * as THREE from 'three';
import {prop38} from './props38.js';
import {houseStock38} from './house-loot38.js';
import {housePlan20,hashHouse20} from './house-plans20.js';
import {utility37,cover37,botShotReady37,recordBotShot37} from './behavior37.js';
import {BOT_BASES,MONUMENTS,safeZoneAt,distanceToRoad} from './map-data.js';
import {randomSeed,terrainHeight,harvest,RECIPES,BUILD_KINDS,TIERS} from './state.js';
import {WEAPONS,BUILD_COSTS,isGun} from './catalog.js';
import {safeCamp} from './health.js';
import {weaponModel16} from './items16.js';
import {CLOTHING24,isClothing24,wearStats24} from './clothing24.js';
import {crateLoot} from './loot04.js';
import {createContainer} from './inventory.js';
const V=THREE.Vector3,dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),count=b=>Object.values(b).reduce((a,n)=>a+n,0);
const add=(b,k,n)=>{if(n>0)b[k]=(b[k]||0)+n;};
function spend(b,cost){if(!Object.entries(cost).every(([k,n])=>(b[k]||0)>=n))return false;for(const[k,n]of Object.entries(cost)){b[k]-=n;if(!b[k])delete b[k];}return true;}
function transfer(from,to,k,n){n=Math.min(from[k]||0,n);if(n>0){spend(from,{[k]:n});add(to,k,n);}return n;}
const depot=id=>'tc-ai26-'+id;
const log=(s,text)=>{s.society26.events.push(text);s.society26.events=s.society26.events.slice(-32);};
function craft(b,id){const r=RECIPES[id];if(!r||!spend(b,r.cost))return false;add(b,id,r.output||1);return true;}
function record(id,home,x,z,bag,gun=''){return{id,home,x,z,bag,gun,hp:120,respawnAt:0,food:100,nextFood:60,shotAt:0};}
function initialize(w,s){
 s.containers??={};
 if(!s.society26){
  s.society26={version:1,serial:0,factions:{},actors:{},events:[]};let remaining=s.botLimit26??0,serial=0;
  // Initial houses/stores/loadouts are the sole bootstrap allowance. Never reseeded.
  const homes=clanHomes38(s.seed);
  for(const base of homes){if(remaining<=0||Object.keys(s.society26.factions).length>=32)break;const capacity=1+(base.stories||1),n=Math.min(remaining,capacity),f={id:base.id,x:base.x,z:base.z,team:Object.keys(s.society26.factions).length%3,capacity,stage:0,huts:0,site:null,nextRaid:s.elapsed+240,nextCraft:s.elapsed+8};
   s.society26.factions[f.id]=f;const store={wood:180,stone:100,metalOre:70,sulfurOre:45,fiber:65,metal:30,lowFuel:10,rifle:1,ammo:24,pistol:n,pistolAmmo:n*24,axe:n,pickaxe:n,bandage:n*2,water:n*3,berries:n*8,combatShirt:n,cargoPants:n,combatBoots:n,tacticalGloves:n,kevlarVest:n,kevlarHelmet:n};const wealth38=housePlan20(base,BOT_BASES,randomSeed(hashHouse20(s.seed,base.id+'house20'))).wealth;const reserve38=houseStock38(base,wealth38,'armory',randomSeed(hashHouse20(s.seed,base.id+'reserve38')));for(const[k,q]of Object.entries(reserve38))add(store,k,q);s.containers[depot(f.id)]=store;
   for(let i=0;i<n;i++){const id='settler26-'+serial++,bag={};for(const[k,q]of Object.entries({pistol:1,pistolAmmo:12,axe:1,pickaxe:1,bandage:1,water:1,berries:4,combatShirt:1,cargoPants:1,combatBoots:1,tacticalGloves:1,kevlarVest:1,kevlarHelmet:1}))transfer(store,bag,k,q);s.society26.actors[id]=record(id,f.id,base.x+10+i,base.z+8,bag,'pistol');}remaining-=n;
  }
  for(const b of w.bots){const a=record(b.id,null,b.x,b.z,{rifle:1,ammo:96,bandage:1,berries:20,water:5,kevlarVest:1,kevlarHelmet:1},'rifle');a.hp=s.botState[b.id]?.hp??120;s.society26.actors[b.id]=a;}
  s.society26.serial=serial;log(s,'Основаны отряды. Стартовые запасы выданы однократно.');
 }
 for(const [id,a]of Object.entries(s.society26.actors)){
  let b=w.bots.find(b=>b.id===id);if(!b){b=w.spawnSettler26(a);w.bots.push(b);}b.actor26=a;b.base=a.home;b.x=a.x;b.z=a.z;b.hp=a.hp;b.dead=a.hp<=0;b.gun26='';b.mode=a.home?'return':'patrol';b.goal26=null;b.route26=[];b.think26=0;b.ai26=0;b.foodAt26=s.elapsed;b.ai26=-(b.phase%20)/20;b.appearance26=!!(a.bag.kevlarVest||a.bag.riotVest);
 }
 w.depots26=[];
 for(const f of Object.values(s.society26.factions)){
  const id=depot(f.id);s.containers[id]??={};let p={x:f.x+11,z:f.z+8};for(let n=0;n<32;n++){const a=n*2.399,r=8+Math.sqrt(n)*2,q={x:f.x+Math.cos(a)*r,z:f.z+Math.sin(a)*r},y=terrainHeight(q.x,q.z);if(y>1&&w.canMove(q.x,q.z,s,y)){p=q;break;}}
  const yard38=clanSite38(BOT_BASES.find(b=>b.id===f.id),s.seed);if(!Number.isFinite(f.depotX)&&yard38){const {gate}=yard38.layout,nx=Math.sin(yard38.yaw),nz=Math.cos(yard38.yaw);for(const side of[-1,1]){const q={x:gate.x-nx*1.3+nz*side*1.8,z:gate.z-nz*1.3-nx*side*1.8},y=terrainHeight(q.x,q.z);if([[-.6,-.6],[-.6,.6],[.6,-.6],[.6,.6]].every(([dx,dz])=>w.canMove(q.x+dx,q.z+dz,s,y))){p=q;break;}}}
  if(Number.isFinite(f.depotX)&&Number.isFinite(f.depotZ))p={x:f.depotX,z:f.depotZ};
  const model=prop38('reinforcedCrate');model.position.set(p.x,terrainHeight(p.x,p.z),p.z);w.scene.add(model);const entry={id,type:'crate',x:p.x,z:p.z,model,home26:f.id};w.interactables.push(entry);w.depots26.push(entry);f.depotX=p.x;f.depotZ=p.z;
 }
}
/** Bounded local A*: 4m cells, 180 expansions per replan, best reachable partial route.
 * Collision and triangle-ground queries are identical to player movement. No teleport. */
function route(w,s,b,goal,step=4){
 s={...s,crouched:!!b.crouch27};const key=(x,z)=>x+':'+z,start={x:b.x,z:b.z,y:b.y,g:0,parent:null},open=[start],seen=new Map([[key(Math.round(b.x/step),Math.round(b.z/step)),0]]);let best=start;
 for(let n=0;n<180&&open.length;n++){
  open.sort((a,c)=>a.g+dist(a,goal)-c.g-dist(c,goal));const p=open.shift();if(dist(p,goal)<dist(best,goal))best=p;if(dist(p,goal)<step*1.25){best=p;break;}
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=p.x+dx*step,z=p.z+dz*step,g=p.g+Math.hypot(dx,dz)*step,k=key(Math.round(x/step),Math.round(z/step));if((seen.get(k)??Infinity)<=g)continue;const y=w.floorHeight(x,z,s,p.y);if(y<.2||Math.abs(y-p.y)>step*.55||!w.canMove(x,z,s,y))continue;let clear=true;for(let i=1;i<=4;i++){const t=i/4,qx=p.x+(x-p.x)*t,qz=p.z+(z-p.z)*t,qy=w.floorHeight(qx,qz,s,p.y+(y-p.y)*t);if(!w.canMove(qx,qz,s,qy)||Math.abs(qy-(p.y+(y-p.y)*t))>.6){clear=false;break;}}if(!clear)continue;seen.set(k,g);open.push({x,z,y,g,parent:p});}
 }
 const result=[];for(let p=best;p.parent;p=p.parent)result.push({x:p.x,z:p.z});return result.reverse();
}
function move(w,s,b,goal,dt,speed){
 goal=w.compoundApproach38?.(s,b,goal)||goal;
 const tolerance=goal.local27?.15:goal.exact27?.6:1.8;if(dist(b,goal)<tolerance)return false;
 const probe={...s,crouched:!!b.crouch27},goalKey=goal.x+':'+goal.z;if(b.routeGoal27!==goalKey){b.routeGoal27=goalKey;b.route26=[];b.routeAt26=0;}
 if(!goal.local27&&(!b.route26.length||s.elapsed>(b.routeAt26||0))){if(w.navBudget26<=0)return false;w.navBudget26--;b.route26=route(w,probe,b,goal);b.routeAt26=s.elapsed+5;}
 const walk=p=>{const dx=p.x-b.x,dz=p.z-b.z,len=Math.hypot(dx,dz)||1,d=Math.min(len,speed*dt);let y=b.y;
  for(let i=1;i<=Math.ceil(d/.18);i++){const q=Math.min(d,i*.18),x=b.x+dx/len*q,z=b.z+dz/len*q,ny=w.floorHeight(x,z,probe,y);if(ny<.2||Math.abs(ny-y)>.4||!w.canMove(x,z,probe,ny))return false;y=ny;}
  b.x+=dx/len*d;b.z+=dz/len*d;b.y=y;b.model.rotation.y=Math.atan2(dx,dz);return true;};
 if(goal.local27){if(walk(goal)){b.avoid27=null;return true;}const key=goal.x+':'+goal.z;if(b.avoidKey27!==key){b.avoid27=null;b.avoidKey27=key;}if(!b.avoid27?.length){if(w.navBudget26<=0)return false;w.navBudget26--;b.avoid27=route(w,probe,b,goal,.5);}while(b.avoid27.length&&dist(b,b.avoid27[0])<.2)b.avoid27.shift();return b.avoid27.length?walk(b.avoid27[0]):false;}
 const point=b.route26[0]||goal;if(walk(point)){if(dist(b,point)<.4)b.route26.shift();return true;}b.route26=[];b.routeAt26=0;return false;
}
function kill(w,b,s){
 const a=b.actor26;if(b.dead&&a.respawnAt)return;b.dead=true;b.hp=a.hp=0;a.respawnAt=s.elapsed+180;b.model.visible=b.weapon.visible=false;if(b.tool29)b.tool29.visible=false;
 w.dropBody29?.(b,s);if(count(a.bag)){const id='drop-ai26-'+s.society26.serial++;s.containers[id]=a.bag;s.groundBags??=[];s.groundBags.push({id,x:b.x,z:b.z,y:w.floorHeight(b.x,b.z,s,b.y)+.03});a.bag={};w.syncGroundBags(s);}
 a.gun='';s.botState[b.id]={hp:0};log(s,b.id+' погиб; вещи остались на теле.');
}
function updateIndex(w){
 w.nodeMap26=new Map();w.resources26=new Map();for(const n of w.nodes){w.nodeMap26.set(n.id,n);const k=Math.floor(n.x/80)+':'+Math.floor(n.z/80);if(!w.resources26.has(k))w.resources26.set(k,[]);w.resources26.get(k).push(n);}
 w.crates26=w.interactables.filter(n=>n.type==='crate'&&!n.home26&&!safeZoneAt(n.x,n.z));
}
function candidate(w,s,b,f){
 const a=b.actor26,store=s.containers[depot(f.id)],home={x:f.depotX,z:f.depotZ};
 if(count(a.bag)>150||a.food<30||b.hp<45||dist(b,home)>240)return{...home,kind:'return',at:s.elapsed};
 if(f.lastContact&&a.gun&&a.bag[WEAPONS[a.gun]?.ammo]>0&&s.elapsed-f.lastContact.at<8)return{x:f.lastContact.x,z:f.lastContact.z,kind:'ambush',at:s.elapsed};
 if(s.elapsed>f.nextRaid&&(a.bag.satchel||0)>0){const playerDoor=s.buildings.filter(p=>!p.owner&&['door','wall'].includes(p.kind)&&p.hp>0&&!safeCamp(p.x,p.z)&&dist(b,p)<180).sort((a,c)=>dist(b,a)-dist(b,c))[0];if(playerDoor&&(s.difficulty!=='peaceful'||b.alertUntil>w.time))return{x:playerDoor.x,z:playerDoor.z,kind:'raid',id:playerDoor.id,at:s.elapsed};const enemy=Object.values(s.society26.factions).filter(e=>e.team!==f.team).sort((a,c)=>dist(b,a)-dist(b,c))[0];if(enemy){const door=[...w.staticStructures.map(e=>e.data),...s.buildings].filter(p=>p.owner===enemy.id&&['door','wall'].includes(p.kind)&&!s.depleted.includes(p.id)&&p.hp>0).sort((a,c)=>dist(b,a)-dist(b,c))[0];if(door)return{x:door.x,z:door.z,kind:'raid',id:door.id,at:s.elapsed};}}
 const robbed=w.depots26.filter(c=>{const enemy=s.society26.factions[c.home26];return enemy.team!==f.team&&dist(b,c)<170&&count(s.containers[c.id]||{})>0&&(enemy.breachedUntil>s.elapsed||!w.bots.some(q=>!q.dead&&q.base===enemy.id&&dist(q,c)<40));});if(robbed.length){robbed.sort((a,c)=>dist(a,b)-dist(c,b));return{x:robbed[0].x,z:robbed[0].z,id:robbed[0].id,kind:'loot',at:s.elapsed};}
 if(b.phase%5===0&&s.elapsed>(b.ambushAt26||0)){const m=MONUMENTS.filter(m=>!m.safe&&m.kind!=='oilrig'&&dist(b,m)<220).sort((a,c)=>dist(b,a)-dist(b,c))[0];if(m){b.ambushAt26=s.elapsed+180;const dx=b.x-m.x,dz=b.z-m.z,d=Math.hypot(dx,dz)||1;return{x:m.x+dx/d*(m.radius+5),z:m.z+dz/d*(m.radius+5),kind:'ambush',at:s.elapsed};}}
 const corpses=(s.groundBags||[]).filter(p=>!s.depleted.includes(p.id)&&count(s.containers[p.id]||{})>0&&dist(b,p)<75);if(corpses.length){corpses.sort((a,c)=>dist(a,b)-dist(c,b));return{...corpses[0],kind:'loot',at:s.elapsed};}
 const crates=w.crates26.filter(c=>!s.depleted.includes(c.id)&&!s.looted.includes(c.id)&&!c.owner&&!c.settlement&&!(b.ignore26?.id===c.id&&s.elapsed<b.ignore26.until)&&dist(b,c)<170&&Math.abs((c.y??terrainHeight(c.x,c.z))-terrainHeight(c.x,c.z))<3);crates.sort((a,c)=>dist(a,b)-dist(c,b));if(crates.length&&((Number(b.id.split('-').at(-1))%3===0)||count(store)>600))return{...crates[0],model:undefined,kind:'loot',at:s.elapsed};
 const want=(store.wood||0)<120?'tree':(store.stone||0)<65?'rock':(store.sulfurOre||0)<55?'sulfurOre':(store.metalOre||0)<60?'metalOre':(store.copperIngot||0)<12&&(store.copperOre||0)<20?'copperOre':(store.fiber||0)<45?'fiber':(store.berries||0)<20?'berries':'tree';let nearest=null,score=Infinity;
 const ix=Math.floor(b.x/80),iz=Math.floor(b.z/80);for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++)for(const n of w.resources26.get((ix+x)+':'+(iz+z))||[]){if(s.depleted.includes(n.id)||s.nodeDamage[n.id]===0||safeZoneAt(n.x,n.z)||b.ignore26?.id===n.id&&s.elapsed<b.ignore26.until)continue;const q=dist(b,n)+(n.type===want?0:100);if(q<score&&['tree','rock','copperOre','metalOre','sulfurOre','fiber','berries','mushroom','corn','pumpkin'].includes(n.type)){score=q;nearest=n;}}
 if(nearest)return{x:nearest.x,z:nearest.z,kind:'gather',id:nearest.id,at:s.elapsed};return{...home,kind:'return',at:s.elapsed};
}
function processHome(w,s,b,f){
 const a=b.actor26,store=s.containers[depot(f.id)];
 for(const k of Object.keys(a.bag))if(!isClothing24(k)&&![a.gun,'axe','pickaxe','hammer','bandage','berries','water'].includes(k)&&!(k==='satchel'&&f.raid27?.stage==='rally'&&f.raid27.squad.includes(b.id)))transfer(a.bag,store,k,1e8);
 for(const[k,n]of Object.entries({bandage:2,berries:4,water:2}))transfer(store,a.bag,k,Math.max(0,n-(a.bag[k]||0)));
 let gun=Object.keys(WEAPONS).filter(id=>store[id]&&!WEAPONS[id].projectile&&(store[WEAPONS[id].ammo]||0)>12).sort((x,y)=>WEAPONS[y].damage/Math.sqrt(WEAPONS[y].interval)-WEAPONS[x].damage/Math.sqrt(WEAPONS[x].interval))[0];if(gun&&gun!==a.gun){if(a.gun)transfer(a.bag,store,a.gun,1);transfer(store,a.bag,gun,1);a.gun=gun;}
 if(a.gun)transfer(store,a.bag,WEAPONS[a.gun].ammo,Math.max(0,36-(a.bag[WEAPONS[a.gun].ammo]||0)));
 if(!a.bag.satchel&&s.elapsed>=f.nextRaid&&f.raid27?.stage!=='withdraw')transfer(store,a.bag,'satchel',1);
 if(s.elapsed<f.nextCraft)return;f.nextCraft=s.elapsed+8;b.mode='craft';
 if(store.wood>0&&spend(store,{wood:1})){let cycles=0;for(const[ore,product]of [['metalOre','metal'],['sulfurOre','sulfur'],['copperOre','copperIngot']]){const n=Math.min(store[ore]||0,2);if(n&&spend(store,{[ore]:n})){add(store,product,n);cycles=Math.max(cycles,n);}}add(store,'charcoal',Math.max(1,cycles));}
 if((store.bandage||0)<8)craft(store,'bandage');
 if((store.gunpowder||0)<180)craft(store,'gunpowder');
 if((store.ammo||0)<60)craft(store,'ammo');if((store.pistolAmmo||0)<60)craft(store,'pistolAmmo');if((store.satchel||0)<4)craft(store,'satchel');
 if(!store.metalPipe)craft(store,'metalPipe');if(!store.semiBody)craft(store,'semiBody');if(!store.rifle)craft(store,'rifle');
 for(const c of s.buildings.filter(p=>p.owner===f.id&&p.kind==='cupboard'&&p.hp>0)){const stock=s.containers[c.id]??={};for(const[k,n]of Object.entries({wood:40,stone:40,metal:20}))transfer(store,stock,k,Math.max(0,n-(stock[k]||0)));}
 if(!a.gun&&store.pistol){transfer(store,a.bag,'pistol',1);a.gun='pistol';}
}
const plan=[['foundation',0,0,0],['wall',0,-1.5,0],['wall',-1.5,0,Math.PI/2],['wall',1.5,0,Math.PI/2],['doorway',0,1.5,0],['door',0,1.5,0],['roof',0,0,0],['storage',.7,-.7,0],['cupboard',-.7,-.7,0],['furnace',-.7,.5,0],['workbench',.7,.5,0]];
function construction(w,s,b,f){
 if(f.huts>=2||s.buildings.length>=360)return false;const store=s.containers[depot(f.id)];
 if(!f.site){if((store.wood||0)<180||(store.metal||0)<10)return false;for(let i=0;i<24;i++){const a=i*2.399,x=f.x+Math.cos(a)*(22+i),z=f.z+Math.sin(a)*(22+i),y=terrainHeight(x,z);if(y<1||safeZoneAt(x,z)||distanceToRoad(x,z,6)<8||BOT_BASES.some(p=>p.id!==f.id&&Math.hypot(x-p.x,z-p.z)<15)||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+8)||s.buildings.some(p=>dist(p,{x,z})<6)||Math.max(...[-1.5,1.5].flatMap(dx=>[-1.5,1.5].map(dz=>Math.abs(terrainHeight(x+dx,z+dz)-y))))>.2)continue;f.site={x,z};break;}}
 if(!f.site)return false;if(dist(b,f.site)>5){b.mode='build';move(w,s,b,f.site,.5,2.4);return true;}
 const [kind,dx,dz,rotation]=plan[f.stage];if(!BUILD_KINDS.includes(kind))return false;const cost=BUILD_COSTS[kind]?{wood:BUILD_COSTS[kind].wood+20}:RECIPES[kind]?.cost;if(!cost||!spend(store,cost))return false;
 const y=Math.max(...[-1.5,1.5].flatMap(x=>[-1.5,1.5].map(z=>terrainHeight(f.site.x+x,f.site.z+z))))+.04;
 const part={id:'build-ai26-'+s.society26.serial++,kind,x:f.site.x+dx,z:f.site.z+dz,y,rotation,tier:1,hp:TIERS[1].hp,owner:f.id,open:false};s.buildings.push(part);w.addBuilding(part);f.stage++;b.mode='build';if(f.stage===plan.length){f.stage=0;f.huts++;f.capacity=Math.min(96,f.capacity+2);f.site=null;log(s,f.id+' построил жилой модуль из запасов.');}return true;
}
function combat(w,s,b,dt,damage){
 b.fireTarget29=null;const a=b.actor26,f=s.society26.factions[a.home],origin=new V(b.x,b.y+1.4-(b.crouch27?.5:0),b.z);let target=null,player=false,best=50;
 for(const other of w.bots){if(other===b||other.dead)continue;const of=s.society26.factions[other.actor26?.home];if(!f&&!of||f&&of&&of.team===f.team)continue;const d=dist(b,other);if(d<best&&w.lineOfSight(origin,new V(other.x,other.y+1.65-(other.crouch27?.45:0),other.z),s)){best=d;target=other;}}
 const pd=dist(b,s.position),provoked=b.alertUntil>w.time,day=w.dayCycle?.daylight??1;
 if(!safeCamp(s.position.x,s.position.z)&&(s.difficulty!=='peaceful'||provoked)&&pd<Math.min(best,day<.2?18:38)){
  const facing=(Math.sin(b.model.rotation.y)*(s.position.x-b.x)+Math.cos(b.model.rotation.y)*(s.position.z-b.z))/Math.max(.01,pd);
  if((provoked||facing>.25)&&w.lineOfSight(origin,new V(s.position.x,w.camera.position.y-.3,s.position.z),s)){target=s.position;player=true;best=pd;}
 }
 if(!target){b.seen26=0;return false;}if(f)f.lastContact={x:target.x,z:target.z,at:s.elapsed};b.mode=b.hp<35?'retreat':b.phase%3===0?'ambush':b.phase%3===1?'flank':'attack';
 b.seen26=(b.seen26||0)+dt;b.model.rotation.y=Math.atan2(target.x-b.x,target.z-b.z);const gun=WEAPONS[a.gun],ammo=gun?.ammo;
 if(b.crouch27)return true;if(b.hp<55&&!b.holdPosition27&&cover37(w,s,b,target,dt))return true;if(b.hp<35||!gun||!(a.bag[ammo]>0)){if(b.holdPosition27)return true;const away={x:b.x+(b.x-target.x)/Math.max(1,best)*12,z:b.z+(b.z-target.z)/Math.max(1,best)*12};move(w,s,b,away,dt,3.1);return true;}
 if(!b.holdPosition27&&b.mode==='flank'&&best>12){const q={x:target.x+(target.z-b.z)/Math.max(1,best)*12,z:target.z-(target.x-b.x)/Math.max(1,best)*12};move(w,s,b,q,dt,2.6);}
 if(b.seen26>.55)b.fireTarget29={target,player,until:s.elapsed+(dist(b,s.position)<150?.55:1.15)};

 return true;
}
function step(w,s,b,dt,damage){
 const a=b.actor26;if(!a)return;
 if(a.fuse26&&s.elapsed>=a.fuse26.at){const charge=a.fuse26;delete a.fuse26;const door=[...w.staticStructures.map(e=>e.data),...s.buildings].find(p=>p.id===charge.id);if(door&&!s.depleted.includes(door.id)&&door.hp>0){w.hitStructure26?.(door,300,{x:a.x,z:a.z,home:a.home});if(s.depleted.includes(door.id)||door.hp<=0){const enemy=s.society26.factions[door.owner];if(enemy)enemy.breachedUntil=s.elapsed+120;}const point=new V(door.x,(door.y??terrainHeight(door.x,door.z))+1,door.z);w.explosionFlash04(point);w.onAIExplosion26?.(point);}const home=s.society26.factions[a.home];if(home)home.nextRaid=s.elapsed+180;b.goal26=null;log(s,(a.home||a.id)+' израсходовал заряд при рейде.');}
  if(a.hp<=0){if(!a.respawnAt)kill(w,b,s);if(s.elapsed<a.respawnAt||!a.home)return;const f=s.society26.factions[a.home];a.hp=b.hp=120;a.respawnAt=0;b.dead=false;a.x=b.x=f.depotX;a.z=b.z=f.depotZ;a.food=60;b.goal26=null;log(s,a.id+' возродился без снаряжения.');}
 b.hp=a.hp;b.y=w.floorHeight(b.x,b.z,s,b.y??terrainHeight(b.x,b.z));
 if(s.elapsed>=a.nextFood){a.nextFood=s.elapsed+30;a.food=Math.max(0,a.food-4);if(a.food<65){const food=['berries','corn','pumpkin','mushroom','cannedFood'].find(k=>a.bag[k]);if(food&&spend(a.bag,{[food]:1}))a.food=Math.min(100,a.food+15);}if(a.food===0){a.hp=b.hp=Math.max(0,a.hp-3);if(!a.hp){kill(w,b,s);return;}}}
 if(utility37(w,s,b,dt)){a.x=b.x;a.z=b.z;s.botState[b.id]={hp:a.hp};return;}
 const tactical=w.tacticalOrder27?.(s,b);if(tactical){if(tactical.point)move(w,s,b,tactical.point,dt,tactical.point.local27?2.2:3.4);b.holdPosition27=true;combat(w,s,b,dt,damage);b.mode=tactical.mode;a.x=b.x;a.z=b.z;s.botState[b.id]={hp:a.hp};return;}
 if(combat(w,s,b,dt,damage)){b.goal26=null;b.seenAt26=s.elapsed;}else{
  b.seen26=0;const f=s.society26.factions[a.home];if(!f){b.mode='patrol';move(w,s,b,{x:b.homeX+Math.sin(s.elapsed*.08+b.phase)*4,z:b.homeZ+Math.cos(s.elapsed*.08+b.phase)*4},dt,1.2);}
  else{
   if(w.baseWork29?.(s,b,f,dt)){a.x=b.x;a.z=b.z;return;}
   const home={x:f.depotX,z:f.depotZ};if(dist(b,home)<4){processHome(w,s,b,f);if(Number(b.id.split('-').at(-1))%3===0&&s.elapsed>(b.buildAt26||0)){b.buildAt26=s.elapsed+3;if(construction(w,s,b,f)){b.goal26=null;}}}
   if(f.site&&Number(b.id.split('-').at(-1))%3===0&&s.elapsed>(b.buildAt26||0)){b.buildAt26=s.elapsed+2;if(construction(w,s,b,f)){a.x=b.x;a.z=b.z;return;}}
   let goal=b.goal26;if(!goal||s.elapsed-goal.at>65){if(goal){b.ignore26={id:goal.id,until:s.elapsed+90};}goal=b.goal26=candidate(w,s,b,f);b.route26=[];}
   b.mode=goal.kind;const reached=dist(b,goal)<(goal.kind==='raid'?3:2.6);if(!reached)move(w,s,b,goal,dt,goal.kind==='return'?3.2:2.8);
   else if(goal.kind==='return'){processHome(w,s,b,f);b.goal26=null;}
   else if(goal.kind==='gather'&&s.elapsed>(b.actAt26||0)){b.actAt26=s.elapsed+2;const node=w.nodeMap26.get(goal.id);if(!node||s.depleted.includes(goal.id)){b.goal26=null;}else{const item=node.type==='tree'?'wood':node.type==='rock'?'stone':node.type==='fiber'?'fiber':node.type;a.bag[item]??=0;const proxy={...s,inventory:a.bag,gathered:{wood:0,stone:0,fiber:0},selected:node.type==='tree'&&a.bag.axe?'axe':a.bag.pickaxe?'pickaxe':'rock',multiplier:1,dead:false};const result=harvest(proxy,node);if(result?.depleted){w.hideNode(node);b.goal26=null;}if(count(a.bag)>120)b.goal26={...home,kind:'return',at:s.elapsed};}}
   else if(goal.kind==='loot'){const crate=w.interactables.find(c=>c.id===goal.id);const eye=new V(b.x,b.y+1.3,b.z),point=new V(goal.x,(crate?.y??terrainHeight(goal.x,goal.z))+.7,goal.z);point.addScaledVector(eye.clone().sub(point).normalize(),.75);if(!w.lineOfSight(eye,point,s)){b.ignore26={id:goal.id,until:s.elapsed+90};b.goal26={...home,kind:'return',at:s.elapsed};return;}const contents=s.containers[goal.id]||(crate?(w.ensureCrateContents26?.(crate)||createContainer(s,crate.id,crateLoot(crate.id,s.seed,crate.crateType))):null);if(contents){for(const k of Object.keys(contents)){if(count(a.bag)>=200)break;transfer(contents,a.bag,k,Math.min(contents[k],200-count(a.bag)));}if(!count(contents)&&!crate?.home26){if(!s.looted.includes(goal.id))s.looted.push(goal.id);if(!s.depleted.includes(goal.id))s.depleted.push(goal.id);if(crate)crate.model.visible=false;}}b.goal26={...home,kind:'return',at:s.elapsed};}
   else if(goal.kind==='ambush'){goal.waitAt??=s.elapsed;if(s.elapsed-goal.waitAt>20)b.goal26={...home,kind:'return',at:s.elapsed};}
   else if(goal.kind==='raid'){const door=[...w.staticStructures.map(e=>e.data),...s.buildings].find(p=>p.id===goal.id);if(!door||s.depleted.includes(goal.id)||door.hp<=0){b.goal26=null;}else if(!a.fuse26){w.plantCharge27(s,b,door.id);}}
  }
 }
 a.x=b.x;a.z=b.z;s.botState[b.id]={hp:a.hp};
}
export function installSociety26(World){
 const sync=World.prototype.syncState,make=World.prototype.makeBots,animate=World.prototype.animateBot;
 World.prototype.makeBots=function(){make.call(this);};
 World.prototype.spawnSettler26=function(a){const model=this.normalized('Adventurer',1.78),bones={};model.updateMatrixWorld(true);model.traverse(o=>{if(o.isBone){const inverse=o.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bones[o.name]={bone:o,base:o.quaternion.clone(),x:new V(1,0,0).applyQuaternion(inverse),y:new V(0,1,0).applyQuaternion(inverse),z:new V(0,0,1).applyQuaternion(inverse)};}if(o.isMesh&&o.material){o.material=o.material.clone();if(!/skin|face|visor/i.test(o.material.name)){o.material.map=this.textures['items16/cloth-color.webp'];o.material.normalMap=this.textures['items16/cloth-normal.webp'];o.material.roughnessMap=this.textures['items16/cloth-orm.webp'];o.material.roughness=.95;if(!o.geometry.attributes.uv){o.geometry=o.geometry.clone();o.geometry.computeBoundingBox();const box=o.geometry.boundingBox,span=box.getSize(new V()),p=o.geometry.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push((p.getX(i)-box.min.x)/Math.max(.001,span.x)*2,(p.getY(i)-box.min.y)/Math.max(.001,span.y)*3);o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}}if(!/skin|face|visor/i.test(o.material.name))o.material.color.set([0xa8b597,0xaaa18e,0x96a9b4][(Number(a.id.split('-').at(-1))||0)%3]);}});this.scene.add(model);const weapon=new THREE.Group();weapon.scale.setScalar(.85);this.scene.add(weapon);return{id:a.id,base:a.home,model,weapon,bones,x:a.x,z:a.z,homeX:a.x,homeZ:a.z,spawnOffset:0,spawnXOffset17:0,y:terrainHeight(a.x,a.z),hp:a.hp,dead:false,mode:'return',phase:this.stringSeed(a.id)%100,alertUntil:0};};
 World.prototype.tickBotShot29=function(s,b){const a=b.actor26,r=b.fireTarget29,gun=WEAPONS[a?.gun];if(!r||!gun||!botShotReady37(s,b)||b.dead||b.crouch27||b.workPose29>s.elapsed||s.elapsed>r.until||s.elapsed<a.shotAt||!r.player&&r.target.dead)return;const target=r.player?s.position:r.target;if(r.player&&(s.dead||safeCamp(target.x,target.z)))return;const origin=new V(b.x,b.y+1.4,b.z),end=new V(target.x,r.player?this.camera.position.y-.3:target.y+1.35-(target.crouch27?.45:0),target.z),muzzle=this.botMuzzle29?.(b)||origin;if(this.lineOfSight(origin,muzzle,s)&&this.lineOfSight(muzzle,end,s)&&spend(a.bag,{[gun.ammo]:1})){recordBotShot37(b);a.shotAt=s.elapsed+Math.max(.04,gun.interval);this.reportShot27?.(s,muzzle,a.home);this.onGunshot07?.(muzzle,a.gun);b.firedAt29=s.elapsed;this.onBotShot08?.(muzzle,end,b);}};
 World.prototype.moveBot29=function(s,b,p,dt,speed){return move(this,s,b,p,dt,speed);};
 World.prototype.supplyBot27=function(s,b,f){processHome(this,s,b,f);};
 World.prototype.plantCharge27=function(s,b,id){const p=[...this.staticStructures.map(e=>e.data),...s.buildings].find(p=>p.id===id),a=b.actor26;if(!p||!a||a.fuse26||dist(b,p)>3||s.depleted.includes(id)||p.hp<=0)return false;const origin=new V(b.x,b.y+1.4,b.z),point=new V(p.x,(p.y??terrainHeight(p.x,p.z))+1.4,p.z);point.addScaledVector(origin.clone().sub(point).normalize(),.22);if(!this.lineOfSight(origin,point,s)||!spend(a.bag,{satchel:1}))return false;a.fuse26={id,at:s.elapsed+4};this.reportStructure27?.(s,p,b);return true;};
 World.prototype.syncState=function(s){sync.call(this,s);initialize(this,s);updateIndex(this);this.indexAt26=s.elapsed+15;};
 World.prototype.damageBot26=function(b,amount,s,source='bullet'){if(!b.actor26||b.dead||!Number.isFinite(amount)||amount<=0)return;const wear=Array(7).fill(null);for(const id of Object.keys(b.actor26.bag)){const c=CLOTHING24[id];if(c&&(!wear[c.index]||CLOTHING24[wear[c.index]].grade<c.grade))wear[c.index]=id;}amount*=1-(wearStats24({wear24:wear})[source]||0);b.actor26.hp=b.hp=Math.max(0,b.hp-amount);s.botState[b.id]={hp:b.hp};if(!b.hp)kill(this,b,s);};
 World.prototype.updateBots=function(dt,s,damage){if(!s.society26)return;this.aiState26=s;this.navBudget26=4;if(s.elapsed>this.indexAt26){updateIndex(this);this.indexAt26=s.elapsed+15;}for(const b of this.bots){const a=b.actor26;if(!a)continue;const near=dist(b,s.position)<150;b.model.visible=b.weapon.visible=near&&!b.dead;b.model.userData.distanceCulled16=!near&&!b.dead;if(b.tool29)b.tool29.visible=near&&!b.dead&&b.workPose29>s.elapsed;b.ai26=(b.ai26||0)+dt;const rate=near?.25:1;if(b.ai26>=rate){const t=Math.min(b.ai26,1);b.ai26=0;const before={x:b.x,z:b.z};step(this,s,b,t,damage);b.speed26=dist(b,before)/t;b.aiUpdates=(b.aiUpdates||0)+1;}b.model.position.set(b.x,b.y,b.z);if(a.gun!==b.gun26){b.weapon.removeFromParent();b.weapon.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();});b.weapon=a.gun?weaponModel16(a.gun):new THREE.Group();b.weapon.scale.setScalar(.85);this.scene.add(b.weapon);b.gun26=a.gun;}if(near&&!b.dead){const moving=Math.min(1,(b.speed26||0)/2.6);animate.call(this,b,dt,moving,!!a.gun);if(b.crouch27){b.model.position.y-=.45;for(const [key,angle]of [['UpperLegL',1.15],['UpperLegR',1.15],['LowerLegL',-2.1],['LowerLegR',-2.1]]){const bone=b.bones[key];if(bone)bone.bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(bone.x,angle));}}b.lastAnimated26={x:b.x,z:b.z};b.weapon.rotation.set(0,b.model.rotation.y+Math.PI,0);b.weapon.position.set(b.x+Math.sin(b.model.rotation.y)*.32,b.y+1.18-(b.crouch27?.5:0),b.z+Math.cos(b.model.rotation.y)*.32);b.weapon.visible=!!a.gun;this.poseBot29?.(b,s);}if(!b.dead)this.tickBotShot29(s,b);if(b.dead)b.model.visible=b.weapon.visible=false;}};
}
