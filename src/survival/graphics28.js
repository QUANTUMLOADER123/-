import {groundTextureSize39} from './ground39.js';
/** Downsample decoded asset images BEFORE first GPU upload. Shared decoded images
 * are resized once; originals are not retained just to support a settings switch. */
export function assetTexture28(w,t){
 if(!t?.isTexture||t.isDataTexture||t.isRenderTargetTexture)return;
 const image=t.image;if(!image?.width||!image?.height)return;
 w.textureImages28??=new WeakMap();const divisor=w.loadedTextureDivisor28??=w.settings.textureDivisor28||1;
 if(t.userData.resized28){t.anisotropy=Math.min(w.settings.anisotropy28||1,w.renderer.capabilities.getMaxAnisotropy());return;}
 const size=groundTextureSize39(t.userData.assetName39||'',image.width,image.height,divisor),cacheKey=size.width+':'+size.height;
 if(size.width!==image.width||size.height!==image.height){let cache=w.textureImages28.get(image);if(!cache){cache=new Map();w.textureImages28.set(image,cache);}let reduced=cache.get(cacheKey);if(!reduced){reduced=document.createElement('canvas');reduced.width=size.width;reduced.height=size.height;const ctx=reduced.getContext('2d');ctx.drawImage(image,0,0,reduced.width,reduced.height);cache.set(cacheKey,reduced);const terminal=new Map([[cacheKey,reduced]]);w.textureImages28.set(reduced,terminal);}t.image=reduced;}
 t.userData.resized28=true;t.anisotropy=Math.min(w.settings.anisotropy28||1,w.renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;
}
export function assetMaterials28(w,scene){const seen=new Set();scene.traverse(o=>{for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))for(const t of Object.values(m))if(t?.isTexture&&!seen.has(t)){seen.add(t);assetTexture28(w,t);}});}
export function materialGraphics28(w,m,source=null){
 w.detailBackups28??=new WeakMap();if(source&&w.detailBackups28.has(source))w.detailBackups28.set(m,{...w.detailBackups28.get(source)});
 const backup=w.detailBackups28.get(m)||{};let changed=false;
 for(const key of['normalMap','roughnessMap','aoMap','metalnessMap'])if(w.settings.detailMaps28===0&&m[key]){backup[key]=m[key];m[key]=null;changed=true;}else if(w.settings.detailMaps28!==0&&!m[key]&&backup[key]){m[key]=backup[key];delete backup[key];changed=true;}
 w.detailBackups28.set(m,backup);if(changed)m.needsUpdate=true;return backup;
}
export function installGraphics28(World){
 const quality=World.prototype.applyQuality,entry=World.prototype.prepareEntry11;
 World.prototype.applyGraphics28=function(){
  const s=this.settings,size=s.shadowSize28??1024;this.renderer.shadowMap.enabled=size>0;if(!size&&this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null;}if(this.reflection12){this.reflection12.last=-1e5;if(!s.reflection28)this.reflection12.target.setSize(1,1);}
  if(size>0&&this.sun.shadow.mapSize.x!==size){this.sun.shadow.mapSize.set(size,size);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;}this.renderer.shadowMap.needsUpdate=true;this.shadowAt06=0;
  const textures=new Set(Object.values(this.textures));this.scene.traverse(o=>{if(o.userData.grass22||o.userData.biomeLife23)o.receiveShadow=!o.userData.grass39&&size>0;for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){
   const backup=materialGraphics28(this,m);for(const v of [...Object.values(m),...Object.values(backup)])if(v?.isTexture&&!v.isRenderTargetTexture)textures.add(v);
  }});
  for(const t of textures)if(t?.isTexture&&!t.isRenderTargetTexture){const a=Math.min(s.anisotropy28||1,this.renderer.capabilities.getMaxAnisotropy());if(t.anisotropy!==a){t.anisotropy=a;t.needsUpdate=true;}}
  if(this.playerPreview28){this.playerPreview28.signature=null;this.playerPreview28.renderKey28=null;}this.cullLast16=null;this.updateVisibility16?.(true);this.resize();this.needsRender=true;
 };
 World.prototype.applyQuality=function(q){quality.call(this,q);this.applyGraphics28();};
 World.prototype.prepareEntry11=async function(...args){this.applyGraphics28();return entry.apply(this,args);};
}
