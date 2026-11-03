import * as THREE from 'three';
import {terrainHeight} from './state.js';
import {riverAt,MAP_SEED} from './map-data.js';
import {floorContains08,floorY08} from './roads08.js';
import {visualState12} from './materials12.js';
const size12=80,span12=48;
const fieldGLSL12=`uniform sampler2D roofHeight12;uniform vec2 roofOrigin12;uniform float roofSpan12;float surface12(vec2 p){vec2 uv=(p-roofOrigin12)/roofSpan12+.5;return texture2D(roofHeight12,clamp(uv,0.,1.)).r;}`;
export function weatherTarget12(elapsed,mode='auto'){
 if(mode==='clear')return{cloud:.08,rain:0};if(mode==='cloudy')return{cloud:.7,rain:0};if(mode==='rain')return{cloud:.88,rain:.65};if(mode==='shower')return{cloud:.98,rain:1};
 const phase=(elapsed+MAP_SEED%173)%720;
 if(phase<220)return{cloud:.08,rain:0};
 if(phase<300)return{cloud:.08+(phase-220)/80*.64,rain:0};
 if(phase<340)return{cloud:.72+(phase-300)/40*.22,rain:(phase-300)/40*.85};
 if(phase<470)return{cloud:.94,rain:.85+.12*Math.sin(phase*.046)};
 if(phase<540)return{cloud:.94-(phase-470)/70*.4,rain:.85*(1-(phase-470)/70)};
 return{cloud:.54-(phase-540)/180*.46,rain:0};
}
function refreshField12(w,state){
 const r=w.rain12,data=r.field.image.data,origin=w.camera.position;r.origin.set(origin.x,origin.z);r.fieldAt=state.elapsed;
 const step=span12/size12,ox=origin.x-span12/2,oz=origin.z-span12/2;
 for(let z=0;z<size12;z++)for(let x=0;x<size12;x++){const px=ox+(x+.5)*step,pz=oz+(z+.5)*step,river=riverAt(px,pz);data[z*size12+x]=Math.max(terrainHeight(px,pz),river&&river.distance<river.width*.5?river.water+.03:.08);}
 const depleted=new Set(state.depleted||[]);
 // Rasterize floor footprints, including slopes and rotated bridges. Do not scan every floor per texel.
 for(const f of [...w.walkFloors,...r.staticRoofs]){if(depleted.has(f.structureId))continue;
  const hw=(f.w||f.ow||3)/2,hd=(f.d||f.od||3)/2;if(Math.abs(f.x-origin.x)>span12/2+hw||Math.abs(f.z-origin.z)>span12/2+hd)continue;
  const minX=Math.max(0,Math.floor((f.x-hw-ox)/step)),maxX=Math.min(size12-1,Math.ceil((f.x+hw-ox)/step)),minZ=Math.max(0,Math.floor((f.z-hd-oz)/step)),maxZ=Math.min(size12-1,Math.ceil((f.z+hd-oz)/step));
  for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){const px=ox+(x+.5)*step,pz=oz+(z+.5)*step;if(floorContains08(f,px,pz)){const i=z*size12+x;data[i]=Math.max(data[i],floorY08(f,px,pz));}}
 }
 r.field.needsUpdate=true;
}
function instancedSeeds12(count){const a=new Float32Array(count*4);let seed=(MAP_SEED^0x12a7)>>>0;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;for(let i=0;i<count;i++){a[i*4]=rand();a[i*4+1]=rand();a[i*4+2]=rand();a[i*4+3]=.6+rand()*.8;}return new THREE.InstancedBufferAttribute(a,4);}
export function initWeather12(w,state){
 const u=visualState12(w),field=new THREE.DataTexture(new Float32Array(size12*size12),size12,size12,THREE.RedFormat,THREE.FloatType);field.needsUpdate=true;field.minFilter=field.magFilter=THREE.NearestFilter;
 const origin=new THREE.Vector2();u.roof.value=field;u.roofOrigin.value=origin;u.roofSpan.value=span12;
 const uniforms={time:u.time,strength:{value:0},daylight:{value:1},wind12:u.wind,eye12:{value:w.camera.position},roofHeight12:u.roof,roofOrigin12:u.roofOrigin,roofSpan12:u.roofSpan};
 const base=new THREE.PlaneGeometry(.043,.82),g=new THREE.InstancedBufferGeometry().copy(base);base.dispose();g.setAttribute('seed12',instancedSeeds12(1800));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms,vertexShader:`attribute vec4 seed12;uniform float time;uniform vec2 wind12;uniform vec3 eye12;varying vec2 uv12;varying vec3 drop12;void main(){float age=fract(seed12.z+time*.82);vec3 c=eye12+vec3((seed12.x-.5)*38.,14.-age*27.,(seed12.y-.5)*38.);c.xz+=wind12*(age-.5)*7.;vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);drop12=c+right*position.x*seed12.w+vec3(-wind12.x*.27,1.,-wind12.y*.27)*position.y*seed12.w;uv12=uv;gl_Position=projectionMatrix*viewMatrix*vec4(drop12,1.);}`,fragmentShader:fieldGLSL12+`uniform float strength;uniform float daylight;varying vec2 uv12;varying vec3 drop12;void main(){if(drop12.y<surface12(drop12.xz)+.035)discard;float edge=pow(max(0.,1.-abs(uv12.x*2.-1.)),1.4);float fade=sin(uv12.y*3.14159);gl_FragColor=vec4(vec3(.62,.77,.88)*(.18+daylight*.82),edge*fade*strength*.44);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=4;mesh.name='Wind-driven rain / local terrain and roof occlusion';w.scene.add(mesh);
 const b=new THREE.PlaneGeometry(1,1);b.rotateX(-Math.PI/2);const sg=new THREE.InstancedBufferGeometry().copy(b);b.dispose();sg.setAttribute('seed12',instancedSeeds12(260));
 const sm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms,vertexShader:fieldGLSL12+`attribute vec4 seed12;uniform float time;uniform vec3 eye12;varying vec2 uv12;varying float age12;void main(){age12=fract(seed12.z+time*(1.5+seed12.w*.3));vec2 xz=eye12.xz+(seed12.xy-.5)*25.;float h=surface12(xz);vec3 p=vec3(xz.x+position.x*age12*.62,h+.025,xz.y+position.z*age12*.62);uv12=uv;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float strength;uniform float daylight;varying vec2 uv12;varying float age12;void main(){float r=length(uv12-.5)*2.;float ring=smoothstep(.62,.8,r)*(1.-smoothstep(.85,1.,r));float alpha=ring*(1.-age12)*strength*.32;if(alpha<.005)discard;gl_FragColor=vec4(vec3(.63,.76,.80)*(.15+daylight*.85),alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const splashes=new THREE.Mesh(sg,sm);splashes.frustumCulled=false;splashes.renderOrder=3;splashes.name='Rain impact rings on terrain, roofs and water';w.scene.add(splashes);
 const staticRoofs=[];for(const o of w.occluders){const b=o.userData.worldBounds;if(!b)continue;const s=b.getSize(new THREE.Vector3());if(s.y<1.2&&s.x>1.4&&s.z>1.4){const c=b.getCenter(new THREE.Vector3());staticRoofs.push({x:c.x,z:c.z,w:s.x,d:s.z,y:b.max.y});}}
 w.rain12={mesh,splashes,field,origin,fieldAt:-100,uniforms,staticRoofs};refreshField12(w,state);
}
export function updateWeather12(w,dt,state){
 const u=visualState12(w),target=weatherTarget12(state.elapsed||0,w.settings.weatherMode12);w.weather12??={cloud:target.cloud,rain:target.rain};
 const weather=w.weather12,blend=1-Math.exp(-dt*.24);weather.cloud+=(target.cloud-weather.cloud)*blend;weather.rain+=(target.rain-weather.rain)*blend;
 const rain=weather.rain,cloud=weather.cloud,day=w.dayCycle?.daylight??1;w.weather08=rain>.08?'ДОЖДЬ':cloud>.3?'ОБЛАЧНО':'ЯСНО';u.day.value=day;w.weatherCloud08=cloud;
 u.wet.value+=(rain*.98-u.wet.value)*(1-Math.exp(-dt*(rain>.12?.035:.005)));u.time.value=state.elapsed||0;
 const wind=.75+.2*Math.sin(state.elapsed*.021)+rain*.5;u.wind.value.set(wind,.3+Math.sin(state.elapsed*.013)*.25);
 if(w.stormSky){w.stormSky.material.uniforms.daylight.value=(.045+.955*day)*(1-cloud*.1);w.stormSky.material.uniforms.cloudCover08.value=cloud;w.stormSky.material.uniforms.sunElevation12.value=w.dayCycle?.elevation??1;w.stormSky.material.uniforms.detail12.value=w.settings.quality==='low'?3:5;w.stormSky.material.uniforms.time.value=state.elapsed;}
 w.submergedFog08??=new THREE.FogExp2(0x286f79,.075);w.scene.fog=state.underwater?w.submergedFog08:null;
 w.sun.intensity=(2.35-cloud*1.5)*day;w.hemisphere.intensity=.17+(.88-cloud*.19)*day;w.scene.environmentIntensity=(.16+day*.84)*(1-cloud*.24);
 w.sun.color.setRGB(1.,.74+.19*day+cloud*.05,.5+.34*day+cloud*.12);
 if(w.stars)w.stars.material.opacity=(1-day)*.85*(1-cloud*.93);if(w.moon)w.moon.material.opacity=(1-day)*(1-cloud*.9);
 const r=w.rain12;if(!r)return;
 if((rain>.01||u.wet.value>.015)&&(state.elapsed-r.fieldAt>.35||Math.hypot(w.camera.position.x-r.origin.x,w.camera.position.z-r.origin.y)>2.5))refreshField12(w,state);
 r.uniforms.strength.value=rain;r.uniforms.daylight.value=day;r.mesh.visible=rain>.025&&!state.underwater;r.splashes.visible=r.mesh.visible;
 r.mesh.geometry.instanceCount=w.settings.quality==='low'?420:w.settings.quality==='high'?1800:1000;r.splashes.geometry.instanceCount=w.settings.quality==='low'?48:w.settings.quality==='high'?260:130;
}
