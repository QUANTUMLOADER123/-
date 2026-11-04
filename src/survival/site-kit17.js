import {recyclerModel20} from './recycler-model20.js';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {terrainHeight} from './state.js';
import {ROADS,MAP_SEED} from './map-data.js';
import {crateModel,metalBarrel} from './world04.js';
import {crateTier,barrelTier} from './loot04.js';
import {pbrMaterial12} from './materials12.js';
import {material16} from './items16.js';
import {vehicleModel16} from './vehicles16.js';
const V=THREE.Vector3,up=new V(0,1,0);
export function siteMaterials17(w){
 const p={concrete:pbrMaterial12(w,'concrete',{color:0xd4d2c6}),metal:material16('steel'),rust:material16('rust'),wood:material16('wood'),paint:material16('paint'),rubber:material16('rubber'),asphalt:pbrMaterial12(w,'asphalt'),brick:pbrMaterial12(w,'stone',{color:0xaa8268}),cream:pbrMaterial12(w,'concrete',{color:0xd1c6a7}),blue:material16('paint',0x91b6cf),red:material16('organic',0xa9503b),yellow:material16('organic',0xe6b853),glass:new THREE.MeshStandardMaterial({color:0x3e6973,roughness:.28,metalness:.18}),light:new THREE.MeshStandardMaterial({color:0xd4d1a7,emissive:0xb8b37e,emissiveIntensity:.35}),white:material16('organic',0xf2eee0)};
 w.constructionMaterials={metal:p.metal,rust:p.rust,concrete:p.concrete,black:p.rubber,orange:p.red};return p;
}
/** Local +Z is the entrance. Yaw points it towards a road, not an arbitrary
 * cardinal direction. Offshore/harbour can supply their own coast-facing yaw. */
export function approachYaw17(m){
 let best=null,dist=Infinity;
 for(const path of Object.values(ROADS))for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz;if(n<.0001)continue;
  const t=THREE.MathUtils.clamp(((m.x-a.x)*dx+(m.z-a.z)*dz)/n,0,1),x=a.x+t*dx,z=a.z+t*dz,d=Math.hypot(x-m.x,z-m.z);
  if(d>2&&d<dist){best={x,z};dist=d;}
 }
 return best?Math.atan2(best.x-m.x,best.z-m.z):0;
}
/** Register geometry first, derive EVERY world-space record from the final matrix
 * once. No m.x + localX shortcuts for nested / rotated structures. */
