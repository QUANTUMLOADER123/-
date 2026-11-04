import * as THREE from 'three';
import {terrainHeight} from './state.js';
import {seedRoll} from './loot04.js';
const up=new THREE.Vector3(0,1,0);
export function installTerrainProps06(World){World.prototype.alignTerrainProps06=function(){for(const item of this.interactables){if(item.type!=='barrel'||item.site17)continue;const {x,z,model}=item;model.updateWorldMatrix(true,false);const previous=model.getWorldPosition(new THREE.Vector3()),ground=terrainHeight(x,z);if(previous.y>ground+.2)continue; // Keep raised platforms, not the terrain underneath them.
 const e=.35,normal=new THREE.Vector3(-(terrainHeight(x+e,z)-terrainHeight(x-e,z))/(2*e),1,-(terrainHeight(x,z+e)-terrainHeight(x,z-e))/(2*e)).normalize(),q=new THREE.Quaternion().setFromUnitVectors(up,normal).multiply(new THREE.Quaternion().setFromAxisAngle(up,seedRoll(item.id+'yaw',1)*Math.PI*2));let y=ground;
 for(let j=0;j<12;j++){const a=j/12*Math.PI*2,p=new THREE.Vector3(Math.cos(a)*.43,0,Math.sin(a)*.43).applyQuaternion(q);y=Math.max(y,terrainHeight(x+p.x,z+p.z)-p.y);}const worldPosition=new THREE.Vector3(x,y+.012,z);model.position.copy(model.parent?model.parent.worldToLocal(worldPosition.clone()):worldPosition);if(model.parent){const parent=model.parent.getWorldQuaternion(new THREE.Quaternion());model.quaternion.copy(parent.invert().multiply(q));}else model.quaternion.copy(q);
 const center=new THREE.Vector3(0,.53,0).applyQuaternion(q).add(worldPosition),lean=Math.sqrt(1-normal.y*normal.y);for(const c of this.colliders)if(c.id===item.id){c.x=center.x;c.z=center.z;c.r=.45+.53*lean;c.y=center.y-(.53*normal.y+.43*lean);c.h=1.06*normal.y+.86*lean;}}
 };}
