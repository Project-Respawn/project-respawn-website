# PROJECT RESPAWN TEAM HUB 2B3 — DARK TARGET RESULT

Gate 3 PASSED. Two empty, dark, non-authoritative tables created. Legacy remains the sole business authority. Phase 2B4 has not begun.

Account 058264289478; region eu-north-1. Operator RavenTest handled security custody and exact artifact publication. Product preparation/execution used assumed ProjectRespawn-TeamHub-Ntgre-Deploy and execution role ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. No temporary credentials were written to evidence.

## Candidate and independent synthesis

Product SHA256: 6128e0ebdcd24e472fe8ac1f914d7cd9417633c4dac56d4990943bc54a77608b. Security SHA256: 039c3b4cb9ee8d1fa0e2f750e178a8e6906786d916829c8e59e3672a688c322e.

The Team-only CDK include synthesis preserved all eleven accepted resource declarations and added only OperationalTable and JournalTable from the approved final proposal. CDK sorted the new tables' tag arrays; values are unchanged. No Lambda bundling, shared myFunction bundling, Amplify generation, Legacy/Tournament/other-domain synthesis or deployment occurred. The preserved candidate and exact AWS template were compared before execution. Source: [preparer](../../scripts/team-hub-migration/gate3/prepare.mjs), [approved schema](team-hub-2b3-final-evidence-2026-10-05/target-schema.json).

## Security gate and execution

READY FOR TEAM HUB DARK TARGET SECURITY UPDATE was output before execution. AWS planned exactly three in-place modifications: ExecutionBoundary, ExecutionRole and PreparationCaller. The first two install the previously reviewed exact-two-table lifecycle permission set. The caller needed an additional exact template URL/S3-key substitution because its installed policy was pinned to Release 1. This changes no stack scope, trust, PassRole, runtime boundary, API permissions or business data access. Security declarations remain five.

Lifecycle grants: CreateTable, DescribeTable, UpdateTable, DescribeContinuousBackups, UpdateContinuousBackups, DescribeTimeToLive, UpdateTimeToLive, ListTagsOfResource, TagResource and UntagResource on only the two exact Ntgre Team table ARNs. No DeleteTable, item access, foreign table management, business KMS or arbitrary IAM grant was added. Existing reviewed exact API controls remain effective.

Access Analyzer: zero findings. AWS policy simulations: 22 positive and 163 negative resource decisions passed. The installed identity/managed-policy boundary documents match the reviewed documents; default versions, attachments and runtime policy were verified. The security update reached UPDATE_COMPLETE with DisableRollback=false.

Security change set: arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-gate3-security-20261005/ca38a6e3-9bea-4f97-9803-b7af0b46ef0a

## Product execution gate

READY TO CREATE TEAM HUB DARK TARGET was output after fresh two-pass zero source counts, logos zero, enabled protections and four AVAILABLE backups. AWS change set: 2 additions, 0 modifications, 0 deletions, 0 replacements, 0 unexpected changes. Both additions are AWS::DynamoDB::Table. All eleven existing product identities are preserved; API t54b88casf retained.

Product change set: arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-gate3-dark-target-20261005/830beb6c-904b-4e48-8804-7d6440efd096

The hash-pinned template was published using AES256/SSE-S3 and verified with HeadObject SHA256. No Lambda asset was republished. Both executions explicitly used --no-disable-rollback. Product reached UPDATE_COMPLETE; DisableRollback=false. No deployment failure, permission patch/retry or rollback occurred.

## Target schema, recovery and emptiness

| Table | ARN | Status | Complete strongly consistent passes | PITR | Deletion protection |
|---|---|---|---|---|---|
| ProjectRespawn-TeamHub-Ntgre-Operational | arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational | ACTIVE | 0 / 0 | ENABLED | true |
| ProjectRespawn-TeamHub-Ntgre-Journal | arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Journal | ACTIVE | 0 / 0 | ENABLED | true |

Schema version team-hub-state.v1. Both tables use string PK/SK, PAY_PER_REQUEST, STANDARD class, AWS-owned service encryption (SSEEnabled=false selects the default encrypted service path, not unencrypted storage), no customer-managed KMS dependency, no streams, DeletionPolicy=Retain and UpdateReplacePolicy=Retain in the deployed template. PITR/deletion protection are represented in CloudFormation, not out-of-band patches. Tags: Project=ProjectRespawn, Domain=TeamHub, Environment=Ntgre, plus service ownership tags.

Operational attributes: PK, SK, SubjectPK, SubjectSK, StatusPK, StatusSK, all strings. BySubject uses SubjectPK/SubjectSK; ByTeamStatus uses StatusPK/StatusSK. Both sparse GSIs use KEYS_ONLY. No TTL or additional indexes.

Journal: PK/SK only, no GSIs, TTL expiresAt enabled. Metadata-only audit uses TEAM#<teamId> / AUDIT#<UTC ISO time>#<requestId>, retention 365 days, no private text. Idempotency uses IDEMP#<issuer SHA256>#<subject>#<teamId> / <operation>#<requestKey>, retention 24 hours, current authorization required on replay, no private response. The non-expiring authority design is CONTROL#AUTHORITY / STATE, but no control record was seeded. Infrastructure/configuration retains LEGACY_WRITER authority with target writer disabled. Both tables contain zero records.

