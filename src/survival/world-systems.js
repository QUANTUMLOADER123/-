import {seesPlayer,hitProbability} from './perception.js';
import * as THREE from 'three';
import {terrainHeight,TIERS,BOT_BASES,MONUMENTS,damageStructure,clamp,buildingHeight} from './state.js';
const V=THREE.Vector3;
export function installWorldSystems(IslandWorld){
 Object.assign(IslandWorld.prototype,{
 makeStormSky(){
  this.sky.visible=false;const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},daylight:{value:1},sunDirection:{value:this.sunDirection}},vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vDir;uniform float time;uniform float daylight;uniform vec3 sunDirection;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}void main(){vec3 d=normalize(vDir);float y=max(d.y,0.);vec2 p=d.xz/(y+.35)*2.+time*.002;float n=noise(p)*.5+noise(p*2.1)*.25+noise(p*4.3)*.125;vec3 horizon=vec3(.62,.78,.94),zenith=vec3(.14,.38,.76);vec3 color=mix(horizon,zenith,pow(y,.4));color=mix(color,vec3(.91,.95,1.),smoothstep(.43,.67,n)*.7);color+=vec3(1.,.83,.52)*pow(max(dot(d,sunDirection),0.),1200.)*1.8;color*=daylight;gl_FragColor=vec4(color,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});this.stormSky=new THREE.Mesh(new THREE.SphereGeometry(11000,24,16),material);this.stormSky.renderOrder=-10;this.scene.add(this.stormSky);
 },
 syncGroundBags(state){
  const ids=new Set((state.groundBags||[]).map(b=>b.id));this.interactables=this.interactables.filter(i=>{if(i.id.startsWith('drop-')&&!ids.has(i.id)){this.scene.remove(i.model);return false;}return true;});this.colliders=this.colliders.filter(c=>!c.id?.startsWith('drop-')||ids.has(c.id));
  for(const b of state.groundBags||[]){if(this.interactables.some(i=>i.id===b.id))continue;const model=this.prop('Crate',b.x,b.z,.45,0);this.interactables.push({...b,type:'crate',model,radius:.5});this.colliders.push({...b,r:.3});}
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
   if(!c.box||!c.data&&!c.scenery||c.data?.open||state.depleted.includes(c.id)||c.data&&!c.data.owner&&c.data.hp<=0)continue;
   const ground=c.y??terrainHeight(c.x,c.z);box.min.set(c.x-c.w/2,ground,c.z-c.d/2);box.max.set(c.x+c.w/2,ground+(c.h??3.15),c.z+c.d/2);
   if(ray.intersectBox(box,hit)&&hit.distanceToSquared(a)<(len-.05)**2)return false;
  }
  for(const n of this.nodes||[])if(n.type==='tree'&&Math.hypot(n.x-a.x,n.z-a.z)<len+1&&!state.depleted.includes(n.id)){box.min.set(n.x-.45,n.y,n.z-.45);box.max.set(n.x+.45,n.y+7,n.z+.45);if(ray.intersectBox(box,hit)&&hit.distanceToSquared(a)<(len-.1)**2)return false;}

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
   const safe=Math.hypot(state.position.x+6,state.position.z+3)<23,origin=new V(bot.x,terrainHeight(bot.x,bot.z)+1.3,bot.z),player=new V(state.position.x,this.camera.position.y-.3,state.position.z),los=this.lineOfSight(origin,player,state);
   const dxp=state.position.x-bot.x,dzp=state.position.z-bot.z,facing=(Math.sin(bot.model.rotation.y)*dxp+Math.cos(bot.model.rotation.y)*dzp)/Math.max(.01,dist),provoked=bot.alertUntil>this.time;
   const noticed=!safe&&(state.difficulty!=='peaceful'||provoked)&&seesPlayer({distance:dist,facingDot:facing,visible:los,difficulty:state.difficulty,daylight:this.dayCycle?.daylight??1,provoked});
   bot.awareness=noticed?Math.min(2,(bot.awareness||0)+dt):Math.max(0,(bot.awareness||0)-dt*2);
   if(noticed){bot.lastSeen={x:state.position.x,z:state.position.z};bot.lastSeenAt=this.time;}
   if(bot.awareness>(state.difficulty==='hard'?.6:1.25))bot.engaged=true;const aggro=bot.engaged&&!!bot.lastSeen&&this.time-(bot.lastSeenAt||0)<4;if(!aggro&&!noticed)bot.engaged=false;
   let moving=0,shooting=false,tx=bot.homeX,tz=bot.homeZ;
   if(aggro){bot.mode='defend';const target=player.clone();bot.model.rotation.y=Math.atan2((los?state.position.x:bot.lastSeen.x)-bot.x,(los?state.position.z:bot.lastSeen.z)-bot.z);
    if(dist<30&&los&&noticed&&bot.awareness>1.25){shooting=true;if(bot.cooldown<=0){bot.cooldown=state.difficulty==='hard'?1.8:2.6;bot.shots=(bot.shots||0)+1;const rand=(Math.sin(bot.phase*12.9898+bot.shots*78.233)*43758.5453)%1,roll=rand-Math.floor(rand),isMoving=Math.hypot(state.position.x-(bot.prevPX??state.position.x),state.position.z-(bot.prevPZ??state.position.z))>.025,hit=roll<hitProbability(dist,isMoving,state.difficulty);if(!hit)target.add(new V((roll-.5)*4,1+(roll-.5)*2,(.5-roll)*3));this.tracer(origin,target,0xd1b27c);if(hit)damage(state.difficulty==='hard'?9:6);}}
    else if(bot.lastSeen){tx=bot.lastSeen.x;tz=bot.lastSeen.z;moving=Math.hypot(tx-bot.x,tz-bot.z)>3?1:0;}
   }else{
    const cycle=(this.time+bot.phase)%35;if(cycle<18){bot.mode='patrol';tx=bot.homeX+Math.sin(cycle*.26+bot.phase)*7;tz=bot.homeZ+Math.cos(cycle*.23)*7;moving=1;}
    else if(cycle<27){bot.mode='gather';const node=this.nodes.find(n=>n.type==='tree'&&Math.hypot(n.x-bot.homeX,n.z-bot.homeZ)<24&&!state.depleted.includes(n.id));tx=node?.x??bot.homeX+9;tz=node?.z??bot.homeZ+5;moving=Math.hypot(tx-bot.x,tz-bot.z)>2?1:0;if(!moving&&bot.actionTime>5){bot.actionTime=0;if(bot.base)state.botStores[bot.base]=(state.botStores[bot.base]||0)+5;}}
    else{bot.mode='return';tx=bot.homeX;tz=bot.homeZ+3;moving=Math.hypot(tx-bot.x,tz-bot.z)>1?1:0;}
   }
   if(moving){const dx=tx-bot.x,dz=tz-bot.z,len=Math.hypot(dx,dz)||1,speed=aggro?2.6:1.1;const nx=bot.x+dx/len*speed*dt,nz=bot.z+dz/len*speed*dt;if(this.canMove(nx,nz,state)){bot.x=nx;bot.z=nz;}else{const steer=(Math.sin(this.time*.6+bot.phase)>0?1:-1);const sx=bot.x-dz/len*speed*dt*steer,sz=bot.z+dx/len*speed*dt*steer;if(this.canMove(sx,sz,state)){bot.x=sx;bot.z=sz;}}if(!shooting)bot.model.rotation.y=Math.atan2(dx,dz);}
   bot.prevPX=state.position.x;bot.prevPZ=state.position.z;this.animateBot(bot,dt,moving,shooting);
  }
 },
 tracer(a,b,color=0xe9b26d){const geometry=new THREE.BufferGeometry().setFromPoints([a,b]);const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.7}));this.scene.add(line);this.effects.push({line,life:.10});},
 dispose(){this.renderer.dispose();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});for(const t of Object.values(this.textures))t.dispose();this.environment?.dispose();}
 });
}
