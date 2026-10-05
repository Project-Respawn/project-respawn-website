// Additional readback gate for the existing pinned binder; never writes to AWS.
import assert from 'node:assert/strict';
import {bindSteadyState} from '../team-hub-Ntgre-deployment-v2/bind-steady-state.mjs';
import {read,save,previous as prior,dir} from './read-aws.mjs';
const m=read(prior+'/manifest.json'),inventory=read(prior+'/inventory.json');
const product=read(m.productTemplate.path),steady=read(dir+'/steady-state-security.template.json'),first=read(dir+'/first-create-security.template.json');
function verifiedBind(e){
 const tags=e.api.Tags;
 assert.ok(tags,'Live API tags must be read, not guessed');
 assert.equal(tags['aws:cloudformation:stack-id'],e.stack.StackId);
 assert.equal(tags['aws:cloudformation:stack-name'],m.target.stack);
 assert.equal(tags['aws:cloudformation:logical-id'],'HttpApi');
 assert.deepEqual(e.resources.map(r=>[r.LogicalResourceId,r.ResourceType]).sort(),Object.entries(product.Resources).map(([id,r])=>[id,r.Type]).sort());
 assert.ok(e.resources.every(r=>['CREATE_COMPLETE','UPDATE_COMPLETE'].includes(r.ResourceStatus)));
 return bindSteadyState(steady,{...m,productTemplateBody:product},inventory,e);
}
const stackId='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-TeamHub-Ntgre/review-fixture';
const evidence={identity:{Account:m.target.account},region:m.target.region,stack:{StackName:m.target.stack,StackId:stackId,StackStatus:'CREATE_COMPLETE'},resources:Object.entries(product.Resources).map(([id,r])=>({LogicalResourceId:id,ResourceType:r.Type,PhysicalResourceId:id==='HttpApi'?'teamnew123':id,ResourceStatus:'CREATE_COMPLETE'})),api:{ApiId:'teamnew123',Name:m.target.stack,ProtocolType:'HTTP',Tags:{'aws:cloudformation:stack-id':stackId,'aws:cloudformation:stack-name':m.target.stack,'aws:cloudformation:logical-id':'HttpApi'}},productTemplate:product};
const result=verifiedBind(evidence);
for(const mutate of [e=>delete e.api.Tags,e=>e.api.Tags['aws:cloudformation:stack-name']='production',e=>e.api.Tags['aws:cloudformation:stack-id']='wrong',e=>e.resources[0].ResourceType='AWS::S3::Bucket',e=>e.resources[0].ResourceStatus='CREATE_FAILED']){const e=structuredClone(evidence);mutate(e);assert.throws(()=>verifiedBind(e));}
const changed=Object.keys(first.Resources).filter(id=>JSON.stringify(first.Resources[id])!==JSON.stringify(result.template.Resources[id]));assert.deepEqual(changed,['ExecutionBoundary','ExecutionRole']);
assert.deepEqual(first.Resources.PreviewBoundary,result.template.Resources.PreviewBoundary);
save('lockdown-verification',{at:new Date().toISOString(),fixtureOnly:true,liveApiExists:false,originalBinderUnchanged:true,additionalReadbackGate:'Require exact CloudFormation system tags and all eleven logical IDs/types/statuses before using the pinned binder',positiveBinding:1,rejectedBadReadbacks:5,modifiedSecurityResources:changed,productResourcesModified:0,installPerformed:false,requiredFutureSequence:['Read actual API ID and stack-owned resources','Verify account/region/template, eleven identities and CloudFormation system tags','Bind exact API ID without using a protected or fixture ID','Revalidate concrete policy and inspect security-only two-resource update','Separately authorized security custodian installs with rollback enabled','Read back BOTH inline execution policy and boundary; repeat exact-ID negatives','Confirm no other broad policy/grant remains; remove or expire superseded authority','Only then continue runtime acceptance'],readyAsProcedure:true,awsWrites:0});
console.log('Lockdown readback/binding checks: PASS (1 accepted fixture, 5 rejected readbacks; no live binding or install)');

