const STANDING=1.72,CROUCHED=1.05;
/** Exact critically damped eye-height spring: frame-rate independent, reversible, no overshoot. */
export class CrouchStance09 {
 constructor(){this.reset();}
 reset(crouched=false){this.height=crouched?CROUCHED:STANDING;this.velocity=0;}
 update(dt,crouched,maxHeight=STANDING){
  dt=Math.max(0,Math.min(.1,dt));
  const target=crouched?CROUCHED:STANDING,omega=18,error=this.height-target,temporary=(this.velocity+omega*error)*dt,decay=Math.exp(-omega*dt);
  this.height=target+(error+temporary)*decay;this.velocity=(this.velocity-omega*temporary)*decay;
  // A low ceiling takes precedence over animation. Never ease the camera through solid geometry.
  const limit=Math.max(.9,Math.min(STANDING,maxHeight));
  this.height=Math.max(.9,Math.min(limit,this.height));if(this.height===limit&&this.velocity>0)this.velocity=0;
  if(Math.abs(this.height-target)<.0001&&Math.abs(this.velocity)<.001){this.height=Math.min(target,limit);this.velocity=0;}
  return this.height;
 }
 get blend(){return Math.max(0,Math.min(1,(STANDING-this.height)/(STANDING-CROUCHED)));}
}
