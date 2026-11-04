/** Bounded plain save metadata only; no renderer or world imports. */
export function validTactics27(ai,coord){if(!ai)return true;const finite=n=>Number.isFinite(n)&&n>=0&&n<=1e8;
 for(const f of Object.values(ai.factions)){
  const a=f.alarm27;if(a&&(!coord(a)||!finite(a.at)||!finite(a.until)||!finite(a.lastHit)))return false;
  const r=f.raid27;if(r&&(!coord(r)||!Object.hasOwn(ai.factions,r.enemy)||!Array.isArray(r.squad)||r.squad.length>4||r.squad.some(id=>!Object.hasOwn(ai.actors,id)||ai.actors[id].home!==f.id)||!['rally','scout','breach','assault','withdraw'].includes(r.stage)||!finite(r.at)||!finite(r.until)||r.target!==null&&(typeof r.target!=='string'||r.target.length>100)||r.breacher!==null&&!r.squad.includes(r.breacher)))return false;
 }return true;
}
