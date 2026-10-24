// Read-only deployment review snapshot. Counts are not a frozen migration snapshot.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const E='docs/architecture/production-team-hub-permissions-execution-2026-10-24';
const candidate=JSON.parse(fs.readFileSync('docs/architecture/team-hub-production-permissions-candidate-2026-10-24/v2/candidate.json'));
const aws=(service,operation,input={})=>JSON.parse(execFileSync('aws',[service,operation,'--cli-input-json',JSON.stringify(input),'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:60000}));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const identity=aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');assert.equal(identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const result={at:new Date().toISOString(),identity,region:'eu-north-1',awsWrites:0,sourceCountsAreNotAnAtomicSnapshot:true,sources:[],core:{},teamStacks:[],master:{}};
for(const model of ['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry']){
 const name=model+'-lte47f3mgbbvxehfgz476en3xy-NONE',table=aws('dynamodb','describe-table',{TableName:name}).Table,protection=aws('dynamodb','describe-continuous-backups',{TableName:name}).ContinuousBackupsDescription;
 assert.equal(table.TableStatus,'ACTIVE');assert.equal(table.DeletionProtectionEnabled,true);assert.equal(protection.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');
 let key,count=0;do{const page=aws('dynamodb','scan',{TableName:name,Select:'COUNT',ConsistentRead:true,...(key?{ExclusiveStartKey:key}:{})});count+=page.Count;key=page.LastEvaluatedKey;}while(key&&Object.keys(key).length);
 const backup=aws('dynamodb','list-backups',{TableName:name,BackupType:'USER'}).BackupSummaries.find(b=>b.BackupName==='ProjectRespawn-TeamHub-Production-'+model+'-Recovery-20261020');assert(backup,model+' BACKUP_MISSING');const details=aws('dynamodb','describe-backup',{BackupArn:backup.BackupArn}).BackupDescription;assert.equal(details.BackupDetails.BackupStatus,'AVAILABLE');assert.equal(details.SourceTableDetails.TableArn,table.TableArn);assert.equal(details.SourceTableDetails.TableId,table.TableId);
 result.sources.push({model,name,tableArn:table.TableArn,tableId:table.TableId,status:table.TableStatus,count,deletionProtection:true,pitr:'ENABLED',backupArn:backup.BackupArn,backupStatus:details.BackupDetails.BackupStatus,schemaDigest:hash({keys:table.KeySchema,attributes:table.AttributeDefinitions,indexes:table.GlobalSecondaryIndexes})});
 fs.writeFileSync(E+'/read-only-preflight.partial.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({model,count,pitr:'ENABLED',backup:'AVAILABLE',awsWrites:0}));
}
const core=aws('lambda','get-function-configuration',{FunctionName:candidate.core.functionArn});assert.equal(Buffer.from(core.CodeSha256,'base64').toString('hex'),candidate.core.runtimeSha256);assert.equal(core.State,'Active');assert.equal(core.LastUpdateStatus,'Successful');result.core={functionArn:core.FunctionArn,runtimeSha256:candidate.core.runtimeSha256,state:core.State,update:core.LastUpdateStatus,configurationDigest:hash({Environment:core.Environment,Role:core.Role,LoggingConfig:core.LoggingConfig,Runtime:core.Runtime,Architectures:core.Architectures})};
result.core.alarms=aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-Core-Production'}).MetricAlarms.map(a=>({name:a.AlarmName,state:a.StateValue}));
const pool=aws('cognito-idp','describe-user-pool',{UserPoolId:candidate.environment.poolId}).UserPool,client=aws('cognito-idp','describe-user-pool-client',{UserPoolId:candidate.environment.poolId,ClientId:candidate.environment.clientId}).UserPoolClient;assert.equal(client.UserPoolId,pool.Id);result.cognito={poolId:pool.Id,clientId:client.ClientId,poolConfigurationDigest:hash(pool),clientConfigurationDigest:hash(client)};
for(const name of ['ProjectRespawn-TeamHub-Production','ProjectRespawn-TeamHub-Production-Security']){try{const stack=aws('cloudformation','describe-stacks',{StackName:name}).Stacks[0];result.teamStacks.push({name,status:stack.StackStatus});}catch(error){if(/does not exist/.test(String(error.stderr??'')))result.teamStacks.push({name,status:'ABSENT'});else throw error;}}
const master=aws('amplify','get-branch',{appId:'d2cux232bpa951',branchName:'master'}).branch;result.master={branch:master.branchName,stage:master.stage,autoBuild:master.enableAutoBuild,activeJob:master.activeJobId,configurationDigest:hash(master.environmentVariables)};
result.master.remoteSha=execFileSync('git',['rev-parse','origin/master'],{encoding:'utf8'}).trim();result.passed=true;
fs.writeFileSync(E+'/read-only-preflight.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({sources:result.sources.map(s=>({model:s.model,count:s.count,backup:s.backupStatus})),core:result.core.state,teamStacks:result.teamStacks,master:result.master.remoteSha,awsWrites:0}));
