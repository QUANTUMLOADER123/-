import * as THREE from 'three';
import {terrainHeight} from './state.js';
const V=THREE.Vector3;
// Original jacket-platform layout, not a reproduction of a Rust mesh/map.
// +Z faces shore. All dimensions below are local; Site17 owns yaw/scale.
function rail(k,parent,a,b,y){
 k.rail(parent,[a[0],0,a[1]],[b[0],0,b[1]],y);
 const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
 // Yaw-only proxies preserve narrow oriented rail collisions after site rotation.
 // They match individual tubes, not an invisible full-height bulletproof sheet.
 for(const h of[.48,1.05]){const hit=k.box(parent,[length,.05,.05],[(a[0]+b[0])/2,y+h,(a[1]+b[1])/2],k.p.yellow,true);hit.rotation.y=angle;hit.visible=false;}
 const toe=k.box(parent,[length,.10,.055],[(a[0]+b[0])/2,y+.05,(a[1]+b[1])/2],k.p.yellow);toe.rotation.y=angle;
}
function landing(k,g,w,d,x,z,y,mat=k.p.metal){const mesh=k.floor(g,w,d,x,z,y,mat);mesh.userData.oilDeck31=true;return mesh;}
function flight(k,g,options){const s=k.stairs(g,options);for(const m of s.root.children)if(m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop===.025&&m.geometry.parameters.height>1.2)k.solids.push(m);return s;}
function stencil(k,g,digit,x,y,z){
 const segments={0:'abcedf',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgecd'};
 const strokes={a:[.20,.44,.34,.055],b:[.40,.33,.055,.20],c:[.40,.11,.055,.20],d:[.20,0,.34,.055],e:[0,.11,.055,.20],f:[0,.33,.055,.20],g:[.20,.22,.34,.055]};
 for(const key of segments[digit]||'') {const [dx,dy,w,h]=strokes[key];k.box(g,[w,h,.018],[x+dx,y+dy,z],k.p.white);}
}
function deck(k,g,w,d,y,top,towerA,towerB,heliz){
 const p=k.p,cx=3.5,cz=-2,hw=w>30?5.6:4.4,hd=w>30?7:5.6;
 // Four slabs around an actual open conductor bay: no hidden full floor.
 landing(k,g,w,d/2+cz-hd/2,0,(-d/2+cz-hd/2)/2,y);
 landing(k,g,w,d/2-cz-hd/2,0,(d/2+cz+hd/2)/2,y);
 landing(k,g,w/2+cx-hw/2,hd,(-w/2+cx-hw/2)/2,cz,y);
 landing(k,g,w/2-cx-hw/2,hd,(w/2+cx+hw/2)/2,cz,y);
 for(const xx of[-w/2+1.2,w/2-1.2])k.box(g,[.22,.38,d],[xx,y-.30,0],p.rust);
 for(const zz of[-d/2+1,d/2-1])k.box(g,[w,.38,.22],[0,y-.30,zz],p.rust);
 k.box(g,[w,.78,.12],[0,y-.43,d/2-.02],p.rust,true);
 const gap=3.4;
 for(const [z,x]of[[d/2,towerA],[-d/2,towerB]]){rail(k,g,[-w/2,z],[x-gap,z],y);rail(k,g,[x+gap,z],[w/2,z],y);}
 rail(k,g,[w/2,-d/2],[w/2,d/2],y);
 if(top){rail(k,g,[-w/2,-d/2],[-w/2,heliz-1.2],y);rail(k,g,[-w/2,heliz+1.2],[-w/2,d/2],y);}else rail(k,g,[-w/2,-d/2],[-w/2,d/2],y);
 for(const side of[-1,1]){rail(k,g,[cx-hw/2,cz+side*hd/2],[cx+hw/2,cz+side*hd/2],y);rail(k,g,[cx+side*hw/2,cz-hd/2],[cx+side*hw/2,cz+hd/2],y);}
}
function stairTower(k,x,z,levels,yaw=0,dock=false){
 const g=k.group(k.root,[x,0,z],yaw),p=k.p,start=dock?1.2:levels[0],stops=dock?[start,...levels]:levels;
 for(let i=0;i<stops.length;i++){
  const y=stops[i];landing(k,g,6.8,2.5,0,1.25,y);for(const side of[-1,1])rail(k,g,[side*3.4,0],[side*3.4,2.5],y);
  if(dock&&i===0)continue; // The larger dock itself continues beyond this edge.
  for(const [a,b]of[[-3.4,-2.55],[-.55,.55],[2.55,3.4]])rail(k,g,[a,2.5],[b,2.5],y);
  if(i===0)rail(k,g,[.55,2.5],[2.55,2.5],y);
  if(i===stops.length-1)rail(k,g,[-2.55,2.5],[-.55,2.5],y);
 }
 for(let i=1;i<stops.length;i++){
  const low=stops[i-1],rise=stops[i]-low,mid=low+rise/2;
  // Both flights are OUTSIDE every main slab; stacked flights have 4m clearance.
  flight(k,g,{x:-1.55,z:2.5,y:low,rise:rise/2,width:2,steps:10,tread:.35,yaw:Math.PI});
  landing(k,g,6.8,2,0,7,mid);rail(k,g,[-3.4,8],[3.4,8],mid);
  for(const [a,b]of[[-3.4,-2.55],[-.55,.55],[2.55,3.4]])rail(k,g,[a,6],[b,6],mid);
  for(const side of[-1,1])rail(k,g,[side*3.4,6],[side*3.4,8],mid);
  flight(k,g,{x:1.55,z:6,y:mid,rise:rise/2,width:2,steps:10,tread:.35});
 }
 for(const xx of[-3.4,3.4])for(const zz of[.15,7.9]){
  const at=g.localToWorld(new V(xx,0,zz)),bottom=Math.min(-3,terrainHeight(at.x,at.z)-.5),top=levels.at(-1)+.25;
  k.cyl(g,.10,.16,top-bottom,[xx,(top+bottom)/2,zz],p.rust,true,8);
  for(let y=start;y<top-3;y+=4)k.beam(g,[xx,y,.15],[xx,y+4,7.9],.055,p.rust);
 }
 if(dock){
  landing(k,g,7.8,5,0,3,1.2,p.rust);
  for(const side of[-1,1]){rail(k,g,[side*3.9,.5],[side*3.9,5.5],1.2);k.cyl(g,.18,.22,.65,[side*2.8,1.525,4.7],p.metal,true,12);const f=k.cyl(g,.30,.30,2,[side*3.98,.45,3.4],p.rubber);f.rotation.x=Math.PI/2;}
  // This point is clear of both flights and remains the boat disembark target.
  const at=g.localToWorld(new V(0,1.2,1.3));k.m.dock={x:at.x,z:at.z,y:at.y};
 }
 return g;
}
function jacket(k,w,d,levels){
 const g=k.root,p=k.p,xs=[-w/2+1.2,w/2-1.2],zs=[-d/2+1.2,d/2-1.2],top=levels.at(-1);
 for(const x of xs)for(const z of zs){const at=g.localToWorld(new V(x,0,z)),bottom=Math.min(-3,terrainHeight(at.x,at.z)-.8);k.cyl(g,.42,.78,levels[0]-bottom,[x,(levels[0]+bottom)/2,z],p.rust,true,16);k.cyl(g,.28,.28,top-levels[0],[x,(top+levels[0])/2,z],p.metal,true,12);for(const y of levels)k.ring(g,.47,.065,[x,y-.25,z],p.yellow,true);}
 for(const side of[-1,1]){
  for(const [a,b]of[[[xs[0],-2,side*zs[1]],[xs[1],4.8,side*zs[1]]],[[xs[1],-2,side*zs[1]],[xs[0],4.8,side*zs[1]]],[[side*xs[1],-2,zs[0]],[side*xs[1],4.8,zs[1]]],[[side*xs[1],-2,zs[1]],[side*xs[1],4.8,zs[0]]]])k.beam(g,a,b,.14,p.rust);
 }
 // Production risers continue through the open well bay, down to the seabed.
 for(const dx of[-.8,.8])for(const dz of[-1.4,0,1.4]){const x=3.5+dx,z=-2+dz,at=g.localToWorld(new V(x,0,z)),bottom=Math.min(-3,terrainHeight(at.x,at.z)-.5);k.cyl(g,.16,.16,top+.7-bottom,[x,(top+.7+bottom)/2,z],p.rust,true,10);for(const y of levels)k.ring(g,.22,.045,[x,y-.3,z],p.metal,true);}
}
function vessel(k,g,x,z,y){
 const p=k.p,c=k.cyl(g,.75,.75,4.6,[x,y+1.15,z],p.cream,true,20);c.rotation.z=Math.PI/2;
 for(const side of[-1,1]){const cap=k.mesh(g,new THREE.SphereGeometry(.75,16,10),p.cream,[x+side*2.3,y+1.15,z]);cap.scale.x=.35;k.box(g,[.28,.6,1.4],[x+side*1.5,y+.3,z],p.rust,true);}
 k.beam(g,[x,y+1.8,z],[x,y+2.7,z],.12,p.rust);k.valve(g,x,y+2.1,z+.14);
}
function generator(k,g,x,z,y){
 const p=k.p;k.box(g,[3.6,.22,2.1],[x,y+.11,z],p.rust,true);k.box(g,[2.9,1.35,1.7],[x-.2,y+.9,z],p.paint,true,.10);
 for(let i=0;i<9;i++)k.box(g,[.15,.9,.035],[x-1.25+i*.28,y+.93,z+.87],p.rubber);
 const a=k.cyl(g,.60,.60,1,[x+1.4,y+.85,z],p.metal,true,20);a.rotation.z=Math.PI/2;
 k.beam(g,[x-.8,y+1.6,z-.5],[x-.8,y+3,z-.5],.14,p.rust);k.box(g,[.65,.08,.5],[x-.8,y+3.05,z-.5],p.rubber);
}
function furnishings(k,room,kind){
 const p=k.p;
 if(kind==='control'){
  for(const x of[-2.3,0,2.3]){k.cabinet(room,x,-1.8);k.box(room,[1.5,.12,.65],[x,1.1,-.85],p.metal);k.box(room,[.9,.55,.06],[x,1.65,-1.45],p.glass);k.box(room,[.7,.10,.65],[x,.55,.45],p.rubber);for(const side of[-1,1])k.beam(room,[x+side*.25,0,.45],[x+side*.25,.5,.45],.035,p.metal);}
 }else if(kind==='workshop'){k.shelf(room,-1,-1.7,4);k.box(room,[2.5,.12,.8],[1,.95,0],p.wood);for(const side of[-1,1])k.box(room,[.12,.9,.65],[1+side*1.05,.45,0],p.metal);}
 else{for(const x of[-2.4,2.4])for(const y of[.45,1.65]){k.box(room,[1.45,.12,2.6],[x,y,-.7],p.metal);k.box(room,[1.3,.14,2.4],[x,y+.13,-.7],p.rubber);k.box(room,[.9,.12,.45],[x,y+.27,-1.55],p.cream);}for(const x of[-3.1,-1.7,1.7,3.1])k.beam(room,[x,0,-2],[x,2.2,-2],.035,p.metal);}
}
function derrick(k,top,large){
 const g=k.group(k.root,[3.5,top,-2]),p=k.p,h=large?20:15,half=large?4.1:3.5;
 for(const x of[-half,half])for(const z of[-4.8,4.8])k.beam(g,[x,0,z],[x*.18,h,z*.18],.12,p.rust);
 for(let y=0;y<h-2;y+=2.5){const next=Math.min(h,y+2.5),a=1-y/h*.82,b=1-next/h*.82;for(const side of[-1,1]){k.beam(g,[-half*a,y,side*4.8*a],[half*b,next,side*4.8*b],.045,p.metal);k.beam(g,[side*half*a,y,-4.8*a],[side*half*b,next,4.8*b],.045,p.metal);k.beam(g,[-half*a,y,side*4.8*a],[half*a,y,side*4.8*a],.06,p.rust);}}
 k.box(g,[2.1,.25,2.1],[0,h,0],p.metal);k.cyl(g,.08,.08,h,[0,h/2,0],p.rubber);k.box(g,[.6,1.3,.55],[0,2.8,0],p.yellow,true);k.ring(g,.44,.07,[0,h+.4,0],p.yellow,true);
}
function crane(k,w,d,top){
 const g=k.group(k.root,[w/2-5,top,d/2-5],-.55),p=k.p;
 k.cyl(g,1,1.35,2.2,[0,1.1,0],p.rust,true,20);k.cyl(g,1.35,1.35,.25,[0,2.3,0],p.yellow);k.box(g,[2.5,1.8,2.2],[-.6,3.3,0],p.paint,true,.08);k.box(g,[1.4,.85,.025],[-.5,3.6,1.12],p.glass);
 for(const zz of[-.55,.55]){k.beam(g,[0,3.7,zz],[13,8.5,zz],.09,p.yellow);k.beam(g,[0,5,zz],[13,9.1,zz],.09,p.yellow);for(let i=0;i<8;i++){const t=i/8,n=(i+1)/8;k.beam(g,[13*t,3.7+4.8*t,zz],[13*n,5+4.1*n,zz],.045,p.rust);}}
 k.beam(g,[13,8.8,0],[13,1.3,0],.025,p.rubber);k.ring(g,.25,.055,[13,1.05,0],p.rust);k.box(g,[2.4,1.2,2],[-2.5,3.8,0],p.rubber,true);
}
function helideck(k,w,d,top){
 const g=k.root,p=k.p,z=-d/2+7,run=16*.32,edge=-w/2-run,x=edge-6,y=top+3.2;
 // The pad begins exactly at the stair TOP, never above the stair approach.
 flight(k,g,{x:-w/2,z,y:top,rise:3.2,width:2.2,steps:16,tread:.32,yaw:Math.PI/2});
 landing(k,g,12,12,x,z,y,p.paint);
 for(const side of[-1,1]){rail(k,g,[x-6,z+side*6],[x+6,z+side*6],y);k.beam(g,[-w/2+1,top-2,z+side*4.5],[x-5,y-.2,z+side*4.5],.17,p.rust);}
 rail(k,g,[x-6,z-6],[x-6,z+6],y);rail(k,g,[edge,z-6],[edge,z-1.2],y);rail(k,g,[edge,z+1.2],[edge,z+6],y);
 k.ring(g,4.4,.045,[x,y+.035,z],p.white,true);
 for(const dx of[-1.2,1.2])k.box(g,[.28,.025,3.8],[x+dx,y+.035,z],p.white);k.box(g,[2.4,.025,.28],[x,y+.035,z],p.white);
 for(const dx of[-5.7,5.7])for(const dz of[-5.7,5.7]){k.cyl(g,.08,.11,.12,[x+dx,y+.06,z+dz],p.light,false,8);k.box(g,[.45,.025,.45],[x+dx,y+.025,z+dz],p.yellow);}
 return {x,z,y};
}
function flareBoom(k,w,d,top){
 const p=k.p,a=[w/2-2,top+1,-d/2+5],b=[w/2+12,top+10,-d/2-6];
 for(const side of[-1,1])k.beam(k.root,[a[0],a[1],a[2]+side*.6],[b[0],b[1],b[2]+side*.3],.10,p.rust);
 for(let i=0;i<8;i++){const t=i/8,n=(i+1)/8;k.beam(k.root,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t-.6],[a[0]+(b[0]-a[0])*n,a[1]+(b[1]-a[1])*n,a[2]+(b[2]-a[2])*n+.6],.04,p.metal);}
 k.cyl(k.root,.18,.24,1.7,[b[0],b[1]+.85,b[2]],p.rubber); // Idle soot-darkened flare, not an infinite fuel source.
}
export function oilrig31(k,large){
 const g=k.root,p=k.p,w=large?36:28,d=large?30:24,levels=Array.from({length:large?6:4},(_,i)=>5.2+i*4),top=levels.at(-1),a=-w/2+4,b=w/2-4,heliz=-d/2+7;
 g.userData.oilRevision31=31;jacket(k,w,d,levels);
 for(let i=0;i<levels.length;i++){
  const y=levels[i];deck(k,g,w,d,y,i===levels.length-1,a,b,heliz);stencil(k,g,i+1,a-1.5,y-.7,d/2+.13);
  const equipment=k.group(g,[0,y,0]);
  // Keep a continuous perimeter and a broad central aisle free of equipment.
  if(i===0){generator(k,g,-w/2+7,-d/2+6,y);generator(k,g,-w/2+7,d/2-5,y);}
  else if(i===1||i===levels.length-1||large&&i===3){const kind=i===levels.length-1?'control':i===1?'workshop':'quarters',room=k.room(g,{x:-w/2+7,z:-d/2+6,y,w:8,d:6,h:3.05,door:2.6,pitched:false,mat:i===levels.length-1?p.cream:p.blue});furnishings(k,room,kind);}
  else {k.tank(g,-w/2+6,-d/2+6,1.3,2.6,p.paint,y);k.tank(g,-w/2+10,-d/2+6,1.3,2.6,p.paint,y);}
  vessel(k,g,w/2-5.5,-d/2+5.5,y);if(i%2===0)vessel(k,g,w/2-5.5,d/2-5.5,y);
  // Overhead pipe rack is above standing head height, below the next slab.
  for(const dx of[0,.45]){k.beam(g,[w/2-2.2-dx,y+2.8,-d/2+3],[w/2-2.2-dx,y+2.8,d/2-3],.10,p.rust);k.beam(g,[w/2-2.2-dx,y+2.8,-d/2+3],[w/2-5,y+2.8,-d/2+3],.10,p.metal);}
  k.valve(g,w/2-2.2,y+2.1,1);k.lamp(equipment,-w/2+1.4,1,2.5);
  const count=large?3:2;
  for(let j=0;j<count;j++){const x=j===0?-w/2+5:j===1?0:w/2-5,z=j===1?d/2-5:1.8;k.crate(g,i*count+j,[x,y,z]);}
  for(const side of[-1,1])k.barrel(g,i*2+(side>0?1:0),[side*(w/2-3.2),y,d/2-3]);
 }
 stairTower(k,a,d/2,levels,0,true);stairTower(k,b,-d/2,levels,Math.PI,false);
 derrick(k,top,large);crane(k,w,d,top);flareBoom(k,w,d,top);const pad=helideck(k,w,d,top);
 const cargo=k.container(k.group(g,[0,top,0]),-w/2+7,d/2-5,Math.PI/2,p.red,true);cargo.position.y=0;
 k.crate(cargo,large?18:8,[0,0,-1.5]);k.crate(g,large?19:9,[pad.x-4.8,pad.y,pad.z-4.8]);
 // Authored static supports replace obsolete saved prop positions only for these RT items.
 for(const item of k.loot)item.fixedSupport25=true;
 k.w.oilLayouts31??=[];k.w.oilLayouts31.push({id:k.m.id,revision:31,levels:[1.2,...levels,pad.y],stairTowers:2,loot:k.loot.length});
}
/** One-time relocation only for an old on-foot save already on a replaced rig.
 * No regeneration of the island, inventory, loot flags, bases or occupied boat. */
