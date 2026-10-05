# Phase 2 retention review

[START HERE](../architecture/README-PHASE2-MIGRATION.md) · [Full inventory](../architecture/phase2-document-inventory.json)

No historical source/evidence was deleted or moved. 738 architecture links make a mass path migration unnecessary churn. Existing ignore rules exclude credentials, .env files, dependencies, worktrees and deployment caches. Non-secret AWS resource identities and historical local-path strings are provenance, not credentials; local executables/caches themselves are not added.

Keep regression tests, synthetic fixtures, resource accounting, accepted manifests, exact-byte receipts, current contracts and final reports. Old security candidates remain historical, never the selected live policy.

## Proposed deletion review queue (not authorized)

The machine inventory's DUPLICATE entries identify byte-identical candidate outputs and their identicalTo source. TEMPORARY_DIAGNOSTIC identifies investigation records. These are a review queue only: no item is currently approved for deletion because separate runs/reports may depend on its path and provenance. Recheck inbound links, receipt hashes and audit value before any later deletion. No test is removed merely because it has passed.
