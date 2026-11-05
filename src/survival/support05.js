import {isFoundation,isFloor,isStructural} from './expansion.js';
import {buildingHeight} from './state.js';
/** Connectivity, not visual proximity: upper-storey deployables follow their floor. */
export function unsupportedPieces(state,staticEntries=[]){
 const live=state.buildings.filter(b=>b.hp>0),stable=new Set(live.filter(b=>isFoundation(b.kind)).map(b=>b.id));
 const floors=live.filter(b=>isFoundation(b.kind)||isFloor(b.kind));
 const contains=(f,b)=>{const dx=b.x-f.x,dz=b.z-f.z,c=Math.cos(f.rotation||0),s=Math.sin(f.rotation||0),x=dx*c-dz*s,z=dx*s+dz*c;return Math.abs(x)<=1.6&&Math.abs(z)<=1.6&&(!f.kind.toLowerCase().includes('triangle')||Math.abs(x)<=(1.5-z)/2+.15);};
 for(let pass=0;pass<32;pass++){let changed=false;for(const b of live){if(stable.has(b.id))continue;const y=buildingHeight(b);if(floors.some(f=>stable.has(f.id)&&f.id!==b.id&&Math.abs(y-(buildingHeight(f)+(isFloor(f.kind)?3:0)))<.55&&contains(f,b))){stable.add(b.id);changed=true;}}if(!changed)break;}
 // Ground-placeable items survive without a foundation unless they stood on a removed one.
 const removed=state.buildings.filter(b=>b.hp<=0&&(isFoundation(b.kind)||isFloor(b.kind)));
 const own=live.filter(b=>b.anchor38&&(state.depleted.includes(b.anchor38)||state.buildings.some(p=>p.id===b.anchor38&&p.hp<=0))||!stable.has(b.id)&&(isStructural(b.kind)||b.kind==='door'||b.kind==='cupboard'||removed.some(f=>contains(f,b)&&Math.abs(buildingHeight(b)-(buildingHeight(f)+(isFloor(f.kind)?3:0)))<.55)));
 const dead=new Set(state.depleted),foreign=staticEntries.filter(e=>!dead.has(e.data.id)&&e.data.supports?.length&&e.data.supports.every(id=>dead.has(id))).map(e=>e.data);
 return [...own,...foreign];
}
