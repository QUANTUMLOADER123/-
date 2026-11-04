import {GUNS29,GUN_TEXTURES29} from './weapon-profiles29.js';
import {detailWeapon29} from './weapons29.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export const ITEM_KINDS16=['steel','wood','polymer','cloth','rust','paint','rubber','brass','organic'];
export const ITEM_FILES16=[...ITEM_KINDS16.flatMap(k=>['color','normal','orm'].map(s=>`items16/${k}-${s}.webp`)),...GUN_TEXTURES29];
let textures={};
export function itemBank16(){return textures;}
export function itemTextures16(t){textures=t;}
export function material16(kind,color=0xffffff){
 const p=`items16/${kind}-`,m=new THREE.MeshStandardMaterial({name:`Item16:${kind}`,color,map:textures[p+'color.webp'],normalMap:textures[p+'normal.webp'],roughnessMap:textures[p+'orm.webp'],metalnessMap:textures[p+'orm.webp'],roughness:1,metalness:['steel','brass'].includes(kind)?1:kind==='rust'?.2:0});
 m.normalScale.set(.28,.28);m.userData.item16=kind;return m;
}
function add(g,geo,mat,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);g.add(m);return m;}
function round(g,size,pos,mat,r=.006){return add(g,new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(x=>x*.22))),mat,pos);}
/** Bevelled extruded side silhouette. Canonical coordinates: +Z stock, -Z muzzle, +Y rail. */
function side(g,points,width,mat){
 const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(-z,y))),bevel=Math.min(.004,width*.12);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:width-2*bevel,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});
 geo.rotateY(Math.PI/2);geo.translate(-width/2+bevel,0,0);return add(g,geo,mat);
}
function tube(g,r,len,pos,mat,open=false){const m=add(g,new THREE.CylinderGeometry(r,r,len,20,1,open),mat,pos);m.rotation.x=Math.PI/2;return m;}
function ring(g,r,t,pos,mat){return add(g,new THREE.TorusGeometry(r,t,6,24),mat,pos);}
function barrel(g,r,start,end,y,mat,black){
 g.userData.muzzle16=[0,y,end-.012];
 tube(g,r,start-end,[0,y,(start+end)/2],mat,true);ring(g,r*.90,r*.10,[0,y,end],mat);
 tube(g,r*.83,.07,[0,y,end+.035],black,true);add(g,new THREE.CircleGeometry(r*.83,20),black,[0,y,end+.071]);
}
function mergeStatic16(root,keep=new Set()){
 const groups=new Map();for(const m of [...root.children]){if(!m.isMesh||keep.has(m)||m.children.length)continue;m.updateMatrix();let geo=m.geometry.clone().applyMatrix4(m.matrix);if(geo.index){const old=geo;geo=old.toNonIndexed();old.dispose();}if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(geo);m.geometry.dispose();root.remove(m);}
 for(const [material,list]of groups){const geo=mergeGeometries(list);list.forEach(g=>g.dispose());root.add(new THREE.Mesh(geo,material));}
}
function trigger(g,steel,z=.025){
 const path=new THREE.CatmullRomCurve3([[0,.005,z+.07],[0,-.08,z+.07],[0,-.10,z-.025],[0,-.045,z-.065],[0,.018,z-.065]].map(a=>new THREE.Vector3(...a)));
 add(g,new THREE.TubeGeometry(path,16,.005,6,false),steel);
 const t=round(g,[.012,.044,.009],[0,-.025,z-.012],steel,.003);t.rotation.x=-.3;
}
function stock(g,wood,black,short=false){
 const end=short?.30:.42;
 side(g,[[.10,.16],[.21,.18],[end,.11],[end,-.045],[.31,-.02],[.15,.055]],.073,wood);
 round(g,[.083,.15,.022],[0,.037,end+.008],black,.009);
}
function grip(g,mat,pistol=false){
 return side(g,[[.064,.085],[-.023,.065],[pistol?.016:.035,-.17],[pistol?.103:.12,-.18]],.064,mat);
}
function magazine(g,mat,curved=false,short=false){
 const points=curved?[[-.105,.075],[-.195,.075],[-.195,-.07],[-.23,-.18],[-.285,-.27],[-.205,-.30],[-.15,-.20],[-.115,-.08]]:[[-.11,.06],[-.20,.06],[-.19,short?-.17:-.26],[-.105,short?-.18:-.27]];
 const mag=side(g,points,.064,mat);g.userData.magazine=mag;g.userData.magazineRest=mag.position.clone();
 // Ribbing is attached to the magazine so it travels with the reload animation.
 for(const x of[-.034,.034])for(let i=0;i<3;i++){const rib=round(mag,[.006,short?.13:.20,.005],[x,-.085,-.126-i*.02],mat,.001);if(curved)rib.rotation.x=.20;}
 return mag;
}
export function weaponModel16(id){
 const profile29=GUNS29[id];
 const g=new THREE.Group();g.name=`weapon16:${id}`;g.userData.authored16=true;
 const steel=material16('steel'),black=material16('polymer'),wood=material16('wood'),rubber=material16('rubber'),paint=material16('paint');
 if(textures['weapons29/'+id+'-color.webp'])steel.map=textures['weapons29/'+id+'-color.webp'];
 const pistol=['pistol','heavyPistol','revolver'].includes(id),long=['rifle','boltRifle','semiRifle','carbine26'].includes(id),smg=['smg','compactSmg','pdw26'].includes(id),ak=id==='akRifle',shot=['shotgun','combatShotgun'].includes(id),mg=id==='machineGun';
 if(id==='rocketLauncher'){
  g.userData.muzzle16=[0,.14,-.98];
  barrel(g,.105,.28,-.98,.14,paint,black);for(const z of[-.97,-.62,-.16,.24])ring(g,.107,.012,[0,.14,z],black);
  grip(g,black);side(g,[[-.30,.10],[-.50,.10],[-.48,.03],[-.31,.03]],.10,rubber);
  round(g,[.13,.05,.32],[0,.25,-.50],steel);g.userData.opticMount16=[0,.4005,-.5];
  trigger(g,steel);g.userData.foregrip14=round(g,[.09,.04,.2],[0,.06,-.43],rubber);
 }else if(pistol){
  g.userData.muzzle16=[0,.151,id==='revolver'?-.37:id==='heavyPistol'?-.34:-.30];
  grip(g,id==='revolver'?wood:black,true);
  side(g,[[.10,.085],[.10,.16],[-.20,.16],[-.26,.09],[-.19,.04],[-.025,.04]],.067,steel);
  if(id==='revolver'){
   const cyl=tube(g,.061,.095,[0,.126,-.09],steel);g.userData.cylinder14=cyl;
   for(let i=0;i<6;i++){const a=i*Math.PI/3;const flute=tube(cyl,.012,.09,[Math.cos(a)*.05,0,0],black);flute.rotation.x=0;flute.position.set(Math.cos(a)*.05,0,Math.sin(a)*.05);}
   barrel(g,.024,-.14,-.37,.14,steel,black);
  }else{
   const slide=side(g,[[.09,.115],[.09,.202],[-.27,.202],[-.29,.15],[-.26,.115]],.073,steel);g.userData.slide14=slide;
   for(const x of[-.04,.04])for(let i=0;i<5;i++)round(slide,[.003,.044,.004],[x,.166,.012+i*.012],black,.001);
   barrel(g,.017,-.15,id==='heavyPistol'?-.34:-.30,.151,steel,black);
   const mag=side(g,[[.015,.02],[.075,.02],[.103,-.18],[.033,-.18]],.045,black);g.userData.magazine=mag;
  }
  trigger(g,steel);const rail=round(g,[.074,.018,.078],[0,.215,-.09],black);if(g.userData.slide14){g.remove(rail);g.userData.slide14.add(rail);}g.userData.opticMount16=[0,.2915,-.09];
 }else{
  side(g,profile29?.receiver||[[.11,.08],[.10,.205],[-.22,.205],[-.27,.13],[-.23,.065],[-.035,.04]],profile29?.width||.082,steel);
  grip(g,ak?wood:black);trigger(g,steel);
  if(long||ak||shot)stock(g,wood,rubber);else if(id==='compactSmg'){
   for(const x of[-.035,.035]){const rail=tube(g,.008,.29,[x,.13,.235],steel);rail.rotation.x=Math.PI/2;}
   round(g,[.09,.14,.025],[0,.077,.39],rubber);
  }else stock(g,black,rubber,smg);
  const end=profile29?.end||-.75;
  g.userData.muzzle16=[0,.146,end];barrel(g,shot?.029:mg?.023:.019,-.22,end,.146,steel,black);
  const foreStart=smg?-.20:-.23,foreEnd=smg?-.37:shot?-.56:-.48;
  const fore=side(g,[[foreStart,.075],[foreStart,.19],[foreEnd,.177],[foreEnd-.025,.09]],.087,ak||long||id==='shotgun'?wood:black);g.userData.foregrip14=fore;
  for(const x of[-.047,.047])for(let i=0;i<5;i++)round(fore,[.004,.027,.012],[x,.134,foreStart-.035-i*.031],black,.002);
  if(id==='shotgun'){tube(g,.019,.52,[0,.087,-.48],steel);}
  else if(!['rifle','boltRifle'].includes(id))magazine(g,ak?steel:black,ak,smg);
  if(long){const bolt=tube(g,.009,.11,[.09,.14,-.01],steel);bolt.rotation.set(0,0,Math.PI/2);g.userData.bolt14=bolt;add(bolt,new THREE.SphereGeometry(.016,10,8),black,[0,.058,0]);}
  else g.userData.bolt14=round(g,[.02,.023,.045],[.055,.139,-.07],steel);
  if(mg){g.userData.feedBox14=round(g,[.17,.18,.19],[0,-.01,-.17],paint,.018);for(const x of[-.07,.07]){const leg=round(g,[.016,.27,.018],[x,-.015,-.62],steel);leg.rotation.z=x<0?-.3:.3;}}
  const muzzleCollar=ring(g,shot?.030:.025,.004,[0,.146,end+.05],steel);muzzleCollar.name='MuzzleCollar16';
  round(g,[.08,.022,.17],[0,.213,-.10],black);for(let i=0;i<6;i++)round(g,[.088,.008,.009],[0,.228,-.17+i*.025],steel,.001);
  g.userData.opticMount16=[0,.3005,-.10];
  // Front sight is lower than the holographic window's central line.
  round(g,[.014,.055,.016],[0,.18,end+.09],steel);ring(g,.018,.003,[0,.217,end+.09],steel);
 }
 // DEV25: original field-repaired silhouettes: stamped covers, rivets and bindings.
 if(id!=='rocketLauncher'){
  const worn=material16('rust',0x8c806b),binding=material16('cloth',ak?0xa99366:0x6f7758);
  for(const side25 of [-1,1])for(const z of [-.15,-.03,.065]){const rivet=add(g,new THREE.SphereGeometry(.0055,6,4),steel,[side25*(pistol?.04:.045),pistol?.137:.155,z]);rivet.scale.x=.45;}
  if(!pistol){side(g,[[-.21,.205],[-.18,.237],[.07,.237],[.105,.205]],.078,black);for(const z of [-.35,-.29]){const wrap=ring(g,.050,.006,[0,.128,z],binding);wrap.scale.x=1.05;wrap.scale.y=.86;}
   if(id==='rifle'){tube(g,.037,.28,[0,.17,-.075],worn).rotation.x=Math.PI/2;for(const z of [-.19,.03])ring(g,.039,.006,[0,.17,z],steel);}
   if(smg){const cover=tube(g,.036,.21,[0,.174,-.13],worn);cover.rotation.x=Math.PI/2;}
   if(g.userData.foregrip14){const f=g.userData.foregrip14;f.geometry.computeBoundingBox();const b=f.geometry.boundingBox;g.userData.supportGrip25=new THREE.Vector3(-.052,b.min.y-.025,(b.min.z+b.max.z)/2+.035);}
  }
 }
 detailWeapon29(g,id,{steel,wood,black,rubber});
 const moving=new Set(['magazine','slide14','foregrip14','bolt14','feedBox14','cylinder14'].map(k=>g.userData[k]).filter(Boolean));for(const part of moving)mergeStatic16(part);mergeStatic16(g,moving);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;
}
export function toolModel16(id){
 const g=new THREE.Group(),wood=material16('wood'),steel=material16('steel'),cloth=material16('cloth');g.name=`tool16:${id}`;
 const len=id==='hammer'?.48:.72;
 const shaft=add(g,new THREE.CylinderGeometry(.021,.028,len-.12,16),wood,[0,(len-.12)/2,0]);shaft.material.name='WoodHandle14';
 for(let i=0;i<9;i++){const wrap=add(g,new THREE.TorusGeometry(.028,.0025,4,16),cloth,[0,.06+i*.012,0]);wrap.rotation.x=Math.PI/2;}
 if(id==='axe'){
  // Widening forged blade, bevelled cutting edge, eye around the shaft.
  const shape=new THREE.Shape([[-.025,.52],[.10,.54],[.20,.49],[.22,.64],[.12,.66],[-.025,.62]].map(([x,y])=>new THREE.Vector2(x,y)));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:2,steps:1});geo.translate(0,0,-.0125);add(g,geo,steel);
  round(g,[.072,.12,.062],[0,.578,0],steel);
 }else if(id==='pickaxe'){
  const curve=new THREE.CatmullRomCurve3([[-.25,.50,0],[-.15,.60,0],[0,.63,0],[.15,.59,0],[.25,.51,0]].map(a=>new THREE.Vector3(...a)));
  const geo=new THREE.TubeGeometry(curve,24,.027,8,false),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),t=Math.max(.10,1-Math.pow(Math.abs(x)/.27,2));p.setZ(i,p.getZ(i)*t);}geo.computeVertexNormals();add(g,geo,steel);
  round(g,[.075,.09,.07],[0,.60,0],steel);
 }else round(g,[.21,.11,.095],[0,.425,0],steel,.012);
 g.userData.rightGrip16=new THREE.Vector3(.068,.11,.055);
 if(id!=='hammer')g.userData.supportGrip16=new THREE.Vector3(-.064,.29,.045);
 mergeStatic16(g);return g;
}
export function medicalModel16(id){
 const g=new THREE.Group(),cloth=material16('cloth'),steel=material16('steel'),paint=material16('paint');
 const red=new THREE.MeshStandardMaterial({color:0xb53e31,roughness:.7});
 if(id==='syringe'){
  const barrelMat=new THREE.MeshStandardMaterial({color:0xdbe2d4,roughness:.24,transparent:true,opacity:.72});
  add(g,new THREE.CylinderGeometry(.022,.022,.115,20),barrelMat,[0,.08,0]);
  add(g,new THREE.CylinderGeometry(.012,.012,.07,12),red,[0,.08,0]);
  add(g,new THREE.CylinderGeometry(.009,.009,.065,12),steel,[0,.16,0]);round(g,[.065,.009,.025],[0,.194,0],paint,.003);
  round(g,[.075,.008,.025],[0,.138,0],steel,.002);
  add(g,new THREE.CylinderGeometry(.002,.002,.055,8),steel,[0,-.012,0]);
  for(let i=0;i<5;i++)round(g,[.015,.0015,.003],[.008,.055+i*.015,.022],paint,.0003);
 }else if(id==='antiseptic'){
  add(g,new THREE.CylinderGeometry(.04,.043,.13,20),paint,[0,.065,0]);add(g,new THREE.CylinderGeometry(.026,.026,.035,16),steel,[0,.147,0]);round(g,[.078,.065,.007],[0,.075,.04],cloth);
 }else{
  const trauma=id==='traumaKit';round(g,trauma?[.26,.19,.11]:[.22,.15,.09],[0,.09,0],cloth,.025);
  round(g,[.045,.085,.006],[0,.09,.059],red);round(g,[.09,.032,.006],[0,.09,.060],red);
  for(const x of[-.083,.083])round(g,[.017,.16,.10],[x,.09,0],paint,.003);
 }
 g.userData.authored16=true;return g;
}
/** Factory replacement only: DEV14 remains the sole per-frame pose/IK owner. */
export function installItems16(World){
 const makeBase=World.prototype.makeViewModel,icon=World.prototype.iconModel04,dispose=World.prototype.dispose;
 World.prototype.dispose=function(){const old=this.textures;dispose.call(this);if(textures===old)itemTextures16({});};
 World.prototype.makeViewModel=function(){makeBase.call(this);for(const [id,key]of [['axe','heldAxe'],['pickaxe','heldPickaxe'],['hammer','heldHammer']]){
  const old=this[key],m=toolModel16(id);m.position.copy(old.position);m.visible=false;m.traverse(o=>{o.layers.set(1);o.castShadow=false;o.receiveShadow=false;});old.removeFromParent();this.handRoot.add(m);this[key]=m;
 }this.heldSatchel.material=material16('cloth');this.heldTorch.traverse(o=>{if(!o.isMesh||o===this.torchFlame)return;o.material=material16(o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.height>.3?'wood':'cloth');});};
 World.prototype.iconModel04=function(id){if(['axe','pickaxe','hammer'].includes(id))return toolModel16(id);if(['syringe','medkit','antiseptic','traumaKit'].includes(id))return medicalModel16(id);return icon.call(this,id);};
}
