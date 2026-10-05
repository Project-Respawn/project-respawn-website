import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import {read,save,dir} from './common.mjs';
assert.equal(read(dir+'/lockdown-installed.json').firstCreateAuthorityEffective,false);
assert.equal(read(dir+'/lockdown-live-validation.json').failures.length,0);
const api=read(dir+'/ownership.json').api.ApiId;
const endpoint='https://'+api+'.execute-api.eu-north-1.amazonaws.com/v1/team-hub/preview';
const page='public/__teamhub_acceptance_20261005.html';assert.ok(!fs.existsSync(page),'Do not overwrite an existing page');
const html=`<!doctype html><html><meta charset="utf-8"><title>Team Hub acceptance</title><body><h1>Team Hub live verification</h1><p>This page uses your existing Ntgre session inside this browser. It reports only sanitized test results; credentials and tokens stay in the browser.</p><pre id="result">Running…</pre><script type="module">
import { Amplify } from '/node_modules/.vite/deps/aws-amplify.js';
import { fetchAuthSession } from '/node_modules/.vite/deps/aws-amplify_auth.js';
const endpoint=${JSON.stringify(endpoint)};
const show=v=>document.getElementById('result').textContent=JSON.stringify(v,null,2);
const call=async token=>{const r=await fetch(endpoint,{headers:token?{Authorization:'Bearer '+token}:{},cache:'no-store'});let body=null;try{body=await r.json()}catch{}return {status:r.status,body}};
const report=async result=>{show(result);await fetch('http://127.0.0.1:48763/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});};
try {
 const outputs=await (await fetch('/amplify_outputs.json',{cache:'no-store'})).json();
 if(outputs.auth.user_pool_id!=='eu-north-1_n24iLL7QE'||outputs.auth.user_pool_client_id!=='1iq7ovjaf7d16imdvbqgfgvf86')throw Error('Wrong Ntgre outputs');
 Amplify.configure(outputs);
 const noToken=(await call()).status,invalidToken=(await call('invalid-team-hub-verification')).status;
 const session=await fetchAuthSession(),token=session.tokens?.accessToken?.toString();
 if(!token){await report({at:new Date().toISOString(),sessionAvailable:false,noToken,invalidToken});document.getElementById('result').append(' Sign in at localhost:5174 using your existing account, then reload this page.');}
 else {
  const parts=token.split('.'),claims=JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
  const tamper=patch=>{const p=[...parts];p[1]=btoa(JSON.stringify({...claims,...patch})).replaceAll('=','').replaceAll('+','-').replaceAll('/','_');return p.join('.')};
  const wrongIssuer=(await call(tamper({iss:'https://wrong-issuer.example.invalid'}))).status;
  const wrongClient=(await call(tamper({client_id:'wrong-client',aud:'wrong-client'}))).status;
  const good=await call(token),b=good.body??{};
  const preview={contractVersion:b.contractVersion,environment:b.environment,preview:b.preview,nonProduction:b.nonProduction,dataAuthority:b.dataAuthority,team:b.team?{id:b.team.id,name:b.team.name,realBusinessRecord:b.team.realBusinessRecord}:null};
  const contractValid=b.contractVersion==='team-hub.v1'&&b.environment==='Ntgre'&&b.preview===true&&b.nonProduction===true&&b.dataAuthority==='SYNTHETIC'&&b.team?.realBusinessRecord===false;
  await report({at:new Date().toISOString(),sessionAvailable:true,noToken,invalidToken,wrongIssuer,wrongClient,validIdentity:good.status,identityMatches:claims.iss==='https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE'&&claims.client_id==='1iq7ovjaf7d16imdvbqgfgvf86',contractValid,preview});
 }
}catch{await report({at:new Date().toISOString(),error:'Browser verification could not complete; inspect the local page without sharing tokens.'})}
</script></body></html>`;
fs.writeFileSync(page,html);
const server=http.createServer((req,res)=>{const origin=req.headers.origin;if(origin!=='http://localhost:5174'){res.writeHead(403);return res.end();}res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}if(req.method!=='POST'||req.url!=='/result'){res.writeHead(404);return res.end();}let body='';req.on('data',x=>{body+=x;if(body.length>16000)req.destroy()});req.on('end',()=>{try{const v=JSON.parse(body),out={at:typeof v.at==='string'?v.at:null,endpoint};for(const key of ['sessionAvailable','identityMatches','contractValid'])if(typeof v[key]==='boolean')out[key]=v[key];for(const key of ['noToken','invalidToken','wrongIssuer','wrongClient','validIdentity'])if(Number.isInteger(v[key]))out[key]=v[key];if(v.error)out.error='Browser verification incomplete';if(v.preview){const p=v.preview;out.preview={contractVersion:p.contractVersion==='team-hub.v1'?p.contractVersion:null,environment:p.environment==='Ntgre'?'Ntgre':null,preview:p.preview===true,nonProduction:p.nonProduction===true,dataAuthority:p.dataAuthority==='SYNTHETIC'?'SYNTHETIC':null,syntheticTeam:p.team?.id==='synthetic-team-example'&&p.team?.realBusinessRecord===false};}out.wrongIdentityLimit='Tampered JWTs have invalid signatures; live 401 alone does not independently isolate issuer/client enforcement. Authorizer configuration and handler tests cover those fields.';out.passed=out.noToken===401&&out.invalidToken===401&&out.wrongIssuer===401&&out.wrongClient===401&&out.validIdentity===200&&out.identityMatches===true&&out.contractValid===true;save('live-auth',out);console.log(JSON.stringify(out));res.writeHead(200);res.end('Recorded sanitized results');if(out.passed){server.close();fs.unlinkSync(page);}}catch{res.writeHead(400);res.end('Invalid sanitized result');}});});server.listen(48763,'127.0.0.1',()=>console.log('Open http://localhost:5174/__teamhub_acceptance_20261005.html ; collector is loopback-only, tokens are never collected.'));
function cleanup(){if(fs.existsSync(page))fs.unlinkSync(page);server.close();}process.on('SIGINT',()=>{cleanup();process.exit(0)});process.on('SIGTERM',()=>{cleanup();process.exit(0)});

