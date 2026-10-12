# Project Respawn Team Hub 2B6 — business runtime dark deployment result

8 October 2026. **TEAM HUB BUSINESS RUNTIME DEPLOYMENT BLOCKED** — infrastructure updates completed, but mandatory live acceptance failed. Do not confuse UPDATE_COMPLETE with runtime acceptance. No automatic permission patch, redeployment, code rollback, authority transition or frontend activation followed the failure.

## Deployed state and mandatory failure

Both Team Hub stacks reached UPDATE_COMPLETE with rollback enabled. Product has 48 resources; security has 7. The pinned runtime ZIP is installed in Read and Command, and installed policies/boundaries match the reviewed candidate. However, **both Lambda environments still contain only the eight previous environment variables**. They do not match the environment in the pinned, now-installed CloudFormation template.

Missing from both: TEAM_HUB_BUSINESS_RUNTIME, CORE_CONTRACT_ARN and CORE_ENVIRONMENT. Read additionally lacks TEAM_CURSOR_SECRET_ARN. The operator's GetFunctionConfiguration returned no Environment.Error. The new entry's missing CORE_ENVIRONMENT guard returns 503/DEPENDENCY_UNAVAILABLE before Journal, Core, secret access or business execution. The first authenticated authority request returned 503 instead of required 200; request ID E8jTahlFAi0EMSw= at 2026-10-08T22:27:46.660Z. Probes stopped immediately. Missing/invalid tokens had returned 401. No post-deployment 16-route or successful authority acceptance is claimed.

[Failure/configuration comparison](team-hub-business-dark-evidence-2026-10-08/failure-diagnostics.json), [stopped probes](team-hub-business-dark-evidence-2026-10-08/live-endpoint.json), [stop marker](team-hub-business-dark-evidence-2026-10-08/STOP.json).

CloudTrail records successful UpdateFunctionConfiguration and UpdateFunctionCode calls under the intended execution role; the sanitized record does not establish which environment values the provider submitted. The **reason CloudFormation completed without the proposed environment is unresolved**. A KMS/provider interaction must not be asserted as proven or used to justify a permission patch. [Lambda update metadata](team-hub-business-dark-evidence-2026-10-08/lambda-update-audit.json). The initial product-installed receipt checked template/code/dark flags only; it is superseded for full runtime acceptance by the failed environment comparison.

## Identity, exact pins and change sets

Account 058264289478; eu-north-1. Security operator arn:aws:iam::058264289478:user/RavenTest. Product caller ProjectRespawn-TeamHub-Ntgre-Deploy; existing CloudFormation execution role ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. No trust expansion or new administrative principal.

| Artifact | SHA-256 |
|---|---|
| Manifest | b137c2e8be1fa380b35cd401219327875e3c8cdaae58ac78969c4d799478091d |
| Product | a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad |
| Security | ff226268cf9221d6f3b42bcd06dbc1525d12cbe841bacd79ced0ac60bb016067 |
| Runtime | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |

All preserved candidate, runtime-source and referenced evidence hashes matched. Original blocked candidate and eight rollback/current artifacts remain preserved. No runtime rebuild, synthesis or HEAD substitution. Three exact objects were published using AES256/SSE-S3 and verified checksums. The security template is 52,719 bytes, so its unchanged bytes were submitted by TemplateURL instead of exceeding the 51,200-byte inline limit. [AWS CreateChangeSet limit](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html). This changes transport only, not the security template or product caller policy.

| Change set | Inspected changes | Result |
|---|---|---|
| arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-business-dark-security-20261008/ddb0668d-5f53-4d4b-9b06-baa7d2c1fbdc | 5 policy modifications; 0 additions/deletions/replacements | UPDATE_COMPLETE |
| arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-business-dark-product-20261008/590e5b92-9998-4e76-b423-8cdeb2ff2d21 | 6 additions, 5 modifications; 0 deletions/replacements | UPDATE_COMPLETE; live acceptance failed |

All pages and AWS-returned templates matched the pin. No conditional replacement or recreation requirement. Security modifies ExecutionBoundary, ExecutionRole, PreparationCaller, ParityReadBoundary and ParityCommandBoundary. Product adds CursorSecret, ListMyTeamsRoute, two directory routes and their two invocation permissions; modifies HttpApi CORS, two roles and two functions. Existing API t54b88casf, Cognito authorizer, authority route, tables and D1 resources are preserved. [Security gate](team-hub-business-dark-evidence-2026-10-08/security-gate.json), [product gate](team-hub-business-dark-evidence-2026-10-08/product-gate.json).

Seven direct control-plane writes: three PutObject, two CreateChangeSet, two ExecuteChangeSet. Both execute requests used DisableRollback=false. CloudFormation reported no update failure, so automatic stack rollback did not occur. No manual rollback was performed.

## Cursor secret and IAM

Created ARN: arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV.

AWS-managed key: arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a; default alias aws/secretsmanager, enabled. Metadata has one current version. No secret value was retrieved, persisted or printed. CloudTrail proves successful GenerateDataKey for this exact secret under ReadProofExecution. No execution-role Decrypt event was observed in the collected window; **Read-role decryption and cursor behavior are not live-proven**. [Metadata](team-hub-business-dark-evidence-2026-10-08/secret-metadata.json), [sanitized KMS audit](team-hub-business-dark-evidence-2026-10-08/kms-audit.json).

