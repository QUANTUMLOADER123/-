import {forestTemplate21,variedTree21,treeVariantCount21} from './forest21.js';
import {forestTemplate19} from './forest19.js';
import {addCacti18} from './cacti18.js';
import {treeMaterial12} from './foliage12.js';
import * as THREE from 'three';
import {terrainHeight,randomSeed} from './state.js';
import {MAP_SCALE,MAP_REVISION,riverAt} from './map-data.js';
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
});}
