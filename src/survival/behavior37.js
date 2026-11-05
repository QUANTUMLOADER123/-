/** Bounded local utility actions layered over existing household/navigation tactics.
 * Senses use LOS/range, not the player's inventory or position through walls.
 * Ammo stays in the finite bag until each shot; clip37 counts shots since reload.
 */
import * as THREE from 'three';
import {WEAPONS} from './catalog.js';
import {USE33} from './supplies37.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const meds=['hemostaticPack','fieldDressing','bandage','burnSalve','medicalGauze'];
const healing=id=>USE33[id]?.health||(id==='bandage'?35:0);
function spend(b,id,n=1){if((b[id]||0)<n)return false;b[id]-=n;if(!b[id])delete b[id];return true;}
function sight(w,s,b,q){return w.lineOfSight(new THREE.Vector3(b.x,b.y+1.3,b.z),new THREE.Vector3(q.x,(q.y??b.y)+1.3,q.z),s);}
function mode(b,name){b.mode=name;b.fireTarget29=null;b.crouch27=false;b.holdPosition27=false;}
function move(w,s,b,p,dt,speed=2.8){w.moveBot29(s,b,p,dt,speed);}
function allied(s,b,q){const f=s.society26.factions[b.actor26.home],g=s.society26.factions[q.actor26?.home];return f&&g&&f.team===g.team;}
export function botShotReady37(s,b){const a=b.actor26,g=WEAPONS[a?.gun];if(!g)return false;if(a.clipGun37!==a.gun){a.clipGun37=a.gun;a.clip37=0;a.reloadUntil37=0;}return !(a.reloadUntil37>s.elapsed)&&(a.clip37||0)<g.capacity;}
export function recordBotShot37(b){b.actor26.clip37=(b.actor26.clip37||0)+1;}
/** Returns true only when an action actually occupies this simulation step. */
export function utility37(w,s,b,dt){
 const a=b.actor26,g=WEAPONS[a.gun];b.action37??=null;
 // Notice visible nearby flying/stuck explosives or a same-team planted satchel.
 let danger=null;
 for(const p of w.projectiles04||[]){if(!p.thrown||p.fuse-p.age>3||distance(b,p.model.position)>9)continue;const q=p.model.position;if(w.lineOfSight(new THREE.Vector3(b.x,b.y+1.3,b.z),q,s)){danger=q;break;}}
 if(!danger)for(const q of w.bots){const fuse=q.actor26?.fuse26;if(!fuse||!allied(s,b,q))continue;const p=[...(w.staticStructures||[]).map(e=>e.data),...s.buildings].find(p=>p.id===fuse.id);if(p&&distance(b,p)<9){danger={...p,y:p.y??b.y};break;}}
 if(danger){b.action37=null;mode(b,'evade-explosive');const d=distance(b,danger),angle=(b.phase||0)*2.399;move(w,s,b,{x:b.x+(d>.1?(b.x-danger.x)/d:Math.cos(angle))*11,z:b.z+(d>.1?(b.z-danger.z)/d:Math.sin(angle))*11},dt,3.6);return true;}
 if(g){botShotReady37(s,b);if((a.clip37||0)>=g.capacity&&(a.bag[g.ammo]||0)>0){a.reloadUntil37||=s.elapsed+g.reload;mode(b,'reload');if(s.elapsed>=a.reloadUntil37){a.clip37=0;a.reloadUntil37=0;}return true;}}
 // Recently perceived threats prevent stationary friendly treatment/sharing.
 const threatened=s.elapsed-(b.seenAt26??-100)<3||b.fireTarget29?.until>s.elapsed;
 if(b.action37){const action=b.action37,target=action.target===b.id?b:w.bots.find(q=>q.id===action.target);if(!target||target.dead||distance(b,target)>2.8||!sight(w,s,b,target)||threatened&&action.target!==b.id){b.action37=null;return false;}mode(b,action.target===b.id?'field-heal':'heal-ally');b.workPose29=s.elapsed+.4;if(s.elapsed>=action.until){if(target.hp<115&&spend(a.bag,action.item)){target.hp=target.actor26.hp=Math.min(120,target.hp+healing(action.item));s.botState[target.id]={hp:target.hp};}b.action37=null;b.socialAt37=s.elapsed+5;}return true;}
 if(threatened)return false;
 if(s.elapsed<(b.socialAt37||0))return false;b.socialAt37=s.elapsed+.8;
 const med=meds.find(id=>a.bag[id]>0);
 if(a.hp<88&&med){b.action37={target:b.id,item:med,until:s.elapsed+2.5};mode(b,'field-heal');return true;}
 const friends=w.bots.filter(q=>q!==b&&!q.dead&&allied(s,b,q)&&distance(b,q)<13&&sight(w,s,b,q));
 const hurt=med&&friends.filter(q=>q.hp<65).sort((x,y)=>x.hp-y.hp)[0];
 if(hurt){mode(b,'aid-approach');if(distance(b,hurt)>2.2)move(w,s,b,hurt,dt);else b.action37={target:hurt.id,item:med,until:s.elapsed+3};return true;}
 for(const q of friends){const ammo=WEAPONS[q.actor26.gun]?.ammo;if(!ammo||(q.actor26.bag[ammo]||0)>=4||(a.bag[ammo]||0)<20)continue;mode(b,'share-ammo');if(distance(b,q)>2.2)move(w,s,b,q,dt);else{const n=Math.min(12,a.bag[ammo]-8);if(spend(a.bag,ammo,n))q.actor26.bag[ammo]=(q.actor26.bag[ammo]||0)+n;b.socialAt37=s.elapsed+8;}return true;}
 if(a.food<65){const food=Object.keys(USE33).find(id=>USE33[id].hunger>0&&a.bag[id]>0);if(food&&spend(a.bag,food)){a.food=Math.min(100,a.food+USE33[food].hunger);mode(b,'eat-supplies');return true;}}
 return false;
}
/** Select reachable LOS-breaking cover relative only to the currently seen target. */
export function cover37(w,s,b,target,dt){
 if(s.elapsed>=(b.coverAt37||0)){b.coverAt37=s.elapsed+3;b.cover37=null;const angle=Math.atan2(b.z-target.z,b.x-target.x),probe={...s,crouched:false};for(let i=0;i<8;i++){const a=angle+(i%2?1:-1)*Math.ceil(i/2)*.32,r=3+(i%3)*1.4,x=b.x+Math.cos(a)*r,z=b.z+Math.sin(a)*r,y=w.floorHeight(x,z,probe,b.y);if(!Number.isFinite(y)||Math.abs(y-b.y)>.35||!w.canMove(x,z,probe,y))continue;const at={x,y,z};if(!sight(w,s,at,{x:target.x,z:target.z,y:target.y??w.camera.position.y-1.3})){b.cover37={x,z,at:s.elapsed};break;}}}
 if(!b.cover37)return false;mode(b,'seek-cover');move(w,s,b,b.cover37,dt,3.2);if(distance(b,b.cover37)<.7){b.crouch27=true;b.mode='cover-hold';}return true;
}
