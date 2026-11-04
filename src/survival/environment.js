import {biomeRegion18} from './biome18.js';
import {MAP_SCALE,MAP_REVISION,MAP_SEED} from './map-data.js';
import {noise} from './state.js';
export const DAY_SECONDS=1800; // 30 real minutes per day; elapsed is already persisted.
export function worldTime(elapsed){
 const total=515+Math.max(0,elapsed)/DAY_SECONDS*1440,minutes=total%1440,hour=minutes/60;
 const elevation=Math.sin((hour-6)/24*Math.PI*2),daylight=Math.max(0,Math.min(1,(elevation+.12)/.42));
 return{day:1+Math.floor(total/1440),minutes,hour,elevation,daylight,night:daylight<.12};
}
export function biomeAt(x,z){return biomeRegion18(x,z,MAP_SCALE,MAP_REVISION,MAP_SEED,noise);}
