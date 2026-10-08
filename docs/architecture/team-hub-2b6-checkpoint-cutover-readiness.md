# Team Hub 2B6 — checkpoint and final cutover execution review

8 October 2026. Scope: Ntgre account 058264289478, eu-north-1 only. This is a source-control checkpoint and read-only review, not permission to deploy, freeze, transfer authority or publish the frontend. “Business runtime” below means the real Ntgre business handler, not a production-environment deployment.

## Accepted baseline and checkpoint scope

The accepted endpoint is deployed; the business runtime is not. Legacy remains writer; control is LEGACY_WRITER / epoch 1 / version 1. Legacy 2,621 resources, FunctionDirectiveStack 167; Team Hub 42+7; Core 8+5; Tournament 11. Fresh [inventory](team-hub-checkpoint-evidence-2026-10-08/after/inventory.json), [templates/physical identities](team-hub-checkpoint-evidence-2026-10-08/after/preservation.json), [authority](team-hub-checkpoint-evidence-2026-10-08/authority-after.json), [authenticated endpoint](team-hub-checkpoint-evidence-2026-10-08/endpoint.json), [runtime IAM](team-hub-checkpoint-evidence-2026-10-08/after/installed-iam.json) and [monitoring](team-hub-checkpoint-evidence-2026-10-08/security-monitoring-refresh.json) establish the current state.

Four exact Legacy source tables remain empty, PITR/deletion protected, backups AVAILABLE; logos empty. Target Operational is empty, Journal has only 15 audit rows plus the control row. No data migration, user/group change, resource change or authority transition was performed for this checkpoint. [Fence preservation](team-hub-checkpoint-evidence-2026-10-08/source-fence-preservation.json) checks the four policies, logo policy and two gateways against the reviewed originals.

Checkpoint branch is `phase2/team-hub-extraction`, intended remote `origin/phase2/team-hub-extraction`. Before work, both point to `4591f326de5c8ef6f09fc0b3a3d459d5d0d8580f`. Commit and remote SHA are verified after creating the checkpoint; do not embed a circular self-SHA in this file. No merge or force push is authorized.

Accepted source, independent infrastructure, exact installed template/policy evidence, manifests, regression tests, dormant frontend and approved offline business/fence/recovery designs are retained. Historical failures remain explicitly historical, never selected as the installed candidate. All current candidate hashes are unchanged. Cross-domain route edits are limited to lazy imports supporting accepted Team isolation, not new product implementations. The unreferenced Amplify recovery helper is retained as historical proposal code; it is not wired into backend.ts and does not authorize a Legacy redeployment. Line-ending attributes preserve exact reviewed source/evidence bytes.

[Per-file reconciliation](team-hub-checkpoint-evidence-2026-10-08/repository-reconciliation.json) classifies every prospective change. Credentials, local sessions, browser profiles, .env files, dependency trees, CDK assemblies and deployment caches remain excluded by policy. Three large raw timing streams remain locally ignored; their sanitized summary receipts are retained. Nothing was deleted to clean Git status. Historical machine path strings in provenance are not executable machine configuration. No unrelated implementation was intentionally included.

## Readiness matrix

| Dependency | Accepted/prepared | Remaining live requirement | Timing |
|---|---|---|---|
| Gate A / frontend behavior | Prior five-persona UI, privacy, route and lazy-loading proof; builds pass | Final real business-persona checks against the eventual installed business runtime, including account switching | Prepare before maintenance; final TARGET-only acceptance after separate transition |
| Gate B / source fence | Detached bundle; 19 principals, 30 resolvers, 131 functions; offline and isolated proof | Fresh coverage/custody and live all-path denial on actual installed source policies | Prepare before; install/prove only in separately authorized FROZEN maintenance |
| Gate C / authority | C1 row, C2 GetItem and authenticated status accepted | New business runtime/policies, live dark denial, isolated transaction equivalence; final real transaction proof | Install and verify all safe paths BEFORE any Legacy freeze |
| Gate D / monitoring | D1 counters/alarms/metrics and endpoint correlation accepted | Revalidate business-runtime counters; manual responder Ntgre, abort visibility; no automated notification claim | Before maintenance; transition/business signals during window |
| Gate E / frontend activation | Real LEGACY epoch consumption and fail-closed behavior accepted; activation disabled | Pin final bundle/manifests/activation mechanism; no business activation on status alone | Prepare before; publish/activate only through separate authorization after backend gates |
| Gate F / recovery | Six-table isolated synthetic rehearsal passed and cleaned; recovery archives verified available | Review equivalence to NEW business candidate; rerun affected isolated cases if changed; fresh recovery checks | Before maintenance; real recovery only if separately required/authorized |

