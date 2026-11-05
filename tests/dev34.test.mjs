import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Site17} from '../src/survival/site-kit17.js';
import {buildLand34,dressOffshore34} from '../src/survival/sites34.js';
import {oilrig31} from '../src/survival/oilrig31.js';
import {ensureRecycler33} from '../src/survival/recyclers33.js';
import {configureMap,MONUMENTS} from '../src/survival/map-data.js';
import {installSurfaceTextures12} from '../src/survival/surface05.js';
import {weaponModel16,itemTextures16} from '../src/survival/items16.js';
import {WEAPONS} from '../src/survival/catalog.js';
import {newGame,encodeSave,decodeSave,terrainHeight} from '../src/survival/state.js';
import {prepareReload14,resetMechanisms14,reloadPose14} from '../src/survival/reload14.js';
import {PBR_FILES12,dressMaterials12} from '../src/survival/materials12.js';
import {grassGeometry22} from '../src/survival/grass-mesh22.js';
const silent=f=>{const previous=console.warn;console.warn=()=>{};try{return f();}finally{console.warn=previous;}};
const bank=()=>Object.fromEntries(['concrete','metal','rust','wood','paint','rubber','asphalt','brick','cream','blue','red','yellow','glass','light','white'].map(k=>[k,new THREE.MeshStandardMaterial()]));
export function buildSitesFixture34(){
 configureMap('small',27182,16);installSurfaceTextures12(Object.fromEntries(['wood','metal','cloth','stone'].map(k=>['pbr12/'+k+'-color.webp',new THREE.Texture()])));
 const w={scene:new THREE.Scene(),distantGroups:[],colliders:[],walkFloors:[],interactables:[],occluders:[],siteLayouts17:[]},p=bank();
 return silent(()=>{for(const m of MONUMENTS){const k=new Site17(w,m,p);k.sign=()=>new THREE.Object3D();if(m.kind==='oilrig'){oilrig31(k,m.id==='oil-large');dressOffshore34(k);}else buildLand34(k);ensureRecycler33(k);k.finish();}return w;});
}
test('all twenty authored sites have distinct new layouts, real floors, stable station IDs and batched detail',()=>{
 const w=buildSitesFixture34();assert.equal(w.siteLayouts17.length,20);const summaries=new Set();for(const site of w.siteLayouts17){assert.equal(site.revision,34,site.id);assert.ok(site.sourceParts>=140,site.id+': '+site.sourceParts);assert.ok(site.floors>=2,site.id);assert.ok(site.colliders>=12,site.id);summaries.add([site.sourceParts,site.floors,site.colliders].join('/'));const stations=w.interactables.filter(i=>i.site17===site.id&&i.type==='recycler');assert.equal(stations.length,1,site.id);assert.ok(stations[0].id.startsWith('shop-'+site.id+'-'));}assert.ok(summaries.size>=17);
 const ids=w.interactables.map(i=>i.id);assert.equal(new Set(ids).size,ids.length,'no duplicate persistent loot keys');for(const f of w.walkFloors)assert.ok([f.x,f.z,f.y,f.ow,f.od].every(Number.isFinite));for(const root of w.distantGroups){let meshes=0;root.root.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes<w.siteLayouts17.find(s=>s.id===root.root.userData.site17).sourceParts,root.root.name+' is batched');}
});
test('all sixteen salvaged models retain physical moving parts and finite reload/grip tracks',()=>silent(()=>{
 const textures=Object.fromEntries(PBR_FILES12.filter(f=>f.startsWith('field34/')).map(f=>[f,new THREE.Texture()]));itemTextures16(textures);try{for(const id in WEAPONS){const m=weaponModel16(id);assert.equal(m.userData.styleRevision34,34,id);assert.equal(m.userData.salvage34.clothWraps,true);let parts=0,vertices=0;m.traverse(o=>{if(!o.isMesh)return;parts++;vertices+=o.geometry.attributes.position.count;if(o.material.userData.salvaged34&&o.material.userData.item16!=='wood')assert.equal(o.material.map,textures['field34/steel-color.webp']);});assert.ok(parts<=12,id+': '+parts);assert.ok(vertices>2000,id);prepareReload14(m,id);for(const t of[0,.2,.5,.8,1]){resetMechanisms14(m);const p=reloadPose14(m,id,t);assert.ok([...p.left.toArray(),...p.right.toArray()].every(Number.isFinite));}if(['rifle','boltRifle'].includes(id)){assert.ok(m.userData.bolt14?.isMesh);assert.ok(m.userData.salvage34.woodStock);assert.match(WEAPONS[id].name,/снайперская/);assert.ok(WEAPONS[id].range>=200);}}}finally{itemTextures16({});}
}));
test('new terrain is revisioned, continuous and shared; old saved terrain is not reshaped',()=>{
 assert.equal(newGame().contentRevision,18);configureMap('small',27182,15);const before=[[-90,70],[40,85],[165,15]].map(([x,z])=>terrainHeight(x,z));const old=newGame();old.contentRevision=15;assert.equal(decodeSave(encodeSave(old)).contentRevision,15);configureMap('small',27182,16);let changed=false,maxSlope=0;for(let z=-220;z<=220;z+=13)for(let x=-220;x<=220;x+=13){const h=terrainHeight(x,z);assert.ok(Number.isFinite(h));maxSlope=Math.max(maxSlope,Math.abs(terrainHeight(x+.1,z)-h)/.1,Math.abs(terrainHeight(x,z+.1)-h)/.1);}assert.ok(maxSlope<2,'no abrupt quantized shelves: '+maxSlope);const after=[[-90,70],[40,85],[165,15]].map(([x,z])=>terrainHeight(x,z));changed=after.some((v,i)=>Math.abs(v-before[i])>.02);assert.ok(changed);configureMap('small',27182,15);assert.deepEqual([[-90,70],[40,85],[165,15]].map(([x,z])=>terrainHeight(x,z)),before);
});
test('twelve original PBR assets match manifest hashes; material dressing preserves salvaged surfaces',()=>{
 const manifest=JSON.parse(readFileSync('web/assets/field34/manifest.json'));assert.equal(Object.keys(manifest.files).length,12);for(const [name,hash]of Object.entries(manifest.files)){const file='web/assets/field34/'+name;assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),hash);assert.ok(PBR_FILES12.includes('field34/'+name));}const map=new THREE.Texture(),mat=new THREE.MeshStandardMaterial({map});mat.userData.salvaged34=true;mat.userData.kind12='metal';const w={scene:new THREE.Scene(),settings:{detailMaps28:1},textures:{'pbr12/metal-color.webp':new THREE.Texture()}};w.scene.add(new THREE.Mesh(new THREE.BoxGeometry(),mat));dressMaterials12(w);assert.equal(mat.map,map);
});
test('fine grass near/far meshes remain finite indexed silhouettes without alpha cards',()=>{for(const [n,fold]of[[4,false],[6,true],[8,true],[2,false]]){const g=grassGeometry22(n,fold);assert.ok(g.index.count>0);assert.equal(g.attributes.uv.count,g.attributes.position.count);for(const v of g.attributes.position.array)assert.ok(Number.isFinite(v));g.dispose();}});

