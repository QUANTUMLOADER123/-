import {clanSite38} from './clan-sites38.js';
import {prop38} from './props38.js';
import {DEPLOY38,STORAGE38,FENCES38,isDoor38} from './items38.js';
import {MAP_REVISION} from './map-data.js';
import {buildingHeight,TIERS} from './state.js';
export function clanName38(base){return ['Кедр','Рубеж','Искра','Ворон','Север','Гранит'][Number(base.id.split('-').at(-1))%6]+'-'+base.id.split('-').at(-1);}
function collider38(w,b,width=3,height=2.9,settlement,depth=.32){const c=Math.abs(Math.cos(b.rotation)),s=Math.abs(Math.sin(b.rotation)),door=isDoor38(b.kind),push=(x,z,ow,od,frame=false)=>w.colliders.push({id:b.id,box:true,x,z,ow,od,w:c*ow+s*od,d:s*ow+c*od,rotation:b.rotation,y:b.y,h:height,data:b,door:door&&!frame,frame,settlement,built:!settlement});
 if(door){push(b.x,b.z,width-.3,.18);for(const side of[-1,1])push(b.x+Math.cos(b.rotation)*(width/2-.05)*side,b.z-Math.sin(b.rotation)*(width/2-.05)*side,.18,.24,true);}else push(b.x,b.z,width,depth);
}
export function installCompounds38(World){
 const timber=World.prototype.timberGroup,add=World.prototype.addBuilding,load=World.prototype.loadSettlement05,update=World.prototype.updateBots;
 World.prototype.timberGroup=function(kind){return DEPLOY38.includes(kind)?prop38(kind):timber.call(this,kind);};
 World.prototype.addBuilding=function(b){
  if(!DEPLOY38.includes(b.kind))return add.call(this,b);
  const model=prop38(b.kind);model.position.set(b.x,buildingHeight(b),b.z);model.rotation.y=b.rotation;this.scene.add(model);this.built.set(b.id,{model,data:b});
  if(STORAGE38.includes(b.kind)){this.interactables.push({id:b.id,type:'storage',x:b.x,z:b.z,y:b.y,model,data:b});collider38(this,b,b.kind==='weaponsLocker'?1.05:1.7,b.kind==='weaponsLocker'?1.9:.8,undefined,b.kind==='weaponsLocker'?.6:.85);}
  if(FENCES38.includes(b.kind))collider38(this,b);
  if(isDoor38(b.kind)){model.userData.doorPivot.rotation.y=b.open?1.6:0;this.interactables.push({id:b.id,type:'door',x:b.x,z:b.z,model,data:b});}
 };
 World.prototype.loadSettlement05=function(base,state){
  const existed=this.settlements05.has(base.id);load.call(this,base,state);const h=this.settlements05.get(base.id);if(existed||!h||MAP_REVISION<17)return;
  h.clan38=clanName38(base);const site=clanSite38(base,state.seed);if(!site)return;const {layout,yaw}=site;
  h.compound38=layout;h.compound38.clan=h.clan38;h.compound38.yaw=yaw;
  for(const [i,p]of layout.segments.entries()){
   const kind=p.gate?'door':base.tier>=3?'barbedFence':'woodenFence',tier=kind==='barbedFence'?2:1,id='compound38-'+base.id+'-'+i,b={id,kind,x:p.x,z:p.z,y:p.bottom,rotation:yaw+p.angle,tier,hp:TIERS[tier].hp,owner:base.id,raided:base.raided,settlement:base.id,supports:[],open:!!state.doors?.[id],compound38:true};
   const model=prop38(p.gate?'compoundGate':kind);model.position.set(b.x-base.x,b.y-h.root.position.y,b.z-base.z);model.rotation.y=b.rotation;model.scale.set(p.width/3,p.height/2.7,1);h.root.add(model);h.equipment20.push(model);const e={data:b,model,settlement:base.id};h.entries.push(e);if(p.gate)h.gate38=e;this.staticStructures.push(e);collider38(this,b,p.width,p.height+.15,base.id);model.visible=!state.depleted.includes(id);if(p.gate)model.userData.doorPivot.rotation.y=b.open?1.6:0;
  }h.root.updateMatrixWorld(true);this.cullLast16=null;
 };
 World.prototype.compoundApproach38=function(s,b,goal){const h=this.settlements05?.get(b.base),q=h?.compound38;if(!q)return goal;const gate=h.gate38;if(!gate||s.depleted.includes(gate.data.id))return goal;const c=Math.cos(q.yaw),si=Math.sin(q.yaw),inside=p=>{const dx=p.x-h.base.x,dz=p.z-h.base.z,x=dx*c-dz*si,z=dx*si+dz*c;return x>q.bounds.minX&&x<q.bounds.maxX&&z>q.bounds.minZ&&z<q.bounds.maxZ;},start=inside(b);if(start===inside(goal))return goal;const sign=start?-1:1,near={x:q.gate.x+Math.sin(q.yaw)*3.1*sign,z:q.gate.z+Math.cos(q.yaw)*3.1*sign};if(Math.hypot(b.x-near.x,b.z-near.z)>1.2)return{...near,exact27:true};return{x:q.gate.x-Math.sin(q.yaw)*3.1*sign,z:q.gate.z-Math.cos(q.yaw)*3.1*sign,exact27:true};};
 World.prototype.updateBots=function(dt,s,...args){
  // Own-clan passage only. Opening is proximity based, not global/through-wall control.
  for(const h of this.settlements05?.values()||[]){if(!h.compound38)continue;const e=h.gate38;if(!e||s.depleted.includes(e.data.id))continue;const nearby=this.bots.some(b=>!b.dead&&b.base===h.base.id&&Math.hypot(b.x-e.data.x,b.z-e.data.z)<3.4);if(nearby){e.data.open=true;(s.doors??={})[e.data.id]=true;e.model.userData.doorPivot.rotation.y=1.6;(this.doorClose27??=new Map()).set(e.data.id,s.elapsed+3);}}
  return update.call(this,dt,s,...args);
 };
}
