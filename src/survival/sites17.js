import {oilrig31,restoreOilRig31} from './oilrig31.js';
import {sphere25} from './sphere25.js';
import {terrainHeight} from './state.js';
import * as THREE from 'three';
import {MONUMENTS} from './map-data.js';
import {Site17,siteMaterials17} from './site-kit17.js';
import {floorContains08} from './roads08.js';
const V=THREE.Vector3;
function platform(k,parent,x,z,w,d,y){const g=k.group(parent,[x,0,z]);k.floor(g,w,d,0,0,y,k.p.metal);for(const xx of[-w/2+.25,w/2-.25])for(const zz of[-d/2+.25,d/2-.25])k.beam(g,[xx,.18,zz],[xx,y-.1,zz],.10,k.p.rust);k.rail(g,[-w/2,0,-d/2],[w/2,0,-d/2],y);return g;}
function dish(k,parent,r,height,tilt=.65){
 const pivot=k.group(parent,[0,height,0]);pivot.rotation.x=tilt;
 // Paraboloid opens along +Z. Rim, feed and ribs share its tilted parent.
 const points=[];for(let i=0;i<=18;i++){const x=r*i/18;points.push(new THREE.Vector2(x,x*x/(r*1.8)));}
 const geo=new THREE.LatheGeometry(points,40);geo.rotateX(Math.PI/2);const material=k.p.metal.clone();material.side=THREE.DoubleSide;k.mesh(pivot,geo,material);
 k.ring(pivot,r,.055,[0,0,r/1.8],k.p.cream);
 for(let j=0;j<8;j++){const a=j*Math.PI/4;k.beam(pivot,[Math.sin(a)*r,Math.cos(a)*r,r/1.8],[0,0,r*.95],.027,k.p.rust);}
 k.cyl(pivot,.15,.20,.45,[0,0,r*.95],k.p.rubber).rotation.x=Math.PI/2;return pivot;
}
function crane(k,parent,x,z,h=14,base=.18){const g=k.group(parent,[x,base,z]);for(const xx of[-1,1])for(const zz of[-1,1])k.beam(g,[xx*1.3,0,zz*1.3],[xx*.6,h,zz*.6],.12,k.p.rust);for(let y=1;y<h-2;y+=3)for(const side of[-1,1]){k.beam(g,[-1,y,side],[1,y+3,side],.055);k.beam(g,[side,y,-1],[side,y+3,1],.055);}k.beam(g,[-5,h,0],[9,h,0],.14);k.beam(g,[0,h+2,0],[9,h,0],.055);k.beam(g,[0,h+2,0],[-5,h,0],.055);k.beam(g,[8,h,0],[8,3.5,0],.02,k.p.rubber);k.ring(g,.22,.045,[8,3.3,0],k.p.rust);k.box(g,[2,1.5,1.6],[-3,h-.7,0],k.p.paint);return g;}
function perimeter(k,r){for(const side of[-1,1]){k.rail(k.root,[side*3,0,r],[side*(r*.68),0,r],.18);k.lamp(k.root,side*3,r,3.2);}k.sign(k.root,k.m.name,[0,3.1,r+.07],Math.min(9,r*.65));}
function lighthouse(k){
 const g=k.root,p=k.p;k.floor(g,10,10,0,0,.18);
 // Hollow stone tower: chord wall pieces with an actual front doorway.
 const radius=2.9,h=16.2,n=28;
 for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2,wall=k.group(g,[Math.sin(a)*radius,0,Math.cos(a)*radius],a);if(Math.cos(a)>.94){k.box(wall,[.68,h-2.6,.25],[0,2.6+(h-2.6)/2,0],p.cream,true);}else k.box(wall,[.68,h,.25],[0,h/2,0],i%7===0?p.red:p.cream,true);}
 const count=100,rise=16,delta=Math.PI*2/25;
 for(let i=0;i<count;i++){const a=i*delta,step=k.group(g,[Math.sin(a)*1.85,0,Math.cos(a)*1.85],a);k.floor(step, .76,1.5,0,0,.18+(i+1)*rise/count,p.metal);}
 k.cyl(g,.13,.13,16,[0,8.18,0],p.rust);
 for(const side of[-1,1]){k.floor(g,.7,7.6,side*3.45,0,16.3,p.metal);k.floor(g,6.2,.7,0,side*3.45,16.3,p.metal);}const exit=k.group(g,[0,0,0],99*delta);k.floor(exit,.76,1.1,0,3.1,16.18,p.metal);for(const side of[-1,1]){k.rail(g,[-3.8,0,side*3.8],[3.8,0,side*3.8],16.3);k.rail(g,[side*3.8,0,-3.8],[side*3.8,0,3.8],16.3);}
 const lantern=k.group(g,[0,16.3,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.beam(lantern,[Math.sin(a)*1.8,0,Math.cos(a)*1.8],[Math.sin(a)*1.8,2.7,Math.cos(a)*1.8],.055);}
 k.cyl(lantern,0,2.45,1.3,[0,3.1,0],p.paint,false,24);k.cyl(lantern,.5,.5,.8,[0,1.5,0],p.light);
 const cottage=k.room(g,{x:-10,z:0,w:7,d:6,mat:p.brick,yaw:.16});k.shelf(cottage,0,-2,4);k.crate(cottage,0,[-2,0,0]);k.crate(g,1,[2,16.3,-3.45]);k.crate(g,2,[7,.18,-5]);k.pallet(g,8,4);k.sign(g,'МАЯК · 01',[0,3.4,3.06],3.7);
}
function harbor(k){const g=k.root,p=k.p;k.floor(g,32,30,0,0,.18);const shed=k.room(g,{x:-9,z:-6,w:11,d:8,mat:p.brick});k.shelf(shed,-3,-2,3);k.shelf(shed,3,-2,3);k.crate(shed,0,[-3,0,1]);
 for(let i=0;i<3;i++){const c=k.container(g,3+i*4.5,-8,0,i%2?p.rust:p.blue,true);if(i===1)k.crate(c,1,[0,0,-1]);}
 crane(k,g,-7,7,16);k.pallet(g,9,5);k.pallet(g,10,9);k.crate(g,2,[12,.18,3]);
 const pier=k.group(g,[3,0,14]);for(let j=0;j<8;j++){const z=j*2.4;k.floor(pier,6,2.4,0,z,.18,p.wood);for(const x of[-2.5,2.5]){const point=pier.localToWorld(new V(x,0,z)),bottom=Math.min(-.12,terrainHeight(point.x,point.z)-point.y-.45);k.beam(pier,[x,bottom,z],[x,.1,z],.16,p.rust);}}
 for(const side of[-1,1])k.rail(pier,[side*3,0,0],[side*3,0,16.8],.18);k.crate(pier,3,[0,.18,14]);k.sign(g,'ПОРТ СЕВЕР',[0,3.2,12],7);
}
function airfield(k){const g=k.root,p=k.p;k.floor(g,11,53,-5,0,.18,p.asphalt);for(let z=-23;z<24;z+=5)k.box(g,[.20,.018,2.6],[-5,.194,z],p.white);for(const side of[-1,1])for(let z=-24;z<=24;z+=6)k.cyl(g,.07,.07,.08,[-5+side*5.1,.23,z],p.light,false,8);
 const hangar=k.group(g,[12,.18,-6]);k.floor(hangar,12,17,0,0,0);for(const x of[-6,6])k.box(hangar,[.18,4.2,17],[x,2.1,0],p.metal,true);k.box(hangar,[12,4.2,.18],[0,2.1,-8.5],p.paint,true);
 // Barrel roof in the XY section, extruded along Z. No compounded cylinder rotations.
 const shape=new THREE.Shape();shape.moveTo(-6.2,4.1);shape.absarc(0,4.1,6.2,Math.PI,0,true);shape.lineTo(6.05,4.1);shape.absarc(0,4.1,6.05,0,Math.PI,false);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:17.6,bevelEnabled:false,steps:1,curveSegments:28});geo.translate(0,0,-8.8);k.mesh(hangar,geo,p.metal);
 for(let z=-8;z<=8;z+=4){k.beam(hangar,[-6,4,z],[0,10.1,z],.07,p.rust);k.beam(hangar,[0,10.1,z],[6,4,z],.07,p.rust);}
 k.sign(hangar,'АНГАР 03',[0,5,8.86],5);k.crate(hangar,0,[-4,0,-5]);k.crate(hangar,1,[4,0,-5]);k.shelf(hangar,-4,0,2.5);
 const tower=k.room(g,{x:12,z:17,w:7,d:7,h:3.4,mat:p.concrete,pitched:false});k.cabinet(tower,2,-2);platform(k,g,12,17,7.8,7.8,6.7);k.stairs(g,{x:7,z:23,rise:6.52,width:1.7});k.floor(g,6,1.05,9,11.95,6.7,p.metal);k.floor(g,2,2,12,12.7,6.7,p.metal);k.crate(g,2,[12,6.7,17]);k.crate(g,3,[-11,.18,18]);
}
function power(k){const g=k.root,p=k.p;k.floor(g,33,31,0,0,.18);const hall=k.room(g,{x:-7,z:-5,w:13,d:12,h:5.2,mat:p.brick});k.shelf(hall,-4,-4,3);for(const x of[-3,3]){k.cyl(hall,1,1,2.2,[x,1.1,0],p.metal,true);k.beam(hall,[x,2.2,0],[x,4,-4],.17,p.rust);}k.crate(hall,0,[-4,0,3]);
 for(const x of[5,12]){k.tank(g,x,-9,1.7,13,p.concrete);for(let i=0;i<3;i++){const yy=4+i*3;k.ring(g,1.74,.07,[x,yy,-9],p.red,true);}}
 for(let i=0;i<3;i++){const x=6+i*3.4;k.box(g,[2.6,1.7,2.3],[x,1.03,4],p.paint,true,.08);for(let j=0;j<3;j++){k.cyl(g,.13,.13,.8,[x-.7+j*.7,2.3,4],p.cream);for(let a=0;a<4;a++)k.ring(g,.22,.035,[x-.7+j*.7,2+a*.16,4],p.cream,true);}k.cabinet(g,x,8);}
 platform(k,g,-8,7,10,3,3.1);k.stairs(g,{x:-8,z:13,rise:2.92});k.crate(g,1,[-10,3.1,7]);k.crate(g,2,[10,.18,11]);k.crate(g,3,[-13,.18,10]);
}
function quarry(k){const g=k.root,p=k.p;k.floor(g,34,30,0,0,.18);for(let i=0;i<3;i++){const z=-11+i*4;k.box(g,[24,1.1,.55],[-2,.73,z],p.concrete,true);k.floor(g,24,3,-2,z+1.6,.18+i*.55,p.concrete);}const crusher=k.group(g,[9,0,-7]);for(const x of[-2,2])for(const z of[-2,2])k.beam(crusher,[x,.18,z],[x,5,z],.12,p.rust);k.cyl(crusher,2.6,.7,2.4,[0,5,0],p.rust);k.box(crusher,[3,1.5,2.8],[0,2.8,0],p.paint,true);
 const belt=k.group(g,[-5,1.1,2],-.25);const slope=.19,run=18;for(const side of[-1,1])k.beam(belt,[side*1.2,0,0],[side*1.2,run*Math.tan(slope),-run],.09,p.rust);for(let i=0;i<14;i++){const z=-i*run/14,y=i*run/14*Math.tan(slope),roller=k.cyl(belt,.14,.14,2.25,[0,y,z],p.rubber);roller.rotation.z=Math.PI/2;}for(const z of[-2,-9,-16])for(const side of[-1,1])k.beam(belt,[side*1.1,-1,z],[side*1.1,-z*Math.tan(slope),z],.08);
 const office=k.room(g,{x:-10,z:10,w:8,d:6,mat:p.wood});k.crate(office,0,[0,0,-1]);k.crate(g,1,[11,.18,7]);k.crate(g,2,[2,.18,10]);k.crate(g,3,[-14,.18,-2]);
}
function radar(k){const g=k.root,p=k.p;k.floor(g,28,27,0,0,.18);for(const x of[-3,3])for(const z of[-3,3])k.beam(g,[x,.18,z],[x*.45,8,z*.45],.16,p.rust);platform(k,g,0,0,8,8,7.8);dish(k,g,6.4,9.6,.50);k.stairs(g,{x:5.3,z:11,rise:7.62,width:1.8});k.floor(g,2.2,1,4.6,-1.97,7.8,p.metal);const lab=k.room(g,{x:-8,z:8,w:9,d:7,mat:p.concrete});for(const x of[-2,2])k.cabinet(lab,x,-2);k.crate(lab,0,[0,0,0]);k.crate(g,1,[-2,7.8,2]);k.crate(g,2,[9,.18,-6]);k.crate(g,3,[-12,.18,-7]);}
function waterworks(k){const g=k.root,p=k.p;k.floor(g,32,29,0,0,.18);for(const x of[-8,7]){k.cyl(g,4.9,4.9,1.8,[x,1.08,-6],p.concrete,true,32);k.cyl(g,4.5,4.5,.03,[x,2,-6],p.glass,false,32);k.ring(g,4.75,.12,[x,2.02,-6],p.metal,true);k.floor(g,9.5,.8,x,-6,2.15,p.metal);k.rail(g,[x-4.7,0,-6.5],[x+4.7,0,-6.5],2.15);}
 for(const x of[-8,7]){k.floor(g,1.3,6.8,x,-3.3,2.15,p.metal);for(const side of[-1,1])k.rail(g,[x+side*.65,0,-1],[x+side*.65,0,-5.5],2.15);}k.floor(g,16,2,-.5,0,2.15,p.metal);k.stairs(g,{x:-.5,z:4.2,rise:1.97,width:2,tread:.32});for(const x of[-10,-5,5,10]){k.beam(g,[x,.6,3],[x,.6,9],.20,p.blue);k.valve(g,x,1,5);}
 const lab=k.room(g,{x:7,z:9,w:10,d:7,mat:p.cream});k.cabinet(lab,3,-2);k.crate(lab,0,[-3,0,-1]);k.crate(g,1,[-8,2.15,-6]);k.crate(g,2,[-12,.18,9]);}
