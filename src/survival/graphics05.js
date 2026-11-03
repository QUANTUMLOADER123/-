import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {Pass} from 'three/addons/postprocessing/Pass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
/** Keep hands in the same multisampled frame as the landscape. */
export function installGraphics05(World){const render=World.prototype.render,resize=World.prototype.resize,dispose=World.prototype.dispose;
 World.prototype.resize=function(){resize.call(this);if(this.composer05){this.composer05.setPixelRatio(this.renderer.getPixelRatio());this.composer05.setSize(window.innerWidth,window.innerHeight);}};
 World.prototype.render=function(){if(this.settings.antialias==='standard'){render.call(this);return;}if(!this.composer05){const world=this;class SceneAndHands extends Pass{constructor(){super();this.needsSwap=false;}render(renderer,write,read){renderer.setRenderTarget(read);render.call(world);}}
 const floating=this.renderer.extensions.has('EXT_color_buffer_float'),gl=this.renderer.getContext(),formats=gl.getInternalformatParameter(gl.RENDERBUFFER,floating?gl.RGBA16F:gl.RGBA8,gl.SAMPLES);const target=new THREE.WebGLRenderTarget(1,1,{type:floating?THREE.HalfFloatType:THREE.UnsignedByteType});target.samples=Math.min(8,formats?.length?Math.max(...formats):0);this.composer05=new EffectComposer(this.renderer,target);this.composer05.addPass(new SceneAndHands());const smaa=new SMAAPass(1,1);if(!floating){smaa.edgesRT.texture.type=THREE.UnsignedByteType;smaa.weightsRT.texture.type=THREE.UnsignedByteType;}this.composer05.addPass(smaa);this.composer05.addPass(new OutputPass());this.resize();}this.composer05.render();this.renderer.setRenderTarget(null);};
 World.prototype.dispose=function(){if(this.composer05){for(const p of this.composer05.passes)p.dispose?.();this.composer05.dispose();}dispose.call(this);};
}
