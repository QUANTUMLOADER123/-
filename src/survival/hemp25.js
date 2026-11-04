import {hempModel} from './dev03-world.js';
/** A shared authored serrated-leaf plant, 1.7–1.9 m at the existing rig's scale. */
export function hempPlant25(w){
 if(!w.hempTemplate25){w.hempTemplate25=hempModel();w.hempTemplate25.scale.setScalar(2.05);w.hempTemplate25.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});}
 return w.hempTemplate25.clone(true);
}
