import {WEAPONS} from './catalog.js';
/** Private, finite household inventories, NOT public random RT crates. */
export const householdContainer38=id=>id.startsWith('base-loot-');
export const houseRank38=(base,wealth)=>Math.min(3,Math.max(0,Math.floor(((base.tier||1)-1)*.55+((base.stories||1)-1)*.35+wealth*1.4)));
export function houseStock38(base,wealth,role,roll){
 const rank=houseRank38(base,wealth),scale=rank+1,out={};
 const add=(id,n)=>out[id]=(out[id]||0)+Math.max(1,Math.floor(n));
 const pools={supplies:{wood:180,stone:100,metal:65,fiber:50,scrap:22,rope:3,ductTape:3,tarp:2,sewingKit:2,metalBlade:3,metalPipe:3,gears:2,spring:3,metalSheet:3,copperOre:14,copperIngot:5,insulatedWire:2,bearingSet:1},medical:{bandage:5,water:4,proteinRation:3,energyGel:2,electrolyteDrink:3,hemostaticPack:2,burnSalve:2,cannedFood:4,antiseptic:2},armory:{metal:35,scrap:15,gunpowder:40,metalPipe:2,spring:3,semiBody:1}};
 for(const[id,n]of Object.entries(pools[role]||pools.supplies))if(roll()>.12)add(id,n*scale*(.6+roll()*.8));
 if(role==='armory'){
  const guns=rank===0?['pistol','revolver','shotgun']:rank===1?['semiRifle','smg','pistol','rifle']:rank===2?['assaultRifle','combatShotgun','compactSmg','boltRifle']:['akRifle','carbine26','machineGun','boltRifle','pdw26'];
  const start=Math.floor(roll()*guns.length);for(let i=0;i<rank+2;i++){const id=guns[(start+i)%guns.length];add(id,1);add(WEAPONS[id].ammo,WEAPONS[id].capacity*(2+rank));}
  if(rank>=2){add('pipeBomb',scale);add('satchel',rank);add('breachingCharge',rank-1);}
 }return out;
}
export function seedHouseContainer38(state,id,base,wealth,role,roll){
 state.containers??={};if(Object.hasOwn(state.containers,id))return state.containers[id];
 let out={};if(!state.looted.includes(id)&&!state.depleted.includes(id)&&!(base.raided&&!base.leftovers)){
  out=houseStock38(base,wealth,role,roll);
  if(base.raided)out=Object.fromEntries(Object.entries(out).filter(([k])=>!WEAPONS[k]&&roll()>.5).map(([k,n])=>[k,Math.max(1,Math.floor(n*.2))]));
  // Multipliers affect supplies, never firearms/tools. Household stocks are not clamped to one gun.
  for(const id in out)if(!WEAPONS[id]&&!['axe','pickaxe','hammer'].includes(id))out[id]*=state.multiplier||1;
 }state.containers[id]=out;return out;
}
