import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {launchBrowser} from './browser-runtime.mjs';
const root=process.env.SMOKE_URL||'http://localhost:3000';
let server,browser;const errors=[];
try{
 if(!process.env.SMOKE_URL){server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','inherit']});await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.once('exit',code=>{if(code)reject(new Error('Smoke server failed '+code));});});}
 browser=await launchBrowser();let page;
 const cases=(process.env.SMOKE_CASES||'small:low,large:medium').split(',');const results=[];await mkdir('.artifacts/dev32',{recursive:true});
 for(const scenario of cases){page=await browser.newPage({viewport:{width:960,height:540}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await page.addInitScript(()=>localStorage.setItem('oskol.settings',JSON.stringify({quality:'low',sound:false,haptics:false})));const [size,quality]=scenario.split(':');await page.goto(root+'/?quality='+quality);await page.waitForFunction(()=>window.oskol?.menuReady,null,{timeout:180000});await page.locator('#start').click();
 // A fresh origin/context for each case avoids replacing an existing save by accident.
 if(!await page.locator('#world-setup').isVisible())throw new Error('Expected fresh world setup');await page.locator('[data-size='+size+']').click();await page.locator('#bot-limit26').fill('32');await page.locator('#world-create').click();await page.waitForFunction(()=>window.oskol?.ready||!document.querySelector('#entry-error30').hidden,null,{timeout:300000});assert.ok(await page.evaluate(()=>window.oskol?.ready),await page.locator('#entry-error-report30').inputValue());await page.waitForTimeout(2500);
 const facts=await page.evaluate(()=>({snapshot:window.oskol.snapshot(),diagnostics:window.oskol.inspect32()}));assert.equal(facts.snapshot.health,100);assert.equal(facts.snapshot.stats.bases,120);assert.equal(facts.snapshot.stats.monuments,20);assert.equal(facts.diagnostics.revision,15);assert.ok(facts.diagnostics.terrainPatches>4);assert.ok(facts.diagnostics.cacti>0);assert.equal(facts.diagnostics.rigs.length,2);assert.ok(facts.diagnostics.houses.length>0);
 for(const h of facts.diagnostics.houses){assert.ok(h.skirts>=12,h.id);assert.equal(h.cupboards,1,h.id+' cupboard');assert.ok(h.furniture.some(f=>f.kind==='cupboard'),h.id+' placed cupboard');for(let i=0;i<h.furniture.length;i++)for(let j=0;j<i;j++){const a=h.furniture[i],b=h.furniture[j];assert.ok(a.level!==b.level||Math.abs(a.x-b.x)>=a.rw+b.rw||Math.abs(a.z-b.z)>=a.rd+b.rd,h.id+' furniture overlap');}}
 assert.ok(facts.snapshot.saved,'automatic save must decode');await page.keyboard.press('Tab');await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>window.oskol.snapshot().overlay),'inventory opens');await page.keyboard.press('Tab');await page.waitForTimeout(250);await page.screenshot({path:'.artifacts/dev32/smoke-'+size+'-'+quality+'.png'});results.push({scenario,...facts});
 // Test a second map independently, not through a destructive overwrite dialog.
 if(scenario!==cases.at(-1))await page.close();
 }
 const fixture=await build({entryPoints:['tests/dev32-weapon-fixture.js'],bundle:true,format:'esm',write:false});const weapons=await page.evaluate(async code=>{const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));try{return (await import(url)).checkWeapons32();}finally{URL.revokeObjectURL(url);}},fixture.outputFiles[0].text);assert.ok(weapons.length>=14);assert.deepEqual(errors,[],'browser/GLSL/assets errors');await writeFile('.artifacts/dev32/smoke-results.json',JSON.stringify({errors,results,weapons},null,2));console.log(JSON.stringify(results.map(x=>({scenario:x.scenario,bases:x.snapshot.stats.bases,houses:x.diagnostics.houses.length,cacti:x.diagnostics.cacti,triangles:x.snapshot.stats.triangles,calls:x.snapshot.stats.calls})),null,2));
}finally{await browser?.close();server?.kill();}
