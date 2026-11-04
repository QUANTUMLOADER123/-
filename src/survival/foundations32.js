import * as THREE from 'three';
import {terrainHeight,buildingHeight} from './state.js';
/** Full-height perimeter skirts, shared by player and generated foundations. */
export function foundationWalls32(b,heightAt=terrainHeight){
 if(!['foundation','triangleFoundation'].includes(b.kind))return [];
 const vertices=b.kind==='triangleFoundation'?[[-1.5,-.8660254],[1.5,-.8660254],[0,1.7320508]]:[[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5]],co=Math.cos(b.rotation||0),si=Math.sin(b.rotation||0),top=(b.y??heightAt(b.x,b.z))+.02,world=([x,z])=>({x:b.x+x*co+z*si,z:b.z-x*si+z*co});
 return vertices.map((a,i)=>{const c=vertices[(i+1)%vertices.length],A=world(a),B=world(c),bottom=Math.min(...[0,.25,.5,.75,1].map(t=>heightAt(A.x+(B.x-A.x)*t,A.z+(B.z-A.z)*t)))-.16,rotation=(b.rotation||0)-Math.atan2(c[1]-a[1],c[0]-a[0]);return{id:b.id,x:(A.x+B.x)/2,z:(A.z+B.z)/2,bottom,h:Math.max(.08,top-bottom),length:Math.hypot(c[0]-a[0],c[1]-a[1]),rotation,data:b};});
}
export function skirtCollider32(p,extra={}){const c=Math.abs(Math.cos(p.rotation)),s=Math.abs(Math.sin(p.rotation));return{id:p.id,box:true,x:p.x,z:p.z,y:p.bottom,h:p.h,w:c*p.length+s*.16,d:s*p.length+c*.16,ow:p.length,od:.16,rotation:p.rotation,data:p.data,foundationSkirt32:true,...extra};}
export function installFoundations32(World){const add=World.prototype.addBuilding;
 World.prototype.addBuilding=function(b){add.call(this,b);const walls=foundationWalls32(b),entry=this.built.get(b.id);if(!walls.length||!entry)return;const root=entry.model;root.updateWorldMatrix(true,false);const inverse=root.matrixWorld.clone().invert();let material;root.traverse(m=>{if(!material&&m.isMesh)material=Array.isArray(m.material)?m.material[0]:m.material;});
 for(const p of walls){const mesh=new THREE.Mesh(new THREE.BoxGeometry(p.length,p.h,.16),material),matrix=new THREE.Matrix4().compose(new THREE.Vector3(p.x,p.bottom+p.h/2,p.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.rotation),new THREE.Vector3(1,1,1));mesh.applyMatrix4(inverse.clone().multiply(matrix));mesh.castShadow=mesh.receiveShadow=true;mesh.userData.foundationSkirt32=true;root.add(mesh);this.colliders.push(skirtCollider32(p,{built:true}));}
 this.collisionCount=-1;
 };
}
