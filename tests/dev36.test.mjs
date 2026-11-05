import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {configureMap,MONUMENTS,BOT_BASES,ROADS,MAP_SIZES,WORLD_RADIUS} from '../src/survival/map-data.js';
import {newGame,encodeSave,decodeSave,terrainHeight} from '../src/survival/state.js';
import {mapProjection36,contourCell36,mapWorldPoint36,mapCanvasFit36,changeMapView36} from '../src/survival/cartography36.js';
import {Site17} from '../src/survival/site-kit17.js';
import {buildLand36,dressOffshore36} from '../src/survival/sites36.js';
import {oilrig31} from '../src/survival/oilrig31.js';
import {ensureRecycler33} from '../src/survival/recyclers33.js';
import {installSurfaceTextures12} from '../src/survival/surface05.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const pointSegment=(p,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t);};
test('revision 17 has fourteen sites, both traders and rigs, connected exact entrances and 120 safe homes across sizes/seeds',()=>{
 for(const size of Object.keys(MAP_SIZES))for(const seed of[27182,1,92873,42,34831,20261104,999999999]){configureMap(size,seed,17);assert.equal(MONUMENTS.length,14);assert.equal(MONUMENTS.filter(m=>m.safe).length,2);assert.equal(MONUMENTS.filter(m=>m.kind==='oilrig').length,2);assert.equal(BOT_BASES.length,120,size+':'+seed);
  for(const m of MONUMENTS.filter(m=>m.kind!=='oilrig')){const entry=m.entrance36,path=ROADS['gate36-'+m.id];assert.ok(entry);assert.equal(distance(entry,path.at(-1)),0);assert.equal(distance(m.approach36,path[0]),0);assert.ok(Object.entries(ROADS).some(([name,p])=>name!=='gate36-'+m.id&&p.some((b,i)=>i&&pointSegment(m.approach36,p[i-1],b)<.025)),m.id+' disconnected approach');assert.ok(Math.abs(Math.atan2(entry.x-m.x,entry.z-m.z)-m.yaw36)<1e-8);for(const n of MONUMENTS.filter(n=>n.kind!=='oilrig'&&n!==m))assert.ok(pointSegment(n,path[0],path[1])>n.radius+2,m.id+' crosses '+n.id);}
  for(const b of BOT_BASES){assert.ok(terrainHeight(b.x,b.z)>1.3);assert.ok(MONUMENTS.every(m=>distance(b,m)>m.radius+6));}
 }
});
test('new ridges are bounded, continuous, share collision heights and keep coastal docks low',()=>{
 configureMap('small',27182,17);let min=Infinity,max=-Infinity,maxSlope=0;for(let x=-270;x<=270;x+=9)for(let z=-270;z<=270;z+=9){const h=terrainHeight(x,z);assert.ok(Number.isFinite(h));if(h>1.3){min=Math.min(min,h);max=Math.max(max,h);}maxSlope=Math.max(maxSlope,Math.abs(terrainHeight(x+.1,z)-h)/.1,Math.abs(terrainHeight(x,z+.1)-h)/.1);}assert.ok(max>40,'a real ridge, not flat pads');assert.ok(max<90);assert.ok(max-min>35);assert.ok(maxSlope<2,'no discontinuous shelves: '+maxSlope);assert.ok(Math.abs(terrainHeight(-6,-3)-1.7)<1e-5);assert.ok(Math.abs(terrainHeight(MONUMENTS.find(m=>m.id==='harbor').x,MONUMENTS.find(m=>m.id==='harbor').z)-3.2)<.05);
});
test('new worlds opt into current revision 18; old revisions retain twenty destinations and unchanged saved coordinates/items',()=>{
 const s=newGame({deferSpawn:true});assert.equal(s.contentRevision,18);for(const rev of[15,16]){configureMap('small',27182,rev);assert.equal(MONUMENTS.length,20);const points=[[-90,70],[40,85],[165,15]].map(([x,z])=>terrainHeight(x,z)),coords=MONUMENTS.map(m=>[m.id,m.x,m.z]);s.contentRevision=rev;s.position={x:17,z:-43};s.inventory.scrap=73;const restored=decodeSave(encodeSave(s));assert.equal(restored.contentRevision,rev);assert.deepEqual(restored.position,s.position);assert.equal(restored.inventory.scrap,73);configureMap('small',27182,17);configureMap('small',27182,rev);assert.deepEqual(MONUMENTS.map(m=>[m.id,m.x,m.z]),coords);assert.deepEqual([[-90,70],[40,85],[165,15]].map(([x,z])=>terrainHeight(x,z)),points);}
});
export function buildSitesFixture36(){configureMap('small',27182,17);installSurfaceTextures12(Object.fromEntries(['wood','metal','cloth','stone'].map(k=>['pbr12/'+k+'-color.webp',new THREE.Texture()])));const w={scene:new THREE.Scene(),distantGroups:[],colliders:[],walkFloors:[],interactables:[],occluders:[],siteLayouts17:[]},p=Object.fromEntries(['concrete','metal','rust','wood','paint','rubber','asphalt','brick','cream','blue','red','yellow','glass','light','white'].map(k=>[k,new THREE.MeshStandardMaterial()])),warn=console.warn;console.warn=()=>{};try{for(const m of MONUMENTS){const k=new Site17(w,m,p);k.sign=()=>new THREE.Object3D();if(m.kind==='oilrig'){oilrig31(k,m.id==='oil-large');dressOffshore36(k);}else buildLand36(k);ensureRecycler33(k);k.finish();}}finally{console.warn=warn;}return w;}
test('all fourteen detailed sites retain unique persistent loot, human recyclers and real entrance transforms',()=>{
 const w=buildSitesFixture36();assert.equal(w.siteLayouts17.length,14);const ids=w.interactables.map(i=>i.id);assert.equal(new Set(ids).size,ids.length);for(const site of w.siteLayouts17){assert.equal(site.revision,36);assert.ok(site.sourceParts>450,site.id);assert.ok(site.detail36.length>=3);assert.equal(w.interactables.filter(i=>i.site17===site.id&&i.type==='recycler').length,1);const m=MONUMENTS.find(m=>m.id===site.id);if(m.kind==='oilrig')continue;assert.equal(site.detail36.length,5);assert.ok(distance(m.entry17,m.entrance36)<1e-7,'rendered gate must equal routed gate');assert.equal(site.yaw,m.yaw36);}
 for(const f of w.walkFloors)assert.ok([f.x,f.z,f.y,f.w,f.d].every(Number.isFinite));
});
test('atlas projection includes offshore footprints at every size and contour interpolation has no out-of-cell vertices',()=>{
 for(const size of Object.keys(MAP_SIZES)){configureMap(size,27182,17);const p=mapProjection36(MONUMENTS,WORLD_RADIUS);for(const m of MONUMENTS)for(const side of[-1,1]){assert.ok(p.ox+(m.x+side*m.radius)*p.unit>=24);assert.ok(p.ox+(m.x+side*m.radius)*p.unit<=576);assert.ok(p.oz+(m.z+side*m.radius)*p.unit>=30);assert.ok(p.oz+(m.z+side*m.radius)*p.unit<=474);}}
 assert.deepEqual(contourCell36([0,0,0,0],8),[]);assert.equal(contourCell36([0,16,16,0],8).length,1);assert.equal(contourCell36([16,0,16,0],8).length,2);for(const a of contourCell36([0,16,16,0],8).flat())for(const v of a)assert.ok(v>=0&&v<=1);
});

test('atlas markers invert letterboxed CSS and zoom/pan coordinates exactly',()=>{configureMap('small',27182,17);const canvas={getBoundingClientRect:()=>({left:40,top:20,width:580,height:286})};for(const zoom of[1,2,4]){changeMapView36({zoom,x:55,z:-30});const p=mapProjection36(),fit=mapCanvasFit36(canvas),target={x:60,z:0},event={clientX:fit.left+(p.ox+target.x*p.unit)*fit.scale,clientY:fit.top+(p.oz+target.z*p.unit)*fit.scale},actual=mapWorldPoint36(canvas,event);assert.ok(Math.abs(actual.x-target.x)<1e-8);assert.ok(Math.abs(actual.z-target.z)<1e-8);}assert.equal(mapWorldPoint36(canvas,{clientX:41,clientY:30}),null);changeMapView36({reset:true});});
