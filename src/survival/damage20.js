import {wetMaterial12} from './materials12.js';
import * as THREE from 'three';
import {TIERS} from './state.js';
const fragment=`
 vec2 wearP20=vWearPoint20.xy+vWearPoint20.z*vec2(.31,.17);
 float fissure20=min(abs(wearP20.x-.24*sin(wearP20.y*5.)-.08*sin(wearP20.y*17.)),abs(wearP20.x+wearP20.y*.57-.7+.06*sin(wearP20.y*23.)));
 float crack20=(1.-smoothstep(.012,.044,fissure20))*smoothstep(.12,.62,vWear20);
 float radius20=pow(smoothstep(.2,1.,vWear20),.65)*1.65;
 float rough20=.045*sin(wearP20.x*43.+wearP20.y*13.)*sin(wearP20.y*37.);
 float hole20=min(length(wearP20-vec2(.38,1.32)),length(wearP20-vec2(-.67,2.10))*.9)+rough20;
 if(vWear20>.35&&hole20<radius20)discard;
`;
function shader20(shader,instanced,uniform,depth=false){
 shader.vertexShader=(instanced?'attribute float wear20;':'uniform float wear20;')+'varying float vWear20;varying vec3 vWearPoint20;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWear20=wear20;vWearPoint20=position;');
 shader.fragmentShader='varying float vWear20;varying vec3 vWearPoint20;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n'+fragment+(depth?'':'\ndiffuseColor.rgb*=1.-crack20*.78;diffuseColor.rgb*=1.-vWear20*.19;'));
 if(!instanced)shader.uniforms.wear20=uniform;
}
export function wearMaterial20(source,instanced=false,w=null){const mat=source.clone(),old=source.userData.baseCompile12||source.onBeforeCompile,u={value:0},key=source.userData.baseKey12||source.customProgramCacheKey();delete mat.userData.baseKey12;delete mat.userData.baseCompile12;mat.userData.wear20=u;mat.onBeforeCompile=shader=>{old.call(mat,shader);shader20(shader,instanced,u);};mat.customProgramCacheKey=()=>key+'-wear20-'+instanced;if(w)wetMaterial12(w,mat);return mat;}
function depth20(instanced,u){const d=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});d.onBeforeCompile=s=>shader20(s,instanced,u,true);d.customProgramCacheKey=()=> 'wear-depth20-'+instanced;return d;}
export function updateWear20(w,state){
 const batches=new Set();for(const e of [...w.built.values(),...w.staticStructures]){
  if(!['wall','halfWall','door','doorway','roof','triangleRoof','roofSlope'].includes(e.data.kind))continue;
  const hp=e.data.owner?(state.structureDamage[e.data.id]??e.data.hp):e.data.hp,amount=1-Math.max(0,Math.min(1,hp/TIERS[e.data.tier].hp));
  if(e.batch){const b=e.batch;if(!b.userData.wear20){b.geometry=b.geometry.clone();b.geometry.setAttribute('wear20',new THREE.InstancedBufferAttribute(new Float32Array(b.count),1));b.material=wearMaterial20(b.material,true,w);b.customDepthMaterial=depth20(true,null);b.userData.wear20=true;}const attr=b.geometry.attributes.wear20;attr.setX(e.instance,amount);batches.add(b);}
  // Door pivots are real meshes in addition to their frame instance.
  if(!e.batch||e.data.kind==='door')e.model.traverse(m=>{if(!m.isMesh||m.isInstancedMesh)return;const list=Array.isArray(m.material)?m.material:[m.material];if(list.some(mat=>!mat.userData.wear20)){const materials=list.map(mat=>wearMaterial20(mat,false,w));m.material=Array.isArray(m.material)?materials:materials[0];m.customDepthMaterial?.dispose();m.customDepthMaterial=depth20(false,materials[0].userData.wear20);m.userData.wear20=true;}for(const mat of(Array.isArray(m.material)?m.material:[m.material]))mat.userData.wear20.value=amount;});
 }
 for(const b of batches)b.geometry.attributes.wear20.needsUpdate=true;
}
export function installDamage20(World){const update=World.prototype.update,sync=World.prototype.syncState,decay=World.prototype.syncDecay;World.prototype.syncState=function(state){sync.call(this,state);updateWear20(this,state);};World.prototype.syncDecay=function(state){decay.call(this,state);updateWear20(this,state);};World.prototype.update=function(dt,state,playing,...args){update.call(this,dt,state,playing,...args);if(playing&&(this.wearAt20??0)<this.time){this.wearAt20=this.time+.2;updateWear20(this,state);}};}
