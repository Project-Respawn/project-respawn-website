import fs from 'node:fs';import {build} from 'esbuild';import {spawn} from 'node:child_process';
const E='docs/architecture/team-hub-final-readiness-evidence-2026-10-12',B='.tmp/team-hub-final-readiness';fs.mkdirSync(E,{recursive:true});fs.mkdirSync(B,{recursive:true});
for(const [name,entry,args,old] of [
 ['baseline','scripts/team-hub-isolated-verification/baseline.mjs',[],'docs/architecture/team-hub-isolated-verification-evidence-2026-10-12'],
 ['writers','scripts/team-hub-2b6/coverage-live.mjs',['--iam-only'],'docs/architecture/team-hub-2b6-evidence-2026-10-07'],
 ['edges','scripts/team-hub-2b6/refresh-edges.mjs',[],'docs/architecture/team-hub-2b6-evidence-2026-10-07']
]){
 const outfile=B+'/'+name+'.mjs';await build({entryPoints:[entry],outfile,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'fresh-read-only-receipts',setup(b){b.onLoad({filter:/\.mjs$/},({path})=>({contents:fs.readFileSync(path,'utf8').replaceAll(old,E),loader:'js'}));}}]});
 await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[outfile,...args],{windowsHide:true,stdio:'inherit'});c.on('exit',code=>code===0?resolve():reject(Error(name+' failed '+code)));});
}
