import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {surface05} from './surface05.js';
/** Original supply container: slatted pallet, folded fabric, stitched webbing
 * and metal buckles. No borrowed Rust model, texture or branding. */
export function supplyCrate19(elite=false){
 const root=new THREE.Group(),wood=new THREE.MeshStandardMaterial({map:surface05('wood'),color:0xc4ac7b,roughness:.95}),cloth=new THREE.MeshStandardMaterial({map:surface05('cloth'),color:elite?0x60715b:0x81825a,roughness:1,side:THREE.DoubleSide}),strap=new THREE.MeshStandardMaterial({map:surface05('cloth'),color:0x44452f,roughness:1}),metal=new THREE.MeshStandardMaterial({map:surface05('metal'),color:0xb3b5a1,roughness:.68,metalness:.65});
 const box=(size,pos,mat)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(...size,1,.008),mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;root.add(m);return m;};
 for(const x of[-.4,.4])box([.13,.12,.78],[x,.06,0],wood);
 for(let i=0;i<7;i++)box([.145,.56,.69],[-.45+i*.15,.40,0],wood);
 for(const z of[-.37,.37])for(const y of[.16,.60])box([1.08,.055,.06],[0,y,z],wood);
 const top=new THREE.PlaneGeometry(1.14,.84,12,10);top.rotateX(-Math.PI/2);const p=top.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,.72+.065*Math.cos(x*2.5)*Math.cos(z*3)+.012*Math.sin(x*32+z*21));}top.computeVertexNormals();const cover=new THREE.Mesh(top,cloth);cover.castShadow=cover.receiveShadow=true;root.add(cover);
 for(let side=0;side<4;side++){
  const width=side%2?.84:1.14,g=new THREE.PlaneGeometry(width,.43,12,5),a=g.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),t=(y+.215)/.43;a.setZ(i,.015*Math.sin(x*29+side)*(.3+t));a.setY(i,y+.535+.015*Math.sin(x*18+side)*(1-t));}g.computeVertexNormals();const m=new THREE.Mesh(g,cloth);m.rotation.y=side*Math.PI/2;m.position.set(Math.sin(m.rotation.y)*.57,0,Math.cos(m.rotation.y)*.42);root.add(m);m.castShadow=m.receiveShadow=true;
 }
 for(const x of[-.34,.34]){box([.047,.02,.87],[x,.797,0],strap);for(const z of[-.431,.431]){box([.047,.61,.018],[x,.48,z],strap);box([.077,.095,.025],[x,.52,z*1.025],metal);box([.039,.056,.028],[x,.52,z*1.055],strap);}}
 for(const x of[-.52,.52])for(const z of[-.355,.355]){const m=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),metal);m.position.set(x,.61,z);root.add(m);}
 const groups=new Map();for(const m of [...root.children]){m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(g);m.geometry.dispose();m.removeFromParent();}
 for(const [mat,parts]of groups){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;root.add(m);}
 return root;
}
