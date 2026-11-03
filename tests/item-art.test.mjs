import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ITEMS} from '../src/survival/state.js';
import {ITEM_ART} from '../src/survival/item-art.js';
const base=new URL('../web/assets/items/',import.meta.url);
test('each generated item icon has a unique catalog ID, local file and cache fingerprint',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
 assert.deepEqual(Object.keys(manifest.items).sort(),Object.keys(ITEM_ART).sort());
 assert.ok(Object.keys(ITEM_ART).length>=10);
 const hashes=new Set();for(const[id,m]of Object.entries(manifest.items)){
  assert.ok(Object.hasOwn(ITEMS,id),id);assert.equal(m.file,id+'.webp');
  const data=await readFile(new URL(m.file,base));const hash=createHash('sha256').update(data).digest('hex');
  assert.equal(hash,m.sha256);assert.ok(!hashes.has(hash),'Repeated artwork: '+id);hashes.add(hash);
  assert.equal(ITEM_ART[id],'assets/items/'+m.file+'?v='+hash.slice(0,10));assert.ok(data.length<150000);
 }
});
test('prepared icons are lossless 256px WebP images with transparency, not opaque background cards',async()=>{
 for(const id of Object.keys(ITEM_ART)){
  const b=await readFile(new URL(id+'.webp',base));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,16),'WEBPVP8L');
  assert.equal(b[20],0x2f);const bits=b.readUInt32LE(21);assert.equal((bits&0x3fff)+1,256);assert.equal(((bits>>>14)&0x3fff)+1,256);assert.equal((bits>>>28)&1,1,id+' must preserve alpha');
 }
});
