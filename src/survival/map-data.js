/** Authored landmarks, a closed island highway and seeded, uninhabited settlements. */
export const MAP_SIZES={small:{name:'Маленький',scale:1,width:650},medium:{name:'Средний',scale:1.4,width:910},large:{name:'Большой',scale:1.8,width:1170},huge:{name:'Огромный',scale:4000/650,width:4000},vast:{name:'Бескрайний',scale:8000/650,width:8000}};
export let MAP_SCALE=1,MAP_SEED=27182,WORLD_RADIUS=325;
export let CURRENT_SIZE='small';
const BASE_MONUMENTS=[
 {id:'lighthouse',name:'Чёрный маяк',kind:'lighthouse',x:208,z:147,radius:20,risk:1,loot:'supplies'},
 {id:'harbor',name:'Порт «Север»',kind:'harbor',x:225,z:-48,radius:27,risk:2,loot:'industrial'},
 {id:'airfield',name:'Заброшенный аэродром',kind:'airfield',x:92,z:-196,radius:32,risk:3,loot:'military'},
 {id:'power',name:'ТЭЦ-04',kind:'power',x:-72,z:-216,radius:25,risk:3,loot:'industrial'},
 {id:'quarry',name:'Каменный карьер',kind:'quarry',x:-220,z:-77,radius:26,risk:1,loot:'ore'},
 {id:'radar',name:'Радарный узел',kind:'radar',x:-194,z:101,radius:22,risk:3,loot:'military'},
 {id:'waterworks',name:'Водоочистка',kind:'waterworks',x:-105,z:215,radius:23,risk:2,loot:'supplies'},
 {id:'gas',name:'Последняя заправка',kind:'gas',x:76,z:126,radius:20,risk:1,loot:'supplies'},
 {id:'junkyard',name:'Свалка «Ржавчина»',kind:'junkyard',x:150,z:30,radius:23,risk:2,loot:'industrial'},
 {id:'bunker',name:'Бункер 17',kind:'bunker',x:1,z:-100,radius:20,risk:3,loot:'military'}
];
BASE_MONUMENTS.push(
{id:'outpost',name:'Аванпост · мирная зона',kind:'outpost',safe:true,x:-45,z:140,radius:24,risk:0,loot:'supplies'},
{id:'village',name:'Посёлок торговцев',kind:'market',safe:true,x:140,z:-70,radius:23,risk:0,loot:'supplies'},
{id:'supermarket',name:'Супермаркет «Берег»',kind:'supermarket',x:-120,z:-55,radius:16,risk:1,loot:'supplies'},
{id:'satellite',name:'Спутниковая станция',kind:'satellite',x:-145,z:28,radius:16,risk:2,loot:'military'},
{id:'trainyard',name:'Железнодорожное депо',kind:'trainyard',x:40,z:-150,radius:22,risk:2,loot:'industrial'},
{id:'mining-village',name:'Шахтёрский посёлок',kind:'mining',x:-15,z:-180,radius:18,risk:1,loot:'ore'},
{id:'wreckyard',name:'Разбитая автоколонна',kind:'wreckyard',x:190,z:80,radius:17,risk:1,loot:'industrial'},
{id:'water-tower',name:'Старая водонапорная башня',kind:'waterTower',x:-70,z:-90,radius:14,risk:1,loot:'supplies'});
const BASE_BOT_BASES=[
 {id:'hunters',name:'Лагерь егерей',x:-76,z:63,tier:1,color:0x5b6350},
 {id:'scavs',name:'Хата старателей',x:66,z:-49,tier:0,color:0x77634b},
 {id:'watch',name:'Пост дозорных',x:166,z:-131,tier:2,color:0x59645e},
 {id:'miners',name:'База горняков',x:-157,z:-149,tier:1,color:0x626958},
 {id:'raiders',name:'Логово налётчиков',x:-181,z:169,tier:2,color:0x5e5550},
 {id:'coast',name:'Береговое убежище',x:167,z:212,tier:1,color:0x635d47}
];
const BASE_ROAD_POINTS=[
 [190,145],[232,70],[226,-45],[174,-130],[90,-211],[-30,-238],[-133,-202],[-218,-102],[-238,13],[-199,103],[-133,191],[-25,236],[99,208],[190,145]
];
const offshore=()=>[{id:'oil-small',name:'Малая нефтеплатформа',kind:'oilrig',x:WORLD_RADIUS+110,z:60*MAP_SCALE,radius:26,risk:2,loot:'military'},{id:'oil-large',name:'Большая нефтеплатформа',kind:'oilrig',x:-WORLD_RADIUS-110,z:-65*MAP_SCALE,radius:32,risk:2,loot:'military'}];
export let MONUMENTS=[...BASE_MONUMENTS.map(m=>({...m})),...offshore()],BOT_BASES=BASE_BOT_BASES.map(b=>({...b})),ROAD_POINTS=BASE_ROAD_POINTS.map(p=>[...p]);
const mix=(a,b,t)=>a+(b-a)*t;
export function roadSamples(){
 const result=[];
 // Catmull-Rom spline with a closed, consistent final segment.
 const points=ROAD_POINTS.slice(0,-1),n=points.length;
 const perSegment=MAP_SCALE>3?Math.ceil(14*MAP_SCALE):14;for(let i=0;i<n;i++)for(let k=0;k<perSegment;k++){
  const t=k/perSegment,a=points[(i+n-1)%n],b=points[i],c=points[(i+1)%n],d=points[(i+2)%n];
  const cat=(v)=>.5*((2*b[v])+(-a[v]+c[v])*t+(2*a[v]-5*b[v]+4*c[v]-d[v])*t*t+(-a[v]+3*b[v]-3*c[v]+d[v])*t*t*t);
  result.push({x:cat(0),z:cat(1),branch:false});
 }
 result.push({...result[0]});
 const branch=[],branchCount=MAP_SCALE>3?Math.ceil(90*MAP_SCALE):90;for(let i=0;i<=branchCount;i++){const t=i/branchCount;branch.push({x:mix(-20*MAP_SCALE,92*MAP_SCALE,t)+Math.sin(t*Math.PI*3)*17*MAP_SCALE,z:mix(234*MAP_SCALE,-211*MAP_SCALE,t),branch:true});}
 return{ring:result,branch};
}
export let ROADS=roadSamples();
export function configureMap(size='small',seed=27182){
 roadGrid=null;CURRENT_SIZE=Object.hasOwn(MAP_SIZES,size)?size:'small';MAP_SCALE=MAP_SIZES[CURRENT_SIZE].scale;MAP_SEED=Number.isInteger(seed)&&seed>=1&&seed<=999999999?seed:27182;WORLD_RADIUS=325*MAP_SCALE;
 MONUMENTS=[...BASE_MONUMENTS.map(m=>({...m,x:m.x*MAP_SCALE,z:m.z*MAP_SCALE})),...offshore()];BOT_BASES=BASE_BOT_BASES.map(b=>({...b,x:b.x*MAP_SCALE,z:b.z*MAP_SCALE}));ROAD_POINTS=BASE_ROAD_POINTS.map(p=>p.map(v=>v*MAP_SCALE));ROADS=roadSamples();BOT_BASES=settlements();
 return{size:CURRENT_SIZE,seed:MAP_SEED,scale:MAP_SCALE};
} 
let roadGrid=null;
export function distanceToRoad(x,z,near=Infinity){let best=1e9;let segments;
 if(near<=16){if(!roadGrid){roadGrid=new Map();for(const path of Object.values(ROADS))for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let cx=Math.floor((Math.min(a.x,b.x)-16)/32);cx<=Math.floor((Math.max(a.x,b.x)+16)/32);cx++)for(let cz=Math.floor((Math.min(a.z,b.z)-16)/32);cz<=Math.floor((Math.max(a.z,b.z)+16)/32);cz++){const key=cx+':'+cz;if(!roadGrid.has(key))roadGrid.set(key,[]);roadGrid.get(key).push([a,b]);}}}segments=roadGrid.get(Math.floor(x/32)+':'+Math.floor(z/32))||[];
 }else segments=Object.values(ROADS).flatMap(path=>path.slice(1).map((b,i)=>[path[i],b]));
 for(const [a,b]of segments){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}return best;}
