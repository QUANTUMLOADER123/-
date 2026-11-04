import {spreadFactor25} from './attachments25.js';
import {rayObstacle17} from './spatial17.js';
import * as THREE from 'three';
import {terrainHeight} from './state.js';
const V=THREE.Vector3;
export const BALLISTICS08={carbine26:{speed:530,range:600},pdw26:{speed:310,range:260},akRifle:{speed:520,range:600},compactSmg:{speed:285,range:220},pistol:{speed:250,range:180},heavyPistol:{speed:280,range:200},revolver:{speed:270,range:200},smg:{speed:290,range:230},shotgun:{speed:180,range:85,pellets:8},combatShotgun:{speed:190,range:90,pellets:8},rifle:{speed:380,range:400},semiRifle:{speed:470,range:500},assaultRifle:{speed:510,range:550},machineGun:{speed:520,range:600},boltRifle:{speed:680,range:850}};
export function installBallistics08(World){
 World.prototype.fireBullet08=function({origin,direction,id,onHit,ignore=null,hostile=false,onPlayerHit=null}){
  const profile=BALLISTICS08[id]||BALLISTICS08.rifle;this.bullets08??=[];
  for(let i=0;i<(profile.pellets||1);i++){
   if(this.bullets08.length>=96)break;const dir=direction.clone(),state=this.state04,hip=({pistol:.014,heavyPistol:.012,revolver:.013,smg:.023,compactSmg:.022,machineGun:.020,boltRifle:.008})[id]||.015,move=Math.min(1,Math.hypot(this.locomotion14?.vx||0,this.locomotion14?.vz||0)/3.8),cone=hostile?.009:hip*(state?.aiming?.16:1)*(state?.crouched?.78:1)*(1+move*1.2+(this.locomotion14?.grounded===false?1.8:0));
   const forward=dir.clone().normalize(),right=new V().crossVectors(forward,Math.abs(forward.y)>.99?new V(1,0,0):new V(0,1,0)).normalize(),up=new V().crossVectors(right,forward).normalize(),angle=Math.random()*Math.PI*2,radius=Math.sqrt(Math.random())*cone*(hostile||state?.aiming?1:spreadFactor25(state,id));dir.addScaledVector(right,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius).normalize();if(profile.pellets)dir.add(new V((Math.random()-.5)*.055,(Math.random()-.5)*.055,(Math.random()-.5)*.055)).normalize();
   const velocity=dir.multiplyScalar(profile.speed);velocity.y+=9.81*50/(2*profile.speed); // fixed 50 m sight zero; gravity acts immediately
   const g=new THREE.BufferGeometry().setFromPoints([origin,origin]),line=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xf3d7a2,transparent:true,opacity:.48,depthWrite:false}));this.scene.add(line);this.bullets08.push({position:origin.clone(),velocity,origin:origin.clone(),distance:0,age:0,profile,onHit,ignore,hostile,onPlayerHit,line,done:false});
  }
 };
 World.prototype.updateBullets08=function(dt,state){
  for(const b of this.bullets08||[]){b.age+=dt;let remaining=dt;
   while(remaining>0&&!b.done){const h=Math.min(remaining,6/b.velocity.length()),old=b.position.clone();remaining-=h;b.velocity.y-=9.81*h;b.velocity.multiplyScalar(Math.exp(-.035*h));const next=old.clone().addScaledVector(b.velocity,h),delta=next.clone().sub(old),length=delta.length(),direction=delta.clone().normalize(),ray=new THREE.Ray(old,direction);
    this.ensureProjectileSettlements05?.(old,next,state);
    const target=this.target(state,{origin:old,direction,range:length+.001,ballistic:true,ignore:b.ignore});let nearest=target?.hitPoint?target.hitPoint.distanceTo(old):length+.001,point=target?.hitPoint?.clone(),victim=target;
    // Swept segment vs actual terrain triangles, not an endpoint-only collision check.
    const samples=Math.max(1,Math.ceil(length/.4));for(let j=1;j<=samples;j++){const p=old.clone().lerp(next,j/samples);if(p.y<=terrainHeight(p.x,p.z)+.015){const d=old.distanceTo(p);if(d<nearest){nearest=d;point=p;victim=null;}break;}}
    for(const c of new Set([...this.nearColliders(old.x,old.z),...this.nearColliders(next.x,next.z)])){
     if(target&&c.id&&c.id===target.id||c.id&&this.deadIds05?.has(c.id)||c.data?.hp<=0||c.door&&c.data?.open)continue;
     const p=rayObstacle17({...c,y:c.y??terrainHeight(c.x,c.z)},old,direction);if(p){const d=p.distanceTo(old);if(d<nearest){nearest=d;point=p;victim=null;}}
    }
    let hitPlayer=false;if(b.hostile){const box=new THREE.Box3(new V(state.position.x-.26,(state.feetY??0)+.12,state.position.z-.26),new V(state.position.x+.26,this.camera.position.y+.1,state.position.z+.26)),p=ray.intersectBox(box,new V());if(p&&p.distanceTo(old)<nearest){nearest=p.distanceTo(old);point=p;victim=null;hitPlayer=true;}}
    b.distance+=Math.min(length,nearest);b.position.copy(point||next);
    if(point){b.done=true;if(hitPlayer)b.onPlayerHit?.();else if(victim)b.onHit(victim,Math.max(.3,1-b.distance/b.profile.range*.65)/(b.profile.pellets||1));else this.hitEffect({x:point.x,y:point.y,z:point.z,hitPoint:point},0xafa08a);}
    if(b.distance>=b.profile.range||b.age>5)b.done=true;
   }
   const tail=b.position.clone().addScaledVector(b.velocity,-.008),p=b.line.geometry.attributes.position;p.setXYZ(0,tail.x,tail.y,tail.z);p.setXYZ(1,b.position.x,b.position.y,b.position.z);p.needsUpdate=true;b.line.frustumCulled=false;
   if(b.done){this.scene.remove(b.line);b.line.geometry.dispose();b.line.material.dispose();}
  }
  this.bullets08=(this.bullets08||[]).filter(b=>!b.done);
 };
 const update=World.prototype.update,sync=World.prototype.syncState;
 World.prototype.update=function(dt,state,playing,options){update.call(this,dt,state,playing,options);if(playing)this.updateBullets08(dt,state);};
 World.prototype.syncState=function(state){for(const b of this.bullets08||[]){this.scene.remove(b.line);b.line.geometry.dispose();b.line.material.dispose();}this.bullets08=[];sync.call(this,state);};
}
