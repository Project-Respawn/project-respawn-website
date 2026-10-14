# Project Respawn Team Hub 2B6 — isolated AWS business verification

**Quota-corrected isolated AWS verification (12 October 2026): ACCEPTED — READY FOR FINAL CUTOVER REVIEW.** 48/48 real isolated DynamoDB scenarios and nine actual-Read-role cursor checks passed; CloudTrail retrieval/decryption, native metrics, cleanup and final preservation verified. Four temporary resources and exact artifact removed. Real LEGACY_WRITER epoch/version 1, empty permanent business state, permanent IAM/code, Legacy frontend and protected domains preserved. No cutover or retirement. [Authoritative result and evidence](team-hub-2b6-quota-corrected-isolated-aws-verification-result.md). Earlier entries are historical.


## Quota-corrected candidate — current

**QUOTA-CORRECTED ISOLATED VERIFICATION READY FOR EXECUTION REVIEW.** This update authorizes candidate preparation and read-only validation only. No change set, artifact upload, AWS resource/IAM change, invocation, business write or cutover occurred. The earlier four-resource candidate and failed quota evidence are preserved unchanged.

### Exact change and pins

Remove only `Resources.CursorProbe.Properties.ReservedConcurrentExecutions` (previous value 1). The property is absent; it is not replaced with zero. Reintroducing the old property in memory makes the complete corrected template deeply equal to the original. No API, role, policy, KMS, log-group, table, ZIP, source or permanent-domain change is included.

| Artifact | SHA-256 |
| --- | --- |
| Corrected candidate | `13db6824ce0f661a4b271a38108c706204b886edb5c7e6e39eea68fc2e492a4b` |
| Corrected template | `62a06af84531336c4067d5a4158575d7a84b2ed9029a4f51765fe34b878a7c9f` |
| Original policy, unchanged | `91f88143ba16d5c11cdfd1293c86fbd5ca7c2a2f04311c5962f6112a28228d97` |
| Original probe ZIP, unchanged | `a072a13df0aa7e4299fb8f01a8e77513e8f9bcf6ae37c4867a933b1f09e9d1e4` |
| Original blocked candidate, preserved | `5b701d83da949d2a59df7807f6fe716986432cd08b2e0a84fde72dd0d6f03da6` |

[Candidate](team-hub-isolated-quota-evidence-2026-10-12/candidate.json), [execution manifest](team-hub-isolated-quota-evidence-2026-10-12/execution-manifest.json), [semantic diff](team-hub-isolated-quota-evidence-2026-10-12/semantic-diff.json). The sourceHashes array is exactly unchanged and all files still match. The new preparation/inspection tools are separate from those pinned sources; no runtime build or fresh synthesis was substituted. Do not rerun the original prepare.mjs to regenerate this candidate or the prior execution preflight/custody scripts that bind the old template and reservation. Future execution must load the corrected execution manifest explicitly.

### Capacity and replacement controls

Fresh account settings in [capacity](team-hub-isolated-quota-evidence-2026-10-12/capacity.json) remain total 10/unreserved 10, with 69 functions. The removed reservation previously conflicted with AWS's requirement to leave 100 unreserved. No quota increase or existing-function concurrency change is proposed. [Recent telemetry](team-hub-isolated-quota-evidence-2026-10-12/capacity-telemetry.json) has 15 one-minute datapoints per signal: maximum concurrency 2 and throttle sum 0 over the sampled 15-minute window. Historical utilization is not guaranteed execution headroom.

The probe now shares unreserved account capacity; it no longer has an AWS-enforced concurrency-one cap. Require one security-owned, synchronous empty-input invocation, SDK maxAttempts 1, no retry, no parallel probe/transaction workloads, and no public URL/API/event trigger. The transaction suite runs in order, preserving only its already-reviewed two-request race cases. Recheck current capacity/metrics immediately before execution; stop on throttling, exhaustion, unexplained invocations or insufficient cleanup time. Do not replace the removed reservation with zero or modify another function to obtain capacity.

### Resource and security review

