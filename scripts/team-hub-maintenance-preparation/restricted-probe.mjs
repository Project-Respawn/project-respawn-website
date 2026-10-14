// Temporary fixed diagnostic runtime only. Preparation imports never invoke it.
import {DynamoDBClient,PutItemCommand,UpdateItemCommand,DeleteItemCommand,TransactWriteItemsCommand} from '@aws-sdk/client-dynamodb';
import {S3Client,PutObjectCommand,DeleteObjectCommand,AbortMultipartUploadCommand} from '@aws-sdk/client-s3';
import {directRequests,logoRequests,region,account} from './probe-requests.mjs';
export async function handler(event,context){
 const arn='arn:aws:lambda:'+region+':'+account+':function:ProjectRespawn-TeamHub-Ntgre-RestrictedFenceProbe';
 if(!event||Object.keys(event).length)throw Error('EMPTY_INPUT_REQUIRED');
 if(![arn,arn+':$LATEST'].includes(context?.invokedFunctionArn))throw Error('WRONG_FUNCTION');
 const ddb=new DynamoDBClient({region,maxAttempts:1}),s3=new S3Client({region,maxAttempts:1});
 const constructors={PutItem:PutItemCommand,UpdateItem:UpdateItemCommand,DeleteItem:DeleteItemCommand,TransactWriteItems:TransactWriteItemsCommand,PutObject:PutObjectCommand,DeleteObject:DeleteObjectCommand,AbortMultipartUpload:AbortMultipartUploadCommand};
 const cases=[...directRequests().filter(p=>['PutItem','UpdateItem','DeleteItem','TransactWriteItems'].includes(p.api)),...logoRequests()],results=[];
 for(const c of cases){try{const r=await (c.input.Bucket?s3:ddb).send(new constructors[c.api](c.input));results.push({api:c.api,action:c.action,unexpectedSuccess:true,requestId:r.$metadata?.requestId});break;}catch(e){results.push({api:c.api,action:c.action,error:e.name,requestId:e.$metadata?.requestId,status:e.$metadata?.httpStatusCode,explicitResourcePolicyDeny:/explicit deny.*resource.based policy/i.test(e.message)});}}
 return {functionArn:context.invokedFunctionArn,requestId:context.awsRequestId,results,complete:results.length===cases.length&&!results.some(r=>r.unexpectedSuccess),originalPrincipalProof:false};
}
