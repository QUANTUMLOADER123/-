/** Household-level raids, observed alarms, actual ground-floor firing ports and doors.
 * No teleporting defenders into rooms and no invented ammunition/repair material.
 */
import * as THREE from 'three';
import {BOT_BASES} from './map-data.js';
import {TIERS} from './state.js';
import {WEAPONS} from './catalog.js';
const V=THREE.Vector3,D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),stock=id=>'tc-ai26-'+id;
const alive=(s,b)=>b.actor26&&b.actor26.hp>0;
const hasAmmo=b=>b.actor26.gun&&(b.actor26.bag[WEAPONS[b.actor26.gun]?.ammo]||0)>3;
function pay(b,k,n){if((b[k]||0)<n)return false;b[k]-=n;if(!b[k])delete b[k];return true;}
function take(from,to,k,n){const q=Math.min(from[k]||0,n);if(q&&pay(from,k,q))to[k]=(to[k]||0)+q;return q;}
const parts=(w,s)=>[...w.staticStructures.map(e=>e.data),...s.buildings];
const livePart=(s,p)=>p.hp>0&&!s.depleted.includes(p.id);
function alarm(w,s,id,p,hit=false){const f=s.society26?.factions[id];if(!f||!Number.isFinite(p?.x)||!Number.isFinite(p?.z))return;const old=f.alarm27;f.alarm27={x:p.x,z:p.z,at:s.elapsed,until:s.elapsed+55,lastHit:hit?s.elapsed:old?.lastHit??0};if(!old||old.until<s.elapsed){s.society26.events.push(id+' — тревога: занять окна и прикрыть вход.');s.society26.events=s.society26.events.slice(-32);}}
function setDoor(w,s,e,open){const p=e.data;if(!livePart(s,p))return;p.open=open;s.doors??={};s.doors[p.id]=open;if(e.model.userData.doorPivot)e.model.userData.doorPivot.rotation.y=open?1.6:0;}
function openHome(w,s,id,b){for(const e of w.staticStructures){if(e.data.owner!==id||D(b,e.data)>2.4||e.data.kind!=='door'||!e.model.userData.doorPivot)continue;setDoor(w,s,e,true);w.doorClose27.set(e.data.id,s.elapsed+3);}}
function inside(h,b){const yaw=h.root.rotation.y||h.cells27?.yaw||0;
 // House root is unrotated; individual cells are world coordinates and base yaw lives on entries.
 const angle=h.entries.find(e=>e.data.kind==='foundation')?.data.rotation||yaw,c=Math.cos(angle),si=Math.sin(angle);
 return h.cells27?.find(p=>{const dx=b.x-p.x,dz=b.z-p.z;return Math.abs(dx*c-dz*si)<1.46&&Math.abs(dx*si+dz*c)<1.46&&Math.abs((b.y??p.y)-p.y)<.65;});
}
function cellRoute(h,start,end){const queue=[start],prev=new Map([[start,null]]);while(queue.length){const n=queue.shift();if(n===end)break;const p=h.cells27[n];for(const q of h.cells27){if(prev.has(q.id)||Math.abs(p.lx-q.lx)+Math.abs(p.lz-q.lz)!==3)continue;prev.set(q.id,n);queue.push(q.id);}}
 if(!prev.has(end))return null;const out=[];for(let p=end;p!==null;p=prev.get(p))out.push(h.cells27[p]);return out.reverse();}
