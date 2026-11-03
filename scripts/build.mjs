import {rm} from 'node:fs/promises';
import {build} from 'esbuild';
const watch=process.argv.includes('--watch');
await rm('web/chunks',{recursive:true,force:true});
const options={entryPoints:{survival:'src/survival/main.js'},bundle:true,minify:true,format:'esm',target:['chrome100'],outdir:'web',splitting:true,chunkNames:'chunks/[name]-[hash]',sourcemap:false,legalComments:'linked',logLevel:'info'};
if(watch){const {context}=await import('esbuild');const ctx=await context(options);await ctx.watch();}else await build(options);
