import fs from 'node:fs';import assert from 'node:assert/strict';
import {read,save,pin} from './execution.mjs';
const E='docs/architecture/team-hub-business-dark-evidence-2026-10-08',c=pin();
for(const n of ['artifact-review','preflight','security-review','lifecycle-security','validation','before/inventory','preservation','authority-after','after/inventory','preservation-after','runtime-security-after','installed-deployment-security','observability','failure-diagnostics','failure-metrics','source-fence-preservation-after'])assert.equal(read(n).complete,true,n);
assert.equal(read('security-status').stack.StackStatus,'UPDATE_COMPLETE');assert.equal(read('product-status').stack.StackStatus,'UPDATE_COMPLETE');assert.equal(read('live-endpoint').complete,false);
const writes=fs.readFileSync(E+'/aws-writes.jsonl','utf8').trim().split('\n').map(JSON.parse);assert.equal(writes.length,7);
const report='docs/architecture/team-hub-2b6-business-runtime-dark-deployment-result.md';
const body=`# Project Respawn Team Hub 2B6 — business runtime dark deployment result

8 October 2026. **TEAM HUB BUSINESS RUNTIME DEPLOYMENT BLOCKED** — infrastructure updates completed, but mandatory live acceptance failed. Do not confuse UPDATE_COMPLETE with runtime acceptance. No automatic permission patch, redeployment, code rollback, authority transition or frontend activation followed the failure.

## Deployed state and mandatory failure

Both Team Hub stacks reached UPDATE_COMPLETE with rollback enabled. Product has 48 resources; security has 7. The pinned runtime ZIP is installed in Read and Command, and installed policies/boundaries match the reviewed candidate. However, **both Lambda environments still contain only the eight previous environment variables**. They do not match the environment in the pinned, now-installed CloudFormation template.

Missing from both: TEAM_HUB_BUSINESS_RUNTIME, CORE_CONTRACT_ARN and CORE_ENVIRONMENT. Read additionally lacks TEAM_CURSOR_SECRET_ARN. The operator's GetFunctionConfiguration returned no Environment.Error. The new entry's missing CORE_ENVIRONMENT guard returns 503/DEPENDENCY_UNAVAILABLE before Journal, Core, secret access or business execution. The first authenticated authority request returned 503 instead of required 200; request ID E8jTahlFAi0EMSw= at 2026-10-08T22:27:46.660Z. Probes stopped immediately. Missing/invalid tokens had returned 401. No post-deployment 16-route or successful authority acceptance is claimed.

[Failure/configuration comparison](${E.split('/').at(-1)}/failure-diagnostics.json), [stopped probes](${E.split('/').at(-1)}/live-endpoint.json), [stop marker](${E.split('/').at(-1)}/STOP.json).

CloudTrail records successful UpdateFunctionConfiguration and UpdateFunctionCode calls under the intended execution role; the sanitized record does not establish which environment values the provider submitted. The **reason CloudFormation completed without the proposed environment is unresolved**. A KMS/provider interaction must not be asserted as proven or used to justify a permission patch. [Lambda update metadata](${E.split('/').at(-1)}/lambda-update-audit.json). The initial product-installed receipt checked template/code/dark flags only; it is superseded for full runtime acceptance by the failed environment comparison.

## Identity, exact pins and change sets

Account 058264289478; eu-north-1. Security operator arn:aws:iam::058264289478:user/RavenTest. Product caller ProjectRespawn-TeamHub-Ntgre-Deploy; existing CloudFormation execution role ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. No trust expansion or new administrative principal.

| Artifact | SHA-256 |
|---|---|
| Manifest | b137c2e8be1fa380b35cd401219327875e3c8cdaae58ac78969c4d799478091d |
| Product | ${c.productSha256} |
| Security | ${c.securitySha256} |
| Runtime | ${c.runtimeSha256} |

All preserved candidate, runtime-source and referenced evidence hashes matched. Original blocked candidate and eight rollback/current artifacts remain preserved. No runtime rebuild, synthesis or HEAD substitution. Three exact objects were published using AES256/SSE-S3 and verified checksums. The security template is 52,719 bytes, so its unchanged bytes were submitted by TemplateURL instead of exceeding the 51,200-byte inline limit. [AWS CreateChangeSet limit](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html). This changes transport only, not the security template or product caller policy.

| Change set | Inspected changes | Result |
|---|---|---|
| ${read('security-prepared').Id} | 5 policy modifications; 0 additions/deletions/replacements | UPDATE_COMPLETE |
| ${read('product-prepared').Id} | 6 additions, 5 modifications; 0 deletions/replacements | UPDATE_COMPLETE; live acceptance failed |

All pages and AWS-returned templates matched the pin. No conditional replacement or recreation requirement. Security modifies ExecutionBoundary, ExecutionRole, PreparationCaller, ParityReadBoundary and ParityCommandBoundary. Product adds CursorSecret, ListMyTeamsRoute, two directory routes and their two invocation permissions; modifies HttpApi CORS, two roles and two functions. Existing API t54b88casf, Cognito authorizer, authority route, tables and D1 resources are preserved. [Security gate](${E.split('/').at(-1)}/security-gate.json), [product gate](${E.split('/').at(-1)}/product-gate.json).

Seven direct control-plane writes: three PutObject, two CreateChangeSet, two ExecuteChangeSet. Both execute requests used DisableRollback=false. CloudFormation reported no update failure, so automatic stack rollback did not occur. No manual rollback was performed.

## Cursor secret and IAM

Created ARN: ${read('secret-metadata').secret.arn}.

AWS-managed key: ${c.keyArn}; default alias aws/secretsmanager, enabled. Metadata has one current version. No secret value was retrieved, persisted or printed. CloudTrail proves successful GenerateDataKey for this exact secret under ReadProofExecution. No execution-role Decrypt event was observed in the collected window; **Read-role decryption and cursor behavior are not live-proven**. [Metadata](${E.split('/').at(-1)}/secret-metadata.json), [sanitized KMS audit](${E.split('/').at(-1)}/kms-audit.json).

Read receives only the approved cursor-secret GetSecretValue and exact-key/service/account/Region/SecretARN-context Decrypt exception. Command and Core receive no cursor grant. Six-character suffix handling and negative controls passed. Actual installed Read/Command policies, boundaries and trust match the pin: 104 AWS IAM simulation decisions passed, including transactional-only Command writes, immutable authority, exact Core invocation, foreign-domain/Cognito/business-key/secret denials. Before execution, 81 cursor/security and 17 lifecycle decisions passed; eight Analyzer validations had no findings. These are IAM evaluations, not data-plane decryption or transaction acceptance. [Installed runtime/security checks](${E.split('/').at(-1)}/runtime-security-after.json), [preflight policy checks](${E.split('/').at(-1)}/security-review.json).

## Preserved authority, data and domains

Independent strongly consistent read matches every C1 field: LEGACY_WRITER, epoch 1, version 1, exact schema/key/audit metadata; exactly one control item. Temporary C1 executors remain absent. Operational has zero records. Journal has the same 15 retained audit rows plus one control row, no business records. Four Legacy source tables are empty in complete strong scans, PITR enabled, deletion protected, backups AVAILABLE; logos empty. Source table policies, logo policy and both gateways unchanged.

Legacy remains 2,621 resources / FunctionDirectiveStack 167; all 62 templates match. Core remains 8+5 and Tournament 11 with unchanged templates. Team Hub is 48+7. Legacy frontend and inactive cutover configuration preserved; no branding/private-note activation. No production change, fence, FROZEN/TARGET transition, Legacy retirement or ownership-ledger change. [Post-inventory](${E.split('/').at(-1)}/after/inventory.json), [preservation](${E.split('/').at(-1)}/preservation-after.json), [authority](${E.split('/').at(-1)}/authority-after.json), [source fence preservation](${E.split('/').at(-1)}/source-fence-preservation-after.json).

All 13 old routes returned 403 before deployment. After deployment the authority request failed before business probes, so their required 403 response and all 16 routes remain unaccepted. The fail-closed entry prevents business execution, but that code reasoning is not a substitute for normal live route acceptance. Core itself and invocation IAM are preserved; new business-runtime Core integration is not live accepted.

## Tests and telemetry

423 focused tests passed, plus TypeScript, resource accounting/isolation and ledger reconciliation. The prior reviewed build receipt remains applicable to the unchanged source/bundle; no new synthesis/build was substituted. Local Amplify outputs verified against Ntgre using read-only host credentials after sandbox credential visibility failed. [Validation](${E.split('/').at(-1)}/validation.json).

D1 detailed API metrics and six alarms remain installed, with attended manual monitoring and no notification-delivery claim. For 22:27–22:28 UTC: API Count=3, 4xx=2, **5xx=1**; Lambda Invocations=1, Errors=0, Throttles=0; Requests=1 and DependencyFailures=1 exactly correlate to the failed request. CoreDependencyFailures, WriterNotAuthoritative, AuthorityUnavailable, AuthorityEpochMismatch, TransactionConflicts and TransactionThrottles were observed zero in that bounded window. A handled HTTP 503 does not increment Lambda Errors. This is a detected acceptance failure, not healthy acceptance. [Metrics](${E.split('/').at(-1)}/failure-metrics.json), [alarms/stage](${E.split('/').at(-1)}/observability.json).

## Stop state, recovery and next gates

Stop here. Review why installed environment differs from the exact successful CloudFormation plan, then separately review any repair or rollback candidate and its effective permissions. Do not silently broaden KMS, manually set Lambda variables or retry the deployment. Accepted endpoint product/security and both prior runtime archives remain available; pre-business-write rollback order remains product then security, retaining the cursor secret and authority row. Its actual execution path must be reviewed against this discrepancy before attempting it. No automatic secret deletion or C1 reinitialization.

Required next: resolve configuration mismatch and restore live authority/route acceptance; separately authorize isolated AWS Read-role decryption/cursor signing/tamper/expiry/cross-Team proof and business transactions/epoch/concurrency/persona/recovery proof. Gate B installed source-fence denial remains reserved for separately authorized FROZEN maintenance. TARGET authority transfer, frontend activation and Legacy retirement remain separate gates. No freeze is ready.

Current domain: Team Hub; phase: M5 / 2B6 dark deployment acceptance blocked. AWS changes: 7 direct control-plane writes; business/authority writes: 0. Legacy, production and ledger changes: 0. Next gate: read-only environment discrepancy investigation and separately reviewed repair/rollback.

**TEAM HUB BUSINESS RUNTIME DEPLOYMENT BLOCKED**
`;
fs.writeFileSync(report,body);
const notice='**Business dark deployment (8 October 2026): BLOCKED — LIVE ACCEPTANCE FAILED.** Security/product are UPDATE_COMPLETE, Team Hub 48+7, but both Lambda environments lack the new business/Core variables; authenticated authority returned 503. LEGACY_WRITER epoch/version 1, empty business state and Legacy frontend remain. No automatic repair/rollback or cutover. [Result and stop-state evidence](team-hub-2b6-business-runtime-dark-deployment-result.md). Earlier entries below are historical.\n\n';
for(const name of ['README-PHASE2-MIGRATION.md','team-hub-2b6-business-runtime-readiness.md','team-hub-2b6-cursor-security-resolution.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md']){const p='docs/architecture/'+name,s=fs.readFileSync(p,'utf8'),i=s.indexOf('\n');fs.writeFileSync(p,s.slice(0,i+1)+'\n'+notice+s.slice(i+1));}
const path='docs/architecture/domain-migration-status.json',status=JSON.parse(fs.readFileSync(path));status.scope='Team Hub authorized dark deployment; infrastructure complete, live acceptance failed; no authority/frontend change';status.currentPhase='M5 / 2B6 BUSINESS_RUNTIME_DARK_ACCEPTANCE_BLOCKED';status.lastTaskAwsChanges=7;status.latestTaskAwsChanges={task:'BUSINESS_RUNTIME_DARK_DEPLOYMENT_ACCEPTANCE_BLOCKED',controlPlaneWrites:7,businessWrites:0,authorityWrites:0,productionChanges:0};const team=status.domains.find(x=>x.domain==='Team Hub');team.phase='M5_2B6_BUSINESS_RUNTIME_DARK_ACCEPTANCE_BLOCKED';team.awsStatus='UPDATE_COMPLETE';team.blockers=['Installed Lambda environments differ from pinned template; authenticated authority returns 503','Post-deployment normal-route denial and Core/business acceptance incomplete','Isolated AWS cursor decryption and transaction/epoch/persona proofs pending','Gate B installed fence proof requires separately authorized FROZEN maintenance','Final authority/frontend transition remains separately unauthorized'];team.nextStep='Investigate environment mismatch read-only; separately review repair or rollback before any further deployment or maintenance';team.lastVerified=new Date().toISOString();team.evidence.push(report);team.businessRuntimeReadiness.status='DEPLOYED_NOT_ACCEPTED_CONFIGURATION_MISMATCH';team.businessRuntimeReadiness.deployed=true;team.businessRuntimeReadiness.liveAccepted=false;team.businessRuntimeReadiness.awsChanges=7;team.businessRuntimeReadiness.productResources=48;team.businessRuntimeReadiness.deploymentReport=report;team.cursorSecurityResolution.status='INSTALLED_SECRET_CREATED_READ_DECRYPTION_PENDING';team.cursorSecurityResolution.actualSecretArn=read('secret-metadata').secret.arn;team.cursorSecurityResolution.liveDecryptionProven=false;team.cursorSecurityResolution.deploymentReport=report;fs.writeFileSync(path,JSON.stringify(status,null,2)+'\n');
save('result',{at:new Date().toISOString(),status:'TEAM_HUB_BUSINESS_RUNTIME_DEPLOYMENT_BLOCKED',report,candidateManifestSha256:'b137c2e8be1fa380b35cd401219327875e3c8cdaae58ac78969c4d799478091d',securityStatus:'UPDATE_COMPLETE',productStatus:'UPDATE_COMPLETE',productResources:48,securityResources:7,liveAccepted:false,blocker:'Missing installed Lambda business/Core environment variables; authority endpoint 503',authority:'LEGACY_WRITER',epoch:1,version:1,businessRecordsChanged:0,awsWrites:writes.length,frontendActivated:false,productionChanges:0,legacyChanges:0,ledgerChanges:0,automaticRetry:false,permissionPatch:false,rollbackPerformed:false,liveReadDecryptionProven:false});
console.log(JSON.stringify({report,status:'BLOCKED',awsWrites:7,authority:'LEGACY_WRITER',epoch:1}));
