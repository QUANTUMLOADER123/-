import {rayObstacle17} from './spatial17.js';
import {makeSky12} from './sky12.js';
import {pbrMaterial12} from './materials12.js';
import {safeCamp} from './health.js';
import {seesPlayer,hitProbability} from './perception.js';
import * as THREE from 'three';
import {terrainHeight,TIERS,BOT_BASES,MONUMENTS,damageStructure,clamp,buildingHeight} from './state.js';
const V=THREE.Vector3;
export function installWorldSystems(IslandWorld){
 Object.assign(IslandWorld.prototype,{
 makeStormSky(){
  makeSky12(this);
 },
 syncGroundBags(state){
  const ids=new Set((state.groundBags||[]).map(b=>b.id));this.interactables=this.interactables.filter(i=>{if(i.id.startsWith('drop-')&&!ids.has(i.id)){this.scene.remove(i.model);return false;}return true;});this.colliders=this.colliders.filter(c=>!c.id?.startsWith('drop-')||ids.has(c.id));
  for(const b of state.groundBags||[]){if(this.interactables.some(i=>i.id===b.id))continue;const model=this.prop('Crate',b.x,b.z,.45,0);this.interactables.push({...b,type:'crate',model,radius:.5});this.colliders.push({...b,r:.3});}
 },
 strawMaterial(){if(!this.strawTexture){const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d'),r=()=>Math.random();ctx.fillStyle='#8d794d';ctx.fillRect(0,0,128,128);for(let i=0;i<900;i++){ctx.strokeStyle=i%2?'#c3ad71':'#58472a';ctx.lineWidth=.5+r();ctx.beginPath();const x=r()*128,y=r()*128;ctx.moveTo(x,y);ctx.lineTo(x+(r()-.5)*12,y+12+r()*40);ctx.stroke();}this.strawTexture=new THREE.CanvasTexture(c);this.strawTexture.colorSpace=THREE.SRGBColorSpace;}return new THREE.MeshStandardMaterial({map:this.strawTexture,color:0xd5c083,roughness:1});},
 stationModel(kind){
  const group=new THREE.Group(),mats=this.constructionMaterials||{},stone=mats.concrete||new THREE.MeshStandardMaterial({color:0x737b6b,roughness:1});
  if(kind==='furnace'){const base=new THREE.Mesh(new THREE.CylinderGeometry(.63,.8,1.25,14),stone);base.position.y=.62;group.add(base);const cone=new THREE.Mesh(new THREE.ConeGeometry(.65,.7,14),stone);cone.position.y=1.55;group.add(cone);const hole=new THREE.Mesh(new THREE.CircleGeometry(.28,12),new THREE.MeshBasicMaterial({color:0x1b1b12}));hole.position.set(0,.65,.66);group.add(hole);const fire=new THREE.Mesh(new THREE.CircleGeometry(.17,9),new THREE.MeshBasicMaterial({color:0xc47b38}));fire.position.set(0,.61,.68);group.add(fire);group.userData.flame=fire;fire.visible=false;}
  else{const wood=this.woodMaterial;const top=new THREE.Mesh(new THREE.BoxGeometry(1.9,.16,.8),wood);top.position.y=1.1;group.add(top);for(const x of[-.75,.75])for(const z of[-.28,.28]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.1,1.1,.1),wood);leg.position.set(x,.55,z);group.add(leg);}const vice=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.3),mats.metal||stone);vice.position.set(.5,1.29,0);group.add(vice);}
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return group;
 },
 applyBuildingTier(entry){
  const {model,data}=entry,tier=data.tier||0;if(!['wall','door','roof','foundation'].includes(data.kind))return;
  model.traverse(o=>{if(!o.isMesh)return;if(o.userData.wallCore29&&tier>=2&&o.userData.coreTier29!==tier){o.geometry.dispose();o.geometry=new THREE.BoxGeometry(3,2.8,.16);o.geometry.translate(0,1.6,0);o.userData.coreTier29=tier;}const mat=tier===0?this.strawMaterial():pbrMaterial12(this,tier===1?'wood':tier===2?'stone':tier===4?'hqm':'metal',{color:0xe9e7de});o.material=mat;});
  // Higher tiers have physical reinforcement, rather than only a color swap.
  if(entry.reinforcements){model.remove(entry.reinforcements);entry.reinforcements.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
  if(tier>=1&&['wall','door'].includes(data.kind)){const rails=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:tier>=2?0x515a53:0x514c34,metalness:tier>=2?.5:0,roughness:.8});for(const y of[.63,2.45]){const m=new THREE.Mesh(new THREE.BoxGeometry(3,.09,.09),material);m.position.set(0,y,-.09);rails.add(m);}if(tier>=3){for(const x of[-1.3,1.3]){const m=new THREE.Mesh(new THREE.BoxGeometry(.12,2.6,.1),material);m.position.set(x,1.6,.1);rails.add(m);}}model.add(rails);entry.reinforcements=rails;}
 },
 lineOfSight(a,b,state){
  this.refreshDead05(state);const dead=this.deadIds05;
  const d=b.clone().sub(a),len=d.length(),steps=Math.max(1,Math.ceil(len/1.2));
  for(let i=1;i<steps;i++){const t=i/steps;if(terrainHeight(a.x+d.x*t,a.z+d.z*t)>a.y+d.y*t+.15)return false;}
  // Slab/ray intersection cannot skip thin walls as coarse sampled rays could.
  const ray=new THREE.Ray(a,d.normalize()),box=new THREE.Box3(),hit=new V();
  for(const c of this.rayCandidates28('colliders',this.colliders,a,b)){
   if(!c.box&&!c.circle17||!c.data&&!c.scenery||c.door&&c.data?.open||dead.has(c.id)||c.data&&!c.data.owner&&c.data.hp<=0)continue;
   const ground=c.y??terrainHeight(c.x,c.z);
   if(rayObstacle17({...c,y:ground},a,d,hit)&&hit.distanceToSquared(a)<(len-.05)**2)return false;
  }
  for(const n of this.rayCandidates28('trees',this.nodes,a,b,true))if(n.type==='tree'&&Math.hypot(n.x-a.x,n.z-a.z)<len+1&&!dead.has(n.id)){box.min.set(n.x-.45,n.y,n.z-.45);box.max.set(n.x+.45,n.y+7,n.z+.45);if(ray.intersectBox(box,hit)&&hit.distanceToSquared(a)<(len-.1)**2)return false;}

  return true;
 },
 makeBots(){
  const spawns=[]; // DEV04: settlements are uninhabited; only authored high-risk RT guards remain.
 for(const m of MONUMENTS.filter(m=>m.risk>=3)){const p=this.guardSpawns17?.get(m.id)||m;spawns.push({id:'guard-'+m.id,base:null,x:p.x,z:p.z,y:p.y,exact17:!!this.guardSpawns17?.has(m.id),skin:'Swat'});}
  for(const data of spawns){const model=this.normalized(data.skin,1.78);this.scene.add(model);const weapon=this.normalized('Pistol_1',.2);this.scene.add(weapon);const bones={};model.updateMatrixWorld(true);model.traverse(o=>{if(o.isBone){const inverse=o.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bones[o.name]={bone:o,base:o.quaternion.clone(),x:new V(1,0,0).applyQuaternion(inverse),y:new V(0,1,0).applyQuaternion(inverse),z:new V(0,0,1).applyQuaternion(inverse)};}});const bot={id:data.id,base:data.base,y:data.y??terrainHeight(data.x,data.z),homeX:data.x,homeZ:data.z,spawnOffset:data.exact17?0:data.slot===1?6:3,spawnXOffset17:data.exact17?0:4,x:data.x+(data.exact17?0:4),z:data.z+(data.exact17?0:data.slot===1?6:3),model,weapon,bones,hp:120,dead:false,mode:'patrol',cooldown:0,phase:this.stringSeed(data.id)%100,actionTime:0,alertUntil:0};this.bots.push(bot);this.animateBot(bot,0,0,false);bot.model.visible=bot.weapon.visible=Math.hypot(bot.x,bot.z)<150;}
 },
 animateBot(bot,dt,moving,shooting){
  const t=this.time*((bot.speed26||0)>2.5?10:6)+bot.phase;
  const q=this.botRotation||(this.botRotation=new THREE.Quaternion());
  const rotate=(name,x=0,y=0,z=0)=>{const b=bot.bones[name.replaceAll('.','')];if(!b)return;b.bone.quaternion.copy(b.base);if(z)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.z,z));if(y)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.y,y));if(x)b.bone.quaternion.premultiply(q.setFromAxisAngle(b.x,x));};
  rotate('UpperLeg.L',Math.sin(t)*moving*.48);rotate('UpperLeg.R',-Math.sin(t)*moving*.48);rotate('LowerLeg.L',Math.max(0,-Math.sin(t))*moving*.5);rotate('LowerLeg.R',Math.max(0,Math.sin(t))*moving*.5);
  rotate('UpperArm.L',Math.sin(t)*moving*.22,shooting?-1.25:0,shooting?-.15:-1.22);rotate('UpperArm.R',-Math.sin(t)*moving*.22,shooting?1.25:0,shooting?.15:1.22);rotate('LowerArm.R',0,shooting?.35:.25);rotate('LowerArm.L',0,shooting?-.35:-.25);rotate('Head',0,shooting?0:Math.sin(this.time*.7+bot.phase)*.13,0);
  const y=bot.y??terrainHeight(bot.x,bot.z);bot.model.position.set(bot.x,y+Math.sin(t*2)*moving*.018,bot.z);const forward=new V(Math.sin(bot.model.rotation.y),0,Math.cos(bot.model.rotation.y));bot.weapon.position.set(bot.x+forward.x*.32,y+(shooting?1.35:1.03),bot.z+forward.z*.32);bot.weapon.rotation.set(0,bot.model.rotation.y+Math.PI*.5,0);
 },
 updateBots(frameDt,state,damage){
  for(const bot of this.bots){if(bot.dead){bot.model.visible=false;bot.weapon.visible=false;continue;}const dist=Math.hypot(bot.x-state.position.x,bot.z-state.position.z);bot.model.visible=bot.weapon.visible=dist<150;if(dist>160)continue;bot.aiAccum=(bot.aiAccum||0)+frameDt;const rate=dist<35?1/20:dist<100?.2:1;if(bot.aiAccum<rate)continue;const dt=bot.aiAccum;bot.aiAccum=0;bot.aiUpdates=(bot.aiUpdates||0)+1;bot.cooldown-=dt;bot.actionTime+=dt;
   bot.y=this.floorHeight(bot.x,bot.z,state,bot.y??terrainHeight(bot.x,bot.z)+.5);const safe=safeCamp(state.position.x,state.position.z),origin=new V(bot.x,bot.y+1.3,bot.z),player=new V(state.position.x,this.camera.position.y-.3,state.position.z),los=dist<40&&!safe&&this.lineOfSight(origin,player,state);
   const dxp=state.position.x-bot.x,dzp=state.position.z-bot.z,facing=(Math.sin(bot.model.rotation.y)*dxp+Math.cos(bot.model.rotation.y)*dzp)/Math.max(.01,dist),provoked=bot.alertUntil>this.time;
   const noticed=!safe&&(state.difficulty!=='peaceful'||provoked)&&seesPlayer({distance:dist,facingDot:facing,visible:los,difficulty:state.difficulty,daylight:this.dayCycle?.daylight??1,provoked});
   bot.awareness=noticed?Math.min(2,(bot.awareness||0)+dt):Math.max(0,(bot.awareness||0)-dt*2);
   if(noticed){bot.lastSeen={x:state.position.x,z:state.position.z};bot.lastSeenAt=this.time;}
   if(bot.awareness>(state.difficulty==='hard'?.6:1.25))bot.engaged=true;const aggro=bot.engaged&&!!bot.lastSeen&&this.time-(bot.lastSeenAt||0)<4;if(!aggro&&!noticed)bot.engaged=false;
   let moving=0,shooting=false,tx=bot.homeX,tz=bot.homeZ;
   if(aggro){bot.mode='defend';const target=player.clone();bot.model.rotation.y=Math.atan2((los?state.position.x:bot.lastSeen.x)-bot.x,(los?state.position.z:bot.lastSeen.z)-bot.z);
    if(dist<30&&los&&noticed&&bot.awareness>1.25){shooting=true;if(bot.cooldown<=0){bot.cooldown=state.difficulty==='hard'?1.8:2.6;bot.shots=(bot.shots||0)+1;const rand=(Math.sin(bot.phase*12.9898+bot.shots*78.233)*43758.5453)%1,roll=rand-Math.floor(rand),isMoving=Math.hypot(state.position.x-(bot.prevPX??state.position.x),state.position.z-(bot.prevPZ??state.position.z))>.025,hit=roll<hitProbability(dist,isMoving,state.difficulty);if(!hit)target.add(new V((roll-.5)*4,1+(roll-.5)*2,(.5-roll)*3));this.onGunshot07?.(origin);if(this.onBotShot08)this.onBotShot08(origin,target,bot);else{this.tracer(origin,target,0xd1b27c);if(hit)damage(state.difficulty==='hard'?9:6,'bot');}}}
    else if(bot.lastSeen){tx=bot.lastSeen.x;tz=bot.lastSeen.z;moving=Math.hypot(tx-bot.x,tz-bot.z)>3?1:0;}
   }else{
    const cycle=(this.time+bot.phase)%35;if(cycle<18){bot.mode='patrol';tx=bot.homeX+Math.sin(cycle*.26+bot.phase)*7;tz=bot.homeZ+Math.cos(cycle*.23)*7;moving=1;}
    else if(cycle<27){bot.mode='gather';const node=this.nodes.find(n=>n.type==='tree'&&Math.hypot(n.x-bot.homeX,n.z-bot.homeZ)<24&&!state.depleted.includes(n.id));tx=node?.x??bot.homeX+9;tz=node?.z??bot.homeZ+5;moving=Math.hypot(tx-bot.x,tz-bot.z)>2?1:0;if(!moving&&bot.actionTime>5){bot.actionTime=0;if(bot.base)state.botStores[bot.base]=(state.botStores[bot.base]||0)+5;}}
    else{bot.mode='return';tx=bot.homeX;tz=bot.homeZ+3;moving=Math.hypot(tx-bot.x,tz-bot.z)>1?1:0;}
   }
   if(moving){const dx=tx-bot.x,dz=tz-bot.z,len=Math.hypot(dx,dz)||1,speed=aggro?2.6:1.1;const nx=bot.x+dx/len*speed*dt,nz=bot.z+dz/len*speed*dt;const gy=this.floorHeight(nx,nz,state,bot.y);if(Math.abs(gy-bot.y)<=.45&&this.canMove(nx,nz,state,gy)){bot.x=nx;bot.z=nz;bot.y=gy;}else{const steer=(Math.sin(this.time*.6+bot.phase)>0?1:-1);const sx=bot.x-dz/len*speed*dt*steer,sz=bot.z+dx/len*speed*dt*steer;const sy=this.floorHeight(sx,sz,state,bot.y);if(Math.abs(sy-bot.y)<=.45&&this.canMove(sx,sz,state,sy)){bot.x=sx;bot.z=sz;bot.y=sy;}}if(!shooting)bot.model.rotation.y=Math.atan2(dx,dz);}
   bot.prevPX=state.position.x;bot.prevPZ=state.position.z;this.animateBot(bot,dt,moving,shooting);
  }
 },
 tracer(a,b,color=0xe9b26d){const geometry=new THREE.BufferGeometry().setFromPoints([a,b]);const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.7}));this.scene.add(line);this.effects.push({line,life:.10});},
 dispose(){
  this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost11);const geometries=new Set(),materials=new Set(),textures=new Set(),images=new Set();
  const collect=o=>{if(o.geometry)geometries.add(o.geometry);for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){materials.add(m);for(const v of [...Object.values(m),...Object.values(this.detailBackups28?.get(m)||{})])if(v?.isTexture)textures.add(v);}};
  this.scene.traverse(collect);for(const gltf of Object.values(this.models))gltf.scene?.traverse(collect);for(const t of Object.values(this.textures))textures.add(t);
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{if(t.image?.close)images.add(t.image);t.dispose();});images.forEach(i=>i.close());this.environment?.dispose();this.renderer.dispose();this.scene.clear();if(this.handScene35)this.handScene35.children.length=0;this.handScene35=null;this.models={};this.textures={};
 }
 });
}
