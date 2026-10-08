import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';import {fromIni} from '@aws-sdk/credential-providers';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';import {proofVersion} from '../../domains/team-hub/core-integration/handler.mjs';import {save} from './aws.mjs';
const lambda=new LambdaClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1});
const claims={sub:'00000000-0000-0000-0000-000000000001',iss:acceptedCore.environmentContract.issuer,client_id:acceptedCore.environmentContract.clientId,token_use:'access',exp:Math.floor(Date.now()/1000)+60};
const accessToken='eyJhbGciOiJSUzI1NiJ9.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.invalid',results=[];
for(const kind of ['Read','Command']){const r=await lambda.send(new InvokeCommand({FunctionName:'ProjectRespawn-TeamHub-Ntgre-Parity'+kind,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify({contractVersion:proofVersion,accessToken,operation:'authorization'}))}));const data=JSON.parse(Buffer.from(r.Payload).toString());results.push({kind,status:r.StatusCode,functionError:r.FunctionError,errorCode:data.error?.code,requestId:r.$metadata.requestId});}
save('transport-probe',{at:new Date().toISOString(),invalidTokenOnly:true,results});console.log(JSON.stringify(results));
