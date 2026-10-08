# PROJECT RESPAWN TEAM HUB 2B3 — FINAL STATEFUL PREPARATION GATE

2026-10-05. **Ready for separate AWS write gates, not deployment or cutover.** LegacyPlatform remains authoritative. M4 recovery acceptance is pending installation and live rehearsal. No AWS mutation occurred.

[Migration control](README-PHASE2-MIGRATION.md) · [empty-source contract](team-hub-2b3-empty-source-cutover.md) · [coverage](team-hub-2b3-writer-reader-coverage.md) · [rollback/schema](team-hub-2b3-rollback-contract.md) · [separate write proposals](team-hub-2b3-aws-write-proposal.md)

## Source and coverage

Team **0**, Membership **0**, Roster **0**, Champion **0**, logos **0** in [two complete consistent passes at 19:53Z](team-hub-2b3-evidence-2026-10-05/table-inventory.json) and [logo inventory](team-hub-2b3-evidence-2026-10-05/logo-inventory.json). Not a permanently empty or frozen snapshot.

Classification **EMPTY_AND_APPARENTLY_UNUSED** for 2026-09-28 20:00Z–2026-10-05 20:00Z. [Metrics](team-hub-2b3-final-evidence-2026-10-05/traffic.json): zero consumed write units; eight read units per table in the inventory hour. Enabled writers remain; data-event history is incomplete. No “never used” claim.

Writers: **13 active business, 2 possible, 8 privileged/manual or potentially administrative, 8 generated internal, 1 test-only, 1 condition-excluded grant; unknown 0**. Readers: **5 active application, 2 compatibility, plus inventoried privileged/generated capabilities; unknown 0**.

[Per-path inventory](team-hub-2b3-final-evidence-2026-10-05/coverage.json) binds IAM, resolver pipelines, Lambda roles, schedules and policies. Newly resolved paths include admin Lambda generated-model authority, S3 cleanup and table-provider lifecycle roles. Root/admin intervention remains an operational control; unknown=0 is a reviewed capability snapshot, not a promise of no future drift.

## Recovery and target

Legacy PITR **disabled**; deletion protection **disabled**; no table-scoped backups found; restore rehearsal **not performed**. Gate A proposes desired PITR/deletion protection true, destructive/GSI replacement false, Retain/Retain and four backups. Gate B defines exact isolated restore names, verification, IAM, cleanup and costs.

[Deployed provider review](team-hub-2b3-final-evidence-2026-10-05/provider-review.json) is hash-verified against installed code. An Update can disable protection set only out of band. Protected replacement throws; protected Delete retains the physical table. Managed desired settings plus Retain are required. Provider code is unchanged.

Schema **team-hub-state.v1** defines exact keys, sparse KEYS_ONLY BySubject/ByTeamStatus, revisions/epoch, slug uniqueness, role/roster guards, pool/assessment/private classes and closed settings. Journal has non-expiring authority, 24-hour idempotency and 365-day metadata-only audit. [Machine schema](team-hub-2b3-final-evidence-2026-10-05/target-schema.json).

Dark target is **two native DynamoDB tables**, each with PITR, deletion protection, Retain/Retain and default service encryption; no broad KMS dependency. Defer the former LogoBucket and LogoTransportPolicy; branding stays disabled. Existing eleven product declarations and preview runtime permissions remain unchanged. [Product proposal](team-hub-2b3-final-evidence-2026-10-05/dark-target.template.json) and [execution-policy proposal](team-hub-2b3-final-evidence-2026-10-05/dark-security.template.json) are local, not installed or AWS-generated change sets.

## Privacy and rollback

Player fields are separate from assessment. Assessment is active Manager/Coach-visible, never Player/public/admin-by-default. Private notes belong only to their authoring active Coach. Legacy “Private:” text is never auto-mapped.

Code rollback retaining target data authority is preferred. The [native reverse codec](../../scripts/team-hub-migration/native-state.mjs) handles new Team, Manager/Coach/Player memberships, roster/guards/substitutes, pool, approved assessment, settings and conditionally proven logo references **without an old source snapshot**. It validates IDs/relationships, rejects unmapped data and compares full records.

Coach-private notes are **NON_REVERSIBLE_DURING_ROLLBACK_WINDOW**; creation is disabled. Branding stays disabled. Native versions/epochs/audit/idempotency are archived, not silently discarded. State rollback requires dual fencing, complete export, reverse/reconcile, replay protection and only then authority/client switch. Live import/restore and compatibility replay guard remain future prerequisites.

## Modes and proposals

Mode A is the preferred plan given observed emptiness, **not currently eligible for live cutover**. Require fresh zero counts/logos and unknown=0 before fencing and after drain/freeze, plus all recovery/target/fence/rollback proofs. Any record/logo causes STOP MODE A and separately authorized Mode B copy-transform-reconcile/privacy review. No automatic copying or CDC.

[Separate proposals](team-hub-2b3-aws-write-proposal.md) and [exact write-set JSON](team-hub-2b3-final-evidence-2026-10-05/write-sets.json):

- A: four protection changes and four named backups.
- B: four isolated temporary restore tables, verification and scoped cleanup.
- C: two dark tables; modify existing execution role/boundary only. No new role, provider, log group, route or Lambda.
- D: zero migration IAM in Mode A; existing verifier sufficient. Mode B requires fresh identity/time authorization.
- E: Journal control row, atomic guards, four source table policies, exact-prefix logo deny, maintenance freeze and negative tests. Designed, not installed.

## Accounting and ledger

Legacy **2,621**, Team attribution **192**, FunctionDirective **167**. Team current **11 product +5 security**. Including Tournament's 11, tracked baseline **2,648**; dark +2 and simultaneous restore +4 gives **2,654 scoped declarations/tables at peak**. Four backup artifacts and one control row counted separately. Full physical account peak **not measured**. [Accounting](team-hub-2b3-final-evidence-2026-10-05/resource-accounting.json).

Assigned **2,430**, unresolved shared **191**, ownership changes **0**. Evidence added; four MIGRATION_PREP table statuses retained. No migrated/cutover/retired status, no retirement, no savings. [Ledger update](team-hub-2b3-final-evidence-2026-10-05/ledger-update.json).

## Validation and limits

[Validation receipt](team-hub-2b3-final-evidence-2026-10-05/validation.json) records current regression/native/recovery/fence/IAM/ledger tests, TypeScript/build, accepted source preservation, links and secret scan.

Current suites: **487 passed**, including the original 324 regressions. TypeScript/build and accepted Team/Tournament verifiers pass. Secret scan: **87 prospective files, zero findings**. The five current deliverables have **57 valid local links**; migration-control and ledger validation also pass.

An additional historical deployment-v2 suite has one original-input hash failure on the **already approved test-only checkpoint delta**; its other five tests pass. [Approved delta](team-hub-accepted-checkpoint/source-deltas.json) and current accepted-candidate verification show no new runtime/source substitution. That machine-specific pre-acceptance runner is not current gate authority and was not changed to hide the failure.

No commit/push requested or performed. Prior uncommitted M4 work preserved. Provider ZIPs/dependencies stay in ignored .tmp; no credentials, tokens, customer rows or browser sessions added. Build warnings include the existing missing /css/styles.css reference and large bundle warning.

AWS changes **0**; Team data writes **0**; production changes **0**. No protection applied, target created, restore performed, fence installed, writer enabled or client switched. Next: separate Gate A preparation/inspection authorization, not bundled execution.

**TEAM HUB STATEFUL PREPARATION READY FOR SEPARATE AWS WRITE GATES**
