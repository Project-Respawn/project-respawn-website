import assert from 'node:assert/strict';
import {aws,read,save,digest,audit} from './read-only.mjs';
const before=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/all-table-protection-before.json');
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
let next=0;const tables=[];
await Promise.all(Array.from({length:3},async()=>{while(next<before.tables.length){const r=before.tables[next++];const [t,p]=await Promise.all([aws('dynamodb','describe-table','--table-name',r.table),aws('dynamodb','describe-continuous-backups','--table-name',r.table)]);tables.push({table:r.table,arn:t.Table.TableArn,deletionProtection:t.Table.DeletionProtectionEnabled??false,pitr:p.ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,identityDigest:digest({key:t.Table.KeySchema,attributes:t.Table.AttributeDefinitions,gsis:t.Table.GlobalSecondaryIndexes?.map(g=>({name:g.IndexName,key:g.KeySchema,projection:g.Projection})),stream:t.Table.LatestStreamArn})});}}));
tables.sort((a,b)=>a.table.localeCompare(b.table));assert.deepEqual(tables,before.tables);
save('all-table-protection-after',{at:new Date().toISOString(),identity,tables,unchanged:true,audit});console.log(JSON.stringify({tables:tables.length,unchanged:true,audit}));
