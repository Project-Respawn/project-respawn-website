## Corrected R2 execution accepted — 20 October 2026

**PRODUCTION R2 RESTORE ACCEPTED — READY FOR PRODUCTION CORE/TEAM HUB DEPLOYMENT REVIEW**

Independently verified 2026-10-20T21:10:43.011Z. [Explicit amendment](team-hub-production-evidence-2026-10-20/R2-resumption/authorization.json), [fixed resumption receipt](team-hub-production-evidence-2026-10-20/R2-resumption/execution.json), [independent verification](team-hub-production-evidence-2026-10-20/R2-resumption/independent-result.json). Earlier stop/preparation sections below are preserved history, not the current result.

### Authorization, pins and execution

Account 058264289478, eu-north-1, RavenTest. Corrected manifest `7f21d94f6664916c16510f33b3abf253f1dabbb38ab378c91f0c12b1524c7a67`, candidate `70b2abfbd55b660eab2401b15c2a0cafaa4aec62b405950791433ad796fbe91e`, executor `a5e13b42d94f90c5d82a2b0fa7f7b7a51e5148984624c583f39cad5a30827362`; all 44 pinned input artifacts verified unchanged. The explicit user amendment and existing exclusive administrative window were recorded without inventing a user signature timestamp. Fresh source identities, protections, backup bindings, reserved-table ownership/absence, production identity/hosting/stack baselines and owner-only encryption preflight passed.

The existing Team table with TableId e5f9ef58-c81b-4190-bb72-1473371e4c8a was reused and independently reverified; it was **not restored again**. Four new restricted sessions were issued: cleanup-only Team plus the three reviewed restore sessions, all with 7,200-second duration. Exactly three RestoreTableFromBackup calls created the remaining reserved tables. Across both attempts: four successful restore calls and five restricted session issuances. No write retry, lost-session recovery, automatic renewal, IAM broadening or parent-credential restore/delete fallback occurred.

### Restore and capture-point verification

| Model | Restored records | Capture digest | Schema/indexes | Recovery table cleanup |
| --- | ---: | --- | --- | --- |
| Team | 1 | Matched | Verified | Deleted; absence confirmed |
| TeamMembership | 8 | Matched | Verified | Deleted; absence confirmed |
| TeamRosterSlot | 11 | Matched | Verified | Deleted; absence confirmed |
| PlayerChampionPoolEntry | 101 | Matched | Verified | Deleted; absence confirmed |

Each physical table identity and source backup attribution was verified through the direct create receipt plus live restore-source metadata or uniquely matching successful CloudTrail request. Disappearance of RestoreSummary after ACTIVE is handled only with the attributable evidence captured in each receipt. No absent CloudTrail response fields were invented. All key attributes, index names/keys/projections, billing and two ACTIVE GSIs per table passed. AWS-owned default encryption was preserved without KMS permission expansion.

All 121 restored records matched the per-table R1 digests around each backup's capture. Complete identities/relationships, production transformation compatibility, 122-item target projection and reverse roundtrip passed. Source digest `9d7f52ba2cfc9eb011e53f1807ac4e4bd798951144f1b304fb100f0a6474e109`; target projection digest `d685856ace4a0115a1f5618d979994dde900891e3fdf17bb6575377677ac3049`. No target items were imported. Four backups remain independent capture points; no atomic cross-table snapshot claim. Current live source counts/digests also match their backup captures, with no observed differences or source changes during R2.

Four complete datasets were retained only as Git-ignored CurrentUser-DPAPI ciphertext in owner-only local custody. Each archive was independently decrypted in memory and its raw digest reverified; context/ciphertext hashes remain in sanitized evidence. The earlier Team post-stop encrypted receipt is retained as history. No raw production records, credentials or personal identifiers entered source-controlled evidence. These owner/machine-bound verification archives are not portable disaster-recovery key custody; native backups remain retained.

### Cleanup and preservation

All content/relationship/transform/encryption gates passed before deletion. Fresh exact TableId/ARN/creation/provenance receipts and content/encrypted-custody checks gated each DeleteTable. Exactly four owned recovery tables were deleted through their restricted sessions; executor and independent observer confirmed all four reserved names absent. No source table or backup was deleted.

