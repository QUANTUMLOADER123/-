import {rayObstacle17} from './spatial17.js';
import * as THREE from 'three';
import {MODS25,module25} from './attachments25.js';
import {isGun} from './catalog.js';
import {terrainHeight} from './state.js';
const V=THREE.Vector3;
export function installWeaponMods25(World){
 const make=World.prototype.makeNewViewModels,update=World.prototype.update,dispose=World.prototype.dispose;
 World.prototype.makeNewViewModels=function(){make.call(this);const metal=new THREE.MeshStandardMaterial({color:0x34413c,metalness:.72,roughness:.48});this.modMaterial25=metal;
  for(const [id,m]of Object.entries(this.weaponViews)){if(id==='rocketLauncher')continue;const base=m.userData.optic08;if(!base)continue;base.visible=false;m.userData.holoBase25=base;
   // Measure the receiver before adding optics. The old -.075 anchor put the
   // sight line INSIDE the receiver/rail (and inside the source models).
   m.updateMatrixWorld(true);let top=-Infinity;const vertices=[new V(),new V(),new V()];m.traverse(o=>{if(!o.isMesh||o===m.userData.magazine)return;for(let n=o;n&&n!==m;n=n.parent)if(n===base)return;const geo=o.geometry,p=geo?.attributes.position;if(!p)return;const matrix=new THREE.Matrix4().copy(m.matrixWorld).invert().multiply(o.matrixWorld);for(let i=0;i<(geo.index?.count??p.count);i+=3){for(let k=0;k<3;k++)vertices[k].fromBufferAttribute(p,geo.index?geo.index.getX(i+k):i+k).applyMatrix4(matrix);if(Math.min(...vertices.map(v=>v.x))<.04&&Math.max(...vertices.map(v=>v.x))>-.04&&Math.min(...vertices.map(v=>v.z))<.14&&Math.max(...vertices.map(v=>v.z))>-.25)top=Math.max(top,...vertices.map(v=>v.y));}});

   if(!Number.isFinite(top))top=.24;const line=top+.038;
   base.position.y=line+.085;base.scale.setScalar(1);
   const iron=new THREE.Object3D();iron.position.set(0,line,base.position.z);m.add(iron);m.userData.ironAim25=iron;
   const irons=new THREE.Group();m.add(irons);m.userData.irons28=irons;
   const post=(w,h,d,x,y,z,parent=irons)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),metal);mesh.position.set(x,y,z);mesh.layers.set(1);parent.add(mesh);};
   const rear=base.position.z+.095;for(const side of[-1,1])post(.008,.030,.016,side*.016,line-.004,rear);post(.040,.009,.018,0,line-.023,rear);
   const front=(m.userData.muzzle16?.[2]??-.75)+.075;post(.008,.040,.014,0,line-.020,front);post(.045,.008,.025,0,line-.044,front);const barrelTop=(m.userData.muzzle16?.[1]??.146)+.02,stalk=Math.max(.008,line-.048-barrelTop);post(.015,stalk,.022,0,barrelTop+stalk/2,front);post(.045,.012,.025,0,top+.006,rear);
   // Physical riser joins the optic base to the receiver, below the open sight line.
   const bottom=base.position.y-.069,h=Math.max(.008,bottom-top);post(.065,h,.070,0,top+h/2-base.position.y,0,base);

   const scope=new THREE.Group();scope.position.copy(base.position);const tube=new THREE.Mesh(new THREE.CylinderGeometry(.043,.047,.21,16,1,true),metal);tube.rotation.x=Math.PI/2;scope.add(tube);const ring=new THREE.Mesh(new THREE.TorusGeometry(.044,.009,6,20),metal);ring.position.z=.107;scope.add(ring);
   const reticle=base.children.find(o=>o.material?.map)?.clone();if(reticle){reticle.scale.set(.7,.7,.7);reticle.position.set(0,0,.109);scope.add(reticle);}const foot=new THREE.Mesh(new THREE.BoxGeometry(.06,Math.max(.02,scope.position.y-top-.044),.07),metal);foot.position.y=-(scope.position.y-top+.044)/2;scope.add(foot);scope.visible=false;m.add(scope);m.userData.scope25=scope;
   const muzzle=new THREE.Group();muzzle.position.fromArray(m.userData.muzzle16||[0,.146,-.8]);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.028,.20,12),metal);barrel.rotation.x=Math.PI/2;barrel.position.z=-.09;muzzle.add(barrel);const cap=new THREE.Mesh(new THREE.TorusGeometry(.022,.005,5,12),metal);cap.position.z=-.195;muzzle.add(cap);muzzle.visible=false;m.add(muzzle);m.userData.muzzleMod25=muzzle;
   const laser=new THREE.Group();laser.position.set(.065,.09,-.30);const housing=new THREE.Mesh(new THREE.BoxGeometry(.04,.045,.09),metal),eye=new THREE.Mesh(new THREE.SphereGeometry(.008,8,5),new THREE.MeshBasicMaterial({color:0xf34c35}));eye.position.z=-.05;laser.add(housing,eye);laser.visible=false;m.add(laser);m.userData.laserUnit25=laser;
   const extended=new THREE.Mesh(new THREE.BoxGeometry(.058,.075,.07),metal),mag=m.userData.magazine;if(mag){mag.geometry.computeBoundingBox();const b=mag.geometry.boundingBox;extended.position.set((b.min.x+b.max.x)/2,b.min.y-.03,(b.min.z+b.max.z)/2);mag.add(extended);}else{extended.position.set(0,-.12,-.09);m.add(extended);}extended.visible=false;m.userData.extended25=extended;
   for(const node of [scope,muzzle,laser,extended])node.traverse(o=>o.layers.set(1));
  }
  const geometry=new THREE.BufferGeometry().setFromPoints([new V(),new V()]),line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xf34732,transparent:true,opacity:.35,depthWrite:false})),dot=new THREE.Mesh(new THREE.SphereGeometry(.025,8,5),new THREE.MeshBasicMaterial({color:0xff442d,toneMapped:false}));line.visible=dot.visible=false;line.frustumCulled=false;this.scene.add(line,dot);this.laser25={line,dot,at:-1};
 };
 World.prototype.update=function(dt,state,playing,...args){
  if(playing){const signature=JSON.stringify(state.attachments25||{});if(signature!==this.modSignature25){this.modSignature25=signature;for(const [id,m]of Object.entries(this.weaponViews)){if(id==='rocketLauncher')continue;const optic=module25(state,id,0),u=m.userData;if(!u.holoBase25)continue;u.holoBase25.visible=optic==='holoSight'||optic==='reflexSight';u.holoBase25.scale.setScalar(1);u.irons28.visible=!optic;u.scope25.visible=['scope4x','scope8x'].includes(optic);u.optic08=['scope4x','scope8x'].includes(optic)?u.scope25:u.holoBase25;const muzzle=module25(state,id,1);u.muzzleMod25.visible=!!muzzle;u.muzzleMod25.scale.z=muzzle==='suppressor'?1:muzzle==='compactSuppressor'?.65:['muzzleBrake','compensator26'].includes(muzzle)?.42:.30;u.extended25.visible=!!module25(state,id,3);u.extended25.scale.set(module25(state,id,3)==='drumMag26'?2:1,1,module25(state,id,3)==='drumMag26'?1.7:1);u.laserUnit25.visible=!!module25(state,id,2);}}this.aimZoom25=MODS25[module25(state,state.selected,0)]?.zoom||(state.selected==='rocketLauncher'?1.4:1.13);}
  update.call(this,dt,state,playing,...args);
  const laser=this.laser25;if(!laser)return;const model=this.weaponViews[state.selected],on=playing&&isGun(state.selected)&&module25(state,state.selected,2)==='laserSight'&&state.laserEnabled25!==false&&!state.sprinting&&!state.swimming&&model?.visible;
  laser.line.visible=laser.dot.visible=on;if(!on)return;if(this.time-laser.at<.067)return;laser.at=this.time;this.camera.updateWorldMatrix(true,true);const start=model.userData.laserUnit25.getWorldPosition(new V()),direction=this.camera.getWorldDirection(new V()),origin=this.camera.position.clone();let distance=120;
  const nearby=new Set();for(let d=0;d<=120;d+=12){const p=origin.clone().addScaledVector(direction,d);for(const c of this.nearColliders(p.x,p.z))nearby.add(c);}for(const c of nearby){if(c.data?.hp<=0||c.id&&this.deadIds05?.has(c.id)||c.door&&c.data?.open)continue;const hit=rayObstacle17({...c,y:c.y??terrainHeight(c.x,c.z)},origin,direction);if(hit)distance=Math.min(distance,hit.distanceTo(origin));}
  const target=this.target(state,{origin,direction,range:120,ballistic:true});if(target?.hitPoint)distance=Math.min(distance,target.hitPoint.distanceTo(origin));for(let d=.4;d<distance;d+=.8){const p=origin.clone().addScaledVector(direction,d);if(p.y<terrainHeight(p.x,p.z)+.025){distance=d;break;}}
  const end=origin.addScaledVector(direction,distance),p=laser.line.geometry.attributes.position;p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,end.x,end.y,end.z);p.needsUpdate=true;laser.dot.position.copy(end);laser.dot.visible=distance<119;
 };
 World.prototype.dispose=function(){if(this.laser25){this.laser25.line.geometry.dispose();this.laser25.line.material.dispose();this.laser25.dot.geometry.dispose();this.laser25.dot.material.dispose();}dispose.call(this);this.modMaterial25?.dispose();};
}
