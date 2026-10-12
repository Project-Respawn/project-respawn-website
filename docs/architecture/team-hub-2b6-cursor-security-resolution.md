# Team Hub 2B6 — cursor security resolution

**Business dark deployment (8 October 2026): BLOCKED — LIVE ACCEPTANCE FAILED.** Security/product are UPDATE_COMPLETE, Team Hub 48+7, but both Lambda environments lack the new business/Core variables; authenticated authority returned 503. LEGACY_WRITER epoch/version 1, empty business state and Legacy frontend remain. No automatic repair/rollback or cutover. [Result and stop-state evidence](team-hub-2b6-business-runtime-dark-deployment-result.md). Earlier entries below are historical.


8 October 2026. **CURSOR SECURITY READY FOR DEPLOYMENT REVIEW**, subject to the evidence receipts below. This is a prepared policy exception, not installed permission or live decryption acceptance. No AWS writes, secret retrieval, business-runtime deployment, authority transition, frontend switch, fence or retirement occurred.

## Dependency and ownership

The preserved business [entry](../../domains/team-hub/business-runtime/entry.mjs) loads signing material only for Read pagination after authentication, actual TARGET authority and epoch checks. It calls GetSecretValue with the environment ARN supplied by the product's `Ref: CursorSecret`. It does not log/return the secret or fetch it at cold start. Command never invokes the loader. The HMAC implementation and five-minute, actor/operation/team/query-bound cursor contract are unchanged.

The exact future secret name is `ProjectRespawn-TeamHub-Ntgre-Cursor`, owned by Team Hub/Ntgre, not Core. Fresh DescribeSecret returned ResourceNotFoundException. **There is no allocated full secret ARN yet.** The permitted ARN shape is `arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-??????`; six question marks cover only AWS's generated suffix. The runtime additionally checks the exact name/account/region and six alphanumeric characters. A future deployment must record the actual ARN from CloudFormation and verify metadata, not fabricate it or reuse an unrelated secret.

The existing key is:

`arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a`

Fresh DescribeKey identifies alias `aws/secretsmanager` as **AWS-managed**, symmetric ENCRYPT_DECRYPT, enabled, single Region, account 058264289478. This is not a customer-managed key. The product omits KmsKeyId, selecting this default Secrets Manager key. Its actual AWS-managed key policy was read; it grants service-mediated operations for this account. No key policy change is proposed. See [preflight and installed IAM](team-hub-cursor-security-evidence-2026-10-08/preflight.json).

| Principal | Required operations | Purpose |
|---|---|---|
| `ProjectRespawn-TeamHub-Ntgre-ParityRead` | GetSecretValue on only the Team cursor secret; Decrypt on only the exact key through Secrets Manager | Load current HMAC material into memory for pagination |
| `ProjectRespawn-TeamHub-Ntgre-ParityCommand` | None for cursor secrets/KMS | Unchanged Command policy and boundary |
| `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution` | Existing exact secret Create/Describe/Tag/Get lifecycle and GetRandomPassword; new exact-key GenerateDataKey and Decrypt | CloudFormation creates generated signing material and reads its resource; not a runtime grant |
| Core/other domains | No new grant | Core's installed role was negatively simulated for this secret/key; protected domain templates unchanged |

