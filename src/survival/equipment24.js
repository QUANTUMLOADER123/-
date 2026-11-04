import {syncSlots,capacity} from './inventory.js';
import {CLOTHING24,isClothing24} from './clothing24.js';
/** Equipment owns items separately from backpack totals. One item per fixed body slot. */
export function equipClothing24(state,from,target=null){
 syncSlots(state);const slot=state.slots[from],c=slot&&CLOTHING24[slot.item];
 if(!c||slot.count!==1||target!==null&&target!==c.index)return false;
 state.wear24??=Array(7).fill(null);const old=state.wear24[c.index],id=slot.item;
 // Atomic swap into the freed source slot also works with a completely full backpack.
 state.inventory[id]--;state.wear24[c.index]=id;state.slots[from]=old?{item:old,count:1}:null;
 if(old)state.inventory[old]=(state.inventory[old]||0)+1;
 return true;
}
export function unequipClothing24(state,index){
 syncSlots(state);const id=state.wear24?.[index];if(!isClothing24(id)||capacity(state.slots,id,state)<1)return false;
 state.inventory[id]=(state.inventory[id]||0)+1;state.wear24[index]=null;syncSlots(state);return true;
}
/** The first-person rig has shared per-world materials, never global templates. */
export function updateWearView24(world,state){
 const mats=world?.viewMaterials14;if(!mats)return;const key=(state.wear24||[]).join(':');if(world.wearViewKey24===key)return;world.wearViewKey24=key;
 const glove=CLOTHING24[state.wear24?.[5]],shirt=CLOTHING24[state.wear24?.[2]],outer=CLOTHING24[state.wear24?.[3]],sleeve=outer&&!['vest','plate','kevlar'].includes(outer.shape)?outer:shirt;
 if(mats.glove){mats.glove.color.set(glove?.color||'#bd987b');mats.glove.roughness=glove?.grade>=6?.64:.94;}
 if(mats.cloth)mats.cloth.color.set(sleeve?.color||'#bd987b');
 for(const hand of [world.rightHand04,world.leftHand04])hand?.traverse(o=>{if(!o.isMesh)return;o.userData.wearBase24??=o.material===mats.glove?'glove':o.material===mats.skin?'skin':o.material===mats.nail?'nail':'other';const part=o.userData.wearBase24;if(part==='glove')o.visible=!!glove;else if(part==='skin')o.material=glove&&glove.shape!=='wraps'?mats.glove:mats.skin;else if(part==='nail')o.visible=!glove||glove.shape==='wraps';});
 for(const arm of world.arms14||[])arm.root.traverse(o=>{if(!o.isMesh)return;o.userData.wearBase24??=o.material===mats.cloth?'sleeve':o.material===mats.glove?'cuff':o.material===mats.seam?'seam':'other';const part=o.userData.wearBase24;if(part==='sleeve')o.material=sleeve?mats.cloth:mats.skin;else if(part==='cuff')o.visible=!!glove;else if(part==='seam')o.visible=!!sleeve;});
}
