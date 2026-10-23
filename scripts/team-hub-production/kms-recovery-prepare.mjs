// Offline candidate preparation only. Never overwrite accepted 20 October evidence.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha,lambdaKey,artifactBucket,out as previous} from './deployment-prepare.mjs';
export const out='docs/architecture/production-kms-recovery-evidence-2026-10-21';
export const read=p=>JSON.parse(fs.readFileSync(p));
export const save=(n,v)=>fs.writeFileSync(out+'/'+n,JSON.stringify(v,null,2)+'\n');
export function prepare(){
 fs.mkdirSync(out,{recursive:true});
 const old=read(previous+'/manifest.json');
 for(const a of Object.values({...old.security,...old.products,...old.assets}))assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 const product=read(old.products.coreProduct.path);
 assert.equal(product.Resources.Logs.DeletionPolicy,'Retain');
 const bootstrap={AWSTemplateFormatVersion:'2010-09-09',Resources:{Logs:product.Resources.Logs}};
 function pin(name,t){const bytes=JSON.stringify(t,null,2)+'\n',hash=sha(bytes),path=out+'/'+hash+'.'+name+'.template.json';fs.writeFileSync(path,bytes);return{path,sha256:hash,key:'production/'+hash+'.json',url:'https://'+artifactBucket+'.s3.eu-north-1.amazonaws.com/production/'+hash+'.json'};}
 const logImport=pin('coreLogImport',bootstrap);
 const policies=[],diff=[];const security={};
 for(const kind of ['coreSecurity','teamSecurity']){
  const t=read(old.security[kind].path),before=structuredClone(t),domain=kind==='coreSecurity'?'Core':'TeamHub';
  const execIds=Object.entries(t.Resources).filter(([id,r])=>/Execution/.test(id)&&(r.Type==='AWS::IAM::ManagedPolicy'||r.Type==='AWS::IAM::Role'));
  assert.equal(execIds.length,2);
  for(const[id,r]of execIds){
   const p=r.Type==='AWS::IAM::ManagedPolicy'?r.Properties.PolicyDocument:r.Properties.Policies[0].PolicyDocument;
   const original=structuredClone(p);let exclusions=0;
   for(const s of p.Statement){
    if(s.Effect==='Deny'&&s.NotAction&&JSON.stringify(s.Resource).includes(lambdaKey)&&s.NotAction.includes('kms:DescribeKey')){s.NotAction.push('kms:CreateGrant');exclusions++;}
   }
   assert.equal(exclusions,r.Type==='AWS::IAM::Role'?1:0);
   p.Statement.push({Effect:'Allow',Action:'kms:CreateGrant',Resource:lambdaKey,Condition:{StringEquals:{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478'},Bool:{'kms:GrantIsForAWSResource':'true'}}});
   // Explicit restrictions survive an accidental additional identity Allow.
   if(r.Type==='AWS::IAM::Role'){
    for(const[key,value]of [['kms:ViaService','lambda.eu-north-1.amazonaws.com'],['kms:CallerAccount','058264289478']])p.Statement.push({Effect:'Deny',Action:'kms:CreateGrant',Resource:lambdaKey,Condition:{StringNotEquals:{[key]:value}}});
    p.Statement.push({Effect:'Deny',Action:'kms:CreateGrant',Resource:lambdaKey,Condition:{BoolIfExists:{'kms:GrantIsForAWSResource':'false'}}});
   }
   if(domain==='Core'){
    const s=p.Statement.find(s=>s.Effect==='Allow'&&[].concat(s.Action??[]).includes('s3:GetObject'));
    assert.ok(s);s.Resource=[...new Set([].concat(s.Resource,'arn:aws:s3:::'+artifactBucket+'/'+logImport.key))];
   }
   const file=kind+'.'+id+'.policy.json';save(file,p);
   policies.push({id:kind+'.'+id,kind:r.Type==='AWS::IAM::ManagedPolicy'?'boundary':'identity',domain,path:out+'/'+file,sha256:sha(JSON.stringify(p)),size:JSON.stringify(p).length});
   diff.push({policy:kind+'.'+id,before:original,after:p});
  }
  // Every non-execution resource, trust and role property remains byte-equivalent.
  for(const[id,r]of Object.entries(t.Resources))if(!execIds.some(([x])=>x===id))assert.deepEqual(r,before.Resources[id]);
  for(const[id,r]of execIds)if(r.Type==='AWS::IAM::Role'){const a=structuredClone(r),b=structuredClone(before.Resources[id]);delete a.Properties.Policies;delete b.Properties.Policies;assert.deepEqual(a,b);}
  security[kind]=pin(kind,t);
 }
 for(const p of policies)assert.ok(p.size<=(p.kind==='boundary'?6144:10240),p.id+' size '+p.size);
 save('policy-diff.json',diff);
 const proposal={schemaVersion:'production-kms-recovery.v1',approved:false,awsWrites:0,previousManifestSha256:sha(fs.readFileSync(previous+'/manifest.json')),previousSecurity:old.security,security,logImport,products:old.products,assets:old.assets,policies,
  importResources:[{ResourceType:'AWS::Logs::LogGroup',LogicalResourceId:'Logs',ResourceIdentifier:{LogGroupName:'/project-respawn/Production/core/contracts'}}],
  sequence:['Fresh read-only acceptance and exact pins','Separately authorized Core security UPDATE: ExecutionBoundary and Execution only','Separately authorized deletion of failed Core product stack RECORD; retain Logs and security stack','RavenTest prepares/imports exactly Logs using exact bootstrap TemplateURL and existing Core execution role; no new IAM grant','Drift/property check imported Logs','Bounded Core caller UPDATE using unchanged accepted coreProduct TemplateURL: six additions; Logs unchanged','Core live contract acceptance','Separately authorized revised Team security CREATE eight additions; product CREATE39; no authority initialization'],
  uncertainty:['Actual denied CreateGrant parameters are null; grantee ARN, grant operations and constraints cannot be pinned from this receipt','Service-only CreateGrant is supported but actual Lambda context and successful creation require separately authorized live verification','Organization-level restrictions not exhaustively visible; simulations do not certify complete effective authorization'],
  rollback:{security:old.security.coreSecurity,product:old.products.coreProduct,deleteLogs:false,retainImportedLogs:true,automaticRetry:false}};
 save('manifest.json',proposal);return proposal;
}
if(process.argv[1]?.endsWith('kms-recovery-prepare.mjs'))console.log(JSON.stringify(prepare().security));
