import assert from 'node:assert/strict';
import {identity,targets,absent,read,save,E} from './common.mjs';
const who=await identity();assert.equal(read(E+'/cleanup-requests.json').complete,true);const tables=[];
for(const t of targets)tables.push({name:t.name,arn:t.arn,absent:await absent(t.name)});
save('cleanup-absence',{at:new Date().toISOString(),identity:who,tables,allAbsent:tables.every(t=>t.absent),remaining:tables.filter(t=>!t.absent).length});console.log(JSON.stringify({tables,allAbsent:tables.every(t=>t.absent)}));
