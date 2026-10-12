import assert from 'node:assert/strict';
import {aws,product} from '../team-hub-d1/aws.mjs';
import {save,pin,json} from './execution.mjs';
const template=json(pin().root+'/product.template.json');
const stage=await aws('apigatewayv2','get-stage',{ApiId:'t54b88casf',StageName:'$default'});assert.equal(stage.DefaultRouteSettings.DetailedMetricsEnabled,true);assert.ok(!stage.AccessLogSettings);
const alarms=(await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:product})).MetricAlarms;
const resources=(await aws('cloudformation','list-stack-resources',{StackName:product})).StackResourceSummaries;
const expected=resources.filter(x=>x.ResourceType==='AWS::CloudWatch::Alarm');assert.equal(expected.length,6);
for(const resource of expected){const a=alarms.find(x=>x.AlarmName===resource.PhysicalResourceId);assert.ok(a);const t=template.Resources[resource.LogicalResourceId].Properties;for(const key of ['Namespace','MetricName','Statistic','Period','EvaluationPeriods','Threshold','ComparisonOperator','TreatMissingData'])if(t[key]!==undefined)assert.deepEqual(a[key],t[key]);assert.deepEqual(a.AlarmActions,t.AlarmActions??[]);}
save('observability',{at:new Date().toISOString(),complete:true,stage,alarms,operator:'Ntgre (user)',monitoring:'ATTENDED_MANUAL',notificationDelivery:'NOT_CONFIGURED_OR_PROVEN',accessLogs:'DEFERRED_OPTION_A',liveTargetTransactionSignals:'PENDING_ISOLATED_AWS_ACCEPTANCE'});
console.log(JSON.stringify({complete:true,alarms:6,detailedMetrics:true}));
