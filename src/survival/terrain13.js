/** Revision 6: artistic low-relief island terrain, in metres; not an erosion simulator.
 * Pure helpers, no state/DOM imports: map configuration must remain lazy at entry.
 * Normalized coordinates control continental shape; world-space detail keeps its
 * wavelength when the island is enlarged. Older terrain revisions never call this.
 */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*t*(t*(t*6-15)+10);};
let cached=null;
function parameters(scale,seed){
 if(cached?.scale===scale&&cached.seed===seed)return cached;
 let n=(seed^0x13b84f)>>>0;const rand=()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;
 return cached={scale,seed,phase:rand()*Math.PI*2,phase2:rand()*Math.PI*2,offsetX:rand()*170-85,offsetZ:rand()*170-85,angle:rand()*Math.PI,relief:Math.min(1.65,1+Math.log2(Math.max(1,scale))*.18)};
}
/** Signed distance proxy to the noncircular coast, in world metres. */
export function coastDistance13(x,z,scale,seed){
 const p=parameters(scale,seed),u=x/scale*1.02,v=z/scale*.98,a=Math.atan2(v,u);
 const radius=302+14*Math.sin(a*3+p.phase)+7*Math.sin(a*5-p.phase2)+3*Math.sin(a*9+p.phase2);
 return(radius-Math.hypot(u,v))*scale;
}
/** One continuous, gently descending watershed. Width is sufficient for the shared mesh grid. */
export function riverProfile13(x,z,scale,seed){
 const v=z/scale;if(v< -218||v>310)return null;
 const p=parameters(scale,seed),center=Math.max(45+19*Math.sin(v*.016+p.phase)+6*Math.sin(v*.039+p.phase2),55*Math.exp(-((v/65)**2)));
 const size=Math.max(650*scale*1.075,650*scale+300),segments=Math.min(768,Math.ceil(size/(scale>3?7:2))),step=size/segments;
 const width=Math.max(7+3*Math.sqrt(scale),step*3.8)*(.82+.18*smooth(-218,160,v));
 const taper=.1+.9*smooth(-218,-194,v),source=(5+3*Math.log(Math.max(1,scale)));
 const water=source*Math.pow(1-smooth(-210,230,v),1.15);
 return{x:center*scale,z,water,width:width*taper,distance:Math.abs(x-center*scale),sourceFade:smooth(-228,-208,v)};
}
export function naturalHeight13(x,z,scale,seed,noise,riverAt){
 const p=parameters(scale,seed),u=x/scale,v=z/scale,inland=coastDistance13(x,z,scale,seed);
 // Gently shelving seabed meets the beach with the same derivative at sea level.
 let h;
 if(inland<0){const d=-inland;h=-Math.min(35,d*.045+12*(1-Math.exp(-((d/90)**2))));}
 else{
  const wx=u+(noise(u*.009+37,v*.009-19)-.5)*17,wz=v+(noise(u*.009-61,v*.009+43)-.5)*17;
  const continental=noise(wx*.006+p.offsetX,wz*.006+p.offsetZ);
  const rolling=noise(wx*.018-13,wz*.018+41)*.76+noise(wx*.038+51,wz*.038-7)*.24;
  const dx=wx-p.offsetX,dz=wz-p.offsetZ,c=Math.cos(p.angle),s=Math.sin(p.angle),along=dx*c+dz*s,across=-dx*s+dz*c;
  // Broad asymmetric uplands, not absolute-value noise ridges / isolated high cones.
  const upland=Math.exp(-((along/126)**2+(across/68)**2))*12;
  const swale=2.2*Math.exp(-(((wx+70)/74)**2))*Math.exp(-(((wz-35)/190)**2));
  const detail=(noise(x/125+31,z/125-18)-.5)*1.5+(noise(x/28-8,z/28+24)-.5)*.16;
  const elevation=(6+continental*9+rolling*5+upland-swale)*p.relief+detail;
  const ceiling=42*p.relief,land=ceiling*Math.tanh(Math.max(.4,elevation)/ceiling);
  const beach=15+Math.min(12,Math.sqrt(scale)*3),transition=60+Math.min(45,Math.sqrt(scale)*12);
  h=mix(inland*.045,land,smooth(beach,beach+transition,inland));
 }
 const r=riverAt(x,z);
 if(r){
  const half=r.width/2,d=r.distance,depth=Math.min(2.2,.65+r.width*.035),q=d/Math.max(.1,half);
  if(inland<0){if(r.water<.05)h=Math.min(h,mix(h,-depth,1-smooth(.65,1.5,q)));}
  else{
   const valley=1-smooth(half+4,half+50+Math.min(70,scale*7),d);
   const floodplain=r.water+1.05+d*.006;
   h=mix(h,floodplain,valley*r.sourceFade);
   const bed=r.water-depth+depth*q*q;
   h=mix(h,bed,(1-smooth(.72,1.4,q))*r.sourceFade);
  }
 }
 return h;
}
/** Move new-world RT pads off the channel before roads/houses are generated. */
export function riverSafeSites13(sites,scale,seed){
 const result=sites.map(m=>({...m}));
 for(const m of result){
  if(m.kind==='oilrig')continue;const r=riverProfile13(m.x,m.z,scale,seed);if(!r)continue;
  const margin=r.width*.5+m.radius+14;if(r.distance>=margin)continue;
  const options=[r.x-margin,r.x+margin];
  const score=x=>{
   let penalty=Math.abs(x-m.x);
   for(const other of result)if(other!==m&&other.kind!=='oilrig')penalty+=Math.max(0,m.radius+other.radius+5-Math.hypot(x-other.x,m.z-other.z))*1000;
   penalty+=Math.max(0,m.radius+38-Math.hypot(x+6,m.z+3))*1000;
   penalty+=Math.max(0,m.radius+14-coastDistance13(x,m.z,scale,seed))*1000;
   return penalty;
  };
  m.x=score(options[0])<score(options[1])?options[0]:options[1];
 }
 return result;
}
