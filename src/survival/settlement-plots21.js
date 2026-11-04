const TAU=Math.PI*2;
/** New-world plots: real-metre coastal margin, stratified coverage, then infill.
 * No normalized 269m circle that strands homes 400m inland on 8km maps. */
export function settlementPlots21({scale,seed,sites,river,coast,roadDistance,height}){
 let n=seed^0x7138;const r=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296),step=Math.max(8,scale*4),extent=Math.ceil(325*scale/step),candidates=[];
 for(let ix=-extent;ix<=extent;ix++)for(let iz=-extent;iz<=extent;iz++){
  const x=(ix+(r()-.5)*.32)*step,z=(iz+(r()-.5)*.32)*step,shore=coast(x,z);
  if(shore<24||Math.hypot(x+6,z+3)<46||sites.some(m=>m.kind!=='oilrig'&&Math.hypot(x-m.x,z-m.z)<m.radius+14)||roadDistance(x,z,16)<12)continue;
  const channel=river(x,z);if(channel&&channel.distance<channel.width*.5+14)continue;
  candidates.push({x,z,shore,sector:Math.floor(((Math.atan2(z,x)+TAU)%TAU)/TAU*24),rank:r()});
 }
 candidates.sort((a,b)=>a.rank-b.rank);const selected=[],checked=new Map();
 const accept=(p,spacing)=>{if(selected.includes(p)||selected.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<spacing))return false;
  let good=checked.get(p);if(good===undefined){const samples=[height(p.x,p.z),...[-7,7].flatMap(dx=>[-7,7].map(dz=>height(p.x+dx,p.z+dz)))];good=Math.min(...samples)>1.3&&Math.max(...samples)-Math.min(...samples)<5;checked.set(p,good);}if(!good)return false;selected.push(p);return true;};
 // One coastal plot per sector where a safe site exists, also on large islands.
 for(let sector=0;sector<24;sector++)for(const p of candidates)if(p.sector===sector&&p.shore<100&&accept(p,24))break;
 for(let sector=0;sector<24;sector++)for(const p of candidates)if(p.sector===sector&&p.shore>=100&&accept(p,24))break;
 for(const spacing of [24,22,20,18]){for(const p of candidates){if(selected.length===120)break;accept(p,spacing);}if(selected.length===120)break;}
 // Never enter a silently empty/partial island and overwrite the previous save.
 if(selected.length!==120)throw new Error('Не удалось разместить 120 безопасных домов. Выбери другое зерно мира. Прежнее сохранение не заменено.');
 return selected.map((p,i)=>{const material=r(),tier=material<.4?1:material<.8?2:3,raided=r()<.25,u=r();return{id:'settlement-'+i,name:'Убежище '+(i+1)+(raided?' · следы рейда':''),x:p.x,z:p.z,tier,raided,leftovers:!raided||r()<.5,stories:u<.5?1:u<.7?2:u<.8?3:u<.95?4:5,layout:r()<.8?'2x2':'2x1'};});
}
