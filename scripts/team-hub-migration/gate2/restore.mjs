import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws,identity,targets,read,save,E,absent,count,digest} from './common.mjs';
const gate=read(E+'/execution-gate.json');assert.equal(gate.ready,true);assert.equal(digest(gate.targets),digest(targets));assert.ok(Date.now()-Date.parse(gate.at)<15*60e3,'Refresh stale gate');
const who=await identity();assert.ok(!fs.existsSync(E+'/restore-requests.json'),'Prior restore attempt exists; inspect, never duplicate');
for(const t of targets){assert.equal(await absent(t.name),true);assert.ok((await count(t.sourceName)).every(p=>p.count===0),'SOURCE NO LONGER EMPTY');}
const receipt={at:new Date().toISOString(),identity:who,requests:[],complete:false};save('restore-requests',receipt);
try{for(const t of targets){const requestedAt=new Date().toISOString();const r=await aws('dynamodb','restore-table-from-backup','--backup-arn',t.backupArn,'--target-table-name',t.name);assert.equal(r.TableDescription.TableArn,t.arn);receipt.requests.push({...t,requestedAt,returnedAt:new Date().toISOString(),table:r.TableDescription});save('restore-requests',receipt);}receipt.complete=true;save('restore-requests',receipt);console.log(JSON.stringify({restores:receipt.requests.map(r=>({name:r.name,status:r.table.TableStatus,id:r.table.TableId})),complete:true}));}catch(e){receipt.error=e.message;save('restore-requests',receipt);throw e;}