function indoorOrder(w,s,b,h,goal,cell){
 const here=inside(h,b),key=h.base.id+':'+goal.id;
 if(b.indoorKey27!==key){b.indoorKey27=key;b.indoorPath27=null;}
 if(!here&&!b.indoorPath27&&D(b,h.entry27)>1){return{mode:'defend',point:{...h.entry27,exact27:true}};}
 if(!b.indoorPath27){const route=cellRoute(h,here?.id??h.entryCell27,cell);if(!route)return{mode:'defend',point:h.entry27};b.indoorPath27=[...(!here?[h.cells27[h.entryCell27]]:[]),...route.slice(here?1:0),goal];}
 while(b.indoorPath27.length&&D(b,b.indoorPath27[0])<.25)b.indoorPath27.shift();
 const point=b.indoorPath27[0];if(point)openHome(w,s,h.base.id,b);return point?{mode:'defend',point:{...point,local27:true}}:{mode:'window-defense',hold:true};
}
function exitOrder(w,s,b,h){
 const here=inside(h,b),key=h.base.id+':exit';if(!here&&b.indoorKey27!==key)return null;
 if(b.indoorKey27!==key){b.indoorKey27=key;const route=cellRoute(h,here.id,h.entryCell27);if(!route)return null;b.indoorPath27=[...route.slice(1),h.cells27[h.entryCell27],h.entry27];}
 while(b.indoorPath27?.length&&D(b,b.indoorPath27[0])<.25)b.indoorPath27.shift();
 if(!b.indoorPath27?.length){b.indoorKey27=null;return null;}openHome(w,s,h.base.id,b);return{mode:'withdraw',point:{...b.indoorPath27[0],local27:true}};
}

function mobileDefense29(w,s,b,h,f){b.post27=null;const exit=exitOrder(w,s,b,h);if(exit)return exit;const members=w.bots.filter(q=>q.base===f.id&&!q.dead),slot=Math.max(0,members.indexOf(b)),t=Math.floor(s.elapsed/5),angle=(slot*.97+t*.45),r=6+(slot%3)*2;return{mode:'defense-patrol',point:{x:h.entry27.x+Math.cos(angle)*r,z:h.entry27.z+Math.sin(angle)*r}};}

