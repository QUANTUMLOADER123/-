/** Save-shape validation only; no game/world imports and no execution on import. */
export function validSociety26(s,items,coord,guns){
 if(s===undefined)return true;
 const bag=b=>b&&typeof b==='object'&&!Array.isArray(b)&&Object.keys(b).length<=220&&Object.entries(b).every(([k,n])=>Object.hasOwn(items,k)&&Number.isInteger(n)&&n>0&&n<=1e8);
 const finite=(n,max=1e8)=>Number.isFinite(n)&&n>=0&&n<=max;
 if(!s||s.version!==1||!Number.isInteger(s.serial)||s.serial<0||s.serial>1e7||!Array.isArray(s.events)||s.events.length>32||s.events.some(e=>typeof e!=='string'||e.length>180))return false;
 if(!s.factions||typeof s.factions!=='object'||Array.isArray(s.factions)||Object.keys(s.factions).length>32||!s.actors||typeof s.actors!=='object'||Array.isArray(s.actors)||Object.keys(s.actors).length>120)return false;
 for(const [id,f]of Object.entries(s.factions))if(!/^settlement-\d+$/.test(id)||!f||f.id!==id||!coord(f)||!Number.isInteger(f.team)||f.team<0||f.team>2||!Number.isInteger(f.capacity)||f.capacity<1||f.capacity>96||!Number.isInteger(f.stage)||f.stage<0||f.stage>10||!Number.isInteger(f.huts)||f.huts<0||f.huts>2||(f.depotX!==undefined&&!coord({x:f.depotX,z:f.depotZ}))||(f.breachedUntil!==undefined&&!finite(f.breachedUntil))||(f.lastContact!==undefined&&(!coord(f.lastContact)||!finite(f.lastContact.at)))||!finite(f.nextRaid)||!finite(f.nextCraft)||f.site!==null&&!coord(f.site))return false;
 for(const [id,a]of Object.entries(s.actors))if(!/^(settler26-\d+|guard-[a-z-]+)$/.test(id)||!a||a.id!==id||!coord(a)||!finite(a.hp,120)||!finite(a.respawnAt)||!finite(a.food,100)||!finite(a.nextFood)||!finite(a.shotAt)||(a.fuse26!==undefined&&(!a.fuse26||typeof a.fuse26.id!=='string'||a.fuse26.id.length>100||!finite(a.fuse26.at)))||(a.clip37!==undefined&&(!Number.isInteger(a.clip37)||a.clip37<0||a.clip37>200))||(a.reloadUntil37!==undefined&&!finite(a.reloadUntil37))||(a.clipGun37!==undefined&&(typeof a.clipGun37!=='string'||!Object.hasOwn(guns,a.clipGun37)))||!bag(a.bag)||typeof a.gun!=='string'||a.gun&&!Object.hasOwn(guns,a.gun)||a.home!==null&&!Object.hasOwn(s.factions,a.home))return false;
 return true;
}
