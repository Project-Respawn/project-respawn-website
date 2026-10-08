import {aws,read,save,digest} from './coverage-read.mjs';
import {targets,identity} from '../team-hub-2b4b/preflight/common.mjs';
import {fenceCandidate,legacyGatewayRequestTemplate} from '../team-hub-2b5/fence.mjs';
await identity();const existing={},revisions={};
for(const t of targets){try{const p=await aws('dynamodb','get-resource-policy','--resource-arn',t.sourceArn);existing[t.sourceArn]=JSON.parse(p.Policy);revisions[t.sourceArn]=p.RevisionId;}catch(e){if(!e.message.includes('PolicyNotFoundException'))throw e;revisions[t.sourceArn]='NO_POLICY';}}
const bucket=read('amplify_outputs.json').storage.bucket_name;let bucketPolicy={Version:'2012-10-17',Statement:[]};
try{bucketPolicy=JSON.parse((await aws('s3api','get-bucket-policy','--bucket',bucket)).Policy);}catch(e){if(!e.message.includes('NoSuchBucketPolicy'))throw e;}
const modes=Object.fromEntries(['LEGACY_WRITER','FROZEN','TARGET_WRITER'].map(mode=>[mode,fenceCandidate({mode,sources:targets.map(t=>t.sourceArn),existing,bucket,bucketPolicy})]));
const api=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/resolver-coverage.json').api;
const gateways=[];for(const [type,field] of [['Query','readTeamHub'],['Mutation','mutateTeamHub']]){const before=(await aws('appsync','get-resolver','--api-id',api,'--type-name',type,'--field-name',field)).resolver;gateways.push({api,type,field,before,beforeSha256:digest(before),frozenRequest:legacyGatewayRequestTemplate('FROZEN'),targetRequest:legacyGatewayRequestTemplate('TARGET_WRITER'),preserve:['kind','pipelineConfig','responseMappingTemplate','cachingConfig','syncConfig','runtime','code'],install:false});}
save('fence-candidates',{at:new Date().toISOString(),account:'058264289478',region:'eu-north-1',revisions,existing,bucketPolicySha256:digest(bucketPolicy),modes,gateways,installed:false,actualAuthority:'LEGACY_WRITER',requiresFreshRevisionRead:true,policyCustodian:'Ntgre (user)',recoveryException:false,awsWrites:0});console.log(JSON.stringify({prepared:3,gateways:2,installed:false,awsWrites:0}));
