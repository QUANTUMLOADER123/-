import * as legacy from './items33.js';
import {ITEMS37,USE37,RECIPES37,RECYCLE37,LOOT37} from './items37.js';
// Compatibility names consumed by existing systems; historical exports remain immutable.
export const ITEMS33={...legacy.ITEMS33,...ITEMS37},USE33={...legacy.USE33,...USE37},RECIPES33={...legacy.RECIPES33,...RECIPES37},RECYCLE33={...legacy.RECYCLE33,...RECYCLE37};
export const LOOT33=Object.fromEntries(Object.keys(legacy.LOOT33).map(t=>[t,{...legacy.LOOT33[t],...LOOT37[t]}]));
