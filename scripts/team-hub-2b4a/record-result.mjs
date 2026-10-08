import fs from 'node:fs';import assert from 'node:assert/strict';const E='docs/architecture/team-hub-2b4a-evidence-2026-10-06',read=n=>JSON.parse(fs.readFileSync(E+'/'+n+'.json','utf8')),maybe=n=>fs.existsSync(E+'/'+n+'.json')?read(n):null;
const c=read('deployment-candidate'),product=read('product-installed'),security=read('security-installed-final'),runtime=read('runtime-installed'),auth=maybe('live-auth'),source=maybe('source-after'),legacy=maybe('legacy-after'),tournament=read('tournament-baseline'),sim=read('actual-role-simulation'),obs=maybe('observability');const writes=fs.readFileSync(E+'/aws-writes.jsonl','utf8').trim().split('\n').map(JSON.parse);assert.equal(writes.length,6);assert.ok(product.verified&&security.verified&&runtime.verified&&sim.complete);
const observed=obs?.functions.every(f=>f.platformReports.length>0&&f.metrics.Invocations.Datapoints.some(d=>d.Sum>0)&&f.metrics.Errors.Datapoints.every(d=>d.Sum===0)&&f.metrics.Throttles.Datapoints.every(d=>d.Sum===0))&&obs.apiMetrics.Count.Datapoints.some(d=>d.Sum>=50)&&obs.apiMetrics['5xx'].Datapoints.every(d=>d.Sum===0)&&obs.alarms.every(a=>a.StateValue==='OK');const metricsAcceptance=maybe('metrics-acceptance');const ready=!!(auth?.complete&&source?.complete&&source.empty&&legacy?.beforeAfterEqual&&observed&&metricsAcceptance?.accepted&&Date.parse(product.at)>Date.parse(auth.at));const report='docs/architecture/team-hub-2b4a-dark-mutation-runtime.md';
const doc=`# PROJECT RESPAWN TEAM HUB 2B4A — DARK MUTATION RUNTIME RESULT

6 October 2026. Team Hub M5 / Phase 2B4A, account 058264289478, region eu-north-1. Product and security deployment succeeded with rollback enabled. Runtime acceptance ${ready?'COMPLETE':'IN PROGRESS'}. Legacy remains LEGACY_WRITER; no frontend cutover, verification lease, synthetic data, authority seed or retirement.

## Authorization and acceptance decision

The attached 2B4A request separately authorized security/product execution only after reconciled gates. Both gates were emitted before execution. The pinned disabled runtime rejects reads as well as writes. Before AWS writes, all thirteen routes returned 403 FORBIDDEN in an offline packaged-handler proof. The user explicitly resolved the Step 22 conflict: **“Accept denied reads for this dark deployment; preserve the pin.”** Denied reads are therefore accepted for this stage; empty/not-found live business reads are not claimed. No business contracts, source manifest entries or pinned artifacts were changed.

## Preserved candidate

Product SHA256: ${c.productSha256}

Security SHA256: ${c.securitySha256}

Runtime ZIP: ${c.assetKey}

Bundle SHA256: ${c.bundleSha256}

All 35 source entries and bundle closure verified. No fresh synthesis or HEAD substitution. [Pinned proof](${E.split('/').at(-1)}/pinned-dark-proof.json). Two exact objects published with explicit AES256/SSE-S3; checksums verified. No KMS permissions added for publication. [Publication](${E.split('/').at(-1)}/publication.json).

## TEAM HUB 2B4A — SECURITY EXECUTION GATE

Stack ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity, 5 → 7 resources. Change set ${read('security-prepared').Id}. Two additions: ParityCommandBoundary and ParityReadBoundary. Three modifications: ExecutionBoundary (reviewed lifecycle ceiling), ExecutionRole (exact resource lifecycle identity), PreparationCaller (exact product template URL/object pin). Zero removals, replacements, conditional/dynamic replacements or unexpected changes. Exact AWS template and all logical IDs/types reconciled. [Complete AWS plan](${E.split('/').at(-1)}/security-change-set.json).

Command boundary: exact target tables and synthetic LeadingKeys, transactional writes only, bounded audit/idempotency. Read boundary: exact Operational Get/Query only; Journal denied. CreateApi, Legacy, Tournament, production, foreign DynamoDB, business S3/KMS, Cognito Admin, AppSync, IAM and CloudFormation denied to runtimes. Execution lifecycle limited to reviewed Team resources and existing API t54b88casf. No deployment caller data-plane permissions added. Managed boundary 6120/6144 characters; inline execution identity 8236/10240.

Analyzer zero findings; 18 positive/72 negative checks plus 12 lifecycle/PassRole checks passed. **READY TO EXECUTE TEAM HUB 2B4A SECURITY UPDATE** was recorded before execution. UPDATE_COMPLETE; rollback enabled. Installed documents read back and canonically equal; security suite rerun. [Installed security](${E.split('/').at(-1)}/security-installed-final.json).

## TEAM HUB 2B4A — PRODUCT EXECUTION GATE

Stack ProjectRespawn-TeamHub-Ntgre, 13 → 40 resources. Change set ${read('product-prepared').Id}. Exactly 27 additions, zero modifications/deletions/replacements/conditional or dynamic replacements/unexpected changes. Two Lambdas, two roles, two log groups, two invoke permissions, two integrations, thirteen JWT routes and four alarms. Existing thirteen definitions unchanged; no new API/pool/table/S3/AppSync/EventBridge/WebSocket. [Complete AWS plan](${E.split('/').at(-1)}/product-change-set.json).

API t54b88casf, PreviewRead Lambda/route, JWT authorizer and both protected tables preserved. Verification DISABLED, target writer disabled, Legacy LEGACY_WRITER. No Legacy/Tournament changes or production target. **READY TO EXECUTE TEAM HUB 2B4A** was recorded before execution. Restricted Deploy caller assumed in memory; existing ReadProofExecution role used; credentials never saved. UPDATE_COMPLETE, rollback enabled. [Product status](${E.split('/').at(-1)}/product-status.json), [installed product](${E.split('/').at(-1)}/product-installed.json).

## Runtime, authority and state

Command ProjectRespawn-TeamHub-Ntgre-ParityCommand; Read ProjectRespawn-TeamHub-Ntgre-ParityRead. Actual CodeSha256 matches pinned ZIP; environments match exact template with verification DISABLED and LEGACY_WRITER. Nine command and four real-read routes; branding routes absent. Preview stays SYNTHETIC, unchanged. Fourteen total routes and three total integrations use the existing API/JWT authorizer. [Runtime verification](${E.split('/').at(-1)}/runtime-installed.json).

Live authenticated denial: ${auth?.complete?'PASS, '+auth.results.length+' checks':'PENDING'}. Expected signed-in command/read result 403 FORBIDDEN; no-token/invalid/altered issuer/altered client command requests 401; preview 200. Altered issuer/client tokens have invalid signatures and do not independently isolate claim validation; exact deployed issuer/audience configuration supplies complementary evidence. Local helper forwards existing-session token only in memory to the fixed Ntgre API; no token/password/session stored. Existing CORS remains GET-only; the local relay is test tooling, not frontend cutover or production client readiness.

Target Operational and Journal ACTIVE, PITR/deletion protection enabled, Retain/Retain and original TableIds preserved. Two consistent count passes each: 0/0. Post-denial counts ${auth?.complete&&Date.parse(product.at)>Date.parse(auth.at)?'verified':'pending final refresh'}. No synthetic or authority-control record written. Real business reads and mutation parity remain unproved; ordinary users receive no target authority.

Actual runtime/execution-role simulation: ${sim.positive} allowed/${sim.negative} denied checks passed. Command limited to synthetic transactional namespace; Read only Operational Get/Query. Cross-domain, Cognito Admin, AppSync, business KMS/S3 denied. Reviewed AWS-managed Lambda decrypt exception preserved. [Actual-role security](${E.split('/').at(-1)}/actual-role-simulation.json).

## Observability and protected domains

Command/Read platform logs and invocation metrics: ${observed?'observed':'PENDING'}. Four new alarms ${obs?'verified':'pending verification'}. Existing API metrics configuration unchanged; no logging privilege expansion. Detailed per-route CloudWatch metrics are not enabled in the pinned stage (alternative evidence acceptance: ${metricsAcceptance?.accepted?'USER APPROVED':'PENDING'}); route-level acceptance is recorded through exact route/status/request IDs and API aggregate Count/4xx/5xx metrics. This is not a claim that detailed per-route metrics are enabled.

Legacy sources zero in two complete consistent passes; logos zero; PITR/deletion protection enabled; four exact backups AVAILABLE. Final source check ${source?.complete?'PASS':'PENDING'}. [Source recovery guard](team-hub-2b3-direct-legacy-recovery-protection.md) remains active: incidental Legacy deployment can reset out-of-band protections and is prohibited. Legacy ${legacy?.beforeAfterEqual?'2621 resources / directive 167; 62 protected identities, templates and five Lambda hashes unchanged':'full comparison pending'}. No Legacy deployment. Tournament UPDATE_COMPLETE, eleven resources, API msipnwy39j unchanged. Production untouched.

## Validation and disposition

Existing 2B4 suite rerun: 23/23 passed. Migration ledger 2621 rows reconciled, zero migrated/retired, 191 unresolved shared retained. Prior broad regression limitation remains documented in [2B4 readiness](team-hub-2b4-mutation-parity-readiness.md); no Legacy source/test changed. No commit/push requested. Six direct AWS mutations: security create/execute, ZIP/template publish, product create/execute. Service-managed resource operations are separate. Data written 0; frontend cutover false; verification never enabled.

Current domain Team Hub; phase 2B4A; AWS changes 6; Legacy/production changes 0; ledger ownership/migration/retirement unchanged. Next gate ${ready?'TEAM HUB 2B4B — TEMPORARY SYNTHETIC MUTATION VERIFICATION':'complete outstanding 2B4A live acceptance checks'}. 2B4B requires separate authorization; do not enable verification.

${ready?'TEAM HUB 2B4A DEPLOYED DARK — READY FOR SYNTHETIC VERIFICATION REVIEW':'DEPLOYED — ACCEPTANCE PENDING'}
`;
fs.writeFileSync(report,doc);const p='docs/architecture/domain-migration-status.json',s=JSON.parse(fs.readFileSync(p)),d=s.domains.find(x=>x.domain==='Team Hub');d.darkMutationReview={...d.darkMutationReview,status:ready?'DEPLOYED_DARK_ACCEPTED':'DEPLOYED_ACCEPTANCE_PENDING',verificationEnabled:false,targetWriter:false,liveMutationParityPerformed:false,deployed:true,awsWrites:6,productResources:40,securityResources:7,evidence:report};d.phase=ready?'M5_2B4A_DARK_RUNTIME_ACCEPTED':'M5_2B4A_DARK_RUNTIME_ACCEPTANCE_PENDING';d.mutationParity.status='INFRASTRUCTURE_DEPLOYED_DARK';d.mutationParity.verificationEnabled=false;d.mutationParity.liveTestPerformed=false;d.nextStep=ready?'TEAM HUB 2B4B — TEMPORARY SYNTHETIC MUTATION VERIFICATION; separate authorization required':'Complete outstanding 2B4A runtime acceptance';s.currentPhase=ready?'M5 / Phase 2B4A deployed dark; 2B4B review next':'M5 / Phase 2B4A deployed; acceptance pending';s.scope='Ntgre Team Hub 2B4A dark deployment only; writes disabled; Legacy authority retained';fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n');console.log(JSON.stringify({ready,awsWrites:6,report}));
