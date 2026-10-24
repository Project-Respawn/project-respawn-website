// Synthetic browser verification only: no AWS, real identities or credentials.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {build} from 'esbuild';
import {parse,compileScript} from '@vue/compiler-sfc';
const root=path.resolve('.tmp/team-hub-permissions-browser');fs.mkdirSync(root,{recursive:true});
const component=path.resolve('src/features/Team Hub/TeamPermissions.vue');
const entry=`import {createApp,h,ref} from 'vue';import Permissions from ${JSON.stringify(component)};
const role=ref('MANAGER'),mode=new URLSearchParams(location.search).get('mode');
const members=[{id:'manager',displayName:'Manager',role:'MANAGER',status:'ACTIVE'},{id:'coach',displayName:'Coach',role:'COACH',status:'ACTIVE'},{id:'player',displayName:'Player',role:'PLAYER',status:'ACTIVE'}];
const records=members.map(m=>({membershipId:m.id,permissions:[],version:1}));window.saves=[];window.changeRole=value=>{role.value=value;};
window.permissionApi={async get(){if(mode==='unavailable')throw Error('NOT_FOUND');return {permissionContract:'team-hub.permissions.v1',team:{id:'team:synthetic'},members:structuredClone(records)};},async set(request){window.saves.push(structuredClone(request));await new Promise(r=>setTimeout(r,50));if(mode==='conflict')throw Error('Team Hub changed; refresh and try again');const grant=records.find(m=>m.membershipId===request.membershipId);grant.permissions=[...request.permissions];grant.version++;return {team:{id:'team:synthetic'},grant:structuredClone(grant)};}};
createApp({setup(){return ()=>h(Permissions,{teamId:'team:synthetic',members,teamRole:role.value,isPlatformAdmin:false});}}).mount('#app');`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'permissions-browser-entry.mjs'},outfile:root+'/app.js',bundle:true,format:'esm',platform:'browser',define:{__VUE_OPTIONS_API__:'true',__VUE_PROD_DEVTOOLS__:'false',__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:'false'},plugins:[{name:'synthetic-permissions',setup(b){
 b.onResolve({filter:/teamHub\.service\.js$/},()=>({path:'synthetic-service',namespace:'test-service'}));
 b.onLoad({filter:/.*/,namespace:'test-service'},()=>({contents:'export const getTeamPermissions=(...a)=>window.permissionApi.get(...a);export const setMemberPermissions=(...a)=>window.permissionApi.set(...a);',loader:'js'}));
 b.onLoad({filter:/\.vue$/},args=>{const {descriptor,errors}=parse(fs.readFileSync(args.path,'utf8'),{filename:args.path});assert.equal(errors.length,0);return {contents:compileScript(descriptor,{id:'permissions-browser',inlineTemplate:true}).content,resolveDir:path.dirname(args.path),loader:'js'};});
}}],logLevel:'silent'});
const css=parse(fs.readFileSync(component,'utf8')).descriptor.styles.map(s=>s.content).join('\n');
fs.writeFileSync(root+'/index.html','<!doctype html><html><head><meta charset="UTF-8"><style>'+css+'</style></head><body style="background:#0b0d12"><div id="app"></div><script type="module" src="/app.js"></script></body></html>');
const server=http.createServer((req,res)=>{const file=new URL(req.url,'http://localhost').pathname==='/app.js'?'app.js':'index.html';res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(root+'/'+file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const profile=path.join(root,'profile-'+Date.now());
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=spawn(chrome,['--headless=new','--no-first-run','--disable-sync','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
browser.unref();
const result={synthetic:true,awsWrites:0,checks:[],exceptions:[]};let ws;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 let port;for(let n=0;n<100;n++){try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await pause(100);}}assert(port,'Chrome CDP unavailable');
 const target=(await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page');assert(target);
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let seq=0;const pending=new Map();
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.delete(id))reject(Error('CDP_TIMEOUT'));},10000).unref();});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')result.exceptions.push(m.params.exceptionDetails.text);};
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!r.exceptionDetails,'Browser evaluation failed: '+(r.exceptionDetails?.exception?.description??''));return r.result.value;};
 const check=(name,passed)=>{assert(passed,name);result.checks.push(name);};
 const select=async id=>{await evaluate(`document.querySelector('select').value=${JSON.stringify(id)};document.querySelector('select').dispatchEvent(new Event('change',{bubbles:true}));`);await pause(30);};
 const ready=async mode=>{await call('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/?mode='+mode});for(let n=0;n<50;n++){await pause(50);if(await evaluate('Boolean(document.querySelector("table")) && !document.body.innerText.includes("Loading saved permissions")'))break;}await select('player');};
 await call('Page.enable');await call('Runtime.enable');await ready('success');
 check('feature table includes implemented and planned tools',await evaluate('document.querySelectorAll("tbody tr").length===12 && document.body.innerText.includes("Practice and scrims")'));
 check('planned tools cannot be granted',await evaluate('[...document.querySelectorAll("tbody tr")].filter(r=>r.innerText.includes("Planned")).every(r=>r.querySelector("input").disabled)'));
 await evaluate(`[...document.querySelectorAll('input')].find(i=>i.getAttribute('aria-label')==='Allow Write shared reviews').click()`);await pause(30);
 check('review write selects required read permissions',await evaluate('["View team player pools","Read shared reviews","Write shared reviews"].every(label=>document.querySelector(`input[aria-label="Allow ${label}"]`).checked)'));
 await evaluate('document.querySelector(".save").click();document.querySelector(".save").click()');await pause(160);
 check('one acknowledged save persists the exact selected grants',await evaluate('window.saves.length===1 && window.saves[0].permissions.join(",")==="pools.read,reviews.read,reviews.write" && document.body.innerText.includes("Permissions saved")'));
 await select('coach');check('Head Coach permissions are protected',await evaluate('[...document.querySelectorAll("tbody input")].every(i=>i.disabled)'));
 await select('manager');check('Manager remains above Head Coach with protected access',await evaluate('document.querySelector(".hierarchy strong").textContent==="Team Manager" && [...document.querySelectorAll("tbody input")].every(i=>i.disabled)'));
 await select('player');await evaluate('window.changeRole("COACH")');await pause(60);check('Head Coach can configure subordinate permissions',await evaluate('!document.querySelector("tbody input").disabled'));
 await evaluate('window.changeRole("PLAYER")');await pause(60);check('ordinary members cannot edit permissions',await evaluate('[...document.querySelectorAll("tbody input")].every(i=>i.disabled)'));
 await ready('conflict');await evaluate('document.querySelector("tbody input").click()');await pause(30);await evaluate('document.querySelector(".save").click()');await pause(160);
 check('stale save displays conflict and reloads without a success claim',await evaluate('document.querySelector("[role=alert]").innerText.includes("team changed") && !document.body.innerText.includes("Permissions saved and enforced") && window.saves.length===1'));
 await ready('unavailable');await evaluate('document.querySelector("tbody input").click()');await pause(30);
 check('missing backend never enables Save or claims persistence',await evaluate('document.querySelector(".save").disabled && window.saves.length===0 && document.body.innerText.includes("unsaved draft")'));
 check('no render exceptions',result.exceptions.length===0);result.passed=true;await call('Browser.close');
}catch(error){result.passed=false;result.error=error.message;}finally{
 ws?.close();browser.kill();server.closeAllConnections();await new Promise(r=>server.close(r));
 // Only delete the exact test-owned browser profile after validating its root.
 assert(path.dirname(path.resolve(profile))===root&&path.basename(profile).startsWith('profile-'));
 await Promise.race([new Promise(r=>{if(browser.exitCode!==null)r();else browser.once('exit',r);}),pause(2000)]);
 await pause(200);try{fs.rmSync(profile,{recursive:true,force:true});}catch{result.profileCleanupPending=true;}
 fs.writeFileSync(root+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
assert(result.passed,result.error);
