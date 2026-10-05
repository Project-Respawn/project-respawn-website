import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {read,save,verify,equal,hash,dir} from './common.mjs';
const c=verify(),auth=read(dir+'/live-auth.json'),obs=read(dir+'/observability.json'),runtime=read(dir+'/runtime-security.json'),logging=read(dir+'/logging-verification.json'),lock=read(dir+'/lockdown-installed.json'),lockTests=read(dir+'/lockdown-live-validation.json'),callerTests=read(dir+'/live-validation.json');
assert.equal(auth.passed,true);assert.equal(obs.passed,true);assert.equal(runtime.failures.length,0);assert.ok(Date.parse(runtime.at)>Date.parse(auth.at));assert.equal(logging.ownLoggingVerified,true);assert.equal(logging.foreignLoggingDenied,true);assert.equal(lock.firstCreateAuthorityEffective,false);assert.equal(lockTests.failures.length,0);assert.equal(lockTests.analyzerFindings.length,0);assert.equal(callerTests.failures.length,0);assert.equal(callerTests.findings.length,0);assert.ok(!fs.existsSync('public/__teamhub_acceptance_20261005.html'));
const legacy=read(dir+'/legacy-after.json'),before=read(dir+'/legacy-before-product.json');assert.equal(legacy.beforeAfterEqual,true);for(const k of ['root','stacks','lambdas','coreIdentity'])equal(legacy[k],before[k]);equal([...legacy.protectedResources].sort((a,b)=>a.physicalId.localeCompare(b.physicalId)),[...before.protectedResources].sort((a,b)=>a.physicalId.localeCompare(b.physicalId)));
assert.equal(hash('amplify_outputs.json'),before.coreIdentity.sourceSha256);
const tour=read(dir+'/tournament-baseline.json'),tourBefore=read(dir+'/tournament-before-product.json');assert.equal(tour.issues.length,0);equal(tour.security,tourBefore.security);for(const k of ['stack','resources','api','lambda','permission','stages','authorizers','routes','integrations'])equal(tour.live[k],tourBefore.live[k]);
const own=read(dir+'/ownership.json'),at=new Date().toISOString();
const manifest={manifestVersion:'domain-endpoints.v1',domain:'TeamHub',domainOwner:'TeamHub',environment:'Ntgre',account:'058264289478',region:'eu-north-1',stackName:'ProjectRespawn-TeamHub-Ntgre',stackArn:own.stack.StackId,apiId:own.api.ApiId,endpoint:own.api.ApiEndpoint,status:'DEPLOYED',authMode:'COGNITO_JWT_ACCESS_TOKEN',contractVersion:'team-hub.v1',deploymentRevision:c.productRevision,provenance:{source:'preserved-pinned-assembly-restricted-caller-and-live-acceptance',coreSha256:hash('config/environments/Ntgre.core.json'),templateSha256:'0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee',lambdaCodeSha256:obs.lambda.codeSha256,liveVerified:true,authenticatedAt:auth.at,acceptedAt:at,runtimeRequestId:obs.runtimeRequestId,report:'docs/architecture/team-hub-2b2-read-path-release1-2026-10-05.md',frontendCutover:false}};
const require=createRequire(new URL('../../domains/team-hub/package.json',import.meta.url)),Ajv=require('ajv'),ajv=new Ajv({allErrors:true});const validate=ajv.compile(read('contracts/domain-endpoints-v1.schema.json'));assert.ok(validate(manifest),JSON.stringify(validate.errors));const validateCore=ajv.compile(read('contracts/environment-v1.schema.json'));assert.ok(validateCore(read('config/environments/Ntgre.core.json')),JSON.stringify(validateCore.errors));
fs.mkdirSync('config/domains/team-hub',{recursive:true});const manifestPath='config/domains/team-hub/domain-endpoints.Ntgre.json';assert.ok(!fs.existsSync(manifestPath),'Do not overwrite an existing endpoint manifest');fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const summary={at,accepted:true,product:c.productRevision,callerRevision:c.revision,caller:c.caller,execution:c.execution,securityStackStatus:lock.stack.StackStatus,securityResources:5,productStack:own.stack.StackName,productStatus:own.stack.StackStatus,productResources:11,apiId:own.api.ApiId,firstCreateAuthorityEffective:false,steadyStateTemplateSha:read(dir+'/lockdown-candidate.json').templateSha,authPassed:true,runtimePassed:true,runtimeNegativeAssertions:runtime.negative,callerChecks:{positive:callerTests.positive,negative:callerTests.negative},lockdownChecks:{positive:lockTests.positive,negative:lockTests.negative},analyzerFindings:0,loggingIndependentChecks:logging.results.length,legacy:{resources:legacy.total,directive:legacy.directive,timestampChanged:false,protectedIdentitiesChanged:0,lambdaHashesChanged:0},tournament:{status:tour.live.stack.StackStatus,resources:tour.live.resources.length,api:tour.live.api.ApiId,lambdaChanged:false,securityChanged:false},manifest:manifestPath,manifestSchemaValid:true,frontendCutover:false,productionTouched:false,credentialsPersisted:false,temporaryBrowserPageRemoved:true};save('final',summary);
save('accepted-state',{...summary,files:[...c.files,{path:dir+'/lockdown-security.template.json',sha256:hash(dir+'/lockdown-security.template.json')},{path:dir+'/lockdown-policy.json',sha256:hash(dir+'/lockdown-policy.json')},{path:manifestPath,sha256:hash(manifestPath)}]});
const report='docs/architecture/team-hub-2b2-read-path-release1-2026-10-05.md';fs.copyFileSync(report,dir+'/previous-release-report.md');const E=dir.split('/').at(-1),link=n=>`[${n}](${E}/${n}.json)`;
fs.writeFileSync(report,`# PROJECT RESPAWN PHASE 2B2 — TEAM HUB READ-PATH RELEASE 1

**ACCEPTED at ${at}.** The second independent product domain is deployed in Ntgre, authenticated against the existing Ntgre identity pool, locked to its own API, and verified without changing LegacyPlatform, Tournament or production. Frontend cutover remains false. Earlier blocked state is retained in [previous report](${E}/previous-release-report.md).

## Preserved product and security provenance

Product candidate: d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f. All 54 inputs, templates and Lambda bundle outputs remained hash-identical; no HEAD substitution, rebuild or synthesis occurred. Product template SHA: 0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee. Lambda index.js SHA: 0e3fde08f1dbf3c1803ff1daac65e902117d757c76506d478112d5291814e7b3. Packaged ZIP SHA: b9138c4dda6962a05aac55a1b28eb58905424d07554669bcbc23554772915950; live CodeSha256: ${obs.lambda.codeSha256}.

The accepted four-resource KMS-corrected bootstrap remains the historical base, revision 3e5a12edf9074bb8dc8d7bf0d83783b641aefc3973514e08aa4cc80f530050de. Caller extension revision: ${c.revision}. Exact-ID steady-state security template SHA: ${summary.steadyStateTemplateSha}. Current security stack: ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity, UPDATE_COMPLETE, five resources. Both security updates used rollback-enabled CloudFormation change sets.

## Restricted deployment caller

Role: ProjectRespawn-TeamHub-Ntgre-Deploy. Trust: only arn:aws:iam::058264289478:user/RavenTest. No IAM user or long-lived credentials were created. Assumed session credentials existed only in process memory and child-process environments, never evidence files or console output.

The extension added one role and modified only PreparationCaller; it reused that managed policy as the role's sole identity attachment and permissions boundary. It added exact artifact reads and stack-scoped ListStackResources/DescribeStackResource/ListChangeSets inspection. Account-wide ListStacks and direct CreateStack/UpdateStack/DeleteStack remain denied. No execution or runtime permissions were broadened. The user explicitly confirmed that PassRole must use the existing ReadProofExecution role rather than the prompt's CfnExecution spelling.

Scope: only ProjectRespawn-TeamHub-Ntgre, exact pinned template URL and ZIP reads, and PassRole of ProjectRespawn-TeamHub-Ntgre-ReadProofExecution to cloudformation.amazonaws.com. LegacyPlatform, Tournament, production, Creator, Commerce, Community, the security stack, direct API/Lambda, business storage, Cognito, AppSync, KMS and IAM administration are denied. Proposed and installed actual-role checks each passed 25 positives and 159 negatives; Analyzer policy/trust findings: zero.

Actual caller: arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-Deploy/TeamHubReviewedRelease1. It prepared, inspected, executed and monitored the product change set. RavenTest was used for authorized security custody/publication and read-only audit, not substituted for the product caller. See the [reusable caller pattern](independent-domain-deployment-callers.md) and [implementation](../../infrastructure/security/team-hub-Ntgre-deploy-caller/README.md).

Evidence: ${link('candidate')}, ${link('caller-gate')}, ${link('extension-change-set')}, ${link('installed-caller')}, ${link('live-validation')}.

## Assets and product execution gate

Bucket: cdk-hnb659fds-assets-058264289478-eu-north-1. Exact caller-authorized template key: ${c.templateKey}. ZIP key: ${c.zipKey}. Both objects are AES256/SSE-S3, confirmed by HeadObject checksums and actual restricted-caller downloads matching preserved bytes. The existing ZIP was not republished. No KMS decrypt permission or bucket-default change was added. ${link('artifacts')}.

Product change set team-hub-read-proof-release1-20261005 contained eleven additions, zero modifications/deletions/replacements/unexpected resources. Original AWS template matched the preserved product. Execution role was verified through DescribeStacks (DescribeChangeSet does not expose that field). Expiry margin immediately before execution exceeded 22 hours, above the required six-hour minimum. Rollback stayed enabled. No deployment failure, permission patch or retry occurred.

Product stack: ProjectRespawn-TeamHub-Ntgre, CREATE_COMPLETE, eleven resources. API ${own.api.ApiId}; stage $default; authorizer ${obs.api.authorizers[0].AuthorizerId}; integration ${obs.api.integrations[0].IntegrationId}; route GET /v1/team-hub/preview; Lambda ProjectRespawn-TeamHub-Ntgre-PreviewRead. Other resources: runtime role, invoke permission, preview log group and two alarms. No DynamoDB, S3 product bucket, command Lambda, mutation route, AppSync/Cognito creation, real Team records or business state.

Evidence: ${link('product-prepared')}, ${link('product-change-set')}, ${link('product-execution-gate')}, ${link('product-executed')}, ${link('product-events')}, ${link('ownership')}.

## Immediate exact-API lockdown

API CloudFormation stack/name/logical-ID tags and Project=ProjectRespawn, Domain=TeamHub, Environment=Ntgre were verified, along with all eleven identities and the pinned template. The reviewed binder generated the actual-ID policy. The new caller role/policy were explicitly retained when deriving the security update from the older template.

Lockdown change set: zero additions, two modifications (ExecutionBoundary and ExecutionRole), zero deletions/replacements. The installed inline identity and default boundary match the exact-ID policy; no extra execution attachments or inline policies exist. Own API lifecycle is allowed; CreateApi, all fourteen pre-existing APIs and arbitrary other APIs are denied. Caller/runtime permissions are preserved. Proposed and actual-role lockdown checks each passed 43 positives and 679 negatives, zero Analyzer findings. Previously resolved unsupported simulator representations were not reopened.

Temporary broad first-create authority is no longer effective. One historical non-default managed-policy version remains inactive; neither the product caller nor execution role can restore it. The former expiry 2026-10-06T13:51:32.179Z was not extended. Runtime acceptance occurred only after installed lockdown verification. Evidence: ${link('lockdown-candidate')}, ${link('lockdown-change-set')}, ${link('lockdown-installed')}, ${link('lockdown-live-validation')}.

## Live authentication and runtime acceptance

Browser-local verification used the existing Ntgre session; no account/pool/client change or credential collection occurred. No token=401; invalid token=401; wrong issuer=401; wrong client=401; valid existing identity=200. The wrong-identity tokens were tampered and therefore also had invalid signatures: those HTTP results alone do not isolate issuer/client enforcement. Live JWT authorizer readback and nine passing preview/authentication tests, including an independent signed-token model, establish those controls separately.

Response: contractVersion=team-hub.v1, environment=Ntgre, preview=true, nonProduction=true, dataAuthority=SYNTHETIC, synthetic Team fixture with realBusinessRecord=false. The temporary local page and collector were removed/closed after sanitized results arrived. amplify_outputs.json is unchanged and repository local-output validation passed.

Lambda initialization observed; successful platform report and application success log matched request ${obs.runtimeRequestId}. Metrics: ${obs.invocations} invocation, ${obs.errors} errors; ${obs.apiRequests} API requests and ${obs.api5xx} API 5xx. Both alarms OK. No runtime KMS AccessDenied or log errors. The KMS DryRunOperationException recorded during creation explicitly states the request would have succeeded; it is a successful authorization probe, not an encryption failure.

The actual runtime role passed all 70 post-invocation negative assertions: DynamoDB, business S3, Cognito Admin/ListUsers, AppSync, IAM, CloudFormation, Tournament, Creator, Commerce and business KMS denied. Real key aliases were used where present; alias-less customer keys use a nonmatching simulator representative, with fresh inventory establishing absence of alias/aws/lambda. The boundary's ForAllValues deny also applies to an absent alias set.

The known logging simulator limitation produced two raw implicit denials despite exact policy readback. They are retained in pre-auth evidence and are not relabeled as raw Allows. Independent Analyzer inclusion checks for identity and boundary, sensitive removed-Allow controls, foreign-log deny controls and successful live logs resolved logging coverage: six independent checks passed. No IAM patch was applied to satisfy simulation. Evidence: ${link('live-auth')}, ${link('observability')}, ${link('runtime-logs')}, ${link('runtime-kms')}, ${link('runtime-security')}, ${link('logging-verification')}.

## Final isolation and endpoint manifest

Legacy: UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167; root timestamp unchanged, 62 protected identities unchanged, five Lambda hashes unchanged. Tournament: UPDATE_COMPLETE, eleven resources, API msipnwy39j; Lambda/security unchanged. Live before/after comparisons passed. Neither Legacy nor Tournament was synthesized, diffed, given a change set or deployed. Production untouched.

Endpoint manifest: [config/domains/team-hub/domain-endpoints.Ntgre.json](../../config/domains/team-hub/domain-endpoints.Ntgre.json), generated only after acceptance and validated against domain-endpoints.v1. Shared environment schema also passed. frontendCutover=false; no application routing change, migration or business-data mutation. No Git commit/push was requested or performed; unrelated workspace changes remain preserved.

Final evidence: ${link('legacy-after')}, ${link('tournament-baseline')}, ${link('accepted-state')}, ${link('final')}.

TEAM HUB READ-PATH RELEASE 1 ACCEPTED — SECOND INDEPENDENT DOMAIN PROVEN
`);
console.log(JSON.stringify(summary));
