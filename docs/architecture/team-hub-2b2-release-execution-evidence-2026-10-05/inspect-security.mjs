import assert from 'node:assert/strict';
import {aws,read,save,pins,expiry,pinned,dir,equal} from './common.mjs';
pins();const prepared=read(dir+'/security-prepared.json');
const cs=await aws('cloudformation','describe-change-set','--change-set-name',prepared.Id,'--include-property-values');save('security-change-set',cs);
assert.equal(cs.Status,'CREATE_COMPLETE');assert.equal(cs.ExecutionStatus,'AVAILABLE');assert.equal(cs.Changes.length,4);
const expected=read(pinned+'/first-create-security.template.json');const t=await aws('cloudformation','get-template','--stack-name',prepared.StackId,'--change-set-name',prepared.Id,'--template-stage','Original');const actual=typeof t.TemplateBody==='string'?JSON.parse(t.TemplateBody):t.TemplateBody;equal(actual,expected);save('security-aws-template',actual);
for(const change of cs.Changes){const r=change.ResourceChange;assert.equal(r.Action,'Add');assert.ok(!r.Replacement||r.Replacement==='False');assert.equal(r.ResourceType,expected.Resources[r.LogicalResourceId]?.Type);}
assert.deepEqual(cs.Changes.map(c=>c.ResourceChange.LogicalResourceId).sort(),Object.keys(expected.Resources).sort());
const v=read(pinned+'/validation.json');assert.equal(v.failures.length,0);assert.equal(v.analyzerFindings.length,0);
const gate={ready:true,identity:read(dir+'/preflight.json').identity,region:'eu-north-1',candidate:read(pinned+'/manifest.json').revision,templateSha:pins().securityTemplate,time:expiry(),changeSet:cs.ChangeSetId,status:cs.Status,additions:4,modifications:0,deletions:0,replacements:0,unexpected:0,kmsAllowsAdded:0,protectedApis:14,positives:v.positive,negatives:v.negative,analyzerFindings:0,rollbackEnabledAtExecution:true};save('security-execution-gate',gate);console.log(JSON.stringify(gate));
