import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const E='docs/architecture/team-hub-isolated-quota-evidence-2026-10-12',P='docs/architecture/team-hub-isolated-verification-evidence-2026-10-12',read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const name of ['semantic-diff','baseline','protected-after','installed-security-audit','runtime-security','proposal-security','capacity-telemetry','observability','source-fence-preservation-after'])assert.equal(read(E+'/'+name+'.json').complete,true,name);
const candidate=read(E+'/candidate.json'),security=read(E+'/runtime-security.json'),runner=read(E+'/proposal-security.json');
assert.equal(security.cases.length,65);assert.equal(runner.checks.reduce((n,x)=>n+x.rows.length,0),36);
for(const a of [candidate.template,candidate.policy,candidate.probe,...candidate.sourceHashes])assert.equal(sha(a.path),a.sha256,a.path);
const old=read(P+'/candidate.json');assert.deepEqual(candidate.sourceHashes,old.sourceHashes);assert.equal(sha(P+'/candidate.json'),candidate.supersedes.sha256);
const report='team-hub-2b6-isolated-aws-business-verification.md';
const note='**Quota correction (12 October 2026): QUOTA-CORRECTED ISOLATED VERIFICATION READY FOR EXECUTION REVIEW — NOT DEPLOYED.** Only the temporary probe reservation was removed; it is unset, not zero. Four resources, original policy/ZIP/source pins and all 48/nine scenarios preserved. Fresh capacity, protected baselines, 65 actual-role and 36 runner-policy controls pass; Analyzer zero findings. Sequential bounded execution and a separate AWS change-set/execution gate remain required. [Current corrected candidate and lifecycle]('+report+'#quota-corrected-candidate--current). Earlier failed-quota evidence remains historical.';
const section=`## Quota-corrected candidate — current

**QUOTA-CORRECTED ISOLATED VERIFICATION READY FOR EXECUTION REVIEW.** This update authorizes candidate preparation and read-only validation only. No change set, artifact upload, AWS resource/IAM change, invocation, business write or cutover occurred. The earlier four-resource candidate and failed quota evidence are preserved unchanged.

### Exact change and pins

Remove only \\Resources.CursorProbe.Properties.ReservedConcurrentExecutions\\ (previous value 1). The property is absent; it is not replaced with zero. Reintroducing the old property in memory makes the complete corrected template deeply equal to the original. No API, role, policy, KMS, log-group, table, ZIP, source or permanent-domain change is included.

| Artifact | SHA-256 |
| --- | --- |
| Corrected candidate | \`${sha(E+'/candidate.json')}\` |
| Corrected template | \`${candidate.template.sha256}\` |
| Original policy, unchanged | \`${candidate.policy.sha256}\` |
| Original probe ZIP, unchanged | \`${candidate.probe.sha256}\` |
| Original blocked candidate, preserved | \`${candidate.supersedes.sha256}\` |

[Candidate](team-hub-isolated-quota-evidence-2026-10-12/candidate.json), [execution manifest](team-hub-isolated-quota-evidence-2026-10-12/execution-manifest.json), [semantic diff](team-hub-isolated-quota-evidence-2026-10-12/semantic-diff.json). The sourceHashes array is exactly unchanged and all files still match. The new preparation/inspection tools are separate from those pinned sources; no runtime build or fresh synthesis was substituted. Do not rerun the original prepare.mjs to regenerate this candidate or the prior execution preflight/custody scripts that bind the old template and reservation. Future execution must load the corrected execution manifest explicitly.

### Capacity and replacement controls

Fresh account settings in [capacity](team-hub-isolated-quota-evidence-2026-10-12/capacity.json) remain total 10/unreserved 10, with 69 functions. The removed reservation previously conflicted with AWS's requirement to leave 100 unreserved. No quota increase or existing-function concurrency change is proposed. [Recent telemetry](team-hub-isolated-quota-evidence-2026-10-12/capacity-telemetry.json) has 15 one-minute datapoints per signal: maximum concurrency 2 and throttle sum 0 over the sampled 15-minute window. Historical utilization is not guaranteed execution headroom.

The probe now shares unreserved account capacity; it no longer has an AWS-enforced concurrency-one cap. Require one security-owned, synchronous empty-input invocation, SDK maxAttempts 1, no retry, no parallel probe/transaction workloads, and no public URL/API/event trigger. The transaction suite runs in order, preserving only its already-reviewed two-request race cases. Recheck current capacity/metrics immediately before execution; stop on throttling, exhaustion, unexplained invocations or insufficient cleanup time. Do not replace the removed reservation with zero or modify another function to obtain capacity.

### Resource and security review

Four temporary CloudFormation resources remain: two isolated tables, one restricted runner role with its existing inline policy, and one cursor-probe Lambda. No new managed policy, log group, invocation permission, API, secret or permanent resource. The existing Read role/log group and exact unchanged S3 probe object remain dependencies. That object may be uploaded only under later execution authorization. Offline delta is four additions and zero modifications/deletions/replacements to existing resources; actual AWS change-set classification remains a future gate.

Fresh installed Read/Command/execution/caller policies and boundaries match the accepted baseline. [Runtime IAM](team-hub-isolated-quota-evidence-2026-10-12/runtime-security.json): 65 actual-role checks pass, four Analyzer validations with zero findings. [Temporary runner](team-hub-isolated-quota-evidence-2026-10-12/proposal-security.json): 36 allowed/denied/time/region checks pass and Analyzer zero findings. No permissions changed. These are IAM evaluations, not successful secret decryption or real business acceptance.

Read-role reuse does not add permissions. Its existing Team-owned reads and accepted Core invocation are still allowed: **do not claim this is a secret-only IAM role**. The fixed, byte-verified probe exposes no selectable action/resource/input, contains no DynamoDB/Core client or arbitrary invocation route, and returns only booleans. Empty-input and no-secret-output regressions pass; business writes, foreign resources, code changes, PassRole, Cognito administration and unrelated secret/KMS controls remain denied in the existing role model. Provisioning custody must still prevent arbitrary code/role/input substitution. Without changing the preserved IAM, code integrity and controlled invocation are necessary parts of this reviewed design.

### Fresh preservation and tests

[Baseline](team-hub-isolated-quota-evidence-2026-10-12/baseline.json), [protected resources](team-hub-isolated-quota-evidence-2026-10-12/protected-after.json), [inventory](team-hub-isolated-quota-evidence-2026-10-12/after/inventory.json): Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48+7; Core 8+5; Tournament 11. Both Lambdas retain complete configuration/code, Active/Successful and IN_SYNC. Actual authority is LEGACY_WRITER epoch/version 1. Operational 0; Journal 16 = authority plus 15 historical audits, zero business records. Source recovery protections/backups and empty source/logo inventory remain intact. Frontend remains dormant/Legacy and source fence absent. Six D1 alarms/configuration preserved. No fresh authenticated API/browser acceptance is claimed by this preparation.

50 focused tests pass, including minimal-diff/pins, cursor and business-runtime regressions and the emulator-driven 48-scenario runner; 41 resource-accounting tests pass. All nine cursor checks remain unchanged and pass offline with synthetic material. Accepted 75 pins/nine archived artifacts and the ledger reconcile: 2,621 total, 2,430 assigned, 191 unresolved shared, 0 unassigned. Secret-pattern and documentation checks are recorded alongside this report. No actual DynamoDB scenario or secret retrieval was executed. No new TypeScript/runtime implementation was introduced; this is an offline template and manifest correction.

### Separately authorized execution sequence and cleanup

1. Refresh identity/account/region, quotas/utilization, exact temporary-name absence, full installed IAM, all protected configurations/templates/state and source recovery; obtain fresh authenticated authority/16-dark-route proof using existing sessions.
2. Verify this execution manifest and every unchanged source/policy/ZIP hash. Stop on any substitution. Verify no existing probe trigger or unintended invoker. Confirm the one-at-a-time invocation plan and the distinct runner permission window (at most one hour).
3. Complete provisioner lifecycle/PassRole/artifact security checks, actual Read-role isolation and runner certification. Preserve the documented organization-visibility limitation; do not claim simulator results prove all external policy layers.
4. Publish only the exact reviewed ZIP if separately authorized. Prepare the exact temporary change set, inspect every resource/property/IAM effect, require only four expected additions and no protected modifications/deletions/replacements. Rollback enabled.
5. Provision only after all gates pass; verify installed trust/policy/window, schema/tags, exact code/role/log configuration and absence of ReservedConcurrentExecutions. Run installed-runner positive/negative checks before test writes.
6. Run the unchanged 48 scenarios under the restricted runner on exact isolated tables. Preserve only the approved internal concurrency races; require atomicity, denials, replay/audit integrity, privacy and sanitized reconciliation receipts. Never alter the real authority row.
7. Invoke the unchanged nine-check probe exactly once with {} under the reviewed security custody. Require actual Read-role retrieval/decryption plus all booleans, no secret/token output and no unexplained error/throttle. Do not retry ambiguous failures or enable business routes to reach pagination.
8. Verify monitoring and permitted persona/privacy scope. Synthetic Core/persona adapters remain synthetic; real Core/browser/business-path acceptance is a separate remaining cutover proof. Refresh D1/native signals with bounded ingestion polling.
9. Capture durable before/after-cleanup digests. Remove only exact rehearsal-owned synthetic rows/resources and the exact uploaded object; verify both tables, role and function absent. Preserve the existing Read role/log group, permanent records and audit evidence. If partial provisioning/tests fail, collect evidence and clean up only resources created by this lifecycle. Never roll back by applying the obsolete reserved-concurrency template.
10. Refresh protected domains, actual LEGACY_WRITER 1/1 and business emptiness, permanent IAM/code and frontend/fence state. No real cutover, retirement or production change is authorized here.

Remaining live gates: complete provisioning custody, actual change set, installed temporary IAM, all 48 AWS transactions, actual Read-role cursor/KMS proof, telemetry and cleanup/preservation. Later source-fence proof, business authority transfer, frontend publication and rollback remain separately authorized. Current domain Team Hub, phase M5/2B6 preparation; AWS/Legacy/production/ledger changes all zero.

---

Historical preparation and failed execution chronology follows; the corrected manifest above is the current candidate.

`;
const rp='docs/architecture/'+report;let body=fs.readFileSync(rp,'utf8');if(!body.includes('## Quota-corrected candidate — current')){const pos=body.indexOf('\n')+1;body=body.slice(0,pos)+'\n'+section.replace(/\\Resources.CursorProbe.Properties.ReservedConcurrentExecutions\\/g,'`Resources.CursorProbe.Properties.ReservedConcurrentExecutions`')+body.slice(pos);fs.writeFileSync(rp,body);}
for(const p of ['docs/architecture/team-hub-2b6-acceptance.md','docs/architecture/team-hub-2b6-cutover-runbook.md']){let s=fs.readFileSync(p,'utf8');if(!s.includes(note)){const eol=s.includes('\r\n')?'\r\n':'\n',pos=s.indexOf('\n')+1;s=s.slice(0,pos)+eol+note+eol+eol+s.slice(pos);fs.writeFileSync(p,s);}}
const rpath='docs/architecture/README-PHASE2-MIGRATION.md';let s=fs.readFileSync(rpath,'utf8');s=s.replace(/^Current follow-up:.*$/m,'Current follow-up: [quota-corrected isolated verification candidate]('+report+'#quota-corrected-candidate--current) is READY FOR EXECUTION REVIEW, not deployed. Reserved concurrency alone was removed; exact policy, ZIP and sources remain pinned. Separate security/change-set execution review and all live acceptance remain required.');fs.writeFileSync(rpath,s);
const statusPath='docs/architecture/domain-migration-status.json',raw=fs.readFileSync(statusPath,'utf8'),status=JSON.parse(raw),team=status.domains.find(x=>x.domain==='Team Hub');status.scope='Quota-only isolated verification candidate correction and read-only validation; no AWS writes';status.currentPhase='M5 / 2B6 QUOTA_CORRECTED_ISOLATED_VERIFICATION_READY_FOR_REVIEW';team.isolatedBusinessVerification.status='QUOTA_CORRECTED_READY_FOR_EXECUTION_REVIEW_NOT_DEPLOYED';team.quotaCorrectedIsolatedVerification={status:'READY_FOR_EXECUTION_REVIEW',manifest:E+'/execution-manifest.json',candidateSha256:sha(E+'/candidate.json'),templateSha256:candidate.template.sha256,policySha256:candidate.policy.sha256,probeZipSha256:candidate.probe.sha256,sourceHashesUnchanged:true,awsResourceChanges:0,liveAccepted:false};team.nextStep='Separately authorize quota-corrected isolated verification lifecycle after full security/change-set review; no cutover';fs.writeFileSync(statusPath,(JSON.stringify(status,null,2)+'\n').replace(/\n/g,raw.includes('\r\n')?'\r\n':'\n'));
fs.writeFileSync(E+'/validation.json',JSON.stringify({at:new Date().toISOString(),complete:true,focusedTests:50,resourceAccountingTests:41,runtimeIamCases:65,runnerPolicyCases:36,accessAnalyzerFindings:0,sourceHashesUnchanged:true,acceptedPins:75,archivedArtifacts:9,awsResourceChanges:0,liveAcceptance:false},null,2)+'\n');
const scan=fs.readFileSync('scripts/team-hub-execution-kms/scan.mjs','utf8').replaceAll('docs/architecture/team-hub-execution-kms-evidence-2026-10-09',E);fs.writeFileSync('.tmp/team-hub-isolated-quota/scan.mjs',scan);console.log(JSON.stringify({documented:true,candidateSha256:sha(E+'/candidate.json'),awsResourceChanges:0}));
