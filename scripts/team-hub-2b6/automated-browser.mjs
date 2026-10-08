import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
import {reuseSessions} from './reuse-sessions.mjs';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07';
const receipt={at:new Date().toISOString(),authentication:'APPROVED_NORMAL_AMPLIFY_SESSION_REUSE',personas:[],complete:false,awsInfrastructureWrites:0,liveBusinessWrites:0,tokensPersisted:false};
const save=()=>fs.writeFileSync(E+'/automated-browser.json',JSON.stringify(receipt,null,2)+'\n');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const auth=process.argv.includes('--private-stdin')?await (await import('./authenticate-existing.mjs')).authenticateExisting():await reuseSessions();receipt.sessionReuse=auth.attempts;receipt.authentication=process.argv.includes('--private-stdin')?'NORMAL_AMPLIFY_EXISTING_APPROVED_TEST_IDENTITIES':'APPROVED_NORMAL_AMPLIFY_SESSION_REUSE';save();
receipt.missingSessions=['admin','ordinary'].filter(p=>!auth.sessions.has(p));if(auth.sessions.size===0){receipt.blocker='NO_APPROVED_SESSION_AVAILABLE';save();console.log(JSON.stringify({complete:false,blocker:receipt.blocker}));process.exit(2);}
const profile=path.resolve('.tmp/team-hub-2b6/browser-profile-'+crypto.randomBytes(8).toString('hex'));fs.mkdirSync(profile,{recursive:true});
const browser=spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--no-proxy-server','--disable-background-networking','--disable-extensions','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,sequence=0;const pending=new Map(),listeners=new Map(),contexts=[];
async function send(method,params={},sessionId){const id=++sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP_TIMEOUT_'+method));},method==='Page.navigate'?120000:45000);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
try{
 const active=path.join(profile,'DevToolsActivePort');for(let i=0;!fs.existsSync(active)&&i<200;i++)await sleep(100);assert.ok(fs.existsSync(active),'AUTOMATED_BROWSER_UNAVAILABLE');
 const [port,endpoint]=fs.readFileSync(active,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=()=>reject(Error('BROWSER_CONNECTION_FAILED'));});
 ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const p=pending.get(message.id);if(!p)return;pending.delete(message.id);message.error?p.reject(Error('CDP_'+message.error.code)):p.resolve(message.result);}else listeners.get(message.sessionId)?.(message);};
 for(const persona of ['admin','ordinary','manager','coach','player'].filter(p=>auth.sessions.has(p==='admin'?'admin':'ordinary'))){
  const r={persona,pages:[],network:[],errors:[],contractChecks:false,complete:false};receipt.personas.push(r);save();
  const {browserContextId}=await send('Target.createBrowserContext',{disposeOnDetach:true});contexts.push(browserContextId);
  const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  const requests=new Map();listeners.set(sessionId,m=>{
   if(m.method==='Network.requestWillBeSent'){const q=m.params.request,u=new URL(q.url);if(!['http:','https:'].includes(u.protocol))return;const entry={host:u.hostname,path:u.pathname,method:q.method};if(q.postData&&u.hostname.endsWith('appsync-api.eu-north-1.amazonaws.com')){try{const query=JSON.parse(q.postData).query??'';entry.graphqlOperation=query.match(/(?:query|mutation)\s+(\w+)/)?.[1]??'UNKNOWN';}catch{entry.graphqlOperation='UNKNOWN';}}requests.set(m.params.requestId,entry);r.network.push(entry);}
   if(m.method==='Network.responseReceived'){const q=requests.get(m.params.requestId);if(q)q.status=m.params.response.status;}
   if(m.method==='Network.loadingFailed'){const q=requests.get(m.params.requestId);if(q)q.failed=true;}
   if(m.method==='Runtime.exceptionThrown')r.errors.push({kind:'UNCAUGHT_EXCEPTION',class:m.params.exceptionDetails.exception?.className??'Error'});
   if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')r.errors.push({kind:'CONSOLE_ERROR'});
  });
  for(const method of ['Page.enable','Runtime.enable','Network.enable'])await send(method,{},sessionId);
  const storage=auth.sessions.get(persona==='admin'?'admin':'ordinary');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.origin==='http://localhost:5177'){for(const [k,v] of Object.entries(${JSON.stringify(storage)}))localStorage.setItem(k,v);sessionStorage.setItem('team-hub-rehearsal-persona',${JSON.stringify(persona)});}`},sessionId);
  const evaluate=async expression=>{const v=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(v.exceptionDetails)throw Error('BROWSER_EVALUATION_FAILED');return v.result.value;};
  const paths=['/team-hub',...(persona==='admin'?['/dashboard/esports/teams','/team-hub/native-alpha']:persona==='ordinary'?[]:['/team-hub/native-alpha',persona==='player'?'/team-hub/native-alpha/champion-pool':'/team-hub/native-alpha/coach-review',...(persona==='manager'?['/team-hub/native-alpha/manage']:[])])];
  for(const route of paths){await send('Page.navigate',{url:'http://localhost:5177'+route},sessionId);let page;for(let n=0;n<90;n++){await sleep(500);page=await evaluate(`({path:location.pathname,title:document.querySelector('h1')?.textContent?.trim(),loading:/Loading/i.test(document.querySelector('main')?.innerText??document.body.innerText),unauth:location.pathname==='/join',error:!!document.querySelector('[role=alert],.state-panel--error'),create:[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Create Team'&&!b.disabled),empty:document.body.innerText.includes('No Team Hub access is currently assigned'),emptyState:document.querySelector('.empty-state')?.textContent?.trim().slice(0,100)})`);if(page?.title&&!page.loading&&(persona!== 'coach'||!route.endsWith('/coach-review')||page.title==='Coach Review'||page.error))break;}if(route.endsWith('/coach-review')&&persona==='coach')assert.match(page.title,/Coach Review/i,'COACH_EDIT_CONTROL_MISSING');r.pages.push({requested:route,...page});save();assert.equal(page.path,route,'UNEXPECTED_ROUTE');assert.ok(page.title,'PAGE_NOT_READY');assert.equal(page.error,false,'PAGE_ERROR');if(route==='/team-hub'){assert.equal(page.create,persona==='admin','INCORRECT_ADMIN_CONTROL');if(persona==='ordinary')assert.equal(page.empty,true,'ORDINARY_TEAM_LEAK');}}
  await evaluate(`document.querySelector('#team-rehearsal-panel button').click()`);let result;
  for(let n=0;n<120;n++){await sleep(500);result=await evaluate(`document.querySelector('#team-rehearsal-panel > span:last-child')?.textContent??''`);if(result.startsWith('{')||result.includes('failed'))break;}
  const check=JSON.parse(result);assert.equal(check.persona,persona);assert.equal(check.passed,true,'PERSONA_CONTRACT_FAILED');r.contractChecks=true;
  r.legacyTeamCalls=r.network.filter(q=>/readTeamHub|mutateTeamHub|(?:create|update|delete)(?:Team|TeamMembership|TeamRosterSlot|PlayerChampionPoolEntry)/i.test(q.graphqlOperation??''));
  r.foreignModules=r.network.filter(q=>/\/features\/(?:tournaments|creator-tools|commerce|community)\//i.test(q.path)&&!q.path.endsWith('.routes.js'));
  assert.equal(r.legacyTeamCalls.length,0,'LEGACY_TEAM_FALLBACK');assert.equal(r.foreignModules.length,0,'FOREIGN_DOMAIN_INITIALIZED');assert.equal(r.errors.length,0,'BROWSER_ERROR');
  r.complete=true;save();console.log(JSON.stringify({persona,complete:true,pages:r.pages.length,requests:r.network.length}));
  await send('Target.disposeBrowserContext',{browserContextId});contexts.splice(contexts.indexOf(browserContextId),1);listeners.delete(sessionId);
 }
 receipt.complete=receipt.personas.length===5&&receipt.personas.every(p=>p.complete);if(!receipt.complete)receipt.blocker='MISSING_APPROVED_AUTHENTICATED_PERSONA';save();
}catch(error){receipt.blocker=error.message.replace(/[^A-Z_0-9 -]/gi,'').slice(0,100);save();console.log(JSON.stringify({complete:false,blocker:receipt.blocker}));process.exitCode=1;}
finally{auth.sessions.clear();for(const browserContextId of contexts)try{await send('Target.disposeBrowserContext',{browserContextId});}catch{}try{await send('Browser.close');}catch{}ws?.close();browser.kill();receipt.authenticatedContextsDisposed=true;save();setTimeout(()=>process.exit(process.exitCode??0),1000);}
