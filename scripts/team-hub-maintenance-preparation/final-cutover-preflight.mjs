// Read-only refresh. Reuse accepted inspectors, redirecting ONLY their evidence output root.
import fs from 'node:fs';import assert from 'node:assert/strict';import {build} from 'esbuild';import {spawn} from 'node:child_process';
import {aws,canonical} from '../team-hub-describekey-execution/aws.mjs';
export const E='docs/architecture/team-hub-final-controlled-cutover-evidence-2026-10-13/preflight';
const prior='docs/architecture/team-hub-describekey-execution-evidence-2026-10-12';
fs.mkdirSync(E+'/after',{recursive:true});fs.mkdirSync('.tmp/team-hub-final-controlled-cutover-preflight-2026-10-13',{recursive:true});
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');assert.equal(identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const accepted=JSON.parse(fs.readFileSync(prior+'/configuration.json')),functions=[];
for(const f of accepted.functions){const configuration=await aws('lambda','get-function-configuration',{FunctionName:f.configuration.FunctionArn});assert.equal(canonical(configuration),canonical(f.configuration),'Unexpected installed configuration/revision drift');const drift=(await aws('cloudformation','detect-stack-resource-drift',{StackName:'ProjectRespawn-TeamHub-Ntgre',LogicalResourceId:'Parity'+f.kind+'Function'})).StackResourceDrift;assert.equal(drift.StackResourceDriftStatus,'IN_SYNC');functions.push({kind:f.kind,configuration,drift});}
const row=(await aws('dynamodb','get-item',{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true})).Item;
assert.equal(row.mode.S,'LEGACY_WRITER');assert.equal(row.epoch.N,'3');assert.equal(row.version.N,'3');
const frontend=JSON.parse(fs.readFileSync('config/domains/team-hub/frontend-cutover.PROPOSAL.json'));assert.equal(frontend.reviewed,false);assert.equal(frontend.epoch,null);
fs.writeFileSync(E+'/baseline.json',JSON.stringify({at:new Date().toISOString(),identity,region:'eu-north-1',functions,authority:row,frontend,complete:true,resourceChanges:0},null,2)+'\n');
for(const name of ['protected-after','inventory-after','fence-after','installed-security','observability']){
 const outfile='.tmp/team-hub-final-controlled-cutover-preflight-2026-10-13/'+name+'.mjs';
 await build({entryPoints:['scripts/team-hub-describekey-execution/'+name+'.mjs'],outfile,bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'evidence-output-only',setup(b){b.onLoad({filter:/\.mjs$/},async({path})=>({contents:fs.readFileSync(path,'utf8').replaceAll(prior,E),loader:'js'}));}}]});
}
const results=await Promise.allSettled(['protected-after','inventory-after','fence-after','installed-security','observability'].map(name=>new Promise((resolve,reject)=>{const c=spawn(process.execPath,['.tmp/team-hub-final-controlled-cutover-preflight-2026-10-13/'+name+'.mjs'],{windowsHide:true,stdio:'inherit'});c.on('exit',code=>code===0?resolve(name):reject(Error(name+' failed '+code)));})));
for(const r of results)if(r.status==='rejected')throw r.reason;
console.log(JSON.stringify({complete:true,functions:2,inspectors:5,awsResourceChanges:0}));