## Concrete Gate C gaps — do not deploy the old candidate

The installed Read runtime has the status wrapper; non-status paths use accepted dark D1. Command is D1. Neither exposes ordinary business mutations. C2 grants only control-partition GetItem, not transaction writes.

The offline [business repository](../../domains/team-hub/cutover/repository.mjs) starts each transaction with [authorityCondition](../../domains/team-hub/cutover/authority.mjs): exact Journal key, mode=TARGET_WRITER, epoch and version conditions. Business, audit and idempotency writes share that TransactWriteItems request, with membership/team version checks. Handler ordering performs authentication, authority and epoch checks plus Core/Team authorization. These are source/offline evidence, not deployed enforcement.

The old [entry](../../domains/team-hub/cutover/entry.mjs) retrieves a cursor secret before entering the handler. The live C2 policy does not permit this; the dependency and ordering must be reviewed in the new candidate. Scope any justified future GetSecretValue to the exact cursor secret, without retrieving its contents for review. Do not grant it merely to make a dark probe pass. Preserve current Core invocation rights.

The old 44-resource business template predates the installed status route/permission. A new exact candidate must start from the accepted 42+7 live templates, preserve the API, authorizer, status contract, monitoring, tables and protections, and calculate its own reviewed counts. The status wrapper currently guards LEGACY_WRITER/PRE_CUTOVER/DISABLED configuration: future changes must deliberately preserve safe status reading across modes without turning that endpoint into an activation/bypass path. Do not reuse an obsolete template or automatically assume 44/46 resources.

Candidate IAM must separately justify exact Operational/Journal reads and transaction-scoped business/audit/idempotency writes, control ConditionCheckItem and any pagination secret access. Runtime must never write/delete the control row. Preserve leading-key and transactional conditions, foreign-domain denials and Core boundaries. Compare against actual installed C2, not an offline business policy. Reject broad Query/Scan/table/secret/KMS/Cognito grants.

## Minimal ordered authorization gates

### R1 — Business-runtime candidate preparation, no maintenance

Prepare the revised combined product/runtime/security pin, minimal permission delta, cursor decision, status route compatibility and frontend/business request contracts. Keep real LEGACY_WRITER, target non-authoritative and frontend Legacy. Run end-to-end source/compiled artifact tests for absent/malformed/stale epochs, LEGACY/FROZEN denial, Core failure, normal authorization, replay/idempotency and in-flight authority changes. No synthetic bypass may enter the deployed API. Pin reviewed rollback to the CURRENT accepted authority-endpoint baseline, retaining D1 as a separate historical fallback.

Required authorization: separate candidate implementation/preparation scope. This checkpoint does not implement or select that new candidate.

### R2 — Business-runtime security/product deployment BEFORE freeze

Separately authorize the reviewed security changes and inspected rollback-enabled product change set. Preserve real LEGACY mode/epoch/version, source permissions and frontend. Verify installed bytes, actual role/boundary allow/deny decisions, exact status GetItem, all normal business denials and monitoring. Do not proceed after drift, replacement, failed update or unexpected route success; allow rollback and stop without permission patches.

Require isolated AWS transaction proof with the exact reviewed business implementation/request construction and tightly isolated synthetic resources. Any table-name/transport substitution must be explicit and pinned, with zero route to real business tables/control. Do not add a magic header, identity bypass or test entry point to production business authorization; service-only role trust must not be broadened. Prove matching authority succeeds in isolation; missing/stale/wrong state and in-flight changes abort atomically with zero partial business/audit/idempotency writes. Clean only exact rehearsal-owned resources.

Actual live LEGACY mode correctly prevents reaching later TARGET-only branches. Installed-code/IAM equivalence plus live non-authoritative denial and isolated transaction receipts are the maximum safe pre-freeze evidence; do not claim this is live TARGET success. Missing required pre-freeze evidence blocks maintenance, rather than moving ordinary runtime debugging into the outage.

Required authorization: separate runtime deployment/security gate and separately scoped isolated rehearsal if needed.

### R3 — Final pre-maintenance decision

Review R2 receipts, final frontend candidate/persona/privacy/network tests, current recovery archives, source/target counts and candidate-equivalent rollback rehearsal. Confirm Ntgre is available with working monitoring/abort access. Re-enumerate all writer paths, roles, gateway functions, stream/schedule/TTL/presigned edges; no unknown/unreachable writer proof can be waived. Re-measure the actual maximum drain envelope; do not assume the historical 17-minute estimate. Capture expected policy revisions and exact rollback procedures without activating anything.

