import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const E='docs/architecture/core-quota-evidence-2026-10-06',P='docs/architecture/core-2b5a-evidence-2026-10-06',read=p=>JSON.parse(fs.readFileSync(p)),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const candidate=read(E+'/candidate.json'),archive=E+'/historical';fs.mkdirSync(archive,{recursive:true});
const names=['core-domain-plan.md','core-first-deployment-readiness.md','core-release1-acceptance.md'];for(const name of names){const file='docs/architecture/'+name,target=archive+'/'+name;if(!fs.existsSync(target))fs.copyFileSync(file,target);}
save(E+'/historical-documents.json',{files:names.map(n=>({original:'docs/architecture/'+n,preserved:archive+'/'+n,sha256:sha(archive+'/'+n)})),previousProduct:read(P+'/candidate.json').productSha256,previousSecurity:read(P+'/candidate.json').securitySha256});
const oldManifest=read(P+'/source-manifest.json');for(const f of oldManifest.files){const archived=archive+'/'+f.path.split('/').at(-1);const file=names.some(n=>f.path==='docs/architecture/'+n)?archived:f.path;assert.equal(sha(file),f.sha256,'Unexpected prior source change '+f.path);}
const readiness=`# PROJECT RESPAWN CORE — QUOTA-CORRECTED CANDIDATE

6 October 2026. **CONCURRENCY CORRECTED; DEPLOYMENT REVIEW BLOCKED BY UNCHANGED ARTIFACT BINDINGS. DO NOT DEPLOY.**

## Decision and sole product change

Ntgre Core uses shared unreserved Lambda concurrency. ReservedConcurrentExecutions is **absent**, not zero; no provisioned concurrency or quota increase. This is a low-volume sandbox decision with no production SLO. Production requires its own account-capacity and reserved/provisioned concurrency review.

The original source is scripts/core-2b5a/build.mjs, Contracts Lambda Properties, ReservedConcurrentExecutions:5. The CDK app forwards that input; environment.v1 and runtime code do not set concurrency. No live Core Lambda exists. The historical builder is preserved. The current isolated derivation is [quota builder](../../scripts/core-quota/build.mjs), invoked with --domain core --env Ntgre --offline; it removes only that property from the preserved product input before independent CDK synthesis. Do not use the historical builder as the current deployment entrypoint.

[Semantic diff](core-quota-evidence-2026-10-06/semantic-diff.json) proves exactly one removal at /Resources/Contracts/Properties/ReservedConcurrentExecutions. Restoring value 5 makes the new template deeply equal to the old template. No resource addition/deletion/replacement, IAM, contract, route, Cognito, runtime or Lambda artifact change. Counts remain **8 product +5 security**.

## Revisions

Product revision and template SHA256 are the same identifier:

- Previous: ${candidate.previousProductSha256}
- Revised: ${candidate.productSha256}
- Security unchanged: ${candidate.securitySha256}
- Runtime ZIP unchanged: ${candidate.zipSha256}
- Runtime bundle unchanged: ${candidate.bundleSha256}

[Candidate receipt](core-quota-evidence-2026-10-06/candidate.json). Both old templates and ZIP remain preserved. Rebuilding the runtime produces identical bundle/ZIP bytes. Updated source documentation is archived with original hashes in [history mapping](core-quota-evidence-2026-10-06/historical-documents.json); the old source receipt is not regenerated to hide documentation changes.

## Remaining blocker — exact artifact reference

The old deployment caller permits CreateChangeSet only with cloudformation:TemplateUrl pointing at the old product hash. Caller and execution policies also allow S3 GetObject only for the old template object. The security template is byte-for-byte unchanged, so the revised URL/object is correctly denied.

[AWS artifact-binding checks](core-quota-evidence-2026-10-06/artifact-binding.json) confirm caller and execution GetObject implicitDeny. The normal new-template CreateChangeSet positive also returns implicitDeny. This is a real immutable-artifact binding mismatch, not the known logging simulator limitation. No old hash-based key will be overwritten with different bytes.

Per the instruction to stop if a further change is required, no security reference was changed. A subsequent review must replace only old template URL/object references with the reviewed new ones in caller identity/boundary and execution identity/boundary. That would change security bytes and requires a new security candidate/hash; there is no need to broaden runtime/Cognito/domain/service permissions. No proposed correction has been installed or silently included.

## Capacity and failure behavior

[Fresh quota](core-quota-evidence-2026-10-06/quota.json): account concurrency 10, unreserved 10, requested reserved NONE. The 100-unreserved reservation requirement no longer applies to this candidate. Core has no guaranteed reservation or private ceiling; its requests compete with other functions in the regional account pool. This accepts possible throttling for low-volume Ntgre only, not dedicated capacity or production isolation.

Team Core-client tests prove thrown Lambda throttling, timeout and service-unavailable errors and Core dependency-error envelopes map to DEPENDENCY_UNAVAILABLE for authorization, resolve and search, without default Allow, alternate transport, direct Cognito or Legacy fallback. This covers surfaced transport errors; an upstream invocation terminated by a hard platform timeout cannot return an application envelope, but cannot authorize a successful Team mutation through fallback. No runtime/client change was made.

Monitoring unchanged: native Lambda Invocations, Errors, Throttles and Duration; existing Errors/Throttles alarms; sanitized Core dependency-failure metrics and DependencyFailures alarm. Existing Denied alarm remains. No extra monitoring resource or recipient was silently added. Live traffic/log/metric acceptance remains a deployment gate.

## Validation and protected baseline

Core 37/37; Team integration/failure cases 20/20; accounting 41/41; existing Team/Core security regression 37/37. Independent synthesis, TypeScript and byte-identical runtime rebuild pass. Access Analyzer: five permission policies plus three trusts, zero findings; logging inclusion/negative controls 8/8.

Raw main IAM matrix: 27/27 negative checks pass; 10/12 positives pass. One positive is the previously classified Logs simulator limitation; one is the new template URL's real denial. Two additional required new-template object-read positives also deny. Therefore this is **not** a fully passing deployment-security gate. [Validation](core-quota-evidence-2026-10-06/validation.json), [IAM results](core-quota-evidence-2026-10-06/security-review.json).

[Fresh baseline](core-quota-evidence-2026-10-06/baseline.json): Legacy 2,621 / FunctionDirectiveStack 167, all accepted template/physical identities match; Team 40+7/API t54b88casf; Tournament 11/API msipnwy39j. All UPDATE_COMPLETE. [Team preservation](core-quota-evidence-2026-10-06/preservation.json): LEGACY_WRITER, verification disabled, accepted code and 35 source hashes unchanged. Core remains absent. No production changes, AWS mutations, artifact publication, quota request, business writes or frontend cutover.

The original quota-blocked review is retained in [historical documents](core-quota-evidence-2026-10-06/historical-documents.json). Ledger ownership is unchanged; no migration/cutover/retirement milestone is claimed.

NEXT GATE: **CORE EXACT-ARTIFACT SECURITY REBIND REVIEW**, before any deployment.

CORE QUOTA CORRECTION BLOCKED
`;
fs.writeFileSync('docs/architecture/core-first-deployment-readiness.md',readiness);
let plan=fs.readFileSync(archive+'/core-domain-plan.md','utf8');plan=plan.replace('6 October 2026. **Initial candidate review only; do not deploy.**','6 October 2026. **Revised Ntgre concurrency candidate; deployment blocked by unchanged exact-artifact security references. Do not deploy.**');plan=plan.replace('Reserved concurrency five caps in-flight work; request timeout ten seconds, SDK retries one.','Ntgre reserved concurrency is UNSET: Core shares the account’s unreserved pool (currently 10), with no guaranteed reservation or dedicated upper bound. This is accepted only for low-volume sandbox usage with observable throttles, no production SLO, and fail-closed consumers. Production reserved/provisioned concurrency and account quotas require a separate capacity review; do not inherit the Ntgre choice. Request timeout ten seconds, SDK retries one.');plan=plan.replace('[core-2b5a evidence](core-2b5a-evidence-2026-10-06/candidate.json)','[quota-corrected evidence](core-quota-evidence-2026-10-06/candidate.json)');plan+='\n## Historical source and current review\n\nThe original reserved-concurrency template and documentation are preserved. The revised product differs only by removal of ReservedConcurrentExecutions=5. Runtime and security bytes are unchanged. Exact old-template URL/object permissions now block the revised template; stop for separately reviewed artifact-reference rebinding. See [current readiness](core-first-deployment-readiness.md). No AWS deployment or quota change occurred.\n';fs.writeFileSync('docs/architecture/core-domain-plan.md',plan);
const acceptance=fs.readFileSync(archive+'/core-release1-acceptance.md','utf8');fs.writeFileSync('docs/architecture/core-release1-acceptance.md','# Core Release 1 — current status and historical attempt\n\n6 October 2026 update: **NOT DEPLOYED.** A new Ntgre-only candidate removes reserved concurrency without altering runtime or security. The quota incompatibility is resolved in that candidate, but unchanged deployment policies still bind the old hash-addressed template. No new deployment attempt occurred. [Current candidate review](core-first-deployment-readiness.md).\n\nThe earlier result below remains historical evidence; its quota blocker describes the original candidate. It is not a statement that the revised candidate requests a reservation.\n\n---\n\n'+acceptance);
const statusPath='docs/architecture/domain-migration-status.json',status=read(statusPath),shared=status.domains.find(d=>d.domain==='Shared/Core');status.currentPhase='M2 / Core Ntgre quota correction; ARTIFACT_REBIND_REVIEW_REQUIRED';status.scope='Offline concurrency-only correction with read-only validation; no AWS changes';shared.phase='M2_QUOTA_CORRECTED_SECURITY_REBIND_BLOCKED';shared.blockers=['Unchanged caller/execution policies bind previous template URL/object; revised product is denied pending exact-artifact security review.'];shared.nextStep='CORE EXACT-ARTIFACT SECURITY REBIND REVIEW; no deployment authorized';shared.quotaCorrectedCandidate={productSha256:candidate.productSha256,securitySha256:candidate.securitySha256,runtimeZipSha256:candidate.zipSha256,reservedConcurrency:'UNSET',quotaBlockerResolved:true,deploymentReady:false,report:'docs/architecture/core-first-deployment-readiness.md',awsChanges:0};shared.independentContractCandidate.status='SUPERSEDED_BY_QUOTA_CORRECTED_PRODUCT_PENDING_SECURITY_REBIND';save(statusPath,status);
const ledgerPath='docs/architecture/legacy-resource-ownership.json',ledger=read(ledgerPath);ledger.latestCoreQuotaReview={at:new Date().toISOString(),productResources:8,securityResources:5,ownershipRowsChanged:0,awsChanges:0,report:'docs/architecture/core-first-deployment-readiness.md'};save(ledgerPath,ledger);
const root='docs/architecture/README-PHASE2-MIGRATION.md';let text=fs.readFileSync(root,'utf8');if(!text.includes('**Latest Core quota correction'))text=text.replace('\n\n','\n\n**Latest Core quota correction (6 October 2026): PRODUCT CORRECTED; SECURITY ARTIFACT REBIND REVIEW REQUIRED.** Ntgre reserved concurrency removed; runtime/security unchanged, 8+5 resources. The old exact template URL/object permissions deny the new product. No AWS or quota changes. [Current readiness](core-first-deployment-readiness.md).\n\n');text=text.replace('Release 1 blocked before deployment by account concurrency quota','reserved concurrency removed; deployment blocked pending exact-artifact security rebinding');fs.writeFileSync(root,text);
console.log(JSON.stringify({documentsUpdated:3,historicalCandidatePreserved:true,securityChanged:false,awsChanges:0}));
