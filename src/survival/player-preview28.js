import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {CLOTHING24} from './clothing24.js';
import {materialGraphics28} from './graphics28.js';
const V=THREE.Vector3;
const materials=o=>o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
function build(w){
 const scene=new THREE.Scene(),pivot=new THREE.Group(),actor=w.normalized('Adventurer',1.78),owned=new Set(),base=[];scene.add(pivot);pivot.add(actor);
 actor.traverse(o=>{if(/Backpack/i.test(o.name))o.visible=false;if(o.isMesh){o.castShadow=o.receiveShadow=false;const list=materials(o).map(m=>{const n=m.clone();owned.add(n);base.push({mesh:o,mat:n,name:m.name});return n;});o.material=Array.isArray(o.material)?list:list[0];}});
 actor.updateMatrixWorld(true);const bones={};actor.traverse(o=>{if(o.isBone)bones[o.name.replaceAll('.','')]=o;});
 for(const [key,angle]of [['UpperArmL',-1.22],['UpperArmR',1.22]]){const bone=bones[key];if(bone){const axis=new V(0,0,1).applyQuaternion(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert());bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,angle));}}
 actor.updateMatrixWorld(true);const skin=new Set();actor.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();skin.add(o.skeleton);}});
 const head=actor.getObjectByName('Adventurer_Head'),box=new THREE.Box3().setFromObject(head||actor,true),headCenter=box.getCenter(new V()),headSize=box.getSize(new V());
 const camera=new THREE.PerspectiveCamera(30,2/3,.05,12);camera.position.set(0,.95,4.1);camera.lookAt(0,.94,0);
 scene.add(new THREE.HemisphereLight(0xe2edff,0x77705a,2));const key=new THREE.DirectionalLight(0xffe6cb,2.5);key.position.set(-2,3,4);scene.add(key);const fill=new THREE.DirectionalLight(0xa8caed,1.4);fill.position.set(2,2,-2);scene.add(fill);
 const target=new THREE.WebGLRenderTarget(240,360,{type:THREE.UnsignedByteType,depthBuffer:true});const composer=new EffectComposer(w.renderer,target);composer.renderToScreen=false;composer.setPixelRatio(1);composer.setSize(240,360);composer.addPass(new RenderPass(scene,camera));composer.addPass(new OutputPass());
 return{scene,pivot,actor,owned,base,bones,skin,headCenter,headSize,camera,composer,parts:[],yaw:-.25,zoom:4.1,signature:null,last:0};
}
function clearParts(p){for(const o of p.parts){o.removeFromParent();o.geometry?.dispose();}p.parts=[];for(const m of p.gearMaterials||[])m.dispose();p.gearMaterials=[];}
function dress(w,p,s){
 const signature=(s.wear24||[]).join(':');if(signature===p.signature)return;p.signature=signature;clearParts(p);p.pivot.rotation.y=0;p.scene.updateMatrixWorld(true);
 const gear=(s.wear24||[]).map(id=>CLOTHING24[id]),shirt=gear[2],pants=gear[4],shoes=gear[6];
 for(const {mesh,mat,name}of p.base){let group=mesh;while(group.parent&&group.parent!==p.actor&&!/Adventurer_(Body|Head|Legs|Feet)/.test(group.name))group=group.parent;const part=group.name;
  mesh.visible=!(gear[0]&&name==='Hair');
  if(/Body/.test(part)&&!/Skin/i.test(name)){mat.color.set(shirt?.color||'#bc987d');mat.map=shirt?w.textures['items16/cloth-color.webp']:null;}
  if(/Legs/.test(part)){mat.color.set(pants?.color||'#545b52');mat.map=w.textures['items16/cloth-color.webp'];}
  if(/Feet/.test(part)){mat.color.set(shoes?.color||'#bc987d');mat.map=shoes?w.textures['items16/cloth-color.webp']:null;}
  mat.needsUpdate=true;materialGraphics28(w,mat);
 }
 const mat=(c,metal=false)=>{const m=new THREE.MeshStandardMaterial({color:c?.color||'#515a49',map:w.textures['items16/cloth-color.webp'],roughness:metal?.65:.95,metalness:metal?.12:0});p.gearMaterials.push(m);return m;};
 const add=(g,m,position,scale=null)=>{const mesh=new THREE.Mesh(g,m);mesh.position.copy(position);if(scale)mesh.scale.copy(scale);p.pivot.add(mesh);p.parts.push(mesh);return mesh;};
 const round=(size,m,pos,r=.018)=>add(new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(v=>v/3))),m,pos);
 const point=(name,fallback)=>p.bones[name]?.getWorldPosition(new V())||new V(...fallback);
 const limb=(a,b,r,m)=>{const d=b.clone().sub(a),mesh=add(new THREE.CapsuleGeometry(r,Math.max(.01,d.length()-r*2),4,10),m,a.clone().add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());return mesh;};
 const chest=point('Chest',[0,1.3,0]),hips=point('Hips',[0,.95,0]),head=p.headCenter,hs=p.headSize;
 if(shirt){const m=mat(shirt),long=!['tee','stripe','rag'].includes(shirt.shape);for(const side of['L','R']){const shoulder=point('UpperArm'+side,[side==='L'?.25:-.25,1.4,0]),elbow=point('LowerArm'+side,[side==='L'?.3:-.3,1.15,0]),hand=point('Hand'+side,[side==='L'?.3:-.3,.9,0]);limb(shoulder,elbow.clone().lerp(shoulder,long?0:.5),.072,m);if(long)limb(elbow,hand,.054,m);}
  if(shirt.shape==='stripe'){const stripe=mat({color:'#d8dbcf'});for(let i=0;i<4;i++)round([.27,.018,.008],stripe,new V(0,chest.y-.02-i*.06,.118),.003);}
  const trim=mat({color:'#343b32'});round([.008,.30,.01],trim,new V(0,chest.y-.09,.126),.002);
 }
 const outer=gear[3];if(outer){const m=mat(outer),cloak=['cloak','poncho','furcoat'].includes(outer.shape);if(cloak){const high=head.y-hs.y*.48,low=hips.y-.15,height=high-low;const mesh=add(new THREE.CylinderGeometry(.11,.36,height,20,5,true,.25,Math.PI*2-.5),m,new V(0,(high+low)/2,-.015));mesh.rotation.y=Math.PI;}
  else{const profile=[[.14,0],[.17,.06],[.19,.30],[.145,.43]].map(([r,y])=>new THREE.Vector2(r,y));add(new THREE.LatheGeometry(profile,20),m,new V(0,hips.y+.015,.018),new V(1,1,.73));const trim=mat({color:'#30382e'});for(const side of[-1,1]){round([.058,.16,.025],m,new V(side*.105,chest.y-.17,.16));round([.045,.008,.028],trim,new V(side*.105,chest.y-.11,.176),.002);const path=new THREE.CatmullRomCurve3([new V(side*.13,chest.y-.03,.155),new V(side*.14,chest.y+.10,.045),new V(side*.13,chest.y-.03,-.11)]);add(new THREE.TubeGeometry(path,12,.016,6,false),trim,new V());}if(outer.grade>=5)round([.22,.23,.024],m,new V(0,chest.y-.04,.165));}
 }
 if(pants&&pants.grade>=3){const m=mat(pants);for(const side of['L','R']){const knee=point('LowerLeg'+side,[side==='L'?.12:-.12,.5,0]);round([.10,.13,.04],m,knee.clone().add(new V(0,-.03,.07)));const thigh=point('UpperLeg'+side,[side==='L'?.12:-.12,.95,0]);round([.065,.13,.10],m,thigh.clone().add(new V(side==='L'?.085:-.085,-.17,0)));}}
 if(shoes&&shoes.shape!=='sandals'){const m=mat(shoes);for(const side of['L','R']){const foot=point('Foot'+side,[side==='L'?.12:-.12,.1,0]);limb(foot.clone().add(new V(0,.01,0)),foot.clone().add(new V(0,shoes.grade>3?.19:.12,0)),.063,m);}}
 if(gear[0]){const c=gear[0],m=mat(c),radius=hs.x*.65,helmet=['helmet','visor'].includes(c.shape);add(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.58),m,head.clone().add(new V(0,hs.y*.07,0)),new V(radius,hs.y*.60,hs.z*.64));if(c.shape==='cap')round([hs.x*1.15,.014,hs.z*.62],m,head.clone().add(new V(0,hs.y*.12,hs.z*.49)));if(c.shape==='fur')for(const side of[-1,1])round([.045,.12,.11],m,head.clone().add(new V(side*radius,-.05,0)));if(c.shape==='visor'){const visor=new THREE.MeshStandardMaterial({color:0x637e85,transparent:true,opacity:.45,roughness:.2});p.gearMaterials.push(visor);round([hs.x*1.05,hs.y*.28,.018],visor,head.clone().add(new V(0,0,hs.z*.55)));}if(helmet)for(const side of[-1,1])round([.015,.12,.02],m,head.clone().add(new V(side*radius*.75,-.10,hs.z*.20)));}
 if(gear[1]){const c=gear[1],m=mat(c);add(new THREE.SphereGeometry(1,18,10,0,Math.PI,Math.PI*.42,Math.PI*.44),m,head.clone().add(new V(0,-.015,.015)),new V(hs.x*.56,hs.y*.51,hs.z*.56));if(['balaclava','snow'].includes(c.shape))add(new THREE.SphereGeometry(1,16,10,Math.PI,Math.PI),m,head,new V(hs.x*.58,hs.y*.55,hs.z*.58));}
 // Gloves use the actual skinned hands/fingers, not disconnected mitten cubes.
 if(gear[5]){const m=mat(gear[5]);for(const {mesh:o,name}of p.base){if(!o.isSkinnedMesh||name!=='Skin')continue;const g=o.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;if(!si||!sw)continue;const hand=i=>{let n=0;for(let k=0;k<4;k++){const index=si.getComponent(i,k),weight=sw.getComponent(i,k);if(/Hand|Index|Middle|Ring|Pinky|Thumb/.test(o.skeleton.bones[index]?.name||''))n+=weight;}return n;},indices=[];for(let j=0;j<(g.index?.count??g.attributes.position.count);j+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(j+k):j+k);if(ids.reduce((n,i)=>n+hand(i),0)>1.8)indices.push(...ids);}if(!indices.length)continue;const geo=g.clone();geo.setIndex(indices);geo.clearGroups();const offset=.002/o.getWorldScale(new V()).x,verts=geo.attributes.position,norm=geo.attributes.normal;for(let i=0;i<verts.count;i++)verts.setXYZ(i,verts.getX(i)+norm.getX(i)*offset,verts.getY(i)+norm.getY(i)*offset,verts.getZ(i)+norm.getZ(i)*offset);const shell=o.clone(false);shell.geometry=geo;shell.material=m;shell.visible=true;o.parent.add(shell);p.parts.push(shell);}}
 }
