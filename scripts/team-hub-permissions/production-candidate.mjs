// Offline preparation only. Reads accepted historical evidence; never calls AWS/Git mutation APIs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {singleFileZip} from '../team-hub-2b4/zip.mjs';
const historical=path.resolve('.codex-worktrees/team-hub-production-preparation');
const optimized=process.argv.includes('--optimized');
const evidence='docs/architecture/team-hub-production-permissions-candidate-2026-10-24'+(optimized?'/v2':'');
const sourceRoot='.tmp/team-hub-production-permissions/source';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,bytes)=>{fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))assert.equal(hash(fs.readFileSync(file)),hash(bytes),'IMMUTABLE_CANDIDATE_EXISTS: '+file);else fs.writeFileSync(file,bytes);};
const json=value=>JSON.stringify(value,null,2)+'\n';
const manifestPath='docs/architecture/production-team-hub-deployment-evidence-2026-10-21/manifest.json';
const manifestBytes=fs.readFileSync(path.join(historical,manifestPath));
assert.equal(hash(manifestBytes),'2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d');
const accepted=JSON.parse(manifestBytes),productBytes=fs.readFileSync(path.join(historical,accepted.product.path)),securityBytes=fs.readFileSync(path.join(historical,accepted.security.path));
assert.equal(hash(productBytes),accepted.product.sha256);assert.equal(hash(securityBytes),accepted.security.sha256);
assert.equal(accepted.environment.environment,'Production');assert.equal(accepted.environment.poolId,'eu-north-1_Uufjxul58');assert.equal(accepted.environment.clientId,'2kc81ph5mgvo9eu2qjvmif5u8g');
for(const runtime of Object.values(accepted.runtimes))assert.equal(hash(fs.readFileSync(path.join(historical,runtime.path))),runtime.sha256);
write(evidence+'/baseline/manifest.json',manifestBytes);write(evidence+'/baseline/product.template.json',productBytes);write(evidence+'/baseline/security.template.json',securityBytes);
const prior=read(path.join(historical,'docs/architecture/team-hub-production-evidence-2026-10-20/candidate.json'));
const sources=[];
for(const entry of prior.sourceOverlay.files.filter(f=>f.path.startsWith('domains/team-hub/')||f.path.startsWith('config/environments/'))){
 const bytes=fs.readFileSync(path.join(historical,'.tmp/team-hub-production/source',entry.path));assert.equal(hash(bytes),entry.sha256,entry.path);
 write(sourceRoot+'/'+entry.path,bytes);sources.push({path:entry.path,sha256:entry.sha256,origin:'ACCEPTED_PRODUCTION_OVERLAY'});
}
const revised=['domains/team-hub/business-runtime/contracts.mjs','domains/team-hub/business-runtime/service.mjs','domains/team-hub/business-runtime/handler.mjs','domains/team-hub/business-runtime/router.mjs','domains/team-hub/parity/codec.mjs','domains/team-hub/parity/state-schema.json','domains/team-hub/structure/feature-permissions.mjs'];
// A new directory is used for candidate source so historical/copy pins stay immutable.
const candidateRoot='.tmp/team-hub-production-permissions/candidate-source';
for(const entry of sources.filter(entry=>!revised.includes(entry.path)))write(candidateRoot+'/'+entry.path,fs.readFileSync(sourceRoot+'/'+entry.path));
for(const file of revised){const original=fs.readFileSync(file),production=Buffer.from(original.toString('utf8').replaceAll('Ntgre','Production'));
 const target=candidateRoot+'/'+file;fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,production);
 sources.push({path:file,sha256:hash(production),originalMainSha256:hash(original),origin:'REVISED_PERMISSION_CANDIDATE',transformation:'Exact Ntgre -> Production environment/resource literal binding; no principal/pool substitutions'});
}
const output=await build({entryPoints:[candidateRoot+'/domains/team-hub/business-runtime/entry.mjs'],outfile:'.tmp/team-hub-production-permissions/index.cjs',write:false,bundle:true,platform:'node',format:'cjs',target:'node22',metafile:true,nodePaths:[path.resolve('node_modules')],logLevel:'silent'});
const runtimeCode=Buffer.from(output.outputFiles[0].contents);
assert(!/ProjectRespawn-(?:TeamHub|Core)-Ntgre|eu-north-1_n24iLL7QE|1iq7ovjaf7d16imdvbqgfgvf86|t54b88casf/.test(runtimeCode.toString()),'NTGRE_RUNTIME_BINDING');
const runtime=singleFileZip('index.js',runtimeCode),runtimeSha256=hash(runtime),runtimeKey='production/'+(optimized?runtimeSha256.slice(0,32):runtimeSha256)+'.zip';
write(evidence+'/'+runtimeSha256+'.runtime.zip',runtime);
const baselineProduct=JSON.parse(productBytes),product=structuredClone(baselineProduct);
for(const id of ['ParityReadFunction','ParityCommandFunction']){product.Resources[id].Properties.Code.S3Key=runtimeKey;product.Resources[id].Properties.Environment.Variables.TEAM_HUB_PERMISSIONS='MEMBER_GRANTS_V1';}
for(const [id,key,prototype]of [['MemberPermissionReadRoute','GET /v1/teams/{teamId}/permissions','ParityRouteGETTEAMHUB'],['MemberPermissionWriteRoute','PUT /v1/teams/{teamId}/permissions/{membershipId}','ParityRouteSETROSTERSLOT']]){
 assert(product.Resources[prototype],prototype);assert(!product.Resources[id]);product.Resources[id]=structuredClone(product.Resources[prototype]);product.Resources[id].Properties.RouteKey=key;
}
// Existing same-domain invoke grants already cover /v1/teams*. Do not add a broader grant.
for(const id of ['ParityReadPermission','ParityCommandPermission'])assert(JSON.stringify(product.Resources[id].Properties.SourceArn).includes('/*/*/v1/teams*'));
const productText=json(product),productSha256=hash(productText),productKey='production/'+(optimized?productSha256.slice(0,32):productSha256)+'.json',bucket=product.Resources.ParityReadFunction.Properties.Code.S3Bucket;
write(evidence+'/'+productSha256+'.product.template.json',productText);
const security=JSON.parse(securityBytes),oldRuntimeArn='arn:aws:s3:::'+bucket+'/'+accepted.runtimes.read.key,newRuntimeArn='arn:aws:s3:::'+bucket+'/'+runtimeKey,oldProductArn='arn:aws:s3:::'+bucket+'/'+accepted.product.key,newProductArn='arn:aws:s3:::'+bucket+'/'+productKey,newProductUrl='https://'+bucket+'.s3.eu-north-1.amazonaws.com/'+productKey;
const extend=(value,old,newValue)=>Array.isArray(value)?value.includes(old)?[...new Set([...value,newValue])]:value:value===old?[old,newValue]:value;
const policyDiff=[],sizes={};
const optimization=[];
for(const [id,resource]of Object.entries(security.Resources)){
 const documents=resource.Type==='AWS::IAM::ManagedPolicy'?[resource.Properties.PolicyDocument]:resource.Type==='AWS::IAM::Role'?(resource.Properties.Policies??[]).map(p=>p.PolicyDocument):[];
 documents.forEach((document,index)=>{const before=json(document);
  for(const statement of document.Statement){for(const name of ['Resource','NotResource']){statement[name]=extend(statement[name],oldRuntimeArn,newRuntimeArn);statement[name]=extend(statement[name],oldProductArn,newProductArn);if(statement[name]===undefined)delete statement[name];}
   for(const conditions of Object.values(statement.Condition??{}))if(Object.hasOwn(conditions,'cloudformation:TemplateUrl'))conditions['cloudformation:TemplateUrl']=extend(conditions['cloudformation:TemplateUrl'],accepted.product.url,newProductUrl);
  }
  if(before!==json(document))policyDiff.push({resource:id,document:index,change:'Add exact new runtime/product artifact references and TemplateURL; retain all historical references'});
 });
 if(optimized&&id==='ExecutionBoundary'){
  const policy=resource.Properties.PolicyDocument;
  const group=policy.Statement.filter(s=>s.Effect==='Allow'&&!s.Condition&&!s.NotAction&&!s.NotResource&&[s.Resource].flat().every(r=>r!=='*'));
  const namespace=r=>(typeof r==='string'?r:r['Fn::Sub']).split(':')[2];
  const allowed=new Set(['apigateway','lambda','logs','cloudwatch','iam','s3']);
  for(const statement of group){const services=new Set([statement.Action].flat().map(a=>a.split(':')[0]));assert.equal(services.size,1);for(const resource of [statement.Resource].flat())assert(allowed.has(namespace(resource))&&services.has(namespace(resource)),'UNSUPPORTED_RESOURCE_MAPPING');}
  const atoms=statements=>[...new Set(statements.flatMap(s=>[s.Action].flat().flatMap(action=>[s.Resource].flat().filter(r=>namespace(r)===action.split(':')[0]).map(resource=>json({action,resource})))) )].sort();
  const combined={Effect:'Allow',Action:[...new Set(group.flatMap(s=>[s.Action].flat()))],Resource:group.flatMap(s=>[s.Resource].flat())};
  assert.deepEqual(atoms(group),atoms([combined]),'SERVICE_VALID_AUTHORIZATION_DIFF');
  policy.Statement=[...policy.Statement.filter(s=>!group.includes(s)),combined];
  optimization.push({resource:id,kind:'COMBINE_UNCONDITIONAL_SERVICE_DISJOINT_GRANTS',statements:group.length,preservedServiceValidAtoms:atoms(group).length,noNewActions:true,noNewResourceARNs:true,noConditionOrDenyChange:true,limitation:'Invalid action/resource-service combinations are not service-reaching requests. Required resource type mappings and effective IAM controls must be reviewed; this is not a claim that arbitrary invalid simulator pairs have identical decisions.'});
 }
 if(resource.Type==='AWS::IAM::ManagedPolicy')sizes[id]={count:JSON.stringify(resource.Properties.PolicyDocument).length,limit:6144};
 if(resource.Type==='AWS::IAM::Role')sizes[id]={count:(resource.Properties.Policies??[]).reduce((n,p)=>n+JSON.stringify(p.PolicyDocument).length,0),limit:10240};
}
const securityText=json(security),securitySha256=hash(securityText);write(evidence+'/'+securitySha256+'.security.template.json',securityText);
const resourceDiff=(a,b)=>({add:Object.keys(b.Resources).filter(id=>!a.Resources[id]),modify:Object.keys(a.Resources).filter(id=>b.Resources[id]&&json(a.Resources[id])!==json(b.Resources[id])),delete:Object.keys(a.Resources).filter(id=>!b.Resources[id])});
const diff=resourceDiff(baselineProduct,product);assert.deepEqual(diff.add,['MemberPermissionReadRoute','MemberPermissionWriteRoute']);assert.deepEqual(diff.modify.sort(),['ParityCommandFunction','ParityReadFunction']);assert.deepEqual(diff.delete,[]);
for(const id of Object.keys(baselineProduct.Resources).filter(id=>!diff.modify.includes(id)))assert.deepEqual(product.Resources[id],baselineProduct.Resources[id],id);
const quotaFailures=Object.entries(sizes).filter(([,s])=>s.count>s.limit);
const candidate={schemaVersion:'production-team-hub-permissions-review.v1',status:quotaFailures.length?'BLOCKED_POLICY_SIZE':'PREPARED_PENDING_SECURITY_AND_LIVE_REVIEW',authorizationRecorded:false,awsWrites:0,environment:accepted.environment,core:accepted.core,baseline:{manifestSha256:hash(manifestBytes),productSha256:accepted.product.sha256,securitySha256:accepted.security.sha256,runtimeSha256:accepted.runtimes.read.sha256},runtime:{path:evidence+'/'+runtimeSha256+'.runtime.zip',sha256:runtimeSha256,key:runtimeKey},product:{path:evidence+'/'+productSha256+'.product.template.json',sha256:productSha256,key:productKey},security:{path:evidence+'/'+securitySha256+'.security.template.json',sha256:securitySha256},resourceAccounting:{security:Object.keys(security.Resources).length,product:Object.keys(product.Resources).length,comparisonToAcceptedUndeployedCandidate:diff,awsGeneratedChangeSet:false},policyDiff,optimization,artifactNaming:optimized?'128-bit digest-prefix object keys; full 256-bit hashes remain mandatory in immutable publication/checksum gates. Stop on collision; never overwrite.':'Full SHA-256 object keys',policySizes:sizes,quotaFailures:quotaFailures.map(([id,size])=>({id,...size})),sourceHashes:sources,bundleClosure:Object.keys(output.metafile.inputs).filter(f=>!f.includes('node_modules')).map(file=>({path:file,sha256:hash(fs.readFileSync(file))})),rollback:{dataCompatibility:'Old strict codecs reject the new optional membership permissions attribute, including empty arrays. After first saved grant, keep a compatible codec and disable the feature rather than blindly restoring an old runtime. Source authority cannot be reopened by frontend rollback.',historicalProduct:accepted.product.sha256,historicalSecurity:accepted.security.sha256},remainingGates:['Fresh production preservation/security and IAM review including exact artifact grants','Separate candidate approval before production deployment; prior exact-hash dark approval does not cover this revision','Authority bootstrap, isolated cursor proof and nonempty source migration/fence/reconciliation separately authorized','Actual production permission save/revoke and five-persona acceptance','Production frontend bindings and exact-Master frontend-only publication after business acceptance']};
write(evidence+'/candidate.json',json(candidate));console.log(JSON.stringify({status:candidate.status,manifestSha256:hash(json(candidate)),runtimeSha256,productSha256,securitySha256,resources:candidate.resourceAccounting,policyDiff,sizes,awsWrites:0}));
