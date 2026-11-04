import * as THREE from 'three';
import {WORLD_RADIUS,terrainHeight} from './state.js';
import {paintLoading11,checkLoading11} from './loading11.js';
const seaLevel12=.08;
export function waterMaterial12(w,river=false){
 const m=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,forceSinglePass:true,fog:true,uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),time:{value:0},daylight:{value:1},skyColor:{value:new THREE.Color(0xa9c9e7)},sunDirection:{value:w.sunDirection},rain12:{value:0},height12:{value:w.waterBed12},mapSpan12:{value:WORLD_RADIUS*2.15},heightTexel12:{value:1/512},river12:{value:river?1:0},reflection12:{value:w.reflection12?.target.texture||w.waterBed12},reflectionMatrix12:{value:new THREE.Matrix4()},reflectionReady12:{value:0}},vertexShader:`
#include <fog_pars_vertex>
varying vec3 vWater12;varying vec4 vReflect12;uniform mat4 reflectionMatrix12;void main(){vec4 world=modelMatrix*vec4(position,1.);vWater12=world.xyz;vReflect12=reflectionMatrix12*world;vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,fragmentShader:`
 #include <fog_pars_fragment>
 uniform float time;uniform float daylight;uniform vec3 skyColor;uniform vec3 sunDirection;uniform float rain12;uniform sampler2D height12;uniform float mapSpan12;uniform float heightTexel12;uniform float river12;uniform sampler2D reflection12;uniform float reflectionReady12;varying vec3 vWater12;varying vec4 vReflect12;
 float bedHeight12(vec2 uv){vec2 p=clamp(uv,0.,1.)/heightTexel12-.5;vec2 f=fract(p),b=(floor(p)+.5)*heightTexel12;return mix(mix(texture2D(height12,b).r,texture2D(height12,b+vec2(heightTexel12,0.)).r,f.x),mix(texture2D(height12,b+vec2(0.,heightTexel12)).r,texture2D(height12,b+vec2(heightTexel12)).r,f.x),f.y);}
 void main(){
 vec2 uv=vWater12.xz/mapSpan12+.5;float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
 float bed=mix(-20.,bedHeight12(uv),inside);float depth=max(.02,vWater12.y-bed);
 // Terrain depth testing, not the approximate coastal tint field, determines the actual shoreline.
 vec2 p=vWater12.xz;float speed=1.+rain12*.7;
 vec2 slope=vec2(cos(p.x*.31+p.y*.17+time*.83*speed)*.045+cos(p.x*.87-p.y*.54+time*1.45)*.023,cos(p.x*.31+p.y*.17+time*.83*speed)*.027-cos(p.x*.87-p.y*.54+time*1.45)*.032);
 float near29=1.-smoothstep(35.,100.,distance(cameraPosition.xz,p));
 if(near29>.01)slope+=vec2(sin(p.x*3.7+p.y*2.1-time*2.2),cos(p.y*4.1-p.x*1.3+time*2.7))*.013*near29;
 if(rain12>.01&&near29>.01)slope+=vec2(sin(p.x*17.+time*8.),cos(p.y*19.-time*9.))*rain12*.016*near29;
 vec3 n=normalize(vec3(-slope.x,1.,-slope.y));if(!gl_FrontFacing)n=-n;
 vec3 view=normalize(cameraPosition-vWater12);float nv=max(dot(view,n),0.);float fresnel=.025+.975*pow(1.-nv,5.);
 vec3 reflected=reflect(-view,n);vec3 sky=mix(skyColor*.8,vec3(.13,.36,.63),smoothstep(0.,.8,reflected.y));sky*=daylight;
 if(river12<.5&&reflectionReady12>.5&&vReflect12.w>0.){vec2 ruv=vReflect12.xy/vReflect12.w*.5+.5;ruv+=slope*.016;float valid=step(.01,ruv.x)*step(ruv.x,.99)*step(.01,ruv.y)*step(ruv.y,.99);sky=mix(sky,texture2D(reflection12,clamp(ruv,.002,.998)).rgb,valid*clamp(1.-length(cameraPosition-vWater12)/180.,0.,.85));}
 vec3 shallow=vec3(.13,.32,.29),deep=vec3(.014,.075,.10);vec3 color=mix(shallow,deep,1.-exp(-depth*.22))*daylight;
 color=mix(color,sky,max(fresnel,.13));
 float spec=pow(max(dot(reflect(-normalize(sunDirection),n),view),0.),mix(240.,105.,rain12));color+=vec3(1.,.83,.59)*spec*2.1*daylight;
 float shore=(1.-smoothstep(.06,.9,depth))*inside*(1.-river12);float foamWave=.5+.5*sin(depth*17.-time*2.2+sin(p.x*.73+p.y*.91)*2.);
 float foam=shore*smoothstep(.38,.77,foamWave)*(.65+.35*sin(p.x*19.)*sin(p.y*23.));color=mix(color,vec3(.68,.80,.81)*daylight,foam*.72);
 float alpha=river12>.5?mix(.52,.94,1.-exp(-depth*.35)):clamp(mix(.46,.99,1.-exp(-depth*.55))+fresnel*.42,.46,1.);gl_FragColor=vec4(color,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 #include <fog_fragment>
 }`});
 return m;
}
export async function initWater12(w,signal){
 const size=512,span=WORLD_RADIUS*2.15,data=new Float32Array(size*size);
 for(let z=0;z<size;z++){if(z%16===0){await paintLoading11(signal);checkLoading11(signal);}for(let x=0;x<size;x++)data[z*size+x]=terrainHeight(((x+.5)/size-.5)*span,((z+.5)/size-.5)*span);}
 w.waterBed12=new THREE.DataTexture(data,size,size,THREE.RedFormat,THREE.FloatType);w.waterBed12.minFilter=w.waterBed12.magFilter=THREE.NearestFilter;w.waterBed12.needsUpdate=true;
 // Bilinear bed reconstruction in the shader avoids assuming Android float-filter extensions. This field affects colour/foam, not terrain or collision.
 const reflectionSize28=w.settings.reflection28||1;const target=new THREE.WebGLRenderTarget(reflectionSize28,reflectionSize28,{depthBuffer:true,type:THREE.UnsignedByteType});
 w.reflection12={target,camera:new THREE.PerspectiveCamera(),last:-1e5,rotation:new THREE.Quaternion(),position:new THREE.Vector3(1e5,1e5,1e5),matrix:new THREE.Matrix4(),clip:new THREE.Plane(new THREE.Vector3(0,1,0),-seaLevel12)};
 const old=w.ocean.material;w.ocean.material=waterMaterial12(w);old.dispose();w.ocean.name='Fresnel coastal water / depth tint / shoreline foam';
 if(w.river){const oldRiver=w.river.material;w.river.material=waterMaterial12(w,true);oldRiver.dispose();}
}
/** Sparse visibility estimate only gates the expensive mirror pass. Water itself
 * always renders with its sky fallback; a missed narrow inlet never disappears. */
function visibleSea29(w){const prev=w.seaWindow29,p=w.camera.position,now=w.time;if(prev&&now-prev.at<.4&&p.distanceToSquared(prev.position)<16&&w.camera.quaternion.angleTo(prev.rotation)<.09)return prev.visible;let visible=false;for(const y of[-.88,-.25])for(const x of[-.84,0,.84]){const ray=new THREE.Vector3(x,y,.5).unproject(w.camera).sub(p).normalize(),t=(seaLevel12-p.y)/ray.y;if(t<=0||t>600||Math.abs(ray.y)<.00001)continue;const end=p.clone().addScaledVector(ray,t);if(terrainHeight(end.x,end.z)>seaLevel12)continue;let blocked=false;for(const q of[.25,.5,.75]){const v=p.clone().addScaledVector(ray,t*q);if(terrainHeight(v.x,v.z)>v.y+.3){blocked=true;break;}}if(!blocked){visible=true;break;}}w.seaWindow29={at:now,position:p.clone(),rotation:w.camera.quaternion.clone(),visible};return visible;}
export function renderReflection12(w){
 const r=w.reflection12;if(!r)return;
 const active=(w.settings.reflection28??(w.settings.quality==='high'?512:0))>0&&w.camera.position.y>seaLevel12+.15&&w.camera.position.y<35&&!w.underwater07&&visibleSea29(w);
 w.ocean.material.uniforms.reflectionReady12.value=0;if(!active)return;
 const renderer=w.renderer;w.ocean.material.uniforms.reflectionReady12.value=1;
 const now=performance.now();if(now-r.last<1000/(w.settings.reflectionFps28||5))return;r.position.copy(w.camera.position);r.last=now;r.rotation.copy(w.camera.quaternion);

 const width=w.settings.reflection28||512,height=Math.max(128,Math.min(1024,Math.round(width/w.camera.aspect)));if(r.target.width!==width||r.target.height!==height)r.target.setSize(width,height);
 const c=r.camera;c.copy(w.camera,false);c.layers.set(0);c.position.copy(w.camera.position);c.position.y=2*seaLevel12-c.position.y;
 const dir=w.camera.getWorldDirection(new THREE.Vector3());dir.y=-dir.y;c.up.set(0,1,0).applyQuaternion(w.camera.quaternion).reflect(new THREE.Vector3(0,1,0)).negate();c.lookAt(c.position.clone().add(dir));c.updateMatrixWorld();c.matrixWorldInverse.copy(c.matrixWorld).invert();
 r.matrix.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);w.ocean.material.uniforms.reflectionMatrix12.value.copy(r.matrix);
 const fine29=[...(w.grassChunks||[]).map(c=>c.mesh),...(w.treeBatches||[]).filter(m=>m.userData.understory19),...[...(w.biomeLife23?.tiles.values()||[])].flatMap(t=>t.meshes)],hidden=[w.ocean,w.river,w.rain12?.mesh,w.rain12?.splashes,...fine29].filter(Boolean),vis=hidden.map(o=>o.visible),target=renderer.getRenderTarget(),clip=renderer.clippingPlanes,shadows=renderer.shadowMap.autoUpdate,autoClear=renderer.autoClear;
 try{hidden.forEach(o=>o.visible=false);renderer.clippingPlanes=[r.clip];renderer.shadowMap.autoUpdate=false;renderer.autoClear=true;renderer.setRenderTarget(r.target);renderer.clear();renderer.render(w.scene,c);}
 finally{hidden.forEach((o,i)=>o.visible=vis[i]);renderer.clippingPlanes=clip;renderer.shadowMap.autoUpdate=shadows;renderer.autoClear=autoClear;renderer.setRenderTarget(target);}
}
export function updateWater12(w,dt){
 const daylight=Math.max(.1,Math.min(1.1,w.scene.environmentIntensity||1)),rain=w.weather12?.rain||0;
 for(const mesh of[w.ocean,w.river])if(mesh?.material?.uniforms){const u=mesh.material.uniforms;if(u.rain12){u.time.value=w.time;u.daylight.value=daylight;u.rain12.value=rain;}}
}
