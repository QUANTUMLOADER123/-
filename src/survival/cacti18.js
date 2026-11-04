import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {terrainHeight,randomSeed} from './state.js';
import {MAP_SEED,MAP_SCALE,WORLD_RADIUS,MONUMENTS,BOT_BASES,distanceToRoad,riverAt} from './map-data.js';
import {biomeAt} from './environment.js';
const V=THREE.Vector3,UP=new V(0,1,0),park=new THREE.Matrix4().makeScale(.000001,.000001,.000001).setPosition(0,-10000,0);
function cactusGeometry18(variant){
 const parts=[];
 const part=(geometry,color,position=new V(),quaternion=new THREE.Quaternion())=>{
  let g=geometry.index?geometry.toNonIndexed():geometry;if(g!==geometry)geometry.dispose();g.applyQuaternion(quaternion);g.translate(position.x,position.y,position.z);
  const rgb=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=rgb.r;colors[i+1]=rgb.g;colors[i+2]=rgb.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(g);
 };
 const barrel=variant===2,r=barrel?.38:.19,h=barrel?.90:variant===1?2.15:2.8,geo=new THREE.CylinderGeometry(r,r*.92,h,48,10),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.10*Math.cos(a*12);p.setXYZ(i,x*k,p.getY(i),z*k);}geo.computeVertexNormals();part(geo,variant===1?0x617c43:0x4d8057,new V(0,h/2,0));
 part(new THREE.SphereGeometry(r,24,8,0,Math.PI*2,0,Math.PI/2),0x69935a,new V(0,h,0));
 if(!barrel)for(const side of[-1,1]){
  if(variant===1&&side===-1)continue;const y=side<0?h*.43:h*.61,reach=side*(variant===1?.48:.62),end=y+.64;
  const curve=new THREE.CatmullRomCurve3([new V(side*.08,y,0),new V(reach*.72,y+.02,0),new V(reach,y+.20,0),new V(reach,end,0)]);
  part(new THREE.TubeGeometry(curve,20,.115,12,false),0x568558);part(new THREE.SphereGeometry(.115,12,6,0,Math.PI*2,0,Math.PI/2),0x73965e,new V(reach,end,0));
 }
 // Light spine clusters remain part of the single instanced mesh, not objects.
 for(let row=0;row<(barrel?5:10);row++)for(let j=0;j<12;j++){
  const a=j*Math.PI/6+(row%2)*.035,normal=new V(Math.cos(a),.16,Math.sin(a)).normalize(),y=.12+row*(h-.18)/(barrel?5:10),q=new THREE.Quaternion().setFromUnitVectors(UP,normal);
  part(new THREE.ConeGeometry(.006,.055,3),0xd8c9a0,new V(Math.cos(a)*r*1.11,y,Math.sin(a)*r*1.11),q);
 }
 const result=mergeGeometries(parts);parts.forEach(g=>g.dispose());result.computeBoundingBox();return {geometry:result,h:h+r,r};
}
export function addCacti18(w){
 const random=randomSeed(MAP_SEED^0x18cac7),target=Math.min(1300,Math.round(150*MAP_SCALE)),groups=new Map(),templates=[0,1,2].map(cactusGeometry18),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.83}),accepted=new Map();
 const near=(x,z,r)=>{for(let a=Math.floor((x-r)/3);a<=Math.floor((x+r)/3);a++)for(let b=Math.floor((z-r)/3);b<=Math.floor((z+r)/3);b++)for(const p of accepted.get(a+':'+b)||[])if(Math.hypot(x-p.x,z-p.z)<r)return true;return false;};
 let placed=0;w.cacti18=[];
 for(let i=0;i<target*22&&placed<target;i++){
  const x=(random()-.5)*WORLD_RADIUS*2,z=(random()-.5)*WORLD_RADIUS*2,y=terrainHeight(x,z),river=riverAt(x,z);
  if(y<1.1||biomeAt(x,z).id!=='arid'||Math.hypot(x+6,z+3)<40||distanceToRoad(x,z,6)<5||river&&river.distance<river.width*.5+3||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+6)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<13)||(w.entryBuildings18||[]).some(b=>b.hp>0&&Math.hypot(x-b.x,z-b.z)<4.5)||near(x,z,2.6))continue;
  const rise=Math.max(...[[-.45,0],[.45,0],[0,-.45],[0,.45]].map(([a,b])=>Math.abs(terrainHeight(x+a,z+b)-y)));if(rise>.25)continue;
  // Do not put a new cactus inside existing scenery or a mineable rock.
  if(w.colliders.some(c=>Number.isFinite(c.y)&&Math.abs(c.x-x)<(c.w/2||c.r||.5)+.9&&Math.abs(c.z-z)<(c.d/2||c.r||.5)+.9&&c.y+(c.h||2)>y+.1&&c.y<y+3))continue;
  const variant=placed%3,s=.76+random()*.55,yaw=random()*Math.PI*2,key=Math.floor(x/64)+':'+Math.floor(z/64)+':'+variant;
  if(!groups.has(key))groups.set(key,{variant,x:(Math.floor(x/64)+.5)*64,z:(Math.floor(z/64)+.5)*64,list:[]});groups.get(key).list.push({x,z,y,s,yaw,id:'cactus18-'+i});
  const cell=Math.floor(x/3)+':'+Math.floor(z/3);if(!accepted.has(cell))accepted.set(cell,[]);accepted.get(cell).push({x,z});placed++;
 }
 const dummy=new THREE.Object3D();
 for(const batch of groups.values()){
  const template=templates[batch.variant],root=new THREE.Group();root.position.set(batch.x,0,batch.z);root.userData.cactus18=true;w.scene.add(root);w.distantGroups.push({root,x:batch.x,z:batch.z,range:300});const mesh=new THREE.InstancedMesh(template.geometry,material,batch.list.length);root.add(mesh);mesh.castShadow=mesh.receiveShadow=true;
  batch.list.forEach((p,i)=>{dummy.position.set(p.x-batch.x,p.y-.035,p.z-batch.z);dummy.rotation.set(0,p.yaw,0);dummy.scale.setScalar(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);const collider={id:p.id,scenery:true,circle17:true,cactus18:true,x:p.x,z:p.z,y:p.y-.035,r:template.r*p.s,h:template.h*p.s};w.colliders.push(collider);w.cacti18.push({...p,index:i,mesh,alive:true});});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.computeBoundingBox();mesh.updateWorldMatrix(true,false);mesh.userData.worldBounds=mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld);w.occluders.push(mesh);
 }
 w.cactusCount18=placed;delete w.entryBuildings18;
}
export function installCacti18(World){
 const add=World.prototype.addBuilding;World.prototype.addBuilding=function(b){add.call(this,b);const removed=new Set();for(const p of this.cacti18||[])if(p.alive&&Math.hypot(p.x-b.x,p.z-b.z)<4.5){p.alive=false;p.mesh.setMatrixAt(p.index,park);p.mesh.instanceMatrix.needsUpdate=true;removed.add(p.id);}if(removed.size)this.colliders=this.colliders.filter(c=>!removed.has(c.id));};
}
