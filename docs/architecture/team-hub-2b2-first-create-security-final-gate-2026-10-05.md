# Phase 2B2 Team Hub first-create security final gate

5 October 2026. **The 280 simulator cases are classified and no longer block the API Gateway review. The full first-create gate remains blocked by a real default-Lambda KMS dependency.** No IAM was broadened, applied or installed. No stack/change set/deployment was created. Both pinned candidates remain unchanged.

This review follows the [deployment-security correction](team-hub-2b2-deployment-security-correction-2026-10-05.md). It uses authenticated read-only AWS calls with `default`, `arn:aws:iam::058264289478:user/RavenTest`, account `058264289478`, region `eu-north-1`. REST/v2 inventory still contains the same 14 protected API IDs and no Team API. No live API mutation, encryption/decryption, grant creation, or rollback probe was issued.

## Classification and simulator capability

The [machine-readable classification](team-hub-2b2-final-security-evidence-2026-10-05/classification.json) records all 280 source cases individually: operation, HTTP/control-plane operation, IAM action, original resource/path, API ID, classification, template/create/rollback applicability, protected-negative status, simulator support, secondary semantics and evidence.

| Primary classification | Count |
| --- | ---: |
| REQUIRED_LIVE_OPERATION | 0 |
| PROTECTED_NEGATIVE | 0 |
| SYNTHETIC_DUPLICATE | 0 |
| SIMULATOR_UNSUPPORTED | **280** |
| NOT_USED_BY_TEMPLATE | 0 |
| UNKNOWN | **0** |

All cases receive SIMULATOR_UNSUPPORTED as their primary classification under the user's requested control-test rule. That does **not** mean none concerns a real operation: secondary fields retain real API/Stage tagging relevance, 224 protected-negative cases, alternate encodings, and unused REST probes. Required first-create tagging is distinct from standalone untag maintenance; delete handlers remove resources rather than requiring a separate UntagResource cleanup call.

Twelve fresh unconditional-service-allow controls cover both PATCH and DELETE across six families: decoded API tag ARN, encoded API tag ARN, encoded Stage tag ARN, lowercase-encoded tag ARN, synthetic REST root and REST child collection. **All 12 still return implicitDeny with no matched statements or missing context.** [Control results](team-hub-2b2-final-security-evidence-2026-10-05/controls.json), corresponding request/response JSON files in the same directory. These are limitations of those simulator representations, not proof that the real API operations are unsupported or require broader IAM.

An independent evaluator applies the pinned statements' Action/NotAction, Resource/NotResource, region and time conditions to the 280 exact cases. **280/280 match their intended permissions**, with explicit denies for protected paths and permitted lifecycle paths before expiry. [Independent semantics](team-hub-2b2-final-security-evidence-2026-10-05/independent-semantics.json). These results are document-semantics evidence, not relabelled AWS simulator passes or live calls.

## Provider schemas and actual API operations

Read-only `cloudformation describe-type` fetched the current regional schemas for all **10 resource types / 11 product resources**, including all five API Gateway types. Raw schemas and metadata are retained. The [API operation map](team-hub-2b2-final-security-evidence-2026-10-05/api-operation-map.json) separates HTTP operations from IAM actions and maps create, read/stabilize, update, delete, tagging, untagging and rollback.

| Resource | Create | Read/stabilize | Update | Cleanup |
| --- | --- | --- | --- | --- |
| API | CreateApi / POST | GetApi / GET | UpdateApi / PATCH | DeleteApi / DELETE |
| Stage | CreateStage / POST | GetStage / GET | UpdateStage / PATCH | DeleteStage / DELETE |
| Authorizer | CreateAuthorizer / POST | GetAuthorizer / GET | UpdateAuthorizer / PATCH | DeleteAuthorizer / DELETE |
| Integration | CreateIntegration / POST | GetIntegration / GET | UpdateIntegration / PATCH | DeleteIntegration / DELETE |
| Route | CreateRoute / POST | GetRoute / GET | UpdateRoute / PATCH | DeleteRoute / DELETE |

API and Stage schemas declare tagging on create/system tags. Other three API types are not taggable. The Stage schema itself includes provider annotations named `apigateway:TagResource`/`UntagResource`; these are **not added as explicit IAM actions**. AWS's [service authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigatewayv2.html) maps tagging API operations to HTTP IAM verbs. The [tag API](https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/tags-resource-arn.html) uses POST/DELETE on the tag endpoint. The existing practical `apigateway:*` grant covers the service lifecycle without guessing extra named actions.

The provider permission lists cover optional features too. The pinned template has no OpenAPI BodyS3Location, custom authorizer/integration credential role, REST API, attached runtime managed policies, VPC/EFS/layers/code signing, or log delivery/data-protection policy. Those optional paths are documented separately from the required minimal product path; provider annotations such as `s3:REST.PUT.OBJECT` are not copied into IAM. No new permissions are introduced from a schema list.

## Tournament live comparison

