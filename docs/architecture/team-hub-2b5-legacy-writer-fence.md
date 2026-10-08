# Team Hub 2B5 — Legacy writer fence

6 October 2026. **OFFLINE PROPOSAL ONLY. LEGACY_WRITER remains active.** No policy installed, resolver updated, authority row seeded, Legacy synthesis or CloudFormation change set created.

## Coverage

The accepted [complete coverage inventory](team-hub-2b3-final-evidence-2026-10-05/coverage.json) classifies 13 active business writers, two possible writers, eight privileged/manual paths, eight generated internal paths, one test-only path and one condition-excluded grant. Unknown writers/readers are zero **in that recorded inventory**, not a fresh IAM enumeration. [Coverage explanation](team-hub-2b3-writer-reader-coverage.md). Every row retains its source, principal, targets and evidence; [offline guards](../../scripts/team-hub-2b5/tests/guards.test.mjs) require a fence classification.

| Path family | Enforcement at FROZEN / TARGET_WRITER |
|---|---|
| Nine core mutations through mutateTeamHub | Exact four-table all-principal data-write Deny |
| Three logo commands and issued presigned PUTs | Same Team table Deny plus exact `team-logos/*` object-write/delete Deny |
| Direct shared-Lambda DynamoDB adapter | Same table Deny, including transactional underlying item permissions |
| Generated Team model create/update/delete; admin Lambda GraphQL path | Same table Deny, independent of resolver auth or frontend |
| Generated data sources/providers and cleanup provider | Table/object Deny plus no deployment, teardown or provider update during the maintenance freeze |
| Eight privileged/manual capabilities | Same data-plane Deny; no standing recovery exception; separately controlled policy/lifecycle administration |
| New or unclassified path | Stop gate; refresh coverage, do not waive |

## Smallest enforcement unit

[fence.mjs](../../scripts/team-hub-2b5/fence.mjs) compiles exact four-table policies and the existing bucket's exact logo-prefix policy. [Prepared payloads](team-hub-2b5-evidence-2026-10-06/fence-proposals.json) preserve recorded bucket statements. They are not installation-ready snapshots: refresh all complete policies/revisions immediately before the future write gate and merge without losing unrelated statements.

All-principal source denials cover PutItem, UpdateItem, DeleteItem, BatchWriteItem and PartiQL insert/update/delete. Transaction item permissions are covered at the same resource boundary. [AWS support matrix](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/rbac-iam-actions.html) includes transaction APIs. Offline tests inspect/evaluate the prepared policy scope; they are **not live direct-model bypass proof**. Future negative tests must exercise each supported path, including generated models and privileged clients, with approved synthetic attempts after backup/fence review.

At TARGET_WRITER the proposal also denies GetItem, BatchGetItem, Query, Scan and PartiQLSelect on the four exact tables/indexes so old raw models cannot serve stale or private source data. Streams, exports, subscriptions and privileged recovery reads need their own coverage controls; an item-read deny is not proof that every historical delivery channel is shut down. Block new generated subscriptions, drain old subscriptions and queued events, prohibit export/restore/new-table bypasses and freeze relevant infrastructure changes.

No giant Legacy redeployment is intrinsically needed for these resource-policy fences. Future installation needs exact target-specific authorization, DynamoDB policy revision checks/readback, complete S3 policy comparison/readback, eventual-effect wait and live denial proof. S3 policy updates lack a comparable conditional revision field: enforce a single policy custodian and abort on concurrent change.

## Privileged operators and recovery

An administrator or root capable of removing resource policies or changing resources can undo a data-plane fence. The proposal does not claim otherwise. Cutover requires an accepted maintenance freeze for deployment, IAM, table/bucket lifecycle, policy removal, imports, restores and scheduled automation. An organization-level enforcement control is not assumed to exist. Without named custodian, audited change controls and effective privileged freeze, cutover stays blocked.

Recovery never uses a broad exempt principal in the ordinary fence. While both business writers remain FROZEN, separately approve exact recovery identity, expiry, keys/tables, conditional policy exception and reconciliation. Remove that exception before restoring business authority. Source PITR/deletion protection installed out of band must be reverified after any future provider operation; the no-Legacy-deployment guard remains.

## Compatibility

Before cutover, readTeamHub/mutateTeamHub stay unchanged. During FROZEN, both gateways should return TEAM_HUB_MAINTENANCE. After TARGET_WRITER, both should return TEAM_HUB_DOMAIN_MOVED; no forwarding, dual write or stale read fallback. The candidate provides rejecting request templates for the two exact existing pipeline resolvers. A separate resolver-update proposal must retain the full current pipeline, auth and response configuration and inspect exact before/after values; it is not installed here. Generated model writes are denied at the tables; reads are also denied after transfer.

## Authority sequence

Prepare control state as LEGACY_WRITER only under a separate state-write gate. Transition to FROZEN with optimistic version/epoch condition, install source denies, verify effectiveness and drain, then recount. FROZEN alone cannot stop an unmodified Legacy writer; source policy proof is mandatory. Partial failure leaves target denied and the source partially/fully fenced, requiring recovery review. Only the fully reconciled gate may transition to TARGET_WRITER. Returning to LEGACY_WRITER after target data exists requires the [state rollback procedure](team-hub-2b5-rollback-rehearsal.md).

Current installation/proof: **NOT PERFORMED**. Unknown recorded paths: 0; fresh coverage, direct-model/privileged denial tests and maintenance control remain blockers.
