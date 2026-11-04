import * as THREE from 'three';
const V=THREE.Vector3;
function sign08(root,text,x,y,z,width=5){if(text)return;const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#293b36';ctx.fillRect(0,0,768,192);ctx.strokeStyle='#b7a675';ctx.lineWidth=8;ctx.strokeRect(10,10,748,172);ctx.fillStyle='#e1d8b7';ctx.font='bold 60px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,118,710);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshStandardMaterial({map:t,roughness:.8}));m.position.set(x,y,z);root.add(m);}
/** A walk-in settlement: shops are rooms with counters, not three boxes under two roofs. */
export function safeSite08(w,root,m,kit){
 const {box,cyl,pipe,metal,concrete,rust}=kit,cream=new THREE.MeshStandardMaterial({color:0xa8ae99,roughness:.93}),dark=new THREE.MeshStandardMaterial({color:0x384948,metalness:.4,roughness:.7}),glass=new THREE.MeshStandardMaterial({color:0x729b9b,roughness:.25,metalness:.2}),roof=new THREE.MeshStandardMaterial({color:0x687e73,metalness:.45,roughness:.8});
 const wall=(parent,mat,size,pos)=>{const mesh=box(parent,mat,size,pos);mesh.userData.solid=true;return mesh;};
 box(root,concrete,[38,.18,32],[0,.07,0]);w.walkFloors.push({x:m.x,z:m.z,w:38,d:32,y:root.position.y+.16});
 // Interrupted perimeter leaves an eight-metre gate, not an unenterable scenery block.
 for(const side of[-1,1]){wall(root,concrete,[.35,2.2,30],[side*18,1.1,0]);wall(root,concrete,[14,2.2,.35],[side*11,1.1,15]);}wall(root,concrete,[36,2.2,.35],[0,1.1,-15]);
 for(let i=0;i<13;i++)for(const side of[-1,1])pipe(root,[side*18,2.2,-14+i*2.3],[side*18,2.75,-14+i*2.3],.035,metal);
 for(const side of[-1,1]){wall(root,concrete,[.6,4.4,.6],[side*4.5,2.2,15]);box(root,metal,[1.8,.2,2],[side*4.5,4.4,15]);}sign08(root,m.kind==='outpost'?'АВАНПОСТ · МИРНАЯ ЗОНА':'ТОРГОВЫЙ ПОСЁЛОК',0,3.55,15.34,8);
 const labels=['СНАБЖЕНИЕ','МЕДИЦИНА','МАСТЕРСКАЯ'];
 for(let i=0;i<3;i++){
  const x=-11+i*11,g=new THREE.Group();g.position.set(x,.18,-8);root.add(g);const width=9,depth=10;
  wall(g,cream,[width,3.5,.22],[0,1.75,-depth/2]);for(const side of[-1,1]){wall(g,cream,[.22,3.5,depth],[side*width/2,1.75,0]);wall(g,cream,[2.8,3.5,.24],[side*3.1,1.75,depth/2]);box(g,dark,[2.35,.12,.25],[side*3.1,1.03,depth/2+.08]);box(g,glass,[2.2,1.35,.04],[side*3.1,1.9,depth/2+.15]);}
  wall(g,cream,[3.4,.65,.24],[0,3.18,depth/2]);for(const side of[-1,1])box(g,dark,[.1,2.9,.28],[side*1.7,1.45,depth/2+.03]);
  // Pitched metal roof: two actual sloping planes, ridge and fascia.
  for(const side of[-1,1]){const p=box(g,roof,[width/2+.4,.13,depth+.7],[side*width/4,3.85,0]);p.rotation.z=side*-.14;}pipe(g,[0,4.18,-5.4],[0,4.18,5.4],.06,metal);sign08(g,labels[i],0,3.45,5.22,6);
  wall(g,w.woodMaterial,[5,.95,.65],[0,.5,-1]);box(g,dark,[5.15,.12,.8],[0,1.02,-1]);
  for(let shelf=0;shelf<3;shelf++){box(g,metal,[6,.08,.8],[0,.65+shelf*.75,-4.35]);for(let j=0;j<5;j++){const item=w.normalized(i===1?'FirstAidKit':j%2?'Can_Closed':'WaterBottle_1',.3);item.position.set(-2.3+j*1.1,.71+shelf*.75,-4.35);g.add(item);}}
  const terminal=new THREE.Group();terminal.position.set(x,.2,-8.9);root.add(terminal);
  if(i<2){box(terminal,dark,[.85,1.6,.6],[0,.8,0]);box(terminal,glass,[.7,.7,.06],[0,1.1,.34]);for(let k=0;k<3;k++){const button=cyl(terminal,new THREE.MeshStandardMaterial({color:0xa8c18c,emissive:0x3d5126,emissiveIntensity:.35}),.04,.04,.035,[.25,.55+k*.16,.38],8);button.rotation.x=Math.PI/2;}sign08(terminal,'ОБМЕН',0,1.95,.36,1.5);}else{cyl(terminal,rust,.60,.32,1.15,[0,.75,0],12);box(terminal,metal,[1.8,.8,1.1],[0,.4,0]);pipe(terminal,[-.55,1.3,0],[.55,1.3,0],.06,metal);sign08(terminal,'ПЕРЕРАБОТКА',0,1.9,.6,2.8);}
  w.interactables.push({id:'shop-'+m.id+'-'+i,type:i===2?'recycler':'shop',x:m.x+x,z:m.z-8.9,model:terminal,station:true});w.colliders.push({x:m.x+x,z:m.z-8.9,r:i===2?.85:.5,y:root.position.y+.2,h:1.7});
 }
 // Courtyard: fountain, benches, lamps, planters and a real campfire model.
 for(const side of[-1,1])for(const z of[3,10]){box(root,w.woodMaterial,[4,.13,.65],[side*11,.6,z]);for(const dx of[-1.4,1.4])cyl(root,metal,.07,.09,.55,[side*11+dx,.3,z],8);wall(root,w.woodMaterial,[4,.7,.10],[side*11,.92,z+.35]);}
 cyl(root,concrete,1.7,1.85,.38,[0,.3,6],24);cyl(root,glass,1.42,1.42,.035,[0,.51,6],24);cyl(root,concrete,.26,.5,1.5,[0,1.0,6],16);
 for(const x of[-16,16])for(const z of[1,12]){pipe(root,[x,.2,z],[x,4.7,z],.06,metal);box(root,dark,[.7,.2,.45],[x,4.7,z]);box(root,new THREE.MeshStandardMaterial({color:0xede0ab,emissive:0xe6c97e,emissiveIntensity:.5}),[.55,.04,.35],[x,4.57,z]);}
 const fire=w.normalized('Bonfire',.65);fire.position.set(-5,.2,6);root.add(fire);w.addFire(m.x-5,m.z+6,.65,root.position.y+.2);
 sign08(root,'ВХОД БЕЗ ОРУЖИЯ · ТОРГОВЛЯ И РЕМОНТ',0,2.7,-14.7,10);
}
export function details08(w,root,m,kit){if(m.safe)return;const {box,cyl,pipe,metal,concrete}=kit;const edge=Math.max(10,m.radius*.75);sign08(root,m.name.toUpperCase(),0,2.8,edge,Math.min(10,m.radius*.5));for(const side of[-1,1]){box(root,concrete,[1.1,.45,1.1],[side*4,.22,edge]);cyl(root,metal,.06,.08,2.3,[side*4,1.5,edge],8);for(let i=0;i<3;i++)box(root,new THREE.MeshStandardMaterial({color:i%2?0xc3ac62:0x38423a,roughness:.9}),[.55,.16,.10],[side*4,1+i*.3,edge+.1]);}if(['power','waterworks','harbor','radar','satellite','trainyard'].includes(m.kind)){for(let i=0;i<3;i++){const x=-edge+i*2;box(root,metal,[1.5,1.5,.6],[x,.9,edge-3]);for(let j=0;j<5;j++)box(root,concrete,[1.1,.035,.035],[x,.5+j*.15,edge-2.67]);pipe(root,[x,1.65,edge-3],[x,2.3,edge-3],.035);}}}
