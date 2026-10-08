import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import path from 'node:path';
const D='docs/architecture/',E=D+'team-hub-c1-execution-evidence-2026-10-07',read=n=>JSON.parse(fs.readFileSync(E+'/'+n+'.json'));const before=read('inventory'),after=read('post/inventory'),authority=read('authority-readback'),cleanup=read('cleanup'),workflow=read('workflow-status'),pre=read('preflight'),window=read('window');assert.ok(before.complete&&after.complete&&authority.verified&&cleanup.passed&&read('authority-after-cleanup').verified);assert.deepEqual(before.sources,after.sources);assert.deepEqual(before.logos,after.logos);assert.deepEqual(before.stacks,after.stacks);assert.deepEqual(before.legacy,after.legacy);const journal=after.target.find(x=>x.name.endsWith('-Journal')),operational=after.target.find(x=>x.name.endsWith('-Operational'));assert.equal(journal.control,1);assert.equal(journal.audits,15);assert.equal(journal.business,0);assert.equal(journal.total,16);assert.equal(operational.total,0);for(const r of read('post/installed-iam').roles){assert.ok(r.acceptedDarkMatch);assert.equal(r.codeSha256,Buffer.from('2992b5d6b736c90c3fc306654a38576cd861dc0e07068c92bf02c79c87948e6a','hex').toString('base64'));assert.equal(r.authority,'LEGACY_WRITER');assert.equal(r.normalWrites,'DISABLED');}assert.ok(read('routes-before').complete&&read('routes-after').complete);assert.equal(workflow.status,'SUCCEEDED');assert.ok(Date.parse(workflow.startDate)>=Date.parse(window.start)&&Date.parse(workflow.stopDate)<Date.parse(window.end));
const result={at:new Date().toISOString(),status:'C1_AUTHORITY_INITIALIZED_READY_FOR_C2_REVIEW',identity:pre.identity,region:'eu-north-1',pinsVerified:true,c1:pre.c1,window,executionArn:workflow.executionArn,workflowStatus:workflow.status,startUTC:new Date(workflow.startDate).toISOString(),stopUTC:new Date(workflow.stopDate).toISOString(),conditionalCreations:1,scheduledPutTasks:authority.putTasksScheduled,authority:{mode:'LEGACY_WRITER',epoch:1,version:1},businessRecordsChanged:0,controlRecordsCreated:1,normalRoutesDeniedBefore:13,normalRoutesDeniedAfter:13,temporaryResourcesCreated:2,temporaryResourcesRemaining:0,cleanupPassed:true,legacyUnchanged:true,coreUnchanged:true,tournamentUnchanged:true,teamRuntimeAndIamUnchanged:true,c2Executed:false,d1Executed:false,frontendActivated:false,productionChanges:0,remaining:['C2 separately reviewed runtime GetItem deployment','D1 separately reviewed dark telemetry deployment/live acceptance','B source fence proof in authorized maintenance','Remaining business epoch/frontend/rollback live gates']};fs.writeFileSync(E+'/result.json',JSON.stringify(result,null,2)+'\n');
const R='team-hub-c1-execution-evidence-2026-10-07';const report=`# Project Respawn Team Hub 2B6 - C1 result

**C1 AUTHORITY INITIALIZED - READY FOR C2 REVIEW**

C1 alone executed and was independently verified. C2/D1 were not started. Actual authority remains LEGACY_WRITER with live epoch/version 1. Normal Team reads/commands remain denied; frontend remains Legacy. No FROZEN/TARGET transition, Legacy retirement or production change.

## Identity, pins and reviewed gate

Operator: ${pre.identity.Arn}; account 058264289478; region eu-north-1. Existing security-operator lifecycle permissions passed simulation with no missing context. No administrative grant was made to the ordinary Team deployment caller.

- Request SHA256: ${pre.c1.requestSha256}.
- Workflow SHA256: ${pre.c1.workflowSha256}.
- Template SHA256: ${pre.c1.templateSha256}.

The manifest hash, fixed request, template/workflow equivalence and referenced evidence were verified. No rebuild, metadata substitution, runtime change or current-HEAD deployment. [Preflight](${R}/preflight.json).

UTC execution window: **${window.start} to ${window.end}**, 900 seconds. Resolved policy passed Access Analyzer and ten in-window/out-of-window/wrong-key/foreign-resource decisions. Only the approved WindowStart/WindowEnd template parameters changed; pinned metadata was preserved. [Window security](${R}/window-security.json).

The CREATE change set contained exactly two additions, no modifications/deletions/replacements: ExecutorRole (IAM) and Initializer (STANDARD Step Functions). AWS returned the exact pinned template. OnStackFailure=ROLLBACK; the resulting stack reported DisableRollback=false. [Change set](${R}/change-set.json), [inspection](${R}/inspection.json).

## Live execution and authority proof

Temporary deployment reached CREATE_COMPLETE. Actual service-only trust, inline policy, empty attached-policy list and state-machine definition were compared with the approved resolved artifacts before start. Trust restricted states.amazonaws.com to the exact state-machine ARN and account. The role permitted only time-limited authority-partition GetItem/PutItem; fixed workflow parameters enforced SK=STATE and the conditional create. No broad business/domain, DeleteItem or UpdateItem permissions.

Execution: ${workflow.executionArn}.

Started **${result.startUTC}**, finished **${result.stopUTC}**, status **SUCCEEDED**. Empty input; no retries or redrive. History contains exactly one scheduled PutItem task. The workflow conditionally created one record; independent strongly consistent GetItem and complete authority-partition Query verified the exact approved field set and one record. CloudFormation completion alone was not treated as record success. [History](${R}/workflow-history.json), [readback](${R}/authority-readback.json).

Record: PK CONTROL#AUTHORITY, SK STATE, schemaVersion team-hub-authority.v1, mode LEGACY_WRITER, epoch 1, version 1. changedAt remains the approved preparation timestamp 2026-10-07T22:32:12.867Z; actual execution timestamps are above. changedBy and gateDigest were preserved byte-for-byte in the typed request comparison. No environment attribute was added to the approved schema.

## Normal-write denial and protected state

All 13 normal API routes returned HTTP 403 using the existing approved authenticated session before and after C1. Empty invalid mutation payloads prevented business data creation even on an unexpected handler regression; no synthetic authorization override or identity change was used. Sessions stayed in memory; helper collectors and temporary pages were cleaned. [Before](${R}/routes-before.json), [after](${R}/routes-after.json).

Fresh before/after inventory agrees: Legacy 2,621 / FunctionDirectiveStack 167, all inventoried templates identical; four source tables empty, PITR/deletion protection intact, backups AVAILABLE and logo state empty. Team product/security 40+7; Core 8+5; Tournament 11, same API IDs/statuses. Team/Core accepted templates match. Actual Team runtime code, identity policies and v5 boundaries remain accepted dark state, with LEGACY_WRITER and normal writes DISABLED. C2/D1 not installed.

Operational remains empty. Journal has its same 15 audit records plus exactly one authority record, zero business rows. **Business records changed: 0.** [Final inventory](${R}/post/inventory.json), [installed runtime/IAM](${R}/post/installed-iam.json), [template preservation](${R}/post/accepted-template-preservation.json).

## Cleanup and audit

The exact temporary stack was deleted after preserving workflow history and CloudFormation events. Stack DELETE_COMPLETE; IAM role and state machine both return absence. **Temporary resources remaining: 0.** A new strong read after cleanup proves the authority record remains unchanged. [Cleanup](${R}/cleanup.json), [post-cleanup authority](${R}/authority-after-cleanup.json).

Sanitized execution history, installed policy/trust snapshots, operator identity and stack events are retained. Audit configuration reports one trail; no DynamoDB data-event delivery is assumed or claimed. No credentials/tokens were persisted in evidence.

## Next gates

C1 is accepted only. C2 authority GetItem changes require their own review/authorization. D1 telemetry deployment/live acceptance, B actual installed source-fence proof, business epoch verification, frontend binding and final rollback proof remain separate. Do not repeat C1: an existing control row must stop conditional initialization, not be overwritten or recreated.

**C1 AUTHORITY INITIALIZED - READY FOR C2 REVIEW**
`;
fs.writeFileSync(D+'team-hub-c1-execution-result.md',report);
const note='**Latest C1 result: AUTHORITY INITIALIZED - READY FOR C2 REVIEW.** Live conditional creation verified: LEGACY_WRITER, epoch/version 1. Temporary role/state machine removed; normal routes remain denied; zero business records changed. C2/D1 not executed. [C1 result](team-hub-c1-execution-result.md).\n\n';for(const n of ['team-hub-c1-c2-d1-execution-readiness.md','team-hub-2b6-acceptance.md','team-hub-2b6-precutover-readiness.md','team-hub-2b6-cutover-runbook.md']){let s=fs.readFileSync(D+n,'utf8');const i=s.indexOf('\n');s=s.slice(0,i+1)+'\n'+note+s.slice(i+1);if(n.includes('runbook'))s=s.replace('## Artifacts and entry gate','## Current authority checkpoint\n\nC1 is complete: strongly read the existing LEGACY_WRITER epoch/version 1 control record. Do not rerun initialization, overwrite metadata or recreate the temporary executor. C2 and D1 still need separate authorization. Historical initialization instructions below are superseded.\n\n## Artifacts and entry gate');fs.writeFileSync(D+n,s);}let s=fs.readFileSync(D+'README-PHASE2-MIGRATION.md','utf8');s=s.replace(/<!-- TEAM 2B6 START -->[\s\S]*?<!-- TEAM 2B6 END -->/,'<!-- TEAM 2B6 START -->\n'+note+'<!-- TEAM 2B6 END -->');fs.writeFileSync(D+'README-PHASE2-MIGRATION.md',s);
const p=D+'domain-migration-status.json',j=JSON.parse(fs.readFileSync(p));j.scope='Team Hub C1 authority initialized and verified; temporary executor cleaned; C2/D1 not executed';const team=j.domains.find(x=>x.phase2B6);team.phase2B6.status='C1_AUTHORITY_INITIALIZED_READY_FOR_C2_REVIEW';team.phase2B6.authority='LEGACY_WRITER';team.phase2B6.epoch=1;team.phase2B6.c1={status:'ACCEPTED_LIVE',version:1,report:D+'team-hub-c1-execution-result.md',evidence:E+'/result.json',temporaryResourcesRemaining:0,businessRecordsChanged:0};team.phase2B6.nextStep='Separate C2 execution review; do not infer D1 or business cutover authorization';team.phase2B6.blockers=result.remaining;team.phase2B6.awsWrites=4;team.phase2B6.awsWriteCounting='Direct operator calls: CreateChangeSet, ExecuteChangeSet, StartExecution, DeleteStack; managed resource operations and one conditional PutItem recorded separately in C1 evidence';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
const files=[];function visit(p){for(const f of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,f.name);if(f.isDirectory())visit(q);else files.push(q);}}visit(E);const patterns=[/AKIA[0-9A-Z]{16}/,/ASIA[0-9A-Z]{16}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/];assert.ok(!files.some(p=>patterns.some(r=>r.test(fs.readFileSync(p,'utf8')))),'SECRET_PATTERN');let links=0;for(const m of report.matchAll(/\]\(([^)]+)\)/g)){assert.ok(fs.existsSync(path.resolve(D,m[1])));links++;}fs.writeFileSync(E+'/final-review.json',JSON.stringify({at:new Date().toISOString(),secretScannedFiles:files.length,secretPatternHits:0,reportLinks:links,c1Accepted:true,c2Executed:false,d1Executed:false},null,2)+'\n');console.log(JSON.stringify({c1:'ACCEPTED',epoch:1,temporaryResourcesRemaining:0,businessRecordsChanged:0}));

