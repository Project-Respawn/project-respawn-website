import fs from 'node:fs';import assert from 'node:assert/strict';
import {LambdaClient,InvokeCommand,GetAccountSettingsCommand,GetFunctionConfigurationCommand} from '@aws-sdk/client-lambda';
import {E,read,save,options,name,manifest,verifyPins} from './common.mjs';
verifyPins();assert.equal(read(E+'/transactions.json').complete,true);assert.equal(read(E+'/installed.json').complete,true);assert.ok(!fs.existsSync(E+'/probe.json'),'No automatic probe replay');
const client=new LambdaClient(options),FunctionName=name+'-CursorProbe';
const capacity=await client.send(new GetAccountSettingsCommand({}));assert.ok(capacity.AccountLimit.UnreservedConcurrentExecutions>=1);
const configuration=await client.send(new GetFunctionConfigurationCommand({FunctionName}));assert.equal(configuration.Role,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ParityRead');assert.equal(configuration.CodeSha256,Buffer.from(manifest.probe.sha256,'hex').toString('base64'));assert.equal(configuration.State,'Active');
const r={at:new Date().toISOString(),attempted:true,complete:false,functionName:FunctionName,role:configuration.Role,capacity,codeSha256:configuration.CodeSha256};save('probe',r);
try{
 const result=await client.send(new InvokeCommand({FunctionName,InvocationType:'RequestResponse',Payload:Buffer.from('{}')}));r.requestId=result.$metadata.requestId;r.status=result.StatusCode;r.executedVersion=result.ExecutedVersion;r.functionError=result.FunctionError;save('probe',r);assert.ok(!result.FunctionError,'Probe returned function error');
 const payload=JSON.parse(Buffer.from(result.Payload).toString());assert.deepEqual(Object.keys(payload).sort(),['checks','passed']);assert.equal(payload.passed,true);assert.equal(Object.keys(payload.checks).length,9);assert.ok(Object.values(payload.checks).every(x=>x===true));r.result=payload;r.complete=true;r.completedAt=new Date().toISOString();save('probe',r);console.log(JSON.stringify({complete:true,checks:9,requestId:r.requestId}));
}catch(e){r.failure={name:e.name,message:e.message.slice(0,250)};save('probe',r);throw Error('CURSOR_PROBE_GATE_FAILED: '+e.name);}
