import {coastDistance13,riverProfile13} from './terrain13.js';
/** New-world-only packing: enlarged RTs must not occupy one another's yards/pad cores. */
export function spaceSites34(sites,scale,seed){
 const placed=[],copies=sites.map(m=>({...m})),order=copies.filter(m=>m.kind!=='oilrig').sort((a,b)=>((['lighthouse','harbor'].includes(b.kind)?1000:0)+b.radius)-((['lighthouse','harbor'].includes(a.kind)?1000:0)+a.radius));
 for(const m of order){const anchor={x:m.x,z:m.z};const valid=(x,z)=>{const shore=coastDistance13(x,z,scale,seed),r=riverProfile13(x,z,scale,seed);return shore>m.radius*(['lighthouse','harbor'].includes(m.kind)?.12:.78)&&Math.hypot(x+6,z+3)>m.radius+35&&(!r||r.sourceFade<.1||r.distance>r.width/2+m.radius*.98+8)&&placed.every(p=>Math.hypot(x-p.x,z-p.z)>m.radius+p.radius+8);};let chosen=valid(m.x,m.z)?anchor:null;
  search:for(let distance=8;!chosen&&distance<600*scale;distance+=8){const n=Math.ceil(distance*Math.PI*2/8);for(let i=0;i<n;i++){const angle=i/n*Math.PI*2+(seed%37)*.17,x=anchor.x+Math.sin(angle)*distance,z=anchor.z+Math.cos(angle)*distance;if(valid(x,z)){chosen={x,z};break search;}}}
  if(!chosen)throw new Error('No separated DEV34 site footprint for '+m.id);Object.assign(m,chosen);delete m.padHeight32;delete m.padHeight34;placed.push(m);
 }
 return copies;
}
