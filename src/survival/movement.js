/** Feet-space capsule locomotion. Bounded substeps and solid swept terrain contact. */
export class CharacterMotor {
 constructor(){this.reset(0);}
 reset(y){this.y=y;this.vx=0;this.vz=0;this.vy=0;this.grounded=true;this.swimming=false;this.airSpeed=3.8;this.lastImpact=0;}
 stop(){if(this.grounded||this.swimming)this.vx=this.vz=0;if(this.swimming)this.vy=0;}
 jump(){if(this.swimming){this.vy=2.8;return true;}if(!this.grounded)return false;this.grounded=false;this.vy=6.6;this.airSpeed=Math.max(3.8,Math.hypot(this.vx,this.vz));return true;}
 step(dt,{x=0,z=0,yaw=0,sprint=false,crouch=false,pitch=0,rise=false,dive=false,waterLevel=0},position,{floor,canMove,terrain=null}){
  this.lastImpact=0;dt=Math.min(.1,Math.max(0,dt));const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps,length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
  const ix=x*Math.cos(yaw)+z*Math.sin(yaw),iz=-x*Math.sin(yaw)+z*Math.cos(yaw);
  for(let i=0;i<steps;i++){
   const ground=floor(position.x,position.z,this.y);this.swimming=ground<waterLevel-1.30&&this.y<waterLevel-.9;
   const speed=this.swimming?2.8:crouch?1.8:sprint&&z<-.1&&Math.abs(x)<.18?7.2:3.8;
   if(this.grounded||this.swimming){const response=this.swimming?4.5:length>.01?14:11,f=1-Math.exp(-response*h);this.vx+=(ix*speed-this.vx)*f;this.vz+=(iz*speed-this.vz)*f;}
   else{this.vx+=ix*1.1*h;this.vz+=iz*1.1*h;const s=Math.hypot(this.vx,this.vz);if(s>this.airSpeed){this.vx*=this.airSpeed/s;this.vz*=this.airSpeed/s;}}
   const tryAxis=(axis,delta)=>{if(!delta)return;const nx=position.x+(axis==='x'?delta:0),nz=position.z+(axis==='z'?delta:0),g=floor(nx,nz,this.y);if(g>this.y+.45||!this.swimming&&terrain&&g<terrain(nx,nz)+.25&&terrain(nx,nz)>this.y+.02&&(terrain(nx,nz)-terrain(position.x,position.z))/Math.max(.001,Math.abs(delta))>1.3||!canMove(nx,nz,this.y)){this['v'+axis]=0;return;}position[axis]+=delta;};
   tryAxis('x',this.vx*h);tryAxis('z',this.vz*h);const nextGround=floor(position.x,position.z,this.y);
   if(this.swimming){
    this.grounded=false;const surfaceFeet=waterLevel-1.42,vertical=rise?2.8:dive?-2.4:z<-.05?Math.sin(pitch)*2.4:0,buoyancy=rise||dive||z<-.05&&Math.abs(pitch)>.22?0:Math.max(-1.5,Math.min(2,(surfaceFeet-this.y)*2.6));
    this.vy+=((vertical+buoyancy)-this.vy)*(1-Math.exp(-4*h));const ny=this.y+this.vy*h;
    if(ny<=nextGround){this.y=nextGround;this.vy=Math.max(0,this.vy);}else if(canMove(position.x,position.z,ny))this.y=Math.min(waterLevel-.94,ny);else this.vy=0;
   }else if(this.grounded&&nextGround>=this.y-.16){this.y=nextGround;this.vy=0;}
   else{if(this.grounded)this.airSpeed=Math.max(3.8,Math.hypot(this.vx,this.vz));this.grounded=false;this.vy-=18*h;const ny=this.y+this.vy*h;if(ny<=nextGround){this.lastImpact=Math.max(this.lastImpact,-this.vy);this.y=nextGround;this.vy=0;this.grounded=true;}else if(this.vy>0&&!canMove(position.x,position.z,ny)){this.vy=0;}else this.y=ny;}
   if(this.y<nextGround){this.y=nextGround;this.vy=0;this.grounded=!this.swimming;}
  }
  return Math.min(1,Math.hypot(this.vx,this.vz)/3.8);
 }
}
