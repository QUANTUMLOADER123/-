import {WEAPONS,isGun} from './catalog.js';
/** Six belt + thirty backpack slots. Aggregated totals remain the crafting adapter. */
export const SLOT_COUNT=36;
const SINGLE=new Set(['rock','torch','axe','pickaxe','hammer','rifle','armor','furnace','workbench','plan','storage','largeStorage']);
export const stackLimit=item=>SINGLE.has(item)||isGun(item)?1:['ammo','pistolAmmo','shells'].includes(item)?64:['berries','bandage','water','satchel'].includes(item)?20:['foundation','wall','door','roof','campfire','battery'].includes(item)?10:1000;
export function slotTotals(slots){const out={};for(const s of slots)if(s)out[s.item]=(out[s.item]||0)+s.count;return out;}
const order=[...Array.from({length:30},(_,i)=>i+6),0,1,2,3,4,5];
export function capacity(slots,item){return slots.reduce((n,s)=>n+(!s?stackLimit(item):s.item===item?stackLimit(item)-s.count:0),0);}
function pack(slots,item,amount){let left=amount;for(const i of order){const s=slots[i];if(s?.item===item&&s.count<stackLimit(item)){const n=Math.min(left,stackLimit(item)-s.count);s.count+=n;left-=n;if(!left)return 0;}}for(const i of order)if(!slots[i]){const n=Math.min(left,stackLimit(item));slots[i]={item,count:n};left-=n;if(!left)return 0;}return left;}
export function syncSlots(state){
 if(!Array.isArray(state.slots)||state.slots.length!==SLOT_COUNT){state.slots=Array(SLOT_COUNT).fill(null);for(const [i,item]of[[0,'rock'],[1,'axe'],[2,'bandage'],[3,'berries'],[4,'plan'],[5,'torch']])if(state.inventory[item]>0)state.slots[i]={item,count:Math.min(state.inventory[item],stackLimit(item))};}
 const totals=slotTotals(state.slots),overflow={};
 for(const [item,n]of Object.entries(totals)){let excess=n-(state.inventory[item]||0);for(let i=SLOT_COUNT-1;i>=0&&excess>0;i--)if(state.slots[i]?.item===item){const take=Math.min(excess,state.slots[i].count);state.slots[i].count-=take;excess-=take;if(!state.slots[i].count)state.slots[i]=null;}}
 const now=slotTotals(state.slots);for(const [item,n]of Object.entries(state.inventory)){const add=n-(now[item]||0);if(add>0){const left=pack(state.slots,item,add);if(left){overflow[item]=left;state.inventory[item]-=left;}}}
 return overflow;
}
export function equipSlot(state,item){syncSlots(state);let index=state.slots.findIndex(s=>s?.item===item);if(index<0)return -1;if(index>=6){let to=state.slots.slice(0,6).findIndex(s=>!s);if(to<0)to=['rifle','axe'].includes(item)?1:0;[state.slots[to],state.slots[index]]=[state.slots[index],state.slots[to]];index=to;}return index;}
export function moveSlot(state,from,to,split=false){syncSlots(state);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=SLOT_COUNT||to>=SLOT_COUNT||from===to||!state.slots[from])return false;const a=state.slots[from],b=state.slots[to],n=split?Math.ceil(a.count/2):a.count;if(!b||b.item===a.item){const move=Math.min(n,stackLimit(a.item)-(b?.count||0));if(!move)return false;state.slots[to]={item:a.item,count:(b?.count||0)+move};a.count-=move;if(!a.count)state.slots[from]=null;}else{if(split)return false;[state.slots[from],state.slots[to]]=[b,a];}return true;}
export function takeContainer(state,id,item,amount=Infinity){syncSlots(state);const c=state.containers?.[id];if(!c||!(c[item]>0))return 0;const n=Math.min(c[item],Math.max(0,Math.floor(amount===Infinity?c[item]:amount)),capacity(state.slots,item));if(!n)return 0;pack(state.slots,item,n);state.inventory[item]=(state.inventory[item]||0)+n;c[item]-=n;if(!c[item])delete c[item];return n;}
export function depositSlot(state,id,index,half=false){syncSlots(state);const s=state.slots[index];if(!s||!state.containers?.[id])return 0;const storage=state.buildings.find(b=>b.id===id&&['storage','largeStorage'].includes(b.kind)),c=state.containers[id],limit=storage?(storage.kind==='storage'?12:30):Infinity,used=Object.entries(c).reduce((n,[k,v])=>n+Math.ceil(v/stackLimit(k)),0),partial=c[s.item]?Math.ceil(c[s.item]/stackLimit(s.item))*stackLimit(s.item)-c[s.item]:0;const n=Math.min(half?Math.ceil(s.count/2):s.count,partial+(limit-used)*stackLimit(s.item));if(n<=0)return 0;state.containers[id][s.item]=(state.containers[id][s.item]||0)+n;state.inventory[s.item]-=n;s.count-=n;if(!s.count)state.slots[index]=null;return n;}
export function createContainer(state,id,base,gunChance=.8){
 state.containers??={};if(Object.hasOwn(state.containers,id)){const c=state.containers[id];if(!id.startsWith('build-')&&!id.startsWith('drop-')){let kept=false;for(const gun of Object.keys(WEAPONS))if(c[gun]){if(kept)delete c[gun];else{c[gun]=1;kept=true;}}}return c;}const out={};
 if(!state.looted.includes(id)){let h=state.seed>>>0;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);h=Math.imul(h^h>>>16,0x7feb352d);h=Math.imul(h^h>>>15,0x846ca68b);h^=h>>>16;const roll=(h>>>0)/4294967296;
  for(const [item,n]of Object.entries(base))if(!isGun(item)&&n>0)out[item]=Math.floor(n*state.multiplier);
  if(roll<gunChance){const guns=Object.keys(WEAPONS),gun=guns[(h>>>8)%guns.length];out[gun]=1;out[WEAPONS[gun].ammo]??=WEAPONS[gun].capacity*state.multiplier;}
  if((Math.imul(h,1664525)+1013904223>>>0)/4294967296<.35)out.bandage=(out.bandage||0)+state.multiplier;
 }
 state.containers[id]=out;return out;
}
