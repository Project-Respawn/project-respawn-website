// One owner-authorized disposable production Cognito identity. No password/token persistence.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
import {STSClient,GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {CognitoIdentityProviderClient,DescribeUserPoolCommand,ListUsersCommand,AdminCreateUserCommand,AdminSetUserPasswordCommand,AdminGetUserCommand,AdminListGroupsForUserCommand,AdminDeleteUserCommand} from '@aws-sdk/client-cognito-identity-provider';
import {Amplify} from 'aws-amplify';
import {signIn,fetchAuthSession} from 'aws-amplify/auth';
import {cognitoUserPoolsTokenProvider} from 'aws-amplify/auth/cognito';
const E='docs/architecture/production-core-emf-execution-2026-10-21',receiptPath=E+'/temporary-ordinary-account.json';
assert.ok(!fs.existsSync(receiptPath),'EXISTING_ACCOUNT_RECEIPT_REQUIRES_REVIEW');
const config={region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1},c=new CognitoIdentityProviderClient(config),pool='eu-north-1_Uufjxul58',client='2kc81ph5mgvo9eu2qjvmif5u8g';
const h=JSON.parse(fs.readFileSync('.tmp/production-dark-session-helper.json')),origin='http://localhost:5188',url=new URL(h.url);assert.equal(url.origin,origin);assert.match(url.pathname,/^\/[a-f0-9]{48}$/);
const id=await new STSClient(config).send(new GetCallerIdentityCommand({}));assert.equal(id.Account,'058264289478');assert.equal(id.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const status=async()=>{const r=await fetch(h.statusUrl);assert.ok(r.ok);return r.json();};
const initial=await status();assert.ok(!initial.failed&&!initial.busy&&!initial.ready);assert.ok(initial.personas.some(p=>p.persona==='admin'&&p.verifiedByCore&&p.teamsAdmin));
const p=(await c.send(new DescribeUserPoolCommand({UserPoolId:pool}))).UserPool;assert.deepEqual(Object.keys(p.LambdaConfig??{}).sort(),['PostConfirmation']);assert.equal(p.MfaConfiguration,'OFF');
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
async function users(){let all=[],PaginationToken;do{const r=await c.send(new ListUsersCommand({UserPoolId:pool,Limit:60,...(PaginationToken?{PaginationToken}:{})}));all.push(...r.Users);PaginationToken=r.PaginationToken;}while(PaginationToken);return all;}
const canonical=all=>all.map(u=>({username:u.Username,enabled:u.Enabled,status:u.UserStatus,created:u.UserCreateDate,modified:u.UserLastModifiedDate,attributes:[...(u.Attributes??[])].sort((a,b)=>a.Name.localeCompare(b.Name))})).sort((a,b)=>a.username.localeCompare(b.username));
const before=await users(),baseline=hash(canonical(before));
const username='core-ordinary-'+crypto.randomBytes(8).toString('hex')+'@respawntest.test';
assert.ok(!before.some(u=>u.Username===username||(u.Attributes??[]).some(a=>a.Name==='email'&&a.Value===username)));
const receipt={schemaVersion:'temporary-production-core-test-user.v1',startedAt:new Date().toISOString(),authorization:'Current explicit user permission to make an account to test ordinary production Core acceptance',operatorArn:id.Arn,pool,client,username,baselineUserCount:before.length,baselineUsersSha256:baseline,groupGrants:[],emailDelivery:'SUPPRESS',passwordPersisted:false,tokensPersisted:false,existingUsersModified:false,businessWrites:0,cleanup:'PENDING'};
const save=()=>fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');save();
let created=false,ownedSub,password='Aa1!'+crypto.randomBytes(36).toString('base64url'),memory=new Map();
try{
 const r=await c.send(new AdminCreateUserCommand({UserPoolId:pool,Username:username,MessageAction:'SUPPRESS',TemporaryPassword:password,UserAttributes:[{Name:'email',Value:username},{Name:'email_verified',Value:'true'}]}));
 created=true;ownedSub=r.User.Attributes.find(a=>a.Name==='sub')?.Value;assert.ok(ownedSub);receipt.createdUsername=r.User.Username;receipt.subjectSha256=hash(ownedSub);receipt.createRequestId=r.$metadata.requestId;save();
 const set=await c.send(new AdminSetUserPasswordCommand({UserPoolId:pool,Username:r.User.Username,Password:password,Permanent:true}));receipt.passwordSetRequestId=set.$metadata.requestId;save();
 const actual=await c.send(new AdminGetUserCommand({UserPoolId:pool,Username:r.User.Username}));assert.equal(actual.UserAttributes.find(a=>a.Name==='sub')?.Value,ownedSub);assert.equal(actual.UserStatus,'CONFIRMED');assert.equal(actual.Enabled,true);
 const groups=await c.send(new AdminListGroupsForUserCommand({UserPoolId:pool,Username:r.User.Username}));assert.equal(groups.Groups.length,0);receipt.confirmed=true;receipt.verifiedGroups=[];save();
 Amplify.configure({Auth:{Cognito:{userPoolId:pool,userPoolClientId:client}}});cognitoUserPoolsTokenProvider.setKeyValueStorage({async getItem(k){return memory.get(k)??null;},async setItem(k,v){memory.set(k,v);},async removeItem(k){memory.delete(k);},async clear(){memory.clear();}});
 const signed=await signIn({username,password,options:{authFlowType:'USER_SRP_AUTH'}});password=undefined;assert.equal(signed.isSignedIn,true);const session=await fetchAuthSession();assert.equal(session.tokens.accessToken.payload.sub,ownedSub);assert.equal((session.tokens.accessToken.payload['cognito:groups']??[]).length,0);
 const capture=await fetch(origin+'/capture-'+url.pathname.slice(1),{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify({persona:'ordinary',account:username,accessToken:session.tokens.accessToken.toString()})});const answer=await capture.json();assert.ok(capture.ok&&answer.verified,'ORDINARY_CORE_VERIFICATION_FAILED');memory.clear();receipt.ordinaryVerifiedAt=new Date().toISOString();save();console.log(JSON.stringify({ordinaryVerified:true,groups:[],passwordPersisted:false,tokensPersisted:false,waitingForRemainingPersona:true}));
 const deadline=Date.now()+15*60*1000;
 while(Date.now()<deadline){const s=await status();if(s.failed)throw Error('CORE_ACCEPTANCE_FAILED');if(s.ready){assert.ok(s.foreignVerified);receipt.fullAcceptanceObserved=true;receipt.acceptanceCompletedAt=new Date().toISOString();save();break;}await new Promise(resolve=>setTimeout(resolve,3000));}
 assert.ok(receipt.fullAcceptanceObserved,'REMAINING_AUTHENTICATION_NOT_COMPLETED_WITHIN_15_MINUTES');
}catch(e){receipt.failedAt=new Date().toISOString();receipt.errorName=e.name;receipt.errorCode=e.code??e.message?.replace(/[^A-Z0-9_]/g,'').slice(0,120);save();console.log(JSON.stringify({failed:true,errorName:e.name,errorCode:receipt.errorCode,automaticRetry:false}));process.exitCode=1;}
finally{
 password=undefined;memory.clear();
 if(created){try{assert.ok(ownedSub&&receipt.createdUsername);const u=await c.send(new AdminGetUserCommand({UserPoolId:pool,Username:receipt.createdUsername}));assert.equal(u.UserAttributes.find(a=>a.Name==='sub')?.Value,ownedSub,'CLEANUP_PROVENANCE_MISMATCH');const g=await c.send(new AdminListGroupsForUserCommand({UserPoolId:pool,Username:receipt.createdUsername}));assert.equal(g.Groups.length,0,'UNEXPECTED_GROUP_CHANGE');const d=await c.send(new AdminDeleteUserCommand({UserPoolId:pool,Username:receipt.createdUsername}));receipt.deleteRequestId=d.$metadata.requestId;let absent=false;try{await c.send(new AdminGetUserCommand({UserPoolId:pool,Username:receipt.createdUsername}));}catch(e){if(e.name==='UserNotFoundException')absent=true;else throw e;}assert.ok(absent,'ACCOUNT_CLEANUP_UNCONFIRMED');const after=await users();receipt.finalUserCount=after.length;receipt.finalUsersSha256=hash(canonical(after));assert.equal(receipt.finalUsersSha256,baseline,'EXISTING_USERS_CHANGED');receipt.cleanup='DELETED_AND_ABSENT';receipt.existingUsersPreserved=true;receipt.cleanupAt=new Date().toISOString();save();console.log(JSON.stringify({temporaryAccountRemoved:true,existingUsersPreserved:true,finalUserCount:after.length}));}catch(e){receipt.cleanup='BLOCKED';receipt.cleanupErrorName=e.name;save();console.log(JSON.stringify({cleanupBlocked:true,errorName:e.name}));process.exitCode=1;}}
}
