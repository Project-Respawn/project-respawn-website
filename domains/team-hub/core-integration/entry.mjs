import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';
import {acceptedCore} from './manifest.mjs';
import {createCoreIntegrationHandler} from './handler.mjs';
const lambda=new LambdaClient({region:acceptedCore.region,maxAttempts:1});
const invokeCore=async request=>{
 try{
  const response=await lambda.send(new InvokeCommand({FunctionName:acceptedCore.lambdaArn,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify(request))}));
  if(response.FunctionError||response.StatusCode!==200){console.info(JSON.stringify({event:'CORE_TRANSPORT_FAILURE',status:response.StatusCode,functionError:response.FunctionError??null}));throw Error('CORE_UNAVAILABLE');}
  return JSON.parse(Buffer.from(response.Payload).toString());
 }catch(error){
  // Allowlisted diagnostics only: never serialize SDK errors, request bodies, tokens or credentials.
  console.info(JSON.stringify({event:'CORE_TRANSPORT_FAILURE',errorName:error.name,status:error.$metadata?.httpStatusCode,requestId:error.$metadata?.requestId,deniedAction:error.message?.match(/not authorized to perform: ([a-z0-9-]+:[A-Za-z0-9]+)/)?.[1]}));throw error;
 }
};
const run=createCoreIntegrationHandler({invokeCore,log:record=>console.info(JSON.stringify(record))});
export async function handler(event){
 if(process.env.TEAM_HUB_AUTHORITY!=='LEGACY_WRITER'||process.env.TEAM_HUB_STAGE!=='PRE_CUTOVER'||process.env.TEAM_HUB_NORMAL_WRITES!=='DISABLED')return {statusCode:503,body:'{"error":{"code":"DEPENDENCY_UNAVAILABLE"}}'};
 return run(event);
}
