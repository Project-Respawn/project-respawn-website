import assert from 'node:assert/strict';
import {aws,read,save,canonical,B,X} from './common.mjs';
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const history=read(X+'/workflow-history.json'),failed=history.events.find(x=>x.type==='TaskFailed').taskFailedEventDetails;
const r={at:new Date().toISOString(),identity,failedTask:failed,functions:[],cloudtrail:[],complete:false,awsWrites:0};
let token;
do{
 const page=await aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventSource',AttributeValue:'lambda.amazonaws.com'}],StartTime:'2026-10-09T22:07:40Z',EndTime:'2026-10-09T22:08:00Z',...(token?{NextToken:token}:{})});
 for(const item of page.Events??[]){const e=JSON.parse(item.CloudTrailEvent);if(e.requestID==='b4cc1abf-61d4-4e15-908b-8794271d85d7')r.cloudtrail.push({eventID:e.eventID,eventTime:e.eventTime,eventSource:e.eventSource,eventName:e.eventName,awsRegion:e.awsRegion,requestID:e.requestID,errorCode:e.errorCode,errorMessage:e.errorMessage,userIdentity:{type:e.userIdentity?.type,arn:e.userIdentity?.arn,principalId:e.userIdentity?.principalId,sessionIssuer:e.userIdentity?.sessionContext?.sessionIssuer},requestFunctionName:e.requestParameters?.functionName,resources:e.resources});}
 token=page.NextToken;
}while(token);
save('inspection',r);assert.equal(r.cloudtrail.length,1,'Need the exact denied CloudTrail request');
const baseline=read(B+'/inspection.json');
for(const f of baseline.functions){const live=await aws('lambda','get-function-configuration',{FunctionName:f.actual.FunctionArn});assert.equal(canonical(live),canonical(f.actual));r.functions.push({kind:f.kind,configuration:live,fullBaselineUnchanged:true});}
const installed=read(X+'/installed.json');assert.ok(!installed.role.PermissionsBoundary);r.failedRoleHadBoundary=false;r.policy=installed.policy;r.policyLocation='RecoveryRole inline FixedTwoFunctionRecovery Statement[3] (zero based)';
for(const [service,action,input,expected]of [['iam','get-role',{RoleName:installed.role.RoleName},'NoSuchEntity'],['stepfunctions','describe-state-machine',{stateMachineArn:installed.workflow.stateMachineArn},'StateMachineDoesNotExist']]){let error;try{await aws(service,action,input);}catch(e){error=e.message;}assert.ok(error?.includes(expected));}
r.temporaryResourcesAbsent=true;r.complete=true;save('inspection',r);console.log(JSON.stringify({complete:true,cloudtrail:r.cloudtrail,functionsUnchanged:r.functions.length}));
