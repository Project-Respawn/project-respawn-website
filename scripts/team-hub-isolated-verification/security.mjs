// Read-only installed-role inspection. Never reads signing material or mutates AWS.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
import {canonical,flatten,throttled} from '../migration/iam-validation.mjs';
const E='docs/architecture/team-hub-isolated-verification-evidence-2026-10-12';
const read=p=>JSON.parse(fs.readFileSync(p));
const save=(name,value)=>fs.writeFileSync(`${E}/${name}.json`,JSON.stringify(value,null,2)+'\n');
const installed=read(E+'/installed-security-audit.json');assert.equal(installed.complete,true);
const baseline=read(E+'/baseline.json');
const secret=baseline.functions.find(f=>f.kind==='Read').configuration.Environment.Variables.TEAM_CURSOR_SECRET_ARN;
const metadata=await aws('secretsmanager','describe-secret',{SecretId:secret});
assert.equal(metadata.ARN,secret);
const key=(await aws('kms','describe-key',{KeyId:metadata.KmsKeyId??'alias/aws/secretsmanager'})).KeyMetadata;
assert.equal(key.KeyManager,'AWS');assert.equal(key.Arn,'arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a');
const keyPolicy=JSON.parse((await aws('kms','get-key-policy',{KeyId:key.Arn,PolicyName:'default'})).Policy);
save('cursor-metadata',{at:new Date().toISOString(),metadata,key,keyPolicy,secretValueRead:false});
const table=n=>'arn:aws:dynamodb:eu-north-1:058264289478:table/'+n;
const operational=table('ProjectRespawn-TeamHub-Ntgre-Operational'),journal=table('ProjectRespawn-TeamHub-Ntgre-Journal');
const core='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts';
const cached=process.argv.includes('--resume-same-baseline')?read(E+'/runtime-security-request-shape-diagnostic.json').checks:[];
const result={at:new Date().toISOString(),cases:[],checks:[],analyzer:[],attempts:[],complete:false,awsWrites:0};
let next=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function simulate(input){for(let attempt=0;attempt<6;attempt++){await sleep(Math.max(0,next-Date.now()));next=Date.now()+15000;try{return await aws('iam','simulate-principal-policy',input);}catch(e){result.attempts.push({at:new Date().toISOString(),attempt:attempt+1,error:e.message});save('runtime-security',result);if(!throttled(e)||attempt===5)throw e;const cap=Math.min(60000,5000*2**attempt);next=Math.max(next,Date.now()+cap/2+Math.random()*cap/2);}}}
for(const role of installed.roles.filter(r=>r.name.includes('Parity'))){
 const command=role.name.endsWith('Command');
 const attached=(await aws('iam','list-attached-role-policies',{RoleName:role.name})).AttachedPolicies;assert.deepEqual(attached,[]);
 for(const [kind,document] of [['identity',role.inline[0].document],['boundary',role.boundary.document]]){
  const analysis=await aws('accessanalyzer','validate-policy',{policyType:'IDENTITY_POLICY',policyDocument:JSON.stringify(document)});
  result.analyzer.push({role:role.name,kind,...analysis});save('runtime-security',result);
  assert.equal(analysis.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)).length,0);
 }
 const cases=[];
 const add=(id,action,resource,expected,extra={})=>cases.push({id:role.name+':'+id,role:role.arn,action,resource,expected,context:{'aws:RequestedRegion':'eu-north-1',...extra}});
 const leading=value=>({'dynamodb:LeadingKeys':value});
 add('authority','dynamodb:GetItem',journal,'allowed',leading('CONTROL#AUTHORITY'));
 add('other-journal','dynamodb:GetItem',journal,'implicitDeny',leading('UNRELATED#record'));
 add('operational-read','dynamodb:GetItem',operational,'allowed',leading('TEAM#team:isolated'));
 add('operational-query','dynamodb:Query',operational,'allowed',leading('TEAM#team:isolated'));
 add('authority-write','dynamodb:PutItem',journal,command?'implicitDeny':'explicitDeny',{'dynamodb:EnclosingOperation':'TransactWriteItems',...leading('CONTROL#AUTHORITY')});
 for(const action of ['dynamodb:PutItem','dynamodb:DeleteItem'])add('transaction-'+action,action,operational,command?'allowed':'explicitDeny',{'dynamodb:EnclosingOperation':'TransactWriteItems',...leading('TEAM#team:isolated')});
 add('standalone-write','dynamodb:PutItem',operational,command?'implicitDeny':'explicitDeny',leading('TEAM#team:isolated'));
 add('authority-condition','dynamodb:ConditionCheckItem',journal,command?'allowed':'explicitDeny',leading('CONTROL#AUTHORITY'));
 add('audit','dynamodb:PutItem',journal,command?'allowed':'explicitDeny',{'dynamodb:EnclosingOperation':'TransactWriteItems',...leading('TEAM#team:isolated')});
 add('idempotency','dynamodb:GetItem',journal,command?'allowed':'implicitDeny',leading('IDEMP#isolated'));
 if(!command)add('subject-index','dynamodb:Query',operational+'/index/BySubject','allowed',leading('SUBJECT#isolated'));
 for(const name of ['Legacy','Core','Tournament','Commerce','Creator','Production'])add('foreign-'+name,'dynamodb:GetItem',table('ProjectRespawn-'+name+'-Protected'),'explicitDeny',leading('TEAM#team:isolated'));
 add('no-scan','dynamodb:Scan',operational,'explicitDeny');
 add('core','lambda:InvokeFunction',core,'allowed');add('core-latest','lambda:InvokeFunction',core+':$LATEST','allowed');
 add('foreign-lambda','lambda:InvokeFunction',core.replace('Core','Tournament'),'explicitDeny');
 add('code-update','lambda:UpdateFunctionCode',core,'explicitDeny');
 add('no-passrole','iam:PassRole',role.arn,'explicitDeny');add('no-cognito-admin','cognito-idp:AdminCreateUser','arn:aws:cognito-idp:eu-north-1:058264289478:userpool/eu-north-1_n24iLL7QE','explicitDeny');
 add('cursor','secretsmanager:GetSecretValue',secret,command?'explicitDeny':'allowed');
 add('other-secret','secretsmanager:GetSecretValue',secret.replace('TeamHub','Core'),'explicitDeny');
 const kmsContext={'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','kms:EncryptionContext:SecretARN':secret,'kms:ResourceAliases':'alias/aws/secretsmanager'};
 add('cursor-decrypt','kms:Decrypt',key.Arn,command?'explicitDeny':'allowed',kmsContext);
 add('wrong-key','kms:Decrypt',key.Arn.replace(/key\/.*/,'key/00000000-0000-0000-0000-000000000000'),'explicitDeny',kmsContext);
 add('kms-admin','kms:PutKeyPolicy',key.Arn,'explicitDeny');
 for(const [label,override] of [['service',{'kms:ViaService':'dynamodb.eu-north-1.amazonaws.com'}],['context',{'kms:EncryptionContext:SecretARN':secret.replace('TeamHub','Core')}],['account',{'kms:CallerAccount':'000000000000'}]])add('wrong-'+label,'kms:Decrypt',key.Arn,'explicitDeny',{...kmsContext,...override});
 result.cases.push(...cases);save('runtime-security',result);
 // Multi-action cross-product requests share identical contexts. Validate every requested cell;
 // preserve the full response, including unrequested cells, for independent review.
 const groups=new Map();for(const c of cases){const k=canonical(c.context);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);}
 for(const group of groups.values()){
  const input={PolicySourceArn:role.arn,ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],MaxItems:1000,ContextEntries:Object.entries(group[0].context).map(([ContextKeyName,value])=>({ContextKeyName,ContextKeyValues:[value],ContextKeyType:['dynamodb:LeadingKeys','dynamodb:EnclosingOperation','kms:ResourceAliases'].includes(ContextKeyName)?'stringList':'string'}))};
  let marker;const seen=new Set(),prior=cached.find(x=>canonical(x.input)===canonical(input)),evaluations=prior?prior.evaluations:[];
  if(!prior)do{const response=await simulate({...input,...(marker?{Marker:marker}:{})});evaluations.push(...flatten(response));if(response.IsTruncated){assert.ok(response.Marker&&!seen.has(response.Marker));seen.add(response.Marker);marker=response.Marker;}else marker=undefined;}while(marker);
  result.checks.push({role:role.arn,input,evaluations,ids:group.map(c=>c.id)});save('runtime-security',result);
  for(const c of group){const found=evaluations.filter(r=>r.EvalActionName===c.action&&r.EvalResourceName===c.resource);assert.equal(found.length,1,c.id);assert.equal(found[0].EvalDecision,c.expected,c.id);}
 }
}
result.complete=true;save('runtime-security',result);console.log(JSON.stringify({complete:true,cases:result.cases.length,analyzer:result.analyzer.length}));
