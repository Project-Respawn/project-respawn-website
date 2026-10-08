import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,save,E} from './read-only.mjs';
const v=read(E+'/product-verification.json'),source=read(E+'/source-after.json'),legacy=read(E+'/legacy-after.json'),security=read(E+'/security-installed.json'),tournament=read(E+'/tournament-baseline.json'),candidate=read(E+'/candidate.json');
assert.ok(v.complete&&source.complete&&source.empty&&legacy.beforeAfterEqual&&security.verified);assert.deepEqual(tournament.issues,[]);
const now=new Date().toISOString(),report='docs/architecture/team-hub-2b3-gate3-dark-target.md',dir=E.split('/').at(-1);
const body=`# PROJECT RESPAWN TEAM HUB 2B3 — DARK TARGET RESULT

Gate 3 PASSED. Two empty, dark, non-authoritative tables created. Legacy remains the sole business authority. Phase 2B4 has not begun.

Account 058264289478; region eu-north-1. Operator RavenTest handled security custody and exact artifact publication. Product preparation/execution used assumed ProjectRespawn-TeamHub-Ntgre-Deploy and execution role ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. No temporary credentials were written to evidence.

## Candidate and independent synthesis

Product SHA256: ${candidate.productSha256}. Security SHA256: ${candidate.securitySha256}.

The Team-only CDK include synthesis preserved all eleven accepted resource declarations and added only OperationalTable and JournalTable from the approved final proposal. CDK sorted the new tables' tag arrays; values are unchanged. No Lambda bundling, shared myFunction bundling, Amplify generation, Legacy/Tournament/other-domain synthesis or deployment occurred. The preserved candidate and exact AWS template were compared before execution. Source: [preparer](../../scripts/team-hub-migration/gate3/prepare.mjs), [approved schema](team-hub-2b3-final-evidence-2026-10-05/target-schema.json).

## Security gate and execution

READY FOR TEAM HUB DARK TARGET SECURITY UPDATE was output before execution. AWS planned exactly three in-place modifications: ExecutionBoundary, ExecutionRole and PreparationCaller. The first two install the previously reviewed exact-two-table lifecycle permission set. The caller needed an additional exact template URL/S3-key substitution because its installed policy was pinned to Release 1. This changes no stack scope, trust, PassRole, runtime boundary, API permissions or business data access. Security declarations remain five.

Lifecycle grants: CreateTable, DescribeTable, UpdateTable, DescribeContinuousBackups, UpdateContinuousBackups, DescribeTimeToLive, UpdateTimeToLive, ListTagsOfResource, TagResource and UntagResource on only the two exact Ntgre Team table ARNs. No DeleteTable, item access, foreign table management, business KMS or arbitrary IAM grant was added. Existing reviewed exact API controls remain effective.

Access Analyzer: zero findings. AWS policy simulations: 22 positive and 163 negative resource decisions passed. The installed identity/managed-policy boundary documents match the reviewed documents; default versions, attachments and runtime policy were verified. The security update reached UPDATE_COMPLETE with DisableRollback=false.

Security change set: ${read(E+'/security-prepared.json').Id}

## Product execution gate

READY TO CREATE TEAM HUB DARK TARGET was output after fresh two-pass zero source counts, logos zero, enabled protections and four AVAILABLE backups. AWS change set: 2 additions, 0 modifications, 0 deletions, 0 replacements, 0 unexpected changes. Both additions are AWS::DynamoDB::Table. All eleven existing product identities are preserved; API t54b88casf retained.

Product change set: ${read(E+'/product-prepared.json').Id}

The hash-pinned template was published using AES256/SSE-S3 and verified with HeadObject SHA256. No Lambda asset was republished. Both executions explicitly used --no-disable-rollback. Product reached UPDATE_COMPLETE; DisableRollback=false. No deployment failure, permission patch/retry or rollback occurred.

## Target schema, recovery and emptiness

| Table | ARN | Status | Complete strongly consistent passes | PITR | Deletion protection |
|---|---|---|---|---|---|
${v.tables.map(t=>`| ${t.table.TableName} | ${t.table.TableArn} | ${t.table.TableStatus} | ${t.passes.map(p=>p.count).join(' / ')} | ENABLED | true |`).join('\n')}

Schema version team-hub-state.v1. Both tables use string PK/SK, PAY_PER_REQUEST, STANDARD class, AWS-owned service encryption (SSEEnabled=false selects the default encrypted service path, not unencrypted storage), no customer-managed KMS dependency, no streams, DeletionPolicy=Retain and UpdateReplacePolicy=Retain in the deployed template. PITR/deletion protection are represented in CloudFormation, not out-of-band patches. Tags: Project=ProjectRespawn, Domain=TeamHub, Environment=Ntgre, plus service ownership tags.

Operational attributes: PK, SK, SubjectPK, SubjectSK, StatusPK, StatusSK, all strings. BySubject uses SubjectPK/SubjectSK; ByTeamStatus uses StatusPK/StatusSK. Both sparse GSIs use KEYS_ONLY. No TTL or additional indexes.

Journal: PK/SK only, no GSIs, TTL expiresAt enabled. Metadata-only audit uses TEAM#<teamId> / AUDIT#<UTC ISO time>#<requestId>, retention 365 days, no private text. Idempotency uses IDEMP#<issuer SHA256>#<subject>#<teamId> / <operation>#<requestKey>, retention 24 hours, current authorization required on replay, no private response. The non-expiring authority design is CONTROL#AUTHORITY / STATE, but no control record was seeded. Infrastructure/configuration retains LEGACY_WRITER authority with target writer disabled. Both tables contain zero records.

Actual PreviewRead role: GetItem, Query, Scan, PutItem, UpdateItem, DeleteItem and ConditionCheckItem denied against both live table ARNs. TransactWriteItems is an API operation, not a standalone IAM action; its underlying write/check actions are denied, including simulation with dynamodb:EnclosingOperation=TransactWriteItems. PreviewRead stays synthetic with no target access. No Command Lambda, mutation route, business writer role or writer-fence adapter was deployed.

## Source recovery and isolation

Fresh final Team/Membership/Roster/Champion counts: 0 / 0 / 0 / 0, each from two complete consistent passes. Logos: zero. Exact source identities/keys/indexes/streams/encryption unchanged. All four PITR and deletion-protection settings remain enabled, and all four exact Gate 1 backups AVAILABLE. Gate 2 restore evidence remains accepted; no temporary restores remain from that rehearsal.

Legacy: UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167. All 62 templates, physical identities, 62 protected resources and five monitored Lambda hashes/configurations remain unchanged; last update ${legacy.root.lastUpdated}. No Legacy synthesis/deployment. The temporary direct-source protection exception remains: review provider reset risk before any future Legacy deployment; no IAM deployment fence is claimed.

Tournament: UPDATE_COMPLETE, 11 resources, API msipnwy39j; accepted runtime/security unchanged. No Tournament deployment. Production untouched.

Team: UPDATE_COMPLETE, 13 product +5 security resources, API t54b88casf. Scoped total including Legacy and Tournament is 2,650; four backup artifacts are separate. This is not a full-account inventory or a Legacy resource saving.

## Validation and limits

140 selected schema/recovery/native-state/accounting/auth/security/ledger tests passed; four additional Gate 3 candidate tests passed; isolated Team TypeScript check and CDK synthesis passed. Current accepted Team checkpoint verifier passed all 54 inputs. Broader suite: 314/315 passed. The historical byte-hash assertion for amplify/backend.ts reports a mismatch; Git diff is empty and normalized content equals HEAD. This pre-existing local byte difference was preserved, not hidden by changing tests or rewriting Legacy source. Live Legacy template and Lambda checks passed. No all-tests-green claim is made.

No Git commit/push requested. Existing unrelated/uncommitted work was preserved. Gate 3 source/evidence secret-pattern and documentation-link checks are recorded in output-audit.json.

## Evidence

${['candidate','schema','security-simulation','analyzer','security-change-set','security-execution-gate','security-executed','security-installed','publication','product-change-set','product-execution-gate','product-executed','product-status','product-verification','source-before','source-preexecute','source-after','legacy-before','legacy-after','team-baseline','tournament-baseline'].map(n=>`- [${n}](${dir}/${n}.json)`).join('\n')}

## Migration control and next gate

Current domain Team Hub; phase M4/2B3 Gate 3 complete. Five direct AWS write calls: two CreateChangeSet, two ExecuteChangeSet and one exact artifact PutObject; CloudFormation's service operations are recorded by events. Legacy changes zero; production changes zero. Ownership rows remain 2,621; four source rows stay MIGRATION_PREP and NOT_ELIGIBLE, Legacy-authoritative. No migrated/cutover/retirement status introduced. Dark target creation does not constitute migration.

Data copied: no. Writer fence: no. Frontend cutover: no. Legacy retired: no. Broader M4 state-authority rollback/nonempty recovery acceptance remains pending.

Next gate: TEAM HUB PHASE 2B4 — INDEPENDENT MUTATION PARITY / WRITER-FENCE PREPARATION. Not started.

TEAM HUB DARK TARGET CREATED — READY FOR MUTATION-PARITY REVIEW
`;
fs.writeFileSync(report,body);
const sp='docs/architecture/domain-migration-status.json',status=read(sp),d=status.domains.find(d=>d.domain==='Team Hub');
status.scope='Ntgre Team Hub Gate 3 dark targets created; Legacy authority retained';status.currentPhase='M4 / 2B3 Gate 3 complete; next Phase 2B4 mutation parity / writer-fence preparation';status.awsChanges=32;status.executedDeploymentChanges=2;status.awsChangesMeaning='27 earlier Gates 1-2 calls plus Gate 3: two change-set preparations, two executions and one pinned template publication; service-managed operations counted separately.';
d.phase='M4_GATE3_DARK_TARGET_CREATED';d.awsStatus='UPDATE_COMPLETE';d.lastVerified=now;d.gate3={status:'PASSED',verified:now,productResources:13,securityResources:5,tables:v.tables.map(t=>({name:t.table.TableName,arn:t.table.TableArn,records:0,authoritative:false})),legacyAuthority:true,targetWriterEnabled:false,evidence:report};d.nextStep='Phase 2B4 independent mutation parity / writer-fence preparation; no cutover or retirement authorized.';d.blockers=d.blockers.filter(s=>!s.startsWith('C dark tables'));d.blockers.push('Dark tables exist but no persistent runtime adapter, mutation parity or target business writer is installed.');if(!d.evidence.includes(report))d.evidence.push(report);fs.writeFileSync(sp,JSON.stringify(status,null,2)+'\n');
const lp='docs/architecture/legacy-resource-ownership.json',ledger=read(lp);ledger.latestTeamGate3Review={at:now,status:'DARK_TARGET_CREATED_LEGACY_AUTHORITATIVE',report,legacyResources:2621,functionDirective:167,targetTables:2,targetRecords:0,migrated:0,retired:0};
for(const t of source.tables){const r=ledger.resources.find(r=>r.physicalId===t.sourceName);assert.equal(r.migrationStatus,'MIGRATION_PREP');assert.equal(r.retirementStatus,'NOT_ELIGIBLE');r.recoveryProtection.verified=source.at;if(!r.evidence.some(e=>e.path===report))r.evidence.push({path:report});}fs.writeFileSync(lp,JSON.stringify(ledger,null,2)+'\n');
const note='\n## Latest Team Hub Gate 3 result\n\nTwo empty protected dark tables created in the independent Team stack (13 product +5 security). Legacy authority retained, zero migration/retirement. Legacy remains 2,621 resources / directive 167; Tournament unchanged. See [Gate 3 report](team-hub-2b3-gate3-dark-target.md). Next: Phase 2B4 mutation parity / writer-fence preparation.\n';
const summary='docs/architecture/legacy-resource-ownership-summary.md';fs.appendFileSync(summary,note);
const rp='docs/architecture/README-PHASE2-MIGRATION.md';let start=fs.readFileSync(rp,'utf8');start=start.replace(/\*\*Latest Gate 2 result[^\n]*/,'**Latest Gate 3 result (5 October 2026): DARK TARGET CREATED.** Team Hub now has two empty, protected, non-authoritative tables; 13 product +5 security resources. Legacy remains authoritative; no copy, fence, frontend cutover or retirement. [Gate 3 report](team-hub-2b3-gate3-dark-target.md). Next: Phase 2B4 mutation parity / writer-fence preparation. Earlier preparation statements below are historical.');start=start.replace('Gate 3 dark target review next.','Gate 3 dark targets created (13 product +5 security); Phase 2B4 review next.');fs.writeFileSync(rp,start);
save('result',{at:now,status:'PASSED',report,awsWrites:5,cloudFormationExecutions:2,productResources:13,securityResources:5,targetRecords:[0,0],legacyAuthority:true,dataCopied:false,writerFence:false,frontendCutover:false,retired:0,productionChanges:0});
console.log(JSON.stringify({status:'PASSED',report}));
