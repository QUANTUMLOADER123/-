import {junctions10} from './junctions10.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {terrainHeight} from './state.js';
import {ROADS,LEGACY_ROADS10,riverAt} from './map-data.js';
import {addRoadCluster} from './world04.js';
const V=THREE.Vector3;
function sampleRoad08(path,width,levelJunction){
  const points=[];
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/2.8);for(let j=0;j<n;j++)points.push({x:a.x+(b.x-a.x)*j/n,z:a.z+(b.z-a.z)*j/n});}points.push({...path.at(-1)});
  points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],d=Math.hypot(b.x-a.x,b.z-a.z)||1;p.nx=-(b.z-a.z)/d;p.nz=(b.x-a.x)/d;p.y=Math.max(...[-1,0,1].map(s=>terrainHeight(p.x+p.nx*width/2*s,p.z+p.nz*width/2*s)))+.08;const river=riverAt(p.x,p.z);p.crossing=river&&river.distance<river.width*.5+width*.6;p.water=river?.water||0;});
  const runs=[];for(let i=0;i<points.length;i++){if(!points[i].crossing)continue;const first=i;while(i+1<points.length&&points[i+1].crossing)i++;runs.push([Math.max(0,first-4),Math.min(points.length-1,i+4)]);}
  // Merge adjacent ramps so a meandering river cannot produce sawtooth bridge decks.
  const merged=[];for(const r of runs){if(merged.length&&r[0]<=merged.at(-1)[1])merged.at(-1)[1]=Math.max(r[1],merged.at(-1)[1]);else merged.push(r);}
  for(const [a,b]of merged){const left=points[a],right=points[b],deck=Math.max(left.y,right.y,...points.slice(a,b+1).map(p=>p.water+1.65));for(let i=a;i<=b;i++){const t=(i-a)/(b-a||1),ramp=Math.min(1,(i-a)/3,(b-i)/3);points[i].y=Math.max(points[i].y,(left.y*(1-t)+right.y*t)*(1-ramp)+deck*ramp);points[i].bridge=true;}}
  points.forEach(levelJunction);
 return points;
}

