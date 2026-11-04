/** Menu-only diagnostics. No world construction, test runner or save mutation. */
const $=id=>document.getElementById(id);
export const entryErrorOpen30=()=>!$('entry-error30').hidden;
export function closeEntryError30(){if(!entryErrorOpen30())return false;$('entry-error30').hidden=true;$('start').focus({preventScroll:true});return true;}
export function showEntryError30(error,stage){
 const message=String(error?.message||error||'Неизвестная ошибка').slice(0,1500);
 const report=['ОСКОЛ 0.33.0-dev33',new Date().toISOString(),'Этап: '+stage,(error?.name||'Error')+': '+message,String(error?.stack||'').slice(0,3500)].join('\n');
 try{localStorage.setItem('oskol.last-entry-error',report);}catch{/* Diagnostics must work even when storage is unavailable. */}
 $('entry-error-stage30').textContent='Этап: '+stage;
 $('entry-error-message30').textContent=message;
 $('entry-error-report30').value=report;
 $('entry-error-copy30').textContent='СКОПИРОВАТЬ ОШИБКУ';
 $('entry-error30').hidden=false;
 $('entry-error-close30').focus({preventScroll:true});
}
$('entry-error-close30').addEventListener('click',closeEntryError30);
$('entry-error-copy30').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText($('entry-error-report30').value);$('entry-error-copy30').textContent='СКОПИРОВАНО';}
 catch{const field=$('entry-error-report30');field.closest('details').open=true;field.focus();field.select();$('entry-error-copy30').textContent='СКОПИРУЙ ВЫДЕЛЕННЫЙ ТЕКСТ';}
});
document.addEventListener('keydown',event=>{
 if(!entryErrorOpen30())return;
 if(event.code==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeEntryError30();}
 else if(event.code==='Tab'){const controls=[...$('entry-error30').querySelectorAll('button,summary,textarea')].filter(e=>e.offsetParent!==null),index=controls.indexOf(document.activeElement);event.preventDefault();controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}
},true);
