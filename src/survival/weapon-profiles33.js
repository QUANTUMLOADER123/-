/** Canonical metres: -Z forward, +Y up. Original fictional service weapons. */
export const WEAPON_FORMS33={
 rifle:{family:'bolt',end:-.84,stock:'wood',guard:-.43,internal:true},
 boltRifle:{family:'bolt',end:-1.02,stock:'precision',guard:-.48,internal:true},
 semiRifle:{family:'rifle',end:-.88,stock:'wood',guard:-.46,curved:false},
 assaultRifle:{family:'rifle',end:-.79,stock:'telescopic',guard:-.41,ar:true},
 akRifle:{family:'rifle',end:-.86,stock:'wood',guard:-.43,curved:true,ak:true},
 carbine26:{family:'rifle',end:-.69,stock:'telescopic',guard:-.36,ar:true,short:true},
 smg:{family:'smg',end:-.53,stock:'wire',guard:-.30,round:true},
 compactSmg:{family:'smg',end:-.43,stock:'wire',guard:-.25,short:true},
 pdw26:{family:'smg',end:-.47,stock:'telescopic',guard:-.27,pdw:true},
 pistol:{family:'pistol',end:-.29},heavyPistol:{family:'pistol',end:-.37,heavy:true},
 revolver:{family:'revolver',end:-.43},
 shotgun:{family:'shotgun',end:-.94,stock:'wood',guard:-.47,pump:true,internal:true},
 combatShotgun:{family:'shotgun',end:-.80,stock:'telescopic',guard:-.40},
 machineGun:{family:'lmg',end:-.99,stock:'fixed',guard:-.48},
 rocketLauncher:{family:'launcher',end:-1.04,guard:-.45},
};
export function grips33(id){const p=WEAPON_FORMS33[id];if(!p)return null;const pistol=['pistol','revolver'].includes(p.family);return{right:pistol?[.052,-.066,.083]:[.052,-.065,.080],left:pistol?[-.052,-.063,.082]:[-.056,.050,p.guard],pistol};}
