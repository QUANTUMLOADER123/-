/** UI-only loading gallery and cooperative cancellation; no 3D imports or startup work. */
export function checkLoading11(signal){if(signal?.aborted)throw new DOMException('Вход на остров отменён','AbortError');}
export function paintLoading11(signal){
 checkLoading11(signal);
 return new Promise((resolve,reject)=>{
  let a,b;
  const abort=()=>{cancelAnimationFrame(a);cancelAnimationFrame(b);signal?.removeEventListener('abort',abort);reject(new DOMException('Вход на остров отменён','AbortError'));};
  signal?.addEventListener('abort',abort,{once:true});
  a=requestAnimationFrame(()=>{b=requestAnimationFrame(()=>{signal?.removeEventListener('abort',abort);if(signal?.aborted)abort();else resolve();});});
 });
}
export const LOADING_ART11=[
 ['night-patrol','НОЧНОЙ ДОЗОР'],['winter-convoy','ЗИМНИЙ ПЕРЕВАЛ'],['desert-crossroads','РАЗВИЛКА НА РАССВЕТЕ'],['industrial-rain','ДОЖДЬ НА ТЭЦ'],['offshore-storm','ШТОРМ У ПЛАТФОРМЫ'],['forest-shelter','ЛЕСНОЕ УБЕЖИЩЕ'],['lighthouse-dawn','МАЯК НА РАССВЕТЕ'],['bunker-embers','ОГНИ У БУНКЕРА']
];
let epoch=0,timer=null,index=0,side=0,busy=false,order=[];
const $=id=>document.getElementById(id);
export function stopGallery11(){epoch++;clearTimeout(timer);busy=false;}
export function startGallery11(){
 stopGallery11();index=0;side=0;order=[0,...LOADING_ART11.slice(1).map((_,i)=>i+1)];
 for(let i=order.length-1;i>1;i--){const j=1+Math.floor(Math.random()*i);[order[i],order[j]]=[order[j],order[i]];}
 const [file,title]=LOADING_ART11[0];$('loading-art-a11').style.backgroundImage=`url("assets/ui11/${file}.jpg")`;$('loading-art-a11').classList.add('visible');$('loading-art-b11').classList.remove('visible');
 $('loading-art-title11').textContent=title+' · 1 / '+order.length;
 schedule();
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(document.hidden){schedule();return;}nextGallery11();},10000);}
export async function nextGallery11(){
 if(busy||$('loading').hidden)return;busy=true;clearTimeout(timer);const token=epoch,next=(index+1)%order.length,[file,title]=LOADING_ART11[order[next]],url='assets/ui11/'+file+'.jpg';
 try{
  const image=new Image();image.src=url;await image.decode();if(token!==epoch||$('loading').hidden)return;
  const old=$(side?'loading-art-b11':'loading-art-a11'),fresh=$(side?'loading-art-a11':'loading-art-b11');fresh.style.backgroundImage=`url("${url}")`;fresh.classList.add('visible');old.classList.remove('visible');side=1-side;index=next;$('loading-art-title11').textContent=title+' · '+(index+1)+' / '+order.length;
 }catch{/* Keep the previous local illustration if a file cannot decode. */}
 finally{if(token===epoch){busy=false;if(!$('loading').hidden)schedule();}}
}
