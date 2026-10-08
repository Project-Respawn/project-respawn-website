// Read-only, allowlisted Core telemetry; never persist raw provider logs.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07';
function read(service,action,args=[]){return JSON.parse(execFileSync('aws',[service,action,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true,maxBuffer:16e6}));}
const identity=read('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const cfg=read('lambda','get-function-configuration',['--function-name','ProjectRespawn-Core-Ntgre-Contracts']);
const start='2026-10-07T17:14:00Z',end='2026-10-07T17:18:00Z',events=[];let next;
do{const page=read('logs','filter-log-events',['--log-group-name',cfg.LoggingConfig.LogGroup,'--start-time',String(Date.parse(start)),'--end-time',String(Date.parse(end)),...(next?['--next-token',next]:[])]);for(const e of page.events??[]){const offset=e.message.indexOf('{');if(offset<0)continue;try{let v=JSON.parse(e.message.slice(offset));if(typeof v.message==='string'){try{v=JSON.parse(v.message);}catch{}}else if(v.message&&typeof v.message==='object')v=v.message;if(v.Environment==='Ntgre'&&typeof v.outcome==='string')events.push({at:new Date(e.timestamp).toISOString(),outcome:v.outcome,contractVersion:v.contractVersion,durationMs:v.durationMs,requestId:v.requestId});}catch{}}next=page.nextToken;}while(next);
const metrics={};for(const metric of ['Invocations','Errors','Throttles'])metrics[metric]=read('cloudwatch','get-metric-statistics',['--namespace','AWS/Lambda','--metric-name',metric,'--dimensions','Name=FunctionName,Value=ProjectRespawn-Core-Ntgre-Contracts','--start-time',start,'--end-time',end,'--period','60','--statistics','Sum']).Datapoints;
for(const metric of ['Requests','DependencyFailures','RateLimited'])metrics['Core'+metric]=read('cloudwatch','get-metric-statistics',['--namespace','ProjectRespawn/Core','--metric-name',metric,'--dimensions','Name=Environment,Value=Ntgre','--start-time',start,'--end-time',end,'--period','60','--statistics','Sum']).Datapoints;
const result={at:new Date().toISOString(),account:identity.Account,window:{start,end},coreCodeSha256Hex:Buffer.from(cfg.CodeSha256,'base64').toString('hex'),events,metrics,awsWrites:0,rawLogsPersisted:false};
fs.writeFileSync(E+'/browser-core-diagnosis.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({events:events.length,outcomes:events.reduce((a,e)=>(a[e.outcome]=(a[e.outcome]??0)+1,a),{}),metrics}));
