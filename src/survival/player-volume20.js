import {terrainHeight,WORLD_RADIUS} from './state.js';
import {floorY08} from './roads08.js';
const R=.30,footprint=[[0,0],[-R,-R],[R,-R],[-R,R],[R,R]];
function overlaps(c,x,z){
 const dx=x-c.x,dz=z-c.z;if(!c.box){const qx=Math.max(Math.abs(dx)-R,0),qz=Math.max(Math.abs(dz)-R,0);return qx*qx+qz*qz<(c.r||.3)**2;}
 const a=c.rotation||0,co=Math.cos(a),si=Math.sin(a),w=(c.ow||c.w)/2,d=(c.od||c.d)/2;
 // Four separating axes: two for the local obstacle and two for the player AABB.
 return Math.abs(dx*co-dz*si)<w+R*(Math.abs(co)+Math.abs(si))&&Math.abs(dx*si+dz*co)<d+R*(Math.abs(co)+Math.abs(si))&&Math.abs(dx)<R+w*Math.abs(co)+d*Math.abs(si)&&Math.abs(dz)<R+w*Math.abs(si)+d*Math.abs(co);
}
export function installPlayerVolume20(World){
 const floor=World.prototype.floorHeight,stand=World.prototype.canStand04;
 World.prototype.floorHeight=function(x,z,state,feet=state.feetY??terrainHeight(x,z)+.5){let y=-Infinity;for(const [a,b]of footprint)y=Math.max(y,floor.call(this,x+a,z+b,state,feet,true));return y;};
 World.prototype.canStand04=function(state,feet){return stand.call(this,state,feet)&&this.canMove(state.position.x,state.position.z,state,feet,true);};
 World.prototype.canMove=function(x,z,state,feet=null,stand20=false){
  this.refreshDead05(state);if(Math.hypot(x,z)>WORLD_RADIUS*1.48&&!this.walkFloors.some(f=>f.offshore&&Math.abs(x-f.x)<f.w/2+1&&Math.abs(z-f.z)<f.d/2+1))return false;
  const y=feet??terrainHeight(x,z),height=!stand20&&state.crouched?1.10:1.78;
  for(const [a,b]of footprint){if(terrainHeight(x+a,z+b)>y+.44)return false;if(this.ceiling08(x+a,z+b,state,y)<y+height-.015)return false;}
  for(const c of this.nearColliders(x,z)){
   if(c.id&&this.deadIds05.has(c.id)||c.data?.hp<=0||c.door&&c.data?.open||!overlaps(c,x,z))continue;
   if(c.deck08){const top=floorY08(c,x,z);if(y>=top-.035||y+height<=top-.25)continue;return false;}
   const bottom=c.y??terrainHeight(c.x,c.z),top=bottom+(c.h??3.02);if(y>=top-.025||y+height<=bottom+.015)continue;return false;
  }
  return true;
 };
}
