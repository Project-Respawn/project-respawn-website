# PROJECT RESPAWN TEAM HUB 2B4 — MUTATION PARITY READINESS

6 October 2026. Offline candidate prepared; STOP before AWS mutation. No deployment, artifact upload, IAM installation, data write, authority change, frontend cutover or retirement occurred.

## Architecture assessment and source state

Owner: Team Hub transactional business state, in its existing independent sibling root ProjectRespawn-TeamHub-Ntgre. No new product root and no LegacyPlatform expansion. One bounded Command Lambda and one separate Read Lambda share pure Team contracts/business rules while retaining separate exact-table privileges. Shared/Core owns same-environment Cognito identity and future directory/capability/profile contracts. Personal membership/pool/assessment data is minimized; Coach-private state is disabled during the rollback window. Frontend modules/routes/lazy-loading are unchanged; no shell integration occurs.

Read-only preflight: account 058264289478, region eu-north-1, RavenTest. Legacy four sources 0/0/0/0 in two complete strongly consistent passes; logos 0; PITR/deletion protection enabled; four backups AVAILABLE. Targets Operational and Journal ACTIVE, two empty passes each, protected and Retain/Retain. Team UPDATE_COMPLETE, 13 product +5 security, API t54b88casf; preview code/environment/JWT route unchanged. Legacy 2,621 / FunctionDirectiveStack 167, all protected identities/templates and monitored Lambda hashes unchanged. Tournament UPDATE_COMPLETE, 11, API msipnwy39j unchanged. No production changes. Counts are observations, not a perpetual write freeze.

Current writer authority LEGACY_WRITER. Target business writer disabled. Creating tables or building commands has not migrated business authority.

## Twelve-command reconstruction

| Operation | HTTP route | Server authorization/persona | 2B4 classification |
|---|---|---|---|
| CREATE_TEAM | POST /v1/teams | teams.admin | Core verification adapter only |
| UPDATE_TEAM | PATCH /v1/teams/{teamId} | teams.admin | Core verification adapter only |
| SET_MANAGER | PUT /v1/teams/{teamId}/manager | teams.admin | Core verification adapter only |
| MANAGE_MEMBER | POST /v1/teams/{teamId}/members | MANAGER | Core verification adapter only |
| SET_ROSTER_SLOT | POST /v1/teams/{teamId}/roster-slots | MANAGER | Synthetic verification candidate |
| UPSERT_MY_CHAMPION | PUT /v1/teams/{teamId}/me/champions/{championId} | PLAYER | Synthetic verification candidate |
| DELETE_MY_CHAMPION | DELETE /v1/teams/{teamId}/me/champions/{championId} | PLAYER | Synthetic verification candidate |
| UPSERT_COACH_ASSESSMENT | PUT /v1/teams/{teamId}/players/{membershipId}/assessments/{championId} | COACH | Synthetic verification candidate |
| SET_TEAM_PLAN | PUT /v1/teams/{teamId}/plan | teams.admin | Core verification adapter only |
| REQUEST_TEAM_LOGO_UPLOAD | POST /v1/teams/{teamId}/logo-upload-intents | teams.branding.manage; synthetic media only | DEFERRED |
| COMMIT_TEAM_LOGO | PUT /v1/teams/{teamId}/logo | teams.branding.manage; verified media only | DEFERRED |
| REMOVE_TEAM_LOGO | DELETE /v1/teams/{teamId}/logo | teams.branding.manage | DEFERRED |

The [machine matrix](team-hub-2b4-evidence-2026-10-06/command-matrix.json) contains each full closed request/response DTO, expected versions, transaction, idempotency and privacy mapping. Nine core commands reuse the accepted domain service through a new persistent repository/codec, not a memory repository in Lambda. Three branding commands are explicitly deferred and have no deployed candidate routes. Four global-capability commands and assignment resolution cannot authorize real business users until Core exists. [Core dependencies](team-hub-2b4-core-dependencies.md).

## Persistence, transaction and privacy proof

