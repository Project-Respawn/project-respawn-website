import assert from 'node:assert/strict';import {aws,identity,read,save,E} from './aws.mjs';
await identity();const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const expected=read('docs/architecture/phase1-ntgre-artifact-evidence/deployed-packages.json'),items=[];
for(const p of expected){const f=await aws('lambda','get-function-configuration',['--function-name',p.Arn]);assert.equal(f.CodeSha256,p.CodeSha256);assert.equal(f.State,'Active');assert.equal(f.LastUpdateStatus,'Successful');items.push({name:f.FunctionName,codeSha256:f.CodeSha256,modified:f.LastModified});}
const tournament=read('docs/architecture/phase2a-tournament-runtime-kms-evidence-2026-10-04/live-resources.json').lambda;
const tf=await aws('lambda','get-function-configuration',['--function-name',tournament.name]);assert.equal(tf.CodeSha256,tournament.codeSha256);items.push({name:tf.FunctionName,codeSha256:tf.CodeSha256,modified:tf.LastModified});
if(phase==='after')assert.deepEqual(items,read(E+'/protected-lambdas-before.json').items);
save('protected-lambdas-'+phase,{at:new Date().toISOString(),items,unchanged:true,awsWrites:0});console.log(JSON.stringify({phase,monitored:items.length,unchanged:true}));
