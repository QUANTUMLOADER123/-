import * as THREE from 'three';
import {MONUMENTS} from './map-data.js';
import {terrainHeight} from './state.js';
/** Read-only runtime binding/approach evidence; never grants items or moves the player. */
export function diagnostics33(w,s){
 const rockMap=w.textures['nature33/granite-color.webp'],rocks={mineable:0,decorative:0,wrong:0};for(const n of w.nodes||[])if(['rock','copperOre','metalOre','sulfurOre','highMetalOre'].includes(n.type)){rocks.mineable++;if(n.model?.material.map!==rockMap||!n.model.material.userData.naturalRock33)rocks.wrong++;}for(const g of w.distantGroups||[])if(g.root.userData.rock17)g.root.traverse(o=>{if(o.isMesh){rocks.decorative+=o.count||1;if(o.material.map!==rockMap||!o.material.userData.naturalRock33)rocks.wrong++;}});
 const recyclers=MONUMENTS.map(site=>({site:site.id,offshore:site.kind==='oilrig',stations:w.interactables.filter(i=>i.site17===site.id&&i.type==='recycler').map(i=>{i.model.updateWorldMatrix(true,false);const p=i.model.localToWorld(new THREE.Vector3(0,0,1.8)),at={...s,position:{x:p.x,z:p.z},crouched:false},floor=w.floorHeight(p.x,p.z,at,i.y+.5),stand=Number.isFinite(floor)&&w.canMove(p.x,p.z,at,floor)&&w.canStand04(at,floor);return{id:i.id,x:i.x,z:i.z,y:i.y,scale:i.model.getWorldScale(new THREE.Vector3()).toArray(),approach:stand,floor,terrain:terrainHeight(p.x,p.z)};})}));
 return{rocks,recyclers,sites:w.siteLayouts17.map(s=>({...s})),weapons:Object.entries(w.weaponViews||{}).map(([id,m])=>({id,revision:m.userData.modelRevision33,salvage:m.userData.salvage34,right:m.userData.rightGrip33?.toArray(),left:m.userData.supportGrip25?.toArray()})),aiming:s.aiming};
}
