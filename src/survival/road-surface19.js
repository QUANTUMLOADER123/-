import {terrainGrid08,terrainHeight} from './state.js';
function cross(a,b,p){return(b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x);}
function clip(poly,a,b){
 const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],u=cross(a,b,p),v=cross(a,b,q);if(u>=-1e-8)out.push(p);if((u>=0)!==(v>=0)){const t=u/(u-v);out.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t});}}return out;
}
/** Intersect road paint/asphalt with the actual terrain triangles. Sampling
 * just the strip edges can still bridge over crests or disappear into a slope.
 * This is mesh authoring at world load, never per-frame terrain deformation. */
export function groundPolygon19(pos,uv,idx,poly,offset=.022){
 const {size,step,segments}=terrainGrid08(),half=size/2,minX=Math.max(0,Math.floor((Math.min(...poly.map(p=>p.x))+half)/step)),maxX=Math.min(segments-1,Math.floor((Math.max(...poly.map(p=>p.x))+half)/step)),minZ=Math.max(0,Math.floor((Math.min(...poly.map(p=>p.z))+half)/step)),maxZ=Math.min(segments-1,Math.floor((Math.max(...poly.map(p=>p.z))+half)/step));
 for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){
  const a={x:x*step-half,z:z*step-half},b={x:a.x,z:a.z+step},d={x:a.x+step,z:a.z},q={x:d.x,z:b.z};
  for(const tri of [[a,d,b],[q,b,d]]){let points=poly;for(let j=0;j<3&&points.length;j++)points=clip(points,tri[j],tri[(j+1)%3]);if(points.length<3)continue;
   let area=0;for(let i=0;i<points.length;i++){const p=points[i],n=points[(i+1)%points.length];area+=p.x*n.z-n.x*p.z;}if(Math.abs(area)<1e-8)continue;
   const base=pos.length/3;for(const p of points){pos.push(p.x,terrainHeight(p.x,p.z)+offset,p.z);uv.push(p.x/2,p.z/2);}for(let j=1;j<points.length-1;j++)if(area>0)idx.push(base,base+j+1,base+j);else idx.push(base,base+j,base+j+1);
  }
 }
}
