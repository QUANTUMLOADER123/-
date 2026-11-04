import {housePlan20,hashHouse20} from './house-plans20.js';
import {MAP_REVISION,MAP_SEED,MONUMENTS,BOT_BASES} from './map-data.js';
import {terrainHeight,randomSeed} from './state.js';
import {floorContains08,floorY08} from './roads08.js';
/** Small spatial exclusion buckets, not 140+ compound scans per grass blade.
 * No grass through foundations, RT slabs, water or vertical cliff faces. */
export function grassGround19(w,x,z,h,gradient=null){
 if(h<1.1)return false;
 const buildings=w.state04?.buildings||w.foliageExclusions19||[],key=buildings.length;
 if(!w.coverCells19||w.coverBuildings19!==buildings||w.coverCount19!==key||w.coverVersion19!==w.coverEpoch22){
  w.coverVersion19=w.coverEpoch22;w.coverBuildings19=buildings;w.coverCount19=key;w.coverCells19=new Map();
  const put=(o,r)=>{for(let a=Math.floor((o.x-r)/24);a<=Math.floor((o.x+r)/24);a++)for(let b=Math.floor((o.z-r)/24);b<=Math.floor((o.z+r)/24);b++){const k=a+':'+b;if(!w.coverCells19.has(k))w.coverCells19.set(k,[]);w.coverCells19.get(k).push({...o,r,source:o});}};
  for(const m of MONUMENTS)if(m.kind!=='oilrig')put(m,m.radius+1);
  for(const b of BOT_BASES){if(MAP_REVISION<11){put(b,7);continue;}const shape=housePlan20(b,BOT_BASES,randomSeed(hashHouse20(MAP_SEED,b.id+'house20')));for(const p of shape.plan){put(shape.world(p.x,p.z),2.5);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])if(!shape.plan.some(q=>q.x===p.x+dx*3&&q.z===p.z+dz*3))put(shape.world(p.x+dx*3.1,p.z+dz*3.1),1.8);}}
  for(const b of buildings)if(b.hp>0)put(b,2.1);
 }
 for(const o of w.coverCells19.get(Math.floor(x/24)+':'+Math.floor(z/24))||[])if((o.source.hp===undefined||o.source.hp>0)&&Math.hypot(x-o.x,z-o.z)<o.r)return false;
 if((gradient??Math.max(Math.abs(terrainHeight(x+.4,z)-terrainHeight(x-.4,z))/.8,Math.abs(terrainHeight(x,z+.4)-terrainHeight(x,z-.4))/.8))>1)return false;
 for(const f of w.nearFloors05?.(x,z)||[]){if(f.structureId&&w.deadIds05?.has(f.structureId))continue;const y=floorY08(f,x,z);if(y>=h-.1&&y<h+1.8&&floorContains08(f,x,z))return false;}
 return true;
}
