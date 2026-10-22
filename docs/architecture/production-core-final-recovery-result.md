# Project Respawn — production Core recovery result

**PRODUCTION CORE RECOVERY BLOCKED — RUNTIME kms:Decrypt EXPLICIT DENY.**

Actual AWS execution on 21 October 2026, account 058264289478, eu-north-1, RavenTest. [Consolidated result](production-core-final-execution-2026-10-21/result.json). Security and product infrastructure deployed successfully; Core is **not operationally accepted**. No Team deployment or business authority change occurred.

## Authorization, artifacts and preflight

The [exact user request](production-core-final-execution-2026-10-21/authorization-request.txt) authorized manifest `639d59654977db8b603b2f7c1344199046148668448c9c1cf5fa4b2d9ec5d891` and explicitly accepted regional index-policy metadata visibility. [Window receipt](production-core-final-execution-2026-10-21/authorization-window.json) reuses the already confirmed 06:01:58–08:01:58 UTC window/operator availability and no-concurrent-change confirmation. No new historical signature or attendance was invented.

Security SHA: `5f30d59d1e7f5e436cecefd723ee6a10c2b79651eb47ab90115d528ced0e7172`. Product SHA: `b9c5d96e7123a6d837c903f1e1779080e020aba8c9eab8af1e2ddccde912ed96`. Runtime ZIP SHA: `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503`. All reviewed source/evidence/artifact/rollback bindings matched; no rebuild, HEAD substitution or runtime configuration patch. Only the new reviewed security template was published, with AES256/checksum/download verification; existing product/ZIP objects were verified and reused.

[Fresh installed baseline](production-core-final-execution-2026-10-21/fresh-installed-baseline.json) and [preflight preservation](production-core-final-execution-2026-10-21/preflight-preservation.json) verify exact stack identities, imported Logs ownership/retention, installed 59c85 execution IAM baseline, all 121 source records/digests/relationships, backups/protections, production Cognito, Master, protected stacks and capacity.

## Actual AWS results

| Gate | Result |
|---|---|
| Security change set | Exactly Execution/ExecutionBoundary modifications; zero additions/deletions/replacements; template readback matched pin |
| Security deployment | UPDATE_COMPLETE, rollback enabled |
| Installed security | Exact policies/boundaries/trust/attachments matched; **115 actual-role permission cases passed** |
| Imported Logs drift | **IN_SYNC**, exact imported resource, no property differences; only one new drift check |
| Product change set | Exactly Runtime, Contracts, Errors, Throttles, DependencyFailures, Denied additions; Logs unchanged; no modifications/deletions/replacements |
| Product deployment | UPDATE_COMPLETE, rollback enabled; seven resources |
| Installed product | Exact ZIP hash, complete environment, role/boundary/trust and resource inventory matched; function Active/Successful |
| KMS CreateGrant | Actual successful CloudTrail receipt on exact Lambda key |
| First live invocation | **FAILED before handler execution: runtime role kms:Decrypt explicitly denied** |
| Authenticated Core contracts | **NOT ACCEPTED / NOT RUN** |
| Application logs/counters | No handler logs/metrics; initialization failure prevents application monitoring acceptance |

[Full security change set](production-core-final-execution-2026-10-21/security-change-set-inspected.json), [installed security](production-core-final-execution-2026-10-21/security-installed.json), [actual-role IAM](production-core-final-execution-2026-10-21/installed-iam-simulation.json), [actual drift](production-core-final-execution-2026-10-21/import-drift.json), [full product change set](production-core-final-execution-2026-10-21/product-change-set-inspected.json), [installed product](production-core-final-execution-2026-10-21/coreProduct-installed.json). CFN completion and simulated context have not been substituted for runtime acceptance.

## Successful grant and exact new failure

[Lifecycle/monitoring receipt](production-core-final-execution-2026-10-21/monitoring-lifecycle.json) records CreateGrant event `6bbc5e67-0846-4774-8334-41a86dcf7106`, KMS request `d27f44c5-3b8f-4ce7-9845-69859f6c763b` at 06:54:35Z by the **execution** role. Actual grantee is the assumed Core **runtime** role, operations Decrypt and RetireGrant, constrained to the exact Core function ARN; retiring principal lambda.eu-north-1.amazonaws.com. This is actual evidence, not an invented grantee from the earlier null-parameter denial. No grant token was persisted.

The first explicit live acceptance invocation then returned KMSAccessDeniedException / HTTP 502. Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-Core-Production-Contracts/ProjectRespawn-Core-Production-Contracts`. Action: kms:Decrypt. Key: `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`. Lambda invoke request `6069a27a-272b-47fe-b58a-736af41089d3`; KMS request `63ecbfbd-4630-453a-985b-2fa76f62b675`. [Failure, actual policies and CloudTrail](production-core-final-execution-2026-10-21/runtime-kms-stop-evidence.json) records event `0066ac4a-3cae-43dd-9566-fd868be96c30` at 06:59:33Z, plus an earlier provider bootstrap runtime Decrypt denial at 06:54:35Z. The latter was a service provisioning attempt, not a manual invocation retry. The explicit probe used maxAttempts=1 and stopped at its first request.

AWS attributes the denial to the runtime identity policy, not the corrected execution role. Runtime policy and RuntimeBoundary are the exact accepted unchanged artifacts. Potential identity conditions on this key are statement indices 11 (ViaService), 12 (CallerAccount) and 15 (function encryption context), zero-based. Other key/NotAction controls are preserved. CloudTrail requestParameters is null: this report does **not** assert which context value was missing/different or propose loosening one blindly. A separate evidence-backed runtime-policy review is required; no runtime IAM or boundary change was authorized or performed.

## Acceptance, monitoring and cleanup

An isolated sequential sign-in helper was prepared, but no successful Admin/ordinary/foreign-token contract receipt exists. When session reuse was requested, approved local helpers and browser automation availability were inspected; no reusable production session or attachable browser connection was found. No profile/password database was inspected and no credentials were guessed. Independent live rejection probes exposed the platform KMS blocker before business acceptance could proceed.

The helper was stopped (only verified PID 11636), discarding any memory-only sessions and preventing further requests. Passwords/tokens/directory data were not persisted. No sign-in is required while this runtime failure remains unresolved. The four alarms exist and were observed OK; no handler log/counter acceptance is claimed. CloudWatch ingestion/absence of metrics is not evidence of a healthy runtime.

## Preservation and stop state

[Final preservation](production-core-final-execution-2026-10-21/post-preservation.json) confirms unchanged **1/8/11/101** source records/digests/relationships; four AVAILABLE backups, PITR and deletion protection; Cognito/client/users, Master and protected Legacy/Ntgre/Tournament stacks unchanged. Production Team roots remain absent. No authority row, business migration, source fence, frontend publication or Legacy retirement. Local Ntgre outputs also passed read-only validation without switching outputs.

Thirteen independent Core resources survive: six security and seven product. The imported log remains intact. No automatic rollback, policy expansion, artifact substitution or invocation retry followed the runtime failure. Preserve the current stacks/log/artifacts and evidence for a separate runtime KMS correction review. Team prerequisite gates remain: actual Core runtime/KMS/contracts/monitoring acceptance first, then separately reviewed and authorized Team security/product deployment, authority initialization and later migration/publication.

**PRODUCTION CORE RECOVERY BLOCKED — CORE RUNTIME ROLE EXPLICITLY DENIES kms:Decrypt BEFORE HANDLER INITIALIZATION.**
