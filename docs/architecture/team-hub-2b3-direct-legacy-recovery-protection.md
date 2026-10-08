# Team Hub 2B3 — direct temporary Legacy recovery protection

**SUCCESS — four protections and four AVAILABLE backups verified on 5 October 2026.**

The user's subsequent instruction explicitly authorized direct DynamoDB protection and backups instead of the failed broad Legacy change set. Account 058264289478, region eu-north-1, profile default, identity arn:aws:iam::058264289478:user/RavenTest. No CloudFormation execution, direct child-stack update, table replacement, IAM change or production operation occurred.

## Result

| Source model | PITR | Deletion protection | Backup | Bytes |
|---|---|---|---|---:|
| PlayerChampionPoolEntry | ENABLED | Enabled | AVAILABLE | 0 |
| TeamMembership | ENABLED | Enabled | AVAILABLE | 0 |
| Team | ENABLED | Enabled | AVAILABLE | 0 |
| TeamRosterSlot | ENABLED | Enabled | AVAILABLE | 0 |

All four tables remained ACTIVE. Complete consistent COUNT scans before and after returned 0 / 0 / 0 / 0. The existing team-logos/ prefix remained 0 objects. Table ARNs/IDs, keys, GSIs and stream identities were preserved. PITR begins its recoverable history from enablement; these are newly established protections.

## Backups

### PlayerChampionPoolEntry

- Name: `ProjectRespawn-TeamHub-Ntgre-M4-PlayerChampionPoolEntry-20261005-Gate1`
- ARN: `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235216394-994ee269`
- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Created (UTC): 2026-10-05T21:20:16.394Z
- Status: AVAILABLE; size: 0 bytes.

### TeamMembership

- Name: `ProjectRespawn-TeamHub-Ntgre-M4-TeamMembership-20261005-Gate1`
- ARN: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235217751-89f39a2b`
- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Created (UTC): 2026-10-05T21:20:17.751Z
- Status: AVAILABLE; size: 0 bytes.

### Team

- Name: `ProjectRespawn-TeamHub-Ntgre-M4-Team-20261005-Gate1`
- ARN: `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235219062-e8ba36b4`
- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Created (UTC): 2026-10-05T21:20:19.062Z
- Status: AVAILABLE; size: 0 bytes.

### TeamRosterSlot

- Name: `ProjectRespawn-TeamHub-Ntgre-M4-TeamRosterSlot-20261005-Gate1`
- ARN: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE/backup/01791235220353-eb86c1ac`
- Source: `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE`
- Created (UTC): 2026-10-05T21:20:20.353Z
- Status: AVAILABLE; size: 0 bytes.

## Deployment and isolation

Legacy remains UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167, last updated 2026-09-26T11:52:06.391000+00:00. All 62 templates and all physical resource identities match the accepted baseline; 62 protected identities and five monitored Lambda hashes/configurations are unchanged. Comparison of all 55 tables permits exactly the four approved protection changes: the other 51 tables are unchanged.

Team Hub remains CREATE_COMPLETE, 11 product +5 security resources, API t54b88casf; Lambda and security unchanged. Tournament remains UPDATE_COMPLETE, 11 resources, API msipnwy39j; Lambda/security unchanged. Production untouched.

Exactly 12 direct AWS writes occurred: four UpdateContinuousBackups, four UpdateTable (deletion protection only), four CreateBackup. No other backup was created. The earlier blocked change set and six template objects remain as historical preparation artifacts; no execution or deletion/cleanup was attempted.

## Temporary protection contract

**These settings are out of band.** Deployed Legacy custom-resource templates still specify the old desired configuration, and their provider can disable PITR/deletion protection on a later Update. This is now an explicit, user-approved temporary exception rather than an undocumented console change. Before any future Legacy deployment, review that reset risk and the exact plan, then verify protections/backups again. No IAM deployment fence was installed.

The automatic protection helper call/import was removed from amplify/backend.ts, restoring that file's original implementation. The isolated helper, tests and pinned template proposal remain uninstalled review evidence; they are not authorization to deploy current HEAD or the blocked change set.

Later Team Hub cutover and Legacy retirement require their own authorization. The present protection does not transfer data ownership, authorize deletion, prove restore capability, or remove the need for a future retirement plan. Deployed DeletionPolicy/UpdateReplacePolicy remain Delete, not Retain. Keep these backups through the previously documented recovery/rollback retention window; no backup cleanup is authorized here.

## Evidence and control state

- [Fresh preflight](team-hub-2b3-direct-protection-evidence-2026-10-05/before.json)
- [Eight exact protection requests](team-hub-2b3-direct-protection-evidence-2026-10-05/protection-requests.json)
- [Protection verified before backups](team-hub-2b3-direct-protection-evidence-2026-10-05/protections-verified.json)
- [Four backup creation receipts](team-hub-2b3-direct-protection-evidence-2026-10-05/backup-requests.json)
- [Final protection, backup and count verification](team-hub-2b3-direct-protection-evidence-2026-10-05/after.json)
- [All-table isolation](team-hub-2b3-direct-protection-evidence-2026-10-05/all-table-protection-after.json)
- [Legacy isolation](team-hub-2b3-direct-protection-evidence-2026-10-05/legacy-after.json)
- [Team Hub isolation](team-hub-2b3-direct-protection-evidence-2026-10-05/team-baseline.json)
- [Tournament isolation](team-hub-2b3-direct-protection-evidence-2026-10-05/tournament-baseline.json)

Domain status and ownership ledger record DIRECT_RECOVERY_PROTECTED, while all four source tables remain MIGRATION_PREP, Legacy-authoritative and NOT_ELIGIBLE for retirement. m4RecoveryAccepted remains false until restore rehearsal and the required broader recovery proof are accepted.

Data copied: no. Target tables created: no. Writer fence: no. Frontend cutover: no. Legacy retirement: no. Gate 2 started: no. Production touched: no.

**TEAM HUB LEGACY RECOVERY PROTECTED — READY FOR RESTORE REHEARSAL REVIEW**
