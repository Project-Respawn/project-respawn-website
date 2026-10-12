import assert from 'node:assert/strict';import crypto from 'node:crypto';
export const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export const hash=x=>crypto.createHash('sha256').update(canonical(x)).digest('hex');
export function plan(cases){
 const groups=new Map();for(const c of cases){const key=canonical({action:c.action,context:c.context});if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
 const batches=[];for(const [key,rows]of [...groups].sort(([a],[b])=>a.localeCompare(b))){const resources=[...new Set(rows.map(c=>c.resource))].sort();for(let n=0;n<resources.length;n+=50){const chunk=resources.slice(n,n+50),selected=rows.filter(c=>chunk.includes(c.resource)).sort((a,b)=>a.id.localeCompare(b.id));batches.push({id:hash({key,resources:chunk}),cases:selected,input:{ActionNames:[rows[0].action],ResourceArns:chunk,MaxItems:1000,ContextEntries:Object.entries(rows[0].context).filter(([,v])=>v!==null).sort(([a],[b])=>a.localeCompare(b)).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:ContextKeyName==='aws:CurrentTime'?'date':'string'}))}});}}
 return batches;
}
export function flatten(response){return response.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({...x,...y,EvalResourceName:y.EvalResourceName,EvalDecision:y.EvalResourceDecision})): [x]);}
export const throttled=e=>['Throttling','ThrottlingException','TooManyRequestsException','RequestLimitExceeded'].includes(e.code??e.name)||/\(Throttling\).*Rate exceeded/.test(e.message??'');
export async function runSuite({cases,send,api,policy,role,now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms)),random=Math.random,receipt=()=>{},minIntervalMs=15000,maxAttempts=6,budgetMs=1800000}){
 assert.ok(['simulate-custom-policy','simulate-principal-policy'].includes(api));assert.ok(minIntervalMs>=15000);assert.ok(maxAttempts>=1&&maxAttempts<=6);assert.ok(budgetMs>0&&budgetMs<=1800000);
 const start=now(),deadline=start+budgetMs,r={suiteHash:hash({cases,api,policy,role}),api,checks:[],attempts:[],complete:false};let next=start;
 const persist=()=>receipt(structuredClone(r));
 try{for(const batch of plan(cases)){let marker;const seen=new Set(),results=[];
 do{let response;for(let attempt=0;attempt<maxAttempts;attempt++){
 const delay=Math.max(0,next-now());assert.ok(now()+delay<deadline,'Validation deadline exceeded');await sleep(delay);assert.ok(now()<deadline,'Validation deadline exceeded');
 const at=now();next=at+minIntervalMs;const event={batch:batch.id,marker:marker??null,attempt:attempt+1,at};r.attempts.push(event);persist();
 try{response=await send(api,{...batch.input,...(api==='simulate-custom-policy'?{PolicyInputList:[JSON.stringify(policy)]}:{PolicySourceArn:role}),...(marker?{Marker:marker}:{})},{timeoutMs:Math.min(30000,deadline-now())});assert.ok(now()<deadline,'Validation deadline exceeded');event.outcome='response';break;}
 catch(e){event.outcome='error';event.code=e.code??e.name;event.message=e.message;persist();if(!throttled(e)||attempt+1===maxAttempts)throw e;const cap=Math.min(60000,5000*2**attempt),jitter=cap/2+random()*cap/2;assert.ok(jitter>=cap/2&&jitter<=cap);next=Math.max(next,now()+jitter);}
 }assert.ok(response);results.push(...flatten(response));if(response.IsTruncated){assert.ok(response.Marker&&!seen.has(response.Marker),'Invalid/repeated pagination marker');seen.add(response.Marker);marker=response.Marker;}else marker=undefined;persist();}while(marker);
 const passed=[];for(const c of batch.cases){const matches=results.filter(x=>x.EvalActionName===c.action&&x.EvalResourceName===c.resource);assert.equal(matches.length,1,'Missing/duplicate simulation result '+c.id);assert.equal(matches[0].EvalDecision,c.expected,c.id);passed.push({id:c.id,decision:matches[0].EvalDecision,evaluation:matches[0]});}r.checks.push(...passed);persist();
 }assert.equal(r.checks.length,cases.length);r.complete=true;persist();return r;}catch(e){r.failure=e.message;persist();throw e;}
}
export function verifyInstalled({role,inlineNames,attached,policy,workflow,expectedPolicy,expectedTrust,expectedWorkflow,expectedRoleArn,expectedMachineArn}){
 assert.equal(role.Arn,expectedRoleArn);assert.equal(canonical(role.AssumeRolePolicyDocument),canonical(expectedTrust));assert.ok(!role.PermissionsBoundary);assert.deepEqual(inlineNames,['FixedTwoFunctionRecovery']);assert.deepEqual(attached,[]);assert.equal(canonical(policy),canonical(expectedPolicy));assert.equal(workflow.stateMachineArn,expectedMachineArn);assert.equal(workflow.roleArn,expectedRoleArn);assert.equal(workflow.status,'ACTIVE');assert.equal(canonical(JSON.parse(workflow.definition)),canonical(expectedWorkflow));return true;
}
