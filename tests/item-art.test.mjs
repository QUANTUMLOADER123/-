import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ITEMS} from '../src/survival/state.js';
import {ITEM_ART} from '../src/survival/item-art.js';
const web=new URL('../web/',import.meta.url);
test('current generated icon paths exist and carry their real SHA cache fingerprint',async()=>{
 const paths=new Set();for(const [id,url]of Object.entries(ITEM_ART)){assert.ok(Object.hasOwn(ITEMS,id),id);assert.match(url,/^assets\/items\d*\/[\w-]+\.webp\?v=[a-f0-9]{10}$/);const [file,query]=url.split('?');const data=await readFile(new URL(file,web)),hash=createHash('sha256').update(data).digest('hex');assert.equal(query,'v='+hash.slice(0,10),id);assert.ok(data.length<150000,id);paths.add(file);}assert.ok(paths.size>=155);
});
test('current prepared icons are 256px WebP with an alpha channel',async()=>{
 for(const file of new Set(Object.values(ITEM_ART).map(p=>p.split('?')[0]))){const b=await readFile(new URL(file,web));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');const type=b.toString('ascii',12,16);let width,height,alpha;if(type==='VP8L'){assert.equal(b[20],0x2f);const bits=b.readUInt32LE(21);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;alpha=!!((bits>>>28)&1);}else{assert.equal(type,'VP8X',file);width=b.readUIntLE(24,3)+1;height=b.readUIntLE(27,3)+1;alpha=!!(b[20]&0x10);}assert.equal(width,256,file);assert.equal(height,256,file);assert.ok(alpha,file);}
});
