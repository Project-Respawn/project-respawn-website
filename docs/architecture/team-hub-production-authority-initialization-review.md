> Subsequent authorized execution: [actual C1 result](team-hub-production-c1-result.md). The preparation gap below was resolved by the independently pinned package; authority is now LEGACY_WRITER 1/1. Authenticated dark acceptance remains pending.

# Production Team Hub authority initialization review

24 October 2026. Repository/evidence review only; no fresh AWS inspection or mutation was performed for this review.

## Result

Accepted dark infrastructure remains the prerequisite evidence, not authority-bootstrap authorization. The [actual deployment result](team-hub-production-stage-tagging-recovery-result.md) records 8 security and 41 product resources, healthy functions, empty target tables and an absent production authority record. The 64 hashes in its evidence manifest were verified locally; nine focused production/runtime-client tests passed. These checks do not refresh live AWS state or establish successful production authenticated dark-route acceptance.

## Exact proposed record

The historical production proposal is at `.codex-worktrees/team-hub-production-preparation/docs/architecture/production-domain-deployment-evidence-2026-10-20/authority-initialization.PROPOSED.request.json`.

- Table: `ProjectRespawn-TeamHub-Production-Journal`.
- Key: `PK=CONTROL#AUTHORITY`, `SK=STATE`.
- Schema: `team-hub-authority.v1`.
- Initial mode: `LEGACY_WRITER`; epoch and version: `1`.
- Required audit fields: `changedAt`, `changedBy`, `gateDigest`.
- Conditional expression: `attribute_not_exists(PK) AND attribute_not_exists(SK)`.

The proposal contains preparation metadata dated 20 October. It is not an execution receipt. Its gateDigest and metadata provenance must be checked and explicitly bound to the final bootstrap candidate; do not silently replace metadata or represent its preparation timestamp as execution time. The accepted production runtime source closure references the Production Journal. Main-tree historical Ntgre authority helpers are not production deployment artifacts.

## Remaining execution-package requirements

Before requesting execution approval, independently pin a production-specific conditional request, fixed workflow, service-only trust, temporary executor policy/template, manifest and cleanup procedure. Verify exact Journal/authority-partition access, fixed sort key and item values, no workflow-input substitution, duplicate protection, a bounded reviewed window, custody and effective permissions. Partition IAM restrictions alone do not enforce the sort key or conditional expression; the fixed workflow and restricted invocation/configuration custody must enforce those requirements.

No runtime or permanent deployment IAM expansion is justified by this review. In particular, do not add bootstrap access to the almost-full existing deployment execution boundary. Any security-owner provisioning path must itself be reviewed, rather than assuming RavenTest can create the temporary executor.

Fresh live gates must verify operator/account/region, actual installed policies, authority absence, empty business state, source/recovery/Core/Cognito/Master/protected baselines and temporary-name collisions. Validate IAM positives/negatives and Access Analyzer for the new executor; prior deployment-policy findings are not a blanket exception for this candidate.

After separately authorized conditional creation, require strongly consistent complete record verification, authenticated authority HTTP 200 at LEGACY_WRITER 1/1, all **18** current business routes denied, no business records created, monitoring evidence and verified temporary-resource cleanup. Never infer success from infrastructure completion. On ambiguous execution, preserve evidence and read state; do not retry blindly, update/delete the record or automatically undo successful initialization.

Actual isolated cursor decryption, nonempty migration, source fences, authority transfer and frontend/Master publication remain separate gates. Historical 16-route acceptance plans predate the two permission routes and must not be used as complete current coverage.

**Review disposition: dark infrastructure evidence verified; production authority initialization is not yet execution-ready because its production-specific fixed-executor package and security certification remain unpinned.**
