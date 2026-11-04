import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {material16} from './items16.js';
export function sleepingModel27(){
 const g=new THREE.Group(),cloth=material16('cloth',0x677650),lining=material16('cloth',0xaba18b),trim=material16('polymer',0x343c32);
 const body=new THREE.Mesh(new RoundedBoxGeometry(.72,.14,1.58,3,.065),cloth);body.position.set(0,.09,.08);g.add(body);
 const hood=new THREE.Mesh(new THREE.TorusGeometry(.25,.07,7,20,Math.PI),cloth);hood.rotation.x=Math.PI/2;hood.position.set(0,.1,-.69);g.add(hood);
 const pillow=new THREE.Mesh(new RoundedBoxGeometry(.41,.09,.24,3,.04),lining);pillow.position.set(0,.1,-.60);g.add(pillow);
 for(let i=0;i<6;i++){const seam=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.31,.154,-.35+i*.2),new THREE.Vector3(0,.165,-.31+i*.2),new THREE.Vector3(.31,.154,-.35+i*.2)]),8,.004,4,false),trim);g.add(seam);}
 const zipper=new THREE.Mesh(new THREE.BoxGeometry(.009,.009,1.3),trim);zipper.position.set(.32,.15,.04);g.add(zipper);g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});return g;
}
export function installSleeping27(World){
 const add=World.prototype.addBuilding,station=World.prototype.stationModel,tiers=World.prototype.applyBuildingTier;
 World.prototype.stationModel=function(kind){return kind==='sleepingBag'?sleepingModel27():station.call(this,kind);};
 World.prototype.addBuilding=function(b){if(b.kind!=='sleepingBag')return add.call(this,b);const model=sleepingModel27();model.position.set(b.x,b.y,b.z);model.rotation.y=b.rotation;this.scene.add(model);this.built.set(b.id,{model,data:b});this.interactables.push({id:b.id,type:'sleepingBag',x:b.x,z:b.z,y:b.y,model,data:b});};
 World.prototype.applyBuildingTier=function(e){if(e.data.kind!=='sleepingBag')return tiers.call(this,e);};
}
