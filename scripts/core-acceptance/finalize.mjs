import fs from 'node:fs';import assert from 'node:assert/strict';import Ajv from 'ajv';
import {pin,read,sha,E as prior} from '../core-live/aws.mjs';
import {environmentContract} from '../../domains/shared-core/contracts.mjs';
const E='docs/architecture/core-acceptance-evidence-2026-10-06',save=(n,v)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const c=pin(),r=read(E+'/ordinary-receipt.json'),o=read(E+'/observability.json'),admin=read(prior+'/live-contracts.json');assert.ok(r.complete&&!r.failed&&r.checks.every(x=>x.pass));assert.ok(admin.personas.includes('admin')&&!admin.failed);assert.ok(admin.checks.filter(x=>x.label.startsWith('admin-')&&x.liveTested!==false).every(x=>x.pass));assert.ok(o.complete&&o.logsPresent&&o.secretScan==='PASS');assert.equal(o.errors+o.throttles+o.dependencyFailures,0);assert.ok(o.states.every(x=>x.status==='CREATE_COMPLETE'));
const required=['teams.admin','teams.branding.manage','unknown-capability','authorization-wrong-environment','exact-resolution','bounded-search','valid-cursor-pagination','query-minimum','result-maximum','directory-wrong-environment','unauthorized-search-missing-token','unauthorized-search-invalid-token','tampered-cursor','cursor-wrong-environment','cursor-wrong-contract','cursor-wrong-team','cursor-wrong-context','invalid-cursor','expired-cursor'];for(const label of required)assert.ok(r.checks.some(x=>x.label===label&&x.pass),'Missing required live check '+label);
assert.equal(r.identityClassification,'ORDINARY');assert.deepEqual(r.identityChecks,{enabled:true,confirmed:true,admin:false,superAdmin:false});assert.equal(r.optional.crossActor,'NOT_REQUIRED_FOR_RELEASE_1');assert.ok(['UNTESTED_LIVE_WITH_OFFLINE_COVERAGE','PASS_EXISTING_SAFE_FIXTURE'].includes(r.optional.disabledAccount));for(const key of ['cognitoMutations','teamWrites','legacyWrites','tournamentChanges','productionChanges','infrastructureWrites'])assert.equal(r[key],0);
for(const f of read(E+'/prior-evidence-preservation.json').files)assert.equal(sha(f.path),f.sha256,'Prior evidence changed: '+f.path);assert.ok(read(prior+'/effective-runtime.json').complete&&read(prior+'/effective-security.json').complete);
const acceptance={at:new Date().toISOString(),status:'ACCEPTED',migrationStatus:'INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED',ordinaryChecks:r.checks.length,adminEvidenceReused:prior+'/live-contracts.json',securityEvidenceReused:[prior+'/effective-security.json',prior+'/effective-runtime.json'],ordinaryReceipt:E+'/ordinary-receipt.json',observability:E+'/observability.json',optional:r.optional,remainingRequiredBlockers:[],infrastructureWrites:0,businessWrites:0,teamIntegrationStarted:false};
const installed=read(prior+'/product-installed.json');const manifest={schemaVersion:'core-endpoint.v1',domain:'Core',environment:'Ntgre',account:'058264289478',region:'eu-north-1',stack:'ProjectRespawn-Core-Ntgre',stackArn:installed.stack,status:'ACCEPTED',lambdaName:installed.function.name,lambdaArn:installed.function.arn,endpoint:installed.function.arn,invocation:'IAM',authMode:'AWS_IAM_AND_DELEGATED_COGNITO_ACCESS_JWT',contractVersions:['environment.v1','authorization.decision.v1','directory.assignment.v1'],environmentContract:environmentContract(read('config/environments/Ntgre.core.json')),deploymentRevision:c.productSha256,productRevision:c.productSha256,runtimeSha256:c.zipSha256,securityRevision:c.securitySha256,provenance:{acceptedAt:acceptance.at,report:'docs/architecture/core-release1-acceptance.md',adminReceipt:prior+'/live-contracts.json',ordinaryReceipt:E+'/ordinary-receipt.json',observability:E+'/observability.json',acceptance:E+'/acceptance.json'},frontendCutover:false,teamIntegrationDeployed:false};
const schema=read('scripts/core-acceptance/manifest.schema.json'),validateSchema=new Ajv({allErrors:true}).compile(schema);function validate(m){assert.ok(validateSchema(m),JSON.stringify(validateSchema.errors));assert.equal(m.productRevision,c.productSha256);assert.equal(m.deploymentRevision,c.productSha256);assert.equal(m.runtimeSha256,c.zipSha256);assert.equal(m.securityRevision,c.securitySha256);}
validate(manifest);let negatives=0;for(const edit of [{environment:'Production'},{status:'PLANNED_NOT_DEPLOYED'},{lambdaArn:'arn:aws:lambda:eu-north-1:058264289478:function:Wrong'},{contractVersions:['environment.v1']},{runtimeSha256:'0'.repeat(64)},{securityRevision:'0'.repeat(64)},{productRevision:'0'.repeat(64)},{secret:'forbidden-field'}]){assert.throws(()=>validate({...manifest,...edit}));negatives++;}
save('acceptance',acceptance);fs.mkdirSync('config/domains/core',{recursive:true});fs.writeFileSync('config/domains/core/domain-endpoints.Ntgre.json',JSON.stringify(manifest,null,2)+'\n');save('manifest-validation',{at:acceptance.at,generatedAfterAcceptance:true,schema:'scripts/core-acceptance/manifest.schema.json',schemaValidator:'Ajv',positive:1,negative:negatives,pinnedRevisionsVerified:true,secretsAllowed:false});
const report=`# PROJECT RESPAWN CORE — FINAL RELEASE 1 ACCEPTANCE

6 October 2026. **ACCEPTED — INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED.** The missing ordinary-user authorization, directory and required cursor checks passed against the already-deployed, unchanged Core runtime. No redeployment, IAM change, Cognito mutation or other-domain change occurred during this acceptance task.

[Acceptance decision](core-acceptance-evidence-2026-10-06/acceptance.json), [ordinary receipt](core-acceptance-evidence-2026-10-06/ordinary-receipt.json), [previous incomplete acceptance report](core-acceptance-evidence-2026-10-06/previous-incomplete-acceptance.md). Prior deployment/admin/security/isolation/observability files remain byte-identical: [preservation manifest](core-acceptance-evidence-2026-10-06/prior-evidence-preservation.json).

## Deployment and pins

ProjectRespawn-Core-Ntgre-Security and ProjectRespawn-Core-Ntgre both remain CREATE_COMPLETE, 5 security +8 product resources. ProjectRespawn-Core-Ntgre-Contracts remains Active; reserved concurrency NONE. Existing Cognito pool eu-north-1_n24iLL7QE and client unchanged. [Fresh narrow health check](core-acceptance-evidence-2026-10-06/health-before.json), [post-test health](core-acceptance-evidence-2026-10-06/observability.json).

Product revision/template SHA256: \`${c.productSha256}\`.

Runtime ZIP SHA256: \`${c.zipSha256}\`.

Security revision/template SHA256: \`${c.securitySha256}\`.

No synthesis/rebuild, template substitution or candidate changes. Both original inspected change sets executed with rollback enabled; [security events](core-live-evidence-2026-10-06/security-status.json), [product events](core-live-evidence-2026-10-06/product-status.json), [installed product](core-live-evidence-2026-10-06/product-installed.json). Those deployment changes occurred in the preceding task, not this acceptance run.

## Ordinary identity and contracts

One existing enabled, CONFIRMED Ntgre verification account, classified ORDINARY through fresh group reads; neither Admin nor SuperAdmin. Receipt stores a hashed stable reference only. Normal Amplify authentication followed the earlier Team Hub direct-verification approach; password, JWT and cursors remained in process memory and were cleared. No password, token, cursor, email, raw Cognito attributes or secret value is in the receipt.

authorization.decision.v1: teams.admin DENY; teams.branding.manage DENY; unknown capability rejected INVALID_INPUT; wrong environment rejected WRONG_ENVIRONMENT. Correct ordinary request returns a bounded false decision; no fallback ALLOW.

directory.assignment.v1: exact resolution PASS; bounded search PASS; query minimum and result maximum PASS; pagination PASS; cross-environment rejection PASS; absent/invalid delegated tokens rejected UNAUTHENTICATED. Responses checked for subject/displayName only per item, bounded counts and allowed envelope fields. Positive calls used the approved IAM-authenticated operator verification path with the ordinary delegated identity. Core is a service contract; future Team integration must enforce Team ownership/Manager authorization before delegation. This test grants no browser or Team invocation permission.

environment.v1 remains the existing static validated Ntgre descriptor. profile.summary.v1 remains not implemented by design. Existing [admin acceptance](core-live-evidence-2026-10-06/live-contracts.json) was reused, not rerun.

## Cursor and optional cases

Valid cursor accepted; tampered, invalid, wrong environment, wrong contract/context and wrong Team rejected. A real cursor was kept only in memory for more than five minutes and then rejected as expired. Cursor secret was never retrieved by verification tooling.

Cross-actor cursor: **NOT_REQUIRED_FOR_RELEASE_1**, as permitted by the accepted gate and current request; existing offline actor-binding coverage retained. Disabled account: **${r.optional.disabledAccount}**. No account was created or disabled to satisfy a fixture. These exclusions are explicit and are not counted as passed live tests.

## Observability and security

${r.checks.length}/${r.checks.length} ordinary live checks passed. Recorded acceptance window ${o.window.start} to ${o.window.end}: ${o.invocations} Lambda invocations, 0 errors, 0 throttles, 0 application dependency failures; application logs and duration metrics present; all four alarms OK. [Sanitized logs/metrics](core-acceptance-evidence-2026-10-06/observability.json). These are bounded-window claims, not all-time totals. Token/secret-pattern scan passed. The prior logging simulator classification remains SIMULATOR_UNSUPPORTED; no IAM changes were made.

Accepted 39 deployment-role and 36 runtime-role checks reused: [deployment](core-live-evidence-2026-10-06/effective-security.json), [runtime](core-live-evidence-2026-10-06/effective-runtime.json). Core retains only approved Cognito reads and strict runtime isolation. This run used normal sign-in, Core synchronous Invoke and read-only verification APIs. Cognito user/group mutations 0; Team business writes 0; Legacy writes 0; Tournament changes 0; production changes 0.

## Manifest and migration control

[Accepted Core manifest](../../config/domains/core/domain-endpoints.Ntgre.json) generated only after acceptance and validated with JSON Schema/Ajv plus exact-pin checks; one positive and eight negative validation cases. [Validation](core-acceptance-evidence-2026-10-06/manifest-validation.json). It includes stack/Lambda identities, IAM invocation, all three contract versions, pinned revisions and acceptance provenance; no secrets or consumer activation.

Existing protected baseline remains the accepted comparison evidence: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 40+7 / API t54b88casf / PRE_CUTOVER / LEGACY_WRITER; Tournament 11 / API msipnwy39j. [Protected comparison](core-live-evidence-2026-10-06/baseline-after.json), [runtime hashes](core-live-evidence-2026-10-06/protected-lambdas-after.json), [Team authority](core-live-evidence-2026-10-06/preservation.json). No expensive protected-domain inventory was repeated for this ordinary-only task.

Reviewed resource subtotal remains 2,692; zero Legacy savings, migration or retirement. [Existing accounting](core-live-evidence-2026-10-06/resource-accounting.json). Team Hub remains PRE_CUTOVER / LEGACY_WRITER. No Team integration started, no frontend cutover, no production work.

Remaining required acceptance blockers: **NONE**.

NEXT GATE: **TEAM HUB 2B5A-2 — CORE INTEGRATION**, requiring separate authorization. Do not start it from this acceptance.

CORE RELEASE 1 ACCEPTED — SHARED CONTRACTS READY FOR TEAM HUB INTEGRATION
`;
fs.writeFileSync('docs/architecture/core-release1-acceptance.md',report);
const statusPath='docs/architecture/domain-migration-status.json',status=read(statusPath),core=status.domains.find(x=>x.domain==='Shared/Core');status.scope='Core ordinary-user acceptance completed; no new infrastructure or domain changes';status.currentPhase='M3 / INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED';core.phase='M3_INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED';core.architectureStatus='INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED';core.awsStatus='CREATE_COMPLETE';core.nextStep='TEAM HUB 2B5A-2 — CORE INTEGRATION; separate authorization required';core.blockers=[];core.lastVerified=acceptance.at;core.release1Acceptance={status:'INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED',report:'docs/architecture/core-release1-acceptance.md',receipt:E+'/acceptance.json',manifest:'config/domains/core/domain-endpoints.Ntgre.json',infrastructureWrites:0};if(core.release1Deployment){core.release1Deployment.status='ACCEPTED';core.release1Deployment.accepted=true;}fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
const start='docs/architecture/README-PHASE2-MIGRATION.md';let text=fs.readFileSync(start,'utf8');text=text.replace(/<!-- CORE LIVE START -->[\s\S]*?<!-- CORE LIVE END -->/,'<!-- CORE LIVE START -->\n**Current Core Release 1 (6 October 2026): INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED.** Existing 8 product +5 security resources; ordinary/admin contracts, required cursors and privacy accepted; manifest generated and validated. No redeployment or IAM/user changes during final acceptance. Team remains PRE_CUTOVER / LEGACY_WRITER. [Acceptance report](core-release1-acceptance.md). Earlier Core entries below are historical.\n<!-- CORE LIVE END -->');text=text.replace(/^\| Shared\/Core \|.*$/m,'| Shared/Core | INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED; Core 8 product +5 security, CREATE_COMPLETE; same-environment Cognito preserved | TEAM HUB 2B5A-2 — CORE INTEGRATION; separate authorization required |');fs.writeFileSync(start,text);
console.log(JSON.stringify({accepted:true,ordinaryChecks:r.checks.length,manifestGenerated:true,schemaValidated:true,teamIntegrationStarted:false}));