[DynamoRepository](../../domains/team-hub/parity/repository.mjs) performs bounded paginated strong base queries bracketed by stable META checks; no GSI authorizes access. Native schema team-hub-state.v1 includes closed fields, timestamps, membership/settings/roster revisions, authorization epoch, Manager/Coach pointers, stable Legacy-compatible IDs, slug reservations and starter-player guards. Removed roster rows retain inactive archive metadata. The codec rejects unknown versions/fields/private state rather than silently rewriting it.

Each mutation checks expected Team/epoch/actor membership plus operation-specific target/entity/roster versions; changed rows receive conditional Put/Delete actions, membership condition is coalesced when rewritten, and audit/idempotency are in the same TransactWriteItems call. Limits are 25 actions, 4 MiB and 350 KiB per item. There is no standalone blind PutItem path. An unchanged actor receives a ConditionCheck; global administrators without membership require membership absence. Slug creation requires absence. Every mutation increments META, allowing transactional version checks to detect races after paginated reads. DynamoDB transaction failure returns a sanitized conflict/dependency result without partial commit.

Idempotency is actor/Team/operation/key scoped for 24 hours, with fresh authorization before replay. Changed payload conflicts; expired keys require current revisions. Audit is append-only from the runtime, metadata-only, 365-day retention. Journal delete/update/Scan and authority-control key access are not granted to Command. No private note or private response is persisted. Player DTOs exclude assessments, Manager DTOs exclude private notes. [Live verification and cleanup](team-hub-2b4-live-test-plan.md).

[Fence preparation](team-hub-2b4-writer-fence.md) implements the state truth table, future atomic target authority condition and exact four-source resource-policy proposals. These are not installed all-path fence proof. Current synthetic test mode uses an external lease; the normal-user production adapter/control-row integration remains inactive. No authority-control record is seeded.

## Infrastructure and security

Current product 13; additions 27; proposed product 40. Existing thirteen resource declarations preserved exactly. Additions: two Lambdas, two runtime roles, two log groups, two invoke permissions, two integrations, thirteen JWT routes (nine command/four read), four Lambda error/throttle alarms. Existing API/authorizer/stage/preview/tables are preserved; no new API/pool/AppSync/table/S3/EventBridge/WebSocket. Security 5 → 7: two boundaries added; execution identity/boundary and exact caller template pin need separate review/install. Total proposed independent domain declarations 47, below 75. Scoped Legacy+Tournament+Team count would be 2,679; not an account-wide inventory or Legacy saving.

Command: exact Operational transactional Put/Delete/ConditionCheck and reads; exact Journal idempotency Get/transactional Put only. Read: exact Operational Get/Query only. LeadingKeys restrict both to phase2b4 synthetic prefixes; software binds the exact run/Team and actor. No business S3, foreign tables/domains, Cognito Admin, AppSync, IAM, CloudFormation or business KMS. Only the existing reviewed AWS-managed Lambda decrypt exception is retained. Preview policy remains unchanged.

Execution identity names the exact existing/new functions, runtime roles, logs, alarms, artifact and API t54b88casf. CreateApi remains denied. CreateRole requires the matching reviewed boundary; PassRole remains scoped to Lambda service. Managed-boundary size limit required consolidating stateless resources to Team-only namespaces while the inline identity retains exact resources; effective permissions are their intersection. No foreign or unreviewed same-domain Lambda is allowed in simulation. Boundary 6120/6144 characters; inline identity 8236/10240. No quota increase or arbitrary IAM is proposed.

