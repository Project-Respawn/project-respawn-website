# Team Hub 2B6 — execution KMS correction review

**Configuration repair execution (9 October 2026): BLOCKED AT PRODUCT CHANGE SET.** Reviewed security is installed and verified, UPDATE_COMPLETE. AWS returned zero product changes instead of the required two Environment updates; product was not executed. Both functions still lack the documented variables. LEGACY_WRITER epoch/version 1, 48+7 resources and empty business state preserved. No direct patch, retry, frontend/fence/production change. [Execution result and exact stop evidence](team-hub-2b6-configuration-repair-result.md). Earlier entries below are historical.


9 October 2026. **Prepared for separate deployment review; not installed.** Scope: execution-role deny correction and exact repair-product binding only. No AWS writes, change sets, cryptographic operations, secret-value retrieval, business-authority change or deployment. Read first: [migration control](README-PHASE2-MIGRATION.md), [configuration diagnosis](team-hub-2b6-business-runtime-configuration-repair.md).

## Verified failure and effective baseline

Read-only identity: `arn:aws:iam::058264289478:user/RavenTest`; account 058264289478; region eu-north-1. [Fresh installed policies](team-hub-execution-kms-evidence-2026-10-09/security.json) match the previous deployed pin exactly: execution identity, ExecutionBoundary, caller, Read and Command. Attached managed policies were also checked: no execution attachments; caller uses its reviewed Preparation policy as identity and boundary. Execution trust remains CloudFormation-service-only; caller trust remains RavenTest-only. [Attachment checks](team-hub-execution-kms-evidence-2026-10-09/validation.json).

- Denied principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution/AWSCloudFormation`; issuer `arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution`.
- Denied action: `kms:Decrypt`.
- Exact denied key: `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`, enabled AWS-managed `alias/aws/lambda`.
- Both blocking statements: `Effect: Deny`, `Action: kms:*`, `NotResource: arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a`. One is in ExecutionRole/ReadProofLifecycle; the other in ExecutionBoundary (installed v10).
- Evidence: 21 Decrypt denials in the preserved provider window; for example event `25c74d1a-cf05-47f0-b670-bd40b392ba45`, 2026-10-08T22:25:16Z. Its error explicitly identifies the CloudFormation session, action, key and identity deny. [Original provider audit](team-hub-config-repair-evidence-2026-10-09/provider-audit.json), [verified key policies and denial subset](team-hub-execution-kms-evidence-2026-10-09/key-policies.json).

Execution path: approved caller → CloudFormation with ReadProofExecution → Team Lambda configuration/code lifecycle → Lambda-managed encryption. CloudTrail also records GetFunctionCodeSigningConfig access denials during the completed provider lifecycle. Those are retained as historical diagnostics; no permission is added for them. If one becomes a mandatory stabilization failure, stop for review rather than broadening this candidate. The missing environment map causes the runtime 503; the exact provider behavior that reported UPDATE_COMPLETE despite the mismatch remains unproven. CloudTrail omits environment values and the failed Decrypt events omit usable request context, so no new condition is invented from absent fields.

## Managed-key evidence and permission decision

The freshly fetched Lambda key policy is semantically identical to the policy in the [accepted Tournament correction](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md). Its relevant AWS-managed grants allow same-account use through Lambda, and same-account Decrypt with a Lambda FunctionArn encryption context; separate service-principal statements cover Lambda's service operations. These conditions and the key policy are untouched.

Tournament recorded successful Decrypt on this exact key at 2026-10-04T15:21:45Z after narrowing its explicit deny, with no added KMS Allow. [Historical successful event](phase2a-tournament-runtime-kms-evidence-2026-10-04/runtime-kms-live-events.json). That is supporting precedent, not live proof for this execution role. AWS documents that default Lambda encryption does not require adding KMS permissions and that explicit denial can prevent environment access. [AWS Lambda encryption documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

**No new positive KMS permission is indicated or added.** The proposed identity/boundary-only simulation returns implicitDeny on the Lambda key after the explicit blocker is removed; this is not represented as full effective access or failure. IAM does not support resource-policy simulation for roles, so the AWS-managed grant is reviewed separately. [IAM simulation limitation](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html). Diagnostic simulations with hypothetical Allows isolate deny behavior; those Allows never enter any deployable artifact. Standalone key-condition models are explicitly labeled and are not effective-role simulations.

The Lambda key is shared by the AWS service in this account. This correction does not add access to another function, its environment, ciphertext, API or data. It also does not claim that the managed key itself is Team-exclusive. The unchanged exact Lambda resource permissions, service-only execution trust, caller restrictions and lack of cross-domain ciphertext/resource access remain necessary controls. The key-policy context branch is not falsely described as universally ViaService-only.

## Exact IAM semantic diff

In **both** execution identity and boundary:

1. Extend the existing `Deny kms:* NotResource` exception from the exact Secrets Manager key to the pair `[Secrets Manager key, verified Lambda key]`.
2. Add `Deny NotAction: kms:Decrypt Resource: <exact Lambda key>`.
3. Retain the existing Secrets Manager exact-key Allow for Decrypt/GenerateDataKey, its conditions and its other-operation deny unchanged.

Result: only Decrypt on the exact Lambda key loses the explicit blocker. All other operations on that key remain explicitly denied; all operations on any other key remain explicitly denied, except the already reviewed Secrets Manager operations. Customer-managed business keys, unknown keys, foreign-account/region keys and unrelated AWS-managed keys receive no exception. KMS administration, including global CreateKey on `*`, remains denied.

Secrets Manager key: `arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a`. Preserve account 058264289478, eu-north-1, `kms:ViaService=secretsmanager.eu-north-1.amazonaws.com`, and `kms:EncryptionContext:SecretARN=arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-??????`. Execution identity still explicitly denies wrong service or secret context. No cursor value is read. Read/Command policies, boundaries and code remain byte-identical to their existing artifacts; Cognito and Core permissions do not change.

To fit the 6,144-character managed-policy limit, ExecutionBoundary drops only the nonsemantic Sid `ExactCursorServiceKey` and combines the two existing unconditional Resource `*` Allows for DescribeLogGroups and GetRandomPassword into one action array. Tests compare expanded Allow semantics exactly. **No scope, action or condition is removed from an Allow.** Boundary length: **6,120**; execution inline policy: **10,088 / 10,240**. The limited headroom is an execution-review invariant, not justification for broader compression or wildcarding.

## Exact artifact binding and immutable candidate

Only PreparationCaller's three occurrences of the previous business-product object are replaced: CreateChangeSet TemplateUrl, S3 read Resource and S3 deny NotResource. New object:

`team-hub/config-repair/38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f.template.json`

Bucket: `cdk-hnb659fds-assets-058264289478-eu-north-1`. Exact URL:

`https://cdk-hnb659fds-assets-058264289478-eu-north-1.s3.eu-north-1.amazonaws.com/team-hub/config-repair/38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f.template.json`

