# Team Hub 2B3 — native-state schema, privacy and rollback

2026-10-05. Offline contract, not an installed persistent adapter. The accepted Release 1 inputs remain unchanged. Exact machine-readable fields are in [target-schema.json](team-hub-2b3-final-evidence-2026-10-05/target-schema.json); the closed-schema reverse validator is [native-state.mjs](../../scripts/team-hub-migration/native-state.mjs).

## Durable schema: `team-hub-state.v1`

Operational table uses string PK/SK. Every item has schemaVersion, entityType, integer version ≥1 and UTC ISO createdAt/updatedAt. Unknown fields or schema versions are rejected by rollback instead of dropped. Team/role identifiers retain the existing validated `team:<slug>` and `team-membership:<teamId>:<Cognito UUID subject>` forms during the rollback window. Canonical identity is the exact shared Ntgre issuer plus subject, never email.

| Entity | PK | SK | State/constraints |
|---|---|---|---|
| Team | `TEAM#<id>` | `META` | name, slug, gameKey, ACTIVE/INACTIVE, version, authorizationEpoch, rosterVersion, membershipRevision, settingsRevision, Manager/Coach pointers, createdBy/updatedBy subject, settings |
| Slug claim | `SLUG#<slug>` | `TEAM` | teamId; conditional create in same transaction as Team; exactly one claim per Team |
| Membership | `TEAM#<teamId>` | `MEMBER#<subject>` | issuer, subject, displayName, MANAGER/COACH/PLAYER, ACTIVE/INACTIVE, addedBy, revocation time/actor, version; at most 50 memberships |
| Starter | `TEAM#<teamId>` | `STARTER#<gameRole>` | membershipId, STARTER, status, assigning actor, version; one active starter per position |
| Starter guard | `TEAM#<teamId>` | `STARTER_PLAYER#<membershipId>` | same position/actor; one active starter per Player; committed atomically with slot |
| Substitute | `TEAM#<teamId>` | `SUB#<membershipId>#<gameRole>` | SUBSTITUTE, status, actor, version |
| Inactive roster | `TEAM#<teamId>` | `ARCHIVE#ROSTER#<id>` | inactive/deactivated metadata retained; old row moved atomically |
| Player pool | `TEAM#<teamId>` | `POOL#<membershipId>#<championId>` | gameRole, comfort S/A/B/C/D, priority LOW/NORMAL/HIGH, competitiveReady, playerNotes, version |
| Team-visible assessment | `TEAM#<teamId>` | `ASSESSMENT#<membershipId>#<championId>` | coachTier, coachAssessment, coachRecommendation, coachPriorityPractice, author/time, version; `TEAM_VISIBLE_APPROVED` |
| Coach-private note | `TEAM#<teamId>` | `PRIVATE#<membershipId>#<championId>#<authorSubject>` | authorIssuer/subject, privateNote, version; separate privacy class; creation disabled during rollback window |

BySubject is sparse, KEYS_ONLY: SubjectPK = `SUBJECT#<SHA256 issuer>#<subject>`, SubjectSK = `TEAM#<teamId>` on memberships only. ByTeamStatus is sparse, KEYS_ONLY: StatusPK = `STATUS#<status>`, StatusSK = `TEAM#<id>` on Team only. Neither GSI grants authority; fetch base items strongly and recheck membership/version/epoch. Role changes increment authorizationEpoch and membershipRevision atomically; roster/settings mutations increment their revisions and Team version. All revisions must remain Legacy-compatible signed-positive-32-bit integers during the rollback window. Duplicate active Manager/Coach roles, foreign players, conflicting starters and dangling guards are forbidden.

Settings are an explicit closed object: plan FREE/PRO, nullable logoAssetId, optional proGrantedAt/proGrantedBy/proExpiresAt/planUpdatedAt/planUpdatedBy/logoUpdatedAt/logoUpdatedBy. No arbitrary JSON settings bag. These durable fields extend the earlier minimal in-memory contract; integration into the runtime model/adapter requires a separately reviewed release. Dark DynamoDB creation does not install that adapter.

Journal also uses string PK/SK:

| Class | PK / SK | Retention and behavior |
|---|---|---|
| Authority | `CONTROL#AUTHORITY` / `STATE` | mode LEGACY_WRITER/FROZEN/TARGET_WRITER, epoch, version, changedAt, changedBy, gateDigest; no TTL |
| Audit | `TEAM#<teamId>` / `AUDIT#<UTC timestamp>#<requestId>` | actor issuer/subject, operation, resultingVersion/epoch, requestId, at, expiresAt; 365 days; no private text or response payload |
| Idempotency | `IDEMP#<issuer SHA256>#<subject>#<teamId>` / `<operation>#<requestKey>` | canonical request digest, allowlisted response, version/epoch, expiresAt; 24 hours; key scoped by actor/team/operation; replay rechecks current authorization |

