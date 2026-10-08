import assert from 'node:assert/strict';
import {aws,read,save} from './coverage-read.mjs';
assert.equal((await aws('sts','get-caller-identity')).Account,'058264289478');
const template=read('docs/architecture/team-hub-core-integration-evidence-2026-10-07/product.template.json');
const expected=Object.entries(template.Resources).filter(([,r])=>r.Type==='AWS::CloudWatch::Alarm');
const names=expected.map(([,r])=>r.Properties.AlarmName);
const alarms=(await aws('cloudwatch','describe-alarms','--alarm-names',...names)).MetricAlarms;
assert.equal(alarms.length,names.length);
const rows=alarms.map(a=>({name:a.AlarmName,state:a.StateValue,stateUpdated:a.StateUpdatedTimestamp,namespace:a.Namespace,metric:a.MetricName,dimensions:a.Dimensions,period:a.Period,threshold:a.Threshold,evaluationPeriods:a.EvaluationPeriods,treatMissingData:a.TreatMissingData,actionsEnabled:a.ActionsEnabled,alarmActions:a.AlarmActions,okActions:a.OKActions,comparison:a.ComparisonOperator}));
for(const [id,r]of expected){const a=alarms.find(x=>x.AlarmName===r.Properties.AlarmName);assert.ok(a,id);for(const k of ['Namespace','MetricName','Period','Threshold','EvaluationPeriods','TreatMissingData','ComparisonOperator'])assert.deepEqual(a[k],r.Properties[k],id+' '+k);}
save('alarm-baseline',{at:new Date().toISOString(),present:true,configurationCompared:true,alarms:rows,signalInjectionPerformed:false,monitoringCandidateInstalled:false,awsWrites:0});
console.log(JSON.stringify(rows.map(a=>({name:a.name,state:a.state,notificationActions:a.alarmActions.length}))));
