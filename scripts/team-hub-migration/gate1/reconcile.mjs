import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,save,digest} from './read-only.mjs';
const review=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/change-set-review.json');
const candidate=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/candidate.json');
const raw=read('.tmp/team-hub-gate1/complete-change-sets.json');
const entries=review.rows.map(row=>{
 const before=read(`.tmp/team-hub-gate1/original/${row.stackKey}.json`).Resources[row.LogicalResourceId];
 const asset=candidate.manifest.find(m=>m.key===row.stackKey);
 const after=asset?read(asset.file).Resources[row.LogicalResourceId]:before;
 const expected=candidate.changes.find(c=>c.stackKey===row.stackKey&&c.logicalId===row.LogicalResourceId);
 const rawRow=raw.find(s=>s.ChangeSetId===row.changeSetId).Changes.find(c=>c.ResourceChange.LogicalResourceId===row.LogicalResourceId).ResourceChange;
 const unresolved=(rawRow.Details??[]).some(d=>d.Target?.AfterValue?.includes('KNOWN_AFTER_APPLY'));
 const truncated=(rawRow.Details??[]).some(d=>d.Target?.AfterValue?.includes('Truncated-Signature'));
 const unchanged=digest(before)===digest(after);
 if(!expected)assert.equal(unchanged,true,'Unreviewed declaration edit');
 return {stackKey:row.stackKey,logicalId:row.LogicalResourceId,type:row.ResourceType,action:row.Action,replacement:row.Replacement,plannedDeclarationChange:!!expected,declarationUnchanged:unchanged,beforeDeclarationSha256:digest(before),afterDeclarationSha256:digest(after),unresolvedAfterValues:unresolved,awsTruncatedAfterValue:truncated,classification:expected?(row.ResourceType==='Custom::AmplifyDynamoDBTable'?'REVIEWED_PROTECTION_WITH_CONDITIONAL_REPLACEMENT_FLAG':'REVIEWED_TEMPLATE_URL_PROPAGATION'):(unresolved?'UNRESOLVED_NESTED_REFERENCE_PROPAGATION':truncated?'OUT_OF_SCOPE_IAM_CHANGE_AWS_AFTER_VALUE_TRUNCATED':'AUTOMATIC_NESTED_STACK_PROPAGATION'),acceptedForExecution:false,details:row.Details};
});
const groups={};for(const r of entries){const key=`${r.type}|${r.replacement}`;groups[key]=(groups[key]??0)+1;}
save('reconciliation',{at:new Date().toISOString(),counts:review.counts,reviewedDeclarations:entries.filter(r=>r.plannedDeclarationChange).length,outsideReviewedDeclarations:entries.filter(r=>!r.plannedDeclarationChange).length,allUnexpectedDeclarationsUnchanged:entries.filter(r=>!r.plannedDeclarationChange).every(r=>r.declarationUnchanged),groups,entries,ready:false,decision:'STOP_BEFORE_EXECUTION',explanation:'CloudFormation reports replacement classifications and unresolved nested parameter values beyond the reviewed scope. Matching source declarations and provider tests do not authorize disregarding the AWS plan.'});
console.log(JSON.stringify({counts:review.counts,groups,unresolvedUnexpected:entries.filter(r=>!r.plannedDeclarationChange&&r.unresolvedAfterValues).length,outside:entries.filter(r=>!r.plannedDeclarationChange).length}));
