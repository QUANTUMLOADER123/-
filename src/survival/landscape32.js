import {coastDistance13,riverProfile13} from './terrain13.js';
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
/** Revision 15: broad watersheds, gradual beaches and bounded rounded relief.
 * No quantized shelves, overlapping 80m Gaussian peaks or sharp pad shoulders. */
export function landscape32(x,z,scale,seed,noise,sites,options={}){
 const raw=(x,z)=>{
  const shore=coastDistance13(x,z,scale,seed);
  if(shore<0)return -Math.min(32,-shore*.045+9*(1-Math.exp(shore/95)));
  const u=x/scale,v=z/scale,phase=(seed%997)*.013;
  const wx=u+(noise(u/150+23,v/150-19)-.5)*26,wz=v+(noise(u/150-63,v/150+37)-.5)*26;
  const continental=noise(wx/190+phase,wz/190-phase),hills=noise(wx/85-31,wz/85+17),detail=(noise(x/65+37,z/65-51)-.5)*1.5;
  const relief=Math.min(1.45,1+Math.log2(Math.max(1,scale))*.10),upland=(8+continental*19+hills*(options.detailed?16:10))*relief+detail+(options.detailed?(noise(wx/42+phase+83,wz/42-57)-.5)*4:0);
  let h=shore*.035*(1-smooth((shore-14)/75))+upland*smooth((shore-14)/75);
  const river=riverProfile13(x,z,scale,seed);
  if(river){const half=river.width/2,wet=1-smooth((river.distance-half)/Math.max(45,32*Math.sqrt(scale))),bed=river.water-1.3+1.3*Math.min(1,(river.distance/Math.max(1,half))**2),bank=river.water+.8+Math.max(0,river.distance-half)*.045;h+=(Math.min(h,bank)-h)*wet*river.sourceFade;h+=(bed-h)*(1-smooth((river.distance-half*.7)/Math.max(3,half*.5)))*river.sourceFade;}
  return h;
 };
 let h=raw(x,z),strength=0,target=h,numerator=h,denominator=1;const shore=smooth(coastDistance13(x,z,scale,seed)/30);
 for(const m of sites){if(m.kind==='oilrig')continue;const radius=m.radius*(options.detailed?.98:.72),shoulder=Math.max(options.detailed?54:65,m.radius*(options.detailed?1.2:1.5)),d=Math.hypot(x-m.x,z-m.z),blend=(1-smooth((d-radius)/shoulder))*shore;if(blend<=0)continue;const heightKey=options.detailed?'padHeight34':'padHeight32';m[heightKey]??=raw(m.x,m.z);
  if(options.detailed){const weight=blend/Math.max(1e-8,1-blend);numerator+=m[heightKey]*weight;denominator+=weight;}
  else if(blend>strength){target=m[heightKey];strength=blend;}
 }
 // Rational partition of unity removes the old nearest-pad winner discontinuity.
 h=options.detailed?numerator/denominator:h+(target-h)*strength;
 const camp=1-smooth((Math.hypot(x+6,z+3)-18)/45);return h+(1.7-h)*camp;
}
