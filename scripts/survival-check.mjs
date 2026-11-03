import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {launchBrowser} from './browser-runtime.mjs';
import {newGame,encodeSave,SAVE_KEY,terrainHeight} from '../src/survival/state.js';
const browser=await launchBrowser(),errors=[],external=[];
await mkdir('.artifacts/screenshots',{recursive:true});
const time=new Date('2026-11-03T12:00:00Z');
async function waitReady(page){
 const deadline=Date.now()+120000;
 while(Date.now()<deadline){
  const status=await page.evaluate(()=>({ready:!!window.oskol?.ready,fatal:!document.querySelector('#fatal').hidden?document.querySelector('#fatal-text').textContent:null}));
  if(status.fatal)throw new Error(status.fatal);if(status.ready)return;
  // compileAsync polls shader completion with timers; a paused fake clock must advance them.
  await page.clock.runFor(100);await new Promise(r=>setTimeout(r,25));
 }
 throw new Error('World initialization timed out');
}
async function pageWithFixture(fixture=null,options={}){
 const page=await browser.newPage({viewport:{width:1100,height:720},deviceScaleFactor:1,...options});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://localhost:3000/'))external.push(r.url());});
 await page.clock.install({time});await page.clock.pauseAt(time);
 await page.addInitScript(()=>{if(location.hostname==='localhost')localStorage.clear();});
 if(fixture)await page.addInitScript(({key,json})=>{if(location.hostname==='localhost')localStorage.setItem(key,json);},{key:SAVE_KEY,json:encodeSave(fixture)});
 await page.addInitScript(()=>{if(location.hostname==='localhost')localStorage.setItem('oskol.settings',JSON.stringify({quality:'low',sound:false,haptics:false}));});
 await page.goto('http://localhost:3000/?quality=low');await waitReady(page);return page;
}
async function snap(p){return p.evaluate(()=>window.oskol.snapshot());}
async function aimAt(page,x,z,height=1.1){
 const s=await snap(page),dx=x-s.position.x,dz=z-s.position.z;
 const yaw=Math.atan2(-dx,-dz),pitch=Math.atan2(terrainHeight(x,z)+height-terrainHeight(s.position.x,s.position.z)-1.72,Math.hypot(dx,dz));
 const turn=Math.atan2(Math.sin(yaw-s.yaw),Math.cos(yaw-s.yaw));
 await page.evaluate(({dx,dy})=>{const c=document.querySelector('#world');c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:99,pointerType:'mouse',clientX:500,clientY:250}));c.dispatchEvent(new PointerEvent('pointermove',{pointerId:99,pointerType:'mouse',clientX:500+dx,clientY:250+dy}));c.dispatchEvent(new PointerEvent('pointerup',{pointerId:99,pointerType:'mouse',clientX:500+dx,clientY:250+dy}));},{dx:-turn/.0024,dy:-(pitch-s.pitch)/.0024});
 await page.clock.runFor(100);
}
try{
 const front=await pageWithFixture();assert.equal((await snap(front)).stats.monuments,10);assert.equal((await snap(front)).stats.bases,6);assert.equal((await snap(front)).stats.bots,16);
 await front.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-menu.png'});
 await front.locator('#nav-settings').click();assert.ok(await front.locator('#settings').isVisible());await front.locator('#settings-done').click();
 await front.locator('#nav-journal').click();assert.ok(await front.locator('#journal').isVisible());await front.locator('#journal-close').click();
 await front.locator('#start').click();assert.ok(await front.locator('#world-setup').isVisible());assert.equal(await front.locator('[data-multiplier]').count(),5);assert.equal(await front.locator('[data-size]').count(),3);
 await front.locator('[data-multiplier="50"]').click();await front.locator('[data-size="medium"]').click();await front.locator('[data-difficulty="peaceful"]').click();await front.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-setup.png'});
 await front.locator('#world-create').click();await waitReady(front);assert.equal((await snap(front)).mode,'playing');assert.equal((await snap(front)).size,'medium');assert.equal((await snap(front)).multiplier,50);assert.ok((await snap(front)).saved);
 await front.locator('#pause-button').click();const pos=(await snap(front)).position;await front.clock.runFor(300);assert.deepEqual((await snap(front)).position,pos);await front.locator('#save-exit').click();assert.ok(await front.locator('#new-game').isVisible());await front.locator('#new-game').click();assert.ok(await front.locator('#confirm-new').isVisible());await front.locator('#cancel-reset').click();assert.equal((await snap(front)).size,'medium');
 console.log('PASS menu, world size, x50, difficulty, creation, save and pause');await front.goto('about:blank');
 const fixture=newGame({multiplier:50,difficulty:'peaceful'});fixture.position={x:1,z:16.7};fixture.yaw=0;fixture.inventory.stone=100;fixture.inventory.metal=100;fixture.inventory.fiber=20;
 const game=await pageWithFixture(fixture);await game.locator('#start').click();await game.clock.runFor(200);assert.match(await game.locator('#target-name').textContent(),/ДЕРЕВО/);
 await game.keyboard.press('KeyF');assert.equal((await snap(game)).inventory.wood,250);
 await game.keyboard.press('KeyC');await game.locator('[data-recipe="axe"]').click();assert.ok(await game.locator('#craft-item').isEnabled());await game.locator('#craft-item').click();assert.equal((await snap(game)).inventory.axe,1);assert.equal((await snap(game)).inventory.wood,235);await game.locator('#inventory-close').click();
 await game.clock.runFor(700);await game.keyboard.press('KeyF');assert.equal((await snap(game)).inventory.wood,735);await game.clock.runFor(500);await game.keyboard.press('KeyF');assert.equal((await snap(game)).inventory.wood,1235);
 await game.keyboard.press('KeyI');await game.locator('[data-tab="build"]').click();await game.locator('[data-recipe="foundation"]').click();await game.locator('#craft-item').click();assert.equal((await snap(game)).inventory.foundation,1);await game.locator('#equip-building').click();assert.equal((await snap(game)).selected,'foundation');await game.clock.runFor(200);await game.keyboard.press('KeyE');assert.equal((await snap(game)).buildings,1);
 await game.keyboard.press('KeyC');await game.locator('[data-recipe="hammer"]').click();await game.locator('#craft-item').click();await game.locator('#inventory-close').click();assert.equal((await snap(game)).selected,'hammer');
 const foundation=await game.evaluate(key=>JSON.parse(localStorage.getItem(key)).buildings[0],SAVE_KEY);await aimAt(game,foundation.x,foundation.z,.3);await game.keyboard.press('KeyE');assert.ok(await game.locator('#structure-panel').isVisible());for(let i=0;i<3;i++)await game.locator('#upgrade-structure').click();assert.equal(await game.evaluate(key=>JSON.parse(localStorage.getItem(key)).buildings[0].tier,SAVE_KEY),3);assert.ok(await game.locator('#upgrade-structure').isDisabled());await game.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-upgrade.png'});await game.locator('#structure-close').click();await game.keyboard.press('Digit1');assert.equal((await snap(game)).selected,'hammer');
 await game.keyboard.press('KeyM');assert.ok(await game.locator('#map').isVisible());await game.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-map.png'});await game.locator('#map-close').click();await game.evaluate(()=>window.pauseOskol());assert.equal((await snap(game)).overlay,'pause');await game.locator('#save-now').click();await game.locator('#save-exit').click();
 console.log('PASS x50 harvest, axe/hammer crafting, doubled tool yield, foundation placement and all three paid upgrades, numeric hotbar, map and lifecycle pause');await game.goto('about:blank');
 const battle=newGame({multiplier:2,difficulty:'peaceful'});battle.position={x:-72,z:72};battle.yaw=0;battle.pitch=-.1;battle.inventory.hammer=1;battle.inventory.wood=100;battle.inventory.stone=100;battle.inventory.metal=100;battle.inventory.rifle=1;battle.inventory.ammo=12;battle.selected='rifle';
 const combat=await pageWithFixture(battle);await combat.locator('#start').click();await combat.clock.runFor(120);await combat.keyboard.press('KeyR');assert.equal((await snap(combat)).magazine,6);assert.equal((await snap(combat)).inventory.ammo,6);await combat.clock.runFor(1200);await combat.keyboard.press('Digit2');assert.equal((await snap(combat)).selected,'rifle');
 const enemy=(await snap(combat)).bots.find(b=>b.id==='hunters-1');await aimAt(combat,enemy.x,enemy.z);await combat.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-bot-base.png'});
 for(let i=0;i<3;i++){const bot=(await snap(combat)).bots.find(b=>b.id===enemy.id);await aimAt(combat,bot.x,bot.z);await combat.keyboard.press('KeyF');await combat.clock.runFor(400);}
 assert.ok((await snap(combat)).bots.find(b=>b.id===enemy.id).dead);assert.equal((await snap(combat)).magazine,3);assert.equal((await snap(combat)).inventory.ammo,16);
 console.log('PASS finite magazine, actual aiming / shooting / killing a moving bot, x2 kill loot, skeletal base scene');await combat.goto('about:blank');
 const mobile=await pageWithFixture(null,{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});await mobile.locator('#start').tap();await mobile.locator('[data-multiplier="2"]').tap();await mobile.locator('#world-create').tap();await mobile.clock.runFor(100);assert.equal((await snap(mobile)).multiplier,2);assert.ok(await mobile.locator('#move-pad').isVisible());assert.ok(await mobile.locator('#attack-button').isVisible());assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),844);
 await mobile.locator('#inventory-button').tap();assert.ok(await mobile.locator('#inventory').isVisible());await mobile.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-mobile-inventory.png'});await mobile.locator('#inventory-close').tap();await mobile.locator('#pause-button').tap();assert.ok(await mobile.locator('#pause').isVisible());await mobile.locator('#resume').tap();await mobile.screenshot({animations:'disabled',timeout:90000,path:'.artifacts/screenshots/oskol-mobile.png'});
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);console.log('PASS landscape touch UI, inventory, pause, no JS / WebGL errors and no external network requests');
}finally{await browser.close();}
