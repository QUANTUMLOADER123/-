import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed,terrainHeight,noise} from './state.js';
import {MAP_SEED,MAP_SCALE,WORLD_RADIUS,MONUMENTS,BOT_BASES,distanceToRoad,riverAt} from './map-data.js';
import {biomeAt} from './environment.js';
const V=THREE.Vector3;
/** Original branch-and-leaf meshes, not a solid stack of cones. Shared masked
 * clusters use opaque depth writing, and the shadow pass uses the same mask. */
function leafAtlas(pine){
 const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d'),r=randomSeed(pine?1907:1903);
 for(let i=0;i<(pine?65:34);i++){
  const x=24+r()*208,y=24+r()*208,angle=r()*Math.PI*2,s=pine?12+r()*18:15+r()*20;
  a.save();a.translate(x,y);a.rotate(angle);const g=a.createLinearGradient(-s,0,s,0);g.addColorStop(0,pine?'#273f25':'#304e22');g.addColorStop(.5,pine?'#68804a':'#8fa958');g.addColorStop(1,pine?'#3c6030':'#4f7735');a.fillStyle=g;
  a.beginPath();a.moveTo(-s,0);a.bezierCurveTo(-s*.15,-s*(pine?.16:.7),s*.7,-s*(pine?.1:.6),s,0);a.bezierCurveTo(s*.45,s*(pine?.14:.7),-s*.4,s*(pine?.18:.7),-s,0);a.fill();a.strokeStyle=pine?'#768156':'#acb874';a.lineWidth=.65;a.beginPath();a.moveTo(-s*.7,0);a.lineTo(s*.8,0);a.stroke();a.restore();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;
}
export function forestTemplate19(w,name,height){
 if(!['CommonTree_1','CommonTree_3','PineTree_1','PineTree_Snow_1'].includes(name))return null;
 w.forestTemplates19??=new Map();if(w.forestTemplates19.has(name))return w.forestTemplates19.get(name);
 const pine=name.startsWith('Pine'),snow=name.includes('Snow'),r=randomSeed(name==='CommonTree_3'?1921:pine?1929:1911),root=new THREE.Group(),wood=[],leaves=[],up=new V(0,1,0);
 const branch=(a,b,ra,rb)=>{const d=b.clone().sub(a),g=new THREE.CylinderGeometry(rb,ra,d.length(),7,2);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,d.clone().normalize()));g.translate(...a.clone().addScaledVector(d,.5).toArray());wood.push(g);};
 branch(new V(0,-.16,0),new V(.12,height*.88,-.08),pine?.21:.29,.025);
 for(let i=0;i<(pine?21:12);i++){
  const a=i*2.399963,y=height*(pine?.23+i*.028:.32+r()*.38),radius=pine?(1-y/height)*3.1:.95+r()*1.35,start=new V(.08,y,0),end=new V(Math.cos(a)*radius,y+(pine?.12:height*.10),Math.sin(a)*radius);
  branch(start,end,pine?.055:.085,.014);
  const cards=pine?2:3;
  for(let j=0;j<cards;j++){
   const g=new THREE.PlaneGeometry(1,1),s=pine?1.05+radius*.6:1.8+r()*.65;
   g.scale(s,s*(pine?.7:1),1);g.rotateX((r()-.5)*1.8);g.rotateY(a+j*2.1);g.rotateZ((r()-.5)*.7);g.translate(end.x+(r()-.5)*.65,end.y+(j===0?.1:.55+r()*.6),end.z+(r()-.5)*.65);leaves.push(g);
  }
 }
 // Upright leaders close the crown rather than leaving an empty tip.
 for(let j=0;j<4;j++){const g=new THREE.PlaneGeometry(pine?1.25:2.4,pine?1.7:2.2);g.rotateY(j*Math.PI/4);g.translate(.1,height-.8,-.08);leaves.push(g);}
 const bark=new THREE.MeshStandardMaterial({name:'Bark19',map:w.textures['BroadleafBark.jpg'],normalMap:w.textures['BroadleafBark_Normal.png'],color:0xb7ad94,roughness:.96});bark.userData.authoredBark19=true;bark.normalScale.set(.35,.35);
 const leaf=new THREE.MeshStandardMaterial({name:snow?'SnowLeaf19':'Leaf19',map:leafAtlas(pine),color:snow?0xd5dfd0:0xffffff,alphaTest:.42,alphaToCoverage:true,side:THREE.DoubleSide,roughness:.93});
 for(const [list,material]of [[wood,bark],[leaves,leaf]]){const geometry=mergeGeometries(list);list.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,material);root.add(mesh);}
 w.forestTemplates19.set(name,root);return root;
}
/** Independent IDs/RNG preserve existing harvested resources. Spatial spacing
 * leaves paths through clustered woodland. Existing player buildings are excluded. */
export function addForestNodes19(w,nodes){
 const r=randomSeed(MAP_SEED^0x19f024),cells=new Map(),cell=3.7,put=n=>{const k=Math.floor(n.x/cell)+':'+Math.floor(n.z/cell);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(n);};nodes.filter(n=>n.type==='tree').forEach(put);
 w.foliageExclusions19=w.entryBuildings18||[];
 if(MAP_SCALE>3){w.forestAdded19=0;return;}
 const target=Math.min(8000,Math.round(2100*MAP_SCALE*MAP_SCALE)),buildings=w.entryBuildings18||[];
 for(let i=0,accepted=0;i<target*4&&accepted<target;i++){
  const x=(r()-.5)*WORLD_RADIUS*1.95,z=(r()-.5)*WORLD_RADIUS*1.95,b=biomeAt(x,z),y=terrainHeight(x,z),cluster=noise(x*.025+19,z*.025-73);
  if(b.id==='arid'||y<1.5||b.id==='coast'&&r()>.28||b.id==='snow'&&r()>.5||cluster<.28||Math.hypot(x+6,z+3)<39||distanceToRoad(x,z,8)<6||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+4)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<14)||buildings.some(b=>b.hp>0&&Math.hypot(x-b.x,z-b.z)<4.5))continue;
  const river=riverAt(x,z);if(river&&river.distance<river.width*.5+3)continue;
  if(Math.max(Math.abs(terrainHeight(x+1,z)-terrainHeight(x-1,z)),Math.abs(terrainHeight(x,z+1)-terrainHeight(x,z-1)))>2.3)continue;
  const cx=Math.floor(x/cell),cz=Math.floor(z/cell);let close=false;for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)if((cells.get(a+':'+b)||[]).some(n=>Math.hypot(n.x-x,n.z-z)<3.7))close=true;if(close)continue;
  const n={id:'canopy19-'+i,type:'tree',x,z,hp:5,remaining:5};nodes.push(n);put(n);accepted++;
 }
 w.forestAdded19=nodes.filter(n=>n.id.startsWith('canopy19-')).length;
}
