# Team Hub 2B6 — business runtime readiness

**Configuration repair execution (9 October 2026): BLOCKED AT PRODUCT CHANGE SET.** Reviewed security is installed and verified, UPDATE_COMPLETE. AWS returned zero product changes instead of the required two Environment updates; product was not executed. Both functions still lack the documented variables. LEGACY_WRITER epoch/version 1, 48+7 resources and empty business state preserved. No direct patch, retry, frontend/fence/production change. [Execution result and exact stop evidence](team-hub-2b6-configuration-repair-result.md). Earlier entries below are historical.


**Execution KMS correction (9 October 2026): READY FOR DEPLOYMENT REVIEW — NOT INSTALLED.** Deny-only exception prepared for the exact AWS-managed Lambda key; no KMS Allow added. Secrets Manager restrictions and runtime IAM preserved. Three security modifications plus the unchanged two-environment product repair are pinned for separate security-first/product-second gates. Live configuration repair remains outstanding. LEGACY_WRITER epoch/version 1; no AWS writes or cutover. [Security review, exact pins and execution plan](team-hub-2b6-execution-kms-correction-review.md). Earlier entries below are historical.


**Configuration repair (9 October 2026): BLOCKED — separate execution-security review required.** The unchanged compiled ZIP passes offline with the full environment map. Read lacks four additions; Command lacks three. Actual execution-role KMS denies against alias/aws/lambda are confirmed; IAM is unchanged. A two-function environment-only draft is pinned, not deployed, and also requires exact artifact-reference review. LEGACY_WRITER epoch/version 1, empty business state and 48+7 remain. [Diagnosis, draft, validation and recovery plan](team-hub-2b6-business-runtime-configuration-repair.md). Earlier entries below are historical.


**Business dark deployment (8 October 2026): BLOCKED — LIVE ACCEPTANCE FAILED.** Security/product are UPDATE_COMPLETE, Team Hub 48+7, but both Lambda environments lack the new business/Core variables; authenticated authority returned 503. LEGACY_WRITER epoch/version 1, empty business state and Legacy frontend remain. No automatic repair/rollback or cutover. [Result and stop-state evidence](team-hub-2b6-business-runtime-dark-deployment-result.md). Earlier entries below are historical.


**Cursor security (8 October 2026): READY FOR DEPLOYMENT REVIEW — NOT DEPLOYED.** Exact AWS-managed key/service/secret-context exception prepared; Read only, Command unchanged, runtime ZIP unchanged. Original blocked pin preserved. Live decryption remains a separately authorized proof. LEGACY_WRITER epoch/version 1 and installed 42+7 remain. [Resolution and revised pin](team-hub-2b6-cursor-security-resolution.md).

8 October 2026. Ntgre account `058264289478`, region `eu-north-1`. Preparation only, from branch `phase2/team-hub-extraction`, checkpoint `5c772296a791b8487a364f07682e17a5acbf7243`. No deployment, artifact upload, change set, IAM change, authority write, frontend activation or Legacy retirement is authorized or performed.

**Historical blocked candidate — superseded by the cursor-security policy revision linked above.**

The sections below preserve the original blocked candidate assessment and hashes. The cursor-security report supersedes that blocker with a separately pinned conditional exception. Do not deploy the original blocked pin. The accepted authority endpoint and dark runtime remain installed; live business/decryption acceptance still requires separate execution authorization.

## Fresh deployed baseline

[Inventory](team-hub-business-runtime-evidence-2026-10-08/after/inventory.json), [preservation](team-hub-business-runtime-evidence-2026-10-08/after/preservation.json), [authority](team-hub-business-runtime-evidence-2026-10-08/authority-after.json), [installed runtime IAM](team-hub-business-runtime-evidence-2026-10-08/after/installed-iam.json) and [monitoring](team-hub-business-runtime-evidence-2026-10-08/security-monitoring-refresh.json) are fresh read-only observations, not the older offline business proposal.

| Domain/state | Observed |
|---|---|
| Identity | `arn:aws:iam::058264289478:user/RavenTest` |
| Legacy | 2,621 resources; FunctionDirectiveStack 167; every inventoried template matches |
| Team Hub | 42 product + 7 security; API `t54b88casf`; UPDATE_COMPLETE |
| Core | 8 product + 5 security; accepted templates/runtime preserved |
| Tournament | 11 resources; accepted template/API preserved |
| Authority | `CONTROL#AUTHORITY` / `STATE`, `team-hub-authority.v1`, LEGACY_WRITER, epoch 1, version 1 |
| Target | Operational empty; Journal 15 retained audit rows plus one authority row; no business rows |
| Legacy recovery | Four source tables empty in repeated strong scans; PITR ENABLED, deletion protection true, backups AVAILABLE; logos empty |
| Production | No changes or deployment; no claim of a new full production inventory |

C1 temporary executors remain absent. Current C2 runtime identities/boundaries match the installed policies, including authority-only GetItem, existing Core invocation and logging. Source policies/gateways are checked in [fence preservation](team-hub-business-runtime-evidence-2026-10-08/source-fence-preservation.json). Normal frontend remains Legacy. No authenticated live route acceptance is newly claimed for the uninstalled candidate.

