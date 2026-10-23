// Read-only certification against the newly proposed runtime/artifact bindings.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws,out,read,save} from './core-runtime-kms-inspect.mjs';import {sha,lambdaKey,secretKey,artifactBucket} from './deployment-prepare.mjs';
const m=read(out+'/manifest.json'),fresh=read(out+'/fresh-runtime-baseline.json');assert.equal(fresh.baselineMatched,true);assert.equal(fresh.actualAuthorizationContextAvailable,false);
const fn=fresh.configuration.FunctionArn,account='058264289478';
const resolve=v=>Array.isArray(v)?v.map(resolve):v&&typeof v==='object'?(v.Ref==='CursorSecret'||v['Fn::ImportValue']?.endsWith('-CursorSecretArn')?fresh.secretArn:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x)]))):v;
const translate=v=>typeof v==='string'?v.replaceAll('arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-Core-Production-Cursor-Aa0Bb1',fresh.secretArn):Array.isArray(v)?v.map(translate):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,translate(x)])):v;
const previous=read('docs/architecture/production-core-log-drift-evidence-2026-10-21/security-validation.json');fs.mkdirSync('.tmp/core-runtime-kms',{recursive:true});fs.mkdirSync(out+'/resolved-policies',{recursive:true});
const result={at:new Date().toISOString(),awsWrites:0,policies:[],cases:[],effectiveCases:[],actualSecretReferenceUsed:true,secretValueRetrieved:false,liveInvocationRetried:false,limits:['Denied live KMS context remains unavailable; simulations use explicit supplied models','Actual runtime initialization and real production contract acceptance require separate authorization','No complete organization-policy certification'],complete:false};
async function simulate(policy,boundary,cases,effective=false){
 const groups=new Map();for(const c of cases){const key=JSON.stringify(c.context)+(c.resource==='*'?' STAR':' ARN');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
 for(const group of groups.values()){
  const request={PolicyInputList:[JSON.stringify(policy)],...(boundary?{PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)]}:{}),ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],ContextEntries:Object.entries(group[0].context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[].concat(v).map(String),ContextKeyType:typeof v==='boolean'?'boolean':Array.isArray(v)?'stringList':'string'}))};
  const r=await aws('iam','simulate-custom-policy',request);
  for(const c of group){const top=r.EvaluationResults.find(v=>v.EvalActionName.toLowerCase()===c.action.toLowerCase()&&(v.EvalResourceName===c.resource||v.ResourceSpecificResults?.some(x=>x.EvalResourceName===c.resource)));assert.ok(top,c.name);const sub=top.ResourceSpecificResults?.find(x=>x.EvalResourceName===c.resource),decision=sub?.EvalResourceDecision??top.EvalDecision;const row={...c,decision,passed:(decision==='allowed')===c.allowed};(effective?result.effectiveCases:result.cases).push(row);save('security-validation.json',result);assert.ok(row.passed,c.policy+' '+c.name+' '+decision);}
 }
}
const extraRuntime=[];
for(const p of m.policies){const policy=resolve(read(p.path)),bytes=JSON.stringify(policy);assert.ok(bytes.length<=p.limit);const file=out+'/resolved-policies/'+p.id+'.json';fs.writeFileSync(file,bytes);const analyzer=await aws('accessanalyzer','validate-policy',{policyType:'IDENTITY_POLICY',policyDocument:bytes});assert.deepEqual(analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)),[]);result.policies.push({id:p.id,size:bytes.length,limit:p.limit,sha256:sha(bytes),analyzer});
 const cases=previous.cases.filter(c=>c.policy===p.id).map(c=>translate({...c}));
 const add=(name,action,resource,allowed,context={})=>{const c={policy:p.id,name,action,resource,allowed,context:{'aws:RequestedRegion':'eu-north-1',...context}};cases.push(c);if(p.id==='coreProduct.Runtime')extraRuntime.push(c);};
 const runtime=['coreProduct.Runtime','coreSecurity.RuntimeBoundary'].includes(p.id),execution=p.id.includes('Execution'),caller=p.id.includes('Caller');
 if(runtime){
  const direct={'kms:CallerAccount':account,'kms:EncryptionContext:aws:lambda:FunctionArn':fn};
  add('direct exact function decrypt','kms:Decrypt',lambdaKey,true,direct);add('service path remains allowed','kms:Decrypt',lambdaKey,true,{...direct,'kms:ViaService':'lambda.eu-north-1.amazonaws.com'});add('wrong present service remains denied','kms:Decrypt',lambdaKey,false,{...direct,'kms:ViaService':'s3.eu-north-1.amazonaws.com'});
  add('wrong account direct','kms:Decrypt',lambdaKey,false,{...direct,'kms:CallerAccount':'111111111111'});const noAccount={...direct};delete noAccount['kms:CallerAccount'];add('missing account direct','kms:Decrypt',lambdaKey,false,noAccount);
  const noContext={...direct};delete noContext['kms:EncryptionContext:aws:lambda:FunctionArn'];add('missing function context direct','kms:Decrypt',lambdaKey,false,noContext);
  for(const f of [fn+':$LATEST',fn+':1',fn+':live',fn.replace('Production','Ntgre'),fn.replace('Core','Tournament')])add('wrong function context direct '+f,'kms:Decrypt',lambdaKey,false,{...direct,'kms:EncryptionContext:aws:lambda:FunctionArn':f});
  for(const k of [secretKey,lambdaKey.replace('13ae83f9-bc5f-4486-a013-e07b9d7d52e7','00000000-0000-0000-0000-000000000000'),lambdaKey.replace('eu-north-1','us-east-1')])add('wrong key direct '+k,'kms:Decrypt',k,false,direct);
  for(const a of ['kms:CreateGrant','kms:RetireGrant','kms:GenerateDataKey','kms:Encrypt','kms:DescribeKey','kms:PutKeyPolicy','kms:ScheduleKeyDeletion'])add('runtime no extra KMS '+a,a,lambdaKey,false,direct);
  const sm={'kms:CallerAccount':account,'kms:EncryptionContext:SecretARN':fresh.secretArn};add('SM direct remains denied','kms:Decrypt',secretKey,false,sm);add('SM service remains allowed','kms:Decrypt',secretKey,true,{...sm,'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com'});add('wrong secret context remains denied','kms:Decrypt',secretKey,false,{...sm,'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:EncryptionContext:SecretARN':fresh.secretArn+'wrong'});
  add('no runtime role assumption','sts:AssumeRole',fresh.role.Role.Arn,false);
 }
 if(execution||caller){const oldArn='arn:aws:s3:::'+artifactBucket+'/'+m.installedProduct.key,newArn='arn:aws:s3:::'+artifactBucket+'/'+m.product.key;add('new exact product object','s3:GetObject',newArn,true);add('old exact rollback object','s3:GetObject',oldArn,true);add('wrong new product object','s3:GetObject',newArn+'wrong',false);add('no product object overwrite','s3:PutObject',newArn,false);
  if(caller){const context={'cloudformation:RoleArn':'arn:aws:iam::058264289478:role/ProjectRespawn-Core-Production-Execution','cloudformation:TemplateUrl':m.product.url},target='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Core-Production/proof';add('new exact product template URL','cloudformation:CreateChangeSet',target,true,context);add('old rollback template URL','cloudformation:CreateChangeSet',target,true,{...context,'cloudformation:TemplateUrl':m.installedProduct.url});add('wrong template URL','cloudformation:CreateChangeSet',target,false,{...context,'cloudformation:TemplateUrl':m.product.url+'wrong'});add('wrong execution role','cloudformation:CreateChangeSet',target,false,{...context,'cloudformation:RoleArn':'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Production-ReadProofExecution'});}
 }
 await simulate(policy,null,cases);
}
await simulate(resolve(read(m.policies.find(p=>p.id==='coreProduct.Runtime').path)),resolve(read(m.policies.find(p=>p.id==='coreSecurity.RuntimeBoundary').path)),extraRuntime,true);
// Explicit-deny controls with an extra wildcard Allow cannot bypass wrong service/account/context/key.
const identity=resolve(read(m.policies.find(p=>p.id==='coreProduct.Runtime').path)),negative=extraRuntime.filter(c=>!c.allowed&&c.action==='kms:Decrypt');const injected={...identity,Statement:[...identity.Statement,{Effect:'Allow',Action:'kms:Decrypt',Resource:'*'}]};
await simulate(injected,null,negative.map(c=>({...c,name:'injected Allow control '+c.name})),true);
result.complete=true;result.passed=true;save('security-validation.json',result);
const templates=[];for(const [name,a]of [['security',m.security],['product',m.product]]){const t=read(a.path),response=await aws('cloudformation','validate-template',{TemplateBody:JSON.stringify(t)});templates.push({name,sha256:a.sha256,response});}save('template-validation.json',{awsWrites:0,templates,passed:true});
console.log(JSON.stringify({policies:result.policies.length,cases:result.cases.length,effectiveCases:result.effectiveCases.length,templates:templates.length,passed:true,awsWrites:0}));
