// Fixed temporary candidate only. No entry point executes this file during preparation.
import {DynamoDBClient,PutItemCommand,UpdateItemCommand,TransactWriteItemsCommand} from '@aws-sdk/client-dynamodb';
import {S3Client,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {SignatureV4} from '@smithy/signature-v4';
import {HttpRequest} from '@smithy/core/protocols';
import {Sha256} from '@aws-crypto/sha256-js';
import {defaultProvider} from '@aws-sdk/credential-provider-node';
import config from './probe-config.mjs';
import {directRequests,logoRequests,region} from './probe-requests.mjs';
export async function handler(event,context){
 if(!event||Object.keys(event).length!==0)throw Error('EMPTY_INPUT_REQUIRED');
 const profile=process.env.FIXED_PROBE_PROFILE;if(!['shared','cleanup'].includes(profile))throw Error('INVALID_FIXED_PROFILE');
 const expected='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-FenceProof-'+profile;
 if(![expected,expected+':$LATEST'].includes(context?.invokedFunctionArn))throw Error('WRONG_FUNCTION_IDENTITY');
 const ddb=new DynamoDBClient({region,maxAttempts:1}),s3=new S3Client({region,maxAttempts:1});
 const cases=profile==='shared'?[...directRequests().filter(x=>!x.input.TableName?.startsWith('PlayerChampionPoolEntry')&&['PutItem','UpdateItem','TransactWriteItems'].includes(x.api)&&(!x.input.TransactItems||!x.input.TransactItems[0].Put.TableName.startsWith('PlayerChampionPoolEntry'))),...logoRequests().filter(x=>x.action==='s3:PutObject'||x.action==='s3:DeleteObject')]:logoRequests().filter(x=>x.action==='s3:DeleteObject'||x.action==='s3:DeleteObjectVersion');
 const constructors={PutItem:PutItemCommand,UpdateItem:UpdateItemCommand,TransactWriteItems:TransactWriteItemsCommand,PutObject:PutObjectCommand,DeleteObject:DeleteObjectCommand},results=[];
 for(const c of cases){try{const r=await (c.api.endsWith('Item')||c.api==='TransactWriteItems'?ddb:s3).send(new constructors[c.api](c.input));results.push({api:c.api,action:c.action,resource:c.input.TableName??c.input.TransactItems?.[0].Put.TableName??c.input.Key,unexpectedSuccess:true,requestId:r.$metadata.requestId});break;}catch(e){results.push({api:c.api,action:c.action,resource:c.input.TableName??c.input.TransactItems?.[0].Put.TableName??c.input.Key,error:e.name,requestId:e.$metadata?.requestId,status:e.$metadata?.httpStatusCode,explicitResourcePolicyDeny:/explicit deny.*resource.based policy/i.test(e.message)});}}
 if(profile==='shared'&&!results.some(r=>r.unexpectedSuccess)){
  const u=new URL(config.endpoint),signer=new SignatureV4({credentials:defaultProvider(),service:'appsync',region,sha256:Sha256});
  for(const p of config.generated){const signed=await signer.sign(new HttpRequest({protocol:u.protocol,hostname:u.hostname,path:u.pathname,method:'POST',headers:{host:u.hostname,'content-type':'application/json'},body:JSON.stringify({query:p.query,variables:p.variables})}));
   const r=await fetch(u,{method:'POST',headers:signed.headers,body:signed.body,redirect:'error',signal:AbortSignal.timeout(15000)}),body=await r.json();
   const unexpectedSuccess=!body.errors?.length;results.push({api:'GraphQL',operation:p.operation,status:r.status,requestId:r.headers.get('x-amzn-requestid'),errors:body.errors?.map(e=>({type:e.errorType,explicitResourcePolicyDeny:/explicit deny.*resource.based policy/i.test(e.message??'')})),unexpectedSuccess});if(unexpectedSuccess)break;
  }
  if(!results.some(r=>r.unexpectedSuccess)){
   const c=logoRequests()[0],url=await getSignedUrl(s3,new PutObjectCommand(c.input),{expiresIn:30}),r=await fetch(url,{method:'PUT',headers:{'If-Match':c.input.IfMatch},body:c.input.Body,redirect:'error',signal:AbortSignal.timeout(15000)});
   const text=await r.text();results.push({api:'PRESIGNED_GUARDED_PUT',status:r.status,requestId:r.headers.get('x-amz-request-id'),explicitResourcePolicyDeny:/explicit deny.*resource.based policy/i.test(text),unexpectedSuccess:r.ok});
  }
 }
 // Error text can include policy context; retain correlation in security-owned logs separately, never credentials/body.
 return {profile,functionArn:context.invokedFunctionArn,lambdaRequestId:context.awsRequestId,results,complete:!results.some(r=>r.unexpectedSuccess)&&results.length===cases.length+(profile==='shared'?config.generated.length+1:0),inputEmpty:true};
}
