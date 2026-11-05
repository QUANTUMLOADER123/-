import {buildLand36,dressOffshore36} from './sites36.js';
import * as THREE from 'three';
import {buildLand34,dressOffshore34} from './sites34.js';
import {ensureRecycler33,restoreRecyclers33} from './recyclers33.js';
import {oilLod32} from './oil-lod32.js';
import {oilrig31,restoreOilRig31} from './oilrig31.js';
import {terrainHeight} from './state.js';
import {MONUMENTS,MAP_REVISION} from './map-data.js';
import {Site17,siteMaterials17} from './site-kit17.js';
import {floorContains08} from './roads08.js';
const V=THREE.Vector3;
export function buildSites17(w){
 const p=siteMaterials17(w);w.siteLayouts17=[];w.guardSpawns17=new Map();
 for(const m of MONUMENTS){const coast=m.yaw36??(m.kind==='harbor'?Math.atan2(m.x,m.z):m.kind==='oilrig'?Math.atan2(-m.x,-m.z):undefined),k=new Site17(w,m,p,coast);
  if(m.kind==='oilrig'){oilrig31(k,m.id==='oil-large');(MAP_REVISION>=17?dressOffshore36:dressOffshore34)(k);}else{(MAP_REVISION>=17?buildLand36:buildLand34)(k);if(!m.safe)for(let i=0;i<3;i++)k.barrel(k.root,i,[-m.radius/(m.siteScale25||1)*.57,.18,(-.16+i*.18)*m.radius/(m.siteScale25||1)]);}
  const guard={airfield:[-5,18],power:[0,12],radar:[8,8],bunker:[0,10.5]}[m.kind];
  if(guard)w.guardSpawns17.set(m.id,k.root.localToWorld(new V(guard[0],.18,guard[1])));
  ensureRecycler33(k);k.finish();oilLod32(k);
 }
 // One-time recovery only if an old saved position is inside replacement scenery.
 // Do not touch the island revision, inventory, structures, or an occupied boat.
 w.restoreSites17=state=>{
  restoreOilRig31(w,state,MONUMENTS);restoreRecyclers33(w,state);
  const revision=MAP_REVISION>=17?36:34;if(state.siteRevision17===revision)return;state.siteRevision17=revision;if(state.boat)return;
  const {x,z}=state.position,m=MONUMENTS.find(m=>Math.hypot(m.x-x,m.z-z)<m.radius+12);
  if(!m)return;const feet=Number.isFinite(state.feetY)?state.feetY:w.floorHeight(x,z,state);
  if(w.canMove(x,z,state,feet))return;
  const place=(x,z,y)=>{const at={...state,position:{x,z}};if(!w.canMove(x,z,at,y)||!w.canStand04(at,y))return false;state.position={x,z};state.feetY=y;return true;};
  const nearby=w.walkFloors.filter(f=>f.site17===m.id&&floorContains08(f,x,z)&&Math.abs(f.y-feet)<1).sort((a,b)=>Math.abs(a.y-feet)-Math.abs(b.y-feet));
  for(const f of nearby)if(place(x,z,f.y))return;
  for(let r=.5;r<=Math.min(40,m.radius+8);r+=.5)for(let i=0;i<32;i++){const px=x+Math.cos(i*Math.PI/16)*r,pz=z+Math.sin(i*Math.PI/16)*r,y=w.floorHeight(px,pz,state,feet+.9);if(Math.abs(y-feet)<1.1&&place(px,pz,y))return;}
  const entry=m.entry17;if(entry)place(entry.x,entry.z,w.floorHeight(entry.x,entry.z,state,entry.y+.5));
 };
}
