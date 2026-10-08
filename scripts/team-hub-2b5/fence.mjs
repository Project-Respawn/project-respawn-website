import assert from 'node:assert/strict';
import {legacyFencePolicies} from '../team-hub-2b4/legacy-fence.mjs';
export const writes=Object.freeze(['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:BatchWriteItem','dynamodb:PartiQLInsert','dynamodb:PartiQLUpdate','dynamodb:PartiQLDelete']);
export function fenceCandidate({mode,sources,existing={},bucket,bucketPolicy={Version:'2012-10-17',Statement:[]}}){
 assert.equal(bucket,'amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw');
 const tables=legacyFencePolicies(mode,sources,existing);
 if(mode==='TARGET_WRITER')for(const t of tables)t.policy.Statement.push({Sid:'TeamHubMigrationRetiredReaderFence',Effect:'Deny',Principal:'*',Action:['dynamodb:GetItem','dynamodb:BatchGetItem','dynamodb:Query','dynamodb:Scan','dynamodb:PartiQLSelect'],Resource:[t.arn,t.arn+'/index/*']});
 const storage=structuredClone(bucketPolicy);assert.ok(!storage.Statement.some(s=>s.Sid==='TeamHubMigrationLogoFence'));
 if(mode!=='LEGACY_WRITER')storage.Statement.push({Sid:'TeamHubMigrationLogoFence',Effect:'Deny',Principal:'*',Action:['s3:PutObject','s3:DeleteObject','s3:DeleteObjectVersion','s3:AbortMultipartUpload'],Resource:`arn:aws:s3:::${bucket}/team-logos/*`});
 return {mode,tables,bucket:{name:bucket,policy:storage},install:false,resourceDelta:0,requiresFreshPolicyRevision:true,recoveryBypass:false};
}
export function compatibility(mode,kind){
 assert.ok(['LEGACY_WRITER','FROZEN','TARGET_WRITER'].includes(mode));
 if(mode==='LEGACY_WRITER')return 'LEGACY_IMPLEMENTATION';
 if(kind==='generated-model')return mode==='FROZEN'?'DENY_WRITES':'DENY_READS_AND_WRITES';
 return mode==='FROZEN'?'TEAM_HUB_MAINTENANCE':'TEAM_HUB_DOMAIN_MOVED';
}
export function legacyGatewayRequestTemplate(mode){assert.ok(['FROZEN','TARGET_WRITER'].includes(mode));return `$util.error("${compatibility(mode,'gateway')}", "TeamHubMigration")`;}
