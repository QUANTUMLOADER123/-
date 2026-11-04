// Publish compiled packages only. Never starts the application or a test runner.
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,writeFile,stat,appendFile} from 'node:fs/promises';
import {basename,join} from 'node:path';
import {spawnSync} from 'node:child_process';

const pkg=JSON.parse(await readFile('package.json','utf8'));
const repository=process.env.GITHUB_REPOSITORY;
const sha=process.env.GITHUB_SHA;
if(!repository||!sha||!/^[0-9a-f]{40}$/.test(sha))throw new Error('A repository and exact source SHA are required.');
if(process.env.GITHUB_REF!=='refs/heads/arena/ce299f3a-repo')throw new Error('Publishing is restricted to the Arena working branch.');
const folder='.artifacts/release';
const exe=pkg.build.win.artifactName;
if(basename(exe)!==exe||!/^oskol-[0-9.]+-dev\d+-windows-x64\.exe$/.test(exe))throw new Error('Unexpected portable package name.');
const apk=exe.replace('-windows-x64.exe','-android.apk');
const names=[apk,exe];
for(const name of names)if((await stat(join(folder,name))).size<1024)throw new Error('Empty package: '+name);
const hash=async path=>{const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes);return digest.digest('hex');};
const checksums=await Promise.all(names.map(async name=>`${await hash(join(folder,name))}  ${name}`));
await writeFile(join(folder,'SHA256SUMS.txt'),checksums.join('\n')+'\n');

function gh(args,{allowMissing=false}={}){
 const r=spawnSync('gh',args,{encoding:'utf8',env:process.env});
 if(r.error)throw r.error;
 if(r.status!==0){if(allowMissing&&/release not found|HTTP 404|Not Found/i.test(r.stderr))return null;throw new Error(r.stderr||'GitHub command failed.');}
 return r.stdout.trim();
}
const lookup=tag=>{const result=gh(['release','view',tag,'--repo',repository,'--json','targetCommitish,isDraft,url'],{allowMissing:true});return result?JSON.parse(result):null;};
const version=exe.slice('oskol-'.length,-'-windows-x64.exe'.length);
const iteration=/-dev(\d+)$/.exec(version)[1];
let tag='v'+version,existing=lookup(tag);
// Keep published downloads immutable if a later commit reuses the same app version.
if(existing&&existing.targetCommitish!==sha){tag+='-'+sha.slice(0,7);existing=lookup(tag);}
if(existing&&existing.targetCommitish!==sha)throw new Error('The release tag belongs to another source revision.');
const url=`https://github.com/${repository}/releases/download/${tag}/`;
const run=`https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const notes=`# ОСКОЛ ${version}\n\n`+
 `Отдельные установочные файлы — **не ZIP-архивы**:\n\n`+
 `- [Скачать Android APK](${url}${apk})\n`+
 `- [Скачать Windows x64 portable EXE](${url}${exe})\n`+
 `- [SHA-256](${url}SHA256SUMS.txt)\n\n`+
 `Android 8+; Windows 10/11 x64. EXE не подписан коммерческим сертификатом. Не отключайте защиту ради запуска прототипа.\n\n`+
 `Экспериментальная предварительная сборка. **Пройдены целевые процедурные тесты и браузерная проверка входа/GLSL/инвентаря.** Затем скомпилирован Windows EXE, после него Android APK. Это не тест на реальном телефоне/Windows и не гарантия FPS или отсутствия всех зависаний. `+
 `Сохранены прежние Android application ID/подпись разработки и каталог сохранений Windows.\n\n`+
 `[Изменения DEV${iteration}](https://github.com/${repository}/blob/${sha}/src/survival/DEV${iteration}.md) · [Сборка](${run})\n\n`+
 `Исходный коммит: \`${sha}\`.\n`;
const notesPath='.artifacts/release-notes.md';
await writeFile(notesPath,notes);
const files=[...names,'SHA256SUMS.txt'].map(name=>join(folder,name));
if(!existing){
 // Draft first: publish the download page only after every asset was uploaded.
 gh(['release','create',tag,'--repo',repository,'--target',sha,'--title',`ОСКОЛ ${version} · APK + EXE`,'--notes-file',notesPath,'--draft','--prerelease',...files]);
}else{
 gh(['release','upload',tag,'--repo',repository,'--clobber',...files]);
}
gh(['release','edit',tag,'--repo',repository,'--draft=false','--prerelease','--notes-file',notesPath]);
const page=gh(['release','view',tag,'--repo',repository,'--json','url','--jq','.url']);
console.log(`${page}\n${names.map(name=>url+name).join('\n')}`);
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,notes+'\n');
