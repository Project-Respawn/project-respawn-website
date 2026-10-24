// Read-only AWS policy validation. No publication, change sets, role creation or invocation.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const E='docs/architecture/production-team-hub-tagging-recovery-2026-10-24';
const read=p=>JSON.parse(fs.readFileSync(p)),digest=v=>createHash('sha256').update(v).digest('hex');
const m=read(E+'/candidate.PROPOSED.json'),security=read(m.security.path),product=read(m.product.path);
assert.equal(digest(fs.readFileSync(m.security.path)),m.security.sha256);assert.equal(digest(fs.readFileSync(m.product.path)),m.product.sha256);
const original=read('.codex-worktrees/team-hub-production-preparation/docs/architecture/production-team-hub-deployment-evidence-2026-10-21/security-validation.json');const secret=read('docs/architecture/production-team-hub-permissions-execution-2026-10-24/rollback-resource-inventory.json').secret.ARN;const translate=v=>typeof v==='string'?v.replaceAll('proof00001','9wk4a41l5m').replaceAll('arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Production-Cursor-Aa0Bb1',secret):Array.isArray(v)?v.map(translate):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,translate(x)])):v;const old=translate(original);
const B='.tmp/team-hub-production-tagging/security';fs.mkdirSync(B,{recursive:true});
const resolve=v=>Array.isArray(v)?v.map(resolve):v&&typeof v==='object'?v['Fn::Sub']?v['Fn::Sub'].replaceAll('${HttpApi}','9wk4a41l5m'):Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x)])):v;
const resultPath=E+'/security-validation.json',sourceDigest=digest(JSON.stringify([m.security.sha256,m.product.sha256]));
const result=fs.existsSync(resultPath)?read(resultPath):{sourceDigest,awsWrites:0,policies:[],cases:[],templates:[],limitations:['Generated API identifier is explicitly synthetic; installed-policy and identity/resource-policy proof is required after deployment.','Simulations do not prove trust, organization restrictions, Lambda/KMS initialization, cursor decryption or real business acceptance.','Service-disjoint policy factoring is compared for service-valid action/resource pairs; arbitrary invalid-resource simulator tuples are not proof of a service-reaching permission.']};assert.equal(result.sourceDigest,sourceDigest);
const save=()=>fs.writeFileSync(resultPath,JSON.stringify(result,null,2)+'\n');
const pause=ms=>new Promise(r=>setTimeout(r,ms));let last=0;
async function aws(service,operation,input){
 await pause(Math.max(0,1000-(Date.now()-last)));const file=path.resolve(B+'/request.json');fs.writeFileSync(file,JSON.stringify(input));
 for(let attempt=0;;attempt++){last=Date.now();try{return JSON.parse(execFileSync('aws',[service,operation,'--cli-input-json','file://'+file,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:90000}));}catch(error){const message=String(error.stderr??'');if(attempt<4&&/Throttl|TooManyRequests|RequestLimitExceeded/.test(message)){await pause(Math.min(8000,500*2**attempt)+Math.floor(Math.random()*200));continue;}throw Error(service+' '+operation+' failed: '+message.slice(0,300));}}
}
const policies={
 'security.ExecutionRole':resolve(security.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument),
 'security.ExecutionBoundary':resolve(security.Resources.ExecutionBoundary.Properties.PolicyDocument),
 'security.PreparationCaller':resolve(security.Resources.PreparationCaller.Properties.PolicyDocument),
 'security.DeploymentCaller':resolve(security.Resources.DeploymentCaller.Properties.Policies[0].PolicyDocument),
};
const bucket=product.Resources.ParityReadFunction.Properties.Code.S3Bucket,newRuntime='arn:aws:s3:::'+bucket+'/'+m.runtime.key,newTemplate='arn:aws:s3:::'+bucket+'/'+m.product.key,newUrl='https://'+bucket+'.s3.eu-north-1.amazonaws.com/'+m.product.key;
function cases(id){const rows=old.cases.filter(c=>c.suite===id).map(c=>({name:c.name,action:c.action,resource:c.resource,allowed:c.allowed,context:c.context}));
 const doc=JSON.stringify(policies[id]);
 for(const [name,resource]of [['runtime',newRuntime],['template',newTemplate],['wrong-artifact','arn:aws:s3:::'+bucket+'/production/unreviewed-permissions.zip']])rows.push({name:'new-'+name,action:'s3:GetObject',resource,allowed:name!=='wrong-artifact'&&doc.includes(resource),context:{'aws:RequestedRegion':'eu-north-1'}});
 const c=rows.find(r=>r.action==='cloudformation:CreateChangeSet'&&r.allowed&&r.context?.['cloudformation:TemplateUrl']);if(c){rows.push({...c,name:'new-exact-template-url',context:{...c.context,'cloudformation:TemplateUrl':newUrl}});rows.push({...c,name:'wrong-new-template-url',allowed:false,context:{...c.context,'cloudformation:TemplateUrl':newUrl+'.wrong'}});}
 const allow=id==='security.ExecutionRole'||id==='security.ExecutionBoundary';
 for(const [name,resource,allowed,context]of [
 ['tag-stage-collection','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',allow,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-default-stage','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages/$default',allow,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-api-root','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-wrong-api','arn:aws:apigateway:eu-north-1::/apis/wrong12345/stages',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-wrong-region','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',false,{'aws:RequestedRegion':'us-east-1'}],
 ['tag-no-region','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',false,{}],
 ['tag-foreign-rest-api','arn:aws:apigateway:eu-north-1::/restapis/wrong12345/stages',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-domain','arn:aws:apigateway:eu-north-1::/domainnames/projectrespawn.com',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-secret','arn:aws:secretsmanager:eu-north-1:058264289478:secret:foreign-123456',false,{'aws:RequestedRegion':'eu-north-1'}],
 ])rows.push({name,action:'apigateway:TagResource',resource,allowed,context});
 rows.push({name:'untag-remains-ungranted',action:'apigateway:UntagResource',resource:'arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',allowed:false,context:{'aws:RequestedRegion':'eu-north-1'}});
 return rows;
}
async function simulate(label,policy,boundary,rows){
 const groups=new Map();for(const row of rows.filter(c=>!result.cases.some(x=>x.suite===label&&x.name===c.name))){const key=JSON.stringify([row.context,row.resource==='*',/^apigateway:(?:TagResource|UntagResource)$/.test(row.action)?row.action:'standard']);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 for(const group of groups.values()){
  const request={PolicyInputList:[JSON.stringify(policy)],...(boundary?{PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)]}:{}),ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],ContextEntries:Object.entries(group[0].context??{}).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v].flat().map(String),ContextKeyType:typeof v==='boolean'?'boolean':Array.isArray(v)?'stringList':'string'})),MaxItems:1000};
  let marker;const evaluations=[];do{const response=await aws('iam','simulate-custom-policy',{...request,...(marker?{Marker:marker}:{})});evaluations.push(...response.EvaluationResults);marker=response.IsTruncated?response.Marker:undefined;assert(!response.IsTruncated||marker);}while(marker);
  for(const c of group){const top=evaluations.find(e=>e.EvalActionName.toLowerCase()===c.action.toLowerCase()&&(e.EvalResourceName===c.resource||e.ResourceSpecificResults?.some(r=>r.EvalResourceName===c.resource)));assert(top,'MISSING_EVALUATION '+c.name);const specific=top.ResourceSpecificResults?.find(r=>r.EvalResourceName===c.resource),decision=specific?.EvalResourceDecision??top.EvalDecision;result.cases.push({...c,suite:label,decision,passed:(decision==='allowed')===c.allowed});save();assert.equal(decision==='allowed',c.allowed,label+': '+c.name+': '+decision);}
 }
 console.log(JSON.stringify({suite:label,passed:result.cases.filter(c=>c.suite===label).length}));
}
for(const [id,policy]of Object.entries(policies)){
 if(!result.policies.some(p=>p.id===id)){const analyzer=await aws('accessanalyzer','validate-policy',{policyType:'IDENTITY_POLICY',policyDocument:JSON.stringify(policy)});result.policies.push({id,size:JSON.stringify(policy).length,analyzer});save();const blocking=analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType));const expected=id==='security.ExecutionRole'||id==='security.ExecutionBoundary';if(expected){assert.equal(blocking.length,1,id+' UNEXPECTED_ANALYZER_FINDING');assert.equal(blocking[0].issueCode,'INVALID_ACTION');assert(blocking[0].findingDetails.includes('apigateway:TagResource'));}else assert.deepEqual(blocking,[]);result.analyzerExceptionAccepted=false;result.analyzerGate='BLOCKED_PENDING_EXPLICIT_OWNER_EXCEPTION';}
 await simulate(id,policy,null,cases(id));
}
for(const [identity,boundary]of [['security.ExecutionRole','security.ExecutionBoundary'],['security.DeploymentCaller','security.PreparationCaller']])await simulate('intersection:'+identity,policies[identity],policies[boundary],cases(identity));
for(const [id,t]of [['security',security],['product',product]])if(!result.templates.some(x=>x.id===id)){const validation=await aws('cloudformation','validate-template',{TemplateBody:JSON.stringify(t)});result.templates.push({id,validation});save();}
assert(result.cases.every(c=>c.passed));result.certificationPassed=true;result.passed=false;result.requiresAnalyzerException=true;save();console.log(JSON.stringify({certificationPassed:true,analyzerGate:'BLOCKED_PENDING_EXPLICIT_OWNER_EXCEPTION',policies:result.policies.length,cases:result.cases.length,templates:result.templates.length,awsWrites:0}));