Source tables remain ACTIVE with PITR and deletion protection enabled, schemas preserved and 1/8/11/101 records unchanged. All four exact native backups remain AVAILABLE. Production Cognito and Master/observed protected CloudFormation baselines matched before/after. Independent remote Master remains `a83a874dad50395518fb0d7e2f1e853cf6bf2513`. No permanent IAM resource was created or changed. Credentials stayed in process memory and their objects were cleared on exit; session expiration times are recorded, with no immediate-revocation claim.

No production source/item writes, backup deletion, Cognito changes, independent Core/Team deployment, authority change, Master merge/publication or Legacy retirement occurred. R1 protection remains intact. Do not rerun either immutable executor; preserve both historical attempts and receipts.

### Remaining production stages

R1 and R2 backup/restore protection are accepted. The production Core/Team draft still requires exact artifact/secret/IAM/bootstrap binding and independently inspected deployment/security approval. Isolated restores do not recreate service integrations, streams, TTL, resource policies or alarms automatically. Production nonempty migration/reverse rehearsal, writer-fence proof, conditional authority/data cutover, frontend-only Master release and live business acceptance remain separate gates. This result does not authorize those writes.

## R2 execution blocked — recovery state recorded

**PRODUCTION R2 BLOCKED — PINNED STS NAME LIMIT AND RESTORE-PROVENANCE GATE**

Original authorized manifest `c9cf39fb86f90d26ce582d9828b33e3ccd133e4a829e34919b6694c4f3df4bc7` and all 30 input artifact hashes verified unchanged. The exact R2 approval and exclusive administrative window were recorded at actual processing time. Fresh source/backup/custody/protected preflight passed. One restricted session issued and one RestoreTableFromBackup call succeeded. No other restore or DeleteTable call occurred.

### Demonstrated defects and stop

The pinned ChampionPool session name, RespawnR2-PlayerChampionPoolEntry, is 33 characters. STS permits 2–32 characters. This is a preparation error in the package, not an IAM denial; IAM simulation did not validate the STS request-length constraint. It was detected before that call was attempted. The specific executor process was stopped to prevent further writes; the first AWS restore continued independently to ACTIVE. Its original in-memory session credentials were lost and have not been recovered, persisted or renewed.

A second incorrect assumption was observed: DescribeTable no longer returned RestoreSummary once the owned table was ACTIVE. The original strict summary-dependent verification/cleanup gate could not accept this supported observed state. No claim of successful full R2 or cleanup is made. [AWS STS Name constraints](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetFederationToken.html).

### Actual preserved state

- Existing owned table: `ProjectRespawn-TeamHub-Production-Team-RecoveryProof-20261020`.
- Physical TableId: `e5f9ef58-c81b-4190-bb72-1473371e4c8a`; state ACTIVE, both GSIs ACTIVE.
- One restored record and full key/attribute/index/billing schema verified against the R1 capture. Raw digest `8f202d72f19f9a04cfaf2709a3a5df497ed477ab82f592e59aa4485c24d13994`. Owner-only CurrentUser-DPAPI encrypted evidence and decrypt roundtrip preserved; no raw records persisted.
- Other three recovery table names remain absent. No target item was manually written or modified.
- Four source tables remain ACTIVE/PITR-enabled/deletion-protected; 1/8/11/101 source records and schemas preserved. Four native backups remain AVAILABLE.
- Cognito, Master `a83a874dad50395518fb0d7e2f1e853cf6bf2513` and all 325 observed CloudFormation baselines remain unchanged. No permanent IAM, Cognito, domain, authority or Master change.

The remaining owned table is intentionally retained. The approved fixed executor forbids parent-credential restore/delete fallback, lost-session renewal and unverified cleanup. A replacement cleanup session and changed immutable artifacts require the narrow amendment below. No source table or backup is at risk from leaving this isolated copy retained.

### Attributable restore proof

