import fs from 'node:fs';
import assert from 'node:assert/strict';
import {E,read,save} from './control.mjs';
const run=read(E+'/run-result.json'),end=read(E+'/final-state.json'),lease=read(E+'/lease.json'),activation=read(E+'/activation.json'),disabled=read(E+'/disabled.json'),cleanup=read(E+'/cleanup-gate.json'),post=read(E+'/post-disable.json'),legacy=read(E+'/legacy-after.json'),source=read(E+'/source-after.json'),tournament=read(E+'/tournament-baseline.json'),observability=read(E+'/observability.json');
assert.ok(run.complete&&run.disabled&&run.cleaned&&end.requestComplete&&post.complete);
assert.ok(legacy.beforeAfterEqual&&source.complete&&source.empty&&tournament.issues.length===0);
assert.ok(Date.parse(legacy.at)>Date.parse(disabled.at));
assert.ok(observability.alarms.every(a=>a.StateValue==='OK'));
for(const f of observability.functions)for(const metric of ['Errors','Throttles'])assert.equal(f.metrics[metric].Datapoints.reduce((n,d)=>n+d.Sum,0),0);
const http=read(E+'/http-results.json').results;
assert.equal(http.length,51);assert.equal(post.denials.length,10);
const security=read(E+'/actual-role-simulation.json');assert.ok(security.complete);
const scanFiles=[...fs.readdirSync(E).filter(n=>/\.(json|jsonl)$/.test(n)).map(n=>E+'/'+n),...fs.readdirSync('scripts/team-hub-2b4b').filter(n=>n.endsWith('.mjs')).map(n=>'scripts/team-hub-2b4b/'+n)];
const patterns=[/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/"(?:accessToken|refreshToken|idToken|SecretAccessKey|SessionToken|password)"\s*:\s*"[^"\s]+"/];
for(const file of scanFiles)for(const pattern of patterns)assert.ok(!pattern.test(fs.readFileSync(file,'utf8')),'Sensitive literal in '+file);
save('secret-scan',{at:new Date().toISOString(),complete:true,files:scanFiles.length,credentialOrTokenLiterals:0,scope:'New 2B4B evidence and direct helper scripts; not a claim about every historical repository file'});
const metricSummary=observability.functions.map(f=>({name:f.name,platformReports:f.platformReports.length,...Object.fromEntries(Object.entries(f.metrics).map(([k,v])=>[k,v.Datapoints.reduce((n,d)=>n+d.Sum,0)]))}));
const apiMetrics=Object.fromEntries(Object.entries(observability.apiMetrics).map(([k,v])=>[k,v.Datapoints.reduce((n,d)=>n+d.Sum,0)]));
save('acceptance',{at:new Date().toISOString(),accepted:true,domain:'Team Hub',phase:'2B4B',runId:lease.runId,liveSequenceChecks:41,postDisableDenials:10,preview:200,authenticatedAccounts:5,awsConfigurationWrites:4,newResources:0,codeChanges:0,iamChanges:0,successfulSyntheticTransactions:15,cleanupDeleted:24,retainedSyntheticAudits:15,metrics:metricSummary,apiMetrics,legacyAuthority:'LEGACY_WRITER',ordinaryTargetWriter:false,frontendCutover:false,legacyChanges:0,productionChanges:0,ledgerRowsChanged:0,nextGate:'TEAM HUB 2B5 — CORE CONTRACTS / WRITER-FENCE AND CUTOVER PREPARATION'});
const report=`# PROJECT RESPAWN TEAM HUB 2B4B — SYNTHETIC MUTATION VERIFICATION RESULT

6 October 2026. **PASS — synthetic parity verified; verification disabled and business test state cleaned up.** Account 058264289478, eu-north-1, operator arn:aws:iam::058264289478:user/RavenTest. This is bounded synthetic verification, not business migration, frontend cutover or real-user authorization acceptance.

## Lease and authority

- Run: ${lease.runId}.
- Lease start: ${new Date(lease.notBefore*1000).toISOString()}; expiry: ${new Date(lease.expiresAt*1000).toISOString()}; maximum: 30 minutes.
- Both functions confirmed active: ${activation.at}; both explicitly disabled: ${disabled.at}, well before expiry.
- Exact Teams: ${lease.teamIds.join(' and ')}. Four exact verification subjects; a fifth existing identity remained an outsider. [Subjects](team-hub-2b4b-evidence-2026-10-06/subjects.json), [lease](team-hub-2b4b-evidence-2026-10-06/lease.json), [activation gate](team-hub-2b4b-evidence-2026-10-06/activation-gate.json).
- Legacy remains LEGACY_WRITER. Ordinary target writer disabled throughout; frontend unchanged. VerificationCore used only for exact synthetic scope; no real Core capability or global business entitlement was granted.

## Authentication and localhost

All five reviewed existing Ntgre test accounts signed in through Amplify SRP. Each access token was independently accepted by the existing HTTP preview JWT authorizer. Password input used a non-echoing terminal and nonce-protected loopback transfer to the network-enabled process. Credentials were not placed in arguments or files. Tokens stayed in memory and were cleared when the driver completed. No account, group, password, pool or client changes. [Authentication receipt](team-hub-2b4b-evidence-2026-10-06/authentication-ready.json).

The prior switching issue was traced to the existing Join flow retaining an already signed-in identity. The local capture helper now explicitly signs out before switching, refreshes the selected session before capture and observes cross-tab identity changes. Three helper tests pass. Five real account sign-ins and API acceptance were tested automatically; these are not five end-to-end browser UI journeys. The normal localhost server was restored at http://localhost:5174/ (HTTP 200). Ntgre output validation and all 62 frontend operation contracts pass. The normal site still requires sign-out before signing in as another account.

## Mutation and read proof

41/41 live sequence checks PASS, followed by 10/10 post-disable denials and preview 200. The recorded parity HTTP calls comprise 22 successes, 23 expected 403s and six expected 409s. [Live sequence](team-hub-2b4b-evidence-2026-10-06/mutation-results.json), [HTTP results](team-hub-2b4b-evidence-2026-10-06/http-results.json).

| Mutation | Result |
|---|---|
| CREATE_TEAM | PASS |
| UPDATE_TEAM | PASS |
| SET_MANAGER | PASS |
| MANAGE_MEMBER | PASS |
| SET_ROSTER_SLOT | PASS |
| UPSERT_MY_CHAMPION | PASS |
| DELETE_MY_CHAMPION | PASS |
| UPSERT_COACH_ASSESSMENT | PASS |
| SET_TEAM_PLAN | PASS |

Manager, Coach and Player Team-context reads PASS. Own champion pool, Manager pool list and Coach competitive-detail reads PASS. Manager/Player projections expose no private notes; Coach detail permits only the accepted empty private-note projection. Nonempty private-note writes were denied and no private note was persisted.

Idempotency replay returned the same logical DTO without extra state/journal entries. Changed payload returned sanitized CONFLICT. Stale Team revision, membership revision and authorization epoch all returned CONFLICT without partial state. Duplicate roster assignment was rejected. Two concurrent HTTP updates produced one success and one conflict, a single Team revision increase and exactly one audit/idempotency pair. This proves externally observed concurrency safety; the sanitized response does not distinguish a pre-transaction revision rejection from a DynamoDB conditional cancellation. The offline transaction test separately verifies atomic conditional cancellation.

Wrong Manager/Coach roles, cross-Team membership, outsider subject, global entitlement misuse, revoked Player and former Manager were denied. All negative cases compared complete scoped state before/after. Normal-identity and wrong-Team denials preceded the first synthetic write. Expired lease and wrong-scope fixtures passed offline against the accepted implementation; the live configuration was not replaced with an expired fixture.

## Journal and cleanup

15 successful unique mutation transactions produced 15 audit records and 15 idempotency records. TTLs passed: accepted 365-day synthetic audit retention and approximately 24-hour idempotency expiry. Audit records contained no response payload. No password, token, private-note field or private denial probe persisted. [Journal accounting](team-hub-2b4b-evidence-2026-10-06/journal-accounting.json).

| State | Operational | Journal |
|---|---:|---:|
| Before test | 0 | 0 |
| Before cleanup | 9 | 30 |
| After cleanup, verified twice | 0 | 15 |

Both Lambdas were disabled and drained before cleanup. The exact receipt pinned every run key, version and item digest; conditional cleanup deleted nine Operational rows and 15 idempotency rows. Fifteen synthetic audit rows were intentionally retained under the accepted policy. No synthetic business state or authority record remains. No broad delete or business-data scan was used; whole-table scans were COUNT-only reconciliation. [Cleanup gate](team-hub-2b4b-evidence-2026-10-06/cleanup-gate.json), [receipt](team-hub-2b4b-evidence-2026-10-06/cleanup-receipt.json), [result](team-hub-2b4b-evidence-2026-10-06/cleanup-result.json).

Post-disable: normal outsider and every prior verification identity received 403 for command and read against the prior synthetic Team. Preview remained 200. Both original environment configurations and code hashes were restored exactly. [Restoration](team-hub-2b4b-evidence-2026-10-06/disabled.json), [post-disable checks](team-hub-2b4b-evidence-2026-10-06/post-disable.json).

## Source, isolation and observability

Legacy sources remain 0/0/0/0 in two consistent passes; logos zero; PITR/deletion protection enabled and four backups AVAILABLE. Both target tables retain identities, PITR, deletion protection and Retain/Retain policies. Legacy stays UPDATE_COMPLETE, 2,621 declarations, FunctionDirectiveStack 167; all 62 protected identities and five inspected Lambda hashes match baseline. Tournament remains UPDATE_COMPLETE, 11 resources, API msipnwy39j; no differences. [Source](team-hub-2b4b-evidence-2026-10-06/source-after.json), [target](team-hub-2b4b-evidence-2026-10-06/target-state-after.json), [Legacy](team-hub-2b4b-evidence-2026-10-06/legacy-after.json), [Tournament](team-hub-2b4b-evidence-2026-10-06/tournament-baseline.json).

Actual runtime/execution-role simulations: 18 positive and 72 negative cases PASS. Cross-domain, Cognito, AppSync and KMS isolation was preserved; no IAM changes. [Role simulations](team-hub-2b4b-evidence-2026-10-06/actual-role-simulation.json). These are IAM simulations plus unchanged-policy evidence, not destructive calls against protected resources. Production was not targeted.

All four Lambda alarms OK; errors and throttles zero. Platform logs and metrics were retrieved for both functions. Exact per-call routes/status/request IDs plus API aggregate metrics satisfy the previously accepted evidence approach; detailed per-route metrics remain disabled. [Observability](team-hub-2b4b-evidence-2026-10-06/observability.json), [reconciled summary](team-hub-2b4b-evidence-2026-10-06/acceptance.json).

## Preserved candidate and checks

Product remains 40 resources; security seven. Templates and all 35 source-manifest files match the accepted candidate. Four temporary Lambda configuration writes total (activate two, restore two); no CloudFormation execution, new resource, synthesis, code upload, route change or IAM change.

- Product SHA256: d9e47021ffc55ee99c9477f0ff00590258f10e51375d7f8065afbf28f26c51c2.
- Security SHA256: 8431078d29f8a5c8cbdd53737727fe3df75421c1ce2f804d09eb48e3a5d9389c.
- Runtime ZIP SHA256: fd586f77dd3d872299e432f8e6d4631da09592cd29f47df6221ec8ede77b4a6d.
- Bundle SHA256: 6f83d22ddc4a19c5a43d3cc6de8d1a6d5857ab287f4b731b122f1e6b59750175.

[Final pinned state](team-hub-2b4b-evidence-2026-10-06/final-state.json). Offline sequence 41/41; existing parity/infrastructure regression suite 23/23; helper switching suite 3/3. Credential-pattern scan of new evidence/helpers found no credential/token literals. [Scan](team-hub-2b4b-evidence-2026-10-06/secret-scan.json). No Git commit or push in this task; unrelated existing workspace changes preserved.

## Core blockers and next gate

Still required before ordinary-user cutover: real authorization.decision.v1 and directory.assignment.v1 owner contracts; profile.summary.v1 where needed; real CREATE_TEAM entitlement; deferred branding/media; all-path Legacy writer fence; real target-authority integration; frontend endpoint cutover; nonempty state reconciliation/rollback rehearsal; cursor-signing lifecycle; alarm notification ownership. Shared environment.v1/Cognito remain accepted. Synthetic verification does not satisfy these dependencies.

Current domain: Team Hub. Phase: 2B4B synthetic proof completed. AWS: four reversible configuration writes, 15 synthetic transactions and exact cleanup; final Operational 0, retained audit 15. Legacy changes: 0. Production changes: 0. Ownership ledger row changes: 0; no resources marked MIGRATED, CUTOVER or retired.

NEXT: **TEAM HUB 2B5 — CORE CONTRACTS / WRITER-FENCE AND CUTOVER PREPARATION**. This report does not authorize cutover or retirement.

TEAM HUB SYNTHETIC MUTATION PARITY VERIFIED — READY FOR CUTOVER-DEPENDENCY REVIEW
`;
fs.writeFileSync('docs/architecture/team-hub-2b4b-synthetic-mutation-verification.md',report);
const statusPath='docs/architecture/domain-migration-status.json',status=read(statusPath),team=status.domains.find(d=>d.domain==='Team Hub');
status.scope='Ntgre Team Hub 2B4B synthetic verification complete; verification disabled; Legacy authority retained';
status.currentPhase='M5 / Phase 2B4B synthetic parity verified; 2B5 dependency review next';
if(team.syntheticVerificationReview.status!=='PASSED_DISABLED_CLEANED')status.awsChanges+=4;
team.phase='M5_2B4B_SYNTHETIC_PARITY_VERIFIED';team.lastVerified=end.at;
team.blockers=team.blockers.map(b=>b.startsWith('Persistent Command/Read adapters')?'Persistent Command/Read synthetic parity verified. Real Core authorization and writer-fence/cutover dependencies remain unresolved; ordinary target writer disabled.':b);
team.nextStep='TEAM HUB 2B5 — CORE CONTRACTS / WRITER-FENCE AND CUTOVER PREPARATION';
team.mutationParity.status='SYNTHETIC_PARITY_VERIFIED_DISABLED';team.mutationParity.liveTestPerformed=true;team.mutationParity.report='docs/architecture/team-hub-2b4b-synthetic-mutation-verification.md';
team.syntheticVerificationReview={status:'PASSED_DISABLED_CLEANED',activated:true,verificationEnabled:false,awsResourceChanges:0,awsConfigurationWrites:4,syntheticTransactions:15,liveChecks:41,postDisableDenials:10,operationalRecords:0,retainedAuditRecords:15,ordinaryTargetWriter:false,legacyAuthority:'LEGACY_WRITER',report:'docs/architecture/team-hub-2b4b-synthetic-mutation-verification.md'};
fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
const index='docs/architecture/README-PHASE2-MIGRATION.md';let content=fs.readFileSync(index,'utf8');
if(!content.includes('**Latest 2B4B result'))content=content.replace('\n\n','\n\n**Latest 2B4B result (6 October 2026): SYNTHETIC MUTATION PARITY VERIFIED.** All nine commands and 41 live sequence checks passed. Verification explicitly disabled; Operational 0, Journal 15 retained synthetic audits. Legacy remains LEGACY_WRITER; no ordinary-user or frontend cutover. [2B4B report](team-hub-2b4b-synthetic-mutation-verification.md). Next: Team Hub 2B5 Core contracts / writer-fence and cutover preparation.\n\n');
content=content.replace('2B4B verification review next. Fence/cutover NOT performed.','2B4B synthetic verification passed and disabled; 2B5 Core/fence preparation next. Fence/cutover NOT performed.');
fs.writeFileSync(index,content);
console.log(JSON.stringify({accepted:true,report:'docs/architecture/team-hub-2b4b-synthetic-mutation-verification.md',secretScanFiles:scanFiles.length,metrics:metricSummary,apiMetrics}));
