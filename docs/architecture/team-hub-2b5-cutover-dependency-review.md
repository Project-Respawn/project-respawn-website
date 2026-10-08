# PROJECT RESPAWN TEAM HUB 2B5 — CUTOVER DEPENDENCY REVIEW

6 October 2026. **OFFLINE CANDIDATE COMPONENTS PREPARED; CUTOVER BLOCKED.** This report does not authorize a deployment, authority transition, frontend cutover, live rehearsal or retirement. The accepted 2B4B deployed state remains unchanged.

## Migration record / architecture assessment

Domain: Team Hub, with bounded Shared/Core owner contracts. Account 058264289478; region eu-north-1; environment Ntgre; phase M5 / 2B5 pre-cutover preparation. Approval: attached user request “PHASE 2B5 — CORE CONTRACTS / WRITER-FENCE / CUTOVER PREPARATION”. Accountable operator for this review: existing RavenTest workflow; cutover/policy custodian and alarm recipient still require execution-gate assignment. No assumed credentials or live writes were used.

Authoritative business data stays LegacyPlatform. Existing Cognito/AppSync identities and source state are protected; no physical ownership move. Shared/Core owns enabled-account/global capability/directory resolution; Team owns all resource membership, plans and business transactions. A small independent Core Lambda API is proposed rather than another Legacy myFunction addition. Team's existing independent root is reused. Native state schema and rollback privacy restrictions are preserved.

Last accepted live evidence is 2B4B at **2026-10-06T19:31:47.669Z**, not a new AWS observation in this task: Team 40 product +7 security, UPDATE_COMPLETE, API t54b88casf; Operational 0, Journal 15 retained synthetic audits; verification disabled; ordinary target writer disabled; Legacy LEGACY_WRITER; frontendCutover=false. Legacy 2,621 / FunctionDirectiveStack 167; four source tables and logos zero; PITR/deletion protection/four backups accepted; Tournament 11 unchanged. [Preservation check](team-hub-2b5-evidence-2026-10-06/preservation.json) confirms all 35 accepted source-manifest files and the accepted Legacy backend hash unchanged. No new live freshness claim is made.

Accepted product SHA256 d9e47021ffc55ee99c9477f0ff00590258f10e51375d7f8065afbf28f26c51c2; accepted security SHA256 8431078d29f8a5c8cbdd53737727fe3df75421c1ce2f804d09eb48e3a5d9389c. New offline bundle/ZIP hashes and dependency closures are in [build.json](team-hub-2b5-evidence-2026-10-06/build.json). They are separate candidates, not substitutions for the accepted artifact.

## CORE

Environment: existing environment.v1 validated. Authorization: fresh exact-pool enabled/confirmed account and Admin/SuperAdmin group decisions implemented in the offline Core adapter; no JWT group trust. Directory: exact resolution, bounded prefix search, encrypted scoped pagination, minimized subject/display output. Profile: no live dependency needed; Team-owned assignment snapshots suffice. Deployment unit: proposed independent ProjectRespawn-Core-Ntgre, synchronous IAM Lambda contract API. Live/deployed: **NO**. Details and remaining acceptance: [Core contracts](team-hub-2b5-core-contracts.md).

Create Team: existing product rule is Admin/SuperAdmin via teams.admin; evidence is the current dependency map and Legacy server guard. Global admin remains separate from Manager; Manager manages members/roster, Coach owns permitted assessments, Player owns their pool. No arbitrary-user verification grant survives in the cutover entry.

## LEGACY FENCE

Recorded coverage: 13 active, two possible, eight privileged/manual and eight generated internal writer paths; unknown writers/readers zero in the accepted inventory. Exact all-principal table/logo-policy compiler prepared; direct generated mutations cannot bypass an installed effective table deny. Privileged removal/control-plane intervention still requires an enforced maintenance freeze. TARGET_WRITER proposal additionally blocks old-table reads; streams/subscriptions/exports need separate controls. Nothing installed or live-proven here. No full Legacy CloudFormation deployment needed for the proposed policy approach; exact policy/resolver updates still require a separate gate. [Fence review](team-hub-2b5-legacy-writer-fence.md).

