import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {aws,read,save,digest,audit,E} from './read-only.mjs';
const inventory=read('docs/architecture/phase2-resource-domain-map.json');
// Match the historical inventory's code-point key ordering, not locale ordering.
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const templateDigest=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
fs.mkdirSync('.tmp/team-hub-gate1/original',{recursive:true});
for(const [from,to]of [['legacy-after','legacy-before'],['team-baseline','team-before'],['tournament-baseline','tournament-before']]){if(!fs.existsSync(`${E}/${to}.json`))fs.copyFileSync(`${E}/${from}.json`,`${E}/${to}.json`);}
const templates=[];let next=0;
await Promise.all(Array.from({length:3},async()=>{while(next<inventory.stacks.length){const s=inventory.stacks[next++];const response=await aws('cloudformation','get-template','--stack-name',s.arn,'--template-stage','Original');const template=typeof response.TemplateBody==='string'?JSON.parse(response.TemplateBody):response.TemplateBody;assert.equal(templateDigest(template),s.templateSha256,'Template drift '+s.key);fs.writeFileSync(`.tmp/team-hub-gate1/original/${s.key}.json`,JSON.stringify(template,null,2)+'\n');templates.push({key:s.key,arn:s.arn,sha256:templateDigest(template)});}}));
save('template-baseline',{at:new Date().toISOString(),identity,templates:templates.sort((a,b)=>a.key.localeCompare(b.key)),audit});
const tables=inventory.resources.filter(r=>r.type==='Custom::AmplifyDynamoDBTable'||r.type==='AWS::DynamoDB::Table');
next=0;const protections=[];
await Promise.all(Array.from({length:3},async()=>{while(next<tables.length){const r=tables[next++];const [t,p]=await Promise.all([aws('dynamodb','describe-table','--table-name',r.physicalId),aws('dynamodb','describe-continuous-backups','--table-name',r.physicalId)]);protections.push({table:r.physicalId,arn:t.Table.TableArn,deletionProtection:t.Table.DeletionProtectionEnabled??false,pitr:p.ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,identityDigest:digest({key:t.Table.KeySchema,attributes:t.Table.AttributeDefinitions,gsis:t.Table.GlobalSecondaryIndexes?.map(g=>({name:g.IndexName,key:g.KeySchema,projection:g.Projection})),stream:t.Table.LatestStreamArn})});}}));
save('all-table-protection-before',{at:new Date().toISOString(),tables:protections.sort((a,b)=>a.table.localeCompare(b.table)),audit});
console.log(JSON.stringify({templates:templates.length,tables:protections.length,audit}));