export function installPlayerPreview28(World){const dispose=World.prototype.dispose;
 World.prototype.closePlayerPreview28=function(){const p=this.playerPreview28;if(p){p.events?.abort();p.canvas=null;p.state=null;}};
 World.prototype.mountPlayerPreview28=function(root,s){const canvas=root?.querySelector('[data-player-canvas28]');if(!canvas||!this.models.Adventurer)return;const p=this.playerPreview28??=build(this);p.events?.abort();p.events=new AbortController();p.canvas=canvas;p.state=s;dress(this,p,s);const opt={signal:p.events.signal};let drag=null;
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);},opt);
  canvas.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;p.yaw+=(e.clientX-drag.x)*.012;drag.x=e.clientX;if(performance.now()-p.last>66)this.drawPlayerPreview28();},opt);
  const end=e=>{if(drag?.id===e.pointerId){drag=null;this.drawPlayerPreview28();}};canvas.addEventListener('pointerup',end,opt);canvas.addEventListener('pointercancel',end,opt);
  root.querySelectorAll('[data-player-turn28]').forEach(b=>b.addEventListener('click',()=>{p.yaw+=Number(b.dataset.playerTurn28);this.drawPlayerPreview28();},opt));root.querySelectorAll('[data-player-zoom28]').forEach(b=>b.addEventListener('click',()=>{p.zoom=THREE.MathUtils.clamp(p.zoom+Number(b.dataset.playerZoom28),2.8,4.6);this.drawPlayerPreview28();},opt));this.drawPlayerPreview28();
 };
 World.prototype.drawPlayerPreview28=function(){const p=this.playerPreview28;if(!p?.canvas?.isConnected||document.hidden)return;dress(this,p,p.state);p.pivot.rotation.y=p.yaw;p.camera.position.z=p.zoom;p.camera.lookAt(0,.94,0);const key28=p.signature+':'+p.yaw+':'+p.zoom;if(p.image28&&p.renderKey28===key28){p.canvas.width=240;p.canvas.height=360;p.canvas.getContext('2d').putImageData(p.image28,0,0);return;}const width=240,height=360,r=this.renderer,old=r.getRenderTarget(),clear=r.autoClear,shadowAuto=r.shadowMap.autoUpdate,shadowNeeds=r.shadowMap.needsUpdate,color=r.getClearColor(new THREE.Color()),alpha=r.getClearAlpha();
  try{r.shadowMap.autoUpdate=false;r.shadowMap.needsUpdate=false;r.setClearColor(0x252b28,0);p.composer.render();const bytes=new Uint8Array(width*height*4);r.readRenderTargetPixels(p.composer.readBuffer,0,0,width,height,bytes);const ctx=p.canvas.getContext('2d'),image=ctx.createImageData(width,height);for(let y=0;y<height;y++)image.data.set(bytes.subarray((height-1-y)*width*4,(height-y)*width*4),y*width*4);p.canvas.width=width;p.canvas.height=height;ctx.putImageData(image,0,0);p.image28=image;p.renderKey28=key28;p.last=performance.now();}
  finally{r.setRenderTarget(old);r.autoClear=clear;r.shadowMap.autoUpdate=shadowAuto;r.shadowMap.needsUpdate=shadowNeeds;r.setClearColor(color,alpha);}
 };
 World.prototype.dispose=function(){const p=this.playerPreview28;if(p){p.events?.abort();clearParts(p);for(const m of p.owned)m.dispose();for(const s of p.skin)s.dispose();for(const pass of p.composer.passes)pass.dispose?.();p.composer.dispose();this.playerPreview28=null;}dispose.call(this);};
}
