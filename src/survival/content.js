import {addExtraSite,makeSettlements,addRoadCluster} from './world04.js';
import {addOilRig} from './offshore.js';
import {detailSite} from './site-details.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MONUMENTS,BOT_BASES,ROADS,terrainHeight,randomSeed,TIERS} from './state.js';
const V=THREE.Vector3;
export const LOOT_TABLES={supplies:{wood:12,fiber:5,water:1,berries:3,bandage:1,cannedFood:1,sewingKit:1},industrial:{scrap:5,metalOre:9,sulfurOre:6,metal:3,lowFuel:6,gears:1,spring:1},military:{scrap:7,metal:5,ammo:8,gunpowder:4,syringe:1,rope:1},ore:{stone:16,metalOre:12,sulfurOre:10},road:{scrap:2,fiber:2,metalOre:3},barrel:{scrap:3,wood:5,metalOre:4}};
export function addIslandContent(w){
 w.distantGroups=[];w.staticStructures=[];w.bases=BOT_BASES;w.walkFloors=[];
 const metal=new THREE.MeshStandardMaterial({color:0x4d5854,metalness:.55,roughness:.82,map:w.roofTexture()}),rust=new THREE.MeshStandardMaterial({color:0x70513b,metalness:.35,roughness:.95,map:w.roofTexture()}),concrete=new THREE.MeshStandardMaterial({color:0x686c61,map:w.textures['rockyGround_basecolor.png'],normalMap:w.textures['rockyGround_normal.png'],normalScale:new THREE.Vector2(.25,.25),roughness:1}),black=new THREE.MeshStandardMaterial({color:0x202925,roughness:1}),orange=new THREE.MeshStandardMaterial({color:0x986447,roughness:.9}),glass=new THREE.MeshStandardMaterial({color:0x87a6a0,metalness:.25,roughness:.25,transparent:true,opacity:.45});
 w.constructionMaterials={metal,rust,concrete,black,orange};
 const box=(group,mat,size,pos,rot=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...pos);mesh.rotation.y=rot;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.solid=size[1]>1.4;group.add(mesh);w.occluders.push(mesh);return mesh;};
 const cyl=(group,mat,r1,r2,height,pos,sides=16)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,height,sides),mat);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.solid=height>1.4&&Math.max(r1,r2)>.3;group.add(mesh);w.occluders.push(mesh);return mesh;};
 const pipe=(group,a,b,r=.08,mat=metal)=>{const d=new V(...b).sub(new V(...a)),m=cyl(group,mat,r,r,d.length(),new V(...a).add(new V(...b)).multiplyScalar(.5).toArray(),8);m.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());return m;};
 const label=(group,text,x,y,z,width=7)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#202b26';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#9b8560';ctx.lineWidth=4;ctx.strokeRect(7,7,498,114);ctx.fillStyle='#d4c9a9';ctx.font='bold 36px Arial';ctx.textAlign='center';ctx.fillText(text.toUpperCase(),256,76,470);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshStandardMaterial({map:tex,roughness:1}));mesh.position.set(x,y,z);group.add(mesh);};
 const localProp=(root,name,x,z,height,rot=0,y=0)=>{const model=w.normalized(name,height);model.position.set(x,y,z);model.rotation.y=rot;root.add(model);return model;};
 const container=(root,x,z,rot=0,color=rust)=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;box(g,color,[5.8,2.4,2.5],[0,1.2,0]);for(let i=-10;i<=10;i++){box(g,metal,[.055,2.2,.06],[i*.26,1.2,1.28]);box(g,metal,[.055,2.2,.06],[i*.26,1.2,-1.28]);}for(const q of[-1,1]){box(g,black,[.04,2.2,.06],[2.93,1.2,q*.58]);}root.add(g);return g;};
 const shed=(root,x,z,width=7,depth=6,mat=metal)=>{
  const g=new THREE.Group();g.position.set(x,0,z);box(g,concrete,[width+.5,.2,depth+.5],[0,.1,0]);box(g,mat,[width,3.5,.18],[0,1.85,-depth/2]);for(const side of[-1,1])box(g,mat,[.18,3.5,depth],[side*width/2,1.85,0]);box(g,mat,[width*.33,3.5,.18],[-width*.335,1.85,depth/2]);box(g,mat,[width*.33,3.5,.18],[width*.335,1.85,depth/2]);box(g,mat,[width,1.2,.18],[0,3,depth/2]);const roof=box(g,mat,[width+.6,.16,depth+.6],[0,3.8,0]);roof.rotation.x=.07;for(const side of[-1,1]){box(g,black,[.12,3.6,.2],[side*(width/2-.1),1.85,depth/2]);for(let z=-depth/2+1;z<depth/2;z+=2){pipe(g,[side*width/2,2,z],[side*width/2,3.6,z+.8],.04);}}for(let z=-depth/2+1;z<depth/2;z+=2)pipe(g,[-width/2,3.4,z],[width/2,3.4,z],.065);for(let i=0;i<5;i++)box(g,black,[.04,3.1,.2],[-width*.45+i*width*.225,1.85,-depth/2-.1]);root.add(g);return g;
 };
 const crate=(root,m,id,x,z,type=m.loot,extra={})=>{const model=localProp(root,'Crate',x,z,.9,.15);w.interactables.push({id:'rt-'+m.id+'-'+id,type:'crate',x:m.x+x,z:m.z+z,model,radius:.85,lootType:type,...extra});w.colliders.push({id:'rt-'+m.id+'-'+id,x:m.x+x,z:m.z+z,r:.55});};
 function floor(root,m,wid,dep){box(root,concrete,[wid,.12,dep],[0,.06,0]);w.walkFloors.push({x:m.x,z:m.z,w:wid,d:dep,y:terrainHeight(m.x,m.z)+.12});}
 for(const m of MONUMENTS){
  const root=new THREE.Group(),ground=terrainHeight(m.x,m.z);root.position.set(m.x,ground,m.z);root.name=m.name;w.scene.add(root);w.distantGroups.push({root,x:m.x,z:m.z,range:240});
  if(m.kind==='oilrig'){addOilRig(w,root,m);continue;}
  if(['outpost','market','supermarket','satellite','trainyard','mining','wreckyard','waterTower'].includes(m.kind)){addExtraSite(w,root,m,{box,cyl,pipe,metal,concrete,rust});if(m.safe)continue;}
  if(m.kind==='lighthouse'){
   cyl(root,concrete,3.2,3.8,1,[0,.5,0],24);cyl(root,concrete,1.7,2.6,15,[0,8.5,0],24);cyl(root,orange,1.93,2.06,2,[0,8,0],24);cyl(root,black,2.8,2.8,.22,[0,16.1,0],24);cyl(root,glass,1.7,1.7,2.5,[0,17.4,0],16);cyl(root,metal,0,2.4,1.4,[0,19.3,0],16);
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;pipe(root,[Math.sin(a)*2.6,16.2,Math.cos(a)*2.6],[Math.sin(a)*2.6,17.2,Math.cos(a)*2.6],.025);}
   const lamp=new THREE.Mesh(new THREE.SphereGeometry(.32,10,10),new THREE.MeshBasicMaterial({color:0xffd699}));lamp.position.y=17.5;root.add(lamp);box(root,black,[1.1,2,.15],[0,1.8,2.4]);shed(root,-8,-3,5,4,concrete);label(root,'МАЯК / 01',0,2.9,3.9,5);crate(root,m,0,-7,0);crate(root,m,1,4,4);crate(root,m,2,-3,-5);
  }else if(m.kind==='harbor'){
   floor(root,m,35,28);for(let i=0;i<5;i++)container(root,-10+(i%3)*7,-7+Math.floor(i/3)*5,i%2?Math.PI/2:0,i%2?rust:metal);pipe(root,[10,0,0],[10,20,0],.25,rust);pipe(root,[10,20,0],[-9,20,0],.18,rust);pipe(root,[10,17,0],[-9,20,0],.09);pipe(root,[-8,20,0],[-8,5,0],.04);box(root,black,[1.2,.5,1.2],[-8,4.7,0]);shed(root,-10,10,7,5);label(root,'ПОРТ СЕВЕР',8,4,11,8);for(let i=0;i<4;i++)crate(root,m,i,5+i*2,5-i*3);
   const pier=new THREE.Group();for(let i=0;i<18;i++)box(pier,w.woodMaterial,[2.2,.16,7],[i*2.2,.7,0]);for(let i=0;i<7;i++)for(const side of[-1,1])cyl(pier,black,.18,.25,4,[i*6,-1,side*3],8);pier.position.set(8,-ground+1.1,13);root.add(pier);w.walkFloors.push({x:m.x+26,z:m.z+13,w:40,d:7,y:1.9});
  }else if(m.kind==='airfield'){
   floor(root,m,28,65);const runwayMat=new THREE.MeshStandardMaterial({color:0x363c35,roughness:1});box(root,runwayMat,[17,.1,88],[0,.18,0]);for(let i=-5;i<=5;i++)box(root,concrete,[.35,.015,3.5],[0,.245,i*7]);
   const hangar=new THREE.Group();const shell=new THREE.Mesh(new THREE.CylinderGeometry(8,8,15,20,1,true,0,Math.PI),metal);shell.rotation.z=Math.PI/2;shell.rotation.y=Math.PI/2;shell.position.set(18,0,-8);root.add(shell);shed(root,18,-8,14,13);cyl(root,concrete,2.3,2.3,9,[-13,4.5,-25],8);box(root,glass,[6,2.6,5],[-13,10.2,-25]);box(root,metal,[7,.3,6],[-13,11.7,-25]);label(root,'АЭРОДРОМ',0,2,44,9);crate(root,m,0,18,-7,'military',{special:{rifle:1}});crate(root,m,1,-12,-20);crate(root,m,2,10,20);crate(root,m,3,20,13);
  }else if(m.kind==='power'){
   floor(root,m,39,36);for(const x of[-11,5]){cyl(root,concrete,2.4,3.5,14,[x,7,-8],20);cyl(root,rust,2.5,2.5,1,[x,14.4,-8],20);cyl(root,black,2.15,2.15,.1,[x,14.94,-8],20);}shed(root,-4,11,13,10,concrete);for(let i=0;i<4;i++){box(root,metal,[2.8,2.2,3],[10,1.2,2+i*5]);for(let j=0;j<3;j++)cyl(root,black,.25,.25,1.1,[9+j*.8,2.8,2+i*5],9);}for(let i=0;i<4;i++)pipe(root,[-12,3,0],[13,3,i*4],.15,rust);label(root,'ТЭЦ-04',0,5,17,7);for(let i=0;i<4;i++)crate(root,m,i,-11+i*5,11);
  }else if(m.kind==='quarry'){
   for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(17-i*3,1.3,5,36),concrete);ring.rotation.x=Math.PI/2;ring.position.y=.3+i*.2;root.add(ring);}pipe(root,[-12,1,-10],[-12,9,-10],.18,rust);pipe(root,[-12,9,-10],[10,9,-10],.15,rust);box(root,metal,[4,2.4,3],[10,1.5,-12]);label(root,'КАРЬЕР',0,3,20,7);for(let i=0;i<4;i++)crate(root,m,i,-8+i*5,8,'ore');
  }else if(m.kind==='radar'){
   cyl(root,concrete,3,4,8,[0,4,0],12);const dish=new THREE.Mesh(new THREE.SphereGeometry(8,30,12,0,Math.PI*2,0,Math.PI*.42),new THREE.MeshStandardMaterial({color:0x85918a,metalness:.55,roughness:.65,side:THREE.DoubleSide}));dish.rotation.x=.65;dish.position.y=12;root.add(dish);pipe(root,[0,12,0],[0,19,4],.08);pipe(root,[-5,12,0],[0,18,4],.06);pipe(root,[5,12,0],[0,18,4],.06);shed(root,-10,9,8,7,concrete);container(root,10,-5,.1);label(root,'УЗЕЛ РАДАР',0,2,11,8);for(let i=0;i<4;i++)crate(root,m,i,-11+i*6,8);
  }else if(m.kind==='waterworks'){
   floor(root,m,38,31);for(const[x,z]of[[-9,-6],[8,-6],[-1,10]]){cyl(root,concrete,6.6,6.6,1.8,[x,.9,z],28);cyl(root,new THREE.MeshStandardMaterial({color:0x273c35,roughness:.28,metalness:.2}),5.9,5.9,.07,[x,1.84,z],28);const rim=new THREE.Mesh(new THREE.TorusGeometry(6.2,.22,7,32),metal);rim.rotation.x=Math.PI/2;rim.position.set(x,2,z);root.add(rim);box(root,metal,[13,.1,.6],[x,2.1,z]);pipe(root,[x,2.2,z],[x,4,z],.06);}shed(root,14,10,7,7,concrete);label(root,'ВОДООЧИСТКА',0,3,18,10);crate(root,m,0,14,11);crate(root,m,1,-17,4);crate(root,m,2,3,20);
  }else if(m.kind==='gas'){
   floor(root,m,32,24);shed(root,-8,-6,12,7,concrete);for(const x of[3,15])for(const z of[-4,7])cyl(root,rust,.13,.13,4.6,[x,2.3,z],8);box(root,metal,[17,.35,15],[9,4.7,1]);box(root,orange,[17,.35,.25],[9,4.7,8.5]);for(const x of[5,12]){box(root,concrete,[1,1.5,.8],[x,.8,2]);box(root,orange,[1.05,.8,.85],[x,1.65,2]);box(root,black,[.65,.3,.05],[x,1.8,2.45]);pipe(root,[x+.55,1.6,2],[x+.7,.7,2.4],.035,black);}label(root,'ПОСЛЕДНИЙ БЕНЗИН',5,5.3,9,12);crate(root,m,0,-8,-5);crate(root,m,1,0,10);crate(root,m,2,-12,2);
  }else if(m.kind==='junkyard'){
   floor(root,m,38,32);for(let i=0;i<6;i++)container(root,-12+(i%3)*11,-9+Math.floor(i/3)*14,i%2*.2,i%2?rust:metal);for(let i=0;i<18;i++){const tyre=new THREE.Mesh(new THREE.TorusGeometry(.65,.2,7,12),black);tyre.rotation.x=Math.PI/2;tyre.position.set(-15+(i%4)*1.4,.25+Math.floor(i/4)*.3,6+(i%3)*.5);root.add(tyre);}pipe(root,[14,0,8],[14,12,8],.22,rust);pipe(root,[14,12,8],[1,14,4],.18,rust);label(root,'РЖАВЧИНА',0,4,17,10);for(let i=0;i<4;i++)crate(root,m,i,-11+i*6,0);
  }else if(m.kind==='bunker'){
   floor(root,m,25,20);shed(root,0,0,17,13,concrete);box(root,concrete,[18,.7,14],[0,4.15,0]);for(const x of[-6,-3,3,6])box(root,metal,[.3,3.5,.3],[x,1.9,6.7]);for(const x of[-7,7])pipe(root,[x,0,-5],[x,8,-5],.16,rust);box(root,black,[3,.3,.1],[0,3.4,6.8]);label(root,'БЛОК 17',0,4.9,7.1,7);crate(root,m,0,-5,-2,'military',{special:{rifle:1}});crate(root,m,1,5,-2);crate(root,m,2,-5,4);crate(root,m,3,5,4);
  }
  detailSite(w,root,m,{box,cyl,pipe,prop:localProp,metal,rust,concrete,black,glass});
  // Close-up prop variety and perimeter warning lamps are part of every authored site.
  for(let i=0;i<3;i++){const x=-m.radius*.6+i*2,z=m.radius*.6,id='rt-barrel-'+m.id+'-'+i,model=localProp(root,'Barrel',x,z,1.1,i*.7);w.interactables.push({id,type:'barrel',x:m.x+x,z:m.z+z,model,radius:.7});w.colliders.push({id,x:m.x+x,z:m.z+z,r:.48});}
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.12,7,7),new THREE.MeshBasicMaterial({color:0xe27c4b}));marker.position.set(0,5,0);root.add(marker);
 }
 addRoads(w,metal,concrete);
 makeSettlements(w);
 for(const {root}of w.distantGroups){root.updateMatrixWorld(true);root.traverse(mesh=>{if(!mesh.isMesh)return;const bounds=new THREE.Box3().setFromObject(mesh);mesh.userData.worldBounds=bounds;if(!mesh.userData.solid)return;const unused=bounds,size=bounds.getSize(new V()),center=bounds.getCenter(new V());mesh.userData.worldBounds=bounds;w.colliders.push({box:true,x:center.x,z:center.z,w:size.x,d:size.z,y:bounds.min.y,h:size.y,scenery:true});});}

}
function addRoads(w,metal,concrete){
 const asphaltCanvas=document.createElement('canvas');asphaltCanvas.width=256;asphaltCanvas.height=256;const ctx=asphaltCanvas.getContext('2d'),r=randomSeed(432);ctx.fillStyle='#3e433a';ctx.fillRect(0,0,256,256);for(let i=0;i<21000;i++){const v=40+r()*60;ctx.fillStyle=`rgba(${v},${v+3},${v-6},.4)`;ctx.fillRect(r()*256,r()*256,1+r()*2,1+r()*2);}for(let i=0;i<15;i++){ctx.strokeStyle='#222b2566';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(r()*256,0);ctx.lineTo(r()*256,128);ctx.lineTo(r()*256,256);ctx.stroke();}const tex=new THREE.CanvasTexture(asphaltCanvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,30);const material=new THREE.MeshStandardMaterial({map:tex,roughness:1,color:0xffffff,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const paint=new THREE.MeshBasicMaterial({color:0xb9b79e,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const dashes=[],rand=randomSeed(1281);
 for(const[part,path]of Object.entries(ROADS)){
  const pos=[],uv=[],indices=[];let distance=0;
  for(let i=0;i<path.length;i++){const p=path[i],a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,width=part==='ring'?6:4.5;if(i)distance+=Math.hypot(p.x-a.x,p.z-a.z);for(const side of[-1,0,1]){const x=p.x+nx*width*.5*side,z=p.z+nz*width*.5*side;pos.push(x,terrainHeight(x,z)+.16,z);uv.push((side+1)/2,distance/60);}if(i){const v=i*3;indices.push(v-3,v-2,v,v,v-2,v+1,v-2,v-1,v+1,v+1,v-1,v+2);}
   if(i%3===0&&i<path.length-1){const vertices=[];for(const [side,along]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=p.x+nx*.09*side+dx/len*1.25*along,z=p.z+nz*.09*side+dz/len*1.25*along;vertices.push(x,terrainHeight(x,z)+.205,z);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();dashes.push(g);}

   if(i%17===2){const side=rand()>.5?1:-1,x=p.x+nx*(width/2+6)*side,z=p.z+nz*(width/2+6)*side;addRoadCluster(w,x,z,'road-'+part+'-'+i);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;w.scene.add(mesh);
 }
 const dashMesh=new THREE.Mesh(mergeGeometries(dashes),paint);w.scene.add(dashMesh);dashes.forEach(g=>g.dispose());w.roadTexture=tex;
}
