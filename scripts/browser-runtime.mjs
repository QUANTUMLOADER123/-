import {chromium} from '@playwright/test';
import Chromium from '@sparticuz/chromium';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {brotliDecompressSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
export async function launchBrowser(){
 if(process.platform==='linux'&&!existsSync('/usr/lib/x86_64-linux-gnu/libnspr4.so')){const dir=resolve('.artifacts/chromium-libs');mkdirSync(dir,{recursive:true});if(!existsSync(dir+'/lib/libnspr4.so')){const tar=resolve('.artifacts/chromium-libs.tar');writeFileSync(tar,brotliDecompressSync(readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')));execFileSync('tar',['-xf',tar,'-C',dir]);}process.env.LD_LIBRARY_PATH=dir+'/lib'+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');}
 return chromium.launch({headless:true,executablePath:await Chromium.executablePath(),args:Chromium.args.filter(a=>!['--disable-web-security','--allow-running-insecure-content','--single-process'].includes(a))});
}
