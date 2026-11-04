import {isAttachment25} from './attachments25.js';
import {isClothing24} from './clothing24.js';
import {lootAmount,normalizeLoot,randomLootContainer} from './loot-policy.js';
import {firearmForTier,crateTier} from './loot04.js';
import {WEAPONS,isGun} from './catalog.js';
/** Six belt + thirty backpack slots. Aggregated totals remain the crafting adapter. */
export const SLOT_COUNT=36;
const SINGLE=new Set(['rock','torch','axe','pickaxe','knife','hammer','rifle','armor','furnace','workbench','plan','storage','largeStorage','cupboard','recycler','repairBench']);
const baseStack25=item=>SINGLE.has(item)||isGun(item)||isClothing24(item)||isAttachment25(item)?1:['ammo','pistolAmmo','shells','rocket','hvRocket','incendiaryRocket'].includes(item)?64:['berries','bandage','syringe','medkit','antiseptic','traumaKit','water','satchel'].includes(item)?20:['foundation','wall','door','roof','campfire','battery'].includes(item)?10:1000;
export function stackLimit(item,context=1){const m=typeof context==='object'?context?.multiplier:context;return baseStack25(item)*(baseStack25(item)===1?1:[1,2,5,10,50].includes(m)?m:1);}
export function slotTotals(slots){const out={};for(const s of slots)if(s)out[s.item]=(out[s.item]||0)+s.count;return out;}
const backpackOrder=[...Array.from({length:30},(_,i)=>i+6)];
export function capacity(slots,item,context=1){return slots.reduce((n,s,i)=>n+(!canHold08(item)&&i<6?0:!s?stackLimit(item,context):s.item===item?stackLimit(item,context)-s.count:0),0);}
export const canHold08=item=>isGun(item)||['rock','torch','axe','pickaxe','knife','hammer','plan','knife','satchel','timedCharge','f1Grenade','beancan','bandage','antiseptic','traumaKit','syringe','medkit','berries','cannedFood','water','mushroom','corn','pumpkin','cookedMeat','meat','furnace','workbench','campfire','storage','largeStorage','cupboard','repairBench','recycler'].includes(item);
function pack(slots,item,amount,context=1){const order=canHold08(item)?[0,1,2,3,4,5,...Array.from({length:30},(_,i)=>i+6)]:backpackOrder;let left=amount;for(const i of order){const s=slots[i];if(s?.item===item&&s.count<stackLimit(item,context)){const n=Math.min(left,stackLimit(item,context)-s.count);s.count+=n;left-=n;if(!left)return 0;}}for(const i of order)if(!slots[i]){const n=Math.min(left,stackLimit(item,context));slots[i]={item,count:n};left-=n;if(!left)return 0;}return left;}
export function syncSlots(state){
 if(!Array.isArray(state.slots)||state.slots.length!==SLOT_COUNT){state.slots=Array(SLOT_COUNT).fill(null);for(const [i,item]of[[0,'rock'],[1,'torch']])if(state.inventory[item]>0)state.slots[i]={item,count:Math.min(state.inventory[item],stackLimit(item,state))};}
 const totals=slotTotals(state.slots),overflow={};
 for(const [item,n]of Object.entries(totals)){let excess=n-(state.inventory[item]||0);for(let i=SLOT_COUNT-1;i>=0&&excess>0;i--)if(state.slots[i]?.item===item){const take=Math.min(excess,state.slots[i].count);state.slots[i].count-=take;excess-=take;if(!state.slots[i].count)state.slots[i]=null;}}
 const now=slotTotals(state.slots);for(const [item,n]of Object.entries(state.inventory)){const add=n-(now[item]||0);if(add>0){const left=pack(state.slots,item,add,state);if(left){overflow[item]=left;state.inventory[item]-=left;}}}
 return overflow;
}
export function equipSlot(state,item){syncSlots(state);let index=state.slots.findIndex(s=>s?.item===item);if(index<0)return -1;if(index>=6){let to=state.slots.slice(0,6).findIndex(s=>!s);if(to<0)to=['rifle','axe'].includes(item)?1:0;[state.slots[to],state.slots[index]]=[state.slots[index],state.slots[to]];index=to;}return index;}
export function moveSlot(state,from,to,split=false){syncSlots(state);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=SLOT_COUNT||to>=SLOT_COUNT||from===to||!state.slots[from])return false;const a=state.slots[from],b=state.slots[to],n=split?Math.ceil(a.count/2):a.count;if(!b||b.item===a.item){const move=Math.min(n,stackLimit(a.item,state)-(b?.count||0));if(!move)return false;state.slots[to]={item:a.item,count:(b?.count||0)+move};a.count-=move;if(!a.count)state.slots[from]=null;}else{if(split)return false;[state.slots[from],state.slots[to]]=[b,a];}return true;}
export function takeContainer(state,id,item,amount=Infinity){syncSlots(state);const c=state.containers?.[id];if(!c||!(c[item]>0))return 0;const n=Math.min(c[item],Math.max(0,Math.floor(amount===Infinity?c[item]:amount)),capacity(state.slots,item,state));if(!n)return 0;pack(state.slots,item,n,state);state.inventory[item]=(state.inventory[item]||0)+n;c[item]-=n;if(!c[item])delete c[item];return n;}
export function depositSlot(state,id,index,half=false){syncSlots(state);const s=state.slots[index];if(!s||!state.containers?.[id])return 0;if((id.startsWith('tc-')||state.buildings.some(b=>b.id===id&&b.kind==='cupboard'))&&!['wood','stone','metal','highMetal'].includes(s.item))return 0;const storage=state.buildings.find(b=>b.id===id&&['storage','largeStorage','cupboard'].includes(b.kind)),c=state.containers[id],limit=storage?(storage.kind==='storage'?12:storage.kind==='cupboard'?24:30):id.startsWith('tc-')?24:Infinity,used=Object.entries(c).reduce((n,[k,v])=>n+Math.ceil(v/stackLimit(k,state)),0),partial=c[s.item]?Math.ceil(c[s.item]/stackLimit(s.item,state))*stackLimit(s.item,state)-c[s.item]:0;const n=Math.min(half?Math.ceil(s.count/2):s.count,partial+(limit-used)*stackLimit(s.item,state));if(n<=0)return 0;state.containers[id][s.item]=(state.containers[id][s.item]||0)+n;state.inventory[s.item]-=n;s.count-=n;if(!s.count)state.slots[index]=null;return n;}
export function createContainer(state,id,base,gunChance=.8,guaranteedGun=null){
 state.containers??={};if(Object.hasOwn(state.containers,id))return randomLootContainer(id)?normalizeLoot(state.containers[id],state):state.containers[id];const out={};
 if(!state.looted.includes(id)){let h=state.seed>>>0;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);h=Math.imul(h^h>>>16,0x7feb352d);h=Math.imul(h^h>>>15,0x846ca68b);h^=h>>>16;const roll=(h>>>0)/4294967296;
  for(const [item,n]of Object.entries(base))if(!isGun(item)&&n>0)out[item]=lootAmount(item,n,state.multiplier);
  if(isGun(guaranteedGun)||roll<gunChance){const gun=isGun(guaranteedGun)?guaranteedGun:firearmForTier(id,state.seed,crateTier(id,state.seed));out[gun]=1;out[WEAPONS[gun].ammo]??=lootAmount(WEAPONS[gun].ammo,WEAPONS[gun].capacity,state.multiplier);}
  if((Math.imul(h,1664525)+1013904223>>>0)/4294967296<.35)out.bandage=(out.bandage||0)+state.multiplier;
 }
 state.containers[id]=normalizeLoot(out,state);return state.containers[id];
}
