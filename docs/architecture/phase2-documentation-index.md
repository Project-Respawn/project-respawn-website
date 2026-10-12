# Phase 2 documentation index

## Current navigation — 12 October 2026

The [sole migration entrypoint](README-PHASE2-MIGRATION.md) selects current gates. Standards: [M0–M8 worksheet](domain-migration-template.md), [architecture](project-respawn-domain-architecture-standard.md), [deployment acceptance/security](project-respawn-aws-deployment-acceptance-standard.md), [reusable checks](migration-tooling.md) and [checklist](new-domain-checklist.md).

Current status: [status JSON](domain-migration-status.json), [Team Hub acceptance](team-hub-2b6-acceptance.md), [runbook](team-hub-2b6-cutover-runbook.md), [accepted recovery](team-hub-2b6-describekey-recovery-result.md), [Core acceptance](core-release1-acceptance.md), [Tournament Release 1](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md). Team Hub isolated AWS transaction/cursor proofs and cutover remain pending; Tournament Release 2/restore remains pending.

Accepted recovery evidence: [machine receipt](team-hub-describekey-execution-evidence-2026-10-12/accepted.json), [configurations/drift](team-hub-describekey-execution-evidence-2026-10-12/configuration.json), [CloudTrail](team-hub-describekey-execution-evidence-2026-10-12/execution-cloudtrail.json), [cleanup](team-hub-describekey-execution-evidence-2026-10-12/cleanup.json). Exact candidate manifests retain their bytes. Generated templates intentionally retained as evidence are distinct from excluded deployment caches.

Historical failures/drafts: [archived control chronology](phase2-migration-control-history-2026-10-12.md), [DescribeKey failure](team-hub-2b6-window-recovery-result.md), [throttling failure](team-hub-2b6-final-recovery-result.md) and earlier reports remain provenance, never current execution authority. Consumed revisions/windows and diagnostic policies must not be replayed.

[Corrected archive navigation](phase2-archive-navigation.md) repairs access to relative links in archived copies while preserving their exact bytes. The [origin/hash register](phase2-archive-link-origins.json) records their original context for validation. No history or unresolved ownership rows were deleted.

Navigation identity permits existing Git CRLF/LF checkout conversion through an explicitly recorded normalized-text hash. This applies only to archived prose link resolution; approved candidate, code and security hashes remain exact byte checks.

[Historical local-only evidence register](phase2-local-evidence-retention.md) records 196 references to 88 log/diagnostic/cache paths intentionally excluded by existing repository policy. These are explicitly unavailable on a clean clone, not accepted as portable evidence. The checker reports them separately and verifies their tracked navigation; no current recovery pin is exempted.

## Historical inventory below

The following counts and domain pointers describe the earlier inventory snapshot; current authority is the navigation above and status JSON.

[Required START HERE](README-PHASE2-MIGRATION.md) · [Machine inventory](phase2-document-inventory.json) · [Retention review](../maintenance/phase2-document-retention.md)

820 existing Markdown references target 612 architecture paths. No paths were moved, preserving links and byte-pinned evidence. Status here separates current authority from historical instructions.

## Current required reading

- [Migration control](README-PHASE2-MIGRATION.md), [status](domain-migration-status.json), [ownership summary](legacy-resource-ownership-summary.md), [template](domain-migration-template.md).
- [Architecture standard](project-respawn-domain-architecture-standard.md), [new-domain checklist](new-domain-checklist.md), [deployment callers](independent-domain-deployment-callers.md).

## Domain current documents

- [Team Hub M4 state inventory](team-hub-2b3-state-inventory.md), [migration plan](team-hub-2b3-migration-plan.md), [recovery proposal](team-hub-2b3-recovery-plan.md), [final preparation gate](team-hub-2b3-dark-target-readiness.md).
- [Team Hub accepted read proof](team-hub-2b2-read-path-release1-2026-10-05.md); its accepted-state evidence selects the exact-ID steady-state policy.
- Tournament: config/domains/tournaments/domain-endpoints.Ntgre.json and infrastructure/security/tournaments-Ntgre-accepted-release1; run the offline accepted-state verifier. Release 2/restore remains pending.
- Other domains: dated classification/design informs ownership; current phase comes from the status JSON.

## Historical deployment evidence

Phase 1, Phase 2A and Phase 2B evidence directories remain in place. Repeated simulation results are retained as provenance. The machine inventory lists every scoped path and retention classification.

## Superseded investigations

Dated roadmap/classification statuses, failed preflights, temporary first-create policies and diagnostic v8/v9 policies are not current execution authority. Retaining them never authorizes reinstalling them.

| Classification | Files |
|---|---:|
| AUTHORITATIVE_CURRENT | 13 |
| DOMAIN_CURRENT | 144 |
| HISTORICAL_EVIDENCE | 1567 |
| SUPERSEDED | 9 |
| DUPLICATE | 486 |
| TEMPORARY_DIAGNOSTIC | 30 |
| UNKNOWN | 19 |
