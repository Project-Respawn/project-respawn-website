import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {read,save,digest} from './read-only.mjs';
const inventory=read('docs/architecture/phase2-resource-domain-map.json');
const baseline=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/template-baseline.json');assert.equal(baseline.templates.length,62);
const proposal=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/legacy-protection-proposal.json');
const bucket='cdk-hnb659fds-assets-058264289478-eu-north-1';
const templates=new Map(baseline.templates.map(s=>[s.key,read(`.tmp/team-hub-gate1/original/${s.key}.json`)]));
const changes=[];const changed=new Set();
for(const p of proposal.proposals){const [key,id]=p.resourceId.split(':');const t=templates.get(key);assert.deepEqual(t.Resources[id],p.before);t.Resources[id]=structuredClone(p.proposed);changed.add(key);changes.push({stackKey:key,logicalId:id,type:p.before.Type,before:p.before,after:p.proposed,reason:'Exact reviewed four-table managed recovery protection'});}
fs.mkdirSync('.tmp/team-hub-gate1/candidate',{recursive:true});
const manifest=[];
while(changed.size){const key=[...changed].sort((a,b)=>Number(b)-Number(a))[0];changed.delete(key);const s=inventory.stacks.find(s=>s.key===key);const t=templates.get(key);const body=JSON.stringify(t,null,2)+'\n';const sha=crypto.createHash('sha256').update(body).digest('hex');const objectKey=`team-hub-gate1/20261005/${sha}.json`;const url=`https://s3.eu-north-1.amazonaws.com/${bucket}/${objectKey}`;const file=`.tmp/team-hub-gate1/candidate/${key}.json`;fs.writeFileSync(file,body);manifest.push({key,stack:s.arn,file,bytes:Buffer.byteLength(body),sha256:sha,semanticSha256:digest(t),bucket,objectKey,url});
 if(s.parent!==null){const parent=templates.get(s.parent);const link=inventory.resources.find(r=>r.stackKey===s.parent&&r.type==='AWS::CloudFormation::Stack'&&r.physicalId===s.arn);assert.ok(link);const before=structuredClone(parent.Resources[link.logicalId]);parent.Resources[link.logicalId].Properties.TemplateURL=url;changes.push({stackKey:s.parent,logicalId:link.logicalId,type:link.type,before,after:structuredClone(parent.Resources[link.logicalId]),reason:'TemplateURL propagation only'});changed.add(s.parent);}
}
assert.equal(manifest.length,6);assert.equal(changes.length,9);
const source=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/source-before.json');
save('candidate',{at:new Date().toISOString(),account:'058264289478',region:'eu-north-1',root:inventory.stacks.find(s=>s.key==='000').arn,changeSetName:'ntgre-teamhub-gate1-recovery-20261005',manifest,candidateSha256:digest(manifest),changes,backups:source.tables.map(t=>({model:t.model,table:t.table.TableName,arn:t.table.TableArn,name:`ProjectRespawn-TeamHub-Ntgre-M4-${t.model}-20261005-Gate1`})),freshSynthesis:false,providerCodeChanged:false,iamChanged:false});
console.log(JSON.stringify({templates:manifest.length,plannedResourceModifications:changes.length,candidateSha256:digest(manifest)}));