[Extracted events and equivalence limits](team-hub-2b2-final-security-evidence-2026-10-05/tournament-comparison.json) retain exact event IDs, timestamps and source paths.

- On 4 October, CloudFormation completed JWT Authorizer at 13:34:39Z, Integration at 13:35:24Z, Route at 13:35:26Z and default Stage at 13:35:27Z. These match the Team resource types and JWT/Lambda proxy/default-stage lifecycle. The Stage completion is live evidence of the integrated lifecycle under practical API Gateway authority, including applicable tagging handling.
- The earlier Stage failure explicitly mentioned `apigateway:TagResource` on the stages collection. The successful subsequent Stage creation, under `apigateway:*`, establishes that a synthetic `/tags/...` simulator implicit denial is not sufficient evidence of a missing live permission.
- Historical rollback events show DELETE_COMPLETE for Authorizer, Integration, Route and Stage. They support those cleanup paths; a failed Stage's cleanup is not proof that a fully created Stage was deleted in that attempt.
- Tournament's API was already created/imported. Its accepted October 4 update is **not** proof of fresh CloudFormation CreateApi or fresh API rollback. Those Team paths are supported by the provider requirements, valid POST/GET/DELETE API-path simulations and policy semantics.
- No individual successful TagResource/UntagResource CloudTrail event is invented from CREATE_COMPLETE. IDs, route names, policies, timing, provider versions and API ownership differ; successful Tournament deployment is supporting evidence, not a guarantee of Team success.

## Protection of existing APIs

All 14 APIs have explicit `apigateway:*` Deny coverage in both the execution identity policy and boundary. The match includes the API ID within API/child/tag representations and has no expiry condition. An applicable explicit deny takes precedence over an allow. [AWS evaluation rules](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html).

For each API, the review combines 64 supported simulator negatives across first-create/steady-state and 16 independently evaluated unsupported tag representations. Ordinary update, delete and applicable mutation are denied for Legacy (3), Tournament (1), production (3), and other existing APIs (7). [Per-API evidence levels](team-hub-2b2-final-security-evidence-2026-10-05/protected-api-proof.json). UNKNOWN ownership remains zero; all existing APIs are protected regardless of classification.

The 90 positive and 1,124 negative supported simulations from the correction remain valid for unchanged policies. Analyzer requests were compared with the pinned policy documents: **zero findings**, including zero errors/security warnings/invalid-action findings. Unsupported synthetic cases are not required to return explicitDeny for this conclusion.

## Real first-create blocker: default Lambda encryption

Team's pinned execution identity and boundary still contain an explicit `kms:*` Deny on `*`. The product has Lambda environment variables and uses default encryption. Absence of a customer KmsKeyArn does not disable Lambda encryption. [AWS default environment encryption](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

Tournament's recorded CloudTrail event at **2026-10-04T13:11:58Z**, request **6b430ae3-8eeb-4828-b360-b62b03eedd9c**, shows `CfnExecution/AWSCloudFormation` denied **kms:Encrypt** on:

`arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`

That is the recorded AWS-managed `alias/aws/lambda` key. After Tournament's separately approved execution-policy correction, CloudTrail recorded successful Encrypt, Decrypt, DescribeKey and CreateGrant under the CloudFormation execution principal, followed by Lambda CREATE_COMPLETE. The historical correction added no broad KMS Allow. This is execution/deployment evidence, distinct from Tournament's later runtime-role correction.

Fresh simulation of the **unchanged Team execution identity plus boundary** returns **explicitDeny for all four evidenced actions**, without missing context. [Real dependency comparison](team-hub-2b2-final-security-evidence-2026-10-05/real-kms-dependency.json), [live IAM evaluation](team-hub-2b2-final-security-evidence-2026-10-05/lifecycle-response-default-lambda-kms.json). The explicit deny remains decisive regardless of potential resource-policy grants. No actual KMS operation was invoked by this review.

This is a known dependency failure, not UNKNOWN and not an IAM-simulator tagging anomaly. It prevents declaring the full Team first-create candidate ready. Neither the execution policy nor the runtime policy was changed here. Any correction must be separately reviewed against actual AWS-managed service-key behavior and business-key protection; the current report does not authorize or implement it.

## Rollback coverage

[Provider lifecycle and rollback ledger](team-hub-2b2-final-security-evidence-2026-10-05/provider-lifecycle-and-rollback.json) maps all 11 resources. Fresh simulations prove **30 direct cleanup/read assertions**; another 9 create/role assertions pass. Four additional default-key assertions are denied as described above. [Complete results](team-hub-2b2-final-security-evidence-2026-10-05/lifecycle-simulations.json).

