import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {E,B,H,read,save,retryRead as aws,digest,manifest} from './tagging-live-common.mjs';
const post=process.argv[2]==='post',r={at:new Date().toISOString(),awsWrites:0,tables:[],sourcePolicies:[]};
const prior=read(B+'/read-only-preflight.json');
for(const source of prior.sources){
 const t=(await aws('dynamodb','describe-table',{TableName:source.name})).Table;
 assert.equal(t.TableId,source.tableId);assert.equal(t.TableStatus,'ACTIVE');assert(t.DeletionProtectionEnabled);
 const p=(await aws('dynamodb','describe-continuous-backups',{TableName:source.name})).ContinuousBackupsDescription;assert.equal(p.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');
 const b=(await aws('dynamodb','describe-backup',{BackupArn:source.backupArn})).BackupDescription;assert.equal(b.BackupDetails.BackupStatus,'AVAILABLE');assert.equal(b.SourceTableDetails.TableId,t.TableId);assert.equal(b.SourceTableDetails.TableArn,t.TableArn);
 let key,rows=[];do{const page=await aws('dynamodb','scan',{TableName:source.name,ConsistentRead:true,...(key?{ExclusiveStartKey:key}:{})});rows.push(...page.Items);key=page.LastEvaluatedKey;}while(key&&Object.keys(key).length);
 assert.equal(rows.length,source.count,'SOURCE_COUNT_DRIFT '+source.model);
 r.tables.push({model:source.model,tableId:t.TableId,count:rows.length,canonicalDigest:digest(rows),pitr:true,deletionProtection:true,backupArn:source.backupArn,backupStatus:'AVAILABLE'});
 let policy=null;try{policy=JSON.parse((await aws('dynamodb','get-resource-policy',{ResourceArn:t.TableArn})).Policy);}catch(e){assert.match(String(e.stderr),/PolicyNotFound|ResourceNotFoundException/);}
 assert(!JSON.stringify(policy).includes('TeamHubMigrationWriterFence'));r.sourcePolicies.push({arn:t.TableArn,digest:digest(policy)});
}
const bucket='amplify-d2cux232bpa951-ma-projectrespawnstoragebuc-bw3gimudfvur';let policy=null;try{policy=JSON.parse((await aws('s3api','get-bucket-policy',{Bucket:bucket})).Policy);}catch(e){assert.match(String(e.stderr),/NoSuchBucketPolicy/);}assert(!JSON.stringify(policy).includes('TeamHubMigrationWriterFence'));r.sourceLogoPolicyDigest=digest(policy);
const stacks=(await aws('cloudformation','list-stacks')).StackSummaries.filter(x=>x.StackStatus!=='DELETE_COMPLETE'&&!/^ProjectRespawn-(Core|TeamHub)-Production/.test(x.StackName)).map(({StackName,StackStatus,LastUpdatedTime,CreationTime})=>({StackName,StackStatus,LastUpdatedTime,CreationTime}));
const old=read(H+'/docs/architecture/team-hub-production-evidence-2026-10-20/R1-live/preflight.json').stackBaseline.filter(x=>!/^ProjectRespawn-(Core|TeamHub)-Production/.test(x.StackName));
// R1 predates the accepted SWG update. Verify that sole difference against later
// accepted restoration preservation evidence, without rebasing arbitrary drift.
const acceptedLater=read(H+'/docs/architecture/team-hub-incident-evidence-2026-10-23/restoration-preserve-pagination-final-cleanup.json');assert(acceptedLater.infrastructureAndCognitoPreserved);
const acceptedSwg=acceptedLater.stacks.find(x=>x.name==='swg-beta-downloads'),swg=stacks.find(x=>x.StackName===acceptedSwg.name);assert.equal(swg.StackStatus,acceptedSwg.status);assert.equal(new Date(swg.LastUpdatedTime).toISOString(),acceptedSwg.updated);assert.equal(new Date(swg.CreationTime).toISOString(),acceptedSwg.created);old[old.findIndex(x=>x.StackName===swg.StackName)]={...swg};
if(digest(stacks)!==digest(old)){const diff=[];for(const name of new Set([...stacks,...old].map(x=>x.StackName))){const actual=stacks.find(x=>x.StackName===name),expected=old.find(x=>x.StackName===name);if(digest(actual??null)!==digest(expected??null))diff.push({name,expected,actual});}save('protected-stack-difference.json',{at:new Date().toISOString(),comparedTo:'R1-live/preflight.json',difference:diff,awsWrites:0});console.log(JSON.stringify({protectedStackDifferences:diff}));}
assert.equal(digest(stacks),digest(old),'PROTECTED_STACK_DRIFT');r.protectedStacks={count:stacks.length,digest:digest(stacks),matchedAcceptedBaseline:true};
const pool=(await aws('cognito-idp','describe-user-pool',{UserPoolId:manifest.environment.poolId})).UserPool;
const client=(await aws('cognito-idp','describe-user-pool-client',{UserPoolId:manifest.environment.poolId,ClientId:manifest.environment.clientId})).UserPoolClient;
// Same serialization as accepted read-only snapshot; no client secret or values persisted.
const {createHash}=await import('node:crypto');const h=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
assert.equal(h(pool),prior.cognito.poolConfigurationDigest);assert.equal(h(client),prior.cognito.clientConfigurationDigest);r.cognito={poolId:pool.Id,clientId:client.ClientId,poolDigest:h(pool),clientDigest:h(client)};
const branch=(await aws('amplify','get-branch',{appId:'d2cux232bpa951',branchName:'master'})).branch;
const jobs=(await aws('amplify','list-jobs',{appId:'d2cux232bpa951',branchName:'master',maxResults:1})).jobSummaries;
const remote=execFileSync('git',['ls-remote','origin','refs/heads/master'],{encoding:'utf8',windowsHide:true}).trim().split(/\s/)[0];assert.equal(remote,prior.master.remoteSha);assert.equal(jobs[0].commitId,remote);assert.equal(jobs[0].status,'SUCCEED');assert.equal(branch.activeJobId,prior.master.activeJob);assert.equal(h(branch.environmentVariables),prior.master.configurationDigest);r.master={remote,job:jobs[0].jobId,status:jobs[0].status,environmentDigest:h(branch.environmentVariables)};
if(!post){const before=read('docs/architecture/production-team-hub-permissions-execution-2026-10-24/preservation-post.json');for(const k of ['tables','sourcePolicies','sourceLogoPolicyDigest','protectedStacks','cognito','master'])assert.deepEqual(r[k],before[k],k+' DRIFT_SINCE_ACCEPTED_BASELINE');}if(post){const before=read(E+'/preservation-baseline.json');for(const k of ['tables','sourcePolicies','sourceLogoPolicyDigest','protectedStacks','cognito','master'])assert.deepEqual(r[k],before[k],k+' CHANGED');}
r.complete=true;r.rawRecordsPersisted=false;save(post?'preservation-post.json':'preservation-baseline.json',r);console.log(JSON.stringify({complete:true,post,counts:r.tables.map(x=>[x.model,x.count]),protectedStackBaselineMatched:true,awsWrites:0}));
