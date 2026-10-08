import fs from 'node:fs';import crypto from 'node:crypto';import http from 'node:http';import {spawn} from 'node:child_process';import {build} from 'esbuild';
import {LambdaClient,InvokeCommand} from '@aws-sdk/client-lambda';import {fromIni} from '@aws-sdk/credential-providers';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';
// Reuse only the two explicitly approved test identities through normal Amplify.
// No browser profile/database inspection, no password reset, and no token files.
export async function reuseSessions(){
 const nonce=crypto.randomBytes(24).toString('hex'),route='/capture-'+nonce,sessions=new Map(),attempts=[];
 const origins=new Set([5174,5176,5177].map(p=>'http://localhost:'+p));
 const lambda=new LambdaClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1});
 let browserBundle='';
 const collector=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url===route+'.js'){res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','no-store');res.end(browserBundle);return;}
  if(req.url!==route||!origins.has(req.headers.origin)){res.writeHead(403);res.end();return;}
  res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Cache-Control','no-store');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  let input='';try{for await(const b of req){input+=b;if(input.length>64000)throw Error('LIMIT');}const body=JSON.parse(input);input='';
   if(!body.available){attempts.push({origin:req.headers.origin,sessionAvailable:false});res.end('{}');return;}
   const r=await lambda.send(new InvokeCommand({FunctionName:acceptedCore.lambdaArn,Payload:Buffer.from(JSON.stringify({environment:'Ntgre',accessToken:body.accessToken,contractVersion:'authorization.decision.v1',capability:'teams.admin'}))}));
   const answer=JSON.parse(Buffer.from(r.Payload).toString());if(!answer.ok)throw Error('CORE_REJECTED');
   const id=JSON.parse(Buffer.from(body.idToken.split('.')[1],'base64url')),access=JSON.parse(Buffer.from(body.accessToken.split('.')[1],'base64url'));
   const persona=['superadmin@respawntest.test','admin@respawntest.test'].includes(id.email)?'admin':id.email==='member@respawntest.test'?'ordinary':null;
   if(!persona||id.sub!==answer.data.subject||access.sub!==answer.data.subject||answer.data.allowed!==(persona==='admin'))throw Error('NOT_APPROVED_TEST_IDENTITY');
   const prefix='CognitoIdentityServiceProvider.'+acceptedCore.environmentContract.clientId+'.';
   const storage=Object.fromEntries(Object.entries(body.storage??{}).filter(([k,v])=>(k===prefix+'LastAuthUser'||k.startsWith(prefix+access.username+'.'))&&typeof v==='string'));
   sessions.set(persona,storage);attempts.push({origin:req.headers.origin,sessionAvailable:true,persona,coreVerified:true});res.end('{}');
  }catch{attempts.push({origin:req.headers.origin,sessionAvailable:false,reason:'NO_APPROVED_VERIFIED_SESSION'});res.writeHead(403);res.end('{}');}
 });
 await new Promise((resolve,reject)=>{collector.once('error',reject);collector.listen(49185,'127.0.0.1',resolve);});
 const page='.tmp/team-hub-2b6/session-'+nonce+'.html';
 const source=`import {Amplify} from 'aws-amplify';import {fetchAuthSession} from 'aws-amplify/auth';
 (async()=>{Amplify.configure({Auth:{Cognito:{userPoolId:${JSON.stringify(acceptedCore.environmentContract.poolId)},userPoolClientId:${JSON.stringify(acceptedCore.environmentContract.clientId)}}}});let body={available:false};try{const session=await fetchAuthSession();const email=session.tokens?.idToken?.payload.email;if(['superadmin@respawntest.test','admin@respawntest.test','member@respawntest.test'].includes(email)){const prefix='CognitoIdentityServiceProvider.'+${JSON.stringify(acceptedCore.environmentContract.clientId)}+'.';body={available:true,accessToken:session.tokens.accessToken.toString(),idToken:session.tokens.idToken.toString(),storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k===prefix+'LastAuthUser'||k.startsWith(prefix+session.tokens.accessToken.payload.username+'.')))};}}catch{}
 try{await fetch('http://127.0.0.1:49185${route}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});document.querySelector('#state').textContent=body.available?'Approved session checked. Automated testing can continue; this tab may be closed.':'No approved test session is available on this localhost origin. This tab may be closed.';}catch{document.querySelector('#state').textContent='Session reuse unavailable.';}body=null;
 })();`;
 browserBundle=(await build({stdin:{contents:source,resolveDir:process.cwd()},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent'})).outputFiles[0].text;
 const html=`<!doctype html><title>Team Hub automatic session reuse</title><p id="state">Checking an existing approved Ntgre test session automatically.</p><script src="http://127.0.0.1:49185${route}.js"></script>`;fs.writeFileSync(page,html);
 let extra;
 try{
  extra=http.createServer((req,res)=>{res.setHeader('Cache-Control','no-store');if(req.url!=='/'+page){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','text/html');res.end(html);});await new Promise((resolve,reject)=>{extra.once('error',reject);extra.listen(5176,'localhost',resolve);});
  for(const port of [5176,5174])spawn('cmd.exe',['/c','start','','http://localhost:'+port+'/'+page],{windowsHide:true,stdio:'ignore'});
  const until=Date.now()+90000;let reopened=false;while(Date.now()<until&&sessions.size<2){await new Promise(r=>setTimeout(r,1000));if(!reopened&&Date.now()>until-60000){reopened=true;spawn('cmd.exe',['/c','start','','http://localhost:5176/'+page],{windowsHide:true,stdio:'ignore'});}} 
  console.log(JSON.stringify({stage:'SESSION_REUSE',personas:[...sessions.keys()]}));return {sessions,attempts};
 }finally{if(extra){extra.close();extra.closeAllConnections();}collector.close();collector.closeAllConnections();browserBundle='';fs.unlinkSync(page);}
}
