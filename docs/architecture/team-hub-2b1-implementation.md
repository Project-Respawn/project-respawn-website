# Phase 2B1 — Team Hub offline foundation

4 October 2026. Branch `phase2/team-hub-extraction`, source baseline `96b100072f96d03be13e4bb73f5e9518b76a4ebb`. **Offline implementation only. LegacyPlatform remains the live Team Hub authority.** This is readiness for independent read-path review, not deployment, migration or frontend-cutover readiness.

Authoritative design: [extraction plan](team-hub-domain-extraction-plan.md), [dependency inventory](team-hub-current-dependency-map.md), [two-table model](team-hub-target-domain-model.md), [migration contract](team-hub-migration-contract.md), [domain standard](project-respawn-domain-architecture-standard.md), [new-domain checklist](new-domain-checklist.md). Implementation contracts: [API](team-hub-v1-api-contract.md), [authorization](team-hub-authorization-matrix.md), [accounting](team-hub-2b1-resource-accounting.md).

## Architecture assessment

Owner: Team Hub, including administration, membership, roster, champion pools, assessments and branding associations. Named operational/business owner remains a gate before live work. This is the approved extraction into one independent product root, not a new root for each page. A separate local security template describes that product's bootstrap roles and is included in accounting.

Independent authority, bounded state, different read/write privileges, release isolation and product growth justify `ProjectRespawn-TeamHub-Ntgre`. HTTP plus two bounded runtimes replaces the proposed generated per-model graph. No new resources enter LegacyPlatform. Two tables belong exclusively to Team Hub. No state ownership changes in this phase. The live baseline remains the previously accepted 2,621 Legacy resources / FunctionDirectiveStack 167; no fresh live recount is claimed.

Identity is the existing same-environment Core contract. Directory, authorization and profile are pure versioned contracts with synthetic adapters; they are **not existing deployed Core services**. Future Tournament eligibility is a Team-owned contract only. There are no foreign table, shared dispatcher or Cognito administration dependencies.

## Source boundaries

| Boundary | Implementation |
|---|---|
| Owner contracts / pure model | `domains/team-hub/contracts.mjs`, `core-contracts.mjs`, `model.ts`, `compatibility.mjs` |
| Read and command business logic | `domains/team-hub/service.mjs` with caller-derived identity, explicit projections and bounded operations |
| Storage port / test implementation | `model.ts` repository interfaces, `repository.mjs` in-memory atomic transactions, `storage-plan.mjs` physical-key/write-shape proof |
| HTTP boundary | `http.mjs`, `read-entry.mjs`, `command-entry.mjs` |
| Dormant frontend | `src/features/team-hub/{routes,pages,components,api,contracts,services,state}/` |
| Independent package/app/security | `infrastructure/domains/team-hub/` with its own package/lock/toolchain |
| Isolated local tooling/tests | `scripts/team-hub/`; Tournament's pinned `scripts/domains/` set is untouched |

The server has eighteen closed request schemas and operation-specific response DTOs. Six reads and twelve commands run against injected repository/Core interfaces in tests. The packaged Lambda entrypoints deliberately return HTTP 503 `OFFLINE_SKELETON`: no persistent storage, Core transport, cursor secret or synthetic repository is installed into a cloud runtime. A bundled service factory is not an accepted production adapter.

The frontend preserves all seven current route descriptors, with six dynamic page imports including admin and the existing team-pool redirect. It is **not registered** in the live router. Placeholder independent pages establish loading boundaries, not completed product screens. Local builds emit separate page chunks. The existing spaced `src/features/Team Hub/`, live service, homepage/admin composition and global router are unchanged. Consequently this proves isolated new-boundary loading, not end-to-end shell bundle isolation or live navigation acceptance.

The client is constructed with an explicit HTTPS origin and refreshable token-provider callback, uses no global SDK initialization and validates both request and returned DTO. Token snapshots are not stored in domain state. Domain state is constructed per session and exposes logout/account-switch reset. A future shell integration must invoke that reset and validate an accepted endpoint descriptor. No Team endpoint manifest exists or was published.

## State and transactions

Operational entities are Team/settings, slug reservation, Membership, starter, starter guard, substitute, Player champion entry, team-visible Coach assessment, Coach-private note and synthetic media intent. The separate journal holds immutable audit events and expiring idempotency records. Two keys-only indexes (`BySubject`, `ByStatus`) locate candidates. Authorization uses base membership and aggregate snapshots; index results cannot authorize access.

Every command requires actor membership version (zero for a global actor without membership), Team version and authorization epoch, except create which requires absence. Roster/entry/assessment/target-membership versions add operation-specific conditions. The in-memory port rechecks current authority immediately before a synchronous atomic commit. It publishes domain mutation, audit and idempotency together, or none. Aggregate META conditions are coalesced into its write; an actor membership condition is coalesced when that membership is itself updated. The physical write-shape proof includes slug/starter guards and both journal writes, with a conservative 25-item / 4 MiB ceiling. The size check bounds the entire target aggregate conservatively, not just changed bytes.

