import {coastDistance13} from './terrain13.js';
/** Pure shared classification; spawn and vegetation use the same biome borders. */
export function biomeRegion18(x,z,scale,revision,seed,noise){
 const u=x/scale,v=z/scale,w=(noise(u*.012+73,v*.012-18)-.5)*45;
 if(v+w<-88)return{id:'snow',name:revision>=6?'Север · снежное редколесье':'Зима · снежное нагорье',color:0xc7d3d0,grass:.15};
 if(u+w>58&&v-w>48)return{id:'arid',name:'Пустыня',color:0xd8bc83,grass:.035};
 if(revision>=6?coastDistance13(x,z,scale,seed)<30:Math.hypot(u*.97,v)>269)return{id:'coast',name:'Побережье',color:0xb5a377,grass:.35};
 return{id:'forest',name:'Зелёная долина',color:0x72815b,grass:1};
}
