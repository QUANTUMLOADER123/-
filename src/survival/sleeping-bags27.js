/** Local player's persistent spawn anchors. No wall-crossing search or free items. */
export const bagList27=s=>s.buildings.filter(b=>b.kind==='sleepingBag'&&!b.owner&&b.hp>0&&!s.depleted.includes(b.id));
export function validBagSave27(s){return s.preferredBag27===undefined||s.preferredBag27===null||typeof s.preferredBag27==='string'&&s.preferredBag27.length<100&&/^build-\d+$/.test(s.preferredBag27);}
export function bagPlacement27(s,x,z,rotation,y,height){
 if(bagList27(s).length>=8)return{ok:false,reason:'Не больше восьми спальников'};
 if(bagList27(s).some(b=>Math.hypot(b.x-x,b.z-z)<1.4&&Math.abs(b.y-y)<1))return{ok:false,reason:'Спальники слишком близко'};
 const supports=s.buildings.filter(b=>!b.owner&&b.hp>0&&!s.depleted.includes(b.id)&&['foundation','roof'].includes(b.kind));
 const level=b=>(b.y??height(b.x,b.z))+(b.kind==='roof'?3.11:.38);
 const supported=(px,pz)=>supports.some(b=>{const dx=px-b.x,dz=pz-b.z,c=Math.cos(b.rotation),si=Math.sin(b.rotation);return Math.abs(dx*c-dz*si)<1.48&&Math.abs(dx*si+dz*c)<1.48&&Math.abs(level(b)-y)<.15;});
 const corners=[[-.37,-.88],[.37,-.88],[-.37,.88],[.37,.88]].map(([a,b])=>({x:x+a*Math.cos(rotation)+b*Math.sin(rotation),z:z-a*Math.sin(rotation)+b*Math.cos(rotation)}));
 if(corners.every(p=>supported(p.x,p.z)))return{ok:true};
 if(corners.every(p=>Math.abs(height(p.x,p.z)-y)<.18))return{ok:true};
 return{ok:false,reason:'Нужен ровный грунт или целое собственное перекрытие под спальником'};
}
export function bagSpawn27(w,s,id){
 const b=bagList27(s).find(b=>b.id===id);if(!b)return null;
 // Stay inside the bag footprint and on the saved floor, including upper floors.
 for(const [dx,dz]of [[0,0],[.22,0],[-.22,0],[0,.35],[0,-.35]]){
  const c=Math.cos(b.rotation),si=Math.sin(b.rotation),x=b.x+dx*c+dz*si,z=b.z-dx*si+dz*c,y=w.floorHeight(x,z,s,b.y+.02);
  if(!Number.isFinite(y)||Math.abs(y-b.y)>.18)continue;
  const probe={...s,position:{x,z},feetY:y};
  if(w.canMove(x,z,probe,y)&&(!w.canStand04||w.canStand04(probe,y)))return{x,z,y};
 }
 return null;
}