[Sanitized CloudTrail receipt](team-hub-production-evidence-2026-10-20/R2/restore-audit.json) confirms exactly one successful RestoreTableFromBackup at 2026-10-20T20:43:03Z, original restricted principal `arn:aws:sts::058264289478:federated-user/RespawnR2-Team`, exact backup and target name. Request ID `8GCGDEHTLSFMMUC6NL6JHBGR97VV4KQNSO5AEMVJF66Q9ASUAAJG`, event ID `361d0878-1770-46df-8799-00398f9f01f9`. CloudTrail contains no response table ID here; join its unique successful request to the fixed executor's direct API TableId receipt and current identical TableId. Do not invent a missing CloudTrail field or silently substitute a temporary principal. [Post-stop source/target evidence](team-hub-production-evidence-2026-10-20/R2/stopped-result.json), [protected-state checks](team-hub-production-evidence-2026-10-20/R2/post-stop-preservation.json). Cross-table restore relationships and 121-record transformation acceptance remain pending the other three restores.

### Corrected resumption package — prepared, not executed

- Manifest SHA-256: `7f21d94f6664916c16510f33b3abf253f1dabbb38ab378c91f0c12b1524c7a67`.
- Candidate SHA-256: `70b2abfbd55b660eab2401b15c2a0cafaa4aec62b405950791433ad796fbe91e`.
- Executor SHA-256: `a5e13b42d94f90c5d82a2b0fa7f7b7a51e5148984624c583f39cad5a30827362`.
- [Exact new manifest](team-hub-production-evidence-2026-10-20/R2-resumption/manifest.json), [security](team-hub-production-evidence-2026-10-20/R2-resumption/security.json), [validation](team-hub-production-evidence-2026-10-20/R2-resumption/validation.json).

Reuses the one exact owned Team table; no repeat Team restore. New TeamCleanup session permits only DescribeTable, Scan and DeleteTable on that exact recovery ARN, with explicit outside-resource/action/principal denials. Three remaining restore policies retain their exact backup/table scope; only the overlength ChampionPool principal is shortened. All STS names and policy sizes are validated before any issuance. Four additional bounded sessions are proposed, making five across the stopped and future attempts. No permanent or runtime IAM broadening.

Corrected ownership requires matching direct creation TableId plus actual live restore-source evidence or uniquely matching successful CloudTrail request attribution if RestoreSummary disappears. Missing/contradictory provenance, multiple events, changed IDs, undeclared targets, missing content/encrypted evidence or unexpected source changes fail closed. Complete source/relationship/transform and encrypted-custody verification still precede deletion. Three remaining exact restores, four owned deletions, source/backup preservation and no automatic write retry/session renewal remain mandatory. CloudTrail delivery is polled within a bounded window; missing delivery holds acceptance, not assumed success.

20 focused correction tests and 1,664 IAM checks passed; Access Analyzer zero blocking findings. The correction and extra cleanup session have not executed and are not inferred authorized from the original manifest.

### Exact required amendment

> I authorize corrected R2 resumption manifest 7f21d94f6664916c16510f33b3abf253f1dabbb38ab378c91f0c12b1524c7a67 for account 058264289478, eu-north-1, through RavenTest. Reverify the existing owned Team recovery table without restoring it again; issue four additional restricted sessions up to 7,200 seconds each, including the cleanup-only Team session; restore only the three remaining pinned backups; verify all four datasets and encrypted custody; then delete only the four verified receipt-owned recovery tables. This permits five session issuances across both attempts, with no renewal or reuse of the lost original credentials. I confirm no concurrent administrative changes during resumption. Retain all production source records, protections and backups; no permanent IAM, Cognito, domain, authority or Master changes.

The original preparation report below is historical. It must not be read as current authorization or proof of all four restores/cleanup.

# Project Respawn Team Hub production R2 result

**PRODUCTION R2 AWAITING EXECUTION AUTHORIZATION**

