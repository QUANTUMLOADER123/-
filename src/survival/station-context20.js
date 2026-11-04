const contexts=new WeakMap();
/** Runtime-only loaded-house stations; never serialize model/world references. */
export const stationContext20=s=>contexts.get(s)||[];
export function installStationContext20(World){
 const sync=World.prototype.syncState,update=World.prototype.update;
 const set=(w,s)=>contexts.set(s,w.staticStructures.map(e=>e.data).filter(b=>['workbench','furnace','repairBench','recycler'].includes(b.kind)&&!s.depleted.includes(b.id)));
 World.prototype.syncState=function(s){sync.call(this,s);set(this,s);};
 World.prototype.update=function(dt,s,playing,...args){update.call(this,dt,s,playing,...args);if(playing){set(this,s);for(const i of this.interactables)if(i.type==='furnace'&&i.model.userData.flame)i.model.userData.flame.visible=!!s.furnaces?.[i.id]?.on;}};
}
