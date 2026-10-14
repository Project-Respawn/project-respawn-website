import test from 'node:test';import assert from 'node:assert/strict';import {requireReservedConcurrency} from './guards.mjs';
for(const available of [10,100])test('reject pinned reservation when unreserved capacity is '+available,()=>assert.throws(()=>requireReservedConcurrency({AccountLimit:{UnreservedConcurrentExecutions:available}},1),/PINNED_CURSOR_PROBE_RESERVED_CONCURRENCY/));
test('101 unreserved permits a reservation of one',()=>assert.equal(requireReservedConcurrency({AccountLimit:{UnreservedConcurrentExecutions:101}},1),true));
test('missing quota evidence fails closed',()=>assert.throws(()=>requireReservedConcurrency({},1),/Missing actual/));