## Runtime and transactional security

New source lives in [business-runtime](../../domains/team-hub/business-runtime/entry.mjs). Historical cutover/D1/authority source pins are preserved. The entry uses the accepted live Core manifest, existing Read/Command roles/functions and exact Operational/Journal names. No synthetic adapter, test route, direct Cognito administration, alternate API or business database enters the compiled closure.

The nine accepted mutations and four reads remain. List-my-teams and the two bounded directory adapters are exposed through the existing Read integration. Manager, Coach, Player and global Admin rules stay separate. Branding and nonempty Coach-private note creation remain denied. No state schema/codec or reverse-transform change is introduced.

Authentication precedes a strongly consistent authority read and required client epoch. TARGET-only business paths then obtain fresh Core decisions and Team-owned authorization. Each new mutation transaction begins with a ConditionCheck on the actual Journal authority key: mode TARGET_WRITER, matching authority epoch and version. Business changes, current membership/version checks, entity revisions, audit creation and conditional idempotency creation share the same transaction. Journal authority mutation is never granted. Idempotency replay performs fresh authorization and state checks and does not create another business/audit write.

LEGACY_WRITER/FROZEN deny before Core, pagination-secret access or business IO. Missing/malformed authority, stale/missing epochs, dependency failures and revoked membership fail closed. A final authority read prevents a stale success response after a concurrent transition; an ambiguous committed transaction is not automatically retried. The read-only frontend authority endpoint remains a projection of the actual row, never the mutation security boundary.

The global Core decision is a fresh bounded contract decision; it is not falsely described as a distributed atomic transaction with Cognito. Team membership/entity and Journal authority conditions are enforced inside DynamoDB.

## Exact IAM delta and blocking dependency

See [statement-level delta](team-hub-business-runtime-evidence-2026-10-08/permission-delta.json), [Read policy](team-hub-business-runtime-evidence-2026-10-08/read-policy.json), [Command policy](team-hub-business-runtime-evidence-2026-10-08/command-policy.json) and [AWS security evaluation](team-hub-business-runtime-evidence-2026-10-08/security-review.json).

- Both runtimes: exact Operational GetItem/Query, limited to `TEAM#team:*` and `SLUG#*`; existing authority-partition GetItem, Core and logging statements preserved.
- Read only: Query on exact BySubject/ByTeamStatus indexes with bounded leading-key shapes; GetSecretValue on the exact named Team cursor secret with only its AWS-generated six-character suffix wildcard.
- Command only: idempotency GetItem; Operational PutItem/DeleteItem and Journal audit/idempotency PutItem only when enclosed in TransactWriteItems; ConditionCheckItem on own Team/slug items and exact authority partition. No Scan, UpdateItem, Journal Query, authority Put/Delete, direct nontransactional mutation or foreign-domain data grant.
- Existing business-KMS and Cognito administration denials remain unchanged. Command has no secret access. The preserved C2 authority grant still requires SK=STATE in reviewed code; IAM LeadingKeys constrains the partition, not the sort key.
- Deployment draft: existing three CreateRole grants removed because roles cannot be replaced; exact candidate and accepted rollback artifact references retained; obsolete template URLs removed. Secret create/read lifecycle scoped to the single proposed cursor secret; GetRandomPassword necessarily uses `*`. Replication, secret update/delete, broad IAM/log-policy administration and foreign APIs are not added. The provider's public permission schema is recorded without reading a secret value.

**Blocking conflict:** the existing explicit `kms:Decrypt` deny permits only `alias/aws/lambda`. The future cursor secret uses `aws/secretsmanager`. The draft intentionally retains that deny. A GetSecretValue allow is therefore not sufficient evidence of usable cursor material. AWS explains that Secrets Manager makes KMS requests on the caller's behalf, including for the AWS-managed key: [encryption and key permissions](https://docs.aws.amazon.com/secretsmanager/latest/userguide/security-encryption.html#security-encryption-permissions). IAM simulations include the Secrets Manager alias/service/encryption-context case. No secret was retrieved, KMS permission broadened, fallback signing key embedded, or cursor validation weakened.

The secret is loaded lazily only for the two paginated champion-pool reads after authority/authentication checks; Command and dark Legacy denial do not need it. This fixes the old eager startup dependency but does not make TARGET pagination deployable. Resolve with a separately reviewed, exact cursor-signing custody/decryption design; do not approve a general KMS grant or reuse Cognito credentials. The current user instruction to preserve business-KMS denials prevents silently selecting a KMS exception here. CloudFormation secret creation/read custody also needs end-to-end confirmation under its boundary before execution.

## Candidate and resource accounting

[Candidate manifest](team-hub-business-runtime-evidence-2026-10-08/candidate.json) and [immutable artifact manifest](team-hub-business-runtime-evidence-2026-10-08/artifact-manifest.json) identify exact bytes and rollback inputs. This pin is **blocked, not executable**. Runtime ZIPs/assembly remain in ignored local storage; no upload occurred.

