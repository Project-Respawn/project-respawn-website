import assert from 'node:assert/strict';import {aws,identity,pin,read,save,canonical,product} from './aws.mjs';
const c=pin();await identity();const proof=read('live-proof');assert.equal(proof.complete,true);assert.ok(proof.checks.every(x=>x.pass));
const start=new Date(Date.parse(proof.started)-1000),end=new Date(),functions=[product+'-ParityCommand',product+'-ParityRead','ProjectRespawn-Core-Ntgre-Contracts'],observations=[];
for(const name of functions){
 const f=await aws('lambda','get-function-configuration',{FunctionName:name});assert.equal(f.State,'Active');assert.equal(f.LastUpdateStatus,'Successful');assert.equal(Buffer.from(f.CodeSha256,'base64').toString('hex'),name.includes('Core-')?'4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf':c.zipSha256);
 const metrics={};for(const metric of ['Invocations','Errors','Throttles']){const r=await aws('cloudwatch','get-metric-statistics',{Namespace:'AWS/Lambda',MetricName:metric,Dimensions:[{Name:'FunctionName',Value:name}],StartTime:start.toISOString(),EndTime:end.toISOString(),Period:60,Statistics:['Sum']});metrics[metric]=r.Datapoints.reduce((n,x)=>n+x.Sum,0);}
 assert.ok(metrics.Invocations>0,'Metrics not yet available');assert.equal(metrics.Errors,0);assert.equal(metrics.Throttles,0);
 const group=f.LoggingConfig.LogGroup;const records=[];let next;do{const r=await aws('logs','filter-log-events',{logGroupName:group,startTime:start.getTime(),endTime:end.getTime(),...(next?{nextToken:next}:{})});for(const event of r.events??[]){
  assert.ok(!/eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(event.message),'JWT found in log');
  assert.ok(!/"(?:accessToken|refreshToken|password|SecretString)"\s*:/.test(event.message),'Sensitive field found in log');
  assert.ok(!event.message.includes('CORE_TRANSPORT_FAILURE'),'Unexpected Core transport failure during acceptance');
  let envelope;try{envelope=JSON.parse(event.message);}catch{envelope={};}let message=envelope.message??envelope;if(typeof message==='string')try{message=JSON.parse(message);}catch{message={};}
  if(message.event==='TEAM_CORE_PROOF'||message.Environment==='Ntgre'&&message.Requests===1){if(message.DependencyFailures!==undefined)assert.equal(message.DependencyFailures,0);records.push({timestamp:event.timestamp,eventId:event.eventId});}
 }if(!r.nextToken||r.nextToken===next)break;next=r.nextToken;}while(next);
 assert.ok(records.length>0);observations.push({function:name,sha256:Buffer.from(f.CodeSha256,'base64').toString('hex'),metrics,applicationLogCount:records.length,records});
}
const alarms=[];for(const prefix of [product,'ProjectRespawn-Core-Ntgre']){const r=await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:prefix});for(const a of r.MetricAlarms??[]){assert.equal(a.StateValue,'OK',a.AlarmName);alarms.push({name:a.AlarmName,state:a.StateValue});}}
const actual=(await aws('cloudformation','get-template',{StackName:'ProjectRespawn-Core-Ntgre'})).TemplateBody;assert.equal(canonical(typeof actual==='string'?JSON.parse(actual):actual),canonical(read('core-before.template')));
for(const name of [product,product+'-ReadProofSecurity'])assert.equal((await aws('cloudformation','describe-stacks',{StackName:name})).Stacks[0].StackStatus,'UPDATE_COMPLETE');
save('observability',{at:new Date().toISOString(),complete:true,window:{start:start.toISOString(),end:end.toISOString()},observations,alarms,logPrivacy:'PASS',coreTemplateUnchanged:true,authority:'LEGACY_WRITER',normalWritesEnabled:false});console.log(JSON.stringify({complete:true,observations:observations.map(x=>({function:x.function,metrics:x.metrics,logs:x.applicationLogCount})),alarms:alarms.length}));
