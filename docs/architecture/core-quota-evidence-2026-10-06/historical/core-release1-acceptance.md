# PROJECT RESPAWN CORE — RELEASE 1 RESULT

6 October 2026. **PREFLIGHT BLOCKED; NO DEPLOYMENT ATTEMPTED.** The requested conditional deployment did not pass its pre-write gate. This is not a CloudFormation rollout failure; no stack/change set or artifact was created. Read [migration control](README-PHASE2-MIGRATION.md).

## Blocking finding

Fresh Lambda GetAccountSettings returns account concurrency **10** and unreserved concurrency **10** in account 058264289478, eu-north-1. The exact pinned Core product sets ReservedConcurrentExecutions **5**. AWS requires at least **100** to remain unreserved, so at least **105 unreserved before reservation** is required. [AWS PutFunctionConcurrency requirement](https://docs.aws.amazon.com/lambda/latest/api/API_PutFunctionConcurrency.html). [Quota evidence](core-release1-evidence-2026-10-06/quota-blocker.json).

No quota increase was requested, no permission was broadened, no reservation removed, and no product/security/Lambda candidate regenerated. Those would not be deployment of the exact reviewed input. Next review must either authorize the appropriate regional quota change and wait for its effective value, or separately review a new product candidate and its concurrency/abuse-control implications. Neither path is silently selected here.

## Pinned inputs and authorization

Authorized scope: Core-only security and product deployment **if every gate passed**, followed by live acceptance, stopping before Team integration. Existing operator RavenTest was verified. Product SHA256 `89c712720e1fc09b9546865bd36b12a0123c8560ed8334d282918ac7cedbbaeb`; security SHA256 `6b2afefb79172922e4338128a6b5fdab5e561e4055f8960650798acd4c4e8515`; ZIP SHA256 `4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf`. Full source-manifest and preserved assembly checks passed. No current HEAD substitution or fresh synthesis.

## Logging discrepancy resolution

Principal/policy: proposed Core runtime identity and runtime boundary; neither installed. Service Logs, action logs:PutLogEvents, resource `arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/core/contracts:log-stream:review`, no added condition context. Expected allowed; actual simulator implicitDeny.

The same action/resource returns implicitDeny with **unconditional logs:* / Resource:* Allow**, without the candidate boundary. Classification: **SIMULATOR_UNSUPPORTED** for this representation, not a missing Core grant. Same-family CreateLogStream results are retained alongside it. [Raw controls](core-release1-evidence-2026-10-06/logging-controls.json), [classification](core-release1-evidence-2026-10-06/logging-classification.json).

[AWS Logs authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html) associates PutLogEvents with log-stream ARNs matching the candidate's own-group scope. Fresh Analyzer inclusion/control checks pass 8/8, including controls that remove the required own-log Allow or foreign-log Deny. The accepted [Team logging control evidence](team-hub-2b2-caller-release-evidence-2026-10-05/logging-verification.json), runtime logs and observability evidence demonstrate the equivalent own-group permission family in use, but do not substitute for future Core live logging proof. Candidate IAM was not changed to turn the simulator green.

## Security review and Cognito

Fresh five-policy Analyzer validation: zero findings. Pinned matrix: 27/27 negatives and 11/12 raw positives, with the single logging discrepancy classified above. Core runtime can read only the exact pool through AdminGetUser, AdminListGroupsForUser and ListUsers. All other IAM-authorized Cognito actions fall outside its Deny-NotAction allowlist.

The expanded matrix covers 25 mutation names. Twenty IAM mutation actions explicitly deny against the existing pool. CreateUserPool was initially tested with an inapplicable pool ARN; the corrected Resource:* test explicitly denies, bringing IAM mutation checks to **21 explicit denials**. This correction changes the test only. Four end-user APIs (UpdateUserAttributes, DeleteUser, ChangePassword, SetUserMFAPreference) use user access tokens rather than IAM; their implicit simulator denial is **not** proof of IAM enforcement. Core implements no mutation contract or mutation SDK call and does not log/return delegated tokens. [Cognito controls](core-release1-evidence-2026-10-06/cognito-controls.json), [AWS token authorization example](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ChangePassword.html).

Fresh exact pool ARN/status metadata is retained in [identity evidence](core-release1-evidence-2026-10-06/cognito-identity.json). Pool eu-north-1_n24iLL7QE and its existing public client remain unchanged. If DescribeUserPool omits Status, the evidence explicitly records that omission rather than inventing an ACTIVE status. No user/group/password/pool/client mutation or sign-in was attempted.

## Cursor-secret and privacy review

Pinned resource is AWS::SecretsManager::Secret, GenerateSecretString producing 64 hex characters, no literal SecretString. AWS-managed Secrets Manager encryption, exact-own-secret GetSecretValue runtime permission. CloudFormation Ref injects the ARN only into Lambda configuration; no Outputs expose value or ARN through a public contract. Handler consumes the key in memory, returns only reviewed minimal fields, and emits allowlisted non-personal logs. Value was never created, retrieved, printed or committed in this task.

DeletionPolicy and UpdateReplacePolicy are Retain. Rotation is not automatic; normal code rollback reuses the secret. Any future rotation/replacement requires reviewed cursor invalidation/overlap and retained-resource reconciliation. The lifecycle is acceptable as reviewed; concurrency, not the secret, blocked deployment. Core initialization and real privacy behavior remain untested live.

## PROJECT RESPAWN CORE — SECURITY BOOTSTRAP GATE

Candidate: pinned security SHA above. AWS identity: arn:aws:iam::058264289478:user/RavenTest. Account: 058264289478. Region: eu-north-1.

Resources: five planned, zero created. Additions/modifications/deletions/replacements: no change set generated; zero AWS resource changes. Unexpected: account quota incompatible with pinned product.

Caller: proposed ProjectRespawn-Core-Ntgre-Deploy. Execution: proposed ProjectRespawn-Core-Ntgre-Execution. Runtime/boundary: proposed ProjectRespawn-Core-Ntgre-Contracts / RuntimeBoundary. None installed.

Cognito reads: three exact-pool actions reviewed. Cognito mutations: 21 IAM mutation denials plus explicit token-API scope distinction. Legacy/Team/Tournament/production: no mutation permission proposed. PassRole: exact reviewed role/service pairs; arbitrary roles denied. Logging discrepancy: resolved as simulator limitation, no IAM broadening. Positive/negative/Analyzer results as above.

**CORE SECURITY BOOTSTRAP BLOCKED**

Product execution gate: not reached. No security bootstrap, artifact publication, product change set, execution or rollback occurred. No patch/retry after a deployment failure was attempted.

## Protected baselines

[Fresh baseline](core-release1-evidence-2026-10-06/baseline.json): Legacy UPDATE_COMPLETE, 2,621 declarations / FunctionDirectiveStack 167, all 62 templates and physical IDs match. Team UPDATE_COMPLETE, 40 product +7 security, API t54b88casf. Tournament UPDATE_COMPLETE, 11 resources, API msipnwy39j. Core product/security roots and proposed roles/function/secret absent; retained Core logs/alarms absent.

[Team preservation](core-release1-evidence-2026-10-06/preservation.json): both parity functions match accepted hashes and exact DISABLED/LEGACY_WRITER configuration; all 35 accepted source files match. Frontend unchanged. No business scans or writes; prior source empty-state/recovery evidence is not represented as freshly counted. Production was neither targeted nor modified.

## Final result

Security stack: not created. Product stack: not created. Product resources: 0 live /8 planned. Security resources: 0 live /5 planned.

Runtime initialization, invocation, errors, logs and metrics: NOT TESTED; no Core function exists. Environment static descriptor: validated against existing identity. Authorization/directory: reviewed candidate, not live accepted. Profile: not required. Manifest: no accepted manifest generated or published. Existing planned manifest remains explicitly unusable for live calls.

Core runtime security: proposed policy denies Team/Legacy tables, Tournament/Creator/Commerce/Community, business S3/KMS, IAM and CloudFormation; no installed actual-role proof yet. No claim of live runtime acceptance.

AWS changes: **0**. Business data writes: **0**. Frontend cutover: **false**. Legacy deployment/retirement: **none**. Team integration: **not deployed**. Production touched: **no**. Ledger ownership rows changed: **0**; status records this preflight block. No MIGRATED/CUTOVER_COMPLETE/RETIREMENT_REVIEW/RETIRED marking.

Immediate next gate: **CORE QUOTA / PINNED CANDIDATE REVIEW**. The requested subsequent gate **TEAM HUB 2B5A-2 — CORE INTEGRATION** remains blocked until Core Release 1 is accepted.

CORE RELEASE 1 FAILED
