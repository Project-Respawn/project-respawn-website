// Offline regression/build/source-preservation runner. No deployment or synthesis.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {save} from './final-read.mjs';
const results=[];
function run(name,args){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:20e6});if(r.status!==0){console.error(name+' FAILED');console.error(r.stdout);console.error(r.stderr);process.exit(1);}const tests=Number(r.stdout.match(/(?:#|ℹ) tests (\d+)/)?.[1]??0);results.push({name,status:'PASS',tests});console.log(name+': PASS'+(tests?' ('+tests+')':''));}
const testFiles=dir=>fs.readdirSync(dir).filter(n=>n.endsWith('.test.mjs')).map(n=>dir+'/'+n);
run('Existing Team, selector, accounting regressions',['--test','--test-reporter=spec',...['scripts/team-hub/tests','scripts/team-hub/read-proof-tests','scripts/deployment/tests'].flatMap(testFiles),'scripts/cloudformation-accounting.test.mjs','scripts/ntgre-phase1-allowance.test.mjs']);
run('Accepted Tournament regressions',['--test','--test-reporter=spec','scripts/checkpoints/tests/accepted-tournament.test.mjs']);
run('Migration, native rollback, coverage, fence, recovery, IAM and ledger',['--test','--test-reporter=spec',...testFiles('scripts/team-hub-migration'),'scripts/migration/control.test.mjs']);
run('Team infrastructure/domain TypeScript',['infrastructure/domains/team-hub/node_modules/typescript/bin/tsc','--project','infrastructure/domains/team-hub/tsconfig.json','--noEmit']);
run('Accepted Team 54-input candidate preservation',['scripts/checkpoints/verify-team-hub-release1.mjs']);
run('Pinned Tournament candidate preservation',['scripts/verify-phase2-checkpoint.mjs']);
run('Accepted Tournament security/config preservation',['scripts/checkpoints/verify-tournament-release1.mjs']);
save('validation',{at:new Date().toISOString(),results,totalPassed:results.reduce((n,r)=>n+r.tests,0),failed:0,build:'PENDING',secretScan:'PENDING',documentationLinks:'PENDING',awsWrites:0,productionChanges:0,gitCommitCreated:false});
