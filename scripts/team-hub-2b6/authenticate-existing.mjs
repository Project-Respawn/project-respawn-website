import assert from 'node:assert/strict';
import {Amplify} from 'aws-amplify';import {signIn,fetchAuthSession} from 'aws-amplify/auth';import {cognitoUserPoolsTokenProvider} from 'aws-amplify/auth/cognito';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';
// Approved normal test-account mechanism; secret input is never echoed or saved.
export async function authenticateExisting(){
 assert.ok(process.stdin.isTTY,'Private terminal required');process.stdin.setRawMode(true);process.stdin.resume();
 console.log('Private input ready; echo disabled.');
 let password='';
 try{password=await new Promise((resolve,reject)=>{let value='';const listener=b=>{for(const ch of b.toString()){if(ch==='\u0003'){process.stdin.off('data',listener);reject(Error('CANCELLED'));return;}if(ch==='\r'||ch==='\n'){process.stdin.off('data',listener);resolve(value);value='';return;}value+=ch;}};process.stdin.on('data',listener);});}
 finally{process.stdin.setRawMode(false);process.stdin.pause();}
 const memory=new Map(),sessions=new Map(),attempts=[];
 Amplify.configure({Auth:{Cognito:{userPoolId:acceptedCore.environmentContract.poolId,userPoolClientId:acceptedCore.environmentContract.clientId}}});
 cognitoUserPoolsTokenProvider.setKeyValueStorage({async setItem(k,v){memory.set(k,v)},async getItem(k){return memory.get(k)??null},async removeItem(k){memory.delete(k)},async clear(){memory.clear()}});
 try{for(const [persona,username]of [['admin','superadmin@respawntest.test'],['ordinary','member@respawntest.test']]){
  memory.clear();try{const r=await signIn({username,password});assert.ok(r.isSignedIn,'EXISTING_ACCOUNT_AUTH_INCOMPLETE');const session=await fetchAuthSession();assert.equal(session.tokens.idToken.payload.email,username);sessions.set(persona,Object.fromEntries(memory));attempts.push({persona,authenticated:true,method:'NORMAL_AMPLIFY_IN_MEMORY'});}
  catch(e){attempts.push({persona,authenticated:false,errorName:e.name});break;}
 }return {sessions,attempts};}finally{password='';memory.clear();}
}
