// Read-only validation; bundle inspectors to redirect receipts, never runtime or original pins.
import fs from 'node:fs';import assert from 'node:assert/strict';import {build} from 'esbuild';import {spawn} from 'node:child_process';import {aws} from '../team-hub-isolated-execution/read.mjs';
const P='docs/architecture/team-hub-isolated-verification-evidence-2026-10-12',E='docs/architecture/team-hub-isolated-quota-evidence-2026-10-12',B='.tmp/team-hub-isolated-quota';fs.mkdirSync(B,{recursive:true});
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');const settings=await aws('lambda','get-account-settings');assert.ok(settings.AccountLimit.UnreservedConcurrentExecutions>=1);fs.writeFileSync(E+'/capacity.json',JSON.stringify({at:new Date().toISOString(),identity,settings,reservedConcurrency:'UNSET',execution:'Sequential; one synchronous probe invocation, no automatic retries; stop on throttling',capacityGuaranteed:false,awsWrites:0},null,2)+'\n');
for(const name of ['baseline','security','proposal-security']){
 const outfile=B+'/'+name+'.mjs';await build({entryPoints:['scripts/team-hub-isolated-verification/'+name+'.mjs'],outfile,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'receipt-destination',setup(b){b.onLoad({filter:/\.mjs$/},({path})=>({contents:fs.readFileSync(path,'utf8').replaceAll(P,E),loader:'js'}));}}]});
 await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[outfile],{windowsHide:true,stdio:'inherit'});c.on('exit',code=>code===0?resolve():reject(Error(name+' failed '+code)));});
}
console.log(JSON.stringify({complete:true,awsResourceChanges:0}));