/** Subdivided, walkable road strips. River crossings are raised bridges, never asphalt in water. */
export function roads08(w,material,paint,metal,concrete){
 const dashes=[],levelJunction=junctions10(w,material);
 for(const [part,path]of Object.entries(ROADS)){
  const width=part==='ring'||part.startsWith('artery-')?6:4.5,points=sampleRoad08(path,width,levelJunction);
  const pos=[],uv=[],idx=[];let distance=0;
  points.forEach((p,i)=>{
   if(i)distance+=Math.hypot(p.x-points[i-1].x,p.z-points[i-1].z);
   for(const side of[-1,1]){pos.push(p.x+p.nx*width*.5*side,p.y,p.z+p.nz*width*.5*side);uv.push((p.x+p.nx*width*.5*side)/2,(p.z+p.nz*width*.5*side)/2);}if(i){const k=i*2;idx.push(k-2,k-1,k,k,k-1,k+1);}
   if(i&&i%3===0){const a=points[i-1],v=[a.x-a.nx*.075,a.y+.012,a.z-a.nz*.075,a.x+a.nx*.075,a.y+.012,a.z+a.nz*.075,p.x-p.nx*.075,p.y+.012,p.z-p.nz*.075,p.x+p.nx*.075,p.y+.012,p.z+p.nz*.075],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();dashes.push(g);}
   if(i){const a=points[i-1],dx=p.x-a.x,dz=p.z-a.z,len=Math.hypot(dx,dz),rotation=Math.atan2(dx,dz),cx=(a.x+p.x)/2,cz=(a.z+p.z)/2,y=(a.y+p.y)/2;
    w.walkFloors.push({x:cx,z:cz,w:Math.abs(Math.cos(rotation))*width+Math.abs(Math.sin(rotation))*len,d:Math.abs(Math.sin(rotation))*width+Math.abs(Math.cos(rotation))*len,ow:width,od:len+.04,rotation,y,road08:true,slope08:{x:a.x,z:a.z,y:a.y,dx,dz,dy:p.y-a.y,len2:len*len}});
    if(p.bridge&&a.bridge){const root=new THREE.Group();root.position.set(cx,y-.15,cz);root.rotation.set(-Math.atan2(p.y-a.y,len),rotation,0,'YXZ');w.scene.add(root);w.distantGroups.push({root,x:cx,z:cz,range:260});const deck=new THREE.Mesh(new THREE.BoxGeometry(width,.25,len+.04),concrete);deck.receiveShadow=true;root.add(deck);w.colliders.push({box:true,x:cx,z:cz,w:Math.abs(Math.cos(rotation))*width+Math.abs(Math.sin(rotation))*len,d:Math.abs(Math.sin(rotation))*width+Math.abs(Math.cos(rotation))*len,ow:width,od:len+.04,rotation,y:Math.min(a.y,p.y)-.3,h:Math.abs(p.y-a.y)+.3,deck08:true,slope08:{x:a.x,z:a.z,y:a.y,dx,dz,dy:p.y-a.y,len2:len*len},scenery:true});
     for(const side of(p.junction10||a.junction10?[]:[-1,1])){const rail=new THREE.Mesh(new THREE.BoxGeometry(.10,.10,len+.04),metal);rail.position.set(side*(width/2+.08),1.13,0);root.add(rail);const post=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,1.2,8),metal);post.position.set(side*(width/2+.08),.6,0);root.add(post);const rx=cx+Math.cos(rotation)*side*(width/2+.08),rz=cz-Math.sin(rotation)*side*(width/2+.08);w.colliders.push({box:true,x:rx,z:rz,w:Math.abs(Math.cos(rotation))*.12+Math.abs(Math.sin(rotation))*len,d:Math.abs(Math.sin(rotation))*.12+Math.abs(Math.cos(rotation))*len,ow:.12,od:len+.04,rotation,y:y+.05,h:1.2,scenery:true});}
     if(i%4===0){const base=terrainHeight(cx,cz),h=Math.max(.3,y-base-.3),pier=new THREE.Mesh(new THREE.CylinderGeometry(.36,.5,h,10),concrete);pier.position.y=-h/2-.15;root.add(pier);}
    }
   }
   if(!LEGACY_ROADS10[part]&&!p.bridge&&!p.junction10&&i%85===18&&terrainHeight(p.x,p.z)>p.water+.5)addRoadCluster(w,p.x+p.nx*(width/2+6),p.z+p.nz*(width/2+6),'road-'+part+'-'+i,Math.atan2(p.nz,-p.nx));
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;w.scene.add(mesh);
 }
 // Keep old road-cluster IDs AND positions independent of newly inserted T-junction vertices.
 for(const [part,path]of Object.entries(LEGACY_ROADS10)){const width=part==='ring'||part.startsWith('artery-')?6:4.5;sampleRoad08(path,width,levelJunction).forEach((p,i)=>{if(!p.bridge&&i%85===18&&terrainHeight(p.x,p.z)>p.water+.5)addRoadCluster(w,p.x+p.nx*(width/2+6),p.z+p.nz*(width/2+6),'road-'+part+'-'+i,Math.atan2(p.nz,-p.nx));});}
 if(dashes.length){w.scene.add(new THREE.Mesh(mergeGeometries(dashes),paint));dashes.forEach(g=>g.dispose());}
}
export function floorContains08(f,x,z,padding=0){const dx=x-f.x,dz=z-f.z;if(f.ow){const c=Math.cos(f.rotation||0),s=Math.sin(f.rotation||0);return Math.abs(dx*c-dz*s)<f.ow/2+padding&&Math.abs(dx*s+dz*c)<f.od/2+padding;}return Math.abs(dx)<f.w/2+padding&&Math.abs(dz)<f.d/2+padding;}
export function floorY08(f,x,z){const a=f.slope08;if(!a)return f.y;const t=Math.max(0,Math.min(1,((x-a.x)*a.dx+(z-a.z)*a.dz)/a.len2));return a.y+t*a.dy;}