Four temporary CloudFormation resources remain: two isolated tables, one restricted runner role with its existing inline policy, and one cursor-probe Lambda. No new managed policy, log group, invocation permission, API, secret or permanent resource. The existing Read role/log group and exact unchanged S3 probe object remain dependencies. That object may be uploaded only under later execution authorization. Offline delta is four additions and zero modifications/deletions/replacements to existing resources; actual AWS change-set classification remains a future gate.

Fresh installed Read/Command/execution/caller policies and boundaries match the accepted baseline. [Runtime IAM](team-hub-isolated-quota-evidence-2026-10-12/runtime-security.json): 65 actual-role checks pass, four Analyzer validations with zero findings. [Temporary runner](team-hub-isolated-quota-evidence-2026-10-12/proposal-security.json): 36 allowed/denied/time/region checks pass and Analyzer zero findings. No permissions changed. These are IAM evaluations, not successful secret decryption or real business acceptance.

Read-role reuse does not add permissions. Its existing Team-owned reads and accepted Core invocation are still allowed: **do not claim this is a secret-only IAM role**. The fixed, byte-verified probe exposes no selectable action/resource/input, contains no DynamoDB/Core client or arbitrary invocation route, and returns only booleans. Empty-input and no-secret-output regressions pass; business writes, foreign resources, code changes, PassRole, Cognito administration and unrelated secret/KMS controls remain denied in the existing role model. Provisioning custody must still prevent arbitrary code/role/input substitution. Without changing the preserved IAM, code integrity and controlled invocation are necessary parts of this reviewed design.

### Fresh preservation and tests

[Baseline](team-hub-isolated-quota-evidence-2026-10-12/baseline.json), [protected resources](team-hub-isolated-quota-evidence-2026-10-12/protected-after.json), [inventory](team-hub-isolated-quota-evidence-2026-10-12/after/inventory.json): Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48+7; Core 8+5; Tournament 11. Both Lambdas retain complete configuration/code, Active/Successful and IN_SYNC. Actual authority is LEGACY_WRITER epoch/version 1. Operational 0; Journal 16 = authority plus 15 historical audits, zero business records. Source recovery protections/backups and empty source/logo inventory remain intact. Frontend remains dormant/Legacy and source fence absent. Six D1 alarms/configuration preserved. No fresh authenticated API/browser acceptance is claimed by this preparation.

50 focused tests pass, including minimal-diff/pins, cursor and business-runtime regressions and the emulator-driven 48-scenario runner; 41 resource-accounting tests pass. All nine cursor checks remain unchanged and pass offline with synthetic material. Accepted 75 pins/nine archived artifacts and the ledger reconcile: 2,621 total, 2,430 assigned, 191 unresolved shared, 0 unassigned. Secret-pattern and documentation checks are recorded alongside this report. No actual DynamoDB scenario or secret retrieval was executed. No new TypeScript/runtime implementation was introduced; this is an offline template and manifest correction.

### Separately authorized execution sequence and cleanup

1. Refresh identity/account/region, quotas/utilization, exact temporary-name absence, full installed IAM, all protected configurations/templates/state and source recovery; obtain fresh authenticated authority/16-dark-route proof using existing sessions.
2. Verify this execution manifest and every unchanged source/policy/ZIP hash. Stop on any substitution. Verify no existing probe trigger or unintended invoker. Confirm the one-at-a-time invocation plan and the distinct runner permission window (at most one hour).
3. Complete provisioner lifecycle/PassRole/artifact security checks, actual Read-role isolation and runner certification. Preserve the documented organization-visibility limitation; do not claim simulator results prove all external policy layers.
4. Publish only the exact reviewed ZIP if separately authorized. Prepare the exact temporary change set, inspect every resource/property/IAM effect, require only four expected additions and no protected modifications/deletions/replacements. Rollback enabled.
5. Provision only after all gates pass; verify installed trust/policy/window, schema/tags, exact code/role/log configuration and absence of ReservedConcurrentExecutions. Run installed-runner positive/negative checks before test writes.
6. Run the unchanged 48 scenarios under the restricted runner on exact isolated tables. Preserve only the approved internal concurrency races; require atomicity, denials, replay/audit integrity, privacy and sanitized reconciliation receipts. Never alter the real authority row.
7. Invoke the unchanged nine-check probe exactly once with {} under the reviewed security custody. Require actual Read-role retrieval/decryption plus all booleans, no secret/token output and no unexplained error/throttle. Do not retry ambiguous failures or enable business routes to reach pagination.
8. Verify monitoring and permitted persona/privacy scope. Synthetic Core/persona adapters remain synthetic; real Core/browser/business-path acceptance is a separate remaining cutover proof. Refresh D1/native signals with bounded ingestion polling.
9. Capture durable before/after-cleanup digests. Remove only exact rehearsal-owned synthetic rows/resources and the exact uploaded object; verify both tables, role and function absent. Preserve the existing Read role/log group, permanent records and audit evidence. If partial provisioning/tests fail, collect evidence and clean up only resources created by this lifecycle. Never roll back by applying the obsolete reserved-concurrency template.
10. Refresh protected domains, actual LEGACY_WRITER 1/1 and business emptiness, permanent IAM/code and frontend/fence state. No real cutover, retirement or production change is authorized here.

