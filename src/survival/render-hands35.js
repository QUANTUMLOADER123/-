import * as THREE from 'three';
/** A render-only scene view, NOT a second owner of the camera or its children.
 * Main pass has already updated world matrices. Only camera-attached hands and
 * top-level lights are relevant to layer 1; do not traverse the island twice. */
export function renderHands35(w){
 const scene=w.scene,renderer=w.renderer,camera=w.camera,view=w.handScene35??=new THREE.Scene();
 view.matrixWorldAutoUpdate=false;view.children.length=0;
 for(const o of scene.children)if(o===camera||o.isLight)view.children.push(o);
 view.environment=scene.environment;view.environmentIntensity=scene.environmentIntensity;view.environmentRotation.copy(scene.environmentRotation);view.fog=scene.fog;view.overrideMaterial=scene.overrideMaterial;
 const mask=camera.layers.mask,clear=renderer.autoClear,shadow=renderer.shadowMap.autoUpdate;
 try{renderer.autoClear=false;renderer.clearDepth();camera.layers.set(1);renderer.shadowMap.autoUpdate=false;renderer.render(view,camera);}
 finally{camera.layers.mask=mask;renderer.autoClear=clear;renderer.shadowMap.autoUpdate=shadow;}
}
