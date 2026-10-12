import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {read,save,sha,E,canonical} from './aws.mjs';
const previous=read('docs/architecture/team-hub-cursor-security-evidence-2026-10-08/artifact-manifest.json');
for(const artifact of [...previous.artifacts,...previous.sourceHashes,...previous.evidenceHashes])assert.equal(sha(artifact.path),artifact.sha256,artifact.path);
const original=read(previous.preservedRoot+'/product.template.json'),product=structuredClone(original),changes=[];
// Explicit serialization-only change forces a reviewable Environment property update.
// Re-uploading the identical desired template would not repair the installed drift.
for(const id of ['ParityReadFunction','ParityCommandFunction']){
 const vars=product.Resources[id].Properties.Environment.Variables;
 const compact=vars.CORE_ENVIRONMENT;
 vars.CORE_ENVIRONMENT=JSON.stringify(JSON.parse(compact),null,2);
 assert.equal(JSON.stringify(JSON.parse(vars.CORE_ENVIRONMENT)),compact);
 const check=structuredClone(product.Resources[id]);check.Properties.Environment.Variables.CORE_ENVIRONMENT=compact;
 assert.equal(canonical(check),canonical(original.Resources[id]));
 changes.push({logicalId:id,type:'AWS::Lambda::Function',property:'Environment.Variables.CORE_ENVIRONMENT',change:'JSON whitespace only; resend the complete approved environment map',replacement:false});
}
for(const id of Object.keys(original.Resources))if(!changes.some(c=>c.logicalId===id))assert.equal(canonical(product.Resources[id]),canonical(original.Resources[id]));
const text=JSON.stringify(product,null,2)+'\n',productSha256=createHash('sha256').update(text).digest('hex');
const manifest={schemaVersion:'team-hub-config-repair.v1',status:'BLOCKED_PENDING_SEPARATE_EXECUTION_KMS_AND_ARTIFACT_BINDING_REVIEW',previousManifestSha256:sha(previous.preservedRoot+'/candidate.json'),productSha256,securitySha256:sha(previous.preservedRoot+'/security.template.json'),runtimeSha256:sha(previous.preservedRoot+'/runtime.zip'),changes,resourceCounts:{before:48,after:48,additions:0,modifications:2,deletions:0,replacements:0},sourceCodeChanged:false,securityChanged:false,awsWrites:0,rollback:['rollback.product.template.json','rollback.security.template.json','rollback.read.runtime.zip','rollback.command.runtime.zip'].map(name=>({name,sha256:sha(previous.preservedRoot+'/'+name)}))};
const manifestText=JSON.stringify(manifest,null,2)+'\n',manifestSha256=createHash('sha256').update(manifestText).digest('hex'),root='infrastructure/domains/team-hub/.build/config-repair/'+manifestSha256;
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(root+'/product.template.json',text);fs.writeFileSync(root+'/candidate.json',manifestText);
for(const name of ['security.template.json','runtime.zip',...manifest.rollback.map(x=>x.name)])fs.copyFileSync(previous.preservedRoot+'/'+name,root+'/'+name);
fs.writeFileSync(E+'/product.template.json',text);fs.writeFileSync(E+'/candidate.json',manifestText);
save('artifact-manifest',{manifestSha256,preservedRoot:root,artifacts:fs.readdirSync(root).sort().map(name=>({path:root+'/'+name,sha256:sha(root+'/'+name)})),previousManifest:previous.preservedRoot+'/candidate.json',deploymentAuthorized:false});
console.log(JSON.stringify({manifestSha256,productSha256,status:manifest.status,changes:2}));
