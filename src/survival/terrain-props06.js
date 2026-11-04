import * as THREE from 'three';
import {terrainHeight} from './state.js';
import {slopeAt32} from './ecology32.js';
import {seedRoll} from './loot04.js';
const up=new THREE.Vector3(0,1,0);
/** Ground loot stays upright. Relocate to gentle ground or omit the candidate;
 * never shear a prop by applying a slope rotation beneath a scaled parent. */
export function installTerrainProps06(World){World.prototype.alignTerrainProps06=function(){
 const omitted=new Set();
 for(const item of this.interactables){
  if(!['barrel','crate'].includes(item.type)||item.site17||item.owner||item.fixedSupport25||item.id.startsWith('drop-')||item.id.startsWith('build-'))continue;
  const model=item.model;model.updateWorldMatrix(true,false);const previous=model.getWorldPosition(new THREE.Vector3()),ground=terrainHeight(item.x,item.z);if(previous.y>ground+.35)continue;
  let spot=null;const phase=seedRoll(item.id+'flat32',1)*Math.PI*2;
  for(const radius of[0,2,4,6,8,10]){for(let i=0;i<(radius?16:1);i++){const a=phase+i*Math.PI/8,x=item.x+Math.cos(a)*radius,z=item.z+Math.sin(a)*radius,h=terrainHeight(x,z);if(h<.4||slopeAt32(terrainHeight,x,z,.8)>.18)continue;const edges=[[-.65,-.65],[.65,.65],[-.65,.65],[.65,-.65]].map(([dx,dz])=>terrainHeight(x+dx,z+dz));if(Math.max(...edges)-Math.min(...edges)>.24)continue;if(radius&&this.colliders.some(c=>c.id!==item.id&&Math.abs(c.x-x)<(c.w/2||c.r||.5)+.8&&Math.abs(c.z-z)<(c.d/2||c.r||.5)+.8))continue;spot={x,z,y:Math.max(h,...edges)+.008};break;}if(spot)break;}
  if(!spot){omitted.add(item.id);model.removeFromParent();model.visible=false;continue;}
  const q=new THREE.Quaternion().setFromAxisAngle(up,seedRoll(item.id+'yaw',1)*Math.PI*2),position=new THREE.Vector3(spot.x,spot.y,spot.z);model.position.copy(model.parent?model.parent.worldToLocal(position.clone()):position);if(model.parent)q.premultiply(model.parent.getWorldQuaternion(new THREE.Quaternion()).invert());model.quaternion.copy(q);model.updateWorldMatrix(false,true);item.x=spot.x;item.z=spot.z;item.y=spot.y;
  const bounds=new THREE.Box3().setFromObject(model);for(const c of this.colliders)if(c.id===item.id){c.x=spot.x;c.z=spot.z;c.y=bounds.min.y;c.h=bounds.max.y-bounds.min.y;c.r=Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)*.5;}
 }
 if(omitted.size){this.interactables=this.interactables.filter(i=>!omitted.has(i.id));this.colliders=this.colliders.filter(c=>!omitted.has(c.id));}
 this.slopeOmitted32=omitted.size;
};}