Required authorization: explicit bounded FROZEN maintenance window, source-fence bundle/custody, guarded probe plan and transition request. Approval to freeze is NOT approval to activate TARGET_WRITER.

### R4 — FROZEN source fence and live denial proof

Close only reviewed Team gateways, then revision-guardedly install the four exact table denies and narrow logo-prefix deny while preserving unrelated statements. Record each readback and propagation result. There is no atomic cross-service fence. Until complete, Legacy may still write; keep target disabled. Conditionally transition Journal to FROZEN only under the separately approved exact prior mode/epoch/version; never overwrite/reinitialize it.

Complete the [Gate B actual-path matrix](team-hub-2b6-gate-b-sequencing.md#required-live-installed-fence-proof): generated/direct/manual/privileged/service paths and logos, with valid guarded requests and policy-correlated denial. Invalid payload or ordinary application authorization failure is not fence proof. No trust changes or temporary unrestricted allow. Drain old requests, strongly recount/reconcile source/target and verify FROZEN target denial. Any new business state invalidates the empty-source Mode A plan; never erase it to pass.

Stop here with both writers denied. This is independently reviewable and does not automatically activate the target.

### R5 — Separate target authority transfer

Only after accepted R4 and all preconditions, separately authorize one conditional FROZEN→TARGET_WRITER update with monotonic epoch/version and reviewed metadata. Read back strongly. Keep source denied and frontend inactive. Verify real business read authorization, stale/missing epoch rejection, normal role denials and observability before any first write. Authorize any first controlled real business transaction explicitly, with idempotency/reconciliation and audit verification. No automatic retry after ambiguous mutation outcome.

### R6 — Separate frontend publication/activation

Only after backend authority/business enforcement acceptance, publish the pinned frontend and bind activation to the actual approved epoch. Preserve server-side checks on EVERY mutation; status is advisory input, never a substitute for the transaction condition. Test five real personas, homepage/Admin/Manager/Coach/Player flows, privacy, account switching, no Legacy Team requests, console/network and lazy loading. Branding remains disabled. No switch of shared Cognito or Amplify outputs. Retirement remains separately unauthorized.

## Abort and rollback

Abort before any change on wrong identity/environment, hash or remote drift, missing recovery/monitoring/custody, unexpected resources/permissions, business rows or incomplete proofs. Before freeze, failed R2 deployment rolls back to the exact accepted endpoint product/security; leave the LEGACY row and frontend untouched. Restore runtime code before withdrawing permissions it needs; preserve exact rollback artifact grants.

During partial R4, keep target denied and gateways closed. Stop; do not escape by enabling TARGET. With approved rollback custody, restore only captured original table policies using current revisions (delete only if originally absent), restore only this window's logo/resolver changes, verify propagation, conditionally return control to LEGACY with a strictly later epoch/version if it entered FROZEN, and reopen gateways last. Unexpected concurrent policy/state drift blocks blind rollback.

After target activation or any real target write, code rollback alone cannot restore business authority. Fence/freeze target, preserve journal and state, export, reverse-transform, restore isolated/approved Legacy-compatible state and reconcile identities/relationships/digests before separately re-enabling Legacy. Never discard target data, lower epochs, remove source protection or use a permanent administrator bypass. Existing synthetic rehearsal covers Teams, memberships, roles, rosters, champion pools, assessments and settings; private Coach notes/branding are excluded, not silently recoverable.

## Recovery of this checkpoint

Install repository and domain dependencies from their lockfiles. Exact templates/manifests/source hashes are versioned; runtime ZIPs and assemblies remain outside Git. [Recovery manifest](team-hub-checkpoint-evidence-2026-10-08/recovery-artifacts.json) records the three accepted archive keys/checksums; [S3 HEAD verification](team-hub-checkpoint-evidence-2026-10-08/recovery-availability.json) confirms AES256 and matching SHA-256. `node scripts/team-hub-checkpoint/restore-pinned-artifacts.mjs` restores only those exact bytes to ignored paths using read-only S3 GET, rejects mismatched existing files and performs no synthesis/deploy. `--verify-only` requires the bytes already present. Historical proposal builds may require their separately documented offline tooling; never substitute them for accepted runtime archives.

670 migration/Core/accounting/isolation/rollback/monitoring tests, TypeScript, ledger and normal/dormant builds passed. Existing stylesheet/chunk-size warnings remain. Secret scans and staged-byte verification are recorded with the checkpoint evidence. No AWS writes occurred in this task.

**Review outcome:** ordered execution review can proceed from R1/R2. Actual FROZEN execution is BLOCKED until the business runtime is installed and all safe pre-freeze proof is accepted. This report does not authorize any execution gate.
