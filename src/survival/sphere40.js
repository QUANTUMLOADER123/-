import * as THREE from 'three';
/** True spherical shell in WORLD metres. A separated switchback shaft has no
 * full-width floor above a climbing flight. All six landings are connected. */
export function sphere40(k){
 const p=k.p,g=k.group(k.root),scale=k.m.siteScale25||1;g.scale.set(1/scale,1,1/scale);g.name='Sphere40 world-metre structure';const r=19,cy=26,shell=p.rust.clone();shell.side=THREE.DoubleSide;
 // Full round silhouette, with an authored underside access slot instead of
 // chopping away an entire latitude cap (which looked like another squash).
 const geometry=new THREE.SphereGeometry(r,48,32),pos=geometry.attributes.position,indices=geometry.index.array,cut=[];
 for(let i=0;i<indices.length;i+=3){const ids=[indices[i],indices[i+1],indices[i+2]],x=ids.reduce((n,j)=>n+pos.getX(j),0)/3,y=cy+ids.reduce((n,j)=>n+pos.getY(j),0)/3;if(Math.abs(x)<4.1&&y<13.8)continue;cut.push(...ids);}geometry.setIndex(cut);
 const skin=k.mesh(g,geometry,shell,[0,cy,0]);k.keep.add(skin);
 for(let y=7.2;y<44.9;y+=1.8){const top=Math.min(44.9,y+1.8),mid=(y+top)/2,rr=Math.sqrt(Math.max(0,r*r-(mid-cy)**2));if(rr<1)continue;for(let i=0;i<48;i++){const a=(i+.5)*Math.PI/24;if(Math.abs(Math.sin(a)*rr)<4.1&&mid<13.8)continue;const q=k.group(g,[Math.sin(a)*rr,mid,Math.cos(a)*rr],a);k.box(q,[2*rr*Math.tan(Math.PI/48),top-y,.16],[0,0,0],p.rubber,true).visible=false;}}
 for(const y of[14,26,38]){const rr=Math.sqrt(r*r-(y-cy)**2);k.ring(g,rr+.045,.075,[0,y,0],p.metal,true);}
 for(const x of[-9,9])for(const z of[-7,7]){k.beam(g,[x,.18,z],[x,14,z],.34,p.cream);k.beam(g,[x,.3,z],[x*.6,12,z*.6],.12,p.rust);k.floor(g,1.8,1.8,x,z,.18,p.concrete);}
 const route=[],decks=[7.18,14.18,21.18,28.18,35.18,40.58];let y=.18;
 for(let i=0;i<decks.length;i++){
  const reverse=i%2===1,x=reverse?1.6:-1.6,startZ=reverse?-3.2:8,rise=decks[i]-y,steps=Math.round(rise/.2),run=steps*.32,endZ=startZ+(reverse?run:-run),yaw=reverse?Math.PI:0;
  k.stairs(g,{x,z:startZ,y,rise,width:2.4,yaw,steps,tread:.32});const landingZ=endZ+(reverse?1:-1)*(1.4+.0125);
  // The last tread and landing touch at their edges. Nothing spans the shaft.
  k.floor(g,6.4,2.8,0,landingZ,decks[i],p.metal);
  if(i<5){for(const side of[-1,1]){k.floor(g,5.4,14,side*6.5,1.2,decks[i],p.metal);k.rail(g,[side*9.2,0,-5.8],[side*9.2,0,8.2],decks[i]);}for(const end of[-1,1]){const z=end<0?-4.6125:9.4125;k.floor(g,18.4,2.8,0,z,decks[i],p.metal);k.rail(g,[-9.2,0,z+end*1.4],[9.2,0,z+end*1.4],decks[i]);}}
  else{k.floor(g,7,3,0,7.2,decks[i],p.metal);for(const side of[-1,1])k.rail(g,[side*3.5,0,5.7],[side*3.5,0,8.7],decks[i]);k.rail(g,[-3.5,0,8.7],[3.5,0,8.7],decks[i]);}
  const points=Array.from({length:steps+1},(_,n)=>({x,y:y+rise*n/steps,z:startZ+(reverse?1:-1)*n*.32}));points.push({x,y:decks[i],z:landingZ});route.push({start:{x,y,z:startZ},end:{x,y:decks[i],z:endZ},landing:{x:0,y:decks[i],z:landingZ},points,width:2.4});y=decks[i];
 }
 for(const side of[-1,1])for(const z of[-5,10])k.beam(g,[side*3.1,.18,z],[side*3.1,40.6,z],.08,p.metal);
 // The same persistence keys keep already looted caches empty after the rebuild.
 for(const [i,x,z,y]of[[1,-6,-2,7.18],[2,6,1,21.18],[3,0,7.6,40.58],[4,23,8,.18]])k.crate(g,i,[x,y,z]);
 const service=k.room(g,{x:24,z:8,w:7,d:8,yaw:-Math.PI/2,mat:p.brick});k.cabinet(service,-2,-2);k.shelf(service,1,-2);k.crate(service,0,[1,0,1]);k.tank(g,24,-5,2,7,p.paint);k.tank(g,24,1,2,7,p.rust);k.beam(g,[24,3,-5],[16,3,-5],.18,p.metal);k.vehicle(g,-23,20,.3,true);
 for(const x of[-8,8])k.lamp(g,x,19,4.8);
 k.root.userData.sphere40={radius:r,centerY:cy,trueSphere:true,worldScale:1,decks,route,shaft:{minX:-2.8,maxX:2.8,minZ:-3.2125,maxZ:8.0125}};return g;
}
