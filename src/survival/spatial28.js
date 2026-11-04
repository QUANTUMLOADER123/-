/** Static broad phase for LOS. Index the FULL obstacle footprint, not just its
 * centre, so large rotated tanks/walls spanning cells cannot disappear from LOS. */
export function installSpatial28(World){
 World.prototype.rayCandidates28=function(key,list,a,b,trees=false){
  this.rayGrids28??=new Map();let grid=this.rayGrids28.get(key);if(!grid||grid.source!==list||grid.count!==list.length){grid={source:list,count:list.length,cells:new Map()};
   for(const o of list){if(trees&&o.type!=='tree')continue;const c=Math.abs(Math.cos(o.rotation||0)),s=Math.abs(Math.sin(o.rotation||0)),rx=trees?.6:(o.box||o.ow||o.w)?((o.ow||o.w||1)*c+(o.od||o.d||1)*s)/2:(o.r||.5),rz=trees?.6:(o.box||o.ow||o.w)?((o.ow||o.w||1)*s+(o.od||o.d||1)*c)/2:(o.r||.5);
    for(let x=Math.floor((o.x-rx)/32);x<=Math.floor((o.x+rx)/32);x++)for(let z=Math.floor((o.z-rz)/32);z<=Math.floor((o.z+rz)/32);z++){const k=x+':'+z;if(!grid.cells.has(k))grid.cells.set(k,[]);grid.cells.get(k).push(o);}
   }this.rayGrids28.set(key,grid);
  }
  const result=new Set(),n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/16));
  for(let i=0;i<=n;i++){const x=Math.floor((a.x+(b.x-a.x)*i/n)/32),z=Math.floor((a.z+(b.z-a.z)*i/n)/32);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const c of grid.cells.get((x+dx)+':'+(z+dz))||[])result.add(c);}return result;
 };
}
