import net from 'node:net';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {Amplify} from 'aws-amplify';import {signIn,fetchAuthSession,signOut} from 'aws-amplify/auth';import {cognitoUserPoolsTokenProvider} from 'aws-amplify/auth/cognito';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';
process.argv.push('--no-helper');const {run}=await import('./live.mjs');
const memory=new Map();Amplify.configure({Auth:{Cognito:{userPoolId:acceptedCore.environmentContract.poolId,userPoolClientId:acceptedCore.environmentContract.clientId}}});
cognitoUserPoolsTokenProvider.setKeyValueStorage({async setItem(k,v){memory.set(k,v)},async getItem(k){return memory.get(k)??null},async removeItem(k){memory.delete(k)},async clear(){memory.clear()}});
const nonce=crypto.randomBytes(24).toString('hex');let resolveInput,rejectInput;const input=new Promise((resolve,reject)=>{resolveInput=resolve;rejectInput=reject;});
const server=net.createServer(socket=>{let value='';socket.on('data',b=>{value+=b.toString();if(value.length>1024)socket.destroy();});socket.on('end',()=>{if(value.startsWith(nonce+'\n'))resolveInput(value.slice(nonce.length+1));value='';});socket.on('error',()=>{});});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(49184,'127.0.0.1',resolve);});console.log(JSON.stringify({privateInputReady:true,nonce,credentialsRecorded:false}));
const timer=setTimeout(()=>rejectInput(Error('PRIVATE_INPUT_EXPIRED')),300000);let password='';
try{password=await input;clearTimeout(timer);server.close();
 for(const [persona,username] of [['admin','superadmin@respawntest.test'],['ordinary','member@respawntest.test']]){
  await signOut();const auth=await signIn({username,password});assert.ok(auth.isSignedIn,'EXISTING_ACCOUNT_AUTH_INCOMPLETE');const session=await fetchAuthSession();
  await run(session.tokens.accessToken.toString(),username,persona);console.log(JSON.stringify({persona,passed:true}));await signOut();memory.clear();
 }
 console.log(JSON.stringify({complete:true,authentication:'NORMAL_AMPLIFY_EXISTING_TEST_ACCOUNTS',passwordChanges:0}));
}catch(error){console.log(JSON.stringify({complete:false,errorName:error.name,code:error.code??null}));process.exitCode=1;}
finally{clearTimeout(timer);server.close();password='';try{await signOut();}catch{}memory.clear();}