AWS policy review: zero Access Analyzer findings across four documents; simulation results are in [policy-simulation](team-hub-2b4-evidence-2026-10-06/policy-simulation.json). Initial ConditionCheckItem test failed because EnclosingOperation is not a supported condition for that action; separated it with exact-table/LeadingKeys scope. No installed policy changed. [AWS action conditions](https://docs.aws.amazon.com/service-authorization/latest/reference/list_dynamodb.html), [transaction IAM](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis-iam.html), [IAM size limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html).

## Candidate, build and validation

Product SHA256 d9e47021ffc55ee99c9477f0ff00590258f10e51375d7f8065afbf28f26c51c2. Security SHA256 8431078d29f8a5c8cbdd53737727fe3df75421c1ce2f804d09eb48e3a5d9389c. Runtime ZIP key team-hub/parity/fd586f77dd3d872299e432f8e6d4631da09592cd29f47df6221ec8ede77b4a6d.zip. Bundle SHA256 6f83d22ddc4a19c5a43d3cc6de8d1a6d5857ab287f4b731b122f1e6b59750175. [Source manifest](team-hub-2b4-evidence-2026-10-06/source-manifest.json), [candidate/accounting](team-hub-2b4-evidence-2026-10-06/candidate.json), [bundle closure](team-hub-2b4-evidence-2026-10-06/bundle-closure.json).

Rebuild only this candidate: node scripts/team-hub-2b4/build.mjs --domain team-hub --env Ntgre --mode MUTATION_PARITY --offline. Explicit selector rejects foreign/missing/deploy arguments. Team-only CDK synthesis matches all forty proposed declarations; no Legacy synthesis, shared myFunction bundling or Amplify schema generation. SDK 3.1047.0 is locked in the isolated runtime package; bundle closure contains only Team source and that package's dependencies. Deterministic ZIP was independently opened and content-compared. No artifact published.

New 2B4 suite: 23/23 passed, including packaged-handler denial, nine command transactions, rollback codec, privacy, idempotency, revocation/concurrency, cleanup, fence, source preservation and accounting. Broader regressions: 371/372 passed; one pre-existing historical amplify/backend.ts byte-hash mismatch remains. This task preserves the exact Gate 3 bytes and verifies normalized content against HEAD; no test or Legacy source was rewritten to conceal it. Live Legacy templates/code remain unchanged. Accepted Team 54-input and Tournament checkpoint verifiers pass. Isolated TypeScript passes. Generic infrastructure CI passes under explicit Team READ_PROOF selection (historical 11+4 recipe); that is distinct from this candidate's 40+7 accounting and never substitutes for it.

Runtime parity was exercised against an atomic transaction emulator, not AWS writes. Real DynamoDB/API delivery, IAM propagation, logs/metrics, alarms, cleanup receipts and rollback remain the next live gate. Verification is DISABLED in the pinned candidate. Exact existing test subjects, synthetic Teams and six-hour maximum lease must be separately reviewed, repinned and AWS-inspected before test activation. No normal-user live authority is claimed.

## Gate and next step

TEAM HUB 2B4 — MUTATION PARITY DEPLOYMENT GATE

Source counts 0/0/0/0, logos 0, recovery enabled/four backups, authority LEGACY_WRITER. Target Operational/Journal ACTIVE and 0/0, non-authoritative. Commands 12: nine core implemented for controlled verification, three deferred branding; real-user global/assignment Core blocked; private-note creation blocked. Roles Manager/Coach/Player are server-authorized from strong membership, CREATE_TEAM requires test-admin capability only in explicit verification mode.

Writer fence: target ordinary traffic denied; truth table/atomic-condition primitive and Legacy exact-resource proposals implemented offline; live Legacy fence not installed. Current authority unchanged. Product 13 +27 =40; security 5 +2 =7. Command one, real Read one, new routes thirteen, integrations two, runtime roles two/boundaries two, alarms four. Cross-domain/business S3/KMS/Cognito Admin/AppSync denied. No Legacy or Tournament deployment proposed. Production target none.

AWS changes this task 0; data written 0; source/table protections unchanged; frontend cutover false; Legacy retired 0. Migration control records preparation only, no migrated/cutover/retirement status. No commit/push requested or performed. Next: TEAM HUB 2B4 LIVE MUTATION-PARITY DEPLOYMENT REVIEW. STOP; DO NOT DEPLOY.

TEAM HUB 2B4 MUTATION PARITY CANDIDATE READY FOR AWS REVIEW
