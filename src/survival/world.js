import {installPlacement40} from './placement40.js';
import {installCompounds38} from './compounds38.js';
import {renderHands35} from './render-hands35.js';
import {naturalRock33} from './materials12.js';
import {terrainChunks32} from './terrain-chunks32.js';
import {installFoundations32} from './foundations32.js';
import {texturePath30} from './asset-path30.js';
import {logPanel29} from './logs29.js';
import {installSolids29} from './solids29.js';
import {installBots29} from './bots29.js';
import {installPlayerPreview28} from './player-preview28.js';
import {installSpatial28} from './spatial28.js';
import {installGraphics28,assetTexture28,assetMaterials28} from './graphics28.js';
import {installTactics27} from './tactics27.js';
import {installSleeping27} from './sleeping-model27.js';
import {installSociety26} from './society26.js';
import {setWeaponSources26} from './weapon-sources26.js';
import {installWeaponMods25} from './weapon-mods25.js';
import {hempPlant25} from './hemp25.js';
import {installBiomeLife23} from './biome-life23.js';
import {berryBush23} from './bush-models23.js';
import {installGrass39} from './grass39.js';
import {installStationContext20} from './station-context20.js';
import {installSettlements20} from './settlements20.js';
import {installDamage20} from './damage20.js';
import {installRecyclerModels20} from './recycler-model20.js';
import {installPlayerVolume20} from './player-volume20.js';
import {installForestStreaming19} from './forest-stream19.js';
import {addForestNodes19} from './forest19.js';
import {installPhysics19} from './physics19.js';
import {installCacti18} from './cacti18.js';
import {obstacleContains17} from './spatial17.js';
import {addRockfields17} from './rockfields17.js';
import {installExplosives17} from './explosives17.js';
import {refreshEnvironment12} from './sky12.js';
import {PBR_FILES12,pbrMaterial12,dressMaterials12} from './materials12.js';
import {terrainMaterial12} from './terrain12.js';
import {initWater12} from './water12.js';
import {installVisuals12} from './visuals12.js';
import {ITEM_FILES16,itemTextures16,installItems16} from './items16.js';
import {installCulling16} from './visibility16.js';
import {installViewmodel14} from './viewmodel14.js';
import {installSurfaceTextures12} from './surface05.js';
import {checkLoading11} from './loading11.js';
import {paintLoading10} from './interface10.js';
import {installCollision08} from './collision08.js';
import {installAtmosphere08} from './atmosphere08.js';
import {installWeapons08} from './weapons08.js';
import {installBallistics08} from './ballistics08.js';
import {floorContains08,floorY08} from './roads08.js';
import {installPortrait06} from './portrait06.js';
import {installTerrainProps06} from './terrain-props06.js';
import {installPerformance06} from './performance06.js';
import {installHands05} from './hands05.js';
import {installProps05} from './props05.js';
import {installPerformance05} from './performance05.js';
import {installSettlements05} from './settlements05.js';
import {installGraphics05} from './graphics05.js';
import {installProjectiles04} from './projectiles04.js';
import {installWorld04,decorateLoot,structuralFloor} from './world04.js';
import {installViewmodel04} from './viewmodel04.js';
import {isFoundation,isFloor,isStructural} from './expansion.js';
import {installDev03,hempModel} from './dev03-world.js';
import {isGun} from './catalog.js';
import {safeCamp} from './health.js';
import {installTargeting} from './targeting.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { terrainGrid08, terrainHeight, noise, randomSeed, resourceNodes, clamp, WORLD_SEED, MONUMENTS, BOT_BASES, WORLD_RADIUS, TIERS, buildingHeight, damageStructure } from './state.js';
import {biomeAt} from './environment.js';
import {installEnvironmentSystems} from './environment-systems.js';
import {MAP_SCALE,MAP_REVISION} from './map-data.js';
import {addIslandContent} from './content.js';
import {installWorldSystems} from './world-systems.js';
const V=THREE.Vector3;
const ASSET='assets/';
export class IslandWorld {
 constructor(canvas,settings){
  this.canvas=canvas;this.settings=settings;this.time=0;this.models={};this.textures={};this.nodes=[];this.colliders=[];this.interactables=[];this.occluders=[];this.wolves=[];this.fires=[];this.built=new Map();this.swing=0;this.previewKind=null;this.previewRotation=0;this.treeBatches=[];this.effects=[];this.bots=[];this.distantGroups=[];this.staticStructures=[];this.walkFloors=[];
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',alpha:false});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;
  this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.scene=new THREE.Scene();this.scene.fog=null;
  this.camera=new THREE.PerspectiveCamera(69,1,.06,14000);this.camera.rotation.order='YXZ';this.scene.add(this.camera);
  this.sun=new THREE.DirectionalLight(0xffdab0,2.2);this.sun.position.set(40,52,12);this.sun.castShadow=true;
  Object.assign(this.sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:150});this.sun.shadow.bias=-.00015;this.sun.shadow.normalBias=.035;
  this.scene.add(this.sun,this.sun.target);
  this.lowAmbient=new THREE.AmbientLight(0xbbc8b7,settings.quality==='low'?1.8:0);this.scene.add(this.lowAmbient);
  this.hemisphere=new THREE.HemisphereLight(0xc4ddff,0x5b5140,.95);this.scene.add(this.hemisphere);
  this.sky=new Sky();this.sky.scale.setScalar(450);this.scene.add(this.sky);
  const su=this.sky.material.uniforms;su.turbidity.value=3.2;su.rayleigh.value=1.55;su.mieCoefficient.value=.0035;su.mieDirectionalG.value=.83;
  this.sunDirection=new V(50,17,-80).normalize();su.sunPosition.value.copy(this.sunDirection);
  this.environment=null;this.makeStormSky();
  this.applyQuality(settings.quality);this.resize();
  this.contextLost11=e=>{e.preventDefault();window.dispatchEvent(new Event('oskol-context-lost'));};this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost11);
 }
 resize(){this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)*(this.settings.renderScale28||1));this.renderer.setSize(window.innerWidth,window.innerHeight,false);this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();this.needsRender=true;}
 applyQuality(q){this.settings.quality=q;if(q!=='low'&&!this.environment)refreshEnvironment12(this);this.scene.environment=q==='low'?null:this.environment?.texture||null;if(this.lowAmbient)this.lowAmbient.intensity=q==='low'?1.8:0;this.renderer.shadowMap.enabled=q!=='low';const s=q==='high'?2048:1024;if(this.sun){this.sun.shadow.mapSize.set(s,s);if(this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null;}this.sun.shadow.needsUpdate=true;}this.invalidateGrass22?.();this.resize();}
 async init(progress,{signal}={}){
  checkLoading11(signal);
  const manager=new THREE.LoadingManager();manager.onProgress=(url,done,total)=>progress(Math.min(.82,done/Math.max(total,1)*.82),'Модели и текстуры: '+done+' / '+total);
  const loader=new GLTFLoader(manager),tl=new THREE.TextureLoader(manager);
  const names=['Carbine26','Smg26','CommonTree_1','CommonTree_3','Axe','Axe_Small','Tent','Bonfire','WoodLog','Backpack','Radio','WaterBottle_1','FirstAidKit','Can_Closed','Raft','Raft_Paddle','Crate','Barrel','Wolf','Rock_1','Rock_2','Rock_3','Plant_1','BushBerries_1','Adventurer','Swat','Shotgun_1','Pistol_1','PropaneTank','PineTree_1','PineTree_Snow_1','CommonTree_Dead_1'];
  const textureNames=['ground.jpg','sand.jpg','rockyGround_basecolor.png','rockyGround_normal.png','wood.jpg','BroadleafBark.jpg','BroadleafBark_Normal.png',...PBR_FILES12,...ITEM_FILES16];
  const bytes=async path=>{const response=await fetch(path,{signal});if(!response.ok)throw new Error('Не найден ресурс: '+path);return response;};
  // Bound simultaneous decode/parse peaks on mobile, including cancellation.
  let active28=0;const waiters28=[],decodeLimit28=this.settings.quality==='low'?2:3;
  const limited28=async work=>{while(active28>=decodeLimit28)await new Promise(resolve=>waiters28.push(resolve));active28++;try{checkLoading11(signal);return await work();}finally{active28--;waiters28.shift()?.();}};
  // Wait for every decoder before cleanup, including parsers already running at cancellation.
  const jobs=[...names.map(n=>limited28(async()=>{const response=await bytes(ASSET+'models/'+n+'.glb'),buffer=await response.arrayBuffer();checkLoading11(signal);this.models[n]=await loader.parseAsync(buffer,ASSET+'models/');assetMaterials28(this,this.models[n].scene);checkLoading11(signal);})),...textureNames.map(n=>limited28(async()=>{const response=await bytes(texturePath30(n)),blob=await response.blob();checkLoading11(signal);const url=URL.createObjectURL(blob);try{const t=await tl.loadAsync(url);this.textures[n]=t;checkLoading11(signal);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());if(!n.toLowerCase().includes('normal')&&!n.includes('-orm'))t.colorSpace=THREE.SRGBColorSpace;t.userData.assetName39=n;if(n.startsWith('pbr12/'))t.userData.kind12=n.split('/')[1].split('-')[0];assetTexture28(this,t);}finally{URL.revokeObjectURL(url);}}))];
  const results=await Promise.allSettled(jobs);checkLoading11(signal);const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;installSurfaceTextures12(this.textures);itemTextures16(this.textures);setWeaponSources26(this.models,this.textures);
  progress(.86,'Формируем рельеф, берег и водоёмы…');await paintLoading10(signal);checkLoading11(signal);await this.makeTerrain(signal);this.makeOcean();this.makeRiver();await paintLoading10(signal);await initWater12(this,signal);
  progress(.88,'Собираем дороги, перекрёстки и РТ…');await paintLoading10(signal);checkLoading11(signal);this.makeCamp();addIslandContent(this);addRockfields17(this);decorateLoot(this);this.alignTerrainProps06();
  progress(.91,'Размещаем ресурсы, лес и траву…');await paintLoading10(signal);checkLoading11(signal);this.makeResources();await this.makeGrass(signal,ratio=>progress(.91+ratio*.025,'Генерируем траву и растительность: '+Math.round(ratio*100)+'%'));
  progress(.94,'Подготавливаем предметы и снаряжение…');await paintLoading10(signal);checkLoading11(signal);this.makeViewModel();this.makeNewViewModels();this.makeItemArt();
  progress(.96,'Подготавливаем объекты мира…');await paintLoading10(signal);checkLoading11(signal);this.makeCoastalBoats();this.makeWolves();this.makeBots();this.makeAmbient();this.updateDayNight(0);
  progress(.98,'Завершаем подготовку геометрии…');await paintLoading10(signal);checkLoading11(signal);
  dressMaterials12(this);progress(1,'Геометрия и материалы острова готовы.');
 }
 async prepareEntry11(state,progress,signal){
  progress(0,'Подготавливаем траву вокруг точки входа…');await paintLoading10(signal);
  // Finish the local grass job now instead of gradually filling it after the player appears.
  this.streamGrass();let batches=0;
  while(this.localGrass?.userData.build){checkLoading11(signal);this.streamGrass();batches++;progress(Math.min(.35,batches/64),'Заполняем растительность вокруг игрока…');await paintLoading10(signal);}
  checkLoading11(signal);this.updateTreeVisibility();this.updateGrassVisibility();
  for(const g of this.distantGroups)g.root.visible=Math.hypot(g.x-this.camera.position.x,g.z-this.camera.position.z)<g.range;
  const center=new V(state.position.x,this.camera.position.y-1.72,state.position.z);this.sun.target.position.copy(center);this.sun.position.copy(center).addScaledVector(this.sunDirection,72);this.sun.target.updateMatrixWorld();
  progress(.40,'Компилируем материалы окружения в точке входа…');await paintLoading10(signal);
  this.camera.layers.set(0);await this.renderer.compileAsync(this.scene,this.camera);checkLoading11(signal);
  const views=[this.handRoot,...Object.values(this.weaponViews||{}),this.heldRock,this.heldAxe,this.heldPickaxe,this.heldPlan,this.heldHammer,this.heldSatchel,this.heldTorch].filter(Boolean),visibility=views.map(o=>o.visible);
  try{views.forEach(o=>o.visible=true);this.camera.layers.set(1);progress(.65,'Компилируем руки, инструменты и оружие…');await paintLoading10(signal);await this.renderer.compileAsync(this.scene,this.camera);checkLoading11(signal);}
  finally{views.forEach((o,i)=>o.visible=visibility[i]);this.camera.layers.set(0);}
  progress(.80,'Подготавливаем первый кадр и сглаживание…');await paintLoading10(signal);this.handRoot.visible=false;this.render();checkLoading11(signal);
  const lookups=(this.composer05?.passes||[]).flatMap(p=>[p.areaTexture,p.searchTexture]).filter(Boolean);await Promise.all(lookups.map(t=>t.image?.decode?.()));checkLoading11(signal);await paintLoading10(signal);this.render();checkLoading11(signal);
  progress(1,'Окружение точки входа готово.');
 }
 async makeTerrain(signal){
  const {segments,size}=terrainGrid08();const geometry=new THREE.PlaneGeometry(size,size,segments,segments);geometry.rotateX(-Math.PI/2);const p=geometry.attributes.position,colors=[],climate=[];
  for(let i=0;i<p.count;i++){if(i%8192===0)await paintLoading10(signal);const x=p.getX(i),z=p.getZ(i),h=terrainHeight(x,z);p.setY(i,h);const path=Math.abs(x-(5+Math.sin(z*.07)*2));const dirt=(z>-1&&z<25&&path<1.8)||Math.hypot(x+6,z+3)<11;
   const n=noise(x*.14,z*.14);const c=new THREE.Color(h<.8?0xd2bd8b:dirt?0x928460:biomeAt(x,z).color);c.multiplyScalar(.74+n*.42);colors.push(c.r,c.g,c.b);climate.push(biomeAt(x,z).climate25);
  }geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('snow',new THREE.Float32BufferAttribute(climate,1));geometry.computeVertexNormals();
  const material=terrainMaterial12(this);
  const terrain=terrainChunks32(geometry,segments,material);geometry.dispose();this.scene.add(terrain);this.terrain=terrain;
  // Distant rock silhouettes extend the island beyond the playable clearing.
  const rand=randomSeed(919);const rocky=naturalRock33(this);
  for(let i=0;i<17;i++){const a=rand()*Math.PI*2,x=Math.cos(a)*270*MAP_SCALE,z=Math.sin(a)*270*MAP_SCALE;const g=new THREE.IcosahedronGeometry(MAP_REVISION>=6?.9+rand()*2.1:3+rand()*5,2);const p=g.attributes.position;for(let j=0;j<p.count;j++){const f=.85+noise(p.getX(j)*.7+i,p.getZ(j)*.7)*.35;p.setXYZ(j,p.getX(j)*f,p.getY(j)*f,p.getZ(j)*f);}g.computeVertexNormals();const r=new THREE.Mesh(g,rocky);r.position.set(x,terrainHeight(x,z)-1,z);r.scale.y=MAP_REVISION>=6?1.1+rand()*.6:1.4+rand();r.castShadow=true;r.receiveShadow=true;this.scene.add(r);}
 }
 makeOcean(){
  const geometry=new THREE.PlaneGeometry(Math.max(4500,WORLD_RADIUS*5),Math.max(4500,WORLD_RADIUS*5),80,80);geometry.rotateX(-Math.PI/2);
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{time:{value:0},daylight:{value:1},skyColor:{value:new THREE.Color(0xb4c7c0)},sunDirection:{value:this.sunDirection},fogColor:{value:new THREE.Color(0x87bce2)}},vertexShader:`uniform float time;varying vec3 vPos;varying vec3 vNormal;void main(){vec3 p=position;p.y+=sin(p.x*.14+time*.6)*.10+sin(p.z*.21-time*.45)*.07;vNormal=normalize(vec3(-cos(p.x*.14+time*.6)*.014,1.,-cos(p.z*.21-time*.45)*.014));vec4 world=modelMatrix*vec4(p,1.);vPos=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`uniform float time;uniform float daylight;uniform vec3 skyColor;uniform vec3 sunDirection;uniform vec3 fogColor;varying vec3 vPos;varying vec3 vNormal;void main(){vec3 viewDir=normalize(cameraPosition-vPos);float fresnel=pow(1.-max(dot(viewDir,vNormal),0.),3.);float wave=sin(vPos.x*1.8+sin(vPos.z*.7+time)*2.+time)*.5+.5;float spark=pow(max(dot(reflect(-sunDirection,vNormal),viewDir),0.),140.);vec3 color=mix(vec3(.10,.24,.23),skyColor*.62,fresnel)+wave*.012+spark*vec3(1.,.77,.42)*1.7;float dist=length(cameraPosition-vPos);gl_FragColor=vec4(color*daylight,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.y=.08;mesh.name='Animated coastal water';this.scene.add(mesh);this.ocean=mesh;
 }
 normalized(name,height){const model=skeletonClone(this.models[name].scene);model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model,!!model.getObjectByProperty('isSkinnedMesh',true)),size=box.getSize(new V()),center=box.getCenter(new V());const root=new THREE.Group();model.position.set(-center.x,-box.min.y,-center.z);root.add(model);root.scale.setScalar(height/Math.max(.001,size.y));root.traverse(o=>{if(o.isMesh){if(o.isSkinnedMesh)o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.roughness=Math.max(m.roughness??.8,.55);if(m.map)m.map.anisotropy=Math.min(this.settings.anisotropy28||1,this.renderer.capabilities.getMaxAnisotropy());}}}});return root;}
 prop(name,x,z,height=1,rotation=0){const root=this.normalized(name,height);root.position.set(x,terrainHeight(x,z),z);root.rotation.y=rotation;this.scene.add(root);return root;}
 makeWoodMaterial(){return pbrMaterial12(this,'wood',{color:0xe5e0d4});}
 mergeParts(parts,material){const geometries=parts.map(m=>{m.updateMatrix();const g=m.geometry.clone();g.applyMatrix4(m.matrix);return g;});const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;parts.forEach(p=>p.geometry.dispose());return mesh;}
 timberGroup(kind){
  const group=new THREE.Group(),parts=[],material=this.woodMaterial||(this.woodMaterial=this.makeWoodMaterial());
  const box=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,1,.015));m.position.set(x,y,z);parts.push(m);};
  if(kind==='foundation'){
   for(let i=0;i<12;i++)box(.244,.15,3,-1.375+i*.25,.29,0);
   for(const z of[-1.15,1.15])box(3,.22,.17,0,.13,z);
   for(const x of[-1.15,1.15])for(const z of[-1.15,1.15])box(.17,.4,.17,x,.02,z);
  }else if(kind==='wall'){const wall=new THREE.Mesh(logPanel29(3,2.8,0,1.6),material);wall.castShadow=wall.receiveShadow=true;wall.userData.wallCore29=true;group.add(wall);
  }else if(kind==='door'){
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
  this.makeCabin();this.prop('Tent',8,-4,2.2,.4);this.prop('Backpack',7.4,-1.7,.65,-.8);for(const [id,x,z,h,rot]of[['camp-barrel-1',-11,-1,1.15,.1],['camp-barrel-2',-12,-2.3,1.03,-.2]]){const model=this.prop('Barrel',x,z,h,rot);this.interactables.push({id,type:'barrel',x,z,model,radius:.7});this.colliders.push({id,x,z,r:.48});}
  const fire=this.prop('Bonfire',-1,0,.65);this.addFire(fire.position.x,fire.position.z,.65);
  for(let i=0;i<4;i++)this.prop('WoodLog',-10.4+i*.35,3,.38,Math.PI*.5);
  this.prop('WaterBottle_1',-9,-3,.4);this.prop('FirstAidKit',-4.8,-6,.4,.7);
  this.prop('Raft',40,58,.6,-.7);this.prop('Raft_Paddle',39,57,.3,1.0);
  const crates=[['camp-1',-9,-5],['camp-2',9,-.8],['tower',-33,-32],['coast',35,48]];
  for(const[id,x,z]of crates){const model=this.prop('Crate',x,z,.85,id==='tower'?.8:0);this.interactables.push({id:'crate-'+id,type:'crate',x,z,model,radius:.9});this.colliders.push({id:'crate-'+id,x,z,r:.6});}
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
  const random=randomSeed(518);this.nodes=resourceNodes();addForestNodes19(this,this.nodes);const trees=this.nodes.filter(n=>n.type==='tree');
  const broadleaf=trees.filter(n=>!['snow','arid'].includes(biomeAt(n.x,n.z).id)&&!(biomeAt(n.x,n.z).id==='forest'&&n.z< -20*MAP_SCALE));
  this.vegetationInstances('CommonTree_1',broadleaf,9);
  this.makeBiomeTrees();
  this.groundingMaxError=0;for(const n of trees.filter((_,i)=>i%Math.max(1,Math.floor(trees.length/32))===0)){let low=Infinity;for(const ref of n.instances||[]){ref.batch.geometry.computeBoundingBox();const b=ref.batch.geometry.boundingBox.clone().applyMatrix4(ref.matrix);low=Math.min(low,b.min.y);}if(Number.isFinite(low))this.groundingMaxError=Math.max(this.groundingMaxError,Math.abs(low-terrainHeight(n.x,n.z)));}

  const rockMaterial=naturalRock33(this);
  for(const n of this.nodes){n.y=terrainHeight(n.x,n.z);if(n.type==='tree'){this.colliders.push({x:n.x,z:n.z,r:n.r,y:n.y,h:10,id:n.id});continue;}
   if(['rock','copperOre','metalOre','sulfurOre','highMetalOre'].includes(n.type)){
    // Rounded, textured geological mesh, not a cube or a collision-box placeholder.
    const g=new THREE.IcosahedronGeometry(.95+random()*.5,2),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=.82+noise(x*2+n.x,y*2+n.z)*.35;p.setXYZ(i,x*f,y*f*.78,z*f);}
    g.computeVertexNormals();const rm=rockMaterial.clone();rm.color.set(n.type==='copperOre'?0x807b70:n.type==='highMetalOre'?0x747f88:n.type==='metalOre'?0x9a9288:n.type==='sulfurOre'?0xaaa585:0x9d9d8b);n.model=new THREE.Mesh(g,rm);n.model.position.set(n.x,n.y+.4,n.z);n.model.rotation.y=random()*6.28;n.model.castShadow=true;n.model.receiveShadow=true;this.scene.add(n.model);if(n.type!=='rock'){const crystals=new THREE.Group();const oreMat=new THREE.MeshStandardMaterial({color:n.type==='copperOre'?0xb57a53:n.type==='highMetalOre'?0xabc6ce:n.type==='metalOre'?0x9c6b46:0xbbaf48,metalness:n.type==='metalOre'?.35:0,roughness:.75});for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.12+random()*.14,0),oreMat);const angle=random()*Math.PI*2;c.position.set(Math.sin(angle)*.85,.25+random()*.35,Math.cos(angle)*.85);c.scale.set(1,.12,1);crystals.add(c);}n.model.add(crystals);}n.r=1.0;this.colliders.push({x:n.x,z:n.z,r:.9,y:n.y-.3,h:1.9,id:n.id});
   }else if(['mushroom','pumpkin','corn'].includes(n.type)){n.model=this.iconModel04(n.type);n.model.position.set(n.x,n.y,n.z);n.model.scale.setScalar(.8);this.scene.add(n.model);}else if(n.type==='driftwood'){n.model=this.prop('WoodLog',n.x,n.z,.3,random()*6.28);}else if(n.type==='fiber'){n.model=hempPlant25(this);n.model.position.set(n.x,n.y,n.z);this.scene.add(n.model);}else if(n.type==='berries'){n.model=berryBush23(this,biomeAt(n.x,n.z).id);n.model.position.set(n.x,n.y,n.z);n.model.scale.setScalar(1.05);n.model.rotation.y=random()*6.28;this.scene.add(n.model);}else{n.model=this.prop('Plant_1',n.x,n.z,.75,random()*6.28);}
  }
 }
 stringSeed(str){let h=WORLD_SEED;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return h;}
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
  this.heldRock=new THREE.Mesh(new THREE.IcosahedronGeometry(.145,2),naturalRock33(this));this.heldRock.scale.set(1.15,1,.77);this.heldRock.position.set(-.02,.17,-.045);this.handRoot.add(this.heldRock);
  this.heldAxe=this.normalized('Axe',.72);this.heldAxe.rotation.set(.05,.55,-.25);this.heldAxe.position.set(-.03,-.11,-.02);this.handRoot.add(this.heldAxe);this.heldAxe.visible=false;
  this.heldTorch=new THREE.Group();const stick=new THREE.Mesh(new THREE.CylinderGeometry(.026,.034,.65,9),new THREE.MeshStandardMaterial({name:'WoodHandle14',color:0x67523b,roughness:1}));stick.position.y=.23;this.heldTorch.add(stick);const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.06,.042,.17,9),glove);wrap.position.y=.56;this.heldTorch.add(wrap);this.torchFlame=new THREE.Mesh(new THREE.ConeGeometry(.065,.24,7),new THREE.MeshBasicMaterial({color:0xffb24b,transparent:true,opacity:.85,depthWrite:false}));this.torchFlame.position.y=.75;this.heldTorch.add(this.torchFlame);this.handRoot.add(this.heldTorch);this.heldTorch.visible=false;
  this.torchLight=new THREE.PointLight(0xffa558,0,12,2);this.torchLight.position.set(0,.6,0);this.handRoot.add(this.torchLight);
  this.heldGun=this.normalized('Shotgun_1',.25);this.heldGun.rotation.set(0,Math.PI*.5,-.04);this.heldGun.position.set(-.06,.12,-.25);this.handRoot.add(this.heldGun);
  this.heldPickaxe=new THREE.Group();const pickWood=new THREE.MeshStandardMaterial({name:'WoodHandle14',map:this.textures['wood.jpg'],color:0x756446,roughness:1}),pickMetal=new THREE.MeshStandardMaterial({color:0x7e8478,metalness:.5,roughness:.8});const ph=new THREE.Mesh(new THREE.CylinderGeometry(.022,.03,.72,9),pickWood);ph.position.y=.22;this.heldPickaxe.add(ph);const head=new THREE.Mesh(new THREE.ConeGeometry(.065,.40,7),pickMetal);head.rotation.z=Math.PI*.5;head.position.set(.05,.52,0);this.heldPickaxe.add(head);this.heldPickaxe.rotation.z=-.2;this.handRoot.add(this.heldPickaxe);
  this.heldHammer=new THREE.Group();const hh=ph.clone();hh.scale.y=.65;this.heldHammer.add(hh);const hb=new THREE.Mesh(new RoundedBoxGeometry(.23,.16,.14,2,.025),pickWood);hb.position.y=.42;this.heldHammer.add(hb);this.handRoot.add(this.heldHammer);
  this.heldSatchel=new THREE.Mesh(new RoundedBoxGeometry(.24,.23,.12,2,.03),new THREE.MeshStandardMaterial({color:0x665b3e,roughness:1}));this.heldSatchel.position.set(0,.15,0);this.handRoot.add(this.heldSatchel);
  this.handRoot.traverse(o=>{o.layers.set(1);if(o.isMesh){o.renderOrder=0;const ms=Array.isArray(o.material)?o.material:[o.material];o.material=ms.map(m=>{const c=m.clone();c.depthTest=true;c.depthWrite=true;c.envMapIntensity=.6;return c;});if(o.material.length===1)o.material=o.material[0];o.castShadow=false;o.receiveShadow=false;}});this.handRoot.visible=false;this.sun.layers.enable(1);this.hemisphere.layers.enable(1);this.lowAmbient.layers.enable(1);this.torchLight.layers.enable(1);
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
  for(const n of this.nodes){const gone=state.depleted.includes(n.id);if(n.type==='tree'){for(const ref of n.instances){const m=gone?new THREE.Matrix4().makeScale(.000001,.000001,.000001).setPosition(0,-10000,0):ref.matrix;ref.batch.setMatrixAt(ref.index,m);ref.batch.instanceMatrix.needsUpdate=true;}}else n.model.visible=!gone;n.remaining=gone?0:(state.nodeDamage[n.id]??n.hp);}
  for(const item of this.interactables){if(item.type==='barrel'){item.model.visible=!state.depleted.includes(item.id);if(item.model.visible&&item.savedCollider&&!this.colliders.some(c=>c.id===item.id))this.colliders.push({...item.savedCollider});}if(item.type==='crate'){item.model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(state.looted.includes(item.id))o.material.color.multiplyScalar(.6);}});}}
  for(const w of this.wolves){w.dead=state.depleted.includes(w.id);w.model.visible=!w.dead;w.hp=65;w.x=w.homeX;w.z=w.homeZ;w.model.position.set(w.x,terrainHeight(w.x,w.z),w.z);}
  for(const[id,entry]of this.built){this.scene.remove(entry.model);if(entry.fire){this.scene.remove(entry.fire.root);this.fires=this.fires.filter(f=>f!==entry.fire);}this.built.delete(id);}
  this.colliders=this.colliders.filter(c=>!c.built);
  for(const b of state.buildings)if(b.hp>0)this.addBuilding(b);
  this.interactables=this.interactables.filter(i=>!i.id.startsWith('build-')||state.buildings.some(b=>b.id===i.id&&b.hp>0));
  for(const entry of this.staticStructures){entry.model.visible=!state.depleted.includes(entry.data.id);entry.data.open=false;if(entry.model.userData.doorPivot)entry.model.userData.doorPivot.rotation.y=0;}
  for(const bot of this.bots){bot.hp=state.botState[bot.id]?.hp??120;bot.dead=bot.hp<=0;bot.model.visible=!bot.dead;bot.weapon.visible=!bot.dead;bot.x=bot.homeX+(bot.spawnXOffset17??4);bot.z=bot.homeZ+bot.spawnOffset;bot.y=this.floorHeight(bot.x,bot.z,state,bot.y??terrainHeight(bot.x,bot.z)+.5);bot.model.rotation.z=0;}
  this.nodes.forEach(n=>{if(n.model)n.model.visible=!state.depleted.includes(n.id);});
 }
 hideNode(node){if(node.type==='tree'){for(const ref of node.instances){ref.batch.setMatrixAt(ref.index,new THREE.Matrix4().makeScale(.000001,.000001,.000001).setPosition(0,-10000,0));ref.batch.instanceMatrix.needsUpdate=true;}}else node.model.visible=false;}
 addBuilding(b){
  let model,fire;
  if(['storage','largeStorage'].includes(b.kind)){model=this.normalized('Crate',b.kind==='storage'?.75:1.15);model.position.set(b.x,buildingHeight(b),b.z);model.rotation.y=b.rotation;this.scene.add(model);this.interactables.push({id:b.id,type:'storage',x:b.x,z:b.z,model,data:b});this.colliders.push({id:b.id,x:b.x,z:b.z,r:b.kind==='storage'?.6:.9,built:true,data:b});}
  else if(b.kind==='furnace'||b.kind==='workbench'){model=this.stationModel(b.kind);model.position.set(b.x,buildingHeight(b),b.z);model.rotation.y=b.rotation;this.scene.add(model);this.interactables.push({id:b.id,type:b.kind,x:b.x,z:b.z,model,data:b,radius:1.1});}
  else if(b.kind==='campfire'){model=this.normalized('Bonfire',.65);model.position.set(b.x,buildingHeight(b),b.z);this.scene.add(model);this.addFire(b.x,b.z,.65,buildingHeight(b));fire=this.fires.at(-1);}
  else{model=this.timberGroup(b.kind);model.position.set(b.x,buildingHeight(b),b.z);model.rotation.y=b.rotation;this.scene.add(model);}

  if(['furnace','workbench'].includes(b.kind))this.colliders.push({id:b.id,box:true,x:b.x,z:b.z,w:b.kind==='furnace'?1.4:1.9,d:b.kind==='furnace'?1.4:.8,y:buildingHeight(b),h:b.kind==='furnace'?1.9:1.3,data:b,built:true});this.built.set(b.id,{model,fire,data:b});this.applyBuildingTier({model,data:b});
  if(b.kind==='door'&&model.userData.doorPivot){model.userData.doorPivot.rotation.y=b.open?1.6:0;this.interactables=this.interactables.filter(i=>i.id!==b.id);this.interactables.push({id:b.id,type:'door',x:b.x,z:b.z,model,radius:1.4,data:b});}
  if(b.kind==='wall'||b.kind==='door')this.colliders.push({box:true,x:b.x,z:b.z,w:Math.abs(Math.cos(b.rotation))>0.5?3:.18,d:Math.abs(Math.cos(b.rotation))>0.5?.18:3,id:b.id,built:true,y:buildingHeight(b),h:3.02,door:b.kind==='door',data:b});
 }
 preview(kind,position,rotation,ok){
  if(this.previewKind!==kind){if(this.ghost)this.scene.remove(this.ghost);this.ghost=['storage','largeStorage'].includes(kind)?this.normalized('Crate',kind==='storage'?.75:1.15):kind==='campfire'?this.normalized('Bonfire',.65):['furnace','workbench','cupboard','recycler','repairBench','sleepingBag'].includes(kind)?this.stationModel(kind):this.timberGroup(kind);this.ghost.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:0xb5d98b,wireframe:true,transparent:true,opacity:.65,depthWrite:false});o.castShadow=false;o.receiveShadow=false;}});this.scene.add(this.ghost);this.previewKind=kind;}
  this.ghost.visible=true;this.ghost.position.set(position.x,position.y??terrainHeight(position.x,position.z),position.z);this.ghost.rotation.y=rotation;this.ghost.traverse(o=>{if(o.isMesh)o.material.color.set(ok?0xb6db8c:0xea885b);});
 }
 clearPreview(){if(this.ghost)this.ghost.visible=false;}
 floorHeight(x,z,state,feetY=state.feetY??terrainHeight(x,z)+.5,point20=false){this.refreshDead05?.(state);let h=point20?terrainHeight(x,z):Math.max(terrainHeight(x,z),...[[.22,0],[-.22,0],[0,.22],[0,-.22]].map(([a,b])=>terrainHeight(x+a,z+b)));for(const b of state.buildings)if(b.hp>0&&Math.abs(x-b.x)<1.5&&Math.abs(z-b.z)<1.5){if(b.kind==='foundation'&&feetY>=buildingHeight(b)-.12)h=Math.max(h,buildingHeight(b)+.38);if(b.kind==='roof'&&feetY>=buildingHeight(b)+2.8)h=Math.max(h,buildingHeight(b)+3.11);}for(const b of state.buildings)if(b.hp>0)h=Math.max(h,structuralFloor(b,x,z,feetY));for(const f of(this.nearFloors05?.(x,z)||this.walkFloors))if((!f.structureId||!(this.deadIds05?.has(f.structureId)??state.depleted.includes(f.structureId)))&&(feetY>=floorY08(f,x,z)-.5)&&floorContains08(f,x,z,!point20&&f.vehicle08?.28:0))h=Math.max(h,floorY08(f,x,z));// Finite scenery needs a landing surface as well as a side wall. In particular,
 // the capsule must not fall through the expanded edge of a car / tank / crate.
 for(const c of(this.nearColliders?.(x,z)||this.colliders)){
  if(c.deck08||!Number.isFinite(c.y)||!(c.scenery||c.site17||c.built)||c.id&&(this.deadIds05?.has(c.id)??state.depleted.includes(c.id))||c.data?.hp<=0||c.door&&c.data?.open)continue;
  const top=c.y+(c.h??3.02);if(feetY>=top-.5&&obstacleContains17(c,x,z,point20?0:.28))h=Math.max(h,top);
 }
 if(x>-10.3&&x<-3.7&&z>-7.5&&z<-2.5)h=Math.max(h,terrainHeight(-7,-5)+.27);return h;}

 canMove(x,z,state,feetY=null){this.refreshDead05?.(state);
  if(Math.hypot(x,z)>WORLD_RADIUS*1.48&&!this.walkFloors.some(f=>f.offshore&&Math.abs(x-f.x)<f.w/2+1&&Math.abs(z-f.z)<f.d/2+1))return false;
  for(const c of (this.nearColliders?this.nearColliders(x,z):this.colliders)){if(c.deck08&&feetY!==null){const top=floorY08(c,x,z);if(feetY>=top-.48||feetY+(state.crouched?1.05:1.7)<top-.3)continue;}if(feetY!==null&&(c.box||Number.isFinite(c.y))&&(feetY>=(c.y??terrainHeight(c.x,c.z))+(c.h??3.02)-.02||feetY+(state.crouched?1.05:1.7)<(c.y??terrainHeight(c.x,c.z))))continue;if(c.id&&(this.deadIds05?.has(c.id)??state.depleted.includes(c.id))||c.data&&!c.data.owner&&c.data.hp<=0||c.door&&c.data.open)continue;if(c.box){const dx=x-c.x,dz=z-c.z,angle=c.rotation||0,co=Math.cos(angle),si=Math.sin(angle);if(Math.abs(dx*co-dz*si)<(c.ow||c.w)/2+.27&&Math.abs(dx*si+dz*co)<(c.od||c.d)/2+.27)return false;}else if(Math.hypot(x-c.x,z-c.z)<c.r+.26)return false;}
  return true;
 }

 hitEffect(target,color=0xb8a27a){
  const group=new THREE.Group();const material=new THREE.MeshBasicMaterial({color});const r=randomSeed(Math.floor(this.time*1000));
  for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.025+r()*.035,0),material);if(target.hitPoint)m.position.copy(target.hitPoint);else m.position.set(target.x,target.y??target.data?.y??terrainHeight(target.x,target.z)+1.2,target.z);group.add(m);m.userData.velocity=new V((r()-.5)*3,r()*3,(r()-.5)*3);}this.scene.add(group);this.effects.push({group,life:.65});
 }
 update(dt,state,playing,{moving=0,damage=()=>{}}={}){
  this.time+=dt;if(this.stormSky)this.stormSky.material.uniforms.time.value=this.time;if(this.wind)this.wind.value=this.time;if(this.ocean)this.ocean.material.uniforms.time.value=this.time;
  for(const f of this.fires){f.light.intensity=2.1+Math.sin(this.time*9)*.35;f.root.children.forEach((o,i)=>{if(o.isMesh&&!f.modern08){o.scale.set(1+Math.sin(this.time*6+i)*.12,1+Math.sin(this.time*10+i*2)*.22,1);o.rotation.y=this.time*.4+i;}});}
  if(this.motes){this.motes.rotation.y=this.time*.004;this.motes.position.y=Math.sin(this.time*.2)*.4;}
  this.birds.forEach((b,i)=>{const a=this.time*.045+i*1.2;b.position.set(Math.cos(a)*65,25+Math.sin(a*2+i)*4,Math.sin(a)*60);b.rotation.set(Math.sin(this.time*3+i)*.12,-a+Math.PI*.5,Math.sin(this.time*2+i)*.14);});
  if(playing){
   this.updateDayNight(state.elapsed);this.handRoot.visible=true;const selected=state.selected;this.heldRock.visible=!isGun(selected)&&!['axe','pickaxe','hammer','torch','satchel','plan'].includes(selected);this.heldAxe.visible=selected==='axe';this.heldPickaxe.visible=selected==='pickaxe';for(const [id,view]of Object.entries(this.weaponViews))view.visible=selected===id;this.heldPlan.visible=selected==='plan';this.heldHammer.visible=selected==='hammer';this.heldSatchel.visible=selected==='satchel';this.heldTorch.visible=selected==='torch';this.torchLight.intensity=selected==='torch'?2.3:0;
   this.swing=Math.max(0,this.swing-dt*3.2);if(!this.viewmodel14){const hit=Math.sin(this.swing*Math.PI);this.handRoot.position.set(.39+Math.sin(this.time*7)*moving*.012-hit*.17,-.43+Math.cos(this.time*14)*moving*.012+hit*.08,-.66-hit*.16);this.handRoot.rotation.set(-hit*.65,hit*.1,-.1+hit*.55);}this.torchFlame.scale.y=1+Math.sin(this.time*15)*.18;
   const shadowCenter=new V(state.position.x,this.camera.position.y-1.72,state.position.z);this.sun.target.position.copy(shadowCenter);this.sun.position.copy(shadowCenter).add(this.sunDirection.clone().multiplyScalar(72));this.sun.target.updateMatrixWorld();

   this.updateBots(dt,state,damage);
   for(const w of this.wolves){if(w.dead)continue;w.cooldown-=dt;const d=Math.hypot(state.position.x-w.x,state.position.z-w.z),safe=safeCamp(state.position.x,state.position.z),aggro=d<12&&!safe;const tx=aggro?state.position.x:w.homeX+Math.sin(this.time*.07+this.stringSeed(w.id)%10)*5,tz=aggro?state.position.z:w.homeZ+Math.cos(this.time*.08)*5;const dx=tx-w.x,dz=tz-w.z,len=Math.hypot(dx,dz);if(len>.9&&d>1.4){const speed=aggro?2.8:.65;w.x+=dx/len*speed*dt;w.z+=dz/len*speed*dt;w.model.rotation.y=Math.atan2(dx,dz);this.setWolfAction(w,aggro?'Gallop':'Walk');}else this.setWolfAction(w,d<1.8&&aggro?'Attack':'Idle');
    if(d<1.9&&aggro&&w.cooldown<=0){w.cooldown=1.5;damage(12,'wolf');}
    w.model.position.set(w.x,terrainHeight(w.x,w.z),w.z);w.mixer.update(dt);
   }
  }else if(this.handRoot)this.handRoot.visible=false;
  for(const effect of this.effects){effect.life-=dt;if(effect.line){effect.line.material.opacity=Math.max(0,effect.life*7);if(effect.life<=0){this.scene.remove(effect.line);effect.line.geometry.dispose();effect.line.material.dispose();}continue;}effect.group.children.forEach(m=>{m.userData.velocity.y-=dt*7;m.position.addScaledVector(m.userData.velocity,dt);m.scale.setScalar(Math.max(0,effect.life/.65));});if(effect.life<=0){this.scene.remove(effect.group);effect.group.children.forEach(m=>m.geometry.dispose());effect.group.children[0]?.material.dispose();}}this.effects=this.effects.filter(e=>e.life>0);
  this.dormancyTimer=(this.dormancyTimer||0)-dt;if(this.dormancyTimer<=0){this.dormancyTimer=.35;this.updateDormancy(state);}
  this.radioLamp.visible=Math.sin(this.time*2)>0;for(const g of this.distantGroups)g.root.visible=Math.hypot(g.x-this.camera.position.x,g.z-this.camera.position.z)<g.range;
 }
 menuCamera(time){this.camera.position.set(13+Math.sin(time*.06)*.35,6.4,18+Math.cos(time*.06)*.3);this.camera.lookAt(-4,3,-7);}
 render(){if(this.stormSky)this.stormSky.position.copy(this.camera.position);this.updateTreeVisibility();this.renderedFrames=(this.renderedFrames||0)+1;this.updateGrassVisibility();this.camera.layers.set(0);this.renderer.autoClear=true;this.renderer.render(this.scene,this.camera);this.frameStats={calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles};if(this.handRoot?.visible)renderHands35(this);this.needsRender=false;}
 actorBounds40(b){return new THREE.Box3().setFromObject(b.model,true);}
 get stats(){return{visibility:this.visibilityStats16,frames:this.renderedFrames||0,groundingMaxError:this.groundingMaxError,river:!!this.river,daylight:this.dayCycle?.daylight??1,understoryTiles23:this.biomeLife23?.tiles.size||0,understoryQueue23:this.biomeLife23?.queue.length||0,grassTiles22:this.grass22?.tiles.size||0,grassQueue22:this.grass22?.queue.length||0,grassInstances:(this.localGrass?.count||0)+(this.grassChunks||[]).reduce((n,c)=>n+c.mesh.count,0),visibleGrass:(this.localGrass?.visible?this.localGrass.count:0)+(this.grassChunks||[]).reduce((n,c)=>n+(c.mesh.visible?c.mesh.count:0),0),calls:this.frameStats?.calls||0,triangles:this.frameStats?.triangles||0,trees:this.nodes.filter(n=>n.type==='tree').length,models:Object.keys(this.models).length,monuments:MONUMENTS.length,bases:BOT_BASES.length,bots:this.bots.length,aiUpdates:this.bots.reduce((n,b)=>n+(b.aiUpdates||0),0),nearColliders:this.nearColliders(this.camera.position.x,this.camera.position.z).length,dormantBots:this.bots.filter(b=>Math.hypot(b.x-this.camera.position.x,b.z-this.camera.position.z)>100).length,boats:this.boats?.length||0,webgl2:this.renderer.capabilities.isWebGL2};}
}

