import * as THREE from 'three';
import {weaponModel16} from '../src/survival/items16.js';
import {WEAPONS} from '../src/survival/catalog.js';
import {installWeaponMods25} from '../src/survival/weapon-mods25.js';
export function checkWeapons32(){
 class World{constructor(){this.scene=new THREE.Scene();this.weaponViews={};}update(){}dispose(){}makeNewViewModels(){for(const id of Object.keys(WEAPONS)){const model=weaponModel16(id),optic=new THREE.Group();optic.position.fromArray(model.userData.opticMount16||[0,.3,-.1]);model.add(optic);model.userData.optic08=optic;this.weaponViews[id]=model;}}}
 installWeaponMods25(World);const w=new World();w.makeNewViewModels();const result=[];
 for(const [id,m]of Object.entries(w.weaponViews)){if(id==='rocketLauncher')continue;const u=m.userData,top=u.receiverTop32,line=u.ironAim25.position.y;if(!Number.isFinite(top)||line<=top||line>top+.04)throw new Error(id+' sight receiver gap');if(u.irons28.children.length!==7)throw new Error(id+' duplicate iron set');m.updateMatrixWorld(true);const boxes=u.irons28.children.map(o=>new THREE.Box3().setFromObject(o));if(boxes[3].min.y>boxes[4].max.y+.001||boxes[4].min.y>boxes[5].max.y+.001)throw new Error(id+' front sight floats');result.push({id,top,line,ironParts:u.irons28.children.length});}
 return result;
}
