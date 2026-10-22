// Offline only. Historical R1/R2 inputs are never overwritten.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {environment} from './config.mjs';
export const out='docs/architecture/production-domain-deployment-evidence-2026-10-20';
export const artifactBucket='cdk-hnb659fds-assets-058264289478-eu-north-1';
export const lambdaKey='arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7';
export const secretKey='arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a';
export const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const clone=v=>structuredClone(v),arr=v=>v===undefined?[]:Array.isArray(v)?v:[v];
const read=p=>JSON.parse(fs.readFileSync(p));
const imported=(domain,name)=>({'Fn::ImportValue':`ProjectRespawn-${domain}-Production-${name}`});
function walk(v,f){if(v===null||typeof v!=='object')return f(v);if(Array.isArray(v))return v.map(x=>walk(x,f));const replaced=f(v);if(replaced!==v)return replaced;return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x,f)]));}
const sub=s=>({'Fn::Sub':s});
function output(t,id,value,domain){t.Outputs??={};t.Outputs[id]={Value:value,Export:{Name:`ProjectRespawn-${domain}-Production-${id}`}};}
function kmsStatements(functions,secret,execution=false){
 const keys=[lambdaKey,...(secret?[secretKey]:[])],ops=execution?['kms:Encrypt','kms:Decrypt','kms:DescribeKey']:['kms:Decrypt'];
 const statements=[{Effect:'Deny',Action:'kms:*',NotResource:keys},
 {Effect:'Deny',NotAction:ops,Resource:keys},
 {Effect:'Allow',Action:execution?['kms:Encrypt','kms:Decrypt']:'kms:Decrypt',Resource:lambdaKey,Condition:{StringEquals:{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':environment.account,'kms:EncryptionContext:aws:lambda:FunctionArn':functions}}}];
 if(execution)statements.push({Effect:'Allow',Action:'kms:DescribeKey',Resource:lambdaKey,Condition:{StringEquals:{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':environment.account}}});
 if(secret)statements.push({Effect:'Allow',Action:'kms:Decrypt',Resource:secretKey,Condition:{StringEquals:{'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':environment.account,'kms:EncryptionContext:SecretARN':secret}}});
 // Explicit controls remain effective if another identity policy supplies an Allow.
 for(const [key,service]of [[lambdaKey,'lambda'],...(secret?[[secretKey,'secretsmanager']]:[])])for(const [condition,value]of [['kms:ViaService',service+'.eu-north-1.amazonaws.com'],['kms:CallerAccount',environment.account]])statements.push({Effect:'Deny',Action:ops,Resource:key,Condition:{StringNotEquals:{[condition]:value}}});
 statements.push({Effect:'Deny',Action:execution?['kms:Encrypt','kms:Decrypt']:'kms:Decrypt',Resource:lambdaKey,Condition:{StringNotEquals:{'kms:EncryptionContext:aws:lambda:FunctionArn':functions}}});
 if(secret)statements.push({Effect:'Deny',Action:'kms:Decrypt',Resource:secretKey,Condition:{StringNotEquals:{'kms:EncryptionContext:SecretARN':secret}}});
 return statements;
}
function runtimePolicy(old,functions,secret){
 const s=old.Statement.filter(s=>!arr(s.Action).some(a=>a.startsWith('kms:')));
 for(const v of s)if(v.NotAction)v.NotAction=[...new Set([...arr(v.NotAction),'kms:Decrypt'])];
 return {Version:'2012-10-17',Statement:[...s,...kmsStatements(functions,secret)]};
}
function executionPolicy(old,domain,functions,roles,boundaries,artifacts,api){
 let statements=[];
 for(let s of clone(old.Statement)){
  if(s.NotAction)continue;
  let actions=arr(s.Action).filter(a=>!a.startsWith('kms:')&&!a.startsWith('secretsmanager:')&&!a.startsWith('ssm:')&&!['s3:GetObjectVersion','lambda:PutFunctionConcurrency','lambda:DeleteFunctionConcurrency'].includes(a));
  if(!actions.length)continue;s.Action=actions.length===1?actions[0]:actions;
  if(actions.includes('s3:GetObject'))s.Resource=artifacts.map(k=>'arn:aws:s3:::'+artifactBucket+'/'+k);
  if(s.Effect==='Deny'&&actions.includes('s3:*'))s.NotResource=artifacts.map(k=>'arn:aws:s3:::'+artifactBucket+'/'+k);
  if(s.Effect==='Deny'&&actions.includes('iam:PassRole'))s.NotResource=roles;
  if(s.Effect==='Deny'&&actions.includes('iam:PutRolePermissionsBoundary')){actions=actions.filter(a=>a!=='iam:PutRolePermissionsBoundary');s.Action=actions;}
  if(actions.some(a=>a.startsWith('lambda:'))&&s.Effect==='Allow')s.Resource=functions.flatMap(f=>[f,f+':$LATEST']);
  if(actions.some(a=>a.startsWith('apigateway:'))){
   if(s.Effect!=='Allow')continue;
   s.Action=['apigateway:GET','apigateway:POST','apigateway:PATCH','apigateway:DELETE','apigateway:PUT'];
   // API creation/CORS/tags belong to security bootstrap. The product has only
   // untagged authorizer/integration/route/stage resources; no /tags administration.
   statements.push({Effect:'Allow',Action:'apigateway:GET',Resource:sub('arn:aws:apigateway:eu-north-1::/apis/${HttpApi}')});
   s.Resource=[sub('arn:aws:apigateway:eu-north-1::/apis/${HttpApi}/*')];
  }
  if(actions.some(a=>a.startsWith('iam:'))){
   if(actions.includes('iam:CreateRole')||actions.includes('iam:PutRolePermissionsBoundary'))continue;
   if(actions.includes('iam:GetPolicy'))s.Resource=boundaries;
   else if(s.Effect==='Allow')s.Resource=roles;
   if(s.Condition?.StringEquals?.['iam:PermissionsBoundary'])s.Condition.StringEquals['iam:PermissionsBoundary']=boundaries;
  }
  for(const field of ['Resource','NotResource'])if(Array.isArray(s[field]))s[field]=s[field].filter(x=>typeof x!=='string'||(!x.includes('-PreviewRead')&&!x.includes('/preview')));
  statements.push(s);
 }
 // Same exact policy is installed as both identity and boundary. No secret mutation in product execution.
 for(let i=0;i<roles.length;i++)statements.push({Effect:'Allow',Action:['iam:CreateRole','iam:PutRolePermissionsBoundary'],Resource:roles[i],Condition:{StringEquals:{'iam:PermissionsBoundary':boundaries[i]}}});
 statements.push(...kmsStatements(functions,null,true));
 // The exact Allow-only boundary supplies the action ceiling. Existing explicit
 // service/resource Denies remain in the identity policy; do not duplicate a
 // multi-kilobyte action whitelist that would exceed the aggregate role quota.
 return {Version:'2012-10-17',Statement:statements};
}
function callerPolicy(domain,executionRole,product){
 const stack=`arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-${domain}-Production/*`;
 const actions=['cloudformation:DescribeStacks','cloudformation:DescribeStackEvents','cloudformation:ListStackResources','cloudformation:GetTemplate','cloudformation:DescribeChangeSet','cloudformation:ExecuteChangeSet','cloudformation:DeleteChangeSet'];
 return {Version:'2012-10-17',Statement:[{Effect:'Deny',NotAction:[...actions,'cloudformation:CreateChangeSet','iam:PassRole','s3:GetObject'],Resource:'*'},
 {Effect:'Deny',Action:'cloudformation:*',NotResource:stack},
 {Effect:'Allow',Action:actions,Resource:stack},
 {Effect:'Allow',Action:'cloudformation:CreateChangeSet',Resource:stack,Condition:{StringEquals:{'cloudformation:RoleArn':executionRole,'cloudformation:TemplateUrl':product.url}}},
 {Effect:'Allow',Action:'iam:PassRole',Resource:executionRole,Condition:{StringEquals:{'iam:PassedToService':'cloudformation.amazonaws.com'}}},
 {Effect:'Allow',Action:'s3:GetObject',Resource:'arn:aws:s3:::'+artifactBucket+'/'+product.key}]};
}
export function prepare(){
 fs.mkdirSync(out,{recursive:true});const old='docs/architecture/team-hub-production-evidence-2026-10-20';
 const inputs={},templates={};for(const kind of ['coreProduct','coreSecurity','teamProduct','teamSecurity']){const p=old+'/'+kind+'.DRAFT.template.json';inputs[p]=sha(fs.readFileSync(p));let t=read(p);delete t.Parameters;delete t.Rules;delete t.Metadata;delete t.Description;templates[kind]=t;}
 const assets={};for(const [name,hash]of [['core','fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503'],['team-read','3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287'],['team-command','3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287']]){const p=old+'/'+hash+'.'+name+'.runtime.zip';if(sha(fs.readFileSync(p))!==hash)throw Error('RUNTIME_HASH');assets[name]={path:p,sha256:hash,key:'production/'+hash+'.zip'};}
 const {coreProduct:cp,coreSecurity:cs,teamProduct:tp,teamSecurity:ts}=templates;
 cs.Resources.CursorSecret=cp.Resources.CursorSecret;delete cp.Resources.CursorSecret;
 for(const id of ['ReadLogs','ReadRole','ReadFunction','ReadIntegration','PreviewRoute','ApiInvoke','ReadErrors'])delete tp.Resources[id];
 delete tp.Resources.Stage.DependsOn;
 delete ts.Resources.PreviewBoundary;
 for(const id of ['CursorSecret','HttpApi']){ts.Resources[id]=tp.Resources[id];delete tp.Resources[id];}
 ts.Resources.HttpApi.Properties.CorsConfiguration.AllowMethods=['GET','POST','PATCH','PUT','DELETE','OPTIONS'];
 for(const[domain,p,s]of [['Core',cp,cs],['TeamHub',tp,ts]]){
  output(s,'CursorSecretArn',{Ref:'CursorSecret'},domain);
  if(domain==='TeamHub')output(s,'HttpApiId',{Ref:'HttpApi'},domain);
  const secretName=`arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-${domain}-Production-Cursor-??????`;
  for(const [kind,t]of [['product',p],['security',s]]){
   const secret=kind==='security'?{Ref:'CursorSecret'}:imported(domain,'CursorSecretArn');
   const v=walk(t,x=>{
    if(x===secretName)return secret;
    if(kind==='product'&&typeof x==='string'&&x.includes(':t54b88casf/'))return {'Fn::Join':['',x.split('t54b88casf').flatMap((part,i)=>i?[imported(domain,'HttpApiId'),part]:[part])]};
    if(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===1&&x.Ref){if(x.Ref==='ProductionArtifactBucket')return artifactBucket;if(kind==='product'&&['CursorSecret','ProductionCursorSecretArn'].includes(x.Ref))return secret;if(kind==='product'&&x.Ref==='HttpApi')return imported(domain,'HttpApiId');}
    // Existing Fn::Sub references to HttpApi must import the actual security-owned API ID.
    if(kind==='product'&&x&&typeof x==='object'&&typeof x['Fn::Sub']==='string'&&x['Fn::Sub'].includes('${HttpApi}'))return {'Fn::Sub':[x['Fn::Sub'],{HttpApi:imported(domain,'HttpApiId')}]};
    return x;
   });Object.keys(t).forEach(k=>delete t[k]);Object.assign(t,v);
  }
  const fspec=domain==='Core'?[['Runtime','RuntimeBoundary','Contracts']]:[['ParityReadRole','ParityReadBoundary','ParityReadFunction'],['ParityCommandRole','ParityCommandBoundary','ParityCommandFunction']];
  for(const[role,boundary,fn]of fspec){const arn='arn:aws:lambda:eu-north-1:058264289478:function:'+p.Resources[fn].Properties.FunctionName;
   p.Resources[fn].Properties.Code={S3Bucket:artifactBucket,S3Key:assets[domain==='Core'?'core':fn==='ParityCommandFunction'?'team-command':'team-read'].key};
   const secret=domain==='Core'||role==='ParityReadRole'?imported(domain,'CursorSecretArn'):null;
   const policy=runtimePolicy(p.Resources[role].Properties.Policies[0].PolicyDocument,[arn],secret);
   p.Resources[role].Properties.Policies=[{PolicyName:'ProductionRuntime',PolicyDocument:policy}];
   const boundaryPolicy=walk(policy,x=>x&&typeof x==='object'&&x['Fn::ImportValue']===`ProjectRespawn-${domain}-Production-CursorSecretArn`?{Ref:'CursorSecret'}:x);
   s.Resources[boundary].Properties.PolicyDocument=boundaryPolicy;
   output(s,boundary+'Arn',{Ref:boundary},domain);p.Resources[role].Properties.PermissionsBoundary=imported(domain,boundary+'Arn');
  }
 }
 const products={};for(const [name,t]of [['coreProduct',cp],['teamProduct',tp]])products[name]=writeArtifact(name,t);
 for(const[domain,p,s,product,execId,callerId,callerBoundary]of [['Core',cp,cs,products.coreProduct,'Execution','Caller','CallerBoundary'],['TeamHub',tp,ts,products.teamProduct,'ExecutionRole','DeploymentCaller','PreparationCaller']]){
  const fn=Object.values(p.Resources).filter(r=>r.Type==='AWS::Lambda::Function').map(r=>'arn:aws:lambda:eu-north-1:058264289478:function:'+r.Properties.FunctionName);
  const roles=Object.values(p.Resources).filter(r=>r.Type==='AWS::IAM::Role').map(r=>'arn:aws:iam::058264289478:role/'+r.Properties.RoleName);
  const boundaries=Object.values(p.Resources).filter(r=>r.Type==='AWS::IAM::Role').map(r=>{const name=r.Properties.PermissionsBoundary['Fn::ImportValue'].replace('ProjectRespawn-'+domain+'-Production-','').replace(/Arn$/,'');return 'arn:aws:iam::058264289478:policy/'+s.Resources[name].Properties.ManagedPolicyName;});
  const keys=[...new Set([product.key,...Object.entries(assets).filter(([k])=>domain==='Core'?k==='core':k!=='core').map(([,v])=>v.key)])];
  const role=s.Resources[execId].Properties,policy=executionPolicy(role.Policies[0].PolicyDocument,domain,fn,roles,boundaries,keys,domain==='TeamHub');
  role.Policies=[{PolicyName:'ProductionExecution',PolicyDocument:policy}];
  // A boundary only narrows identity permissions. Keep the complete explicit-deny identity
  // policy, with an independently scoped Allow ceiling instead of duplicating large Denies.
  s.Resources.ExecutionBoundary.Properties.PolicyDocument={Version:'2012-10-17',Statement:clone(policy.Statement.filter(v=>v.Effect==='Allow'))};
  const caller=callerPolicy(domain,'arn:aws:iam::058264289478:role/'+role.RoleName,product);
  s.Resources[callerId].Properties.Policies=[{PolicyName:'ExactProductDeployment',PolicyDocument:caller}];s.Resources[callerBoundary].Properties.PolicyDocument=clone(caller);
 }
 const security={coreSecurity:writeArtifact('coreSecurity',cs),teamSecurity:writeArtifact('teamSecurity',ts)};
 const manifest={schemaVersion:'production-domain-deployment.v1',environment,awsWrites:0,liveAccepted:false,inputs,assets,products,security,counts:Object.fromEntries(Object.entries(templates).map(([k,v])=>[k,Object.keys(v.Resources).length])),artifactEncryption:'AES256',bootstrap:['Core security','Core product','Core live contracts','Team Hub security','Team Hub product','Separately authorized conditional LEGACY_WRITER initialization','Dark endpoint acceptance'],rollback:{initialCreate:true,retained:['Core cursor secret','Team cursor secret','Operational table','Journal table'],previousProductionDomainDeployment:null,ntgreArtifactsAreNotProductionRollback:true},lateBindings:{mechanism:'Exact same-domain CloudFormation Ref/ImportValue; no operator-substitutable secret/API parameter',installedOutputReviewRequired:true},acceptedR2:'7f21d94f6664916c16510f33b3abf253f1dabbb38ab378c91f0c12b1524c7a67'};
 const bytes=JSON.stringify(manifest,null,2)+'\n';fs.writeFileSync(out+'/manifest.json',bytes);fs.writeFileSync(out+'/'+sha(bytes)+'.manifest.json',bytes);return {manifest,sha256:sha(bytes)};
}
function writeArtifact(name,t){const bytes=JSON.stringify(t,null,2)+'\n',hash=sha(bytes),file=out+'/'+hash+'.'+name+'.template.json';if(fs.existsSync(file)&&sha(fs.readFileSync(file))!==hash)throw Error('IMMUTABLE_COLLISION');fs.writeFileSync(file,bytes);const key='production/'+hash+'.json';return {path:file,sha256:hash,key,url:'https://'+artifactBucket+'.s3.eu-north-1.amazonaws.com/'+key};}
if(process.argv[1]?.endsWith('deployment-prepare.mjs'))console.log(JSON.stringify(prepare()));
