import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws,read,save,digest} from './coverage-read.mjs';
const previous='docs/architecture/team-hub-2b3-final-evidence-2026-10-05',E='docs/architecture/team-hub-2b5b-evidence-2026-10-07';
const baseline=read(previous+'/iam-coverage.json'),current=read(E+'/iam-coverage.json'),coverage=read(previous+'/coverage.json');
assert.equal(current.paginationCompleted,true);assert.equal(current.missingPolicyDocuments,0);
const changed=[],added=[];for(const p of current.principals){const old=baseline.principals.find(x=>x.arn===p.arn);if(!old)added.push(p);else if(digest(old.grants)!==digest(p.grants))changed.push(p.arn);}
const excluded=[];
for(const p of added){assert.equal(p.arn,'arn:aws:iam::058264289478:role/ProjectRespawn-Core-Ntgre-Execution');assert.equal(p.grants.length,0);const policy=(await aws('iam','get-policy','--policy-arn',p.boundary.PermissionsBoundaryArn)).Policy;const actual=(await aws('iam','get-policy-version','--policy-arn',policy.Arn,'--version-id',policy.DefaultVersionId)).PolicyVersion.Document;
 const template=read('docs/architecture/core-artifact-evidence-2026-10-06/security.template.json');const expected=Object.values(template.Resources).find(r=>r.Type==='AWS::IAM::ManagedPolicy'&&r.Properties.ManagedPolicyName==='ProjectRespawn-Core-Ntgre-ExecutionBoundary')?.Properties.PolicyDocument;assert.ok(expected);assert.equal(digest(actual),digest(expected));excluded.push({arn:p.arn,reason:'No exact Team data/gateway grants; Core execution boundary matches accepted scoped policy',boundarySha256:digest(actual)});
}
assert.equal(changed.length,0,'Existing potential Team grants changed');
const priorResolvers=read(previous+'/resolver-coverage.json'),resolvers=[];
for(const old of priorResolvers.resolvers){const live=(await aws('appsync','get-resolver','--api-id',priorResolvers.api,'--type-name',old.type,'--field-name',old.field)).resolver;resolvers.push({type:old.type,field:old.field,kind:live.kind,pipeline:live.pipelineConfig,requestSha256:digest(live.requestMappingTemplate??live.code??''),responseSha256:digest(live.responseMappingTemplate??'')});}
const sourceHashes={};for(const row of coverage.writers){if(typeof row.source==='string'&&fs.existsSync(row.source))sourceHashes[row.source]=digest(fs.readFileSync(row.source,'utf8'));}
save('coverage-refresh',{at:new Date().toISOString(),recordedClassifications:coverage.counts,rolesEnumerated:current.rolesEnumerated,usersEnumerated:current.usersEnumerated,missingPolicyDocuments:0,existingRelevantGrantsUnchanged:true,newExcludedPrincipals:excluded,resolvers,sourceHashes,limits:['Refreshed IAM and resolver existence does not prove live denial through every generated AppSync operation.','No installed Legacy freeze or actual authority transition performed.'],awsWrites:0});console.log(JSON.stringify({iam:'PASS',newExcluded:excluded.length,resolvers:resolvers.length,sources:Object.keys(sourceHashes).length}));
