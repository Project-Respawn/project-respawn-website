// Read-only, sanitized Core monitoring and lifecycle evidence.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws,E,save} from './core-runtime-support.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),window=read(E+'/authorization-window.json'),fn='ProjectRespawn-Core-Production-Contracts';
const result={at:new Date().toISOString(),awsWrites:0};
result.events=aws('cloudformation','describe-stack-events',{StackName:'ProjectRespawn-Core-Production'});
result.configuration=aws('lambda','get-function-configuration',{FunctionName:fn});
result.alarms=aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-Core-Production-'});assert.equal(result.alarms.MetricAlarms.length,4);
const start=window.windowStart,end=new Date().toISOString();result.metrics=[];
for(const MetricName of ['Invocations','Errors','Throttles'])result.metrics.push({MetricName,...aws('cloudwatch','get-metric-statistics',{Namespace:'AWS/Lambda',MetricName,Dimensions:[{Name:'FunctionName',Value:fn}],StartTime:start,EndTime:end,Period:60,Statistics:['Sum']})});
for(const MetricName of ['Denied','DependencyFailures'])result.metrics.push({MetricName,...aws('cloudwatch','get-metric-statistics',{Namespace:'ProjectRespawn/Core',MetricName,Dimensions:[{Name:'Environment',Value:'Production'}],StartTime:start,EndTime:end,Period:60,Statistics:['Sum']})});
const logs=aws('logs','filter-log-events',{logGroupName:'/project-respawn/Production/core/contracts',startTime:Date.parse(start)}).events??[];
result.platformLogs=logs.filter(e=>/^(?:START RequestId:|END RequestId:|REPORT RequestId:|INIT_START)/.test(e.message)).map(({eventId,timestamp,message})=>({eventId,timestamp,message}));
result.metricLogs=logs.flatMap(e=>{try{const v=JSON.parse(e.message);if(v._aws?.CloudWatchMetrics?.some(m=>m.Namespace==='ProjectRespawn/Core'))return[{eventId:e.eventId,timestamp:e.timestamp,metrics:v._aws.CloudWatchMetrics,Environment:v.Environment,...Object.fromEntries(['Denied','DependencyFailures'].filter(k=>typeof v[k]==='number').map(k=>[k,v[k]]))}];}catch{}return[];});
const grants=aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventName',AttributeValue:'CreateGrant'}],StartTime:start,MaxResults:50}).Events??[];
result.grantEvents=grants.flatMap(e=>{const v=JSON.parse(e.CloudTrailEvent),arn=v.userIdentity?.arn??'',issuer=v.userIdentity?.sessionContext?.sessionIssuer?.arn??'';if(!/ProjectRespawn-Core-Production-Execution/.test(arn+issuer))return[];const p=v.requestParameters;return[{eventID:v.eventID,eventTime:v.eventTime,requestID:v.requestID,principalArn:arn,issuerArn:issuer,errorCode:v.errorCode,errorMessage:v.errorMessage,resources:v.resources,requestParameters:p?Object.fromEntries(['keyId','granteePrincipal','operations','constraints','retiringPrincipal'].filter(k=>p[k]!==undefined).map(k=>[k,p[k]])):null,responseGrantId:v.responseElements?.grantId}];});
result.completeServiceGrantReceipt=result.grantEvents.some(e=>!e.errorCode);
result.tokensOrDirectoryDataPersisted=false;save('monitoring-lifecycle.json',result);console.log(JSON.stringify({alarms:result.alarms.MetricAlarms.map(a=>({name:a.AlarmName,state:a.StateValue})),platformLogCount:result.platformLogs.length,metricLogCount:result.metricLogs.length,grantEvents:result.grantEvents.length,completeServiceGrantReceipt:result.completeServiceGrantReceipt}));
