import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {executionPolicy,target,fixtureApiId} from './model.mjs';
import {bindSteadyState} from './bind-steady-state.mjs';
const dir='docs/architecture/team-hub-2b2-security-correction-evidence-2026-10-05',read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=read(dir+'/manifest.json'),inventory=read(dir+'/inventory.json'),original=read(m.originalSecurityTemplate.path),first=read(dir+'/first-create-security.template.json'),steady=read(dir+'/steady-state-security.template.json');
test('security-only change preserves every original input, product byte and runtime boundary',()=>{
 const r=read('infrastructure/domains/team-hub/.build/offline-1791205212119/receipt.json');for(const x of [...r.inputs,...r.templates,...r.closure.flatMap(c=>c.outputs)])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(x.path)).digest('hex'),x.sha256,x.path);
 assert.deepEqual(first.Resources.PreviewBoundary,original.Resources.PreviewBoundary);
 assert.deepEqual(Object.keys(first.Resources),Object.keys(original.Resources));
 assert.deepEqual(first.Resources.ExecutionRole.Properties.AssumeRolePolicyDocument,original.Resources.ExecutionRole.Properties.AssumeRolePolicyDocument);
});
test('all non-API execution statements remain identical',()=>{
 const prior=original.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument.Statement.slice(2);
 for(const name of ['first-create-policy','steady-state-fixture-policy'])assert.deepEqual(read(dir+'/'+name+'.json').Statement.slice(3),prior);
});
test('managed documents fit IAM limits and boundary equals execution identity',()=>{
 for(const name of ['first-create-policy','steady-state-fixture-policy','deployment-caller-policy'])assert.ok(JSON.stringify(read(dir+'/'+name+'.json')).length<=6144);
 for(const t of [first,steady])assert.deepEqual(t.Resources.ExecutionBoundary.Properties.PolicyDocument,t.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument);
});
test('protected/invalid API and missing expiry fail closed',()=>{
 const base=original.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument;
 for(const id of ['msipnwy39j','*','${Anything}'])assert.throws(()=>executionPolicy(base,{state:'STEADY_STATE',protectedIds:inventory.protectedIds,apiId:id}));
 assert.throws(()=>executionPolicy(base,{state:'FIRST_CREATE',protectedIds:inventory.protectedIds}));
});
const product=read(m.productTemplate.path),withBody={...m,productTemplateBody:product};
const evidence=()=>({identity:{Account:target.account},region:target.region,stack:{StackName:target.stack,StackId:`arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/test`,StackStatus:'CREATE_COMPLETE'},resources:Object.entries(product.Resources).map(([id,r])=>({LogicalResourceId:id,ResourceType:r.Type,PhysicalResourceId:r.Type==='AWS::ApiGatewayV2::Api'?'teamnew123':id})),api:{ApiId:'teamnew123',Name:target.stack,ProtocolType:'HTTP'},productTemplate:product});
test('steady binding requires pinned deployed template and owned stack/API',()=>{
 const good=bindSteadyState(steady,withBody,inventory,evidence());assert.equal(good.apiId,'teamnew123');assert.ok(!JSON.stringify(good.template).includes('${TeamHubApiId}'));assert.equal(good.awsWrites,0);
 for(const change of [e=>e.stack.StackName='production',e=>e.identity.Account='999999999999',e=>e.api.Name='Other',e=>e.productTemplate={},e=>e.resources.pop(),e=>{e.api.ApiId=fixtureApiId;e.resources.find(r=>r.LogicalResourceId==='HttpApi').PhysicalResourceId=fixtureApiId;}]){const e=evidence();change(e);assert.throws(()=>bindSteadyState(steady,withBody,inventory,e));}
});
test('steady-state transition changes only execution boundary and inline execution policy',()=>{
 const resolve=bindSteadyState(steady,withBody,inventory,evidence()).template;
 const diff=Object.keys(first.Resources).filter(k=>JSON.stringify(first.Resources[k])!==JSON.stringify(resolve.Resources[k]));assert.deepEqual(diff,['ExecutionBoundary','ExecutionRole']);
});
