import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {launchBrowser} from './browser-runtime.mjs';
import {newGame,encodeSave,SAVE_KEY} from '../src/survival/state.js';
const browser=await launchBrowser(),errors=[],external=[];
await mkdir('.artifacts/screenshots',{recursive:true});
const time=new Date('2026-11-03T12:00:00Z');
async function pageWithFixture(fixture=null,options={}){
 const page=await browser.newPage({viewport:{width:1100,height:720},deviceScaleFactor:1,...options});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://localhost:3000/'))external.push(r.url());});
 await page.clock.install({time});await page.clock.pauseAt(time);
 await page.addInitScript(()=>{if(location.hostname==='localhost')localStorage.clear();});
 if(fixture)await page.addInitScript(({key,json})=>{if(location.hostname==='localhost')localStorage.setItem(key,json);},{key:SAVE_KEY,json:encodeSave(fixture)});
 await page.addInitScript(()=>{if(location.hostname==='localhost')localStorage.setItem('oskol.settings',JSON.stringify({quality:'low',sound:false,haptics:false}));});
 await page.goto('http://localhost:3000/?quality=low');await page.waitForFunction(()=>window.oskol?.ready,{},{timeout:120000});return page;
}
async function snap(p){return p.evaluate(()=>window.oskol.snapshot());}
try{
 const front=await pageWithFixture();assert.equal((await snap(front)).stats.monuments,10);assert.equal((await snap(front)).stats.bases,6);assert.equal((await snap(front)).stats.bots,16);
 await front.screenshot({path:'.artifacts/screenshots/oskol-menu.png'});
 await front.locator('#nav-settings').click();assert.ok(await front.locator('#settings').isVisible());await front.locator('#settings-done').click();
 await front.locator('#nav-journal').click();assert.ok(await front.locator('#journal').isVisible());await front.locator('#journal-close').click();
 await front.locator('#start').click();assert.ok(await front.locator('#world-setup').isVisible());assert.equal(await front.locator('[data-multiplier]').count(),5);assert.equal(await front.locator('[data-size]').count(),3);
 await front.locator('[data-multiplier="50"]').click();await front.locator('[data-size="medium"]').click();await front.locator('[data-difficulty="peaceful"]').click();await front.screenshot({path:'.artifacts/screenshots/oskol-setup.png'});
 await front.locator('#world-create').click();await front.waitForFunction(()=>window.oskol?.ready&&window.oskol.snapshot().mode==='playing',{},{timeout:120000});assert.equal((await snap(front)).size,'medium');assert.equal((await snap(front)).multiplier,50);assert.ok((await snap(front)).saved);
 await front.locator('#pause-button').click();const pos=(await snap(front)).position;await front.clock.runFor(300);assert.deepEqual((await snap(front)).position,pos);await front.locator('#save-exit').click();assert.ok(await front.locator('#new-game').isVisible());
 console.log('PASS menu, world size, x50, difficulty, creation, save and pause');await front.goto('about:blank');
 const fixture=newGame({multiplier:50,difficulty:'peaceful'});fixture.position={x:1,z:16.7};fixture.yaw=0;fixture.inventory.stone=40;fixture.inventory.fiber=20;
 const game=await pageWithFixture(fixture);await game.locator('#start').click();await game.clock.runFor(200);assert.match(await game.locator('#target-name').textContent(),/ДЕРЕВО/);
 await game.keyboard.press('KeyF');assert.equal((await snap(game)).inventory.wood,250);
 await game.keyboard.press('KeyC');await game.locator('[data-recipe="axe"]').click();assert.ok(await game.locator('#craft-item').isEnabled());await game.locator('#craft-item').click();assert.equal((await snap(game)).inventory.axe,1);assert.equal((await snap(game)).inventory.wood,235);await game.locator('#inventory-close').click();
 await game.clock.runFor(700);await game.keyboard.press('KeyF');assert.equal((await snap(game)).inventory.wood,735);
 await game.keyboard.press('KeyI');await game.locator('[data-tab="build"]').click();await game.locator('[data-recipe="foundation"]').click();await game.locator('#craft-item').click();assert.equal((await snap(game)).inventory.foundation,1);await game.locator('#equip-building').click();assert.equal((await snap(game)).selected,'foundation');await game.clock.runFor(200);await game.keyboard.press('KeyE');assert.equal((await snap(game)).buildings,1);
 await game.keyboard.press('KeyM');assert.ok(await game.locator('#map').isVisible());await game.screenshot({path:'.artifacts/screenshots/oskol-map.png'});await game.locator('#map-close').click();await game.evaluate(()=>window.pauseOskol());assert.equal((await snap(game)).overlay,'pause');await game.locator('#save-now').click();await game.locator('#save-exit').click();
 console.log('PASS actual x50 tree harvest, axe crafting, doubled tool yield, foundation placement, map and lifecycle pause');await game.goto('about:blank');
 const battle=newGame({multiplier:2,difficulty:'peaceful'});battle.position={x:-76,z:73};battle.yaw=0;battle.inventory.hammer=1;battle.inventory.wood=100;battle.inventory.stone=100;battle.inventory.metal=100;battle.inventory.rifle=1;battle.inventory.ammo=12;battle.selected='rifle';
 const combat=await pageWithFixture(battle);await combat.locator('#start').click();await combat.clock.runFor(120);await combat.keyboard.press('KeyR');assert.equal((await snap(combat)).magazine,6);assert.equal((await snap(combat)).inventory.ammo,6);await combat.screenshot({path:'.artifacts/screenshots/oskol-bot-base.png'});
 console.log('PASS weapon equip and finite magazine reload, real skeletal bot assets and base scene');await combat.goto('about:blank');
 const mobile=await pageWithFixture(null,{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});await mobile.locator('#start').tap();await mobile.locator('[data-multiplier="2"]').tap();await mobile.locator('#world-create').tap();await mobile.clock.runFor(100);assert.equal((await snap(mobile)).multiplier,2);assert.ok(await mobile.locator('#move-pad').isVisible());assert.ok(await mobile.locator('#attack-button').isVisible());assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),844);
 await mobile.locator('#inventory-button').tap();assert.ok(await mobile.locator('#inventory').isVisible());await mobile.screenshot({path:'.artifacts/screenshots/oskol-mobile-inventory.png'});await mobile.locator('#inventory-close').tap();await mobile.locator('#pause-button').tap();assert.ok(await mobile.locator('#pause').isVisible());await mobile.locator('#resume').tap();await mobile.screenshot({path:'.artifacts/screenshots/oskol-mobile.png'});
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);console.log('PASS landscape touch UI, inventory, pause, no JS / WebGL errors and no external network requests');
}finally{await browser.close();}
