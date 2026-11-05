import * as THREE from 'three';
import {PBR_FILES12} from '../src/survival/materials12.js';
import {weaponModel16,ITEM_FILES16,itemTextures16} from '../src/survival/items16.js';
import {WEAPONS} from '../src/survival/catalog.js';
import {GUN_POSES14} from '../src/survival/pose14.js';
import {prepareReload14,resetMechanisms14,reloadPose14,fireMechanism14} from '../src/survival/reload14.js';
import {createHand14,handMaterials14,poseHand14} from '../src/survival/rig14.js';
export async function renderWeapons33({hands=false,page=0}={}){
 const loader=new THREE.TextureLoader(),textures={};await Promise.all([...ITEM_FILES16,...PBR_FILES12.filter(n=>n.startsWith('field34/'))].map(async name=>{const t=await loader.loadAsync('/assets/'+name);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(!/-(normal|orm)\./.test(name))t.colorSpace=THREE.SRGBColorSpace;textures[name]=t;}));itemTextures16(textures);
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#202827';const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1600,900);renderer.setPixelRatio(1);renderer.setClearColor(0x202827);document.body.append(renderer.domElement);renderer.setScissorTest(true);const result=[];const mats=hands?handMaterials14():null;
 const ids=Object.keys(WEAPONS).slice(page*8,page*8+8);
 for(let i=0;i<ids.length;i++){const id=ids[i],p=GUN_POSES14[id],scene=new THREE.Scene(),m=weaponModel16(id);scene.add(m,new THREE.HemisphereLight(0xe5f1ff,0x64614e,2.2));const light=new THREE.DirectionalLight(0xffeedc,3.3);light.position.set(1.2,3,-1);scene.add(light);const fill=new THREE.DirectionalLight(0xffffff,1);fill.position.set(-1,.5,1);scene.add(fill);
  let meshes=0,triangles=0;m.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});prepareReload14(m,id);for(const t of [0,.25,.5,.75,1]){resetMechanisms14(m);const pose=reloadPose14(m,id,t);if(![...pose.right.toArray(),...pose.left.toArray()].every(Number.isFinite))throw new Error(id+' reload pose');}resetMechanisms14(m);fireMechanism14(m,id,2);
  if(hands){for(const side of [1,-1]){const h=createHand14(side,mats);h.position.copy(side===1?p.right:p.left);h.quaternion.copy(side===1?p.rightQ:p.leftQ);poseHand14(h,side===1?.97:.92,side===1?.4:.9,0,1);scene.add(h);}}
  const camera=new THREE.PerspectiveCamera(34,400/450,.01,12);camera.layers.enable(1);camera.position.set(hands?.72:1.1,hands?.45:.65,hands?-.88:-1.1);camera.lookAt(0,.05,-.18);const x=i%4*400,y=450-Math.floor(i/4)*450;renderer.setViewport(x,y,400,450);renderer.setScissor(x,y,400,450);renderer.render(scene,camera);const label=document.createElement('div');label.textContent=id;label.style.cssText=`position:absolute;left:${x+12}px;top:${Math.floor(i/4)*450+12}px;color:#dae3d8;font:18px monospace`;document.body.append(label);result.push({id,meshes,triangles,muzzle:m.userData.muzzle16});
 }
 return result;
}
