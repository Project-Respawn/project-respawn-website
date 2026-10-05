# Team Hub migration and compatibility contract

**Design only, 4 October 2026. No copy, restore, stream consumer, write fence, bridge, table, endpoint or cutover is implemented by this task.** The [current dependency map](team-hub-current-dependency-map.md) establishes what exists; the [target model](team-hub-target-domain-model.md) proposes the replacement. Every AWS-writing stage requires its own reviewed authorization.

## Non-negotiable invariants

- Preserve protected Ntgre identity, subjects, existing Team/membership IDs, slugs, roster associations, timestamps, role/status/revocation semantics, Coach/Player field provenance and logo associations.
- One business writer authority at a time. Physical legacy tables remain owned by LegacyPlatform until separately retired. A reference/import/Retain setting alone is not transfer of a custom provider's lifecycle.
- No silent empty-table assumption. Metadata currently reports zero estimated records, not a consistent inventory. No customer records were scanned for this design.
- No source model/schema removal, duplicate live table, new Cognito pool, production operation or Tournament change in this task.
- A code rollback is distinct from restoring/reconciling business data. No automatic overwrite of acknowledged writes to regain a green stack status.

## Chosen migration approach and alternatives

Prefer a **rehearsed copy-transform-verify with a short bounded write freeze**, because current expected data size appears small and correctness matters more than asserting zero downtime. Obtain measured exact counts, write volume, acceptable downtime, RPO/RTO and owner agreement before choosing a time window. Candidate targets: zero lost acknowledged writes (RPO 0 at cutover), write unavailability under 15 minutes and an exercised rollback under 30 minutes; these are proposed acceptance thresholds, not demonstrated results.

For larger/live workloads, consider initial copy plus change capture while **Legacy remains sole business writer**. The target remains dark/read-only to users. Existing streams are enabled, but no migration consumer is established here. DynamoDB streams retain changes for up to 24 hours; a long copy needs durable capture, lag alarms and a verified checkpoint/replay protocol. Multi-item transaction records can arrive separately and interleave; do not expose partially reconstructed aggregates. [AWS Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html), [transaction propagation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html).

Reject uncontrolled dual business writes. Automatic fallback to old reads after cutover can expose stale membership/revocation or divergent versions; a shadow comparison or explicit rollback mode is safer than silent dual-read fallback. Importing the custom-managed tables directly as native DynamoDB resources is **not the default plan**: provider support, delete callbacks, index mutations and ownership transfer are unproved. Native target tables with a logical transform are the proposed final state, only when separately authorized.

## Stage and authority matrix

| Stage | Legacy business writes | Target business writes | Data authority / gate |
|---|---|---|---|
| Design / offline skeleton | Existing behavior | None | Legacy; this task ends at design |
| Independent read adapter | Existing behavior | None | Legacy; read facade explicitly execution-separated only |
| Dark target + copy/replay | Existing behavior, controlled capture if chosen | None; migration identity only | Legacy; target is unaccepted replica |
| Final fence/reconcile | **Stopped server-side** for all old paths | None | Freeze; no concurrent authority |
| Accepted cutover | Denied or forwarded to the sole new writer | Enabled only after gate | Team Hub target |
| Observation | Forward/deny legacy writes; no reactivation | Team Hub | New authority, compatibility window |
| Rollback transition | None until reverse reconciliation succeeds | Fenced if data rollback needed | Explicit incident mode, never both |
| Legacy retirement | None | Team Hub | Separate resource-removal approval |

The proposed sequence intentionally moves the user's conceptual “freeze Legacy writes” step **before** enabling new writes and frontend cutover. Deferring that freeze until after observation would permit split authority.

## 2B1–2B2: prepare contracts and execution separation

Create only offline schemas, repository interfaces, synthetic fixtures, permission matrices and an isolated root/skeleton when separately authorized. Do not reuse the whole generated data client in the new runtime. Prove wrong-target rejection, resource/dependency closure, token validation and exclusive assembly/selector before live preparation. Hosted `amplify.yml` isolation is a separate gate; development is not AWS-connected, staging/master are not to be repointed.

A transitional read path may call a **bounded legacy compatibility adapter**, preserving subject and authorization. The existing shared Lambda remains the table writer. The adapter must authorize both the calling Team service and the original end user, allowlist read commands and validate team membership with the old authority. Do not give a new runtime a broad `appsync:GraphQL` permission, direct foreign table access, or permission to invoke the shared dispatcher with arbitrary `identity` JSON.

