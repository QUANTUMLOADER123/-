/** CC0 Quaternius mesh adapter. No loading or renderer on import.
 * Original pack is stylized Modular Sci-Fi Guns, not a scan of a real firearm.
 */
import * as THREE from 'three';
let sources={},textures={};
export function setWeaponSources26(models,t){sources=models;textures=t||{};}
export function sourceWeapon26(id){
 const key=id==='carbine26'?'Carbine26':id==='pdw26'?'Smg26':null,asset=sources[key];if(!asset)return null;
 const root=new THREE.Group(),scene=asset.scene.clone(true);scene.rotation.y=Math.PI/2;scene.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),length=id==='carbine26'?.92:.65,scale=length/Math.max(.001,size.z);
 const gripGeometry=new THREE.BoxGeometry(.065,.16,.07);gripGeometry.translate(0,-.1,-.15);const magazine=new THREE.Mesh(gripGeometry,new THREE.MeshBasicMaterial({visible:false}));root.add(magazine);root.userData.magazine=magazine;root.userData.magazineRest=magazine.position.clone();
 scene.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.scale(scale,scale,scale);geo.translate(-center.x*scale,.09-center.y*scale,-.18-center.z*scale);if(geo.index){const old=geo;geo=geo.toNonIndexed();old.dispose();}const p=geo.attributes.position,n=geo.attributes.normal,uv=[];for(let i=0;i<p.count;i++){const ax=Math.abs(n?.getX(i)||0),ay=Math.abs(n?.getY(i)||0);uv.push((ay>ax?p.getX(i):p.getZ(i))*4,p.getY(i)*4);}geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const mat=o.material.clone(),name=mat.name.toLowerCase(),kind=/black|main/.test(name)?'polymer':'steel';mat.map=textures['items16/'+kind+'-color.webp'];mat.normalMap=textures['items16/'+kind+'-normal.webp'];mat.roughnessMap=textures['items16/'+kind+'-orm.webp'];mat.roughness=.82;mat.metalness=kind==='steel'?.55:.12;mat.color.set(kind==='steel'?0x8d999b:0x3c4642);mat.normalScale?.set(.18,.18);
  const body=[],mag=[];for(let i=0;i<p.count;i+=3){const y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;(o.name.includes('Magazine')||y<-.025&&z<-.045&&z>-.32?mag:body).push(i,i+1,i+2);}
  const make=(indices,parent)=>{if(!indices.length)return;const g=new THREE.BufferGeometry();for(const[k,a]of Object.entries(geo.attributes)){const values=[];for(const i of indices)for(let c=0;c<a.itemSize;c++)values.push(c===0?a.getX(i):c===1?a.getY(i):c===2?a.getZ(i):a.getW(i));g.setAttribute(k,new THREE.Float32BufferAttribute(values,a.itemSize));}const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;parent.add(m);};make(body,root);make(mag,magazine);geo.dispose();
 });
 root.name='weapon26:'+id;root.userData.authored16=true;root.userData.muzzle16=[0,.15,-.18-length/2];root.userData.opticMount16=[0,.29,-.12];root.userData.supportGrip25=new THREE.Vector3(-.052,.015,id==='carbine26'?-.38:-.28);return root;
}
