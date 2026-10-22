# Project Respawn Team Hub production R1 result

**PRODUCTION R1 RECOVERY PROTECTION ACCEPTED — READY FOR R2 RESTORE REVIEW**

Independently verified 2026-10-20T20:27:59.235Z. Account 058264289478, eu-north-1; operator `arn:aws:iam::058264289478:user/RavenTest`. [Authorization](team-hub-production-evidence-2026-10-20/R1-live/authorization.json), [preflight](team-hub-production-evidence-2026-10-20/R1-live/preflight.json), [desired-schema comparison](team-hub-production-evidence-2026-10-20/R1-live/desired-schema-verification.json), [fixed executor receipt](team-hub-production-evidence-2026-10-20/R1-execution.json), [independent verification](team-hub-production-evidence-2026-10-20/R1-live/independent-verification.json).

## Exact approved artifacts

- Recovery package SHA-256: `970e6960dbed8d705cb2b1cc489e49ee4cd78c3617d816bc086984297e7326a5`.
- Executor SHA-256: `2ec135f822677b6732e438c3414e15c72810033dc20135324da4d9db168ced0f`.

Both remained byte-identical. All historical preparation manifest hashes passed before execution. The R1-specific user authorization was recorded at actual receipt-processing time; no user signature timestamp was invented. The fixed executor ran once, with SDK write attempts limited to one and no automatic ambiguous-write retries. No IAM change or artifact rebuild occurred.

## Fresh preflight and execution

All four exact table ARNs/TableIds, keys, attribute definitions and two GSIs each were verified. The source definitions are Custom::AmplifyDynamoDBTable resources; desired key/index definitions matched installed DynamoDB schemas. The new read-only checker initially used an incorrect plural index name for PlayerChampionPoolEntry; it was corrected against actual installed and desired definitions before any write. The pinned write executor was not changed.

All 121 source records matched the accepted canonical source digest, with relationships intact. PITR and deletion protection were disabled; backup inventory was empty. No prior execution receipt, conflicting approved backup name, active CloudFormation operation or running Master deployment was observed. These checks observe administrative activity; they do not lock out other administrators.

The executor completed exactly four UpdateContinuousBackups, four UpdateTable and four CreateBackup operations. UpdateTable bodies contained only TableName and DeletionProtectionEnabled=true. No other table configuration or item writes were performed.

| Source | Records preserved | PITR | Deletion protection | State |
| --- | ---: | --- | --- | --- |
| Team | 1 | ENABLED | Enabled | ACTIVE |
| TeamMembership | 8 | ENABLED | Enabled | ACTIVE |
| TeamRosterSlot | 11 | ENABLED | Enabled | ACTIVE |
| PlayerChampionPoolEntry | 101 | ENABLED | Enabled | ACTIVE |

## Independently verified backups

| Source | Status | Exact retained backup ARN |
| --- | --- | --- |
| Team | AVAILABLE | `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-lte47f3mgbbvxehfgz476en3xy-NONE/backup/01792527947116-43f6eb02` |
| TeamMembership | AVAILABLE | `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-lte47f3mgbbvxehfgz476en3xy-NONE/backup/01792527948497-eda960ad` |
| TeamRosterSlot | AVAILABLE | `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-lte47f3mgbbvxehfgz476en3xy-NONE/backup/01792527949892-3c2d8f3a` |
| PlayerChampionPoolEntry | AVAILABLE | `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-lte47f3mgbbvxehfgz476en3xy-NONE/backup/01792527951273-7b424a61` |

Each DescribeBackup matched the approved backup name, exact source table ARN and TableId, and its CreateBackup receipt. ListBackups independently returned exactly the expected backup per source table. Full sanitized source/backup metadata and PITR recovery boundaries are retained in the verification receipt. No backup or source was deleted.

## Preservation and limitations

Strongly consistent full scans before/after matched raw-item digests and canonical transformation digests: 1 Team, 8 memberships, 11 roster slots and 101 champion-pool entries. Relationships and reverse-transform preparation remained valid. No raw records or personal identifiers were persisted. Source key/index/billing/stream/encryption/class properties matched preflight.

Production Cognito pool/client configuration and aggregate user-status baseline matched before/after. Remote Master remains `a83a874dad50395518fb0d7e2f1e853cf6bf2513`; Master Amplify job history and all observed CloudFormation stack baselines were unchanged. The fixed executor permits no IAM, Cognito, CloudFormation, item-mutation, restore or domain-deployment API. Read-only comparisons are not a blanket certificate of all unrelated external AWS activity.

Protection changes were explicitly made in place outside CloudFormation; the old custom-resource template still declares deletion protection false and has not been deployed or rewritten. Future Legacy updates must preserve these live safeguards. Do not run a broad Legacy deployment or disable protections to reconcile this intentional difference.

The immutable executor's final acceptance field remains its original PENDING_INDEPENDENT_AVAILABLE_BACKUP_AND_RESTORE_PROOF wording. This separate independent result accepts **R1 protection and AVAILABLE backups only**. R2 live restore/content proof remains incomplete. Backups are independent per-table capture points while Legacy writers remain active; no atomic cross-table snapshot or restoration success is claimed.

## Required R2 review

Pin these four verified backup ARNs to their reviewed reserved RecoveryProof table names. Separately review restore/read/receipt-owned cleanup IAM and authorize four isolated restores, schema/index and complete content/relationship reconciliation, recovery custody and only owned temporary-table cleanup. Refresh source deltas and capture-time differences; do not infer restored-content equality from backup availability. Retain source tables, protections and backups.

No R2 restore, independent Core/Team deployment, authority initialization/transition, frontend activation, Master merge/publication or Legacy retirement occurred.
