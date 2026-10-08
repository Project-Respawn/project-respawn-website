import test from 'node:test';import assert from 'node:assert/strict';
import {teamEntryGuard} from '../../src/features/team-hub/services/route-access.mjs';
test('Team navigation waits for the owner authorization result',async()=>{let checked;const guard=teamEntryGuard(async slug=>{checked=slug;});assert.equal(await guard({params:{teamSlug:'native-alpha'}}),true);assert.equal(checked,'native-alpha');});
for(const error of ['FORBIDDEN','DEPENDENCY_UNAVAILABLE','UNAUTHENTICATED'])test(error+' redirects without an uncaught rejection or Team-page access',async()=>{const guard=teamEntryGuard(async()=>{throw Error(error);});assert.deepEqual(await guard({params:{teamSlug:'native-alpha'}}),{path:'/team-hub',query:{denied:'1'}});});
