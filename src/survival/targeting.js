import {isStructural} from './expansion.js';
import {WEAPONS,isGun} from './catalog.js';
import * as THREE from 'three';
import {terrainHeight,buildingHeight} from './state.js';
const V=THREE.Vector3;
export function installTargeting(World){World.prototype.target=function(state){
 this.refreshDead05?.(state);const dead=this.deadIds05||new Set(state.depleted);const origin=this.camera.position,direction=this.camera.getWorldDirection(new V()),range=isGun(state.selected)?WEAPONS[state.selected].range:5.2,raycaster=new THREE.Raycaster(origin,direction,0,range);let best=null,nearest=range;
 const visible=model=>{for(let n=model;n;n=n.parent)if(!n.visible)return false;return true;};
 const modelHit=(obj,model,max=range)=>{if(!model||!visible(model)||Math.hypot(obj.x-origin.x,obj.z-origin.z)>max+3)return;model.updateWorldMatrix(true,true);const hits=raycaster.intersectObject(model,true);for(const h of hits){if(h.distance<nearest&&h.distance<=max){nearest=h.distance;best=obj;break;}}};
 for(const n of this.nodes){if(dead.has(n.id))continue;if(n.type==='tree'){
  if(Math.hypot(n.x-origin.x,n.z-origin.z)>5.5)continue;const box=new THREE.Box3(new V(n.x-(n.r||.55),n.y,n.z-(n.r||.55)),new V(n.x+(n.r||.55),n.y+10,n.z+(n.r||.55))),hit=raycaster.ray.intersectBox(box,new V());if(hit){const d=hit.distanceTo(origin);if(d<nearest&&d<4.5){nearest=d;best=n;}}
 }else modelHit(n,n.model,isGun(state.selected)?WEAPONS[state.selected].range:4.5);}
 for(const obj of this.interactables){if(dead.has(obj.id)||obj.data?.hp===0)continue;if(obj.type==='door')continue;modelHit(obj,obj.model,obj.type==='crate'?4.2:range);}
 const batches=new Set(),objectFor=(entry)=>{const b=entry.data,allowed=!b.owner||state.authorizedBases?.includes(b.owner)||b.raided;return{id:b.id,type:b.kind==='door'&&allowed&&state.selected!=='hammer'?'door':'structure',x:b.x,z:b.z,data:b,model:entry.model};};
 for(const entry of [...this.built.values(),...this.staticStructures]){const b=entry.data;if((b.owner?dead.has(b.id):b.hp<=0)||!(isStructural(b.kind)||b.kind==='door'))continue;if(entry.batch){if(b.kind==='door')modelHit(objectFor(entry),entry.model);if(batches.has(entry.batch)||Math.hypot(b.x-origin.x,b.z-origin.z)>range+8)continue;batches.add(entry.batch);entry.batch.updateWorldMatrix(true,false);const hits=raycaster.intersectObject(entry.batch,false);for(const hit of hits){const e=entry.batch.userData.entries?.[hit.instanceId];if(e&&!dead.has(e.data.id)&&hit.distance<nearest){nearest=hit.distance;best=objectFor(e);break;}}}else modelHit(objectFor(entry),entry.model);}

 for(const bot of this.bots)if(!bot.dead)modelHit({id:bot.id,type:'bot',x:bot.x,z:bot.z,bot},bot.model,isGun(state.selected)?WEAPONS[state.selected].range:3.6);
 for(const wolf of this.wolves)if(!wolf.dead)modelHit({id:wolf.id,type:'wolf',x:wolf.x,z:wolf.z,wolf},wolf.model,isGun(state.selected)?WEAPONS[state.selected].range:3.6);
 if(best){for(const model of this.occluders||[]){if(!visible(model))continue;const bounds=model.userData.worldBounds;if(bounds){const hit=raycaster.ray.intersectBox(bounds,new V());if(!hit||hit.distanceTo(origin)>nearest)continue;}const hits=raycaster.intersectObject(model,true);if(hits[0]&&hits[0].distance<nearest-.04)return null;}if(['bot','wolf'].includes(best.type)&&!this.lineOfSight(origin,new V(best.x,terrainHeight(best.x,best.z)+1.1,best.z),state))return null;}
 return best;
};}
