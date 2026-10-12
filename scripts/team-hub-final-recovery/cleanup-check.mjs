import assert from 'node:assert/strict';
import {aws,read,save,E} from './aws.mjs';
const name='ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009',r={at:new Date().toISOString(),complete:false};
const stack=(await aws('cloudformation','describe-stacks',{StackName:read(E+'/created.json').stackId})).Stacks[0];
r.stackStatus=stack.StackStatus;save('cleanup',r);assert.equal(stack.StackStatus,'DELETE_COMPLETE');
for(const [key,service,action,input,expected] of [
 ['roleAbsent','iam','get-role',{RoleName:name},'NoSuchEntity'],
 ['workflowAbsent','stepfunctions','describe-state-machine',{stateMachineArn:'arn:aws:states:eu-north-1:058264289478:stateMachine:'+name},'StateMachineDoesNotExist']
]){let error;try{await aws(service,action,input);}catch(e){error=e.message;}assert.ok(error?.includes(expected),key);r[key]=true;}
r.complete=true;save('cleanup',r);console.log(JSON.stringify(r));
