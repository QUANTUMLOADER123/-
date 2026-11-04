import {isAttachment25} from './attachments25.js';
import {isClothing24} from './clothing24.js';
import {isGun} from './catalog.js';
const singles=new Set(['sleepingBag','rock','torch','axe','pickaxe','knife','hammer','armor','plan','furnace','workbench','storage','largeStorage','cupboard','recycler','repairBench','campfire','door','battery']);
const ammunition=new Set(['ammo','pistolAmmo','shells','rocket','hvRocket','incendiaryRocket']);
const smallStacks=new Set(['berries','water','bandage','antiseptic','traumaKit','syringe','medkit','cannedFood','mushroom','pumpkin','corn','meat','cookedMeat','satchel','timedCharge','f1Grenade','beancan']);
export const randomLootContainer=id=>!['build-','drop-','tc-'].some(p=>id.startsWith(p));
const baseLootLimit25=id=>isGun(id)||singles.has(id)||isClothing24(id)||isAttachment25(id)?1:ammunition.has(id)?64:smallStacks.has(id)?20:1000;
export const lootLimit=(id,context=1)=>{const m=typeof context==='object'?context?.multiplier:context;return baseLootLimit25(id)*(baseLootLimit25(id)===1?1:[1,2,5,10,50].includes(m)?m:1);};
export const lootAmount=(id,n,multiplier=1)=>Math.min(lootLimit(id,multiplier),Math.max(0,Math.floor(n*(isGun(id)||singles.has(id)||isClothing24(id)||isAttachment25(id)?1:multiplier))));
export function normalizeLoot(contents,context=1){let kept=false;for(const[id,n]of Object.entries(contents)){if(isGun(id)){if(kept){delete contents[id];continue;}kept=true;}const amount=Math.min(lootLimit(id,context),Math.max(0,Math.floor(n)));if(amount)contents[id]=amount;else delete contents[id];}return contents;}
