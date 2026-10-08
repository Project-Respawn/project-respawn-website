import fs from 'node:fs';
import {aws,read,save,audit} from './final-read.mjs';
const i=await aws('sts','get-caller-identity');if(i.Account!=='058264289478')throw Error('Wrong account');
const inventory=read('docs/architecture/team-hub-2b3-evidence-2026-10-05/table-inventory.json');
const streams=[];
for(const t of inventory.tables){const arn=t.table.LatestStreamArn;if(!arn)continue;try{const r=await aws('dynamodb','get-resource-policy','--resource-arn',arn);streams.push({model:t.model,arn,policy:r.Policy?JSON.parse(r.Policy):null});}catch(e){streams.push({model:t.model,arn,error:e.message,absent:e.message.includes('PolicyNotFoundException')});}}
const api=read('docs/architecture/team-hub-2b3-final-evidence-2026-10-05/resolver-coverage.json').api;
const subscriptions=(await aws('appsync','list-resolvers','--api-id',api,'--type-name','Subscription')).resolvers.filter(r=>/Team|PlayerChampionPool/.test(r.fieldName));
const ids=new Set(subscriptions.flatMap(r=>r.pipelineConfig?.functions??[]));
const functions=(await aws('appsync','list-functions','--api-id',api)).functions.filter(f=>ids.has(f.functionId)).map(f=>({id:f.functionId,name:f.name,dataSource:f.dataSourceName,request:f.requestMappingTemplate??f.code}));
fs.mkdirSync('.tmp/team-hub-provider-review',{recursive:true});
const path='.tmp/team-hub-provider-review/ntgre-schema.graphql';
await aws('appsync','get-introspection-schema','--api-id',api,'--format','SDL','--include-directives',path);
const schema=fs.readFileSync(path,'utf8');
const type=schema.match(/type Subscription[^\{]*\{([\s\S]*?)\n\}/)?.[1]??'';
const declarations=type.split('\n').filter(line=>/on(Create|Update|Delete)(Team|TeamMembership|TeamRosterSlot|PlayerChampionPoolEntry)\(/.test(line));
save('reader-edges',{at:new Date().toISOString(),api,streams,subscriptionResolvers:subscriptions.map(r=>({field:r.fieldName,dataSource:r.dataSourceName,kind:r.kind,pipeline:r.pipelineConfig})),subscriptionFunctions:functions,subscriptionDeclarations:declarations,schemaStoredOnlyIgnored:true,audit});
console.log(JSON.stringify({streams:streams.length,subscriptionResolvers:subscriptions.length,declarations:declarations.length,audit}));
