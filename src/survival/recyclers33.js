import {terrainHeight} from './state.js';
import * as THREE from 'three';
/** Add before Site17.finish so station persistence, colliders and world transforms apply. */
export function ensureRecycler33(k){
 const existing=k.loot.filter(l=>l.type==='recycler'),scale=k.m.siteScale25||1;for(const l of existing)l.model.scale.set(1/scale,1,1/scale);if(existing.length)return;
 if(k.m.kind==='oilrig'){const model=k.terminal(k.root,900,[0,5.2,-3.5],true);model.scale.set(1/scale,1,1/scale);return;}
 const r=k.m.radius/(k.m.siteScale25||1),inv=new THREE.Matrix4();k.root.updateMatrixWorld(true);inv.copy(k.root.matrixWorld).invert();
 const boxes=k.solids.map(o=>{o.updateWorldMatrix(true,false);return (o.geometry.computeBoundingBox(),o.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)));}).filter(b=>b.max.y>.55&&b.min.y<2.8);
 let at=null;search:for(const z of [.60,.47,.30,-.58,.66])for(const x of [.30,-.30,.43,-.43,.58,-.58,0]){const px=r*x,pz=r*z,front=k.root.localToWorld(new THREE.Vector3(px,.18,pz+1.8/scale));if(terrainHeight(front.x,front.z)>front.y+.10)continue;const space=new THREE.Box3(new THREE.Vector3(px-1.2,.5,pz-.8),new THREE.Vector3(px+1.2,2.7,pz+2));if(boxes.some(b=>space.intersectsBox(b)))continue;if(k.loot.some(l=>l.model&&new THREE.Vector3().setFromMatrixPosition(l.model.matrixWorld).applyMatrix4(inv).distanceTo(new THREE.Vector3(px,0,pz))<2.6))continue;at=[px,pz];break search;}
 if(!at)throw new Error('No accessible recycler bay at '+k.m.id);
 const g=k.group(k.root,[at[0],0,at[1]]);k.floor(g,5.2,5,0,.5,.18,k.p.concrete);const model=k.terminal(g,900,[0,.18,0],true);model.scale.set(1/scale,1,1/scale);g.userData.recyclerBay33=true;
}
/** Saved positions are not rerolled. Only rescue a player inside a newly introduced station hull. */
export function restoreRecyclers33(w,s){
 if(s.stationRevision33===33)return;if(s.boat){s.stationRevision33=33;return;}
 for(const item of w.interactables.filter(i=>i.type==='recycler'&&i.site17)){
  item.model.updateWorldMatrix(true,false);const feet=s.feetY??w.floorHeight(s.position.x,s.position.z,s),local=item.model.worldToLocal(new THREE.Vector3(s.position.x,feet,s.position.z));if(Math.abs(local.x)>1.18||Math.abs(local.z)>.73||local.y<-.3||local.y>2.6)continue;
  for(const [x,z]of [[0,1.8],[1.6,1.8],[-1.6,1.8],[1.6,0],[-1.6,0],[0,-1.6],[1.6,-1.6],[-1.6,-1.6]]){const p=item.model.localToWorld(new THREE.Vector3(x,0,z)),at={...s,position:{x:p.x,z:p.z}},y=w.floorHeight(p.x,p.z,at,item.y+.5);if(Math.abs(y-feet)>.65||!w.canMove(p.x,p.z,at,y)||!w.canStand04(at,y))continue;s.position={x:p.x,z:p.z};s.feetY=y;s.stationRevision33=33;return;}
  return;
 }
 s.stationRevision33=33;
}