Remaining live gates: complete provisioning custody, actual change set, installed temporary IAM, all 48 AWS transactions, actual Read-role cursor/KMS proof, telemetry and cleanup/preservation. Later source-fence proof, business authority transfer, frontend publication and rollback remain separately authorized. Current domain Team Hub, phase M5/2B6 preparation; AWS/Legacy/production/ledger changes all zero.

---

Historical preparation and failed execution chronology follows; the corrected manifest above is the current candidate.


**Isolated AWS verification execution (12 October 2026): BLOCKED BEFORE AWS WRITES — PINNED CURSOR PROBE RESERVED-CONCURRENCY GATE.** The exact reviewed probe reserves 1 execution, but fresh AWS limits report 10 total/unreserved; AWS requires 100 left unreserved. Candidate pins and protected baselines verified. No artifact upload, change set, resource creation, transaction/cursor invocation, authority/frontend change or cleanup write occurred. Prior preparation missed this quota constraint. [Actual stop evidence and remaining gates](team-hub-2b6-isolated-aws-verification-result.md). Earlier readiness entries are superseded for execution.


**ISOLATED AWS BUSINESS VERIFICATION READY FOR EXECUTION REVIEW.** Prepared on 12 October 2026 from checkpoint `7a863158890502015ce66f4ebbe43b4be62cb252`, branch `phase2/team-hub-extraction`. This means the bounded test proposal is reviewable; **real AWS transactions and cursor decryption have NOT been executed or accepted**. Current authorization covers read-only inspection and offline preparation only. No AWS resource, IAM, business-data, authority, frontend or production changes were made.

## Fresh baseline and evidence

The [baseline](team-hub-isolated-verification-evidence-2026-10-12/baseline.json), [protected comparison](team-hub-isolated-verification-evidence-2026-10-12/protected-after.json), [inventory](team-hub-isolated-verification-evidence-2026-10-12/after/inventory.json), [source-fence comparison](team-hub-isolated-verification-evidence-2026-10-12/source-fence-preservation-after.json) and [monitoring inspection](team-hub-isolated-verification-evidence-2026-10-12/observability.json) record fresh read-only AWS results. Identity: `arn:aws:iam::058264289478:user/RavenTest`; account `058264289478`, region `eu-north-1`. Inspection started approximately 16:35 UTC; use individual receipt timestamps for exact observation times.

| Baseline | Fresh result |
| --- | --- |
| LegacyPlatform | 2,621 resources across unchanged root/nested templates; FunctionDirectiveStack 167 |
| Team Hub | 48 product + 7 security; existing API `t54b88casf` preserved |
| Core | 8 product + 5 security; accepted contract references preserved |
| Tournament | 11; template unchanged |
| Authority | Strongly consistent read: `CONTROL#AUTHORITY` / `STATE`, `LEGACY_WRITER`, epoch 1, version 1 |
| Business state | Operational 0; Journal 16 = authority row + 15 historical synthetic audit rows, 0 business records |
| Source recovery | Four source tables empty, source logos empty; PITR, deletion protection and reviewed backups intact |
| Frontend/fence | Dormant proposal remains `reviewed:false`, epoch null; Legacy frontend retained; source-fence policies/gateways unchanged |
| Lambda | Both full configurations equal accepted recovered snapshots, Active/Successful, function-level drift IN_SYNC |

