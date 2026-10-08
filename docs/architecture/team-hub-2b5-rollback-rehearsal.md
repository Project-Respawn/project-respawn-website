# Team Hub 2B5 — rollback and synthetic rehearsal preparation

6 October 2026. **PLAN ONLY; NO LIVE REHEARSAL OR RESTORE PERFORMED.** [Existing rollback contract](team-hub-2b3-rollback-contract.md) and [native reverse codec](../../scripts/team-hub-migration/native-state.mjs) remain authoritative. Offline transform tests pass 46/46.

## Preferred code rollback

Keep Team-owned Operational/Journal tables and TARGET_WRITER authority. Fence new requests if necessary, restore an explicitly pinned compatible Team runtime/client release that understands `team-hub-state.v1`, authority epoch and current API DTOs, then revalidate roles, replay, privacy and transactions. Do not restore a preview-only release or 2B4 synthetic-only Lambda and claim it is a compatible ordinary writer. There is currently no accepted previous production-authority writer release; creating/rehearsing that pair remains a gate. If no compatible release exists, remain read-only/FROZEN with acknowledged target data preserved.

No Lambda/table/secret deletion, no target restore over current data and no Legacy endpoint fallback. Core/client versions must remain contract-compatible. Cursor key versions require a rotation/rollback overlap plan; do not replace secrets casually or treat stale cursor failure as data loss.

## Exceptional state-authority rollback

1. Conditionally set FROZEN with a new epoch; source deny policies remain. Stop retries and drain target transactions. Confirm both writer families deny requests.
2. Export every target Operational row and the full Journal under freeze, including inactive/revoked metadata and retained audits. Encrypt the artifact outside Git; pin row counts, canonical full-record/key-set digests, schema, timestamp and authority epoch. No customer payloads or credentials in repository evidence.
3. Run nativeToLegacy offline without relying on an old source snapshot. Reject unknown fields/versions, duplicate/missing relationships, invalid role pointers, roster guards, incomplete settings, private notes or unverified branding mappings.
4. Restore the output into separately authorized isolated Legacy-compatible tables first; never use the real Legacy source as the rehearsal destination. Reconcile all fields and relationships, including newly created/updated/deleted entities. Counts alone are insufficient.
5. Preserve target-native authority/version/audit/idempotency metadata in the recovery archive. Legacy cannot represent every native field.
6. Obtain separate exact-key/table recovery write authorization for actual Legacy restoration while both public writers remain denied. Require source emptiness or an explicitly reviewed nonempty reconciliation plan; never overwrite unexpected source data.
7. Install/test an old-native-protocol replay rejection mechanism or require a new client generation. The old Legacy implementation alone cannot enforce native idempotency. Without this proof, remain FROZEN.
8. Reconcile actual restored state, verify protections and metadata, then conditionally set LEGACY_WRITER with a new epoch only under the separate authority gate. Restore only reviewed Legacy writers/clients, keep target denied and test all personas/negatives again.

The prior 24-hour planned rollback window remains open beyond that until explicit signoff closes it. Coach-private creation stays disabled throughout. Private notes have no safe Legacy equivalent and abort reverse import. Branding remains disabled for initial Mode A; future logos require checksum-verified same-Team object mappings. No clock automatically enables non-reversible features.

## Future synthetic nonempty rehearsal

Proposed scope: independently named, disposable Operational/Journal fixture and four isolated Legacy-compatible restore tables in Ntgre; exact resource identities, synthetic subjects/keys, IAM expiry, cost/resource delta, retained artifacts and cleanup approval must be separately reviewed. **No tables are created by this task.** Using the real Legacy source or changing actual Legacy authority is prohibited.

Use the candidate transaction path with isolated test transports/configuration that cannot name the real source/target; the current runtime hard-binds existing target tables, so a separately reviewed rehearsal bundle/selector is required. Do not casually override environment table names in the accepted artifact.

Create one Team, Manager, Coach, Players, starter/substitute guards, champion entry and team-visible assessment; perform update, revocation, reassignment, replay and deletion. Confirm synthetic TARGET_WRITER commits, then FROZEN denies both ordinary/new requests and stale epoch retries. Export, reverse-transform, restore into the four isolated schemas and reconcile complete fields/keys/hashes. Include negative fixtures for unknown field, unsupported version, private note, corrupt/dangling membership, duplicate starter, omitted page and new unexpected record. Validate the old-protocol replay guard before claiming state-authority rollback ready.

After acceptance, retain encrypted recovery proof and sanitized digests, disable test access, delete only the reviewed temporary fixture resources and verify their absence. Preserve actual Ntgre tables, Cognito and authority throughout. Live rehearsal execution needs separate authorization and has **not** been performed. Readiness today: procedure and offline transforms prepared; live rehearsal candidate/security/restore targets and proof outstanding.
