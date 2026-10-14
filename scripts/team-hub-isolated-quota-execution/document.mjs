import fs from 'node:fs';import assert from 'node:assert/strict';
import {E,read,save,manifest,verifyPins} from './common.mjs';
verifyPins();
for(const n of ['pins','baseline','runtime-security','proposal-security','custody','operator-policy','live-endpoint','metrics-latest','change-review','provision','installed','transactions','probe','probe-monitoring','probe-audit','transaction-monitoring','cleanup','final/baseline','final/protected-after','final/installed-security-audit','final/observability'])assert.equal(read(E+'/'+n+'.json').complete,true,n);
const tx=read(E+'/transactions.json'),probe=read(E+'/probe.json'),p=read(E+'/provision.json'),audit=read(E+'/probe-audit.json'),final=read(E+'/final/baseline.json');
assert.ok(audit.events.some(x=>x.eventName==='Decrypt'&&x.sourceService==='secretsmanager.amazonaws.com'&&x.keyResources.includes('arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a')));
const report='team-hub-2b6-quota-corrected-isolated-aws-verification-result.md',dir=E.split('/').at(-1);
const result={at:new Date().toISOString(),status:'ISOLATED_AWS_BUSINESS_VERIFICATION_ACCEPTED',candidate:manifest.candidate,template:manifest.template,policy:manifest.policy,probeZip:manifest.probe.sha256,transactionScenarios:48,cursorChecks:9,temporaryResourcesCreated:4,temporaryResourcesRemoved:4,remainingTemporaryResources:0,permanentBusinessRecordsChanged:0,permanentIamChanges:0,legacyChanges:0,productionChanges:0,frontendActivated:false,sourceFenceInstalled:false,authority:{mode:'LEGACY_WRITER',epoch:1,version:1},ledgerChanges:0,complete:true};save('result',result);
const link=(label,file)=>`[${label}](${dir}/${file}.json)`;
fs.writeFileSync('docs/architecture/'+report,`# Project Respawn Team Hub 2B6 — quota-corrected isolated AWS verification result

**ISOLATED AWS BUSINESS VERIFICATION ACCEPTED — READY FOR FINAL CUTOVER REVIEW.**

12 October 2026. The separately authorized, exact quota-corrected lifecycle completed. Four temporary resources were created, used and removed. The approved ZIP object version was uploaded and deleted. All 48 real DynamoDB scenarios and all nine actual-Read-role cursor checks passed. No permanent IAM/runtime, live business state, authority, frontend, source fence or production change occurred. This is isolated acceptance, not business cutover.

## Exact artifacts and change set

| Artifact | Verified SHA-256 |
| --- | --- |
| Candidate | \`${manifest.candidate.sha256}\` |
| Template | \`${manifest.template.sha256}\` |
| Runner policy | \`${manifest.policy.sha256}\` |
| Probe ZIP | \`${manifest.probe.sha256}\` |
| Existing Read/Command ZIP, unchanged | \`da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e\` |

${link('Pins and source closure','pins')}: original blocked candidates and evidence preserved; no runtime rebuild, synthesis or HEAD substitution. Probe reserved concurrency remained unset. Existing Read role and log group reused without permanent permission changes. That role retains its accepted Team-owned read/Core access; it is not a secret-only role. Fixed code, empty input, one invocation and no public/event trigger constrain this approved probe.

AWS account 058264289478, eu-north-1; approved identity arn:aws:iam::058264289478:user/RavenTest. Fresh unreserved capacity 10; sampled utilization had no throttles/exhaustion. ${link('Custody','custody')} and ${link('Provisioning identity policies','operator-policy')}: 41 lifecycle checks plus exact object-version cleanup permission passed. Existing Founder administrator access was inspected, not added. Organization policy visibility remains the previously accepted limitation; these tests do not prove every external policy layer.

Change set: \`${p.changeSetId}\`.

${link('Complete AWS change set','change-set')} and ${link('Review','change-review')}: four additions only, zero modifications/deletions/replacements or nested stacks. AWS-held template and time parameters matched. Exact two synthetic tables, restricted role and fixed cursor Lambda; no API, secret, log group or permanent resource added. CloudFormation reached CREATE_COMPLETE with rollback enabled. ${link('Provisioning receipts','provision')}.

Runner permission window: ${p.window.NotBefore} through ${p.window.ExpiresAt}, at most one hour. Temporary role removed before expiry. ${link('Installed verification','installed')}: exact trust/policy, no attached managed policies or boundary, table schemas/tags/recovery, exact probe code/role/logging, absent reservation/triggers verified. 138 installed-role allow/deny/time/region controls passed. Fresh ${link('runtime IAM','runtime-security')} passed 65 cases and four Analyzer validations; ${link('runner certification','proposal-security')} passed 36 cases and one Analyzer validation. All five Analyzer results had zero findings.

## Actual AWS verification

${link('Transactions and durable cleanup receipts','transactions')}: 48/48 scenarios, 728 SDK requests with maxAttempts 1. Actual assumed runner identity and exact tagged table ownership were verified. Tests covered atomic commits/cancellations, missing/stale authority, LEGACY_WRITER/FROZEN rejection, authority and membership races, revision conflicts, concurrent Team/roster changes, replay/idempotency, audit integrity and zero partial writes. Three expected TransactionCanceledException responses were recorded with AWS request IDs. No automatic suite retry.

The reviewed Admin, Manager, Coach, Player and ordinary-user fixtures exercised the unchanged business handlers. Core/persona adapters were explicitly synthetic; this is not real Core/browser authorization success for activated business routes. Wrong roles, subjects and Teams, revoked Player/former Manager, and private persistence were denied. Branding and Coach-private creation remain disabled.

Pre-cleanup reconciliation: Operational ${tx.result.reconciliation.operational.count} rows, digest \`${tx.result.reconciliation.operational.digest}\`; Journal business/audit ${tx.result.reconciliation.journal.count} rows, digest \`${tx.result.reconciliation.journal.digest}\` (the separate synthetic authority fixture was also removed). Strong scans confirmed both isolated tables empty afterward.

${link('Single cursor invocation','probe')}: 9/9 boolean checks passed under the actual Read role; signing, verification, tamper, wrong Team/actor/context/limit, wrong material and expiry checks. Empty input only; request ID \`${probe.requestId}\`. No secret value, cursor, token or digest returned/persisted. ${link('CloudTrail correlation','probe-audit')} independently records successful exact-secret GetSecretValue and managed-key Decrypt under the probe's Read-role session: ${audit.events.map(x=>x.eventName+' '+x.eventId).join('; ')}.

${link('DynamoDB observability','transaction-monitoring')}: consumed capacity corroborates both tables, no observed throttles, SDK cancellation receipts retained. ${link('Probe monitoring','probe-monitoring')}: exactly one invocation, zero errors/throttles and three platform events, no application output. CloudWatch/CloudTrail required read-only ingestion polling; no test was reinvoked. These internal probes do not imply live business API success.

Before provisioning, both existing local test sessions were reused through the approved helper: authority HTTP 200 at LEGACY_WRITER 1/1, all 16 business routes HTTP 403, client rejects target operations. ${link('Authenticated checks','live-endpoint')}. ${link('D1 correlation','metrics-latest')}: 40 structured events, expected custom counters and native API/Lambda metrics, no unexpected 5xx/errors/throttles. Six existing alarms and detailed API metrics preserved.

## Cleanup and preservation

${link('Cleanup','cleanup')}: four resources absent, exact uploaded S3 object version deleted, stack lifecycle complete. Existing Read role/log group preserved. Synthetic rows were removed before table deletion. No credentials persisted; IAM user tags were omitted from custody evidence because unnecessary for authorization evidence. Secret scan and document-link results are recorded in this execution evidence directory.

${link('Final baseline','final/baseline')}, ${link('protected resources','final/protected-after')}, ${link('business/source inventory','final/after/inventory')}, ${link('permanent security','final/installed-security-audit')}, ${link('source fence','final/source-fence-preservation-after')} and ${link('monitoring configuration','final/observability')}:

| Protected state | Final result |
| --- | --- |
| Legacy | 2,621; FunctionDirectiveStack 167; source PITR/deletion protection/backups intact; four source tables and logos empty |
| Team Hub | 48 product + 7 security; API, complete Lambda configurations/revisions/code preserved; Active/Successful/IN_SYNC |
| Core / Tournament | 8+5 / 11; protected identities/templates unchanged |
| Real authority | LEGACY_WRITER, epoch 1, version 1 |
| Permanent business state | Operational 0; Journal 16 = authority + 15 historical audits, 0 business rows |
| Frontend / fence / production | Legacy frontend; source fence absent; no production writes or retirement |

This preservation covers the inspected protected resources, not an account-wide production audit. Local tests: 13 focused tests and 41 accounting tests passed; 75 accepted pins/nine archives verified; ledger 2,621 total, 2,430 assigned, 191 unresolved shared, zero unassigned. The AWS transaction/cursor runs supplement those offline proofs.

## Remaining cutover gates

1. Final review of business-runtime transactional enforcement and real Core/persona acceptance scope; isolated synthetic adapters do not substitute for live global authorization.
2. Separately authorized FROZEN maintenance, installed Legacy writer-fence denial proof and source/state reconciliation. No fence or authority transition occurred here.
3. Separately authorized TARGET_WRITER activation and live business acceptance, followed by reviewed frontend publication. The authority endpoint is not the mutation security boundary.
4. Maintain rollback/recovery protections, abort ownership and accepted rollback constraints; no Legacy retirement authorized.

Current domain Team Hub; phase M5/2B6 isolated AWS verification accepted. AWS changes: four temporary resources created/removed, isolated synthetic writes/cleanup, one probe invocation, one exact artifact upload/delete. Permanent, Legacy, production and ledger changes: zero. Next gate: final cutover execution review with separate authorization boundaries.
`);
const notice=`**Quota-corrected isolated AWS verification (12 October 2026): ACCEPTED — READY FOR FINAL CUTOVER REVIEW.** 48/48 real isolated DynamoDB scenarios and nine actual-Read-role cursor checks passed; CloudTrail retrieval/decryption, native metrics, cleanup and final preservation verified. Four temporary resources and exact artifact removed. Real LEGACY_WRITER epoch/version 1, empty permanent business state, permanent IAM/code, Legacy frontend and protected domains preserved. No cutover or retirement. [Authoritative result and evidence](${report}). Earlier entries are historical.\n\n`;
for(const file of ['README-PHASE2-MIGRATION.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md','team-hub-2b6-isolated-aws-business-verification.md','team-hub-2b6-isolated-aws-verification-result.md']){const path='docs/architecture/'+file,s=fs.readFileSync(path,'utf8'),i=s.indexOf('\n');assert.ok(!s.includes(']('+report+')'),'Document update already applied');fs.writeFileSync(path,s.slice(0,i+1)+'\n'+notice+s.slice(i+1));}
const statusPath='docs/architecture/domain-migration-status.json',status=read(statusPath),team=status.domains.find(x=>x.domain==='Team Hub');
status.scope='Quota-corrected isolated AWS verification executed and cleaned up; no permanent infrastructure or authority transition';status.currentPhase='M5 / 2B6 ISOLATED_AWS_BUSINESS_VERIFICATION_ACCEPTED';
team.phase='M5_2B6_ISOLATED_AWS_BUSINESS_VERIFICATION_ACCEPTED';team.lastVerified=final.at;team.nextStep='Final cutover execution review: preserve separate live fence, real business authorization, authority and frontend gates';team.blockers=team.blockers.filter(x=>!x.includes('Isolated live AWS business transaction and cursor-secret proofs'));
team.quotaCorrectedIsolatedExecution={...result,report:'docs/architecture/'+report,evidence:E+'/result.json'};team.evidence.push('docs/architecture/'+report);fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({complete:true,report,status:result.status}));
