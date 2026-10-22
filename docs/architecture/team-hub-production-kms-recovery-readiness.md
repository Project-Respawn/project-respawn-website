# Production Core / Team Hub — KMS recovery readiness

21 October 2026. **Preparation only; no production mutation authorized or performed.**

The [20 October failure](team-hub-production-dark-deployment-result.md) remains the installed state. This report proposes a new security correction and log-preserving recovery. It does not revive the old deployment authorization or claim successful Lambda creation.

## Demonstrated cause and actual baseline

[CloudTrail](production-dark-deployment-evidence-2026-10-20/kms-create-grant-denial.json) records CreateGrant AccessDenied at 2026-10-20T22:34:48Z. Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-Core-Production-Execution/AWSCloudFormation`. Key: `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`. Event ID `8e4f248c-cd7e-4b9a-be43-d3a35d8aca21`; KMS request `964d5eaf-0f2b-4620-85cb-12ec85d65691`; Lambda provider request `e7338420-65e9-4864-a4cd-b9871abc277e`.

The [installed execution identity](production-dark-deployment-evidence-2026-10-20/kms-blocking-installed-policies.json) contains a Deny with NotAction `[kms:Encrypt, kms:Decrypt, kms:DescribeKey]` and Resource equal to that exact key. CreateGrant therefore hits an explicit Deny. ExecutionBoundary additionally has no CreateGrant Allow. Adding an identity Allow alone cannot repair either intersection. The uninstalled final Team security candidate has the same lifecycle omission; it has not failed live because it was never installed.

[Fresh read-only inspection](production-kms-recovery-evidence-2026-10-21/fresh-read-only.json) confirms RavenTest/account 058264289478/eu-north-1; Core security CREATE_COMPLETE and product ROLLBACK_COMPLETE; unchanged installed execution identity/boundary; AWS-managed, enabled Lambda key; retained log group with 30-day retention and no log streams at inspection. Four exact source TableIds, ACTIVE table configurations, PITR/deletion protection and AVAILABLE backups were inspected. This task did not rescan source item contents; the prior 121-record preservation receipt is historical and must be refreshed before execution. No exhaustive account drift or organization-policy claim is made.

The AWS-managed key policy already permits CreateGrant through `lambda.eu-north-1.amazonaws.com` for this account. No key-policy edit or customer-managed key is proposed. AWS's default-key documentation says ordinary use does not require additional user/runtime KMS permissions; the demonstrated explicit Deny and boundary ceiling are this restricted deployment role's obstacle, rather than a general requirement to grant KMS administration. [Lambda encryption documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

## Proposed minimal security correction

Only Core and Team **execution** identity policies and execution boundaries change. Runtime Read/Command/Core policies, service trusts, caller guards, PassRole, Cognito, tables, API scope and unrelated denials remain identical.

1. Add CreateGrant to the exact-key Deny NotAction exception in each execution identity.
2. Add an Allow for **only kms:CreateGrant**, **only the exact Lambda key**, requiring StringEquals ViaService=`lambda.eu-north-1.amazonaws.com`, CallerAccount=`058264289478`, and Bool GrantIsForAWSResource=`true`, in identity and boundary.
3. Add identity explicit Denies for CreateGrant with wrong/missing service or account, or false/missing GrantIsForAWSResource. Existing wrong-key Deny continues to apply. Encrypt/Decrypt function-context checks and DescribeKey conditions remain unchanged. No ListGrants, RevokeGrant, RetireGrant, GenerateDataKey or KMS administration permission is added.
4. Core execution identity/boundary additionally receive GetObject on **one exact content-addressed log-import template object**. Existing accepted product/runtime and rollback object access remains. Caller template-URL guards are unchanged; the security owner must perform the one import using existing authority, not a broadened product caller.

The AWS KMS condition reference supports service-mediated GrantIsForAWSResource and ViaService controls, and supports GranteePrincipal/GrantOperations restrictions when their actual values are known. [KMS conditions](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html). Actual CloudTrail requestParameters is **null**: neither a grantee ARN nor the operation list/constraints is established. No guessed runtime-role grantee, grant-operation list, grant encryption context or function ARN is imposed on CreateGrant. The proposed service-mediated scope therefore does **not** certify a particular grantee. Security-owner acceptance of this bounded scope is required; if exact grantee pinning is required instead, obtain additional AWS evidence before execution. Do not silently relax conditions if Lambda fails to supply them.

Only CloudFormation can assume the execution role, and its Lambda/PassRole authority remains restricted to its own reviewed functions/roles. Those restrictions constrain service entry; they do not turn simulated KMS context into an attributable live grant receipt.

## Pinned candidates and validation

[New manifest](production-kms-recovery-evidence-2026-10-21/manifest.json) is **proposed, not approved**. [Full before/after policy diff](production-kms-recovery-evidence-2026-10-21/policy-diff.json) preserves historical policy bytes. Exact hashes, sizes and completed validation results are recorded in the accompanying validation summary when certification completes.

Core security: `59c85a51a66a064044e81d28acff3d72f0fdb9e2d9604c823df3d74573ed7cab`.

Team security: `12cbedb22e12a1691496bcd5be22b44633bdf8ab0620c1a883191d3eabea678c`.

Previously approved Core security: `e665c2e48a1dbec276f5f1afd9f71a1d4459de8b424a544830ee3e456eaa8cfa`; Team security: `4d3352865d5978d508a14d370d627f53d247c85944ca0a394126b38007ff7777`. The former is installed; the latter is not. Their old approval does not approve these new candidates.

Core product `b9c5d96e7123a6d837c903f1e1779080e020aba8c9eab8af1e2ddccde912ed96` and Team product `dda9937e87e2bbc350597ecdfbd8b7ae31c09dae5cffe91a43241edfbe5ce291` remain byte-identical. Core ZIP `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503`; Team ZIP `3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287` remain unchanged; no rebuild.

Validation distinguishes fresh AWS custom policy simulations/Analyzer/template syntax checks from live service execution. Team generated API IDs in simulation are labelled synthetic. Missing conditions, wrong service/account/key, KMS administration, foreign resources, exact artifacts, PassRole and existing runtime restrictions remain mandatory negative controls. Tests preserve unchanged policies/trust and every prior Deny except the single documented NotAction addition. Policy sizes use compact JSON, a conservative count that includes all non-formatting string characters.

## CloudFormation recovery options

**Recommended: retain the log group and import it before the normal product update.** AWS documents that a ROLLBACK_COMPLETE stack permits only deletion, so UpdateStack/REVERT_DRIFT/ContinueUpdateRollback cannot resume this failed CREATE. [Stack statuses](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/view-stack-events.html). No deletion has been attempted.

After separate authorization, archive and verify the exact failed stack ARN and resource inventory, then delete **only that failed product stack record**, preserving Logs via its existing DeletionPolicy/UpdateReplacePolicy Retain. Verify the group survives and is no longer owned by another stack. Core security and its retained secret stay installed.

Use the pinned Logs-only template to IMPORT the exact `/project-respawn/Production/core/contracts` group into the recreated **same** Core product stack under logical ID Logs. Import must contain one Import and zero creations, modifications, deletions or replacements. Existing group properties must match the template before import; perform drift verification afterward. Then update using the unchanged accepted full Core product template: **six additions** (Runtime, Contracts, four alarms), Logs unchanged, zero deletions/replacements. Final product count remains seven. [Import restrictions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/import-resources-manually.html), [supported resource types](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-import-supported-resources.html).

RavenTest uses existing security-owner permissions only for failed-record handling and the exact import with the existing Core execution role. The normal caller cannot select the import template. No new general administrator or import permissions are granted. Read-only GetTemplateSummary must confirm LogGroupName as identifier. AWS-generated import/update change sets remain future gates, not inspected receipts from this preparation.

Alternatives: delete the log group and retry CREATE (unnecessary evidence loss; not recommended); remove Logs from the product template and treat it as an external resource (changes ownership/accounting and requires a separate product candidate; not prepared); use a new stack name (breaks accepted stack/caller boundaries; rejected). No new parallel production stack or log group is proposed.

## Proposed execution gates — fresh authorization required

1. Approve the new manifest and bounded service-mediated grant risk. Name the existing operator and production window; verify no concurrent administrative work. Refresh all pins, source identities/counts/digests/relationships/protections/backups, Cognito, Master, protected Legacy/Ntgre roots, source policies, capacity, exact key policy and stack identities. Stop on any difference or unavailable mandatory evidence.
2. Publish only missing exact new security/import objects with the existing AES256/checksum/readback discipline. No artifact-bucket policy/default change or secret retrieval. Reuse the three verified old Core objects; never overwrite a conflicting key.
3. Inspect Core security UPDATE: **exactly ExecutionBoundary and Execution modifications**, no additions/deletions/replacements (including conditional/dynamic). Preserve all six resources. Execute with rollback, then compare installed trust, policy, boundary, attachments and effective positive/negative cases to the proposed pin. Stop on failure; no patch/retry.
4. Explicitly authorize and perform the failed product stack-record deletion with Logs retained; verify exact surviving group/ownership. No log deletion. Stop if another resource survives unexpectedly or deletion behavior differs.
5. Inspect and execute the one-resource import under the exact pinned import template. Verify complete properties, ownership and drift. No simultaneous Lambda/resource creation. Stop on import failure; preserve the group and evidence, no automatic cleanup/re-import.
6. Inspect the normal full product UPDATE: six additions, Logs unchanged, no removals/replacements/unrelated modifications. Execute rollback-enabled once. Verify Lambda Active/Successful, complete environment, ZIP hash, runtime IAM, exact generated secret reference without value retrieval, and real production Admin/ordinary authorization/directory/privacy/cursor/logging contracts. Capture actual KMS grant lifecycle evidence where available; null CloudTrail parameters are not complete proof of a grantee. A simulation or UPDATE_COMPLETE alone is insufficient.
7. Only after Core live acceptance, separately authorize revised Team security CREATE (8 additions) and unchanged Team product CREATE (39 additions). Repeat actual-output IAM, code/environment, API, table protection and dependency verification. No authority item is created: missing authority remains fail-closed; LEGACY_WRITER initialization and full dark acceptance need their own C1 review/authorization.
8. Reverify protected domains, production source contents/protections/backups, Cognito, Master and absence of authority/source-fence/frontend changes. Reconcile created/retained resources and retain sanitized audit receipts. Later migration and Master release remain separately gated.

## Abort and rollback

Before execution, stop on hash, identity, policy, attachment, key-policy, source-data or log-ownership drift. Never compensate with broader permissions or different artifacts. Security UPDATE failure uses native rollback to the previous six-resource template; verify readback. Do not automatically restore the old restrictive security policy after product creation, because it may obstruct lifecycle/rollback work; that is a separately reviewed decision.

A product UPDATE failure after import should roll back to the Logs-only stack, leaving the log group retained; independently verify runtime role/function/alarms removed and imported log intact. Do not retry. If rollback fails, preserve state and obtain a scoped recovery decision. Import rollback failure similarly requires inspection before any further write. Team initial-create rollback may retain its secret/API/tables according to the unchanged templates; inventory those resources before proposing another attempt. No application data, production users, source records or authority are part of this recovery.

The historical failed Core stack, old authorization, failed candidates, R1/R2 evidence and log data remain intact during this preparation. No production IAM, stack, log group, authority, frontend or protected-domain mutation occurred.

**Authorization request:** approve the newly pinned Core security correction and log-preserving stack-record deletion/import/product-update sequence above, subject to fresh installed-IAM and complete AWS change-set gates. Team deployment requires the separately stated Core-live-acceptance gate and explicit inclusion of its revised security hash. Until approval, execute nothing.

<!-- KMS-RECOVERY-VALIDATION -->

## Completed certification

[Validation summary](production-kms-recovery-evidence-2026-10-21/validation-summary.json): 14 policies, 516 fresh AWS custom-policy cases, 14 additional identity/boundary-intersection and injected-Allow explicit-deny cases; zero blocking Access Analyzer findings. Three new templates passed AWS ValidateTemplate; GetTemplateSummary confirms the import identifier. Thirty focused tests pass. All 44 pinned R2 inputs remain hash-identical. New evidence/scripts secret scan: 23 files, zero matches. Existing production runtime/TypeScript/build evidence is reused only for unchanged runtime bytes; no runtime source or environment change is proposed.

| Policy | Compact size | Limit |
|---|---:|---:|
| coreSecurity.ExecutionBoundary | 3694 | 6144 |
| coreSecurity.Execution | 5521 | 10240 |
| teamSecurity.ExecutionBoundary | 6068 | 6144 |
| teamSecurity.ExecutionRole | 9064 | 10240 |

New log-import template SHA-256: `099f4aed191a8f6921daa4c15ce91a14869ad90bcb71d46044e4f898cd4c55b8`. New recovery manifest SHA-256: `ca35f7a41b0c9786ab8a81d130a464a170c69d466d3a0e807531a06a164b7d86`. These candidates are **not approved or installed**.

**RECOVERY CANDIDATES PREPARED — FRESH EXECUTION AUTHORIZATION REQUIRED.** Actual service grant context, successful Lambda creation, future change sets/import ownership and production contract acceptance remain live gates.
