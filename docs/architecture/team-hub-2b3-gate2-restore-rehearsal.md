# PROJECT RESPAWN TEAM HUB 2B3 — RESTORE REHEARSAL RESULT

**PASS — 4/4 restores, structures and count reconciliations; 4/4 temporary tables deleted. Gate 3 not started.**

Account 058264289478; region eu-north-1; profile default; principal arn:aws:iam::058264289478:user/RavenTest. Only Gate 2 was authorized. Source tables remain Legacy-authoritative. This was a recovery rehearsal, not migration, target deployment, cutover or retirement.

## Gates and permissions

Before any restore, fresh preflight proved Legacy 2,621 resources / FunctionDirectiveStack 167, Team Hub CREATE_COMPLETE with 11 product +5 security resources / API t54b88casf, Tournament UPDATE_COMPLETE with 11 resources / API msipnwy39j. Source PITR/deletion protection were enabled, identities/schema/indexes/streams/encryption unchanged, exact backups AVAILABLE and every target name absent. Two complete strongly consistent COUNT passes per source were zero; logos zero. Other 51 table protections were unchanged.

The execution gate was output as READY TO EXECUTE TEAM HUB RESTORE REHEARSAL before four RestoreTableFromBackup calls. After evidence capture, a separate cleanup gate was output as READY TO CLEAN UP RESTORE TABLES before deletion. No further permission was needed because the user's request conditionally authorized both gates.

Existing operator authority was used without a new role, grant or IAM mutation. Seventeen simulated actions over four resources each produced 68 allowed resource-specific decisions. The operator is not an IAM-sandboxed rehearsal identity: exact scope is enforced by the command allowlist, backup/target pairing, absence checks and table-ID/restore-origin receipts.

Required actions: RestoreTableFromBackup on the exact source-backup/target pairs; DescribeBackup on the four backups; DescribeTable, DescribeContinuousBackups, DescribeTimeToLive, ListTagsOfResource, GetResourcePolicy and Scan/COUNT on the scoped tables; DeleteTable on the four temporary tables; UpdateTable only to disable temporary-table deletion protection if needed. Restore's dependent DynamoDB data permissions were checked on the temporary destinations; no application PutItem/UpdateItem/DeleteItem calls occurred. No Cognito/AppSync/business-KMS grants or changes. [AWS restore authorization](https://docs.aws.amazon.com/service-authorization/latest/reference/list_dynamodb.html).

## Restore and data proof

| Model | Observed state | Two restored counts | Structure | Request to observed ACTIVE | Cleanup |
|---|---|---|---|---:|---|
| PlayerChampionPoolEntry | ACTIVE | 0 / 0 | PASS | 375.2 s | Deleted |
| TeamMembership | ACTIVE | 0 / 0 | PASS | 373.8 s | Deleted |
| Team | ACTIVE | 0 / 0 | PASS | 216.7 s | Deleted |
| TeamRosterSlot | ACTIVE | 0 / 0 | PASS | 215.4 s | Deleted |

Durations are observed upper bounds including polling delay, not AWS completion timestamps or an RTO guarantee. DynamoDB RestoreDateTime identifies the restored backup point; it is not the elapsed restore duration. All table and GSI states were ACTIVE before validation. All four RestoreSummary source-backup/source-table ARNs matched the exact approved inputs.

### PlayerChampionPoolEntry

- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Backup: `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235216394-994ee269` (AVAILABLE, 0 bytes)
- Temporary table: `arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-RestoreTest-PlayerChampionPoolEntry-20261005`
- Table ID: `4d7b4443-2b55-4d9e-a2b7-bad8c26b923c`
- Restore requested: 2026-10-05T21:32:55.360Z; observed ACTIVE: 2026-10-05T21:39:10.532Z; creation: 2026-10-05T21:32:56.486Z.
- Key/index/attribute definitions, encryption, billing and table class: PASS.
- Restored streams: {"StreamEnabled":false}; PITR: DISABLED; deletion protection: false; tags: 0; TTL: DISABLED.
- Billing: PAY_PER_REQUEST; table class: STANDARD; encryption: {"type":"AWS_OWNED_DEFAULT"}.
- Differences: streams — CONFIGURATION_REQUIRES_REAPPLICATION; PITR — CONFIGURATION_REQUIRES_REAPPLICATION; deletionProtection — CONFIGURATION_REQUIRES_REAPPLICATION; tags — CONFIGURATION_REQUIRES_REAPPLICATION.
- Cleanup: confirmed ResourceNotFound after deletion; original source and backup retained.

### TeamMembership

- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Backup: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235217751-89f39a2b` (AVAILABLE, 0 bytes)
- Temporary table: `arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-RestoreTest-TeamMembership-20261005`
- Table ID: `913a9341-be2e-43ba-b68c-c10d739266a2`
- Restore requested: 2026-10-05T21:32:56.731Z; observed ACTIVE: 2026-10-05T21:39:10.532Z; creation: 2026-10-05T21:32:57.853Z.
- Key/index/attribute definitions, encryption, billing and table class: PASS.
- Restored streams: {"StreamEnabled":false}; PITR: DISABLED; deletion protection: false; tags: 0; TTL: DISABLED.
- Billing: PAY_PER_REQUEST; table class: STANDARD; encryption: {"type":"AWS_OWNED_DEFAULT"}.
- Differences: streams — CONFIGURATION_REQUIRES_REAPPLICATION; PITR — CONFIGURATION_REQUIRES_REAPPLICATION; deletionProtection — CONFIGURATION_REQUIRES_REAPPLICATION; tags — CONFIGURATION_REQUIRES_REAPPLICATION.
- Cleanup: confirmed ResourceNotFound after deletion; original source and backup retained.

### Team

- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Backup: `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235219062-e8ba36b4` (AVAILABLE, 0 bytes)
- Temporary table: `arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-RestoreTest-Team-20261005`
- Table ID: `b49689ca-c934-4baa-a36b-a4f9c9c33a4e`
- Restore requested: 2026-10-05T21:32:58.096Z; observed ACTIVE: 2026-10-05T21:36:34.812Z; creation: 2026-10-05T21:32:59.177Z.
- Key/index/attribute definitions, encryption, billing and table class: PASS.
- Restored streams: {"StreamEnabled":false}; PITR: DISABLED; deletion protection: false; tags: 0; TTL: DISABLED.
- Billing: PAY_PER_REQUEST; table class: STANDARD; encryption: {"type":"AWS_OWNED_DEFAULT"}.
- Differences: streams — CONFIGURATION_REQUIRES_REAPPLICATION; PITR — CONFIGURATION_REQUIRES_REAPPLICATION; deletionProtection — CONFIGURATION_REQUIRES_REAPPLICATION; tags — CONFIGURATION_REQUIRES_REAPPLICATION.
- Cleanup: confirmed ResourceNotFound after deletion; original source and backup retained.

### TeamRosterSlot

- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Backup: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235220353-eb86c1ac` (AVAILABLE, 0 bytes)
- Temporary table: `arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-RestoreTest-TeamRosterSlot-20261005`
- Table ID: `eefc3aaf-a182-4705-8a7f-ca9bd8fc19fe`
- Restore requested: 2026-10-05T21:32:59.443Z; observed ACTIVE: 2026-10-05T21:36:34.812Z; creation: 2026-10-05T21:33:00.494Z.
- Key/index/attribute definitions, encryption, billing and table class: PASS.
- Restored streams: {"StreamEnabled":false}; PITR: DISABLED; deletion protection: false; tags: 0; TTL: DISABLED.
- Billing: PAY_PER_REQUEST; table class: STANDARD; encryption: {"type":"AWS_OWNED_DEFAULT"}.
- Differences: streams — CONFIGURATION_REQUIRES_REAPPLICATION; PITR — CONFIGURATION_REQUIRES_REAPPLICATION; deletionProtection — CONFIGURATION_REQUIRES_REAPPLICATION; tags — CONFIGURATION_REQUIRES_REAPPLICATION.
- Cleanup: confirmed ResourceNotFound after deletion; original source and backup retained.

