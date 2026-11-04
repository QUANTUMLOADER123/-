import {isGun} from './catalog.js';
/** Independent pointer ownership: ADS, fire, look and movement can coexist. */
export function bindMobile33({getState,canAct,onInventory,onCraft,onBuild,onLaser}){
 const aim=document.getElementById('aim-button33');let pointer=null;
 const end=e=>{if(pointer!==null&&(!e||e.pointerId===pointer)){pointer=null;getState().aiming=false;aim.classList.remove('active');aim.setAttribute('aria-pressed','false');}};
 aim.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const s=getState();if(!canAct()||!isGun(s.selected)||s.sprinting)return;pointer=e.pointerId;s.aiming=true;aim.classList.add('active');aim.setAttribute('aria-pressed','true');try{aim.setPointerCapture(pointer);}catch{}});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])aim.addEventListener(name,end);window.addEventListener('blur',()=>end());document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
 for(const [id,fn]of Object.entries({'touch-inventory33':onInventory,'touch-craft33':onCraft,'touch-build33':onBuild,'touch-laser33':onLaser}))document.getElementById(id).addEventListener('click',e=>{e.stopPropagation();end();if(canAct())fn();});
 const media=matchMedia('(any-pointer: coarse)');const mode=()=>document.documentElement.classList.toggle('touch33',media.matches||navigator.maxTouchPoints>0);media.addEventListener('change',mode);mode();return{release:end};
}