Actual PreviewRead role: GetItem, Query, Scan, PutItem, UpdateItem, DeleteItem and ConditionCheckItem denied against both live table ARNs. TransactWriteItems is an API operation, not a standalone IAM action; its underlying write/check actions are denied, including simulation with dynamodb:EnclosingOperation=TransactWriteItems. PreviewRead stays synthetic with no target access. No Command Lambda, mutation route, business writer role or writer-fence adapter was deployed.

## Source recovery and isolation

Fresh final Team/Membership/Roster/Champion counts: 0 / 0 / 0 / 0, each from two complete consistent passes. Logos: zero. Exact source identities/keys/indexes/streams/encryption unchanged. All four PITR and deletion-protection settings remain enabled, and all four exact Gate 1 backups AVAILABLE. Gate 2 restore evidence remains accepted; no temporary restores remain from that rehearsal.

Legacy: UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167. All 62 templates, physical identities, 62 protected resources and five monitored Lambda hashes/configurations remain unchanged; last update 2026-09-26T11:52:06.391000+00:00. No Legacy synthesis/deployment. The temporary direct-source protection exception remains: review provider reset risk before any future Legacy deployment; no IAM deployment fence is claimed.

Tournament: UPDATE_COMPLETE, 11 resources, API msipnwy39j; accepted runtime/security unchanged. No Tournament deployment. Production untouched.

Team: UPDATE_COMPLETE, 13 product +5 security resources, API t54b88casf. Scoped total including Legacy and Tournament is 2,650; four backup artifacts are separate. This is not a full-account inventory or a Legacy resource saving.

## Validation and limits

140 selected schema/recovery/native-state/accounting/auth/security/ledger tests passed; four additional Gate 3 candidate tests passed; isolated Team TypeScript check and CDK synthesis passed. Current accepted Team checkpoint verifier passed all 54 inputs. Broader suite: 314/315 passed. The historical byte-hash assertion for amplify/backend.ts reports a mismatch; Git diff is empty and normalized content equals HEAD. This pre-existing local byte difference was preserved, not hidden by changing tests or rewriting Legacy source. Live Legacy template and Lambda checks passed. No all-tests-green claim is made.

No Git commit/push requested. Existing unrelated/uncommitted work was preserved. Final output audit: 56 files scanned, zero credential/secret-pattern findings, 23 local report links resolved; 14 final ledger/candidate tests passed. Evidence is retained in output-audit.json.

## Evidence

- [candidate](team-hub-2b3-gate3-evidence-2026-10-05/candidate.json)
- [schema](team-hub-2b3-gate3-evidence-2026-10-05/schema.json)
- [security-simulation](team-hub-2b3-gate3-evidence-2026-10-05/security-simulation.json)
- [analyzer](team-hub-2b3-gate3-evidence-2026-10-05/analyzer.json)
- [security-change-set](team-hub-2b3-gate3-evidence-2026-10-05/security-change-set.json)
- [security-execution-gate](team-hub-2b3-gate3-evidence-2026-10-05/security-execution-gate.json)
- [security-executed](team-hub-2b3-gate3-evidence-2026-10-05/security-executed.json)
- [security-installed](team-hub-2b3-gate3-evidence-2026-10-05/security-installed.json)
- [publication](team-hub-2b3-gate3-evidence-2026-10-05/publication.json)
- [product-change-set](team-hub-2b3-gate3-evidence-2026-10-05/product-change-set.json)
- [product-execution-gate](team-hub-2b3-gate3-evidence-2026-10-05/product-execution-gate.json)
- [product-executed](team-hub-2b3-gate3-evidence-2026-10-05/product-executed.json)
- [product-status](team-hub-2b3-gate3-evidence-2026-10-05/product-status.json)
- [product-verification](team-hub-2b3-gate3-evidence-2026-10-05/product-verification.json)
- [source-before](team-hub-2b3-gate3-evidence-2026-10-05/source-before.json)
- [source-preexecute](team-hub-2b3-gate3-evidence-2026-10-05/source-preexecute.json)
- [source-after](team-hub-2b3-gate3-evidence-2026-10-05/source-after.json)
- [legacy-before](team-hub-2b3-gate3-evidence-2026-10-05/legacy-before.json)
- [legacy-after](team-hub-2b3-gate3-evidence-2026-10-05/legacy-after.json)
- [team-baseline](team-hub-2b3-gate3-evidence-2026-10-05/team-baseline.json)
- [tournament-baseline](team-hub-2b3-gate3-evidence-2026-10-05/tournament-baseline.json)

## Migration control and next gate

Current domain Team Hub; phase M4/2B3 Gate 3 complete. Five direct AWS write calls: two CreateChangeSet, two ExecuteChangeSet and one exact artifact PutObject; CloudFormation's service operations are recorded by events. Legacy changes zero; production changes zero. Ownership rows remain 2,621; four source rows stay MIGRATION_PREP and NOT_ELIGIBLE, Legacy-authoritative. No migrated/cutover/retirement status introduced. Dark target creation does not constitute migration.

Data copied: no. Writer fence: no. Frontend cutover: no. Legacy retired: no. Broader M4 state-authority rollback/nonempty recovery acceptance remains pending.

Next gate: TEAM HUB PHASE 2B4 — INDEPENDENT MUTATION PARITY / WRITER-FENCE PREPARATION. Not started.

TEAM HUB DARK TARGET CREATED — READY FOR MUTATION-PARITY REVIEW
