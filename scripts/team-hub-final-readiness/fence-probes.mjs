// Read schema only. Compile guarded requests; NEVER execute GraphQL or data writes.
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {AppSyncClient,GetIntrospectionSchemaCommand} from '@aws-sdk/client-appsync';
import {fromIni} from '@aws-sdk/credential-providers';
import {buildClientSchema,parse,validate,isNonNullType,getNamedType,coerceInputValue} from 'graphql';
const E='docs/architecture/team-hub-final-readiness-evidence-2026-10-12';
const response=await new AppSyncClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1}).send(new GetIntrospectionSchemaCommand({apiId:'dxb2tdlulrch7hj2pts2mfijia',format:'JSON',includeDirectives:true}));
const sdl=Buffer.from(response.schema).toString(),raw=JSON.parse(sdl),schema=buildClientSchema(raw.data??raw),probes=[];
for(const model of ['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'])for(const verb of ['create','update','delete']){
 const operation=verb+model,field=schema.getMutationType().getFields()[operation];assert.ok(field);const inputType=getNamedType(field.args.find(x=>x.name==='input').type),conditionType=getNamedType(field.args.find(x=>x.name==='condition').type);
 const inputs=inputType.getFields(),conditions=conditionType.getFields(),attribute=conditions.id?'id':Object.keys(conditions).find(k=>getNamedType(conditions[k].type).getFields?.().attributeExists);assert.ok(attribute);
 const input={id:'__team_hub_fence_probe_20261012_'+model};for(const [key,value] of Object.entries(inputs)){if(key==='id'||!isNonNullType(value.type))continue;const type=getNamedType(value.type).name;input[key]=type==='Int'?0:type==='Boolean'?false:type==='AWSDateTime'?'2026-10-12T00:00:00.000Z':'fence-probe';}
 const condition={and:[{[attribute]:{attributeExists:true}},{[attribute]:{attributeExists:false}}]};
 const document=`mutation FenceProbe($input: ${inputType.name}!, $condition: ${conditionType.name}) { ${operation}(input: $input, condition: $condition) { id } }`;
 assert.deepEqual(validate(schema,parse(document)),[]);coerceInputValue(input,inputType,(_p,_v,e)=>{throw e;});coerceInputValue(condition,conditionType,(_p,_v,e)=>{throw e;});
 probes.push({operation,document,variables:{input,condition},authentication:'AWS_IAM SigV4 using reviewed existing RavenTest identity; Cognito rejection is not fence proof',guard:'Contradictory condition cannot succeed, including on an existing item',beforeFenceExpected:'Underlying conditional-check failure, not authorization/input error; requires separate probe authorization',afterFenceRequired:'Underlying DynamoDB policy AccessDenied correlated to exact AppSync datasource role/request; a conditional/validation/auth error alone FAILS fence proof',executed:false});
}
const result={at:new Date().toISOString(),schemaSha256:crypto.createHash('sha256').update(sdl).digest('hex'),schemaRequestId:response.$metadata.requestId,api:'dxb2tdlulrch7hj2pts2mfijia',probes,complete:true,awsWrites:0,limitations:['No guarded request executed','Service-only Lambda/cleanup paths must use actual supported invocation or reviewed no-path proof; never relax trust','Presigned/logo probes require separately reviewed signed request and non-business key; no token persisted']};
fs.writeFileSync(E+'/generated-fence-probes.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({complete:true,compiled:probes.length,awsWrites:0}));
