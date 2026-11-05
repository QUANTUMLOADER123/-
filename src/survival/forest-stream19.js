import {addUnderstory19} from './understory19.js';
import {MAP_SCALE,MAP_SEED,MONUMENTS,BOT_BASES,distanceToRoad,riverAt} from './map-data.js';
import {randomSeed,terrainHeight,noise} from './state.js';
import {biomeAt} from './environment.js';
import {visibilityProfile16} from './visibility16.js';
const SIZE=72;
/** Large islands need local woodland density, not a fixed 14k-tree budget
 * spread over 64 square kilometres. Stable 6m candidate cells are streamed;
 * harvested IDs remain in the ordinary save and never regenerate their loot. */
export function installForestStreaming19(World){
 const make=World.prototype.makeResources,update=World.prototype.update,dispose=World.prototype.dispose;
 World.prototype.pumpForest19=function(center,immediate=false){
  if(MAP_SCALE<=3)return;
  this.forestChunks19??=new Map();
  if(!this.staticTreeCells19){this.staticTreeCells19=new Map();for(const n of this.nodes)if(n.type==='tree'){const k=Math.floor(n.x/8)+':'+Math.floor(n.z/8);if(!this.staticTreeCells19.has(k))this.staticTreeCells19.set(k,[]);this.staticTreeCells19.get(k).push(n);}}
  const cx=Math.floor(center.x/SIZE),cz=Math.floor(center.z/SIZE),profile=this.settings.viewDistance16||'balanced',signature=cx+':'+cz+':'+profile;
  if(signature!==this.forestPlanKey19){
   this.forestPlanKey19=signature;const radius=visibilityProfile16(this.settings).trees+SIZE,n=Math.ceil(radius/SIZE),wanted=[];
   for(let x=cx-n;x<=cx+n;x++)for(let z=cz-n;z<=cz+n;z++){const d=Math.hypot((x+.5)*SIZE-center.x,(z+.5)*SIZE-center.z);if(d<radius)wanted.push({x,z,k:x+':'+z,d});}
   wanted.sort((a,b)=>a.d-b.d);wanted.length=Math.min(wanted.length,profile==='near'?40:profile==='far'?96:72);const keep=new Set(wanted.map(c=>c.k)),removed=new Set();
   for(const [key,chunk]of this.forestChunks19)if(!keep.has(key)){
    for(const id of chunk.ids)removed.add(id);const geometries=new Set(),materials=new Set(),depths=new Set();
    for(const mesh of chunk.meshes){mesh.removeFromParent();mesh.dispose();if(!mesh.geometry.userData.sharedForest40)geometries.add(mesh.geometry);if(!mesh.material.userData.sharedForest40)materials.add(mesh.material);if(mesh.customDepthMaterial&&!mesh.customDepthMaterial.userData.sharedForest40)depths.add(mesh.customDepthMaterial);}
    this.treeBatches=this.treeBatches.filter(b=>!chunk.meshes.includes(b));geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());depths.forEach(d=>d.dispose());this.forestChunks19.delete(key);
   }
   if(removed.size){this.nodes=this.nodes.filter(n=>!removed.has(n.id));this.colliders=this.colliders.filter(c=>!removed.has(c.id));this.targetGrids06?.clear();}
   this.forestQueue19=wanted.filter(c=>!this.forestChunks19.has(c.k));
  }
  const budget=immediate?96:2;
  for(let job=0;job<budget&&this.forestQueue19?.length;job++){
   const cell=this.forestQueue19.shift(),r=randomSeed(MAP_SEED^Math.imul(cell.x,73856093)^Math.imul(cell.z,19349663)^0x1919),nodes=[],dead=this.deadIds05||new Set(),buildings=this.state04?.buildings||this.foliageExclusions19||[];
   for(let i=0;i<144;i++){
    const x=cell.x*SIZE+(i%12+.5)*6+(r()-.5)*1.8,z=cell.z*SIZE+(Math.floor(i/12)+.5)*6+(r()-.5)*1.8,id='canopy19-'+cell.x+'c'+cell.z+'n'+i,b=biomeAt(x,z),h=terrainHeight(x,z);
    if(dead.has(id)||b.id==='arid'||b.id==='coast'&&r()>.3||b.id==='snow'&&r()>.48||h<1.5||noise(x*.025+19,z*.025-73)<.3||Math.hypot(x+6,z+3)<39||distanceToRoad(x,z,8)<6||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+4)||BOT_BASES.some(b=>Math.hypot(x-b.x,z-b.z)<14)||buildings.some(b=>b.hp>0&&Math.hypot(x-b.x,z-b.z)<4.5))continue;
    if((this.stringSeed(id+'thin40')>>>0)%100>54)continue;
    const river=riverAt(x,z);if(river&&river.distance<river.width*.5+3||Math.max(Math.abs(terrainHeight(x+1,z)-terrainHeight(x-1,z)),Math.abs(terrainHeight(x,z+1)-terrainHeight(x,z-1)))>2.3)continue;
    const gx=Math.floor(x/8),gz=Math.floor(z/8);let close=false;for(let a=gx-1;a<=gx+1;a++)for(let c=gz-1;c<=gz+1;c++)if((this.staticTreeCells19.get(a+':'+c)||[]).some(n=>Math.hypot(n.x-x,n.z-z)<3.7))close=true;if(close)continue;
    nodes.push({id,type:'tree',x,z,y:h,hp:5,remaining:5,instances:[]});
   }
   const before=this.treeBatches.length,broad=nodes.filter(n=>biomeAt(n.x,n.z).id!=='snow'&&!(biomeAt(n.x,n.z).id==='forest'&&n.z< -20*MAP_SCALE));
   this.vegetationInstances('CommonTree_1',broad,9);
   this.vegetationInstances('PineTree_1',nodes.filter(n=>biomeAt(n.x,n.z).id==='forest'&&n.z< -20*MAP_SCALE),8);this.vegetationInstances('PineTree_Snow_1',nodes.filter(n=>biomeAt(n.x,n.z).id==='snow'),8.5);
   addUnderstory19(this,nodes);
   for(const n of nodes){this.nodes.push(n);this.colliders.push({id:n.id,x:n.x,z:n.z,r:.32,y:n.y,h:10});}
   this.forestChunks19.set(cell.k,{ids:nodes.map(n=>n.id),meshes:this.treeBatches.slice(before)});this.cullLast16=null;this.targetGrids06?.clear();
  }
 };
 World.prototype.makeResources=function(){make.call(this);addUnderstory19(this,this.nodes.filter(n=>n.type==='tree'));this.pumpForest19(this.entryPosition19||this.camera.position,true);};
 World.prototype.update=function(dt,state,playing,...args){if(playing)this.pumpForest19(state.position);update.call(this,dt,state,playing,...args);};
 World.prototype.dispose=function(){
  // Templates are CPU-side authoring caches; their cloned live meshes are
  // disposed by the normal scene lifecycle, including their atlas textures.
  const atlasTextures=new Set();for(const root of this.forestTemplates21?.values()||[])root.traverse(m=>{m.geometry?.dispose();if(m.material){if(m.material.map&&!Object.values(this.textures).includes(m.material.map))atlasTextures.add(m.material.map);m.material.dispose();}});atlasTextures.forEach(t=>t.dispose());this.forestTemplates21?.clear();for(const a of this.forestRenderCache40?.values()||[]){a.geometry.dispose();a.material.dispose();a.depth.dispose();}this.forestRenderCache40?.clear();for(const root of this.forestTemplates19?.values()||[])root.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});this.forestTemplates19?.clear();for(const mesh of this.understoryTemplates19||[]){mesh?.geometry.dispose();mesh?.material.dispose();}this.forestChunks19?.clear();dispose.call(this);
 };
}
