import assert from 'node:assert/strict';
import {aws,read,save,pins,expiry,dir} from './common.mjs';
pins();const time=expiry(),g=read(dir+'/security-execution-gate.json');assert.equal(g.ready,true);
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Arn,g.identity.Arn);
const cs=await aws('cloudformation','describe-change-set','--change-set-name',g.changeSet);assert.equal(cs.Status,'CREATE_COMPLETE');assert.equal(cs.ExecutionStatus,'AVAILABLE');assert.equal(cs.Changes.length,4);assert.ok(cs.Changes.every(c=>c.ResourceChange.Action==='Add'));
await aws('cloudformation','execute-change-set','--change-set-name',g.changeSet,'--no-disable-rollback','--client-request-token','team-hub-security-3e5a12edf9074bb8-20261005');save('security-executed',{at:new Date().toISOString(),time,changeSet:g.changeSet,rollbackEnabled:true});console.log('Security change set executed with rollback enabled; monitor to terminal state.');
