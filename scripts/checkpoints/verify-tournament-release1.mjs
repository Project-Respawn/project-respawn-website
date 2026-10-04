// Offline accepted-state validation. No AWS SDK/CLI, synthesis or deployment.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(path.join(root,'infrastructure/domains/tournaments/package.json'));
const Ajv=require('ajv'),ajv=new Ajv({allErrors:true});
export const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort()):x);
const check=(v,m)=>{if(!v)throw Error(m);};
export const E='docs/architecture/phase2a-tournament-runtime-kms-evidence-2026-10-04',P='infrastructure/security/tournaments-Ntgre-accepted-release1';
const validateEndpoint=ajv.compile(read('contracts/domain-endpoints-v1.schema.json'));
const validateCore=ajv.compile(read('contracts/environment-v1.schema.json'));
export function state(){return {manifest:read('config/domains/tournaments/domain-endpoints.Ntgre.json'),core:read('config/environments/Ntgre.core.json'),runtime:read(P+'/runtime-boundary.json'),execution:read(P+'/execution-policy.json'),deployment:read(P+'/deployment-policy.json'),installed:read(E+'/security-installed.json'),result:read(E+'/final-result.json'),live:read(E+'/live-resources.json')};}
export function verify(s=state()){
 check(validateEndpoint(s.manifest),'Endpoint schema invalid');check(validateCore(s.core),'Environment schema invalid');
 const m=s.manifest,c=s.core;
 check(m.domain==='Tournaments'&&m.domainOwner==='Tournaments'&&m.environment==='Ntgre'&&m.account==='058264289478'&&m.region==='eu-north-1','Wrong endpoint owner/environment');
 check(c.environment===m.environment&&c.account===m.account&&c.region===m.region,'Environment mismatch');
 check(m.stackName==='ProjectRespawn-Tournaments-Ntgre'&&m.stackArn===s.live.stack.StackId&&m.apiId===s.live.api.ApiId&&m.apiId==='msipnwy39j'&&m.endpoint===s.live.api.ApiEndpoint,'Endpoint differs from accepted deployment');
 check(m.deploymentRevision==='b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f'&&m.deploymentRevision===s.live.lambda.revision,'Wrong candidate');
 check(m.contractVersion==='tournament-preview.v1'&&m.provenance.frontendCutover===false&&m.provenance.lambdaCodeSha256===s.live.lambda.codeSha256,'Contract/asset/cutover mismatch');
 check(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'config/environments/Ntgre.core.json'))).digest('hex')===m.provenance.coreSha256,'Core provenance changed');
 check(s.result.accepted&&s.result.kmsRuntimeDecryptSucceeded&&s.result.postSuccessNegatives&&s.result.legacyBeforeAfterEqual&&s.result.errors===0&&s.result.alternativeLoggingCriterionAccepted,'Incomplete live acceptance');
 check(s.installed.runtime.policy.DefaultVersionId==='v2'&&s.installed.execution.policy.DefaultVersionId==='v8','Wrong installed security versions');
 for(const k of ['runtime','execution','deployment'])check(canonical(s[k])===canonical(s.installed[k==='deployment'?'deploy':k].document),'Installed '+k+' policy differs');
 check(!s.runtime.Statement.some(x=>x.Effect==='Allow'&&JSON.stringify(x.Action).toLowerCase().includes('kms:')),'Unexpected runtime KMS Allow');
 check(!s.execution.Statement.some(x=>x.Effect==='Allow'&&JSON.stringify(x.Action).toLowerCase().includes('kms:')),'Unexpected execution KMS Allow');
 check(s.live.resources.length===11&&s.live.stack.StackStatus==='UPDATE_COMPLETE','Wrong product state');
 return {accepted:true,revision:m.deploymentRevision,resources:11,runtimeBoundary:'v2',executionPolicy:'v8',endpointSchema:true,environmentSchema:true,awsCalls:0};
}
export function verifyFiles(){const p=read(P+'/package-status.json');for(const f of p.files){const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,P,f.path))).digest('hex');check(hash===f.sha256,'Accepted security file hash changed '+f.path);}return p.files.length;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify({...verify(),securityFiles:verifyFiles()},null,2));