Prepared 2026-10-20T20:40:38.721Z. This task performed read-only AWS inspection and offline/local testing only. R1 remains accepted. No R2 session credentials issued, restore started, recovery table created/deleted or production write performed. [R1 result](team-hub-production-r1-result.md), [R2 manifest](team-hub-production-evidence-2026-10-20/R2/manifest.json), [fresh backup/source verification](team-hub-production-evidence-2026-10-20/R2/backup-preflight.json), [security](team-hub-production-evidence-2026-10-20/R2/security.json), [preservation](team-hub-production-evidence-2026-10-20/R2/preservation.json), [tests](team-hub-production-evidence-2026-10-20/R2/validation.json).

## Exact pins and proposed resources

- Manifest SHA-256: `c9cf39fb86f90d26ce582d9828b33e3ccd133e4a829e34919b6694c4f3df4bc7`.
- Candidate SHA-256: `8da6c6bd1f6f911a83ad7a2cb59e7ffb65a31be433b646417f3d74a447ba0c7d`.
- Executor SHA-256: `28b57256fa158fedf3125d5fb522aef04e1585b69b42b42d57e00e1770f2ce4a`.

| Source | Exact reserved restore table | R1 capture expectation |
| --- | --- | ---: |
| Team | `ProjectRespawn-TeamHub-Production-Team-RecoveryProof-20261020` | 1 |
| TeamMembership | `ProjectRespawn-TeamHub-Production-TeamMembership-RecoveryProof-20261020` | 8 |
| TeamRosterSlot | `ProjectRespawn-TeamHub-Production-TeamRosterSlot-RecoveryProof-20261020` | 11 |
| PlayerChampionPoolEntry | `ProjectRespawn-TeamHub-Production-PlayerChampionPoolEntry-RecoveryProof-20261020` | 101 |

Every RestoreTableFromBackup request has only its exact BackupArn and TargetTableName. No schema, billing, index or encryption override is supplied. Exact backup ARNs, approved names, source ARN/TableId bindings and per-table R1 raw digests are in the immutable candidate. All four backups remain AVAILABLE, sources ACTIVE with PITR/deletion protection enabled, all four reserved names absent and installed source key/index/billing schemas unchanged. No R1 operation was repeated.

## Minimum execution security

No permanent role, runtime IAM or permissions boundary change is proposed. RavenTest obtains one memory-only GetFederationToken session per pair, passing its exact inline session policy. Parent long-term IAM credential kind and current GetFederationToken/required restore permissions were checked without printing or persisting credential values. Each session expires after at most 7,200 seconds; no automatic session renewal. Exact policy sizes are 1403, 1453, 1453, 1498 characters, below 2,048.

Each session can restore/describe only its single source backup and operate only on its single isolated destination. Explicit Deny guards reject other resources, actions and principal ARNs. Source table writes/deletion, other backups/recovery destinations, Ntgre/foreign domains, backup deletion, IAM/PassRole, Cognito and KMS administration/decryption are not granted. Seven DynamoDB item read/write dependencies are permitted only on the isolated table because AWS documents them for restoration; the fixed executor has no manual PutItem/UpdateItem/DeleteItem/BatchWriteItem call path. Parent credentials perform only approved read-only observation and exact STS session issuance, never restore/delete.

Access Analyzer returned zero findings across four policies. 1,080 custom-policy positive/negative rows passed, including cross-pair real backup/target resources and wrong principal. Parent identity simulations passed all required positives. A simulation does not instantiate the session or certify every service/organization/encryption-layer decision; real access remains an execution gate. The exact federated principal is verified before each restore.

AWS references: [restore permissions and dependent target operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/backuprestore_IAM.html), [GetFederationToken requirements/session intersection/limits](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetFederationToken.html), [federated aws:PrincipalArn](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-principalarn).

## Verification and cleanup plan

