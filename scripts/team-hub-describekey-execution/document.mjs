import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,E} from './aws.mjs';
const get=n=>read(E+'/'+n+'.json'),a=get('accepted');assert.equal(a.complete,true);
const w=get('window'),execution=get('workflow-status'),config=get('configuration'),cloudtrail=get('execution-cloudtrail');
assert.equal(cloudtrail.complete,true);assert.equal(get('preservation-extra').complete,true);
const dir='docs/architecture',report='team-hub-2b6-describekey-recovery-result.md',ev='team-hub-describekey-execution-evidence-2026-10-12';
const link=(name,file)=>`[${name}](${ev}/${file}.json)`;
const body=`# PROJECT RESPAWN TEAM HUB 2B6 — DESCRIBEKEY-CORRECTED RECOVERY RESULT

12 October 2026. **LAMBDA CONFIGURATION RECOVERY ACCEPTED — READY FOR ISOLATED AWS BUSINESS RUNTIME VERIFICATION.**

The single authorized fixed workflow succeeded. Both complete Lambda environments now match CloudFormation. This accepts configuration recovery and dark runtime health; it does not accept live business transactions, cursor decryption, source-fence enforcement or business cutover.

## Exact package and custody

Operator: arn:aws:iam::058264289478:user/RavenTest. Account 058264289478, region eu-north-1. ${link('Fresh preflight','preflight')} and ${link('operator lifecycle custody','custody')} passed. The documented company SCP-visibility limitation and user waiver remain; no organization-wide effective authorization is inferred from simulation or this successful operation.

| Artifact | SHA-256 |
| --- | --- |
| Candidate | 9a1bc835b48782cf4bb8df5fbcfb9f138e64ea74a579a0fdec0a8ba507254969 |
| Temporary security template | 0224800977ddd69f6953f53d9d7564f1ec2ad1c3086a99cff91fcd16eb297f59 |
| Temporary identity policy | 4c8aeefccf76019e9df11cda04278ec4ac8de4dae4b77f42218c8252ce1cbe8b |
| Fixed workflow | 862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376 |
| Both runtime ZIPs, unchanged | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |

${link('Exact verification','exact-pin-and-frontend')} includes preserved historical artifacts and sealed validation inputs. No runtime rebuild, synthesis, HEAD substitution or historical overwrite occurred.

## Security and execution

${link('Full certification','security-validation')}: 222/222 passed. ${link('Critical actual-role validation','actual-security')}: 82/82 passed before NotBefore, with exact installed RoleId and before/after trust/policy/workflow equivalence. ${link('Service validation','service-validation')}: zero Access Analyzer findings, valid template and fixed workflow. Forty-nine local candidate/harness/integrity tests passed.

${link('Window receipt','window')} / ${link('receipt hash','window-hash')}: ${w.start} through ${w.end}, exactly 900 seconds, with 45 minutes of preparation lead. No extension. ${link('Immediate preflight','immediate-preflight')} passed.

${link('AWS change set','change-set')} contained exactly two additions: RecoveryRole and RecoveryWorkflow; zero modifications, deletions, replacements or unrelated resources. Rollback enabled. ${link('Installed executor','installed')} matched the exact service-only trust, one inline policy, no boundary or attached policies, and fixed workflow. No permanent IAM changes.

Execution: ${execution.executionArn}

Started ${new Date(execution.startDate).toISOString()}, stopped ${new Date(execution.stopDate).toISOString()}, status SUCCEEDED. Exactly one start, empty input, no retry or repinning. ${link('Execution receipt','workflow-status')} / ${link('complete history','workflow-history')} / ${link('AWS write audit','started')}.

${link('CloudTrail','execution-cloudtrail')} records two successful UpdateFunctionConfiguration operations plus successful DescribeKey, Encrypt and Decrypt calls; no recorded errors. Update request IDs: ${cloudtrail.updateEvents.map(x=>x.requestID).join(', ')}. This is live lifecycle evidence, not simulation alone. The policy granted no KMS administration or general KMS access.

## Lambda and live application acceptance

| Function | Complete Environment | State/update | Drift | Final RevisionId |
| --- | --- | --- | --- | --- |
${config.functions.map(f=>`| ${f.kind} | ${Object.keys(f.configuration.Environment.Variables).length} exact keys | Active / Successful | ${f.drift.StackResourceDriftStatus} | ${f.configuration.RevisionId} |`).join('\n')}

${link('Complete configurations and drift receipts','configuration')} preserve unchanged code SHA, roles, runtime version, memory, timeout, architecture, VPC, layers, logging and all non-environment properties. Desired CloudFormation product template unchanged. Only these two function-level drift checks are claimed; historical UNKNOWN/unsupported resource drift is not treated as confirmed drift.

${link('Authenticated application receipts','live-endpoint')}: existing Admin and ordinary sessions each returned HTTP 200 from GET /v1/authority with LEGACY_WRITER, epoch 1, version 1. Missing/invalid tokens, wrong issuer/client signatures and ID-token misuse were rejected. Browser-supplied epoch query rejected. Dormant frontend client rejected LEGACY authority without issuing business requests. All 16 normal business routes returned HTTP 403. No tokens persisted.

${link('Monitoring correlation','metrics-latest')}: 40 EMF events correlate to handled requests; Read Requests 15 / Command Requests 9, writer-denial counts 7 / 9, authorization-failure counts 9 / 9. All expected custom counts match CloudWatch. Native API and Lambda metrics accepted; no Lambda errors/throttles or API 5xx. Initial native API Count ingestion delay cleared on read-only recheck without new traffic. ${link('Six preserved alarms','observability')} confirms accepted D1 configuration, detailed API metrics and attended manual monitoring. API access logs remain deferred Option A; notification delivery is not configured/proven. Dependency/transaction/epoch failure injection is not claimed by this dark acceptance.

## Cleanup and preservation

${link('Cleanup','cleanup')}: DELETE_COMPLETE; temporary role and state machine absent. Initial DELETE_IN_PROGRESS was polled read-only to completion. No authority record or business data was removed.

${link('Inventory and source recovery','after/inventory')}: Operational 0; Journal 16 = 15 existing audit records + 1 authority record; zero business records. Four Legacy sources and logos remain empty; PITR, deletion protection and backups intact. ${link('Authority','authority')}: LEGACY_WRITER, epoch/version 1/1 unchanged.

${link('Protected templates','protected-after')}: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48 product + 7 security; Core 8 + 5; Tournament 11. ${link('Permanent IAM','installed-security-audit')} and ${link('key policy, role attachments and frontend','preservation-extra')} unchanged. ${link('Source fence','source-fence-preservation-after')} remains inactive. No production change, frontend switch, FROZEN, TARGET_WRITER or Legacy retirement.

AWS mutations were limited to preparation/execution/deletion of the two-resource temporary stack, one fixed workflow execution and two successful Lambda Environment updates. Net temporary resources: zero. No permanent IAM or code change.

## Remaining separately authorized work

1. Isolated real AWS transactional business-runtime verification: epoch/state fail-closed behavior, current membership, revisions, idempotency, conflicts and audit conditions without real authority transition.
2. Isolated Read-role cursor-secret decryption/signing/verification, wrong-secret and tampered-cursor controls; no cursor material in logs/evidence. This recovery did not retrieve the secret.
3. Complete remaining business-runtime/frontend/rollback acceptance before maintenance review. Authority endpoint success is not a substitute for transactional enforcement.
4. Separately authorize FROZEN maintenance, installed Legacy-fence live denial proof, target-authority transition and final frontend activation as distinct gates.

The consumed workflow must not be rerun: pinned original RevisionIds are obsolete after successful recovery. Do not restore known-unhealthy maps. Any subsequent repair requires a fresh reviewed package. Historical failed packages/evidence remain preserved. ${link('Consolidated machine acceptance','accepted')} is the recovery acceptance receipt.
`;
fs.writeFileSync(dir+'/'+report,body);
const notice=`**DescribeKey-corrected recovery (12 October 2026): ACCEPTED — READY FOR ISOLATED AWS BUSINESS RUNTIME VERIFICATION.** One fixed execution succeeded; both complete Lambda environments match CloudFormation, Active/Successful and IN_SYNC. 222 certification + 82 actual-role checks passed. Authority HTTP 200 at LEGACY_WRITER 1/1, all 16 business routes HTTP 403, monitoring accepted, business state empty. Temporary role/workflow removed; permanent IAM/code and protected domains preserved. No frontend, fence or authority transition. Isolated AWS transaction/cursor proofs remain separate. [Actual receipts and remaining gates](${report}). Earlier entries are historical.`;
for(const name of ['README-PHASE2-MIGRATION.md','team-hub-2b6-acceptance.md','team-hub-2b6-cutover-runbook.md']){const file=dir+'/'+name,s=fs.readFileSync(file,'utf8'),i=s.indexOf('\n');fs.writeFileSync(file,s.slice(0,i+1)+'\n'+notice+'\n\n'+s.slice(i+1));}
const file=dir+'/domain-migration-status.json',ledger=read(file),team=ledger.domains.find(x=>x.domain==='Team Hub');
ledger.scope='Accepted two-Lambda environment recovery; temporary executor removed; dark runtime accepted; no business cutover';ledger.currentPhase='M5 / 2B6 LAMBDA_CONFIGURATION_RECOVERY_ACCEPTED';ledger.currentReviewAwsChanges=2;ledger.currentReviewAwsChangeScope='Two persistent Lambda Environment updates; temporary two-resource stack created/deleted and one fixed workflow execution, no permanent IAM/code/authority/frontend changes';
team.phase='M5_2B6_LAMBDA_CONFIGURATION_RECOVERY_ACCEPTED';team.lastVerified=a.at;team.blockers=['Isolated live AWS business transaction and cursor-secret proofs remain outstanding','Installed Legacy fence live denial proof reserved for separately authorized FROZEN maintenance','Final target-authority/frontend transition requires separate acceptance and authorization'];team.nextStep='Prepare separately reviewed isolated AWS transaction/cursor verification; preserve LEGACY_WRITER epoch/version 1 and disabled live frontend';
team.describekeyRecoveryExecution={status:'LAMBDA_CONFIGURATION_RECOVERY_ACCEPTED',report:dir+'/'+report,evidence:E+'/accepted.json',candidateSha256:team.describekeyCorrection.candidateSha256,certificationCases:222,installedRoleCases:82,workflowExecutions:1,successfulLambdaUpdates:2,temporaryResourcesRemaining:0,authority:'LEGACY_WRITER',epoch:1,version:1,frontendActivated:false,permanentIamChanged:false,productionChanges:0,isolatedAwsTransactionCursorProofs:'PENDING_SEPARATE_AUTHORIZATION'};
team.evidence.push(dir+'/'+report);fs.writeFileSync(file,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({complete:true,report,documentsUpdated:5}));