function gas(k){const g=k.root,p=k.p;k.floor(g,28,24,0,0,.18,p.asphalt);const shop=k.room(g,{x:-7,z:-5,w:11,d:8,mat:p.cream});k.shelf(shop,-3,-2,3);k.shelf(shop,3,-2,3);k.box(shop,[3,.9,.6],[0,.45,-2],p.wood,true);k.crate(shop,0,[-3,0,1]);
 for(const x of[3,11])for(const z of[-4,6])k.beam(g,[x,.18,z],[x,4.5,z],.11,p.red);k.box(g,[11,.25,13],[7,4.6,1],p.white);k.box(g,[11,.36,.12],[7,4.6,7.6],p.red);
 for(const x of[4,10]){k.box(g,[1,1.7,.8],[x,1.03,1],p.cream,true,.04);k.box(g,[.8,.30,.02],[x,1.5,1.42],p.rubber);k.beam(g,[x+.55,1.4,1],[x+.8,.5,1.4],.035,p.rubber);}
 k.vehicle(g,8,10,Math.PI/2);k.crate(g,1,[-12,.18,7]);k.crate(g,2,[12,.18,-7]);k.sign(g,'ТОПЛИВО',[7,4.55,7.68],6);
}
function junkyard(k){const g=k.root,p=k.p;k.floor(g,31,29,0,0,.18);for(let i=0;i<4;i++)k.vehicle(g,-9+(i%2)*8,-8+Math.floor(i/2)*8,i%2?.3:Math.PI/2,i===3);crane(k,g,10,-5,11);
 for(let i=0;i<12;i++)k.ring(g,.55,.17,[-11+(i%4)*1.4,.4+Math.floor(i/4)*.32,9],p.rubber,true);
 const shed=k.room(g,{x:5,z:10,w:9,d:6,mat:p.rust});k.shelf(shed,0,-2,5);k.crate(shed,0,[-3,0,0]);k.crate(g,1,[12,.18,5]);k.crate(g,2,[-4,.18,8]);k.crate(g,3,[-13,.18,-12]);
}
function bunker(k){const g=k.root,p=k.p;k.floor(g,28,25,0,0,.18);const b=k.room(g,{x:0,z:-2,w:18,d:15,h:4,mat:p.concrete,pitched:false,door:3.2});
 // Split interior baffles, not a solid front wall across the route.
 for(const x of[-4,4])k.box(b,[.26,3.5,8],[x,1.75,-2],p.concrete,true);for(const side of[-1,1])k.shelf(b,side*6,-5,3);k.cabinet(b,0,-6);k.crate(b,0,[-6,0,-1]);k.crate(b,1,[6,0,-1]);k.crate(b,2,[0,0,-5]);
 platform(k,g,0,7,7,3,4.31);k.stairs(g,{x:12,z:9,rise:4.13,width:2});k.floor(g,5,2,10,1.3,4.31,p.metal);k.crate(g,3,[0,4.31,-6]);for(const side of[-1,1])for(let i=0;i<3;i++)k.box(g,[2.4,.7,.9],[side*5,.53,9+i*2],p.concrete,true);
}
function supermarket(k){const g=k.root,p=k.p;k.floor(g,22,22,0,0,.18);const shop=k.room(g,{x:0,z:-1,w:18,d:13,h:3.8,mat:p.brick,door:4});for(const x of[-5,0,5])k.shelf(shop,x,-2,3);for(const x of[-6,6]){k.box(shop,[2.8,.9,.7],[x,.45,4],p.cream,true);k.box(shop,[.35,.28,.3],[x,.99,4],p.rubber);}
 k.sign(shop,'БЕРЕГ · МАРКЕТ',[0,3.05,6.65],8);k.crate(shop,0,[-7,0,-5]);k.crate(shop,1,[7,0,-5]);k.crate(g,2,[-8,.18,9]);k.crate(g,3,[8,.18,9]);k.pallet(g,0,9);
}
function satellite(k){const g=k.root,p=k.p;k.floor(g,22,23,0,0,.18);for(const x of[-6,6]){k.cyl(g,.75,1.2,3,[x,1.68,-4],p.concrete,true);const pivot=k.group(g,[x,0,-4],x<0?-.65:.6);dish(k,pivot,3.4,4.6,.95);}const hut=k.room(g,{x:0,z:6,w:10,d:6,mat:p.blue});for(const x of[-3,0,3])k.cabinet(hut,x,-2);k.crate(hut,0,[-3,0,1]);k.crate(hut,1,[3,0,1]);k.crate(g,2,[-9,.18,-8]);k.crate(g,3,[9,.18,-8]);}
function trainyard(k){const g=k.root,p=k.p;k.floor(g,28,30,0,0,.18);for(const x of[-7,0]){for(const side of[-1,1])k.beam(g,[x+side*.75,.25,-15],[x+side*.75,.25,15],.055,p.metal);for(let z=-14;z<15;z+=1)k.box(g,[2.8,.12,.18],[x,.18,z],p.wood);}
 for(let i=0;i<2;i++){const car=k.container(g,-7+i*7,-5+i*5,0,i?p.rust:p.blue,true);car.position.y=.95;for(const z of[-2,2])for(const x of[-1.1,1.1])k.cyl(car,.38,.38,.15,[x,-.45,z],p.rubber).rotation.z=Math.PI/2;k.crate(car,i,[0,0,-1]);k.stairs(g,{x:-7+i*7,z:0+i*5,rise:.77,width:1.7});k.floor(g,1.7,1,-7+i*7,-1.7+i*5,.95,p.metal);}
 const station=k.room(g,{x:9,z:3,w:7,d:15,mat:p.brick});k.cabinet(station,2,-5);k.crate(station,2,[0,0,3]);k.crate(g,3,[10,.18,-12]);
}
function mining(k){const g=k.root,p=k.p;k.floor(g,26,24,0,0,.18);for(const x of[-8,8]){const hut=k.room(g,{x,z:5,w:7,d:7,mat:p.wood,yaw:x<0?.12:-.12});k.shelf(hut,0,-2,4);k.crate(hut,x<0?0:1,[0,0,0]);}
 const head=k.group(g,[0,0,-6]);for(const x of[-2.2,2.2])for(const z of[-2,2])k.beam(head,[x,.18,z],[x*.55,9,z*.55],.12,p.rust);for(let y=2;y<9;y+=2)k.beam(head,[-2,y,-2],[2,y+1.8,-2],.065);
 const wheel=k.ring(head,1.2,.12,[0,8.7,0],p.metal);wheel.rotation.y=Math.PI/2;k.beam(head,[0,8.7,0],[0,.18,0],.025,p.rubber);k.box(head,[3,.25,3],[0,.305,0],p.rubber,true);k.crate(g,2,[-9,.18,-7]);k.crate(g,3,[9,.18,-7]);
}
function wreckyard(k){const g=k.root,p=k.p;k.floor(g,22,24,0,0,.18,p.asphalt);k.vehicle(g,-5,-5,.18,true);k.vehicle(g,4,2,-.25,true);k.vehicle(g,-6,8,1.4);const service=k.container(g,7,-7,0,p.paint,true);k.shelf(service,0,-1,1.5);k.crate(service,0,[0,0,1]);k.crate(g,1,[-9,.18,-8]);k.crate(g,2,[0,.18,9]);k.crate(g,3,[9,.18,8]);for(const z of[-10,10])for(const side of[-1,1])k.box(g,[3,.65,.65],[side*6,.505,z],p.concrete,true);}
function waterTower(k){const g=k.root,p=k.p;k.floor(g,18,19,0,0,.18);for(const x of[-2.7,2.7])for(const z of[-2.7,2.7])k.beam(g,[x,.18,z],[x,9,z],.13,p.rust);for(let y=1;y<8;y+=2)for(const side of[-1,1]){k.beam(g,[-2.7,y,side*2.7],[2.7,y+2,side*2.7],.06);k.beam(g,[side*2.7,y,-2.7],[side*2.7,y+2,2.7],.06);}
 k.cyl(g,2.8,3.1,4,[0,11,0],p.blue,true,28);k.cyl(g,0,2.95,1.2,[0,13.6,0],p.paint);platform(k,g,0,0,7.5,7.5,8.9);k.stairs(g,{x:4.6,z:8.5,rise:8.72,width:1.6,tread:.26});k.floor(g,2.7,1.05,4,-3.45,8.9,p.metal);const shed=k.room(g,{x:-5,z:5,w:6,d:5,mat:p.brick});k.crate(shed,0,[0,0,0]);k.crate(g,1,[-2.9,8.9,2.9]);k.crate(g,2,[-7,.18,-6]);k.crate(g,3,[7,.18,5]);
}
function outpost(k){const g=k.root,p=k.p;k.floor(g,32,32,0,0,.18);for(const side of[-1,1]){k.box(g,[.35,2.4,28],[side*16,1.38,0],p.concrete,true);k.box(g,[11.5,2.4,.35],[side*10.25,1.38,15],p.concrete,true);}k.box(g,[32,2.4,.35],[0,1.38,-16],p.concrete,true);
 for(let i=0;i<3;i++){const r=k.room(g,{x:-10+i*10,z:-7,w:8.5,d:10,mat:i===1?p.cream:p.concrete,pitched:false});k.shelf(r,0,-3,5);k.box(r,[3,.9,.6],[0,.45,-1],p.wood,true);k.terminal(r,i,[0,0,2.2],i===2);k.sign(r,['СНАБЖЕНИЕ','МЕДИЦИНА','МАСТЕРСКАЯ'][i],[0,3,5.15],6);}
 for(const x of[-11,11]){platform(k,g,x,11,4,4,4);k.stairs(g,{x:Math.sign(x)*2.6,z:11,rise:3.82,width:1.4,yaw:-Math.sign(x)*Math.PI/2});k.sign(g,'МИРНАЯ ЗОНА',[0,3.6,15.3],7);}
 for(const x of[-9,9]){k.box(g,[4,.14,.7],[x,.65,5],p.wood,true);k.box(g,[4,.65,.12],[x,1,5.4],p.wood);k.lamp(g,x,8);}
 k.cyl(g,1.6,1.7,.35,[0,.35,5],p.concrete,true);k.cyl(g,1.35,1.35,.025,[0,.54,5],p.glass);
}
function market(k){const g=k.root,p=k.p;k.floor(g,30,29,0,0,.18,p.brick);const arch=k.room(g,{x:0,z:-8,w:10,d:8,mat:p.wood,h:4});k.shelf(arch,0,-2,6);k.terminal(arch,2,[0,0,1],true);k.sign(arch,'ПОСЁЛОК ТОРГОВЦЕВ',[0,3,4.16],8);
 for(const side of[-1,1]){const stall=k.group(g,[side*9,.18,2],side*Math.PI/2);for(const x of[-3,3])for(const z of[-2,2])k.beam(stall,[x,0,z],[x,3,z],.07,p.wood);for(let i=0;i<8;i++){const canopy=k.box(stall,[.8,.08,4.7],[-2.8+i*.8,3.1,0],i%2?p.cream:p.red);canopy.rotation.x=.12;}k.box(stall,[5.8,.9,.8],[0,.45,0],p.wood,true);k.terminal(stall,side<0?0:1,[0,0,2]);k.pallet(stall,-2,-1);}
 k.tank(g,10,-9,1.1,4,p.wood);for(const x of[-8,8])k.box(g,[3,.2,.6],[x,.65,10],p.wood,true);k.sign(g,'ОБМЕН · ОТДЫХ · РЕМОНТ',[0,2.8,12],8);
}