1. Verify every artifact hash before launching; require separate exact-manifest approval, correct account/region/operator and fresh expiry, exclusive administrative window, absent execution receipt, all reserved names absent, backups AVAILABLE, source identities/schemas/protections and protected baselines. Prove local private ACL/encryption roundtrip before the first restore.
2. Mint the four per-pair sessions sequentially as needed. Record only principal, expiry and policy digest; credentials stay in process memory. Restore each exact pair once with write retry count one. Persist intent/creation receipts; stop on ambiguous failure, unexpected principal, denial or identity change.
3. Bounded read-only polling waits for ACTIVE, finished RestoreSummary and ACTIVE GSIs; allow documented initial DescribeTable metadata visibility delay. Verify physical TableId/ARN and SourceBackupArn, all key attributes, index names/keys/projections and billing. No source or restored item mutations.
4. Strongly consistent full scans verify 1/8/11/101 expected capture records and R1 per-table canonical raw digests. The restored records themselves establish backup-content evidence only after execution. Validate all four models together using the pinned production transform and live-state codec, relationship checks, 121-to-122 projection and roundtrip. Pinned verifier-only source snapshots replace reliance on an untracked local synthesis cache; no product/runtime is deployed.
5. Compare current live rows separately and report matching/different counts/digests. Live source changes since capture are not automatically backup corruption; unexpected source changes during R2 stop acceptance. The four backups are not an atomic cross-table snapshot. If the restored capture differs from the bracketed R1 expectation, hold acceptance rather than silently adopting it.
6. Save each raw restored table only as CurrentUser-DPAPI ciphertext in Git-ignored owner-only local custody, with manifest/backup-bound entropy and successful decrypt/hash roundtrip. Persist only sanitized digests and ciphertext receipts in Git evidence. This owner/machine-bound verification archive is not a portable disaster-recovery key archive; native AWS backups remain retained. Wrong-context/tamper controls and strict ACL readback passed with synthetic data in the real owner context.
7. Before each DeleteTable, require an exact creation receipt, fresh ARN/TableId/SourceBackupArn match, ACTIVE state, completed content verification and encrypted-custody receipt. Delete only the exact reserved name using its per-pair session, then confirm ResourceNotFound terminally. DeleteTable has no atomic TableId precondition: the exclusive administrative window and fresh identity check are mandatory; do not claim immunity to a concurrent administrator replacing the name.
8. Re-read source records/schema/protections, backups, Cognito, Master and protected-stack baselines. Clear credential objects from memory; sessions expire naturally, no IAM resource needs removal. If failed, preserve sanitized partial receipts and encrypted owned evidence; do not automatically retry, broaden permissions, renew sessions or delete unverified/unowned tables. Record any leftover exact resources for separate recovery review.

Native restore does not recreate all operational settings such as streams, TTL, tags, IAM or alarms; this isolated data/key/index proof deliberately does not configure those settings or deploy production service integrations. AWS [RestoreTableFromBackup documentation](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_RestoreTableFromBackup.html) lists the manual setup requirements. Actual encryption configuration is a live gate; no KMS exception is added to make a restore pass.

## Results and remaining gates

54 offline/local tests passed; syntax and migration-ledger checks passed. No runtime/TypeScript/frontend code changed, so accepted product build/regression evidence was preserved rather than rerun. Cognito, remote Master `a83a874dad50395518fb0d7e2f1e853cf6bf2513` and 325 observed stack baselines matched R1. Secret scan and documentation validation are recorded alongside this report. Restore/schema/content/relationship/cleanup results are **not yet live verified**.

After R2 acceptance, production Core/Team templates still need exact production artifact/secret/IAM binding and independent deployment/security review. Business authority, writer fences, production state migration, frontend release and Master publication remain separate authorization gates. R2 success alone does not authorize those stages.

## One consolidated approval request

> I authorize R2 manifest c9cf39fb86f90d26ce582d9828b33e3ccd133e4a829e34919b6694c4f3df4bc7 for account 058264289478, eu-north-1, through RavenTest: four exact restricted federation sessions of up to 7,200 seconds each, four restores from the pinned R1 backups into the reserved RecoveryProof names, verification and owner-only CurrentUser-DPAPI encrypted local evidence, followed by deletion of only the four receipt-owned verified recovery tables. I confirm no concurrent administrative changes during this lifecycle. Retain production source data, protections and all four backups. No permanent IAM, Cognito, domain deployment, authority or Master changes are authorized.

No R2 AWS writes will occur until that scope is explicitly approved. The historical R1 authorization does not authorize this package.
