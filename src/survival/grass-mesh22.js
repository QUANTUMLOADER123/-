import * as THREE from 'three';
import {visualState12} from './materials12.js';
/** Opaque folded ribbons: real silhouette, no grass-card texture/alpha overdraw. */
export function grassGeometry22(blades,folded=true){
 const positions=[],indices=[],uv=[];
 for(let b=0;b<blades;b++){
  const angle=b*2.399963,dx=Math.cos(angle),dz=Math.sin(angle),sx=-dz,sz=dx,root=.09+(b%3)*.055,height=.28+(b%4)*.085,width=.024+(b%3)*.008,bend=.10+(b%4)*.032,start=positions.length/3,levels=folded?[0,.48,.82]:[0,.58],across=folded?[-1,0,1]:[-1,1];
  for(const t of levels)for(const side of across){const w=width*(1-t*.88),ridge=folded&&side===0?width*.30:0;positions.push(dx*root+sx*w*side+dx*bend*t*t,height*t+ridge,dz*root+sz*w*side+dz*bend*t*t);uv.push((side+1)/2,t);}
  const columns=across.length;for(let row=0;row<levels.length-1;row++)for(let c=0;c<columns-1;c++){const i=start+row*columns+c;indices.push(i,i+1,i+columns,i+1,i+columns+1,i+columns);}
  const tip=positions.length/3;positions.push(dx*(root+bend),height,dz*(root+bend));uv.push(.5,1);const last=start+(levels.length-1)*columns;for(let c=0;c<columns-1;c++)indices.push(last+c,last+c+1,tip);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}
export function grassMaterial22(w,uniforms,far=false){
 const material=new THREE.MeshStandardMaterial({name:far?'Grass22 distant ribbons':'Grass22 folded blades',color:0xffffff,side:THREE.DoubleSide,roughness:1,metalness:0});material.userData.grass22=true;
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{grassEye22:uniforms.eye,grassTime22:uniforms.time,grassLod22:uniforms.lod,grassRange22:uniforms.range,grassWind22:visualState12(w).wind,grassWet22:visualState12(w).wet,grassDay22:visualState12(w).day,grassSun22:{value:w.sunDirection}});
  shader.vertexShader=`uniform vec3 grassEye22;uniform float grassTime22;uniform vec2 grassLod22;uniform float grassRange22;uniform vec2 grassWind22;varying float grassBlade22;varying float grassDistance22;\n`+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec3 root22=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 float distance22=length(root22.xz-grassEye22.xz);grassDistance22=distance22;grassBlade22=uv.y;
 float phase22=root22.x*.63+root22.z*.39;
 float gust22=.6+.4*sin(grassTime22*.49+root22.x*.045+root22.z*.061);
 float sway22=sin(grassTime22*1.65+phase22)*.075+sin(grassTime22*3.1+phase22*1.9)*.018;
 float press22=1.-smoothstep(.20,.82,distance22);
 vec2 away22=(root22.xz-grassEye22.xz)/max(distance22,.12);
 // Transform world-space pressure back into each slope-aligned tuft's local axes.
 mat3 frame22=mat3(modelMatrix*instanceMatrix);
 vec3 push22=vec3(grassWind22.x,0.,grassWind22.y)*sway22*gust22*uv.y*uv.y+vec3(away22.x,0.,away22.y)*press22*.15*uv.y;
 transformed+=vec3(dot(push22,frame22[0])/max(dot(frame22[0],frame22[0]),.01),dot(push22,frame22[1])/max(dot(frame22[1],frame22[1]),.01),dot(push22,frame22[2])/max(dot(frame22[2],frame22[2]),.01));
 transformed.y*=1.-press22*.24;
 float end22=1.-smoothstep(grassRange22-18.,grassRange22-2.,distance22);
 transformed*=end22;
 `);
  shader.fragmentShader=`uniform vec2 grassLod22;uniform float grassRange22;uniform float grassWet22;uniform float grassDay22;uniform vec3 grassSun22;varying float grassBlade22;varying float grassDistance22;\n`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
 if(grassDistance22>=grassRange22-1.)discard;
 float blend22=smoothstep(grassLod22.x,grassLod22.y,grassDistance22);
 vec2 pixel22=mod(floor(gl_FragCoord.xy),4.);
 float pattern22=(4.*(mod(pixel22.x,2.)*2.+mod(pixel22.y,2.))+floor(pixel22.x/2.)*2.+floor(pixel22.y/2.)+.5)/16.;
 ${far?'if(pattern22>=blend22)discard;':'if(pattern22<blend22)discard;'}
 `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 diffuseColor.rgb*=mix(vec3(.48,.59,.34),vec3(1.10,1.12,.81),smoothstep(0.,1.,grassBlade22));
 diffuseColor.rgb*=1.-grassWet22*.13;
 `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 vec3 sun22=normalize((viewMatrix*vec4(grassSun22,0.)).xyz);
 float transmission22=pow(max(0.,dot(normalize(vViewPosition),-sun22)),3.);
 reflectedLight.indirectDiffuse+=diffuseColor.rgb*transmission22*grassBlade22*grassDay22*.19;
 `);
 };
 material.customProgramCacheKey=()=> 'grass22-folded-wind-pressure-lod-'+far;return material;
}