export function restoreOilRig31(w,state,monuments){
 if(state.oilRevision31===31)return;state.oilRevision31=31;
 if(state.boat||state.dead||!Number.isFinite(state.feetY)||state.feetY<.7)return;
 const {x,z}=state.position,rig=monuments.find(m=>m.kind==='oilrig'&&Math.hypot(x-m.x,z-m.z)<m.radius+12);if(!rig)return;
 let best=null,score=Infinity;
 const consider=(px,pz,y)=>{const cost=(px-x)**2+(pz-z)**2+.6*(y-state.feetY)**2;if(cost>=score)return;const at={...state,position:{x:px,z:pz}};if(!w.canMove(px,pz,at,y)||!w.canStand04(at,y))return;score=cost;best={x:px,z:pz,y};};
 for(const f of w.walkFloors){
  if(f.site17!==rig.id||!f.oilDeck31)continue;const co=Math.cos(f.rotation||0),si=Math.sin(f.rotation||0),hw=Math.max(0,(f.ow||f.w)/2-.7),hd=Math.max(0,(f.od||f.d)/2-.7),a=Math.max(-hw,Math.min(hw,(x-f.x)*co-(z-f.z)*si)),b=Math.max(-hd,Math.min(hd,(x-f.x)*si+(z-f.z)*co));
  consider(f.x+a*co+b*si,f.z-a*si+b*co,f.y);consider(f.x,f.z,f.y);
  for(const aa of[-hw,hw])for(const bb of[-hd,hd])consider(f.x+aa*co+bb*si,f.z-aa*si+bb*co,f.y);
 }
 if(!best&&rig.dock)consider(rig.dock.x,rig.dock.z,rig.dock.y);
 if(best){state.position={x:best.x,z:best.z};state.feetY=best.y;}
}
