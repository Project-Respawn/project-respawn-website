// Portable offline checkpoint verification. Never invokes AWS or resynthesizes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(path.resolve('infrastructure/domains/tournaments/package.json'));
const Ajv=require('ajv');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const E='docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/';
export function verify(){
 const s=read(E+'accepted-state.json'),m=read('config/domains/team-hub/domain-endpoints.Ntgre.json');
 const r=read('docs/architecture/team-hub-2b2-evidence-2026-10-05/read-proof-receipt.json');
 assert.equal(s.accepted,true);assert.equal(s.productStatus,'CREATE_COMPLETE');assert.equal(s.productResources,11);
 assert.equal(s.apiId,'t54b88casf');assert.equal(s.firstCreateAuthorityEffective,false);
 assert.equal(s.execution,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution');
 assert.equal(s.caller,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-Deploy');
 assert.equal(s.authPassed,true);assert.equal(s.runtimePassed,true);assert.equal(s.frontendCutover,false);
 assert.equal(s.product,r.revision);assert.equal(r.revision,'d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f');
 const deltas=read('docs/architecture/team-hub-accepted-checkpoint/source-deltas.json');
 assert.equal(deltas.runtimeChanged,false);assert.equal(deltas.candidate,r.revision);assert.equal(deltas.changes.length,1);
 assert.equal(deltas.changes[0].path,'scripts/team-hub/tests/security-isolation.test.mjs');
 assert.equal(r.inputs.length,54);for(const f of [...r.inputs,...s.files]){
  const d=deltas.changes.find(d=>d.path===f.path);
  if(d){assert.equal(d.originalSha256,f.sha256);assert.equal(hash(d.originalSnapshot),f.sha256);assert.equal(hash(f.path),d.checkpointSha256);}
  else assert.equal(hash(f.path),f.sha256,'Accepted bytes changed: '+f.path);
 }
 assert.equal(hash('docs/architecture/team-hub-2b2-evidence-2026-10-05/read-proof.template.json'),m.provenance.templateSha256);
 assert.equal(hash(E+'lockdown-security.template.json'),s.steadyStateTemplateSha);
 assert.equal(m.deploymentRevision,s.product);assert.equal(m.apiId,s.apiId);assert.equal(m.stackName,s.productStack);assert.equal(m.provenance.frontendCutover,false);
 assert.equal(hash('config/environments/Ntgre.core.json'),m.provenance.coreSha256);
 const ajv=new Ajv({allErrors:true});assert.ok(ajv.validate(read('contracts/domain-endpoints-v1.schema.json'),m),JSON.stringify(ajv.errors));
 assert.equal(s.legacy.resources,2621);assert.equal(s.legacy.directive,167);assert.equal(s.legacy.timestampChanged,false);assert.equal(s.legacy.protectedIdentitiesChanged,0);
 assert.equal(s.tournament.resources,11);assert.equal(s.tournament.status,'UPDATE_COMPLETE');assert.equal(s.tournament.api,'msipnwy39j');assert.equal(s.tournament.lambdaChanged,false);assert.equal(s.tournament.securityChanged,false);
 return {accepted:true,sourceInputs:r.inputs.length,productResources:11,securityResources:s.securityResources,steadyStateExactApi:s.apiId,awsCalls:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(verify()));