## TARGET FENCE

Authority source: strongly consistent Journal CONTROL#AUTHORITY / STATE, schema team-hub-authority.v1, mode/epoch/version and gate digest; no TTL. No row created. Cutover candidate checks TARGET_WRITER atomically with each transaction and binds client/replay to authority epoch. Missing/unavailable authority fails closed. Verification bypass: absent from the candidate runtime import closure. Current deployed runtime remains accepted synthetic implementation in DISABLED mode; it was not replaced. [Handler](../../domains/team-hub/cutover/handler.mjs), [repository](../../domains/team-hub/cutover/repository.mjs), [runbook](team-hub-2b5-cutover-runbook.md).

## FRONTEND / COMPATIBILITY

Dormant manifest-driven client, authority-epoch header and bounded Admin/home adapters prepared. All real Vue pages and current shared consumers still use Legacy. Their revision/payload/DTO conversion and global shell loading isolation remain incomplete; no route registration was switched. Isolated candidate has zero foreign domain imports; actual main entry remains about 2.16 MB and includes eager unrelated implementations. Full browser initialization/network acceptance is outstanding. Branding: recommend option A, disabled initially. [Route-by-route review](team-hub-2b5-frontend-cutover.md).

readTeamHub/mutateTeamHub: retain Legacy now, explicit maintenance during FROZEN, DOMAIN_MOVED after transfer. Generated models: resource-level write deny while frozen, read/write deny after transfer; no dual authority or silent forwarding. Proposed rejecting resolver templates are not installed.

## CUTOVER / ROLLBACK / OBSERVABILITY

Mode A: last observed empty source, **not execution-eligible**. All final proof conditions and exact 15-step sequence are in the [cutover runbook](team-hub-2b5-cutover-runbook.md). Any new source record/logo requires Mode B; preserve the 15 reconciled audit records rather than deleting evidence to force Journal zero. Estimated maintenance 30–45 minutes, including recorded 17-minute minimum drain; refresh actual timeouts and policy propagation before scheduling.

Code rollback prefers keeping target data authority, but an accepted compatible ordinary-writer rollback release does not yet exist. State rollback must freeze, export, reverse-transform, restore/reconcile and reject old native protocol replay before authority changes. Offline transform tests pass; live isolated nonempty rehearsal is not performed and needs its own candidate/approval. Coach-private creation remains blocked as non-reversible. [Rollback plan](team-hub-2b5-rollback-rehearsal.md).

Current observability is the accepted dark-proof aggregate/platform-log evidence. Recommend detailed per-route metrics and sanitized access logging for cutover; the product draft includes these, but log-delivery permissions, custom Core/fence/auth counters, DynamoDB conflict/throttle monitoring, thresholds and alarm recipient remain unresolved.

## SECURITY / RESOURCE ACCOUNTING

Candidate Team roles receive only owned Operational/index/Journal access, exact Core InvokeFunction, owned cursor-secret read and accepted logging/service-encryption scope. Command uses transactional business writes and control ConditionCheck; no authority writes, Journal delete, Scan, Cognito, AppSync, foreign data, IAM or CloudFormation. Core owns only exact-pool read/group/directory privileges and its own log/secret. Offline policy evaluation passes; no installed IAM changes or live Analyzer/principal test was performed.

**The generated security files are explicitly runtime-only drafts, NOT deployable change-set inputs.** Core restricted caller/execution policies are not yet prepared/accepted. Team's old execution/caller policies still reference the accepted artifacts and deny secret lifecycle/log-delivery operations. They must be replaced by a separately reviewed exact-artifact/lifecycle proposal; do not deploy these drafts or broaden permissions on failure. Default Secrets Manager service-encryption behavior and stable cursor rotation also require acceptance.

