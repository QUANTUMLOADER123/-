import * as THREE from 'three';
export function makeSky12(w){
 w.sky.visible=false;
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},daylight:{value:1},cloudCover08:{value:.08},sunDirection:{value:w.sunDirection},sunElevation12:{value:1},detail12:{value:w.settings.quality==='low'?3:5}},vertexShader:'varying vec3 vSky12;void main(){vSky12=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec3 vSky12;uniform float time;uniform float daylight;uniform float cloudCover08;uniform vec3 sunDirection;uniform float sunElevation12;uniform float detail12;
 float hash12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
 float noise12(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x),f.y);}
 float fbm12(vec2 p,float layers){float v=0.,a=.5;mat2 rot=mat2(.8,-.6,.6,.8);for(int i=0;i<5;i++){if(float(i)>=layers)break;v+=a*noise12(p);p=rot*p*2.03+13.1;a*=.5;}return v;}
 void main(){vec3 d=normalize(vSky12);float h=max(d.y,0.);float day=clamp(daylight,0.,1.);float cloud=cloudCover08;
 vec3 horizon=mix(vec3(.53,.73,.92),vec3(.46,.56,.66),cloud*.65),zenith=mix(vec3(.075,.28,.65),vec3(.26,.37,.50),cloud*.72);
 vec3 color=mix(horizon,zenith,pow(h,.42));float sunDot=max(dot(d,normalize(sunDirection)),0.);
 float sunset=(1.-smoothstep(.12,.55,sunElevation12))*smoothstep(-.16,.08,sunElevation12);
 color=mix(color,vec3(.95,.46,.22),sunset*pow(1.-h,5.)*pow(sunDot,4.)*(1.-cloud*.8));
 vec2 p=d.xz/(h+.21)*2.1+vec2(time*.004,time*.0014);
 float n=fbm12(p,detail12),threshold=mix(.70,.27,cloud);float density=smoothstep(threshold-.05,threshold+.19,n);
 float shadow=clamp((fbm12(p+normalize(sunDirection.xz+vec2(.001))*.20,3.)-n)*3.+.45,.05,1.);
 vec3 lit=mix(vec3(.99,.98,.94),vec3(.74,.79,.84),cloud),shade=mix(vec3(.55,.64,.75),vec3(.29,.37,.46),cloud);
 vec3 clouds=mix(lit,shade,shadow);clouds+=vec3(.23,.19,.13)*pow(sunDot,18.)*pow(1.-density,3.);
 color=mix(color,clouds,density*smoothstep(-.03,.13,d.y));
 float wisps=smoothstep(.61,.83,fbm12(p*.56+vec2(time*.001,-7.),3.))*(1.-cloud)*smoothstep(.03,.4,h);color=mix(color,vec3(.87,.92,.98),wisps*.42);
 float disc=pow(sunDot,1800.)*(1.-density*.98);color+=vec3(1.,.82,.54)*disc*4.2;color+=vec3(.33,.20,.08)*pow(sunDot,22.)*(1.-density)*.22;
 color*=max(.025,day);color+=vec3(.003,.007,.017)*(1.-day);gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 w.stormSky=new THREE.Mesh(new THREE.SphereGeometry(11000,24,16),material);w.stormSky.name='Layered wind-driven sky / cloud self-shading';w.stormSky.renderOrder=-10;w.scene.add(w.stormSky);
}

/** Capture only the procedural sky, never the entire island. No screen-space/RT claim. */
export function refreshEnvironment12(w){
 if(w.settings.quality==='low'||!w.renderer.extensions.has('EXT_color_buffer_float'))return;
 const sky=w.stormSky,position=sky.position.clone(),visible=sky.visible,gen=new THREE.PMREMGenerator(w.renderer);let target;
 try{sky.position.set(0,0,0);sky.visible=true;target=gen.fromScene(sky,.035,.1,24000);}
 finally{sky.position.copy(position);sky.visible=visible;gen.dispose();}
 const old=w.environment;w.environment=target;w.scene.environment=target.texture;old?.dispose();
 if(w.visual12){w.visual12.environmentAt=performance.now();w.visual12.environmentCloud=w.weather12?.cloud||0;w.visual12.environmentDay=w.dayCycle?.daylight??1;}
}
