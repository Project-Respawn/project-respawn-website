import test from 'node:test';import assert from 'node:assert/strict';import {assessMetricWindow} from './metric-window.mjs';
const base={namespace:'ProjectRespawn/TeamHub',dimensions:{Environment:'Ntgre',Runtime:'command'},metric:'AuthorizationFailures',minimum:2,logsVerified:true};
test('empty early ingestion remains pending, not a zero/pass',()=>assert.deepEqual(assessMetricWindow({...base,samples:[]}),{status:'PENDING_INGESTION',observed:null}));
test('wrong dimensions cannot satisfy metric evidence',()=>assert.equal(assessMetricWindow({...base,samples:[{...base,dimensions:{Environment:'Ntgre',Runtime:'read'},sum:20,complete:true}]}).status,'PENDING_INGESTION'));
test('eventual complete metric plus correlated logs satisfies signal but not exact invocation count',()=>{const r=assessMetricWindow({...base,samples:[{...base,sum:3,complete:true}]});assert.equal(r.status,'OBSERVED');assert.equal(r.exactInvocationCountProven,false);});
test('deadline and absent log proof fail closed',()=>assert.equal(assessMetricWindow({...base,logsVerified:false,samples:[{...base,sum:2,complete:true}],deadlineReached:true}).status,'FAILED_MISSING_EVIDENCE'));
