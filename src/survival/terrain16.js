import {naturalHeight13,coastDistance13} from './terrain13.js';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Revision 7 ONLY. Keep revision 6 byte-for-byte stable beneath saved buildings.
 * Broad hills, an asymmetric ridge and smaller world-space folds, with protected
 * beaches / floodplains. Rendering and gameplay still sample terrainGrid08.
 */
export function naturalHeight16(x,z,scale,seed,noise,riverAt){
 const base=naturalHeight13(x,z,scale,seed,noise,riverAt),coast=coastDistance13(x,z,scale,seed);
 if(coast<=0)return base;
 const u=x/scale,v=z/scale,phase=(seed%997)/997*6.283185307;
 const angle=.63+phase*.2,c=Math.cos(angle),s=Math.sin(angle),along=u*c+v*s,across=-u*s+v*c;
 const ridge=46*Math.exp(-(((across+55+18*Math.sin(along/80+phase))/44)**2+(along/195)**2));
 const hill=35*Math.exp(-(((u-128)/65)**2+((v+92)/78)**2));
 const rolls=18*noise(u*.018+183,v*.018-77)+8*noise(x/78-28,z/78+34);
 const river=riverAt(x,z),valley=river?smooth(river.width/2+10,river.width/2+85,river.distance):1;
 const campTransition=smooth(45,110,Math.hypot(x+6,z+3));
 return base+(ridge+hill+rolls)*smooth(18,95,coast)*valley*campTransition;
}
