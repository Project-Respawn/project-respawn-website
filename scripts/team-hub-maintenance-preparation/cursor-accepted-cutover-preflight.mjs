// Read-only refresh against the accepted cursor deployment; historical evidence is immutable.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {aws,canonical} from '../team-hub-describekey-execution/aws.mjs';
import {pin} from '../team-hub-cursor-deployment/common.mjs';
const E=process.env.TEAM_HUB_PREFLIGHT_EVIDENCE??'docs/architecture/team-hub-cursor-accepted-cutover-evidence-2026-10-13';
assert.ok(/^docs\/architecture\/team-hub-cursor-accepted-cutover-evidence-2026-10-\d{2}$/.test(E));
fs.mkdirSync(E+'/preflight/after',{recursive:true});
fs.mkdirSync('.tmp/team-hub-cursor-accepted-cutover',{recursive:true});
const c=pin(),baseline=JSON.parse(fs.readFileSync('docs/architecture/team-hub-cursor-deployment-evidence-2026-10-13/accepted-deployment-baseline.json'));
const identity=await aws('sts','get-caller-identity');
assert.equal(identity.Account,'058264289478');assert.equal(identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const functions=[];
for(const f of baseline.functions){
 const configuration=await aws('lambda','get-function-configuration',{FunctionName:f.configuration.FunctionArn});
 assert.equal(canonical(configuration),canonical(f.configuration),'Unexpected Lambda configuration or RevisionId change');
 const drift=(await aws('cloudformation','detect-stack-resource-drift',{StackName:baseline.product,LogicalResourceId:'Parity'+f.kind+'Function'})).StackResourceDrift;
 assert.equal(drift.StackResourceDriftStatus,'IN_SYNC');functions.push({kind:f.kind,configuration,drift});
}
const authority=(await aws('dynamodb','get-item',{TableName:baseline.product+'-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true})).Item;
assert.equal(authority.mode.S,'LEGACY_WRITER');assert.equal(authority.epoch.N,'3');assert.equal(authority.version.N,'3');
fs.writeFileSync(E+'/preflight/baseline.json',JSON.stringify({at:new Date().toISOString(),identity,functions,authority,backend:{security:c.securitySha256,product:c.productSha256,read:c.runtimeSha256,command:baseline.commandZipSha256},awsResourceWrites:0},null,2)+'\n');
// These compiled inspectors already bind the approved mixed Read/Command hashes and security delta.
for(const name of ['protected-after','inventory-after','fence-after','installed-security','observability']){
 const source='.tmp/team-hub-cursor-deployment/after-'+name+'.mjs';
 assert.ok(fs.existsSync(source),'Accepted compiled inspector unavailable');
 const output='.tmp/team-hub-cursor-accepted-cutover/'+name+'.mjs';
 fs.writeFileSync(output,fs.readFileSync(source,'utf8').replaceAll('docs/architecture/team-hub-cursor-deployment-evidence-2026-10-13/preservation',E+'/preflight'));
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[output],{windowsHide:true,stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(Error(name+' failed '+code)));child.on('error',reject);});
}
fs.writeFileSync(E+'/preflight/complete.json',JSON.stringify({at:new Date().toISOString(),complete:true,awsResourceWrites:0},null,2)+'\n');
console.log(JSON.stringify({complete:true,baseline:'accepted cursor deployment',authority:'LEGACY_WRITER 3/3',awsResourceWrites:0}));
