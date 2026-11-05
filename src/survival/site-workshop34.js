import * as THREE from 'three';
import {terrainHeight} from './state.js';
/** Original industrial kit. Decorative fittings never add broad invisible colliders. */
export function workshopKit34(k){
 const p=k.p,g=k.root;
 const box=(parent,size,pos,mat=p.rust,solid=false)=>k.box(parent,size,pos,mat,solid);
 const pipe=(parent,points,r=.065,mat=p.rust)=>{for(let i=1;i<points.length;i++)k.beam(parent,points[i-1],points[i],r,mat);for(const point of points.slice(1,-1))k.mesh(parent,new THREE.SphereGeometry(r,8,6),mat,point);};
 const cable=(parent,a,b,sag=.3)=>{const mid=a.map((v,i)=>(v+b[i])/2);mid[1]-=sag;const path=new THREE.CatmullRomCurve3([a,mid,b].map(v=>new THREE.Vector3(...v)));k.mesh(parent,new THREE.TubeGeometry(path,12,.014,5,false),p.rubber);};
 const panel=(parent,x,y,z)=>{box(parent,[.75,1.05,.20],[x,y,z],p.paint);box(parent,[.43,.20,.025],[x,y+.23,z+.113],p.glass);for(let i=0;i<3;i++)k.cyl(parent,.035,.035,.025,[x-.22+i*.22,y-.1,z+.12],i===0?p.red:p.yellow).rotation.x=Math.PI/2;for(let i=0;i<5;i++)box(parent,[.50,.014,.025],[x,y-.26-i*.04,z+.12],p.rubber);pipe(parent,[[x,y+.53,z],[x,y+.85,z],[x+1,y+.85,z]],.022,p.metal);};
 const pump=(parent,x,z,y=.18)=>{const a=k.group(parent,[x,y,z]);box(a,[1.65,.20,.95],[0,.1,0],p.concrete,true);const motor=k.cyl(a,.27,.27,.75,[-.25,.50,0],p.paint,true,16);motor.rotation.z=Math.PI/2;for(let i=0;i<7;i++){const r=k.ring(a,.28,.016,[-.57+i*.10,.50,0],p.metal);r.rotation.y=Math.PI/2;}k.cyl(a,.37,.37,.35,[.40,.5,0],p.rust,true,16).rotation.z=Math.PI/2;pipe(a,[[.50,.5,0],[.50,.5,.8],[1.2,.5,.8]],.095);box(a,[.16,.14,.13],[.05,.72,0],p.rubber);cable(a,[.05,.72,0],[-.5,.2,-.4],.1);return a;};
 const bench=(parent,x,z,width=2.6)=>{const a=k.group(parent,[x,0,z]);box(a,[width,.11,.85],[0,.96,0],p.wood,true);for(const xx of[-width/2+.12,width/2-.12])for(const zz of[-.30,.30])k.beam(a,[xx,.05,zz],[xx,.91,zz],.045,p.rust);box(a,[width-.2,.06,.65],[0,.28,0],p.metal);box(a,[.35,.18,.23],[-width*.3,1.1,0],p.rust);k.cyl(a,.045,.045,.52,[-width*.3,1.18,0],p.metal).rotation.z=Math.PI/2;box(a,[.6,.025,.40],[width*.2,1.035,0],p.cream);return a;};
 const building=(x,z,w=8,d=7,{roofAccess=false,workshop=true,mat=p.cream}={})=>{
  const a=k.group(g,[x,.18,z]);a.userData.floorLocal17=.025;k.floor(a,w,d,0,0,.025,p.concrete);const h=3.2,door=2.6;
  box(a,[w,h,.18],[0,h/2,-d/2],mat,true);
  for(const side of[-1,1]){const wing=(w-door)/2;box(a,[wing,h,.18],[side*(door/2+wing/2),h/2,d/2],mat,true);box(a,[door,h-2.6,.18],[0,2.6+(h-2.6)/2,d/2],mat,true);
   // Real window aperture: sill, head and two piers rather than glass over a solid wall.
   box(a,[.18,.90,d],[side*w/2,.45,0],mat,true);box(a,[.18,h-2.15,d],[side*w/2,2.15+(h-2.15)/2,0],mat,true);
   for(const zz of[-1,1])box(a,[.18,1.25,d*.31],[side*w/2,1.525,zz*d*.345],mat,true);
   for(const zz of[-d*.19,0,d*.19])box(a,[.22,1.30,.055],[side*(w/2+.012),1.525,zz],p.metal);
   box(a,[.022,1.13,d*.36],[side*(w/2+.015),1.525,0],p.glass);
   k.beam(a,[side*(door/2+.05),0,d/2+.04],[side*(door/2+.05),2.63,d/2+.04],.055,p.metal);
   pipe(a,[[side*(w/2+.16),.05,-d/2+.3],[side*(w/2+.16),h+.1,-d/2+.3],[side*(w/2-.2),h+.1,-d/2+.3]],.045);
  }
  k.floor(a,w+.3,d+.3,0,0,h+.13,p.metal);
  for(let i=0;i<Math.ceil(w/.55);i++)box(a,[.035,.032,d+.3],[-w/2+i*.55,h+.145,0],p.rust);
  panel(a,-w*.28,1.5,-d/2+.13);pipe(a,[[-w*.28,2.1,-d/2+.16],[w*.30,2.1,-d/2+.16],[w*.30,.1,-d/2+.16]],.035,p.metal);
  if(workshop){bench(a,-w*.22,-d*.28,Math.min(2.6,w*.40));k.shelf(a,w*.28,-d*.30,Math.min(2,w*.30));box(a,[.65,.8,.65],[w*.29,.4,d*.15],p.paint,true);}
  if(roofAccess){const sx=w/2+1.1,sz=d/2,steps=18,tread=.32,top=sz-steps*tread;k.stairs(a,{x:sx,z:sz,y:.025,rise:h+.105,width:1.6,steps,tread});k.floor(a,2.4,2.0,w/2+.6,top,h+.13,p.metal);for(const side of[-1,1])k.rail(a,[-w/2,0,side*d/2],[w/2,0,side*d/2],h+.13);k.rail(a,[-w/2,0,-d/2],[-w/2,0,d/2],h+.13);box(a,[1.2,.65,1.0],[0,h+.455,-d*.2],p.paint);for(let i=0;i<6;i++)box(a,[.85,.025,.025],[0,h+.30+i*.07,-d*.2+.51],p.rubber);}
  if(roofAccess&&!k.m.safe){k.roofCrate34=(k.roofCrate34||100)+1;k.crate(a,k.roofCrate34,[-w*.28,h+.13,-d*.25]);}
  a.userData.building34=true;return a;
 };
 const processTank=(x,z,r=2,h=4)=>{const a=k.tank(g,x,z,r,h,p.paint);pipe(a,[[r*.7,.7,r*.7],[r+1,.7,r*.7],[r+1,.7,r+1.5]],.12);k.valve(a,r+.85,.95,r+1.5);panel(a,-r*.5,1.4,r+.12);for(let i=0;i<8;i++){const angle=i*Math.PI/4;k.cyl(a,.035,.035,.05,[Math.cos(angle)*.30,h+.50,Math.sin(angle)*.30],p.metal,false,6);}return a;};
 const pipeRack=(x,z,length=10,y=2.8)=>{for(const zz of[-length/2,length/2]){for(const xx of[-.65,.65])k.beam(g,[x+xx,.18,z+zz],[x+xx,y+.2,z+zz],.065);k.beam(g,[x-.8,y,z+zz],[x+.8,y,z+zz],.065);}for(let i=0;i<3;i++){const xx=x-.5+i*.5;pipe(g,[[xx,.25,z-length/2],[xx,y+.15,z-length/2],[xx,y+.15,z+length/2],[xx,.25,z+length/2]],.07,i===1?p.blue:p.rust);for(const zz of[-length*.4,0,length*.4]){const ring=k.ring(g,.09,.015,[xx,y+.15,z+zz],p.metal);}}};
 const yard=(r)=>{for(const side of[-1,1]){k.pallet(g,side*r*.52,r*.38);for(let i=0;i<4;i++){const scrap=box(g,[.42+i*.09,.045,.28],[side*(r*.52+(i%2)*.32),.23+(i%2)*.05,r*.40+i*.18],i%2?p.wood:p.rust);scrap.rotation.y=i*1.13;}for(let i=0;i<3;i++){const patch=k.mesh(g,new THREE.CircleGeometry(.28+i*.14,7),p.asphalt,[side*r*.47,.196,r*.18+i*.65]);patch.rotation.x=-Math.PI/2;patch.scale.y=.48;}}
  k.floor(g,r*1.36,r*1.36,0,0,.18,p.concrete);
  // Close the apron underside on older sloping saves, rather than floating slabs/posts.
  g.updateWorldMatrix(true,false);const half=r*.68;for(const side of[-1,1])for(const axis of[0,1]){const samples=[-half,0,half].map(t=>{const v=new THREE.Vector3(axis?side*half:t,0,axis?t:side*half).applyMatrix4(g.matrixWorld);return terrainHeight(v.x,v.z)-g.position.y;});const bottom=Math.min(-.18,...samples)-.12,height=.17-bottom;box(g,axis?[.22,height,r*1.36]:[r*1.36,height,.22],axis?[side*half,bottom+height/2,0]:[0,bottom+height/2,side*half],p.concrete,true);}
  for(const side of[-1,1]){for(let i=0;i<4;i++)box(g,[1.1,.016,.10],[side*(r*.48),.195,r*.15+i*.45],i%2?p.yellow:p.rubber);k.lamp(g,side*r*.59,r*.47,3.5);}const a=k.group(g,[r*.54,.18,-r*.52]);box(a,[1.3,1.6,.55],[0,.8,0],p.paint,true);panel(a,0,1,.3);cable(a,[0,1.8,0],[-2.2,2.0,0],.3);};
 return{building,pipe,cable,panel,pump,bench,processTank,pipeRack,yard};
}
