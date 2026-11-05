import {coastDistance13,riverProfile13} from './terrain13.js';
import {intersectRoads10} from './network10.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
function project(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/n)):0;return {...lerp(a,b,t),t};}
class Heap18{
 constructor(){this.a=[];}
 push(v){const a=this.a;let i=a.length;a.push(v);while(i){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}
 pop(){const a=this.a,first=a[0],v=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(a[c].f>=v.f)break;a[i]=a[c];i=c;}a[i]=v;}return first;}
}
/** Revisions 9+; revision 10 also penalizes terrain grade. A connected branching tree, NOT an outer ring or a lattice.
 * The routing grid is internal; shortcutting and safe corner rounding remove it
 * from the delivered geometry. Houses are placed AFTER this network is frozen. */
export function roadNetwork18({scale,seed,monuments,height=null,maxShortcutGrade=1.1,gradeCost=35,cellStep=8}){
 const sites=monuments.filter(m=>m.kind!=='oilrig'),roads={},blockers=[{x:-6,z:-3,r:32},{x:-31,z:-31,r:12},...sites.map(m=>({x:m.x,z:m.z,r:m.radius+7}))],step=cellStep*scale,extent=328*scale,width=Math.ceil(extent*2/step)+1;
 const coast=p=>coastDistance13(p.x,p.z,scale,seed);
 const clearPoint=p=>coast(p)>5&&!blockers.some(o=>distance(p,o)<o.r);
 function clear(a,b,grade=true){
  for(const o of blockers)if(distance(project(o,a,b),o)<o.r)return false;
  const count=Math.max(1,Math.ceil(distance(a,b)/(5*scale)));
  let previous=null;
  for(let i=0;i<=count;i++){const p=lerp(a,b,i/count);if(coast(p)<5)return false;if(height&&grade){const y=height(p.x,p.z);if(previous&&Math.abs(y-previous.y)/Math.max(.001,distance(p,previous))>maxShortcutGrade)return false;previous={...p,y};}}
  return true;
 }
 const nodes=new Map();
 function node(ix,iz){
  if(ix<0||iz<0||ix>=width||iz>=width)return null;const id=iz*width+ix;if(nodes.has(id))return nodes.get(id);
  const hash=((Math.imul(ix+1,73856093)^Math.imul(iz+1,19349663)^seed)>>>0)/4294967296;
  const p={id,ix,iz,x:-extent+ix*step+(hash-.5)*step*.32,z:-extent+iz*step+Math.sin(hash*53)*step*.16};
  if(!clearPoint(p)){nodes.set(id,null);return null;}
  if(height)p.y19=height(p.x,p.z);
  const river=riverProfile13(p.x,p.z,scale,seed);p.cost=1+hash*.08+(river&&river.distance<river.width*.5+4?.6:0);nodes.set(id,p);return p;
 }
 function nearest(p){
  const ix=Math.round((p.x+extent)/step),iz=Math.round((p.z+extent)/step),out=[];
  for(let r=1;r<=5;r++){for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r&&r!==1)continue;const n=node(ix+dx,iz+dz);if(n&&clear(p,n,false))out.push(n);}if(out.length>=3&&(!height||r>=3))break;}
  const py=height?height(p.x,p.z):0,cost=n=>{const d=distance(n,p);return d+(height?gradeCost*(n.y19-py)**2/Math.max(1,d):0);};return out.sort((a,b)=>cost(a)-cost(b)).slice(0,8);
 }
 function simplify(path){
  const out=[path[0]];let i=0;
  while(i<path.length-1){let j=path.length-1;while(j>i+1&&!clear(path[i],path[j]))j--;out.push(path[j]);i=j;}
  // Corner rounding is accepted only if both new segments remain on land and
  // outside compound/camp bounds. Exact graph endpoints never move.
  let smooth=out;
  for(let pass=0;pass<2;pass++){
   const next=[smooth[0]];
   for(let i=1;i<smooth.length-1;i++){
    const a=lerp(smooth[i],smooth[i-1],.23),b=lerp(smooth[i],smooth[i+1],.23),after=i+1===smooth.length-1?smooth.at(-1):lerp(smooth[i+1],smooth[i],.23);
    if(clear(next.at(-1),a)&&clear(a,b)&&clear(b,after)){next.push(a,b);}else next.push(smooth[i]);
   }
   next.push(smooth.at(-1));smooth=next;
  }
  return smooth.map(p=>({x:p.x,z:p.z}));
 }
 function route(a,b){
  if(clear(a,b))return [a,b];const starts=nearest(a),ends=nearest(b);if(!starts.length||!ends.length)return null;
  const targets=new Map(ends.map(p=>[p.id,p])),heap=new Heap18(),g=new Map(),parent=new Map(),closed=new Set();
  for(const n of starts){const cost=distance(a,n);g.set(n.id,cost);heap.push({id:n.id,f:cost+distance(n,b)});}
  let goal=null;
  while(heap.a.length){
   const item=heap.pop();if(closed.has(item.id))continue;closed.add(item.id);const n=nodes.get(item.id);if(targets.has(n.id)){goal=n;break;}
   for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
    if(!dx&&!dz)continue;const q=node(n.ix+dx,n.iz+dz);if(!q||closed.has(q.id)||!clear(n,q,false))continue;const grade19=height?Math.abs(q.y19-n.y19)/Math.max(.001,distance(n,q)):0;const score=g.get(n.id)+distance(n,q)*((n.cost+q.cost)*.5+grade19*grade19*gradeCost);
    if(score<(g.get(q.id)??Infinity)){g.set(q.id,score);parent.set(q.id,n.id);heap.push({id:q.id,f:score+distance(q,b)});}
   }
  }
  if(!goal)return null;const path=[b,goal];while(parent.has(path.at(-1).id))path.push(nodes.get(parent.get(path.at(-1).id)));path.push(a);return simplify(path.reverse());
 }
 // One reusable access point per RT, chosen on its inland perimeter.
 const gates=sites.map(m=>{
  const preferred=Math.atan2(-m.x,-m.z),r=m.radius+10;let best=null;
  for(let i=0;i<48;i++){const a=preferred+i*Math.PI*2/48,p={x:m.x+Math.sin(a)*r,z:m.z+Math.cos(a)*r};if(!clearPoint(p)||nearest(p).length<2)continue;const score=distance(p,{x:0,z:0})+.35*r*(1-Math.cos(a-preferred));if(!best||score<best.score)best={...p,score,id:m.id};}
  if(!best)throw new Error('Нет сухого подъезда к РТ '+m.id);return best;
 });
 // A single longest arterial connection, followed by shortest branches into it.
 let pair=null;
 for(let i=0;i<gates.length;i++)for(let j=0;j<i;j++){const d=distance(gates[i],gates[j]);if(!pair||d>pair.d)pair={i,j,d};}
 const first=route(gates[pair.i],gates[pair.j]);if(!first)throw new Error('Не удалось построить сухопутную магистраль');roads['artery-18']=first;
 const remaining=gates.filter((_,i)=>i!==pair.i&&i!==pair.j);
 function hosts(p){
  const out=[];for(const [name,path]of Object.entries(roads))for(let i=1;i<path.length;i++){const q=project(p,path[i-1],path[i]);out.push({name,i,q,d:distance(p,q)});}return out.sort((a,b)=>a.d-b.d);
 }
 function crossing(a,b,c,d){
  const rx=b.x-a.x,rz=b.z-a.z,sx=d.x-c.x,sz=d.z-c.z,det=rx*sz-rz*sx;
  if(Math.abs(det)<1e-8){
   const n=rx*rx+rz*rz;if(n<1e-10||Math.abs((c.x-a.x)*rz-(c.z-a.z)*rx)>Math.sqrt(n)*1e-5)return null;
   const t0=((c.x-a.x)*rx+(c.z-a.z)*rz)/n,t1=((d.x-a.x)*rx+(d.z-a.z)*rz)/n,lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(1,Math.max(t0,t1));
   if(hi<lo||hi<=1e-6)return null;const t=Math.max(lo,1e-6);return {...lerp(a,b,t),t};
  }
  const t=((c.x-a.x)*sz-(c.z-a.z)*sx)/det,u=((c.x-a.x)*rz-(c.z-a.z)*rx)/det;
  return t>1e-6&&t<=1.000001&&u>=-1e-6&&u<=1.000001?{...lerp(a,b,Math.min(1,t)),t}:null;
 }
 while(remaining.length){
  const order=remaining.map(p=>({p,hosts:hosts(p)})).sort((a,b)=>a.hosts[0].d-b.hosts[0].d);let chosen=null;
  for(const candidate of order){for(const h of candidate.hosts.slice(0,32)){const path=route(candidate.p,h.q);if(path){chosen={...candidate,h,path};break;}}if(chosen)break;}
  // Dense new islands can put the preferred gate in a pocket enclosed by
  // neighbouring RT bounds. Try a different perimeter gate, never drive through RT.
  if(!chosen&&cellStep<8)outerGate32:for(const candidate of order){const m=sites.find(m=>m.id===candidate.p.id),r=m.radius+10;for(let i=0;i<48;i++){const a=i*Math.PI/24,gate={x:m.x+Math.sin(a)*r,z:m.z+Math.cos(a)*r};if(!clearPoint(gate)||nearest(gate).length<2)continue;for(const h of hosts(gate).slice(0,32)){const path=route(gate,h.q);if(path){Object.assign(candidate.p,gate);chosen={p:candidate.p,h,path};break outerGate32;}}}}
  if(!chosen)throw new Error('Не удалось соединить подъезды РТ');
  const {p,h}=chosen;
  if(h.d<.02){Object.assign(p,{x:h.q.x,z:h.q.z});remaining.splice(remaining.indexOf(p),1);continue;}
  let path=chosen.path,connection=null;
  // Stop at the FIRST existing road crossed: no overlaid shared stretches and
  // no accidentally closed loop when the search finds an earlier connection.
  outer:for(let j=1;j<path.length;j++){
   const hits=[];for(const [name,host]of Object.entries(roads))for(let i=1;i<host.length;i++){const q=crossing(path[j-1],path[j],host[i-1],host[i]);if(q)hits.push({name,i,q});}
   if(hits.length){hits.sort((a,b)=>a.q.t-b.q.t);connection=hits[0];path=[...path.slice(0,j),connection.q];break outer;}
  }
  connection??=h;const host=roads[connection.name],q=connection.q;
  if(distance(q,host[connection.i-1])>.01&&distance(q,host[connection.i])>.01)host.splice(connection.i,0,{x:q.x,z:q.z});
  path=path.filter((p,i)=>!i||distance(p,path[i-1])>.01);if(path.length>1)roads['access-'+p.id]=path;remaining.splice(remaining.indexOf(p),1);
 }
 const joints=new Map();intersectRoads10(roads,scale,p=>joints.set(p.x.toFixed(3)+':'+p.z.toFixed(3),{x:p.x,z:p.z}));
 // Endpoint-to-host joins need explicit plateaus too, including endpoint hits.
 for(const path of Object.values(roads))for(const p of[path[0],path.at(-1)]){
  let incident=0;for(const host of Object.values(roads))if(host.some(q=>distance(q,p)<.01))incident++;
  if(incident>1)joints.set(p.x.toFixed(3)+':'+p.z.toFixed(3),{x:p.x,z:p.z});
 }
 return {roads,junctions:[...joints.values()],gates:gates.map(p=>({id:p.id,x:p.x,z:p.z}))};
}
