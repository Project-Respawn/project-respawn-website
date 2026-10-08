# PROJECT RESPAWN TEAM HUB 2B4A — DARK MUTATION RUNTIME RESULT

6 October 2026. Team Hub M5 / Phase 2B4A, account 058264289478, region eu-north-1. Product and security deployment succeeded with rollback enabled. Runtime acceptance COMPLETE. Legacy remains LEGACY_WRITER; no frontend cutover, verification lease, synthetic data, authority seed or retirement.

## Authorization and acceptance decision

The attached 2B4A request separately authorized security/product execution only after reconciled gates. Both gates were emitted before execution. The pinned disabled runtime rejects reads as well as writes. Before AWS writes, all thirteen routes returned 403 FORBIDDEN in an offline packaged-handler proof. The user explicitly resolved the Step 22 conflict: **“Accept denied reads for this dark deployment; preserve the pin.”** Denied reads are therefore accepted for this stage; empty/not-found live business reads are not claimed. No business contracts, source manifest entries or pinned artifacts were changed.

## Preserved candidate

Product SHA256: d9e47021ffc55ee99c9477f0ff00590258f10e51375d7f8065afbf28f26c51c2

Security SHA256: 8431078d29f8a5c8cbdd53737727fe3df75421c1ce2f804d09eb48e3a5d9389c

Runtime ZIP: team-hub/parity/fd586f77dd3d872299e432f8e6d4631da09592cd29f47df6221ec8ede77b4a6d.zip

Bundle SHA256: 6f83d22ddc4a19c5a43d3cc6de8d1a6d5857ab287f4b731b122f1e6b59750175

All 35 source entries and bundle closure verified. No fresh synthesis or HEAD substitution. [Pinned proof](team-hub-2b4a-evidence-2026-10-06/pinned-dark-proof.json). Two exact objects published with explicit AES256/SSE-S3; checksums verified. No KMS permissions added for publication. [Publication](team-hub-2b4a-evidence-2026-10-06/publication.json).

## TEAM HUB 2B4A — SECURITY EXECUTION GATE

Stack ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity, 5 → 7 resources. Change set arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-2b4a-security-20261006/04226f3c-70ca-4256-bc8d-8d12582d4dc0. Two additions: ParityCommandBoundary and ParityReadBoundary. Three modifications: ExecutionBoundary (reviewed lifecycle ceiling), ExecutionRole (exact resource lifecycle identity), PreparationCaller (exact product template URL/object pin). Zero removals, replacements, conditional/dynamic replacements or unexpected changes. Exact AWS template and all logical IDs/types reconciled. [Complete AWS plan](team-hub-2b4a-evidence-2026-10-06/security-change-set.json).

Command boundary: exact target tables and synthetic LeadingKeys, transactional writes only, bounded audit/idempotency. Read boundary: exact Operational Get/Query only; Journal denied. CreateApi, Legacy, Tournament, production, foreign DynamoDB, business S3/KMS, Cognito Admin, AppSync, IAM and CloudFormation denied to runtimes. Execution lifecycle limited to reviewed Team resources and existing API t54b88casf. No deployment caller data-plane permissions added. Managed boundary 6120/6144 characters; inline execution identity 8236/10240.

Analyzer zero findings; 18 positive/72 negative checks plus 12 lifecycle/PassRole checks passed. **READY TO EXECUTE TEAM HUB 2B4A SECURITY UPDATE** was recorded before execution. UPDATE_COMPLETE; rollback enabled. Installed documents read back and canonically equal; security suite rerun. [Installed security](team-hub-2b4a-evidence-2026-10-06/security-installed-final.json).

## TEAM HUB 2B4A — PRODUCT EXECUTION GATE

Stack ProjectRespawn-TeamHub-Ntgre, 13 → 40 resources. Change set arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-2b4a-product-20261006/71f320f3-e6a7-42de-b903-44cb03923fef. Exactly 27 additions, zero modifications/deletions/replacements/conditional or dynamic replacements/unexpected changes. Two Lambdas, two roles, two log groups, two invoke permissions, two integrations, thirteen JWT routes and four alarms. Existing thirteen definitions unchanged; no new API/pool/table/S3/AppSync/EventBridge/WebSocket. [Complete AWS plan](team-hub-2b4a-evidence-2026-10-06/product-change-set.json).