function defend(w,s,b,f){
 const h=w.settlements05.get(f.id),contact=f.alarm27;if(!h?.ports27?.length)return h?mobileDefense29(w,s,b,h,f):{mode:'defend',point:{x:f.x+Math.cos(b.phase)*8,z:f.z+Math.sin(b.phase)*8}};
 const valid=h.ports27.filter(p=>!s.depleted.includes(p.id)&&(b.blockedPorts29?.[p.id]||0)<s.elapsed);const residents=w.bots.filter(q=>!q.dead&&q.base===f.id),role=residents.indexOf(b);if(role%4===1)return mobileDefense29(w,s,b,h,f);if(!valid.length)return mobileDefense29(w,s,b,h,f);
 const occupied=new Set(w.bots.filter(q=>q!==b&&!q.dead&&q.base===f.id&&q.post27).map(q=>q.post27.id));
 if(!b.post27||s.elapsed>(b.postUntil27||0)||s.depleted.includes(b.post27.id)){
  const candidates=valid.filter(p=>!occupied.has(p.id));if(!candidates.length)return mobileDefense29(w,s,b,h,f);const chosen=candidates.map(p=>({p,score:(p.id===b.post27?.id?5:0)+D(p,b)*.15+D(p,contact)*.2+(w.lineOfSight(new V(p.x,p.y+1.4,p.z),new V(contact.x,(w.floorHeight(contact.x,contact.z,s))+1.2,contact.z),s)?0:100)})).sort((a,c)=>a.score-c.score)[0];
  if(b.post27?.id!==chosen.p.id)b.indoorKey27=null;b.post27=chosen.p;b.postProgress29??={at:s.elapsed,x:b.x,z:b.z};b.postUntil27=s.elapsed+4+(b.phase%3);
 }
 if(b.postProgress29&&s.elapsed-b.postProgress29.at>6){if(D(b,b.postProgress29)<.35&&D(b,b.post27)>.5){b.blockedPorts29??={};b.blockedPorts29[b.post27.id]=s.elapsed+25;b.post27=null;b.indoorKey27=null;return mobileDefense29(w,s,b,h,f);}b.postProgress29={at:s.elapsed,x:b.x,z:b.z};}
 const order=indoorOrder(w,s,b,h,b.post27,b.post27.cell);if(order.hold){b.holdPosition27=true;b.crouch27=b.hp<35||(s.elapsed+b.phase)%6<2.1;return{...order,mode:b.crouch27?'window-cover':'window-defense'};}
 return order;
}
function repair(w,s,b,f){
 if(s.elapsed-f.alarm27.lastHit<5)return null;
 const damaged=parts(w,s).filter(p=>p.owner===f.id&&livePart(s,p)&&['wall','door'].includes(p.kind)&&(s.structureDamage[p.id]??TIERS[p.tier].hp)<TIERS[p.tier].hp-20&&D(p,f)<18&&Math.abs(p.y-(w.settlements05.get(f.id)?.root.position.y??p.y))<1);
 const p=damaged.sort((a,c)=>D(b,a)-D(b,c))[0];if(!p)return null;const material=p.tier===4?'highMetal':p.tier>=3?'metal':p.tier===2?'stone':'wood',a=b.actor26;
 if(!(a.bag[material]>0)){const home={x:f.depotX,z:f.depotZ};if(D(b,home)>2.6)return{mode:'repair-supply',point:home};if(!take(s.containers[stock(f.id)]||{},a.bag,material,10))return null;}
 if(D(b,p)>2.7)return{mode:'repair',point:{x:p.x,z:p.z}};
 if(s.elapsed>=(b.repairAt27||0)&&pay(a.bag,material,1)){b.repairAt27=s.elapsed+2;const hp=Math.min(TIERS[p.tier].hp,(s.structureDamage[p.id]??p.hp)+20);s.structureDamage[p.id]=hp;if(s.buildings.includes(p))p.hp=hp;const e=w.staticStructures.find(e=>e.data.id===p.id)||w.built.get(p.id);if(e)w.applyBuildingTier(e);}
 b.holdPosition27=true;b.crouch27=true;return{mode:'repair',hold:true};
}
function chooseRaid(w,s,f){
 const members=w.bots.filter(b=>alive(s,b)&&b.base===f.id&&b.hp>60&&hasAmmo(b));
 if(members.length<Math.min(2,w.bots.filter(b=>b.base===f.id).length)||s.elapsed<f.nextRaid||f.alarm27?.until>s.elapsed)return;
 const charges=(s.containers[stock(f.id)]?.satchel||0)+members.reduce((n,b)=>n+(b.actor26.bag.satchel||0),0);if(charges<2)return;
 const enemy=Object.values(s.society26.factions).filter(e=>e.team!==f.team&&D(e,f)>25).sort((a,c)=>D(a,f)-D(c,f))[0];if(!enemy)return;
 const squad=members.sort((a,c)=>(c.actor26.bag.satchel||0)-(a.actor26.bag.satchel||0)).slice(0,Math.min(4,Math.max(1,members.length-1))).map(b=>b.id);
 const dx=f.x-enemy.x,dz=f.z-enemy.z,len=Math.hypot(dx,dz)||1;f.raid27={enemy:enemy.id,squad,stage:'rally',x:enemy.x+dx/len*19,z:enemy.z+dz/len*19,at:s.elapsed,until:s.elapsed+300,target:null,breacher:null};
 s.society26.events.push(f.id+' готовит групповой рейд на '+enemy.id);s.society26.events=s.society26.events.slice(-32);
}
function coordinate(w,s){
 const factions=Object.values(s.society26.factions),pins=[];
 for(const f of factions){if(f.alarm27?.until>s.elapsed)pins.push(f.id);if(!f.raid27)chooseRaid(w,s,f);const r=f.raid27;if(!r)continue;pins.push(r.enemy);const squad=w.bots.filter(b=>r.squad.includes(b.id)&&alive(s,b)),target=parts(w,s).find(p=>p.id===r.target);
  if(!squad.length||r.until<s.elapsed||f.alarm27?.until>s.elapsed){r.stage='withdraw';r.until=Math.max(r.until,s.elapsed+20);}
  if(r.stage==='rally'&&squad.every(b=>D(b,{x:f.depotX,z:f.depotZ})<5)&&squad.some(b=>b.actor26.bag.satchel)){r.stage='scout';r.until=s.elapsed+240;}
  if(r.stage==='scout'&&squad.some(b=>D(b,r)<5)){
   const house=w.settlements05.get(r.enemy),entry=house?.entry27||r;const doors=parts(w,s).filter(p=>p.owner===r.enemy&&livePart(s,p)&&['door','wall'].includes(p.kind)&&Math.abs(p.y-(w.settlements05.get(r.enemy)?.root.position.y??p.y))<1).sort((a,c)=>(a.kind==='door'?0:1000)+D(a,entry)*150+(s.structureDamage[a.id]??a.hp)-((c.kind==='door'?0:1000)+D(c,entry)*150+(s.structureDamage[c.id]??c.hp)));
   if(doors.length){r.target=doors[0].id;r.stage='breach';r.until=s.elapsed+180;}
  }
  if(r.stage==='breach'){
   if(target&&!livePart(s,target)){r.stage='assault';r.until=s.elapsed+45;const enemy=s.society26.factions[r.enemy];if(enemy)enemy.breachedUntil=s.elapsed+120;}
   else if(!squad.some(b=>b.actor26.bag.satchel||b.actor26.fuse26)){r.stage='withdraw';r.until=s.elapsed+90;}
   else r.breacher=squad.find(b=>b.actor26.bag.satchel||b.actor26.fuse26)?.id??null;
  }
  if(r.stage==='assault'&&squad.every(b=>Object.values(b.actor26.bag).reduce((n,q)=>n+q,0)>130)){r.stage='withdraw';r.until=s.elapsed+120;}
  if(r.stage==='withdraw'&&(squad.every(b=>D(b,{x:f.depotX,z:f.depotZ})<5)||s.elapsed-r.at>600)){delete f.raid27;f.nextRaid=s.elapsed+180;}
 }
 for(const a of Object.values(s.society26.actors))if(a.fuse26){const id=a.fuse26.id.match(/^base-(settlement-\d+)-/)?.[1];if(id)pins.push(id);}
 // Bounded detailed siege scenes, not all 120 houses resident at once.
 const protectedHomes=[...w.settlements05.values()].filter(h=>w.bots.some(b=>!b.dead&&b.base===h.base.id&&b.indoorKey27&&inside(h,b))).map(h=>h.base.id);
 const priority=[...new Set(pins)].sort((a,c)=>D(BOT_BASES.find(b=>b.id===a)||s.position,s.position)-D(BOT_BASES.find(b=>b.id===c)||s.position,s.position));
 w.tacticalPins27=new Set([...new Set([...protectedHomes,...priority])].slice(0,6));
 for(const id of w.tacticalPins27)if(!w.settlements05.has(id)){const base=BOT_BASES.find(b=>b.id===id);if(base){w.loadSettlement05(base,s);break;}}
}
function raidOrder(w,s,b,f){
 const r=f.raid27;if(!r||!r.squad.includes(b.id))return null;const a=b.actor26,slot=r.squad.indexOf(b.id),home={x:f.depotX+Math.cos(slot*1.6)*2,z:f.depotZ+Math.sin(slot*1.6)*2};
 if(r.stage==='rally'||r.stage==='withdraw'){
  if(D(b,home)<3)w.supplyBot27?.(s,b,f);return{mode:r.stage==='rally'?'rally':'withdraw',point:home};
 }
 if(r.stage==='scout')return{mode:'raid-scout',point:{x:r.x+Math.cos(slot*1.8)*2.5,z:r.z+Math.sin(slot*1.8)*2.5}};
 if(r.stage==='breach'){
  const target=parts(w,s).find(p=>p.id===r.target);if(!target)return{mode:'raid-scout',point:r};
  if(r.breacher===b.id){if(D(b,target)>2.7)return{mode:'breach',point:target};w.plantCharge27?.(s,b,target.id);return{mode:'charge-cover',point:r};}
  const dx=target.x-r.x,dz=target.z-r.z,len=Math.hypot(dx,dz)||1,side=slot%2?1:-1,spacing=2.5+Math.floor(slot/2)*2;
  return{mode:'raid-cover',point:{x:r.x-dz/len*side*spacing,z:r.z+dx/len*side*spacing}};
 }
 if(r.stage==='assault'){
  const enemy=s.society26.factions[r.enemy],cache=w.depots26.find(e=>e.home26===r.enemy);if(!enemy||!cache)return{mode:'assault',point:r};
  if(D(b,cache)<2.6&&w.lineOfSight(new V(b.x,b.y+1.3,b.z),new V(cache.x,(cache.y??w.floorHeight(cache.x,cache.z,s))+.8,cache.z),s)){
   const contents=s.containers[cache.id]||{};let room=Math.max(0,200-Object.values(a.bag).reduce((n,q)=>n+q,0));for(const k of Object.keys(contents)){const n=take(contents,a.bag,k,Math.min(contents[k],room));room-=n;if(!room)break;}return{mode:'withdraw',point:home};
  }
  return{mode:'assault',point:cache};
 }
 return null;
}
export function installTactics27(World){
 const update=World.prototype.updateBots,unload=World.prototype.unloadSettlement05,damage=World.prototype.damageBot26;
 World.prototype.workExit29=function(s,b,f){const h=this.settlements05.get(f.id);return h?exitOrder(this,s,b,h)?.point:null;};
 World.prototype.openWorkDoors29=function(s,b,f){openHome(this,s,f.id,b);};
 World.prototype.workApproach29=function(s,b,f,p){const h=this.settlements05.get(f.id);if(!h)return null;const goal=h.cells27.reduce((a,c)=>D(p,c)<D(p,a)?c:a,h.cells27[0]);if(!goal)return null;const order=indoorOrder(this,s,b,h,goal,goal.id);return order.point;};
 World.prototype.reportStructure27=function(s,p,position){if(p.owner)alarm(this,s,p.owner,position,true);};
 World.prototype.reportShot27=function(s,p,source){if(!s.society26)return;const team=s.society26.factions[source]?.team;for(const f of Object.values(s.society26.factions))if(f.id!==source&&(team===undefined||f.team!==team)&&D(f,p)<65)alarm(this,s,f.id,p);};
 World.prototype.damageBot26=function(b,amount,s,...args){if(b.base){const f=s.society26?.factions[b.base];if(f&&D(f,b)<65){if(!f.alarm27||f.alarm27.until<s.elapsed)alarm(this,s,b.base,b,true);else{f.alarm27.lastHit=s.elapsed;f.alarm27.until=s.elapsed+55;}}}return damage.call(this,b,amount,s,...args);};
 World.prototype.unloadSettlement05=function(id){if(this.tacticalPins27?.has(id))return;return unload.call(this,id);};
 World.prototype.tacticalOrder27=function(s,b){b.holdPosition27=false;b.crouch27=false;const f=s.society26.factions[b.base];if(!f)return null;
  if(f.alarm27?.until>s.elapsed){if(!hasAmmo(b)&&b.actor26.gun&&(s.containers[stock(f.id)]?.[WEAPONS[b.actor26.gun].ammo]||0)>0){const h=this.settlements05.get(f.id),exit=h?exitOrder(this,s,b,h):null;if(exit)return exit;const home={x:f.depotX,z:f.depotZ};if(D(b,home)<3)this.supplyBot27?.(s,b,f);return{mode:'repair-supply',point:home};}if(b.phase%3===2){const order=repair(this,s,b,f);if(order)return order;}return defend(this,s,b,f);}
  if(b.upgrade29&& !f.raid27)return null;
  b.post27=null;const h=this.settlements05.get(f.id),exit=h?exitOrder(this,s,b,h):null;if(exit)return exit;b.indoorKey27=null;return raidOrder(this,s,b,f);
 };
 World.prototype.updateBots=function(dt,s,...args){if(!s.society26)return;this.doorClose27??=new Map();this.tacticalPins27??=new Set();if(s.elapsed>=(this.tacticalAt27||0)){this.tacticalAt27=s.elapsed+2;coordinate(this,s);}
  for(const[id,until]of this.doorClose27)if(s.elapsed>until){const e=this.staticStructures.find(e=>e.data.id===id);if(!e){this.doorClose27.delete(id);continue;}if(this.bots.some(b=>!b.dead&&D(b,e.data)<1.6)||D(s.position,e.data)<1.6)continue;setDoor(this,s,e,false);this.doorClose27.delete(id);}
  return update.call(this,dt,s,...args);
 };
}
