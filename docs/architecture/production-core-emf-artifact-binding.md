# Production Core EMF artifact-binding correction — 21 October 2026

**CORE EMF ARTIFACT BINDING READY FOR DEPLOYMENT REVIEW.**

Preparation only. No AWS writes, invocation, publication, change sets, deployment, authority change or Master publication occurred. The accepted EMF runtime/product bytes are unchanged. This report addresses only the exact deployment artifact guard identified in the [EMF correction](production-core-emf-correction.md); accepted IAM/KMS runtime recovery, imported-log recovery and R1/R2 work are preserved.

## Exact security delta

| Security resource | Additional permission binding | Preserved |
| --- | --- | --- |
| Execution | GetObject on exact new runtime ZIP and product template | Existing actions, resources, conditions and all rollback artifacts |
| ExecutionBoundary | Same two exact GetObject objects | Existing ceiling, KMS lifecycle and all rollback artifacts |
| Caller | GetObject on exact new product template; new exact CreateChangeSet TemplateURL | Existing exact stack/execution-role condition, PassRole and rollback URLs |
| CallerBoundary | Same template object and URL | Existing ceiling, exact stack/role conditions and rollback URLs |

No ZIP access is added to Caller because it does not need it. No bucket-wide/prefix-wide access, ListBucket, GetObjectVersion, PutObject, wildcard URL, new action, trust change, runtime IAM change or KMS/Cognito/foreign-domain change is introduced. No Deny statement or PassRole condition changes. Inverting only the listed exact object/URL additions recovers every previous policy statement and the complete installed security template.

The new objects are under the existing artifact bucket `cdk-hnb659fds-assets-058264289478-eu-north-1`, keys `production/dc2a7137a725f6a82582abc8a800f5d30846058ecdbe12965f81a19c887154c4.zip` and `production/5b8783be1765409602b978ade59e641ed11c7516f63436c436318470bbd9d086.json`. The new URL is the exact regional HTTPS S3 URL for that template object. Old product, runtime and log-import object references remain; old product URLs remain accepted. Security-template access is not added to the normal product roles.

## Immutable package

| Artifact | SHA-256 |
| --- | --- |
| New security template | `668049957edf3fb6e3dfda209e4600a824aa0b8182d41afb3051fb76f32bd613` |
| Preserved EMF product | `5b8783be1765409602b978ade59e641ed11c7516f63436c436318470bbd9d086` |
| Preserved EMF runtime | `dc2a7137a725f6a82582abc8a800f5d30846058ecdbe12965f81a19c887154c4` |
| Installed security / rollback security | `8f83dda21a47895b2f48cea19839daa84bdbcba7f28ff82e30906aec595b0c44` |
| Current installed / rollback product | `0302056f0152107ecabd9d459ab50d436245587eef3cec1aa4d971c77a6ca1e4` |
| Current installed / rollback runtime | `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503` |

[Sealed manifest](production-core-emf-binding-evidence-2026-10-21/sealed-manifest.json), [semantic policy diff](production-core-emf-binding-evidence-2026-10-21/policy-diff.json) and [fixed execution plan](production-core-emf-binding-evidence-2026-10-21/execution-plan.json) bind the artifacts. The prior EMF sealed manifest is `936c2404bfce0a7f7257eb4f978658e289ad29fff88dd30ca48057c650b31237`. Earlier templates, runtime ZIPs and failure evidence remain unchanged.

## Installed baseline and effective IAM review

[Fresh read-only inspection](production-core-emf-binding-evidence-2026-10-21/fresh-installed-baseline.json) verifies account 058264289478/eu-north-1/RavenTest, both Core stacks UPDATE_COMPLETE, six security/seven product resources, exact installed templates, all runtime/deployment inline policies, boundaries and trusts, and the accepted active Lambda configuration. No KMS or secret-value operation is needed for this reference-only correction. Production Core still runs the old ZIP; EMF is not live accepted.

[Candidate certification](production-core-emf-binding-evidence-2026-10-21/security-validation.json) covers the complete inherited positive/negative policy matrix plus exact new/rollback artifacts, wrong keys, GetObjectVersion denial, wrong/query-suffixed TemplateURLs, wrong stacks and wrong execution roles. Identity/boundary intersections are tested for execution, caller and runtime. Existing KMS controls, injected-Allow Deny controls, runtime Core/Cognito isolation and PassRole restrictions remain covered. [Coverage mapping](production-core-emf-binding-evidence-2026-10-21/coverage.json) reconciles every required test with a successful receipt.

[Wrong-principal controls](production-core-emf-binding-evidence-2026-10-21/wrong-principal-controls.json) use the actual installed runtime role and require deployment artifact reads, deployment-role assumption and PassRole to remain denied. Caller trust remains RavenTest only; execution trust remains CloudFormation service only. Trust structure equivalence is not represented as an actual unauthorized STS assumption test. Candidate permissions are simulated before installation; actual installed-role checks and complete effective authorization remain execution gates. Organization-policy visibility is not claimed complete.

The read-only validator was interrupted after 169 completed cases with no failed permission assertion. The partial receipt and validator hash are preserved. Resume reuses only successful identical case/context records with identical resolved policy hashes; a complete required-case map is reconciled at completion. No failed/unfinished security requirement is deleted, silently skipped or replaced with a permission change.

