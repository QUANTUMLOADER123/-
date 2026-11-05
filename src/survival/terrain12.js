import * as THREE from 'three';
import {visualState12} from './materials12.js';
/** World-space material blending; it never displaces or replaces the shared physics terrain. */
export function terrainMaterial12(w){
 const t=w.textures,u=visualState12(w),m=new THREE.MeshStandardMaterial({map:t['ground39/loam-color.webp'],normalMap:t['ground39/loam-normal.webp'],roughness:1,metalness:0});m.userData.terrain12=true;
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{soil12:{value:t['ground39/loam-color.webp']},soilN12:{value:t['ground39/loam-normal.webp']},sand12:{value:t['sand.jpg']},rock12:{value:t['nature33/granite-color.webp']},rockN12:{value:t['nature33/granite-normal.webp']},orm12:{value:t['pbr12/soil-orm.webp']},meadow34:{value:t['ground39/turf-color.webp']},meadowN34:{value:t['ground39/turf-normal.webp']},gravel34:{value:t['field34/gravel-color.webp']},gravelN34:{value:t['field34/gravel-normal.webp']},wetness12:u.wet,terrainDetail12:{value:w.settings.detailMaps28===0?0:w.settings.quality==='low'?.35:.65}});
  s.vertexShader='attribute float snow;varying float biome12;varying vec3 ground12;varying vec3 groundNormal12;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
 biome12=snow;ground12=(modelMatrix*vec4(transformed,1.)).xyz;groundNormal12=normalize(mat3(modelMatrix)*normal);`);
  s.fragmentShader=`uniform sampler2D meadow34;uniform sampler2D meadowN34;uniform sampler2D gravel34;uniform sampler2D gravelN34;uniform sampler2D soil12;uniform sampler2D soilN12;uniform sampler2D sand12;uniform sampler2D rock12;uniform sampler2D rockN12;uniform sampler2D orm12;uniform float wetness12;uniform float terrainDetail12;varying float biome12;varying vec3 ground12;varying vec3 groundNormal12;
 mat3 terrainFrame32(vec3 eye,vec3 n,vec2 uv){vec3 a=dFdx(eye),b=dFdy(eye),bp=cross(b,n),ap=cross(n,a);vec2 u=dFdx(uv),v=dFdy(uv);vec3 t=bp*u.x+ap*v.x,bt=bp*u.y+ap*v.y;float scale=inversesqrt(max(1e-12,max(dot(t,t),dot(bt,bt))));return mat3(t*scale,bt*scale,n);}
 float hashGround12(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float macroGround12(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hashGround12(i),hashGround12(i+vec2(1,0)),f.x),mix(hashGround12(i+vec2(0,1)),hashGround12(i+vec2(1,1)),f.x),f.y);}
 `+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
 vec3 weights12=pow(abs(normalize(groundNormal12)),vec3(4.));weights12/=max(.0001,weights12.x+weights12.y+weights12.z);
 vec2 uvSoil12=ground12.xz*.625,uvStone12=ground12.xz*.22;
 float macro12=macroGround12(ground12.xz*.035);
 float slope12=smoothstep(.14,.52,1.-normalize(groundNormal12).y);
 float sandWeight12=max(1.-smoothstep(.65,2.8,ground12.y),smoothstep(.1,.7,-biome12))*(1.-slope12*.85);
 float rockWeight12=clamp(slope12+smoothstep(.72,.93,macro12)*.22,0.,1.);
 float snowWeight12=smoothstep(.3,.85,biome12)*smoothstep(.35,.85,normalize(groundNormal12).y);
 // Fine-scale original loam/turf, blended by continuous metre-scale macro patches.
 vec3 soilColor12=texture2D(soil12,uvSoil12).rgb;
 float meadow19=(1.-smoothstep(.05,.45,abs(biome12)))*(1.-slope12)*smoothstep(1.5,4.,ground12.y);
 float turf34=meadow19*mix(.36,.96,smoothstep(.18,.76,macroGround12(ground12.xz*.085+vec2(37.,-21.))));
 vec2 turfUV39=mat2(.8,-.6,.6,.8)*ground12.xz*.625;
 vec3 turfColor34=texture2D(meadow34,turfUV39).rgb;
 soilColor12=mix(soilColor12,turfColor34,turf34);
 vec3 stoneColor12=texture2D(rock12,uvStone12).rgb;
 if(terrainDetail12>.5)stoneColor12=texture2D(rock12,ground12.zy*.22).rgb*weights12.x+stoneColor12*weights12.y+texture2D(rock12,ground12.xy*.22).rgb*weights12.z;
 vec3 sandColor12=texture2D(sand12,ground12.xz*.23).rgb*vec3(1.,.94,.80);
 vec3 groundColor12=mix(soilColor12,stoneColor12,rockWeight12);groundColor12=mix(groundColor12,sandColor12,sandWeight12);
 vec3 snowColor12=vec3(.77,.84,.88)*(.92+macroGround12(ground12.xz*3.)*.12);
 groundColor12=mix(groundColor12,snowColor12,snowWeight12);
 groundColor12*=.88+macro12*.24;groundColor12*=1.-wetness12*.23*(1.-snowWeight12);
 diffuseColor.rgb*=groundColor12;
 `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`
 vec3 mapNormal12=vec3(0.,0.,1.);
 if(terrainDetail12>0.){
 vec3 soilNormal12=texture2D(soilN12,uvSoil12).xyz*2.-1.;
 vec3 turfNormal39=texture2D(meadowN34,turfUV39).xyz*2.-1.;
 turfNormal39.xy=mat2(.8,.6,-.6,.8)*turfNormal39.xy;
 soilNormal12=mix(soilNormal12,turfNormal39,turf34);
 vec3 rockNormal12=texture2D(rockN12,uvStone12).xyz*2.-1.;
 mapNormal12=normalize(mix(soilNormal12,rockNormal12,rockWeight12));
 float distanceFade12=1.-smoothstep(32.,100.,length(vViewPosition));mapNormal12.xy*=terrainDetail12*distanceFade12*(1.-snowWeight12*.6);
 }
 normal=normalize(terrainFrame32(-vViewPosition,normal,ground12.xz)*mapNormal12);
 `);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 float r12=.94;
 roughnessFactor=mix(clamp(r12,.72,1.),.36,wetness12*(1.-snowWeight12)*(.5+macro12*.5));
 `);
 };
 m.customProgramCacheKey=()=> 'terrain39-original-fine-turf-loam-cheaper-biome';return m;
}
