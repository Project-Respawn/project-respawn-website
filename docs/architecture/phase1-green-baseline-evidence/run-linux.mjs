import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
process.chdir('/work');
const out='/results/validation';fs.mkdirSync(out,{recursive:true});
const env={...process.env,AWS_EC2_METADATA_DISABLED:'true',TSX_TSCONFIG_PATH:'/work/amplify/tsconfig.json'};
delete env.AWS_BRANCH;delete env.RESPAWN_AUTH_MODE;
const ledger=[];const npm='/usr/local/lib/node_modules/npm/bin/npm-cli.js';
function run(name,args,extra={}){const fd=fs.openSync(`${out}/${name}.txt`,'w');const start=Date.now();const r=spawnSync(process.execPath,args,{env:{...env,...extra},stdio:['ignore',fd,fd],timeout:900000});fs.closeSync(fd);ledger.push({name,args,exit:r.status,error:r.error?.message,seconds:(Date.now()-start)/1000});fs.writeFileSync(`${out}/ledger.json`,JSON.stringify(ledger,null,2));console.log(name,r.status);return r.status;}
if(run('npm-ci',[npm,'ci'])!==0)process.exit(1);
if(run('master-synthesis',[npm,'run','synth:master-backend'])!==0)process.exit(1);
if(run('exact-comparison',['scripts/compare-handler-consolidation.mjs','/baseline','.amplify/master-preview/cdk.out','/results/comparison'])!==0)process.exit(2);
const comparison=JSON.parse(fs.readFileSync('/results/comparison/summary.json'));
if(JSON.stringify(comparison.actions)!==JSON.stringify({ADDED:0,UPDATED:81,DELETED:308}) || comparison.after.total!==2628 || comparison.after.largest!==167){
  // FunctionDirectiveStack remains the largest individual template.
  console.error('Unexpected accepted infrastructure counts',comparison.actions,comparison.after.total,comparison.after.largest);process.exit(2);
}
const fd=comparison.after.stacks.find(s=>s.path.includes('FunctionDirectiveStack'));if(fd.resources!==167){console.error('Unexpected FunctionDirectiveStack count',fd);process.exit(2);}
run('typescript',['node_modules/typescript/bin/tsc','--noEmit','-p','amplify/tsconfig.json']);
for(const [name,script] of [['contracts','validate:amplify-contract'],['guards','test:amplify-guards'],['teamhub-backend','test:team-hub-backend'],['overlays','test:overlays'],['connected-demo','test:connected-demo'],['master-preview','test:master-backend-preview'],['runtime-ownership','test:runtime-ownership'],['infrastructure-accounting','test:resource-accounting'],['handler-consolidation','test:handler-consolidation']])run(name,[npm,'run',script]);
run('teamhub-frontend',['--test','src/features/Team Hub/teamHubFrontend.test.mjs']);
run('tournaments',['--test','src/features/tournaments/tournament.test.mjs']);
run('accounting-update-gate',['scripts/validate-amplify-stack-size.mjs','.amplify/master-preview/cdk.out','--baseline','scripts/config/legacy-resource-baseline.json','--exception','scripts/config/legacy-resource-debt.json','--operation','update','--json','/results/update-gate.json']);
run('ci-accounting',[npm,'run','validate:infrastructure-ci']);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const tests=['src','amplify','infrastructure','scripts'].flatMap(walk).filter(p=>/\.test\.(mjs|ts|js)$/.test(p));
fs.writeFileSync('/results/test-files.json',JSON.stringify(tests,null,2));
run('full-suite',['--import','tsx','--test','--test-concurrency=2',...tests]);
const outputs=JSON.parse(fs.readFileSync('amplify_outputs.json'));const endpoint=outputs.custom.API.projectRespawnApi.endpoint.replace(/\/$/,'');
run('production-build',[npm,'run','build','--','--outDir','.amplify/green-build','--manifest'],{VITE_API_BASE_URL:endpoint,VITE_REVOLUT_MODE:'sandbox',VITE_REVOLUT_PUBLIC_KEY:'validation-only-not-for-payment'});
process.exitCode=ledger.some(r=>r.exit!==0)?1:0;
