import {isStructural} from './expansion.js';
import {TIERS} from './state.js';
const structural=b=>isStructural(b.kind)||b.kind==='door';
export const upkeepMaterial=b=>b.tier>=3?'metal':b.tier===2?'stone':'wood';
export function connectedHouse(s,cab){const pieces=s.buildings.filter(b=>b.hp>0&&structural(b)),found=pieces.filter(b=>Math.hypot(b.x-cab.x,b.z-cab.z)<2.8),ids=new Set(found.map(b=>b.id));for(let i=0;i<found.length;i++)for(const b of pieces)if(!ids.has(b.id)&&Math.hypot(b.x-found[i].x,b.z-found[i].z)<4.3&&Math.abs((b.y||0)-(found[i].y||0))<3.4){ids.add(b.id);found.push(b);}return found;}
export function upkeepInfo(s,id,pieces){const rates={};for(const b of pieces)if(b.hp>0&&structural(b)){const resource=upkeepMaterial(b);rates[resource]=(rates[resource]||0)+(b.tier===0?1:b.tier===1?2:3);}const credit=s.upkeep?.[id]?.credit||{},contents=s.containers?.[id]||{};return Object.entries(rates).map(([item,perHour])=>({item,perHour,count:contents[item]||0,hours:((contents[item]||0)*3600/perHour+(credit[item]||0))/3600}));}
const clocks=new WeakMap();
/** Playing time only: no surprise offline decay or cost when paused. */
export function advanceMaintenance(s,dt,staticEntries){const elapsed=(clocks.get(s)||0)+dt;clocks.set(s,elapsed);if(elapsed<10)return false;const step=elapsed;clocks.set(s,0);s.upkeep??={};const dead=new Set(s.depleted),protectedIds=new Set(),staticPieces=staticEntries.map(e=>e.data),all=[...s.buildings,...staticPieces];let changed=false;
 const groups=[];for(const cab of s.buildings.filter(b=>b.kind==='cupboard'&&b.hp>0))groups.push({id:cab.id,pieces:connectedHouse(s,cab)});
 for(const cab of staticPieces.filter(b=>b.kind==='cupboard'&&!dead.has(b.id)))groups.push({id:cab.id,pieces:staticPieces.filter(b=>b.owner===cab.owner&&structural(b)&&!dead.has(b.id))});
 const decay=(b,unpaid=1)=>{const max=TIERS[b.tier||0].hp,damage=max*step*unpaid/(b.tier===0?900:b.tier===1?7200:10800);if(b.owner){const hp=Math.max(0,(s.structureDamage[b.id]??max)-damage);s.structureDamage[b.id]=hp;if(hp<=0&&!dead.has(b.id)){s.depleted.push(b.id);dead.add(b.id);}}else b.hp=Math.max(0,b.hp-damage);changed=true;};
 for(const {id,pieces}of groups){const assigned=pieces.filter(b=>!protectedIds.has(b.id));const record=s.upkeep[id]??={credit:{}},info=upkeepInfo(s,id,assigned);record.credit??={};for(const row of info){let credit=Number(record.credit[row.item])||0;while(credit<step&&(s.containers[id]?.[row.item]||0)>0){if(--s.containers[id][row.item]===0)delete s.containers[id][row.item];credit+=3600/row.perHour;}const paid=Math.min(1,credit/step);record.credit[row.item]=Math.max(0,credit-step);for(const b of assigned)if(upkeepMaterial(b)===row.item){protectedIds.add(b.id);if(paid<1)decay(b,1-paid);}}}
 for(const b of all)if(structural(b)&&b.hp>0&&!dead.has(b.id)&&!protectedIds.has(b.id))decay(b);
 return changed;
}
