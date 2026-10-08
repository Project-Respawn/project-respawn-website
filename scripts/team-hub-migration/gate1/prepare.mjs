import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {read,save,digest} from './read-only.mjs';
const exec=promisify(execFile),candidate=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/candidate.json');
assert.equal(candidate.candidateSha256,'8b01cd991e5e31ddb4ad40d8fa27a3e59a250c031faf6b0674c66a7bcd84f899');assert.equal(digest(candidate.manifest),candidate.candidateSha256);
const receipt={at:new Date().toISOString(),uploads:[],changeSetCreated:false,executed:false};
async function aws(...args){const {stdout}=await exec('aws',[...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:64e6});return stdout.trim()?JSON.parse(stdout):{};}
try{
 const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');receipt.identity=identity;
 const before=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/legacy-before.json');
 const root=(await aws('cloudformation','describe-stacks','--stack-name',candidate.root)).Stacks[0];assert.equal(root.StackStatus,'UPDATE_COMPLETE');assert.equal(root.LastUpdatedTime,before.root.lastUpdated);assert.equal(root.StackId,before.root.arn);
 assert.equal(read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/source-before.json').empty,true);
 const existing=await aws('cloudformation','list-change-sets','--stack-name',candidate.root);assert.ok(!existing.Summaries.some(s=>s.ChangeSetName===candidate.changeSetName),'Existing same-name change set; stop');
 const location=await aws('s3api','get-bucket-location','--bucket','cdk-hnb659fds-assets-058264289478-eu-north-1');assert.equal(location.LocationConstraint,'eu-north-1');
 for(const asset of candidate.manifest){
  assert.equal(asset.bucket,'cdk-hnb659fds-assets-058264289478-eu-north-1');assert.equal(asset.objectKey,`team-hub-gate1/20261005/${asset.sha256}.json`);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset.file)).digest('hex'),asset.sha256);
  const uploaded=await aws('s3api','put-object','--bucket',asset.bucket,'--key',asset.objectKey,'--body',asset.file,'--server-side-encryption','AES256','--checksum-algorithm','SHA256','--checksum-sha256',Buffer.from(asset.sha256,'hex').toString('base64'));
  assert.equal(uploaded.ChecksumSHA256,Buffer.from(asset.sha256,'hex').toString('base64'));receipt.uploads.push({key:asset.objectKey,sha256:asset.sha256,versionId:uploaded.VersionId});save('preparation',receipt);
 }
 const request={StackName:candidate.root,ChangeSetName:candidate.changeSetName,ChangeSetType:'UPDATE',TemplateURL:candidate.manifest.find(m=>m.key==='000').url,Parameters:(root.Parameters??[]).map(p=>({ParameterKey:p.ParameterKey,UsePreviousValue:true})),Capabilities:['CAPABILITY_IAM','CAPABILITY_NAMED_IAM','CAPABILITY_AUTO_EXPAND'],IncludeNestedStacks:true,Description:'Gate 1: exact four Legacy Team Hub table protection updates; no application changes; execute only after full reconciliation.'};
 if(root.RoleARN)request.RoleARN=root.RoleARN;
 fs.writeFileSync('.tmp/team-hub-gate1/create-change-set.json',JSON.stringify(request));
 const created=await aws('cloudformation','create-change-set','--cli-input-json','file://.tmp/team-hub-gate1/create-change-set.json');receipt.changeSetCreated=true;receipt.changeSet=created;save('preparation',receipt);console.log(JSON.stringify(receipt));
}catch(e){receipt.error={name:e.name,message:(e.stderr??e.message).replace(/AKIA[A-Z0-9]{16}/g,'[redacted]')};save('preparation',receipt);throw Error(receipt.error.message);}
