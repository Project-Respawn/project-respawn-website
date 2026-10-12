import assert from 'node:assert/strict';
import {aws,read,save,canonical,E} from './aws.mjs';
const base=read('docs/architecture/team-hub-recovery-decision-evidence-2026-10-09/inspection.json');
const result={at:new Date().toISOString(),functions:[],complete:false};
for(const f of base.functions){
 const live=await aws('lambda','get-function-configuration',{FunctionName:f.actual.FunctionArn});
 assert.equal(canonical(live),canonical(f.actual),'Full installed configuration changed');
 const drift=(await aws('cloudformation','detect-stack-resource-drift',{StackName:'ProjectRespawn-TeamHub-Ntgre',LogicalResourceId:f.id})).StackResourceDrift;
 result.functions.push({kind:f.kind,configuration:live,entireConfigurationUnchanged:true,drift});
 save('failure-readback',result);
}
const h=read(E+'/workflow-history.json');
result.scheduledUpdates=h.events.filter(x=>x.taskScheduledEventDetails?.resource==='updateFunctionConfiguration').length;
result.failedTask=h.events.find(x=>x.type==='TaskFailed')?.taskFailedEventDetails;
assert.equal(result.scheduledUpdates,1);
result.complete=true;save('failure-readback',result);console.log(JSON.stringify({complete:true,unchangedFunctions:2,scheduledUpdates:1}));