installWorldSystems(IslandWorld);

installEnvironmentSystems(IslandWorld);

installDev03(IslandWorld);
installTargeting(IslandWorld);

installWorld04(IslandWorld);
installViewmodel04(IslandWorld);

installProjectiles04(IslandWorld);

installSettlements05(IslandWorld);
installGraphics05(IslandWorld);

installPerformance05(IslandWorld);

installProps05(IslandWorld);
installHands05(IslandWorld);

installTerrainProps06(IslandWorld);
installPerformance06(IslandWorld);

installPortrait06(IslandWorld);

installBallistics08(IslandWorld);

installWeapons08(IslandWorld);

installAtmosphere08(IslandWorld);

installCollision08(IslandWorld);

installVisuals12(IslandWorld);

installViewmodel14(IslandWorld);
installItems16(IslandWorld);
installExplosives17(IslandWorld);
installCulling16(IslandWorld);
installCacti18(IslandWorld);

installPhysics19(IslandWorld);

installForestStreaming19(IslandWorld);

installPlayerVolume20(IslandWorld);

installRecyclerModels20(IslandWorld);

installSettlements20(IslandWorld);
installDamage20(IslandWorld);

installStationContext20(IslandWorld);

installGrass39(IslandWorld);
installBiomeLife23(IslandWorld);

installWeaponMods25(IslandWorld);

installSociety26(IslandWorld);

installSleeping27(IslandWorld);

installTactics27(IslandWorld);

installGraphics28(IslandWorld);

installSpatial28(IslandWorld);

installPlayerPreview28(IslandWorld);

installSolids29(IslandWorld);
installBots29(IslandWorld);

installFoundations32(IslandWorld);

installCompounds38(IslandWorld);

installPlacement40(IslandWorld);
