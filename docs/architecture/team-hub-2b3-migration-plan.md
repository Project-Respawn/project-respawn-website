# Team Hub M4 migration, reconciliation and authority plan

[START HERE](README-PHASE2-MIGRATION.md) · [inventory](team-hub-2b3-state-inventory.md) · [recovery](team-hub-2b3-recovery-plan.md) · [dark target](team-hub-2b3-dark-target-readiness.md)

## Stage record

Domain Team Hub; environment Ntgre; account 058264289478; eu-north-1. Entry: M3 read proof accepted and this task authorizes scoped AWS reads plus offline preparation. Current authority: LegacyPlatform. Owner/custodian approval for privacy, audit retention and cutover is still required. Allowed: inventories, offline transforms/tests and proposals. Prohibited: backups/protection changes, provisioning, copying records/logos, mutation routes, frontend cutover, other-domain changes and production. AWS gate: **no writes in this task**. Rollback of this work is repository-only; preserve accepted Release 1 artifacts. Exit: reviewable inventory and deterministic tools with explicit gaps; M4 completion is not claimed until recovery and writer coverage are proven.

## Target schema and access patterns

Retain two native tables. Operational PK/SK layout: TEAM/META, SLUG/TEAM reservation, MEMBER by subject, STARTER by role, STARTER_PLAYER guard by membership ID, SUB by membership+role, POOL/ASSESSMENT by membership+champion, and archived inactive roster entries. Sparse `BySubject(SubjectPK,SubjectSK)` and `ByTeamStatus(StatusPK,StatusSK)` use KEYS_ONLY projection; fetch/revalidate the base items before authorization. Journal separates audit items from request idempotency; only approved idempotency/migration checkpoint items receive `expiresAt`. Audit retention requires owner approval and must not inherit request TTL.

Evidence supports the two-table shape, not a measured production capacity guarantee: actual source volume is zero; synthetic fixtures exercise relationships, role/status/revision preservation and key expansion. Preserve a 50-member domain bound and the current conservative 25-action transaction budget; benchmark skew/hot partitions and real maximum item sizes before broadening. Slug reservation must be conditional in the same transaction. Coalesce an item's revision/epoch condition with its update, and atomically include audit/idempotency. Sparse GSIs are listing aids, not authoritative grants. No speculative index or per-feature root is added.

The M4 serialization is versioned `team-hub-migration.v1`, not an installed runtime adapter. Existing 2B1 runtime contracts simplify assessment text and omit durable administrative provenance, inactive roster archival and some settings fields. M5 must explicitly reconcile those fields with the M4 persistence schema before mutations are enabled. No reason to add a third business table was found; schema/adapter integration remains a blocker. Metadata timestamps, original revisions, revocation fields and settings/asset provenance remain in a separately protected recovery artifact for exact pre-write reverse reconstruction. That artifact is never public DTO data or Git evidence.

## Privacy and deterministic transform

[Tooling](../../scripts/team-hub-migration/README.md) has no AWS writing adapter. Forward transform accepts four normalized source arrays, validates identities/relations/statuses/revisions/roster guards and preserves source IDs. It produces deterministic keyed operational records plus source/output digests, per-Team anonymized counts and a restart checkpoint bound to version/source/output hashes. Reordering input does not change output. Repeated transformation is idempotent. Unknown fields, duplicates, missing subjects, dangling/foreign memberships, invalid values and ambiguous privacy fail closed; rejected batches emit no target rows.

Player fields stay in PLAYER_POOL; Coach fields are separate COACH_ASSESSMENT records with author/time provenance. Existing Coach text has no proven private visibility. Text containing `Private:` is rejected for manual owner review, never reclassified automatically. Nonempty Coach assessments carry a visibility-approval warning and must remain dark until an owner approves field-by-field Manager/Team visibility. Coach-private notes use a separately restricted item class when explicitly supplied by an approved mapping; no legacy private-note item is inferred. Projection tests show no Coach/private/recovery fields in Player or Manager DTOs. These tests are field-isolation checks, not installed authentication or endpoint acceptance.

Canonical reconciliation compares complete transformed records (keys, IDs, roles, statuses, revisions, relationships, roster, settings, logo association and assessment provenance), not counts alone. Git output contains only aggregates/digests. Empty live input produced zero records, zero outputs, zero rejects and zero warnings. Synthetic fixtures cover FREE/PRO, Manager/Coach/Players, inactive/revoked memberships, starter/substitute/guards, pools, assessments, logos, revisions, privacy ambiguity and malformed relationships.

Restart currently reruns an immutable normalized source artifact and verifies its content-addressed checkpoint. It is not a live scan cursor store or durable copy engine. Any later real copy requires separately authorized encrypted source/recovery artifacts, conditional target writes, completed-item checkpoint durability, crash/replay fault injection and final reconciliation. Raw source rows must never be written under repository paths.

## Reverse and rollback limits