TTL attribute `expiresAt` uses integer Unix seconds. Expiration is enforced by application reads; asynchronous physical TTL deletion must not extend replay or visibility. No TTL on operational business rows or authority. Domain mutation, audit and idempotency commit in one bounded transaction, checking the control row and relevant version/epoch. Private response bodies are not cached. Recovery archives retain journal and native versions even though Legacy cannot represent them. Retention values are the proposed v1 contract, to be verified in the later adapter gate.

## Privacy boundary

Player owns editable pool information. Per the [accepted authorization matrix](team-hub-authorization-matrix.md), **team-visible does not mean public or Player-visible**: assessments are readable by active Manager/Coach only; only Coach writes assessment fields. Coach-private notes are readable solely by the authoring active Coach of that Team; replacements, Managers and platform admins do not inherit access. DTO allowlists remove private fields before serialization.

Legacy `Private:` text has no reliable visibility metadata. Any such record forces Mode B privacy review. It is never automatically converted. Coach-private notes are **NON_REVERSIBLE_DURING_ROLLBACK_WINDOW** because Legacy has no safe equivalent. Keep their creation disabled until explicit closure of the state rollback window; discovering one aborts reverse import. Branding is also disabled in Mode A; the codec supports a later logo only with a verified same-Team restored-object mapping, never an unverified key substitution.

## Preferred rollback: code only

Keep Team-owned tables and TARGET_WRITER authority. Restore a known compatible application release that supports `team-hub-state.v1` and the current fence epoch. Revalidate authentication, versions, role revocation, idempotency and privacy. Release 1 read-preview code alone is not a stateful write rollback release: if no compatible old writer exists, stay read-only rather than route to Legacy. Retain all acknowledged new records and journal evidence.

## Exceptional rollback: state authority

The planned window is 24 hours after accepted cutover, and remains open beyond that until explicit proof/signoff closes it. No clock automatically enables non-reversible features.

1. Set FROZEN, deny target business writes, keep all Legacy writes denied, stop business retries and drain all relevant invocations. Read-only verifier is the only export path.
2. Export a complete consistent frozen operational snapshot and complete journal; bind schema, authority epoch, counts, hashes, pagination and timestamps in an encrypted recovery artifact outside Git. Include inactive/revoked state and acknowledge hard deletes through the retained audit. Record retention of authority, versions, audit and idempotency that Legacy cannot natively store.
3. Run `nativeToLegacy` offline. It needs **no old source snapshot**. Validate exact Legacy IDs, four-model relationships, role pointers, starter guards, settings, approved assessment visibility, actors/timestamps and optional restored logo proof. Reject unmapped fields, private notes or unsupported versions.
4. Verify the original Legacy baseline is still empty; this Mode A rollback must not overwrite unexpected rows. Compare full generated records against a separately authorized restore/reconciliation staging target, not counts alone. Perform reverse import under a newly authorized temporary exact-table writer while public writers stay denied. That rollback identity is not provisioned in Mode A preparation.
5. Verify every acknowledged business entity and all Legacy-compatible fields, no extra rows, logo checksums if applicable, and protected retention of native-only metadata/journal. Preserve native tables/backups. A checkpoint records the full digests, not just a sample.
6. Before Legacy can accept mutations, install and test a compatibility guard against replay of pre-rollback native request IDs. Keep a reviewed digest/idempotency archive available through an adapter or reject the old mutation protocol and require a new client generation. Legacy's old implementation alone cannot satisfy this promise. Until that adapter/proof exists, state rollback remains frozen/read-only; code rollback is preferred.
7. Increment authority epoch, restore LEGACY_WRITER only after every above proof passes, switch clients and run Manager/Coach/Player/admin/privacy/denial/concurrency tests. Re-enable only approved Legacy paths; leave target writes denied. Failure at any stage leaves both writers fenced.

Offline [native tests](../../scripts/team-hub-migration/native-state.test.mjs) prove new Team/Manager/Coach/Player, roster and substitute/guard, pool/assessment, revoked membership, settings and conditional logo mapping. `reconcileNative` compares the complete Legacy payload, not only counts. This is not evidence that a live restore/import or the future replay guard has run.
