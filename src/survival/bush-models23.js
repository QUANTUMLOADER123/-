import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed} from './state.js';
import {visualState12} from './materials12.js';
const V=THREE.Vector3,UP=new V(0,1,0);
function wind23(w,s){
 Object.assign(s.uniforms,{plantTime23:visualState12(w).time,plantWind23:visualState12(w).wind,plantEye23:{value:w.camera.position},plantRange23:(w.bushRange23??={value:120})});
 s.vertexShader='uniform float plantTime23;uniform vec2 plantWind23;uniform vec3 plantEye23;uniform float plantRange23;\n'+s.vertexShader;
 s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 mat4 frame23=modelMatrix;
 #ifdef USE_INSTANCING
 frame23=modelMatrix*instanceMatrix;
 #endif
 vec4 root23=frame23*vec4(0.,0.,0.,1.);
 float bend23=pow(clamp(position.y/1.4,0.,1.),2.);
 vec3 push23=vec3(plantWind23.x,0.,plantWind23.y)*bend23*(sin(plantTime23*1.3+root23.x*.4+root23.z*.3)*.055+sin(plantTime23*2.7+root23.z*.8)*.012);
 // Keep a common world-space wind even on randomly rotated/slope-aligned plants.
 transformed+=vec3(dot(push23,frame23[0].xyz)/max(dot(frame23[0].xyz,frame23[0].xyz),.01),dot(push23,frame23[1].xyz)/max(dot(frame23[1].xyz,frame23[1].xyz),.01),dot(push23,frame23[2].xyz)/max(dot(frame23[2].xyz,frame23[2].xyz),.01));
 #ifdef USE_INSTANCING
 transformed*=1.-smoothstep(plantRange23-18.,plantRange23-2.,length(root23.xz-plantEye23.xz));
 #endif
 `);
}
function materials23(w){
 if(w.bushMaterials23)return w.bushMaterials23;
 const material=new THREE.MeshStandardMaterial({name:'LeafBiome23',vertexColors:true,side:THREE.DoubleSide,roughness:.96});material.userData.vegetation23=true;
 material.onBeforeCompile=s=>{wind23(w,s);s.uniforms.plantWet23=visualState12(w).wet;s.uniforms.plantDay23=visualState12(w).day;s.uniforms.plantSun23={value:w.sunDirection};s.fragmentShader='uniform float plantWet23;uniform float plantDay23;uniform vec3 plantSun23;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=1.-plantWet23*.15;');s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 float glow23=pow(max(0.,dot(normalize(vViewPosition),-normalize((viewMatrix*vec4(plantSun23,0.)).xyz))),4.);
 reflectedLight.indirectDiffuse+=diffuseColor.rgb*glow23*plantDay23*.12;`);};
 material.customProgramCacheKey=()=> 'biome23-opaque-leaf-wind';
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});depth.onBeforeCompile=s=>wind23(w,s);depth.customProgramCacheKey=()=> 'biome23-wind-depth';
 return w.bushMaterials23={material,depth};
}
/** All plant parts merge into one vertex-coloured mesh, no alpha cards. */
export function bushTemplate23(w,kind){
 w.bushTemplates23??=new Map();if(w.bushTemplates23.has(kind))return w.bushTemplates23.get(kind);
 const parts=[],seed=[...kind].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619),2307),r=randomSeed(seed),berry=kind.startsWith('berry-'),snow=kind.includes('snow'),arid=kind.includes('arid'),coast=kind.includes('coast'),pine=kind==='snow-pine'||kind==='forest-sapling',reed=kind==='coast-reed',flower=kind==='forest-flower'||kind==='snow-heather',rosette=kind==='arid-rosette';
 const leafColor=snow?0x687d66:arid?0x999573:coast?0x8b9c79:0x5f8540;
 const add=(geometry,color)=>{const geo=geometry.index?geometry.toNonIndexed():geometry;if(geo!==geometry)geometry.dispose();geo.deleteAttribute('uv');const c=new THREE.Color(color),p=geo.attributes.position,colors=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const light=.84+Math.min(1,Math.max(0,p.getY(i)))*.18;colors[i*3]=c.r*light;colors[i*3+1]=c.g*light;colors[i*3+2]=c.b*light;}geo.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(geo);};
 const stem=(a,b,radius=.014)=>{const d=b.clone().sub(a),g=new THREE.CylinderGeometry(radius*.5,radius,d.length(),5);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,d.clone().normalize()));g.translate(...a.clone().addScaledVector(d,.5).toArray());add(g,arid?0x968067:0x6c6747);};
 const leaf=(p,a,len,width,color=leafColor)=>{const forward=new V(Math.cos(a)*len,len*.24,Math.sin(a)*len),side=new V(-Math.sin(a)*width,0,Math.cos(a)*width),mid=p.clone().addScaledVector(forward,.48),tip=p.clone().add(forward),ridge=mid.clone().add(new V(0,width*.28,0)),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...p.toArray(),...mid.clone().add(side).toArray(),...tip.toArray(),...mid.clone().sub(side).toArray(),...ridge.toArray()],3));g.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);g.computeVertexNormals();add(g,color);};
 if(rosette){for(let j=0;j<15;j++){const a=j*2.4;leaf(new V(0,.025,0),a,.25+r()*.35,.016, j%3?0xa99b70:0x877c58);}}
 else if(reed){for(let j=0;j<10;j++){const a=j*2.4,p=new V(Math.cos(a)*r()*.22,0,Math.sin(a)*r()*.22),h=.65+r()*.65,top=p.clone().add(new V(.08*Math.sin(a),h,.08*Math.cos(a)));stem(p,top,.007);for(let k=1;k<4;k++)leaf(p.clone().lerp(top,k/5),a+k,.28+r()*.22,.022,0x8a9861);const head=new THREE.CylinderGeometry(.021,.026,.14,5);head.translate(top.x,top.y,top.z);add(head,0x9a8660);}}
 else{
  const branches=pine?10:berry?11:flower?7:arid?9:12;
  for(let j=0;j<branches;j++){const a=j*2.39996,h=(flower?.22:arid?.30:pine?.40:.42)+r()*(berry?.65:pine?.70:.45),spread=pine?.18+(1-h/1.2)*.4:flower?.17:arid?.43:.50,top=new V(Math.cos(a)*spread,h,Math.sin(a)*spread),base=new V((r()-.5)*.12,0,(r()-.5)*.12);stem(base,top,flower?.005:berry?.019:.012);
   const count=pine?9:arid?3:flower?3:berry?8:7;
   for(let k=0;k<count;k++){const t=.28+.72*k/count,p=base.clone().lerp(top,t),len=pine?.12+r()*.12:arid?.07:flower?.09:.13+r()*.10;for(const side of[-1,1])leaf(p,a+side*(pine?1.2:.9),len,pine?.012:arid?.022:flower?.025:.055,snow&&k>count*.65?0xb7c4b2:leafColor);}
   if(berry){const fruitColor=arid?0xc67946:snow?0x695378:coast?0x6a527d:0xb64148;for(let k=0;k<5;k++){const g=new THREE.IcosahedronGeometry(.033,0);g.translate(top.x+(r()-.5)*.13,top.y-.045-r()*.06,top.z+(r()-.5)*.13);add(g,k%3?fruitColor:0x7c343f);}}
   if(flower){for(let k=0;k<5;k++){const a=k*Math.PI*2/5,g=new THREE.CircleGeometry(snow?.022:.035,5);g.rotateX(-Math.PI/2+.3);g.translate(top.x+Math.cos(a)*.028,top.y,top.z+Math.sin(a)*.028);add(g,snow?0xa88ca9:j%2?0xd3d9a7:0xc3b0d1);}}
  }
 }
 const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();const materials=materials23(w),template={geometry,...materials};w.bushTemplates23.set(kind,template);return template;
}
export function berryBush23(w,biome){const template=bushTemplate23(w,'berry-'+biome),mesh=new THREE.Mesh(template.geometry,template.material);mesh.customDepthMaterial=template.depth;mesh.castShadow=w.settings.quality!=='low';mesh.receiveShadow=true;return mesh;}
