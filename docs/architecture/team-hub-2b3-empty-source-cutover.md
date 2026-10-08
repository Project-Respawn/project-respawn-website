# Team Hub 2B3 — empty-source cutover contract

2026-10-05. **Preparation only. No AWS writes, target creation, fence installation or client cutover authorized.** LegacyPlatform remains authoritative. This contract supersedes the four-resource/bulk-migration default in the initial M4 design; the initial evidence remains historical.

## Evidence and eligibility

The [two exact consistent count passes](team-hub-2b3-evidence-2026-10-05/table-inventory.json) observed Team, Membership, Roster and Champion counts of 0 each at 19:53Z. [Logo inventory](team-hub-2b3-evidence-2026-10-05/logo-inventory.json) observed zero objects, versions, delete markers, references and orphan candidates. These are observations, not a locked snapshot or a current cutover authorization.

[Capacity metrics](team-hub-2b3-final-evidence-2026-10-05/traffic.json), 2026-09-28 20:00Z through 2026-10-05 20:00Z, contain 168 hourly points per metric per table. Consumed writes sum to zero on all four; consumed reads sum to eight per table in the inventory hour. Classification: **EMPTY_AND_APPARENTLY_UNUSED in this evidence window**. Thirteen business writer paths remain enabled. Metrics are not operation-level audit logs and cannot prove historical non-use. [CloudTrail coverage](team-hub-2b3-final-evidence-2026-10-05/cloudtrail-coverage.json) does not provide a complete data-event history; the observed organization trail has a different home region and was not queried outside this task's region.

## Mode A: empty source

No bulk copy, CDC service, transform execution, migration writer role or Team logo bucket. Use the existing authorized verifier for exact counts and metadata. Create only the two dark DynamoDB tables proposed in [the write proposal](team-hub-2b3-aws-write-proposal.md). Branding and Coach-private note creation remain disabled during the state-authority rollback window.

Immediately before fencing, independently verify:

1. Account 058264289478, eu-north-1, exact Ntgre stack/table/pool identities; production untouched.
2. Paginated strongly consistent COUNT scans: all four tables exactly zero; complete logo object/version listings zero. Metadata ItemCount is insufficient. Capture timestamps, consumed capacity, pagination completion and errors, never customer payloads in Git.
3. Repeat [writer/reader coverage](team-hub-2b3-writer-reader-coverage.md); no unclassified principal/path, IAM/resolver/policy/schedule drift, new scheduled consumer or unreviewed deployment.
4. Four Legacy protections and retained backups verified; actual restore rehearsal passed. Two target tables protected, empty of business rows and runtime writes disabled. A control row in Journal is expected and excluded explicitly from **business** emptiness; audit/idempotency/business rows must be zero.
5. Legacy is still sole authority. Server fence, rollback rehearsal, compatibility rejection and client artifacts have passed their separately authorized gates. Verify control epoch/version and all-principal denies, not a frontend flag.
6. Evidence must be collected within 60 seconds of the transition. If the scans take longer, maintain the freeze and repeat a complete bounded verification; never truncate to meet the budget.

Then transition LEGACY_WRITER → FROZEN using the [fence protocol](team-hub-2b3-aws-write-proposal.md#e-writer-fence). Deny source writes, stop new business calls, and drain at least the maximum deployed writer timeout (currently 900 seconds for relevant shared/cleanup functions) plus outstanding upload validity (120 seconds), including retries. Confirm no in-flight invocation can commit. Recount all four tables and relist logos **after** the deny is effective and drain is complete. Refresh evidence immediately before enabling target authority.

If still zero and all gates pass: increment authority epoch, set TARGET_WRITER, enable only the target writer, switch clients, run role/denial/concurrency/idempotency tests and inspect logs/metrics. Legacy source denies remain. A successful target write must atomically check the authoritative control row and commit business state, audit and idempotency. No cutover is performed by the offline gate helper.

## Mode B: nonempty source

**Any record or logo before or after freeze stops Mode A.** Keep the safe authority/fence state; do not automatically enable target writes. Obtain a new copy-transform-reconcile authorization using [the initial migration plan](team-hub-2b3-migration-plan.md), exact fresh data inventory, privacy review, approved temporary migration identity and fresh recovery evidence. Legacy text containing `Private:` is quarantined for explicit classification, never mapped into team-visible assessment by a heuristic. CDC is not presumed necessary: first consider a bounded frozen copy. Any CDC proposal needs its own demonstrated need and accounting.

## Client/compatibility behavior

Future Team Hub routes, `/home` shortcuts and Admin Team UI select the Team owner endpoint through the domain endpoint contract. They continue using shared Ntgre Cognito issuer/subject identity. No login pool or `amplify_outputs.json` change is part of this design.

Before cutover, `readTeamHub` and `mutateTeamHub` use Legacy. During FROZEN, business writes return explicit maintenance/409 or 503; reads may serve labelled read-only Legacy state while authority remains frozen. After TARGET_WRITER, old custom operations return an explicit `TEAM_HUB_DOMAIN_MOVED` response, with a supported client upgrade path. Generated model requests must be denied for business clients. There is no silent fallback to old writes or stale reads. Forwarding is an optional later reviewed adapter, not a hidden dual-write path. Admin capability still does not confer Manager/Coach membership.

## Offline validation

[native-state.mjs](../../scripts/team-hub-migration/native-state.mjs) implements the fail-closed empty gate and native reverse codec. It requires current observations, complete coverage, recovery, drain and rollback proofs. [Tests](../../scripts/team-hub-migration/native-state.test.mjs) cover each individual table becoming nonempty, a new logo, stale/future observations, unknown consumers and missing safety proofs. Actual protection/fence installation and runtime adapter tests remain prerequisites to a later cutover.
