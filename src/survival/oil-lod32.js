import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Far silhouette only. Collision, loot and full near rig remain unchanged. */
export function oilLod32(k){
 if(k.m.kind!=='oilrig')return;const large=k.m.id==='oil-large',w=large?36:28,d=large?30:24,count=large?6:4,top=5.2+(count-1)*4,parts=new Map();
 const add=(geometry,material,pos,rotation=null)=>{geometry.translate(...pos);if(!parts.has(material))parts.set(material,[]);parts.get(material).push(geometry.toNonIndexed());geometry.dispose();};
 for(let i=0;i<count;i++)add(new THREE.BoxGeometry(w,.24,d),k.p.rust,[0,5.08+i*4,0]);
 for(const x of[-w/2+1.2,w/2-1.2])for(const z of[-d/2+1.2,d/2-1.2])add(new THREE.CylinderGeometry(.42,.65,top+5,8),k.p.metal,[x,(top-5)/2,z]);
 add(new THREE.BoxGeometry(8,3,6),k.p.cream,[-w/2+7,top+1.5,-d/2+6]);add(new THREE.BoxGeometry(12,.2,12),k.p.metal,[-w/2-11.12,top+3.1,-d/2+7]);
 const derrick=new THREE.CylinderGeometry(.65,3.7,large?20:15,4,1,true);add(derrick,k.p.metal,[3.5,top+(large?10:7.5),-2]);
 const detail=[...k.root.children],proxy=new THREE.Group();proxy.name='Offshore far silhouette32';
 for(const [material,list]of parts){const mesh=new THREE.Mesh(mergeGeometries(list),material);list.forEach(g=>g.dispose());mesh.receiveShadow=true;mesh.castShadow=false;proxy.add(mesh);}
 k.root.add(proxy);proxy.visible=false;k.root.userData.oilLod32={proxy,detail};
}
