import * as THREE from 'three';
import {detailWeapon37} from './weapon-detail37.js';
import {weaponModel33} from './weapon-models33.js';
import {WEAPON_FORMS33} from './weapon-profiles33.js';
/** Salvaged builds reuse the tested canonical moving mechanisms, not factory furniture. */
export function weaponModel34(id,bank,textures={}){
 const original=WEAPON_FORMS33[id],short=['pistol','revolver'].includes(original?.family),form={...original,salvaged:true};
 if(!short&&original?.family!=='launcher')form.stock=['smg','lmg'].includes(form.family)?'wire':'wood';
 if(form.stock==='wood')form.stockShape34=id==='boltRifle'?[[.12,.13],[.24,.18],[.43,.12],[.43,-.064],[.34,-.052],[.21,.015],[.12,.035]]:id==='carbine26'?[[.12,.13],[.22,.15],[.34,.07],[.43,.04],[.43,-.064],[.34,-.052],[.20,.045],[.12,.035]]:id==='semiRifle'?[[.12,.13],[.24,.14],[.43,.10],[.43,-.064],[.35,-.05],[.18,.06],[.12,.035]]:undefined;
 const owned=new Map(),material=(kind,color)=>{const key=kind==='steel'?'steel':kind+':'+color;if(!owned.has(key))owned.set(key,bank(kind==='polymer'?'rust':kind==='rubber'?'cloth':kind,color));return owned.get(key);};
 const m=weaponModel33(id,material,{form,decorate(root,h){
  detailWeapon37(root,h);
  const {p,mesh,box,ring,rod,steel,dark,wood,alloy}=h,u=root.userData,cloth=bank('cloth',0xa39a7c);cloth.roughness=1;
  const wrap=(parent,z,y,r=.046,count=6)=>{for(let i=0;i<count;i++){const loop=mesh(new THREE.TorusGeometry(r,.0045,5,16),cloth,[0,y,z+i*.011],parent);loop.scale.y=.80;loop.rotation.y=(i%2-.5)*.045;}};
  if(short){for(let i=0;i<5;i++){const loop=mesh(new THREE.TorusGeometry(.043,.004,5,16),cloth,[0,-.055-i*.017,.083]);loop.rotation.x=Math.PI/2;loop.scale.set(.80,1,1);}box([.006,.055,.048],[-.036,-.090,.083],wood,.002);}
  else if(p.family==='launcher'){wrap(root,-.39,.145,.098,10);box([.008,.12,.24],[.09,.145,-.68],dark,.002);for(const z of[-.77,-.59])rod([.091,.09,z],[.093,.20,z],.005,alloy);}
  else{
   wrap(u.foregrip14||root,p.guard-.04,.12,.047,p.short?5:8);
   if(p.stock==='wood'){wrap(root,.28,.105,.046,7);const cheek=box([.067,.020,.12],[0,.149,.31],cloth,.006);cheek.rotation.x=.06;}
   else{wrap(root,.27,.14,.040,5);rod([-.04,.09,.37],[.04,.13,.34],.005,cloth);}
   // A physically fitted repair patch, rivets and irregular weld beads at the receiver seam.
   const side=id==='boltRifle'?-1:1,x=side*(p.family==='lmg'?.057:.046);box([.006,.045,.105],[x,.106,-.115],dark,.001);
   for(const z of[-.153,-.077])for(const y of[.093,.12]){const bolt=mesh(new THREE.CylinderGeometry(.005,.005,.008,6),alloy,[x+side*.004,y,z]);bolt.rotation.z=Math.PI/2;}
   for(let i=0;i<9;i++)mesh(new THREE.SphereGeometry(.0034+(i%3)*.0005,5,4),steel,[x+side*.002,.085,-.16+i*.012]);
   for(const z of[p.guard-.10,p.guard+.10]){const strap=ring(.048,[0,.122,z],steel);strap.scale.y=.79;}
  }
  for(const mat of[steel,alloy,dark]){if(textures['field34/steel-color.webp']){mat.map=textures['field34/steel-color.webp'];mat.normalMap=textures['field34/steel-normal.webp'];mat.roughnessMap=mat.metalnessMap=textures['field34/steel-orm.webp'];}mat.color.setHex(mat===dark?0x706d5a:0xb1ada1);mat.roughness=.96;mat.metalness=.32;mat.normalScale?.set(.18,.18);mat.userData.salvaged34=true;}
  if(textures['field34/wood-color.webp']){wood.map=textures['field34/wood-color.webp'];wood.normalMap=textures['field34/wood-normal.webp'];wood.roughnessMap=textures['field34/wood-orm.webp'];}wood.color.setHex(0xbfb7a6);wood.roughness=1;wood.userData.salvaged34=true;
  u.salvage34={woodStock:p.stock==='wood',wireStock:p.stock==='wire',clothWraps:true,weldedPatch:!short&&p.family!=='launcher',sniper:['rifle','boltRifle'].includes(id)};
 }});
 m.name='Salvaged workshop weapon DEV34: '+id;m.userData.modelRevision33=34;m.userData.styleRevision34=34;return m;
}
