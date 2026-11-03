import {build} from 'esbuild';
const watch=process.argv.includes('--watch');
const options={entryPoints:['src/survival/main.js'],bundle:true,minify:true,format:'esm',target:['chrome100'],outfile:'web/survival.js',sourcemap:false,legalComments:'linked',logLevel:'info'};
if(watch){const {context}=await import('esbuild');const ctx=await context(options);await ctx.watch();}else await build(options);