export function monumentAt(x,z){return MONUMENTS.find(m=>Math.hypot(x-m.x,z-m.z)<m.radius+3)||null;}
export function locationName(x,z){return monumentAt(x,z)?.name||BOT_BASES.find(b=>Math.hypot(x-b.x,z-b.z)<20)?.name||'Дикие земли';}

/** New large islands have a mountain watershed. Legacy island heights stay compatible. */
export function riverAt(x,z){
 if(MAP_SCALE<3)return null;const u=x/MAP_SCALE,v=z/MAP_SCALE;if(v< -220||v>270)return null;
 const center=35+Math.sin(v*.035)*18,dist=Math.abs(u-center),water=Math.max(0,10*(1-(v+220)/490));return{distance:dist*MAP_SCALE,water,x:center*MAP_SCALE,z,width:6*MAP_SCALE};
}

export function safeZoneAt(x,z){return MONUMENTS.find(m=>m.safe&&Math.hypot(x-m.x,z-m.z)<m.radius+10)||null;}
function settlements(){let n=MAP_SEED^0x7138;const r=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};const result=[];
 for(let i=0;i<40000&&result.length<120;i++){const a=r()*Math.PI*2,rad=Math.sqrt(r())*246*MAP_SCALE,x=Math.cos(a)*rad,z=Math.sin(a)*rad,river=riverAt(x,z);if(Math.hypot(x+6,z+3)<42||MONUMENTS.some(m=>Math.hypot(x-m.x,z-m.z)<m.radius+18)||distanceToRoad(x,z,12)<10||river&&river.distance<river.width+12||result.some(b=>Math.hypot(x-b.x,z-b.z)<(i<20000?17:14)))continue;
 const id='settlement-'+result.length,raided=r()<.25;result.push({id,name:'Убежище '+(result.length+1)+(raided?' · следы рейда':''),x,z,tier:1+Math.floor(r()*3),raided,leftovers:!raided||r()<.5,color:0x73766c,layout:r()<.7?'2x2':'2x1'});}
 return result;}
