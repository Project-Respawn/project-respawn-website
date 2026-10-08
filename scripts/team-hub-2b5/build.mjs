import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {singleFileZip} from '../team-hub-2b4/zip.mjs';import {teamPolicy,corePolicy,team,core,coreArn,account,region} from './security.mjs';import {fenceCandidate,legacyGatewayRequestTemplate} from './fence.mjs';
assert.deepEqual(process.argv.slice(2),['--domain','team-hub','--env','Ntgre','--offline']);
for(const k of ['AWS_REGION','AWS_DEFAULT_REGION','CDK_DEFAULT_REGION'])assert.ok(!process.env[k]||process.env[k]===region);assert.ok(!process.env.CDK_DEFAULT_ACCOUNT||process.env.CDK_DEFAULT_ACCOUNT===account);
const E='docs/architecture/team-hub-2b5-evidence-2026-10-06',B='.tmp/team-hub-2b5';fs.mkdirSync(E,{recursive:true});fs.mkdirSync(B,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),save=(n,v)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(v,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const esbuild=createRequire(path.resolve('infrastructure/domains/team-hub/package.json'))('esbuild'),environment=read('config/environments/Ntgre.core.json');
const manifest=read('docs/architecture/team-hub-2b4-evidence-2026-10-06/source-manifest.json');for(const f of manifest.files)assert.equal(sha(f.path),f.sha256);
const builds={};for(const[k,entry]of [['core','domains/shared-core/entry.mjs'],['team','domains/team-hub/cutover/entry.mjs']]){
 const dest=B+'/'+k+'.js',r=await esbuild.build({entryPoints:[entry],outfile:dest,bundle:true,platform:'node',format:'cjs',target:'node22',metafile:true,logLevel:'silent'});
 for(const input of Object.keys(r.metafile.inputs))assert.ok(input.startsWith(k==='core'?'domains/shared-core/':'domains/team-hub/'),'Foreign runtime import '+input);
 assert.ok(!Object.keys(r.metafile.inputs).some(x=>/parity\/(handler|core|fence)\.mjs/.test(x)),'Verification adapter in cutover bundle');
 fs.writeFileSync(B+'/'+k+'.zip',singleFileZip('index.js',fs.readFileSync(dest)));builds[k]={entry,bundleSha256:sha(dest),zipSha256:sha(B+'/'+k+'.zip'),bytes:fs.statSync(dest).size,inputs:Object.keys(r.metafile.inputs),assetKey:'team-hub/2b5/'+k+'/'+sha(B+'/'+k+'.zip')+'.zip'};
}
const A='docs/architecture/team-hub-2b4a-evidence-2026-10-06',product=read(A+'/proposed-product.template.json'),security=read(A+'/proposed-security.template.json');
const kms=security.Resources.ParityCommandBoundary.Properties.PolicyDocument.Statement.filter(s=>JSON.stringify(s).includes('kms:')&&!s.NotAction);
for(const kind of ['Command','Read']){
 const policy=teamPolicy(security.Resources['Parity'+kind+'Boundary'].Properties.PolicyDocument,kind);save(kind.toLowerCase()+'-policy',policy);
 security.Resources['Parity'+kind+'Boundary'].Properties.PolicyDocument=policy;product.Resources['Parity'+kind+'Role'].Properties.Policies[0].PolicyDocument=policy;
 const f=product.Resources['Parity'+kind+'Function'].Properties;f.Code.S3Key=builds.team.assetKey;f.Environment.Variables={TEAM_HUB_RUNTIME:kind.toLowerCase(),CORE_ENVIRONMENT:JSON.stringify(environment),CORE_CONTRACT_ARN:coreArn,TEAM_CURSOR_SECRET_ARN:{Ref:'CursorSecret'}};
}
const secret=name=>({Type:'AWS::SecretsManager::Secret',DeletionPolicy:'Retain',UpdateReplacePolicy:'Retain',Properties:{Name:name,GenerateSecretString:{PasswordLength:64,ExcludePunctuation:true,RequireEachIncludedType:false,ExcludeCharacters:'ghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'}}});
product.Resources.CursorSecret=secret(team+'-Cursor');
for(const [name,route]of [['ListTeams','GET /v1/teams'],['AssignableSearch','POST /v1/directory/assignable-search']])product.Resources['Cutover'+name+'Route']={Type:'AWS::ApiGatewayV2::Route',Properties:{ApiId:{Ref:'HttpApi'},RouteKey:route,AuthorizationType:'JWT',AuthorizerId:{Ref:'JwtAuthorizer'},Target:{'Fn::Join':['',['integrations/',{Ref:'ParityReadIntegration'}]]}}};
product.Resources.CutoverAccessLogs={Type:'AWS::Logs::LogGroup',Properties:{LogGroupName:'/project-respawn/Ntgre/team-hub/access',RetentionInDays:30}};
product.Resources.Stage.Properties.DefaultRouteSettings={...product.Resources.Stage.Properties.DefaultRouteSettings,DetailedMetricsEnabled:true};
product.Resources.Stage.Properties.AccessLogSettings={DestinationArn:{'Fn::GetAtt':['CutoverAccessLogs','Arn']},Format:JSON.stringify({requestId:'$context.requestId',routeKey:'$context.routeKey',status:'$context.status',responseLatency:'$context.responseLatency',integrationError:'$context.integrationErrorMessage'})};
product.Resources.HttpApi.Properties.CorsConfiguration.AllowHeaders.push('x-team-authority-epoch');
const cp=corePolicy(kms,environment.poolId);save('core-runtime-policy',cp);
const roleArn=`arn:aws:iam::${account}:role/${core}-Contracts`,boundaryArn=`arn:aws:iam::${account}:policy/${core}-RuntimeBoundary`;
const trust=service=>({Version:'2012-10-17',Statement:[{Effect:'Allow',Principal:{Service:service},Action:'sts:AssumeRole'}]});
const coreTemplate={AWSTemplateFormatVersion:'2010-09-09',Description:'Offline Shared/Core contract candidate; existing Cognito remains Legacy-owned',Resources:{
 CursorSecret:secret(core+'-Cursor'),Logs:{Type:'AWS::Logs::LogGroup',Properties:{LogGroupName:'/project-respawn/Ntgre/core/contracts',RetentionInDays:30}},
 Runtime:{Type:'AWS::IAM::Role',Properties:{RoleName:core+'-Contracts',AssumeRolePolicyDocument:trust('lambda.amazonaws.com'),PermissionsBoundary:boundaryArn,Policies:[{PolicyName:'BoundedCoreContracts',PolicyDocument:cp}]}},
 Contracts:{Type:'AWS::Lambda::Function',Properties:{FunctionName:core+'-Contracts',Runtime:'nodejs22.x',Handler:'index.handler',Architectures:['arm64'],Timeout:10,MemorySize:256,Role:{'Fn::GetAtt':['Runtime','Arn']},Code:{S3Bucket:'cdk-hnb659fds-assets-058264289478-eu-north-1',S3Key:builds.core.assetKey},LoggingConfig:{LogGroup:{Ref:'Logs'},LogFormat:'JSON'},Environment:{Variables:{CORE_ENVIRONMENT:JSON.stringify(environment),CORE_CURSOR_SECRET_ARN:{Ref:'CursorSecret'}}}}}
 }};
 for(const metric of ['Errors','Throttles'])coreTemplate.Resources[metric]={Type:'AWS::CloudWatch::Alarm',Properties:{AlarmName:core+'-'+metric,Namespace:'AWS/Lambda',MetricName:metric,Dimensions:[{Name:'FunctionName',Value:{Ref:'Contracts'}}],Statistic:'Sum',Period:60,EvaluationPeriods:1,Threshold:1,ComparisonOperator:'GreaterThanOrEqualToThreshold',TreatMissingData:'notBreaching'}};
// Security bootstrap stays a separate review: runtime boundary is concrete, deployment
// caller/execution identity need exact artifact and lifecycle proof before any creation.
const coreSecurity={AWSTemplateFormatVersion:'2010-09-09',Description:'Runtime boundary candidate only; deployment security remains a blocker',Resources:{RuntimeBoundary:{Type:'AWS::IAM::ManagedPolicy',Properties:{ManagedPolicyName:core+'-RuntimeBoundary',PolicyDocument:cp}}}};
save('team-product.template',product);save('team-security-runtime-only.template',security);save('core-product.template',coreTemplate);save('core-security-runtime-only.template',coreSecurity);
const sources=['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'].map(n=>`arn:aws:dynamodb:${region}:${account}:table/${n}-dxb2tdlulrch7hj2pts2mfijia-NONE`);
const logo=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/logo-resource-policy.json');
save('fence-proposals',{frozen:fenceCandidate({mode:'FROZEN',sources,bucket:logo.bucket,bucketPolicy:logo.policy}),target:fenceCandidate({mode:'TARGET_WRITER',sources,bucket:logo.bucket,bucketPolicy:logo.policy}),existingBucketEvidenceSha256:sha('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/logo-resource-policy.json'),mergeStatus:'Recorded bucket statements preserved; refresh complete table/bucket policies and revisions before any installation',gatewayTemplates:{frozen:legacyGatewayRequestTemplate('FROZEN'),target:legacyGatewayRequestTemplate('TARGET_WRITER')}});
save('build',{at:new Date().toISOString(),builds,acceptedManifestFilesPreserved:manifest.files.length,current:{legacy:2621,legacyTeamAttribution:192,teamOwnerLedger:188,teamProduct:40,teamSecurity:7},proposed:{teamProduct:Object.keys(product.Resources).length,teamSecurity:7,coreProduct:Object.keys(coreTemplate.Resources).length,coreRuntimeSecurity:1,coreDeploymentSecurityReserved:4,fence:0,frontend:0,branding:0},deployable:false,blockers:['Core deployment caller/execution security not yet reviewed','Team execution/caller policies still point at accepted artifacts; runtime-only template must not deploy','Live Core and fence proof absent','Frontend Vue contract migration and shell isolation pending','State authority rollback rehearsal not performed'],awsWrites:0,authority:'LEGACY_WRITER',frontendCutover:false});
console.log(JSON.stringify(read(E+'/build.json').proposed));
