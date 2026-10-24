// Consolidate review only after all supported checks finish. No AWS calls.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const E='docs/architecture/production-team-hub-tagging-recovery-2026-10-24',read=p=>JSON.parse(fs.readFileSync(p)),sha=v=>createHash('sha256').update(v).digest('hex'),m=read(E+'/candidate.PROPOSED.json'),v=read(E+'/security-validation.json');
assert(v.certificationPassed);assert.equal(v.cases.length,393);assert(v.cases.every(c=>c.passed));assert.equal(v.templates.length,2);assert.equal(v.passed,false);assert.equal(v.analyzerExceptionAccepted,false);
const blocking=v.policies.flatMap(p=>p.analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)).map(f=>({policy:p.id,issueCode:f.issueCode,findingType:f.findingType,detail:f.findingDetails})));assert.equal(blocking.length,2);assert(blocking.every(f=>f.issueCode==='INVALID_ACTION'&&f.detail.includes('apigateway:TagResource')));
for(const a of [m.security,m.product,m.runtime])assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
const summary={at:new Date().toISOString(),status:'TECHNICAL_CORRECTION_PREPARED_AWAITING_EXPLICIT_ANALYZER_EXCEPTION',candidateSha256:sha(fs.readFileSync(E+'/candidate.PROPOSED.json')),executionPackageSha256:sha(fs.readFileSync(E+'/execution-package.PROPOSED.json')),securitySha256:m.security.sha256,productSha256:m.product.sha256,runtimeSha256:m.runtime.sha256,changedResources:['ExecutionBoundary','ExecutionRole'],awsCustomPolicyCases:v.cases.length,originalCasesPreserved:333,newTaggingControls:60,failedCases:0,templatesValidated:2,analyzerPolicies:4,analyzerBlockingFindings:blocking,analyzerExceptionAccepted:false,awsWrites:0,approvalQuoteReceived:'I approve your changes',approvalInterpretation:'Approval of the described narrow correction/recovery remains recorded. It does not silently waive the newly discovered zero-Analyzer-error gate.',policySizes:m.policySizes,liveAuthorizationProven:false};
fs.writeFileSync(E+'/review-result.json',JSON.stringify(summary,null,2)+'\n');
const report=`# Production Team Hub stage-tagging correction and recovery review

24 October 2026. The narrow correction is prepared and certified; **execution is held only for an explicit Access Analyzer exception decision**. The user's “I approve your changes” is recorded as approval of the described correction/recovery, not invented acceptance of a newly discovered validation exception. No AWS mutation occurred during this review.

## Demonstrated dependency and catalog discrepancy

The actual failed CreateStage request reached API Gateway under the original CloudFormation execution role, request ID \`5ab0b5c3-0cc9-4b73-a60b-01d27b3edbe6\`. It included exactly the three CloudFormation system tag keys. [Sanitized CloudTrail](production-team-hub-tagging-recovery-2026-10-24/stage-cloudtrail.json) correlates the real failure, not a simulation.

The installed eu-north-1 \`AWS::ApiGatewayV2::Stage\` provider declares \`apigateway:POST\` and \`apigateway:TagResource\` for create, and automatically includes CloudFormation system tags. [Actual provider schema](production-team-hub-tagging-recovery-2026-10-24/stage-provider-schema.json). Conversely, the [public AWS authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigatewayv2.html) maps tagging operations to HTTP verbs and does not list the literal action in its actions table. Actual Access Analyzer returns \`ERROR / INVALID_ACTION\` for the literal action. This discrepancy is preserved, not suppressed as a passed check.

IAM simulation recognizes the action when it is batched separately from API Gateway's HTTP-verb actions. A mixed batch returns InvalidInput because the actions require different authorization information. [Exact rejected batch](production-team-hub-tagging-recovery-2026-10-24/batch-without-untag.json), [successful isolated positive](production-team-hub-tagging-recovery-2026-10-24/tag-single-full-policy.json) and [negative control](production-team-hub-tagging-recovery-2026-10-24/untag-single.json). The harness now separates those authorization models, retaining every check. Earlier intermediate commentary suggesting the simulator could not evaluate the action was superseded by this isolated evidence.

## Exact proposed correction

Only \`ExecutionBoundary\` and \`ExecutionRole\` change: add the single literal \`apigateway:TagResource\` action to their existing regional API-child lifecycle grant. Resource remains \`arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/*\`, condition \`aws:RequestedRegion=eu-north-1\`. No new resource wildcard, other API, API-root grant, IAM/KMS administration, runtime IAM, trust, PassRole, Core, Cognito, secret, artifact binding or unrelated domain change.

The permission covers child resources of this one API; **it is not limited to just the one stages-collection ARN**. Of the HTTP API taggable resource types listed in [AWS tagging guidance](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-tagging-supported-resources.html), Stage is the taggable child below this API. Other APIs, domain names and VPC links are outside the ARN scope. No unsupported tag-key or principal condition is assumed. This is the small API-local scope chosen to preserve the accepted policy representation and quotas.

Removing the single added action reproduces both original policy documents exactly. All other six security resources are identical; the product and runtime ZIP remain byte-identical. The execution boundary resolves to **6,143/6,144 characters** (one character headroom), and execution inline policy to **9,781/10,240**. Verify exact installed resolved size again; do not silently add another action or broaden a prefix.

| Pin | SHA-256 |
| --- | --- |
| Execution package | \`${summary.executionPackageSha256}\` |
| Candidate manifest | \`${summary.candidateSha256}\` |
| Revised security | \`${summary.securitySha256}\` |
| Unchanged product | \`${summary.productSha256}\` |
| Unchanged Read/Command ZIP | \`${summary.runtimeSha256}\` |

## Validation

All **393 AWS custom-policy controls passed**: all 333 prior certification controls plus 60 tagging controls across policy documents and identity/boundary intersections. Exact stage collection/default-stage positives, wrong API/root/domain/foreign resource, wrong/missing region and ungranted UntagResource negatives are covered. Existing KMS lifecycle, Lambda/qualified-ARN, PassRole, artifact, CloudFormation scope and domain-isolation cases remain in the matrix. Both templates passed CloudFormation ValidateTemplate. These are read-only checks, not a new change set or real successful service authorization.

Four deployment policy documents were analyzed. Exactly two errors remain: the one expected \`INVALID_ACTION\` for \`apigateway:TagResource\` in each changed execution document; no other ERROR or SECURITY_WARNING. [Full certification](production-team-hub-tagging-recovery-2026-10-24/security-validation.json). **Overall execution gate remains blocked**, even though the permission cases pass. No broad-action substitute or unrecorded Analyzer waiver is permitted.

## Concrete recovery package

[Pinned future requests and gates](production-team-hub-tagging-recovery-2026-10-24/execution-package.PROPOSED.json):

1. Refresh identity, attended window, complete preservation, exact old installed IAM, artifact hashes and failed-stack ownership/actual absence. Reuse accepted Core/R1/R2 evidence; no reopening those deployments.
2. Conditionally publish only the new exact security template; retain the previous three objects. Inspect security UPDATE: exactly two reviewed modifications, zero additions/deletions/replacements. Execute only after the explicit exception is recorded; rollback enabled.
3. Verify installed documents/trusts/boundaries, exact exception findings only, quotas, and actual-role simulations with corrected batching. Stop on any other finding or permission difference.
4. Only then delete the **exact empty failed product stack record ARN pinned in the package**, using RavenTest; wait for terminal deletion. Recheck actual service absence first. No business resource or security stack deletion is authorized by this procedure. The prior DELETE_SKIPPED table events were independently checked: both tables were absent, not retained tables to import.
5. Recreate the unchanged pinned product through the accepted DeploymentCaller/execution role. Require exactly 41 Add changes, zero other changes and rollback enabled. This is a separately approved recovery attempt, not an automatic retry.
6. Require actual Lambda initialization, installed code/environment/IAM, safe JWT/dark infrastructure/monitoring checks, empty tables and complete production preservation. Authority initialization, migration, real business activation and Master remain separate gates.

Stop after any denied, failed or ambiguous write; preserve partial completion and permit normal CloudFormation rollback. Do not patch permissions, substitute artifacts, retry automatically, delete protected state or initialize authority.

## Focused decision needed

The original deployment required zero blocking Analyzer findings. The new required decision is to accept **only the two exact \`INVALID_ACTION\` findings for \`apigateway:TagResource\` in ExecutionRole and ExecutionBoundary** for package \`${summary.executionPackageSha256}\`, based on installed-provider and request-correlated AWS evidence. Every other Analyzer ERROR/SECURITY_WARNING remains blocking. Simulations do not prove real provider success; live creation and all remaining acceptance gates stay mandatory.

No production IAM, stack, artifact publication, business data, authority, Cognito, Core, Ntgre, frontend or Master mutation was performed during preparation. Existing security remains CREATE_COMPLETE; product remains ROLLBACK_COMPLETE as recorded by the preceding execution, pending fresh recovery preflight.

**STAGE TAGGING CORRECTION PREPARED — EXPLICIT ANALYZER EXCEPTION REQUIRED BEFORE EXECUTION**
`;
fs.writeFileSync('docs/architecture/team-hub-production-stage-tagging-recovery-review.md',report);
console.log(JSON.stringify(summary));
