import * as THREE from 'three';
import {CLOTHING24} from './clothing24.js';
const V=THREE.Vector3;
export function clearClothes29(model){for(const mesh of model.userData.gear29||[]){mesh.removeFromParent();mesh.geometry.dispose();}for(const m of model.userData.gearMats29||[])m.dispose();model.userData.gear29=[];model.userData.gearMats29=[];}
/** Bone-attached category garments; actual equipped IDs/colours come from the finite bag.
 * Deliberately bounded geometry, not a separate simulated cloth asset for every item. */
export function clothes29(w,model,wear){clearClothes29(model);model.updateWorldMatrix(true,true);const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replaceAll('.','')]=o;});const gear=wear.map(id=>CLOTHING24[id]),parts=model.userData.gear29,mats=model.userData.gearMats29,q=model.getWorldQuaternion(new THREE.Quaternion());
 const material=(c,hard=false)=>{const m=new THREE.MeshStandardMaterial({color:c.color,map:w.textures['items16/'+(hard?'polymer':'cloth')+'-color.webp'],roughness:hard?.77:.95,metalness:hard?.08:0});mats.push(m);return m;};
 const attach=(bone,geo,mat,offset)=>{if(!bone){geo.dispose();return;}const mesh=new THREE.Mesh(geo,mat);mesh.position.copy(bone.getWorldPosition(new V())).add(offset.clone().applyQuaternion(q));mesh.quaternion.copy(q);mesh.castShadow=false;w.scene.add(mesh);bone.attach(mesh);parts.push(mesh);};
 if(gear[3]){const c=gear[3],m=material(c,c.grade>=4),profile=[[.17,0],[.185,.04],[.19,.30],[.145,.39]].map(([r,y])=>new THREE.Vector2(r,y)),geo=new THREE.LatheGeometry(profile,14);geo.scale(1,1,.73);attach(bones.Chest||bones.Spine,geo,m,new V(0,-.28,.018));}
 if(gear[0]){const c=gear[0],m=material(c,c.grade>=4),geo=new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI*.60);geo.scale(.135,.14,.14);attach(bones.Head,geo,m,new V(0,.06,0));}
 if(gear[1]){const c=gear[1],m=material(c,c.grade>=5),geo=new THREE.SphereGeometry(1,12,8,0,Math.PI,Math.PI*.30,Math.PI*.58);geo.scale(.113,.112,.12);attach(bones.Head,geo,m,new V(0,-.035,.015));}
 if(gear[5]){const c=gear[5],m=material(c);for(const side of['L','R']){const geo=new THREE.CapsuleGeometry(.037,.055,3,8);geo.rotateZ(Math.PI/2);attach(bones['Hand'+side],geo,m,new V(side==='L'?.025:-.025,0,0));}}
}
export function fallenPose29(model){model.updateWorldMatrix(true,true);for(const [name,axis,angle]of[['UpperArmL','z',-1.10],['UpperArmR','z',1.20],['LowerArmL','y',-.30],['LowerArmR','y',.52],['UpperLegL','x',.10],['UpperLegR','x',-.12],['LowerLegL','x',.16],['LowerLegR','x',.28]]){let bone;model.traverse(o=>{if(o.isBone&&o.name.replaceAll('.','')===name)bone=o;});if(!bone)continue;const a=new V(axis==='x'?1:0,axis==='y'?1:0,axis==='z'?1:0).applyQuaternion(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert());bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(a,angle));bone.updateWorldMatrix(false,true);}}
