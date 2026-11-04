import * as THREE from 'three';
import {MAP_REVISION,MAP_SCALE,MAP_SEED,WORLD_RADIUS,MONUMENTS,BOT_BASES,distanceToRoad,riverAt} from './map-data.js';
import {terrainHeight,randomSeed} from './state.js';
import {pbrMaterial12} from './materials12.js';
/** Decorative, solid rockfields only on new revision-8 islands. Stable old bases
 * never acquire new colliders. Templates are instanced in bounded 80m chunks. */
export function addRockfields17(w){
 if(MAP_REVISION<8)return;const random=randomSeed(MAP_SEED^0x17b01d),material=pbrMaterial12(w,'stone'),templates=[];
 for(let variant=0;variant<4;variant++){
  const geo=new THREE.IcosahedronGeometry(1,MAP_REVISION>=11?2:1),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+(MAP_REVISION>=11?.055:.12)*Math.sin(x*17+z*13+y*11+variant*2.3);p.setXYZ(i,x*k,y*(.92+.06*Math.cos(x*19+variant)),z*k);}
  geo.computeVertexNormals();geo.computeBoundingBox();templates.push(geo);
 }
 const groups=new Map(),count=Math.min(1600,Math.round((MAP_REVISION>=10?450:230)*MAP_SCALE));let placed=0;
 for(let n=0;n<count*6&&placed<count;n++){
  const x=(random()-.5)*WORLD_RADIUS*1.82,z=(random()-.5)*WORLD_RADIUS*1.82,y=terrainHeight(x,z),river=riverAt(x,z),large=random()<.20;
  const rx=large?3+random()*4:.65+random()*1.5,ry=large?(MAP_REVISION>=11?1.6+random()*3:3+random()*7):.6+random()*1.8,rz=rx*(.6+random()*.6);
  if(y<1.7||Math.hypot(x+6,z+3)<45||distanceToRoad(x,z,rx+10)<rx+4||river&&river.distance<river.width*.5+rx+5||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+rx+10)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<rx+13)||(w.entryBuildings18||[]).some(b=>b.hp>0&&Math.hypot(x-b.x,z-b.z)<rx+4.5))continue;
  const variant=placed%4,yaw=random()*Math.PI*2,base=y+ry*.55,co=Math.abs(Math.cos(yaw)),si=Math.abs(Math.sin(yaw)),bounds=templates[variant].boundingBox,size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()).multiply(new THREE.Vector3(rx,ry,rz));center.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
  const ow=size.x*rx,od=size.z*rz,key=Math.floor(x/80)+':'+Math.floor(z/80)+':'+variant;
  if(!groups.has(key))groups.set(key,{variant,cx:(Math.floor(x/80)+.5)*80,cz:(Math.floor(z/80)+.5)*80,instances:[]});groups.get(key).instances.push({x,z,y:base,rx,ry,rz,yaw});
  w.colliders.push({box:true,scenery:true,rock17:true,x:x+center.x,z:z+center.z,y:base+bounds.min.y*ry,h:size.y*ry,w:co*ow+si*od,d:si*ow+co*od,ow,od,rotation:yaw});placed++;
 }
 const dummy=new THREE.Object3D();
 for(const batch of groups.values()){
  const root=new THREE.Group();root.position.set(batch.cx,0,batch.cz);root.userData.rock17=true;w.scene.add(root);w.distantGroups.push({root,x:batch.cx,z:batch.cz,range:420});
  const mesh=new THREE.InstancedMesh(templates[batch.variant],material,batch.instances.length);root.add(mesh);
  batch.instances.forEach((p,i)=>{dummy.position.set(p.x-batch.cx,p.y,p.z-batch.cz);dummy.rotation.set(0,p.yaw,0);dummy.scale.set(p.rx,p.ry,p.rz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.updateWorldMatrix(true,false);mesh.userData.worldBounds=mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld);w.occluders.push(mesh);
 }
 w.rockfieldCount17=placed;
}