API t54b88casf, PreviewRead Lambda/route, JWT authorizer and both protected tables preserved. Verification DISABLED, target writer disabled, Legacy LEGACY_WRITER. No Legacy/Tournament changes or production target. **READY TO EXECUTE TEAM HUB 2B4A** was recorded before execution. Restricted Deploy caller assumed in memory; existing ReadProofExecution role used; credentials never saved. UPDATE_COMPLETE, rollback enabled. [Product status](team-hub-2b4a-evidence-2026-10-06/product-status.json), [installed product](team-hub-2b4a-evidence-2026-10-06/product-installed.json).

## Runtime, authority and state

Command ProjectRespawn-TeamHub-Ntgre-ParityCommand; Read ProjectRespawn-TeamHub-Ntgre-ParityRead. Actual CodeSha256 matches pinned ZIP; environments match exact template with verification DISABLED and LEGACY_WRITER. Nine command and four real-read routes; branding routes absent. Preview stays SYNTHETIC, unchanged. Fourteen total routes and three total integrations use the existing API/JWT authorizer. [Runtime verification](team-hub-2b4a-evidence-2026-10-06/runtime-installed.json).

Live authenticated denial: PASS, 50 checks. Expected signed-in command/read result 403 FORBIDDEN; no-token/invalid/altered issuer/altered client command requests 401; preview 200. Altered issuer/client tokens have invalid signatures and do not independently isolate claim validation; exact deployed issuer/audience configuration supplies complementary evidence. Local helper forwards existing-session token only in memory to the fixed Ntgre API; no token/password/session stored. Existing CORS remains GET-only; the local relay is test tooling, not frontend cutover or production client readiness.

Target Operational and Journal ACTIVE, PITR/deletion protection enabled, Retain/Retain and original TableIds preserved. Two consistent count passes each: 0/0. Post-denial counts verified. No synthetic or authority-control record written. Real business reads and mutation parity remain unproved; ordinary users receive no target authority.

Actual runtime/execution-role simulation: 18 allowed/72 denied checks passed. Command limited to synthetic transactional namespace; Read only Operational Get/Query. Cross-domain, Cognito Admin, AppSync, business KMS/S3 denied. Reviewed AWS-managed Lambda decrypt exception preserved. [Actual-role security](team-hub-2b4a-evidence-2026-10-06/actual-role-simulation.json).

## Observability and protected domains

Command/Read platform logs and invocation metrics: observed. Four new alarms verified. Existing API metrics configuration unchanged; no logging privilege expansion. Detailed per-route CloudWatch metrics are not enabled in the pinned stage (alternative evidence acceptance: USER APPROVED); route-level acceptance is recorded through exact route/status/request IDs and API aggregate Count/4xx/5xx metrics. This is not a claim that detailed per-route metrics are enabled.

Legacy sources zero in two complete consistent passes; logos zero; PITR/deletion protection enabled; four exact backups AVAILABLE. Final source check PASS. [Source recovery guard](team-hub-2b3-direct-legacy-recovery-protection.md) remains active: incidental Legacy deployment can reset out-of-band protections and is prohibited. Legacy 2621 resources / directive 167; 62 protected identities, templates and five Lambda hashes unchanged. No Legacy deployment. Tournament UPDATE_COMPLETE, eleven resources, API msipnwy39j unchanged. Production untouched.

## Validation and disposition

Existing 2B4 suite rerun: 23/23 passed. Migration ledger 2621 rows reconciled, zero migrated/retired, 191 unresolved shared retained. Prior broad regression limitation remains documented in [2B4 readiness](team-hub-2b4-mutation-parity-readiness.md); no Legacy source/test changed. No commit/push requested. Six direct AWS mutations: security create/execute, ZIP/template publish, product create/execute. Service-managed resource operations are separate. Data written 0; frontend cutover false; verification never enabled.

Current domain Team Hub; phase 2B4A; AWS changes 6; Legacy/production changes 0; ledger ownership/migration/retirement unchanged. Next gate TEAM HUB 2B4B — TEMPORARY SYNTHETIC MUTATION VERIFICATION. 2B4B requires separate authorization; do not enable verification.

TEAM HUB 2B4A DEPLOYED DARK — READY FOR SYNTHETIC VERIFICATION REVIEW
