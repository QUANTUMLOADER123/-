/** Exterior-only workshop detail, merged with the existing material batches.
 * Moving details are children of their real mechanisms; no extra per-frame animation.
 */
export function detailWeapon37(root,h){
 const {p,box,tube,ring,steel,dark,wood,alloy}=h,u=root.userData,short=['pistol','revolver'].includes(p.family);let parts=0;
 const panel=(size,pos,mat=dark,parent=root)=>{parts++;return box(size,pos,mat,.001,parent);};
 const pin=(x,y,z,parent=root)=>{parts+=2;const m=tube(.0038,.004,[x,y,z],alloy,false,parent,8);m.rotation.set(0,0,Math.PI/2);panel([.001,.0016,.005],[x+Math.sign(x)*.0025,y,z],dark,parent);};
 if(p.family==='launcher'){
  for(const z of[-.85,-.63,-.22]){ring(.101,[0,.145,z],steel);parts++;for(const side of[-1,1])pin(side*.102,.145,z);}
  for(let i=0;i<6;i++)panel([.002,.009,.020],[.094,.16,-.78+i*.027],dark);
  panel([.016,.025,.055],[.099,.10,-.15],alloy);
 }else{
  const x=short?.039:p.family==='lmg'?.059:.048;
  // Inset service cover, countersunk pins and tiny milled index marks on both faces.
  for(const side of[-1,1]){panel([.003,.022,short?.075:.125],[side*x,.093,short?-.037:-.13],steel);for(const z of short?[-.061,-.013]:[-.18,-.08])pin(side*(x+.003),.093,z);for(let i=0;i<4;i++)panel([.001,.002,.011],[side*(x+.002),.116,-.12+i*.016],dark);}
  // Actual moving slide/cylinder gets its own grooves, not floating static decorations.
  if(u.slide14)for(const side of[-1,1])for(let i=0;i<7;i++)panel([.002,.021,.0025],[side*(p.heavy?.042:.038),.17,.028+i*.008],dark,u.slide14);
  if(u.cylinder14)for(let i=0;i<6;i++){const a=i*Math.PI/3;panel([.005,.065,.005],[Math.cos(a)*.060,0,Math.sin(a)*.060],dark,u.cylinder14);}
  if(u.magazine)for(const side of[-1,1])for(let i=0;i<4;i++)panel([.002,.0025,.023],[side*(short?.023:.029),short?-.033+i*.020:-.035-i*.035,short?0:p.family==='smg'?-.09:-.13],short?dark:steel,u.magazine);
  if(u.bolt14)panel(p.family==='bolt'?[.002,.022,.005]:[.001,.014,.038],[p.family==='bolt'?.009:.0035,0,0],dark,u.bolt14);
  if(!short){
   // Fore-end cooling slots, retained pump grip, barrel collar and sling hardware.
   const parent=u.foregrip14||root;
   for(const side of[-1,1])for(let i=0;i<6;i++)panel([.002,.007,.014],[side*.037,.133,p.guard-.077+i*.027],dark,parent);
   for(const z of[p.end+.12,p.end+.19]){ring(.021,[0,.15,z],steel);parts++;}
   if(p.stock==='wood')for(const side of[-1,1]){panel([.002,.019,.085],[side*.033,.087,.31],wood);pin(side*.036,.086,.32);}
   panel([.013,.006,.040],[.028,.178,-.073],alloy);
  }
 }
 u.detail37={revision:37,parts,mechanismsFollow:true,batched:true};
}
