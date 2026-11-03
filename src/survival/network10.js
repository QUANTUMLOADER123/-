/** Deterministic, connected rural road graph. No terrain / settlement re-seeding. */
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const project=(p,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/d)):0;return{x:a.x+dx*t,z:a.z+dz*t,t};};
export function extendRoads10(legacy,{scale,seed,monuments,houses}){
 const roads=Object.fromEntries(Object.entries(legacy).map(([k,v])=>[k,v.map(p=>({...p}))]));
 const joints=new Map(),key=p=>p.x.toFixed(3)+':'+p.z.toFixed(3);
 const joint=p=>{joints.set(key(p),{x:p.x,z:p.z});return p;};
 const blockers=[{x:-6,z:-3,r:29},{x:-31,z:-31,r:9},...houses.map(p=>({...p,r:9})),...monuments.filter(m=>m.kind!=='oilrig').map(m=>({...m,r:m.radius+5}))];
 let randomState=(seed^0x6d2b79f5)>>>0;
 const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
 const outside=p=>{
  p={...p};
  for(let n=0;n<16;n++){
   const hit=blockers.find(b=>distance(p,b)<b.r+2);if(!hit)break;
   let dx=p.x-hit.x,dz=p.z-hit.z,len=Math.hypot(dx,dz);if(len<.001){dx=1;dz=.7;len=Math.hypot(dx,dz);}
   p.x=hit.x+dx/len*(hit.r+3);p.z=hit.z+dz/len*(hit.r+3);
  }
  return p;
 };
 // Insert real shared vertices into the host path: a branch never stops next to a road.
 function attach(p,only,allowBlocked=false){
  let best=null;
  for(const [name,path]of Object.entries(roads)){
   if(only&&!only.includes(name))continue;
   for(let i=1;i<path.length;i++){const q=project(p,path[i-1],path[i]),d=distance(p,q);if(best&&d>=best.d)continue;if(!allowBlocked&&blockers.some(o=>distance(q,o)<o.r+3))continue;if(!best||d<best.d)best={name,path,i,q,d};}
  }
  if(!best)return attach(p,only,true);
  const {path,i,q}=best;let p0;
  if(distance(q,path[i-1])<.01)p0=path[i-1];else if(distance(q,path[i])<.01)p0=path[i];else{p0={x:q.x,z:q.z};path.splice(i,0,p0);}
  return joint(p0);
 }
 function avoid(points){
  // Rectangular tangential bypasses keep new asphalt clear of the original 120 houses.
  // Endpoints can be on an old road beside a compound; do not move those shared joints.
  for(let pass=0;pass<10;pass++){
   let changed=false;
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],len=distance(a,b);if(len<.05)continue;
    let hit=null;
    for(const obstacle of blockers){
     if(distance(a,obstacle)<obstacle.r+.01||distance(b,obstacle)<obstacle.r+.01)continue;
     const q=project(obstacle,a,b);
     if(q.t>.001&&q.t<.999&&distance(q,obstacle)<obstacle.r&&(!hit||q.t<hit.t))hit={obstacle,t:q.t};
    }
    if(!hit)continue;
    const c=hit.obstacle,dx=(b.x-a.x)/len,dz=(b.z-a.z)/len,r=c.r+3;
    let best=null;
    for(const side of[-1,1]){
     const q1={x:c.x-dx*r-dz*r*side,z:c.z-dz*r+dx*r*side},q2={x:c.x+dx*r-dz*r*side,z:c.z+dz*r+dx*r*side};
     let cost=distance(a,q1)+distance(q1,q2)+distance(q2,b);
     for(const q of[q1,q2])for(const o of blockers)if(distance(q,o)<o.r+1)cost+=10000;
     for(const [u,v]of[[a,q1],[q1,q2],[q2,b]])if(distance(project(c,u,v),c)<c.r+.1)cost+=100000;
     if(!best||cost<best.cost)best={q1,q2,cost};
    }
    points.splice(i,0,best.q1,best.q2);changed=true;i+=2;
   }
   if(!changed)break;
  }
  return points.filter((p,i)=>!i||distance(p,points[i-1])>.01);
 }
 function link(name,a,b,bend=true){
  if(distance(a,b)<.05)return;
  const len=distance(a,b),dx=(b.x-a.x)/len,dz=(b.z-a.z)/len,offset=bend?(random()-.5)*20*scale:0;
  const n=Math.max(2,Math.ceil(len/(24*scale))),path=[];
  for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(t*Math.PI)*offset;const p={x:a.x+(b.x-a.x)*t-dz*w,z:a.z+(b.z-a.z)*t+dx*w};path.push(i>0&&i<n?outside(p):p);}
  // Keep exact graph endpoints (including floating-point identity of attached vertices).
  path[0]={x:a.x,z:a.z};path[path.length-1]={x:b.x,z:b.z};roads[name]=avoid(path);joint(a);joint(b);
 }
 // Five irregular rows / columns, with separately authored continuous edges: no phantom joins.
 const nodes=[];
 for(let row=0;row<5;row++)for(let col=0;col<5;col++)nodes.push(outside({x:((col-2)*86+(random()-.5)*18)*scale,z:((row-2)*86+(random()-.5)*18)*scale}));
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){
  const a=nodes[row*5+col];
  if(col<4)link('lane-e-'+row+'-'+col,a,nodes[row*5+col+1]);
  if(row<4)link('lane-n-'+row+'-'+col,a,nodes[(row+1)*5+col]);
 }
 for(const [i,index]of[0,2,4,10,14,20,22,24].entries())link('rim-link-'+i,nodes[index],attach(nodes[index],['ring']));
 for(const [i,index]of[7,12,17].entries())link('spine-link-'+i,nodes[index],attach(nodes[index],['branch']),false);
 // The original spine ended near, rather than exactly on, the ring.
 for(const [i,p]of[roads.branch[0],roads.branch.at(-1)].entries())link('spine-end-'+i,p,attach(p,['ring'],true),false);
 // Spokes terminate at the perimeter of each onshore RT, not through its buildings.
 for(const m of monuments){
  if(m.kind==='oilrig')continue;
  const host=attach(m),d=distance(host,m);if(d<m.radius+9)continue;
  const end={x:m.x+(host.x-m.x)/d*(m.radius+7),z:m.z+(host.z-m.z)/d*(m.radius+7)};
  link('access-'+m.id,host,end,false);
 }
 // Local lanes serve the outer hamlets too; retain every house and its persistent ID.
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const group=houses.filter(h=>Math.max(0,Math.min(2,Math.floor((h.x/scale+270)/180)))===col&&Math.max(0,Math.min(2,Math.floor((h.z/scale+270)/180)))===row);
  if(!group.length)continue;
  const center={x:group.reduce((s,h)=>s+h.x,0)/group.length,z:group.reduce((s,h)=>s+h.z,0)/group.length};
  const house=group.reduce((a,b)=>distance(a,center)<distance(b,center)?a:b),host=attach(house),d=distance(host,house);
  if(d>24){const end=outside({x:house.x+(host.x-house.x)/d*15,z:house.z+(host.z-house.z)/d*15});link('local-'+row+'-'+col,host,end,false);}
 }
 intersectRoads10(roads,scale,joint);
 return{roads,junctions:[...joints.values()]};
}