test('sniper optics are detachable functional x4/x8, with a dedicated crosshair and no free optic',async()=>{
 const {installWeaponMods25}=await import('../src/survival/weapon-mods25.js');const {modCompatible25}=await import('../src/survival/attachments25.js');
 class World{constructor(){this.scene=new THREE.Scene();this.weaponViews={};}update(){}dispose(){}makeNewViewModels(){for(const id of['rifle','boltRifle']){const m=weaponModel16(id),base=new THREE.Group();base.position.fromArray(m.userData.opticMount16);m.add(base);m.userData.optic08=base;this.weaponViews[id]=m;}}}
 installWeaponMods25(World);const w=new World();silent(()=>w.makeNewViewModels());for(const id of['rifle','boltRifle']){assert.ok(modCompatible25(id,'scope4x'));assert.ok(modCompatible25(id,'scope8x'));const s={selected:id,attachments25:{},laserEnabled25:true};w.update(.016,s,true);const u=w.weaponViews[id].userData;assert.equal(u.scope25.visible,false);assert.equal(u.irons28.visible,true);for(const [scope,zoom]of[['scope4x',4],['scope8x',8]]){s.attachments25[id]=[scope];w.update(.016,s,true);assert.equal(w.aimZoom25,zoom);assert.equal(u.scope25.visible,true);assert.equal(u.irons28.visible,false);assert.equal(u.scope25.userData.reticle34,'crosshair');assert.equal(u.optic08,u.scope25);assert.ok(u.scope25.position.y>u.receiverTop32);}}
});

test('separated RT footprints and 120 safely spaced homes survive seven seeds on small/large islands',async()=>{
 const map=await import('../src/survival/map-data.js');for(const seed of[27182,1,12345,999999999,33,34567,77621])for(const size of['small','large']){configureMap(size,seed,16);const land=map.MONUMENTS.filter(m=>m.kind!=='oilrig');assert.equal(map.BOT_BASES.length,120,size+'/'+seed);for(let i=0;i<land.length;i++)for(let j=i+1;j<land.length;j++)assert.ok(Math.hypot(land[i].x-land[j].x,land[i].z-land[j].z)>land[i].radius+land[j].radius+7.99,land[i].id+'/'+land[j].id);for(let i=0;i<map.BOT_BASES.length;i++)for(let j=i+1;j<map.BOT_BASES.length;j++)assert.ok(Math.hypot(map.BOT_BASES[i].x-map.BOT_BASES[j].x,map.BOT_BASES[i].z-map.BOT_BASES[j].z)>=15.999);}
});
