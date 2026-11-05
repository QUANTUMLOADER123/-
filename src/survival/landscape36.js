import {coastDistance13,riverProfile13} from './terrain13.js';
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
/** Revision 17: connected, domain-warped ridges above a broad lowland basin.
 * Narrower pad shoulders leave actual countryside between fewer compounds.
 * This function is shared by road routing, rendering, physics and cartography. */
export function landscape36(x,z,scale,seed,noise,sites){
 const raw=(x,z)=>{
  const shore=coastDistance13(x,z,scale,seed);if(shore<0)return -Math.min(32,-shore*.045+9*(1-Math.exp(shore/95)));
  const u=x/scale,v=z/scale,phase=(seed%997)*.013,wx=u+(noise(u/140+23,v/140-19)-.5)*34,wz=v+(noise(u/140-63,v/140+37)-.5)*34;
  const continental=noise(wx/185+phase,wz/185-phase),foothills=noise(wx/72-31,wz/72+17),axis=-88+Math.sin(wz/110+phase)*32;
  const ridge=Math.exp(-(((wx-axis)/66)**2))*(19+noise(wx/95+73,wz/115+phase)*22),east=Math.exp(-(((wx-155)/92)**2)-((wz+95)/155)**2)*13;
  const relief=Math.min(1.7,1+Math.log2(Math.max(1,scale))*.16),upland=(6+continental*17+foothills*12+ridge+east)*relief+(noise(x/39+37,z/39-51)-.5)*1.6;
  let h=shore*.04*(1-smooth((shore-12)/82))+upland*smooth((shore-12)/82);
  const river=riverProfile13(x,z,scale,seed);if(river){const half=river.width/2,wet=1-smooth((river.distance-half)/Math.max(48,35*Math.sqrt(scale))),bed=river.water-1.3+1.3*Math.min(1,(river.distance/Math.max(1,half))**2),bank=river.water+.8+Math.max(0,river.distance-half)*.035;h+=(Math.min(h,bank)-h)*wet*river.sourceFade;h+=(bed-h)*(1-smooth((river.distance-half*.7)/Math.max(3,half*.5)))*river.sourceFade;}
  return h;
 };
 let h=raw(x,z),numerator=h,denominator=1,core36=0;const shore=smooth(coastDistance13(x,z,scale,seed)/30);
 for(const m of sites){if(m.kind==='oilrig')continue;const radius=m.radius*.98,shoulder=Math.max(52,m.radius*.85),d=Math.hypot(x-m.x,z-m.z),blend=(1-smooth((d-radius)/shoulder))*shore;if(blend<=0)continue;core36=Math.max(core36,1-smooth((d-m.radius*.80)/(m.radius*.18)));m.padHeight34??=raw(m.x,m.z);const weight=blend/Math.max(1e-8,1-blend);numerator+=m.padHeight34*weight;denominator+=weight;}
 h=numerator/denominator;const camp=(1-smooth((Math.hypot(x+6,z+3)-18)/45))*(1-core36);return h+(1.7-h)*camp;
}

/** Keep coastal docks low; relax neighboring inland aprons, not the fixed coast. */
export function relaxSiteGrades36(sites,scale,seed){const land=[...sites.filter(m=>m.kind!=='oilrig'),{x:-6,z:-3,radius:18,kind:'camp36',padHeight34:1.7}],fixed=new Set(['harbor','lighthouse','camp36']);for(const m of land){const coast=coastDistance13(m.x,m.z,scale,seed)-m.radius*.98;m.padHeight34=Math.min(m.padHeight34,Math.max(4,3+coast*.48));if(m.kind==='harbor')m.padHeight34=3.2;if(m.kind==='lighthouse')m.padHeight34=7;}
 for(let pass=0;pass<96;pass++)for(let i=0;i<land.length;i++)for(let j=i+1;j<land.length;j++){const a=land[i],b=land[j],gap=Math.max(8,Math.hypot(a.x-b.x,a.z-b.z)-.98*(a.radius+b.radius));if(gap>90)continue;const delta=b.padHeight34-a.padHeight34,excess=Math.abs(delta)-gap*.22;if(excess<=0)continue;const da=fixed.has(a.kind),db=fixed.has(b.kind),adjust=Math.sign(delta)*excess;if(da&&!db)b.padHeight34-=adjust;else if(db&&!da)a.padHeight34+=adjust;else if(!da&&!db){a.padHeight34+=adjust*.5;b.padHeight34-=adjust*.5;}}
}
