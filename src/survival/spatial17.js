import * as THREE from 'three';
/** One ray/OBB convention for scenery, LOS and ballistic obstruction. Direction
 * is normalized; return nearest forward hit, including finite cylinder caps. */
export function rayObstacle17(c,origin,direction,out=new THREE.Vector3()){
 const y=c.y??0,h=c.h??3.02,dx=origin.x-c.x,dz=origin.z-c.z;
 if(c.circle17){
  if(origin.y>=y&&origin.y<=y+h&&dx*dx+dz*dz<=c.r*c.r)return out.copy(origin);
  const r=c.r,A=direction.x**2+direction.z**2,B=2*(dx*direction.x+dz*direction.z),C=dx*dx+dz*dz-r*r;let nearest=Infinity;
  if(A>1e-12){const disc=B*B-4*A*C;if(disc>=0){const q=Math.sqrt(disc),first=(-B-q)/(2*A),second=(-B+q)/(2*A);if(first>=0&&origin.y+first*direction.y>=y&&origin.y+first*direction.y<=y+h)nearest=first;if(second>=0&&second<nearest&&origin.y+second*direction.y>=y&&origin.y+second*direction.y<=y+h)nearest=second;}}
  if(Math.abs(direction.y)>1e-10){for(let i=0;i<2;i++){const t=(y+i*h-origin.y)/direction.y;if(t>=0&&t<nearest&&(dx+t*direction.x)**2+(dz+t*direction.z)**2<=r*r)nearest=t;}}
  return nearest<Infinity?out.copy(origin).addScaledVector(direction,nearest):null;
 }
 // Scalar slabs: no temporary Vector3/Box3/Ray allocations per obstacle.
 const a=c.rotation||0,co=Math.cos(a),si=Math.sin(a),ox=dx*co-dz*si,oz=dx*si+dz*co,vx=direction.x*co-direction.z*si,vz=direction.x*si+direction.z*co,w=(c.ow||c.w||c.r*2||1)/2,depth=(c.od||c.d||c.r*2||1)/2;
 let low=0,high=Infinity;
 if(vx===0){if(ox< -w||ox>w)return null;}else{const a=(-w-ox)/vx,b=(w-ox)/vx;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(high<low)return null;}
 if(direction.y===0){if(origin.y<y||origin.y>y+h)return null;}else{const a=(y-origin.y)/direction.y,b=(y+h-origin.y)/direction.y;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(high<low)return null;}
 if(vz===0){if(oz< -depth||oz>depth)return null;}else{const a=(-depth-oz)/vz,b=(depth-oz)/vz;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(high<low)return null;}
 return out.copy(origin).addScaledVector(direction,low);

}

/** Expanded contact footprint: capsule centre can stand at an object's edge. */
export function obstacleContains17(c,x,z,padding=0){
 const dx=x-c.x,dz=z-c.z;
 if(!c.box)return dx*dx+dz*dz<(c.r+padding)**2;
 const co=Math.cos(c.rotation||0),si=Math.sin(c.rotation||0);
 return Math.abs(dx*co-dz*si)<(c.ow||c.w)/2+padding&&Math.abs(dx*si+dz*co)<(c.od||c.d)/2+padding;
}
