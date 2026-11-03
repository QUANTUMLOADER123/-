import {riverAt} from './map-data.js';
export function waterLevelAt(x,z){const r=riverAt(x,z);return r&&r.distance<=r.width*.5?r.water:0;}
export const safeCamp=(x,z)=>Math.hypot(x+6,z+3)<32;
export const DAMAGE_NAMES={water:'Глубокая вода',hunger:'Голод',thirst:'Обезвоживание',bot:'Выстрел скитальца',wolf:'Укус волка',explosion:'Взрыв'};
export function recordDamage(s,amount,source){s.lastDamage={source,amount,at:s.elapsed};}
