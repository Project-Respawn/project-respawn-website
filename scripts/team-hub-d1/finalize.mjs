import fs from 'node:fs';import assert from 'node:assert/strict';import {E,P,read,json,save,pin,sha} from './aws.mjs';
const c=pin();for(const n of ['artifact-review','preflight','policy-review','installed-deployment-security','runtime-security-before','runtime-security-after','before/inventory','after/inventory','before/preservation','after/preservation','before/installed-iam','after/installed-iam','authority-after','observability','routes-before','routes-after','probes','metrics-latest'])assert.equal(read(n).complete,true,n);
for(const k of ['product','security']){assert.equal(read(k+'-installed').verified,true);assert.equal(read(k+'-installed').disableRollback,false);}assert.ok(!fs.existsSync(E+'/STOP.json'));
const before=read('before/inventory'),after=read('after/inventory');for(const k of ['sources','target','legacy','stacks','logos'])assert.deepEqual(after[k],before[k],k);assert.deepEqual(read('after/installed-iam').roles.map(x=>({name:x.name,inline:x.inline,attached:x.attached,boundary:x.boundary,trust:x.trust})),read('before/installed-iam').roles.map(x=>({name:x.name,inline:x.inline,attached:x.attached,boundary:x.boundary,trust:x.trust})));
const metrics=read('metrics-latest'),probes=read('probes'),writes=fs.readFileSync(E+'/aws-writes.jsonl','utf8').trim().split('\n').map(JSON.parse);assert.equal(writes.length,6);assert.equal(probes.requests.length,21);assert.equal(metrics.logs.reduce((n,x)=>n+x.events.length,0),34);
const totals=Object.fromEntries(['Requests','AuthorizationFailures','WriterNotAuthoritative','DependencyFailures','CoreDependencyFailures','AuthorityUnavailable','AuthorityEpochMismatch'].map(n=>[n,metrics.custom.filter(x=>x.name===n).reduce((v,x)=>v+x.observed,0)]));assert.deepEqual(totals,{Requests:21,AuthorizationFailures:17,WriterNotAuthoritative:13,DependencyFailures:0,CoreDependencyFailures:0,AuthorityUnavailable:0,AuthorityEpochMismatch:0});
const result={at:new Date().toISOString(),status:'D1_LIVE_MONITORING_ACCEPTED_READY_FOR_REMAINING_PRECUTOVER_GATES',scope:'MINIMAL_DARK_D1_AFTER_C2_ONLY',identity:read('preflight').identity,region:'eu-north-1',pins:c,securityChangeSet:read('security-gate').changeSetId,productChangeSet:read('product-gate').changeSetId,securityModifications:3,productModifications:3,additions:0,deletions:0,replacements:0,rollbackEnabled:true,resources:{legacy:2621,directive:167,teamProduct:40,teamSecurity:7,coreProduct:8,coreSecurity:5,tournament:11},normalRoutesDenied:13,coreProofSuccesses:4,coreProofDenials:4,correlatedEmfEvents:34,metrics:totals,metricWindow:probes.metricWindow,authority:'LEGACY_WRITER',epoch:1,version:1,c2Preserved:true,businessRecordsChanged:0,targetBusinessRecords:0,controlPlaneWrites:6,frontendActivated:false,fenceInstalled:false,productionChanged:false,liveDependencyFailure:false,liveConfigurationGuardFailure:false,liveTransactionalEpochProof:false};save('result',result);
const link=n=>`team-hub-d1-execution-evidence-2026-10-08/${n}.json`;
const report=`# Project Respawn Team Hub 2B6 — D1 live monitoring result

**D1 LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES**

8 October 2026. Acceptance is limited to the explicitly reviewed minimal dark-runtime D1-after-C2 monitoring scope. No business runtime, FROZEN/TARGET_WRITER, source fence, frontend activation, Legacy retirement or production change. Gate B and business epoch enforcement remain unaccepted.

## Exact candidate and deployment

| Artifact | SHA256 |
|---|---|
| D1-after-C2 product | ${c.productSha256} |
| D1-after-C2 security | ${c.securitySha256} |
| Preserved runtime ZIP | ${c.zipSha256} |

The original manifest, ten source hashes and preserved ZIP/template bytes verify. No fresh synthesis, rebuild, standalone-D1 substitution or current-HEAD deployment. Both objects were published under exact content-hash keys with AES256 and verified SHA256. [Pin/delta review](${link('artifact-review')}), [publication](${link('publication')}).

Security operator: arn:aws:iam::058264289478:user/RavenTest. Product caller: existing ProjectRespawn-TeamHub-Ntgre-Deploy role; execution role: existing ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. Account 058264289478, region eu-north-1. No new principal, administrative grant or trust expansion.

Security change set: ${result.securityChangeSet}.

Product change set: ${result.productChangeSet}.

Both stacks reached UPDATE_COMPLETE with rollback enabled. Security changed only ExecutionBoundary, ExecutionRole and PreparationCaller artifact references. The exact new ZIP replaces the reviewed superseded 9d16027… reference; the accepted C2/dark rollback artifacts remain allowed. Product changed only ParityReadFunction.Code, ParityCommandFunction.Code and Stage.DefaultRouteSettings.DetailedMetricsEnabled. Zero additions, deletions, replacements or unrelated properties. API t54b88casf, routes, runtime roles, both tables and safeguards are preserved. [Security inspection](${link('security-gate')}), [product inspection](${link('product-gate')}), [security status](${link('security-status')}), [product status](${link('product-status')}).

## C2 and deployment security

Installed runtime inline policies and v6 boundaries remain exactly C2: authority-partition GetItem only, with LeadingKeys and Null=false; no business writes, Query/Scan, Operational access, secret access, Cognito administration, foreign-domain access or new KMS/Logs permissions. Deployment role/caller trust, policies and boundaries were read and compared before and after installation. Access Analyzer returned no findings for all three changed deployment policies. 44 deployed-versus-candidate deployment IAM decisions and 68 actual-runtime decisions before plus 68 after passed. These are effective IAM simulations, not new data-plane authority-read or business-transaction proof. [Deployment security](${link('policy-review')}), [installed roles](${link('installed-deployment-security')}), [runtime readback](${link('after/installed-iam')}), [actual-role checks](${link('runtime-security-after')}).

## Live probes and counter correlation

Bounded UTC metric window: **${probes.metricWindow.start} to ${probes.metricWindow.end}**.

All 13 authenticated normal routes returned HTTP 403/FORBIDDEN. Four existing IAM-only, delegated-JWT Core authorization proofs succeeded; four ordinary-user directory proofs returned FORBIDDEN. Each runtime repeated success and denial twice. These are the accepted read-only proof envelopes, not business-success responses or a verification bypass. Sessions/tokens remained in memory; no account or Core service changes.

| Runtime | Requests | AuthorizationFailures | WriterNotAuthoritative |
|---|---:|---:|---:|
| read | 8 | 6 | 4 |
| command | 13 | 11 | 9 |
| Total | 21 | 17 | 13 |

All 34 structured EMF events correlate to the 21 exact request IDs. HTTP denial emits a distinct configuration-writer event and one classified request event. Successful Core proofs emit one Requests increment and zero failure increments; ordinary directory denials emit AuthorizationFailures without WriterNotAuthoritative. CloudWatch ProjectRespawn/TeamHub datapoints exactly match log-derived counts with Environment=Ntgre and Runtime=read/command. All other emitted counters are actual observed zero datapoints for this window, not inferred zeros from absent data. [Probes](${link('probes')}), [13 route denials](${link('routes-after')}), [correlated logs and CloudWatch metrics](${link('metrics-latest')}).

The first collection contained partial native API/Lambda counts and missing route datapoints; it remained pending. Subsequent read-only collection of the same window completed without extra probes or a relaxed threshold. [Initial ingestion receipt](${link('metrics-attempt-1')}). Application log fields were checked against an explicit safe schema, and raw Team log messages were scanned for token/credential patterns before persistence. No subjects, private payloads or directory data appeared in application metrics/logs.

## Signals intentionally not claimed live

Core dependency failure classification passed offline injected-transport tests: DependencyFailures plus distinct CoreDependencyFailures. No Core outage was induced and no genuine dependency failure occurred during the live probes. Zero observed dependency counters do not prove the failure branch live.

The configuration-guard failure and AuthorityUnavailable emission passed offline tests. Current correct LEGACY_WRITER/PRE_CUTOVER/DISABLED configuration cannot safely exercise that failure without changing the pin, so it was not altered. D1 has no Journal authority reader; AuthorityUnavailable is not a live missing-record proof. Missing/stale epoch and transactional authority tests remain offline/later-business-runtime evidence. Normal target writes remain disabled.

38 package/monitoring/classification/ingestion tests passed. Offline business-handler cases are explicitly distinct from deployed D1 and its live acceptance.

## Native observability and operator

Native API Count/4xx and all 13 detailed route Count series were observed for the bounded window; Lambda Invocations, Errors and Throttles were queried for both runtimes. Missing native datapoints, if any for unexercised error signals, are recorded as absent rather than zero. DetailedMetricsEnabled is verified on the installed stage, with no access-log destination. Route dimensions follow [AWS HTTP API metric documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-metrics.html): ApiId, Stage, Method and Resource.

All six existing alarms match the expected definitions. Named custodian/responder: **Ntgre (user)**. Monitoring is attended and manual; notification delivery is not configured or proven. During a separately approved window, watch the API/Lambda/custom counters and correlated request IDs, DynamoDB state/metrics, Core health and control-plane authority receipts. Abort for unexpected normal-route success, authority/state drift, business writes, Core failure, unexpected errors/throttles, protected-domain changes or missing required signals after the bounded ingestion deadline. Expected denial probes must be distinguished by their recorded IDs.

API access logs remain deferred under the selected Option A; no log-delivery/resource-policy administration was granted. No claim of automated paging or full business-transition telemetry. [Stage, alarms and operator responsibilities](${link('observability')}).

## Protected state

Fresh strongly consistent authority readback matches every C1 field: CONTROL#AUTHORITY / STATE, team-hub-authority.v1, LEGACY_WRITER, epoch 1, version 1, original audit metadata. Exactly one control row. C1 temporary executor resources remain absent. [Authority](${link('authority-after')}).

Team Hub remains 40 product +7 security resources; Core 8+5; Tournament 11; Legacy 2,621 with FunctionDirectiveStack 167. Physical resource identities, Core/Tournament templates and all inventoried Legacy templates remain unchanged. Four Legacy source tables remain empty with PITR/deletion protection and AVAILABLE backups. Operational is empty; Journal contains 15 retained audit rows plus the authority record, zero business rows. Target business records and business records changed: **0**. No frontend, production or retirement actions. [Final inventory](${link('after/inventory')}), [preservation](${link('after/preservation')}).

Six direct control-plane writes: two CreateChangeSet, two ExecuteChangeSet and two content-addressed PutObject calls. Read-only application invocations are recorded separately; no DynamoDB write. No failed deployment, permission patch or automatic deployment retry.

## Remaining gates

- B: dormant source-fence design retained; no bundle attached. Actual all-path denial proof requires separately authorized FROZEN maintenance.
- C/business epoch: C1/C2 accepted; no live transactional authority/epoch enforcement or TARGET_WRITER activation proven by D1.
- E: independent frontend preparation remains inactive; final live authority/epoch binding, persona/network checks and frontend activation remain separate.
- F: prior isolated rehearsal evidence retained; remaining approved isolated proof and reviewed code/state-authority rollback conditions must close before cutover. No real rollback/reverse migration was performed here.

D1-after-C2 is the new dark monitoring baseline. Any rollback must preserve C2 and the C1 record using the reviewed prior C2 product/security artifacts through separate inspected authorization; do not infer business rollback or authority-switch approval.

**D1 LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES**
`;
fs.writeFileSync('docs/architecture/team-hub-d1-live-monitoring-result.md',report);
const latest='**Latest D1 result: LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES (8 October 2026).** Pinned D1-after-C2 deployed; 13 normal routes deny, 21 live requests correlate to 34 EMF events and matching CloudWatch counters. C2 IAM/v6 boundaries preserved. LEGACY_WRITER epoch/version 1, zero target business rows; no fence/frontend/production change. Dependency/configuration/transactional epoch failure proofs remain explicitly offline or later gates. [D1 live result](team-hub-d1-live-monitoring-result.md). Earlier entries below are historical.\n\n';
for(const f of ['team-hub-c1-c2-d1-execution-readiness.md','team-hub-2b6-acceptance.md','team-hub-2b6-precutover-readiness.md','team-hub-2b6-gate-d-live-monitoring-result.md','team-hub-2b6-cutover-runbook.md']){const path='docs/architecture/'+f;let t=fs.readFileSync(path,'utf8');const i=t.indexOf('\n');t=t.slice(0,i+1)+'\n'+latest+t.slice(i+1);if(f==='team-hub-2b6-precutover-readiness.md'){t=t.replace(/^\| C1\/C2 \|.*$/m,'| C1/C2 | Complete | C1 record + C2 IAM installed | Strong row readback, actual-role IAM simulations and route denials | Business transactional/epoch proof remains separate | No authority switch authorized | [C2](team-hub-c2-execution-result.md) |');t=t.replace(/^\| D1\/D2 \|.*$/m,'| D1/D2 | Minimal dark monitoring complete | D1-after-C2, 40+7 | Safe probes, exact log/EMF/CloudWatch correlation and native metrics accepted | Dependency/configuration failures offline; business telemetry later | No business activation authorized | [D1](team-hub-d1-live-monitoring-result.md) |');}if(f==='team-hub-2b6-cutover-runbook.md')t=t.replace('D1 still needs separate review and authorization; use only the pinned after-C2 monitoring candidate.','D1-after-C2 is installed and its bounded dark-runtime live monitoring scope is accepted. Preserve this new baseline; do not redeploy historical standalone D1 or old 44+7 monitoring proposals. Remaining business runtime, source-fence, frontend and rollback gates require separate review/authorization.');fs.writeFileSync(path,t);}
const control='docs/architecture/README-PHASE2-MIGRATION.md';let t=fs.readFileSync(control,'utf8');t=t.replace(/<!-- TEAM 2B6 START -->[\s\S]*?<!-- TEAM 2B6 END -->/,'<!-- TEAM 2B6 START -->\n'+latest+'<!-- TEAM 2B6 END -->');fs.writeFileSync(control,t);
const statusPath='docs/architecture/domain-migration-status.json',status=json(statusPath);let found=false;function visit(v){if(!v||typeof v!=='object')return;if(v.phase2B6){found=true;const x=v.phase2B6;x.status=result.status;x.gates=E+'/result.json';x.awsWrites=15;x.awsWriteCounting='C1 4 + C2 5 + D1 6 direct control-plane calls; application read-only probes recorded separately';x.blockers=['B source fence live all-path proof in separately authorized FROZEN maintenance','Business runtime transactional authority/epoch live proof','E final frontend binding/persona/isolation acceptance and separate activation','F remaining isolated rollback proof and final recovery gate'];x.nextStep='Review remaining pre-cutover gates; no authority switch, source fence or frontend activation authorized';x.d1={status:'ACCEPTED_DARK_LIVE_MONITORING_ONLY',report:'docs/architecture/team-hub-d1-live-monitoring-result.md',evidence:E+'/result.json',runtimeSha256:c.zipSha256,requests:21,normalRoutesDenied:13,liveDependencyFailure:false,liveTransactionalEpochProof:false,controlPlaneWrites:6};}for(const x of Object.values(v))visit(x);}visit(status);assert.ok(found);fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');console.log(JSON.stringify({status:result.status,totals,controlPlaneWrites:6}));
