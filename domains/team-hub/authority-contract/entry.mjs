import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand} from '@aws-sdk/lib-dynamodb';
import {handler as darkHandler} from '../dark-monitoring/entry.mjs';
import {acceptedCore} from '../core-integration/manifest.mjs';
import {createAuthorityStatusRouter} from './router.mjs';

const client=DynamoDBDocumentClient.from(new DynamoDBClient({region:acceptedCore.region,maxAttempts:1}));
export const handler=createAuthorityStatusRouter({
 darkHandler,getItem:request=>client.send(new GetCommand(request)),
 environment:acceptedCore.environmentContract,configuration:process.env,
 emit:event=>process.stdout.write(JSON.stringify(event)+'\n'),
});
