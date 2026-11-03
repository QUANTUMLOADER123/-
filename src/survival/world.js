import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { terrainHeight, noise, randomSeed, resourceNodes, clamp, WORLD_SEED, MONUMENTS, BOT_BASES, WORLD_RADIUS, TIERS, damageStructure } from './state.js';
import {MAP_SCALE} from './map-data.js';
import {addIslandContent} from './content.js';
import {installWorldSystems} from './world-systems.js';
const V=THREE.Vector3;
const ASSET='assets/';
export class IslandWorld {
 constructor(canvas,settings){
  this.canvas=canvas;this.settings=settings;this.time=0;this.models={};this.textures={};this.nodes=[];this.colliders=[];this.interactables=[];this.wolves=[];this.fires=[];this.built=new Map();this.swing=0;this.previewKind=null;this.previewRotation=0;this.treeBatches=[];this.effects=[];this.bots=[];this.distantGroups=[];this.staticStructures=[];this.walkFloors=[];
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.92;
  this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.scene=new THREE.Scene();this.scene.fog=new THREE.FogExp2(0x687875,.0065);
  this.camera=new THREE.PerspectiveCamera(69,1,.06,1800);this.camera.rotation.order='YXZ';this.scene.add(this.camera);
  this.sun=new THREE.DirectionalLight(0xffdab0,2.2);this.sun.position.set(40,52,12);this.sun.castShadow=true;
  Object.assign(this.sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:150});this.sun.shadow.bias=-.00015;this.sun.shadow.normalBias=.035;
  this.scene.add(this.sun,this.sun.target);
  this.lowAmbient=new THREE.AmbientLight(0xbbc8b7,settings.quality==='low'?1.8:0);this.scene.add(this.lowAmbient);
  this.hemisphere=new THREE.HemisphereLight(0xc3d9dd,0x454a26,.85);this.scene.add(this.hemisphere);
  this.sky=new Sky();this.sky.scale.setScalar(450);this.scene.add(this.sky);
  const su=this.sky.material.uniforms;su.turbidity.value=8;su.rayleigh.value=1.7;su.mieCoefficient.value=.007;su.mieDirectionalG.value=.83;
  this.sunDirection=new V(50,17,-80).normalize();su.sunPosition.value.copy(this.sunDirection);
  this.environment=null;if(settings.quality!=='low'){const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(this.sky,.025);this.scene.environment=this.environment.texture;pmrem.dispose();}this.makeStormSky();
  this.applyQuality(settings.quality);this.resize();
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new Event('oskol-context-lost'));});
 }
 resize(){this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.settings.quality==='high'?1.5:this.settings.quality==='low'?.7:1));this.renderer.setSize(window.innerWidth,window.innerHeight,false);this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();this.needsRender=true;}
 applyQuality(q){this.settings.quality=q;if(q!=='low'&&!this.environment){this.sky.visible=true;const gen=new THREE.PMREMGenerator(this.renderer);this.environment=gen.fromScene(this.sky,.025);gen.dispose();this.sky.visible=false;}this.scene.environment=q==='low'?null:this.environment?.texture||null;if(this.lowAmbient)this.lowAmbient.intensity=q==='low'?1.8:0;this.renderer.shadowMap.enabled=q!=='low';const s=q==='high'?2048:1024;if(this.sun){this.sun.shadow.mapSize.set(s,s);if(this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null;}this.sun.shadow.needsUpdate=true;}if(this.grass)this.grass.count=q==='low'?1800:q==='medium'?4200:this.grass.instanceMatrix.count;this.resize();}
 async init(progress){
  const manager=new THREE.LoadingManager();manager.onProgress=(url,done,total)=>progress(Math.min(.82,done/Math.max(total,1)*.82),'Модели, материалы и растительность…');
  const loader=new GLTFLoader(manager),tl=new THREE.TextureLoader(manager);
  const names=['Oak_LOD1','Oak_LOD2','Axe','Axe_Small','Tent','Bonfire','WoodLog','Backpack','Radio','WaterBottle_1','FirstAidKit','Can_Closed','Raft','Raft_Paddle','Crate','Barrel','Wolf','Rock_1','Rock_2','Rock_3','Plant_1','BushBerries_1','Adventurer','Swat','Shotgun_1','Pistol_1','PropaneTank'];
  const textureNames=['ground.jpg','sand.jpg','rockyGround_basecolor.png','rockyGround_normal.png','wood.jpg'];
  await Promise.all([...names.map(async n=>{this.models[n]=await loader.loadAsync(ASSET+'models/'+n+'.glb');}),...textureNames.map(async n=>{const t=await tl.loadAsync(ASSET+'textures/'+n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());if(!n.includes('normal'))t.colorSpace=THREE.SRGBColorSpace;this.textures[n]=t;})]);
  progress(.86,'Собираем берег и заброшенный лагерь…');this.makeTerrain();this.makeOcean();this.makeCamp();addIslandContent(this);this.makeResources();this.makeGrass();this.makeViewModel();this.makeWolves();this.makeBots();this.makeAmbient();progress(.98,'Проверяем снаряжение…');
  this.menuCamera(0);for(const g of this.distantGroups)g.root.visible=Math.hypot(g.x-this.camera.position.x,g.z-this.camera.position.z)<g.range;await this.renderer.compileAsync(this.scene,this.camera);this.render();progress(1,'Остров готов.');
 }
 makeTerrain(){
  const geometry=new THREE.PlaneGeometry(WORLD_RADIUS*2.15,WORLD_RADIUS*2.15,this.settings.quality==='low'?150:220,this.settings.quality==='low'?150:220);geometry.rotateX(-Math.PI/2);const p=geometry.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=terrainHeight(x,z);p.setY(i,h);const path=Math.abs(x-(5+Math.sin(z*.07)*2));const dirt=(z>-1&&z<25&&path<1.8)||Math.hypot(x+6,z+3)<11;
   const n=noise(x*.14,z*.14);const c=new THREE.Color(h<.8?0xd2bd8b:dirt?0x928460:0x657049);c.multiplyScalar(.74+n*.42);colors.push(c.r,c.g,c.b);
  }geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const map=this.textures['ground.jpg'];map.repeat.set(65,65);const material=new THREE.MeshStandardMaterial({map,vertexColors:true,roughness:1,metalness:0});
  const terrain=new THREE.Mesh(geometry,material);terrain.receiveShadow=true;terrain.name='Textured island terrain';this.scene.add(terrain);this.terrain=terrain;
  // Distant rock silhouettes extend the island beyond the playable clearing.
  const rand=randomSeed(919);const rocky=new THREE.MeshStandardMaterial({map:this.textures['rockyGround_basecolor.png'],normalMap:this.textures['rockyGround_normal.png'],normalScale:new THREE.Vector2(.6,.6),color:0x8e9483,roughness:1});
  for(let i=0;i<17;i++){const a=rand()*Math.PI*2,x=Math.cos(a)*270*MAP_SCALE,z=Math.sin(a)*270*MAP_SCALE;const g=new THREE.IcosahedronGeometry(3+rand()*5,2);const p=g.attributes.position;for(let j=0;j<p.count;j++){const f=.85+noise(p.getX(j)*.7+i,p.getZ(j)*.7)*.35;p.setXYZ(j,p.getX(j)*f,p.getY(j)*f,p.getZ(j)*f);}g.computeVertexNormals();const r=new THREE.Mesh(g,rocky);r.position.set(x,terrainHeight(x,z)-1,z);r.scale.y=1.4+rand();r.castShadow=true;r.receiveShadow=true;this.scene.add(r);}
 }
 makeOcean(){
  const geometry=new THREE.PlaneGeometry(4500,4500,80,80);geometry.rotateX(-Math.PI/2);
  const material=new THREE.ShaderMaterial({uniforms:{time:{value:0},skyColor:{value:new THREE.Color(0xb4c7c0)},sunDirection:{value:this.sunDirection},fogColor:{value:this.scene.fog.color}},vertexShader:`uniform float time;varying vec3 vPos;varying vec3 vNormal;void main(){vec3 p=position;p.y+=sin(p.x*.14+time*.6)*.10+sin(p.z*.21-time*.45)*.07;vNormal=normalize(vec3(-cos(p.x*.14+time*.6)*.014,1.,-cos(p.z*.21-time*.45)*.014));vec4 world=modelMatrix*vec4(p,1.);vPos=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`uniform float time;uniform vec3 skyColor;uniform vec3 sunDirection;uniform vec3 fogColor;varying vec3 vPos;varying vec3 vNormal;void main(){vec3 viewDir=normalize(cameraPosition-vPos);float fresnel=pow(1.-max(dot(viewDir,vNormal),0.),3.);float wave=sin(vPos.x*1.8+sin(vPos.z*.7+time)*2.+time)*.5+.5;float spark=pow(max(dot(reflect(-sunDirection,vNormal),viewDir),0.),140.);vec3 color=mix(vec3(.10,.24,.23),skyColor*.62,fresnel)+wave*.012+spark*vec3(1.,.77,.42)*1.7;float dist=length(cameraPosition-vPos);color=mix(color,fogColor,1.-exp(-dist*.0035));gl_FragColor=vec4(color,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.y=.08;mesh.name='Animated coastal water';this.scene.add(mesh);this.ocean=mesh;
 }
 normalized(name,height){const model=skeletonClone(this.models[name].scene);model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model,!!model.getObjectByProperty('isSkinnedMesh',true)),size=box.getSize(new V()),center=box.getCenter(new V());const root=new THREE.Group();model.position.set(-center.x,-box.min.y,-center.z);root.add(model);root.scale.setScalar(height/Math.max(.001,size.y));root.traverse(o=>{if(o.isMesh){if(o.isSkinnedMesh)o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.roughness=Math.max(m.roughness??.8,.55);if(m.map)m.map.anisotropy=4;}}}});return root;}
 prop(name,x,z,height=1,rotation=0){const root=this.normalized(name,height);root.position.set(x,terrainHeight(x,z),z);root.rotation.y=rotation;this.scene.add(root);return root;}
 makeWoodMaterial(){const m=new THREE.MeshStandardMaterial({map:this.textures['wood.jpg'],color:0x8d8e69,roughness:.94});return m;}
 mergeParts(parts,material){const geometries=parts.map(m=>{m.updateMatrix();const g=m.geometry.clone();g.applyMatrix4(m.matrix);return g;});const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;parts.forEach(p=>p.geometry.dispose());return mesh;}
 timberGroup(kind){
  const group=new THREE.Group(),parts=[],material=this.woodMaterial||(this.woodMaterial=this.makeWoodMaterial());
  const box=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,1,.015));m.position.set(x,y,z);parts.push(m);};
  if(kind==='foundation'){
   for(let i=0;i<12;i++)box(.244,.15,3,-1.375+i*.25,.29,0);
   for(const z of[-1.15,1.15])box(3,.22,.17,0,.13,z);
   for(const x of[-1.15,1.15])for(const z of[-1.15,1.15])box(.17,.4,.17,x,.02,z);
  }else if(kind==='wall'||kind==='door'){
   for(let i=0;i<12;i++){const x=-1.375+i*.25;if(kind==='door'&&Math.abs(x)<.6)box(.242,.55,.09,x,2.66,0);else box(.242,2.65,.09,x,1.6,0);}
   for(const y of[.55,2.45]){if(kind==='wall')box(3,.12,.12,0,y,.08);else for(const x of[-1.06,1.06])box(.87,.12,.12,x,y,.08);}
   for(const x of[-1.5,1.5])box(.12,2.8,.17,x,1.6,0);
   if(kind==='door'){
    const pivot=new THREE.Group();pivot.position.set(-.59,.32,0);const doorParts=[];
    for(let i=0;i<5;i++){const m=new THREE.Mesh(new RoundedBoxGeometry(.229,2.1,.09,1,.012));m.position.set(.12+i*.236,1.05,0);doorParts.push(m);}
    for(const y of[.27,1.8]){const m=new THREE.Mesh(new RoundedBoxGeometry(1.18,.1,.13,1,.01));m.position.set(.59,y,.04);doorParts.push(m);}
    pivot.add(this.mergeParts(doorParts,material));const handle=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,5,10),new THREE.MeshStandardMaterial({color:0x3e4133,metalness:.6,roughness:.6}));handle.position.set(.99,1.02,.1);pivot.add(handle);group.add(pivot);group.userData.doorPivot=pivot;
   }
  }else if(kind==='roof'){
   for(let i=0;i<12;i++)box(.244,.13,3.15,-1.375+i*.25,3.04,0);
   for(const z of[-1.15,1.15])box(3,.15,.16,0,2.9,z);
  }
  if(parts.length)group.add(this.mergeParts(parts,material));return group;
 }
 makeCabin(){
  const group=new THREE.Group(),parts=[];const add=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,1,.018));m.position.set(x,y,z);parts.push(m);};
  for(let i=0;i<24;i++)add(.26,.14,5,-3.12+i*.272,.2,0);
  for(let i=0;i<24;i++){
   const x=-3.12+i*.272;add(.26,2.9,.12,x,1.7,-2.5);
   if(x>.65&&x<1.95)add(.26,.62,.12,x,2.84,2.5);else if(x>-2.3&&x<-.7){add(.26,1.12,.12,x,.82,2.5);add(.26,.52,.12,x,2.89,2.5);}else add(.26,2.9,.12,x,1.7,2.5);
  }
  for(const x of[-3.3,3.3])for(let i=0;i<18;i++)add(.12,2.9,.268,x,1.7,-2.36+i*.28);
  for(const x of[-3.3,3.3])for(const z of[-2.5,2.5])add(.19,3.1,.19,x,1.7,z);
  for(const z of[-2.6,2.6])add(6.9,.2,.18,0,3.14,z);
  group.add(this.mergeParts(parts,this.woodMaterial||(this.woodMaterial=this.makeWoodMaterial())));
  const roofG=new THREE.PlaneGeometry(7.3,5.9,110,1);roofG.rotateX(-Math.PI/2);const rp=roofG.attributes.position;
  for(let i=0;i<rp.count;i++)rp.setY(i,3.35+Math.sin(rp.getX(i)*35)*.038-rp.getZ(i)*.065);roofG.computeVertexNormals();
  const roofTexture=this.roofTexture();const roof=new THREE.Mesh(roofG,new THREE.MeshStandardMaterial({map:roofTexture,color:0x67716c,metalness:.35,roughness:.76,side:THREE.DoubleSide}));roof.castShadow=true;roof.receiveShadow=true;group.add(roof);
  const step=new THREE.Mesh(new RoundedBoxGeometry(1.7,.18,.8,1,.03),this.woodMaterial);step.position.set(1.3,.02,2.92);step.castShadow=true;group.add(step);
  group.position.set(-7,terrainHeight(-7,-5),-5);this.scene.add(group);this.cabin=group;
  this.colliders.push({box:true,x:-7,z:-7.5,w:6.6,d:.25},{box:true,x:-10.3,z:-5,w:.25,d:5},{box:true,x:-3.7,z:-5,w:.25,d:5},{box:true,x:-8.3,z:-2.5,w:3.9,d:.25},{box:true,x:-4.25,z:-2.5,w:1.2,d:.25});
 }
 roofTexture(){const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#748078';ctx.fillRect(0,0,512,512);const r=randomSeed(52);for(let i=0;i<5000;i++){const shade=r();ctx.fillStyle=shade>.86?'#915b3590':shade>.5?'#bac1ad25':'#1d292025';ctx.fillRect(r()*512,r()*512,1+r()*5,1+r()*10);}for(let x=0;x<512;x+=16){ctx.fillStyle='#d3d8c01f';ctx.fillRect(x,0,2,512);ctx.fillStyle='#0c1c1844';ctx.fillRect(x+6,0,2,512);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
 makeCamp(){
  this.makeCabin();this.prop('Tent',8,-4,2.2,.4);this.prop('Backpack',7.4,-1.7,.65,-.8);this.prop('Barrel',-11,-1,1.15,.1);this.prop('Barrel',-12,-2.3,1.03,-.2);
  const fire=this.prop('Bonfire',-1,0,.65);this.addFire(fire.position.x,fire.position.z,.65);
  for(let i=0;i<4;i++)this.prop('WoodLog',-10.4+i*.35,3,.38,Math.PI*.5);
  this.prop('WaterBottle_1',-9,-3,.4);this.prop('FirstAidKit',-4.8,-6,.4,.7);
  this.prop('Raft',40,58,.6,-.7);this.prop('Raft_Paddle',39,57,.3,1.0);
  const crates=[['camp-1',-9,-5],['camp-2',9,-.8],['tower',-33,-32],['coast',35,48]];
  for(const[id,x,z]of crates){const model=this.prop('Crate',x,z,.85,id==='tower'?.8:0);this.interactables.push({id:'crate-'+id,type:'crate',x,z,model,radius:.9});this.colliders.push({x,z,r:.6});}
  this.makeRadioTower();
 }
 makeRadioTower(){
  const x=-31,z=-31,y=terrainHeight(x,z),group=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:0x4b5750,metalness:.65,roughness:.6});
  const segment=(a,b,r=.04)=>{const start=new V(...a),end=new V(...b),d=end.clone().sub(start);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),7),metal);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());m.castShadow=true;group.add(m);};
  for(let k=0;k<3;k++){const a=k*Math.PI*2/3;segment([Math.cos(a)*1.2,0,Math.sin(a)*1.2],[Math.cos(a)*.18,12,Math.sin(a)*.18],.06);}
  for(let i=0;i<6;i++)for(let k=0;k<3;k++){const a=k*Math.PI*2/3,b=(k+1)*Math.PI*2/3,r=1.2-i*.16,r2=r-.16;segment([Math.cos(a)*r,i*2,Math.sin(a)*r],[Math.cos(b)*r2,i*2+2,Math.sin(b)*r2],.025);}
  segment([0,12,0],[0,14,0],.035);segment([-1,12,0],[1,12,0],.025);
  group.position.set(x,y,z);this.scene.add(group);const radio=this.prop('Radio',x+1.3,z+1,1.0,.3);this.interactables.push({id:'radio',type:'radio',x:x+1.3,z:z+1,model:radio,radius:1});this.colliders.push({x,z,r:1.25});
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshBasicMaterial({color:0xe5824a}));lamp.position.set(x,y+14,z);this.scene.add(lamp);this.radioLamp=lamp;
 }
 makeResources(){
  const random=randomSeed(518);this.nodes=resourceNodes();const trees=this.nodes.filter(n=>n.type==='tree');
  // Per-material instancing keeps the detailed textured forest to a handful of draw calls.
  for(const lod of[1,2]){
   const template=this.models['Oak_LOD'+lod].scene;template.updateMatrixWorld(true);const meshes=[];template.traverse(o=>{if(o.isMesh)meshes.push(o);});
   const treeIndices=trees.map((n,i)=>({n,i})).filter(({n})=>(this.settings.quality!=='low'&&Math.hypot(n.x,n.z)<36?1:2)===lod);
   for(const src of meshes){const geom=src.geometry.clone();geom.applyMatrix4(src.matrixWorld);const mat=src.material.clone();mat.color.multiplyScalar(mat.alphaTest>0?.68:.48);mat.envMapIntensity=.35;mat.roughness=1;
    const batch=new THREE.InstancedMesh(geom,mat,treeIndices.length);batch.castShadow=true;batch.receiveShadow=true;batch.name='Textured broadleaf LOD'+lod;
    treeIndices.forEach(({n},index)=>{const rand=randomSeed(this.stringSeed(n.id)),s=.48+rand()*.25,rotation=rand()*Math.PI*2;const matrix=new THREE.Matrix4().compose(new V(n.x,terrainHeight(n.x,n.z)+.7,n.z),new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),rotation),new V(s,s,s));batch.setMatrixAt(index,matrix);(n.instances??=[]).push({batch,index,matrix:matrix.clone()});n.r=.5+s*.3;});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();this.scene.add(batch);this.treeBatches.push(batch);
   }
  }
  const rockMaterial=new THREE.MeshStandardMaterial({map:this.textures['rockyGround_basecolor.png'],normalMap:this.textures['rockyGround_normal.png'],normalScale:new THREE.Vector2(.65,.65),color:0x9d9d8b,roughness:.95});
  for(const n of this.nodes){n.y=terrainHeight(n.x,n.z);if(n.type==='tree'){this.colliders.push({x:n.x,z:n.z,r:n.r,id:n.id});continue;}
   if(['rock','metalOre','sulfurOre'].includes(n.type)){
    // Rounded, textured geological mesh, not a cube or a collision-box placeholder.
    const g=new THREE.IcosahedronGeometry(.95+random()*.5,2),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=.82+noise(x*2+n.x,y*2+n.z)*.35;p.setXYZ(i,x*f,y*f*.78,z*f);}
    g.computeVertexNormals();const rm=rockMaterial.clone();if(n.type==='metalOre')rm.color.set(0x87694e);if(n.type==='sulfurOre')rm.color.set(0xa5a04f);n.model=new THREE.Mesh(g,rm);n.model.position.set(n.x,n.y+.4,n.z);n.model.rotation.y=random()*6.28;n.model.castShadow=true;n.model.receiveShadow=true;this.scene.add(n.model);if(n.type!=='rock'){const crystals=new THREE.Group();const oreMat=new THREE.MeshStandardMaterial({color:n.type==='metalOre'?0x9c6b46:0xbbaf48,metalness:n.type==='metalOre'?.35:0,roughness:.75});for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(.14+random()*.16,0),oreMat);c.position.set((random()-.5)*1.1,.3+random()*.5,(random()-.5)*1.1);crystals.add(c);}n.model.add(crystals);}n.r=1.0;this.colliders.push({x:n.x,z:n.z,r:.9,id:n.id});
   }else{n.model=this.prop(n.type==='berries'?'BushBerries_1':'Plant_1',n.x,n.z,n.type==='berries'?1.05:.75,random()*6.28);}
  }
 }
 stringSeed(str){let h=WORLD_SEED;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return h;}
 makeGrass(){
  const count=14000,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,0,.035,0,0,0,.44,.03, 0,0,-.035,0,0,.035,.025,.35,0],3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0],3));
  const colors=[.035,.06,.015,.035,.06,.015,.14,.19,.045,.04,.065,.018,.04,.065,.018,.16,.20,.055];geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});
  const wind={value:0};material.onBeforeCompile=shader=>{shader.uniforms.windTime=wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 instPos=instanceMatrix*vec4(0.,0.,0.,1.);\ntransformed.x+=sin(windTime*1.8+instPos.x*.7+instPos.z*.6)*position.y*.16;');};
  const mesh=new THREE.InstancedMesh(geometry,material,count),r=randomSeed(7892);let placed=0;const dummy=new THREE.Object3D();
  while(placed<count){const x=(r()-.5)*350*MAP_SCALE,z=(r()-.5)*350*MAP_SCALE,h=terrainHeight(x,z);if(h<1.2||Math.hypot(x+6,z+3)<11||Math.abs(x-(5+Math.sin(z*.07)*2))<1.8&&z>0&&z<26)continue;dummy.position.set(x,h-.01,z);dummy.rotation.y=r()*6.28;const s=.7+r();dummy.scale.set(s,s,s);dummy.updateMatrix();mesh.setMatrixAt(placed++,dummy.matrix);}
  mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();this.scene.add(mesh);this.grass=mesh;this.wind=wind;this.applyQuality(this.settings.quality);
 }
 makeViewModel(){
  this.handRoot=new THREE.Group();this.camera.add(this.handRoot);this.handRoot.position.set(.38,-.45,-.66);
  const glove=new THREE.MeshStandardMaterial({color:0x454536,roughness:1}),sleeve=new THREE.MeshStandardMaterial({color:0x3a433b,roughness:1}),strap=new THREE.MeshStandardMaterial({color:0x252d26,roughness:.9});
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.10,.48,5,12),sleeve);arm.position.set(.12,-.25,.18);arm.rotation.set(.3,0,-.36);this.handRoot.add(arm);
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.102,.105,.09,12),strap);cuff.position.set(.05,-.04,.10);cuff.rotation.z=-.36;this.handRoot.add(cuff);
  const palm=new THREE.Mesh(new THREE.SphereGeometry(1,14,12),glove);palm.scale.set(.085,.125,.06);palm.position.set(0,.065,.015);palm.rotation.z=-.25;this.handRoot.add(palm);
  for(let i=0;i<4;i++){const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.019,.095,3,8),glove);finger.position.set(-.05+i*.031,.1,-.045);finger.rotation.x=1.2;this.handRoot.add(finger);}
  const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.07,3,8),glove);thumb.rotation.set(.5,0,-.8);thumb.position.set(-.066,.06,-.02);this.handRoot.add(thumb);
  // Fine seams and knuckle pad avoid a featureless block-shaped hand.
  const pad=new THREE.Mesh(new RoundedBoxGeometry(.105,.06,.018,2,.013),strap);pad.position.set(0,.10,.068);pad.rotation.z=-.2;this.handRoot.add(pad);
  this.heldRock=new THREE.Mesh(new THREE.IcosahedronGeometry(.145,2),new THREE.MeshStandardMaterial({map:this.textures['rockyGround_basecolor.png'],normalMap:this.textures['rockyGround_normal.png'],color:0x898a7a,roughness:1}));this.heldRock.scale.set(1.15,1,.77);this.heldRock.position.set(-.02,.17,-.045);this.handRoot.add(this.heldRock);
  this.heldAxe=this.normalized('Axe',.72);this.heldAxe.rotation.set(.05,.55,-.25);this.heldAxe.position.set(-.03,-.11,-.02);this.handRoot.add(this.heldAxe);this.heldAxe.visible=false;
  this.heldTorch=new THREE.Group();const stick=new THREE.Mesh(new THREE.CylinderGeometry(.026,.034,.65,9),new THREE.MeshStandardMaterial({color:0x67523b,roughness:1}));stick.position.y=.23;this.heldTorch.add(stick);const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.06,.042,.17,9),glove);wrap.position.y=.56;this.heldTorch.add(wrap);this.torchFlame=new THREE.Mesh(new THREE.ConeGeometry(.065,.24,7),new THREE.MeshBasicMaterial({color:0xffb24b,transparent:true,opacity:.85,depthWrite:false}));this.torchFlame.position.y=.75;this.heldTorch.add(this.torchFlame);this.handRoot.add(this.heldTorch);this.heldTorch.visible=false;
  this.torchLight=new THREE.PointLight(0xffa558,0,12,2);this.torchLight.position.set(0,.6,0);this.handRoot.add(this.torchLight);
  this.heldGun=this.normalized('Shotgun_1',.25);this.heldGun.rotation.set(0,Math.PI*.5,-.04);this.heldGun.position.set(-.06,.12,-.25);this.handRoot.add(this.heldGun);
  this.heldPickaxe=new THREE.Group();const pickWood=new THREE.MeshStandardMaterial({map:this.textures['wood.jpg'],color:0x756446,roughness:1}),pickMetal=new THREE.MeshStandardMaterial({color:0x7e8478,metalness:.5,roughness:.8});const ph=new THREE.Mesh(new THREE.CylinderGeometry(.022,.03,.72,9),pickWood);ph.position.y=.22;this.heldPickaxe.add(ph);const head=new THREE.Mesh(new THREE.ConeGeometry(.065,.40,7),pickMetal);head.rotation.z=Math.PI*.5;head.position.set(.05,.52,0);this.heldPickaxe.add(head);this.heldPickaxe.rotation.z=-.2;this.handRoot.add(this.heldPickaxe);
  this.heldHammer=new THREE.Group();const hh=ph.clone();hh.scale.y=.65;this.heldHammer.add(hh);const hb=new THREE.Mesh(new RoundedBoxGeometry(.23,.16,.14,2,.025),pickWood);hb.position.y=.42;this.heldHammer.add(hb);this.handRoot.add(this.heldHammer);
  this.heldSatchel=new THREE.Mesh(new RoundedBoxGeometry(.24,.23,.12,2,.03),new THREE.MeshStandardMaterial({color:0x665b3e,roughness:1}));this.heldSatchel.position.set(0,.15,0);this.handRoot.add(this.heldSatchel);
  this.handRoot.traverse(o=>{o.layers.set(1);if(o.isMesh){o.renderOrder=0;const ms=Array.isArray(o.material)?o.material:[o.material];o.material=ms.map(m=>{const c=m.clone();c.depthTest=true;c.depthWrite=true;c.envMapIntensity=.6;return c;});if(o.material.length===1)o.material=o.material[0];o.castShadow=false;o.receiveShadow=false;}});this.handRoot.visible=false;this.sun.layers.enable(1);this.hemisphere.layers.enable(1);this.torchLight.layers.enable(1);
 }
 makeWolves(){
  const spawns=[[-22,-20],[-42,-36]];
  spawns.forEach(([x,z],i)=>{const model=this.normalized('Wolf',1.15);model.position.set(x,terrainHeight(x,z),z);this.scene.add(model);const mixer=new THREE.AnimationMixer(model);const actions={};for(const clip of this.models.Wolf.animations){const name=clip.name.split('|').at(-1);actions[name]=mixer.clipAction(clip);}
   const wolf={id:'wolf-'+i,x,z,homeX:x,homeZ:z,model,mixer,actions,active:null,hp:65,cooldown:0,dead:false};this.wolves.push(wolf);this.setWolfAction(wolf,'Walk');});
 }
 setWolfAction(wolf,name){if(wolf.active===name||!wolf.actions[name])return;const prev=wolf.actions[wolf.active];const next=wolf.actions[name];next.reset().fadeIn(.25).play();if(prev)prev.fadeOut(.25);wolf.active=name;}
 makeAmbient(){
  const geometry=new THREE.BufferGeometry(),positions=[],r=randomSeed(88);for(let i=0;i<90;i++)positions.push((r()-.5)*75,1+r()*8,(r()-.5)*75);geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.motes=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xffe6ae,size:.035,transparent:true,opacity:.36,depthWrite:false}));this.scene.add(this.motes);
  const birdMaterial=new THREE.MeshBasicMaterial({color:0x333e34,side:THREE.DoubleSide});this.birds=[];
  for(let i=0;i<5;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.55,0,0,0,.1,.13,0,0,-.08, .55,0,0,0,.1,.13,0,0,-.08],3));const m=new THREE.Mesh(g,birdMaterial);this.scene.add(m);this.birds.push(m);}
 }
 addFire(x,z,size=.6){
  const root=new THREE.Group();root.position.set(x,terrainHeight(x,z)+.3,z);const material=new THREE.MeshBasicMaterial({color:0xffa34b,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
  for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(size*(.15+i*.055),size*(.55+i*.25),7),material.clone());m.position.set(Math.sin(i*2.2)*.09,size*.4,Math.cos(i)*.08);root.add(m);}
  const light=new THREE.PointLight(0xff9b43,2.4,9,2);light.position.y=.7;root.add(light);this.scene.add(root);this.fires.push({root,light,x,z,size});
 }
 syncState(state){
  for(const n of this.nodes){const gone=state.depleted.includes(n.id);if(n.type==='tree'){for(const ref of n.instances){const m=gone?new THREE.Matrix4().makeScale(0,0,0):ref.matrix;ref.batch.setMatrixAt(ref.index,m);ref.batch.instanceMatrix.needsUpdate=true;}}else n.model.visible=!gone;n.remaining=gone?0:(state.nodeDamage[n.id]??n.hp);}
  for(const item of this.interactables){if(item.type==='crate'){item.model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(state.looted.includes(item.id))o.material.color.multiplyScalar(.6);}});}}
  for(const w of this.wolves){w.dead=state.depleted.includes(w.id);w.model.visible=!w.dead;w.hp=65;w.x=w.homeX;w.z=w.homeZ;w.model.position.set(w.x,terrainHeight(w.x,w.z),w.z);}
  for(const[id,entry]of this.built){this.scene.remove(entry.model);if(entry.fire){this.scene.remove(entry.fire.root);this.fires=this.fires.filter(f=>f!==entry.fire);}this.built.delete(id);}
  this.colliders=this.colliders.filter(c=>!c.built);
  for(const b of state.buildings)if(b.hp>0)this.addBuilding(b);
  this.interactables=this.interactables.filter(i=>!i.id.startsWith('build-')||state.buildings.some(b=>b.id===i.id&&b.hp>0));
  for(const entry of this.staticStructures){entry.model.visible=!state.depleted.includes(entry.data.id);entry.data.open=false;if(entry.model.userData.doorPivot)entry.model.userData.doorPivot.rotation.y=0;}
  for(const bot of this.bots){bot.hp=state.botState[bot.id]?.hp??120;bot.dead=bot.hp<=0;bot.model.visible=!bot.dead;bot.weapon.visible=!bot.dead;bot.x=bot.homeX+4;bot.z=bot.homeZ+bot.spawnOffset;bot.model.rotation.z=0;}
  this.nodes.forEach(n=>{if(n.model)n.model.visible=!state.depleted.includes(n.id);});
 }
 hideNode(node){if(node.type==='tree'){for(const ref of node.instances){ref.batch.setMatrixAt(ref.index,new THREE.Matrix4().makeScale(0,0,0));ref.batch.instanceMatrix.needsUpdate=true;}}else node.model.visible=false;}
 addBuilding(b){
  let model,fire;
  if(b.kind==='furnace'||b.kind==='workbench'){model=this.stationModel(b.kind);model.position.set(b.x,terrainHeight(b.x,b.z),b.z);model.rotation.y=b.rotation;this.scene.add(model);this.interactables.push({id:b.id,type:b.kind,x:b.x,z:b.z,model,data:b,radius:1.1});}
  else if(b.kind==='campfire'){model=this.normalized('Bonfire',.65);model.position.set(b.x,terrainHeight(b.x,b.z),b.z);this.scene.add(model);this.addFire(b.x,b.z,.65);fire=this.fires.at(-1);}
  else{model=this.timberGroup(b.kind);model.position.set(b.x,terrainHeight(b.x,b.z),b.z);model.rotation.y=b.rotation;this.scene.add(model);}
  this.built.set(b.id,{model,fire,data:b});this.applyBuildingTier({model,data:b});
  if(b.kind==='door'&&model.userData.doorPivot){model.userData.doorPivot.rotation.y=b.open?1.6:0;this.interactables=this.interactables.filter(i=>i.id!==b.id);this.interactables.push({id:b.id,type:'door',x:b.x,z:b.z,model,radius:1.4,data:b});}
  if(b.kind==='wall'||b.kind==='door')this.colliders.push({box:true,x:b.x,z:b.z,w:Math.abs(Math.cos(b.rotation))>0.5?3:.18,d:Math.abs(Math.cos(b.rotation))>0.5?.18:3,id:b.id,built:true,door:b.kind==='door',data:b});
 }
 preview(kind,position,rotation,ok){
  if(this.previewKind!==kind){if(this.ghost)this.scene.remove(this.ghost);this.ghost=kind==='campfire'?this.normalized('Bonfire',.65):['furnace','workbench'].includes(kind)?this.stationModel(kind):this.timberGroup(kind);this.ghost.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:0xb5d98b,wireframe:true,transparent:true,opacity:.65,depthWrite:false});o.castShadow=false;o.receiveShadow=false;}});this.scene.add(this.ghost);this.previewKind=kind;}
  this.ghost.visible=true;this.ghost.position.set(position.x,terrainHeight(position.x,position.z),position.z);this.ghost.rotation.y=rotation;this.ghost.traverse(o=>{if(o.isMesh)o.material.color.set(ok?0xb6db8c:0xea885b);});
 }
 clearPreview(){if(this.ghost)this.ghost.visible=false;}
 floorHeight(x,z,state){let h=terrainHeight(x,z);for(const b of state.buildings)if(b.hp>0&&b.kind==='foundation'&&Math.abs(x-b.x)<1.5&&Math.abs(z-b.z)<1.5)h=Math.max(h,terrainHeight(b.x,b.z)+.38);for(const f of this.walkFloors)if(Math.abs(x-f.x)<f.w/2&&Math.abs(z-f.z)<f.d/2)h=Math.max(h,f.y);if(x>-10.3&&x<-3.7&&z>-7.5&&z<-2.5)h=Math.max(h,terrainHeight(-7,-5)+.27);return h;}
 canMove(x,z,state){
  if(Math.hypot(x,z)>WORLD_RADIUS-2)return false;
  for(const c of this.colliders){if(c.id&&state.depleted.includes(c.id)||c.data&&!c.data.owner&&c.data.hp<=0||c.door&&c.data.open)continue;if(c.box){if(Math.abs(x-c.x)<c.w/2+.27&&Math.abs(z-c.z)<c.d/2+.27)return false;}else if(Math.hypot(x-c.x,z-c.z)<c.r+.26)return false;}
  return true;
 }
 target(state){
  const direction=this.camera.getWorldDirection(new V()),origin=this.camera.position;let best=null,nearest=state.selected==='rifle'?90:6;
  const check=(obj,y,radius,max=4.3)=>{const point=new V(obj.x,y,obj.z),delta=point.sub(origin),t=delta.dot(direction);if(t<0||t>max)return;const perp=delta.lengthSq()-t*t;if(perp>radius*radius)return;if(t<nearest){nearest=t;best=obj;}};
  for(const n of this.nodes){if(state.depleted.includes(n.id))continue;check(n,n.y+(n.type==='tree'?1.5:['rock','metalOre','sulfurOre'].includes(n.type)?.65:.5),n.type==='tree'?.9:['rock','metalOre','sulfurOre'].includes(n.type)?1.1:.75);}
  for(const obj of this.interactables){if(obj.type==='door'&&state.selected==='hammer')continue;if((obj.type==='crate'||obj.type==='barrel')&&state.looted.includes(obj.id)||state.depleted.includes(obj.id))continue;check(obj,terrainHeight(obj.x,obj.z)+.8,obj.radius);}
  for(const entry of [...this.built.values(),...this.staticStructures]){const b=entry.data;if((b.owner?state.depleted.includes(b.id):b.hp<=0)||!['foundation','wall','door','roof'].includes(b.kind))continue;if(b.kind==='foundation'&&direction.y>-.25||b.kind==='roof'&&direction.y<.15)continue;check({id:b.id,type:'structure',x:b.x,z:b.z,model:entry.model,data:b},terrainHeight(b.x,b.z)+(b.kind==='roof'?3:b.kind==='foundation'?.3:1.6),b.kind==='foundation'||b.kind==='roof'?1.8:1.35,state.selected==='rifle'?60:5.2);}
  for(const bot of this.bots)if(!bot.dead){const range=state.selected==='rifle'?90:3.6;check({id:bot.id,type:'bot',x:bot.x,z:bot.z,bot},terrainHeight(bot.x,bot.z)+1.1,.75,range);}
  if(best?.type==='bot'&&!this.lineOfSight(origin,new V(best.x,terrainHeight(best.x,best.z)+1,best.z),state))best=null;
  for(const wolf of this.wolves)if(!wolf.dead)check({...wolf,type:'wolf',wolf},wolf.model.position.y+.7,.9,state.selected==='rifle'?90:3.7);
  return best;
 }
 hitEffect(target,color=0xb8a27a){
  const group=new THREE.Group();const material=new THREE.MeshBasicMaterial({color});const r=randomSeed(Math.floor(this.time*1000));
  for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.025+r()*.035,0),material);m.position.set(target.x,terrainHeight(target.x,target.z)+1.2,target.z);group.add(m);m.userData.velocity=new V((r()-.5)*3,r()*3,(r()-.5)*3);}this.scene.add(group);this.effects.push({group,life:.65});
 }
 update(dt,state,playing,{moving=0,damage=()=>{}}={}){
  this.time+=dt;if(this.stormSky)this.stormSky.material.uniforms.time.value=this.time;if(this.wind)this.wind.value=this.time;if(this.ocean)this.ocean.material.uniforms.time.value=this.time;
  for(const f of this.fires){f.light.intensity=2.1+Math.sin(this.time*9)*.35;f.root.children.forEach((o,i)=>{if(o.isMesh){o.scale.set(1+Math.sin(this.time*6+i)*.12,1+Math.sin(this.time*10+i*2)*.22,1);o.rotation.y=this.time*.4+i;}});}
  if(this.motes){this.motes.rotation.y=this.time*.004;this.motes.position.y=Math.sin(this.time*.2)*.4;}
  this.birds.forEach((b,i)=>{const a=this.time*.045+i*1.2;b.position.set(Math.cos(a)*65,25+Math.sin(a*2+i)*4,Math.sin(a)*60);b.rotation.set(Math.sin(this.time*3+i)*.12,-a+Math.PI*.5,Math.sin(this.time*2+i)*.14);});
  if(playing){
   this.handRoot.visible=true;const selected=state.selected;this.heldRock.visible=!['axe','pickaxe','rifle','hammer','torch','satchel'].includes(selected);this.heldAxe.visible=selected==='axe';this.heldPickaxe.visible=selected==='pickaxe';this.heldGun.visible=selected==='rifle';this.heldHammer.visible=selected==='hammer';this.heldSatchel.visible=selected==='satchel';this.heldTorch.visible=selected==='torch';this.torchLight.intensity=selected==='torch'?2.3:0;
   this.swing=Math.max(0,this.swing-dt*3.2);const hit=Math.sin(this.swing*Math.PI);this.handRoot.position.set(.39+Math.sin(this.time*7)*moving*.012-hit*.17,-.43+Math.cos(this.time*14)*moving*.012+hit*.08,-.66-hit*.16);this.handRoot.rotation.set(-hit*.65,hit*.1,-.1+hit*.55);this.torchFlame.scale.y=1+Math.sin(this.time*15)*.18;
   const shadowCenter=new V(state.position.x,0,state.position.z);this.sun.target.position.copy(shadowCenter);this.sun.position.copy(shadowCenter).add(new V(40,52,12));this.sun.target.updateMatrixWorld();
   const dayPhase=(state.elapsed/1200+.36)%1,daylight=clamp(Math.sin(dayPhase*Math.PI*2)*1.7+.3,.06,1);this.sun.intensity=1.35*daylight;this.hemisphere.intensity=.3+daylight*.55;this.renderer.toneMappingExposure=.7+daylight*.25;if(this.stormSky)this.stormSky.material.uniforms.daylight.value=.25+daylight*.75;this.sky.material.uniforms.sunPosition.value.set(65,Math.max(-8,daylight*34),-80);
   this.updateBots(dt,state,damage);
   for(const w of this.wolves){if(w.dead)continue;w.cooldown-=dt;const d=Math.hypot(state.position.x-w.x,state.position.z-w.z),safe=Math.hypot(state.position.x+6,state.position.z+3)<17,aggro=d<12&&!safe;const tx=aggro?state.position.x:w.homeX+Math.sin(this.time*.07+this.stringSeed(w.id)%10)*5,tz=aggro?state.position.z:w.homeZ+Math.cos(this.time*.08)*5;const dx=tx-w.x,dz=tz-w.z,len=Math.hypot(dx,dz);if(len>.9&&d>1.4){const speed=aggro?2.8:.65;w.x+=dx/len*speed*dt;w.z+=dz/len*speed*dt;w.model.rotation.y=Math.atan2(dx,dz);this.setWolfAction(w,aggro?'Gallop':'Walk');}else this.setWolfAction(w,d<1.8&&aggro?'Attack':'Idle');
    if(d<1.9&&aggro&&w.cooldown<=0){w.cooldown=1.5;damage(12);}
    w.model.position.set(w.x,terrainHeight(w.x,w.z),w.z);w.mixer.update(dt);
   }
  }else if(this.handRoot)this.handRoot.visible=false;
  for(const effect of this.effects){effect.life-=dt;if(effect.line){effect.line.material.opacity=Math.max(0,effect.life*7);if(effect.life<=0){this.scene.remove(effect.line);effect.line.geometry.dispose();effect.line.material.dispose();}continue;}effect.group.children.forEach(m=>{m.userData.velocity.y-=dt*7;m.position.addScaledVector(m.userData.velocity,dt);m.scale.setScalar(Math.max(0,effect.life/.65));});if(effect.life<=0){this.scene.remove(effect.group);effect.group.children.forEach(m=>m.geometry.dispose());effect.group.children[0]?.material.dispose();}}this.effects=this.effects.filter(e=>e.life>0);
  this.radioLamp.visible=Math.sin(this.time*2)>0;for(const g of this.distantGroups)g.root.visible=Math.hypot(g.x-this.camera.position.x,g.z-this.camera.position.z)<g.range;
 }
 menuCamera(time){this.camera.position.set(13+Math.sin(time*.06)*.35,6.4,18+Math.cos(time*.06)*.3);this.camera.lookAt(-4,3,-7);}
 render(){this.camera.layers.set(0);this.renderer.autoClear=true;this.renderer.render(this.scene,this.camera);this.frameStats={calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles};if(this.handRoot?.visible){this.renderer.autoClear=false;this.renderer.clearDepth();this.camera.layers.set(1);const shadows=this.renderer.shadowMap.autoUpdate;this.renderer.shadowMap.autoUpdate=false;this.renderer.render(this.scene,this.camera);this.renderer.shadowMap.autoUpdate=shadows;this.camera.layers.set(0);this.renderer.autoClear=true;}this.needsRender=false;}
 get stats(){return{calls:this.frameStats?.calls||0,triangles:this.frameStats?.triangles||0,trees:this.nodes.filter(n=>n.type==='tree').length,models:Object.keys(this.models).length,monuments:MONUMENTS.length,bases:BOT_BASES.length,bots:this.bots.length,webgl2:this.renderer.capabilities.isWebGL2};}
}

installWorldSystems(IslandWorld);
