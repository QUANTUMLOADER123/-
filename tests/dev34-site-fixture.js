import * as THREE from 'three';
import {Site17,siteMaterials17} from '../src/survival/site-kit17.js';
import {PBR_FILES12} from '../src/survival/materials12.js';
import {ITEM_FILES16,itemTextures16} from '../src/survival/items16.js';
import {installSurfaceTextures12} from '../src/survival/surface05.js';
import {configureMap,MONUMENTS} from '../src/survival/map-data.js';
import {buildLand34,dressOffshore34} from '../src/survival/sites34.js';
import {oilrig31} from '../src/survival/oilrig31.js';
import {ensureRecycler33} from '../src/survival/recyclers33.js';
let fixture;
export async function renderSites34(page=0){
 if(!fixture){const loader=new THREE.TextureLoader(),textures={};await Promise.all([...PBR_FILES12,...ITEM_FILES16].map(async f=>{const t=await loader.loadAsync('/assets/'+f);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(!/-(normal|orm)\./.test(f))t.colorSpace=THREE.SRGBColorSpace;textures[f]=t;}));itemTextures16(textures);installSurfaceTextures12(textures);configureMap('small',27182,16);const w={scene:new THREE.Scene(),textures,settings:{quality:'medium',detailMaps28:1},distantGroups:[],colliders:[],walkFloors:[],occluders:[],interactables:[]},p=siteMaterials17(w);for(const m of MONUMENTS){const k=new Site17(w,m,p);if(m.kind==='oilrig'){oilrig31(k,m.id==='oil-large');dressOffshore34(k);}else buildLand34(k);ensureRecycler33(k);k.finish();}fixture={w,roots:w.distantGroups.map(x=>x.root)};}
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#273230';const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1600,1000);renderer.setClearColor(0x273230);renderer.setScissorTest(true);document.body.append(renderer.domElement);const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xe6eff5,0x6e684f,2.3));const key=new THREE.DirectionalLight(0xffedce,3.2);key.position.set(-80,100,50);scene.add(key);const stats=[];
 for(let i=0;i<4;i++){const index=page*4+i,root=fixture.roots[index];if(!root)continue;scene.add(root);root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),span=Math.max(size.x,size.z,size.y)*1.05;const camera=new THREE.PerspectiveCamera(40,800/500,.1,2200);camera.position.copy(center).add(new THREE.Vector3(span*.92,span*.78,span*1.25));camera.lookAt(center);const x=i%2*800,y=500-Math.floor(i/2)*500;renderer.setViewport(x,y,800,500);renderer.setScissor(x,y,800,500);renderer.render(scene,camera);scene.remove(root);stats.push({id:root.userData.site17,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls});const label=document.createElement('div');label.textContent=root.userData.site17+' / DEV34';label.style.cssText=`position:absolute;left:${x+16}px;top:${Math.floor(i/2)*500+16}px;color:#e5e7db;font:18px monospace`;document.body.append(label);}
 renderer.dispose();return stats;
}
