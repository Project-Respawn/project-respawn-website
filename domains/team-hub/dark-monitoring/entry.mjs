import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';import {acceptedCore} from '../core-integration/manifest.mjs';import {createDarkMonitoringHandler} from './handler.mjs';
const client=new LambdaClient({region:acceptedCore.region,maxAttempts:1});
const invokeCore=async request=>{const response=await client.send(new InvokeCommand({FunctionName:acceptedCore.lambdaArn,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify(request))}));if(response.FunctionError||response.StatusCode!==200)throw Error('CORE_UNAVAILABLE');return JSON.parse(Buffer.from(response.Payload).toString());};
export const handler=createDarkMonitoringHandler({invokeCore,configuration:process.env,emit:event=>process.stdout.write(JSON.stringify(event)+'\n')});
