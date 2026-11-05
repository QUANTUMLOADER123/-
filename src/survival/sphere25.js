import * as THREE from 'three';
/** Original industrial pressure sphere. Horizontal site scale is 1.8, vertical is 1:
 * ~61 m wide, 40 m high; stairs retain a 20 cm maximum riser. */
export function sphere25(k){
 const g=k.root,p=k.p,r=17,cy=23,shell=p.rust.clone();shell.side=THREE.DoubleSide;
 // Opening beneath the sphere is real, not a box collider around an empty room.
 const geo=new THREE.SphereGeometry(r,36,24,0,Math.PI*2,0,2.38),pos=geo.attributes.position,idx=[];
 for(let i=0;i<geo.index.count;i+=3){const a=geo.index.getX(i),b=geo.index.getX(i+1),c=geo.index.getX(i+2),x=(pos.getX(a)+pos.getX(b)+pos.getX(c))/3,y=(pos.getY(a)+pos.getY(b)+pos.getY(c))/3,z=(pos.getZ(a)+pos.getZ(b)+pos.getZ(c))/3;if(Math.abs(x)<3&&z>0&&y< -7.5)continue;idx.push(a,b,c);}geo.setIndex(idx);k.mesh(g,geo,shell,[0,cy,0]);
 for(let y=10.7;y<40;y+=2.9){const top=Math.min(40,y+2.9),mid=(y+top)/2,rr=Math.sqrt(Math.max(0,r*r-(mid-cy)**2));if(rr<2)continue;for(let i=0;i<36;i++){const a=(i+.5)/36*Math.PI*2;if(y<15.5&&Math.cos(a)>0&&Math.abs(Math.sin(a)*rr)<3.5)continue;const panel=k.group(g,[Math.sin(a)*rr,mid,Math.cos(a)*rr],a);k.box(panel,[2*rr*Math.tan(Math.PI/36),top-y,.24],[0,0,0],p.rubber,true).visible=false;}}

 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const x=k.m.entrance36&&a===0?4.2:Math.sin(a)*10.2,z=Math.cos(a)*10.2;k.beam(g,[x,.18,z],[x,12,z],.42,p.cream);k.beam(g,[x,.2,z],[x*.7,11,z*.7],.12,p.metal);}
 for(const lat of [-.58,0,.58]){const y=cy+r*Math.sin(lat),rr=r*Math.cos(lat);const ring=k.ring(g,rr,.055,[0,y,0],p.metal);ring.rotation.x=Math.PI/2;}
 // Two usable interior service platforms connected by a real stair and catwalk.
 k.floor(g,12,12,0,0,10.2,p.metal);k.floor(g,5,12,0,10,10.2,p.metal);
 k.stairs(g,{x:0,z:k.m.entrance36?21.2:32,y:.18,rise:10.02,width:2,tread:.32});
 // Stairs end at z=15.68; deck extends to z=16. Floor and stair share y=10.2.
 for(const x of [-2.5,2.5])k.rail(g,[x,0,5],[x,0,16],10.2);
 k.floor(g,10,8,0,-2,17,p.metal);k.stairs(g,{x:3,z:10,y:10.2,rise:6.8,width:1.7,tread:.32});
 // Upper stair ends z=-.88; platform spans z=-6..2, with a clear landing.
 for(const x of [-5,5])k.rail(g,[x,0,-6],[x,0,2],17);
 k.floor(g,8,6,0,-2,23.8,p.metal);k.stairs(g,{x:-3,z:9,y:17,rise:6.8,width:1.7,tread:.32});
 k.floor(g,3,8,-3,5,17,p.metal);for(const x of [-4.5,-1.5])k.rail(g,[x,0,1],[x,0,9],17);
 for(let a=0;a<Math.PI*2;a+=Math.PI/12){const x=Math.sin(a)*13.7,z=Math.cos(a)*13.7;k.beam(g,[x,13,z],[x*.9,32,z*.9],.045,p.metal);}
 const service=k.room(g,{x:-18,z:7,w:7,d:9,mat:p.brick});k.cabinet(service,-2,-3);k.shelf(service,1,-3);k.crate(service,0,[1,0,1]);
 k.tank(g,19,-3,2.2,7,p.paint);k.tank(g,19,3,2.2,7,p.rust);k.beam(g,[19,3,-3],[10,3,-3],.20,p.metal);
 k.crate(g,1,[-3,10.2,-2]);k.crate(g,2,[2,17,-3]);k.crate(g,3,[0,23.8,-3]);k.crate(g,4,[19,.18,8]);k.vehicle(g,-15,19,.3,true);
 for(const x of [-8,8])k.lamp(g,x,19,4.8);
}
