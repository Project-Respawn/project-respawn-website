# Team Hub 2B6 — Gate B sequencing and activation review

7 October 2026. Ntgre only: account 058264289478, eu-north-1. Custodian: Ntgre (user). Decision requested: prepare a dormant Legacy writer fence; do not enter FROZEN or TARGET_WRITER.

**DESIGN READY; Gate B live acceptance remains pending.** The dormant form is a pinned, detached activation bundle. No policy, gateway, authority row, IAM grant or frontend configuration was installed or activated. Existing Legacy permissions remain unchanged. No live business-write probe was made to claim this; preservation is established by unchanged policies/configuration and zero changes during preparation.

## Dormancy and installation safety

[Dormant bundle](team-hub-2b6-evidence-2026-10-07/gate-b/dormant-bundle.json) contains the exact previously reviewed four FROZEN table policies, narrowly scoped logo-prefix policy, two gateway configurations, original policies and their captured revisions. The bundle records the original candidate SHA-256 and refreshed coverage hashes. It has an empty preparation AWS request list and `installNow:false`.

This is **artifact dormancy**, not an installed conditional deny. The enforcement document remains unconditional: installation is activation. Preparing and retaining it locally is safe; attaching it while Legacy must remain writable is not. Reattaching unchanged current policies would add no enforcement and is unnecessary. No tag switch, future date, fabricated condition key, principal exception, extra Allow, unattached managed-policy placeholder or permanent recovery bypass was introduced. Such alternatives add control paths and do not provide an atomic cross-service switch.

The final [read-only preservation receipt](team-hub-2b6-evidence-2026-10-07/gate-b/current-permissions-preserved.json) matches all four source policies, the shared logo policy and both gateway configurations to the reviewed original content. [Protected runtime/template preservation](team-hub-2b6-evidence-2026-10-07/preservation.json) also passed. No live write was issued to manufacture a positive control.

The existing `LEGACY_WRITER` policies and gateway implementations stay exactly as they are. Product/security/runtime/frontend pins are preserved; resource delta is zero. The active table deny covers seven write IAM actions on four exact source ARNs. Transactions use the underlying PutItem/UpdateItem/DeleteItem permissions; their authorization is not proved by inventing a `dynamodb:TransactWriteItems` IAM action. [AWS transaction authorization](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis-iam.html).

The logo deny is limited to `team-logos/*` within the existing shared bucket. Existing SSL and cleanup-provider statements remain preserved. No whole-bucket freeze, unrelated-domain policy change or Legacy CloudFormation deployment is proposed.

## Coverage retained

[Full writer/proof matrix](team-hub-2b6-evidence-2026-10-07/gate-b/writer-proof-matrix.json) retains every record, with source hashes, principal trust/boundary information, action summaries, resolver-to-function mappings and proof requirements. Fresh read-only inventory and comparison passed:

| Inventory | Result / enforcement path |
|---|---|
| 19 IAM principals | All retained, including service-only, read-only and privileged candidates; no exclusions based solely on role name |
| 30 business resolvers | 17 reads and 13 mutations; 12 generated create/update/delete operations plus `mutateTeamHub` |
| 131 functions | 94 NONE data-source stages, 36 DynamoDB stages across the four models, one shared Lambda stage |
| Generated-model writers | Underlying table deny remains necessary even when gateway maintenance is active |
| Shared Lambda/direct adapter | Underlying table/logo deny covers writes that bypass the gateway |
| 12 subscription pipelines | Retained; they are propagation paths, not additional business-writer authorization |
| Four source streams | No Lambda mappings or stream policies in refreshed snapshot |
| Manual/privileged writers | Admin users, deployment/execution roles, root and cleanup-provider risks remain recorded |
| Unknown pipeline edges | 0; missing IAM policy documents: 0 |

The source classification still retains 13 active business paths (including branding/presigned upload), two possible paths and generated/manual paths. The 19-principal list is not a claim that all 19 have effective write permission. Conditions, boundaries, service trust and control-plane privileges matter. Core/Team/Tournament execution roles with no exact source grants remain reviewed candidates, not newly granted test identities.

Account administrators able to replace a resource policy can remove a fence. The design has no data-plane administrator exception, but cannot make policy administration immutable. Maintenance requires exclusive policy custody, suspension of competing deployments/manual changes and auditing of policy changes. Do not change trusts, grant write permissions or run CloudFormation just to manufacture a test session. Any inaccessible effective writer path remains an execution blocker until a supported actual-path test or reviewed no-path determination is available.

## Evaluation and isolated evidence

