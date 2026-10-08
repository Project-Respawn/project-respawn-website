import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const E='docs/architecture/core-artifact-evidence-2026-10-06';
const read=n=>JSON.parse(fs.readFileSync(E+'/'+n+'.json'));
const save=(n,v)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const c=read('candidate'),r=read('security-review'),q=read('quota');
const originalSources=JSON.parse(fs.readFileSync('docs/architecture/core-2b5a-evidence-2026-10-06/source-manifest.json')).files.filter(x=>x.path.startsWith('domains/shared-core/'));
assert.ok(originalSources.length>0);for(const f of originalSources)assert.equal(sha(f.path),f.sha256,'Core source changed: '+f.path);
save('source-preservation',{files:originalSources,allMatch:true,runtimeRebuilt:false});
assert.equal(r.failures.length,0);assert.equal(r.positive,16);assert.equal(r.negative,59);
assert.ok(r.checks.every(x=>x.pass&&!x.resource.includes('${')));
assert.ok(r.analyzer.every(x=>x.findings.length===0));assert.ok(read('trust-review').results.every(x=>x.findings.length===0));
assert.ok(read('validation').results.every(x=>x.exit===0));assert.equal(q.account,10);assert.equal(q.unreserved,10);
assert.equal(sha(E+'/product.template.json'),c.productSha256);assert.equal(sha(E+'/security.template.json'),c.securitySha256);assert.equal(sha(c.zipPath),c.zipSha256);
assert.equal(read('semantic-diff').changes.length,6);
save('publication-manifest',{published:false,requiredEncryption:'AES256',liveObjectEncryptionVerified:false,liveObjectChecksumVerified:false,reason:'Preparation only; publication and HeadObject verification remain deployment-review steps.',bucket:c.artifact.bucket,objects:[['product.template.json',c.artifact.templateKey], [c.zipPath,c.artifact.key]].map(([p,key])=>{const path=p==='product.template.json'?E+'/'+p:p;return{path,key,bytes:fs.statSync(path).size,sha256:sha(path),checksumSHA256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('base64'),serverSideEncryption:'AES256'};}),securityTemplateObject:'Not required: local TemplateBody bootstrap',kmsPermissionsAdded:false});
c.readyForDeploymentReview=true;c.deploymentAuthorized=false;c.deployable=false;c.blocker=null;c.deployed=false;c.validationAt=new Date().toISOString();save('candidate',c);
const report=`# PROJECT RESPAWN CORE — TEMPLATE ARTIFACT SECURITY CORRECTION GATE

6 October 2026. **CORE TEMPLATE SECURITY CORRECTION READY FOR DEPLOYMENT REVIEW.** Preparation only; Core is not deployed and execution is not authorized by this review.

## Product

Revision: preserved Ntgre quota-corrected product. Template SHA256: \`${c.productSha256}\`. Runtime ZIP SHA256: \`${c.zipSha256}\`. Product resources: 8; security resources: 5. ReservedConcurrentExecutions absent. Runtime bytes, contracts and runtime IAM unchanged; no runtime rebuild. [Candidate](core-artifact-evidence-2026-10-06/candidate.json), [preservation tests](core-artifact-evidence-2026-10-06/validation-correction.txt).

## Artifacts and rollback

Bucket: \`${c.artifact.bucket}\`.

- Previous template: \`core/2b5a/${c.previousProductSha256}/product.template.json\`.
- New template: \`${c.artifact.templateKey}\`.
- Runtime ZIP: \`${c.artifact.key}\`.

Both caller and execution identity/boundary evaluations allow each exact new template and ZIP. Random object, other hash, old template, Legacy, Team Hub, Tournament and production objects deny; ListBucket denies. No bucket/prefix-wide read granted. No security-template S3 object required: the reviewed bootstrap supplies local TemplateBody. [Individual IAM results](core-artifact-evidence-2026-10-06/security-review.json).

Old template retained locally for audit, but old deployment-role read permission removed. The old product was never deployed and its reservation is unusable at the existing quota. There is no previous accepted Core release to roll back to; first-create recovery uses CloudFormation rollback, with retained resources inspected before retry. [Exact six-reference diff and decision](core-artifact-evidence-2026-10-06/semantic-diff.json), [reference inventory](core-artifact-evidence-2026-10-06/reference-inventory.json).

Nothing published. [Publication manifest](core-artifact-evidence-2026-10-06/publication-manifest.json) fixes byte lengths, SHA256, base64 checksums and AES256/SSE-S3 for both objects. Actual S3 encryption/checksum verification must follow separately authorized publication; it is not claimed here. No KMS decrypt grant added. Historical Release 1 publication helpers still select old inputs and must not be used as current deployment authority.

## Security diff

Previous security candidate/template SHA256: \`${c.previousSecuritySha256}\`.

New security candidate/template SHA256: \`${c.securitySha256}\`.

Exactly six statement references changed: two caller TemplateUrl conditions and four caller/execution S3 object ARNs (identity and boundary). Reversing those strings reproduces the original security document semantically. Runtime boundary, Cognito read/mutation rules, logging, PassRole, stack scope, other-domain denials, business KMS, IAM administration, trust and CloudFormation service scope are unchanged.

## Validation

Positive IAM: ${r.positive}/${r.positive}. Negative IAM: ${r.negative}/${r.negative}. Every requested action/resource result retained individually. Access Analyzer: five policy documents plus three trusts; zero findings, errors, warnings or invalid actions. [Trust results](core-artifact-evidence-2026-10-06/trust-review.json). Local correction tests 4/4; runtime/contract/failure regression 35/35; migration ledger validation PASS. [Local results](core-artifact-evidence-2026-10-06/validation.json).

Logging discrepancy remains **SIMULATOR_UNSUPPORTED**; existing [unconditional controls](core-release1-evidence-2026-10-06/logging-controls.json) and [classification](core-release1-evidence-2026-10-06/logging-classification.json) remain accepted. No logging policy changes or reopening. IAM mutation checks cover IAM-authorized Cognito operations; they do not claim to govern APIs authorized directly by end-user access tokens. No Core live runtime acceptance claimed.

Unresolved for this correction: none. Subsequent deployment review must authorize exact artifacts/security, refresh gates, review AWS-generated changes and prove live runtime acceptance before Team integration.

## Quota and protected domains

Account concurrency 10; unreserved 10; Core reserved NONE. Quota blocker resolved without quota changes. [Read-only quota](core-artifact-evidence-2026-10-06/quota.json).

Legacy 2,621 / FunctionDirectiveStack 167, templates and physical IDs preserved. Team Hub 40 product +7 security, API t54b88casf, LEGACY_WRITER, verification DISABLED. Tournament 11, API msipnwy39j. Production not targeted. Core resources absent. [Baseline](core-artifact-evidence-2026-10-06/baseline.json), [Team preservation](core-artifact-evidence-2026-10-06/preservation.json), [absence](core-artifact-evidence-2026-10-06/absence.json).

AWS account 058264289478, region eu-north-1, operator arn:aws:iam::058264289478:user/RavenTest. AWS changes made: **0**. No publication, security installation, change-set creation/execution, quota update or deployment.
`;
fs.writeFileSync('docs/architecture/core-template-security-correction.md',report);
fs.mkdirSync(E+'/historical',{recursive:true});
for(const name of ['core-first-deployment-readiness.md','core-domain-plan.md','core-release1-acceptance.md']){
 const path='docs/architecture/'+name,archive=E+'/historical/'+name;
 if(!fs.existsSync(archive))fs.copyFileSync(path,archive);
 const original=fs.readFileSync(archive,'utf8');
 fs.writeFileSync(path,original.split('\n')[0]+'\n\n**Current gate (6 October 2026): CORE TEMPLATE SECURITY CORRECTION READY FOR DEPLOYMENT REVIEW — NOT DEPLOYED.** Exact artifact references corrected; product/runtime preserved. [Authoritative correction report](core-template-security-correction.md) and [current candidate](core-artifact-evidence-2026-10-06/candidate.json). No AWS changes or deployment authorization.\n\n## Historical prior gate (superseded by the current report above)\n\n'+original.split('\n').slice(1).join('\n'));
}
const start='docs/architecture/README-PHASE2-MIGRATION.md';let s=fs.readFileSync(start,'utf8');const first=s.indexOf('\n');s=s.slice(0,first+1)+'\n**Current Core artifact-security gate (6 October 2026): READY FOR DEPLOYMENT REVIEW — NOT DEPLOYED.** Six exact artifact references corrected; product/runtime unchanged; 8+5 resources; quota 10/10, reservation NONE. Zero AWS changes. [Authoritative report](core-template-security-correction.md). Earlier Core gate entries below are historical.\n'+s.slice(first+1);fs.writeFileSync(start,s);
const statusPath='docs/architecture/domain-migration-status.json',status=JSON.parse(fs.readFileSync(statusPath));status.scope='Core artifact-reference-only security correction; read-only AWS validation; no AWS changes';status.currentPhase='M2 / Core artifact security READY_FOR_DEPLOYMENT_REVIEW_NOT_DEPLOYED';const core=status.domains.find(x=>x.domain==='Shared/Core');core.phase='M2_ARTIFACT_SECURITY_READY_FOR_DEPLOYMENT_REVIEW';core.blockers=['Core deployment authorization, AWS change-set review and live acceptance remain future gates.'];core.nextStep='CORE FIRST DEPLOYMENT REVIEW; no execution authorized';core.lastVerified=c.validationAt;core.evidence.push('docs/architecture/core-template-security-correction.md');core.artifactCorrectedCandidate={status:'READY_FOR_DEPLOYMENT_REVIEW_NOT_DEPLOYED',candidate:E+'/candidate.json',productSha256:c.productSha256,securitySha256:c.securitySha256,runtimeZipSha256:c.zipSha256,awsChanges:0};fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
console.log('Final report and migration pointers updated; no AWS writes.');
