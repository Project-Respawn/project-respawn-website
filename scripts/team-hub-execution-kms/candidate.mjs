import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {read,save,sha,canonical,E} from './aws.mjs';
const previous=read('docs/architecture/team-hub-config-repair-evidence-2026-10-09/artifact-manifest.json');
for(const a of previous.artifacts)assert.equal(sha(a.path),a.sha256,a.path);
const original=read(previous.preservedRoot+'/security.template.json'),s=structuredClone(original);
const lambdaKey='arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7',secretKey='arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a';
const compression=[];
for(const id of ['ExecutionRole','ExecutionBoundary']){
 const p=id==='ExecutionRole'?s.Resources[id].Properties.Policies[0].PolicyDocument:s.Resources[id].Properties.PolicyDocument;
 const deny=p.Statement.filter(x=>x.Effect==='Deny'&&x.Action==='kms:*'&&x.NotResource===secretKey);assert.equal(deny.length,1);
 deny[0].NotResource=[secretKey,lambdaKey];
 p.Statement.push({Effect:'Deny',NotAction:'kms:Decrypt',Resource:lambdaKey});
 // No Allow added or relaxed. Only Decrypt escapes the explicit deny on this key.
 if(id==='ExecutionBoundary'&&JSON.stringify(p).length>6144){
  for(const stmt of p.Statement)if(stmt.Sid){compression.push({id,removedSid:stmt.Sid});delete stmt.Sid;}
  const indices=p.Statement.map((x,i)=>x.Effect==='Allow'&&x.Resource==='*'&&!x.Condition?i:-1).filter(i=>i>=0);
  assert.deepEqual(indices.map(i=>p.Statement[i].Action).sort(),['logs:DescribeLogGroups','secretsmanager:GetRandomPassword'].sort());
  p.Statement[indices[0]].Action=indices.flatMap(i=>p.Statement[i].Action);p.Statement.splice(indices[1],1);
  compression.push({id,mergedUnconditionalResourceStarAllows:['logs:DescribeLogGroups','secretsmanager:GetRandomPassword']});
 }
}
const oldHash='a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad',productHash=sha(previous.preservedRoot+'/product.template.json');
const oldFragment='team-hub/cursor-security/'+oldHash+'.template.json',newFragment='team-hub/config-repair/'+productHash+'.template.json';
const caller=s.Resources.PreparationCaller.Properties.PolicyDocument;
assert.equal(JSON.stringify(caller).split(oldFragment).length-1,3);
s.Resources.PreparationCaller.Properties.PolicyDocument=JSON.parse(JSON.stringify(caller).replaceAll(oldFragment,newFragment));
const changed=Object.keys(s.Resources).filter(id=>canonical(s.Resources[id])!==canonical(original.Resources[id]));
assert.deepEqual(changed.sort(),['ExecutionBoundary','ExecutionRole','PreparationCaller'].sort());
const limits=Object.entries(s.Resources).filter(([,r])=>r.Type==='AWS::IAM::ManagedPolicy').map(([id,r])=>({id,characters:JSON.stringify(r.Properties.PolicyDocument).length,limit:6144}));
assert.ok(limits.every(x=>x.characters<=x.limit),JSON.stringify(limits));
const text=JSON.stringify(s,null,2)+'\n',securitySha256=createHash('sha256').update(text).digest('hex');
const manifest={schemaVersion:'team-hub-execution-kms.v1',previousManifestSha256:previous.manifestSha256,securitySha256,productSha256:productHash,runtimeSha256:sha(previous.preservedRoot+'/runtime.zip'),lambdaKey,secretKey,kmsAllowsAdded:0,compression,limits,securityChanges:changed,securityResourceCount:7,productResourceCount:48,productChanges:{additions:0,modifications:2,deletions:0,replacements:0},productObjectKey:newFragment,previousProductObjectKey:oldFragment,runtimeChanged:false,runtimeIamChanged:false,awsWrites:0};
const mt=JSON.stringify(manifest,null,2)+'\n',manifestSha256=createHash('sha256').update(mt).digest('hex'),root='infrastructure/domains/team-hub/.build/execution-kms/'+manifestSha256;
fs.mkdirSync(root,{recursive:true});fs.writeFileSync(root+'/security.template.json',text);fs.writeFileSync(root+'/candidate.json',mt);
for(const a of previous.artifacts){const name=a.path.split('/').at(-1);if(!['candidate.json','security.template.json'].includes(name))fs.copyFileSync(a.path,root+'/'+name);}
fs.copyFileSync(previous.preservedRoot+'/security.template.json',root+'/previous-blocked.security.template.json');
fs.writeFileSync(E+'/security.template.json',text);fs.writeFileSync(E+'/candidate.json',mt);
save('artifact-manifest',{manifestSha256,preservedRoot:root,artifacts:fs.readdirSync(root).sort().map(name=>({path:root+'/'+name,sha256:sha(root+'/'+name)})),previousManifest:previous.preservedRoot+'/candidate.json',deploymentAuthorized:false});
console.log(JSON.stringify({manifestSha256,securitySha256,limits,changed,compression}));
