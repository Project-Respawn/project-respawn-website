import fs from 'node:fs';
import crypto from 'node:crypto';
import {aws,read,save,digest,audit} from './final-read.mjs';
const identity=await aws('sts','get-caller-identity');
if(identity.Account!=='058264289478')throw Error('Wrong account');
const api=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/legacy-after.json').protectedResources.find(r=>r.type==='AWS::AppSync::GraphQLApi').physicalId.split('/').at(-1);
const sources=(await aws('appsync','list-data-sources','--api-id',api)).dataSources;
const selected=sources.filter(s=>/Team|PlayerChampionPool/.test(s.name)||s.lambdaConfig?.lambdaFunctionArn?.endsWith('LwVW5TljICgV'));
const resolvers=[];
for(const type of ['Query','Mutation']){
 const all=(await aws('appsync','list-resolvers','--api-id',api,'--type-name',type)).resolvers;
 for(const r of all.filter(r=>/Team|PlayerChampionPool/.test(r.fieldName)))resolvers.push({type,field:r.fieldName,kind:r.kind,dataSource:r.dataSourceName,pipeline:r.pipelineConfig,requestDigest:digest(r.requestMappingTemplate??r.code??''),responseDigest:digest(r.responseMappingTemplate??'')});
}
save('resolver-coverage',{at:new Date().toISOString(),api,sources:selected.map(s=>({name:s.name,type:s.type,role:s.serviceRoleArn,table:s.dynamodbConfig?.tableName,lambda:s.lambdaConfig?.lambdaFunctionArn})),resolvers,audit});
fs.mkdirSync('.tmp/team-hub-provider-review',{recursive:true});
const providers=[];
for(const name of ['amplify-projectrespawnweb-TableManagerCustomProvid-UvXMendxwsce','amplify-projectrespawnweb-TableManagerCustomProvid-tU7NFbChSvXB']){
 const r=await aws('lambda','get-function','--function-name',name);
 const response=await fetch(r.Code.Location);if(!response.ok)throw Error('Provider artifact download failed');
 const zip=Buffer.from(await response.arrayBuffer());
 const sha=crypto.createHash('sha256').update(zip).digest('base64');
 if(sha!==r.Configuration.CodeSha256)throw Error('Provider artifact hash mismatch');
 const path='.tmp/team-hub-provider-review/'+name+'.zip';fs.writeFileSync(path,zip);
 providers.push({name,arn:r.Configuration.FunctionArn,codeSha256:sha,handler:r.Configuration.Handler,runtime:r.Configuration.Runtime,localArchive:path,verified:true});
}
save('provider-artifacts',{at:new Date().toISOString(),providers,presignedUrlsPersisted:false,audit});
console.log(JSON.stringify({resolvers:resolvers.length,sources:selected.length,providerArtifacts:providers.length,audit}));
