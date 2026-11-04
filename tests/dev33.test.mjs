import {restoreRecyclers33} from '../src/survival/recyclers33.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {weaponModel33} from '../src/survival/weapon-models33.js';
import {WEAPON_FORMS33,grips33} from '../src/survival/weapon-profiles33.js';
import {GUN_POSES14} from '../src/survival/pose14.js';
import {prepareReload14,resetMechanisms14,reloadPose14,fireMechanism14} from '../src/survival/reload14.js';
import {ITEMS33,USE33,RECIPES33,RECYCLE33,LOOT33} from '../src/survival/items33.js';
import {newGame,ITEMS,RECIPES,consume,encodeSave,decodeSave} from '../src/survival/state.js';
import {RECYCLE,recipeCategory} from '../src/survival/expansion.js';
import {crateLoot} from '../src/survival/loot04.js';
import {recyclerFor20,advanceRecyclers20} from '../src/survival/recycler20.js';
import {naturalRock33,dressMaterials12} from '../src/survival/materials12.js';
import {checkWeapons32} from './dev32-weapon-fixture.js';
const bank=(kind,color)=>new THREE.MeshStandardMaterial({color,roughness:.7});
test('sixteen distinct DEV33 forms, canonical grips and bounded batched draw counts',()=>{
 assert.equal(Object.keys(WEAPON_FORMS33).length,16);const signatures=new Set();for(const id in WEAPON_FORMS33){const m=weaponModel33(id,bank),g=grips33(id);assert.equal(m.userData.modelRevision33,33);assert.deepEqual(GUN_POSES14[id].right.toArray(),g.right);assert.deepEqual(GUN_POSES14[id].left.toArray(),g.left);assert.deepEqual(m.userData.supportGrip25.toArray(),g.left);let meshes=0,triangles=0;m.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok([p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite),id);triangles+=(o.geometry.index?.count??p.count)/3;});assert.ok(meshes<=11,id+': '+meshes);assert.ok(triangles>1500&&triangles<12000,id+': '+triangles);signatures.add([new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).toArray(),triangles].join('|'));}
 assert.equal(signatures.size,16);
});
test('moving mechanisms remain meshes; reload/fire tracks reset without drift for all sixteen',()=>{
 for(const id in WEAPON_FORMS33){const m=weaponModel33(id,bank),p=GUN_POSES14[id];prepareReload14(m,id);if(['magazine','box'].includes(p.reload))assert.ok(m.userData.magazine?.geometry,id);for(const t of [0,.1,.25,.38,.5,.75,.9,1]){resetMechanisms14(m);const pose=reloadPose14(m,id,t,5);assert.ok([...pose.right.toArray(),...pose.left.toArray()].every(Number.isFinite),id);for(const name of ['magazine','cylinder14','bolt14','foregrip14']){const part=m.userData[name];if(part)assert.ok(part.position.toArray().every(Number.isFinite));}}resetMechanisms14(m);for(const name of ['magazine','cylinder14','bolt14','foregrip14']){const part=m.userData[name];if(part)assert.ok(part.position.distanceTo(part.userData.restPosition14)<1e-10,id+name);}for(const age of [0,.06,.16,.3,1]){resetMechanisms14(m);fireMechanism14(m,id,age);}}
});
test('single connected iron-sight contract survives replacement receivers',()=>{const original=console.warn;console.warn=()=>{};try{assert.equal(checkWeapons32().length,15);}finally{console.warn=original;}});
test('ten real item IDs, recipes with valid resources, useful effects and saved quantities',()=>{
 assert.equal(Object.keys(ITEMS33).length,10);for(const id in ITEMS33)assert.ok(ITEMS[id]);for(const [id,r]of Object.entries(RECIPES33)){assert.ok(RECIPES[id]);for(const [resource,n]of Object.entries(r.cost)){assert.ok(ITEMS[resource],id+': '+resource);assert.ok(n>0);}}
 for(const [id,e]of Object.entries(USE33)){const s=newGame();s.health=s.hunger=s.thirst=40;s.inventory[id]=2;assert.equal(recipeCategory(id,RECIPES[id]||{}),e.medical?'medical':'food');assert.ok(consume(s,id),id);for(const k of ['health','hunger','thirst'])assert.equal(s[k],40+(e[k]||0),id+k);assert.equal(s.inventory[id],1);const back=decodeSave(encodeSave(s));assert.equal(back.inventory[id],1);}
 const s=newGame();s.inventory.medicalGauze=1;assert.equal(consume(s,'medicalGauze'),false);assert.equal(s.inventory.medicalGauze,1);assert.equal(RECIPES.recycler.cost.bearingSet,2);assert.equal(RECIPES.laserSight.cost.copperWire,1);
});
test('all ten are obtainable in finite crate tables; components recycle once without multiplier',()=>{
 const found=new Set();for(const tier of Object.keys(LOOT33))for(let n=0;n<100;n++)for(const id of Object.keys(crateLoot('dev33-'+n,33,tier)))if(ITEMS33[id])found.add(id);assert.equal(found.size,10);
 for(const [id,products]of Object.entries(RECYCLE33)){assert.deepEqual(RECYCLE[id],products);const s=newGame({multiplier:10}),r=recyclerFor20(s,'dev33-station');r.slots[0]={item:id,count:1};r.on=true;for(let n=0;n<11;n++)advanceRecyclers20(s,.25);assert.equal(r.slots[0],null);for(const [item,count]of Object.entries(products))assert.equal(r.slots.find(x=>x?.item===item)?.count,count);const back=decodeSave(encodeSave(s));assert.deepEqual(back.recyclers20['dev33-station'].slots,r.slots);}
});
test('natural-rock tag cannot be rebound to construction bricks by material dressing',()=>{
 const rock=new THREE.Texture(),brick=new THREE.Texture(),w={textures:{'nature33/granite-color.webp':rock,'nature33/granite-normal.webp':new THREE.Texture(),'nature33/granite-orm.webp':new THREE.Texture(),'pbr12/stone-color.webp':brick},settings:{detailMaps28:1},scene:new THREE.Scene()};const mat=naturalRock33(w);mat.userData.kind12='stone';w.scene.add(new THREE.Mesh(new THREE.SphereGeometry(),mat));dressMaterials12(w);assert.equal(mat.map,rock);assert.notEqual(mat.map,brick);assert.ok(mat.userData.naturalRock33);for(const name of ['rockfields17','world']){const s=readFileSync(new URL('../src/survival/'+name+'.js',import.meta.url),'utf8');assert.match(s,/naturalRock33/);}assert.notEqual(createHash('sha256').update(readFileSync('web/assets/nature33/granite-color.webp')).digest('hex'),createHash('sha256').update(readFileSync('web/assets/pbr12/stone-color.webp')).digest('hex'));
});
test('all 122 mastered clips match hashes, have headroom and pinned licensed derivative sources',()=>{
 const manifest=JSON.parse(readFileSync('web/assets/audio/master33/manifest.json'));assert.equal(Object.keys(manifest.clips).length,122);for(const [id,v]of Object.entries(manifest.clips)){const data=readFileSync('web/assets/audio/master33/'+id+'.wav');assert.equal(createHash('sha256').update(data).digest('hex'),v.sha256);assert.ok(v.peak>.1&&v.peak<=.861,id);assert.ok(v.seconds>0&&v.rms>0,id);assert.equal(createHash('sha256').update(readFileSync(v.source)).digest('hex'),v.sourceSha256,id);assert.equal(data.readUInt32LE(24),32000,id);}
});

test('saved positions are only recovered from new recycler hulls, once, without inventory or terrain changes',()=>{
 const model=new THREE.Group();model.position.y=5.2;model.updateMatrixWorld(true);const w={interactables:[{type:'recycler',site17:'oil-small',model,y:5.2}],floorHeight:()=>5.2,canMove:(x,z)=>Math.hypot(x,z)>1.5,canStand04:()=>true};const s={position:{x:0,z:0},feetY:5.2,inventory:{scrap:123},contentRevision:8};restoreRecyclers33(w,s);assert.ok(Math.hypot(s.position.x,s.position.z)>1.5);assert.equal(s.feetY,5.2);assert.equal(s.stationRevision33,33);assert.deepEqual(s.inventory,{scrap:123});assert.equal(s.contentRevision,8);s.position={x:0,z:0};restoreRecyclers33(w,s);assert.deepEqual(s.position,{x:0,z:0});const far={position:{x:12,z:12},feetY:5.2};restoreRecyclers33(w,far);assert.deepEqual(far.position,{x:12,z:12});
});
