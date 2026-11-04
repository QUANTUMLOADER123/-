import {naturalHeight13,riverProfile13,coastDistance13} from './terrain13.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
let cache;
function uplands(seed){
 if(cache?.seed===seed)return cache.hills;let n=seed^0x217ab9;
 const r=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296),phase=r()*Math.PI*2;
 const hills=Array.from({length:4},(_,i)=>{const angle=phase+i*Math.PI/2,rad=100+r()*65;return{x:Math.cos(angle)*rad,z:Math.sin(angle)*rad,rx:65+r()*38,rz:75+r()*42,height:34+r()*26};});cache={seed,hills};return hills;
}
/** Revision 12: broad rounded uplands, low valleys and local undulation.
 * RT grading selects ONE strongest pad, never repeatedly flattens the land. */
export function landscape21(x,z,scale,seed,noise,sites){
 const river=(a,b)=>riverProfile13(a,b,scale,seed),hills=uplands(seed);
 const raw=(a,b)=>{const u=a/scale,v=b/scale,r=river(a,b),coast=smooth((coastDistance13(a,b,scale,seed)-12)/110),channel=r?smooth((r.distance-r.width*.5-5)/38):1;
  let ridge=0;for(const h of hills)ridge+=h.height*Math.exp(-(((u-h.x)/h.rx)**2+((v-h.z)/h.rz)**2));
  const rolling=(noise(a/110+41,b/110-57)-.5)*9+(noise(a/38-12,b/38+71)-.5)*2.2;
  return naturalHeight13(a,b,scale,seed,noise,river)+(ridge+rolling)*coast*channel;
 };
 let h=raw(x,z),weight=0,target=h;
 const coast=smooth(coastDistance13(x,z,scale,seed)/22),r=river(x,z),channel=r?smooth((r.distance-r.width*.5-4)/18):1;
 for(const m of sites){if(m.kind==='oilrig')continue;const d=Math.hypot(x-m.x,z-m.z),shoulder=Math.max(18,m.radius*.72);if(d>m.radius+shoulder)continue;const f=(1-smooth((d-m.radius)/shoulder))*coast*channel;if(f>weight){weight=f;m.padHeight21??=raw(m.x,m.z);target=m.padHeight21;}}
 h+=(target-h)*weight;
 // Small camp only: the old 67m-radius clearing erased too much central relief.
 const camp=1-smooth((Math.hypot(x+6,z+3)-18)/24);return h*(1-camp)+(camp>0?raw(-6,-3):h)*camp;
}
