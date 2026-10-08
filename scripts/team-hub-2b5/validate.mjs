import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const E='docs/architecture/team-hub-2b5-evidence-2026-10-06';
const commands=[
 ['core-team-fence-client-security',['--test','scripts/team-hub-2b5/tests/*.test.mjs']],
 ['team-foundation',['--test','scripts/team-hub/tests/*.test.mjs','scripts/team-hub/read-proof-tests/*.test.mjs']],
 ['accepted-parity',['--test','scripts/team-hub-2b4/tests/*.test.mjs']],
 ['rollback-transform',['--test','scripts/team-hub-migration/native-state.test.mjs']],
 ['resource-accounting',['--test','scripts/cloudformation-accounting.test.mjs','scripts/ntgre-phase1-allowance.test.mjs']],
 ['domain-selector',['--test','scripts/deployment/tests/selection.test.mjs']],
 ['ledger',['scripts/migration/ledger.mjs','check']],
 ['source-protection',['scripts/validate-infrastructure-ci.mjs','--domain','team-hub','--env','Ntgre','--mode','READ_PROOF','--action','describe']],
 ['typescript',['infrastructure/domains/team-hub/node_modules/typescript/bin/tsc','--noEmit','-p','infrastructure/domains/team-hub/tsconfig.json']]
];
const results=[];for(const[name,args]of commands){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:8e6});fs.writeFileSync(E+'/validation-'+name+'.txt',(r.stdout??'')+(r.stderr??''));const text=(r.stdout??'')+(r.stderr??'');const result={name,exit:r.status,passed:Number(text.match(/(?:# |ℹ )pass (\d+)/)?.[1]??0),failed:Number(text.match(/(?:# |ℹ )fail (\d+)/)?.[1]??0)};results.push(result);console.log(JSON.stringify(result));fs.writeFileSync(E+'/validation.json',JSON.stringify({at:new Date().toISOString(),results},null,2)+'\n');}
if(results.some(r=>r.exit!==0))process.exitCode=1;