Read-only AWS certification passed 494 policy cases and 211 identity/boundary or explicit-deny controls. Both templates validated. All six policies have zero Access Analyzer ERROR or SECURITY_WARNING findings. Final counts, findings, resolved policy sizes and test results are in [validation summary](production-core-emf-binding-evidence-2026-10-21/validation-summary.json). Conservative compact JSON sizes for the four changed policies are Execution 6,081, ExecutionBoundary 4,254, Caller/CallerBoundary 2,401 characters each; resolved sizes are also checked. Roles have one inline policy each. These remain below the [AWS IAM limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html) of 10,240 aggregate inline-role characters and 6,144 per managed policy, excluding whitespace. No quota increase or wildcard compression is needed.

112 focused offline tests pass, including exact four-property inversion, trust/PassRole/KMS preservation, immutable artifacts, full EMF handler behavior, Core authentication/directory/privacy/cursor tests, resource accounting and migration controls. Core TypeScript passes. The Core bundle was rebuilt in memory and matched the exact accepted ZIP hash. No stored runtime or product artifact was rewritten or substituted; exact ZIP handler tests also pass. No new full website release build is claimed; the earlier missing frontend environment setting remains outside this IAM-only change.

## Expected AWS change sets

Security: exactly four Modify resources, Execution, ExecutionBoundary, Caller, CallerBoundary. Product: exactly one Contracts Modify targeting Code. Both require zero Add/Delete/Replace, zero conditional replacements and no unrelated/nested effects. Counts remain six security plus seven product, thirteen total. No AWS change set was created; these are inspected expectations, not AWS-generated receipts.

RuntimeBoundary, Runtime identity, Cognito contracts, KMS conditions, Lambda environment/role/memory/timeout/architecture/logging, imported log group and alarms must remain unchanged. The security update does not update Lambda code; the product update does not change IAM. The old runtime remains an available code rollback but has known non-extracted custom metrics, so rollback is not operational acceptance.

## Separately authorized deployment sequence

1. Obtain explicit authorization for the new sealed security/product/runtime package and confirm a fresh operator window/no concurrent administration. Prior runtime-KMS authorization does not authorize this new candidate. Verify exact account/region/operator, stack identities/statuses, installed IAM/trust/configuration, source protections/backups/data, Cognito/Master/protected domains and imported log state. Stop on drift or conflicting write intent.
2. Verify every artifact/source/evidence/rollback hash; publish only the three fixed immutable objects with checksum/AES256/IfNoneMatch controls and downloaded byte verification. No overwrite of an accepted hash key, arbitrary URL, fresh synthesis or code rebuild.
3. Prepare and retrieve the complete security change set. Require exactly the four reviewed IAM modifications with no replacement or unrelated property. Verify its AWS template equals the pin. Execute only after inspection, explicitly enabling rollback; wait for UPDATE_COMPLETE. On failure allow rollback, collect evidence and stop without permission patch or automatic retry.
4. Read actual installed policies, boundaries and trusts. Require exact candidate equivalence and actual-role positive/negative checks, including new/rollback object access and continuing isolation. Preserve runtime IAM/KMS. Stop on mismatch or incomplete security evidence.
5. Use the reviewed restricted product caller/execution pair. Inspect the complete product change set and template, requiring Contracts Code only. Execute with rollback enabled; wait for UPDATE_COMPLETE. Verify actual CodeSha256 equals the pinned EMF ZIP and the complete remaining configuration equals the preflight baseline.
6. Invoke once using the reviewed non-authenticated probe. Require initialization and unchanged UNAUTHENTICATED response, successful platform records and one complete root EMF event for the actual request ID. No automatic retry after ambiguous execution.
7. Allow a bounded, recorded ingestion observation interval using read-only queries. Require actual Requests/Denied counters and the expected zero dependency/rate-limit values in the exact Production dimension/time bucket. Require native Errors/Throttles zero. Correlate log event IDs/request IDs and CloudWatch periods; distinguish AWS at-least-once delivery from duplicate application emission. No fake metric publication, fabricated receipts or replay to hide missing ingestion.
8. Verify alarm metric namespace/dimensions/statistic/period/threshold against ingested points and subsequent evaluation. An OK alarm without data is insufficient. Do not force alarm states or disrupt production dependencies to manufacture an alarm.
9. Complete production Admin and ordinary-user authorization/directory/privacy/cursor acceptance plus rejection of a valid signed Ntgre token. Attempt permitted normal session reuse/automation first; if authenticated sessions are unavailable, use one consolidated existing-account sign-in step without requesting passwords/tokens in chat. All receipts must be actual and complete.
10. Reverify protected production source/backups/protections/Cognito, imported log, Master and unrelated/Ntgre domains. Stop the owned helper, clear in-memory sessions and preserve sanitized audit evidence. Update Core acceptance only after every live gate passes. Do not start Team Hub, authority initialization, data migration, Master publication or retirement.

Abort on any unexpected change, replacement, IAM/configuration mismatch, KMS/runtime failure, missing metric, incorrect authentication or protected-domain/data drift. Preserve partial state and do not retry ambiguous writes. Keep accepted IAM/KMS and imported-log recovery intact. Any manual rollback decision must account for both security artifact access and the known old runtime monitoring defect; do not automatically restore unhealthy state or remove rollback permissions.
