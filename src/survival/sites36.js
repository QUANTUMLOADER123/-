import * as THREE from 'three';
import {buildLand34,dressOffshore34} from './sites34.js';
import {workshopKit34} from './site-workshop34.js';
/** Original fitted details, not a replacement with an opaque obstacle box.
 * The central gate lane stays clear; small fittings do not gain giant colliders. */
export function buildLand36(k){
 buildLand34(k);const p=k.p,g=k.root,q=workshopKit34(k),r=k.m.radius/(k.m.siteScale25||1),a=r*.32,b=r*.44,features=[];
 const mark=name=>features.push(name),box=(size,pos,mat=p.metal,solid=false)=>k.box(g,size,pos,mat,solid);
 const motor=(parent,x,y,z)=>{const m=k.group(parent,[x,y,z]);k.cyl(m,.23,.23,.75,[0,0,0],p.paint).rotation.z=Math.PI/2;for(let i=0;i<8;i++)k.ring(m,.24,.015,[-.32+i*.09,0,0],p.metal).rotation.y=Math.PI/2;k.box(m,[.8,.12,.55],[0,-.29,0],p.rust);q.cable(m,[.1,.2,0],[.4,-.3,-.4],.12);return m;};
 const hatch=(parent,x,y,z)=>{const h=k.group(parent,[x,y,z]);k.cyl(h,.38,.38,.055,[0,0,0],p.metal);for(let i=0;i<10;i++){const t=i*Math.PI/5;k.cyl(h,.026,.026,.04,[Math.sin(t)*.29,.05,Math.cos(t)*.29],p.rust,false,6);}k.beam(h,[-.14,.08,0],[.14,.08,0],.025,p.rust);return h;};
 const reel=(x,z)=>{const h=k.group(g,[x,.70,z]);for(const side of[-1,1]){k.cyl(h,.64,.64,.07,[side*.45,0,0],p.wood).rotation.z=Math.PI/2;k.beam(h,[side*.45,-.48,-.50],[side*.45,-.48,.50],.05,p.rust);}k.cyl(h,.42,.42,.88,[0,0,0],p.rubber).rotation.z=Math.PI/2;for(let i=0;i<10;i++)k.ring(h,.43,.025,[-.40+i*.085,0,0],p.rubber).rotation.y=Math.PI/2;return h;};
 const cabinet=(parent,x,z)=>{const c=k.group(parent,[x,0,z]);k.box(c,[.75,1.5,.46],[0,.75,0],p.paint,true);for(const side of[-1,1]){k.box(c,[.025,.30,.035],[side*.12,.85,.245],p.metal);for(let i=0;i<8;i++)k.box(c,[.25,.012,.02],[side*.19,1.2+i*.025,.24],p.rubber);}return c;};
 // A real open entrance: booth, retracted gate leaves, rails and raised barrier.
 const front=r*.68,booth=q.building(-r*.49,r*.54,3.6,2.8,{workshop:false,mat:p.cream});q.bench(booth,-.7,-.7,1.6);q.panel(booth,1.25,1.3,-1.25);cabinet(booth,1,-.6);
 for(const side of[-1,1]){box([.24,3.2,.24],[side*3.55,1.78,front],p.rust,true);const leaf=k.group(g,[side*5.1,.18,front]);for(let i=0;i<7;i++)k.box(leaf,[.065,2,.055],[side*i*.28,1,0],p.metal);for(const y of[.3,1.8])k.beam(leaf,[0,y,0],[side*1.8,y,0],.045,p.rust);k.box(leaf,[.30,.20,.09],[side*.1,1.2,.08],p.yellow);for(let i=0;i<5;i++)box([.08,.014,.75],[side*2.65,.195,front-1-i*1.5],i%2?p.yellow:p.white);}
 const arm=k.group(g,[3.55,1.2,front+.4]);arm.rotation.z=-Math.PI*.43;k.box(arm,[3.1,.13,.14],[-1.55,0,0],p.cream);for(let i=0;i<6;i++)k.box(arm,[.22,.14,.15],[-.2-i*.5,0,0],p.red);
 // Fence only on side/back edges; the front has an explicit 6.4-local-metre gap.
 for(const side of[-1,1])for(let i=0;i<5;i++){const z=-front+i*front*.5;k.beam(g,[side*front,.18,z],[side*front,2.2,z],.035,p.rust);if(i<4)for(const y of[.8,1.65,2.05])k.beam(g,[side*front,y,z],[side*front,y,z+front*.5],.012,p.metal);}
 for(const x of[-front,front]){k.lamp(g,x*.90,front*.9,3.6);box([.17,.55,.17],[x*.80,.455,front+.45],p.yellow,true);}
 // Expansion joints, drainage covers and a marked vehicle lane break up the apron.
 for(let t=-r*.60;t<=r*.60;t+=3.2){box([r*1.28,.008,.018],[0,.185,t],p.rust);box([.018,.008,r*1.28],[t,.185,0],p.rust);}
 const lane=front-r*.49;box([5.3,.013,lane],[0,.188,front-lane/2],p.asphalt);for(const side of[-1,1])box([.09,.018,lane],[side*2.45,.201,front-lane/2],p.yellow);
 for(let i=0;i<6;i++)box([.055,.012,.42],[r*.60,.198,r*.44+i*.14],p.metal);
 mark('open-sliding-gate');mark('staffed-booth-interior');mark('clear-road-court');
 if(k.m.kind==='harbor'){
  reel(-b,0);reel(-b,2);motor(g,-b,.8,4);for(let i=0;i<5;i++){const z=-b-i*2.2;for(const side of[-1,1]){k.cyl(g,.13,.17,.36,[side*2.15,.36,z],p.rust);k.beam(g,[side*2.15-.3,.54,z],[side*2.15+.3,.54,z],.065,p.rust);const f=k.ring(g,.40,.11,[side*2.62,-.1,z],p.rubber);f.rotation.x=.18;}}q.cable(g,[-b,.7,1],[-b+3,.25,0],.15);mark('mooring-cleats-and-fenders');mark('powered-cable-winches');
 }else if(k.m.kind==='airfield'){
  const mast=k.group(g,[b,.18,-b]);k.beam(mast,[0,0,0],[0,6,0],.055,p.metal);const sock=k.cyl(mast,.32,.14,1.5,[.8,5.6,0],p.cream,false,12);sock.rotation.z=-Math.PI/2;for(let i=0;i<3;i++)k.cyl(mast,.30-i*.045,.27-i*.045,.16,[.25+i*.45,5.6,0],p.red,false,12).rotation.z=Math.PI/2;reel(a+4,-a+3);q.bench(g,a,-a+4,2.2);motor(g,a+2,.8,-a-3);for(let i=0;i<5;i++)for(const side of[-1,1])box([.18,.12,.30],[-a+side*4.3,.28,-b+i*b*.45],p.light);mark('windsock-and-runway-lights');mark('airframe-service-tools');
 }else if(k.m.kind==='power'){
  const x=r*.50,z=-r*.10;for(let i=0;i<8;i++)k.cyl(g,.75,.75,.055,[x,.65+i*.20,z],p.metal,false,20);k.cyl(g,.45,.45,2.2,[x,1.35,z],p.rust);hatch(g,x,2.48,z);motor(g,x-1.3,.65,z);q.pipe(g,[[x,2.1,z],[x,2.1,z-3],[a,2.1,z-3]],.11);for(let i=0;i<3;i++){q.panel(g,-b+1.2,1.3+i*.02,2+i*1.2);q.cable(g,[-b+1.2,2,2+i*1.2],[-b+2.5,2.7,2+i*1.2],.16);}mark('finned-heat-exchanger');mark('switchgear-cable-looms');
 }else if(k.m.kind==='waterworks'){
  for(const x of[-a,a]){motor(g,x,1.96,-a-.9);hatch(g,x+2,.36,-a);q.pipe(g,[[x-2,.55,-a],[x-2,.55,-a-4],[x,1,-a-4]],.09);k.valve(g,x,1.1,-a-4);}for(let i=0;i<5;i++)box([1.5,.04,.10],[b,.25,-1+i*.22],p.metal);q.panel(g,b,1.3,-2);mark('clarifier-drives-and-inspection-hatches');mark('screened-inlet-and-valves');
 }else if(k.m.kind==='radar'){
  const x=r*.50,z=-r*.36;for(let i=0;i<3;i++){cabinet(g,x,z+i*1.3);q.pipe(g,[[x-.6,1.6,z+i*1.3],[x-2,1.6,z+i*1.3],[x-2,3,z+i*1.3]],.035,p.metal);}reel(-r*.53,-r*.3);q.cable(g,[-r*.53,.7,-r*.3],[-r*.42,3,-r*.3],.3);mark('waveguide-control-cabinets');mark('pressure-sphere-service-route');
 }else if(k.m.kind==='quarry'){
  const x=a,z=-a-2;motor(g,x,1.2,z);for(let i=0;i<9;i++)k.beam(g,[x-.8,.3+i*.22,z+i*.6],[x+.8,.3+i*.22,z+i*.6],.055,p.metal);for(const side of[-1,1]){box([.06,1.3,2.4],[-a+side*1.3,.95,-a-2],p.yellow);for(let i=0;i<6;i++)k.beam(g,[-a+side*1.3,.4+i*.2,-a-3.2],[-a+side*1.3,.4+i*.2,-a-.8],.015,p.metal);}reel(-b,b*.1);mark('crusher-mesh-guards');mark('conveyor-drive-and-rollers');
 }else if(k.m.kind==='gas'){
  const compressor=k.group(g,[b,.18,-b+3]);k.cyl(compressor,.35,.35,1.4,[0,.42,0],p.red,true,16).rotation.z=Math.PI/2;motor(compressor,0,.95,0);k.ring(compressor,.7,.055,[0,1.15,.45],p.rubber);q.pipe(g,[[b,.9,-b],[b,.9,-b+3],[b,1.1,-b+3.5]],.05);cabinet(g,-b,b*.1);q.bench(g,-b,1.6,2);mark('air-compressor-and-coiled-hose');mark('service-cabinet');
 }else if(k.m.kind==='bunker'){
  const g2=k.group(g,[-4,.18,-a*.4-4.8]);for(let i=0;i<3;i++){cabinet(g2,i*1.1,0);q.cable(g2,[i*1.1,1.6,0],[i*1.1,2.7,0],0);}for(const side of[-1,1]){const duct=k.cyl(g,.25,.25,7,[side*5.7,2.9,-a*.4],p.metal);duct.rotation.x=Math.PI/2;for(let i=0;i<5;i++)k.ring(g,.27,.035,[side*5.7,2.9,-a*.4-3+i*1.5],p.rust).rotation.x=Math.PI/2;}q.panel(g,0,1.5,b);mark('communications-racks');mark('ventilation-flanges');
 }else if(k.m.kind==='trainyard'){
  for(const x of[-a,0]){for(const side of[-1,1]){k.beam(g,[x+side*.7,.9,-a-3],[x+side*.7,.9,-a-2.7],.06,p.rust);k.ring(g,.28,.045,[x+side*.7,1.3,-a-3],p.rust);}k.beam(g,[x-.6,.6,b-1],[x+.6,.6,b-1],.11,p.rust);}reel(b,0);q.panel(g,b,1.4,-b);mark('wagon-brakes-and-buffers');mark('rail-service-switchgear');
 }else if(k.m.kind==='lighthouse'){
  const optic=k.group(g,[0,15.2,0]);for(let i=0;i<8;i++)k.ring(optic,.65+i*.035,.022,[0,-.6+i*.15,0],p.glass);q.bench(g,b,-a,2);cabinet(g,b,-a-1);reel(-b,0);q.pipe(g,[[b,1,-a],[b,.4,-a],[b,.4,-a-2]],.055);mark('fresnel-lens-rings');mark('coastal-maintenance-workbench');
 }else if(k.m.safe){
  for(const side of[-1,1]){const stall=k.group(g,[side*a,.18,a]);for(let i=0;i<4;i++){k.box(stall,[.36,.36,.4],[-.8+i*.5,1.2,.1],i%2?p.paint:p.wood);k.box(stall,[.03,.03,.42],[-.8+i*.5,1.37,.1],p.rust);}for(const xx of[-1.5,1.5])k.beam(stall,[xx,0,-.6],[xx,2.6,-.6],.035,p.wood);k.box(stall,[3.3,.06,1.6],[0,2.6,0],p.cream);cabinet(g,side*(a+3),-a+2);}mark('covered-market-stalls');mark('stock-and-trader-cabinets');
 }
 g.userData.siteRevision36=36;g.userData.detail36=features;
}
export function dressOffshore36(k){dressOffshore34(k);const p=k.p,q=workshopKit34(k),large=k.m.id==='oil-large',width=large?36:28;for(let i=0;i<(large?6:4);i++){const y=5.2+i*4,g=k.group(k.root,[-width/2+2.5,y,3.2]);k.box(g,[1.15,.7,.7],[0,.35,0],p.paint);for(let n=0;n<6;n++)k.box(g,[1,.025,.025],[0,.18+n*.08,.36],p.rubber);q.pipe(g,[[0,.6,0],[0,1.7,0],[1,1.7,0]],.045);k.ring(g,.16,.025,[1,1.7,.04],p.red).rotation.x=Math.PI/2;}k.root.userData.siteRevision36=36;k.root.userData.detail36=['deck-specific-switchgear','ventilated-equipment','preserved-dock-and-stairs'];}
