import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {material16} from './items16.js';
/** Fictional visual props only. One metre-space factory for hands, inventory and
 * thrown/stuck models; no real device construction or circuit simulation. */
export function explosiveModel17(id){
 const g=new THREE.Group(),cloth=material16('cloth',0x9da58a),metal=material16('steel'),paint=material16('paint',0xb1bca0),rubber=material16('rubber'),rust=material16('rust');
 const box=(s,p,m=cloth,r=.008)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(...s,2,Math.min(r,...s.map(v=>v*.2))),m);o.position.set(...p);g.add(o);return o;};
 const cylinder=(r,h,p,m=metal)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),m);o.position.set(...p);g.add(o);return o;};
 const wire=(points,m=paint,r=.004)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,6,false),m);g.add(o);};
 const ring=(r,p,m=metal)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,.003,6,20),m);o.position.set(...p);g.add(o);};
 if(id==='timedCharge'||id==='explosives'){
  box([.255,.30,.075],[0,0,0]);for(const x of[-.085,.085])box([.027,.306,.084],[x,0,0],rubber,.002);
  box([.145,.105,.034],[0,.015,.052],paint);box([.095,.045,.003],[0,.026,.071],rubber,.001);
  for(let j=0;j<3;j++)box([.014,.024,.002],[-.028+j*.028,.026,.074],new THREE.MeshBasicMaterial({color:0x94b69b}));
  for(const x of[-.058,.058])for(const y of[-.025,.055])cylinder(.004,.004,[x,y,.072]).rotation.x=Math.PI/2;
  box([.09,.055,.004],[0,-.105,.041],material16('organic',0xd8c8a3),.002);
  wire([[-.04,.065,.055],[-.095,.11,.07],[-.06,.158,.018],[.025,.135,.026]],material16('paint',0xba755f));
  wire([[.04,.065,.055],[.09,.09,.07],[.085,.145,.025]],rubber);
 }else if(id==='satchel'){
  box([.24,.29,.12],[0,0,0],cloth,.025);box([.22,.095,.018],[0,.10,.067],cloth,.012);
  for(const x of[-.075,.075]){box([.028,.305,.129],[x,0,0],rubber);box([.04,.035,.007],[x,.055,.072],metal);}
  for(const side of[-1,1])wire([[side*.04,.14,0],[side*.06,.19,0],[side*.02,.205,0]],cloth,.009);
  wire([[.06,.115,.05],[.10,.18,.07],[.07,.23,.045]],rust,.005);
 }else if(id==='beancan'){
  cylinder(.072,.17,[0,0,0],rust);for(const y of[-.083,.083]){const rim=cylinder(.076,.009,[0,y,0],metal);rim.name='Rolled can rim';}
  for(let i=0;i<7;i++)cylinder(.073,.003,[0,-.06+i*.019,0],metal);
  box([.07,.08,.004],[0,0,.074],cloth);wire([[0,.085,0],[.025,.14,0],[.045,.16,.02]],rubber,.005);
 }else{
  const body=new THREE.Mesh(new THREE.SphereGeometry(.068,20,14),paint);body.scale.set(1,1.28,1);g.add(body);
  // Segmented casing bands follow the curved shell, rather than a smooth ball.
  for(let j=-2;j<=2;j++){const y=j*.028,r=.068*Math.sqrt(Math.max(.1,1-(y/.087)**2)),o=new THREE.Mesh(new THREE.TorusGeometry(r,.003,6,24),rubber);o.rotation.x=Math.PI/2;o.position.y=y;g.add(o);}
  cylinder(.021,.035,[0,.096,0]);box([.026,.105,.009],[.031,.105,0],metal);ring(.023,[-.025,.132,0]);
 }
 g.name='DEV17 textured '+id;g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});g.userData.explosive17=true;return g;
}
export function installExplosives17(World){
 const make=World.prototype.makeViewModel,icon=World.prototype.iconModel04;
 World.prototype.makeViewModel=function(){make.call(this);const old=this.heldSatchel,m=explosiveModel17('satchel');m.position.copy(old.position);m.rotation.copy(old.rotation);m.visible=false;m.traverse(o=>{o.layers.set(1);o.castShadow=false;o.receiveShadow=false;});old.removeFromParent();this.handRoot.add(m);this.heldSatchel=m;};
 World.prototype.iconModel04=function(id){return ['satchel','timedCharge','f1Grenade','beancan','explosives'].includes(id)?explosiveModel17(id):icon.call(this,id);};
}
