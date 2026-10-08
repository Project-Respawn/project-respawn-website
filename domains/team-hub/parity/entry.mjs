import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand,QueryCommand,TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {createParityHandler} from './handler.mjs';
const client=DynamoDBDocumentClient.from(new DynamoDBClient({region:'eu-north-1',maxAttempts:1}),{marshallOptions:{removeUndefinedValues:false}});
const transport={get:p=>client.send(new GetCommand(p)),query:p=>client.send(new QueryCommand(p)),transactWrite:p=>client.send(new TransactWriteCommand(p))};
const environment={environment:'Ntgre',account:'058264289478',region:'eu-north-1',poolId:process.env.EXPECTED_POOL_ID,issuer:process.env.EXPECTED_ISSUER,clientId:process.env.EXPECTED_CLIENT_ID};
// No default grant, account discovery, token bypass, or automatic lease renewal.
const verification=JSON.parse(process.env.TEAM_HUB_VERIFICATION??'{"mode":"DISABLED"}');
export const handler=createParityHandler({runtime:process.env.TEAM_HUB_RUNTIME,environment,transport,verification});
