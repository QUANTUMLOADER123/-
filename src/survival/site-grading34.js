/** Keep neighboring flat industrial aprons from forming incompatible cliff heights. */
export function relaxSiteGrades34(sites){
 const land=sites.filter(m=>m.kind!=='oilrig');
 for(let pass=0;pass<64;pass++)for(let i=0;i<land.length;i++)for(let j=i+1;j<land.length;j++){
  const a=land[i],b=land[j],gap=Math.max(8,Math.hypot(a.x-b.x,a.z-b.z)-.98*(a.radius+b.radius));if(gap>90)continue;
  const delta=b.padHeight34-a.padHeight34,excess=Math.abs(delta)-gap*.22;if(excess>0){const adjust=Math.sign(delta)*excess*.5;a.padHeight34+=adjust;b.padHeight34-=adjust;}
 }
}
