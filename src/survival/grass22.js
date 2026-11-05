import * as THREE from 'three';
import {grassGeometry22,grassMaterial22} from './grass-mesh22.js';
import {grassGround19} from './ground-cover19.js';
import {terrainHeight,randomSeed,noise} from './state.js';
import {MAP_SEED,distanceToRoad} from './map-data.js';
import {biomeAt} from './environment.js';
import {paintLoading11,checkLoading11} from './loading11.js';
const SIZE=18,HALF_DIAGONAL=SIZE*Math.SQRT2/2;
const PROFILES={off:{cells:1,blades:1,folded:false,lod:[0,1],range:0,limit:0},low:{cells:15,blades:4,folded:false,lod:[17,26],range:56,limit:56},medium:{cells:16,blades:6,folded:true,lod:[27,39],range:82,limit:100},high:{cells:18,blades:8,folded:true,lod:[35,49],range:108,limit:156}};
const UP=new THREE.Vector3(0,1,0);
function removeTile(w,tile){if(tile.empty)return;for(const mesh of [tile.near,tile.far]){mesh.removeFromParent();mesh.dispose();}}
function clearTiles(w){const g=w.grass22;for(const tile of g.tiles.values())removeTile(w,tile);g.tiles.clear();g.dirtyTiles?.clear();w.grassChunks=[];}
function setProfile(w){const g=w.grass22,key=PROFILES[w.settings.grass28]?w.settings.grass28:(PROFILES[w.settings.quality]?w.settings.quality:'medium');if(g.key===key)return;
 clearTiles(w);g.key=key;g.profile=PROFILES[key];g.resources??=new Map();if(!g.resources.has(key))g.resources.set(key,{near:grassGeometry22(g.profile.blades,g.profile.folded),far:grassGeometry22(2,false)});g.geometry=g.resources.get(key);g.uniforms.lod.value.fromArray(g.profile.lod);g.uniforms.range.value=g.profile.range;g.planKey=null;
}
function plan(w,center){const g=w.grass22,p=g.profile,cx=Math.floor(center.x/SIZE),cz=Math.floor(center.z/SIZE),signature=Math.floor(center.x/6)+':'+Math.floor(center.z/6)+':'+g.key;if(g.planKey===signature)return;g.planKey=signature;
 const n=Math.ceil((p.range+HALF_DIAGONAL)/SIZE),wanted=[];
 for(let x=cx-n;x<=cx+n;x++)for(let z=cz-n;z<=cz+n;z++){const distance=Math.hypot((x+.5)*SIZE-center.x,(z+.5)*SIZE-center.z);if(distance<p.range+HALF_DIAGONAL)wanted.push({x,z,key:x+':'+z,distance});}
 wanted.sort((a,b)=>a.distance-b.distance);wanted.length=Math.min(p.limit,wanted.length);const keep=new Set(wanted.map(t=>t.key));
 for(const [key,tile]of g.tiles)if(!keep.has(key)){removeTile(w,tile);g.tiles.delete(key);g.dirtyTiles.delete(key);}
 g.queue=wanted.filter(t=>!g.tiles.has(t.key)||g.dirtyTiles.has(t.key));refreshList(w);
}
function refreshList(w){w.grassChunks=[];for(const tile of w.grass22.tiles.values())if(!tile.empty)for(const mesh of [tile.near,tile.far])w.grassChunks.push({mesh,count:mesh.count,x:tile.cx,z:tile.cz});}
function buildTile(w,cell){
 const g=w.grass22,p=g.profile,seed=MAP_SEED^Math.imul(cell.x,73856093)^Math.imul(cell.z,19349663)^0x22bade,points=[],step=SIZE/p.cells;
 for(let iz=0;iz<p.cells;iz++)for(let ix=0;ix<p.cells;ix++){
  const r=randomSeed(seed^Math.imul(iz*p.cells+ix+1,83492791)),x=cell.x*SIZE+(ix+.5+(r()-.5)*.82)*step,z=cell.z*SIZE+(iz+.5+(r()-.5)*.82)*step,biome=biomeAt(x,z),patch=noise(x*.065+37,z*.065-21),gate=r();
  // Real biome probabilities: desert stays sparse, not a global green carpet.
  if(gate>biome.grass*(.48+patch*.52)||distanceToRoad(x,z,8)<3.5)continue;
  const h=terrainHeight(x,z);if(h<1.1)continue;const dx=(terrainHeight(x+.4,z)-terrainHeight(x-.4,z))/.8,dz=(terrainHeight(x,z+.4)-terrainHeight(x,z-.4))/.8;if(!grassGround19(w,x,z,h,Math.max(Math.abs(dx),Math.abs(dz))))continue;
  points.push({x,z,h,dx,dz,biome,patch,angle:r()*Math.PI*2,width:.80+r()*.68,height:.55+r()*.90,tint:r()});
 }
 if(!points.length){g.tiles.set(cell.key,{cx:(cell.x+.5)*SIZE,cz:(cell.z+.5)*SIZE,near:null,far:null,empty:true});return;}
 const near=new THREE.InstancedMesh(g.geometry.near,g.materials.near,points.length),far=new THREE.InstancedMesh(g.geometry.far,g.materials.far,0),dummy=new THREE.Object3D(),normal=new THREE.Vector3(),yaw=new THREE.Quaternion(),color=new THREE.Color(),dry=new THREE.Color(0xafa071);
 points.forEach((p,i)=>{normal.set(-p.dx*.72,1,-p.dz*.72).normalize();dummy.position.set(p.x,p.h-.04,p.z);dummy.quaternion.setFromUnitVectors(UP,normal).multiply(yaw.setFromAxisAngle(UP,p.angle));dummy.scale.set(p.width,p.height*(.80+p.patch*.28),p.width);dummy.updateMatrix();near.setMatrixAt(i,dummy.matrix);
  color.setHex(p.biome.id==='arid'?0xb3a578:p.biome.id==='snow'?0x9ca688:p.biome.id==='coast'?0x8e9859:0x889761);if(p.biome.id==='forest')color.lerp(dry,Math.max(0,p.patch-.53)*.8);color.multiplyScalar(.88+p.tint*.22);near.setColorAt(i,color);
 });
 near.instanceMatrix.needsUpdate=true;near.instanceColor.needsUpdate=true;
 // The two LODs reuse one transform/colour buffer; they are not two grass populations.
 far.instanceMatrix=near.instanceMatrix;far.instanceColor=near.instanceColor;far.count=points.length;
 near.computeBoundingSphere();near.boundingSphere.radius+=1;far.boundingSphere=near.boundingSphere.clone();
 for(const mesh of [near,far]){mesh.receiveShadow=w.settings.shadowSize28!==0;mesh.castShadow=false;mesh.userData.grass22=true;w.scene.add(mesh);}
 g.tiles.set(cell.key,{cx:(cell.x+.5)*SIZE,cz:(cell.z+.5)*SIZE,near,far});
}
function pump(w,budget=1){const g=w.grass22;let changed=false;while(budget-->0&&g.queue.length){const cell=g.queue.shift(),old=g.tiles.get(cell.key);buildTile(w,cell);if(old)removeTile(w,old);g.dirtyTiles.delete(cell.key);changed=true;}if(changed)refreshList(w);}
function updateVisibility(w,center){const g=w.grass22,p=g.profile;for(const tile of g.tiles.values()){if(tile.empty)continue;const d=Math.hypot(tile.cx-center.x,tile.cz-center.z);tile.near.visible=d<p.lod[1]+HALF_DIAGONAL;tile.far.visible=d>p.lod[0]-HALF_DIAGONAL&&d<p.range+HALF_DIAGONAL;}}
export function installGrass22(World){
 const dispose=World.prototype.dispose;
 World.prototype.makeGrass=async function(signal,progress){
  const uniforms={eye:{value:this.camera.position.clone()},time:{value:0},lod:{value:new THREE.Vector2()},range:{value:100}};
  this.grass22={tiles:new Map(),dirtyTiles:new Set(),resources:new Map(),uniforms,queue:[],lastFrame:-1,lastChecks:-1};this.localGrass=null;this.grassChunks=[];this.grass22.materials={near:grassMaterial22(this,uniforms),far:grassMaterial22(this,uniforms,true)};setProfile(this);
  const center=this.entryPosition19||this.camera.position;plan(this,center);const total=this.grass22.queue.length;while(this.grass22.queue.length){checkLoading11(signal);pump(this,4);progress?.(1-this.grass22.queue.length/Math.max(1,total));await paintLoading11(signal);}updateVisibility(this,center);
 };
 World.prototype.invalidateGrass22=function(){if(!this.grass22)return;this.grass22.force=true;this.coverEpoch22=(this.coverEpoch22||0)+1;};
 World.prototype.streamGrass=function(){
  const g=this.grass22;if(!g)return;g.uniforms.eye.value.copy(this.camera.position);g.uniforms.time.value=this.time;setProfile(this);
  // Rendering, loading and reflections can request grass more than once per frame.
  const frame=this.renderedFrames||0;if(g.lastFrame===frame)return;g.lastFrame=frame;
  if(this.time-g.lastChecks>.75){g.lastChecks=this.time;const buildings=this.state04?.buildings||this.entryBuildings18||[],signature=buildings.filter(b=>b.hp>0).map(b=>b.id+':'+b.kind+':'+Math.round(b.x*2)+':'+Math.round(b.z*2)+':'+Math.round((b.y||0)*2)).join('|');if(g.buildingSignature!==undefined&&g.buildingSignature!==signature)this.invalidateGrass22();g.buildingSignature=signature;}
  if(g.force){for(const key of g.tiles.keys())g.dirtyTiles.add(key);g.planKey=null;g.force=false;}
  plan(this,this.camera.position);pump(this,1);updateVisibility(this,this.camera.position);
 };
 World.prototype.updateGrassVisibility=function(){this.streamGrass();};
 World.prototype.dispose=function(){const g=this.grass22;if(g){clearTiles(this);for(const pair of g.resources.values()){pair.near.dispose();pair.far.dispose();}g.materials.near.dispose();g.materials.far.dispose();this.grass22=null;}dispose.call(this);};
}