export class Site17{
 constructor(w,m,p,yaw=approachYaw17(m)){
  this.w=w;this.m=m;this.p=p;this.solids=[];this.floors=[];this.loot=[];this.keep=new Set();this.root=new THREE.Group();this.root.name='RT17:'+m.id;this.root.position.set(m.x,m.kind==='oilrig'?0:terrainHeight(m.x,m.z)+.015,m.z);this.root.rotation.y=yaw;this.root.userData.site17=m.id;w.scene.add(this.root);w.distantGroups.push({root:this.root,x:m.x,z:m.z,range:m.kind==='oilrig'?900:650});
 }
 group(parent=this.root,pos=[0,0,0],yaw=0){const g=new THREE.Group();g.position.set(...pos);g.rotation.y=yaw;parent.add(g);return g;}
 mesh(parent,geo,mat,pos=[0,0,0],solid=false){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);if(solid)this.solids.push(m);return m;}
 box(parent,size,pos,mat=this.p.metal,solid=false,bevel=0){return this.mesh(parent,bevel?new RoundedBoxGeometry(...size,2,Math.min(bevel,...size.map(n=>n*.2))):new THREE.BoxGeometry(...size),mat,pos,solid);}
 cyl(parent,r1,r2,h,pos,mat=this.p.metal,solid=false,sides=20,open=false){return this.mesh(parent,new THREE.CylinderGeometry(r1,r2,h,sides,1,open),mat,pos,solid);}
 beam(parent,a,b,r=.055,mat=this.p.metal){const start=new V(...a),d=new V(...b).sub(start);if(d.lengthSq()<1e-8)return null;const m=this.cyl(parent,r,r,d.length(),start.addScaledVector(d,.5).toArray(),mat,false,8);m.quaternion.setFromUnitVectors(up,d.normalize());return m;}
 ring(parent,r,t,pos,mat=this.p.metal,horizontal=false){const m=this.mesh(parent,new THREE.TorusGeometry(r,t,6,28),mat,pos);if(horizontal)m.rotation.x=-Math.PI/2;return m;}
 floor(parent,w,d,x=0,z=0,y=.18,mat=this.p.concrete){const m=this.box(parent,[w,.18,d],[x,y-.09,z],mat,true);this.floors.push({mesh:m,w,d});return m;}
 rail(parent,a,b,y){const A=new V(...a),B=new V(...b),n=Math.max(1,Math.ceil(A.distanceTo(B)/1.8));for(let i=0;i<=n;i++){const q=A.clone().lerp(B,i/n);this.beam(parent,[q.x,y,q.z],[q.x,y+1.05,q.z],.027,this.p.yellow);}for(const h of[.48,1.05])this.beam(parent,[A.x,y+h,A.z],[B.x,y+h,B.z],.022,this.p.yellow);}
 stairs(parent,{x=0,z=0,y=.18,rise=3,width=1.8,yaw=0,steps=Math.ceil(rise/.20),tread=.32,rails=true}={}){
  const g=this.group(parent,[x,y,z],yaw),run=steps*tread;
  for(let i=0;i<steps;i++)this.floor(g,width,tread+.025,0,-(i+.5)*tread,(i+1)*rise/steps,this.p.metal);
  for(const x of[-width*.38,width*.38])this.beam(g,[x,-.1,0],[x,rise-.15,-run],.065,this.p.rust);
  if(rails)for(const x of[-width/2,width/2]){for(let i=0;i<=steps;i+=Math.max(1,Math.floor(steps/5)))this.beam(g,[x,rise*i/steps,-i*tread],[x,rise*i/steps+1,-i*tread],.025,this.p.yellow);this.beam(g,[x,1,0],[x,rise+1,-run],.025,this.p.yellow);}
  return {root:g,run,top:new V(0,rise,-run)};
 }
 room(parent,{x=0,z=0,y=.18,w=8,d=7,h=3.4,yaw=0,mat=this.p.cream,door=2.6,pitched=true}={}){
  const g=this.group(parent,[x,y,z],yaw);this.floor(g,w,d,0,0,.025);g.userData.floorLocal17=.025;
  this.box(g,[w,h,.20],[0,h/2,-d/2],mat,true);
  for(const side of[-1,1]){this.box(g,[.20,h,d],[side*w/2,h/2,0],mat,true);const wing=(w-door)/2;this.box(g,[wing,h,.20],[side*(door/2+wing/2),h/2,d/2],mat,true);this.box(g,[.1,2.7,.26],[side*door/2,1.35,d/2+.02],this.p.metal);}
  this.box(g,[door,h-2.6,.20],[0,2.6+(h-2.6)/2,d/2],mat,true);
  // Two fitted roof slopes meeting at a common ridge, not rotated boxes that
  // overlap walls or use a cylinder on the wrong axis.
  if(pitched){const slope=.20,half=w/2+.32,height=half*Math.tan(slope);for(const side of[-1,1]){const roof=this.box(g,[half/Math.cos(slope),.13,d+.65],[side*half/2,h+height/2,0],this.p.paint);roof.rotation.z=-side*slope;}this.beam(g,[0,h+height,-d/2-.33],[0,h+height,d/2+.33],.055,this.p.metal);}
  else this.floor(g,w+.4,d+.4,0,0,h+.13,this.p.concrete);
  for(const side of[-1,1]){this.box(g,[Math.max(.6,(w-door)/2-.4),.8,.025],[side*(door/2+(w-door)/4),1.7,d/2+.115],this.p.glass);this.box(g,[.16,h+.07,.24],[side*w/2,h/2,d/2],this.p.metal);}
  return g;
 }
 container(parent,x,z,yaw=0,color=this.p.blue,open=true){
  const g=this.group(parent,[x,.205,z],yaw),w=2.5,d=5.9,h=2.55;this.floor(g,w,d,0,0,0,this.p.metal);
  for(const side of[-1,1]){this.box(g,[.10,h,d],[side*w/2,h/2,0],color,true);for(let i=0;i<19;i++)this.box(g,[.028,h-.12,.04],[side*(w/2+.06),h/2,-d/2+.15+i*.31],color);}
  this.box(g,[w,h,.12],[0,h/2,-d/2],color,true);this.box(g,[w+.1,.12,d+.1],[0,h,0],color);
  if(!open)this.box(g,[w,h,.10],[0,h/2,d/2],color,true);else for(const side of[-1,1]){const leaf=this.group(g,[side*w/2,0,d/2],side*1.35);this.box(leaf,[w/2-.03,h,.08],[-side*w/4,h/2,0],color,true);this.beam(leaf,[-side*w/4,.15,.06],[-side*w/4,h-.15,.06],.025);}
  return g;
 }
 shelf(parent,x,z,w=3){for(const side of[-1,1])for(const zz of[-.34,.34])this.beam(parent,[x+side*w/2,0,z+zz],[x+side*w/2,2.3,z+zz],.035);for(let j=0;j<3;j++){this.box(parent,[w,.06,.75],[x,.45+j*.72,z],this.p.metal);for(let i=0;i<3;i++)this.box(parent,[.36,.35,.4],[x-w*.3+i*w*.3,.65+j*.72,z],i%2?this.p.paint:this.p.wood,false,.02);}}
 pallet(parent,x,z,y=.18){for(let i=0;i<6;i++)this.box(parent,[1.4,.045,.16],[x,y+.17,z-.5+i*.2],this.p.wood);for(const dx of[-.5,.5])this.box(parent,[.14,.14,1.2],[x+dx,y+.07,z],this.p.wood);}
 lamp(parent,x,z,h=4){this.beam(parent,[x,.18,z],[x,h,z],.045);this.box(parent,[.60,.14,.35],[x,h,z],this.p.rubber);this.box(parent,[.49,.035,.26],[x,h-.09,z],this.p.light);}
 valve(parent,x,y,z){this.ring(parent,.18,.028,[x,y,z],this.p.red);this.beam(parent,[x-.17,y,z],[x+.17,y,z],.018,this.p.red);}
 cabinet(parent,x,z,yaw=0){const g=this.group(parent,[x,.18,z],yaw);this.box(g,[1.25,1.8,.55],[0,.9,0],this.p.paint,true,.025);this.box(g,[.95,.42,.035],[0,1.25,.30],this.p.glass);for(let i=0;i<4;i++)this.box(g,[.035,.04,.025],[-.32+i*.2,.72,.3],i%2?this.p.red:this.p.yellow);for(let i=0;i<6;i++)this.box(g,[.8,.025,.03],[0,.15+i*.055,.30],this.p.rubber);return g;}
 tank(parent,x,z,r=1.8,h=5,mat=this.p.paint,y=.18){const g=this.group(parent,[x,y,z]);this.cyl(g,r,r,h,[0,h/2,0],mat,true,28);for(const y of[.2,h-.2])this.ring(g,r+.02,.045,[0,y,0],this.p.metal,true);this.cyl(g,r*.78,r,.45,[0,h+.225,0],mat);this.cyl(g,.16,.16,.35,[0,h+.62,0],this.p.rust);this.beam(g,[r+.15,.15,0],[r+.15,h,0],.03);this.beam(g,[r+.15,.15,.45],[r+.15,h,.45],.03);for(let i=0;i<h/.30;i++)this.beam(g,[r+.15,i*.3,0],[r+.15,i*.3,.45],.018);return g;}
 sign(parent,text,pos,w=5,yaw=0){if(text!=='H')return new THREE.Object3D();const c=document.createElement('canvas');c.width=1024;c.height=256;const a=c.getContext('2d');a.fillStyle='#263239';a.fillRect(0,0,1024,256);a.strokeStyle='#aa9871';a.lineWidth=10;a.strokeRect(10,10,1004,236);a.font='bold 76px sans-serif';a.textAlign='center';a.fillStyle='#e3dfcb';a.fillText(text,512,155,960);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=this.mesh(parent,new THREE.PlaneGeometry(w,w/4),new THREE.MeshStandardMaterial({map:t,roughness:.9}),pos);m.rotation.y=yaw;this.keep.add(m);return m;}
 crate(parent,index,pos){const id='rt-'+this.m.id+'-'+index,model=crateModel(crateTier(id,MAP_SEED));model.position.set(pos[0],pos[1]+(parent.userData.floorLocal17||0),pos[2]);parent.add(model);this.keep.add(model);this.loot.push({id,type:'crate',model,lootType:this.m.loot});return model;}
 barrel(parent,index,pos){const id='rt-barrel-'+this.m.id+'-'+index,model=metalBarrel(barrelTier(id,MAP_SEED));model.position.set(...pos);parent.add(model);this.keep.add(model);this.loot.push({id,type:'barrel',model});return model;}
 terminal(parent,index,pos,recycler=false){if(recycler){const model=recyclerModel20();model.position.set(...pos);parent.add(model);this.keep.add(model);const hull=this.box(model,[1.8,1.4,.9],[0,1.15,0],this.p.metal,true);hull.visible=false;this.keep.add(hull);this.loot.push({id:'shop-'+this.m.id+'-'+index,type:'recycler',model,station:true});return model;}const id='shop-'+this.m.id+'-'+index,g=this.group(parent,pos);this.box(g,[.8,1.55,.6],[0,.775,0],recycler?this.p.rust:this.p.paint,true);this.box(g,[.64,.53,.025],[0,1.02,.315],this.p.glass);this.sign(g,recycler?'РАЗБОР':'ОБМЕН',[0,1.8,.32],1.8);this.keep.add(g);this.loot.push({id,type:recycler?'recycler':'shop',model:g,station:true});return g;}
 vehicle(parent,x,z,yaw=0,truck=false){const g=vehicleModel16(truck,truck?1:0);g.position.set(x,.18,z);g.rotation.y=yaw;parent.add(g);this.keep.add(g);for(const[size,pos]of[[[truck?2.5:2,.95,truck?5.5:3.8],[0,.475,0]],[[1.8,1,1.7],[0,1.36,truck?1.4:0]]]){const hull=this.box(g,size,pos,this.p.rubber,true);hull.visible=false;this.keep.add(hull);}return g;}
 finish(){
  const w=this.w;this.root.updateMatrixWorld(true);const q=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ');
  for(const m of this.solids){m.geometry.computeBoundingBox();const local=m.geometry.boundingBox,size=local.getSize(new V()),bounds=local.clone().applyMatrix4(m.matrixWorld),c=bounds.getCenter(new V());m.getWorldQuaternion(q);e.setFromQuaternion(q,'YXZ');const yaw=e.y,scale=m.getWorldScale(new V()),ow=size.x*Math.abs(scale.x),od=size.z*Math.abs(scale.z),tilted=Math.abs(e.x)+Math.abs(e.z)>.0001;
   const cylinder=m.geometry.type==='CylinderGeometry'&&!tilted;w.colliders.push({box:!cylinder,circle17:cylinder,r:cylinder?Math.max(ow,od)/2:undefined,x:c.x,z:c.z,y:bounds.min.y,h:bounds.max.y-bounds.min.y,w:bounds.max.x-bounds.min.x,d:bounds.max.z-bounds.min.z,ow:tilted?bounds.max.x-bounds.min.x:ow,od:tilted?bounds.max.z-bounds.min.z:od,rotation:tilted?0:yaw,scenery:true,site17:this.m.id,deck08:this.floors.some(f=>f.mesh===m)});
  }
  for(const f of this.floors){const m=f.mesh,c=m.getWorldPosition(new V()),yaw=m.getWorldQuaternion(q)&&e.setFromQuaternion(q,'YXZ').y,co=Math.abs(Math.cos(yaw)),si=Math.abs(Math.sin(yaw));w.walkFloors.push({x:c.x,z:c.z,w:co*f.w+si*f.d,d:si*f.w+co*f.d,ow:f.w,od:f.d,rotation:yaw,y:c.y+.09,site17:this.m.id,offshore:this.m.kind==='oilrig'});}
  for(const item of this.loot){const c=item.model.getWorldPosition(new V());w.interactables.push({...item,site17:this.m.id,x:c.x,z:c.z,y:c.y});if(!item.station)w.colliders.push({id:item.id,x:c.x,z:c.z,y:c.y,r:item.type==='barrel'?.45:.55,h:item.type==='barrel'?1.07:.8,site17:this.m.id});}
  // Material + 10m spatial cells: fine details do not each require a draw call,
  // while a whole site is not one unbounded raycast/visibility object.
  const batches=new Map();this.root.traverse(m=>{if(!m.isMesh||!m.visible)return;for(let n=m;n&&n!==this.root;n=n.parent)if(this.keep.has(n))return;if(this.keep.has(m))return;
   const pos=m.getWorldPosition(new V()),key=m.material.uuid+':'+Math.floor((pos.x-this.m.x)/10)+':'+Math.floor((pos.z-this.m.z)/10),inverse=new THREE.Matrix4().copy(this.root.matrixWorld).invert();let geo=m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld));if(geo.index){const old=geo;geo=old.toNonIndexed();old.dispose();}if(!batches.has(key))batches.set(key,{mat:m.material,list:[],old:[]});batches.get(key).list.push(geo);batches.get(key).old.push(m);
  });
  for(const {mat,list,old}of batches.values()){const geo=mergeGeometries(list);list.forEach(g=>g.dispose());old.forEach(m=>{m.removeFromParent();m.geometry.dispose();});const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=mesh.receiveShadow=true;this.root.add(mesh);mesh.updateWorldMatrix(true,false);geo.computeBoundingBox();mesh.userData.worldBounds=geo.boundingBox.clone().applyMatrix4(mesh.matrixWorld);w.occluders.push(mesh);}
  const replacedLoot=new Set(this.loot.filter(i=>!i.station).map(i=>i.model)),seen=new Set();
  for(const o of this.keep){if(replacedLoot.has(o))continue;o.traverse(m=>{if(!m.isMesh||!m.visible||seen.has(m))return;seen.add(m);m.updateWorldMatrix(true,false);m.geometry.computeBoundingBox();m.userData.worldBounds=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);w.occluders.push(m);});}
  this.m.entry17=this.m.kind==='oilrig'?this.m.dock:this.root.localToWorld(new V(0,.18,this.m.radius*.72+1.4));
  w.siteLayouts17??=[];w.siteLayouts17.push({id:this.m.id,yaw:this.root.rotation.y,colliders:this.solids.length,floors:this.floors.length,loot:this.loot.length});
 }
}
