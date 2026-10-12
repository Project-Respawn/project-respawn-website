import assert from 'node:assert/strict';import {canonical} from './aws.mjs';
export function validateRequest(snapshot,live,request,desired){
 assert.deepEqual(Object.keys(request).sort(),['Environment','FunctionName','RevisionId']);assert.deepEqual(Object.keys(request.Environment),['Variables']);
 assert.equal(request.FunctionName,snapshot.FunctionArn);assert.equal(request.RevisionId,snapshot.RevisionId);assert.equal(live.RevisionId,snapshot.RevisionId,'Stale revision; stop and repin, never silently refresh');
 assert.equal(canonical(live),canonical(snapshot),'Fresh complete configuration must equal reviewed snapshot');
 assert.equal(canonical(request.Environment.Variables),canonical(desired),'Submit complete desired map');assert.equal(live.State,'Active');assert.equal(live.LastUpdateStatus,'Successful');return true;
}
export function validateWindow(start,end,now){const s=Date.parse(start),e=Date.parse(end),n=Date.parse(now);assert.ok([s,e,n].every(Number.isFinite));assert.match(start,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);assert.match(end,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);assert.ok(s>=n+120000,'At least two minutes provisioning lead');assert.ok(e-s>0&&e-s<=900000,'Maximum 15 minutes');return true;}
