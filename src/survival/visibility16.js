import {housePlan20,houseGround20,hashHouse20} from './house-plans20.js';
import {MAP_REVISION,MAP_SEED,MAP_SCALE} from './map-data.js';
import {randomSeed} from './state.js';
import * as THREE from 'three';
/** Object visibility budgets, not collision or simulation budgets. Metres. */
const PROFILES16={near:{trees:125,props:100,houses:95,proxies:190,sites:190,shadow:45},balanced:{trees:235,props:160,houses:145,proxies:320,sites:360,shadow:65},far:{trees:360,props:230,houses:190,proxies:520,sites:650,shadow:85}};
export function visibilityProfile16(settings){return PROFILES16[settings.viewDistance16]||PROFILES16.balanced;}
const zero16=new THREE.Matrix4().makeScale(.000001,.000001,.000001).setPosition(0,-10000,0);
function show16(model,near,alive=true){if(!model)return;model.userData.distanceCulled16=alive&&!near;model.visible=alive&&near;}
export function installCulling16(World){
 const render=World.prototype.render,dormancy=World.prototype.updateDormancy,sync=World.prototype.syncState;
 World.prototype.updateVisibility16=function(force=false){
  const now=performance.now(),p=this.camera.position,key=this.settings.viewDistance16||'balanced',last=this.cullLast16;
  if(!force&&last&&key===last.key&&now-last.time<120&&(p.x-last.x)**2+(p.z-last.z)**2<144)return;
  this.cullLast16={key,time:now,x:p.x,z:p.z};const r=visibilityProfile16(this.settings),within=(x,z,range)=>(x-p.x)**2+(z-p.z)**2<range*range;
  let trees=0,proxies=0;for(const b of this.treeBatches){const c=b.userData.center;if(!c)continue;const radius=Math.min(85,b.boundingSphere?.radius||60);b.visible=(!b.userData.understory19||this.settings.understory28!==0)&&within(c.x,c.z,(b.userData.understory19?Math.min(75,r.props):r.trees)+radius);b.castShadow=!b.userData.understory19&&b.visible&&this.settings.shadowSize28!==0&&within(c.x,c.z,(/^Leaf21/.test(b.material?.name||'')?Math.min(40,r.shadow):r.shadow)+radius);if(b.visible)trees++;}
  for(const b of this.proxyChunks16||[]){const c=b.boundingSphere;show16(b,within(c.center.x,c.center.z,Math.min(1800,r.proxies*Math.sqrt(MAP_SCALE))+c.radius));if(b.visible)proxies++;}
  for(const g of this.distantGroups){g.maxRange16??=g.range;g.range=Math.min(g.maxRange16,g.root.userData.road16?r.props:r.sites);show16(g.root,within(g.x,g.z,g.range));}
  const state=this.state04,dead=this.deadIds05||new Set(state?.depleted||[]);
  for(const n of this.nodes)if(n.model)show16(n.model,within(n.x,n.z,r.props),!dead.has(n.id));
  for(const i of this.interactables)if(['crate','barrel'].includes(i.type))show16(i.model,within(i.x,i.z,r.props),!dead.has(i.id)&&!i.supports?.some(id=>dead.has(id)));
  for(const e of this.built.values()){const alive=e.data.hp>0;show16(e.model,within(e.data.x,e.data.z,r.proxies),alive);if(e.fire)show16(e.fire.root,within(e.data.x,e.data.z,r.props),alive);}
  // Detailed projectile-loaded houses can exist outside the visual radius. Keep
  // their instances/colliders alive; targeting explicitly ignores render-only hiding.
  for(const h of this.settlements05?.values()||[]){const detailed=h.renderReady21!==false&&within(h.base.x,h.base.z,r.houses+20);show16(h.root,detailed);const proxy=h.base.proxy05;if(proxy){const roots=h.entries.filter(e=>e.data.kind==='foundation'),destroyed=roots.length&&roots.every(e=>dead.has(e.data.id));proxy.mesh.setMatrixAt(proxy.index,detailed||destroyed?zero16:proxy.matrix);proxy.mesh.instanceMatrix.needsUpdate=true;}}
  this.visibilityStats16={treeChunks:trees,proxyChunks:proxies,profile:key};
 };
 World.prototype.updateTreeVisibility=function(){this.updateVisibility16();};
 World.prototype.updateDormancy=function(state){dormancy.call(this,state);this.updateVisibility16(true);};
 World.prototype.syncState=function(state){sync.call(this,state);this.updateVisibility16(true);};
 World.prototype.render=function(){this.updateVisibility16();render.call(this);};
}
/** Chunk proxy creation preserves the existing per-house matrix/raid interface. */
export function settlementProxies16(w,bases,material,heightAt){
 const cells=new Map(),geo=new THREE.BoxGeometry(6,1,6);w.proxyChunks16=[];
 for(const b of bases){const key=b.tier+':'+Math.floor(b.x/96)+':'+Math.floor(b.z/96);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(b);}
 for(const bucket of cells.values()){
  const source=material(bucket[0].tier),shell=new THREE.MeshLambertMaterial({name:'House silhouette21',map:source.map,color:source.color}),mesh=new THREE.InstancedMesh(geo,shell,bucket.length),dummy=new THREE.Object3D();mesh.receiveShadow=true;mesh.castShadow=false;mesh.frustumCulled=false;
  bucket.forEach((b,i)=>{const height=b.stories*3+.4;dummy.position.set(b.x,heightAt(b.x,b.z)+height/2,b.z);dummy.scale.set(1,height,b.layout==='2x2'?1:.5);dummy.rotation.y=0;if(MAP_REVISION>=11){const shape=housePlan20(b,bases,randomSeed(hashHouse20(MAP_SEED,b.id+'house20'))),xs=shape.plan.map(p=>p.x),zs=shape.plan.map(p=>p.z),minX=Math.min(...xs)-1.5,maxX=Math.max(...xs)+1.5,minZ=Math.min(...zs)-1.5,maxZ=Math.max(...zs)+1.5,center=shape.world((minX+maxX)/2,(minZ+maxZ)/2),ground=houseGround20(shape.plan,shape.world,heightAt);b.foundationCount20=shape.plan.length;dummy.position.set(center.x,ground+height/2,center.z);dummy.scale.set((maxX-minX)/6,height,(maxZ-minZ)/6);dummy.rotation.y=shape.yaw;}dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);b.proxy05={mesh,index:i,matrix:dummy.matrix.clone()};});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();w.scene.add(mesh);w.proxyChunks16.push(mesh);
 }
}
