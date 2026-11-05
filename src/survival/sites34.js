import * as THREE from 'three';
import {workshopKit34} from './site-workshop34.js';
import {sphere25} from './sphere25.js';
/** New land layouts; previous crate/station IDs remain the persistence keys. */
export function buildLand34(k){
 const {kind}=k.m,p=k.p,g=k.root,r=k.m.radius/(k.m.siteScale25||1),a=r*.32,b=r*.44,q=workshopKit34(k);q.yard(r);
 const building=(x,z,w=8,d=7,opts={})=>q.building(x,z,w,d,opts);
 const crate=(i,x,z,y=.18,parent=g)=>k.crate(parent,i,[x,y,z]);
 const railDeck=(x,z,w,d,y)=>{k.floor(g,w,d,x,z,y,p.metal);for(const side of[-1,1])k.rail(g,[x-w/2,0,z+side*d/2],[x+w/2,0,z+side*d/2],y);};
 const gantry=(x,z,h=8)=>{for(const side of[-1,1]){k.beam(g,[x+side*2.5,.18,z],[x+side*2.5,h,z],.13,p.rust);k.beam(g,[x+side*2.5,h,z],[x-side*2.5,h,z],.11,p.yellow);}k.cyl(g,.3,.3,.8,[x,h-.5,z],p.rust).rotation.z=Math.PI/2;q.cable(g,[x,h-.8,z],[x,1.9,z],0);k.ring(g,.21,.045,[x,1.65,z],p.metal);};
 if(kind==='lighthouse'){
  const radius=2.5,height=13.8;for(let i=0;i<24;i++){const angle=(i+.5)*Math.PI/12;if(Math.cos(angle)>.9)continue;const wall=k.group(g,[Math.sin(angle)*radius,.18,Math.cos(angle)*radius],angle);k.box(wall,[.68,height,.23],[0,height/2,0],i%6===0?p.rust:p.cream,true);}
  for(let i=0;i<88;i++){const angle=i*Math.PI/11,step=k.group(g,[Math.sin(angle)*1.65,0,Math.cos(angle)*1.65],angle);k.floor(step,.70,1.35,0,0,.18+(i+1)*height/88,p.metal);if(i%4===0)k.beam(step,[0,.18+(i+1)*height/88,.57],[0,1.2+(i+1)*height/88,.57],.023,p.rust);}
  k.cyl(g,.10,.10,height,[0,height/2,0],p.rust);railDeck(0,0,6.8,6.8,height+.18);for(let i=0;i<8;i++){const angle=i*Math.PI/4;k.beam(g,[Math.sin(angle)*1.8,height+.18,Math.cos(angle)*1.8],[Math.sin(angle)*1.8,height+2.7,Math.cos(angle)*1.8],.045,p.metal);}k.cyl(g,0,2.4,1.1,[0,height+3.1,0],p.paint);k.cyl(g,.50,.50,.6,[0,height+1.6,0],p.light);q.pipe(g,[[2.65,.3,-1],[2.65,height-.2,-1],[1.8,height-.2,-1]],.045);const room=building(-a,-a,6.5,6);crate(0,0,1,0,room);crate(1,2.6,-2.6,height+.18);crate(2,b,0);crate(3,-b,b*.6);
 }else if(kind==='harbor'){
  const shed=building(-a,-a,10,9,{roofAccess:true,mat:p.brick});crate(0,-2,0,0,shed);for(let i=0;i<3;i++){const c=k.container(g,1+i*3.6,-b,0,i%2?p.rust:p.blue,true);if(i===1)crate(1,0,-1,0,c);}gantry(a,a,14);k.beam(g,[a,14,a],[a-10,15,a],.10,p.yellow);k.beam(g,[a,11,a],[a-10,15,a],.065,p.rust);q.cable(g,[a-9.5,15,a],[a-9.5,2,a],0);k.ring(g,.26,.06,[a-9.5,1.8,a],p.metal);for(let j=0;j<6;j++){const z=b+j*2.2;k.floor(g,5,2.25,0,z,.18,p.wood);for(const x of[-2,2])k.beam(g,[x,-9,z],[x,.1,z],.12,p.rust);for(const side of[-1,1])k.ring(g,.27,.07,[side*2.5,.35,z],p.rubber);}crate(2,b,0);crate(3,0,b+8.8);q.pipeRack(-b,0,9);
 }else if(kind==='airfield'){
  k.floor(g,9,r*1.3,-a,0,.20,p.asphalt);for(let z=-b;z<=b;z+=4)k.box(g,[.18,.012,2],[-a,.215,z],p.white);
  const hang=k.group(g,[a,.18,-a]);for(const side of[-1,1]){k.box(hang,[.2,5,12],[side*5,2.5,0],p.paint,true);for(let z=-6;z<=6;z+=3)k.beam(hang,[side*5,0,z],[side*5,5,z],.10,p.rust);}k.box(hang,[10,5,.20],[0,2.5,-6],p.paint,true);for(const side of[-1,1]){const roof=k.box(hang,[5.2,.15,12.4],[side*2.5,5.5,0],p.rust);roof.rotation.z=-side*.2;}const fuselage=k.cyl(hang,.43,.17,5,[0,1.2,0],p.cream,false,16);fuselage.rotation.x=Math.PI/2;k.box(hang,[7,.10,1.4],[0,1.15,-.4],p.paint);for(const x of[-1.2,1.2])k.cyl(hang,.24,.24,.14,[x,.45,0],p.rubber).rotation.z=Math.PI/2;
  const tower=building(a,b*.55,6,7,{roofAccess:true});q.panel(tower,1.5,1.4,-3.3);crate(0,0,1,0,tower);crate(1,3,1,.18,hang);crate(2,-b,-b);crate(3,b,b);q.pump(g,b,-b);
 }else if(kind==='waterworks'){
  for(const x of[-a,a]){const basin=k.group(g,[x,.18,-a]);const ring=k.mesh(basin,new THREE.TorusGeometry(3.6,.28,8,32),p.concrete,[0,1.2,0]);ring.rotation.x=Math.PI/2;k.cyl(basin,3.35,3.35,.04,[0,.65,0],p.glass);k.cyl(basin,.20,.35,1.4,[0,.7,0],p.rust);k.floor(basin,7.7,.85,0,0,1.48,p.metal);for(const side of[-1,1])k.rail(basin,[-3.8,0,side*.5],[3.8,0,side*.5],1.48);k.stairs(basin,{x:3,z:3.4,rise:1.48,width:1.3,steps:8,tread:.33});q.pipe(basin,[[-2,.4,0],[-2,.4,3.4],[-2,1,4.4]],.14);}
  const lab=building(-a,a,8,6,{roofAccess:true});crate(0,-2,1,0,lab);q.pump(g,a,a);q.pump(g,a+2.4,a);q.pipeRack(0,0,10);crate(1,a,-a,1.66);crate(2,b,b);crate(3,-b,0);
 }else if(kind==='power'){
  const control=building(-a,a*.4,8,8,{roofAccess:true});const hall=building(a*.7,a*.6,10,8,{workshop:false,mat:p.rust});q.panel(hall,-3,1.5,-3.8);for(let i=0;i<2;i++){const h=15+i*3,x=-b+i*4;k.cyl(g,.65,.95,h,[x,h/2+.18,-b],p.rust,true,24);for(let y=2;y<h;y+=3)k.ring(g,.76,.055,[x,y,-b],p.metal,true);q.pipe(g,[[x,1.5,-b],[x,1.5,-b+2.3],[-a,1.5,-b+2.3]],.14);}crate(0,-2,0,0,control);for(const x of[1.5,a+1]){q.processTank(x,-a,1.7,5.2);for(let i=0;i<3;i++){const tx=x-1+i; k.cyl(g,.15,.20,1.4,[tx,2.8,-a+2.7],p.cream);for(let j=0;j<6;j++)k.ring(g,.21,.035,[tx,2.3+j*.18,-a+2.7],p.rust,true);}}q.pipeRack(a,0,12,3.2);q.pump(g,a,a);crate(1,b,-b);crate(2,b,b);crate(3,-b,-b);gantry(0,-b,8);
 }else if(kind==='radar'){
  sphere25(k);const room=building(-r*.55,r*.12,8,7,{roofAccess:true});q.panel(room,0,1.4,-3.3);q.pipeRack(r*.49,0,15,3.5);q.pump(g,-r*.50,-r*.30);crate(10,0,1,0,room);
 }else if(kind==='quarry'||kind==='mining'){
  const size=kind==='quarry'?1:.7;if(kind==='mining'){for(const side of[-1,1]){k.beam(g,[side*2,.18,-b],[side*1.2,8,-b],.13,p.rust);k.beam(g,[side*2,.18,-b+3],[side*1.2,8,-b],.10,p.rust);}const wheel=k.ring(g,1,.12,[0,7.6,-b],p.metal);q.cable(g,[-.8,7.6,-b],[-.8,.4,-b],0);k.floor(g,4,4,0,-b+1,.25,p.metal);q.pump(g,b,0);}for(let i=0;i<3;i++){const x=(-5+i*4)*size;k.floor(g,3.3,7,x,-a,.8+i*.65,p.concrete);for(const side of[-1,1])k.box(g,[.2,1.1,7],[x+side*1.7,1.35+i*.65,-a],p.concrete,true);k.cyl(g,.5,.7,2,[x,1.1+i*.65,-a],p.rust);}
  const belt=k.group(g,[a,.18,0]);const span=9;for(const side of[-1,1])k.beam(belt,[side*.6,0,span/2],[side*.6,2.6,-span/2],.08,p.rust);const deck=k.box(belt,[1.2,.12,span],[0,1.3,0],p.rubber);deck.rotation.x=.28;for(let i=0;i<10;i++){const roller=k.cyl(belt,.09,.09,1.3,[0,.25+i*.25,span/2-i],p.metal);roller.rotation.z=Math.PI/2;}
  const shed=building(-a,a,7,6,{roofAccess:true,mat:p.rust});crate(0,-1,0,0,shed);q.pump(g,a,a);crate(1,b,-b);crate(2,-b,-b);crate(3,b,b);gantry(0,-a,7);
 }else if(kind==='gas'){
  const shop=building(-a,-a,8,7,{mat:p.cream});crate(0,-2,1,0,shop);const can=k.group(g,[a,.18,0]);for(const x of[-3,3])for(const z of[-3.5,3.5])k.beam(can,[x,0,z],[x,4.2,z],.095,p.red);k.box(can,[7,.25,8],[0,4.3,0],p.paint);for(const z of[-2,2]){k.box(can,[.75,1.6,.65],[0,.8,z],p.cream,true);q.panel(can,0,1,z+.34);q.cable(can,[.43,1.35,z],[.8,.3,z],.25);}q.processTank(b,-b,1,2.2);k.vehicle(g,a,a,Math.PI/2);crate(1,-b,b);crate(2,b,b);
 }else if(kind==='junkyard'||kind==='wreckyard'){
  for(let i=0;i<4;i++){const x=(i%2?1:-1)*a,z=i<2?-a:0;k.vehicle(g,x,z,i*.7,i%2===0);for(let j=0;j<3;j++){const tire=k.ring(g,.35,.13,[x+2,.35+j*.20,z],p.rubber);tire.rotation.x=Math.PI/2;}}
  if(kind==='junkyard'){const shed=k.container(g,b,-b,0,p.rust,true);q.bench(shed,0,-1,1.8);k.box(g,[3,1.1,3],[0,.73,-a],p.rust,true);k.box(g,[2.7,.3,2.7],[0,2.6,-a],p.paint);for(const side of[-1,1])k.cyl(g,.12,.12,2.5,[side*1.3,1.7,-a],p.metal);}else{gantry(0,-a,8);for(const side of[-1,1]){k.box(g,[.35,2.5,.35],[side*1.5,1.43,a*.2],p.blue,true);k.beam(g,[side*1.5,1.3,a*.2],[side*.4,1.3,a*.2],.10,p.metal);}}const service=building(-a,a,7,6,{mat:p.rust});crate(0,0,1,0,service);q.bench(g,a,a,3);q.pump(g,b,-b);crate(1,b,b);crate(2,-b,-b);crate(3,b,0);
 }else if(kind==='bunker'){
  const bunker=building(0,-a*.4,14,12,{roofAccess:true,mat:p.concrete});for(const side of[-1,1]){k.box(bunker,[3.8,2.5,.25],[side*4,1.25,1],p.concrete,true);q.panel(bunker,side*5,1.4,-5.8);q.pipe(bunker,[[side*6,2.7,5],[side*6,2.7,-5.7],[0,2.7,-5.7]],.07);k.shelf(bunker,side*4,-4,2.8);}q.bench(bunker,0,-4,3);crate(0,-5,4,0,bunker);crate(1,5,4,0,bunker);crate(2,-4,-3,0,bunker);crate(3,3,-3,0,bunker);for(const side of[-1,1])q.processTank(side*4,b,1,2.4);
 }else if(kind==='supermarket'){
  const shop=building(0,-2,12,9,{roofAccess:true,mat:p.brick});for(const x of[-3,3]){k.shelf(shop,x,-1,2.3);q.bench(shop,x,3,2);}crate(0,-4,-3,0,shop);crate(1,4,-3,0,shop);crate(2,b,b);crate(3,-b,b);q.panel(shop,0,1.4,-4.3);
 }else if(kind==='satellite'){
  for(const x of[-a,a]){k.cyl(g,.55,.8,2.5,[x,1.43,-a],p.concrete,true);const dish=k.group(g,[x,3,-a],x<0?-.4:.6);dish.rotation.x=.65;const geo=new THREE.SphereGeometry(2.5,24,12,0,Math.PI*2,0,.85);const mat=p.cream.clone();mat.side=THREE.DoubleSide;k.mesh(dish,geo,mat,[0,-2,0]);for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;k.beam(dish,[Math.cos(angle)*1.8,-.3,Math.sin(angle)*1.8],[0,1,0],.035,p.rust);}k.cyl(dish,.10,.14,.4,[0,1.1,0],p.rubber);q.cable(g,[x,2.5,-a],[x,1.3,2],.6);}
  const hut=building(0,a,8,6,{roofAccess:true,mat:p.blue});crate(0,-2,0,0,hut);crate(1,2,0,0,hut);crate(2,-b,-b);crate(3,b,-b);q.panel(hut,0,1.4,-2.8);
 }else if(kind==='trainyard'){
  for(const x of[-a,0]){for(const side of[-1,1])k.beam(g,[x+side*.72,.27,-b],[x+side*.72,.27,b],.05,p.metal);for(let z=-b;z<=b;z+=.75)k.box(g,[2.4,.10,.15],[x,.20,z],p.wood);const wagon=k.container(g,x,-a,0,p.rust,true);wagon.position.y=.85;for(const side of[-1,1])for(const z of[-a-2,-a+2]){const wheel=k.cyl(g,.40,.40,.18,[x+side*.85,.65,z],p.metal);wheel.rotation.z=Math.PI/2;}k.stairs(g,{x,z:3.7-a,rise:.67,steps:4,tread:.30,width:1.5});}const shed=building(a,a*.3,7,9,{roofAccess:true});crate(0,-1,1,0,shed);gantry(-a,-b,7);crate(1,-a,-a+.3,1.055);crate(2,0,-a+.3,1.055);crate(3,b,b);q.pipeRack(b,-a,7);
 }else if(kind==='waterTower'){
  const h=7;for(const x of[-2.4,2.4])for(const z of[-2.4,2.4])k.beam(g,[x,.18,z],[x,h,z],.12,p.rust);for(let y=1;y<6;y+=1.7)for(const side of[-1,1])k.beam(g,[-2.4,y,side*2.4],[2.4,y+1.6,side*2.4],.05,p.metal);k.cyl(g,2.6,2.8,3,[0,h+1.5,0],p.paint,true);k.cyl(g,0,2.7,1,[0,h+3.5,0],p.rust);railDeck(0,0,7,7,h);k.stairs(g,{x:4.3,z:6.7,rise:h-.18,steps:36,tread:.28,width:1.5});k.floor(g,2.5,1.5,3.8,-3.38,h,p.metal);q.pipe(g,[[1,10,0],[1,.65,0],[a,.65,0]],.12);q.pump(g,a,0);const hut=building(-a,a,6,5);crate(0,0,1,0,hut);crate(1,-3,2,h);crate(2,-b,-b);crate(3,b,b);
 }else if(kind==='outpost'||kind==='market'){
  for(const side of[-1,1]){const room=building(side*a,-a,8,8,{roofAccess:kind==='outpost',mat:kind==='market'?p.wood:p.concrete});k.terminal(room,side<0?0:1,[0,0,2]);q.bench(room,0,-2.5,2.6);}
  // Preserve both previous shop IDs and the existing recycler ID.
  k.terminal(g,2,[0,.18,-a],true);q.pipeRack(-b,0,6,3);for(const side of[-1,1]){q.bench(g,side*a,a,3);k.box(g,[3,.06,.7],[side*a,.55,a+1.2],p.wood,true);}for(const side of[-1,1]){k.box(g,[.25,2.2,r*1.2],[side*r*.67,1.28,0],p.concrete,true);k.box(g,[r*.45,2.2,.25],[side*r*.44,1.28,r*.67],p.concrete,true);}k.box(g,[r*1.34,2.2,.25],[0,1.28,-r*.67],p.concrete,true);
 }else throw new Error('Missing DEV34 site '+kind);
 // Open gate and roadside fixtures; no RT-name billboards.
 for(const side of[-1,1]){k.beam(g,[side*3,.18,r*.72],[side*3,2.8,r*.72],.06,p.rust);k.box(g,[.28,.35,.12],[side*3,1.8,r*.72],p.yellow);}
 g.userData.siteRevision34=34;g.userData.layoutKind34=kind;
}
/** Offshore structural access remains the tested 4/6-deck design, with new fitted machinery per deck. */
export function dressOffshore34(k){const q=workshopKit34(k),large=k.m.id==='oil-large',w=large?36:28;for(let i=0;i<(large?6:4);i++){const y=5.2+i*4,g=k.group(k.root,[0,y,0]);q.panel(g,-w/2+1.2,1.5,-2);q.pipe(g,[[-w/2+1.1,.2,-3],[-w/2+1.1,2.6,-3],[-w/2+1.1,2.6,3]],.055);q.cable(g,[-w/2+1.1,2.55,-2],[-w/2+1.1,2.55,2],.15);if(i%2===0)q.pump(g,-w/2+3.5,0,0);else q.bench(g,-w/2+3.5,0,2);}
 k.root.userData.siteRevision34=34;k.root.userData.layoutKind34='oilrig';}
