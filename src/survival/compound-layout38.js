/** A complete rectangle or no compound: never leave an accidental open corner.
 * House coordinates are local; every sample, including gate, must pass world checks. */
export function compoundLayout38(plan,entry,world,{height,clear}){
 const minX=Math.min(...plan.map(p=>p.x))-4.2,maxX=Math.max(...plan.map(p=>p.x))+4.2,minZ=Math.min(...plan.map(p=>p.z))-4.2,maxZ=Math.max(...plan.map(p=>p.z))+4.2,gateX=Math.max(minX+2,Math.min(maxX-2,entry.x)),segments=[];
 function edge(ax,az,bx,bz){const length=Math.hypot(bx-ax,bz-az),n=Math.ceil(length/3);for(let i=0;i<n;i++){const t=(i+.5)/n;segments.push({x:ax+(bx-ax)*t,z:az+(bz-az)*t,width:length/n,angle:Math.atan2(-(bz-az),bx-ax),gate:false});}}
 edge(minX,minZ,maxX,minZ);edge(minX,minZ,minX,maxZ);edge(maxX,minZ,maxX,maxZ);edge(minX,maxZ,gateX-1.5,maxZ);edge(gateX+1.5,maxZ,maxX,maxZ);segments.push({x:gateX,z:maxZ,width:3,angle:0,gate:true});
 for(const p of segments){const c=Math.cos(p.angle),s=Math.sin(p.angle),samples=[-.5,0,.5].map(t=>world(p.x+c*p.width*t,p.z-s*p.width*t)),ys=samples.map(q=>height(q.x,q.z));if(samples.some(q=>!clear(q.x,q.z))||Math.min(...ys)<.5||Math.max(...ys)-Math.min(...ys)>.9)return null;p.bottom=Math.min(...ys)-.08;p.height=2.7+Math.max(...ys)-Math.min(...ys);Object.assign(p,world(p.x,p.z));}
 return {segments,gate:segments.at(-1),bounds:{minX,maxX,minZ,maxZ}};
}
export function snapLadder38(hit,position,feet,heightAt){
 const b=hit?.data;if(!b||!['wall','doorway','woodenFence','barbedFence'].includes(b.kind)||!hit.hitPoint)return null;
 const rotation=b.rotation||0,nx=Math.sin(rotation),nz=Math.cos(rotation),sign=(position.x-b.x)*nx+(position.z-b.z)*nz>=0?1:-1;
 const x=hit.hitPoint.x+nx*sign*.38,z=hit.hitPoint.z+nz*sign*.38,ground=heightAt(x,z),y=Math.max(ground,Math.min(hit.hitPoint.y-1,feet+.65));
 return{x,z,y,rotation:rotation+(sign<0?Math.PI:0),anchor38:b.id};
}
export function ladderContact38(buildings,depleted,position,feet){
 for(const b of buildings){if(b.kind!=='wallLadder'||b.hp<=0||depleted.includes(b.id)||b.anchor38&&depleted.includes(b.anchor38))continue;const c=Math.cos(b.rotation),s=Math.sin(b.rotation),dx=position.x-b.x,dz=position.z-b.z,across=dx*c-dz*s,front=dx*s+dz*c,y=b.y||0;if(Math.abs(across)<.57&&front>-.12&&front<.8&&feet>=y-.85&&feet<y+3.65)return{bottom:y,top:y+3.65,id:b.id};}return null;
}
