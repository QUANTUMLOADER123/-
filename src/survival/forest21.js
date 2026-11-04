import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {randomSeed} from './state.js';
const V=THREE.Vector3;
export const variedTree21=name=>['CommonTree_1','CommonTree_3','PineTree_1','PineTree_Snow_1'].includes(name);
export const treeVariantCount21=name=>name.startsWith('Pine')?3:4;
const BROAD=[{name:'oak',height:.88,width:1.65,crown:.37,branches:17,leaf:0x809c4e},{name:'birch',height:1.13,width:.85,crown:.28,branches:14,leaf:0xa4b961},{name:'aspen',height:1.25,width:.66,crown:.39,branches:15,leaf:0x88a95c},{name:'maple',height:.97,width:1.25,crown:.43,branches:20,leaf:0x61924b}];
const PINE=[{name:'spruce',height:1.12,width:1.05,crown:.19,branches:27,leaf:0x557750},{name:'scots',height:.96,width:1.5,crown:.65,branches:12,leaf:0x6e8950},{name:'fir',height:1.28,width:.76,crown:.20,branches:29,leaf:0x466c57}];
function atlas21(pine,r){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 for(let i=0;i<(pine?230:175);i++){const a=r()*Math.PI*2,rad=Math.sqrt(r()),x=128+Math.cos(a)*rad*106,y=128+Math.sin(a)*rad*102,s=pine?15+r()*23:16+r()*24;ctx.save();ctx.translate(x,y);ctx.rotate(r()*Math.PI*2);const g=ctx.createLinearGradient(-s,0,s,0);g.addColorStop(0,'#4f6942');g.addColorStop(.45,'#d0d8a0');g.addColorStop(1,'#839c5d');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,s,s*(pine?.12:.55),0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b7c38b';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(-s*.8,0);ctx.lineTo(s*.9,0);ctx.stroke();ctx.restore();}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;return texture;
}
function birchBark21(r){const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d');a.fillStyle='#d3d0b9';a.fillRect(0,0,256,256);for(let i=0;i<190;i++){a.fillStyle=i%3?'#51584e':'#909284';a.fillRect(r()*256,r()*256,2+r()*31,.7+r()*3.5);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
/** Seven distinct silhouettes, not a recoloured/scaled copy of one tree. */
export function forestTemplate21(w,name,height,variant=0){
 if(!variedTree21(name))return null;
 const pine=name.startsWith('Pine'),snow=name.includes('Snow'),recipe=(pine?PINE:BROAD)[variant],key=name+':'+height+':'+variant;
 w.forestTemplates21??=new Map();if(w.forestTemplates21.has(key))return w.forestTemplates21.get(key);
 const r=randomSeed(21061+variant*7381+(pine?8101:0)),root=new THREE.Group(),wood=[],leaves=[],up=new V(0,1,0),h=height*recipe.height,lean=new V((r()-.5)*.65,0,(r()-.5)*.65);
 const branch=(a,b,ra,rb)=>{const d=b.clone().sub(a),g=new THREE.CylinderGeometry(rb,ra,d.length(),7,1);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,d.clone().normalize()));g.translate(...a.clone().addScaledVector(d,.5).toArray());wood.push(g);};
 let previous=new V(0,-.16,0);for(let i=1;i<=4;i++){const next=new V(lean.x*(i/4)**2,h*i/4,lean.z*(i/4)**2);branch(previous,next,(pine?.23:variant===0?.40:.22)*(1-(i-1)/4)+.025,(pine?.23:variant===0?.40:.22)*(1-i/4)+.025);previous=next;}
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;branch(new V(Math.cos(a)*.62,-.08,Math.sin(a)*.62),new V(0,.65,0),.055,.12);}
 for(let i=0;i<recipe.branches;i++){
  const t=(i+.5)/recipe.branches,a=i*2.39996+r()*.3,y=h*(recipe.crown+t*(.91-recipe.crown)),scots=recipe.name==='scots';
  const radius=pine&&!scots?(1-y/h)*4.1*recipe.width:recipe.width*(.7+Math.sin(t*Math.PI)*1.15)*( .85+r()*.25),base=new V(lean.x*(y/h)**2,y,lean.z*(y/h)**2),tip=base.clone().add(new V(Math.cos(a)*radius,pine&&!scots?.10:h*(variant===1?.065:.10),Math.sin(a)*radius));
  branch(base,tip,pine?.055:variant===0?.12:.065,.012);
  for(let j=0;j<(pine?3:4);j++){const reach=j<2?.48+j*.22:1,width=pine?1.32+radius*.72:variant===2?1.8:variant===1?2.0:2.75,card=new THREE.PlaneGeometry(width,width*(pine?.78:variant===1||variant===2?1.32:1));card.rotateX((r()-.5)*1.8);card.rotateY(a+j*1.9);card.rotateZ((r()-.5)*.55);const center=base.clone().lerp(tip,reach);card.translate(center.x+(r()-.5)*.65,center.y+r()*.6,center.z+(r()-.5)*.65);leaves.push(card);}
 }
 for(let j=0;j<4;j++){const g=new THREE.PlaneGeometry(pine?1:1.6,pine?1.6:2.1);g.rotateY(j*Math.PI/4);g.translate(lean.x,h-.55,lean.z);leaves.push(g);}
 const bark=new THREE.MeshStandardMaterial({name:'Bark21-'+recipe.name,map:recipe.name==='birch'?birchBark21(r):w.textures['BroadleafBark.jpg'],normalMap:w.textures['BroadleafBark_Normal.png'],color:recipe.name==='birch'?0xffffff:pine?0xa79a82:0xb3a38c,roughness:.97});bark.userData.authoredBark19=true;bark.normalScale.set(.28,.28);
 const leaf=new THREE.MeshStandardMaterial({name:'Leaf21-'+recipe.name,map:atlas21(pine,r),color:snow?0xdce6dc:recipe.leaf,alphaTest:.33,alphaToCoverage:true,side:THREE.DoubleSide,roughness:.94});
 for(const [parts,mat]of [[wood,bark],[leaves,leaf]]){const geo=mergeGeometries(parts);parts.forEach(g=>g.dispose());root.add(new THREE.Mesh(geo,mat));}
 root.userData.height21=h;root.userData.species21=recipe.name;w.forestTemplates21.set(key,root);return root;
}
