import {coastDistance13} from './terrain13.js';
/** A smaller authored destination set, only for worlds of revision 17+. */
export const LAND_IDS36=new Set(['lighthouse','harbor','airfield','power','quarry','radar','waterworks','gas','bunker','outpost','village','trainyard']);
export function selectSites36(sites,scale,seed){const selected=sites.filter(m=>m.kind==='oilrig'||LAND_IDS36.has(m.id));for(const m of selected)if(['harbor','lighthouse'].includes(m.kind)){const length=Math.hypot(m.x,m.z),dx=m.x/length,dz=m.z/length,target=m.radius*.68+(m.kind==='harbor'?7:12);for(let i=0;i<8;i++){const delta=coastDistance13(m.x,m.z,scale,seed)-target;m.x+=dx*delta;m.z+=dz*delta;}}return selected;}
/** The road router owns the approach. Geometry and the map consume this same
 * descriptor; never guess a second entrance from the nearest road segment. */
export function connectEntrances36(sites,network){
 for(const m of sites){if(m.kind==='oilrig')continue;const gate=network.gates.find(p=>p.id===m.id);if(!gate)throw Error('Missing routed entrance: '+m.id);
  const yaw=Math.atan2(gate.x-m.x,gate.z-m.z),r=m.radius,at=d=>({x:m.x+Math.sin(yaw)*d,z:m.z+Math.cos(yaw)*d});
  m.yaw36=yaw;m.approach36={x:gate.x,z:gate.z};m.entrance36={...at(r*.68),yaw,width:6.4*(m.siteScale25||1)};m.court36=at(r*.50);
  network.roads['gate36-'+m.id]=[{...m.approach36},{x:m.entrance36.x,z:m.entrance36.z}];
 }
 return network;
}
