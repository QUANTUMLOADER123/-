import {MONUMENTS,BOT_BASES} from './map-data.js';
import {terrainHeight} from './state.js';
import {floorContains08,floorY08} from './roads08.js';
/** Small spatial exclusion buckets, not 140+ compound scans per grass blade.
 * No grass through foundations, RT slabs, water or vertical cliff faces. */
export function grassGround19(w,x,z,h){
 if(h<1.1)return false;
 const buildings=w.state04?.buildings||w.foliageExclusions19||[],key=buildings.length;
 if(!w.coverCells19||w.coverBuildings19!==buildings||w.coverCount19!==key){
  w.coverBuildings19=buildings;w.coverCount19=key;w.coverCells19=new Map();
  const put=(o,r)=>{for(let a=Math.floor((o.x-r)/24);a<=Math.floor((o.x+r)/24);a++)for(let b=Math.floor((o.z-r)/24);b<=Math.floor((o.z+r)/24);b++){const k=a+':'+b;if(!w.coverCells19.has(k))w.coverCells19.set(k,[]);w.coverCells19.get(k).push({...o,r});}};
  for(const m of MONUMENTS)if(m.kind!=='oilrig')put(m,m.radius+1);
  for(const b of BOT_BASES)put(b,7);
  for(const b of buildings)if(b.hp>0)put(b,2.1);
 }
 for(const o of w.coverCells19.get(Math.floor(x/24)+':'+Math.floor(z/24))||[])if((o.hp===undefined||o.hp>0)&&Math.hypot(x-o.x,z-o.z)<o.r)return false;
 if(Math.max(Math.abs(terrainHeight(x+.4,z)-terrainHeight(x-.4,z)),Math.abs(terrainHeight(x,z+.4)-terrainHeight(x,z-.4)))>.8)return false;
 for(const f of w.nearFloors05?.(x,z)||[]){const y=floorY08(f,x,z);if(y>=h-.1&&y<h+1.8&&floorContains08(f,x,z))return false;}
 return true;
}