/** Split incidental crossings too: east/west lanes crossing the old spine are real junctions. */
function intersectRoads10(roads,scale,joint){
 const segments=[],grid=new Map(),cuts=new Map(),cell=32*scale;
 for(const [name,path]of Object.entries(roads))for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i];segments.push({name,i,a,b,rx:b.x-a.x,rz:b.z-a.z,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minZ:Math.min(a.z,b.z),maxZ:Math.max(a.z,b.z)});
 }
 const cut=(segment,t,p)=>{if(t<=1e-8||t>=1-1e-8)return;const k=segment.name+':'+segment.i;if(!cuts.has(k))cuts.set(k,[]);cuts.get(k).push({t,p});};
 for(const [index,s]of segments.entries()){
  const cells=[],seen=new Set();
  for(let x=Math.floor(s.minX/cell);x<=Math.floor(s.maxX/cell);x++)for(let z=Math.floor(s.minZ/cell);z<=Math.floor(s.maxZ/cell);z++){
   const key=x+':'+z;cells.push(key);
   for(const prior of grid.get(key)||[]){
    if(seen.has(prior))continue;seen.add(prior);const q=segments[prior];
    if(s.name===q.name&&Math.abs(s.i-q.i)<=1)continue;
    if(s.minX>q.maxX||s.maxX<q.minX||s.minZ>q.maxZ||s.maxZ<q.minZ)continue;
    const det=s.rx*q.rz-s.rz*q.rx;if(Math.abs(det)<1e-9)continue;
    const dx=q.a.x-s.a.x,dz=q.a.z-s.a.z,t=(dx*q.rz-dz*q.rx)/det,u=(dx*s.rz-dz*s.rx)/det;
    if(t< -1e-8||t>1+1e-8||u< -1e-8||u>1+1e-8)continue;
    const p={x:s.a.x+s.rx*Math.max(0,Math.min(1,t)),z:s.a.z+s.rz*Math.max(0,Math.min(1,t))};joint(p);cut(s,t,p);cut(q,u,p);
   }
  }
  for(const key of cells){if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);}
 }
 for(const [name,path]of Object.entries(roads)){
  const out=[path[0]];
  for(let i=1;i<path.length;i++){
   for(const {p}of(cuts.get(name+':'+i)||[]).sort((a,b)=>a.t-b.t))if(distance(out.at(-1),p)>.0001)out.push(p);
   if(distance(out.at(-1),path[i])>.0001)out.push(path[i]);
  }
  roads[name]=out;
 }
}
