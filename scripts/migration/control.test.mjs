import test from 'node:test';
import assert from 'node:assert/strict';
import {read,ledgerPath,validateLedger} from './ledger.mjs';
const original=read(ledgerPath);
test('complete ledger reconciles unique recursive resources and protected identities',()=>{const c=validateLedger(original);assert.equal(c.total,2621);assert.equal(c.assigned+c.unassigned+c.unresolvedShared,c.total);assert.equal(c.stateful,61);assert.equal(c.protected,62);assert.equal(c.migrated,0);assert.equal(c.retired,0);});
for(const [name,mutate] of [
 ['missing record',l=>l.resources.pop()],
 ['duplicate identity',l=>l.resources[1]=l.resources[0]],
 ['invented resource',l=>l.resources[0].resourceId='invented'],
 ['uncontrolled owner',l=>l.resources[0].futureOwner='GUESS'],
 ['changed physical identity',l=>l.resources[0].physicalId='changed'],
 ['erased protected status',l=>l.resources.find(r=>r.protected).protected=false],
 ['exposed API key',l=>l.resources.find(r=>r.resourceType==='AWS::AppSync::ApiKey').physicalId='secret-value'],
 ['migration without evidence',l=>l.resources[0].migrationStatus='MIGRATED'],
 ['retirement without authorization',l=>l.resources[0].retirementStatus='AUTHORIZED']
])test('reject '+name,()=>{const l=structuredClone(original);mutate(l);assert.throws(()=>validateLedger(l));});
