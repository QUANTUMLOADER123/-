import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
if(process.platform!=='win32')throw new Error('This check runs the actual Windows portable EXE on Windows.');
const pkg=JSON.parse(await readFile('package.json','utf8')),exe=resolve('release-build',pkg.build.win.artifactName),report=resolve('.artifacts/desktop-smoke.json');await mkdir('.artifacts',{recursive:true});
const child=spawn(exe,['--smoke'],{env:{...process.env,OSKOL_SMOKE_REPORT:report,ELECTRON_ENABLE_LOGGING:'1'},stdio:['ignore','pipe','pipe']});let log='';for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log+=data;process.stdout.write(data);});
const timer=setTimeout(()=>{child.kill();},8*60*1000);
try{const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});await writeFile('.artifacts/desktop-smoke.log',log);assert.equal(code,0,'Packaged EXE exited unsuccessfully');const facts=JSON.parse(await readFile(report,'utf8'));assert.equal(facts.status,'passed',facts.error);assert.equal(facts.platform,'win32');assert.equal(facts.version,pkg.version);console.log('Actual Windows portable EXE world/inventory/save smoke passed.');}finally{clearTimeout(timer);}