[AWS evaluation](team-hub-2b6-evidence-2026-10-07/gate-b/policy-evaluation.json): five resource-policy Analyzer validations passed without ERROR/SECURITY_WARNING; **120 per-action/resource simulation decisions matched expectations**, with no missing context. Checks cover unattached Allow controls, all four exact table denies, preserved reads, an unrelated table, deliberate omission of one table deny, transactional underlying actions, logo writes and the unrelated logo-prefix control.

The simulator inputs contain a scoped synthetic Allow solely to demonstrate that the added deny changes the decision. It was never attached. Simulation projects the unconditional deny to an identity policy by removing only `Principal`; the action/resource/deny fields remain identical. This is supported identity-policy evaluation, **not** a claim to simulate resource-policy enforcement on the 19 roles. AWS documents that resource-policy simulation for IAM roles is unsupported and simulated results can differ from live behavior. [SimulateCustomPolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html), [simulator limitations](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html).

[Earlier isolated live rehearsal](team-hub-2b5b-evidence-2026-10-07/fence-rehearsal.json) is retained by hash: initial administrative write allowed, then 12 denied attempts on a disposable table, subsequently deleted. It covers Put/Update/Delete/Batch/transaction/PartiQL insert for one administrator. It does **not** establish current source enforcement, actual generated AppSync/service-role denial, every principal or S3 denial. No new isolated AWS resource was created this turn.

[Offline results](team-hub-2b6-evidence-2026-10-07/gate-b/offline-preparation.json): 20 sequence/failure/rollback checks plus 117 candidate and 100 reverse-transform/reconciliation tests passed. The sequence model deliberately cannot activate AWS or enable target writes. An initial simulation receipt was incomplete because the harness expected flat results; per-resource reconciliation was corrected, and the complete 120-result receipt supersedes that retained diagnostic file.

## Ordered activation — only during separately authorized FROZEN maintenance

There is no atomic operation spanning four DynamoDB resource policies, a shared S3 policy, AppSync resolvers and the authority row. Use an ordered, fail-closed maintenance procedure; do not label partial installation as a completed freeze.

1. Obtain explicit FROZEN-window authorization, exact artifact approval and operator custody. Recheck account/region/source IDs, candidate hashes, writer coverage, protections, backups, source/target counts and logo state. Recheck background writers, TTL/replication/schedules and any changed deployment rights. Unknown paths stop execution. Keep target normal writes disabled and frontend Legacy.
2. Capture exact original policies, DynamoDB revisions, resolver configurations and the shared bucket policy hash immediately before changes. Verify rollback permissions without altering trust or adding grants. Establish exclusive control over deployments/policy changes; if unavailable, do not begin.
3. Close only the reviewed Team gateway entries to maintenance. This does not cover generated/direct/manual writers; continue to treat Legacy as potentially writing until all underlying fences propagate and old requests drain.
4. Attach the four exact table FROZEN policies one at a time, using the freshly read `ExpectedRevisionId`, or `NO_POLICY` only when absence was freshly verified. Record each returned revision and verify full policy/hash read-back. A mismatch stops; never overwrite a changed policy with a guessed revision.
5. Merge/install only the reviewed logo-prefix deny into the freshly verified shared bucket policy, preserving every existing statement. Verify the two gateway configurations and complete bucket policy before/after. S3 policy/resolver updates have no equivalent multi-resource compare-and-swap here: exclusive custody and immediate hash checks are mandatory. Unexpected concurrent change stops the window.
6. Wait for propagation using bounded polling and actual-path tests, not a fixed sleep or a single successful read-back. DynamoDB policy application and read-back are eventually consistent. [PutResourcePolicy revision/consistency contract](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutResourcePolicy.html).
7. Collect the live proof matrix below. Conditionally set/check the target FROZEN row using exact prior mode/epoch/version as authorized, and prove target normal/stale/in-flight commands deny. A target label does not activate a source fence.
8. Drain prior Legacy requests using a freshly measured timeout/retry/presigned-request envelope; strongly reconcile source and target state after all fences are effective. Partial writes before completion are possible, so earlier empty scans cannot establish post-freeze emptiness. Any record invalidates Mode A and requires a reviewed Mode B plan; never delete it to regain Mode A.
9. Keep both writers stopped until live matrix, target denial, reconciliation and remaining gates pass. Only then present a separate TARGET_WRITER authorization gate. No source policy removal is part of target activation.

Every partial failure leaves target writes disabled and gateways in maintenance. Do not continue to TARGET to escape an installation problem. Either repair within the approved exact scope or execute the reviewed pre-target rollback with explicit operator authorization.

