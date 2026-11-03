import {coastDistance13} from './terrain13.js';
import {MAP_SCALE,MAP_REVISION,MAP_SEED} from './map-data.js';
import {noise} from './state.js';
export const DAY_SECONDS=1800; // 30 real minutes per day; elapsed is already persisted.
export function worldTime(elapsed){
 const total=515+Math.max(0,elapsed)/DAY_SECONDS*1440,minutes=total%1440,hour=minutes/60;
 const elevation=Math.sin((hour-6)/24*Math.PI*2),daylight=Math.max(0,Math.min(1,(elevation+.12)/.42));
 return{day:1+Math.floor(total/1440),minutes,hour,elevation,daylight,night:daylight<.12};
}
export function biomeAt(x,z){
 const u=x/MAP_SCALE,v=z/MAP_SCALE,w=(noise(u*.012+73,v*.012-18)-.5)*45;
 if(v+w<-88)return{id:'snow',name:MAP_REVISION>=6?'Север · снежное редколесье':'Зима · снежное нагорье',color:0xc7d3d0,grass:.15};
 if(u+w>58&&v-w>48)return{id:'arid',name:'Пустыня',color:0xd8bc83,grass:.035};
 if(MAP_REVISION>=6?coastDistance13(x,z,MAP_SCALE,MAP_SEED)<30:Math.hypot(u*.97,v)>269)return{id:'coast',name:'Побережье',color:0xb5a377,grass:.35};
 return{id:'forest',name:'Зелёная долина',color:0x72815b,grass:1};
}
