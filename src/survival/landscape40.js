import{landscape36}from'./landscape36.js';import{coastDistance13,riverProfile13}from'./terrain13.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/** Revision 18 only. Metre-scale broken foothills, not huge mountains scaled
 * to the island. Road routing/physics/rendering all consume the same function. */
export function landscape40(x,z,scale,seed,noise,sites){const base=landscape36(x,z,scale,seed,noise,sites);if(base<.5)return base;let mask=smooth((coastDistance13(x,z,scale,seed)-16)/32);for(const m of sites)if(m.kind!=='oilrig')mask=Math.min(mask,smooth((Math.hypot(x-m.x,z-m.z)-m.radius*.98)/24));mask=Math.min(mask,smooth((Math.hypot(x+6,z+3)-45)/24));const river=riverProfile13(x,z,scale,seed);if(river)mask*=smooth((river.distance-river.width/2-10)/24);const phase=(seed%997)*.013,wx=x+(noise(x/75+21,z/75-39)-.5)*12,wz=z+(noise(x/75-17,z/75+11)-.5)*12;
 const fold=1-Math.abs(noise(wx/23+phase,wz/23-17)*2-1),knoll=noise(wx/51+43,wz/51+phase),detail=fold**3*5.5+knoll**2*6.5-3.9,lower=base>32?32+(base-32)*.45:base;return base+((lower-base)+detail)*mask;
}
