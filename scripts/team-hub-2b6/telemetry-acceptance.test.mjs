import test from 'node:test';
import assert from 'node:assert/strict';
import { createCutoverHandler } from '../../domains/team-hub/cutover/handler.mjs';
import { metricEvent } from '../../domains/team-hub/cutover/observability.mjs';
import { environment, subjects, claims, now } from '../team-hub/tests/fixtures.mjs';

// Required behavioral acceptance, not a mock metricEvent input. No AWS calls.
async function deniedRequest({ dependencyFailure = false, coreFailure=false, mode='TARGET_WRITER', epoch=2, missingAuthority=false, success=false } = {}) {
  const events = [];
  const control = { PK:'CONTROL#AUTHORITY', SK:'STATE', schemaVersion:'team-hub-authority.v1',
    mode, epoch:2, version:2, changedAt:'2026-10-07T00:00:00Z',
    changedBy:'OFFLINE_TEST_ONLY', gateDigest:'a'.repeat(64) };
  const transport = {
    get: async p => {
      if (p.Key.PK === 'CONTROL#AUTHORITY') return { Item:missingAuthority?undefined:control };
      if (dependencyFailure) throw Error('OFFLINE_INJECTED_DEPENDENCY_FAILURE');
      return {};
    },
    query: async () => ({ Items:[] }),
    transactWrite: async () => assert.fail('Denied request must never write'),
  };
  const invokeCore = async r => {if(coreFailure)throw Error('OFFLINE_CORE_FAILURE');return ({ ok:true, data:{ contractVersion:r.contractVersion,
    subject:subjects.player, capability:r.capability, environment:'Ntgre', allowed:false,
    decisionVersion:1, evaluatedAt:now, expiresAt:now+5 } });};
  const handler = createCutoverHandler({ runtime:success?'read':'command', transport, invokeCore, environment,
    cursorSecret:'offline-only-synthetic-cursor-material', clock:() => now, log:e => events.push(e) });
  const response = await handler({ routeKey:success?'GET /v1/teams':'POST /v1/teams',
    headers:{ authorization:'Bearer player', ...(epoch===null?{}:{'x-team-authority-epoch':String(epoch)}) },
    ...(success?{}:{body:JSON.stringify({ slug:'offline-denied', name:'Denied', gameKey:'LEAGUE_OF_LEGENDS', idempotencyKey:'offline-denial' })}),
    requestContext:{ requestId:'offline-telemetry-check', authorizer:{ jwt:{ claims:claims('player') } } } });
  return { response, events, metrics:events.map(e => metricEvent('command', e, now*1000)) };
}

test('Gate D: actual forbidden handler response emits one authorization failure', async () => {
  const r = await deniedRequest();
  assert.equal(r.response.statusCode, 403);
  assert.equal(JSON.parse(r.response.body).error.code, 'FORBIDDEN');
  assert.equal(r.metrics.reduce((n,e) => n+e.Requests, 0), 1);
  assert.equal(r.metrics.reduce((n,e) => n+e.AuthorizationFailures, 0), 1);
});

test('Core transport failure produces one dependency request and one distinct Core signal',async()=>{
 const r=await deniedRequest({coreFailure:true});assert.equal(r.response.statusCode,503);
 assert.equal(r.metrics.reduce((n,e)=>n+e.CoreDependencyFailures,0),1);
 assert.equal(r.metrics.reduce((n,e)=>n+e.DependencyFailures,0),1);
 assert.equal(r.metrics.reduce((n,e)=>n+e.Requests,0),1);
});
test('successful read has exactly one request and no failure counters',async()=>{
 const r=await deniedRequest({success:true});assert.equal(r.response.statusCode,200);
 assert.equal(r.metrics.reduce((n,e)=>n+e.Requests,0),1);
 for(const m of r.metrics)for(const k of ['AuthorizationFailures','DependencyFailures','CoreDependencyFailures','WriterNotAuthoritative','AuthorityUnavailable','AuthorityEpochMismatch','TransactionConflicts'])assert.equal(m[k],0,k);
});
for(const mode of ['LEGACY_WRITER','FROZEN'])test(mode+' denial is distinctly observable without granting writes',async()=>{
 const r=await deniedRequest({mode});assert.equal(r.response.statusCode,403);
 assert.equal(r.metrics.reduce((n,e)=>n+e.WriterNotAuthoritative,0),1);
 assert.equal(r.metrics.reduce((n,e)=>n+e.Requests,0),1);
});
for(const epoch of [null,1,3])test('missing/stale/future epoch '+epoch+' emits mismatch',async()=>{
 const r=await deniedRequest({epoch});assert.equal(r.response.statusCode,409);
 assert.equal(r.metrics.reduce((n,e)=>n+e.AuthorityEpochMismatch,0),1);
});
test('missing authority remains 503 and emits authority-unavailable',async()=>{
 const r=await deniedRequest({missingAuthority:true});assert.equal(r.response.statusCode,503);
 assert.equal(r.metrics.reduce((n,e)=>n+e.AuthorityUnavailable,0),1);
 assert.equal(r.metrics.reduce((n,e)=>n+e.DependencyFailures,0),1);
});
test('repeated handler requests count exactly once per invocation offline',async()=>{
 const all=[];for(let i=0;i<4;i++)all.push(...(await deniedRequest()).metrics);
 assert.equal(all.reduce((n,e)=>n+e.Requests,0),4);
 assert.equal(all.reduce((n,e)=>n+e.AuthorizationFailures,0),4);
});
test('EMF dimensions stay low cardinality and private inputs are excluded',()=>{
 const value='private.person@example.invalid';
 const m=metricEvent(value,{event:'TEAM_REQUEST',code:'FORBIDDEN',requestId:value,operation:value,accessToken:value,subject:value,privateNote:value,body:value},now*1000);
 assert.ok(!JSON.stringify(m).includes(value));assert.equal(m.Runtime,'unknown');
 assert.equal(m._aws.Timestamp,now*1000);
 assert.equal(m._aws.CloudWatchMetrics[0].Namespace,'ProjectRespawn/TeamHub');
 assert.deepEqual(m._aws.CloudWatchMetrics[0].Dimensions,[['Environment','Runtime']]);
 assert.ok(!m._aws.CloudWatchMetrics[0].Metrics.some(x=>x.Name==='requestId'));
});

test('Gate D: actual inner dependency failure emits one dependency failure', async () => {
  const r = await deniedRequest({ dependencyFailure:true });
  assert.equal(r.response.statusCode, 503);
  assert.equal(JSON.parse(r.response.body).error.code, 'DEPENDENCY_UNAVAILABLE');
  assert.equal(r.metrics.reduce((n,e) => n+e.Requests, 0), 1);
  assert.equal(r.metrics.reduce((n,e) => n+e.DependencyFailures, 0), 1);
});
