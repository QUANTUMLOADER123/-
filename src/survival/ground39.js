/** Appearance-only bank: does not change terrain heights, biomes or saved coordinates. */
export const GROUND_FILES39=['turf-color.webp','turf-normal.webp','loam-color.webp','loam-normal.webp'].map(n=>'ground39/'+n);
export function groundTextureSize39(name,width,height,divisor){const protected39=name.startsWith('ground39/'),floor=protected39?name.includes('normal')?256:512:1;return{width:Math.min(width,Math.max(floor,Math.floor(width/divisor))),height:Math.min(height,Math.max(floor,Math.floor(height/divisor)))};}
export const groundUV39=Object.freeze({turf:.625,loam:.625,rock:.22,sand:.23});
export function grassTint39(biome,patch,tint){const dry=Math.max(0,patch-.5),base=biome==='arid'?[.36,.29,.11]:biome==='snow'?[.27,.31,.20]:biome==='coast'?[.28,.28,.12]:[.19,.235,.085],v=.86+tint*.22;return base.map((n,i)=>(n+dry*[.10,.05,.045][i])*v);}
