import {CognitoJwtVerifier} from 'aws-jwt-verify';
import {CognitoIdentityProviderClient,AdminGetUserCommand,AdminListGroupsForUserCommand,ListUsersCommand} from '@aws-sdk/client-cognito-identity-provider';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {createCoreService} from './service.mjs';
import {eventRecord} from './observability.mjs';
import {directoryLimiter} from './rate-limit.mjs';
const limitDirectory=directoryLimiter();
const environment=JSON.parse(process.env.CORE_ENVIRONMENT??'null');
const client=new CognitoIdentityProviderClient({region:'eu-north-1',maxAttempts:1});
const secrets=new SecretsManagerClient({region:'eu-north-1',maxAttempts:1});
const verifier=CognitoJwtVerifier.create({userPoolId:environment.poolId,tokenUse:'access',clientId:environment.clientId});
const directory={get:Username=>client.send(new AdminGetUserCommand({UserPoolId:environment.poolId,Username})),list:input=>client.send(new ListUsersCommand({UserPoolId:environment.poolId,...input})),async groups(Username){const names=[];let NextToken;do{const page=await client.send(new AdminListGroupsForUserCommand({UserPoolId:environment.poolId,Username,Limit:60,...(NextToken?{NextToken}:{})}));names.push(...page.Groups.map(g=>g.GroupName));NextToken=page.NextToken;if(names.length>600)throw Error('DIRECTORY_LIMIT');}while(NextToken);return names;}};
// Versioned synchronous Lambda API: IAM InvokeFunction authenticates the Team service;
// Cognito verification independently authenticates the delegated human identity.
export async function handler(input,context){
 const started=Date.now();let outcome='DEPENDENCY_UNAVAILABLE';
 try{const secret=await secrets.send(new GetSecretValueCommand({SecretId:process.env.CORE_CURSOR_SECRET_ARN}));if(!/^[a-f0-9]{64}$/.test(secret.SecretString??''))throw Error('Invalid cursor key');const cursorKey=Buffer.from(secret.SecretString,'hex');const service=createCoreService({environment,verifyAccessToken:token=>verifier.verify(token),directory,cursorKey,limitDirectory});const data=await service(input);outcome=data.allowed===false?'DENY':data.allowed===true?'ALLOW':'SUCCESS';return {ok:true,data};}
 catch(error){outcome=['INVALID_INPUT','WRONG_ENVIRONMENT','UNAUTHENTICATED','FORBIDDEN','NOT_FOUND','RATE_LIMITED'].includes(error.code)?error.code:'DEPENDENCY_UNAVAILABLE';return {ok:false,error:{code:outcome}};}
 finally{console.log(JSON.stringify(eventRecord({requestId:context?.awsRequestId,contractVersion:input?.contractVersion,outcome,durationMs:Date.now()-started})));}
}