A future persistent adapter must compile these conditions into actual DynamoDB transactions, recheck every target and authoritative version, avoid multiple actions on one item, implement deterministic key ordering/bounded indexed retrieval, and prove condition failures disclose no private entities. The callback-based memory port is an offline reference; it is not a drop-in distributed database adapter. Global Core decisions are synchronously fresh in the synthetic model; cross-service decision lifetime/revocation semantics need explicit review before a network adapter is accepted.

Idempotency is scoped by `(issuer, subject, operation, key)` with canonical payload digest, 24-hour application expiry and minimized response DTO. Same payload returns the original result; different payload conflicts. Authorization is rechecked before replay. TTL removal is eventual housekeeping, not the authority for expiry. Journal response DTOs may contain authorized private notes for that actor and need private retention/access treatment; audit events never contain notes, email, tokens or request bodies. Audit retention policy and restore exercises remain live-stage gates.

Logo request/commit/remove contracts execute only against synthetic associations. An intent has no presigned URL. Commit requires a matching owner/team, unexpired verified intent; verification is injected only as a synthetic fixture. Actual PNG byte/dimension/CRC validation, owned storage, scanning and upload are later work, not a claimed live media implementation. No S3 permissions or bucket exist in this skeleton.

## Security and observability

Read role/boundary permits only own operational reads/index queries and its log stream. Command role/boundary additionally permits owned transactional item operations and journal puts/condition checks. Journal update/delete is denied. Every runtime denies foreign DynamoDB, all S3, Cognito, IAM, CloudFormation, business KMS, secrets, AppSync, cross-Lambda invocation and role assumption. No Tournament key exception was copied. Core API permissions are absent until an authenticated transport is approved.

DynamoDB transactional permissions use underlying item actions plus `dynamodb:EnclosingOperation`, as specified by [AWS transaction IAM documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis-iam.html). The local tests evaluate the actual identity/boundary documents' supported condition subset. They are **not** IAM Simulator, Access Analyzer or a live service proof.

Deployment definitions are separate: scoped Lambda/tables/runtime IAM/alarms/logs, practical regional API Gateway lifecycle authority and service-level log-delivery controls. These broad deployment actions retain residual authority over regional API/logging resources; they are not per-API isolation. Future caller/artifact/account/root controls and live change-set review must contain them. The preparation caller does not grant `ExecuteChangeSet`. Execution security bootstrap, artifact publication/asset bucket access, runtime service encryption behavior, notification recipients and rollback proof require separate review. The security template is local and was not installed. No deployment runner exists.

Templates include API request-ID/status/latency logs without authorization/body data, two runtime log groups and six API/Lambda error/throttle/latency alarms. Alarm notification ownership and safe application logging with persistent business operations remain later-stage work. Offline handlers must not be presented as live observability acceptance.

## Validation and retained evidence

Reproducible commands are in the [isolated package instructions](../../infrastructure/domains/team-hub/README.md). Run the Team plan before its tests; accounting tests reject a stale receipt when source hashes change. Retained [evidence](team-hub-2b1-evidence-2026-10-04/validation.json) records final counts/results, and [synthesis receipt](team-hub-2b1-evidence-2026-10-04/synthesis-receipt.json) records input hashes, bundle dependency closure, isolated loaded libraries and exact template hashes. Generated assemblies/assets/cache remain local and ignored.

Tests cover all operations, a 90-case operation/persona matrix, strict schemas, separate Coach visibility, projection after mutations, target/caller revocation, stale revisions/epoch, duplicate payloads/keys, expired idempotency, roster races/guards, wrong environment/client/purpose/subject, Core outage/revocation, minimized directory results, signed bounded cursors, synthetic media ownership, HTTP input-source conflicts, all eighteen client round trips, lazy chunks, negative bundle imports, runtime policy negatives and accounting. TypeScript checks the infrastructure/model contract; esbuild builds backend and browser source. This does not claim TypeScript `checkJs` coverage of all JavaScript business logic.

The existing 41 resource-accounting/Phase 1 guard tests pass without Legacy synthesis. Legacy's 51 inventoried source hashes remain exact. Both Tournament verifiers confirm candidate `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`, including its accepted runtime boundary v2 and execution policy v8.

The mandated generic `validate:infrastructure-ci` was attempted. Its input selection chose the Legacy synthesis branch; the child failed during `tsx` startup with `uv_os_get_passwd ENOMEM` before backend synthesis. It was not rerun or worked around. This is an **unpassed generic CI check / known selection gap**, not independent-domain validation. No Legacy template or backend was synthesized by that failed startup. Hosted pipeline selection and a domain-aware replacement for that generic check remain required before deployment; this offline stage uses the independently verified Team-only plan.

No AWS CLI/SDK calls, deployments, live reads/writes, data migration, Cognito changes, frontend cutover, production changes, commit or push were performed during 2B1. The npm toolchain was installed from local cache. Existing planning files remain alongside the new implementation.

## Next gate

Independent read-path review must select a real authority/adapter strategy without broad foreign database permissions, formalize authenticated Core/delegation protocols, name owners, validate bounded durable queries and revocation across service boundaries, and resolve hosted selection. Any temporary Legacy adapter needs separate explicit authorization. Subsequent live resources, migration/PITR/backup changes, frontend cutover, deployment and rollback remain separately gated. Tournament Release 2/rollback status is not advanced by this work.
