import {coastDistance13} from './terrain13.js';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const COLORS={forest:0x72815b,snow:0xc7d3d0,arid:0xd8bc83,coast:0xb5a377};
/** Shared continuous climate: warped ecotones, not straight diagonal colour cuts.
 * Cosmetic classification only: never calls terrainHeight or displaces saved terrain. */
export function biomeRegion18(x,z,scale,revision,seed,noise){
 const u=x/scale,v=z/scale,offset=(seed%997)*.021;
 const warp=(noise(u*.010+73+offset,v*.010-18)-.5)*38+(noise(u*.027-9,v*.027+offset)-.5)*12;
 const north=-88-v-warp,desert=Math.min(u-58+warp*.65,v-48-warp*.8);
 const snow=smooth(-14,14,north),arid=smooth(-16,16,desert)*(1-snow);
 const shore=revision>=6?coastDistance13(x,z,scale,seed)/scale:320-Math.hypot(u*.97,v);
 const coast=(1-smooth(18,43,shore))*(1-snow-arid),forest=Math.max(0,1-snow-arid-coast),weights={forest,snow,arid,coast};
 let id='forest';for(const k of ['snow','arid','coast'])if(weights[k]>weights[id])id=k;
 let red=0,green=0,blue=0;for(const [kind,w]of Object.entries(weights)){const c=COLORS[kind];red+=(c>>16&255)*w;green+=(c>>8&255)*w;blue+=(c&255)*w;}
 const color=(Math.round(red)<<16)|(Math.round(green)<<8)|Math.round(blue),name={forest:'Зелёная долина',snow:'Север · снежное редколесье',arid:'Пустыня',coast:'Побережье'}[id];
 return{id,name,color,grass:forest+snow*.15+arid*.035+coast*.35,weights25:weights,climate25:snow-arid*.9};
}
