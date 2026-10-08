# PROJECT RESPAWN CORE — FINAL RELEASE 1 ACCEPTANCE

6 October 2026. **ACCEPTED — INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED.** The missing ordinary-user authorization, directory and required cursor checks passed against the already-deployed, unchanged Core runtime. No redeployment, IAM change, Cognito mutation or other-domain change occurred during this acceptance task.

[Acceptance decision](core-acceptance-evidence-2026-10-06/acceptance.json), [ordinary receipt](core-acceptance-evidence-2026-10-06/ordinary-receipt.json), [previous incomplete acceptance report](core-acceptance-evidence-2026-10-06/previous-incomplete-acceptance.md). Prior deployment/admin/security/isolation/observability files remain byte-identical: [preservation manifest](core-acceptance-evidence-2026-10-06/prior-evidence-preservation.json).

## Deployment and pins

ProjectRespawn-Core-Ntgre-Security and ProjectRespawn-Core-Ntgre both remain CREATE_COMPLETE, 5 security +8 product resources. ProjectRespawn-Core-Ntgre-Contracts remains Active; reserved concurrency NONE. Existing Cognito pool eu-north-1_n24iLL7QE and client unchanged. [Fresh narrow health check](core-acceptance-evidence-2026-10-06/health-before.json), [post-test health](core-acceptance-evidence-2026-10-06/observability.json).

Product revision/template SHA256: `4aad4b8df1b1272f12e93144b3a1e89a2addaab5e404950f924ff7d7b58b9e46`.

Runtime ZIP SHA256: `4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf`.

Security revision/template SHA256: `232c577cf84eb151dccaee88e702174a0225972fec87a3d432a2dc7f631acf79`.

No synthesis/rebuild, template substitution or candidate changes. Both original inspected change sets executed with rollback enabled; [security events](core-live-evidence-2026-10-06/security-status.json), [product events](core-live-evidence-2026-10-06/product-status.json), [installed product](core-live-evidence-2026-10-06/product-installed.json). Those deployment changes occurred in the preceding task, not this acceptance run.

## Ordinary identity and contracts

One existing enabled, CONFIRMED Ntgre verification account, classified ORDINARY through fresh group reads; neither Admin nor SuperAdmin. Receipt stores a hashed stable reference only. Normal Amplify authentication followed the earlier Team Hub direct-verification approach; password, JWT and cursors remained in process memory and were cleared. No password, token, cursor, email, raw Cognito attributes or secret value is in the receipt.

authorization.decision.v1: teams.admin DENY; teams.branding.manage DENY; unknown capability rejected INVALID_INPUT; wrong environment rejected WRONG_ENVIRONMENT. Correct ordinary request returns a bounded false decision; no fallback ALLOW.

directory.assignment.v1: exact resolution PASS; bounded search PASS; query minimum and result maximum PASS; pagination PASS; cross-environment rejection PASS; absent/invalid delegated tokens rejected UNAUTHENTICATED. Responses checked for subject/displayName only per item, bounded counts and allowed envelope fields. Positive calls used the approved IAM-authenticated operator verification path with the ordinary delegated identity. Core is a service contract; future Team integration must enforce Team ownership/Manager authorization before delegation. This test grants no browser or Team invocation permission.

environment.v1 remains the existing static validated Ntgre descriptor. profile.summary.v1 remains not implemented by design. Existing [admin acceptance](core-live-evidence-2026-10-06/live-contracts.json) was reused, not rerun.

## Cursor and optional cases

Valid cursor accepted; tampered, invalid, wrong environment, wrong contract/context and wrong Team rejected. A real cursor was kept only in memory for more than five minutes and then rejected as expired. Cursor secret was never retrieved by verification tooling.

Cross-actor cursor: **NOT_REQUIRED_FOR_RELEASE_1**, as permitted by the accepted gate and current request; existing offline actor-binding coverage retained. Disabled account: **UNTESTED_LIVE_WITH_OFFLINE_COVERAGE**. No account was created or disabled to satisfy a fixture. These exclusions are explicit and are not counted as passed live tests.

## Observability and security

19/19 ordinary live checks passed. Recorded acceptance window 2026-10-06T22:26:08.801Z to 2026-10-06T22:32:41.969Z: 19 Lambda invocations, 0 errors, 0 throttles, 0 application dependency failures; application logs and duration metrics present; all four alarms OK. [Sanitized logs/metrics](core-acceptance-evidence-2026-10-06/observability.json). These are bounded-window claims, not all-time totals. Token/secret-pattern scan passed. The prior logging simulator classification remains SIMULATOR_UNSUPPORTED; no IAM changes were made.

Accepted 39 deployment-role and 36 runtime-role checks reused: [deployment](core-live-evidence-2026-10-06/effective-security.json), [runtime](core-live-evidence-2026-10-06/effective-runtime.json). Core retains only approved Cognito reads and strict runtime isolation. This run used normal sign-in, Core synchronous Invoke and read-only verification APIs. Cognito user/group mutations 0; Team business writes 0; Legacy writes 0; Tournament changes 0; production changes 0.

## Manifest and migration control

[Accepted Core manifest](../../config/domains/core/domain-endpoints.Ntgre.json) generated only after acceptance and validated with JSON Schema/Ajv plus exact-pin checks; one positive and eight negative validation cases. [Validation](core-acceptance-evidence-2026-10-06/manifest-validation.json). It includes stack/Lambda identities, IAM invocation, all three contract versions, pinned revisions and acceptance provenance; no secrets or consumer activation.

Existing protected baseline remains the accepted comparison evidence: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 40+7 / API t54b88casf / PRE_CUTOVER / LEGACY_WRITER; Tournament 11 / API msipnwy39j. [Protected comparison](core-live-evidence-2026-10-06/baseline-after.json), [runtime hashes](core-live-evidence-2026-10-06/protected-lambdas-after.json), [Team authority](core-live-evidence-2026-10-06/preservation.json). No expensive protected-domain inventory was repeated for this ordinary-only task.

Reviewed resource subtotal remains 2,692; zero Legacy savings, migration or retirement. [Existing accounting](core-live-evidence-2026-10-06/resource-accounting.json). Team Hub remains PRE_CUTOVER / LEGACY_WRITER. No Team integration started, no frontend cutover, no production work.

Remaining required acceptance blockers: **NONE**.

NEXT GATE: **TEAM HUB 2B5A-2 — CORE INTEGRATION**, requiring separate authorization. Do not start it from this acceptance.

CORE RELEASE 1 ACCEPTED — SHARED CONTRACTS READY FOR TEAM HUB INTEGRATION
