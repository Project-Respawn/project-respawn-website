// Transport-only isolation seam. It never edits the accepted business runtime.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const runId='20261012v1';
export const tables=Object.freeze({
 'ProjectRespawn-TeamHub-Ntgre-Operational':'ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1-Operational',
 'ProjectRespawn-TeamHub-Ntgre-Journal':'ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1-Journal'
});
export function isolatedTransport(sdk){
 const map=p=>{assert.ok(Object.hasOwn(tables,p.TableName),'Unreviewed table');return {...structuredClone(p),TableName:tables[p.TableName]};};
 return {
  get:p=>sdk.get(map(p)),query:p=>sdk.query(map(p)),
  transactWrite:p=>{
   assert.ok(Array.isArray(p.TransactItems)&&p.TransactItems.length>0&&p.TransactItems.length<=25);
   const mapped=p.TransactItems.map(action=>{const keys=Object.keys(action);assert.equal(keys.length,1);assert.ok(['Put','Delete','ConditionCheck'].includes(keys[0]));return {[keys[0]]:map(action[keys[0]])};});
   return sdk.transactWrite({...structuredClone(p),TransactItems:mapped});
  }
 };
}
export function reconcile(rows){
 const stable=v=>v&&typeof v==='object'?Array.isArray(v)?v.map(stable):Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
 const ordered=rows.map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 assert.equal(new Set(rows.map(x=>JSON.stringify([x.PK,x.SK]))).size,rows.length,'Duplicate key');
 return {count:rows.length,digest:createHash('sha256').update(JSON.stringify(ordered)).digest('hex')};
}
export function cleanupTargets(actual){
 assert.equal(actual.account,'058264289478');assert.equal(actual.region,'eu-north-1');
 assert.equal(actual.runId,runId);assert.equal(actual.tagOwner,'TeamHubIsolatedVerification');
 assert.deepEqual([...actual.tables].sort(),Object.values(tables).sort());
 return Object.values(tables); // Only returns a reviewed allowlist; performs no deletion.
}
