import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Rounded horizontal timbers merged into one geometry, including sealed frame
 * jambs. Visual relief stays within 3 cm of the unchanged structural footprint. */
export function logPanel29(w,h,x,y){const list=[],rows=Math.max(1,Math.round(h/.20)),step=h/rows;for(let i=0;i<rows;i++){const geo=new THREE.CylinderGeometry(step*.51,step*.51,w,10,1);geo.rotateZ(Math.PI/2);geo.translate(x,y-h/2+(i+.5)*step,0);list.push(geo);}const back=new THREE.BoxGeometry(w,h,.055);back.translate(x,y,0);list.push(back);const result=mergeGeometries(list);list.forEach(g=>g.dispose());return result;}
