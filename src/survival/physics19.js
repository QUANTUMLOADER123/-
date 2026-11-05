import * as THREE from 'three';
import {terrainHeight} from './state.js';
import {floorContains08,floorY08} from './roads08.js';
import {obstacleContains17} from './spatial17.js';
const V=THREE.Vector3,UP=new V(0,1,0),LOOSE=new Set(['crate','barrel','storage','cupboard','furnace','workbench','repairBench','recycler']);
const finite=p=>p&&[p.x,p.y,p.z].every(Number.isFinite);
function position(body){body.model.updateWorldMatrix(true,false);return body.model.getWorldPosition(new V());}
function place(body,p){body.model.position.copy(body.model.parent?body.model.parent.worldToLocal(p.clone()):p);body.model.updateWorldMatrix(false,true);body.item.x=p.x;body.item.y=p.y;body.item.z=p.z;if(body.item.data){Object.assign(body.item.data,{x:p.x,y:p.y,z:p.z});}}
function collider(w,body){return w.colliderById19.get(body.id);}
function support(w,body,p,state){
 let h=-Infinity;
 for(const contact of body.contacts){const {x:dx,y:dy,z:dz}=contact,x=p.x+dx,z=p.z+dz,bottom=p.y+dy;let top=terrainHeight(x,z);
  for(const f of w.rayCandidates28?.('physics40-slabs',w.solidFloors29?.(state)||w.walkFloors,new V(x,bottom,z),new V(x,bottom,z))||w.nearFloors05?.(x,z)||w.walkFloors){if(f.data?.hp<=0||f.structureId&&(w.deadIds05?.has(f.structureId)||state.depleted.includes(f.structureId)))continue;const y=floorY08(f,x,z);if(y<=bottom+.3&&floorContains08(f,x,z))top=Math.max(top,y);}
  for(const c of w.nearColliders(x,z)){if(c.id===body.id||c.data?.hp<=0||c.id&&w.deadIds05?.has(c.id)||c.door&&c.data?.open||!Number.isFinite(c.y)||c.deck08)continue;const y=c.y+(c.h??3.02);if(y<=bottom+.2&&obstacleContains17(c,x,z))top=Math.max(top,y);}
  h=Math.max(h,top-dy);
 }
 return h;
}
function obstructed(w,body,p,state){
 const bottom=p.y+body.offset,top=bottom+body.height;
 for(const c of w.nearColliders(p.x,p.z)){if(c.id===body.id||c.data?.hp<=0||c.id&&w.deadIds05?.has(c.id)||c.door&&c.data?.open)continue;const y=c.y??terrainHeight(c.x,c.z);if(y+(c.h??3.02)<=bottom+.06||y>=top-.03)continue;if(obstacleContains17(c,p.x,p.z,Math.min(body.rx,body.rz)*.8))return true;}
 return false;
}
function contacts19(body){
 const q=body.model.getWorldQuaternion(new THREE.Quaternion());body.contacts=body.localContacts.map(p=>p.clone().applyQuaternion(q));body.offset=Math.min(...body.contacts.map(p=>p.y));
}
function align19(w,body,p,state){
 if(body.item.data)return;if(['barrel','crate'].includes(body.item.type)&&!body.bag){const q=new THREE.Quaternion().setFromAxisAngle(UP,body.yaw);if(body.model.parent)q.premultiply(body.model.parent.getWorldQuaternion(new THREE.Quaternion()).invert());body.model.quaternion.copy(q);body.model.updateWorldMatrix(false,true);contacts19(body);return;}const point={...body,contacts:[new V()]},e=.45;
 const gx=(support(w,point,new V(p.x+e,p.y,p.z),state)-support(w,point,new V(p.x-e,p.y,p.z),state))/(e*2),gz=(support(w,point,new V(p.x,p.y,p.z+e),state)-support(w,point,new V(p.x,p.y,p.z-e),state))/(e*2);
 const normal=new V(-gx,1,-gz).normalize(),q=new THREE.Quaternion().setFromUnitVectors(UP,normal).multiply(new THREE.Quaternion().setFromAxisAngle(UP,body.yaw));
 if(body.model.parent)q.premultiply(body.model.parent.getWorldQuaternion(new THREE.Quaternion()).invert());body.model.quaternion.copy(q);body.model.updateWorldMatrix(false,true);contacts19(body);
 if(Math.hypot(gx,gz)>.8){body.velocity.x-=gx*.12;body.velocity.z-=gz*.12;}
}
function syncCollider(w,body,p){
 const c=collider(w,body);if(!c)return;const box=new THREE.Box3().setFromObject(body.model);c.x=(box.min.x+box.max.x)/2;c.z=(box.min.z+box.max.z)/2;c.y=box.min.y;c.h=box.max.y-box.min.y;
 // Loot colliders are finite circles; installed benches keep their original OBB.
 if(!c.box)c.r=Math.max(box.max.x-box.min.x,box.max.z-box.min.z)*.5;
 if(body.item.data){const e=w.built.get(body.id);if(e?.fire)e.fire.root.position.y=p.y;}
}
export function installPhysics19(World){
 const update=World.prototype.update,sync=World.prototype.syncState,hit=World.prototype.hitEffect,syncBags=World.prototype.syncGroundBags;
 World.prototype.registerProps19=function(state){
  this.refreshDead05?.(state);this.bodies19??=new Map();state.propPhysics19??={};
  if(this.colliderSource19!==this.colliders||this.colliderCount19!==this.colliders.length){this.colliderSource19=this.colliders;this.colliderCount19=this.colliders.length;this.colliderById19=new Map(this.colliders.filter(c=>c.id).map(c=>[c.id,c]));}
  const previous32=this.propsRegistry32;if(previous32?.source===this.interactables&&previous32.count===this.interactables.length&&previous32.dead===state.depleted.length&&previous32.bodies===this.bodies19)return;
  const ids=new Set();
  for(const item of this.interactables){if(item.corpse29||!LOOSE.has(item.type)||item.station||item.fixedSupport25||item.owner&&!item.raided||this.deadIds05.has(item.id)||item.data?.hp<=0||!item.model?.parent)continue;ids.add(item.id);const old=this.bodies19.get(item.id);if(old?.model===item.model)continue;
   const model=item.model;model.updateWorldMatrix(true,true);const p=model.getWorldPosition(new V()),bounds=new THREE.Box3().setFromObject(model);if(bounds.isEmpty())continue;
   const body={id:item.id,item,model,offset:bounds.min.y-p.y,rx:Math.min(1,(bounds.max.x-bounds.min.x)*.42),rz:Math.min(1,(bounds.max.z-bounds.min.z)*.42),height:bounds.max.y-bounds.min.y,velocity:new V(),sleep:false,check:0,bag:item.id.startsWith('drop-'),yaw:new THREE.Euler().setFromQuaternion(model.getWorldQuaternion(new THREE.Quaternion()),'YXZ').y};
   const local=new THREE.Box3(),inverse=new THREE.Matrix4().compose(p,model.getWorldQuaternion(new THREE.Quaternion()),new V(1,1,1)).invert();
   model.traverse(m=>{if(m.isMesh&&m.geometry){m.geometry.computeBoundingBox();local.union(m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld)));}});
   const cx=(local.min.x+local.max.x)/2,cz=(local.min.z+local.max.z)/2,rx=(local.max.x-local.min.x)*.47,rz=(local.max.z-local.min.z)*.47;
   body.localContacts=[[cx,cz],[cx+rx,cz+rz],[cx-rx,cz+rz],[cx+rx,cz-rz],[cx-rx,cz-rz]].map(([x,z])=>new V(x,local.min.y,z));contacts19(body);
   const saved=state.propPhysics19[item.id];if(!item.data&&!body.bag&&finite(saved)&&Math.hypot(saved.x-p.x,saved.z-p.z)<40&&saved.y> -40&&saved.y<350){place(body,new V(saved.x,saved.y,saved.z));syncCollider(this,body,position(body));this.collisionCount=-1;}
   const initial=position(body);
   // Recover old deployed chests that sank the 38cm foundation thickness. Never lift through a ceiling.
   if(item.data)for(const f of this.solidFloors29?.(state)||[]){if(f.data?.hp<=0||this.deadIds05?.has(f.structureId)||state.depleted.includes(f.structureId)||!floorContains08(f,initial.x,initial.z))continue;const top=floorY08(f,initial.x,initial.z),bottom=initial.y+body.offset;if(top>bottom+.025&&top<bottom+.55){initial.y=top-body.offset+.006;place(body,initial);}}
   if(!item.data&&Math.hypot(initial.x-state.position.x,initial.z-state.position.z)>105){align19(this,body,initial,state);initial.y=support(this,body,initial,state)+.006;place(body,initial);syncCollider(this,body,initial);body.sleep=true;const bag=(state.groundBags||[]).find(b=>b.id===body.id);if(bag)Object.assign(bag,{x:initial.x,y:initial.y,z:initial.z});else state.propPhysics19[body.id]={x:initial.x,y:initial.y,z:initial.z};}
   this.bodies19.set(item.id,body);
  }
  for(const [id]of this.bodies19)if(!ids.has(id)){this.bodies19.delete(id);delete state.propPhysics19[id];}
  this.propsRegistry32={source:this.interactables,count:this.interactables.length,dead:state.depleted.length,bodies:this.bodies19};
 };
 World.prototype.stepProps19=function(dt,state){
  this.registerProps19(state);this.physicsClock19=(this.physicsClock19||0)+dt;let simulated=0,horizontal=false;
  const bags=new Map((state.groundBags||[]).map(b=>[b.id,b]));
  // Nearest loose objects first. Sleeping/far objects retain their exact pose;
  // support is periodically rechecked, including after structure destruction.
  const bodies=[...this.bodies19.values()].filter(b=>(b.item.x-state.position.x)**2+(b.item.z-state.position.z)**2<11025).sort((a,b)=>(a.item.x-state.position.x)**2+(a.item.z-state.position.z)**2-((b.item.x-state.position.x)**2+(b.item.z-state.position.z)**2));
  for(const body of bodies){if(simulated>=24)break;if(body.sleep&&this.physicsClock19<body.check)continue;const p=position(body);simulated++;body.check=this.physicsClock19+.55+(body.id.length%7)*.041;
   const floor=support(this,body,p,state),bottom=p.y;
   if(body.sleep&&Math.abs(bottom-floor-.006)<.025)continue;body.sleep=false;
   const steps=Math.max(1,Math.ceil(Math.min(.06,dt)/(1/90))),step=Math.min(.06,dt)/steps;
   for(let j=0;j<steps;j++){
    body.velocity.y=Math.max(-35,body.velocity.y-18*step);const next=p.clone().addScaledVector(body.velocity,step);
    if(body.velocity.x||body.velocity.z){if(obstructed(this,body,next,state)){body.velocity.x*=-.12;body.velocity.z*=-.12;next.x=p.x;next.z=p.z;}else if(Math.hypot(next.x-p.x,next.z-p.z)>.00001)horizontal=true;}
    let ground=support(this,body,new V(next.x,p.y,next.z),state),target=ground+.006;
    if(next.y<=target){align19(this,body,new V(next.x,p.y,next.z),state);target=support(this,body,new V(next.x,p.y,next.z),state)+.006;next.y=target;const impact=-body.velocity.y;body.velocity.y=impact>1.8&&!body.bag?Math.min(.65,impact*.10):0;const drag=Math.exp(-11*step);body.velocity.x*=drag;body.velocity.z*=drag;
     if(body.velocity.lengthSq()<.006){body.velocity.set(0,0,0);body.sleep=true;}
    }
    p.copy(next);if(body.sleep)break;
   }
   place(body,p);syncCollider(this,body,p);
   const bag=bags.get(body.id);if(bag)Object.assign(bag,{x:p.x,y:p.y,z:p.z});
   else if(!body.item.data)state.propPhysics19[body.id]={x:p.x,y:p.y,z:p.z};
  }
  if(horizontal){this.collisionCount=-1;this.targetGrids06?.clear();}this.physicsStats19={bodies:this.bodies19.size,simulated};
 };
 World.prototype.syncState=function(state){sync.call(this,state);this.bodies19=new Map();this.registerProps19(state);};
 World.prototype.syncGroundBags=function(state){syncBags.call(this,state);this.registerProps19(state);};
 World.prototype.update=function(dt,state,playing,...args){update.call(this,dt,state,playing,...args);if(playing&&!state.dead)this.stepProps19(dt,state);};
 World.prototype.hitEffect=function(target,...args){hit.call(this,target,...args);const body=this.bodies19?.get(target.id);if(body&&!body.item.data&&!body.item.owner){const d=this.camera.getWorldDirection(new V());body.velocity.add(new V(d.x*.85,.35,d.z*.85));const speed=Math.hypot(body.velocity.x,body.velocity.z);if(speed>2){body.velocity.x*=2/speed;body.velocity.z*=2/speed;}body.sleep=false;body.check=0;}};
}
