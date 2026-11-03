import {structuralFloor} from './world04.js';
import {isFloor,isFoundation} from './expansion.js';
import {buildingHeight} from './state.js';
import {floorContains08,floorY08} from './roads08.js';
/** Floor tops and their undersides are distinct: walking over a deck must not snap swimmers up. */
export function installCollision08(World){const canMove=World.prototype.canMove,canStand=World.prototype.canStand04;
 World.prototype.ceiling08=function(x,z,state,feet){let ceiling=Infinity;
  for(const f of this.nearFloors05?.(x,z)||[]){if(f.structureId&&this.deadIds05?.has(f.structureId)||!floorContains08(f,x,z))continue;const top=floorY08(f,x,z);if(top>feet+.5)ceiling=Math.min(ceiling,top-(f.road08?.25:.14));}
  for(const b of state.buildings){if(b.hp<=0||Math.abs(x-b.x)>1.5||Math.abs(z-b.z)>1.5||!isFloor(b.kind)&&!isFoundation(b.kind))continue;const top=structuralFloor(b,x,z,Infinity);if(top>feet+.5)ceiling=Math.min(ceiling,top-.16);}
  return ceiling;
 };
 World.prototype.canMove=function(x,z,state,feet=null){if(feet!==null&&this.ceiling08(x,z,state,feet)<feet+(state.crouched?1.10:1.78))return false;return canMove.call(this,x,z,state,feet);};
 World.prototype.canStand04=function(state,feet){return canStand.call(this,state,feet)&&this.ceiling08(state.position.x,state.position.z,state,feet)>=feet+1.78;};
}
