import {isGun} from './catalog.js';
const singles=new Set(['rock','torch','axe','pickaxe','hammer','armor','plan','furnace','workbench','storage','largeStorage','cupboard','recycler','repairBench','campfire','door','battery']);
const ammunition=new Set(['ammo','pistolAmmo','shells','rocket','hvRocket','incendiaryRocket']);
const smallStacks=new Set(['berries','water','bandage','antiseptic','traumaKit','syringe','medkit','cannedFood','mushroom','pumpkin','corn','meat','cookedMeat','satchel','timedCharge','f1Grenade','beancan']);
export const randomLootContainer=id=>!['build-','drop-','tc-'].some(p=>id.startsWith(p));
export const lootLimit=id=>isGun(id)||singles.has(id)?1:ammunition.has(id)?64:smallStacks.has(id)?20:1000;
export const lootAmount=(id,n,multiplier=1)=>Math.min(lootLimit(id),Math.max(0,Math.floor(n*(isGun(id)||singles.has(id)?1:multiplier))));
export function normalizeLoot(contents){let kept=false;for(const[id,n]of Object.entries(contents)){if(isGun(id)){if(kept){delete contents[id];continue;}kept=true;}const amount=lootAmount(id,n);if(amount)contents[id]=amount;else delete contents[id];}return contents;}
