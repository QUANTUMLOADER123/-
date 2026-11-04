import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {material16} from './items16.js';
export function recyclerModel20(){
 const root=new THREE.Group(),steel=material16('steel',0x899187),paint=material16('paint',0x4d6047),yellow=material16('paint',0xa68c39),rubber=material16('rubber',0x303632);
 const mesh=(g,mat,pos)=>{const m=new THREE.Mesh(g,mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;root.add(m);return m;},box=(size,pos,mat)=>mesh(new RoundedBoxGeometry(...size,1,.012),mat,pos);
 for(const x of[-.76,.76])for(const z of[-.38,.38]){box([.11,.60,.11],[x,.30,z],steel);box([.20,.035,.19],[x,.018,z],steel);}
 box([1.75,.90,.88],[0,1.02,0],paint);box([1.82,.09,.94],[0,.58,0],steel);
 for(const x of[-.78,0,.78])box([.045,.85,.04],[x,1.02,.46],steel);
 // Open tapered receiving hopper, inner faces and a thick rolled rim.
 for(let side=0;side<4;side++){
  const half=side%2?.62:1.10,lower=side%2?.40:.77,depth=side%2?1.10:.62,lowDepth=side%2?.77:.40;
  const g=new THREE.BufferGeometry(),p=[-half,1.91,depth,half,1.91,depth,-lower,1.48,lowDepth,lower,1.48,lowDepth];g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,0,0,1,0],2));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();const mat=yellow.clone();mat.side=THREE.DoubleSide;const m=mesh(g,mat,[0,0,0]);m.rotation.y=side*Math.PI/2;
  const rim=box([half*2+.07,.065,.065],[Math.sin(side*Math.PI/2)*depth,1.93,Math.cos(side*Math.PI/2)*depth],yellow);rim.rotation.y=side*Math.PI/2;
 }
 for(let j=0;j<2;j++){const rotor=new THREE.Group();rotor.name='recyclerRotor20-'+j;rotor.position.set(0,1.5,j?-.18:.18);root.add(rotor);const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,1.55,10),steel);shaft.rotation.z=Math.PI/2;rotor.add(shaft);
  const shape=new THREE.Shape();for(let t=0;t<20;t++){const a=t*Math.PI/10,r=t%2?.115:.16;t?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:false});geo.rotateY(Math.PI/2);
  for(let i=0;i<9;i++){const tooth=new THREE.Mesh(geo,steel);tooth.position.x=-.67+i*.16;rotor.add(tooth);}
 }
 const motor=mesh(new THREE.CylinderGeometry(.25,.25,.54,16),paint,[-1.1,1.04,0]);motor.rotation.z=Math.PI/2;
 for(let i=0;i<7;i++){const ring=mesh(new THREE.TorusGeometry(.252,.012,4,16),steel,[-1.32+i*.07,1.04,0]);ring.rotation.y=Math.PI/2;}
 box([.29,.43,.18],[1.02,1.08,.30],steel);for(const [y,color]of[[1.20,0x6e9950],[1.04,0xa34430]]){const b=mesh(new THREE.CylinderGeometry(.045,.045,.035,12),new THREE.MeshStandardMaterial({color,roughness:.6}),[1.02,y,.41]);b.rotation.x=Math.PI/2;}
 const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.02,.87,.34),new THREE.Vector3(1.05,.55,.20),new THREE.Vector3(.93,.72,-.23)]),12,.014,5,false),rubber);root.add(cable);
 // Static parts batch by material; shafts remain separate for operation feedback.
 const batches=new Map();for(const m of [...root.children])if(m.isMesh){m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}const key=m.material;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(g);m.geometry.dispose();m.removeFromParent();}
 for(const [mat,parts]of batches){const g=mergeGeometries(parts);parts.forEach(g=>g.dispose());const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;root.add(m);}return root;
}
export function installRecyclerModels20(World){const station=World.prototype.stationModel,update=World.prototype.update;World.prototype.stationModel=function(kind){return kind==='recycler'?recyclerModel20():station.call(this,kind);};World.prototype.update=function(dt,state,playing,...args){update.call(this,dt,state,playing,...args);if(playing)for(const item of this.interactables)if(item.type==='recycler'&&state.recyclers20?.[item.id]?.on)for(let j=0;j<2;j++){const rotor=item.model.getObjectByName('recyclerRotor20-'+j);if(rotor)rotor.rotation.x+=dt*(j?-3:3);}};}
