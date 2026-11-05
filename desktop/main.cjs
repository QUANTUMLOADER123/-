const {app,BrowserWindow,protocol,session,Menu}=require('electron');
const {readFile,writeFile,mkdir}=require('node:fs/promises');
const path=require('node:path');
const smoke=process.argv.includes('--smoke');
// Never overwrite a real save when testing a packaged executable.
const storage=smoke?path.join(app.getPath('temp'),'oskol-smoke-'+process.pid):path.join(app.getPath('appData'),'oskol-survival');
require('node:fs').mkdirSync(storage,{recursive:true});app.setPath('userData',storage);
protocol.registerSchemesAsPrivileged([{scheme:'oskol',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
if(smoke){app.commandLine.appendSwitch('enable-unsafe-swiftshader');app.commandLine.appendSwitch('use-angle','swiftshader');}
let window,finished=false;
async function finishSmoke(code,facts=null,error=null){
 if(finished)return;finished=true;const report={status:code?'failed':'passed',version:app.getVersion(),platform:process.platform,at:new Date().toISOString(),facts,error:error?String(error.stack||error):null};
 console[code?'error':'log']('DESKTOP_SMOKE_'+(code?'FAILED':'PASSED')+' '+JSON.stringify(report));
 if(process.env.OSKOL_SMOKE_REPORT){try{const file=path.resolve(process.env.OSKOL_SMOKE_REPORT);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,JSON.stringify(report,null,2));}catch(e){console.error(e);code=1;}}
 app.exit(code);
}
async function desktopSmoke(){
 const until=async(script,timeout=240000)=>{const deadline=Date.now()+timeout;while(Date.now()<deadline){const result=await window.webContents.executeJavaScript(script,true);if(result)return result;await new Promise(resolve=>setTimeout(resolve,250));}throw new Error('Packaged desktop check timed out: '+script);};
 await until('!!window.oskol?.menuReady');
 await window.webContents.executeJavaScript(`document.querySelector('#start').click()`,true);
 await until(`!document.querySelector('#world-setup').hidden`);
 await window.webContents.executeJavaScript(`document.querySelector('[data-size="small"]').click();document.querySelector('[data-multiplier="5"]').click();document.querySelector('#bot-limit26').value='0';document.querySelector('#world-create').click()`,true);
 await until(`(()=>{if(!document.querySelector('#entry-error30').hidden)throw new Error(document.querySelector('#entry-error-report30').value);return !!window.oskol?.ready;})()`);
 const facts=await window.webContents.executeJavaScript(`({snapshot:window.oskol.snapshot(),diagnostics:window.oskol.inspect33()})`,true),s=facts.snapshot,d=facts.diagnostics;
 if(s.stats.monuments!==20||s.stats.bases!==120||!s.stats.webgl2||s.multiplier!==5||!s.saved)throw new Error('Incomplete packaged world/save: '+JSON.stringify(s.stats));
 if(d.sites.length!==20||d.sites.some(s=>s.revision!==34||s.sourceParts<140))throw new Error('Incorrect packaged DEV34 sites');
 if(d.rocks.wrong||d.rocks.mineable<100||d.weapons.length!==16||d.weapons.some(w=>w.revision!==34))throw new Error('Incorrect packaged rocks/weapons');
 if(d.recyclers.length!==20||d.recyclers.some(r=>!r.stations.some(s=>s.approach)))throw new Error('Incomplete packaged recycler coverage');
 await window.webContents.executeJavaScript(`document.querySelector('#inventory-button').click()`,true);await until(`window.oskol.snapshot().overlay==='inventory'`);
 await window.webContents.executeJavaScript(`document.querySelector('#inventory-close').click()`,true);await until(`window.oskol.snapshot().overlay===null`);
 await finishSmoke(0,facts);
}
app.whenReady().then(async()=>{
 const root=path.resolve(__dirname,'../web');
 protocol.handle('oskol',async request=>{
  try{const url=new URL(request.url);if(url.hostname!=='game')return new Response('Forbidden',{status:403});let pathname=decodeURIComponent(url.pathname);if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return new Response('Forbidden',{status:403});const body=await readFile(file);const types={'.ttf':'font/ttf','.woff2':'font/woff2','.md':'text/plain; charset=utf-8','.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.wav':'audio/wav','.json':'application/json','.txt':'text/plain'};return new Response(body,{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:; object-src 'none'"}});}catch{return new Response('Not found',{status:404});}
 });
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
 window=new BrowserWindow({width:smoke?960:1440,height:smoke?600:900,minWidth:960,minHeight:600,title:'ОСКОЛ · DEV '+app.getVersion(),backgroundColor:'#151d17',show:!smoke,icon:path.join(__dirname,'icon.png'),webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:!smoke}});
 Menu.setApplicationMenu(null);window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('oskol://game/'))event.preventDefault();});
 window.webContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='F11'){window.setFullScreen(!window.isFullScreen());event.preventDefault();}});
 window.on('focus',()=>{window.webContents.executeJavaScript('window.restoreOskolFocus?.()',true).catch(()=>{});});
 if(smoke)window.webContents.on('render-process-gone',(_event,details)=>finishSmoke(1,null,new Error('Renderer exited: '+details.reason)));
 await window.loadURL('oskol://game/index.html'+(smoke?'?quality=low':''));
 if(smoke)await desktopSmoke();
}).catch(error=>{if(smoke)finishSmoke(1,null,error);else{console.error(error);app.exit(1);}});
app.on('window-all-closed',()=>app.quit());
