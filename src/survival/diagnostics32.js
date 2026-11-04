import {slopeAt32} from './ecology32.js';
import {terrainHeight} from './state.js';
/** Read-only smoke-test facts; no position changes, grants or gameplay controls. */
export function diagnostics32(w,s){
 const ground=(w.interactables||[]).filter(i=>['crate','barrel'].includes(i.type)&&!i.owner&&!i.site17&&!i.fixedSupport25&&!i.data&&!i.id.startsWith('drop-'));
 return{revision:s.contentRevision,terrainPatches:w.terrain?.children.length||0,cacti:(w.cacti18||[]).length,aliveCacti:(w.cacti18||[]).filter(c=>c.alive&&!s.depleted.includes(c.id)).length,slopeOmitted:w.slopeOmitted32||0,groundLoot:ground.map(i=>({id:i.id,slope:slopeAt32(terrainHeight,i.x,i.z)})),rigs:w.distantGroups.filter(g=>g.root.userData.oilLod32).map(g=>({distance:Math.hypot(g.x-s.position.x,g.z-s.position.z),far:g.root.userData.oilLod32.proxy.visible})),houses:[...(w.settlements05?.values()||[])].map(h=>({id:h.base.id,skirts:h.posts?.posts.length||0,furniture:h.furnitureRects32||[],cupboards:w.staticStructures.filter(e=>e.settlement===h.base.id&&e.data.kind==='cupboard').length,secureDoors:h.entries.filter(e=>e.data.kind==='door'&&/-1000[0-3]$/.test(e.data.id)).length})),programs:w.renderer.info.programs?.length||0};
}
