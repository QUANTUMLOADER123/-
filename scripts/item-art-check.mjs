import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {launchBrowser} from './browser-runtime.mjs';
import {newGame,encodeSave,SAVE_KEY} from '../src/survival/state.js';
import {ITEM_ART} from '../src/survival/item-art.js';
import {stackLimit} from '../src/survival/inventory.js';
const browser=await launchBrowser(),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:780}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()));
 const time=new Date('2026-11-03T12:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);
 const s=newGame({difficulty:'peaceful'});s.position={x:0,z:13};s.yaw=0;s.pitch=-.12;for(const id of Object.keys(ITEM_ART))s.inventory[id]=Math.min(20,stackLimit(id));
 s.buildings=[{id:'build-art-furnace',kind:'furnace',x:0,z:10,rotation:0,tier:0,hp:75}];s.furnaces={'build-art-furnace':{on:false,progress:0,fuelTime:0,slots:['wood','metalOre','sulfurOre','metal','charcoal','sulfur'].map(item=>({item,count:2}))}};
 await page.addInitScript(({key,save})=>{localStorage.setItem(key,save);localStorage.setItem('oskol.settings',JSON.stringify({quality:'low',sound:false,haptics:false}));},{key:SAVE_KEY,save:encodeSave(s)});
 await page.goto('http://localhost:3000/?quality=low');
 for(let i=0;i<1200&&!await page.evaluate(()=>!!window.oskol?.ready);i++){await page.clock.fastForward(100);await new Promise(r=>setTimeout(r,25));}
 assert.ok(await page.evaluate(()=>window.oskol?.ready),'World initialization');
 await page.locator('#start').click();await page.clock.fastForward(100);await page.keyboard.press('KeyI');
 assert.equal(await page.locator('.inventory-slot img[src^="assets/items/"]').count(),Object.keys(ITEM_ART).length);
 const results=await page.evaluate(async registry=>{const result=[];for(const[id,url]of Object.entries(registry)){const image=new Image();image.src=url;await image.decode();const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const d=ctx.getImageData(0,0,256,256).data;let colored=0,pink=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>240){if(Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])>15)colored++;if(d[i]>150&&d[i+2]>150&&Math.min(d[i],d[i+2])-d[i+1]>70)pink++;}result.push({id,width:image.naturalWidth,corner:d[3],colored,pink});}return result;},ITEM_ART);
 for(const r of results){assert.equal(r.width,256);assert.equal(r.corner,0,r.id);assert.ok(r.colored>200,r.id+' must be colored');assert.equal(r.pink,0,r.id+' has chroma-key residue');}
 await mkdir('.artifacts/screenshots',{recursive:true});
 const shot=async path=>{await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await Promise.all([page.screenshot({path,animations:'disabled'}),page.clock.runFor(160)]);};
 await shot('.artifacts/screenshots/item-art-inventory.png');
 await page.locator('#inventory-close').click();await page.keyboard.press('KeyC');assert.ok(await page.locator('.recipe-cost img[src^="assets/items/"]').count()>=2);await page.locator('#inventory-close').click();
 await page.clock.fastForward(100);await page.evaluate(async()=>{if(document.pointerLockElement)await new Promise(resolve=>{document.addEventListener('pointerlockchange',resolve,{once:true});document.exitPointerLock();});});await page.clock.fastForward(48);const aim=await page.evaluate(()=>window.oskol.snapshot());const yaw=Math.atan2(aim.position.x,aim.position.z-10),pitch=Math.atan2(2.8-aim.rendering.camera[1],Math.hypot(aim.position.x,aim.position.z-10));const turn=Math.atan2(Math.sin(yaw-aim.yaw),Math.cos(yaw-aim.yaw));await page.evaluate(({dx,dy})=>{const c=document.querySelector('#world');for(const[type,x,y]of[['pointerdown',500,250],['pointermove',500+dx,250+dy],['pointerup',500+dx,250+dy]])c.dispatchEvent(new PointerEvent(type,{pointerId:99,pointerType:'mouse',clientX:x,clientY:y}));},{dx:-turn/.0024,dy:-(pitch-aim.pitch)/.0024});await page.clock.fastForward(48);assert.equal((await page.evaluate(()=>window.oskol.snapshot())).target?.type,'furnace');await page.keyboard.press('KeyE');assert.equal(await page.locator('[data-furnace-slot] img[src^="assets/items/"]').count(),6);await shot('.artifacts/screenshots/item-art-furnace.png');
 await page.setViewportSize({width:844,height:390});await page.clock.runFor(48);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),844);await shot('.artifacts/screenshots/item-art-mobile-furnace.png');assert.deepEqual(errors,[]);
 console.log('PASS generated icons: all decode, transparent corners, full color, no pink residue; inventory, recipe costs, six furnace slots, landscape phone layout and no browser errors');
}finally{await browser.close();}
