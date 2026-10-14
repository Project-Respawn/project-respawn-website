// Read-only metadata inspection; no object bodies, credentials or environment values persisted.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
import {LambdaClient,ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {S3Client,GetBucketVersioningCommand,GetBucketLifecycleConfigurationCommand,GetBucketReplicationCommand,ListMultipartUploadsCommand} from '@aws-sdk/client-s3';
import {DynamoDBClient,DescribeTimeToLiveCommand,DescribeTableCommand} from '@aws-sdk/client-dynamodb';
import {AppSyncClient,GetGraphqlApiCommand} from '@aws-sdk/client-appsync';
const E='docs/architecture/team-hub-maintenance-preparation-evidence-2026-10-12',opts={region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:3};
const lambda=new LambdaClient(opts),s3=new S3Client(opts),ddb=new DynamoDBClient(opts),bucket='amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw';
const roles=['amplify-projectrespawnweb-myFunctionrebuildlambdaSe-mwrta80Al783','amplify-projectrespawnweb-adminusermanagementlambda-OIbycFZWXsdJ','amplify-projectrespawnweb-CustomS3AutoDeleteObjects-LxFoKPsKh5l3'].map(x=>'arn:aws:iam::058264289478:role/'+x);
const r={at:new Date().toISOString(),awsWrites:0,functions:[],sources:[],bucket:{name:bucket},complete:false};let Marker;
const api=(await new AppSyncClient(opts).send(new GetGraphqlApiCommand({apiId:'dxb2tdlulrch7hj2pts2mfijia'}))).graphqlApi;
assert.equal(api.arn,'arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia');
r.appsync={arn:api.arn,apiId:api.apiId,endpoint:api.uris.GRAPHQL,authenticationType:api.authenticationType,additionalAuthenticationTypes:api.additionalAuthenticationProviders?.map(p=>p.authenticationType)};
do{const p=await lambda.send(new ListFunctionsCommand({Marker,MaxItems:50}));for(const f of p.Functions??[])if(roles.includes(f.Role))r.functions.push({arn:f.FunctionArn,name:f.FunctionName,role:f.Role,timeout:f.Timeout,codeSha256:f.CodeSha256,logging:f.LoggingConfig});Marker=p.NextMarker;}while(Marker);
for(const arn of roles)assert.ok(r.functions.some(f=>f.role===arn),'Existing service function missing for '+arn);
r.bucket.versioning=await s3.send(new GetBucketVersioningCommand({Bucket:bucket,ExpectedBucketOwner:'058264289478'}));
for(const [name,Command,absent] of [['lifecycle',GetBucketLifecycleConfigurationCommand,'NoSuchLifecycleConfiguration'],['replication',GetBucketReplicationCommand,'ReplicationConfigurationNotFoundError']])try{const v=await s3.send(new Command({Bucket:bucket,ExpectedBucketOwner:'058264289478'}));r.bucket[name]=v;}catch(e){assert.equal(e.name,absent);r.bucket[name]={absent:true};}
r.bucket.multipart=await s3.send(new ListMultipartUploadsCommand({Bucket:bucket,Prefix:'team-logos/',ExpectedBucketOwner:'058264289478'}));assert.ok(!r.bucket.multipart.IsTruncated);assert.equal(r.bucket.multipart.Uploads?.length??0,0);
const bundle=JSON.parse(fs.readFileSync('docs/architecture/team-hub-2b6-evidence-2026-10-07/gate-b/dormant-bundle.json'));
for(const t of bundle.future.tables){const TableName=t.arn.split('/')[1],meta=(await ddb.send(new DescribeTableCommand({TableName}))).Table,ttl=(await ddb.send(new DescribeTimeToLiveCommand({TableName}))).TimeToLiveDescription;r.sources.push({name:TableName,ttl,replicas:meta.Replicas??[],status:meta.TableStatus,keySchema:meta.KeySchema});assert.deepEqual(meta.KeySchema,[{AttributeName:'id',KeyType:'HASH'}]);assert.equal(ttl.TimeToLiveStatus,'DISABLED');assert.equal(meta.Replicas?.length??0,0);}
const rules=r.bucket.lifecycle.Rules??[];r.bucket.activeLifecycleRules=rules.filter(x=>x.Status==='Enabled');
assert.equal(r.bucket.activeLifecycleRules.length,0,'Lifecycle could independently delete logos; review before readiness');assert.ok(r.bucket.replication.absent,'Replication requires separate path review');
r.complete=true;fs.writeFileSync(E+'/service-inspection.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({complete:true,functions:r.functions.length,ttlSourcesDisabled:r.sources.length,lifecycleRules:0,multipart:0,awsWrites:0}));
