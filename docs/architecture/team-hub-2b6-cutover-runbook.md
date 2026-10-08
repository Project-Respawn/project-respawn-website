# Team Hub 2B6 cutover runbook

**Checkpoint / final execution review (8 October 2026):** accepted endpoint and read-only baselines preserved. Business transactional runtime is NOT deployed; its separately reviewed installation and all safe verification must finish BEFORE Legacy freeze. Source-fence installation/proof, TARGET authority transfer and frontend activation are distinct authorization gates. [Ordered plan, aborts and recovery](team-hub-2b6-checkpoint-cutover-readiness.md).

## Mandatory sequencing override

The [R1?R6 execution plan](team-hub-2b6-checkpoint-cutover-readiness.md#minimal-ordered-authorization-gates) supersedes older full-cutover ordering below. Install and verify the revised business runtime while LEGACY_WRITER remains active, before any gateway closure or source deny. The read-only authority endpoint is not transactional enforcement. Freeze/fence proof, target transfer and frontend publication each stop at a separate authorization gate. Old 44-resource templates are historical and cannot replace the accepted 42-resource endpoint baseline.

**Latest authority endpoint (8 October 2026): ACCEPTED LIVE ? READY FOR FINAL PRE-CUTOVER REVIEW.** Pinned security/product updates are UPDATE_COMPLETE; Team Hub 42+7. Authenticated GET /v1/authority returns the real LEGACY_WRITER epoch/version 1; dormant live browser binding passes, all 13 business routes remain denied. C2 runtime IAM and D1 monitoring preserved. No authority/frontend/fence/production change. [Deployment and live acceptance](team-hub-authority-endpoint-deployment-result.md). Gate B installed fence and Gate C business transactional epoch proof remain separate; earlier entries below are historical.


**Latest E/F result (8 October 2026): TEAM HUB E/F PREPARATION BLOCKED.** Dormant frontend passes all five personas (49 UI, 40 contract, 352 privacy and 24 isolation checks); isolated AWS rollback passes and all six temporary tables are removed. Live browser epoch binding remains blocked because accepted D1 exposes no authority-status route. A minimal read-only contract is prepared for separate review, not deployment. Real LEGACY_WRITER epoch/version 1, D1/C2 pins, Legacy frontend and protected domains remain unchanged. [E/F result and current A?F matrix](team-hub-2b6-gates-ef-result.md) ? [Authority-status proposal](team-hub-2b6-authority-status-contract-proposal.md). Earlier dated entries below are historical.


## Required next sequencing ? accepted authority endpoint

1. Preserve LEGACY_WRITER epoch/version 1; normal target writes and live frontend remain disabled.
2. Authority endpoint deployment and real LEGACY epoch binding are accepted; do not repeat the old deployment sequence. Preserve the installed route, invocation permission and read contract in all later business-runtime templates.
3. Review Gate C business runtime/server authorization and transactional epoch enforcement separately; status alone cannot authorize business writes. Recheck final frontend personas against that runtime before activation.
4. Gate B live fence proof requires separately authorized FROZEN maintenance. Existing isolated rollback evidence remains valid within its recorded scope; refresh recovery protections before the real window.
5. Final maintenance, authority transfer and frontend activation need separate authorization. No Legacy retirement is included.

See [team-hub-authority-endpoint-deployment-result.md](team-hub-authority-endpoint-deployment-result.md) for exact installed pins, rollback and live-evidence limits.

## Current authority checkpoint

C1 is complete: strongly read the existing LEGACY_WRITER epoch/version 1 control record. Do not rerun initialization, overwrite metadata or recreate the temporary executor. C2 is accepted. D1-after-C2 is installed and its bounded dark-runtime live monitoring scope is accepted. Preserve this new baseline; do not redeploy historical standalone D1 or old 44+7 monitoring proposals. Remaining business runtime, source-fence, frontend and rollback gates require separate review/authorization. C2 installed IAM proof is simulation against actual roles, not live transactional/business enforcement. Historical initialization instructions below are superseded.

## Artifacts and entry gate

Use [corrected candidate hashes](team-hub-2b6-evidence-2026-10-07/gate-d/candidate.json), complete product/security templates, accepted Core manifest, [fence proposals](team-hub-2b5b-evidence-2026-10-07/fence-candidates.json), [authority request compiler](../../scripts/team-hub-2b5b/authority-control.mjs), [frontend proposal](../../config/domains/team-hub/frontend-cutover.PROPOSAL.json), retained accepted dark rollback artifacts in security-review.json and the isolated rollback receipt. Never deploy `security-runtime-only.NOT-DEPLOYABLE.template.json` or historical offline 43+3 / 11+4 design receipts.

Full browser Gate A passed. Gate B's dormant design is ready as a pinned **unattached** activation bundle; actual installed all-path proof remains reserved for separately authorized FROZEN maintenance. Read the [Gate B sequencing and activation report](team-hub-2b6-gate-b-sequencing.md) and its exact proof matrix before any window. Attaching the reviewed deny is activation, so no source policy is installed during writable-LEGACY preparation. C–F offline preparation may proceed independently; none is fully accepted solely on offline results. The future frontend activation must bind the actual final epoch and accepted artifact; `reviewed:false` must not be changed during preparation. Corrected Option A monitoring requires exact artifact security/change-set review and explicit approval of access-log deferral.

Before any window, separately authorize and inspect the exact security/product changes, preservation of every stateful identity, zero replacements, rollback permissions and rollback-enabled execution. Candidate business product is 44 resources, security 7; corrected Option A monitoring remains 44+7 with no access-log group; historical 45-resource proposal is superseded. Deploying a missing-authority fail-closed runtime must not by itself transfer business authority. Actual-role negative/positive tests must pass before proceeding. Do not substitute current HEAD, another synthesis or a diagnostic policy for the reviewed artifacts.

## Historical full cutover sequence - subordinate to C1/C2/D1/D2 review above

Do not use the old 44+7 pin as a monitoring-only deployment. The linked sequencing plan defines the new separate execution gates.

### Full cutover steps only after separate authorization

1. Reconfirm caller/account/region, all accepted stack statuses and hashes, API IDs and resource counts. Stop for any drift, replacement or production selection.
2. Recheck all four exact source identities, PITR, deletion protection, AVAILABLE backups and tested restore compatibility. Create fresh backups only with explicit window authorization.
3. Strongly scan each source to exhaustion; require 0/0/0/0. Check all logo objects/versions/delete markers; require zero.
4. Strongly scan target state; require zero business rows, explain every retained audit/control row. Capture initial authority or initialize only LEGACY_WRITER using the conditional request, never overwrite an existing row.
5. Prove accepted Core environment/authorization/directory healthy for Admin and ordinary accounts. Reconfirm exact manifest and installed runtime permissions.
6. Refresh complete writer/reader coverage, stream/subscription/schedule edges, policy revisions and gateway configurations. Require unknown writers zero. Verify exact policy proposals, no permanent bypass, custodian availability and recovery artifacts.
7. Require all five browser personas, route/network isolation, branded-write denial and final frontend bundle/config pins accepted. Prepare the new frontend without publishing it. Confirm monitoring signals and responder visibility.
8. Only with explicit FROZEN-window authorization, establish exclusive policy/deployment custody and keep target normal writes disabled. Capture fresh original hashes/revisions. Close the two reviewed Team gateways, attach the four exact table FROZEN policies with current ExpectedRevisionId (NO_POLICY only for freshly confirmed absence), then install the reviewed logo-prefix deny while preserving the shared bucket policy. No cross-service atomic switch exists: record each step, poll propagation and compare full read-backs. S3/resolver changes require exclusive custody and before/after hash checks. Partial failure means stay in maintenance with target disabled; never claim the source frozen while some policies are pending. Set target control FROZEN only by exact prior mode/epoch/version as authorized. No Legacy CloudFormation deployment.
9. Complete the [live proof matrix and guarded-probe requirements](team-hub-2b6-gate-b-sequencing.md#required-live-installed-fence-proof): gateway, all 12 generated model mutations, direct table, service-role, privileged/manual, batch/transaction/PartiQL and logo paths. Record actual installed-fence receipts and distinguish policy denial from validation/identity/condition failure. Probes must not mutate business state on guard failure. An operation lacking a safe guard requires a separately reviewed reserved non-business probe/cleanup plan before testing; otherwise its proof stays pending. Do not broaden trust or grant access for a failing/inaccessible identity. Do not mark Gate B accepted or advance TARGET with missing rows.
10. Prove target normal commands deny while FROZEN, including a stale-epoch transaction. Drain all prior Legacy invocations; remeasure longest timeout/retry envelope. Earlier 17-minute estimate is provisional, not an automatic safe bound.
11. Recount all source/target business state strongly after the drain. Any unexpected record stops Mode A. Confirm logos zero and all fences unchanged.
12. Conditionally transfer FROZEN to TARGET_WRITER at exactly the next epoch/version, with window timestamp, custodian and reviewed gate digest. Read back strongly. Keep Legacy denied.
13. Bind the frontend activation to that epoch and reviewed bundle; publish only with explicit frontend cutover authorization. Never modify global Amplify outputs or identity configuration.
14. Run all persona read/authorization/denial checks through the actual website and deployed runtime. Confirm no Legacy Team calls, no unrelated domain initialization and branding disabled.
15. Perform the separately approved first real Team write once with an idempotency key. Verify state/version/audit, source still empty and no duplicate write.
16. Observe API/runtime/transaction/Core signals and account switching. Unexpected authorization result, Core failure, uncontrolled retries, unexpected writer, missing telemetry or inconsistent state aborts acceptance.
17. If rollback is needed, freeze target and preserve all state/journal/control evidence. Before target activation/business writes, keep gateways closed; verify source/target state and installed hashes, restore exact prior table policies using current revisions (revision-guarded deletion only if originally absent), restore only the window's bucket changes, verify propagation, conditionally return control to LEGACY_WRITER with monotonic epoch/version if needed, and restore gateways last. No new Allow or administrator exception. Concurrent drift stops rollback. Restore accepted dark runtime/frontend only after checking no business state appeared. After target activation or real writes, use the separately approved export/reverse-transform/restore/reconcile recovery procedure; never simply re-enable Legacy or discard target rows. See the [detailed rollback](team-hub-2b6-gate-b-sequencing.md#rollback).
18. Record final authority, hashes, counts, tests, monitoring and custodian sign-off. Leave Legacy protected and fenced. Retirement remains a separate gate; no resource is marked migrated/retired merely because the target exists.

## Monitoring and abort thresholds

Current infrastructure has API 5xx and Lambda errors/throttles alarms. Option A defers API access logs; native detailed metrics and existing structured Lambda logs are the selected approach, subject to corrected deployment review. Candidate runtime emits Core dependency failures, transaction conflicts, writer-not-authoritative, authorization failures and request counts without tokens/subjects/bodies. Record authority transitions as sanitized operator control receipts; no automatic transition metric publisher is installed.

Historical behavioral failure: the previous handler omitted inner response codes. The preserved Gate D correction fixes emission offline, but the current live execution review is blocked by runtime IAM expansion and unreachable probes with no authority record. The candidate must not be accepted on metric-mapper unit tests alone. Require end-to-end handler-event-counter tests and deployed correlated request/log/datapoint proof. Access-log creation is not covered by the existing prepared execution identity; log-delivery/resource-policy operations remain explicitly denied. A separate security design decision is required; do not remove these denies opportunistically.

Ntgre must confirm usable read access and signal visibility before the window, actively monitor API/Lambda/DynamoDB/Core/authorization/authority receipts during every phase, distinguish expected negative probes by request ID, and stop on missing evidence. Existing alarm action lists are empty: this is attended manual monitoring, not proven notification delivery. Unavailable responder or missing required signal blocks the window.

During acceptance, any unexpected 5xx, throttle, Core dependency failure, unexpected allowed/denied persona result, post-freeze Legacy success or reconciliation mismatch stops acceptance immediately. Expected negative-test 403/conflict events must be distinguished by request ID; do not require their counters to stay zero. Missing expected request/log evidence is a failure, not healthy silence. Continuous steady-state thresholds and notification routing require explicit acceptance; the user is not assumed to have received an alarm merely because an alarm exists.

Reserve at least 45–60 minutes once all preconditions pass, including the measured writer drain and persona checks. This is a planning allowance, not an outage guarantee. No window begins while a blocker remains or the custodian is unavailable.

