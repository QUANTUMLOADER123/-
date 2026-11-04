import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {material16,itemBank16} from './items16.js';
// Authored sedan/pickup silhouettes. Templates are rebuilt for each world's textures.
const worlds=new WeakMap();
export function vehicleModel16(truck=false,variant=0){
 const bank=itemBank16();let templates=worlds.get(bank);if(!templates){templates=new Map();worlds.set(bank,templates);}
 const key=truck+':'+variant;if(templates.has(key))return templates.get(key).clone(true);
 const g=new THREE.Group(),paint=material16('paint',[0x879b98,0xb39d7f,0x8391aa][variant%3]),rust=material16('rust'),steel=material16('steel'),rubber=material16('rubber');
 const glass=new THREE.MeshStandardMaterial({color:0x26373c,roughness:.32,metalness:.22}),lamp=new THREE.MeshStandardMaterial({color:0xb7ad81,roughness:.5}),red=new THREE.MeshStandardMaterial({color:0x8e3028,roughness:.6});
 const add=(geo,mat,pos=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);g.add(m);return m;};
 const box=(size,pos,mat=paint)=>add(new RoundedBoxGeometry(...size,2,.015),mat,pos);
 const silhouette=(points,width,mat=paint)=>{const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(-z,y))),geo=new THREE.ExtrudeGeometry(shape,{depth:width-.03,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,steps:1});geo.rotateY(Math.PI/2);geo.translate(-width/2+.015,0,0);return add(geo,mat);};
 const length=truck?5.5:3.8,width=truck?2.4:1.94,axle=truck?2:1.18;
 // The lower contour rises around the wheels: actual wheel arches, not tire
 // cylinders intersecting a solid rectangular chassis.
 const lower=[[-length/2,.44]];
 for(const z of[-axle,axle]){lower.push([z-.47,.44]);for(let j=0;j<=10;j++){const a=Math.PI-j/10*Math.PI;lower.push([z+Math.cos(a)*.47,.44+Math.sin(a)*.49]);}}
 lower.push([length/2,.44]);
 silhouette([...lower,[length/2,.83],[length/2-.18,.97],[-length/2+.16,.96],[-length/2,.79]],width);
 box([width-.16,.10,length-.12],[0,.43,0],rust);
 if(truck){
  // Open bed with recessed floor, separate tailgate, ribs and wheel housings.
  box([width-.15,.12,2.95],[0,.94,-1.05],rust);
  for(const x of[-1.14,1.14])box([.10,.59,3.22],[x,1.22,-1.02]);
  box([2.35,.58,.09],[0,1.23,-2.65]);for(let i=0;i<7;i++)box([.025,.018,2.75],[-.85+i*.28,1.012,-1.03],steel);
  silhouette([[.55,1.02],[.68,1.83],[1.84,1.83],[2.25,1.06]],1.80);
 }else silhouette([[-.90,1.01],[-.58,1.82],[.48,1.82],[.88,1.02]],1.80);
 const z0=truck?.65:-.83,z1=truck?2.20:.83,roof0=truck?.70:-.56,roof1=truck?1.82:.47;
 // Side glass panels fitted to the sloping A/C pillars.
 for(const x of[-.908,.908]){
  const front=silhouette([[(roof0+roof1)/2+.035,1.73],[roof1-.06,1.73],[z1-.10,1.13],[(z0+z1)/2+.035,1.13]],.012,glass);front.position.x=x;
  const back=silhouette([[roof0+.06,1.73],[(roof0+roof1)/2-.045,1.73],[(z0+z1)/2-.035,1.13],[z0+.10,1.13]],.012,glass);back.position.x=x;
  box([.017,.40,truck?1.25:.80],[x, .91,truck?1.43:.38]);
  box([.028,.04,.17],[x*1.015,1.08,truck?.96:.12],steel);
  const mirror=box([.17,.12,.20],[x*1.14,1.24,z1-.12],rubber);mirror.rotation.y=x<0?-.15:.15;
  for(let i=0;i<3;i++){const dent=box([.009,.075,.11],[x*1.05,.70,-.37+i*.17],rust);dent.rotation.x=.15*i;}
 }
 const quad=(a,b,c,d)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...d],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const mat=glass.clone();mat.side=THREE.DoubleSide;return add(geo,mat);};
 quad([-.79,1.14,z1-.04],[.79,1.14,z1-.04],[.77,1.73,roof1+.015],[-.77,1.73,roof1+.015]);
 quad([-.79,1.13,z0-.02],[.79,1.13,z0-.02],[.77,1.73,roof0-.015],[-.77,1.73,roof0-.015]);
 // Broken-glass marks lie on a side pane, without a floating screen decal.
 const crack=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.918,1.58,roof1-.1),new THREE.Vector3(-.918,1.40,roof1-.23),new THREE.Vector3(-.918,1.21,roof1-.12)]);const crackMesh=new THREE.Line(crack,new THREE.LineBasicMaterial({color:0x84938c}));g.add(crackMesh);
 for(const x of[-1,1])for(const z of[-axle,axle]){
  const tire=add(new THREE.TorusGeometry(.325,.115,10,24),rubber,[x*(truck?1.12:1.00),.445,z]);tire.rotation.y=Math.PI/2;
  const rim=add(new THREE.CylinderGeometry(.24,.24,.20,20),steel,[x*(truck?1.18:1.055),.445,z]);rim.rotation.z=Math.PI/2;
  const hub=add(new THREE.CylinderGeometry(.095,.095,.215,12),rust,[x*(truck?1.185:1.06),.445,z]);hub.rotation.z=Math.PI/2;
  for(let j=0;j<5;j++){const a=j/5*Math.PI*2;add(new THREE.SphereGeometry(.018,6,4),rubber,[x*(truck?1.30:1.17),.445+Math.sin(a)*.145,z+Math.cos(a)*.145]);}
 }
 for(const end of[-1,1]){
  box([width-.02,.13,.14],[0,.61,end*(length/2+.035)],rust);
  for(const x of[-1,1])box([.35,.16,.035],[x*width*.34,.83,end*(length/2+.032)],end>0?lamp:red);
 }
 box([.76,.20,.024],[0,.80,length/2+.04],rubber);for(let i=0;i<6;i++)box([.035,.15,.013],[-.29+i*.116,.80,length/2+.06],steel);
 box([.38,.11,.018],[0,.51,-length/2-.113],steel);
 // Merge by material once, retaining glass lines. Cloned wrecks share geometry,
 // rather than rebuilding dozens of wheels/bolts and issuing a draw per detail.
 const groups=new Map();g.updateMatrixWorld(true);
 g.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone().applyMatrix4(o.matrixWorld);if(geo.index){const old=geo;geo=old.toNonIndexed();old.dispose();}if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(geo);});
 const root=new THREE.Group();for(const [material,list]of groups){const raw25=mergeGeometries(list),geo=mergeVertices(raw25,1e-4);raw25.dispose();for(const p of list)p.dispose();const m=new THREE.Mesh(geo,material);m.castShadow=m.receiveShadow=true;root.add(m);}
 root.add(crackMesh);g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});root.userData.trunk25=[0,truck?1.012:.97,truck?-1.1:-1.34];templates.set(key,root);return root.clone(true);
}
