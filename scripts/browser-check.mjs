import { chromium as playwright } from '@playwright/test';
import Chromium from '@sparticuz/chromium';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
// The minimal sandbox lacks NSS; Chromium's npm package includes compatible Linux libraries.
if(process.platform==='linux'&&!existsSync('/usr/lib/x86_64-linux-gnu/libnspr4.so')){
  const libs=resolve('.artifacts/chromium-libs');mkdirSync(libs,{recursive:true});
  const tar=resolve('.artifacts/chromium-libs.tar');
  writeFileSync(tar,brotliDecompressSync(readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')));
  execFileSync('tar',['-xf',tar,'-C',libs]);
  process.env.LD_LIBRARY_PATH=libs+'/lib'+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');
}
const browser=await playwright.launch({headless:true,executablePath:await Chromium.executablePath(),args:Chromium.args.filter(a=>!['--disable-web-security','--allow-running-insecure-content'].includes(a))});
const errors=[];
await mkdir('.artifacts/screenshots',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  const now=new Date('2026-11-03T12:00:00Z');
  await page.clock.install({time:now});await page.clock.pauseAt(now);
  await page.goto('http://localhost:3000/layer/');await page.clock.runFor(250);
  assert.equal(await page.title(),'ЕЩЁ СЛОЙ — один тап до неба');
  assert.ok(await page.locator('#start').isVisible());
  await page.screenshot({path:'.artifacts/screenshots/desktop.png'});
  await page.locator('#help').click();assert.ok(await page.locator('#modal').isVisible());
  await page.locator('#modal-close').click();assert.ok(!await page.locator('#modal').isVisible());
  await page.locator('#start').click();
  // Stop virtual time exactly over the first platform, then perform a tap.
  await page.clock.runFor(1648);
  await page.evaluate(()=>document.querySelector('#game').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));
  assert.equal(await page.locator('#score').textContent(),'01');
  assert.match(await page.locator('#live-feedback').textContent(),/ИДЕАЛЬНО/);
  await page.locator('#pause').click();const score=await page.locator('#score').textContent();
  await page.clock.runFor(5000);assert.equal(await page.locator('#score').textContent(),score);
  await page.locator('#modal-close').click();
  // Immediately drop the newly spawned platform: a deliberate miss.
  await page.evaluate(()=>document.querySelector('#game').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));
  await page.clock.runFor(1000);
  assert.ok(await page.locator('#result').isVisible());assert.equal(await page.locator('#result-score').textContent(),'1');
  await page.locator('#retry').click();assert.equal(await page.locator('#score').textContent(),'00');assert.equal(await page.locator('#best').textContent(),'1');
  await page.reload();await page.clock.runFor(100);assert.equal(await page.locator('#best').textContent(),'1');
  await page.locator('#daily').click();assert.match(await page.locator('#mode-label').textContent(),/ВЫЗОВ ДНЯ/);assert.equal(await page.locator('#best').textContent(),'0');
  await page.evaluate(()=>window.pauseLayer());assert.ok(await page.locator('#modal').isVisible());await page.locator('#modal-close').click();
  // Keep the first context alive: Lambda Chromium uses single-process mode.
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.clock.install({time:now});await mobile.clock.pauseAt(now);
  await mobile.goto('http://localhost:3000/layer/');await mobile.clock.runFor(100);await mobile.screenshot({path:'.artifacts/screenshots/mobile.png'});
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),390);
  assert.ok(await mobile.evaluate(()=>{const c=document.querySelector('#game');const p=c.getContext('2d').getImageData(c.width-2,c.height-2,1,1).data;return p[0]>100&&p[1]>100&&p[2]>100;}),'HiDPI canvas must paint the entire physical buffer');
  await mobile.locator('#sound').tap();assert.equal(await mobile.locator('#sound').getAttribute('aria-pressed'),'false');
  await mobile.locator('#start').tap();assert.ok(await mobile.locator('#playing-hint').isVisible());
  await mobile.locator('#pause').tap();assert.ok(await mobile.locator('#modal').isVisible());await mobile.locator('#modal-close').tap();
  await mobile.locator('#game').tap({position:{x:195,y:450}});
  await mobile.clock.runFor(1000);assert.ok(await mobile.locator('#result').isVisible());
  await mobile.screenshot({path:'.artifacts/screenshots/mobile-result.png'});
  await mobile.locator('#to-home').tap();
  await mobile.setViewportSize({width:360,height:640});await mobile.screenshot({path:'.artifacts/screenshots/mobile-small.png'});
  const startBox=await mobile.locator('#start').boundingBox();assert.ok(startBox.y+startBox.height<640);
  await mobile.setViewportSize({width:320,height:568});await mobile.screenshot({path:'.artifacts/screenshots/mobile-tiny.png'});
  await mobile.locator('#help').tap();const closeBox=await mobile.locator('#modal-close').boundingBox();assert.ok(closeBox.y>=0&&closeBox.y+closeBox.height<=568);
  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: desktop + 3 mobile sizes, perfect hit, miss, retry, persistence, daily, sound, help, pause, native lifecycle hook. No JS errors.');
} finally { await browser.close(); }