## Structural differences and recovery procedure

Keys, attributes, both GSIs per table, index projections, encryption, PAY_PER_REQUEST billing and STANDARD class match. Restored operational settings are recorded above and in the complete metadata evidence; missing streams/tags/PITR/deletion protection are classified CONFIGURATION_REQUIRES_REAPPLICATION with EXPECTED_RESTORE_BEHAVIOR, not silently assumed inherited. No unexpected structural difference was accepted. Disposable rehearsal tables were not wired into application infrastructure and operational settings were not enabled merely to delete them shortly afterwards. AWS documents configuration that must be set up on restored tables. [Restore API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_RestoreTableFromBackup.html), [restore configuration](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/pointintimerecovery_restores.html).

Proven runbook:

1. Verify exact backup ARN/status/source identity and retain the source configuration manifest.
2. Verify operator permission and an isolated, absent target name; review the restore gate.
3. Call RestoreTableFromBackup with that exact backup/target pair and preserve the returned table identity.
4. Wait for table and every index ACTIVE; verify RestoreSummary and receipt-bound identity.
5. Compare keys/attributes/index definitions, billing/class/encryption and operational configuration; perform complete strongly consistent counts.
6. Before any real recovered table is used, separately authorize and reapply required PITR, deletion protection, streams/TTL/tags, consumer permissions and monitoring, then verify them. This operational reapplication was documented, not exercised on disposable targets.
7. Reconcile application records, relationships, privacy semantics and any acknowledged writes since the recovery point. This empty-source rehearsal cannot prove nonempty reconciliation or replay.
8. Make an explicit, separately authorized writer/reader authority decision; never connect a restored table or enable two writers automatically.
9. For a rehearsal only, output the cleanup gate, recheck exact table IDs and backup origins, disable deletion protection only on those temporary tables if required, delete them, and wait until all are absent. Retain original backups.

Backup readability, successful restore, restored empty-table readability and structure are proven. Operational reapplication, nonempty application reconciliation and authority cutover are not claimed proven.

## Cleanup and source after

Temporary tables created: 4. Deleted: 4. Remaining: 0. Cleanup used 0 temporary deletion-protection disable calls and four DeleteTable calls. No source-table protection update or backup deletion occurred. Fresh cleanup checks bound exact table IDs, original backup/source ARNs, ACTIVE state and two empty count passes before deleting. Evidence was captured first.

Source-after counts: Team 0/0, Membership 0/0, Roster 0/0, Champion 0/0; logos 0. All four original ARNs, keys/indexes/streams/encryption remain unchanged; PITR ENABLED, deletion protection enabled, exact backups AVAILABLE. All 55 table protection configurations equal Gate 2 preflight.

Legacy remains UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167, unchanged root timestamp 2026-09-26T11:52:06.391000+00:00. All 62 deployed templates/physical identities, 62 protected identities and five monitored Lambda hashes/configurations remain unchanged. No CloudFormation deployment occurred; the rejected large change set was not executed. Team Hub and Tournament product/runtime/security are unchanged at the baselines above. Production untouched.

## Accounting, cost and limits

Four temporary standalone tables existed at peak; they were never CloudFormation-owned target resources. Legacy count remained 2,621 throughout. Scoped baseline including Team Hub 11+5 and Tournament 11 is 2,648 declarations; adding four temporary tables gives 2,652 scoped declarations/tables at peak, then returns to baseline. Four existing backup artifacts remain separate. This is not an exhaustive AWS-account inventory.

