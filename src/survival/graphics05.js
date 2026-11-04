import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {Pass} from 'three/addons/postprocessing/Pass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
/** One AA pipeline for world AND hands. Native context AA is disabled: Off is
 * really off, and post AA does not secretly stack a second default MSAA buffer. */
export function installGraphics05(World){
 const render=World.prototype.render,resize=World.prototype.resize,dispose=World.prototype.dispose;
 World.prototype.disposeAA28=function(){if(this.composer05){for(const p of this.composer05.passes)p.dispose?.();this.composer05.dispose();}this.composer05=null;this.fxaa28=null;};
 World.prototype.resize=function(){resize.call(this);if(this.composer05){this.composer05.setPixelRatio(this.renderer.getPixelRatio());this.composer05.setSize(window.innerWidth,window.innerHeight);if(this.fxaa28)this.fxaa28.material.uniforms.resolution.value.set(1/(window.innerWidth*this.renderer.getPixelRatio()),1/(window.innerHeight*this.renderer.getPixelRatio()));}};
 World.prototype.render=function(){
  const mode=this.settings.antialias||'fxaa';if(this.aaMode28!==mode){this.disposeAA28();this.aaMode28=mode;}
  if(mode==='off'){this.renderer.setRenderTarget(null);render.call(this);return;}
  if(!this.composer05){
   const world=this;class SceneAndHands extends Pass{constructor(){super();this.needsSwap=false;}render(renderer,write,read){renderer.setRenderTarget(read);render.call(world);}}
   const gl=this.renderer.getContext(),requested=mode==='msaa2'?2:['msaa4','maximum'].includes(mode)?4:0;
   const formats=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA8,gl.SAMPLES)||[]),depth=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,gl.SAMPLES)||[]);
   const supported=formats.filter(n=>n<=requested&&depth.includes(n)),target=new THREE.WebGLRenderTarget(1,1,{type:THREE.UnsignedByteType,depthBuffer:true,stencilBuffer:false});target.samples=supported.length?Math.max(...supported):0;this.aaSamples28=target.samples;
   this.composer05=new EffectComposer(this.renderer,target);this.composer05.addPass(new SceneAndHands());
   if(mode==='smaa'||mode==='maximum'){const smaa=new SMAAPass(1,1);smaa.edgesRT.texture.type=smaa.weightsRT.texture.type=THREE.UnsignedByteType;smaa.edgesRT.depthBuffer=smaa.weightsRT.depthBuffer=false;this.composer05.addPass(smaa);}
   // FXAA works on the final display-encoded image; OutputPass must precede it.
   this.composer05.addPass(new OutputPass());if(mode==='fxaa'){this.fxaa28=new ShaderPass(FXAAShader);this.composer05.addPass(this.fxaa28);}this.resize();
  }
  try{this.composer05.render();}finally{this.renderer.setRenderTarget(null);this.camera.layers.set(0);this.renderer.autoClear=true;}
 };
 World.prototype.dispose=function(){this.disposeAA28();dispose.call(this);};
}
