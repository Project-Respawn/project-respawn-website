import fs from 'node:fs';
import {build} from 'esbuild';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const E='docs/architecture/team-hub-isolated-quota-execution-evidence-2026-10-12',B='.tmp/team-hub-isolated-quota-execution';
const mode=process.argv[2];
const entries={custody:'scripts/team-hub-isolated-execution/custody.mjs',capacity:'scripts/team-hub-isolated-quota/capacity-telemetry.mjs',live:'scripts/team-hub-describekey-execution/live-endpoint.mjs',metrics:'scripts/team-hub-describekey-execution/metrics.mjs'};
assert.ok(entries[mode]);
await build({entryPoints:[entries[mode]],outfile:B+'/'+mode+'.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'receipt-and-reviewed-quota-binding',setup(b){b.onLoad({filter:/\.mjs$/},({path})=>{
 let s=fs.readFileSync(path,'utf8');
 s=s.replaceAll('docs/architecture/team-hub-isolated-execution-evidence-2026-10-12',E).replaceAll('docs/architecture/team-hub-isolated-quota-evidence-2026-10-12',E);
 if(['live','metrics'].includes(mode))s=s.replaceAll('docs/architecture/team-hub-describekey-execution-evidence-2026-10-12',E);
 if(mode==='custody'&&path.replaceAll('\\','/').endsWith('/read.mjs'))s=s.replace("JSON.stringify(v,null,2)","JSON.stringify(v,(key,value)=>key==='Tags'?undefined:value,2)");
 if(path.replaceAll('\\','/').endsWith('/custody.mjs')){
 s=s.replace("read(P+'/candidate.json')","read('docs/architecture/team-hub-isolated-quota-evidence-2026-10-12/candidate.json')");
 s=s.replace('requireReservedConcurrency(r.accountSettings,t.Resources.CursorProbe.Properties.ReservedConcurrentExecutions);',"assert.equal(Object.hasOwn(t.Resources.CursorProbe.Properties,'ReservedConcurrentExecutions'),false);assert.ok(r.accountSettings.AccountLimit.UnreservedConcurrentExecutions>=1);");
 s=s.replace("'lambda:PutFunctionConcurrency','lambda:DeleteFunctionConcurrency',",'');
 s=s.replace("r.operatorUser=(await aws", "r.readRole=(await aws('iam','get-role',{RoleName:'ProjectRespawn-TeamHub-Ntgre-ParityRead'})).Role;save('custody',r);r.operatorUser=(await aws");
 s=s.replace("'iam:CreateRole','iam:GetRole'", "'iam:CreateRole','iam:TagRole','iam:UntagRole','iam:ListRolePolicies','iam:ListAttachedRolePolicies','iam:GetRole'");
 }
 return {contents:s,loader:'js'};
 });}}]});
await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[B+'/'+mode+'.mjs'],{windowsHide:true,stdio:'inherit'});c.on('exit',code=>code===0?resolve():reject(Error(mode+' failed '+code)));});
