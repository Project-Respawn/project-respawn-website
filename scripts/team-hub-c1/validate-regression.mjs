import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const E='docs/architecture/team-hub-c1-evidence-2026-10-07',B='.tmp/team-hub-c1';fs.mkdirSync(B,{recursive:true});const results=[];
const commands=[
 ['monitoring',['--test','scripts/team-hub-2b6/telemetry-acceptance.test.mjs','scripts/team-hub-2b6/metric-window.test.mjs']],
 ['browser-repair',['--test','scripts/team-hub-2b6/core-timing.test.mjs','scripts/team-hub-2b6/route-access.test.mjs']],
 ['candidate',['--test','scripts/team-hub-2b5/tests/*.test.mjs','scripts/team-hub-2b5b/candidate.test.mjs','scripts/team-hub-core-integration/integration.test.mjs']],
 ['rollback',['--test','scripts/team-hub-migration/native-state.test.mjs','scripts/team-hub-migration/transform.test.mjs']],
 ['accounting-selector-protection',['--test','scripts/cloudformation-accounting.test.mjs','scripts/ntgre-phase1-allowance.test.mjs','scripts/deployment/tests/selection.test.mjs','scripts/validate-amplify-guards.test.mjs']],
 ['team-regression',['--test','scripts/team-hub/tests/*.test.mjs','scripts/team-hub/read-proof-tests/*.test.mjs','scripts/team-hub-2b4/tests/*.test.mjs','src/features/Team Hub/teamHubFrontend.test.mjs']],
 ['ledger',['scripts/migration/ledger.mjs','check']],
 ['typescript',['node_modules/typescript/bin/tsc','--noEmit','-p','amplify/tsconfig.json']]
];
for(const [name,args]of commands){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:40e6});const output=(r.stdout??'')+(r.stderr??'');fs.writeFileSync(B+'/'+name+'.log',output);results.push({name,exit:r.status,passed:Number(output.match(/(?:ℹ |# )?pass (\d+)/)?.[1]??0),failed:Number(output.match(/(?:ℹ |# )?fail (\d+)/)?.[1]??0),failures:output.split('\n').filter(x=>x.startsWith('✖')||x.startsWith('not ok')).map(x=>x.replace(/\s*\([\d.]+ms\)\s*$/,''))});console.log(JSON.stringify(results.at(-1)));}
fs.writeFileSync(E+'/validation.json',JSON.stringify({at:new Date().toISOString(),results,awsWrites:0},null,2)+'\n');if(results.some(r=>r.exit!==0))process.exitCode=1;

