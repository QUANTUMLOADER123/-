const {app,BrowserWindow,protocol,session,Menu}=require('electron');
const {readFile}=require('node:fs/promises');
const path=require('node:path');
const smoke=process.argv.includes('--smoke');
// Pin the storage directory across product-name / packaging changes.
const storage=path.join(app.getPath('appData'),'oskol-survival');require('node:fs').mkdirSync(storage,{recursive:true});app.setPath('userData',storage);
protocol.registerSchemesAsPrivileged([{scheme:'oskol',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
if(smoke){app.commandLine.appendSwitch('enable-unsafe-swiftshader');app.commandLine.appendSwitch('use-angle','swiftshader');}
let window;
app.whenReady().then(async()=>{
 const root=path.resolve(__dirname,'../web');
 protocol.handle('oskol',async request=>{
  try{const url=new URL(request.url);if(url.hostname!=='game')return new Response('Forbidden',{status:403});let pathname=decodeURIComponent(url.pathname);if(pathname.endsWith('/'))pathname+='index.html';const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return new Response('Forbidden',{status:403});const body=await readFile(file);const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.txt':'text/plain'};return new Response(body,{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:; object-src 'none'"}});}catch{return new Response('Not found',{status:404});}
 });
 // Offline game: requests to arbitrary remote hosts are not needed or allowed.
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
 window=new BrowserWindow({width:1440,height:900,minWidth:960,minHeight:600,title:'ОСКОЛ · DEV 0.6',backgroundColor:'#151d17',show:!smoke,icon:path.join(__dirname,'icon.png'),webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 Menu.setApplicationMenu(null);window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('oskol://game/'))event.preventDefault();});
 window.webContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='F11'){window.setFullScreen(!window.isFullScreen());event.preventDefault();}});
 window.on('focus',()=>{window.webContents.executeJavaScript('window.restoreOskolFocus?.()',true).catch(()=>{});});
 await window.loadURL('oskol://game/index.html'+(smoke?'?quality=low':''));
 if(smoke){
  const deadline=Date.now()+180000;
  const timer=setInterval(async()=>{try{
   if(Date.now()>deadline)throw new Error('Desktop world initialization timed out');
   if(!await window.webContents.executeJavaScript('!!window.oskol?.ready'))return;
   clearInterval(timer);const info=await window.webContents.executeJavaScript('window.oskol.snapshot()');if(info.stats.monuments!==12||info.stats.bots<12||!info.stats.webgl2)throw new Error('Incomplete 3D world');
   await window.webContents.executeJavaScript(`document.querySelector('#start').click();document.querySelector('[data-multiplier="5"]').click();document.querySelector('#world-create').click()`);
   const check=setInterval(async()=>{try{if(Date.now()>deadline)throw new Error('Desktop start timed out');const s=await window.webContents.executeJavaScript('window.oskol.snapshot()');if(s.mode==='playing'){clearInterval(check);if(s.multiplier!==5||!s.saved)throw new Error('World configuration / save failed');console.log('DESKTOP_SMOKE_PASSED '+JSON.stringify(s.stats));app.exit(0);}}catch(error){clearInterval(check);console.error(error);app.exit(1);}},500);
  }catch(error){clearInterval(timer);console.error(error);app.exit(1);}},500);
 }
});
app.on('window-all-closed',()=>app.quit());
