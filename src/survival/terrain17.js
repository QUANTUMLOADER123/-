import {naturalHeight13,coastDistance13} from './terrain13.js';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Revision 8: narrow crests, broken scarps and rock shelves, not broad soft rolls.
 * Pure height function; rendered triangles and physics still share terrainGrid08.
 * Revisions 1–7 never call this function. */
export function naturalHeight17(x,z,scale,seed,noise,riverAt,roadDistance){
 const base=naturalHeight13(x,z,scale,seed,noise,riverAt),coast=coastDistance13(x,z,scale,seed);if(coast<=0)return base;
 const u=x/scale,v=z/scale,phase=(seed%991)*.00634;
 const warp=(noise(u*.019+87,v*.019-41)-.5)*24;
 const across=u*.78+v*.63+warp+38*Math.sin(v*.012+phase);
 const crest=Math.max(0,1-Math.abs(across+24)/23);
 const spine=82*crest**.72*smooth(245,90,Math.abs(v));
 const teeth=1-Math.abs(noise(u*.032+47,v*.032-93)*2-1);
 const broken=31*teeth**4;
 const mass=48*Math.exp(-(((u-128)/53)**2+((v+87)/66)**2));
 const raw=spine+mass,level=raw/8,shelf=(Math.floor(level)+smooth(.05,.20,level-Math.floor(level)))*8;
 const river=riverAt(x,z),valley=river?smooth(river.width*.5+9,river.width*.5+48,river.distance):1;
 const roadCut=roadDistance?smooth(5,14,roadDistance(x,z,16)):1;
 return base+(shelf*.86+raw*.14+broken)*roadCut*smooth(12,52,coast)*valley*smooth(35,72,Math.hypot(x+6,z+3));
}
