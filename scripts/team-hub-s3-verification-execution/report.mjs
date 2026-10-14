import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {E as P,digest,assertPinned} from '../team-hub-s3-verification/scope.mjs';
const E='docs/architecture/team-hub-s3-verification-execution-evidence-2026-10-13',D='docs/architecture/',read=p=>JSON.parse(fs.readFileSync(p));
const m=read(P+'/execution-manifest.json');assert.equal(digest(fs.readFileSync(P+'/execution-manifest.json')),'e5395aac10635a8b65c50ccc8ca8fda0d125458643e69cd971372b07d9b5bde9');assertPinned(m);for(const a of m.preservedAcceptedMaintenanceArtifacts)assert.equal(digest(fs.readFileSync(a.path)),a.sha256);
const changes=read(E+'/change-sets.json'),installed=read(E+'/installed.json'),iam=read(E+'/installed-iam-validation.json'),cleanup=read(E+'/cleanup-status.json'),canary=read(P+'/live-canary-requests.json'),canaryDelivery=read(P+'/live-canaries-delivery.json'),race=read(P+'/live-race-result.json'),raceDelivery=read(P+'/live-race-delivery.json'),baseline=read(E+'/preservation/baseline.json'),inventory=read(E+'/preservation/after/inventory.json'),protectedState=read(E+'/preservation/protected-after.json');
for(const x of [changes,installed,iam,cleanup,canary,canaryDelivery,raceDelivery,baseline,inventory,protectedState])assert.equal(x.complete,true);
assert.equal(canaryDelivery.matched,3);assert.equal(raceDelivery.matched,4);assert.equal(race.objectCleanup,true);assert.equal(race.results.find(x=>x.case==='HELD_STREAM_BEFORE_FENCE').classification,'DENIED');assert.equal(cleanup.helperInvoked,false);assert.ok(inventory.target.every(x=>x.business===0));
execFileSync(process.execPath,['--test','scripts/team-hub-s3-verification/verification.test.mjs','scripts/team-hub-maintenance-preparation/quarantine.test.mjs'],{stdio:'pipe'});
const acceptedAt=new Date().toISOString(),receipt={acceptedAt,status:'S3_ISOLATED_VERIFICATION_ACCEPTED',manifestSha256:digest(fs.readFileSync(P+'/execution-manifest.json')),artifactPinsVerified:21,maintenancePinsPreserved:11,changeSets:changes.receipts,installedResources:7,actualRoleCases:iam.results.length,helperInvoked:false,canaryRequests:canary.requests,canaryEvents:3,raceOutcome:'HELD_STREAM_DENIED_403; preissued-not-started denied 403',syntheticInjection:'Separately labeled; NOT measured late completion',raceEvents:4,objectCleanup:true,temporaryResourceCleanup:4,ownedAssetVersionCleanup:true,retainedAuditResources:3,retentionCustodian:'Ntgre',retainEvidenceUntilAtLeast:new Date(Date.parse(acceptedAt)+90*86400000).toISOString(),authority:{mode:'LEGACY_WRITER',epoch:1,version:1},businessDataChanges:0,sourceFenceInstalled:false,frontendActivated:false,productionChanges:0,tests:48,originalPrincipalSecurityReview:'REQUIRED_BEFORE_REAL_CUTOVER',weakerRealCutoverCriterionAuthorized:false};
fs.writeFileSync(E+'/accepted.json',JSON.stringify(receipt,null,2)+'\n');
const link=(label,path)=>`[${label}](${path})`;
const report=`# Team Hub 2B6 — isolated S3 verification result

13 October 2026. Accepted at ${acceptedAt}. Account **058264289478**, region **eu-north-1**, identity **arn:aws:iam::058264289478:user/RavenTest**.

**S3 ISOLATED VERIFICATION ACCEPTED — READY FOR ORIGINAL-PRINCIPAL CUTOVER SECURITY REVIEW**

This result accepts the explicitly authorized isolated verification only. It does not accept a weaker real-cutover criterion or authorize real FROZEN, source-fence activation, TARGET_WRITER, frontend publication or Legacy retirement.

## Artifacts, authorization and deployment

Manifest SHA-256 **${receipt.manifestSha256}**. All 21 artifact references and all 11 accepted maintenance hashes verified before and after. No runtime rebuild, fresh synthesis, current-HEAD substitution or pinned-file edit. ${link('User authorization receipt',P.split('docs/architecture/')[1]+'/authorization-receipt.json')} binds the exact package and isolated-only residual-risk acknowledgement. No credentials, tokens or signed URLs persisted.

${link('Three fully reviewed AWS change sets',E.split('docs/architecture/')[1]+'/change-sets.json')}:

${changes.receipts.map(r=>'- '+r.kind+': '+r.additions+' additions; '+r.changeSetId).join('\n')}

Zero modifications/deletions/replacements/nested changes. AWS templates matched exact reviewed resource/trust/policy properties. Rollback enabled; all three stacks reached CREATE_COMPLETE with **3 audit + 2 helper + 2 race resources**.

## Installed security

${link('Installed readback',E.split('docs/architecture/')[1]+'/installed.json')} verifies private versioned audit bucket, exact account-local write-event selectors/policy, logging enabled, exact restricted role/trust/inline policy and Lambda ZIP, isolated bucket/policy, no public URL/event mapping/invocation policy. **21 actual-role/caller controls passed**, ${link('receipt',E.split('docs/architecture/')[1]+'/installed-iam-validation.json')}. No attached managed policy or unexpected inline policy; no unsafe Legacy role reuse. The helper was **never invoked** against source resources.

CloudTrail reordered FieldSelectors in readback. An initial ordered-array comparison failed; the unpinned read-only harness was corrected to compare the same exact predicates independently of order. Raw expected/actual forms are retained. No candidate, selector, policy or permission was changed to pass verification.

## Canary and audit receipts

${link('Exact canary requests',P.split('docs/architecture/')[1]+'/live-canary-requests.json')}:

${canary.requests.map(r=>'- '+r.eventName+' '+r.bucket+'/'+r.key+': HTTP '+r.status+', request '+r.requestId).join('\n')}

Source IfMatch guarded failure **404**, no source-object creation. Isolated 64-KiB zero-body object created, read/digest verified and deleted. ${link('CloudTrail correlation',P.split('docs/architecture/')[1]+'/live-canaries-delivery.json')} matched **3/3**, requiring exact request ID, operation, bucket and key. Delayed delivery was polled boundedly without write retries; it is not a fixed delivery SLA or complete historical/universal arrival proof.

## Actual race and quarantine

One pinned race execution, ${link('terminal receipt',P.split('docs/architecture/')[1]+'/live-race-result.json')}. The runner sent initial body bytes before installing/readback of the **isolated** all-principal fence. Local transmission does not prove AWS had already completed authorization.

${race.results.map(r=>'- '+r.case+': HTTP '+r.status+', request '+r.requestId).join('\n')}

The previously issued but unstarted URL and held stream both returned **403**. This experiment **did not measure physical late completion**, and does not prove universal atomic revocation. The separate synthetic late-arrival injection returned **200** after restoring only the isolated initial policy; it is explicitly labeled injection, never called a successful late race.

The actual injected object metadata was reconciled by the pinned detector, its exact zero-body digest verified, and the object deleted. Source/target associations remained unchanged. The accepted actual service/website-adapter suite verifies branding command denial before state access, metadata-injection rejection and Legacy URL suppression. This is isolated/offline association proof, not a live TARGET_WRITER mutation or original-principal proof. Accepted real transaction/cursor evidence was preserved, not replayed.

${link('Race audit events',P.split('docs/architecture/')[1]+'/live-race-delivery.json')} correlated **4/4** exact race/injection/delete request IDs. Synthetic injection and cleanup are recorded separately from the two denied URL/stream requests.

## Cleanup and retained evidence

${link('Verified cleanup',E.split('docs/architecture/')[1]+'/cleanup-status.json')}: both temporary stacks DELETE_COMPLETE; role, function and isolated bucket absent; **four temporary resources removed**. Exact owned uploaded artifact version checksum verified, removed and absence confirmed. Original roles/log groups and all source objects preserved. No automatic unknown-object deletion or repeated race/canary.

Three retained resources remain CREATE_COMPLETE and logging under **Ntgre** custody:

- Trail ProjectRespawn-TeamHub-Ntgre-LogoQuarantineAudit.
- Private versioned bucket respawn-teamhub-quarantine-audit-058264289478-20261013.
- Its exact CloudTrail/TLS bucket policy.

Audit stack **ProjectRespawn-TeamHub-Ntgre-S3Audit** remains installed. Keep evidence at least until **${receipt.retainEvidenceUntilAtLeast}**, with no automatic lifecycle purge or audit retirement. Raw logs remain private; sanitized request/event/log-hash receipts are retained locally/source-control evidence. Ongoing source-prefix data-event/storage charges and retention review remain Ntgre's responsibility.

## Protected-domain preservation and limitations

${link('Fresh final baseline',E.split('docs/architecture/')[1]+'/preservation/baseline.json')}, ${link('resource/template comparison',E.split('docs/architecture/')[1]+'/preservation/protected-after.json')}, ${link('data/protection inventory',E.split('docs/architecture/')[1]+'/preservation/after/inventory.json')} and final IAM/fence receipts pass:

- Legacy **2,621**, FunctionDirectiveStack **167**.
- Team Hub **48 product + 7 security**; Core **8 + 5**; Tournament **11**.
- Net additional retained audit resources **3**, accounted separately from canonical product/security roots; temporary resources **0**.
- Authority **LEGACY_WRITER, epoch 1, version 1**; Operational **0**, Journal authority plus **15 historical audits**, no business records.
- Four source tables/logo prefix empty; source PITR/deletion protection/backups intact; existing runtime code/configuration/IAM and monitoring unchanged.
- Source fence **not installed**, frontend remains **Legacy**, production **untouched**, no retirement.

Physical late-completion and asynchronous audit delivery remain residual risks. Seven correlated receipts demonstrate these exact paths, not every historic URL/active request or complete bounded arrival census. A separate real-cutover logical-authority acceptance decision is still required.

## Remaining original-principal security review

Actual generated AppSync roles and approved manual/operator requests have reviewed maintenance controls, pending real installed-fence proof. Original shared writer lacks a reviewed guaranteed non-mutating direct diagnostic branch. Cleanup role's bucket-policy administration grant remains unsafe for reuse/teardown invocation. The restricted helper does not substitute for either identity. Separately approve a safe original-principal method or explicitly reviewed alternative criterion before real FROZEN/transfer; no successful receipt is invented here.

Targeted suite **48 tests passed**; accepted candidate pins and protected configuration preserved. Final secret/link checks are recorded separately. No accepted Lambda/Core/transaction/cursor/frontend/rollback work was redeployed.

**S3 ISOLATED VERIFICATION ACCEPTED — READY FOR ORIGINAL-PRINCIPAL CUTOVER SECURITY REVIEW**
`;
fs.writeFileSync(D+'team-hub-2b6-isolated-s3-verification-result.md',report);
const current=`## Isolated S3 verification accepted — 13 October (current)\n\n**S3 ISOLATED VERIFICATION ACCEPTED — READY FOR ORIGINAL-PRINCIPAL CUTOVER SECURITY REVIEW.** ${link('Authoritative execution result','team-hub-2b6-isolated-s3-verification-result.md')} records 3/2/2 deployment, 21 actual-role/caller checks, 3/3 canary and 4/4 race-event correlation, four-resource/artifact cleanup and final preservation. Both isolated URL/stream controls returned 403; synthetic injection is explicitly not measured late completion. Three private audit resources retained under Ntgre custody for at least 90 days.\n\nReal LEGACY_WRITER epoch/version 1/1, empty business state, source fence absent and frontend Legacy remain unchanged. Canonical domain counts remain Legacy 2,621/167, Team 48+7, Core 8+5, Tournament 11; retained auxiliary audit +3 is separately accounted. No FROZEN/TARGET/frontend/production/retirement change. Original shared/cleanup-principal proof and a real-cutover residual-risk/criterion decision remain separately required. Earlier preparation/blocked entries below are historical.\n\n`;
for(const file of ['team-hub-2b6-final-s3-verification-execution-readiness.md','team-hub-2b6-final-cutover-execution-readiness.md','team-hub-2b6-cutover-runbook.md','README-PHASE2-MIGRATION.md']){const p=D+file,s=fs.readFileSync(p,'utf8'),i=s.indexOf('\n');fs.writeFileSync(p,s.slice(0,i+1)+'\n'+current+s.slice(i+1));}
const p=D+'domain-migration-status.json',status=read(p),team=status.domains.find(x=>x.domain==='Team Hub');team.finalS3VerificationExecution={date:'2026-10-13',status:receipt.status,report:D+'team-hub-2b6-isolated-s3-verification-result.md',receipt:E+'/accepted.json',manifestSha256:receipt.manifestSha256,deployedResources:7,removedTemporaryResources:4,retainedAuxiliaryAuditResources:3,canaryEventMatches:3,raceEventMatches:4,actualRace:'DENIED_403_NOT_OBSERVED_LATE_COMPLETION',helperInvoked:false,authority:receipt.authority,businessDataChanges:0,sourceFenceInstalled:false,frontendActivated:false,productionChanges:0,requiredNext:'Separate original-principal proof method and real-cutover criterion security review'};team.nextStep='Original-principal cutover security review; isolated S3 verification accepted, no real authority transition authorized';fs.writeFileSync(p,JSON.stringify(status,null,2)+'\n');console.log(JSON.stringify({accepted:true,canaryEvents:3,raceEvents:4,temporaryRemoved:4,retainedAudit:3,authority:'LEGACY_WRITER_1_1',report:'team-hub-2b6-isolated-s3-verification-result.md'}));