## Required live installed-fence proof

Gate B becomes fully accepted only after live receipts against **actual installed source policies** show:

- Valid authenticated gateway maintenance responses and all 12 generated model mutations, including identities that ordinarily reach the resolver/data source. An application authorization rejection, invalid payload or missing-key failure alone does not prove the fence; correlate the denial with the underlying policy/service path and request ID.
- Direct/manual/privileged writes through every effective entry-path class and each of the four table service roles, preserving all matrix rows. Test service-only roles through their actual service; do not broaden their trust to assume them. Root remains a privileged custody risk, not a request to obtain root credentials or claim a fabricated root test.
- Direct, batch, transactional and PartiQL behavior; logo/presigned upload and cleanup-provider paths; no unrelated-prefix behavior change. No permanent bypass or new test-only write Allow.
- Positive/negative controls that separate identity/validation denial from fence denial, plus exact read-back hashes/revisions and unchanged source state. Earlier simulation or disposable-table success never fills these live receipt fields.

Prepare operation-specific non-mutating failure guards in the window review: contradictory conditions for conditional Put/Update/Delete/transactions and generated mutations where supported; deletion of a freshly confirmed absent reserved probe key for unconditional batch deletes. If a condition fails rather than access being denied, the fence proof failed even though no data changed. Generated resolver conditions must be checked against the exact accepted schema/template.

Unconditional insert, presigned PUT or a handler with side effects may lack a guaranteed no-write guard. Do not run them against real business keys or pretend a malformed request proves enforcement. Exact payloads and a reserved non-business probe/cleanup plan require window approval before those paths can be credited; otherwise leave their matrix rows pending and do not activate TARGET. Any unexpected success stops the window, preserves evidence and triggers explicit reconciliation/cleanup review. Do not silently delete a resulting record.

## Rollback

**Before target activation/business writes:** keep target disabled and gateway maintenance closed. Verify source/target state and installed hashes against this window's journal. For each changed table, restore its exact prior policy using the current installed revision; when the original was absent, remove only the window-installed policy using its revision. Never blindly delete an unrelated or changed policy. [DeleteResourcePolicy](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteResourcePolicy.html).

Restore only this window's bucket/resolver changes under exclusive custody, verifying original full hashes and preserved unrelated statements. Wait for propagation and verify original behavior. Conditionally return target control to LEGACY_WRITER if it entered FROZEN; retain monotonic epoch/version, never erase/reinitialize the row. Restore gateways last. No new Allow is needed: rollback restores the original permission state. Drift, unavailable custody or incomplete restoration keeps maintenance active.

**After target activation or any target business write:** simple fence removal is prohibited. Keep both writers fenced; export state/journal, reverse-transform, restore and reconcile through the separately approved recovery plan before re-enabling Legacy. Preserve accepted dark rollback artifacts, audit/idempotency records and authority history. No source/target table deletion or Legacy retirement is part of rollback.

## Gates C–F may now prepare independently

[Preparation manifest](team-hub-2b6-evidence-2026-10-07/gate-b/independent-gates-preparation.json) pins existing artifacts without resynthesis or deployment.

| Gate | Completed safely now | Still required for acceptance |
|---|---|---|
| C | Candidate hashes/security reviewed; offline missing/malformed/stale authority, LEGACY/FROZEN denial and in-flight transaction tests pass | Exact change-set/security review, deployed actual-role proof, authorized control initialization; no control row created now |
| D | Existing monitoring candidate pinned; metric privacy/event classification checks pass | Artifact/log-delivery permission review, deployment and live signal/visibility proof; no notification delivery claimed |
| E | Accepted Core manifest and repaired frontend hashes retained; epoch/activation fail-closed tests pass; prior 24 build-isolation checks retained | Actual deployed epoch binding, fresh final browser receipt as needed; `reviewed:false` stays unchanged, no publication |
| F | 100 offline native-state/reverse-transform/reconciliation tests pass; prior isolated AWS rehearsal/rollback artifacts retained | Fresh final-candidate isolated live export/restore/in-flight proof and cleanup before final acceptance |

These remaining live/deployment items have their own approval/evidence gates; absence of installed source-fence proof no longer blocks unrelated offline preparation. No C–F gate is marked fully accepted by this report. Current authority stays LEGACY_WRITER, target epoch absent and normal target writes disabled. No production change, frontend activation, business transition or Legacy retirement occurred.

**GATE B DESIGN READY — LIVE FENCE PROOF RESERVED FOR CUTOVER**
