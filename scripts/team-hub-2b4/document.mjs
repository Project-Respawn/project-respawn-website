import fs from 'node:fs';
import assert from 'node:assert/strict';
import {operations} from '../../domains/team-hub/contracts.mjs';
import {commandOperations,deferredBranding,readOperations} from '../../domains/team-hub/parity/handler.mjs';
import {legacyFencePolicies} from './legacy-fence.mjs';
const E='docs/architecture/team-hub-2b4-evidence-2026-10-06',read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(n,v)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const c=read(E+'/candidate.json'),source=read(E+'/source-before.json'),target=read(E+'/product-verification.json'),legacy=read(E+'/legacy-after.json'),tournament=read(E+'/tournament-baseline.json');
assert.ok(source.empty&&source.complete&&target.complete&&legacy.beforeAfterEqual);assert.deepEqual(tournament.issues,[]);
const base='docs/architecture/',write=(name,text)=>fs.writeFileSync(base+name,text);
const commands=Object.entries(operations).filter(([,v])=>v.runtime==='command').map(([name,spec])=>({name,...spec,classification:deferredBranding.includes(name)?'DEFERRED_BRANDING_MUTATIONS':'CORE_STATE_MUTATION_PARITY',persona:spec.authorization,transaction:'META version/epoch + actor membership version, changed entities/slug/roster guards, audit append and idempotency Put; max 25 actions /4 MiB',idempotency:'issuer hash + subject + Team + operation + key; 24h; reauthorize replay; changed digest CONFLICT; expired request executes only with current revisions',expectedVersion:'Team/epoch/member plus operation-specific DTO revisions; absence required for create',privacyProjection:'Closed operation response schema; no stored private note or private response; assessment is Manager/Coach only',liveCoreBlocker:['CREATE_TEAM','UPDATE_TEAM','SET_MANAGER','SET_TEAM_PLAN'].includes(name)?'authorization.decision.v1':name==='MANAGE_MEMBER'?'directory.assignment.v1 for assignment':null}));save('command-matrix',{contractVersion:'team-hub.v1',commands});
save('legacy-fence-proposal',{installed:false,currentAuthority:'LEGACY_WRITER',controlRecordClassification:'INFRASTRUCTURE_CONTROL_STATE; still a real state write, NOT seeded or authorized here',frozen:legacyFencePolicies('FROZEN',source.tables.map(t=>t.sourceArn)),targetWriter:legacyFencePolicies('TARGET_WRITER',source.tables.map(t=>t.sourceArn))});
const rows=commands.map(o=>`| ${o.name} | ${o.method} ${o.path} | ${o.persona} | ${o.classification==='DEFERRED_BRANDING_MUTATIONS'?'DEFERRED':o.liveCoreBlocker?'Core verification adapter only':'Synthetic verification candidate'} |`).join('\n');
write('team-hub-2b4-core-dependencies.md',`# Team Hub 2B4 Core dependencies

6 October 2026. [Migration control](README-PHASE2-MIGRATION.md). No Core service is invented or deployed by this task.

| Contract | Current evidence | 2B4 treatment | Cutover requirement |
|---|---|---|---|
| environment.v1 | Existing same-environment issuer/pool/client/account/region contract; live preview JWT unchanged | Reused without Cognito changes | Preserve and verify |
| authorization.decision.v1 | Offline SyntheticCore only; no accepted live endpoint in current domain configuration | VerificationCore grants teams.admin only to exact configured test administrators inside a named synthetic Team run | Real owner-authorized transport, freshness/revocation and outage semantics |
| directory.assignment.v1 | Offline account fixtures; no accepted live service | Exact configured test-account intent maps to configured Cognito subject/display label; unknown account rejected | Bounded purpose-authorized live directory and subject resolution |
| profile.summary.v1 | Contract/synthetic adapter only | Approved test display labels; no profile writes or raw Cognito access | Reviewed owner profile contract where required |

CREATE_TEAM, UPDATE_TEAM, SET_MANAGER and SET_TEAM_PLAN require teams.admin, never merely a valid JWT or Manager membership. SET_MANAGER and MANAGE_MEMBER assignments additionally need directory resolution. Managers/Coaches/Players cannot acquire global capability through a request field, group claim, UI flag or test prefix. The exact accepted [authorization matrix](team-hub-authorization-matrix.md) remains controlling.

The [verification adapter](../../domains/team-hub/parity/core.mjs) has no service fallback and never calls Legacy AppSync, Cognito Admin, Creator or another domain. It first enforces the immutable run scope/lease and actor allowlist. Candidate environment is DISABLED; no live test principals were selected or authorized. An eventual verification lease must bind real existing Ntgre Cognito issuer/sub pairs, exact synthetic Team IDs and at most six hours. Every normal-user request remains denied. This proves controllable test authorization, not production Core availability.

Core dependencies block live business CREATE_TEAM and real-user cutover. They do not require inventing a new pool or moving users. Live verification is a separately reviewed synthetic exercise, not a Core production implementation.
`);
write('team-hub-2b4-writer-fence.md',`# Team Hub 2B4 writer-fence preparation

6 October 2026. Current live authority remains LEGACY_WRITER. No fence policy, authority record or authority transition was installed. [Migration control](README-PHASE2-MIGRATION.md).

| State | Legacy business writes | Target business writes |
|---|---|---|
| LEGACY_WRITER | Allowed | Denied |
| FROZEN | Denied | Denied |
| TARGET_WRITER | Denied | Allowed only after separately accepted production authorization/adapter |

[State machine and future transaction condition](../../domains/team-hub/parity/fence.mjs) implement the truth table and compile the target CONTROL#AUTHORITY/STATE condition on mode, epoch and version. No direct normal-user business path is activated in this candidate. The current candidate independently rejects ordinary callers before repository access. Verification is a different synthetic namespace, with explicit subject/Team allowlist and expiring lease, and is disabled by default. It cannot serve arbitrary Team IDs even with an administrative test grant. FROZEN/TARGET_WRITER configuration does not enable this verification handler.

Authority record classification: INFRASTRUCTURE_CONTROL_STATE, but it is still real durable state. No record is seeded. The accepted 2B3 design described it without authorizing creation. The future normal-user adapter must place the authority ConditionCheck in the same transaction as each business mutation, reserve its extra transaction slot, and receive separately reviewed control-read permission. This candidate deliberately has no CONTROL#AUTHORITY IAM grant. Do not treat the external test lease as an installed production fence or accept normal-user cutover on this evidence.

## Legacy coverage and smallest enforcement unit

[Offline exact-four-table policy compiler](../../scripts/team-hub-2b4/legacy-fence.mjs) prepares all-principal denies for PutItem, UpdateItem, DeleteItem, BatchWriteItem and PartiQL writes in FROZEN/TARGET_WRITER; LEGACY_WRITER preserves existing policy statements. [Exact proposals](team-hub-2b4-evidence-2026-10-06/legacy-fence-proposal.json). Before a future installation, freshly retrieve/merge current policies, compare revisions and inspect the entire result. No resource policy was installed here.

These resource-level denials cover mutateTeamHub/shared Lambda, generated AppSync/direct models, Admin Team paths, supported privileged/manual tools and compatibility paths because all eventually write the same four source tables. Their transaction actions are governed by underlying item permissions. The resolved [writer inventory](team-hub-2b3-final-evidence-2026-10-05/coverage.json) remains the reviewed starting point; refresh effective principals and consumers at freeze.

Logo writers and already issued presigned URLs also require the separately reviewed exact team-logos/ prefix deny in the existing bucket policy. Preserve every unrelated statement and object prefix. Branding remains deferred here; do not interpret deferral as permission for Legacy logo writes during a future freeze. The prior [write-set proposal](team-hub-2b3-final-evidence-2026-10-05/write-sets.json) includes this resource-policy mechanism. No S3 write or new storage is performed.

Resource-policy installation can avoid a giant Legacy CloudFormation update; it still needs its own exact AWS-write review. No Legacy source edit, synthesis or change set is prepared. Privileged operators able to remove policies or replace control-plane resources require an explicit maintenance/deployment freeze and break-glass control; resource denies cannot prove an administrator can never undo them. Drain in-flight calls/retries/subscriptions and expired presigned grants, then prove negative writes from every inventoried path before transferring authority. Generated provider updates can reset direct source PITR/deletion protection, so the existing no-Legacy-deploy operational guard remains.

Target business activation, all-path live denial proof and authority rollback remain later gates. No FROZEN or TARGET_WRITER transition occurred. No resources became migrated/cutover/retirement candidates.
`);
write('team-hub-2b4-live-test-plan.md',`# Team Hub 2B4 controlled live-test plan

6 October 2026. PLAN ONLY. No deployed Command/Read, no test invocation, no records created, no cleanup executed.

1. Review the final pinned candidate, exact installed execution/caller changes, AWS-generated security/product plans and rollback reserve. Candidate currently has verification DISABLED. No credentials or token may enter a manifest, report or Git.
2. Separately approve an immutable verification manifest: Ntgre issuer, real existing Cognito subject allowlist, explicit administrator subjects, account-intent/display-label fixtures, 8–16 lower-case alphanumeric runId, exact Team IDs beginning team:phase2b4-test-<runId>-, notBefore/expiresAt (maximum six hours). Template/config hash must be repinned and reinspected. Merely signing in or knowing a prefix grants no authority. No AWS mutation is authorized by this document.
3. Refresh source counts/logos, protection/backups, target counts, current policies and protected baselines. Any source data stops the empty-source plan. Enable only the reviewed synthetic lease; keep LEGACY_WRITER business authority and frontend routing unchanged.
4. Through the existing JWT API, create one synthetic Team using the allowlisted test admin; assign Manager, Coach, Player through exact test directory mappings. Prove nine core commands, native revisions/epochs, all roles and negative personas, cross-Team rejection, stale versions, atomic roster/slug guards, manager transfer/revocation, duplicate/conflicting/expired idempotency and failed transactions.
5. Use the separate four-route real Read runtime for context, own champion pool, team champion pools and competitive detail. Verify Player never receives assessment/private fields, Manager never receives private notes, and nonempty private-note creation fails. PreviewRead remains synthetic and byte-preserved. List-all/directory routes are not added; production Core remains unavailable.
6. Branding commands have no new routes and return NOT_FOUND if presented to the handler. No shared Legacy bucket fallback. All nine normal-user command paths remain denied outside the exact lease/allowlist/Team scope.
7. Capture sanitized HTTP outcomes, transaction failures, application/platform logs, metrics and minimized audit. A separate authorized verifier captures the complete exact run-created keys, final versions and canonical item digests in a receipt; no business payload goes in Git. Journal audit/idempotency rows are scoped by the synthetic Team. Every accepted transaction appends an audit and idempotency record atomically; replays log only operation/request correlation and recheck authorization.
8. Disable the verification lease and drain writers before cleanup. Review/pin the complete run receipt and its digest. [Cleanup implementation](../../domains/team-hub/parity/cleanup.mjs) verifies run, namespace, writer stop, exact key/version/content and emits conditional single-key transactional deletes using an injected separately authorized verifier transport. There is no generic table wipe, Scan-based delete, CLI credential path or cleanup privilege on the application runtime.
9. Delete only exact run-created Operational and idempotency records. Retain all synthetic audit rows for the approved 365-day TTL retention. Cleanup is restartable for already absent reviewed keys; changed/unbound keys stop. Record exact retained audit keys/count. Operational must return to zero; Journal intentionally remains at the retained synthetic audit count, not falsely empty. No authority row is created or deleted.
10. Recheck source counts/recovery and Legacy/Tournament identities. Stop after any deployment/test integrity failure; preserve evidence and do not weaken permissions or retry deployment without its authorized recovery procedure.

Idempotency: same unexpired key/digest returns the original logical result after fresh role authorization; changed digest returns CONFLICT. Expired record is not replayed; current version conditions must pass before conditional replacement, so an old stale request conflicts. TTL timing is not relied on. Audit expires after 365 days and never includes JWTs, passwords, private notes or response bodies. Private response DTO is omitted from idempotency storage; the required empty private-note response is reconstructed only for the restricted assessment operation.

The API uses accepted team-hub.v1 equivalents: INVALID_INPUT, UNAUTHENTICATED, FORBIDDEN (including non-authoritative/lease/private-write rejection), NOT_FOUND, CONFLICT (revision/idempotency), LIMIT_EXCEEDED and DEPENDENCY_UNAVAILABLE. No unreviewed breaking error enum is introduced. Normal-user production Core, durable authority integration, alarm notification ownership and a production cursor-signing lifecycle are cutover blockers; current verification reads use per-container ephemeral cursors and may reject a cursor after cold start.

Live-testable candidate scope: nine core mutations after separate subject/lease/deployment authorization; zero currently enabled. Deferred: three branding mutations. Private-note creation remains blocked throughout the rollback window.
`);
write('team-hub-2b4-mutation-parity-readiness.md',`# PROJECT RESPAWN TEAM HUB 2B4 — MUTATION PARITY READINESS

6 October 2026. Offline candidate prepared; STOP before AWS mutation. No deployment, artifact upload, IAM installation, data write, authority change, frontend cutover or retirement occurred.

## Architecture assessment and source state

Owner: Team Hub transactional business state, in its existing independent sibling root ProjectRespawn-TeamHub-Ntgre. No new product root and no LegacyPlatform expansion. One bounded Command Lambda and one separate Read Lambda share pure Team contracts/business rules while retaining separate exact-table privileges. Shared/Core owns same-environment Cognito identity and future directory/capability/profile contracts. Personal membership/pool/assessment data is minimized; Coach-private state is disabled during the rollback window. Frontend modules/routes/lazy-loading are unchanged; no shell integration occurs.

Read-only preflight: account 058264289478, region eu-north-1, RavenTest. Legacy four sources 0/0/0/0 in two complete strongly consistent passes; logos 0; PITR/deletion protection enabled; four backups AVAILABLE. Targets Operational and Journal ACTIVE, two empty passes each, protected and Retain/Retain. Team UPDATE_COMPLETE, 13 product +5 security, API t54b88casf; preview code/environment/JWT route unchanged. Legacy 2,621 / FunctionDirectiveStack 167, all protected identities/templates and monitored Lambda hashes unchanged. Tournament UPDATE_COMPLETE, 11, API msipnwy39j unchanged. No production changes. Counts are observations, not a perpetual write freeze.

Current writer authority LEGACY_WRITER. Target business writer disabled. Creating tables or building commands has not migrated business authority.

## Twelve-command reconstruction

| Operation | HTTP route | Server authorization/persona | 2B4 classification |
|---|---|---|---|
${rows}

The [machine matrix](team-hub-2b4-evidence-2026-10-06/command-matrix.json) contains each full closed request/response DTO, expected versions, transaction, idempotency and privacy mapping. Nine core commands reuse the accepted domain service through a new persistent repository/codec, not a memory repository in Lambda. Three branding commands are explicitly deferred and have no deployed candidate routes. Four global-capability commands and assignment resolution cannot authorize real business users until Core exists. [Core dependencies](team-hub-2b4-core-dependencies.md).

## Persistence, transaction and privacy proof

[DynamoRepository](../../domains/team-hub/parity/repository.mjs) performs bounded paginated strong base queries bracketed by stable META checks; no GSI authorizes access. Native schema team-hub-state.v1 includes closed fields, timestamps, membership/settings/roster revisions, authorization epoch, Manager/Coach pointers, stable Legacy-compatible IDs, slug reservations and starter-player guards. Removed roster rows retain inactive archive metadata. The codec rejects unknown versions/fields/private state rather than silently rewriting it.

Each mutation checks expected Team/epoch/actor membership plus operation-specific target/entity/roster versions; changed rows receive conditional Put/Delete actions, membership condition is coalesced when rewritten, and audit/idempotency are in the same TransactWriteItems call. Limits are 25 actions, 4 MiB and 350 KiB per item. There is no standalone blind PutItem path. An unchanged actor receives a ConditionCheck; global administrators without membership require membership absence. Slug creation requires absence. Every mutation increments META, allowing transactional version checks to detect races after paginated reads. DynamoDB transaction failure returns a sanitized conflict/dependency result without partial commit.

Idempotency is actor/Team/operation/key scoped for 24 hours, with fresh authorization before replay. Changed payload conflicts; expired keys require current revisions. Audit is append-only from the runtime, metadata-only, 365-day retention. Journal delete/update/Scan and authority-control key access are not granted to Command. No private note or private response is persisted. Player DTOs exclude assessments, Manager DTOs exclude private notes. [Live verification and cleanup](team-hub-2b4-live-test-plan.md).

[Fence preparation](team-hub-2b4-writer-fence.md) implements the state truth table, future atomic target authority condition and exact four-source resource-policy proposals. These are not installed all-path fence proof. Current synthetic test mode uses an external lease; the normal-user production adapter/control-row integration remains inactive. No authority-control record is seeded.

## Infrastructure and security

Current product 13; additions 27; proposed product 40. Existing thirteen resource declarations preserved exactly. Additions: two Lambdas, two runtime roles, two log groups, two invoke permissions, two integrations, thirteen JWT routes (nine command/four read), four Lambda error/throttle alarms. Existing API/authorizer/stage/preview/tables are preserved; no new API/pool/AppSync/table/S3/EventBridge/WebSocket. Security 5 → 7: two boundaries added; execution identity/boundary and exact caller template pin need separate review/install. Total proposed independent domain declarations 47, below 75. Scoped Legacy+Tournament+Team count would be 2,679; not an account-wide inventory or Legacy saving.

Command: exact Operational transactional Put/Delete/ConditionCheck and reads; exact Journal idempotency Get/transactional Put only. Read: exact Operational Get/Query only. LeadingKeys restrict both to phase2b4 synthetic prefixes; software binds the exact run/Team and actor. No business S3, foreign tables/domains, Cognito Admin, AppSync, IAM, CloudFormation or business KMS. Only the existing reviewed AWS-managed Lambda decrypt exception is retained. Preview policy remains unchanged.

Execution identity names the exact existing/new functions, runtime roles, logs, alarms, artifact and API t54b88casf. CreateApi remains denied. CreateRole requires the matching reviewed boundary; PassRole remains scoped to Lambda service. Managed-boundary size limit required consolidating stateless resources to Team-only namespaces while the inline identity retains exact resources; effective permissions are their intersection. No foreign or unreviewed same-domain Lambda is allowed in simulation. Boundary ${c.executionBoundaryBytes}/6144 characters; inline identity ${c.executionInlineBytes}/10240. No quota increase or arbitrary IAM is proposed.

AWS policy review: zero Access Analyzer findings across four documents; simulation results are in [policy-simulation](team-hub-2b4-evidence-2026-10-06/policy-simulation.json). Initial ConditionCheckItem test failed because EnclosingOperation is not a supported condition for that action; separated it with exact-table/LeadingKeys scope. No installed policy changed. [AWS action conditions](https://docs.aws.amazon.com/service-authorization/latest/reference/list_dynamodb.html), [transaction IAM](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis-iam.html), [IAM size limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html).

## Candidate, build and validation

Product SHA256 ${c.productSha256}. Security SHA256 ${c.securitySha256}. Runtime ZIP key ${c.assetKey}. Bundle SHA256 ${c.bundleSha256}. [Source manifest](team-hub-2b4-evidence-2026-10-06/source-manifest.json), [candidate/accounting](team-hub-2b4-evidence-2026-10-06/candidate.json), [bundle closure](team-hub-2b4-evidence-2026-10-06/bundle-closure.json).

Rebuild only this candidate: node scripts/team-hub-2b4/build.mjs --domain team-hub --env Ntgre --mode MUTATION_PARITY --offline. Explicit selector rejects foreign/missing/deploy arguments. Team-only CDK synthesis matches all forty proposed declarations; no Legacy synthesis, shared myFunction bundling or Amplify schema generation. SDK 3.1047.0 is locked in the isolated runtime package; bundle closure contains only Team source and that package's dependencies. Deterministic ZIP was independently opened and content-compared. No artifact published.

New 2B4 suite: 23/23 passed, including packaged-handler denial, nine command transactions, rollback codec, privacy, idempotency, revocation/concurrency, cleanup, fence, source preservation and accounting. Broader regressions: 371/372 passed; one pre-existing historical amplify/backend.ts byte-hash mismatch remains. This task preserves the exact Gate 3 bytes and verifies normalized content against HEAD; no test or Legacy source was rewritten to conceal it. Live Legacy templates/code remain unchanged. Accepted Team 54-input and Tournament checkpoint verifiers pass. Isolated TypeScript passes. Generic infrastructure CI passes under explicit Team READ_PROOF selection (historical 11+4 recipe); that is distinct from this candidate's 40+7 accounting and never substitutes for it.

Runtime parity was exercised against an atomic transaction emulator, not AWS writes. Real DynamoDB/API delivery, IAM propagation, logs/metrics, alarms, cleanup receipts and rollback remain the next live gate. Verification is DISABLED in the pinned candidate. Exact existing test subjects, synthetic Teams and six-hour maximum lease must be separately reviewed, repinned and AWS-inspected before test activation. No normal-user live authority is claimed.

## Gate and next step

TEAM HUB 2B4 — MUTATION PARITY DEPLOYMENT GATE

Source counts 0/0/0/0, logos 0, recovery enabled/four backups, authority LEGACY_WRITER. Target Operational/Journal ACTIVE and 0/0, non-authoritative. Commands 12: nine core implemented for controlled verification, three deferred branding; real-user global/assignment Core blocked; private-note creation blocked. Roles Manager/Coach/Player are server-authorized from strong membership, CREATE_TEAM requires test-admin capability only in explicit verification mode.

Writer fence: target ordinary traffic denied; truth table/atomic-condition primitive and Legacy exact-resource proposals implemented offline; live Legacy fence not installed. Current authority unchanged. Product 13 +27 =40; security 5 +2 =7. Command one, real Read one, new routes thirteen, integrations two, runtime roles two/boundaries two, alarms four. Cross-domain/business S3/KMS/Cognito Admin/AppSync denied. No Legacy or Tournament deployment proposed. Production target none.

AWS changes this task 0; data written 0; source/table protections unchanged; frontend cutover false; Legacy retired 0. Migration control records preparation only, no migrated/cutover/retirement status. No commit/push requested or performed. Next: TEAM HUB 2B4 LIVE MUTATION-PARITY DEPLOYMENT REVIEW. STOP; DO NOT DEPLOY.

TEAM HUB 2B4 MUTATION PARITY CANDIDATE READY FOR AWS REVIEW
`);
const report=base+'team-hub-2b4-mutation-parity-readiness.md',statusPath=base+'domain-migration-status.json',status=read(statusPath),domain=status.domains.find(d=>d.domain==='Team Hub');
status.currentPhase='M5 / Phase 2B4 offline mutation-parity candidate prepared; AWS deployment review next';status.scope='Ntgre Team Hub 2B4 preparation only; zero new AWS writes; Legacy authority retained';domain.phase='M5_2B4_OFFLINE_CANDIDATE_READY';domain.nextStep='Team Hub 2B4 live mutation-parity deployment review; candidate disabled; exact test identity/lease and AWS change-set review required. No cutover.';domain.mutationParity={status:'OFFLINE_CANDIDATE_ONLY',coreCommands:9,deferredBranding:3,liveTestPerformed:false,verificationEnabled:false,proposedProductResources:40,proposedSecurityResources:7,awsWrites:0,report};if(!domain.evidence.includes(report))domain.evidence.push(report);fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
const lp=base+'legacy-resource-ownership.json',ledger=read(lp);ledger.latestTeam2B4Review={at:new Date().toISOString(),report,awsWrites:0,currentAuthority:'LegacyPlatform',migrationStatusUnchanged:true};for(const t of source.tables){const row=ledger.resources.find(r=>r.physicalId===t.sourceName);assert.equal(row.migrationStatus,'MIGRATION_PREP');assert.equal(row.retirementStatus,'NOT_ELIGIBLE');if(!row.evidence.some(e=>e.path===report))row.evidence.push({path:report});}fs.writeFileSync(lp,JSON.stringify(ledger,null,2)+'\n');
const startPath=base+'README-PHASE2-MIGRATION.md';let start=fs.readFileSync(startPath,'utf8');const note='**Latest 2B4 preparation (6 October 2026):** Nine core mutations and restricted verification infrastructure prepared offline; three branding commands deferred. No deployment, test records or authority switch. Live remains 13 product +5 security; proposed 40+7 is uninstalled. [2B4 readiness](team-hub-2b4-mutation-parity-readiness.md). Next: live mutation-parity deployment review.\n\n';if(!start.includes('**Latest 2B4 preparation'))start=start.replace('**TEMPORARY CONTROL DOCUMENT**',note+'**TEMPORARY CONTROL DOCUMENT**');fs.writeFileSync(startPath,start);
console.log(JSON.stringify({documents:4,commands:commands.length,awsWrites:0,ledgerRows:ledger.resources.length}));
