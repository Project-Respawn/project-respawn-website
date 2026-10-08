import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
export {read,digest} from './read-only.mjs';
import {read,digest} from './read-only.mjs';
export const E='docs/architecture/team-hub-2b4-evidence-2026-10-06';
export const save=(n,v)=>fs.writeFileSync(`${E}/${n}.json`,JSON.stringify(v,null,2)+'\n');
export const prior=read('docs/architecture/team-hub-2b3-direct-protection-evidence-2026-10-05/after.json');
const report=fs.readFileSync('docs/architecture/team-hub-2b3-direct-legacy-recovery-protection.md','utf8');
export const targets=prior.backups.map(b=>{const model=b.model,sourceName=`${model}-dxb2tdlulrch7hj2pts2mfijia-NONE`,sourceArn=`arn:aws:dynamodb:eu-north-1:058264289478:table/${sourceName}`,name=`ProjectRespawn-TeamHub-Ntgre-RestoreTest-${model}-20261005`;assert.equal(b.SourceTableDetails.TableArn,sourceArn);assert.ok(report.includes(b.BackupDetails.BackupArn));return {model,sourceName,sourceArn,backupArn:b.BackupDetails.BackupArn,backupName:b.BackupDetails.BackupName,name,arn:`arn:aws:dynamodb:eu-north-1:058264289478:table/${name}`};});
assert.deepEqual(targets.map(t=>t.model).sort(),['PlayerChampionPoolEntry','Team','TeamMembership','TeamRosterSlot']);
export function guardWrite(action,args){
 if(action==='restore-table-from-backup'){assert.equal(args.length,4);assert.equal(args[0],'--backup-arn');assert.equal(args[2],'--target-table-name');assert.ok(targets.some(t=>t.backupArn===args[1]&&t.name===args[3]),'Restore pair outside approved scope');}
 else if(action==='delete-table'){assert.equal(args.length,2);assert.equal(args[0],'--table-name');assert.ok(targets.some(t=>t.name===args[1]),'Delete outside temporary targets');}
 else if(action==='update-table'){assert.equal(args.length,3);assert.equal(args[0],'--table-name');assert.equal(args[2],'--no-deletion-protection-enabled');assert.ok(targets.some(t=>t.name===args[1]),'Protection update outside temporary targets');}
 else throw Error('Write operation not authorized');
}
export function guardCleanup(target,table,receipt,passes){assert.equal(table.TableName,target.name);assert.equal(table.TableArn,target.arn);assert.equal(receipt.table.TableArn,target.arn);assert.equal(table.TableId,receipt.table.TableId);assert.ok(table.TableId);assert.equal(table.CreationDateTime,receipt.table.CreationDateTime);assert.equal(receipt.table.RestoreSummary?.SourceBackupArn,target.backupArn);assert.equal(receipt.table.RestoreSummary?.SourceTableArn,target.sourceArn);if(table.RestoreSummary){assert.equal(table.RestoreSummary.SourceBackupArn,target.backupArn);assert.equal(table.RestoreSummary.SourceTableArn,target.sourceArn);assert.equal(table.RestoreSummary.RestoreInProgress,false);}assert.equal(table.TableStatus,'ACTIVE');assert.ok((table.GlobalSecondaryIndexes??[]).every(g=>g.IndexStatus==='ACTIVE'));assert.equal(passes.length,2);assert.ok(passes.every(p=>p.complete&&p.count===0));}
const exec=promisify(execFile);
const names=new Set(targets.flatMap(t=>[t.name,t.sourceName]));
const arns=new Set(targets.flatMap(t=>[t.arn,t.sourceArn]));
export async function aws(service,action,...args){
 const value=k=>args[args.indexOf(k)+1];
 if(service==='dynamodb'){
  if(['restore-table-from-backup','delete-table','update-table'].includes(action))throw Error('Gate 3 source verifier is read-only');
  else if(['describe-table','describe-continuous-backups','describe-time-to-live','scan'].includes(action)){assert.ok(names.has(value('--table-name')));if(action==='scan'){assert.equal(value('--select'),'COUNT');assert.ok(args.includes('--consistent-read'));}}
  else if(action==='describe-backup')assert.ok(targets.some(t=>t.backupArn===value('--backup-arn')));
  else if(['list-tags-of-resource','get-resource-policy'].includes(action))assert.ok(arns.has(value('--resource-arn')));
  else throw Error('DynamoDB action outside gate');
 }else if(service==='sts')assert.equal(action,'get-caller-identity');
 else if(service==='iam'){assert.equal(action,'simulate-principal-policy');assert.equal(value('--policy-source-arn'),'arn:aws:iam::058264289478:user/RavenTest');}
 else throw Error('AWS service outside gate');
 try{const {stdout}=await exec('aws',[service,action,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:20e6,env:{...process.env,AWS_MAX_ATTEMPTS:'1'}});return stdout.trim()?JSON.parse(stdout):{};}catch(e){const code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1]??'COMMAND_FAILED';const err=new Error(`${service} ${action}: ${code}`);err.code=code;throw err;}
}
export async function identity(){const i=await aws('sts','get-caller-identity');assert.equal(i.Account,'058264289478');assert.equal(i.Arn,'arn:aws:iam::058264289478:user/RavenTest');return i;}
export async function count(name){const passes=[];for(let i=0;i<2;i++){let key,count=0,pages=0,readUnits=0;do{const args=['--table-name',name,'--consistent-read','--select','COUNT','--limit','100','--return-consumed-capacity','TOTAL','--no-paginate'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const p=await aws('dynamodb','scan',...args);count+=p.Count;pages++;readUnits+=p.ConsumedCapacity?.CapacityUnits??0;key=p.LastEvaluatedKey;}while(key&&Object.keys(key).length);passes.push({count,pages,readUnits,complete:true,stronglyConsistent:true});}return passes;}
const sort=x=>[...(x??[])].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
export const structure=t=>({keys:sort(t.KeySchema),attributes:sort(t.AttributeDefinitions),gsis:(t.GlobalSecondaryIndexes??[]).map(g=>({name:g.IndexName,keys:sort(g.KeySchema),projection:g.Projection})).sort((a,b)=>a.name.localeCompare(b.name)),lsis:(t.LocalSecondaryIndexes??[]).map(g=>({name:g.IndexName,keys:sort(g.KeySchema),projection:g.Projection})).sort((a,b)=>a.name.localeCompare(b.name)),encryption:t.SSEDescription??{type:'AWS_OWNED_DEFAULT'},billing:t.BillingModeSummary?.BillingMode??'PROVISIONED',tableClass:t.TableClassSummary?.TableClass??'STANDARD'});
export async function metadata(name){const table=(await aws('dynamodb','describe-table','--table-name',name)).Table;const [pitr,ttl,tags]=await Promise.all([aws('dynamodb','describe-continuous-backups','--table-name',name),aws('dynamodb','describe-time-to-live','--table-name',name),aws('dynamodb','list-tags-of-resource','--resource-arn',table.TableArn)]);return {table,pitr:pitr.ContinuousBackupsDescription,ttl:ttl.TimeToLiveDescription,tags:tags.Tags??[]};}
export async function absent(name){try{await aws('dynamodb','describe-table','--table-name',name);return false;}catch(e){if(e.code==='ResourceNotFoundException')return true;throw e;}}