All four backups report 0 bytes. Restored verification scans reported 56 read-capacity units across eight passes; additional preflight/cleanup/source verification reads are retained in their receipts. Actual invoice/minimum billing is not available in this task, so no zero-cost claim is made. Temporary table lifetime is bounded by the restore and deletion timestamps in the receipts. No new recurring service, alarm, customer KMS key or IAM role was created.

## Evidence

All paths below are metadata/count-only; no row data, credentials or tokens are stored.

- [execution-gate](team-hub-2b3-gate2-evidence-2026-10-05/execution-gate.json)
- [security](team-hub-2b3-gate2-evidence-2026-10-05/security.json)
- [source-before](team-hub-2b3-gate2-evidence-2026-10-05/source-before.json)
- [restore-requests](team-hub-2b3-gate2-evidence-2026-10-05/restore-requests.json)
- [restore-status-history](team-hub-2b3-gate2-evidence-2026-10-05/restore-status-history.json)
- [verification](team-hub-2b3-gate2-evidence-2026-10-05/verification.json)
- [cleanup-gate](team-hub-2b3-gate2-evidence-2026-10-05/cleanup-gate.json)
- [cleanup-precheck](team-hub-2b3-gate2-evidence-2026-10-05/cleanup-precheck.json)
- [cleanup-requests](team-hub-2b3-gate2-evidence-2026-10-05/cleanup-requests.json)
- [cleanup-absence](team-hub-2b3-gate2-evidence-2026-10-05/cleanup-absence.json)
- [source-after](team-hub-2b3-gate2-evidence-2026-10-05/source-after.json)
- [legacy-before](team-hub-2b3-gate2-evidence-2026-10-05/legacy-before.json)
- [legacy-after](team-hub-2b3-gate2-evidence-2026-10-05/legacy-after.json)
- [all-table-protection-after](team-hub-2b3-gate2-evidence-2026-10-05/all-table-protection-after.json)
- [team-baseline](team-hub-2b3-gate2-evidence-2026-10-05/team-baseline.json)
- [tournament-baseline](team-hub-2b3-gate2-evidence-2026-10-05/tournament-baseline.json)

## Migration control

Team Hub recoveryRehearsalAccepted=true and Gate 2 PASSED_CLEANED_UP. Broader m4RecoveryAccepted remains false because this empty-source restore does not prove live authority rollback/reconciliation. Four source tables remain MIGRATION_PREP, LegacyPlatform-authoritative and NOT_ELIGIBLE for retirement. No MIGRATED, CUTOVER_COMPLETE, RETIREMENT_REVIEW or RETIRED state was introduced.

The direct Gate 1 protections remain a documented temporary exception: future Legacy provider updates can reset them. Review before any Legacy deployment. No IAM deployment fence is claimed. Data migration: none. Target deployment: none. Writer fence: none. Frontend change: none. Legacy retirement: none. Production changes: none.

**Next gate: TEAM HUB 2B3 GATE 3 — DARK TARGET CREATION, review only. Gate 3 was not begun.**

## Verifier behaviour and validation

The first completed-table inspection paused locally because RestoreSummary was omitted by AWS after completion. No cleanup ran during that pause. Verification was corrected to require the original AWS restore-response source backup/source table ARNs, matching immutable live TableId, ARN and CreationDateTime, ACTIVE table/indexes, and two empty passes. Any live RestoreSummary, when present, must also match and report no restore in progress. This preserved provenance rather than assuming a name was sufficient. Thirteen offline scope/cleanup guard tests passed, including omitted-summary handling, receipt mismatch, source-table exclusion and nonempty cleanup rejection.

Final [output audit](team-hub-2b3-gate2-evidence-2026-10-05/output-audit.json): 23 guard/ledger tests passed; credential-pattern checks found no matches; local report links resolved. No commit or push was requested or performed.

**TEAM HUB RESTORE REHEARSAL PASSED — READY FOR DARK TARGET REVIEW**