Secrets Manager supplies `SecretARN` and `SecretVersionId` encryption-context pairs. `kms:EncryptionContext:SecretARN` is supported for symmetric cryptographic operations, including Decrypt/GenerateDataKey; it is single-valued, so the proposal uses ordinary StringLike, not a set operator. The suffix-only wildcard is necessary before creation. The grant also requires `kms:ViaService=secretsmanager.eu-north-1.amazonaws.com`, `kms:CallerAccount=058264289478` and `aws:RequestedRegion=eu-north-1`. SecretVersionId is deliberately not fixed: creation validation and future version rotation use different values. [Secrets Manager encryption context and caller permissions](https://docs.aws.amazon.com/secretsmanager/latest/userguide/security-encryption.html), [KMS condition support](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html#conditions-kms-encryption-context).

## Alternatives and recommendation

| Design | Security and operations | Cost | Rotation, recovery and rollback |
|---|---|---|---|
| **A — exact AWS-managed key exception, recommended** | Same secret/handler architecture; exact immutable key ARN plus service/account/secret context. No key administration, new key policy, service or cross-domain dependency. | No additional monthly KMS key fee; secret storage/API and applicable KMS request charges remain. | AWS manages key-material rotation. Secret material rotates separately; Retain preserves it across code rollback. |
| B — Team-owned symmetric customer-managed key | Exact key policy can name Read and security deployment principals, with the same service/context limits. More key administration, recovery ownership, deletion controls and policy review; no functional requirement currently needs these. | Adds a customer-managed key's $1/month base charge and applicable requests/rotation charges to the secret costs. | More control over key rotation; disabled/deleted key can strand secret versions. Retain and separately controlled key deletion essential. |
| C — Team-owned KMS HMAC key, GenerateMac/VerifyMac | Key never leaves KMS; no Secrets Manager secret needed. No Core dependency. Requires runtime/SDK changes, per-cursor KMS calls, new key ownership and revised recovery proofs. **HMAC operations do not support encryption context**; isolation instead uses exact key/action/principal. | Customer-managed key storage and MAC request charges; replaces secret storage but adds request latency/dependency. | HMAC key rotation requires an explicit version/key strategy; more application/recovery work than unchanged local HMAC signing. |

Choose A. B and C are valid future designs, but add ownership and implementation changes without resolving an unmet current requirement. Never substitute a source-code/env-file signing key, per-instance random key, unsigned cursor or shared Core secret. [AWS KMS pricing](https://aws.amazon.com/kms/pricing/), [AWS-managed key classification/cost](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html), [HMAC context limitation](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html#conditions-kms-encryption-context).

## Exact effective IAM changes

See [statement delta](team-hub-cursor-security-evidence-2026-10-08/permission-delta.json), [product](team-hub-cursor-security-evidence-2026-10-08/product.template.json), [security](team-hub-cursor-security-evidence-2026-10-08/security.template.json), [policy generator](../../scripts/team-hub-cursor-security/policy.mjs).

Read's existing alias-based non-Lambda Decrypt deny is changed only to exempt the exact inspected Secrets Manager key ARN. The existing Lambda service-key allow/denials remain; other business/customer-managed/unknown/unrelated AWS-managed keys remain explicitly denied. The new exact-key allow is conditioned on service, account, Region and SecretARN. Separate explicit denials on that key reject missing/wrong service, account, Region or secret context. KMS administration, GenerateDataKey and other operations remain excluded by Read's existing NotAction deny. An explicit foreign-secret GetSecretValue deny is added. Identity and boundary match.

Command is byte-identical to the blocked candidate. It receives neither secret access nor a KMS exception. Core's manifest/code/policies and all other domains remain unchanged. IAM simulation does not assert that account administrators lack their separately owned security privileges; runtime-domain isolation and service-only CloudFormation custody are the scope.

CloudFormation's execution identity and boundary gain only exact-key Decrypt/GenerateDataKey with the same positive conditions. Explicit denials reject other KMS keys, other operations on this key, foreign secret values, wrong service and wrong secret context. Account is also enforced by the inspected AWS-managed key policy; key ARN/service fix the Region. This does not introduce KMS administration, broad Decrypt, Encrypt, ReEncrypt or CreateGrant.

For quota fit, one duplicated API NotResource deny is removed from the **execution boundary only**. The identical explicit deny stays in the execution identity, and the boundary has no Allow for foreign APIs. Effective API access is unchanged; own/foreign API controls are tested. Execution boundary remains 5,976/6,144 compact characters; execution inline policy 9,873/10,240; Read boundary 4,778/6,144. No trust, PassRole, Core, DynamoDB, log-policy or business permissions change relative to the blocked candidate. Caller policy replaces only the blocked product template URL/object with the revised pin; accepted endpoint rollback references remain.

This narrowly scoped exception is explicitly authorized for investigation/preparation by the current request; it does not relax customer-managed business-key protection. An additional hypothetical `Allow kms:*` appears only in a noninstalled negative-control simulation, never in the candidate.

## Candidate and preservation

Original blocked manifest `2f523b4f8f0e7429968b72dddf88c1f1fcfb4a74d34677fc3f52928881f52b59` and all its artifact/source hashes remain exact. New [candidate](team-hub-cursor-security-evidence-2026-10-08/candidate.json) and [artifact manifest](team-hub-cursor-security-evidence-2026-10-08/artifact-manifest.json) identify the revised pin.

| Artifact | SHA-256 |
|---|---|
| Runtime — unchanged | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Revised product | `a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad` |
| Revised security | `ff226268cf9221d6f3b42bcd06dbc1525d12cbe841bacd79ced0ac60bb016067` |

Against the blocked candidate: only Read inline policy in product; Read boundary, execution identity/boundary and caller artifact policy in security. Zero resource additions/deletions/replacements. Proposed count remains 48 product +7 security; installed remains 42+7. This is a deterministic policy-only derivation from the pinned templates, not a runtime rebuild. All functions, routes, API `t54b88casf`, Cognito, tables, transactions, authority endpoint, privacy, Core and D1 monitoring remain identical. Full deployment delta from installed state remains the prior six additions/five product modifications/five security modifications; inspect actual AWS change sets later.

Fresh [preservation](team-hub-cursor-security-evidence-2026-10-08/preservation.json) compares five protected domain templates, all 62 inventoried Legacy templates (2,621 resources; directive 167), installed Team runtime code/environment and role identities. Core remains 8+5; Tournament 11. Strong authority read remains LEGACY_WRITER epoch/version 1. No claim is made that simulated TARGET fixtures changed live authority or that this task refreshed every business-data count; execution preflight must do that.

## Tests and evidence limits

[IAM/Analyzer results](team-hub-cursor-security-evidence-2026-10-08/security-review.json): 81 decisions, eight policy validations, no Analyzer findings. Controls include exact path, wrong/missing service/context, direct calls, wrong secret/name/suffix, other account/Region, customer-managed/unknown/unrelated managed keys, KMS administration, Command/Core installed denials, existing Lambda decryption and effective API isolation. Hypothetical excess identity allows still fail protected negative controls.

[Validation](team-hub-cursor-security-evidence-2026-10-08/validation.json) covers 16 cursor/pin tests, 21 business/epoch/compiled tests, 22 Core tests, 75 accounting/isolation tests, 273 Team/privacy tests and 16 monitoring tests: 423 passing tests, plus TypeScript and ledger reconciliation. [Build](team-hub-cursor-security-evidence-2026-10-08/build-result.json) and [secret scan](team-hub-cursor-security-evidence-2026-10-08/secret-scan.json) are separate receipts. Only random in-memory synthetic signing material is used in cursor tests; no real token/key/value is logged or persisted. The original local DynamoDB transaction receipt remains applicable to byte-identical runtime/source; no new isolated AWS transaction or decryption proof is claimed.

**Simulation is not live decryption proof.** It does not execute Secrets Manager, demonstrate CloudFormation's actual cryptographic request, model every organizational control or replace installed-role/CloudTrail evidence. The existing key policy and supported condition keys make the design reviewable; success must still be demonstrated after separate authorization.

## Rotation, recovery and remaining execution gates

AWS-managed key-material rotation is automatic and transparent to stored versions; it is different from rotating the HMAC secret. [AWS rotation documentation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html).

The runtime reads AWSCURRENT afresh for each paginated request. A separately security-owned secret rotation changes signing material and invalidates old cursors; clients restart pagination. Cursors expire after five minutes. No previous-key fallback is introduced. Rotation needs its own narrowly reviewed write custody; Read/Command and the normal deployment role receive no UpdateSecret/PutSecretValue rotation grant here. Never expose material in configuration, outputs, logs, source or evidence.

Retain the secret through stack/code rollback and preserve its ARN/version metadata securely. Do not export plaintext for backup. Existing secret versions and the AWS-managed key support recovery; do not restore a compromised version merely to preserve old cursors. If a retained secret exists on retry, stop for reviewed adoption/import rather than create/delete/recreate. AWS-managed key policy/material is not application-owned or deletable through this role.

Before execution: independently authorize the exact new product/security pin, refresh account/key classification/alias mapping, installed policies, secret noncollision, authority/source recovery/empty target and protected baselines. Inspect separate change sets with rollback enabled. Reject unexpected additions, replacement, IAM grants or secret/key changes. Install reviewed security first, then product; keep LEGACY_WRITER and frontend unchanged.

After authorized creation, require CFN success plus actual secret metadata, key selection and CloudTrail correlation of the execution role's GenerateDataKey/Decrypt path. Record only ARN/version/request metadata, never material. For Read-role decryption, the real dark handler correctly stops before loading the secret: do not change authority or add a production bypass just to reach it. Separately review a short-lived fixed service-only probe using the existing Read role/SDK and exact SecretId, returning only an in-memory HMAC sign/verify boolean; no role trust broadening, business IO, secret/signature output or permanent resource. Remove exact probe resources afterward. This live permission proof is separate from the already required isolated AWS business transaction/persona/pagination acceptance before maintenance.

Pre-target-write rollback restores the accepted authority-endpoint product before restoring its security, preserving the exact existing Read/Command archives. The cursor secret remains retained; code rollback does not change the Journal row. After any target writes, the state-authority rollback rules still apply; never reopen Legacy via code rollback alone.

Current domain: Team Hub. Phase: 2B6 cursor security preparation. AWS changes: zero. Legacy/production/ownership-ledger changes: zero. Next gate: separate business-runtime security/product deployment review and live verification, not FROZEN or TARGET_WRITER.
