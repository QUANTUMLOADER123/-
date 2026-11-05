import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {WEAPON_FORMS33,grips33} from './weapon-profiles33.js';
const V=THREE.Vector3,Y=new V(0,1,0);
/** Authored service-weapon geometry. Moving mechanisms retain their own mesh. */
export function weaponModel33(id,bank,options={}){
 const p=options.form||WEAPON_FORMS33[id];if(!p)throw new Error('Missing weapon form '+id);const root=new THREE.Group(),u=root.userData;root.name='Service weapon DEV33: '+id;u.authored16=true;u.modelRevision33=33;
 const steel=bank('steel',0x75818a),dark=bank('polymer',0x333c40),wood=bank('wood',0x8e7458),rubber=bank('rubber',0x29302e),alloy=bank('steel',0xaab3b5),brass=bank('brass',0xc1a36c),black=new THREE.MeshStandardMaterial({color:0x101516,roughness:.92});steel.roughness=.72;steel.metalness=.62;alloy.roughness=.46;alloy.metalness=.72;
 const mesh=(geo,mat,pos=[0,0,0],parent=root)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const box=(size,pos,mat=steel,r=.004,parent=root)=>mesh(new RoundedBoxGeometry(...size,1,Math.min(r,...size.map(v=>v*.2))),mat,pos,parent);
 const slab=(points,width,mat=steel,parent=root,holes=[])=>{const s=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(-z,y)));for(const points of holes){const h=new THREE.Path(points.map(([z,y])=>new THREE.Vector2(-z,y)));s.holes.push(h);}const g=new THREE.ExtrudeGeometry(s,{depth:width-.004,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1,steps:1,curveSegments:6});g.rotateY(Math.PI/2);g.translate(-width/2+.002,0,0);return mesh(g,mat,[0,0,0],parent);};
 const tube=(r,len,pos,mat=steel,open=false,parent=root,sides=16)=>{const m=mesh(new THREE.CylinderGeometry(r,r,len,sides,1,open),mat,pos,parent);m.rotation.x=Math.PI/2;return m;};
 const ring=(r,pos,mat=steel,parent=root)=>mesh(new THREE.TorusGeometry(r,.0035,5,16),mat,pos,parent);
 const rod=(a,b,r=.006,mat=steel)=>{a=new V(...a);b=new V(...b);const d=b.clone().sub(a),m=mesh(new THREE.CylinderGeometry(r,r,d.length(),8),mat,a.clone().add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(Y,d.normalize());return m;};
 const barrel=(end,start=-.24,r=.016,y=.15)=>{tube(r,start-end,[0,y,(start+end)/2],steel,true);ring(r,[0,y,end],alloy);const bore=mesh(new THREE.CircleGeometry(r*.72,16),black,[0,y,end+.018]);bore.rotation.y=Math.PI;u.muzzle16=[0,y,end-.005];};
 const screw=(x,y,z,parent=root)=>{const m=tube(.004,.003,[x,y,z],alloy,false,parent,8);m.rotation.set(0,0,Math.PI/2);return m;};
 const grip=(pistol=false)=>{slab([[.12,.025],[.045,.035],[.023,-.162],[.103,-.178],[.141,-.145]],.060,p.stock==='wood'||p.family==='revolver'?wood:dark);for(const side of[-1,1]){box([.004,.115,.052],[side*.032,-.095,.082],rubber,.005);screw(side*.035,-.055,.081);screw(side*.035,-.135,.081);}if(pistol)box([.071,.014,.078],[0,-.173,.079],dark);};
 const trigger=()=>{const path=new THREE.CatmullRomCurve3([[0,.026,.042],[0,-.046,.052],[0,-.058,-.039],[0,-.020,-.067],[0,.035,-.067]].map(a=>new V(...a)));mesh(new THREE.TubeGeometry(path,16,.0045,6,false),dark);const t=box([.009,.034,.012],[0,-.006,-.018],alloy,.002);t.rotation.x=-.35;};
 const stock=()=>{if(p.stock==='wire'){for(const x of[-.034,.034])rod([x,.15,.10],[x,.14,.36],.007,dark);rod([-.034,.14,.36],[.034,.14,.36],.009,rubber);rod([0,.14,.36],[0,.015,.36],.011,rubber);return;}if(p.stock==='wood'){slab(p.stockShape34||[[.12,.13],[.24,.15],[.43,.08],[.43,-.064],[.34,-.052],[.19,.035],[.12,.035]],.076,wood);box([.080,.15,.018],[0,.012,.438],rubber,.008);return;}tube(.023,.22,[0,.145,.22],dark);slab([[.20,.16],[.39,.18],[.44,.145],[.44,-.025],[.38,-.04],[.30,.05],[.21,.06]],.075,dark);box([.082,.19,.025],[0,.066,.448],rubber,.008);box([.080,.025,.17],[0,.183,.32],p.stock==='precision'?rubber:dark);if(p.stock==='precision')box([.071,.050,.16],[0,.216,.31],rubber);};
 const magazine=(curved=false,small=false)=>{const z=p.family==='smg'?-.09:-.13,depth=p.family==='shotgun'?.10:.077,length=small?.15:p.family==='smg'?.22:.245;let points=curved?[[z+.04,.06],[z-.04,.06],[z-.045,-.08],[z-.10,-.23],[z-.025,-.27],[z+.035,-.13]]:[[z+depth/2,.055],[z-depth/2,.055],[z-depth/2-.008,-length],[z+depth/2-.008,-length]];const mag=slab(points,.054,p.curved?steel:dark);u.magazine=mag;for(const side of[-1,1])for(let j=0;j<3;j++)box([.004,length*.68,.007],[side*.029,-length*.42,z-.025+j*.023],p.curved?dark:steel,.001,mag);return mag;};
 if(p.family==='launcher'){
  tube(.089,1.30,[0,.145,-.39],dark,true);for(const z of[-1.035,-.72,-.15,.24])ring(.091,[0,.145,z],steel);const lining=tube(.073,.1,[0,.145,-.99],black,true);u.muzzle16=[0,.145,-1.045];grip();trigger();box([.10,.15,.27],[0,.085,-.41],rubber,.014);slab([[-.12,.22],[-.12,.34],[-.36,.34],[-.39,.23]],.028,steel);u.receiverTop32=.34;u.opticMount16=[0,.42,-.24];
 }else if(p.family==='pistol'){
  grip(true);trigger();u.lowerParts40=id==='pistol'?new Set(root.children):null;slab([[.135,.055],[.13,.15],[-.27,.15],[-.27,.073],[.025,.03]],.069,dark);const slide=slab([[.12,.13],[.12,.209],[p.end+.018,.209],[p.end-.002,.179],[p.end+.01,.126]],p.heavy?.081:.073,steel);u.slide14=slide;
  for(const side of[-1,1])for(let j=0;j<6;j++)box([.003,.034,.004],[side*(p.heavy?.042:.038),.17,.032+j*.010],dark,.001,slide);
  box([.003,.035,.066],[.039,.178,-.12],black,.003,slide);box([.004,.012,.030],[.041,.169,-.115],alloy,.002,slide);barrel(p.end,-.16,p.heavy?.021:.016,.158);const mag=box([.045,.11,.058],[0,-.105,.079],dark,.004);u.magazine=mag;const base=box([.067,.012,.071],[0,-.165,.078],dark,.003,mag);base.position.sub(mag.position);u.receiverTop32=.211;u.opticMount16=[0,.29,-.09];
 }else if(p.family==='revolver'){
  grip(true);trigger();slab([[.14,.045],[.14,.17],[-.21,.17],[-.24,.10],[-.14,.026],[.035,.015]],.062,steel);
  const cyl=tube(.060,.112,[0,.123,-.095],steel,false);u.cylinder14=cyl;for(let i=0;i<6;i++){const a=i*Math.PI/3;const flute=tube(.014,.09,[Math.cos(a)*.051,.123+Math.sin(a)*.051,-.095],dark,true);cyl.attach(flute);}barrel(p.end,-.16,.023,.142);box([.044,.013,.24],[0,.172,-.285],steel,.003);slab([[.135,.148],[.15,.186],[.126,.193],[.102,.163]],.015,dark);box([.021,.012,.031],[-.038,.09,.015],alloy,.002);u.receiverTop32=.184;u.opticMount16=[0,.27,-.07];
 }else{
  grip();trigger();stock();
  const bolt=p.family==='bolt',lmg=p.family==='lmg',smg=p.family==='smg';
  if(bolt||p.round||p.family==='shotgun'){tube(bolt?.037:.042,.33,[0,.151,-.065],steel);slab([[.13,.082],[-.28,.09],[-.29,.055],[.03,.022]],.079,p.stock==='wood'?wood:dark);}
  else if(p.ar){tube(.036,.36,[0,.155,-.06],steel);slab([[.13,.12],[.13,.073],[.02,.023],[-.06,.03],[-.10,.071],[-.215,.066],[-.22,.13]],.073,steel);box([.078,.083,.105],[0,.062,-.163],dark,.006);}
  else slab(p.ak?[[.13,.073],[.13,.183],[-.23,.183],[-.28,.11],[-.23,.055],[.02,.025]]:p.pdw?[[.15,.09],[.13,.205],[-.26,.205],[-.31,.13],[-.24,.066],[.01,.04]]:[[.13,.062],[.13,lmg?.215:.196],[-.23,lmg?.215:.196],[-.29,.15],[-.25,.067],[.015,.035]],lmg?.10:.080,steel);
  box([.004,.034,.112],[lmg?.054:.043,.153,-.086],black,.003);const carrier=box([.006,.025,.067],[lmg?.057:.047,.153,-.092],alloy,.002);u.bolt14=carrier;rod([.045,.157,.012],[.090,.157,.012],.007,steel);
  for(const x of[-.043,.043])for(const z of[.07,-.20])screw(x,.11,z);
  const gz=p.guard,gl=p.family==='shotgun'?.23:p.short?.18:.27,gm=p.stock==='wood'?wood:dark;let guard;
  if(p.stock==='wood'||p.pump){guard=slab([[gz+gl/2,.075],[gz+gl/2,.14],[gz+gl*.37,.162],[gz-gl*.40,.162],[gz-gl/2,.14],[gz-gl/2,.081]],.078,gm);if(p.pump)u.foregrip14=guard;for(const side of[-1,1])for(let j=0;j<7;j++){const groove=box([.003,.055,.004],[side*.040,.113,gz-gl*.38+j*gl*.12],dark,.001,p.pump?guard:root);if(p.pump)groove.position.sub(guard.position);}}
  else{const holes=[];for(let j=0;j<(p.short?4:6);j++){const z=gz-gl*.38+j*gl*.14;holes.push([[z,.11],[z+.021,.11],[z+.026,.134],[z+.005,.134]]);}guard=new THREE.Group();root.add(guard);for(const side of[-1,1]){const shell=slab([[gz+gl/2,.078],[gz+gl/2,.153],[gz+gl*.4,.177],[gz-gl*.43,.177],[gz-gl/2,.15],[gz-gl/2,.085]],.005,dark,guard,holes);shell.position.x=side*.039;}box([.069,.011,gl],[0,.077,gz],dark,.003,guard);box([.058,.010,gl],[0,.174,gz],steel,.002,guard);}

  barrel(p.end,-.24,p.family==='shotgun'?.027:lmg?.023:.016,.154);
  if(p.ak)tube(.012,.31,[0,.204,-.43],steel);
  if(p.family==='shotgun'){tube(.020,.49,[0,.085,-.49],dark);for(const z of[-.27,p.end+.09]){ring(.028,[0,.154,z],steel);rod([0,.086,z],[0,.154,z],.010,steel);}}
  if(bolt){const handle=rod([.035,.17,.045],[.099,.11,.045],.009,alloy);mesh(new THREE.SphereGeometry(.017,10,7),dark,[.099,.11,.045]);u.bolt14=handle;}
  if(lmg){const feed=box([.145,.20,.17],[0,-.085,-.15],dark,.010);u.feedBox14=feed;u.magazine=feed;for(let j=0;j<7;j++){tube(.008,.044,[.075+j*.009,.175,-.14],brass);ring(.009,[.075+j*.009,.175,-.161],dark);}for(const side of[-1,1]){rod([side*.027,.14,-.73],[side*.17,-.17,-.86],.009,dark);box([.055,.009,.05],[side*.17,-.17,-.86],dark);}rod([-.065,.22,-.04],[-.065,.29,-.04]);rod([-.065,.29,-.04],[-.065,.29,-.19],.011,rubber);}
  else if(!p.internal)magazine(!!p.curved,p.short);
  const top=bolt||p.round||p.family==='shotgun'?.192:p.ak?.188:.196;box([.037,.221-top,.235],[0,(.221+top)/2,-.065],dark,.002);box([.060,.008,bolt?.21:.29],[0,.225,bolt?-.025:-.065],dark,.002);for(let j=0;j<9;j++)box([.062,.005,.007],[0,.231,-.18+j*.028],steel,.001);u.receiverTop32=.234;u.opticMount16=[0,.32,-.09];
 }
 // Family-specific service details: selector, takedown pins, sling and vented muzzle device.
 if(!['pistol','revolver','launcher'].includes(p.family)){const lever=box([.009,.010,.039],[.047,.081,.018],dark,.002);lever.rotation.x=.35;for(const z of[-.20,.080])screw(-.044,.092,z);if(!p.internal&&p.family!=='lmg')box([.012,.014,.026],[.046,.065,-.092],alloy,.002);ring(.015,[.038,.12,p.end+.16],dark);rod([.038,.132,p.end+.16],[.015,.151,p.end+.16],.004,dark);if(p.family!=='shotgun'){tube(.023,.058,[0,.154,p.end+.029],steel,true);for(const side of[-1,1])for(let j=0;j<3;j++)box([.003,.018,.006],[side*.024,.154,p.end+.012+j*.012],black,.001);}}
 options.decorate?.(root,{p,mesh,box,slab,tube,ring,rod,steel,dark,wood,rubber,alloy,brass});
 if(id==='pistol'){
  // One affine transform for slide, barrel, receiver and exterior service detail.
  // Grip/magazine/trigger and their hand anchors stay in original metre space.
  const pivot=new V(0,.055,.07),scale=new V(.80,.78,.78),transform=new THREE.Matrix4().makeTranslation(...pivot.toArray()).multiply(new THREE.Matrix4().makeScale(...scale.toArray())).multiply(new THREE.Matrix4().makeTranslation(...pivot.clone().negate().toArray()));
  for(const part of root.children){if(u.lowerParts40.has(part)||part===u.magazine)continue;part.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(part);if(b.max.y<.035)continue;part.applyMatrix4(transform);}
  for(const key of['muzzle16','opticMount16'])if(u[key])u[key]=new V(...u[key]).applyMatrix4(transform).toArray();
  u.receiverTop32=pivot.y+(.211-pivot.y)*scale.y;u.compactUpper40={scale:scale.toArray(),pivot:pivot.toArray(),muzzleConnected:true};delete u.lowerParts40;
 }
 const grips=grips33(id);u.rightGrip33=new V(...grips.right);u.supportGrip25=new V(...grips.left);u.magazineRest=u.magazine?.position.clone();u.gripSpec33=grips;
 const keep=new Set([u.magazine,u.slide14,u.cylinder14,u.foregrip14,u.bolt14,u.feedBox14].filter(Boolean));
 const batch=(parent,skip=new Set())=>{parent.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(parent.matrixWorld).invert(),groups=new Map(),nodes=[];parent.traverse(m=>{if(m===parent||!m.isMesh)return;for(let n=m;n&&n!==parent;n=n.parent)if(skip.has(n))return;nodes.push(m);});for(const m of nodes){let g=m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld));if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(g);m.removeFromParent();m.geometry.dispose();}for(const [mat,parts]of groups){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());mesh(g,mat,[0,0,0],parent);}};
 for(const part of keep)batch(part);batch(root,keep);
 return root;
}
