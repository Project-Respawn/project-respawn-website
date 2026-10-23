// Read-only AWS certification. Synthetic generated identities are explicitly labelled.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {out,sha,lambdaKey,secretKey} from './deployment-prepare.mjs';
import {environment,tables,root} from './config.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const save=(n,v)=>fs.writeFileSync(out+'/'+n,JSON.stringify(v,null,2)+'\n');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function aws(service,operation,args=[]){
 for(let attempt=0;attempt<5;attempt++){
  await pause(300);
  try{return JSON.parse(execFileSync('aws',[service,operation,...args,'--region','eu-north-1','--profile','default','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true,maxBuffer:15*1024*1024,stdio:['ignore','pipe','pipe']}));}
  catch(e){if(/Throttl|Rate exceeded|TooManyRequests/.test(String(e.stderr))&&attempt<4){await pause(500*2**attempt);continue;}throw e;}
 }
}
export function resolve(value){
 if(Array.isArray(value))return value.map(resolve);
 if(!value||typeof value!=='object')return value;
 if(value['Fn::ImportValue']){
  const n=value['Fn::ImportValue'];if(n.endsWith('-CursorSecretArn'))return 'arn:aws:secretsmanager:eu-north-1:058264289478:secret:'+n.replace(/-CursorSecretArn$/,'-Cursor')+'-Aa0Bb1';
  if(n.endsWith('-HttpApiId'))return 'proof00001';
  return 'arn:aws:iam::058264289478:policy/'+n.replace(/Arn$/,'');
 }
 if(value.Ref==='CursorSecret')throw Error('LOCAL_SECRET_NEEDS_DOMAIN_RESOLUTION');
 if(value.Ref==='HttpApi')return 'proof00001';
 if(value['Fn::Sub'])return value['Fn::Sub'].replaceAll('${HttpApi}','proof00001');
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolve(v)]));
}
function policyResolve(value,domain){
 return resolve(JSON.parse(JSON.stringify(value).replaceAll('{"Ref":"CursorSecret"}',JSON.stringify({'Fn::ImportValue':`ProjectRespawn-${domain}-Production-CursorSecretArn`}))));
}
export function inspect(){
 const manifest=read(out+'/manifest.json'),policies=[],structures=[];
 for(const[k,a]of Object.entries({...manifest.products,...manifest.security})){
  assert.equal(sha(fs.readFileSync(a.path)),a.sha256);const t=read(a.path),domain=k.startsWith('core')?'Core':'TeamHub';
  const refs=[];function walk(v){if(!v||typeof v!=='object')return;if(v.Ref&&!t.Resources[v.Ref]&&!v.Ref.startsWith('AWS::'))refs.push(v.Ref);if(v['Fn::GetAtt']){const id=Array.isArray(v['Fn::GetAtt'])?v['Fn::GetAtt'][0]:v['Fn::GetAtt'].split('.')[0];if(!t.Resources[id])refs.push(id);}for(const x of Object.values(v))walk(x);}walk(t);assert.deepEqual(refs,[]);
  assert.doesNotMatch(JSON.stringify(t),/Ntgre|t54b88casf|eu-north-1_n24iLL7QE|1iq7ovjaf7d16imdvbqgfgvf86|\?{6}|core\/2b5a|team-hub\/cursor-runtime/);
  for(const[id,r]of Object.entries(t.Resources)){
   if(r.Type==='AWS::IAM::ManagedPolicy')policies.push({id:k+'.'+id,kind:'boundary',domain,policy:policyResolve(r.Properties.PolicyDocument,domain)});
   if(r.Type==='AWS::IAM::Role'){
    assert.ok(r.Properties.RoleName.length<=64);
    for(const p of r.Properties.Policies??[])policies.push({id:k+'.'+id,kind:'identity',domain,policy:policyResolve(p.PolicyDocument,domain)});
   }
   if(r.Type==='AWS::Lambda::Function')assert.equal(r.Properties.ReservedConcurrentExecutions,undefined);
   if(r.Type==='AWS::DynamoDB::Table'){assert.equal(r.DeletionPolicy,'Retain');assert.equal(r.Properties.DeletionProtectionEnabled,true);assert.equal(r.Properties.PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled,true);}
  }
  structures.push({stack:k,resources:Object.keys(t.Resources).length,sha256:a.sha256,allReferencesBound:true});
 }
 for(const p of policies){p.size=JSON.stringify(p.policy).length;assert.ok(p.size<=(p.kind==='boundary'?6144:10240),p.id+' quota '+p.size);}
 for(const a of Object.values(manifest.assets))assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 return {manifest,policies,structures};
}
function cases(p,m){
 const c=[],add=(name,action,resource,allowed,context={})=>c.push({name,action,resource,allowed,context:{'aws:RequestedRegion':'eu-north-1',...context}});
 const team=p.domain==='TeamHub',fn='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-'+p.domain+'-Production-'+(team?'ParityRead':'Contracts'),secret='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-'+p.domain+'-Production-Cursor-Aa0Bb1';
 const execution=/Execution/.test(p.id),caller=/Caller/.test(p.id),command=/Command/.test(p.id);
 const context={'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':environment.account,'kms:EncryptionContext:aws:lambda:FunctionArn':command?fn.replace('ParityRead','ParityCommand'):fn};
 if(execution){
  if(team){const api='arn:aws:apigateway:eu-north-1::/apis/proof00001';add('own-api-read','apigateway:GET',api,true);for(const action of ['apigateway:POST','apigateway:PATCH','apigateway:DELETE'])add('no-parent-api-mutation '+action,action,api,false);add('own-route-create','apigateway:POST',api+'/routes',true);add('no-api-create','apigateway:POST','arn:aws:apigateway:eu-north-1::/apis',false);add('no-foreign-api','apigateway:GET',api.replace('proof00001','t54b88casf'),false);add('no-api-tag-administration','apigateway:PUT','arn:aws:apigateway:eu-north-1::/tags/'+api,false);}
  for(const f of team?[fn,fn.replace('ParityRead','ParityCommand')]:[fn])for(const suffix of ['',':$LATEST'])for(const action of ['lambda:CreateFunction','lambda:UpdateFunctionCode','lambda:UpdateFunctionConfiguration','lambda:GetFunction'])add(f+suffix+action,action,f+suffix,true);
  for(const action of ['kms:Encrypt','kms:Decrypt','kms:DescribeKey']){const cx={...context};if(action==='kms:DescribeKey')delete cx['kms:EncryptionContext:aws:lambda:FunctionArn'];add(action,action,lambdaKey,true,cx);add('wrong-service '+action,action,lambdaKey,false,{...cx,'kms:ViaService':'s3.eu-north-1.amazonaws.com'});add('wrong-account '+action,action,lambdaKey,false,{...cx,'kms:CallerAccount':'111111111111'});}
  add('wrong-function-context','kms:Encrypt',lambdaKey,false,{...context,'kms:EncryptionContext:aws:lambda:FunctionArn':fn.replace('Production','Ntgre')});
  const roleNames=team?['ParityCommand','ParityRead']:['Contracts'];
  for(const name of roleNames){const role='arn:aws:iam::058264289478:role/ProjectRespawn-'+p.domain+'-Production-'+name,b='arn:aws:iam::058264289478:policy/ProjectRespawn-'+p.domain+'-Production-'+(team?name+'Boundary':'RuntimeBoundary');add('create '+name,'iam:CreateRole',role,true,{'iam:PermissionsBoundary':b});add('wrong-boundary '+name,'iam:CreateRole',role,false,{'iam:PermissionsBoundary':b+'Wrong'});add('pass '+name,'iam:PassRole',role,true,{'iam:PassedToService':'lambda.amazonaws.com'});add('wrong-service-pass '+name,'iam:PassRole',role,false,{'iam:PassedToService':'ec2.amazonaws.com'});}
  const product=m.products[team?'teamProduct':'coreProduct'];add('exact-template','s3:GetObject','arn:aws:s3:::'+m.assets.core.key.split('/')[0],false);
  add('bound-template','s3:GetObject','arn:aws:s3:::cdk-hnb659fds-assets-058264289478-eu-north-1/'+product.key,true);
 }else if(caller){
  const product=m.products[team?'teamProduct':'coreProduct'],role='arn:aws:iam::058264289478:role/ProjectRespawn-'+p.domain+'-Production-'+(team?'ReadProofExecution':'Execution'),stack='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-'+p.domain+'-Production/proof';
  add('exact-create','cloudformation:CreateChangeSet',stack,true,{'cloudformation:RoleArn':role,'cloudformation:TemplateUrl':product.url});add('wrong-template','cloudformation:CreateChangeSet',stack,false,{'cloudformation:RoleArn':role,'cloudformation:TemplateUrl':product.url+'wrong'});add('wrong-stack','cloudformation:ExecuteChangeSet',stack.replace('-Production/','-Ntgre/'),false);add('exact-pass','iam:PassRole',role,true,{'iam:PassedToService':'cloudformation.amazonaws.com'});add('wrong-pass','iam:PassRole',role,false,{'iam:PassedToService':'lambda.amazonaws.com'});
 }else{
  add('lambda-service-decrypt','kms:Decrypt',lambdaKey,true,context);add('wrong-lambda-context','kms:Decrypt',lambdaKey,false,{...context,'kms:EncryptionContext:aws:lambda:FunctionArn':fn.replace('Production','Ntgre')});
  add('own-secret','secretsmanager:GetSecretValue',secret,!command);
  const sc={'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':environment.account,'kms:EncryptionContext:SecretARN':secret};add('secret-decrypt','kms:Decrypt',secretKey,!command,sc);add('wrong-secret-context','kms:Decrypt',secretKey,false,{...sc,'kms:EncryptionContext:SecretARN':secret+'wrong'});
  add('other-secret','secretsmanager:GetSecretValue',secret.replace('-Production-','-Ntgre-'),false);
  if(team){const j='arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Production-Journal',o=j.replace('Journal','Operational');add('authority-get','dynamodb:GetItem',j,true,{'dynamodb:LeadingKeys':['CONTROL#AUTHORITY']});add('authority-put','dynamodb:PutItem',j,false,{'dynamodb:LeadingKeys':['CONTROL#AUTHORITY'],'dynamodb:EnclosingOperation':['TransactWriteItems']});add('team-put-transaction','dynamodb:PutItem',o,command,{'dynamodb:LeadingKeys':['TEAM#team:proof'],'dynamodb:EnclosingOperation':['TransactWriteItems']});add('team-put-direct','dynamodb:PutItem',o,false,{'dynamodb:LeadingKeys':['TEAM#team:proof']});add('foreign-journal-partition','dynamodb:GetItem',j,false,{'dynamodb:LeadingKeys':['FOREIGN#proof']});add('core-invoke','lambda:InvokeFunction','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Production-Contracts',true);}else{add('prod-directory','cognito-idp:ListUsers','arn:aws:cognito-idp:eu-north-1:058264289478:userpool/'+environment.poolId,true);add('ntgre-directory','cognito-idp:ListUsers','arn:aws:cognito-idp:eu-north-1:058264289478:userpool/eu-north-1_n24iLL7QE',false);}
 }
 for(const key of ['arn:aws:kms:eu-north-1:058264289478:key/00000000-0000-0000-0000-000000000000',secretKey])add('unrelated-key '+key,'kms:Decrypt',key,false,context);
 for(const action of ['kms:CreateKey','kms:PutKeyPolicy','kms:CreateGrant','kms:GenerateDataKey','iam:CreatePolicyVersion','cognito-idp:AdminCreateUser'])add('no-admin '+action,action,action.startsWith('kms:')?lambdaKey:'*',false,context);
 for(const domain of ['Core','TeamHub','Tournament','Creator','Commerce'])if(domain!==p.domain)add('foreign '+domain,'lambda:UpdateFunctionConfiguration','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-'+domain+'-Production-Contracts',false);
 for(const table of tables)add('legacy '+table.model,'dynamodb:PutItem',table.arn,false,{'dynamodb:LeadingKeys':['TEAM#team:proof'],'dynamodb:EnclosingOperation':['TransactWriteItems']});
 add('wrong-artifact','s3:GetObject','arn:aws:s3:::cdk-hnb659fds-assets-058264289478-eu-north-1/OtherDomain/other.zip',false);
 return c;
}
export async function validate(){
 const {manifest,policies,structures}=inspect(),directory=out+'/policies';fs.mkdirSync(directory,{recursive:true});
 const manifestSha256=sha(fs.readFileSync(out+'/manifest.json'));
 const previous=fs.existsSync(out+'/security-validation.json')?read(out+'/security-validation.json'):null;
 const result=previous?.manifestSha256===manifestSha256?previous:{at:new Date().toISOString(),manifestSha256,syntheticGeneratedIds:true,limitations:['Generated secret suffix and API ID are synthetic for policy validation, not deployed receipts','Actual installed identity/boundary, managed key policies, organization restrictions and service execution must be revalidated at execution gates','No live KMS decryption, authority record or production domain acceptance inferred'],structures,policies:[],cases:[],awsWrites:0};
 if(previous?.complete&&previous.passed&&previous.manifestSha256!==manifestSha256){const bytes=fs.readFileSync(out+'/security-validation.json'),source=out+'/'+sha(bytes)+'.security-certificate.json';fs.writeFileSync(source,bytes);result.reusedPolicyEvidence=[];for(const p of policies){const file=directory+'/'+p.id+'.json',certified=previous.policies.find(v=>v.id===p.id);if(!certified||!fs.existsSync(file)||sha(fs.readFileSync(file))!==sha(JSON.stringify(p.policy)))continue;result.policies.push(certified);for(const c of cases(p,manifest)){const row=previous.cases.find(v=>v.policy===p.id&&v.name===c.name);if(row&&row.passed&&row.action===c.action&&row.resource===c.resource&&row.allowed===c.allowed&&JSON.stringify(row.context)===JSON.stringify(c.context))result.cases.push(row);}result.reusedPolicyEvidence.push({policy:p.id,policySha256:sha(JSON.stringify(p.policy)),sourceCertificate:source,sourceCertificateSha256:sha(bytes),sourceManifestSha256:previous.manifestSha256});}}
 for(const p of policies){const file=directory+'/'+p.id+'.json';fs.writeFileSync(file,JSON.stringify(p.policy));let existing=result.policies.find(v=>v.id===p.id);const analyzer=existing?.analyzer??await aws('accessanalyzer','validate-policy',['--policy-type','IDENTITY_POLICY','--policy-document','file://'+file]);const findings=analyzer.findings.filter(x=>['ERROR','SECURITY_WARNING'].includes(x.findingType));if(!existing)result.policies.push({id:p.id,size:p.size,limit:p.kind==='boundary'?6144:10240,analyzer});save('security-validation.json',result);assert.deepEqual(findings,[],p.id+' Analyzer');
  // Batch identical-context cases into action/resource products only when expectations agree.
  // Single-case calls are deliberately rate limited; no simulator fan-out.
  const groups=new Map();for(const c of cases(p,manifest)){const completed=result.cases.find(v=>v.policy===p.id&&v.name===c.name);if(completed){assert.equal(completed.passed,true);continue;}const key=JSON.stringify(c.context)+(c.resource==='*'?' STAR':' ARN');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
  for(const group of groups.values()){
   const context=Object.entries(group[0].context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:Array.isArray(v)?v:[v],ContextKeyType:Array.isArray(v)?'stringList':'string'}));
   const fileArgs=out+'/simulation-request.json';fs.writeFileSync(fileArgs,JSON.stringify({PolicyInputList:[JSON.stringify(p.policy)],ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],ContextEntries:context}));
   const simulated=await aws('iam','simulate-custom-policy',['--cli-input-json','file://'+fileArgs]);
   for(const c of group){const top=simulated.EvaluationResults.find(v=>v.EvalActionName.toLowerCase()===c.action.toLowerCase()&&(v.EvalResourceName===c.resource||v.ResourceSpecificResults?.some(x=>x.EvalResourceName===c.resource)));assert.ok(top,'MISSING_SIMULATION_RESULT '+c.name);const resource=top.ResourceSpecificResults?.find(x=>x.EvalResourceName===c.resource),row=resource?{EvalDecision:resource.EvalResourceDecision,MissingContextValues:resource.MissingContextValues}:top,allowed=row.EvalDecision==='allowed';
   result.cases.push({policy:p.id,...c,decision:row.EvalDecision,missingContext:row.MissingContextValues,passed:allowed===c.allowed});save('security-validation.json',result);assert.equal(allowed,c.allowed,p.id+' '+c.name+' '+JSON.stringify(row));
   }
  }
 }
 result.complete=true;result.blockingFindings=0;result.passed=result.cases.every(x=>x.passed);save('security-validation.json',result);console.log(JSON.stringify({policies:result.policies.length,cases:result.cases.length,passed:result.passed}));
}
if(process.argv[1]?.endsWith('deployment-validate.mjs'))await validate();
