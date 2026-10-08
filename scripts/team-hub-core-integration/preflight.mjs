import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws,identity} from '../core-2b5a/aws.mjs';
import {pin} from '../core-live/aws.mjs';
export const E='docs/architecture/team-hub-core-integration-evidence-2026-10-07';
fs.mkdirSync(E,{recursive:true});
const write=(name,value)=>fs.writeFileSync(`${E}/${name}.json`,JSON.stringify(value,null,2)+'\n');
pin();const who=await identity();write('identity',who);
for(const [key,name] of [['product','ProjectRespawn-TeamHub-Ntgre'],['security','ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity'],['core','ProjectRespawn-Core-Ntgre']]){
 const s=(await aws('cloudformation','describe-stacks',['--stack-name',name])).Stacks[0];assert.ok(['CREATE_COMPLETE','UPDATE_COMPLETE'].includes(s.StackStatus));
 const template=(await aws('cloudformation','get-template',['--stack-name',name,'--template-stage','Original'])).TemplateBody;
 write(key+'-before.template',typeof template==='string'?JSON.parse(template):template);
 write(key+'-before',{stackId:s.StackId,status:s.StackStatus,role:s.RoleARN,disableRollback:s.DisableRollback,updated:s.LastUpdatedTime,outputs:s.Outputs});
 if(key==='product'){
  const resources=(await aws('cloudformation','list-stack-resources',['--stack-name',name])).StackResourceSummaries;write('resources-before',resources.map(r=>({logicalId:r.LogicalResourceId,type:r.ResourceType,id:r.PhysicalResourceId,status:r.ResourceStatus})));
  for(const r of resources.filter(r=>r.ResourceType==='AWS::Lambda::Function')){const f=await aws('lambda','get-function-configuration',['--function-name',r.PhysicalResourceId]);write(r.LogicalResourceId+'-before',{name:f.FunctionName,role:f.Role,sha:f.CodeSha256,state:f.State,environment:f.Environment?.Variables});}
 }
}
console.log(JSON.stringify({identity:who.Arn,preflight:'PASS',awsWrites:0}));