const LAND17={lighthouse,harbor,airfield,power,quarry,radar,waterworks,gas,junkyard,bunker,supermarket,satellite,trainyard,mining,wreckyard,waterTower,outpost,market};
export function buildSites17(w){
 const p=siteMaterials17(w);w.siteLayouts17=[];w.guardSpawns17=new Map();
 for(const m of MONUMENTS){const coast=m.kind==='harbor'?Math.atan2(m.x,m.z):m.kind==='oilrig'?Math.atan2(-m.x,-m.z):undefined,k=new Site17(w,m,p,coast);
  if(m.kind==='oilrig')oilrig31(k,m.id==='oil-large');else{const build=LAND17[m.kind];if(!build)throw new Error('No DEV17 authored site for '+m.kind);build(k);if(!m.safe){k.floor(k.root,5,2.4,-m.radius*.5+1.5,m.radius*.82,.18,p.concrete);for(let i=0;i<3;i++)k.barrel(k.root,i,[-m.radius*.50+i*1.5,.18,m.radius*.82]);}perimeter(k,m.radius/(m.siteScale25||1)*.72);}
  const guard={airfield:[-5,18],power:[0,12],radar:[8,8],bunker:[0,10.5]}[m.kind];
  if(guard)w.guardSpawns17.set(m.id,k.root.localToWorld(new V(guard[0],.18,guard[1])));
  k.finish();
 }
 // One-time recovery only if an old saved position is inside replacement scenery.
 // Do not touch the island revision, inventory, structures, or an occupied boat.
 w.restoreSites17=state=>{
  restoreOilRig31(w,state,MONUMENTS);
  if(state.siteRevision17===17)return;state.siteRevision17=17;if(state.boat)return;
  const {x,z}=state.position,m=MONUMENTS.find(m=>Math.hypot(m.x-x,m.z-z)<m.radius+12);
  if(!m)return;const feet=Number.isFinite(state.feetY)?state.feetY:w.floorHeight(x,z,state);
  if(w.canMove(x,z,state,feet))return;
  const place=(x,z,y)=>{const at={...state,position:{x,z}};if(!w.canMove(x,z,at,y)||!w.canStand04(at,y))return false;state.position={x,z};state.feetY=y;return true;};
  const nearby=w.walkFloors.filter(f=>f.site17===m.id&&floorContains08(f,x,z)&&Math.abs(f.y-feet)<1).sort((a,b)=>Math.abs(a.y-feet)-Math.abs(b.y-feet));
  for(const f of nearby)if(place(x,z,f.y))return;
  for(let r=.5;r<=Math.min(40,m.radius+8);r+=.5)for(let i=0;i<32;i++){const px=x+Math.cos(i*Math.PI/16)*r,pz=z+Math.sin(i*Math.PI/16)*r,y=w.floorHeight(px,pz,state,feet+.9);if(Math.abs(y-feet)<1.1&&place(px,pz,y))return;}
  const entry=m.entry17;if(entry)place(entry.x,entry.z,w.floorHeight(entry.x,entry.z,state,entry.y+.5));
 };
}