Read RevisionId: `3e19d695-fe50-442f-a666-a47b1d5558f7`; Command: `554a40af-ffff-4b5c-bcbd-8b023ea0bf44`. Both deployed ZIP hashes remain `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`. Neither accepted runtime was rebuilt. Production was not modified; this is preservation of inspected protected resources, not an account-wide production audit. The accepted [recovery result](team-hub-2b6-describekey-recovery-result.md) supplies prior authenticated authority/16-route acceptance; those HTTP checks were not repeated in this task.

## Isolation decision and proof boundaries

The deployed handler authenticates, reads the real authority row, requires TARGET_WRITER and a matching client epoch, obtains a fresh Core decision, then enters business authorization/repository work. The repository repeats authority verification and includes the authority condition in the same DynamoDB transaction as business, audit and idempotency changes. Cursor material is loaded lazily after the authority gate. Table names are intentionally fixed. Changing an environment variable cannot safely redirect this runtime to test state.

Use two independently reviewable lanes:

1. **Real DynamoDB, unchanged business modules:** [transport adapter](../../scripts/team-hub-isolated-verification/isolation.mjs) remaps only the two exact accepted logical table names to two exact synthetic physical tables. It preserves expressions, values, keys, consistency flags and transaction atomicity, rejects unknown resources before sending, and does not retry cancellation. [Prepared runner](../../scripts/team-hub-isolated-verification/transactions.mjs) reuses the existing 41-case sequence and adds authority/roster/membership races. Core/persona adapters and signing material in this lane are explicitly synthetic. This proves real DynamoDB behavior of accepted modules after authorization, not deployed Command-role access or real Core authorization.
2. **Actual Read-role cursor primitive:** one temporary fixed Lambda uses the existing Read role and existing permitted log group. Its [source](../../scripts/team-hub-isolated-verification/cursor-probe.mjs) retrieves only the exact secret, exercises fixed synthetic cursor inputs in memory and returns nine boolean checks. It has no DynamoDB/Core clients, HTTP route, caller-selected secret/data/actor, returned cursor, secret digest, logger or raw provider error. Nonempty input is rejected before AWS access. No live business handler or authority check is bypassed; this tests the cryptographic primitive separately. It does not establish successful pagination through the deployed Read Lambda.

The second lane deliberately reuses a role with existing live **read** and Core permissions. Those permissions are unchanged, but reuse requires explicit review of exact probe bytes and security-owned PassRole custody. Immutable fixed code and no public trigger constrain this test; they are not a claim that the existing role has fewer permissions. Do not substitute the Command role or grant the ordinary product caller new PassRole access. A separate lookalike role would not satisfy the actual-Read-role proof.

## Transaction matrix

All rows below are prepared/offline-tested, **not AWS-accepted**. The runner requires a fresh empty isolated pair, exact account/region/owner/run identity, and strongly consistent scans. The assumed runner session must be `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1/verification`.

| Requirement | Test and required real result |
| --- | --- |
| TARGET_WRITER/matching epoch | Isolated control mode TARGET_WRITER, epoch/version 2; permitted mutation commits |
| LEGACY_WRITER/FROZEN | Each isolated fixture returns 403, no Operational/audit/idempotency additions |
| Missing authority | Delete only isolated fixture; 503 and no partial writes |
| Stale epoch | Client epoch 1 versus isolated 2; 409 before mutation |
| Authority race | Flip only isolated fixture to FROZEN between reads/commit; ConditionCheck cancels complete transaction |
| Strong reads | Authority GetItem retains `ConsistentRead:true`; capture sanitized SDK request metadata |
| Revision checks | Wrong Team/authorization/membership revisions return conflict; canonical state unchanged |
| Revoked membership | Existing sequence denies revoked Player and former Manager |
| Membership commit race | Change isolated actor membership version after authorization/read; transaction cannot commit; no changes beyond deliberate fixture injection |
| Concurrent roster | Two operations at same revision; one success, one conflict, exactly one audit/idempotency pair |
| Concurrent Team change | Existing race requires one success/one conflict and one version advance |
| Replay | Same key/request returns equivalent result without extra domain/audit/idempotency writes; changed payload conflicts |
| Atomic audit/cancellation | Count/reconcile both tables, including audit/idempotency, before and after every rejected operation |
| Cleanup | Delete only exact isolated table rows, strongly scan to zero; separately remove reviewed temporary infrastructure |

