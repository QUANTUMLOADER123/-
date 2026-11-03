import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {terrainHeight} from './state.js';
import {ROAD_JUNCTIONS10,riverAt} from './map-data.js';
/** Shared elevations for all incident strips; a spatial bucket avoids a graph-wide scan per vertex. */
export function junctions10(w,material){
 const grid=new Map(),discs=[],joints=[];
 for(const p of ROAD_JUNCTIONS10){
  let y=terrainHeight(p.x,p.z);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=p.x+Math.cos(a)*3.9,z=p.z+Math.sin(a)*3.9;y=Math.max(y,terrainHeight(x,z));const r=riverAt(x,z);if(r&&r.distance<r.width/2+3.9)y=Math.max(y,r.water+1.57);}
  joints.push({...p,y:y+.08});
 }
 // Nearby T-junctions share one plateau, not overlapping discs at different heights.
 const groups=joints.map((_,i)=>i),find=i=>groups[i]===i?i:(groups[i]=find(groups[i]));
 for(let i=0;i<joints.length;i++)for(let j=0;j<i;j++)if(Math.hypot(joints[i].x-joints[j].x,joints[i].z-joints[j].z)<8)groups[find(i)]=find(j);
 const levels=new Map();joints.forEach((j,i)=>levels.set(find(i),Math.max(levels.get(find(i))??-Infinity,j.y)));
 for(const [i,joint]of joints.entries()){
  const p=joint;joint.y=levels.get(find(i));
  for(let x=Math.floor((p.x-12)/24);x<=Math.floor((p.x+12)/24);x++)for(let z=Math.floor((p.z-12)/24);z<=Math.floor((p.z+12)/24);z++){
   const k=x+':'+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(joint);
  }
  const g=new THREE.CircleGeometry(3.8,20);g.rotateX(-Math.PI/2);g.translate(p.x,joint.y+.004,p.z);const uv=g.attributes.uv,position=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/2,position.getZ(i)/2);discs.push(g);
  w.walkFloors.push({x:p.x,z:p.z,w:5.2,d:5.2,y:joint.y,road08:true});
 }
 if(discs.length){const mesh=new THREE.Mesh(mergeGeometries(discs),material);mesh.receiveShadow=true;w.scene.add(mesh);discs.forEach(g=>g.dispose());}
 return p=>{
  let best=null,distance=12;
  for(const j of grid.get(Math.floor(p.x/24)+':'+Math.floor(p.z/24))||[]){const d=Math.hypot(p.x-j.x,p.z-j.z);if(d<distance){best=j;distance=d;}}
  if(!best)return;
  const t=Math.max(0,Math.min(1,(distance-3.9)/8.1)),blend=t*t*(3-2*t);
  p.y=best.y*(1-blend)+p.y*blend;p.junction10=distance<7;
 };
}
