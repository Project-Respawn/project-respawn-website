import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {read,save,digest} from './read-only.mjs';
const exec=promisify(execFile),candidate=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/candidate.json'),prep=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/preparation.json');
assert.equal(prep.changeSetCreated,true);assert.equal(prep.executed,false);
const cached=process.argv.includes('--offline')?read('.tmp/team-hub-gate1/complete-change-sets.json'):null;
async function describe(id){if(cached){const result=cached.find(s=>s.ChangeSetId===id);assert.ok(result);return result;}const {stdout}=await exec('aws',['cloudformation','describe-change-set','--change-set-name',id,'--include-property-values','--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:64e6});return JSON.parse(stdout);}
const root=await describe(prep.changeSet.Id);
if(root.Status==='CREATE_IN_PROGRESS'||root.Status==='CREATE_PENDING'){console.log(JSON.stringify({status:root.Status,created:root.CreationTime,reason:root.StatusReason,reportedChanges:root.Changes?.length}));process.exit(0);}
const inventory=read('docs/architecture/phase2-resource-domain-map.json');const sets=[],rows=[],issues=[];
async function walk(set){if(sets.some(s=>s.ChangeSetId===set.ChangeSetId))return;sets.push(set);const stack=inventory.stacks.find(s=>s.arn===set.StackId);assert.ok(stack,'Unknown stack in change set');
 if(set.Status!=='CREATE_COMPLETE')issues.push({stack:stack.key,status:set.Status,reason:set.StatusReason});
 // Nested change sets execute only through their root and normally report UNAVAILABLE.
 if(set.ChangeSetId===root.ChangeSetId&&set.ExecutionStatus!=='AVAILABLE')issues.push({stack:stack.key,executionStatus:set.ExecutionStatus});
 for(const change of set.Changes??[]){const r=change.ResourceChange;const expected=candidate.changes.find(c=>c.stackKey===stack.key&&c.logicalId===r.LogicalResourceId);const row={stackKey:stack.key,changeSetId:set.ChangeSetId,...r,expected:!!expected};rows.push(row);if(!expected||r.Action!=='Modify'||r.Replacement!=='False'||r.ResourceType!==expected.type)issues.push({stack:stack.key,id:r.LogicalResourceId,action:r.Action,replacement:r.Replacement,reason:!expected?'Outside nine reviewed declarations':'Unexpected classification'});if(r.ChangeSetId)await walk(await describe(r.ChangeSetId));}
}
await walk(root);
for(const e of candidate.changes)if(!rows.some(r=>r.stackKey===e.stackKey&&r.LogicalResourceId===e.logicalId))issues.push({stack:e.stackKey,id:e.logicalId,reason:'Expected modification missing'});
fs.writeFileSync('.tmp/team-hub-gate1/complete-change-sets.json',JSON.stringify(sets,null,2)+'\n');
// Before/After contexts can contain resolved values. Persist their hashes, not their content.
const sanitized=rows.map(({BeforeContext,AfterContext,Details,...r})=>({...r,Details:Details?.map(({Target,...d})=>{const {BeforeValue,AfterValue,...target}=Target;return {...d,Target:{...target,...(BeforeValue!==undefined?{BeforeValueSha256:digest(BeforeValue)}:{}),...(AfterValue!==undefined?{AfterValueSha256:digest(AfterValue),AfterValueUnresolved:AfterValue==='{{changeSet:KNOWN_AFTER_APPLY}}'}:{})}};}),...(BeforeContext?{beforeContextSha256:digest(BeforeContext)}:{}),...(AfterContext?{afterContextSha256:digest(AfterContext)}:{})}));
const counts={additions:rows.filter(r=>r.Action==='Add').length,modifications:rows.filter(r=>r.Action==='Modify').length,deletions:rows.filter(r=>r.Action==='Remove').length,replacements:rows.filter(r=>r.Replacement==='True').length,conditionalReplacements:rows.filter(r=>r.Replacement==='Conditional').length,dynamicEvaluations:rows.flatMap(r=>r.Details??[]).filter(d=>d.Evaluation==='Dynamic').length};
save('change-set-review',{at:new Date().toISOString(),changeSetId:root.ChangeSetId,status:root.Status,executionStatus:root.ExecutionStatus,sets:sets.map(s=>({id:s.ChangeSetId,stack:s.StackId,status:s.Status,executionStatus:s.ExecutionStatus})),counts,rows:sanitized,issues,ready:issues.length===0,executed:false,fullResponseSha256:digest(sets)});
console.log(JSON.stringify({status:root.Status,counts,sets:sets.length,issueCount:issues.length,ready:issues.length===0},null,2));
