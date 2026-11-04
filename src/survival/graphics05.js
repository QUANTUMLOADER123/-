import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {Pass} from 'three/addons/postprocessing/Pass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
/** DEV17: portable RGBA8 targets, matched MSAA samples, no HDR/bloom amplification
 * of invalid pixels on mobile GPUs. World + hands still share one AA frame.
 */
export function installGraphics05(World){
 const render=World.prototype.render,resize=World.prototype.resize,dispose=World.prototype.dispose;
 World.prototype.resize=function(){resize.call(this);if(this.composer05){this.composer05.setPixelRatio(this.renderer.getPixelRatio());this.composer05.setSize(window.innerWidth,window.innerHeight);}};
 World.prototype.render=function(){
  if(this.settings.antialias==='standard'){this.renderer.setRenderTarget(null);render.call(this);return;}
  if(!this.composer05){
   const world=this;class SceneAndHands extends Pass{constructor(){super();this.needsSwap=false;}render(renderer,write,read){renderer.setRenderTarget(read);render.call(world);}}
   const gl=this.renderer.getContext(),formats=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA8,gl.SAMPLES)||[]),depth=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,gl.SAMPLES)||[]);
   const supported=formats.filter(n=>n<=4&&depth.includes(n)),target=new THREE.WebGLRenderTarget(1,1,{type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false});target.samples=supported.length?Math.max(...supported):0;
   this.composer05=new EffectComposer(this.renderer,target);this.composer05.addPass(new SceneAndHands());
   const smaa=new SMAAPass(1,1);smaa.edgesRT.texture.type=THREE.UnsignedByteType;smaa.weightsRT.texture.type=THREE.UnsignedByteType;
   smaa.edgesRT.depthBuffer=smaa.weightsRT.depthBuffer=false;this.composer05.addPass(smaa);this.composer05.addPass(new OutputPass());this.resize();
  }
  try{this.composer05.render();}finally{this.renderer.setRenderTarget(null);this.camera.layers.set(0);this.renderer.autoClear=true;}
 };
 World.prototype.dispose=function(){if(this.composer05){for(const p of this.composer05.passes)p.dispose?.();this.composer05.dispose();}dispose.call(this);};
}
