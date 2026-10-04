// Explicitly local-sandbox accounts. No email delivery and no stored passwords.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {CognitoIdentityProviderClient, AdminCreateUserCommand, AdminGetUserCommand, AdminAddUserToGroupCommand, AdminListGroupsForUserCommand, ListGroupsCommand, AdminSetUserPasswordCommand} from '@aws-sdk/client-cognito-identity-provider';
import {fromIni} from '@aws-sdk/credential-providers';

const roles=['SuperAdmin','Admin','Staff','Moderator','Trainer','Therapist','StreamingPartner','AffiliatePartner','Member','BetaMember'];
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const mode=process.argv[2];
if(!['create','passwords','status'].includes(mode))throw Error('Usage: node scripts/ntgre-role-test-accounts.mjs create|passwords|status');
const env={...process.env,AWS_PROFILE:'default',AWS_REGION:'eu-north-1'};
// Resolve the pool from outputs, then prove ownership against the protected live sandbox.
execFileSync(process.execPath,['scripts/validate-local-amplify-outputs.mjs'],{cwd:root,env,stdio:'inherit',windowsHide:true});
const identity=JSON.parse(execFileSync('aws',['sts','get-caller-identity','--profile','default','--region','eu-north-1','--output','json'],{encoding:'utf8',windowsHide:true}));
if(identity.Account!=='058264289478')throw Error('Wrong AWS account');
const outputs=read('amplify_outputs.json'),core=read('config/environments/Ntgre.core.json');
const pool=outputs.auth.user_pool_id;
if(core.environment!=='Ntgre'||pool!==core.poolId||outputs.auth.user_pool_client_id!==core.clientId)throw Error('Ntgre identity contract mismatch');
const client=new CognitoIdentityProviderClient({region:'eu-north-1',credentials:fromIni({profile:'default'})});
const existingGroups=[];let next;
do{const page=await client.send(new ListGroupsCommand({UserPoolId:pool,NextToken:next}));existingGroups.push(...page.Groups.map(g=>g.GroupName));next=page.NextToken;}while(next);
if(roles.some(r=>!existingGroups.includes(r)))throw Error('Required role group missing');
const email=r=>r.toLowerCase()+'@respawntest.test';
async function get(r){try{return await client.send(new AdminGetUserCommand({UserPoolId:pool,Username:email(r)}));}catch(e){if(e.name==='UserNotFoundException')return null;throw e;}}
async function groups(u){const result=[];let token;do{const p=await client.send(new AdminListGroupsForUserCommand({UserPoolId:pool,Username:u,NextToken:token}));result.push(...p.Groups.map(g=>g.GroupName));token=p.NextToken;}while(token);return result;}
// Hidden terminal entry: the password is never a command argument, file or log value.
function secret(prompt){if(!process.stdin.isTTY)throw Error('Run passwords in your own interactive terminal. Never paste a password into chat.');return new Promise((resolve,reject)=>{let value='';process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();const done=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};const onData=data=>{for(const ch of data.toString()){if(ch==='\u0003'){done();reject(Error('Cancelled'));return;}if(ch==='\r'||ch==='\n'){done();resolve(value);return;}if(ch==='\u007f'||ch==='\b'){value=value.slice(0,-1);continue;}if(ch>=' ')value+=ch;}};process.stdin.on('data',onData);});}
try{
 let password;
 if(mode==='passwords'){
  // Inspect every target before prompting or modifying any password.
  for(const r of roles){const u=await get(r);if(!u||JSON.stringify(await groups(u.Username))!==JSON.stringify([r]))throw Error('Missing account or unexpected groups: '+email(r));}
  console.log('Set one shared password for these ten Ntgre-only test accounts. Input is not logged.');
  const piped=process.argv.includes('--password-stdin');
  if(piped&&process.stdin.isTTY)throw Error('--password-stdin requires redirected input');
  password=piped?fs.readFileSync(0,'utf8').replace(/\r?\n$/,''):await secret('New test password: ');
  const confirmation=piped?password:await secret('Repeat password: ');
  if(password!==confirmation)throw Error('Passwords differ; nothing changed');
  if(password.length<8||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password)||! /[^A-Za-z0-9\s]/.test(password)||/^\s|\s$/.test(password))throw Error('Use at least 8 characters with uppercase, lowercase, a number and a symbol, without leading/trailing spaces. Nothing changed.');
 }
 for(const r of roles){
  let u=await get(r);
  if(!u&&mode==='create'){
   await client.send(new AdminCreateUserCommand({UserPoolId:pool,Username:email(r),UserAttributes:[{Name:'email',Value:email(r)},{Name:'email_verified',Value:'true'}],MessageAction:'SUPPRESS'}));
   u=await get(r);
  }
  if(!u){console.log(email(r)+' — absent');continue;}
  let membership=await groups(u.Username);
  if(membership.some(g=>g!==r))throw Error('Unexpected existing group membership; refusing to alter '+email(r));
  if(mode==='create'&&!membership.includes(r)){await client.send(new AdminAddUserToGroupCommand({UserPoolId:pool,Username:u.Username,GroupName:r}));membership=await groups(u.Username);}
  if(mode==='passwords')await client.send(new AdminSetUserPasswordCommand({UserPoolId:pool,Username:u.Username,Password:password,Permanent:true}));
  u=await get(r);
  if(mode!=='status'&&(membership.length!==1||membership[0]!==r||!u.Enabled||!u.UserAttributes.some(a=>a.Name==='email_verified'&&a.Value==='true')))throw Error('Account readback failed: '+email(r));
  if(mode==='passwords'&&u.UserStatus!=='CONFIRMED')throw Error('Password confirmation failed: '+email(r));
  console.log(email(r)+' | '+membership.join(',')+' | '+u.UserStatus);
 }
 password=undefined;
}catch(e){console.error('Stopped: '+(e.name||'Error')+'. '+(e.$metadata?'AWS rejected the operation; no secrets logged.':e.message));process.exitCode=1;}