Read receives only the approved cursor-secret GetSecretValue and exact-key/service/account/Region/SecretARN-context Decrypt exception. Command and Core receive no cursor grant. Six-character suffix handling and negative controls passed. Actual installed Read/Command policies, boundaries and trust match the pin: 104 AWS IAM simulation decisions passed, including transactional-only Command writes, immutable authority, exact Core invocation, foreign-domain/Cognito/business-key/secret denials. Before execution, 81 cursor/security and 17 lifecycle decisions passed; eight Analyzer validations had no findings. These are IAM evaluations, not data-plane decryption or transaction acceptance. [Installed runtime/security checks](team-hub-business-dark-evidence-2026-10-08/runtime-security-after.json), [preflight policy checks](team-hub-business-dark-evidence-2026-10-08/security-review.json).

## Preserved authority, data and domains

Independent strongly consistent read matches every C1 field: LEGACY_WRITER, epoch 1, version 1, exact schema/key/audit metadata; exactly one control item. Temporary C1 executors remain absent. Operational has zero records. Journal has the same 15 retained audit rows plus one control row, no business records. Four Legacy source tables are empty in complete strong scans, PITR enabled, deletion protected, backups AVAILABLE; logos empty. Source table policies, logo policy and both gateways unchanged.

Legacy remains 2,621 resources / FunctionDirectiveStack 167; all 62 templates match. Core remains 8+5 and Tournament 11 with unchanged templates. Team Hub is 48+7. Legacy frontend and inactive cutover configuration preserved; no branding/private-note activation. No production change, fence, FROZEN/TARGET transition, Legacy retirement or ownership-ledger change. [Post-inventory](team-hub-business-dark-evidence-2026-10-08/after/inventory.json), [preservation](team-hub-business-dark-evidence-2026-10-08/preservation-after.json), [authority](team-hub-business-dark-evidence-2026-10-08/authority-after.json), [source fence preservation](team-hub-business-dark-evidence-2026-10-08/source-fence-preservation-after.json).

All 13 old routes returned 403 before deployment. After deployment the authority request failed before business probes, so their required 403 response and all 16 routes remain unaccepted. The fail-closed entry prevents business execution, but that code reasoning is not a substitute for normal live route acceptance. Core itself and invocation IAM are preserved; new business-runtime Core integration is not live accepted.

## Tests and telemetry

423 focused tests passed, plus TypeScript, resource accounting/isolation and ledger reconciliation. The prior reviewed build receipt remains applicable to the unchanged source/bundle; no new synthesis/build was substituted. Local Amplify outputs verified against Ntgre using read-only host credentials after sandbox credential visibility failed. [Validation](team-hub-business-dark-evidence-2026-10-08/validation.json).

D1 detailed API metrics and six alarms remain installed, with attended manual monitoring and no notification-delivery claim. For 22:27–22:28 UTC: API Count=3, 4xx=2, **5xx=1**; Lambda Invocations=1, Errors=0, Throttles=0; Requests=1 and DependencyFailures=1 exactly correlate to the failed request. CoreDependencyFailures, WriterNotAuthoritative, AuthorityUnavailable, AuthorityEpochMismatch, TransactionConflicts and TransactionThrottles were observed zero in that bounded window. A handled HTTP 503 does not increment Lambda Errors. This is a detected acceptance failure, not healthy acceptance. [Metrics](team-hub-business-dark-evidence-2026-10-08/failure-metrics.json), [alarms/stage](team-hub-business-dark-evidence-2026-10-08/observability.json).

Secret-pattern scans of current nonignored modified/untracked files returned zero findings. No credentials, sessions or secret values were committed; no commit/push was requested. [Scan receipt](team-hub-business-dark-evidence-2026-10-08/secret-scan.json).

## Stop state, recovery and next gates

Stop here. Review why installed environment differs from the exact successful CloudFormation plan, then separately review any repair or rollback candidate and its effective permissions. Do not silently broaden KMS, manually set Lambda variables or retry the deployment. Accepted endpoint product/security and both prior runtime archives remain available; pre-business-write rollback order remains product then security, retaining the cursor secret and authority row. Its actual execution path must be reviewed against this discrepancy before attempting it. No automatic secret deletion or C1 reinitialization.

Required next: resolve configuration mismatch and restore live authority/route acceptance; separately authorize isolated AWS Read-role decryption/cursor signing/tamper/expiry/cross-Team proof and business transactions/epoch/concurrency/persona/recovery proof. Gate B installed source-fence denial remains reserved for separately authorized FROZEN maintenance. TARGET authority transfer, frontend activation and Legacy retirement remain separate gates. No freeze is ready.

Current domain: Team Hub; phase: M5 / 2B6 dark deployment acceptance blocked. AWS changes: 7 direct control-plane writes; business/authority writes: 0. Legacy, production and ledger changes: 0. Next gate: read-only environment discrepancy investigation and separately reviewed repair/rollback.

**TEAM HUB BUSINESS RUNTIME DEPLOYMENT BLOCKED**
