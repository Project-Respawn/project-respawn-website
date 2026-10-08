import assert from 'node:assert/strict';
import {aws,read,save,digest} from './coverage-read.mjs';
const P='docs/architecture/team-hub-2b3-final-evidence-2026-10-05';
const old=read(P+'/resolver-coverage.json'),prior=read(P+'/reader-edges.json');
assert.equal((await aws('sts','get-caller-identity')).Account,'058264289478');
const sources=(await aws('appsync','list-data-sources','--api-id',old.api)).dataSources;
const selected=sources.filter(s=>old.sources.some(p=>p.name===s.name)).map(s=>({name:s.name,type:s.type,role:s.serviceRoleArn,table:s.dynamodbConfig?.tableName,lambda:s.lambdaConfig?.lambdaFunctionArn}));
assert.equal(digest(selected.sort((a,b)=>a.name.localeCompare(b.name))),digest([...old.sources].sort((a,b)=>a.name.localeCompare(b.name))));
const resolvers=[];
for(const type of ['Query','Mutation','Subscription']){
 const all=(await aws('appsync','list-resolvers','--api-id',old.api,'--type-name',type)).resolvers;
 for(const r of all.filter(r=>/Team|PlayerChampionPool/.test(r.fieldName)))resolvers.push({type,field:r.fieldName,kind:r.kind,pipeline:r.pipelineConfig,requestDigest:digest(r.requestMappingTemplate??r.code??''),responseDigest:digest(r.responseMappingTemplate??'')});
}
const business=resolvers.filter(r=>r.type!=='Subscription');assert.equal(business.length,old.resolvers.length);
for(const r of business){const previous=old.resolvers.find(p=>p.type===r.type&&p.field===r.field);assert.ok(previous);for(const k of ['kind','pipeline','requestDigest','responseDigest'])assert.deepEqual(r[k],previous[k]);}
const subscriptions=resolvers.filter(r=>r.type==='Subscription');assert.equal(subscriptions.length,prior.subscriptionResolvers.length);
for(const r of subscriptions){const previous=prior.subscriptionResolvers.find(p=>p.field===r.field);assert.ok(previous);assert.deepEqual(r.pipeline,previous.pipeline);assert.equal(r.kind,previous.kind);}
const ids=new Set(resolvers.flatMap(r=>r.pipeline?.functions??[]));
const functions=(await aws('appsync','list-functions','--api-id',old.api)).functions.filter(f=>ids.has(f.functionId));assert.equal(functions.length,ids.size,'Unresolved pipeline function');
for(const f of functions){assert.ok(sources.some(s=>s.name===f.dataSourceName),'Unknown data source');const previous=prior.subscriptionFunctions.find(p=>p.id===f.functionId);if(previous){assert.equal(f.dataSourceName,previous.dataSource);assert.equal(f.requestMappingTemplate??f.code,previous.request);}}
const streams=[];
for(const s of prior.streams){const mappings=(await aws('lambda','list-event-source-mappings','--event-source-arn',s.arn)).EventSourceMappings;assert.equal(mappings.length,0,'New source stream consumer');let absent=false;try{await aws('dynamodb','get-resource-policy','--resource-arn',s.arn);}catch(e){if(!e.message.includes('PolicyNotFoundException'))throw e;absent=true;}assert.equal(absent,true,'New stream resource policy');streams.push({model:s.model,arn:s.arn,mappings:0,resourcePolicyAbsent:true});}
save('edge-refresh',{at:new Date().toISOString(),complete:true,resolverConfigurationsUnchanged:true,businessResolvers:business.length,subscriptions:subscriptions.length,functions:functions.map(f=>({id:f.functionId,name:f.name,dataSource:f.dataSourceName,requestSha256:digest(f.requestMappingTemplate??f.code??''),responseSha256:digest(f.responseMappingTemplate??'')})),sources:selected,streams,unknownPipelineEdges:0,liveDenialProven:false,awsWrites:0});
console.log(JSON.stringify({business:business.length,subscriptions:subscriptions.length,functions:functions.length,streams:streams.length,unknownPipelineEdges:0}));
