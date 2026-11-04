const PLANS=[[[0,0],[1,0],[0,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[1,1],[2,1]],[[0,0],[1,0],[2,0],[0,1],[2,1]],[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2]],[[0,0],[1,0],[2,0],[1,1],[2,1]]];
export function hashHouse20(seed,id){let n=seed;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return n;}
export function housePlan20(base,bases,r){
  const plan=PLANS[Math.floor(r()*PLANS.length)].map(([x,z])=>({x:x*3,z:z*3})),yaw=Math.floor(r()*4)*Math.PI/2,c=Math.cos(yaw),s=Math.sin(yaw),wealth=r();
  const mx=(Math.min(...plan.map(p=>p.x))+Math.max(...plan.map(p=>p.x)))/2,mz=(Math.min(...plan.map(p=>p.z))+Math.max(...plan.map(p=>p.z)))/2;for(const p of plan){p.x-=mx;p.z-=mz;}
  const entry=plan.filter(p=>!plan.some(q=>q.x===p.x&&q.z===p.z+3)).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x)||b.z-a.z)[0];
  const wantsAirlock=r()<.75,candidate={x:entry.x,z:entry.z+3},doorWorld={x:base.x+candidate.x*c+candidate.z*s,z:base.z-candidate.x*s+candidate.z*c},airlock=wantsAirlock&&!bases.some(b=>b!==base&&Math.hypot(b.x-doorWorld.x,b.z-doorWorld.z)<10)?candidate:null;if(airlock)plan.push(airlock);
  const shaft=plan.filter(p=>p!==airlock).sort((a,b)=>a.x-b.x||a.z-b.z)[0],world=(x,z)=>({x:base.x+x*c+z*s,z:base.z-x*s+z*c});

 return {plan,yaw,c,s,wealth,entry,airlock,shaft,world};
}
export function houseGround20(plan,world,heightAt){
  const ground=Math.max(...plan.flatMap(p=>[[-1.5,-1.5],[1.5,1.5],[-1.5,1.5],[1.5,-1.5]].map(([x,z])=>{const q=world(p.x+x,p.z+z);return heightAt(q.x,q.z);})))+.04;
 return ground;
}
