import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {save} from './read-only.mjs';
const results=[];
function run(name,args){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:20e6});if(r.status!==0){console.error(r.stdout);console.error(r.stderr);throw Error(name+' failed');}const count=Number(r.stdout.match(/(?:#|ℹ) tests (\d+)/)?.[1]??0);results.push({name,status:'PASS',tests:count});console.log(`${name}: PASS (${count})`);}
run('Gate 1 provider lifecycle and source isolation',['--import','tsx','--test','scripts/team-hub-migration/gate1/provider.test.mjs','scripts/team-hub-migration/gate1/source.test.ts']);
run('Resource accounting',['--test','scripts/cloudformation-accounting.test.mjs','scripts/ntgre-phase1-allowance.test.mjs']);
run('Legacy Team Hub backend regressions',['scripts/run-team-hub-backend-tests.mjs']);
run('Amplify TypeScript',['node_modules/typescript/bin/tsc','--noEmit','-p','amplify/tsconfig.json']);
run('Amplify contract',['scripts/validate-amplify-contract.mjs']);
run('Accepted Team candidate preservation',['scripts/checkpoints/verify-team-hub-release1.mjs']);
run('Accepted Tournament security/config preservation',['scripts/checkpoints/verify-tournament-release1.mjs']);
save('validation',{at:new Date().toISOString(),results,totalPassed:results.reduce((n,r)=>n+r.tests,0),failed:0,awsWrites:0});