| Artifact | SHA-256 |
|---|---|
| Runtime ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Product | `eb1952c63f619d04a06dc6843ad1ba10e685cdeec6d7690a8ab3086ae50c3b8c` |
| Security | `a4c9c99a516a110a92355708c9e8b74e07cf08cf67aaaf1f3f55c736421c5153` |

Independent CDK synthesis starts from the exact accepted 42-resource endpoint template. Proposed product becomes 48: six additions (CursorSecret, ListMyTeamsRoute, DirectorySearchRoute, DirectoryResolveRoute, two directory Lambda invoke permissions), five semantic modifications (HttpApi CORS, two runtime functions, two inline runtime policies), zero deletions and zero expected replacements. Security remains seven resources with five policy/role modifications. Authority route/invoke permission, JWT authorizer, tables/protections, integrations and all D1 alarms are semantically identical. Existing CORS origin is preserved; only required methods/headers are added. No new API, Lambda, pool or business table.

These are offline classifications. No AWS-generated change set exists for this draft; dynamic/conditional replacement classification must be inspected at a separately authorized execution gate. Stop on any table/API/Cognito replacement, deletion, unexpected logical ID or foreign-domain change.

## Monitoring and validation

D1 EMF namespace/dimensions/counters and alarms are preserved. A bounded TransactionThrottles counter is added without altering business status semantics; native DynamoDB/Lambda metrics remain required. Authority/epoch, authorization, Core dependency and transaction-conflict signals remain distinct. Logs exclude tokens, private notes, subjects and directory results. Request identifiers and approved operation/error labels are the permitted correlation data. Six installed alarms and detailed API metrics were refreshed; no new access-log permission or notification delivery claim is introduced.

[Regression/TypeScript/ledger results](team-hub-business-runtime-evidence-2026-10-08/validation.json), [candidate/compiled tests](team-hub-business-runtime-evidence-2026-10-08/business-validation.json), [local transactions](team-hub-business-runtime-evidence-2026-10-08/local-transactions.json), [build](team-hub-business-runtime-evidence-2026-10-08/build-result.json), [secret scan](team-hub-business-runtime-evidence-2026-10-08/secret-scan.json) and [security review](team-hub-business-runtime-evidence-2026-10-08/security-review.json) are the receipts. Do not infer a passed test from this prose when a receipt is incomplete.

The local transaction suite uses the official DynamoDB Local image pinned by digest, fixed loopback endpoint and dummy credentials. It exercises 41 mutation/privacy/concurrency assertions plus denial, missing/stale epoch, in-flight freeze/epoch cancellation and idempotency/revocation controls. Local tables and the exact task container were removed. This is real local DynamoDB-engine behavior, **not AWS IAM enforcement or isolated AWS service acceptance**. The separately authorized R2 isolated AWS rehearsal remains required. The exact compiled ZIP is also tested through loopback-only SDK endpoints for actual authority projection and Legacy denial without Core/secret calls.

## Deployment, rollback and remaining live gates

1. **Resolve the cursor security decision; no deployment while blocked.** Review any revised exact pin, every IAM delta, CloudFormation secret custody and effective permissions. Preserve accepted rollback grants and baseline hashes.
2. Separately authorize security and product preparation/execution while actual LEGACY_WRITER epoch/version 1 remains. Inspect the complete AWS change sets; rollback enabled; no replacements/deletions. Security first, product second. No authority write or frontend/fence activation belongs to this gate.
3. Verify installed code/templates/boundaries; authority endpoint still 1/1; all 13 existing business routes plus new list/directory routes deny normally; target business rows remain zero; correlate D1/new counters. Run separately authorized exact-candidate isolated AWS transactions, role/privacy/Core/pagination proofs and affected rollback-equivalence checks. Local fixtures are not live Core or AWS proof.
4. Only after all safe business-runtime proof passes may final maintenance review proceed. Gate B source fence installation and real generated/direct/manual/privileged denial remain a distinct FROZEN authorization. TARGET transfer and frontend publication require their own later approvals. No frontend status response substitutes for a transactional server check.

Before any target business write, code rollback restores the accepted endpoint product first, then accepted security. Preserve existing Read endpoint ZIP `cd58cc3553867f268af79bc9c710fe35e1bab07882d39b423e05b39626a7eedd` and Command D1 ZIP `a36406c42c727b4d8c262083e0cb95807f2404c4c8649b2eacc559915f4ba7d5`. The proposed cursor secret uses Retain; rollback may leave that secret retained, requiring a later exact cleanup decision, never an automatic secret/data deletion. No Journal row is changed by code rollback.

After any actual target write, code rollback alone cannot restore authority: separately fence/freeze, preserve state, export/reverse-transform/restore/reconcile and authorize recovery. Never lower epochs or reopen Legacy while target writes remain possible. Stop on unexpected drift, nonempty business state, secret/KMS failure, IAM mismatch, incomplete transaction proofs, altered privacy behavior or ambiguous mutation outcome.

Current domain: Team Hub. Phase: M5 / 2B6 business-runtime preparation blocked. AWS, Legacy and production changes: zero. Ownership ledger changes: zero. Next gate: cursor-security resolution and revised deployment review; not FROZEN maintenance.
