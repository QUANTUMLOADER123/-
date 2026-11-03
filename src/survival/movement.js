/** Feet-space character controller. No camera-relative flying or mid-air braking. */
export class CharacterMotor {
 constructor(){this.reset(0);}
 reset(y){this.y=y;this.vx=0;this.vz=0;this.vy=0;this.grounded=true;this.airSpeed=0;}
 stop(){if(this.grounded)this.vx=this.vz=0;}
 jump(){if(!this.grounded)return false;this.grounded=false;this.vy=5.4;this.airSpeed=Math.max(3.8,Math.hypot(this.vx,this.vz));return true;}
 step(dt,{x=0,z=0,yaw=0,sprint=false,water=false},position,{floor,canMove}){
  dt=Math.min(.1,Math.max(0,dt));const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
  const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
  const ix=x*Math.cos(yaw)+z*Math.sin(yaw),iz=-x*Math.sin(yaw)+z*Math.cos(yaw),speed=(sprint?7.2:3.8)*(water?.55:1);
  for(let i=0;i<steps;i++){
   if(this.grounded){const response=length>.01?14:11,f=1-Math.exp(-response*h);this.vx+=(ix*speed-this.vx)*f;this.vz+=(iz*speed-this.vz)*f;}
   else{this.vx+=ix*1.1*h;this.vz+=iz*1.1*h;const s=Math.hypot(this.vx,this.vz),cap=this.airSpeed;if(s>cap){this.vx*=cap/s;this.vz*=cap/s;}}
   if(Math.hypot(this.vx,this.vz)<.015&&length<.01&&this.grounded)this.vx=this.vz=0;
   const tryAxis=(axis,delta)=>{if(!delta)return;const nx=position.x+(axis==='x'?delta:0),nz=position.z+(axis==='z'?delta:0),ground=floor(nx,nz,this.y);
    if(ground>this.y+.45||!canMove(nx,nz,this.y)){if(axis==='x')this.vx=0;else this.vz=0;return;}position[axis]+=delta;
   };
   tryAxis('x',this.vx*h);tryAxis('z',this.vz*h);
   const ground=floor(position.x,position.z,this.y);
   if(this.grounded&&ground>=this.y-.16){this.y=ground;this.vy=0;}
   else{this.grounded=false;this.vy-=18*h;this.y+=this.vy*h;if(this.y<=ground&&this.vy<=0){this.y=ground;this.vy=0;this.grounded=true;}}
  }
  return Math.min(1,Math.hypot(this.vx,this.vz)/3.8);
 }
}