Offline reverse exactly reconstructs the unchanged source snapshot from its protected recovery artifact only after target reconciliation passes. It covers Team, membership, roster, champion fields, assessments, settings, original revisions and logo references. Any post-transform target mutation/new field fails closed. New private notes, generated audit/idempotency history, new-only settings or memberships and target logo keys have no accepted reverse-write mapping yet.

Therefore: before target writes, abort keeps Legacy authoritative and retains dark resources; no deletion is needed. After target business writes, code rollback with the new compatible data authority is preferred. Returning authority to Legacy requires a separately implemented delta/reverse mapping, target fence, exact acknowledged-write reconciliation and rehearsal. Disable unrepresentable features throughout any rollback window; do not silently flatten private notes back into legacy recommendation text. This task does not prove business-write rollback RTO.

## Migration identity proposal

[Identity/boundary proposal](team-hub-2b3-evidence-2026-10-05/migration-identity-proposal.json): separate temporary role, exact source table reads, exact target table writes, source-prefix reads and destination-prefix AES256 writes. No Cognito, foreign tables/domains, business KMS, IAM or CloudFormation administration. The same scoped policy acts as boundary and identity policy. Trust only the existing named operator; illustrative four-hour window must be repinned at approval, requested STS sessions 900 seconds, role maximum 3600. Data-event audit destination/coverage, removal owner and expiry enforcement must be reviewed before creation. No role or session was created.

## Server-side writer fence — design and model only

Use monotonically increasing authority epoch with states LEGACY_WRITER → FROZEN → TARGET_WRITER. Missing/stale/unknown state fails closed. Reverse authority transition also passes FROZEN. Epoch checks must be enforced at commit, not merely handler entry. The pure [fence model](../../scripts/team-hub-migration/fence.mjs) tests stale epochs, unknown writers, in-flight work and prohibited direct transitions; it is not installed protection.

Concrete enforcement proposal:

1. Route every `mutateTeamHub` handler/compatibility command through the same authority check and coalesce a transactional fence condition with source writes. Generated nontransactional AppSync writes cannot rely on this application check alone.
2. At freeze, install reviewed explicit data-write denies on the exact four table ARNs for every old generated/direct principal, including privileged scripts/operator sessions except the separately bounded migration custodian. Resolve the unknown principal class before claiming coverage. Preserve other-domain permissions.
3. Deny new logo upload intents and source-prefix PutObject/DeleteObject at the server/IAM layer. Drain or expire existing presigned requests; a client flag cannot invalidate them.
4. Stop/drain shared-handler Team operations and direct writers without stopping unrelated shared-Lambda business routes. Check in-flight counters, transaction outcomes and audit watermarks; propagation delays mean policy installation alone is not drain proof.
5. Final source scan/reconcile only after fence efficacy tests from each role/path. New runtime mutations remain denied until the epoch/authority switch. Any forwarder must preserve original end-user authorization and cannot bypass the fence.

No new fence row, permission deny, handler code or compatibility route was installed. Unknown external writers and lack of an exercised all-path fence block cutover.

## Proposed cutover rehearsal sequence and abort conditions

| Step | Action | Abort condition |
|---:|---|---|
| 1 | Verify backups and restore proof | Missing/failed backup, untested restore or stale scope |
| 2 | Verify target empty/dark, schema and permissions | User runtime access or unexpected target rows/resources |
| 3 | Initial authorized copy | Unknown/rejected source row, token/key mismatch, target conflict |
| 4 | Canonical reconciliation | Any unexplained count/key/privacy/digest difference |
| 5 | Capture/replay deltas if writers remain | Missing capture, expired stream window, non-atomic aggregates; otherwise restart under freeze |
| 6 | Announce approved maintenance window | No owner/operator/rollback coverage |
| 7 | Freeze every Legacy writer and logo upload path | Any unknown/bypass or deny test failure |
| 8 | Drain requests and verify watermark | Outstanding/ambiguous acknowledged writes |
| 9 | Final exact count/hash/relationship reconciliation | Any mismatch or inability to establish a fenced snapshot |
| 10 | Enable target writer under new epoch | Old writer still effective, missing parity/recovery proof |
| 11 | Switch versioned Team client/endpoint only | Other-domain/global Amplify config change or stale fallback |
| 12 | Verify all personas, revoked/outsider negatives | Privacy/auth/integrity regression |
| 13 | Monitor request/write/error/audit signals | Authority violation, unexplained drift or absent observability |
| 14 | Retain Legacy state for rollback window | Premature delete/cleanup request; stop until separate retirement approval |

At any abort before target writes: retain Legacy authority, dark target and evidence. After target writes: fence first, preserve acknowledged state, prefer forward repair; never repoint to stale Legacy data. Proposed RPO/maintenance/RTO/observation and their unproven status are in the recovery plan.

**Next gate:** close external writer/reader audit scope, provider protection/recovery review, schema/visibility/retention decisions and measured rehearsal design; then request an exact protection/dark-target AWS-write review. No state-copy or cutover authorization is implied.
