import * as THREE from 'three';
import {visualState12} from './materials12.js';
/** Wide, curved low tufts; opaque indexed silhouettes, no alpha cards or PBR maps. */
export function grassGeometry39(blades=8,far=false){
 const p=[],uv=[],n=[],ix=[];
 for(let b=0;b<blades;b++){const a=b*2.399963,c=Math.cos(a),s=Math.sin(a),root=.12+(b%4)*.065,h=.23+(b%5)*.045,width=.019+(b%3)*.007,bend=.12+(b%4)*.045,start=p.length/3,rows=far?[0]:[0,.54];
  for(const t of rows)for(const side of[-1,1]){const w=width*(1-t*.66);p.push(c*(root+bend*t*t)-s*w*side,h*t,s*(root+bend*t*t)+c*w*side);uv.push((side+1)/2,t);n.push(-s*.7,.55,c*.7);}
  const tip=p.length/3;p.push(c*(root+bend),h,s*(root+bend));uv.push(.5,1);n.push(-s*.7,.55,c*.7);
  if(!far)ix.push(start,start+1,start+2,start+1,start+3,start+2);const last=start+(rows.length-1)*2;ix.push(last,last+1,tip);
 }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setIndex(ix);g.computeBoundingSphere();return g;
}
export function grassMaterial39(w,u,far=false){
 const m=new THREE.MeshLambertMaterial({name:far?'Grass39 far single triangles':'Grass39 curved meadow tufts',color:0xffffff,side:THREE.DoubleSide});m.userData.grass22=true;m.userData.grass39=true;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,{eye39:u.eye,time39:u.time,lod39:u.lod,range39:u.range,wind39:visualState12(w).wind,day39:visualState12(w).day,wet39:visualState12(w).wet});
  s.vertexShader='uniform vec3 eye39;uniform float time39;uniform vec2 lod39;uniform float range39;uniform vec2 wind39;varying float blade39;varying float distance39;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec3 root39=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;distance39=length(root39.xz-eye39.xz);blade39=uv.y;
 float phase39=root39.x*.61+root39.z*.39;
 float sway39=sin(time39*1.65+phase39)*.065+sin(time39*.57+phase39*.3)*.026;
 vec2 pressure39=(root39.xz-eye39.xz)/max(distance39,.12)*(1.-smoothstep(.18,.8,distance39))*.13;
 mat3 frame39=mat3(modelMatrix*instanceMatrix);vec3 push39=vec3(wind39.x*sway39+pressure39.x,0.,wind39.y*sway39+pressure39.y)*uv.y*uv.y;
 transformed+=vec3(dot(push39,frame39[0])/max(dot(frame39[0],frame39[0]),.01),0.,dot(push39,frame39[2])/max(dot(frame39[2],frame39[2]),.01));
 transformed*=1.-smoothstep(range39-7.,range39,distance39);
 `);
  s.fragmentShader='uniform vec2 lod39;uniform float range39;uniform float day39;uniform float wet39;varying float blade39;varying float distance39;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
 if(distance39>=range39)discard;
 float blend39=smoothstep(lod39.x,lod39.y,distance39);
 vec2 pixel39=mod(floor(gl_FragCoord.xy),4.);float dither39=(4.*(mod(pixel39.x,2.)*2.+mod(pixel39.y,2.))+floor(pixel39.x/2.)*2.+floor(pixel39.y/2.)+.5)/16.;
 ${far?'if(dither39>=blend39)discard;':'if(dither39<blend39)discard;'}
 `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal*=faceDirection;');
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 diffuseColor.rgb*=mix(vec3(.65,.69,.43),vec3(1.14,1.12,.79),smoothstep(0.,1.,blade39));diffuseColor.rgb*=1.-wet39*.12;
 `);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse+=diffuseColor.rgb*blade39*day39*.065;');
 };m.customProgramCacheKey=()=> 'grass39-opaque-lambert-two-batches-'+far;return m;
}
