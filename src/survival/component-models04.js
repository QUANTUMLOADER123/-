import * as THREE from 'three';
import {material16,medicalModel16,toolModel16} from './items16.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {cupboardModel,workshopModel} from './world04.js';
export function componentModel04(id){if(['syringe','medkit','antiseptic','traumaKit'].includes(id))return medicalModel16(id);if(['axe','pickaxe','hammer'].includes(id))return toolModel16(id);if(id==='cupboard')return cupboardModel();if(['recycler','repairBench'].includes(id))return workshopModel(id);const g=new THREE.Group(),metal=material16('steel'),rust=material16('rust'),green=material16('paint');
 const box=(size,pos,mat=metal)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(...size,1,.02),mat);m.position.set(...pos);g.add(m);return m;};const tube=(r,h,pos,mat=metal)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat);m.position.set(...pos);g.add(m);return m;};
 if(['metalPipe','metalCylinder'].includes(id)){const radius=id==='metalPipe'?.12:.25,height=id==='metalPipe'?1:.75;tube(radius,height,[0,height/2,0],id==='metalCylinder'?green:metal);if(id==='metalPipe'){for(const y of[.02,.98]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.025,6,16),rust);ring.rotation.x=Math.PI/2;ring.position.y=y;g.add(ring);}}else{tube(.06,.15,[0,.83,0],rust);box([.3,.04,.06],[0,.94,0],metal);}}
 else if(['rocket','hvRocket','incendiaryRocket'].includes(id)){tube(.10,1.1,[0,.55,0],id==='incendiaryRocket'?rust:green);const nose=new THREE.Mesh(new THREE.ConeGeometry(.11,.35,16),metal);nose.position.y=1.27;g.add(nose);for(let j=0;j<4;j++){const m=box([.04,.28,.23],[0,.12,0],metal);m.rotation.y=j*Math.PI/2;}tube(.12,.08,[0,.95,0],rust);}
 else if(id==='highMetalOre'||id==='highMetal'){if(id==='highMetalOre'){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.45,1),metal);m.position.y=.4;g.add(m);for(let j=0;j<7;j++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(.13),rust);c.position.set(Math.sin(j)*.3,.4+j*.05,Math.cos(j)*.3);g.add(c);}}else for(let j=0;j<3;j++)box([.7,.13,.35],[j*.05,.10+j*.14,j*.05],metal);}
 else if(['rifleBody','smgBody','semiBody'].includes(id)){box([.23,.3,.75],[0,.3,0]);box([.15,.3,.17],[0,.08,.1],rust);tube(.04,.16,[.16,.35,-.1],rust);}
 else if(['techParts','metalSheet','metalBlade'].includes(id)){box([.7,.06,.5],[0,.2,0],id==='techParts'?green:metal);if(id==='techParts')for(let j=0;j<7;j++)box([.1,.08,.12],[-.24+(j%4)*.16,.27,-.12+Math.floor(j/4)*.24],j%2?metal:rust);else for(let j=0;j<4;j++)box([.02,.02,.48],[-.25+j*.16,.25,0],rust);}
 else if(['f1Grenade','beancan','timedCharge','explosives'].includes(id)){if(id==='f1Grenade'){const m=new THREE.Mesh(new THREE.SphereGeometry(.23,14,10),green);m.scale.y=1.3;m.position.y=.3;g.add(m);tube(.08,.15,[0,.6,0],metal);const ring=new THREE.Mesh(new THREE.TorusGeometry(.08,.015,6,12),metal);ring.position.set(.1,.65,0);g.add(ring);}else{box([.6,.35,.4],[0,.24,0],green);for(const x of[-.22,.22])box([.04,.38,.43],[x,.24,0],rust);box([.22,.11,.25],[0,.45,0],metal);}}
 else if(id==='mushroom'){
  const stem=material16('organic',0xf3e6c5),cap=material16('organic',0x996940);
  tube(.055,.31,[0,.155,0],stem);
  const profile=[[0,.15],[.10,.143],[.23,.10],[.33,.025],[.34,0],[.25,-.018],[.08,-.025],[0,-.025]].reverse().map(([r,y])=>new THREE.Vector2(r,y));
  const dome=new THREE.Mesh(new THREE.LatheGeometry(profile,24),cap);dome.position.y=.31;g.add(dome);
  const gills=new THREE.Mesh(new THREE.CircleGeometry(.30,24),stem);gills.rotation.x=Math.PI/2;gills.position.y=.288;g.add(gills);
 }
 else if(['corn','pumpkin','meat','cookedMeat'].includes(id)){const food=material16('organic',id==='corn'?0xf3d249:id==='pumpkin'?0xe78b33:id==='meat'?0xd66c58:0x9c6647);const m=new THREE.Mesh(new THREE.SphereGeometry(.35,16,12),food);m.position.y=.35;if(id==='corn')m.scale.set(.4,1.5,.4);g.add(m);if(['corn','pumpkin'].includes(id))tube(.04,.14,[0,id==='corn'?.91:.72,0],green);}
 else if(['tarp','ductTape'].includes(id)){if(id==='ductTape'){const m=new THREE.Mesh(new THREE.TorusGeometry(.26,.12,8,20),green);m.position.y=.35;g.add(m);}else for(let j=0;j<4;j++)box([.75,.07,.55],[0,.1+j*.07,j*.02],green);}
 else return null;return g;}
