import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createServer} from 'vite';
import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';import {fromIni} from '@aws-sdk/credential-providers';
import {identity,pin,read,save} from './aws.mjs';
import {proofVersion} from '../../domains/team-hub/core-integration/handler.mjs';
pin();await identity();assert.equal(read('product-installed').verified,true);
const client=new LambdaClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1});
const route='/__team-core-'+crypto.randomBytes(16).toString('hex'),checks=[],personas=new Set(),started=new Date().toISOString();let failed=false,busy=false;
function record(){save('live-proof',{at:new Date().toISOString(),started,complete:personas.has('admin')&&personas.has('ordinary')&&!failed,failed,personas:[...personas],checks,authority:'LEGACY_WRITER',stage:'PRE_CUTOVER',normalWritesEnabled:false,businessWrites:0,cognitoMutations:0,tokensPersisted:false,cursorsPersisted:false,privateValuesPersisted:false});}
async function invoke(kind,label,event,verify){const r=await client.send(new InvokeCommand({FunctionName:'ProjectRespawn-TeamHub-Ntgre-Parity'+kind,InvocationType:'RequestResponse',Payload:Buffer.from(JSON.stringify(event))}));let pass=false;try{assert.equal(r.StatusCode,200);assert.ok(!r.FunctionError);const data=JSON.parse(Buffer.from(r.Payload).toString());verify(data);pass=true;return data;}finally{checks.push({at:new Date().toISOString(),kind,label,pass,requestId:r.$metadata.requestId});if(!pass)failed=true;record();}}
const minimal=x=>{assert.deepEqual(Object.keys(x).sort(),['displayName','subject']);assert.equal(typeof x.displayName,'string');assert.ok(x.displayName.length<=100);};
export async function run(token,email,expectedPersona){
 assert.ok(!failed,'LIVE_PROOF_STOPPED');const event={contractVersion:proofVersion,accessToken:token,operation:'authorization'};let isAdmin;
 const first=await invoke('Read','authorization-classification',event,r=>{assert.equal(r.ok,true);assert.equal(typeof r.data.teamsAdmin,'boolean');assert.equal(r.data.brandingManage,false);assert.equal(r.authority,'LEGACY_WRITER');assert.equal(r.normalWritesEnabled,false);});isAdmin=first.data.teamsAdmin;const persona=isAdmin?'admin':'ordinary';
 if(expectedPersona)assert.equal(persona,expectedPersona);assert.ok(!personas.has(persona),'ALREADY_VERIFIED_'+persona);const subject=JSON.parse(Buffer.from(token.split('.')[1],'base64url')).sub;
 for(const kind of ['Read','Command']){
  await invoke(kind,persona+'-authorization',event,r=>{assert.equal(r.ok,true);assert.equal(r.data.teamsAdmin,isAdmin);assert.equal(r.data.brandingManage,false);});
  if(isAdmin){assert.equal(typeof email,'string');assert.ok(email.includes('@'));
   await invoke(kind,'admin-exact-resolution',{...event,operation:'resolve',account:email},r=>{assert.equal(r.ok,true);minimal(r.data);assert.equal(r.data.subject,subject);});
   await invoke(kind,'admin-bounded-directory',{...event,operation:'search',query:email.slice(0,2).toLowerCase(),limit:1},r=>{assert.equal(r.ok,true);assert.ok(Array.isArray(r.data.items)&&r.data.items.length<=1);r.data.items.forEach(minimal);});
  }else await invoke(kind,'ordinary-directory-denied',{...event,operation:'search',query:'te',limit:1},r=>{assert.equal(r.ok,false);assert.equal(r.error.code,'FORBIDDEN');});
  const parts=token.split('.');const sig=Buffer.from(parts[2],'base64url');sig[0]^=1;parts[2]=sig.toString('base64url');
  await invoke(kind,persona+'-tampered-jwt',{...event,accessToken:parts.join('.')},r=>{assert.equal(r.ok,false);assert.equal(r.error.code,'FORBIDDEN');});
 }
 if(isAdmin){
  const template=read('product.template');for(const [id,r] of Object.entries(template.Resources).filter(([id,r])=>id.startsWith('Parity')&&r.Type==='AWS::ApiGatewayV2::Route')){
   const [method,path]=r.Properties.RouteKey.split(' ');const pathname=path.replace(/\{[^}]+\}/g,'team:core-integration-proof');
   const response=await fetch('https://t54b88casf.execute-api.eu-north-1.amazonaws.com'+pathname,{method,headers:{Authorization:'Bearer '+token,...(method!=='GET'?{'Content-Type':'application/json'}:{})},...(method!=='GET'?{body:'{}'}:{}),signal:AbortSignal.timeout(25000)});
   const pass=response.status===403;checks.push({at:new Date().toISOString(),label:'normal-route-denied',routeId:id,status:response.status,pass,requestId:response.headers.get('apigw-requestid')});if(!pass)failed=true;record();assert.ok(pass,'NORMAL_ROUTE_NOT_DENIED');
  }
 }
 personas.add(persona);record();return persona;
}
const html=`<!doctype html><title>Team Hub Core integration proof</title><h1>Team Hub → Core checks</h1><p>Use one existing Ntgre Admin/SuperAdmin account and one ordinary account. These checks read Core identity contracts only. Normal Team Hub writes remain disabled.</p><form id="signin"><label>Email <input id="email" type="email" autocomplete="username" required></label><label>Password <input id="password" type="password" autocomplete="current-password" required></label><button>Sign in / switch account</button></form><p id="status"></p><button id="run">Run checks using current session</button><pre id="out"></pre><script type="module">import {Amplify} from 'aws-amplify';import {signIn,signOut,fetchAuthSession} from 'aws-amplify/auth';import outputs from '/amplify_outputs.json';Amplify.configure(outputs);document.querySelector('#signin').onsubmit=async e=>{e.preventDefault();const p=document.querySelector('#password');try{await signOut();const r=await signIn({username:document.querySelector('#email').value.trim(),password:p.value});document.querySelector('#status').textContent=r.isSignedIn?'Signed in. Run checks.':'Sign-in needs '+r.nextStep.signInStep;}catch(e){document.querySelector('#status').textContent=e.name;}finally{p.value='';}};document.querySelector('#run').onclick=async()=>{const out=document.querySelector('#out');try{const s=await fetchAuthSession();if(!s.tokens?.accessToken){out.textContent='Sign in first.';return;}out.textContent='Checking both Team Hub runtimes and normal-route denials...';const r=await fetch('${route}/run',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.tokens.accessToken.toString()},body:JSON.stringify({email:s.tokens.idToken?.payload.email??document.querySelector('#email').value.trim()})});out.textContent=JSON.stringify(await r.json(),null,2);}catch(e){out.textContent='Session unavailable: '+e.name;}};</script>`;
if(!process.argv.includes('--no-helper')){
const server=await createServer({cacheDir:'.tmp/team-hub-core-integration/vite',server:{host:'localhost',port:5176,strictPort:true}});
server.middlewares.stack.unshift({route:'',handle:async(req,res,next)=>{
 if(req.url!==route&&req.url!==route+'/run')return next();res.setHeader('Cache-Control','no-store');
 try{assert.equal(req.headers.host,'localhost:5176');if(req.method==='GET'&&req.url===route){res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml(route,html));return;}
  assert.equal(req.method,'POST');assert.equal(req.headers.origin,'http://localhost:5176');assert.equal(req.headers['content-type'],'application/json');assert.ok(!busy,'CHECK_IN_PROGRESS');busy=true;
  let body='';for await(const chunk of req){body+=chunk;assert.ok(body.length<1024);}const {email}=JSON.parse(body);const token=req.headers.authorization?.replace(/^Bearer /,'');assert.ok(token&&token.length<16000);
  const persona=await run(token,email);const result={passed:true,persona,complete:personas.size===2,checks:checks.length};res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));console.log(JSON.stringify(result));
 }catch(error){res.statusCode=400;res.end(JSON.stringify({passed:false,stopped:failed,code:error.message?.startsWith('ALREADY_VERIFIED_')?error.message:'CHECK_FAILED'}));console.log(JSON.stringify({passed:false,stopped:failed,errorName:error.name}));}finally{busy=false;}
}});
await server.listen();save('local-helper',{url:'http://localhost:5176'+route,tokensPersisted:false});console.log('Helper ready: http://localhost:5176'+route);
}
