import fs from 'node:fs';import {spawnSync} from 'node:child_process';import {E} from './aws.mjs';
const results=[];
for(const [name,args] of [
 ['core',['--test','scripts/core-2b5a/core.test.mjs','scripts/team-hub-2b5/tests/core.test.mjs']],
 ['team-integration',['--test','scripts/team-hub-2b5/tests/target.test.mjs']],
 ['accounting',['--test','scripts/cloudformation-accounting.test.mjs','scripts/ntgre-phase1-allowance.test.mjs']],
 ['typescript',['infrastructure/domains/core/node_modules/typescript/bin/tsc','--noEmit','-p','infrastructure/domains/core/tsconfig.json']],
 ['ledger',['scripts/migration/ledger.mjs','check']]
 ]){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:8e6});const output=(r.stdout??'')+(r.stderr??'');fs.writeFileSync(E+'/validation-'+name+'.txt',output);const row={name,exit:r.status,passed:Number(output.match(/(?:# |ℹ )pass (\d+)/)?.[1]??0),failed:Number(output.match(/(?:# |ℹ )fail (\d+)/)?.[1]??0)};results.push(row);console.log(JSON.stringify(row));}
fs.writeFileSync(E+'/validation.json',JSON.stringify({at:new Date().toISOString(),results,awsWrites:0},null,2)+'\n');if(results.some(r=>r.exit!==0))process.exitCode=1;
