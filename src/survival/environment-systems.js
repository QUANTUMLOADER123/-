import {forestTemplate21,variedTree21,treeVariantCount21} from './forest21.js';
import {forestTemplate19} from './forest19.js';
import {grassGround19} from './ground-cover19.js';
import {addCacti18} from './cacti18.js';
import {treeMaterial12} from './foliage12.js';
import {visualState12} from './materials12.js';
import {paintLoading11} from './loading11.js';
import * as THREE from 'three';
import {terrainHeight,randomSeed,buildingHeight} from './state.js';
import {MAP_SCALE,MAP_REVISION,ROADS,distanceToRoad,riverAt} from './map-data.js';
import {biomeAt,worldTime} from './environment.js';
const V=THREE.Vector3;
export function installEnvironmentSystems(World){Object.assign(World.prototype,{
 updateDayNight(elapsed){
  const c=worldTime(elapsed),light=c.daylight;this.dayCycle=c;
  this.sunDirection.set(Math.cos((c.hour-6)/24*Math.PI*2)*.7,Math.max(.06,c.elevation),.35).normalize();
  this.sun.intensity=2.2*light;this.sun.color.setRGB(1,.72+.2*light,.52+.35*light);
  this.hemisphere.intensity=.10+.75*light;this.lowAmbient.intensity=this.settings.quality==='low'?(.14+1.66*light):0;
  this.scene.environmentIntensity=.06+.94*light;
  this.scene.background=new THREE.Color(0x040b18).lerp(new THREE.Color(0x87bce2),light);
  if(this.stormSky)this.stormSky.material.uniforms.daylight.value=.045+.955*light;
  if(this.ocean){this.ocean.material.uniforms.daylight.value=.12+.88*light;this.ocean.material.uniforms.skyColor.value.set(0x23314d).lerp(new THREE.Color(0xb4c7c0),light);}
  if(!this.moon){
   this.moon=new THREE.Mesh(new THREE.SphereGeometry(8,12,8),new THREE.MeshBasicMaterial({color:0xb8c5d7,transparent:true}));this.scene.add(this.moon);
   this.moonLight=new THREE.DirectionalLight(0x8da9e2,.18);this.moonLight.layers.enable(1);this.scene.add(this.moonLight,this.moonLight.target);
   const r=randomSeed(977),p=[];for(let i=0;i<380;i++){const y=.12+r()*.88,a=r()*Math.PI*2,s=Math.sqrt(1-y*y);p.push(Math.cos(a)*s*1080,y*1080,Math.sin(a)*s*1080);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));this.stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xaec5ed,size:1.5,sizeAttenuation:false,transparent:true,depthWrite:false}));this.scene.add(this.stars);
  }
  this.stars.position.copy(this.camera.position);this.moon.material.opacity=1-light;this.stars.material.opacity=(1-light)*.85;
  this.moon.position.copy(this.camera.position).add(new V(-420,650,-460));this.moonLight.position.copy(this.camera.position).add(new V(-40,60,-30));this.moonLight.target.position.copy(this.camera.position);this.moonLight.intensity=(1-light)*.22;
 },
 addTreeChunks(geometry,material,nodes,matrixFor){
  const chunks=new Map();for(const n of nodes){const key=Math.floor(n.x/80)+':'+Math.floor(n.z/80);if(!chunks.has(key))chunks.set(key,[]);chunks.get(key).push(n);}
  for(const bucket of chunks.values()){const batch=new THREE.InstancedMesh(geometry,material,bucket.length);batch.castShadow=true;batch.receiveShadow=true;if(material.userData.depth12)batch.customDepthMaterial=material.userData.depth12;
   bucket.forEach((n,i)=>{const m=matrixFor(n);batch.setMatrixAt(i,m);const shade=randomSeed(this.stringSeed(n.id+'leaf12'))();batch.setColorAt(i,new THREE.Color().setRGB(.86+shade*.14,.88+shade*.12,.83+shade*.15));(n.instances??=[]).push({batch,index:i,matrix:m.clone()});});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();batch.userData.center=batch.boundingSphere.center.clone();this.scene.add(batch);this.treeBatches.push(batch);
  }
 },
 updateTreeVisibility(){const range=this.settings.quality==='low'?210:this.settings.quality==='medium'?420:850;for(const b of this.treeBatches){const c=b.userData.center;if(c)b.visible=Math.hypot(c.x-this.camera.position.x,c.z-this.camera.position.z)<range+60;}},
 makeRiver(){
  if(MAP_REVISION<6&&MAP_SCALE<3)return;const natural=MAP_REVISION>=6,count=natural?Math.min(1600,Math.ceil(528*MAP_SCALE/3)):300,pos=[],indices=[];for(let i=0;i<=count;i++){const z=(natural?-218+i/count*528:-220+i/count*490)*MAP_SCALE,r=riverAt(0,z);for(const side of[-1,1])pos.push(r.x+side*r.width*.5,r.water+.03,z);if(i){const v=i*2;indices.push(v-2,v,v-1,v-1,v,v+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();this.river=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x4f9aaf,roughness:.2,metalness:.15,transparent:true,opacity:.83,side:THREE.DoubleSide}));this.scene.add(this.river);
 },
 vegetationInstances(name,nodes,height,variant21=null){
  if(!nodes.length)return;if(variant21===null&&variedTree21(name)){const groups=Array.from({length:treeVariantCount21(name)},()=>[]);for(const n of nodes)groups[(this.stringSeed(n.id+'species21')>>>0)%groups.length].push(n);groups.forEach((group,i)=>this.vegetationInstances(name,group,height,i));return;}const template=forestTemplate21(this,name,height,variant21)||forestTemplate19(this,name,height)||this.normalized(name,height);height=template.userData.height21||height;template.updateMatrixWorld(true);const meshes=[];template.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const src of meshes){const authored=treeMaterial12(this,src,src.geometry.clone().applyMatrix4(src.matrixWorld),height),geometry=authored.geometry,mat=authored.material;mat.userData.depth12=authored.depth;
   this.addTreeChunks(geometry,mat,nodes,n=>{const r=randomSeed(this.stringSeed(n.id)),s=.74+r()*.45,sy=.70+r()*.60,sz=.78+r()*.43;n.r=.38*s;n.treeHeight21=height*sy;return new THREE.Matrix4().compose(new V(n.x,terrainHeight(n.x,n.z)-.06,n.z),new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),r()*6.28),new V(s,sy,sz));});
  }
 },
 makeBiomeTrees(){
  this.vegetationInstances('PineTree_1',this.nodes.filter(n=>n.type==='tree'&&biomeAt(n.x,n.z).id==='forest'&&n.z< -20*MAP_SCALE),8);
  this.vegetationInstances('PineTree_Snow_1',this.nodes.filter(n=>n.type==='tree'&&biomeAt(n.x,n.z).id==='snow'),8.5);
  this.vegetationInstances('CommonTree_Dead_1',this.nodes.filter(n=>n.type==='tree'&&biomeAt(n.x,n.z).id==='arid'),6.5);
  addCacti18(this);
 },
 async makeGrass(signal,progress){
  const geometry=new THREE.BufferGeometry(),p=[],idx=[];for(let blade=0;blade<9;blade++){const a=blade*2.399,dx=Math.cos(a),dz=Math.sin(a),bx=Math.sin(a)*.19,bz=Math.cos(a)*.19,h=.26+(blade%5)*.085;const at=p.length/3;for(const [y,w,bend]of[[0,.021,0],[h*.55,.012,.07],[h,0,.20]])for(const side of[-1,1])p.push(bx+dx*w*side+dz*bend,y,bz+dz*w*side-dx*bend);idx.push(at,at+1,at+2,at+2,at+1,at+3,at+2,at+3,at+4,at+4,at+3,at+5);}geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setIndex(idx);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:1});const wind={value:0};this.wind=wind;
  material.onBeforeCompile=shader=>{shader.uniforms.windTime=wind;shader.uniforms.grassWind12=visualState12(this).wind;shader.vertexShader='uniform float windTime;uniform vec2 grassWind12;varying float blade12;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 instPos=instanceMatrix*vec4(0.,0.,0.,1.);blade12=clamp(position.y/.45,0.,1.);transformed.xz+=grassWind12*(sin(windTime*1.8+instPos.x*.7+instPos.z*.6)*.11+.035)*blade12*blade12;');shader.fragmentShader='varying float blade12;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(.58,.65,.48),vec3(1.08,1.12,.86),blade12);');};
  const buckets=new Map(),r=randomSeed(7892),count=Math.min(110000,Math.round(90000*MAP_SCALE*MAP_SCALE));let accepted=0;
  for(let i=0;i<count*3&&accepted<count;i++){if(i%4096===0){progress?.(accepted/count*.7);await paintLoading11(signal);}
   const near=false,a=r()*6.28,rad=Math.sqrt(r())*(near?85:310*MAP_SCALE),x=Math.cos(a)*rad,z=Math.sin(a)*rad,h=terrainHeight(x,z),b=biomeAt(x,z);
   if(!grassGround19(this,x,z,h)||r()>Math.max(.015,b.grass)||Math.hypot(x+6,z+3)<6||distanceToRoad(x,z,6)<3.3)continue;
   const key=Math.floor(x/32)+','+Math.floor(z/32);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push({x,z,h,b});accepted++;
  }
  this.grassChunks=[];const dummy=new THREE.Object3D();
  let built11=0;for(const points of buckets.values()){if(built11++%12===0){progress?.(.7+.3*built11/buckets.size);await paintLoading11(signal);}
   const mesh=new THREE.InstancedMesh(geometry,material,points.length);let cx=0,cz=0;
   points.forEach((p,i)=>{dummy.position.set(p.x,p.h-.045,p.z);dummy.quaternion.setFromUnitVectors(new V(0,1,0),new V(-(terrainHeight(dummy.position.x+.2,dummy.position.z)-terrainHeight(dummy.position.x-.2,dummy.position.z))/.4,1,-(terrainHeight(dummy.position.x,dummy.position.z+.2)-terrainHeight(dummy.position.x,dummy.position.z-.2))/.4).normalize()).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),r()*6.28));const s=.65+r()*.8;dummy.scale.set(s,s,s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(p.b.id==='arid'?0xb7ad7a:p.b.id==='snow'?0xa7b49a:0x78934b).multiplyScalar(.92+r()*.20));cx+=p.x;cz+=p.z;});
   mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();this.scene.add(mesh);this.grassChunks.push({mesh,count:points.length,x:cx/points.length,z:cz/points.length});
  }
  this.applyQuality(this.settings.quality);
 },
 streamGrass(){
  const cx=this.camera.position.x,cz=this.camera.position.z;
  const source=this.grassChunks[0]?.mesh;if(!source)return;const count=this.settings.quality==='low'?7000:this.settings.quality==='medium'?12000:18000;
  if(!this.localGrass){this.localGrass=new THREE.InstancedMesh(source.geometry,source.material,24000);this.localGrass.count=0;this.localGrass.receiveShadow=true;this.scene.add(this.localGrass);}
  const mesh=this.localGrass;mesh.visible=true;
  if(!mesh.userData.build){if(Math.hypot(cx-(mesh.userData.x??Infinity),cz-(mesh.userData.z??Infinity))<20&&mesh.userData.quality===this.settings.quality)return;mesh.userData={x:cx,z:cz,quality:this.settings.quality,build:{r:randomSeed(Math.floor(cx/20)*12377^Math.floor(cz/20)*571^9182),n:0,attempts:0,count}};mesh.boundingSphere=new THREE.Sphere(new V(cx,terrainHeight(cx,cz),cz),160);}
  const job=mesh.userData.build,r=job.r,dummy=new THREE.Object3D();
  // Bounded work per RAF avoids a forest/grass regeneration hitch while walking uphill.
  for(let i=0;i<1500&&job.attempts<job.count*4&&job.n<job.count;i++,job.attempts++){const span=this.settings.quality==='low'?56:this.settings.quality==='medium'?68:84,x=mesh.userData.x+(r()-.5)*span,z=mesh.userData.z+(r()-.5)*span,h=terrainHeight(x,z),b=biomeAt(x,z);if(!grassGround19(this,x,z,h)||r()>Math.max(.015,b.grass)||distanceToRoad(x,z,6)<3.3)continue;dummy.position.set(x,h-.045,z);dummy.quaternion.setFromUnitVectors(new V(0,1,0),new V(-(terrainHeight(dummy.position.x+.2,dummy.position.z)-terrainHeight(dummy.position.x-.2,dummy.position.z))/.4,1,-(terrainHeight(dummy.position.x,dummy.position.z+.2)-terrainHeight(dummy.position.x,dummy.position.z-.2))/.4).normalize()).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),r()*6.28));const scale=.65+r()*.8;dummy.scale.setScalar(scale);dummy.updateMatrix();mesh.setMatrixAt(job.n,dummy.matrix);mesh.setColorAt(job.n,new THREE.Color(b.id==='arid'?0xb7ad7a:b.id==='snow'?0xa7b49a:0x78934b));job.n++;}
  mesh.count=job.n;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;if(job.n>=job.count||job.attempts>=job.count*4)delete mesh.userData.build;

 },
 updateGrassVisibility(){
  this.streamGrass();
  const range=this.settings.quality==='low'?48:this.settings.quality==='medium'?75:105;for(const c of this.grassChunks||[])c.mesh.visible=Math.hypot(c.x-this.camera.position.x,c.z-this.camera.position.z)<range+24;}
});}
