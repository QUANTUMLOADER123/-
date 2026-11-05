import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed,terrainHeight} from './state.js';
import {biomeAt} from './environment.js';
import {grassGround19} from './ground-cover19.js';
import {treeMaterial12} from './foliage12.js';
const V=THREE.Vector3;
function template(w,flower){
 w.understoryTemplates19??=[];const key=flower?1:0;if(w.understoryTemplates19[key])return w.understoryTemplates19[key];const parts=[],r=randomSeed(1935+key);
 const add=(g,color)=>{g.deleteAttribute('uv');const c=new THREE.Color(color),values=[];for(let i=0;i<g.attributes.position.count;i++)values.push(c.r,c.g,c.b);g.setAttribute('color',new THREE.Float32BufferAttribute(values,3));parts.push(g);};
 const stem=(a,b)=>{const d=b.clone().sub(a),g=new THREE.CylinderGeometry(.003,.006,d.length(),4);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),d.clone().normalize()));g.translate(...a.clone().addScaledVector(d,.5).toArray());add(g,0x526d29);};
 if(flower){
  for(let j=0;j<3;j++){const x=(r()-.5)*.27,z=(r()-.5)*.27,h=.35+r()*.25;stem(new V(x,0,z),new V(x,h,z));for(let i=0;i<6;i++){const g=new THREE.CircleGeometry(.035,5);g.rotateX(-Math.PI/2+.4);g.rotateY(i*Math.PI/3);g.translate(x+Math.cos(i*Math.PI/3)*.035,h,z+Math.sin(i*Math.PI/3)*.035);add(g,0xd9d8ad);}const g=new THREE.SphereGeometry(.018,5,3);g.translate(x,h+.008,z);add(g,0xc5a13c);}
 }else{
  for(let f=0;f<7;f++){
   const a=f*2.399963,len=.38+r()*.2,point=t=>new V(Math.cos(a)*len*t,.08+Math.sin(t*Math.PI*.85)*.32,Math.sin(a)*len*t);
   let prev=new V(0,0,0);for(let k=1;k<=5;k++){const next=point(k/5);stem(prev,next);prev=next;}
   for(let k=1;k<8;k++)for(const side of [-1,1]){const t=k/9,p=point(t),l=(1-t)*.19+.035,d=new V(Math.cos(a+side*1.1),.2,Math.sin(a+side*1.1)).multiplyScalar(l),width=new V(-Math.sin(a),0,Math.cos(a)).multiplyScalar(.016),mid=p.clone().addScaledVector(d,.45),tip=p.clone().add(d),g=new THREE.BufferGeometry(),v=[...p.toArray(),...mid.clone().add(width).toArray(),...tip.toArray(),...mid.clone().sub(width).toArray()];g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(g,k%2?0x668642:0x77934c);}
  }
 }
 const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({name:'LeafUnderstory19',vertexColors:true,side:THREE.DoubleSide,roughness:1}));w.understoryTemplates19[key]=mesh;return mesh;
}
export function addUnderstory19(w,trees){
 const groups=[[],[]];for(const n of trees){const r=randomSeed(w.stringSeed(n.id+'under19'));if(r()>.3)continue;const x=n.x+(r()-.5)*4,z=n.z+(r()-.5)*4,h=terrainHeight(x,z),b=biomeAt(x,z);if(b.id!=='forest'||!grassGround19(w,x,z,h))continue;groups[r()<.15?1:0].push({id:n.id+'-under19',x,z,h});}
 for(let k=0;k<2;k++){if(!groups[k].length)continue;const src=template(w,!!k);w.forestRenderCache40??=new Map();const cacheKey='understory:'+k;let authored=w.forestRenderCache40.get(cacheKey);if(!authored){authored=treeMaterial12(w,src,src.geometry.clone(),.8);authored.geometry.userData.sharedForest40=authored.material.userData.sharedForest40=authored.depth.userData.sharedForest40=true;w.forestRenderCache40.set(cacheKey,authored);}authored.material.userData.depth12=authored.depth;const before=w.treeBatches.length;
  w.addTreeChunks(authored.geometry,authored.material,groups[k],n=>{const r=randomSeed(w.stringSeed(n.id)),s=.8+r()*.5;return new THREE.Matrix4().compose(new V(n.x,n.h-.012,n.z),new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),r()*Math.PI*2),new V(s,s,s));});
  for(const b of w.treeBatches.slice(before)){b.userData.understory19=true;b.castShadow=false;}
 }
}
