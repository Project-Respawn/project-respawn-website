import assert from 'node:assert/strict';import {aws,read,save} from './aws.mjs';
const item=(await aws('dynamodb','get-item',{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true})).Item;
assert.deepEqual(item,read('docs/architecture/team-hub-config-deployment-evidence-2026-10-09/blocked-state.json').authority);
save('authority',{at:new Date().toISOString(),item,stronglyConsistent:true,unchanged:true,awsWrites:0});console.log(JSON.stringify({mode:item.mode,epoch:item.epoch,version:item.version,unchanged:true}));