The accepted endpoint rollback URL/object `team-hub/as/5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9.template.json` remains unchanged. Execution runtime ZIP references, including both rollback archives, remain unchanged. The old blocked business product is preserved locally but is no longer an allowed caller TemplateUrl; no prefix wildcard or old-object overwrite is introduced.

| Artifact | SHA-256 |
|---|---|
| New manifest | 39e20bc39335b72856be18e6ea75d89f689cfdc57ea281384b2bf0f3fbdf7566 |
| New security template | 8ff956315649ea5741040f7da2347a0d84dea4af0f6b43226f8f027c6bd1db27 |
| Unchanged repair product | 38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f |
| Unchanged runtime ZIP | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |
| Previous repair manifest, preserved | b00d5846b65555d46dd49b0b355231fd48152f92b58750602bfeaa1fa0180b3d |
| Previously installed security, preserved but not a healthy recovery target | ff226268cf9221d6f3b42bcd06dbc1525d12cbe841bacd79ced0ac60bb016067 |

[Exact artifact paths and all rollback hashes](team-hub-execution-kms-evidence-2026-10-09/artifact-manifest.json), [new security template](team-hub-execution-kms-evidence-2026-10-09/security.template.json), [candidate manifest](team-hub-execution-kms-evidence-2026-10-09/candidate.json). Original pins and deployment evidence remain intact. No synthesis or runtime rebuilding was needed.

Expected security changes: exactly **3 modifications** — ExecutionRole, ExecutionBoundary, PreparationCaller; **0 additions, deletions or replacements**, 7 resources unchanged. Expected product changes remain exactly **2 Environment modifications** — ParityReadFunction and ParityCommandFunction; **0 additions, deletions or replacements**, 48 resources unchanged. All API/routes, code, tables, runtime roles and monitoring resources are unchanged. This is an offline structural prediction; actual AWS-generated change sets must be inspected under later authorization.

## Validation