The deterministic runner currently asserts 48 scenario results. Its offline emulator test validates wiring and cleanup, not DynamoDB service semantics. Requests must use SDK `maxAttempts:1`; stop on ambiguous transport failures and reconcile rather than replaying mutations blindly. The runtime's own 25-item/4 MB transaction limits remain unchanged.

## Cursor and authorization matrix

The [metadata receipt](team-hub-isolated-verification-evidence-2026-10-12/cursor-metadata.json) confirms the exact Team-owned secret:
`arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV`.
Managed Secrets Manager key: `arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a`, KeyManager AWS. Only DescribeSecret/DescribeKey/GetKeyPolicy were used; the value was not retrieved.

| Cursor proof | Prepared check / acceptance boundary |
| --- | --- |
| Exact access/decryption | Fixed probe GetSecretValue under actual Read role; correlate CloudTrail/KMS and native Lambda receipt; simulation alone does not pass |
| Signing/verification | First page signs, second page verifies; return booleans only |
| Tampering/expiry | Altered token denied; deterministic clock advances beyond 300-second expiry |
| Team/actor/context | Change Team, subject, operation or limit; reject original token |
| Wrong signing material | A different synthetic key cannot verify the real-key token |
| Limits/privacy | Existing contract/schema tests enforce pagination limits; fixed probe uses limit 1; no real identifiers or cursor returned/logged |
| Command isolation | Actual Command role denies GetSecretValue and cursor-key Decrypt; no grant proposed |
| Rotation/recovery | Do not rotate the secret as a test; existing wrong-key regression proves old tokens reject after material changes; fresh first-page request is the recovery path |

Existing authorization/privacy/Core tests pass for global authorization contract handling, Manager membership, Coach assessments, Player self-service, outsider/revoked/cross-Team denial and response projection. The synthetic runner uses Admin, Manager, Coach, Player and outsider fixtures. **Live Admin/SuperAdmin authorization is supplied by accepted Core evidence and must be refreshed through existing accounts before cutover; synthetic fixtures are not a replacement.** Branding and private-note creation remain disabled. No Cognito accounts, tokens or sessions are created or committed. Private-note visibility tests use synthetic data only.

## Installed IAM and proposed temporary resources

[Installed policy/boundary equivalence](team-hub-isolated-verification-evidence-2026-10-12/installed-security-audit.json) passed for Read, Command, product caller and execution role. [Runtime security](team-hub-isolated-verification-evidence-2026-10-12/runtime-security.json): **65 actual-role cases passed**, four identity/boundary Analyzer validations with zero findings, no additional attached managed policies on Read/Command. Permissions were compared against installed state, not an offline substitute.

- Read: bounded Operational/indices reads, authority partition GetItem, exact accepted Core invocation, cursor-secret read and service/context-constrained decryption.
- Command: owned business/audit/idempotency transaction components, authority ConditionCheck/GetItem; direct authority mutation and standalone business writes denied. No cursor-secret grant.
- Foreign table/function, Cognito administration, PassRole, code update, unrelated KMS key/service/account/context and KMS administration controls remain denied. Explicit and implicit denials are distinguished in receipts.
- Simulations do not establish successful decryption, resource-policy/SCP completeness, user authentication or transactional execution. Company SCP visibility remains the previously waived limitation; do not claim organization-wide authorization.

The [candidate](team-hub-isolated-verification-evidence-2026-10-12/candidate.json) pins the [four-resource template](team-hub-isolated-verification-evidence-2026-10-12/isolated.template.json), [runner policy](team-hub-isolated-verification-evidence-2026-10-12/isolated-runner-policy.json), probe ZIP and source closure. This is an offline proposal, not an AWS-generated change set.