| Resource(s) | Required cleanup family | Finding |
| --- | --- | --- |
| API, Stage, Authorizer, Integration, Route | Corresponding GET/DELETE on owned API resources | Covered before expiry |
| Lambda | GetFunction/DeleteFunction | Direct actions allowed; environment-aware KMS read dependency blocked |
| Runtime role | List/Get policies, DeleteRolePolicy, DeleteRole | Covered; no attached managed policies to detach |
| Invocation permission | GetPolicy/RemovePermission | Covered |
| Log group | DescribeLogGroups/DeleteLogGroup | Covered; no data-protection/delivery resource to remove |
| Two alarms | DescribeAlarms/DeleteAlarms | Covered |

**Unknown cleanup operations: 0. Full rollback assurance: not passed**, because the Lambda read/stabilization dependency is a known denial. Do not confuse allowed DeleteFunction with proof that every partially-created Lambda cleanup/stabilization sequence will succeed. All API cleanup authority is time-bounded, so remaining expiry margin must be rechecked before any later execution.

## Expiry and steady-state lockdown

Expiry is unchanged: **2026-10-06T13:51:32.179Z**. At this review approximately **23.6 hours remain**, exceeding a documented six-hour planning reserve for bootstrap, verification, inspection, deployment, rollback and lockdown. This is not a duration guarantee. No renewal is required or prepared now; recheck at the actual later gate. [Timestamped expiry assessment](team-hub-2b2-final-security-evidence-2026-10-05/expiry.json).

The existing pinned binder and four-resource security design are unchanged. The procedure requires fresh API ID/ownership, exact account/region/CloudFormation stack, all eleven logical IDs/types/statuses and system tags before binding the exact-ID policy. Supplemental offline readback checks accepted one valid fixture and rejected five missing/wrong ownership/status cases. The resulting template changes only the execution boundary document and execution-role inline policy. [Lockdown verification](team-hub-2b2-final-security-evidence-2026-10-05/lockdown-verification.json).

Required future order: create and verify Team API/resources → verify ownership/tags/template → bind actual ID → validate → separately authorized security custodian installs → verify both installed policies and no other broad grant → remove/expire superseded broad authority → runtime acceptance. Other API management and collection CreateApi are denied in steady state. No binding to a live API or installation occurred here. The procedure is ready; actual execution remains subject to the KMS blocker and separate authorization.

## PHASE 2B2 TEAM HUB FIRST-CREATE SECURITY FINAL GATE

UNRESOLVED SIMULATOR CASES  
Original: 280  
Required live / Protected negative / Synthetic duplicate: 0 / 0 / 0 primary classifications; secondary roles retained per case  
Simulator unsupported: 280  
Not used: 0 primary classifications  
Unknown: 0

SIMULATOR CONTROL  
Unconditional allow tested: YES, all six distinct path families / twelve action-family controls  
Still implicit-deny cases: 12/12 controls, covering all 280 representations  
Conclusion: simulator limitation; no permission broadening required

TOURNAMENT LIVE COMPARISON  
Equivalent operations: four child-resource create lifecycles and recorded cleanup paths  
Proven live: Authorizer, Integration, Route and Stage creation; applicable lifecycle completion and historical cleanup  
Non-equivalent: fresh API CreateApi/delete, exact IDs/policies/routes, standalone successful tag-call tracing

FIRST-CREATE  
Required operations: provider/HTTP/IAM map for five API types plus full eleven-resource ledger  
Covered: API lifecycle; evaluated direct product actions  
Known failure: execution-policy default-Lambda KMS Encrypt/Decrypt/DescribeKey/CreateGrant denied  
Unknown: 0 classified operation families; real Team deployment remains unperformed

ROLLBACK  
Resources: 11  
Cleanup operations: mapped; 30 direct cleanup/read assertions pass  
Covered: direct cleanup, but full rollback gate NOT passed due to Lambda environment-read dependency  
Unknown: 0; known default-KMS denial remains

PROTECTED APIS  
Legacy: DENIED (3)  
Tournament: DENIED (1)  
Production: DENIED (3)  
Other existing: DENIED (7)  
Evidence level: explicit deny semantics + supported AWS simulation + independent evaluation, with scoped Tournament supporting evidence

ACCESS ANALYZER  
Errors: 0  
Warnings: 0  
Invalid actions: 0 in unchanged policy documents; provider annotations were not added as IAM actions

TEMPORARY AUTHORITY  
Expiry: 2026-10-06T13:51:32.179Z  
Safety margin: approximately 23.6 hours at review; six-hour planning reserve  
Renewal required: NO at this review

STEADY STATE  
Exact Team Hub API lockdown: prepared; actual owned ID required  
Other APIs: DENIED  
CreateApi: DENIED  
Ready: procedure/binding checks PASS; not installed

CANDIDATES  
Product: `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f` — unchanged, 54 source inputs exact  
Security: `7e3f27a0191d5039f3035a4fddd0e14f10eb9c56fd41a8a13092ca5b4d14768b` — unchanged  
First-create security template: `757cc602fcf8388e440fb310bc0a312d702c52aa00a8ac0348ab93ed6c1ddf8b` — unchanged  
AWS changes made: NONE

**TEAM HUB FIRST-CREATE SECURITY REMAINS BLOCKED**