- Access Analyzer: three changed identity/boundary policy documents, **zero findings**.
- 133 IAM simulations: 26 normal positive decisions, 74 denied/implicit decisions and 33 explicitly labeled deny controls. Covers exact and wrong keys, known business/unknown inventory keys, administration, foreign domains/production, PassRole, exact new/rollback artifact URLs, rejected old/unreviewed objects, function configuration/code lifecycle and retained ZIP read permissions.
- 14 additional checks: 9 actual wrong-principal denials (Core, Command and deployment caller), plus 5 managed-key condition models. No cross-domain role is modified.
- 17 secret-lifecycle checks: existing create/describe/tag/read and random-password provisioning permission preserved; update/value-write/delete/replication and foreign-secret permissions remain denied. No such operation is actually performed.
- Seven structural regressions verify exact artifact hashes, unchanged runtime IAM/trust/Allow semantics, quota limits, three security changes and two Environment-only product changes. Existing configuration, transaction, cursor, Core, privacy, accounting/isolation and monitoring tests run with the same runtime bytes. [Regression results](team-hub-execution-kms-evidence-2026-10-09/regressions.json).
- [IAM/Analyzer results](team-hub-execution-kms-evidence-2026-10-09/validation.json), [wrong principals and key models](team-hub-execution-kms-evidence-2026-10-09/wrong-principals.json), [lifecycle coverage](team-hub-execution-kms-evidence-2026-10-09/lifecycle-security.json). No IAM simulation is described as live decryption or deployment acceptance.
- Final totals: **441 regression tests pass**, TypeScript and migration-ledger reconciliation pass; **164 IAM/lifecycle/model checks pass** across the three evidence files above. [Secret scan](team-hub-execution-kms-evidence-2026-10-09/secret-scan.json) has zero findings. [Final read-only preservation](team-hub-execution-kms-evidence-2026-10-09/preservation.json) verifies unchanged Lambda code/configuration and the exact LEGACY_WRITER epoch/version 1 authority row. The existing configuration remains unhealthy until separately repaired; no fresh successful live authority response is claimed.

## Security-first, product-second plan — separate authorization gates

**S0 — fresh read-only gate.** Reverify all artifact hashes, security operator, account/region, actual execution/runtime policies and attachments, managed-key classification/policies, policy-size limits, unchanged code/environment discrepancy, actual LEGACY_WRITER epoch/version 1 and source/target preservation. Stop on any unexpected drift. Preserve Legacy 2,621 / FunctionDirectiveStack 167, Team 48+7, Core 8+5 and Tournament 11. Current source-recovery and empty-state evidence remains in the configuration investigation and must be refreshed before execution.

**S1 — separately authorized security installation.** Security owner publishes the exact new security template through the reviewed AES256/SSE-S3 artifact process and prepares the security-stack update; the ordinary product caller must not gain security administration. Inspect the complete AWS template/change set: only the three modifications listed above; unchanged Read/Command boundaries and trusts; no deletion/replacement. Execute with rollback enabled only after approval. On failure, let rollback run, retain evidence and stop; do not retry or change permissions automatically.

**S2 — installed-security acceptance before product.** Read back exact identity/boundary/caller documents and attachments, rerun KMS negative/PassRole/artifact/lifecycle checks, and inspect Team Lambda configurations through the approved execution path where supported. Require the explicit Lambda-key blocker gone; do not equate implicit identity simulation with a complete managed-key result. Stop if any new positive KMS grant is shown necessary: that requires separate review. Security alone does not repair the current missing environment; 503 may remain and is not authority activation.

**P1 — separately authorized product preparation/execution.** Publish only the exact repair product, verify checksum/encryption, and create the product change set with the approved caller and existing execution role. Inspect all pages and template: exactly two Lambda Environment modifications, same ZIP/object keys, no other resources/security changes. Execute only under the product authorization, with rollback enabled. Never use direct UpdateFunctionConfiguration or substitute HEAD/new synthesis.

**P2 — live acceptance.** Follow the full [configuration acceptance sequence](team-hub-2b6-business-runtime-configuration-repair.md#exact-next-acceptance-sequence--separate-authorization-required): both full environment maps and code hashes; authority 200 with LEGACY_WRITER/epoch 1/version 1; all 16 normal business routes 403; zero business writes; exact Core integration contract; correlated Lambda/API/D1 signals; absence of unexplained post-stabilization failures; protected-domain preservation. Obtain actual service-path/environment-read/decrypt evidence with appropriate CloudTrail delivery allowance. Cursor runtime decryption remains a separate isolated approved proof. Never change the authority row to make a check reachable.

**Recovery.** Do not automatically restore the previous blocked execution security: it reintroduces the Lambda deny. If product repair fails, stop after CloudFormation rollback and verify actual function configuration; the previous desired product already contained the correct semantic map, so reverting whitespace is not a health guarantee. A separately approved accepted-endpoint recovery can use the retained endpoint product and two old ZIPs with the corrected execution path; IAM/S3/API/Lambda lifecycle coverage is preserved, and the cursor secret's Retain policy prevents deletion. Preserve the Journal authority row and retained audits. Only after accepted endpoint health is proven may the separately reviewed accepted pre-business security be restored. Full recovery is distinct from automatic retry, and none is performed here.

Current domain: Team Hub; phase M5 / 2B6 execution-security preparation. AWS writes 0; business authority LEGACY_WRITER (last live verified epoch/version 1); frontend unchanged/inactive; production changes 0; Legacy/ownership-ledger changes 0. This readiness is permission to review, not permission to deploy or freeze.

**EXECUTION KMS CORRECTION READY FOR DEPLOYMENT REVIEW**
