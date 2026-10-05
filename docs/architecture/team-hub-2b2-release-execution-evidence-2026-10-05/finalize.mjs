import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,save,dir,pins,expiry,equal} from './common.mjs';
pins();const v=read(dir+'/installed-validation/validation.json'),installed=read(dir+'/installed-security.json'),caller=read(dir+'/product-caller-gate.json');assert.equal(v.failures.length,0);assert.equal(v.analyzerFindings.length,0);assert.equal(caller.ready,false);
const legacy=read(dir+'/legacy-after.json'),before=read(dir+'/legacy-before-bootstrap.json');for(const key of ['root','stacks','lambdas','coreIdentity'])equal(legacy[key],before[key]);equal([...legacy.protectedResources].sort((a,b)=>a.physicalId.localeCompare(b.physicalId)),[...before.protectedResources].sort((a,b)=>a.physicalId.localeCompare(b.physicalId)));
const tournament=read(dir+'/tournament-baseline.json'),tb=read(dir+'/tournament-before-bootstrap.json');assert.deepEqual(tournament.issues,[]);equal(tournament.security,tb.security);for(const key of ['stack','resources','api','lambda','permission','stages','authorizers','routes','integrations'])equal(tournament.live[key],tb.live[key]);
const summary={at:new Date().toISOString(),time:expiry(),securityStatus:installed.stack.StackStatus,securityResources:4,securityCanonicalEquivalent:true,validation:{positive:v.positive,negative:v.negative,analyzerFindings:0,unresolved:0},productReady:false,productCreated:false,productChangesetCreated:false,reason:caller.reason,firstCreateAuthorityRemoved:false,firstCreateAuthorityExpires:'2026-10-06T13:51:32.179Z',legacy:{resources:legacy.total,directive:legacy.directive,timestampChanged:false,protectedIdentitiesChanged:0,lambdaHashesChanged:0},tournament:{status:tournament.live.stack.StackStatus,resources:tournament.live.resources.length,api:tournament.live.api.ApiId,lambdaChanged:false,securityChanged:false},awsChanges:['Published two exact pinned ZIP/template S3 objects with AES256','Created and executed four-resource security bootstrap with rollback enabled'],productionTouched:false,frontendCutover:false,endpointManifest:false};save('final',summary);
const report='docs/architecture/team-hub-2b2-read-path-release1-2026-10-05.md';if(!fs.existsSync(dir+'/previous-release-report.md'))fs.copyFileSync(report,dir+'/previous-release-report.md');
const link=n=>`[${n}](${dir.split('/').at(-1)}/${n}.json)`;
fs.writeFileSync(report,`# PROJECT RESPAWN PHASE 2B2 — TEAM HUB READ-PATH RELEASE 1

Current result at ${summary.at}: **security bootstrap succeeded; product execution is blocked before change-set creation by the missing restricted deployment caller**. This is not a CloudFormation product failure. No product execution or rollback was attempted. Earlier blocked-report history is preserved in [previous report](${dir.split('/').at(-1)}/previous-release-report.md).

## Security bootstrap and assets

Account 058264289478, region eu-north-1, bootstrap identity arn:aws:iam::058264289478:user/RavenTest. Security stack ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity is CREATE_COMPLETE with four resources and DisableRollback=false. Candidate 3e5a12edf9074bb8dc8d7bf0d83783b641aefc3973514e08aa4cc80f530050de; exact template SHA df55507efb69188c92309c30632d3d2795c8945fb631306f18a6934f1abaf2f2.

The inspected bootstrap change set had four additions, zero modifications/deletions/replacements/unexpected changes. Its template matched the pinned document. Execution was explicitly authorized by the user after the passing gate. All managed policies, execution trust, inline policy and execution boundary were read back and matched; no attached execution policies exist. Installed-document validation: 133 positive and 1,476 negative assertions passed, zero Analyzer findings and unresolved results. Execution KMS Allows added: zero. All 14 pre-existing APIs remain protected; eight known and two unknown customer-managed KMS keys remain denied. Default Lambda service-managed encryption is not explicitly blocked; Team runtime creation has not been tested.

The exact preserved Lambda files were packaged without regeneration: index.js SHA 0e3fde08f1dbf3c1803ff1daac65e902117d757c76506d478112d5291814e7b3; package.json SHA dbf8353f77358bc12169b7bb7301e1978d5b503e002ee927229a8993672818fc. Both ZIP entries were checked against the originals. ZIP object SHA b9138c4dda6962a05aac55a1b28eb58905424d07554669bcbc23554772915950. The ZIP and unchanged product template were uploaded to their preserved CDK asset-manifest keys in cdk-hnb659fds-assets-058264289478-eu-north-1. HeadObject confirms AES256 and matching SHA256 checksums for both. No bucket encryption or KMS policy was changed.

Evidence: ${link('published-assets')}, ${link('security-change-set')}, ${link('security-execution-gate')}, ${link('security-executed')}, ${link('security-events')}, ${link('installed-security')}, [installed validation](${dir.split('/').at(-1)}/installed-validation/validation.json).

## PHASE 2B2 TEAM HUB READ-PATH PRODUCT EXECUTION GATE

Product candidate: d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f. Unchanged; all 54 source inputs, preserved templates and bundles verified. Product template SHA 0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee. No HEAD substitution or fresh synthesis.

Stack ProjectRespawn-TeamHub-Ntgre remains absent. Change set: not prepared. AWS-generated additions/modifications/deletions/replacements: not available. Proposed resources remain eleven: HTTP API, stage, JWT authorizer, integration, GET preview route, Lambda, runtime role, invoke permission, logs and two alarms. No product DynamoDB, S3 bucket, command Lambda, mutation route or business state is proposed or created.

Security verification passed, but the required dedicated deployment caller does not exist. Live IAM inspection shows PreparationCaller has zero identity attachments and zero boundary attachments. Only the new execution role has the Team Hub name prefix. The four-resource security template intentionally leaves the caller uninstalled. The accepted [security design](../../infrastructure/security/team-hub-Ntgre-deployment-v2/README.md) states: “Do not substitute the broad bootstrap principal for this restricted product caller.” Consequently RavenTest was used only for the authorized bootstrap; it was not substituted for product preparation/execution. The execution role trusts CloudFormation, not a deployment caller.

The caller ceiling also pins a different product-template URL from the default CDK asset-manifest key: team-hub/read-proof/0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee.template.json. The published template bytes are correct, but that required URL has not been published in this attempt. Publish the same pinned bytes there before future preparation; do not change the reviewed caller policy to accommodate the CDK key. The existing objects were not deleted or overwritten.

**NOT READY**

Next prerequisite: review a dedicated caller identity/trust and attachment/boundary installation plan using the unchanged preparation-policy ceiling. This adds IAM scope beyond the accepted four-resource candidate and must be reviewed before installation. No new role, policy patch, attachment, permission broadening or retry was attempted. Evidence: ${link('product-caller-gate')}.

## Temporary authority, lockdown and runtime

First-create authority remains installed in the execution identity/boundary, expires 2026-10-06T13:51:32.179Z, and has not been renewed. Remaining time at final assessment: ${summary.time.hoursRemaining.toFixed(2)} hours, above six hours. Recalculate before any future execution. If insufficient, stop for a time-only renewal proposal. No Team API exists to bind, so exact-ID lockdown was not applied; it remains mandatory after future successful creation and before runtime acceptance.

Auth checks (no token, invalid token, wrong issuer/client, valid identity) and preview contract: not run. Runtime initialization, invocations, errors, logs, metrics, alarms and runtime-role security negatives: not run; product resources do not exist. Do not interpret execution-policy simulations as live runtime acceptance. No endpoint manifest generated. Frontend cutover=false. amplify_outputs.json unchanged.

## Final protected baselines

Legacy: UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167. Timestamp unchanged; all 62 protected identities and five Lambda hashes unchanged. Live before/after comparisons passed. No Legacy synthesis, diff, change set or deployment.

Tournament: UPDATE_COMPLETE, eleven resources, API msipnwy39j; Lambda and security unchanged. Live before/after comparisons passed. No Tournament synthesis, change set or deployment. Production untouched.

Evidence: ${link('legacy-after')}, ${link('tournament-baseline')}, ${link('pins')}, ${link('final')}.

TEAM HUB READ-PATH RELEASE 1 FAILED
`);
console.log(JSON.stringify(summary));
