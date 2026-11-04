/** Bounded plain save metadata only; no renderer or world imports. */
export function validTactics27(ai,coord){if(!ai)return true;const finite=n=>Number.isFinite(n)&&n>=0&&n<=1e8;
 for(const f of Object.values(ai.factions)){
  if(f.upgrades29!==undefined&&(!f.upgrades29||typeof f.upgrades29!=='object'||Array.isArray(f.upgrades29)||Object.keys(f.upgrades29).length>128||Object.entries(f.upgrades29).some(([id,t])=>!id.startsWith('base-'+f.id+'-')||id.length>100||!Number.isInteger(t)||t<1||t>4)))return false;
  if(f.upgradeAt29!==undefined&&!finite(f.upgradeAt29)||f.upgradeCount29!==undefined&&(!Number.isInteger(f.upgradeCount29)||f.upgradeCount29<0||f.upgradeCount29>100000))return false;
  const a=f.alarm27;if(a&&(!coord(a)||!finite(a.at)||!finite(a.until)||!finite(a.lastHit)))return false;
  const r=f.raid27;if(r&&(!coord(r)||!Object.hasOwn(ai.factions,r.enemy)||!Array.isArray(r.squad)||r.squad.length>4||r.squad.some(id=>!Object.hasOwn(ai.actors,id)||ai.actors[id].home!==f.id)||!['rally','scout','breach','assault','withdraw'].includes(r.stage)||!finite(r.at)||!finite(r.until)||r.target!==null&&(typeof r.target!=='string'||r.target.length>100)||r.breacher!==null&&!r.squad.includes(r.breacher)))return false;
 }return true;
}
