import * as THREE from 'three';
/** One ray/OBB convention for scenery, LOS and ballistic obstruction. Direction
 * is normalized; return nearest forward hit, including finite cylinder caps. */
export function rayObstacle17(c,origin,direction,out=new THREE.Vector3()){
 const y=c.y??0,h=c.h??3.02;
 if(c.circle17){
  if(origin.y>=y&&origin.y<=y+h&&(origin.x-c.x)**2+(origin.z-c.z)**2<=c.r*c.r)return out.copy(origin);
  const x=origin.x-c.x,z=origin.z-c.z,r=c.r,A=direction.x**2+direction.z**2,B=2*(x*direction.x+z*direction.z),C=x*x+z*z-r*r,candidates=[];
  if(A>1e-12){const disc=B*B-4*A*C;if(disc>=0){const q=Math.sqrt(disc);for(const t of[(-B-q)/(2*A),(-B+q)/(2*A)])if(t>=0&&origin.y+t*direction.y>=y&&origin.y+t*direction.y<=y+h)candidates.push(t);}}
  if(Math.abs(direction.y)>1e-10)for(const cap of[y,y+h]){const t=(cap-origin.y)/direction.y;if(t>=0&&(x+t*direction.x)**2+(z+t*direction.z)**2<=r*r)candidates.push(t);}
  return candidates.length?out.copy(origin).addScaledVector(direction,Math.min(...candidates)):null;
 }
 const a=c.rotation||0,co=Math.cos(a),si=Math.sin(a),o=new THREE.Vector3((origin.x-c.x)*co-(origin.z-c.z)*si,origin.y,(origin.x-c.x)*si+(origin.z-c.z)*co),d=new THREE.Vector3(direction.x*co-direction.z*si,direction.y,direction.x*si+direction.z*co),w=(c.ow||c.w||c.r*2||1)/2,depth=(c.od||c.d||c.r*2||1)/2;
 const box=new THREE.Box3(new THREE.Vector3(-w,y,-depth),new THREE.Vector3(w,y+h,depth));if(box.containsPoint(o))return out.copy(origin);
 const hit=new THREE.Ray(o,d).intersectBox(box,new THREE.Vector3());
 return hit?out.copy(origin).addScaledVector(direction,hit.distanceTo(o)):null;
}

/** Expanded contact footprint: capsule centre can stand at an object's edge. */
export function obstacleContains17(c,x,z,padding=0){
 const dx=x-c.x,dz=z-c.z;
 if(!c.box)return dx*dx+dz*dz<(c.r+padding)**2;
 const co=Math.cos(c.rotation||0),si=Math.sin(c.rotation||0);
 return Math.abs(dx*co-dz*si)<(c.ow||c.w)/2+padding&&Math.abs(dx*si+dz*co)<(c.od||c.d)/2+padding;
}
