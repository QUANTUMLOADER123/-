import * as THREE from 'three';
import {visualState12} from './materials12.js';
function windShader12(w,shader,height){
 const u=visualState12(w);Object.assign(shader.uniforms,{treeTime12:u.time,treeWind12:u.wind});
 shader.vertexShader=`uniform float treeTime12;uniform vec2 treeWind12;\n`+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 #ifdef USE_INSTANCING
 vec3 root12=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 float crown12=pow(clamp(position.y/${height.toFixed(4)},0.,1.),2.);
 float sway12=sin(treeTime12*1.1+root12.x*.19+root12.z*.13)*.12+sin(treeTime12*2.3+root12.z*.27)*.035;
 transformed.xz+=treeWind12*crown12*sway12;
 #endif`);
}
export function treeMaterial12(w,src,geometry,height){
 const mat=src.material.clone(),name=(mat.name+' '+src.name).toLowerCase();
 const leaf=/green|leaf|leaves|snow/.test(name)||mat.color.g>mat.color.r*1.08;
 mat.roughness=leaf?.86:.93;mat.userData.tree12=true;
 if(leaf){
  mat.side=THREE.DoubleSide;mat.color.multiplyScalar(1.12);
  mat.onBeforeCompile=shader=>{
   windShader12(w,shader,height);Object.assign(shader.uniforms,{treeSun12:{value:w.sunDirection},treeDay12:visualState12(w).day});
   shader.fragmentShader='uniform vec3 treeSun12;uniform float treeDay12;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 vec3 sunView12=normalize((viewMatrix*vec4(treeSun12,0.)).xyz);
 float transmission12=pow(max(0.,dot(normalize(vViewPosition),-sunView12)),4.);
 reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.30,.39,.15)*transmission12*treeDay12*.4;`);
  };
 }else if(mat.userData.authoredBark19){mat.onBeforeCompile=s=>windShader12(w,s,height);
 }else{
  // Quaternius trunk meshes have no UVs: author cylindrical bark UVs and unwrap seam triangles.
  if(geometry.index){const expanded=geometry.toNonIndexed();geometry.dispose();geometry=expanded;}
  const p=geometry.attributes.position,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){uv[i*2]=Math.atan2(p.getZ(i),p.getX(i))/(Math.PI*2)+.5;uv[i*2+1]=p.getY(i)*.42;}
  for(let i=0;i<p.count;i+=3){const us=[uv[i*2],uv[(i+1)*2],uv[(i+2)*2]];if(Math.max(...us)-Math.min(...us)>.5)for(let j=0;j<3;j++)if(uv[(i+j)*2]<.5)uv[(i+j)*2]+=1;}
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));mat.map=w.textures['BroadleafBark.jpg'];mat.normalMap=w.textures['BroadleafBark_Normal.png'];mat.normalScale.set(.35,.35);mat.color.setHex(0xd8d2c3);mat.onBeforeCompile=s=>windShader12(w,s,height);
 }
 mat.customProgramCacheKey=()=> 'tree12-'+(leaf?'transmission':'bark')+'-'+height;
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:mat.side,map:mat.map,alphaMap:mat.alphaMap,alphaTest:mat.alphaTest});depth.onBeforeCompile=s=>windShader12(w,s,height);depth.customProgramCacheKey=()=> 'tree-shadow19-'+(leaf?'leaf':'bark')+'-'+height;
 return{material:mat,geometry,depth};
}
