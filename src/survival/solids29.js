import {terrainHeight} from './state.js';
import * as THREE from 'three';
/** Convex slab clipping includes ceilings, triangle honeycomb and sloped decks.
 * Origin-inside-solid returns distance zero, never the far face of the wall. */
export function rayFloor29(f,origin,direction){
 const a=f.rotation||0,c=Math.cos(a),s=Math.sin(a),o=[(origin.x-f.x)*c-(origin.z-f.z)*s,origin.y,(origin.x-f.x)*s+(origin.z-f.z)*c],d=[direction.x*c-direction.z*s,direction.y,direction.x*s+direction.z*c],r=f.slope08,sx=r?r.dx*r.dy/r.len2:0,sz=r?r.dz*r.dy/r.len2:0,top=r?r.y+sx*(f.x-r.x)+sz*(f.z-r.z):f.y,nx=-(sx*c-sz*s),nz=-(sx*s+sz*c),h=f.thickness29??(/foundation/i.test(f.data?.kind||'')?.38:f.road08?.25:.18);
 const planes=[[nx,1,nz,top],[-nx,-1,-nz,-top+h]];
 if(f.triangle20)planes.push([0,0,-1,.8660254],[Math.sqrt(3),0,1,1.7320508],[-Math.sqrt(3),0,1,1.7320508]);
 else{const w=(f.ow||f.w)/2,z=(f.od||f.d)/2;planes.push([1,0,0,w],[-1,0,0,w],[0,0,1,z],[0,0,-1,z]);}
 let near=0,far=Infinity;
 for(const[x,y,z,k]of planes){const gap=k-x*o[0]-y*o[1]-z*o[2],rate=x*d[0]+y*d[1]+z*d[2];if(Math.abs(rate)<1e-10){if(gap<0)return null;continue;}const t=gap/rate;if(rate>0)far=Math.min(far,t);else near=Math.max(near,t);if(near>far)return null;}
 return far>=0?origin.clone().addScaledVector(direction,near):null;
}
/** Cache structural slabs separately from rendering. Upgrading materials cannot
 * turn roofs into bullet-transparent surfaces, even outside the visual radius. */
export function installSolids29(World){const los=World.prototype.lineOfSight;
 World.prototype.solidFloors29=function(s){const key=this.slabCache29;if(key?.state===s&&key.walk===this.walkFloors&&key.walkCount===this.walkFloors.length&&key.build===s.buildings&&key.buildCount===s.buildings.length)return key.list;const list=[...this.walkFloors];for(const b of s.buildings){if(!['foundation','triangleFoundation','roof','triangleRoof','roofSlope','ramp'].includes(b.kind))continue;const slope=['roofSlope','ramp'].includes(b.kind),low=b.kind==='ramp'?.38:1.5,high=b.kind==='ramp'?3.11:3,co=Math.cos(b.rotation||0),si=Math.sin(b.rotation||0),y=b.y??terrainHeight(b.x,b.z),f={x:b.x,z:b.z,w:3,d:3,ow:3,od:b.kind.startsWith('triangle')?3.47:3,rotation:b.rotation||0,y:y+(b.kind.includes('Foundation')||b.kind==='foundation'?.38:3.11),structureId:b.id,data:b,triangle20:b.kind.startsWith('triangle')};if(slope)f.slope08={x:b.x-si*1.5,z:b.z-co*1.5,y:y+low,dx:si*3,dz:co*3,dy:high-low,len2:9};list.push(f);}this.slabCache29={state:s,walk:this.walkFloors,walkCount:this.walkFloors.length,build:s.buildings,buildCount:s.buildings.length,list};return list;};
 World.prototype.lineOfSight=function(a,b,s){if(!los.call(this,a,b,s))return false;const delta=b.clone().sub(a),len=delta.length();if(len<.0001)return true;delta.divideScalar(len);for(const f of this.rayCandidates28('slabs29',this.solidFloors29(s),a,b)){if(this.deadIds05?.has(f.structureId)||f.data?.hp<=0)continue;const p=rayFloor29(f,a,delta);if(p&&p.distanceTo(a)<len-.025)return false;}return true;};
}
