import * as THREE from 'three';
import {grassGeometry39,grassMaterial39} from './grass-mesh39.js';
import {grassTimer39} from './grass-budget39.js';
import {grassTint39} from './ground39.js';
import {grassGround19} from './ground-cover19.js';
import {terrainHeight,randomSeed,noise} from './state.js';
import {MAP_SEED,distanceToRoad} from './map-data.js';
import {biomeAt} from './environment.js';
import {paintLoading11,checkLoading11} from './loading11.js';
const SIZE=16,DIAGONAL=SIZE*Math.SQRT2/2,UP=new THREE.Vector3(0,1,0);
export const GRASS_PROFILES39=Object.freeze({off:{cells:1,range:0,limit:0,cap:1,blades:1,lod:[0,1]},low:{cells:26,range:42,limit:64,cap:10000,blades:8,lod:[15,19]},medium:{cells:26,range:58,limit:110,cap:18000,blades:10,lod:[21,25]},high:{cells:26,range:74,limit:170,cap:26000,blades:12,lod:[27,31]}});
function meshes(w,g){const p=g.profile;g.materials??={near:grassMaterial39(w,g.uniforms),far:grassMaterial39(w,g.uniforms,true)};
 g.near=new THREE.InstancedMesh(grassGeometry39(p.blades),g.materials.near,p.cap);g.far=new THREE.InstancedMesh(grassGeometry39(5,true),g.materials.far,p.cap);
 for(const [i,m]of[g.near,g.far].entries()){m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(p.cap*3),3).setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.castShadow=m.receiveShadow=false;m.renderOrder=1001+i;m.userData.grass22=m.userData.grass39=true;w.scene.add(m);}g.timer=grassTimer39(w,g);w.grassChunks=[{mesh:g.near,count:0},{mesh:g.far,count:0}];
}
function release(g){g.timer?.dispose();for(const m of[g.near,g.far]){m?.removeFromParent();m?.geometry.dispose();m?.dispose();}}
function profile(w){const g=w.grass39,key=GRASS_PROFILES39[w.settings.grass28]?w.settings.grass28:'medium';if(key===g.key)return;release(g);g.key=key;g.profile=GRASS_PROFILES39[key];if(key==='off'){g.tiles.clear();g.dirtyTiles.clear();}g.queue=[];g.buildJob=null;g.planKey=null;g.performance={scale:1};meshes(w,g);g.packDirty=true;}
function plan(w,center){const g=w.grass39,p=g.profile,signature=Math.floor(center.x/5)+':'+Math.floor(center.z/5)+':'+g.key;if(signature===g.planKey)return;g.planKey=signature;const cx=Math.floor(center.x/SIZE),cz=Math.floor(center.z/SIZE),n=Math.ceil((p.range+DIAGONAL)/SIZE),wanted=[];
 if(p.range)for(let x=cx-n;x<=cx+n;x++)for(let z=cz-n;z<=cz+n;z++){const d=Math.hypot((x+.5)*SIZE-center.x,(z+.5)*SIZE-center.z);if(d<p.range+DIAGONAL)wanted.push({x,z,key:x+':'+z,d});}wanted.sort((a,b)=>a.d-b.d);wanted.length=Math.min(p.limit,wanted.length);const keep=new Set(wanted.map(t=>t.key));for(const key of g.tiles.keys())if(!keep.has(key)){g.tiles.delete(key);g.dirtyTiles.delete(key);}if(g.buildJob&&!keep.has(g.buildJob.key))g.buildJob=null;g.queue=wanted.filter(c=>(!g.tiles.has(c.key)||g.dirtyTiles.has(c.key))&&c.key!==g.buildJob?.key);g.packDirty=true;
}
function* tile(w,c){const g=w.grass39,p=g.profile,seed=MAP_SEED^Math.imul(c.x,73856093)^Math.imul(c.z,19349663)^0x39bade,points=[],step=SIZE/p.cells,dummy=new THREE.Object3D(),normal=new THREE.Vector3(),yaw=new THREE.Quaternion();
 for(let iz=0;iz<p.cells;iz++)for(let ix=0;ix<p.cells;ix++){if((iz*p.cells+ix)%16===0&&iz*p.cells+ix>0)yield;const r=randomSeed(seed^Math.imul(iz*p.cells+ix+1,83492791)),x=c.x*SIZE+(ix+.5+(r()-.5)*.94)*step,z=c.z*SIZE+(iz+.5+(r()-.5)*.94)*step,b=biomeAt(x,z),patch=noise(x*.085+37,z*.085-21),gate=r();
  if(gate>b.grass*(.63+patch*.37)||distanceToRoad(x,z,8)<3.5)continue;const y=terrainHeight(x,z);if(y<1.1)continue;const dx=(terrainHeight(x+.35,z)-terrainHeight(x-.35,z))/.7,dz=(terrainHeight(x,z+.35)-terrainHeight(x,z-.35))/.7;if(!grassGround19(w,x,z,y,Math.max(Math.abs(dx),Math.abs(dz))))continue;
  const q={x,z,y,dx,dz,angle:r()*Math.PI*2,width:.85+r()*.55,height:.72+r()*.65,rank:r(),color:new Float32Array(grassTint39(b.id,patch,r()))};dummy.position.set(x,y-.035,z);normal.set(-dx*.65,1,-dz*.65).normalize();dummy.quaternion.setFromUnitVectors(UP,normal).multiply(yaw.setFromAxisAngle(UP,q.angle));dummy.scale.set(q.width,q.height,q.width);dummy.updateMatrix();q.matrix=new Float32Array(dummy.matrix.elements);points.push(q);
 }g.tiles.set(c.key,{cx:(c.x+.5)*SIZE,cz:(c.z+.5)*SIZE,points});g.dirtyTiles.delete(c.key);g.packDirty=true;
}
function pump(w,budgetMs=.25){const g=w.grass39,start=performance.now();do{if(!g.buildJob){if(!g.queue.length)break;const c=g.queue.shift();g.buildJob={key:c.key,iterator:tile(w,c)};}if(g.buildJob.iterator.next().done)g.buildJob=null;}while(performance.now()-start<budgetMs);}

