import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {surface05} from './surface05.js';
import {lootProp05} from './props05.js';
export function prop38(kind){
 const root=new THREE.Group(),wood=new THREE.MeshStandardMaterial({map:surface05('wood'),color:0x988365,roughness:.98}),metal=new THREE.MeshStandardMaterial({map:surface05('metal'),color:0x697269,metalness:.58,roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x343a32,roughness:.85,metalness:.4}),mats=[wood,metal,dark],parts=[[],[],[]];
 const box=(w,h,d,x,y,z,m=0)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);parts[m].push(g);};
 const rod=(a,b,r=.025,m=1)=>{const v=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(v),g=new THREE.CylinderGeometry(r,r,d.length(),6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...v.add(to).multiplyScalar(.5).toArray());parts[m].push(g);};
 const flush=(parent=root)=>{for(let i=0;i<3;i++)if(parts[i].length){const g=mergeGeometries(parts[i]);parts[i].forEach(p=>p.dispose());parts[i]=[];const mesh=new THREE.Mesh(g,mats[i]);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);}};
 if(kind==='wallLadder'){for(const x of[-.36,.36]){box(.09,3.6,.1,x,1.8,0);for(const y of[.3,1.5,2.7,3.4])box(.12,.06,.13,x,y,0,2);}for(let i=0;i<11;i++){const y=.16+i*.32;box(.76,.065,.12,0,y,.025);for(const x of[-.36,.36])box(.12,.10,.025,x,y,.085,2);}}
 else if(kind==='weaponsLocker'){box(1.05,1.85,.58,0,.95,0,1);for(const x of[-.255,.255]){box(.49,1.73,.04,x,.95,.31,1);for(let i=0;i<5;i++)box(.26,.018,.014,x,1.5+i*.04,.337,2);box(.025,.2,.035,x+(x<0?.16:-.16),.92,.35,2);}for(const x of[-.49,.49])for(const y of[.3,1.55])box(.06,.12,.08,x,y,.34,2);for(const x of[-.42,.42])box(.1,.12,.5,x,.06,0,2);}
 else if(kind==='reinforcedCrate'){const chest=lootProp05('largeStorage');root.add(chest);for(const x of[-.77,.77])for(const z of[-.4,.4])box(.13,.72,.13,x,.36,z,1);for(const x of[-.79,.79]){box(.06,.07,.28,x,.42,0,2);for(const z of[-.18,.18])box(.07,.16,.05,x,.42,z,1);}box(.13,.17,.08,0,.58,.47,2);}
 else if(kind==='compoundGate'){
  for(const x of[-1.45,1.45])box(.18,2.9,.22,x,1.4,0);flush();const pivot=new THREE.Group();pivot.position.set(-1.35,0,0);root.add(pivot);for(let i=0;i<13;i++)box(.20,2.55,.13,.1+i*.205,1.3,0);for(const y of[.4,2.2])box(2.65,.1,.19,1.32,y,.01,1);rod([.08,.3,.12],[2.6,2.35,.12],.045,1);box(.22,.16,.18,2.53,1.3,.08,2);for(const y of[.35,2.3])box(.22,.15,.26,.02,y,0,2);flush(pivot);root.userData.doorPivot=pivot;
 }else{
  const armored=kind==='barbedFence';for(const x of[-1.43,1.43])box(.15,2.9,.18,x,1.4,0);
  if(armored){for(let i=0;i<20;i++)box(.15,2.4,.055,-1.35+i*.14,1.25,i%2?.045:0,1);for(let i=0;i<14;i++){const x=-1.3+i*.2;rod([x,2.58,0],[x+.14,2.9,.10],.013,2);rod([x,2.9,.1],[x+.28,2.58,0],.013,2);}}
  else for(let i=0;i<15;i++){const x=-1.4+i*.2,h=2.55+(i%3)*.06;box(.185,h,.12,x,h/2,0);const g=new THREE.ConeGeometry(.125,.19,4);g.rotateY(Math.PI/4);g.translate(x,h+.095,0);parts[0].push(g);}
  for(const y of[.48,2.05])box(3,.1,.12,0,y,-.12);rod([-1.35,.38,-.2],[1.35,2.15,-.2],.04,armored?1:0);
 }flush();root.userData.prop38=kind;return root;
}