| Temporary resource | Exact identity / scope |
| --- | --- |
| Operational table | `ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1-Operational`, PK/SK and both accepted GSIs |
| Journal table | `ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1-Journal`, PK/SK; only synthetic authority/business/audit fixtures |
| Runner role | `ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1`, exact RavenTest trust and session name `verification`, maximum session 3,600 seconds |
| Cursor-probe Lambda | `ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1-CursorProbe`, fixed bundle, existing Read role, no API/trigger/function URL, concurrency 1 |

Expected additions 4, modifications/deletions/replacements 0; permanent resource counts unchanged. Rehearsal tables intentionally have no PITR/deletion protection/TTL: they contain synthetic state only and fixed historical fixture clocks must not expire mid-test. Production-table protection is untouched. Existing Read log group is reused; no log resource policy or log-administration grant is proposed.

The temporary runner needs only GetItem, Query, Scan, PutItem, DeleteItem and ConditionCheckItem on the exact isolated tables/indices. Put/Delete permit synthetic setup/cleanup; this is not a business runtime policy. Deny all other actions, foreign tables and wrong region; allow only within reviewed NotBefore/ExpiresAt parameters. No KMS, secret, Core, Cognito, IAM or live-table permissions. [Proposal security](team-hub-isolated-verification-evidence-2026-10-12/proposal-security.json): 36 positive/negative/time/region controls pass and Analyzer has zero findings. Parameterized policy is evaluated with a sample one-hour window, not an authorization to use that window.

Security-owned provisioning must separately verify its existing effective permissions for exact temporary CloudFormation lifecycle, Create/Delete/DescribeTable and tagging/index configuration, exact role lifecycle, exact Lambda create/read/invoke/delete lifecycle, and exact probe artifact upload/read/removal. PassRole must cover only the existing Read role to Lambda for this reviewed function; normal deployment/runtime policies must remain unchanged. Do not infer these provisioning permissions from the runner policy or add them speculatively. If missing, stop for an exact security review.

## Monitoring and acceptance

Six existing alarms and detailed API metrics remain configured. Preserve D1 namespace `ProjectRespawn/TeamHub`, dimensions Environment/Runtime. Correlate request ID, Lambda platform request, response code, bounded structured event and CloudWatch aggregation interval. Do not publish synthetic success as normal live business acceptance.

| Signal | Expected evidence |
| --- | --- |
| Authority/epoch | WriterNotAuthoritative, AuthorityUnavailable, AuthorityEpochMismatch and matching denial |
| Transaction conflict/throttle | TransactionConflicts / TransactionThrottles; verify failure causes zero partial writes |
| Core failure | CoreDependencyFailures plus DependencyFailures; isolated fault injection only, no live Core disruption |
| Cursor failure | INVALID_INPUT/operation/request correlation for bad cursor; DependencyFailures for loading failure. There is no dedicated CursorFailures counter in the accepted runtime; do not invent one |
| API/Lambda | Native 4xx/5xx/Errors/Duration/Throttles and platform logs; temporary primitive probe is not an API traffic test |
| Privacy | Only bounded codes, IDs and counts; no tokens, secret material, private notes or directory payloads |

Offline emission regressions pass. Real business-path CloudWatch correlation still requires the separately reviewed invocation scope; the local isolated DynamoDB runner cannot prove API-to-Lambda EMF ingestion. For live checks allow up to ten minutes of bounded metric polling using exact dimensions and one-minute periods, recording event and ingestion times. Missing required signals stop that acceptance gate; do not weaken it or change D1 implicitly. Actual provider throttling is not deliberately induced; use isolated adapter injection for classification and document native live throttle signal as unexercised.

## Execution, cleanup and abort plan — NOT AUTHORIZED HERE

Estimate 30–45 minutes plus up to ten minutes ingestion margin. Use a fresh reviewed window no longer than one hour for the new runner role; this is a distinct test proposal, not extension/reuse of the consumed 900-second Lambda recovery permission window.

