import * as THREE from 'three';
/** Original industrial kits: readable entrances, working circulation and close-up detail. */
export function detailSite(w,root,m,kit){
 const {box,cyl,pipe,prop,metal,rust,concrete,black,glass}=kit;
 const pale=new THREE.MeshStandardMaterial({color:0xc2bba3,roughness:.9}),safety=new THREE.MeshStandardMaterial({color:0xd3aa47,roughness:.8});
 const rail=(a,b,y=1.1)=>{pipe(root,[a[0],0,a[1]],[a[0],y,a[1]],.045);pipe(root,[b[0],0,b[1]],[b[0],y,b[1]],.045);for(const h of[.5,y])pipe(root,[a[0],h,a[1]],[b[0],h,b[1]],.035);};
 const pallet=(x,z)=>{for(let i=0;i<5;i++)box(root,w.woodMaterial,[1.4,.06,.15],[x,.22,z-.4+i*.2]);for(const dx of[-.5,.5])box(root,w.woodMaterial,[.13,.16,1],[x+dx,.1,z]);};
 const valve=(x,y,z)=>{const wheel=new THREE.Mesh(new THREE.TorusGeometry(.22,.035,6,14),safety);wheel.position.set(x,y,z);root.add(wheel);pipe(root,[x-.2,y,z],[x+.2,y,z],.025,safety);};
 const lamp=(x,y,z)=>{box(root,black,[.6,.17,.22],[x,y,z]);box(root,new THREE.MeshStandardMaterial({color:0xe0d5ad,emissive:0xe0bd67,emissiveIntensity:.35}),[.45,.06,.17],[x,y-.1,z]);};
 const stairs=(x,z,width,count,step=.25)=>{for(let i=0;i<count;i++){box(root,concrete,[width,(i+1)*step,.55],[x,(i+1)*step/2,z-i*.5]);w.walkFloors.push({x:m.x+x,z:m.z+z-i*.5,w:width,d:.5,y:root.position.y+(i+1)*step});}};
 if(['power','radar','waterworks','bunker','airfield'].includes(m.kind)){
  // Partial service perimeter, with a six-metre central opening (never a sealed loot box).
  const edge=Math.min(m.radius-1,22);for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(5+i*3.2);pipe(root,[x,0,edge],[x,2.3,edge],.045);if(i<4){pipe(root,[x,.65,edge],[x+side*3.2,.65,edge],.025);pipe(root,[x,1.8,edge],[x+side*3.2,1.8,edge],.025);}}
  for(const x of[-3.5,3.5]){cyl(root,safety,.12,.17,2.8,[x,1.4,edge],10);lamp(x,2.8,edge);}for(let i=0;i<8;i++)box(root,i%2?black:safety,[.75,.025,1.1],[-2.6+i*.75,.18,edge-1]);
 }
 switch(m.kind){
 case 'lighthouse':
  stairs(-8,1.1,2.1,2,.18);rail([-10,2],[-10,7]);rail([-5,2],[-5,7]);prop(root,'Raft',7,9,1.1,.7);for(const x of[5,8,11]){cyl(root,black,.17,.22,.7,[x,.35,12],10);cyl(root,rust,.3,.3,.13,[x,.75,12],10);}break;
 case 'harbor':
  for(const x of[-14,-5,5,14]){pallet(x,10);cyl(root,black,.22,.3,.8,[x,.4,16],12);pipe(root,[x-.45,.8,16],[x+.45,.8,16],.1,black);}rail([-17,-14],[-17,10]);for(let i=0;i<4;i++){pipe(root,[10,1+i*4,0],[10,5+i*4,0],.13);pipe(root,[8,1+i*4,0],[12,5+i*4,0],.05);}lamp(-10,3.4,12.5);break;
 case 'airfield':
  for(const x of[-7,7])for(let z=-35;z<=35;z+=10){const light=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6),new THREE.MeshBasicMaterial({color:0xc2dfdb}));light.position.set(x,.24,z);root.add(light);}for(let i=0;i<5;i++){pipe(root,[12,0,-14+i*3],[12,5,-14+i*3],.08);pipe(root,[24,0,-14+i*3],[24,5,-14+i*3],.08);pipe(root,[12,5,-14+i*3],[18,7,-14+i*3],.08);pipe(root,[18,7,-14+i*3],[24,5,-14+i*3],.08);}pallet(26,4);lamp(18,3.4,-1);break;
 case 'power':
  for(let i=0;i<3;i++){const x=-12+i*4;box(root,metal,[2.8,1.3,2],[x,.7,6]);for(let j=0;j<3;j++){cyl(root,pale,.19,.19,.65,[x-.7+j*.7,1.7,6],10);for(let k=0;k<4;k++)cyl(root,pale,.28,.28,.04,[x-.7+j*.7,1.5+k*.13,6],10);}}for(const x of[-12,12]){pipe(root,[x,1,8],[x,2.3,8],.18,rust);valve(x,1.8,8.2);}lamp(-4,3.4,16);break;
 case 'quarry':
  // Conveyor bridge: rollers, diagonal supports, hopper and belt instead of stacked blocks.
  for(let i=0;i<8;i++){const x=-12+i*3,y=1+i*.34;cyl(root,black,.18,.18,2.8,[x,y,-8],10).rotation.z=Math.PI/2;pipe(root,[x,y,-9.5],[x,y,-6.5],.05);if(i%2===0){pipe(root,[x,0,-9.2],[x,y,-9.2],.1,rust);pipe(root,[x,0,-6.8],[x,y,-6.8],.1,rust);}}pipe(root,[-12,.9,-9.5],[9,3.4,-9.5],.1,rust);pipe(root,[-12,.9,-6.5],[9,3.4,-6.5],.1,rust);cyl(root,rust,2.3,.7,3,[11,3,-8],12);break;
 case 'radar':
  for(const x of[-5,5]){box(root,concrete,[1.2,.6,1.2],[x,.3,-1]);pipe(root,[x,.5,-1],[0,9,0],.17);}for(let i=0;i<3;i++){box(root,black,[1.2,1.1,.65],[-12+i*1.8,.6,10]);box(root,glass,[.85,.48,.05],[-12+i*1.8,1,10.35]);}lamp(-10,3.4,12.5);break;
 case 'waterworks':
  stairs(-1,18,1.6,8,.25);rail([-7,10],[6,10],3.1);for(const x of[-9,8]){pipe(root,[x,1.2,-6],[x,1.2,8],.3,rust);valve(x,1.4,2);}for(const x of[13,15]){cyl(root,pale,.65,.65,2,[x,1,9],16);pipe(root,[x,2,9],[x,2.7,9],.08);}break;
 case 'gas':
  for(let i=0;i<3;i++){box(root,metal,[3,.1,.6],[-11,.7+i*.7,-7]);for(let j=0;j<4;j++)prop(root,'Can_Closed',-12+j*.6,-7,.23,0,.8+i*.7);}box(root,pale,[1.2,2.4,.8],[-4,1.2,-8.7]);box(root,glass,[.95,1.8,.05],[-4,1.4,-8.25]);box(root,w.woodMaterial,[2.8,1,.65],[-8,.5,-3.7]);box(root,black,[.45,.2,.3],[-8,1.12,-3.7]);lamp(-8,3.3,-2.5);break;
 case 'junkyard':
  for(let i=0;i<2;i++){const car=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:i?0x8d7659:0x637975,roughness:.95});car.position.set(-9+i*13,0,13);car.rotation.y=i*.35;root.add(car);const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.75,2.4,4,10),mat);hull.rotation.z=Math.PI/2;hull.scale.set(1,.65,1);hull.position.y=.65;car.add(hull);box(car,mat,[1.8,.7,1.35],[0,1.1,0]);for(const x of[-1.3,1.3])for(const z of[-.8,.8]){const tire=cyl(car,black,.4,.4,.22,[x,.4,z],12);tire.rotation.x=Math.PI/2;}w.occluders.push(hull);}pallet(0,9);break;
 case 'bunker':
  for(const x of[-2.1,2.1])box(root,metal,[.35,2.8,.6],[x,1.4,7]);box(root,metal,[4.6,.35,.65],[0,2.8,7]);for(const x of[-6,6]){for(const y of[.5,1.4,2.3])box(root,metal,[2.2,.09,1.1],[x,y,-3]);prop(root,'Backpack',x,-3,.65,0,.6);}pipe(root,[-7,3,-5],[7,3,-5],.12);lamp(0,3.4,4);break;
 }
}
