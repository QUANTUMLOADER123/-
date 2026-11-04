/** Shared spawn policy, independent of rendering, loot and saves. */
export function resourceAllowed32(type,biome,height,slope=0){
 if(!['fiber','berries','mushroom','pumpkin','corn'].includes(type))return true;
 const w=biome.weights25||{};
 if(biome.id!=='forest'||(w.arid||0)>.12||(w.snow||0)>.12||height<1.4||slope>.30)return false;
 return type!=='mushroom'||(w.forest??1)>.70;
}
export function slopeAt32(heightAt,x,z,radius=.65){
 return Math.hypot((heightAt(x+radius,z)-heightAt(x-radius,z))/(2*radius),(heightAt(x,z+radius)-heightAt(x,z-radius))/(2*radius));
}