1. Review candidate hashes, scope and deployment identity. Fresh baseline, zero name collisions, reviewed temporary parameter window, no additional policies, and complete positive/negative lifecycle checks are prerequisites. Do not replay any historical recovery workflow.
2. Separately authorize exact artifact publication and inspect the complete AWS change set: only the four resources above, no permanent updates/replacements. Security operator retains custody; no ordinary caller privilege expansion.
3. Provision, verify installed role/trust/window, exact table identities/tags/schema, probe code hash/role/no triggers and resource count. Run actual installed-runner controls, including both isolated tables, indexes, wrong table, expired window, secret/Core/IAM denial. Refresh actual Read role equivalence.
4. Assume only the isolated runner role. Bind the SDK adapter to eu-north-1/maxAttempts 1; verify actual STS session and owned table metadata before supplying them to the prepared runner. Run the transaction scenarios once; capture counts/digests and sanitized provider request IDs, not row dumps. Complete real service reconciliation before acceptance.
5. Invoke the fixed cursor probe once with `{}` through the security-owned identity. Read role retrieves material only inside Lambda memory. Require all nine booleans plus successful invocation/actual role evidence. Any ambiguous failure stops; do not grant permissions or retry blindly.
6. Preserve sanitized results before cleanup. The transaction runner deletes only rows from the two exact verified isolated tables and scans both to zero. Keep a cleanup ledger even on failure. Never pass a live table or prefix wildcard to cleanup.
7. Remove only the reviewed temporary stack/resources and exact published probe object after terminal invocations. Verify both tables, role and function absent; preserve permitted logs/audit receipts. If cleanup fails, record exact remaining identities and stop. Do not restore unhealthy live Lambda configuration or alter live authority as rollback.
8. Repeat the protected baseline/authority/business/source-fence checks, permanent IAM/code hashes and authenticated authority/16-route denials using existing accounts. Require unchanged live state. Record actual AWS proofs separately from offline regressions.

Stop on baseline drift, hash/identity/schema/window mismatch, missing required IAM/organization evidence beyond the recorded waiver, unexpected change-set resources, arbitrary input/triggers, live-table reference, wrong Core/secret access, partial commit, privacy leak, failed denial, missing telemetry, permission expiry or incomplete cleanup. No automatic policy patch, live authority change or test-resource substitution.

## Validation and remaining dependencies

Preparation passed **516 existing regression tests + 8 isolation-harness tests + 41 resource-accounting tests**. The harness test includes the prepared 48-scenario transaction sequence on an emulator. Team Hub and Core TypeScript checks pass. Website build exits 0 with existing missing-runtime-CSS and chunk-size warnings; this is compilation only, not frontend publication or browser acceptance. The two unrelated SWG working-tree edits remain untouched (the build used the current working tree). Ledger: 2,621 total, 2,430 assigned, 191 unresolved shared, 0 unassigned; no resources retired. All 75 accepted pins and nine archived artifacts verify. Final validation/secret results are recorded in [validation](team-hub-isolated-verification-evidence-2026-10-12/validation.json).

Two simulator request-shape issues were corrected without changing policies: Analyzer uses lower-camel-case request fields, and IAM must not mix `*` with concrete resources or treat wrong-service resource combinations as meaningful controls. The [runtime diagnostic](team-hub-isolated-verification-evidence-2026-10-12/runtime-security-request-shape-diagnostic.json) preserves completed requests from that inspection. Completed same-baseline cases were retained; all 65 required cells ultimately passed. No denied required permission was changed to make a test pass.

Remaining live gates: provisioner lifecycle review, actual installed isolated-role proof, real DynamoDB scenarios/cleanup, actual Read-role decryption, live business-path/Core/persona and telemetry correlation, final frontend journeys and rollback refresh. These are **not** accepted by this report. Gate B installed Legacy fence denial remains reserved for separately authorized FROZEN maintenance; business transactional enforcement proof must precede that freeze. TARGET_WRITER transfer and frontend publication remain distinct later authorizations. No Legacy retirement is proposed.

AWS references supporting this plan: [DynamoDB transaction IAM](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis-iam.html) defines underlying item permissions/ConditionCheckItem and EnclosingOperation; [Secrets Manager encryption](https://docs.aws.amazon.com/secretsmanager/latest/userguide/security-encryption.html) documents service decryption and SecretARN context. These references do not substitute for this account's actual runtime acceptance.

**Next authorization:** review the four-resource isolated test package and security-owned provisioning/cursor-role reuse, then explicitly authorize that bounded test lifecycle. Do not authorize real business cutover as part of it.
