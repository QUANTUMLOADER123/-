import * as THREE from 'three';
import {terrainHeight,TIERS,BOT_BASES,MONUMENTS,damageStructure,clamp} from './state.js';
const V=THREE.Vector3;
export function installWorldSystems(IslandWorld){
 Object.assign(IslandWorld.prototype,{
 makeStormSky(){
  this.sky.visible=false;const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},daylight:{value:1}},vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vDir;uniform float time;uniform float daylight;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}void main(){vec3 d=normalize(vDir);float y=max(d.y,0.);vec2 p=d.xz/(y+.35)*2.+time*.002;float n=noise(p)*.5+noise(p*2.1)*.25+noise(p*4.3)*.125;vec3 horizon=vec3(.24,.30,.29),zenith=vec3(.09,.14,.16);vec3 color=mix(horizon,zenith,pow(y,.4));color+=vec3(.13,.14,.13)*(n-.35);color*=daylight;gl_FragColor=vec4(color,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});this.stormSky=new THREE.Mesh(new THREE.SphereGeometry(1200,24,16),material);this.stormSky.renderOrder=-10;this.scene.add(this.stormSky);
 },
 stationModel(kind){
  const group=new THREE.Group(),mats=this.constructionMaterials||{},stone=mats.concrete||new THREE.MeshStandardMaterial({color:0x737b6b,roughness:1});
  if(kind==='furnace'){const base=new THREE.Mesh(new THREE.CylinderGeometry(.63,.8,1.25,14),stone);base.position.y=.62;group.add(base);const cone=new THREE.Mesh(new THREE.ConeGeometry(.65,.7,14),stone);cone.position.y=1.55;group.add(cone);const hole=new THREE.Mesh(new THREE.CircleGeometry(.28,12),new THREE.MeshBasicMaterial({color:0x1b1b12}));hole.position.set(0,.65,.66);group.add(hole);const fire=new THREE.Mesh(new THREE.CircleGeometry(.17,9),new THREE.MeshBasicMaterial({color:0xc47b38}));fire.position.set(0,.61,.68);group.add(fire);}
  else{const wood=this.woodMaterial;const top=new THREE.Mesh(new THREE.BoxGeometry(1.9,.16,.8),wood);top.position.y=1.1;group.add(top);for(const x of[-.75,.75])for(const z of[-.28,.28]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.1,1.1,.1),wood);leg.position.set(x,.55,z);group.add(leg);}const vice=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.3),mats.metal||stone);vice.position.set(.5,1.29,0);group.add(vice);}
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return group;
 },
 applyBuildingTier(entry){
  const {model,data}=entry,tier=data.tier||0;if(!['wall','door','roof','foundation'].includes(data.kind))return;
  model.traverse(o=>{if(!o.isMesh)return;const mat=tier<2?this.woodMaterial.clone():new THREE.MeshStandardMaterial({map:this.textures[tier===2?'rockyGround_basecolor.png':'wood.jpg'],normalMap:tier===2?this.textures['rockyGround_normal.png']:null,color:TIERS[tier].color,roughness:tier===3?.65:1,metalness:tier===3?.6:0});mat.color.set(TIERS[tier].color);o.material=mat;});
  // Higher tiers have physical reinforcement, rather than only a color swap.
  if(entry.reinforcements){model.remove(entry.reinforcements);entry.reinforcements.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
  if(tier>=1&&['wall','door'].includes(data.kind)){const rails=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:tier>=2?0x515a53:0x514c34,metalness:tier>=2?.5:0,roughness:.8});for(const y of[.63,2.45]){const m=new THREE.Mesh(new THREE.BoxGeometry(3,.09,.09),material);m.position.set(0,y,-.09);rails.add(m);}if(tier===3){for(const x of[-1.3,1.3]){const m=new THREE.Mesh(new THREE.BoxGeometry(.12,2.6,.1),material);m.position.set(x,1.6,.1);rails.add(m);}}model.add(rails);entry.reinforcements=rails;}
 },
 lineOfSight(a,b,state){
  const d=b.clone().sub(a),len=d.length(),steps=Math.max(1,Math.ceil(len/1.2));
  for(let i=1;i<steps;i++){const t=i/steps;if(terrainHeight(a.x+d.x*t,a.z+d.z*t)>a.y+d.y*t+.15)return false;}
  // Slab/ray intersection cannot skip thin walls as coarse sampled rays could.
  const ray=new THREE.Ray(a,d.normalize()),box=new THREE.Box3(),hit=new V();
  for(const c of this.colliders){
   if(!c.box||!c.data||c.data.open||state.depleted.includes(c.id)||!c.data.owner&&c.data.hp<=0)continue;
   const ground=terrainHeight(c.x,c.z);box.min.set(c.x-c.w/2,ground,c.z-c.d/2);box.max.set(c.x+c.w/2,ground+3.15,c.z+c.d/2);
   if(ray.intersectBox(box,hit)&&hit.distanceToSquared(a)<(len-.05)**2)return false;
  }
  return true;
 },
 makeBots(){
  const spawns=BOT_BASES.flatMap(b=>[0,1].map(i=>({id:b.id+'-'+i,base:b.id,x:b.x,z:b.z,slot:i,skin:i?'Swat':'Adventurer'})));for(const m of MONUMENTS.filter(m=>m.risk>=3))spawns.push({id:'guard-'+m.id,base:null,x:m.x,z:m.z,skin:'Swat'});
  for(const data of spawns){const model=this.normalized(data.skin,1.78);this.scene.add(model);const weapon=this.normalized('Pistol_1',.2);this.scene.add(weapon);const bones={};model.updateMatrixWorld(true);model.traverse(o=>{if(o.isBone){const inverse=o.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bones[o.name]={bone:o,base:o.quaternion.clone(),x:new V(1,0,0).applyQuaternion(inverse),y:new V(0,1,0).applyQuaternion(inverse),z:new V(0,0,1).applyQuaternion(inverse)};}});const bot={id:data.id,base:data.base,homeX:data.x,homeZ:data.z,spawnOffset:data.slot===1?6:3,x:data.x+4,z:data.z+(data.slot===1?6:3),model,weapon,bones,hp:120,dead:false,mode:'patrol',cooldown:0,phase:this.stringSeed(data.id)%100,actionTime:0,alertUntil:0};this.bots.push(bot);this.animateBot(bot,0,0,false);bot.model.visible=bot.weapon.visible=Math.hypot(bot.x,bot.z)<150;}
 },
 animateBot(bot,dt,moving,shooting){
  const t=this.time*6+bot.phase;
  const q=this.botRotation||(this.botRotation=new THREE.Quaternion());
  const rotate=(name,x=0,y=0,z=0)=>{const b=bot.bones[name.replaceAll('.','')];if(!b)return;b.bone.quaternion.copy(b.base);if(z)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.z,z));if(y)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.y,y));if(x)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.x,x));};
  rotate('UpperLeg.L',Math.sin(t)*moving*.48);rotate('UpperLeg.R',-Math.sin(t)*moving*.48);rotate('LowerLeg.L',Math.max(0,-Math.sin(t))*moving*.5);rotate('LowerLeg.R',Math.max(0,Math.sin(t))*moving*.5);
  rotate('UpperArm.L',Math.sin(t)*moving*.22,shooting?-1.25:0,shooting?-.15:-1.22);rotate('UpperArm.R',-Math.sin(t)*moving*.22,shooting?1.25:0,shooting?.15:1.22);rotate('LowerArm.R',0,shooting?.35:.25);rotate('LowerArm.L',0,shooting?-.35:-.25);rotate('Head',0,shooting?0:Math.sin(this.time*.7+bot.phase)*.13,0);
  const y=terrainHeight(bot.x,bot.z);bot.model.position.set(bot.x,y+Math.sin(t*2)*moving*.018,bot.z);const forward=new V(Math.sin(bot.model.rotation.y),0,Math.cos(bot.model.rotation.y));bot.weapon.position.set(bot.x+forward.x*.32,y+(shooting?1.35:1.03),bot.z+forward.z*.32);bot.weapon.rotation.set(0,bot.model.rotation.y+Math.PI*.5,0);
 },
 updateBots(dt,state,damage){
  for(const bot of this.bots){if(bot.dead){bot.model.visible=false;bot.weapon.visible=false;continue;}const dist=Math.hypot(bot.x-state.position.x,bot.z-state.position.z);bot.model.visible=bot.weapon.visible=dist<150;if(dist>160)continue;bot.cooldown-=dt;bot.actionTime+=dt;
   const homeDistance=Math.hypot(state.position.x-bot.homeX,state.position.z-bot.homeZ),safe=Math.hypot(state.position.x+6,state.position.z+3)<23;
   const aggro=!safe&&(state.difficulty==='hard'?dist<42:state.difficulty==='peaceful'?bot.alertUntil>this.time:dist<27||homeDistance<18)||bot.alertUntil>this.time;
   let moving=0,shooting=false,tx=bot.homeX,tz=bot.homeZ;
   if(aggro){bot.mode='defend';const target=new V(state.position.x,this.camera.position.y-.25,state.position.z),origin=new V(bot.x,terrainHeight(bot.x,bot.z)+1.3,bot.z);const los=this.lineOfSight(origin,target,state);bot.model.rotation.y=Math.atan2(state.position.x-bot.x,state.position.z-bot.z);
    if(dist<32&&los){shooting=true;if(bot.cooldown<=0){bot.cooldown=state.difficulty==='hard'?1.0:1.7;this.tracer(origin,target,0xd1b27c);if(Math.sin(this.time*4+bot.phase)>.15)damage(state.difficulty==='hard'?16:10);}}
    else{tx=state.position.x;tz=state.position.z;moving=dist>3?1:0;if(!los&&bot.cooldown<=0){const barrier=[...this.built.values()].find(e=>e.data.hp>0&&['wall','door'].includes(e.data.kind)&&Math.hypot(e.data.x-bot.x,e.data.z-bot.z)<8);if(barrier){bot.cooldown=2.4;damageStructure(state,barrier.data,4);if(barrier.data.hp<=0)barrier.model.visible=false;}}}
   }else{
    const cycle=(this.time+bot.phase)%35;if(cycle<18){bot.mode='patrol';tx=bot.homeX+Math.sin(cycle*.26+bot.phase)*7;tz=bot.homeZ+Math.cos(cycle*.23)*7;moving=1;}
    else if(cycle<27){bot.mode='gather';const node=this.nodes.find(n=>n.type==='tree'&&Math.hypot(n.x-bot.homeX,n.z-bot.homeZ)<24&&!state.depleted.includes(n.id));tx=node?.x??bot.homeX+9;tz=node?.z??bot.homeZ+5;moving=Math.hypot(tx-bot.x,tz-bot.z)>2?1:0;if(!moving&&bot.actionTime>5){bot.actionTime=0;if(bot.base)state.botStores[bot.base]=(state.botStores[bot.base]||0)+5;}}
    else{bot.mode='return';tx=bot.homeX;tz=bot.homeZ+3;moving=Math.hypot(tx-bot.x,tz-bot.z)>1?1:0;}
   }
   if(moving){const dx=tx-bot.x,dz=tz-bot.z,len=Math.hypot(dx,dz)||1,speed=aggro?2.6:1.1;const nx=bot.x+dx/len*speed*dt,nz=bot.z+dz/len*speed*dt;if(this.canMove(nx,nz,state)){bot.x=nx;bot.z=nz;}else{const steer=(Math.sin(this.time*.6+bot.phase)>0?1:-1);const sx=bot.x-dz/len*speed*dt*steer,sz=bot.z+dx/len*speed*dt*steer;if(this.canMove(sx,sz,state)){bot.x=sx;bot.z=sz;}}if(!shooting)bot.model.rotation.y=Math.atan2(dx,dz);}
   this.animateBot(bot,dt,moving,shooting);
  }
 },
 tracer(a,b,color=0xe9b26d){const geometry=new THREE.BufferGeometry().setFromPoints([a,b]);const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.7}));this.scene.add(line);this.effects.push({line,life:.10});},
 dispose(){this.renderer.dispose();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});for(const t of Object.values(this.textures))t.dispose();this.environment?.dispose();}
 });
}
