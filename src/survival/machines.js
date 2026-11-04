import {stationContext20} from './station-context20.js';
import {stackLimit,syncSlots,capacity} from './inventory.js';
export function furnaceFor(s,id){s.furnaces??={};return s.furnaces[id]??={slots:Array(6).fill(null),on:false,progress:0,fuelTime:0};}
const ores=['metalOre','sulfurOre','highMetalOre'];
export const furnaceAccepts=(index,item)=>index===0?item==='wood':index<3?ores.includes(item):false;
export function insertFurnace(s,id,from,to,half=false){syncSlots(s);const a=s.slots[from],f=furnaceFor(s,id),b=f.slots[to];if(!a||!Number.isInteger(to)||to<0||to>2||!furnaceAccepts(to,a.item)||b&&b.item!==a.item)return 0;const n=Math.min(half?Math.ceil(a.count/2):a.count,stackLimit(a.item,s)-(b?.count||0));if(n<=0)return 0;f.slots[to]={item:a.item,count:(b?.count||0)+n};a.count-=n;s.inventory[a.item]-=n;if(!a.count)s.slots[from]=null;if((f.slots[0]?.count||f.fuelTime>0)&&f.slots.slice(1,3).some(a=>a?.count))f.on=true;return n;}
export function takeFurnace(s,id,index,one=false){const f=furnaceFor(s,id),a=f.slots[index];if(!a)return 0;syncSlots(s);const room=capacity(s.slots,a.item,s),n=Math.min(a.count,one?1:a.count,room);if(!n)return 0;s.inventory[a.item]+=n;a.count-=n;if(!a.count)f.slots[index]=null;syncSlots(s);return n;}
function output(f,item,n,s){let at=f.slots.findIndex((v,i)=>i>=3&&v?.item===item&&v.count+n<=stackLimit(item,s));if(at<0)at=f.slots.findIndex((v,i)=>i>=3&&!v);if(at<0)return false;const a=f.slots[at];f.slots[at]={item,count:(a?.count||0)+n};return true;}
const product=ore=>ore==='metalOre'?'metal':ore==='highMetalOre'?'highMetal':'sulfur';
export function advanceFurnaces(s,dt){for(const b of [...s.buildings,...stationContext20(s)]){if(s.depleted.includes(b.id)||b.kind!=='furnace'||b.hp<=0)continue;const f=s.furnaces?.[b.id];if(!f?.on)continue;let remaining=Math.min(Math.max(0,dt),.25);while(remaining>1e-8){const sources=[1,2].filter(i=>f.slots[i]?.count),future={slots:f.slots.map(a=>a?{...a}:null)};if(!sources.length||!sources.every(i=>output(future,product(f.slots[i].item),1,s))||!output(future,'charcoal',1,s)){f.on=false;break;}
 if(f.fuelTime<=1e-8){if(!f.slots[0]?.count){f.on=false;break;}if(--f.slots[0].count===0)f.slots[0]=null;f.fuelTime=8;}
 const step=Math.min(remaining,f.fuelTime,Math.max(0,4-f.progress));remaining-=step;f.fuelTime-=step;f.progress+=step;if(f.progress>=4-1e-8){for(const i of sources){output(f,product(f.slots[i].item),1,s);if(--f.slots[i].count===0)f.slots[i]=null;}output(f,'charcoal',1,s);f.progress=0;}if(step<=0&&f.progress>0)break;
 }} }
