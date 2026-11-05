/** Static broad phase for LOS. Index the FULL obstacle footprint, not just its
 * centre, so large rotated tanks/walls spanning cells cannot disappear from LOS. */
export function installSpatial28(World){
 World.prototype.rayCandidates28=function(key,list,a,b,trees=false){
  this.rayGrids28??=new Map();let grid=this.rayGrids28.get(key);if(!grid||grid.source!==list||grid.count!==list.length){grid={source:list,count:list.length,cells:new Map()};
   for(const o of list){if(trees&&o.type!=='tree')continue;const c=Math.abs(Math.cos(o.rotation||0)),s=Math.abs(Math.sin(o.rotation||0)),rx=trees?.6:(o.box||o.ow||o.w)?((o.ow||o.w||1)*c+(o.od||o.d||1)*s)/2:(o.r||.5),rz=trees?.6:(o.box||o.ow||o.w)?((o.ow||o.w||1)*s+(o.od||o.d||1)*c)/2:(o.r||.5);
    for(let x=Math.floor((o.x-rx)/32);x<=Math.floor((o.x+rx)/32);x++)for(let z=Math.floor((o.z-rz)/32);z<=Math.floor((o.z+rz)/32);z++){const k=x+':'+z;if(!grid.cells.has(k))grid.cells.set(k,[]);grid.cells.get(k).push(o);}
   }this.rayGrids28.set(key,grid);
  }
  const result=new Set();if(![a.x,a.z,b.x,b.z].every(Number.isFinite))return result;
  const visit=(x,z)=>{for(const c of grid.cells.get(x+':'+z)||[])result.add(c);},edge=p=>Number.isInteger(p/32);
  // Full-footprint indexing permits exact grid traversal instead of scanning
  // nine neighboring buckets every 16m. Include corner/edge tangencies.
  const endpoint=p=>{const x=Math.floor(p.x/32),z=Math.floor(p.z/32);visit(x,z);if(edge(p.x))visit(x-1,z);if(edge(p.z))visit(x,z-1);if(edge(p.x)&&edge(p.z))visit(x-1,z-1);};
  endpoint(a);endpoint(b);let x=Math.floor(a.x/32),z=Math.floor(a.z/32);const ex=Math.floor(b.x/32),ez=Math.floor(b.z/32),dx=b.x-a.x,dz=b.z-a.z,sx=Math.sign(dx),sz=Math.sign(dz),tx=dx?32/Math.abs(dx):Infinity,tz=dz?32/Math.abs(dz):Infinity;
  let nextX=dx?((x+(sx>0?1:0))*32-a.x)/dx:Infinity,nextZ=dz?((z+(sz>0?1:0))*32-a.z)/dz:Infinity;
  const columnEdge=dx===0&&edge(a.x),rowEdge=dz===0&&edge(a.z),cell=()=>{visit(x,z);if(columnEdge)visit(x-1,z);if(rowEdge)visit(x,z-1);};cell();
  const limit=Math.abs(ex-x)+Math.abs(ez-z)+2;
  for(let i=0;(x!==ex||z!==ez)&&i<limit;i++){
   if(Math.min(nextX,nextZ)>1+1e-12)break;
   if(Math.abs(nextX-nextZ)<1e-12){visit(x+sx,z);visit(x,z+sz);x+=sx;z+=sz;nextX+=tx;nextZ+=tz;}
   else if(nextX<nextZ){x+=sx;nextX+=tx;}else{z+=sz;nextZ+=tz;}cell();
  }
  return result;
 };
}
