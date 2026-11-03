import {refreshEnvironment12} from './sky12.js';
import {releaseSurfaceTextures12} from './surface05.js';
import {clearPropTemplates12} from './props05.js';
import {dressMaterials12,visualState12} from './materials12.js';
import {initWeather12,updateWeather12,weatherTarget12} from './weather12.js';
import {renderReflection12,updateWater12} from './water12.js';
import {paintLoading11,checkLoading11} from './loading11.js';
/** World-only installation: nothing here is imported or allocated by the front menu. */
export function installVisuals12(World){
 const prepare=World.prototype.prepareEntry11,render=World.prototype.render,update=World.prototype.update,dispose=World.prototype.dispose,load=World.prototype.loadSettlement05,add=World.prototype.addBuilding,syncBags=World.prototype.syncGroundBags;
 World.prototype.prepareEntry11=async function(state,progress,signal){
  progress(0,'Подготавливаем новые поверхности, дождь и отражения…');await paintLoading11(signal);checkLoading11(signal);
  if(!this.rain12)initWeather12(this,state);
  const u=visualState12(this);u.wet.value=weatherTarget12(state.elapsed,this.settings.weatherMode12).rain*.78;
  this.updateDayNight(state.elapsed);updateWeather12(this,0,state);updateWater12(this,0);refreshEnvironment12(this);dressMaterials12(this);
  // Include off-camera rain programs in entry compilation, not the first actual shower.
  this.rain12.mesh.visible=true;this.rain12.splashes.visible=true;this.rain12.uniforms.strength.value=0;
  try{await prepare.call(this,state,progress,signal);}finally{if(this.rain12)updateWeather12(this,0,state);}
 };
 World.prototype.update=function(dt,state,playing,options){update.call(this,dt,state,playing,options);if(playing)updateWater12(this,dt);};
 World.prototype.render=function(){const u=visualState12(this),weather=this.weather12;if(weather&&this.settings.quality!=='low'&&performance.now()-(u.environmentAt||0)>12000&&(Math.abs(weather.cloud-(u.environmentCloud||0))>.16||Math.abs((this.dayCycle?.daylight??1)-(u.environmentDay??1))>.22))refreshEnvironment12(this);if(this.reflection12){this.stormSky?.position.copy(this.camera.position);renderReflection12(this);}render.call(this);};
 World.prototype.loadSettlement05=function(base,state){load.call(this,base,state);const root=this.settlements05?.get(base.id)?.root;if(root)dressMaterials12(this,root);};
 World.prototype.addBuilding=function(b){add.call(this,b);const root=this.built.get(b.id)?.model;if(root)dressMaterials12(this,root);};
 World.prototype.syncGroundBags=function(state){syncBags.call(this,state);for(const bag of this.interactables)if(bag.id.startsWith('drop-'))dressMaterials12(this,bag.model);};
 World.prototype.dispose=function(){
  releaseSurfaceTextures12(this.textures);clearPropTemplates12();this.reflection12?.target.dispose();this.waterBed12?.dispose();this.rain12?.field.dispose();this.visual12?.defaultRoof.dispose();
  const depths=new Set();this.scene.traverse(o=>{if(o.customDepthMaterial)depths.add(o.customDepthMaterial);if(o.isInstancedMesh)o.dispose();if(o.isLight&&o.shadow)o.shadow.dispose();});depths.forEach(d=>d.dispose());
  dispose.call(this);this.rain12=null;this.reflection12=null;this.visual12=null;
 };
}
