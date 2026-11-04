import * as THREE from 'three';
export const PBR_KINDS12=['wood','stone','metal','concrete','soil','asphalt'];
export const PBR_FILES12=PBR_KINDS12.flatMap(k=>['color','normal','orm'].map(m=>'pbr12/'+k+'-'+m+'.webp'));
export function visualState12(w){
 if(w.visual12)return w.visual12;
 const roof=new THREE.DataTexture(new Float32Array([-100]),1,1,THREE.RedFormat,THREE.FloatType);roof.needsUpdate=true;
 return w.visual12={wet:{value:0},time:{value:0},day:{value:1},wind:{value:new THREE.Vector2(.65,.22)},roof:{value:roof},roofOrigin:{value:new THREE.Vector2()},roofSpan:{value:48},materials:new WeakSet(),defaultRoof:roof};
}
export function pbrMaterial12(w,kind,options={}){
 const t=w.textures,p='pbr12/'+kind+'-',m=new THREE.MeshStandardMaterial({map:t[p+'color.webp'],normalMap:t[p+'normal.webp'],roughnessMap:t[p+'orm.webp'],aoMap:t[p+'orm.webp'],aoMapIntensity:.32,metalnessMap:kind==='metal'?t[p+'orm.webp']:null,roughness:1,metalness:kind==='metal'?.9:0,color:0xffffff,...options});
 m.normalScale.set(kind==='stone'?.65:.42,kind==='stone'?.65:.42);m.userData.kind12=kind;wetMaterial12(w,m);return m;
}
export function bindPBR12(w,m,kind){
 const p='pbr12/'+kind+'-',t=w.textures;if(!t[p+'color.webp'])return;
 m.map=t[p+'color.webp'];m.normalMap=t[p+'normal.webp'];m.roughnessMap=m.aoMap=t[p+'orm.webp'];m.aoMapIntensity=.28;m.metalnessMap=kind==='metal'?t[p+'orm.webp']:null;m.metalness=kind==='metal'?.8:0;m.roughness=1;m.normalScale??=new THREE.Vector2();m.normalScale.set(.45,.45);m.userData.kind12=kind;m.needsUpdate=true;wetMaterial12(w,m);
}
export function wetMaterial12(w,m){
 if(!m.isMeshStandardMaterial||m.transparent||m.userData.terrain12||m.userData.grass22)return;
 const u=visualState12(w);if(u.materials.has(m))return;u.materials.add(m);
 // Rebinding a globally cached prop in a new world must not retain the disposed world's uniforms.
 m.userData.baseKey12??=m.customProgramCacheKey();const base=m.userData.baseCompile12||m.onBeforeCompile;m.userData.baseCompile12=base;
 m.onBeforeCompile=shader=>{
  base?.call(m,shader);Object.assign(shader.uniforms,{wetness12:u.wet,weatherTime12:u.time,roofHeight12:u.roof,roofOrigin12:u.roofOrigin,roofSpan12:u.roofSpan});
  shader.vertexShader='varying vec3 vSurface12;varying vec3 vSurfaceN12;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
 vec4 surface12=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 surface12=instanceMatrix*surface12;
 #endif
 vSurface12=(modelMatrix*surface12).xyz;vSurfaceN12=inverseTransformDirection(transformedNormal,viewMatrix);`);
  shader.fragmentShader='uniform float wetness12;uniform float weatherTime12;uniform sampler2D roofHeight12;uniform vec2 roofOrigin12;uniform float roofSpan12;varying vec3 vSurface12;varying vec3 vSurfaceN12;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 vec2 roofUV12=(vSurface12.xz+normalize(vSurfaceN12).xz*.45-roofOrigin12)/roofSpan12+.5;
 float roofTop12=texture2D(roofHeight12,clamp(roofUV12,0.,1.)).r;
 float inRoofGrid12=step(0.,roofUV12.x)*step(0.,roofUV12.y)*step(roofUV12.x,1.)*step(roofUV12.y,1.);
 float exposed12=1.-inRoofGrid12*step(vSurface12.y+.5,roofTop12);
 float up12=smoothstep(.05,.8,normalize(vSurfaceN12).y);
 float patch12=.5+.5*sin(vSurface12.x*1.71+sin(vSurface12.z*2.23))*sin(vSurface12.z*.71+vSurface12.x*.43);
 float wet12=wetness12*exposed12*(.25+.75*up12);
 diffuseColor.rgb*=1.-wet12*.21;
 roughnessFactor=mix(roughnessFactor,max(.15,roughnessFactor*.27),wet12*(.65+.35*patch12));`);
 };
 m.customProgramCacheKey=()=> 'wet-surface12-'+(m.userData.kind12||'generic')+'-'+m.userData.baseKey12;m.needsUpdate=true;
}
export function dressMaterials12(w,root=w.scene){
 const known=new Map();for(const k of PBR_KINDS12){const tex=w.textures['pbr12/'+k+'-color.webp'];if(tex){tex.userData.kind12=k;known.set(tex,k);}}
 root.traverse(o=>{if(!o.isMesh||o.layers.mask===2)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(!m?.isMeshStandardMaterial||m.userData.terrain12||m.userData.grass22)continue;
  const kind=m.userData.kind12||m.map?.userData.kind12||known.get(m.map);if(PBR_KINDS12.includes(kind)&&(m.map!==w.textures['pbr12/'+kind+'-color.webp']||m.normalMap!==w.textures['pbr12/'+kind+'-normal.webp']))bindPBR12(w,m,kind);else wetMaterial12(w,m);
 }});
}
