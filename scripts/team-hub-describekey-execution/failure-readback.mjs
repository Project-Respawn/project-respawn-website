import assert from 'node:assert/strict';
import {aws,read,save,canonical,E} from './aws.mjs';
const base=read('docs/architecture/team-hub-recovery-decision-evidence-2026-10-09/inspection.json');
const result={at:new Date().toISOString(),functions:[],complete:false};
for(const f of base.functions){
 const live=await aws('lambda','get-function-configuration',{FunctionName:f.actual.FunctionArn});
 const unchanged=canonical(live)===canonical(f.actual);
 result.functions.push({kind:f.kind,configuration:live,entireConfigurationUnchanged:unchanged});save('failure-readback',result);
 const drift=(await aws('cloudformation','detect-stack-resource-drift',{StackName:'ProjectRespawn-TeamHub-Ntgre',LogicalResourceId:f.id})).StackResourceDrift;
 result.functions.at(-1).drift=drift;
 save('failure-readback',result);
}
const h=read(E+'/workflow-history.json');
result.scheduledUpdates=h.events.filter(x=>x.taskScheduledEventDetails?.resource==='updateFunctionConfiguration').length;
result.failedTask=h.events.find(x=>x.type==='TaskFailed')?.taskFailedEventDetails;
assert.ok(result.scheduledUpdates<=2);
result.complete=true;save('failure-readback',result);console.log(JSON.stringify({complete:true,unchangedFunctions:result.functions.filter(f=>f.entireConfigurationUnchanged).length,scheduledUpdates:result.scheduledUpdates}));
