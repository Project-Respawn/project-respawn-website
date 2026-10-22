// Offline candidate only. Preserve deployed security/product/ZIP bytes and history.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {out,read,save} from './core-runtime-kms-inspect.mjs';import {sha,lambdaKey,artifactBucket} from './deployment-prepare.mjs';
export function runtimeCorrection(policy){
 const corrected=structuredClone(policy);let allows=0,denies=0;
 for(const s of corrected.Statement){if(s.Resource!==lambdaKey)continue;
  if(s.Effect==='Allow'&&s.Action==='kms:Decrypt'&&s.Condition?.StringEquals?.['kms:ViaService']==='lambda.eu-north-1.amazonaws.com'){
   delete s.Condition.StringEquals['kms:ViaService'];s.Condition.StringEqualsIfExists={'kms:ViaService':'lambda.eu-north-1.amazonaws.com'};allows++;
  }
  if(s.Effect==='Deny'&&s.Condition?.StringNotEquals?.['kms:ViaService']==='lambda.eu-north-1.amazonaws.com'){
   s.Condition.Null={'kms:ViaService':'false'};denies++;
  }
 }
 assert.equal(allows,1);assert.equal(denies,1);return corrected;
}
export function prepare(){
 fs.mkdirSync(out,{recursive:true});const parent='docs/architecture/production-core-log-drift-evidence-2026-10-21/manifest.json';assert.equal(sha(fs.readFileSync(parent)),'639d59654977db8b603b2f7c1344199046148668448c9c1cf5fa4b2d9ec5d891');const previous=read(parent),security=read(previous.security.path),product=read(previous.product.path);for(const a of [previous.security,previous.product,previous.runtime])assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 const diff=[];const oldRuntime=structuredClone(product.Resources.Runtime.Properties.Policies[0].PolicyDocument);product.Resources.Runtime.Properties.Policies[0].PolicyDocument=runtimeCorrection(oldRuntime);diff.push({id:'coreProduct.Runtime',before:oldRuntime,after:product.Resources.Runtime.Properties.Policies[0].PolicyDocument,reason:'Allow exact runtime direct-decrypt path without weakening mandatory account/function context'});
 function pin(name,value){const bytes=JSON.stringify(value,null,2)+'\n',hash=sha(bytes),path=out+'/'+hash+'.'+name+'.template.json';fs.writeFileSync(path,bytes);return{path,sha256:hash,key:'production/'+hash+'.json',url:'https://'+artifactBucket+'.s3.eu-north-1.amazonaws.com/production/'+hash+'.json'};}
 const newProduct=pin('coreProduct',product),oldBoundary=structuredClone(security.Resources.RuntimeBoundary.Properties.PolicyDocument);security.Resources.RuntimeBoundary.Properties.PolicyDocument=runtimeCorrection(oldBoundary);diff.push({id:'coreSecurity.RuntimeBoundary',before:oldBoundary,after:security.Resources.RuntimeBoundary.Properties.PolicyDocument,reason:'Matching runtime ceiling/explicit Deny correction'});
 const newArn='arn:aws:s3:::'+artifactBucket+'/'+newProduct.key;
 for(const[id,kind]of [['Execution','identity'],['ExecutionBoundary','boundary'],['Caller','identity'],['CallerBoundary','boundary']]){
  const r=security.Resources[id],p=kind==='identity'?r.Properties.Policies[0].PolicyDocument:r.Properties.PolicyDocument,before=structuredClone(p);let artifactStatements=0,templateConditions=0;
  for(const s of p.Statement){if(s.Effect==='Allow'&&[].concat(s.Action??[]).includes('s3:GetObject')){s.Resource=[...new Set([].concat(s.Resource,newArn))];artifactStatements++;}
   if(s.Condition?.StringEquals?.['cloudformation:TemplateUrl']){assert.equal(s.Condition.StringEquals['cloudformation:TemplateUrl'],previous.product.url);s.Condition.StringEquals['cloudformation:TemplateUrl']=[previous.product.url,newProduct.url];templateConditions++;}
  }
  assert.equal(artifactStatements,1);assert.equal(templateConditions,id.startsWith('Caller')?1:0);diff.push({id:'coreSecurity.'+id,before,after:p,reason:'Exact new product artifact/URL binding; preserve old rollback URL/object'});
 }
 const newSecurity=pin('coreSecurity',security),policies=[];
 function add(id,kind,p){const bytes=JSON.stringify(p,null,2)+'\n',hash=sha(bytes),path=out+'/'+hash+'.'+id+'.policy.json';fs.writeFileSync(path,bytes);const size=JSON.stringify(p).length,limit=kind==='boundary'?6144:10240;assert.ok(size<=limit,id+' quota');policies.push({id,kind,path,sha256:hash,size,limit});}
 add('coreProduct.Runtime','identity',product.Resources.Runtime.Properties.Policies[0].PolicyDocument);
 for(const[id,r]of Object.entries(security.Resources)){if(r.Type==='AWS::IAM::ManagedPolicy')add('coreSecurity.'+id,'boundary',r.Properties.PolicyDocument);if(r.Type==='AWS::IAM::Role')for(const p of r.Properties.Policies??[])add('coreSecurity.'+id,'identity',p.PolicyDocument);}
 save('policy-diff.json',diff);
 const manifest={schemaVersion:'production-core-runtime-kms-correction.v1',approved:false,awsWrites:0,account:'058264289478',region:'eu-north-1',parentManifestSha256:sha(fs.readFileSync(parent)),security:newSecurity,product:newProduct,runtime:previous.runtime,installedSecurity:previous.security,installedProduct:previous.product,policies,semanticChange:'Exact Lambda key: absent ViaService accepted, correct Lambda ViaService retained, explicitly wrong present service denied; mandatory caller account/function encryption context unchanged. Secrets Manager conditions unchanged.',evidenceConfidence:'Confirmed AWS explicit runtime identity Deny; direct-runtime ViaService mismatch is supported inference/model, not a revealed denied request context. No live success claimed.',expectedSecurityChanges:{additions:0,modifications:['RuntimeBoundary','ExecutionBoundary','CallerBoundary','Execution','Caller'],deletions:0,replacements:0},expectedProductChanges:{additions:0,modifications:['Runtime'],deletions:0,replacements:0},counts:{security:6,product:7,total:13},rollback:{security:previous.security,product:previous.product,knownUnhealthyRuntimeBaseline:true,automaticRetry:false,manualRollbackRequiresDecision:true},teamDeployment:false,authorityInitialization:false,sourceMigration:false,masterPublication:false};save('manifest.json',manifest);return manifest;
}
if(process.argv[1]?.endsWith('core-runtime-kms-prepare.mjs'))console.log(JSON.stringify(prepare().security));
