import fs from 'node:fs';
import assert from 'node:assert/strict';
import net from 'node:net';
import {Amplify} from 'aws-amplify';
import {signIn, fetchAuthSession, signOut} from 'aws-amplify/auth';
import {cognitoUserPoolsTokenProvider} from 'aws-amplify/auth/cognito';

// Secrets enter through a non-echoing terminal, never arguments, files or evidence.
const E='docs/architecture/team-hub-2b4b-evidence-2026-10-06';
const core=JSON.parse(fs.readFileSync('config/environments/Ntgre.core.json'));
const outputs=JSON.parse(fs.readFileSync('amplify_outputs.json'));
assert.equal(outputs.auth.user_pool_id,core.poolId);
assert.equal(outputs.auth.user_pool_client_id,core.clientId);
const subjects=JSON.parse(fs.readFileSync(E+'/subjects.json')).subjects;
const helper=JSON.parse(fs.readFileSync(E+'/local-helper.json'));
assert.ok(helper.url.startsWith('http://localhost:5174/__team-hub-'));
const memory=new Map();
Amplify.configure(outputs);
cognitoUserPoolsTokenProvider.setKeyValueStorage({async setItem(k,v){memory.set(k,v)},async getItem(k){return memory.get(k)??null},async removeItem(k){memory.delete(k)},async clear(){memory.clear()}});
let password;
const pipe=process.argv[2];
if(pipe){
  assert.match(pipe,/^respawn-b4b-auth-[a-f0-9]{32}$/);
  password=await new Promise((resolve,reject)=>{
    const server=net.createServer(socket=>{let value='';socket.on('data',data=>{value+=data.toString();if(value.length>512)socket.destroy();});socket.on('end',()=>{if(value.startsWith(pipe+'\n')){server.close();resolve(value.slice(pipe.length+1));}value='';});socket.on('error',()=>{});});
    server.on('error',reject);server.listen(49183,'127.0.0.1',()=>console.log('Private loopback input ready.'));
  });
}else{
assert.ok(process.stdin.isTTY,'A non-echoing terminal is required');
process.stdin.setRawMode(true);
process.stdin.resume();
console.log('Secure input ready (no echo).');
password=await new Promise((resolve,reject)=>{
  let value='';
  const onData=data=>{for(const char of data.toString()){
    if(char==='\u0003'){process.stdin.off('data',onData);reject(Error('CANCELLED'));return;}
    if(char==='\r'||char==='\n'){process.stdin.off('data',onData);resolve(value);value='';return;}
    value+=char;
  }};
  process.stdin.on('data',onData);
});
process.stdin.pause();
}
const accounts={admin:'superadmin',manager:'admin',coach:'trainer',player:'member',outsider:'betamember'};
try{
  for(const [persona,account] of Object.entries(accounts)){
    memory.clear();
    const result=await signIn({username:account+'@respawntest.test',password});
    assert.equal(result.isSignedIn,true,'Account requires an unapproved authentication step');
    const session=await fetchAuthSession();
    assert.equal(session.tokens.accessToken.payload.sub,subjects[persona].subject);
    const response=await fetch(helper.url+'/capture',{method:'POST',headers:{Origin:'http://localhost:5174','Content-Type':'application/json',Authorization:'Bearer '+session.tokens.accessToken.toString()},body:'{}'});
    assert.equal(response.status,200,'Session acceptance failed');
    const accepted=await response.json();
    assert.equal(accepted.captured,persona);
    console.log(JSON.stringify({persona,signIn:'PASS',apiJwtAcceptance:'PASS',allReady:accepted.allReady}));
    await signOut();
  }
}catch(error){console.log(JSON.stringify({authenticationStopped:true,error:error.name}));process.exitCode=1;}
finally{password='';memory.clear();if(process.stdin.isTTY)process.stdin.setRawMode(false);}
