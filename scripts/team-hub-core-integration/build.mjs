import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {createRequire} from 'node:module';
import {singleFileZip} from '../team-hub-2b4/zip.mjs';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';
import {compactExecutionBoundary} from './compact-policy.mjs';
const E='docs/architecture/team-hub-core-integration-evidence-2026-10-07',B='.tmp/team-hub-core-integration';fs.mkdirSync(B,{recursive:true});
const read=n=>JSON.parse(fs.readFileSync(`${E}/${n}.json`)),save=(n,v)=>fs.writeFileSync(`${E}/${n}.json`,JSON.stringify(v,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const product=read('product-before.template'),security=read('security-before.template');
assert.equal(Object.keys(product.Resources).length,40);assert.equal(Object.keys(security.Resources).length,7);
const esbuild=createRequire(path.resolve('infrastructure/domains/team-hub/package.json'))('esbuild');
const bundle=await esbuild.build({entryPoints:['domains/team-hub/core-integration/entry.mjs'],outfile:B+'/index.js',bundle:true,platform:'node',format:'cjs',target:'node22',metafile:true,logLevel:'silent'});
const inputs=Object.keys(bundle.metafile.inputs);assert.ok(!inputs.some(x=>/parity\/|repository|cutover\/(entry|handler|authority|service)/.test(x)));assert.ok(inputs.includes('config/domains/core/domain-endpoints.Ntgre.json'));
fs.writeFileSync(B+'/runtime.zip',singleFileZip('index.js',fs.readFileSync(B+'/index.js')));
const zipSha256=sha(B+'/runtime.zip'),assetKey=`team-hub/core-integration/${zipSha256}.zip`,bucket='cdk-hnb659fds-assets-058264289478-eu-north-1';
const oldAsset=product.Resources.ParityCommandFunction.Properties.Code.S3Key;
for(const kind of ['Command','Read']){
 const policy=security.Resources[`Parity${kind}Boundary`].Properties.PolicyDocument;
 policy.Statement=policy.Statement.filter(s=>!s.NotAction&&!JSON.stringify(s).includes('dynamodb:'));
 policy.Statement.unshift({Sid:'OnlyDarkCoreIntegration',Effect:'Deny',NotAction:['logs:CreateLogStream','logs:PutLogEvents','kms:Decrypt','lambda:InvokeFunction'],Resource:'*'});
 const coreTargets=[acceptedCore.lambdaArn,acceptedCore.lambdaArn+':$LATEST'];policy.Statement.push({Effect:'Allow',Action:'lambda:InvokeFunction',Resource:coreTargets},{Effect:'Deny',Action:'lambda:*',NotResource:coreTargets});
 product.Resources[`Parity${kind}Role`].Properties.Policies[0].PolicyDocument=structuredClone(policy);
 const f=product.Resources[`Parity${kind}Function`].Properties;f.Code.S3Key=assetKey;
 f.Environment.Variables={...f.Environment.Variables,TEAM_HUB_AUTHORITY:'LEGACY_WRITER',TEAM_HUB_STAGE:'PRE_CUTOVER',TEAM_HUB_NORMAL_WRITES:'DISABLED'};
 assert.equal(JSON.parse(f.Environment.Variables.TEAM_HUB_VERIFICATION).mode,'DISABLED');save(kind.toLowerCase()+'-policy',policy);
}
save('product.template',product);const productSha256=sha(E+'/product.template.json'),key=`team-hub/core-integration/${productSha256}.template.json`,url=`https://${bucket}.s3.eu-north-1.amazonaws.com/${key}`;
// Extend exact artifact references only; keep the prior reviewed artifact for rollback.
let rebound=0;
function extend(value){
 if(Array.isArray(value)){
  const result=value.map(extend);
  if(value.includes(`arn:aws:s3:::${bucket}/${oldAsset}`)){result.push(`arn:aws:s3:::${bucket}/${assetKey}`);rebound++;}
  const oldTemplate=value.find(x=>typeof x==='string'&&x.startsWith(`arn:aws:s3:::${bucket}/team-hub/parity/`)&&x.endsWith('.template.json'));
  if(oldTemplate){result.push(`arn:aws:s3:::${bucket}/${key}`);rebound++;}return result;
 }
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>{
  if(k==='cloudformation:TemplateUrl'){assert.equal(typeof v,'string');assert.ok(v.includes('/team-hub/parity/'));rebound++;return[k,[v,url]];}return[k,extend(v)];
 }));return value;
}
const nextSecurity=extend(security);assert.equal(rebound,6);nextSecurity.Resources.ExecutionBoundary.Properties.PolicyDocument=compactExecutionBoundary(nextSecurity.Resources.ExecutionBoundary.Properties.PolicyDocument);for(const r of Object.values(nextSecurity.Resources).filter(r=>r.Type==='AWS::IAM::ManagedPolicy'))assert.ok(JSON.stringify(r.Properties.PolicyDocument).length<=6144);save('security.template',nextSecurity);
for(const [n,p] of [['execution-identity',nextSecurity.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument],['execution-boundary',nextSecurity.Resources.ExecutionBoundary.Properties.PolicyDocument],['caller-policy',nextSecurity.Resources.PreparationCaller.Properties.PolicyDocument]])save(n,p);
const changed=(old,next)=>{assert.deepEqual(Object.keys(old.Resources).sort(),Object.keys(next.Resources).sort());return Object.keys(next.Resources).filter(k=>JSON.stringify(old.Resources[k])!==JSON.stringify(next.Resources[k]));};
const changes={product:changed(read('product-before.template'),product),security:changed(read('security-before.template'),nextSecurity)};
assert.deepEqual(changes.product.sort(),['ParityCommandFunction','ParityCommandRole','ParityReadFunction','ParityReadRole']);
assert.deepEqual(changes.security.sort(),['ExecutionBoundary','ExecutionRole','ParityCommandBoundary','ParityReadBoundary','PreparationCaller']);
save('candidate',{at:new Date().toISOString(),productSha256,securitySha256:sha(E+'/security.template.json'),zipSha256,zipPath:B+'/runtime.zip',bucket,assetKey,key,url,changes,resources:{product:40,security:7},coreManifestSha256:sha('config/domains/core/domain-endpoints.Ntgre.json'),inputs,sourceHashes:inputs.filter(p=>!p.includes('node_modules')).map(p=>({path:p,sha256:sha(p)})),authority:'LEGACY_WRITER',stage:'PRE_CUTOVER',normalWritesEnabled:false,verification:'DISABLED',awsWrites:0});
console.log(JSON.stringify({productSha256,zipSha256,changes,resources:'40+7',awsWrites:0}));