| Accounting | Count / status |
|---|---|
| Legacy declarations | 2,621, unchanged |
| Physical Legacy Team attribution | 192 |
| Ledger future owner TEAM_HUB | 188; four CDK metadata rows belong to FRONTEND_OR_BUILD_SUPPORT |
| Current independent Team | 40 product +7 security |
| Draft Team product | 44: two routes, one cursor secret, one API access log added; existing tables unchanged |
| Draft Team security | Seven, runtime policy updates only; execution/caller completion outstanding |
| Draft Core product | Six |
| Draft Core runtime boundary | One |
| Core deployment security reserve | Four; not yet implemented/accepted |
| Fence / frontend configuration / initial branding | Zero new AWS declarations proposed |
| Planning peak, including Tournament 11 | 2,694 = 2,621 +44 +7 +6 +1 +4 +11; excludes additional monitoring/rehearsal resources not yet reviewed |

No Legacy savings. No stateful replacement requested. New cursor secrets would be retained resources if separately deployed. Candidate-only frontend/config files create no infrastructure. Any later branding or rehearsal storage must have its own exact accounting.

## VALIDATION AND OPEN GATES

[Validation results](team-hub-2b5-evidence-2026-10-06/validation.json): new Core/Team/fence/client/security suite 74/74 (includes an adapted 41-step mutation/privacy/concurrency sequence); accepted parity 23/23; reverse transform 46/46; resource accounting 41/41; domain selector 18/18. TypeScript passes. Site build passes with existing stylesheet/large-chunk warnings. Candidate runtime build closure excludes the verification adapter and foreign product source. Credential-pattern scan and documentation link validation are recorded in final evidence.

Historical Team foundation/read-proof suite: **248/250**, two receipt/hash failures. Older expected amplify/backend.ts and parity/fence.mjs hashes differ from the current accepted 2B4 manifest; both current bytes are verified unchanged against that accepted manifest. Do not regenerate old pins or edit Legacy to hide these failures. Initial validator invocations used an incorrect selector path/options; corrected selector/describe checks pass and replace only those invocation results. Infrastructure CI was exercised in explicit describe mode; no Legacy/global synthesis was run.

Blocking work before cutover candidate acceptance:

1. Complete Core restricted deployment identity/boundary and Team exact artifact/secret/log-delivery lifecycle security; quota, Analyzer, actual-role and full change-set inspection.
2. Separately deploy/accept Core and the ordinary authority runtime, stable cursor secrets and capability/directory trust; no grant from this preparation report.
3. Fresh full reader/writer coverage; privileged maintenance enforcement; live all-path source/target denial proof; complete compatibility/subscription/export handling.
4. Finish real Vue/Admin/home DTO/revision migration and shared-shell loading isolation; browser persona/account-switch/network proof. The dormant client is not a finished product frontend.
5. Prepare/perform the separately authorized isolated nonempty state rollback rehearsal, old-protocol replay guard and compatible code rollback release.
6. Complete monitoring counters/alarms/recipient, route logging permissions and secret rotation/service-encryption validation.
7. Reconcile historical test receipts under an explicit evidence-maintenance change; do not substitute old candidates or erase failures.

## Ledger / final gate

Assigned rows: 2,430. UNRESOLVED_SHARED: 191. No evidence justifies changing those ownership rows; no MIGRATED/CUTOVER_COMPLETE/RETIREMENT_REVIEW/RETIRED status added. Team remains pre-cutover. Status records this blocked preparation and preserves all accepted 2B4B evidence.

AWS changes: **0**. AWS calls: **0** in 2B5. Business data writes: **0**. Authority changes: **0**. Frontend cutover: **false**. Legacy source/code/infrastructure changes: **0**. Legacy retired: **0**. Production touched: **no**. Ownership ledger row changes: **0**, review metadata only. No Git commit or push; existing unrelated workspace changes retained.

NEXT GATE: **TEAM HUB 2B5/2B6 CUTOVER CANDIDATE REVIEW**, after the above blockers are closed. Do not execute the prepared runbook.

TEAM HUB CUTOVER REMAINS BLOCKED
