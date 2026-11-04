import {naturalHeight17} from './terrain17.js';
import {coastDistance13,riverProfile13} from './terrain13.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
/** Pure revision-10 terrain. Never multiply a mountain by distance to a road:
 * that was excavating 80m trenches in a 9m shoulder. Roads now follow land. */
export function noiseField19(seed){
 const hash=(x,z)=>{let n=(Math.imul(x,374761393)^Math.imul(z,668265263)^seed)>>>0;n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 return(x,z)=>{const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b);return(hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;};
}
export function landscape19(x,z,scale,seed,noise,sites){
 const river=(a,b)=>riverProfile13(a,b,scale,seed),raw=(a,b)=>naturalHeight17(a,b,scale,seed,noise,river,null);
 let h=raw(x,z),camp=1-smooth((Math.hypot(x+6,z+3)-22)/40);h=h*(1-camp)+1.7*camp;
 const coast=clamp(coastDistance13(x,z,scale,seed)/18),r=river(x,z),channel=r?smooth((r.distance-r.width*.5-3)/15):1;
 for(const m of sites){if(m.kind==='oilrig')continue;const d=Math.hypot(x-m.x,z-m.z),shoulder=Math.max(32,m.radius*1.3);if(d>=m.radius+shoulder)continue;
  if(m.padHeight19===undefined){const samples=[raw(m.x,m.z)];for(let i=0;i<8;i++){const a=i*Math.PI/4;samples.push(raw(m.x+Math.cos(a)*m.radius*.65,m.z+Math.sin(a)*m.radius*.65));}samples.sort((a,b)=>a-b);m.padHeight19=samples[3];}const f=(1-smooth((d-m.radius)/shoulder))*coast*channel;h=h*(1-f)+m.padHeight19*f;
 }
 return h;
}
