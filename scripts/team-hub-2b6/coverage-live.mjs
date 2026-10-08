import assert from 'node:assert/strict';
import {aws,read,save,digest,audit} from './coverage-read.mjs';
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');save('identity',{at:new Date().toISOString(),identity,region:'eu-north-1'});
const inventory=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/table-inventory.json');
const tableArns=inventory.tables.map(t=>t.table.TableArn),bucket=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/logo-inventory.json').bucket;
const targets=[...tableArns,...tableArns.map(a=>a+'/index/*'),'arn:aws:s3:::'+bucket+'/team-logos/example.png'];
const resolverEvidence=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/resolver-coverage.json');
targets.push(...resolverEvidence.resolvers.map(r=>'arn:aws:appsync:eu-north-1:058264289478:apis/'+resolverEvidence.api+'/types/'+r.type+'/fields/'+r.field),read('docs/architecture/team-hub-2b3-evidence-2026-10-05/live-consumers.json').lambda);
targets.push(...inventory.tables.map(t=>t.table.LatestStreamArn).filter(Boolean));
targets.push(...read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/reader-edges.json').subscriptionResolvers.map(r=>'arn:aws:appsync:eu-north-1:058264289478:apis/'+resolverEvidence.api+'/types/Subscription/fields/'+r.field));
const list=x=>x==null?[]:Array.isArray(x)?x:[x];
const match=(pattern,value)=>new RegExp('^'+pattern.replace(/[.+^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*').replaceAll('?','.')+'$','i').test(value);
const actions=['dynamodb:GetItem','dynamodb:Query','dynamodb:Scan','dynamodb:BatchGetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:BatchWriteItem','dynamodb:PartiQLSelect','dynamodb:PartiQLInsert','dynamodb:PartiQLUpdate','dynamodb:PartiQLDelete','s3:GetObject','s3:PutObject','s3:DeleteObject'];
actions.push('appsync:GraphQL','lambda:InvokeFunction');
actions.push('dynamodb:GetRecords','dynamodb:GetShardIterator','dynamodb:DeleteTable','dynamodb:UpdateTable','dynamodb:ExportTableToPointInTime');
try{
 const details=await aws('iam','get-account-authorization-details');
 const policies=new Map((details.Policies??[]).map(p=>[p.Arn,p.PolicyVersionList?.find(v=>v.IsDefaultVersion)?.Document]));
 const groups=new Map((details.GroupDetailList??[]).map(g=>[g.GroupName,g]));
 const docs=p=>[...list(p.RolePolicyList),...list(p.UserPolicyList),...list(p.GroupPolicyList)].map(v=>({name:v.PolicyName,document:v.PolicyDocument})).concat(list(p.AttachedManagedPolicies).map(v=>({name:v.PolicyArn,document:policies.get(v.PolicyArn)})));
 const principals=[];let missingPolicyDocuments=0;
 for(const p of [...details.RoleDetailList??[],...details.UserDetailList??[]]){
  const documents=docs(p).concat(list(p.GroupList).flatMap(g=>docs(groups.get(g)??{})));
  const missing=documents.filter(d=>!d.document);missingPolicyDocuments+=missing.length;
  const grants=[];for(const d of documents)for(const s of list(d.document?.Statement))if(s.Effect==='Allow'){
   const relevantActions=actions.filter(a=>s.Action?list(s.Action).some(x=>match(x,a)):s.NotAction?!list(s.NotAction).some(x=>match(x,a)):false);
   const relevantTargets=targets.filter(a=>relevantActions.some(action=>a.startsWith('arn:aws:'+action.split(':')[0]+':'))&&(s.Resource?list(s.Resource).some(x=>match(x.replace(/\$\{[^}]+\}/g,'*'),a)):s.NotResource?!list(s.NotResource).some(x=>match(x,a)):false));
   if(relevantActions.length&&relevantTargets.length)grants.push({policy:d.name,actions:relevantActions,resources:relevantTargets,resourcePatterns:s.Resource??null,notResource:s.NotResource??null,conditions:s.Condition??null,statementDigest:digest(s)});
  }
  const admin=documents.some(d=>list(d.document?.Statement).some(s=>s.Effect==='Allow'&&list(s.Action).some(a=>['*','iam:*','iam:PutRolePolicy','iam:AttachRolePolicy','iam:CreatePolicyVersion','iam:PutUserPolicy'].includes(a))));
  if(grants.length||admin||missing.length)principals.push({arn:p.Arn,kind:p.RoleName?'ROLE':'USER',trust:p.AssumeRolePolicyDocument??null,boundary:p.PermissionsBoundary??null,grants,administrationCapability:admin,missingPolicyDocuments:missing.map(d=>d.name),evaluation:'Conservative potential authority; conditions/denies/boundaries/session policies may narrow it. Not an effective-permission simulation.'});
 }
 save('iam-coverage',{at:new Date().toISOString(),identity,rolesEnumerated:details.RoleDetailList?.length??0,usersEnumerated:details.UserDetailList?.length??0,groupsEnumerated:details.GroupDetailList?.length??0,policiesEnumerated:details.Policies?.length??0,paginationCompleted:!details.IsTruncated,missingPolicyDocuments,principals,rootPrincipal:'arn:aws:iam::058264289478:root',scope:'Account IAM metadata filtered to potential exact Ntgre Team data or IAM administration; no production business operation',audit});
 console.log(JSON.stringify({stage:'iam',principals:principals.length,missingPolicyDocuments}));
}catch(e){save('iam-coverage',{complete:false,blocker:e.message,audit});}
if(process.argv.includes('--iam-only'))process.exit(0);
const end=new Date();end.setUTCMinutes(0,0,0);const start=new Date(end.getTime()-7*24*3600e3);
const metrics=[];for(const t of inventory.tables)for(const name of ['ConsumedWriteCapacityUnits','ConsumedReadCapacityUnits']){
 try{const r=await aws('cloudwatch','get-metric-statistics','--namespace','AWS/DynamoDB','--metric-name',name,'--dimensions','Name=TableName,Value='+t.table.TableName,'--start-time',start.toISOString(),'--end-time',end.toISOString(),'--period','3600','--statistics','Sum');metrics.push({model:t.model,metric:name,datapoints:r.Datapoints.length,sum:r.Datapoints.reduce((n,d)=>n+d.Sum,0),nonzeroHours:r.Datapoints.filter(d=>d.Sum>0).map(d=>({at:d.Timestamp,sum:d.Sum})),complete:true});}catch(e){metrics.push({model:t.model,metric:name,complete:false,error:e.message});}
}
save('traffic',{at:new Date().toISOString(),window:{start:start.toISOString(),end:end.toISOString(),periodSeconds:3600},metrics,limits:['Capacity metrics are not operation/audit counts; include verification reads and possible non-business usage.','Absent datapoints are not zero traffic. No never-used claim.'],audit});
try{const trails=(await aws('cloudtrail','describe-trails','--include-shadow-trails')).trailList??[];const selectors=[];for(const trail of trails){if(trail.HomeRegion!=='eu-north-1'){selectors.push({arn:trail.TrailARN,homeRegion:trail.HomeRegion,inspected:false,reason:'Outside regional task scope'});continue;}const [s,status]=await Promise.all([aws('cloudtrail','get-event-selectors','--trail-name',trail.TrailARN),aws('cloudtrail','get-trail-status','--name',trail.TrailARN)]);selectors.push({arn:trail.TrailARN,selectors:s,status:{isLogging:status.IsLogging,latestDelivery:status.LatestDeliveryTime}});}const stores=await aws('cloudtrail','list-event-data-stores');save('cloudtrail-coverage',{at:new Date().toISOString(),trails:selectors,eventDataStores:(stores.EventDataStores??[]).map(s=>({arn:s.EventDataStoreArn,status:s.Status,selectors:s.AdvancedEventSelectors})),limits:['LookupEvents is management-event history, not evidence that DynamoDB/S3 data events never occurred.','No raw audit payload, object content or customer identities persisted.'],audit});}catch(e){save('cloudtrail-coverage',{complete:false,error:e.message,audit});}
const fn=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/live-consumers.json').lambda;
try{const buses=(await aws('events','list-event-buses')).EventBuses;const results=[];for(const bus of buses){const r=await aws('events','list-rule-names-by-target','--event-bus-name',bus.Name,'--target-arn',fn);results.push({bus:bus.Name,rules:r.RuleNames});}const schedules=(await aws('scheduler','list-schedules')).Schedules??[];save('schedule-coverage',{at:new Date().toISOString(),buses:results,schedulesEnumerated:schedules.length,matchingSchedules:schedules.filter(s=>s.Target?.Arn===fn).map(s=>({name:s.Name,group:s.GroupName,target:s.Target.Arn,state:s.State})),indirectSchedules:schedules.filter(s=>s.Target?.Arn?.includes('aws-sdk')).map(s=>({name:s.Name,group:s.GroupName,target:s.Target.Arn,state:s.State})),limits:['Indirect SDK/Step Functions and IAM-capable automation must be retained as possible principals, not declared absent.'],audit});}catch(e){save('schedule-coverage',{complete:false,error:e.message,audit});}
console.log(JSON.stringify({stage:'complete',audit}));
