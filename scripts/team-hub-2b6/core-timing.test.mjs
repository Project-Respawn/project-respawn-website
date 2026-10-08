import test from 'node:test';import assert from 'node:assert/strict';
import {waitForIssueTime} from './core-timing.mjs';
import {realCore} from '../../domains/team-hub/cutover/core-client.mjs';
const actor={issuer:'fixture',subject:'fixture'};
function setup(delta){let time=1000997;const result={ok:true,data:{contractVersion:'authorization.decision.v1',subject:actor.subject,environment:'Ntgre',capability:'teams.admin',allowed:false,decisionVersion:1,evaluatedAt:1001+delta,expiresAt:1006+delta}};const waits=[];return {result,waits,client:realCore({actor,environment:{environment:'Ntgre'},accessToken:'fixture',clock:()=>Math.floor(time/1000),invoke:async()=>waitForIssueTime(result,{now:()=>time,sleep:async ms=>{waits.push(ms);time+=ms;}})})};}
test('laptop 3ms behind issue boundary waits, preserves DENY and original five-second expiry',async()=>{const f=setup(0),before=structuredClone(f.result);assert.equal(await f.client.allows(actor,'teams.admin'),false);assert.deepEqual(f.waits,[3]);assert.deepEqual(f.result,before);});
test('larger future clock discrepancy still fails closed without waiting',async()=>{const f=setup(2);await assert.rejects(f.client.allows(actor,'teams.admin'),/DEPENDENCY_UNAVAILABLE/);assert.deepEqual(f.waits,[]);});
test('expired decision remains rejected',async()=>{const f=setup(-10);await assert.rejects(f.client.allows(actor,'teams.admin'),/DEPENDENCY_UNAVAILABLE/);assert.deepEqual(f.waits,[]);});
test('malformed response remains unchanged for strict downstream validation',async()=>{const r={ok:true,data:{evaluatedAt:'1001'}};assert.equal(await waitForIssueTime(r,{sleep:()=>assert.fail()}),r);});
