import fs from 'node:fs';import assert from 'node:assert/strict';import {aws,identity,E} from './aws.mjs';import {logArn} from './policies.mjs';
await identity();const read=n=>JSON.parse(fs.readFileSync(`${E}/${n}.json`)),save=(n,v)=>fs.writeFileSync(`${E}/${n}.json`,JSON.stringify(v,null,2)+'\n');
const own={Version:'2012-10-17',Statement:[{Effect:'Allow',Action:['logs:CreateLogStream','logs:PutLogEvents'],Resource:logArn+':*'}]},jobs=[];
for(const kind of ['runtime-policy','runtime-boundary']){
 const base=read(kind),without={...base,Statement:base.Statement.filter(s=>!(s.Effect==='Allow'&&[].concat(s.Action??[]).includes('logs:PutLogEvents')))};
 jobs.push({name:kind+'-own-inclusion',existing:base,next:own,expected:'PASS'},{name:kind+'-missing-own-allow-control',existing:without,next:own,expected:'FAIL'});
 const foreign={Effect:'Allow',Action:['logs:CreateLogStream','logs:PutLogEvents'],Resource:logArn.replace('/core/','/tournaments/')+':*'};
 jobs.push({name:kind+'-foreign-denied',existing:base,next:{...base,Statement:[...base.Statement,foreign]},expected:'PASS'},{name:kind+'-foreign-deny-removed-control',existing:base,next:{...base,Statement:[...base.Statement.filter(s=>!(s.Effect==='Deny'&&s.Action==='logs:*')),foreign]},expected:'FAIL'});
}
const results=[];for(const j of jobs){save(j.name+'-existing',j.existing);save(j.name+'-new',j.next);const r=await aws('accessanalyzer','check-no-new-access',['--existing-policy-document','file://'+E+'/'+j.name+'-existing.json','--new-policy-document','file://'+E+'/'+j.name+'-new.json','--policy-type','IDENTITY_POLICY']);results.push({name:j.name,expected:j.expected,...r,pass:r.result===j.expected});save('logging-review',{at:new Date().toISOString(),results,rawSimulationPreserved:true,liveLogging:false,awsWrites:0});assert.equal(r.result,j.expected,j.name);}
console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.pass).length,liveLogging:false}));
