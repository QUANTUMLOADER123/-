import {naturalHeight13,riverProfile13,coastDistance13} from './terrain13.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/** Revision 11 deliberately retires the narrow DEV17 shelf/teeth mountains. */
export function landscape20(x,z,scale,seed,noise,sites){
 const river=(a,b)=>riverProfile13(a,b,scale,seed),raw=(a,b)=>naturalHeight13(a,b,scale,seed,noise,river);
 let h=raw(x,z),camp=1-smooth((Math.hypot(x+6,z+3)-22)/45);h=h*(1-camp)+1.7*camp;
 const coast=smooth(coastDistance13(x,z,scale,seed)/22),r=river(x,z),channel=r?smooth((r.distance-r.width*.5-4)/18):1;
 for(const m of sites){if(m.kind==='oilrig')continue;const d=Math.hypot(x-m.x,z-m.z),shoulder=Math.max(45,m.radius*1.6);if(d>m.radius+shoulder)continue;m.padHeight20??=raw(m.x,m.z);const f=(1-smooth((d-m.radius)/shoulder))*coast*channel;h=h*(1-f)+m.padHeight20*f;}
 return h;
}
let cache=null;
/** Shared junction vertices and relaxed longitudinal grade, then a wide smooth
 * shoulder. Unlike a decal, this actually grades the terrain beneath the road. */
export function gradeRoad20(x,z,h,{roads,key,base,river,sites=[]}){
 if(cache?.key!==key){
  const points=new Map(),edges=[],segments=[],get=(x,z)=>{const k=x.toFixed(4)+':'+z.toFixed(4);if(!points.has(k)){const r=river(x,z),y=Math.max(base(x,z),r&&r.distance<r.width*.5+5?r.water+1.65:-Infinity);points.set(k,{x,z,y});}return points.get(k);};
  for(const [name,path]of Object.entries(roads)){let previous=null;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/5));for(let j=0;j<=n;j++){if(i>1&&!j)continue;const p=get(a.x+(b.x-a.x)*j/n,a.z+(b.z-a.z)*j/n);if(previous&&p!==previous){const length=Math.hypot(p.x-previous.x,p.z-previous.z);edges.push({a:previous,b:p,limit:length*.16});segments.push({a:previous,b:p,width:name.startsWith('artery-')?3:2.25});}previous=p;}}}
  for(let pass=0;pass<64;pass++)for(let j=0;j<edges.length;j++){const e=edges[pass%2?edges.length-1-j:j],delta=e.b.y-e.a.y,excess=Math.abs(delta)-e.limit;if(excess>0){const d=Math.sign(delta)*excess*.5;e.a.y+=d;e.b.y-=d;}}
  const cells=new Map();for(const s of segments)for(let a=Math.floor((Math.min(s.a.x,s.b.x)-15)/32);a<=Math.floor((Math.max(s.a.x,s.b.x)+15)/32);a++)for(let b=Math.floor((Math.min(s.a.z,s.b.z)-15)/32);b<=Math.floor((Math.max(s.a.z,s.b.z)+15)/32);b++){const k=a+':'+b;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(s);}cache={key,cells};
 }
 const r=river(x,z);if(r&&r.distance<r.width*.5+4)return h;
 let best=null,dist=Infinity;
 for(const s of cache.cells.get(Math.floor(x/32)+':'+Math.floor(z/32))||[]){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(z-s.a.z)*dz)/(dx*dx+dz*dz))),d=Math.hypot(x-s.a.x-dx*t,z-s.a.z-dz*t);if(d<dist){dist=d;best={s,t};}}
 if(!best||dist>best.s.width+11)return h;let protection=1;for(const m of sites)if(m.kind!=='oilrig')protection=Math.min(protection,smooth((Math.hypot(x-m.x,z-m.z)-m.radius)/5));const f=(1-smooth((dist-best.s.width-1)/10))*protection,target=best.s.a.y+(best.s.b.y-best.s.a.y)*best.t;return h+(target-h)*f;
}
