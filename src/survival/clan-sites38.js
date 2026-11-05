import {BOT_BASES,MAP_REVISION,distanceToRoad,monumentAt} from './map-data.js';
import {terrainHeight,randomSeed} from './state.js';
import {housePlan20,hashHouse20} from './house-plans20.js';
import {houseRank38} from './house-loot38.js';
import {compoundLayout38} from './compound-layout38.js';
/** Shared by static fences and finite faction bootstrap, including unloaded houses. */
export function clanSite38(base,seed){
 if(!base||MAP_REVISION<17)return null;
 const p=housePlan20(base,BOT_BASES,randomSeed(hashHouse20(seed,base.id+'house20')));if(houseRank38(base,p.wealth)<1)return null;
 const layout=compoundLayout38(p.plan,p.airlock||p.entry,p.world,{height:terrainHeight,clear:(x,z)=>distanceToRoad(x,z,6)>=4&&!monumentAt(x,z)&&!BOT_BASES.some(b=>b!==base&&Math.hypot(x-b.x,z-b.z)<10)});
 return layout?{...p,layout}:null;
}
export function clanHomes38(seed){
 const homes=BOT_BASES.filter(b=>!b.raided),yards=new Set(homes.filter(b=>clanSite38(b,seed)).map(b=>b.id));
 // Prefer large safe compounds, then other tall houses. Capacity remains 1 + floors.
 return homes.sort((a,b)=>((b.stories||1)+(yards.has(b.id)?2:0))-((a.stories||1)+(yards.has(a.id)?2:0))||Number(yards.has(b.id))-Number(yards.has(a.id))||a.id.localeCompare(b.id));
}