No such trusted adapter is assumed to exist. Review a concrete service/delegation contract and a narrowly scoped one-time Legacy deployment before creating it. That is a migration compatibility exception, with Team Hub owner, exact fields/operations, read-only scope, audit, removal milestone and separate authorization. If it cannot be safely implemented, keep the early target fixture-only until data migration is ready. Do not disguise remaining Legacy data dependency as full independence.

## 2B3: state preflight, tools and rehearsal

Before any live copy:

1. Revalidate account/region, protected root, exact four table IDs/ARNs, their live key/index/stream/TTL/encryption settings, all readers/writers and current provider/template hashes. Inventory actual logo keys/versions and external consumers with scoped read authorization. Read-only metadata here is not a complete object inventory.
2. Obtain a resource-specific backup/restore plan. Current PITR and deletion protection are disabled and custom table deletion policies are Delete. Enabling protections, making backups, creating restoration rehearsal resources and exporting/copying are AWS writes requiring approval. Retention configuration must be validated against the custom provider; do not assume a normal native-table import recipe.
3. Establish consistent counts/content verification at a fenced point, or a snapshot plus durable change-capture watermark protocol. Ordinary concurrent scans, even strongly consistent item reads, are not an atomic cross-table snapshot. [AWS Scan consistency limits](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html).
4. Build a deterministic, versioned, restartable transform with source artifact hash, environment, table ARN set, schema revision, per-segment cursor/checkpoint, input/output counts, rejects and reconciliation digest. Dry-run against sanitized fixtures first; no credentials/private record contents in Git.
5. Use a separate temporary migration identity: only four source table reads, exact source-logo prefix reads, exact target writes and verification; no Cognito admin, production, Tournament or foreign domain data. Delete/revoke this identity only under its approved lifecycle, never broaden runtime for migration convenience.
6. Provision target tables/bucket only in a separately approved stage, with backups/protections and a tested restore procedure. No user traffic or authority is attached just because tables exist.

### Transform rules

| Source | Target transformation and invariant |
|---|---|
| Team | Preserve Team ID/slug/name/game/status, manager/coach references and all revision/settings metadata. Create explicit slug lookup. Missing settingsRevision normalizes to 0 with provenance; unknown values are quarantined, not silently discarded |
| TeamMembership | Preserve membership ID and sub, role/status, snapshot display name and revocation data. Reconcile unique team+subject and authoritative manager/coach pointers. Never infer a missing sub from display name/email |
| TeamRosterSlot | Preserve external IDs and slot type/status, including hidden STARTER_GUARD. Verify each active slot resolves to an active Player in the same Team, no duplicate starter role or player. Record legacy-invalid rows for owner decision |
| PlayerChampionPoolEntry | Split Player fields and Coach fields into linked items, preserve membership/team/sub/champion association and Coach author/time. Missing coach fields may mean no assessment item. Preserve provenance/version mapping; no one-to-one total-row-count assumption |
| Team logo | Preserve association and source object key/hash/content-type/size. Copy only approved PNG objects; map to owned asset reference, verify bytes/metadata and rollback availability before changing URL issuer. Do not bulk-copy shared bucket content |

Legacy duplicate/dangling IDs, invalid enums/subs, inactive roster guards, inconsistent manager/coach references and privacy-ambiguous notes stop acceptance. Report them without deleting or “repairing” live data. Source `__typename` and generated timestamps can be retained in migration provenance where needed by a reverse transform; they are not new public API fields.

### Verification gate

- Count by source model, target entity type, Team, active/inactive role, slot type and champion; explain assessment/slug/audit expansion. Compare deterministic canonical field hashes using a documented null/absent/timestamp ordering policy. Store only counts/digests in Git; sensitive row-level reconciliation stays access-controlled.
- Verify Team → Membership → Roster/Pool/Assessment relationships, manager/coach pointers, one starter per position/player, subject continuity, all pagination pages and boundary sizes. Include 0/1/50/overflow and concurrent modifications.
- Compare authorized old/new response DTOs by persona (Player, Coach, Manager, platform Admin, branding Staff, outsider, revoked user), not only table counts. Include all 18 actions, logo lifecycle, directory resolution, conflict/idempotency and denial behavior.
- Any intentional privacy correction (Coach fields/Manager visibility/inactive detail) has explicit approved expected differences. Do not call matching an insecure response “parity.”
- Verify target recovery with a real approved restore rehearsal before authorizing production-like cutover; PITR enabled without a restore test is insufficient.

