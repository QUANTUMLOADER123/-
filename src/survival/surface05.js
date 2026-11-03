let authored12=null;
export function installSurfaceTextures12(textures){authored12=textures;}
export function releaseSurfaceTextures12(textures){if(authored12===textures)authored12=null;}
import * as THREE from 'three';
/** Original procedurally painted surfaces. No Facepunch textures. */
const cache=new Map();
export function surface05(kind='wood'){if(authored12?.['pbr12/'+kind+'-color.webp'])return authored12['pbr12/'+kind+'-color.webp'];if(cache.has(kind))return cache.get(kind);const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');let seed=15311;const r=()=>((seed=Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
 x.fillStyle=kind==='stone'?'#969385':kind==='metal'?'#707d7b':kind==='cloth'?'#8e826b':'#a4835b';x.fillRect(0,0,256,256);
 for(let i=0;i<4500;i++){const v=r();x.fillStyle=kind==='metal'?(v<.3?'#92512f66':'#ccd5c219'):kind==='stone'?(v<.5?'#343a3128':'#eeefdb22'):(v<.5?'#33271932':'#e4cda12b');x.fillRect(r()*256,r()*256,kind==='wood'?1+r()*2:r()*6,kind==='wood'?10+r()*70:r()*5);}
 if(kind==='wood')for(let i=0;i<6;i++){const a=i*43;x.fillStyle='#3a2d24';x.fillRect(a,0,2,256);for(const y of[17,238]){x.fillStyle='#3a3c36';x.beginPath();x.arc(a+7,y,2,0,7);x.fill();}}
 if(kind==='stone')for(let y=0;y<256;y+=64)for(let a=-64;a<256;a+=128){x.strokeStyle='#514e43';x.lineWidth=4;x.strokeRect(a+(y%128?64:0),y,128,64);}
 if(kind==='metal'){for(let a=0;a<256;a+=32){x.fillStyle='#242f2f66';x.fillRect(a,0,2,256);x.fillStyle='#d6ddcc25';x.fillRect(a+3,0,3,256);}for(const y of[9,247])for(let a=8;a<256;a+=32){x.fillStyle='#c2c7b7';x.beginPath();x.arc(a,y,2.5,0,7);x.fill();}x.fillStyle='#a1513244';x.fillRect(2,220,250,24);for(const[a,y,w,h,color]of[[12,14,105,63,'#79634a'],[121,9,123,91,'#5d6868'],[8,101,157,68,'#6e8184'],[169,104,80,109,'#956b4e'],[17,176,145,70,'#575d55']]){x.fillStyle=color;x.fillRect(a,y,w,h);x.strokeStyle='#2e3939';x.lineWidth=2;x.strokeRect(a,y,w,h);for(const px of[a+4,a+w-4])for(const py of[y+4,y+h-4]){x.fillStyle='#b0b8a4';x.beginPath();x.arc(px,py,2,0,7);x.fill();}}}
 if(kind==='cloth')for(let a=0;a<256;a+=4){x.fillStyle='#ddd1ae22';x.fillRect(a,0,1,256);x.fillRect(0,a,256,1);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.userData.kind12=kind;cache.set(kind,t);return t;}
export function surfaceMaterial05(tier){const kind=tier===3?'metal':tier===2?'stone':'wood';const p='pbr12/'+kind+'-';const m=new THREE.MeshStandardMaterial({map:surface05(kind),normalMap:authored12?.[p+'normal.webp'],roughnessMap:authored12?.[p+'orm.webp'],metalnessMap:tier===3?authored12?.[p+'orm.webp']:null,color:0xf1eee4,metalness:tier===3?.85:0,roughness:1});m.normalScale.set(.45,.45);m.userData.kind12=kind;return m;}
