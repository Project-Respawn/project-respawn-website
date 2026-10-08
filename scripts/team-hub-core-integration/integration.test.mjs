import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoreIntegrationHandler,proofVersion} from '../../domains/team-hub/core-integration/handler.mjs';
import {acceptedCore,validateCoreManifest} from '../../domains/team-hub/core-integration/manifest.mjs';
import {operations} from '../../domains/team-hub/contracts.mjs';
const subject='00000000-0000-0000-0000-000000000001';
const token='offline.'+Buffer.from(JSON.stringify({sub:subject,iss:acceptedCore.environmentContract.issuer,client_id:acceptedCore.environmentContract.clientId,token_use:'access',exp:2000})).toString('base64url')+'.fixture';
const request={contractVersion:proofVersion,accessToken:token,operation:'authorization'};
function fixture({admin=true,broken=false,privateField=false}={}){
 const calls=[],logs=[];
 const handler=createCoreIntegrationHandler({clock:()=>1000,log:x=>logs.push(x),invokeCore:async r=>{calls.push(r);if(broken)throw Error('private dependency detail');return {ok:true,data:r.contractVersion==='authorization.decision.v1'?{contractVersion:r.contractVersion,subject,environment:'Ntgre',capability:r.capability,allowed:r.capability==='teams.admin'&&admin,decisionVersion:1,evaluatedAt:1000,expiresAt:1005}:{contractVersion:r.contractVersion,items:[{subject,displayName:'Test',...(privateField?{email:'private@example.invalid'}:{})}]}};}});
 return {handler,calls,logs};
}
test('only the accepted same-environment pinned manifest is permitted',()=>{
 assert.equal(validateCoreManifest().lambdaArn,acceptedCore.lambdaArn);
 for(const patch of [{status:'PENDING'},{environment:'Production'},{lambdaArn:acceptedCore.lambdaArn+':other'},{productRevision:'wrong'},{runtimeSha256:'wrong'},{securityRevision:'wrong'},{invocation:'PUBLIC'},{contractVersions:[]}])assert.throws(()=>validateCoreManifest({...acceptedCore,...patch}),/NOT_ACCEPTED/);
});
for(const [op,route] of Object.entries(operations))test('normal route remains denied: '+op,async()=>{const f=fixture();const result=await f.handler({...request,routeKey:route.method+' '+route.path,requestContext:{authorizer:{jwt:{claims:{}}}}});assert.equal(result.statusCode,403);assert.equal(f.calls.length,0);});
test('admin authorization uses live adapter and preserves authority',async()=>{const f=fixture();const r=await f.handler(request);assert.equal(r.ok,true);assert.deepEqual(r.data,{teamsAdmin:true,brandingManage:false});assert.equal(r.authority,'LEGACY_WRITER');assert.equal(r.normalWritesEnabled,false);assert.equal(f.calls.length,2);assert.ok(f.calls.every(c=>c.accessToken===token&&c.environment==='Ntgre'));});
test('ordinary capability denied; ordinary directory never delegated',async()=>{const f=fixture({admin:false});assert.deepEqual((await f.handler(request)).data,{teamsAdmin:false,brandingManage:false});f.calls.length=0;const r=await f.handler({...request,operation:'search',query:'te'});assert.equal(r.error.code,'FORBIDDEN');assert.equal(f.calls.length,1);});
test('directory delegated only after global authorization and bound to proof scope',async()=>{const f=fixture();const r=await f.handler({...request,operation:'search',query:'te',limit:1});assert.equal(r.ok,true);assert.equal(f.calls[1].teamId,'team:core-integration-proof');assert.deepEqual(Object.keys(r.data.items[0]).sort(),['displayName','subject']);assert.ok(!JSON.stringify(f.logs).includes(token));});
test('unverified decoded JWT cannot grant on Core failure',async()=>{const f=fixture({broken:true});assert.equal((await f.handler(request)).error.code,'DEPENDENCY_UNAVAILABLE');assert.equal(f.calls.length,1);});
test('reject private directory response fields',async()=>{const f=fixture({privateField:true});assert.equal((await f.handler({...request,operation:'search',query:'te'})).error.code,'DEPENDENCY_UNAVAILABLE');});
test('identity and authority overrides rejected',async()=>{for(const field of ['actor','subject','teamId','authority','verification']){const f=fixture();assert.equal((await f.handler({...request,[field]:'override'})).error.code,'INVALID_INPUT');assert.equal(f.calls.length,0);}});
test('absent or invalid delegated tokens reject without grants',async()=>{for(const accessToken of [undefined,'invalid'])assert.equal((await fixture().handler({...request,accessToken})).error.code,'UNAUTHENTICATED');});