## 2B4–2B5: command parity, fence and frontend cutover

Implement and validate target mutations against synthetic/rehearsal data without granting general user write authority. Add server-enforced writer mode/epoch that every business mutation checks. The transition must cover old `mutateTeamHub`, direct generated/IAM model writes used by legacy code, scheduled jobs, privileged tools and in-flight requests. Source searches found no foreign product writer, but runtime telemetry and a permission/caller inventory must confirm that before the gate.

At the approved cutover window: fence old writes, drain in-flight requests, capture final watermark, replay deltas, verify hashes/relationships, freeze migration writes, then atomically select the new write authority/config revision. A frontend feature flag alone is not the fence. If old clients remain, adapt `readTeamHub`/`mutateTeamHub` to the new owner with trusted delegation and DTO/error compatibility, or return an explicit retry/upgrade response. Do not let them keep modifying old tables.

Switch Team Hub pages, dynamic guard adapter, global homepage shortcuts and admin composition together through an accepted versioned endpoint/client contract. Preserve routes, redirects, Team slugs and same-environment login. Do not change global Amplify outputs/configuration for other products. Measure code download/evaluation, API-client initialization and network calls across `/`, `/home`, Team, Tournament, Creator, Commerce and Team admin routes. Explicitly approved homepage Team summaries are an allowed contract dependency, not an excuse to load all Team implementation.

Observe request/denial rates, conflicts, errors/latency, directory/media failures, write-authority violations, stale-response differences and user workflows. Acceptance requires real same-environment personas and request-correlated application audit/log/metrics. Mock tests and an idle alarm are insufficient.

## 2B6: rollback proof

Keep immutable Release N/N−1 templates, assets, schemas, manifests, policy baselines, migration mappings, reconciliation checkpoints and source backups. First prove code/config rollback while keeping the new data authority and backward-compatible schema. This is the safest normal rollback after target writes.

Before target writes are enabled, rollback can discard the dark target **only with separate deletion approval** and return the client to unchanged Legacy authority. No deletion is needed merely to stop a migration.

After target writes, never just point the frontend to old tables. If data authority must return to Legacy: stop both write paths, capture all acknowledged new writes/deletes/revocations and logo changes, run the rehearsed reverse transform/replay, reconcile versions/content/relationships, restore old single-writer authority, then publish the old accepted endpoint/config. New-only fields need a reversible mapping or must be prohibited during the rollback window. If correctness cannot be proven within RTO, remain read-only and escalate; prefer forward repair over silent data loss.

Prove both domain-only code rollback and a separately authorized stateful cutover rollback rehearsal. Compare unrelated stack timestamps/physical IDs/Lambda hashes before/after. Tournament Release 2/rollback remains a separate task, not exercised by Team Hub work.

## 2B7: retirement gate and exit

Only after the agreed observation/compatibility period, zero legacy readers/writers from source and telemetry, recorded backup/restore proof and owner sign-off, prepare an exact resource retirement proposal. Inspect all custom provider delete/replace callbacks, nested resources, IAM shared references and generated operations. Shared Lambda, Cognito, S3 bucket and table manager are not deletable merely because Team leaves.

Separate approval must name each table/resource/object-prefix and expected CloudFormation changes. Reconcile full nested change sets and retained state; require zero unexpected protected replacements/deletions. Do not infer that all 192 attributed declarations can be removed together safely. Recount LegacyPlatform only after actual retirement; 2,621 / 167 remains the current accepted baseline throughout this design.

## Decisions required before live stages

Named Team product/operations and Core owners; real record counts/traffic and permitted maintenance window; privacy/archival semantics; directory/entitlement service contracts and revocation freshness; adapter/delegation design; backup/restore method and custom-provider behavior; source writer fence; object-level recovery; target schema/access-pattern benchmark; operational retention/alarms; hosted deployment isolation; rollback window and reverse-transform support. These block migration/deployment readiness, **not review of this design**.