export function packGrass39(w,center){const g=w.grass39,p=g.profile,scale=w.settings.grassBudget39==='fixed'?1:g.performance.scale??1,range=p.range*Math.sqrt(.35+.65*scale),lod=p.lod.map(n=>n*Math.sqrt(.35+.65*scale));let near=0,far=0,candidates=0;const nearLimit=(lod[1]+2.6)**2,farLimit=Math.max(0,lod[0]-2.6)**2,rangeLimit=(range+2.6)**2;
 g.uniforms.range.value=range;g.uniforms.lod.value.fromArray(lod);
 // Nearest tiles first: capacity never makes a hole around the player's feet.
 const tiles=[...g.tiles.values()].sort((a,b)=>(a.cx-center.x)**2+(a.cz-center.z)**2-((b.cx-center.x)**2+(b.cz-center.z)**2));
 for(const t of tiles)for(const q of t.points){candidates++;if(q.rank>scale)continue;const d=(q.x-center.x)**2+(q.z-center.z)**2;if(d>=rangeLimit)continue;
  if(d<nearLimit&&near<p.cap){g.near.instanceMatrix.array.set(q.matrix,near*16);g.near.instanceColor.array.set(q.color,near++*3);}if(d>farLimit&&far<p.cap){g.far.instanceMatrix.array.set(q.matrix,far*16);g.far.instanceColor.array.set(q.color,far++*3);}

 }
 for(const[m,n]of[[g.near,near],[g.far,far]]){m.count=n;m.visible=n>0;m.instanceMatrix.clearUpdateRanges();m.instanceMatrix.addUpdateRange(0,n*16);m.instanceColor.clearUpdateRanges();m.instanceColor.addUpdateRange(0,n*3);m.instanceMatrix.needsUpdate=m.instanceColor.needsUpdate=true;}
 w.grassChunks[0].count=near;w.grassChunks[1].count=far;g.candidates=candidates;g.packDirty=false;g.packX=center.x;g.packZ=center.z;g.packAt=w.time;g.packCount=(g.packCount||0)+1;
}
export function installGrass39(World){const dispose=World.prototype.dispose;
 World.prototype.makeGrass=async function(signal,progress){const uniforms={eye:{value:this.camera.position.clone()},time:{value:0},lod:{value:new THREE.Vector2()},range:{value:42}};this.grass39=this.grass22={tiles:new Map(),dirtyTiles:new Set(),queue:[],uniforms,lastFrame:-1,lastChecks:-1,performance:{scale:1}};this.localGrass=null;profile(this);const center=this.entryPosition19||this.camera.position;plan(this,center);const total=this.grass39.queue.length;while(this.grass39.queue.length||this.grass39.buildJob){checkLoading11(signal);pump(this,6);progress?.(1-this.grass39.queue.length/Math.max(1,total));await paintLoading11(signal);}packGrass39(this,center);};
 World.prototype.invalidateGrass22=function(){if(!this.grass39)return;this.grass39.force=true;this.coverEpoch22=(this.coverEpoch22||0)+1;};
 World.prototype.streamGrass=function(){const g=this.grass39;if(!g)return;g.uniforms.eye.value.copy(this.camera.position);g.uniforms.time.value=this.time;profile(this);if(g.lastFrame===(this.renderedFrames||0))return;g.lastFrame=this.renderedFrames||0;g.timer.poll();if(g.budgetMode!==this.settings.grassBudget39){g.budgetMode=this.settings.grassBudget39;g.packDirty=true;}
  if(this.time-g.lastChecks>.75){g.lastChecks=this.time;const buildings=this.state04?.buildings||this.entryBuildings18||[],sig=buildings.filter(b=>b.hp>0).map(b=>b.id+':'+b.kind+':'+Math.round(b.x*2)+':'+Math.round(b.z*2)+':'+Math.round((b.y||0)*2)).join('|');if(g.buildingSignature!==undefined&&sig!==g.buildingSignature)this.invalidateGrass22();g.buildingSignature=sig;}
  if(g.force){g.buildJob=null;for(const key of g.tiles.keys())g.dirtyTiles.add(key);g.planKey=null;g.force=false;}plan(this,this.camera.position);pump(this,.25);
  if(g.packDirty||Math.hypot(this.camera.position.x-g.packX,this.camera.position.z-g.packZ)>2.5&&this.time-g.packAt>.12)packGrass39(this,this.camera.position);
 };
 World.prototype.updateGrassVisibility=function(){this.streamGrass();};
 World.prototype.dispose=function(){const g=this.grass39;if(g){release(g);g.materials.near.dispose();g.materials.far.dispose();g.tiles.clear();this.grass39=this.grass22=null;}dispose.call(this);};
}
export {diagnostics39} from './diagnostics39.js';
