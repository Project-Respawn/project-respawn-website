import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand,QueryCommand,TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {createCutoverHandler} from './handler.mjs';
import {acceptedCore} from '../core-integration/manifest.mjs';
import {metricEvent} from './observability.mjs';
const options={region:'eu-north-1',maxAttempts:1},lambda=new LambdaClient(options),secrets=new SecretsManagerClient(options),data=DynamoDBDocumentClient.from(new DynamoDBClient(options));
const coreArn=acceptedCore.lambdaArn;
const transport={get:p=>data.send(new GetCommand(p)),query:p=>data.send(new QueryCommand(p)),transactWrite:p=>data.send(new TransactWriteCommand(p))};
const log=event=>process.stdout.write(JSON.stringify(metricEvent(process.env.TEAM_HUB_RUNTIME,event))+'\n');
const invokeCore=async request=>{try{if(process.env.CORE_CONTRACT_ARN!==coreArn)throw Error('CORE_ENDPOINT_NOT_ACCEPTED');const r=await lambda.send(new InvokeCommand({FunctionName:coreArn,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify(request))}));if(r.FunctionError)throw Error('CORE_UNAVAILABLE');const result=JSON.parse(Buffer.from(r.Payload).toString());if(typeof result?.ok!=='boolean'||result.error?.code==='DEPENDENCY_UNAVAILABLE')throw Error('CORE_UNAVAILABLE');return result;}catch{throw Error('CORE_UNAVAILABLE');}};
export async function handler(event){
 try{if(JSON.stringify(JSON.parse(process.env.CORE_ENVIRONMENT))!==JSON.stringify(acceptedCore.environmentContract))throw Error('CORE_ENVIRONMENT_NOT_ACCEPTED');const secret=await secrets.send(new GetSecretValueCommand({SecretId:process.env.TEAM_CURSOR_SECRET_ARN}));return await createCutoverHandler({runtime:process.env.TEAM_HUB_RUNTIME,transport,invokeCore,environment:acceptedCore.environmentContract,cursorSecret:secret.SecretString,log})(event);}
 catch{log({event:'TEAM_REQUEST',requestId:event?.requestContext?.requestId??'unavailable',code:'DEPENDENCY_UNAVAILABLE'});return {statusCode:503,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({contractVersion:'team-hub.v1',error:{code:'DEPENDENCY_UNAVAILABLE'}})};}
}
