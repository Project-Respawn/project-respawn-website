# Team Hub M4 recovery and protection proposal

**Current recovery evidence (Gate 2):** The following proposal is historical. Direct source PITR/deletion protection and four backups were established at Gate 1; Gate 2 restored all four backups, verified empty data and structure, and deleted all four temporary tables. See the [proven recovery procedure and limitations](team-hub-2b3-gate2-restore-rehearsal.md). Live nonempty authority rollback remains unproven.

[Inventory](team-hub-2b3-state-inventory.md) · [migration plan](team-hub-2b3-migration-plan.md) · [START HERE](README-PHASE2-MIGRATION.md)

## Current capability

All four exact source tables have PITR DISABLED, deletion protection false and no backups returned by table-scoped ListBackups. Their custom Amplify resources have DeletionPolicy Delete and UpdateReplacePolicy Delete. No separately managed vault/export/recovery artifact was demonstrated; absence from this table-scoped list is not an exhaustive account-wide AWS Backup vault audit. Streams are enabled but are not a durable backup or an installed replay mechanism. Source logo bucket versioning is unconfigured and the scoped prefix has zero versions.

CloudFormation rollback can restore infrastructure configuration where supported; it is not record/object recovery. Empty observed business state can be reproduced as empty only if a later fence proves no intervening writes. Source code and synthetic fixtures cannot reconstruct missing real personal data. Current supported business-data RPO/RTO: **not established**; destructive loss has no proven recovery bound.

## Exact proposed writes — none performed

| Proposal | Scope | AWS write / gate |
|---|---|---|
| Continuous recovery | Four exact ARNs in table inventory | Four UpdateContinuousBackups calls enabling PITR; inspect provider compatibility and retained recovery window |
| Accidental deletion protection | Same four tables | Four UpdateTable calls enabling DeletionProtectionEnabled; first review custom provider update/delete behavior and future deploy reconciliation |
| Pre-copy immutable checkpoint | Same four tables, after writer freeze | Four CreateBackup calls, record backup ARNs/time/status; include appropriate retention/deletion restrictions |
| Restore proof | Four separately named Ntgre rehearsal tables | Up to four RestoreTableFromBackup calls and metadata/index/row validation; never restore over the sandbox source names; later cleanup separately authorized |
| Retain on lifecycle changes | Four custom-resource declarations | Separate narrowly reviewed Legacy in-place template update for Retain/Retain only after custom-provider behavior review; no blanket schema/regeneration deployment |
| Logo recovery | Exact Team prefix only | Protected manifest plus object/version checksum copy into owned versioned destination if any objects appear; no copy needed for the currently empty prefix |
| Dark destination | Two native tables, private bucket and bucket policy | Separate Team-only change-set gate; retained/protected defaults; no runtime writer rights |

Do not enable versioning on the whole shared bucket as a Team-only shortcut: that affects other domains. Prefer a separately approved Team-owned destination/backup prefix with explicit AES256. Versioning alone does not prevent an authorized version deletion; define custodian restrictions and retention before accepting recovery. Do not add a bucket-wide lifecycle rule to shared storage.

## Cost and operational impact

Observed source payload is zero records/zero metadata bytes, so its size-based estimate is near zero; this is **not a zero-cost guarantee**. Budget uses Stockholm rates at the write gate: source PITR GB-month × four table sizes; retained backup GB-month; restore billed GB; target table/index storage and read/write requests; S3 current/noncurrent bytes and PUT/GET/LIST requests; audit/log ingestion/retention. This inventory consumed 32 reported DynamoDB capacity units. No provisioned capacity, DAX, Kinesis or new customer-managed KMS key is proposed.

The [Stockholm rate-card evidence](team-hub-2b3-evidence-2026-10-05/pricing.json), published 11 September 2026, gives PITR **$0.21/GB-month**, backup **$0.10/GB-month**, restore **$0.162/GB**, Standard storage **$0.269/GB-month** after any applicable free tier, reads **$0.1345/million units** and writes **$0.67/million units**. The 32 scan units price to approximately **$0.000004304**, before credits. As a growth example, four 1-GB source tables would incur $0.84/month PITR plus $0.40/month for one retained backup generation; one restore of each would be $0.648 before service minimums/other charges. Actual observed bytes are zero; this example is not a forecast. Target storage/indexes, S3 versions/requests, audit/logging, retention growth and billing minimums remain additional inputs. Refresh rates and obtain a full calculator estimate before approval. [Official regional price list](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonDynamoDB/current/eu-north-1/index.json).

Suggested operational ceiling for initial empty rehearsal: a separately approved **USD 10 monitoring/budget threshold**, not a predicted bill or spending authorization. Restore/control-plane duration and monitoring costs can dominate an empty migration. [AWS DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/), [backup billing](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/backup-restore-billing.html), [S3 pricing](https://aws.amazon.com/s3/pricing/).

## Recovery acceptance

Before copying: backup AVAILABLE, source schema/index/configuration manifest captured, restore to separately approved targets proven, canonical rows/relationships and object associations reconciled, operator and retention owner named. Record measured restore timings. No backup, PITR change, restore, object copy or protection change was made by M4.

Proposed cutover RPO: 0 acknowledged writes lost, requiring complete fences and final reconciliation. Reserve a **30-minute maintenance window** for initial rehearsal; aim for under 15 minutes of actual write unavailability only after measurement. Reserve **60 minutes for rollback rehearsal**, with a later goal under 30 minutes after a successful timed reverse-write proof. Proposed observation: seven days including all personas and at least one administrative/roster/privacy lifecycle. These are conservative planning targets, not demonstrated SLAs. If restore or reconciliation exceeds the window, remain FROZEN/read-only and escalate; never re-enable stale authority to meet a timer.
