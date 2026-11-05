import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resourceAllowed32,slopeAt32} from '../src/survival/ecology32.js';
import {foundationWalls32,skirtCollider32,installFoundations32} from '../src/survival/foundations32.js';
import {terrainChunks32} from '../src/survival/terrain-chunks32.js';
import {installCacti18} from '../src/survival/cacti18.js';
import {installTargeting} from '../src/survival/targeting.js';
import {configureMap,BOT_BASES,MONUMENTS,MAP_SIZES,ROADS} from '../src/survival/map-data.js';
import {terrainHeight,terrainGrid08,newGame,resourceNodes,harvest,consume,encodeSave,decodeSave} from '../src/survival/state.js';
import {biomeAt} from '../src/survival/environment.js';
import {obstacleContains17,rayObstacle17} from '../src/survival/spatial17.js';
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const forest={id:'forest',weights25:{forest:1,arid:0,snow:0}};
test('edible plants and hemp never use desert/snow/coast or steep spawn candidates',()=>{
 for(const type of ['fiber','berries','mushroom','pumpkin','corn']){assert.ok(resourceAllowed32(type,forest,4,.1));for(const id of ['arid','snow','coast'])assert.equal(resourceAllowed32(type,{...forest,id},4,.1),false);assert.equal(resourceAllowed32(type,{...forest,weights25:{forest:.6,arid:.3}},4),false);assert.equal(resourceAllowed32(type,forest,1),false);assert.equal(resourceAllowed32(type,forest,4,.4),false);}assert.equal(resourceAllowed32('mushroom',{id:'forest',weights25:{forest:.6}},4),false);assert.ok(Math.abs(slopeAt32((x,z)=>x*.3+z*.4,5,6)-.5)<1e-10);
});
test('revision 15 supports every map size and seeds with 120 land bases, 20 RT and bounded relief',()=>{
 for(const size of Object.keys(MAP_SIZES))for(const seed of [27182,1,92873,42,34831,20261104,999999999]){configureMap(size,seed,15);assert.equal(BOT_BASES.length,120,size+':'+seed);assert.equal(MONUMENTS.length,20);assert.equal(new Set(BOT_BASES.map(b=>b.id)).size,120);for(const b of BOT_BASES)assert.ok(terrainHeight(b.x,b.z)>1.3);let min=Infinity,max=-Infinity;const extent=250*MAP_SIZES[size].scale;for(let x=-extent;x<=extent;x+=extent/12)for(let z=-extent;z<=extent;z+=extent/12){const h=terrainHeight(x,z);assert.ok(Number.isFinite(h));min=Math.min(min,h);max=Math.max(max,h);}assert.ok(max<65,size+':'+max);assert.ok(Math.abs(terrainHeight(-6,-3)-1.7)<1e-5);}
 configureMap('small',27182,15);
});
test('actual food/hemp nodes obey the same rendered biome and ground slope',()=>{configureMap('small',27182,15);const nodes=resourceNodes(),plants=nodes.filter(n=>['fiber','berries','mushroom','pumpkin','corn'].includes(n.type));assert.ok(plants.length>10);for(const n of plants)assert.ok(resourceAllowed32(n.type,biomeAt(n.x,n.z),terrainHeight(n.x,n.z),slopeAt32(terrainHeight,n.x,n.z)),n.id);assert.deepEqual(nodes,resourceNodes());});
test('cactus yields finite flesh + cloth, multiplier once; consumption and save depletion persist',()=>{
 for(const multiplier of [1,2,10]){const s=newGame({multiplier}),n={id:'cactus18-test',type:'cactus',remaining:3};for(let i=0;i<3;i++)assert.ok(harvest(s,n));assert.equal(s.inventory.cactusFlesh,6*multiplier);assert.equal(s.inventory.fiber,3*multiplier);assert.equal(harvest(s,n),null);s.hunger=50;s.thirst=50;assert.ok(consume(s,'cactusFlesh'));assert.equal(s.hunger,57);assert.equal(s.thirst,62);const loaded=decodeSave(encodeSave(s));assert.ok(loaded);assert.ok(loaded.depleted.includes(n.id));assert.equal(loaded.nodeDamage[n.id],0);}
 const s=newGame(),n={id:'axe-cactus',type:'cactus',remaining:3};s.selected='axe';s.inventory.axe=1;harvest(s,n);assert.equal(n.remaining,1);harvest(s,n);assert.equal(s.inventory.cactusFlesh,6);assert.equal(s.inventory.fiber,3);
});
test('old revision is retained when decoding saves, new games use revision 17',()=>{const s=newGame();assert.equal(s.contentRevision,17);s.contentRevision=14;const decoded=decodeSave(encodeSave(s));assert.ok(decoded);assert.equal(decoded.contentRevision,14);});
test('instanced cactus targets are finite and hide removes collision, including load',()=>{
 class World{hideNode(){}syncState(){}addBuilding(){}}
 installCacti18(World);installTargeting(World);const w=new World();w.nodes=[];w.staticStructures=[];w.interactables=[];w.built=new Map();w.bots=[];w.wolves=[];w.occluders=[];w.camera=new THREE.PerspectiveCamera();w.camera.position.set(0,1.4,2);w.nearTargets06=(_,list)=>list;const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,3,1),new THREE.MeshBasicMaterial(),1),n={id:'cactus18-1',type:'cactus',x:0,y:0,z:0,r:.5,h:3,remaining:3,mesh,index:0,alive:true};w.cacti18=[n];w.colliders=[{id:n.id}];const s=newGame();assert.equal(w.target(s).type,'cactus');s.depleted.push(n.id);w.syncState(s);assert.equal(n.alive,false);assert.equal(w.colliders.length,0);assert.equal(w.target(s),null);const matrix=new THREE.Matrix4();mesh.getMatrixAt(0,matrix);assert.ok(matrix.elements[13]<-1000);
});
test('square and triangle foundation skirts reach terrain and have matching rotated collision/LOS',()=>{
 for(const kind of ['foundation','triangleFoundation'])for(const rotation of [0,Math.PI/2,.7]){const b={id:kind,kind,x:10,z:12,y:8,rotation,hp:250},height=(x,z)=>3+x*.07-z*.03,walls=foundationWalls32(b,height);assert.equal(walls.length,kind==='foundation'?4:3);for(const p of walls){assert.ok(p.bottom<height(p.x,p.z));assert.ok(Math.abs(p.bottom+p.h-8.02)<1e-8);const c=skirtCollider32(p);assert.ok(obstacleContains17(c,p.x,p.z));const origin=v(p.x+Math.sin(rotation)*2,p.bottom+.3,p.z+Math.cos(rotation)*2),dir=v(p.x,origin.y,p.z).sub(origin).normalize();assert.ok(rayObstacle17(c,origin,dir));assert.equal(c.data,b);}}
});
test('player skirts are children of their foundation and share its material/lifecycle',()=>{
 class World{constructor(){this.built=new Map();this.colliders=[];}addBuilding(b){const model=new THREE.Mesh(new THREE.BoxGeometry(3,.38,3),new THREE.MeshStandardMaterial());model.position.set(b.x,b.y,b.z);model.rotation.y=b.rotation;this.built.set(b.id,{data:b,model});}}
 installFoundations32(World);const w=new World(),b={id:'build-square',kind:'foundation',x:0,z:0,y:5,rotation:.6,hp:250};w.addBuilding(b);const model=w.built.get(b.id).model;assert.equal(model.children.length,4);assert.equal(w.colliders.length,4);for(const child of model.children){assert.equal(child.material,model.material);assert.ok(child.userData.foundationSkirt32);}for(const c of w.colliders)assert.equal(c.id,b.id);
});
test('chunking preserves every physical terrain triangle and copied edge normals',()=>{
 const n=70,source=new THREE.PlaneGeometry(140,140,n,n);source.rotateX(-Math.PI/2);const p=source.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.sin(p.getX(i)/20));source.computeVertexNormals();const root=terrainChunks32(source,n,new THREE.MeshBasicMaterial()),triangles=root.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0);assert.equal(triangles,n*n*2);
 for(const mesh of root.children){const {x,z,nx,nz}=mesh.userData.sourceCells32;for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const from=(z+j)*(n+1)+x+i,to=j*(nx+1)+i;for(const name of Object.keys(source.attributes)){const a=source.attributes[name],b=mesh.geometry.attributes[name];for(let k=0;k<a.itemSize;k++)assert.equal(b.array[to*a.itemSize+k],a.array[from*a.itemSize+k]);}}}
});
test('natural stone is not the generated brick construction texture',()=>{
 const load=p=>readFileSync(new URL('../web/assets/'+p,import.meta.url)),hash=p=>createHash('sha256').update(load(p)).digest('hex');assert.notEqual(hash('nature32/rock-color.webp'),hash('pbr12/stone-color.webp'));const material=readFileSync(new URL('../src/survival/terrain12.js',import.meta.url),'utf8');assert.match(material,/nature33\/granite-color/);assert.doesNotMatch(material,/\['pbr12\/stone-color/);
});

test('new routing connects a formerly isolated RT gate without crossing its footprint',()=>{
 configureMap('small',20261104,15);const roads=Object.values(ROADS),key=p=>p.x.toFixed(3)+':'+p.z.toFixed(3),adj=new Map();for(const path of roads)for(let i=0;i<path.length;i++){const a=key(path[i]);if(!adj.has(a))adj.set(a,new Set());if(i){const b=key(path[i-1]);adj.get(a).add(b);adj.get(b).add(a);}}
 const visited=new Set(),queue=[adj.keys().next().value];while(queue.length){const n=queue.pop();if(visited.has(n))continue;visited.add(n);for(const q of adj.get(n))queue.push(q);}assert.equal(visited.size,adj.size);
 for(const path of roads)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;for(const m of MONUMENTS.filter(m=>m.kind!=='oilrig')){const t=Math.max(0,Math.min(1,((m.x-a.x)*dx+(m.z-a.z)*dz)/Math.max(.001,len)));assert.ok(Math.hypot(a.x+dx*t-m.x,a.z+dz*t-m.z)>=m.radius+6.9,m.id);}}
});
