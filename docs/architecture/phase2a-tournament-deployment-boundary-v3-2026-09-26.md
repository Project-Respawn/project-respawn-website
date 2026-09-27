> **SUPERSEDED FOR EXECUTION** by [the final Phase 2A deployment boundary](phase2a-tournament-deployment-boundary-final-2026-09-26.md). The report below is historical evidence; its original bytes are preserved in phase2a-tournament-boundary-final-evidence-2026-09-26/historical-reports/. Do not deploy its candidate or bootstrap proposal.

# PHASE 2A DEPLOYMENT BOUNDARY V3

Date: 2026-09-26. Account `058264289478`; region `eu-north-1`; read-only caller `arn:aws:iam::058264289478:user/RavenTest`.

**PHASE 2A SECURITY BOUNDARY REMAINS BLOCKED**

The preferred design is now concrete: security owns one exact-destination Logs resource policy; the Tournament root continues to own its HTTP log group and stage; API Gateway uses its existing AWS-owned service-linked role for delivery. The proposed security template grows from five to **six resources**, while the preserved product stays at **12**. No product source/template changes or removal of access logging were made.

There is an important correction to v2: the two failed custom simulations were not an observed CloudFormation deployment failure. Neither CDK synthesis nor the Stage provider schema directly requests those Logs actions. The first-activation caller checks have not been established. The existing service-linked role supports the proposed separation, but its permissions alone do not prove that the originating caller can omit CreateLogDelivery or PutResourcePolicy. Current account state has no successful access-logging example to settle that question.

Also, an exact-destination *resource policy* is different from an exact-operation *administrator permission*. IAM cannot restrict PutResourcePolicy to the intended policy name or document contents. The proposed logging action policy therefore has a disclosed broader capability and is not attached to any identity. A controlled installer execution path remains necessary before it is a complete authorization package.

AWS writes **0**. No roles, policies, change sets, groups or APIs created. No existing policy changed. No deployment. No production mutations. V1 and v2 are preserved.

## Evidence

- [Read-only account inspector](phase2a-tournament-boundary-v3-evidence-2026-09-26/inspect-logging.mjs)
- [API stages](phase2a-tournament-boundary-v3-evidence-2026-09-26/api-stages.json)
- [Live API Gateway service-linked role](phase2a-tournament-boundary-v3-evidence-2026-09-26/service-linked-role.json) and [attached policy v9](phase2a-tournament-boundary-v3-evidence-2026-09-26/service-linked-policy-document.json)
- [Stage provider metadata](phase2a-tournament-boundary-v3-evidence-2026-09-26/stage-provider.json) and [Logs ResourcePolicy provider metadata](phase2a-tournament-boundary-v3-evidence-2026-09-26/log-resource-policy-provider.json)
- [Exact proposed documents](../../infrastructure/security/tournaments-Ntgre-boundary-v3/), [generator](phase2a-tournament-boundary-v3-evidence-2026-09-26/build-proposal.mjs), [hash manifest](phase2a-tournament-boundary-v3-evidence-2026-09-26/proposal-manifest.json)
- [Complete IAM simulation requests/results](phase2a-tournament-boundary-v3-evidence-2026-09-26/iam-simulation-results.json), [Access Analyzer](phase2a-tournament-boundary-v3-evidence-2026-09-26/access-analyzer-validation.json)

## 1. Trace of the logging requirements

The preserved product uses L1 `AWS::ApiGatewayV2::Stage`, with AccessLogSettings pointing at the explicit product-owned AccessLogs group. The destination and format become Stage properties. There is no custom logging provider, Logs ResourcePolicy, Delivery, DeliverySource or DeliveryDestination resource in the 12-resource template. The installed CDK 2.260.0 `LogGroupLogDestination.bind()` likewise only returns a destination ARN; the product uses the L1 directly.

The current eu-north-1 CloudFormation Stage registry schema declares:

| Handler | Declared permissions |
| --- | --- |
| Create | apigateway:POST, provider tagging permission |
| Update | apigateway:PATCH/POST/DELETE and provider tagging permissions |
| Read/list | apigateway:GET |
| Delete | apigateway:DELETE |

These declarations establish the public provider permission surface, not a complete trace of API Gateway's internal authorization. The schema's sourceUrl points to an AWS CloudFormation repository that returned 404; no accessible handler implementation was obtained. The [HTTP Stage API](https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/apis-apiid-stages.html) accepts AccessLogSettings in CreateStage.

`logs:CreateLogDelivery` establishes the service delivery relationship. API Gateway's existing service-linked role has Create/Get/Update/Delete/ListLogDelivery on `*`, and only `ops.apigateway.amazonaws.com` can assume that role. It does **not** have PutResourcePolicy. This is verified in live IAM and matches the [AWS-managed policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/APIGatewayServiceRolePolicy.html). It is an existing shared AWS service dependency, not a new Tournament permission grant.

`logs:PutResourcePolicy` establishes or changes the destination's permission for the AWS logging service to create streams and write events. The [HTTP API setup guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html) lists both actions for the user enabling logging. [General delivery documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-infrastructure-CWL.html) explains automatic policy setup and reduced requirements for an already-established destination. Neither source explicitly proves the exact combination of a preinstalled policy, this existing SLR and a caller denied both actions.

Thus there are three distinct principals to evaluate: the CloudFormation execution role calling Stage APIs; API Gateway's SLR managing delivery; and the security identity installing destination permission. Having a valid Allow at the latter two layers does not establish that the first layer is never checked.

No API Gateway access-log activation was performed. There is no recorded live rejection to diagnose and no successful trial to cite. The unresolved direct-caller cases remain visible in the matrix rather than being renamed as passing tests.

## 2. Current eu-north-1 state and provenance

| Read-only finding | Result |
| --- | --- |
| API Gateway v2 APIs / stages inspected | 13 / 13 |
| Stages with AccessLogSettings | 0 |
| Log groups enumerated | 151 |
| Proposed Tournament groups present | 0 |
| Account-scoped Logs resource policies | 0 |
| Resource-scoped policies returned by the regional enumeration | 0 |
| V2 delivery sources / destinations / deliveries | 0 / 0 / 0 |
| Matching management events for CreateLogDelivery, PutResourcePolicy, UpdateLogDelivery, DeleteLogDelivery | 0 in the inspected 2026-06-29 through 2026-09-26 history |

API Gateway uses V1 delivery permissions according to the [supported destinations table](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-destinations-table.html). Empty V2 DescribeDeliveries results are **not** an authoritative inventory of internal V1 delivery relationships. Similarly, absence from CloudTrail event history does not prove an internal service action never happened. The positive observation is that no inspected stage currently configures access logging.

The existing SLR is:

`arn:aws:iam::058264289478:role/aws-service-role/ops.apigateway.amazonaws.com/AWSServiceRoleForAPIGateway`

Its CreateDate is `2026-08-01T11:23:32+00:00`; trust is `ops.apigateway.amazonaws.com`; attached AWS policy is APIGatewayServiceRolePolicy v9. AWS owns its permissions. Its original creating user/application is not established by this investigation. It predates Phase 2A and must not be imported into, edited by or deleted with Tournament security bootstrap.

No existing resource policy can be selected for reuse, and no other-domain policy ownership claim is needed. All future use of the shared SLR is a service dependency, not application ownership. Account-level policy quota and cleanup become a security-owner responsibility if the new policy is eventually installed.

## 3. Architecture options

| Approach | Assessment |
| --- | --- |
| A. Security owns setup | Preferred direction: install exact destination permission separately; keep broad actions outside product roles. Existing SLR is the candidate delivery actor. Caller-side first-activation behavior remains unproven. |
| B. Precreate group and delivery | Moves the group's lifecycle into security and reduces product resources to 11, creating a deployment/removal dependency. Also cannot precreate an API-specific relationship before the API exists using a proven public V1 delivery interface here. V2 Delivery resources are not a demonstrated substitute. Not selected. |
| C. Shared account policy | Resource-policy syntax supports an explicit destination ARN/list. Use the single Tournament group now, not `/project-respawn/*` or a tag convention. Later consolidation can use separately reviewed exact destinations, subject to policy limits. No domain role may edit it. |
| D. Remove access logging | Not implemented. Lambda logs cannot show requests rejected before invocation, including JWT failures; metrics are aggregate and do not replace per-request route/status/request-ID/response-length evidence. Current two alarms detect Lambda errors and HTTP 5xx, not a complete access audit. Removing logs weakens the proof's observability. |

The selected *candidate* is A plus a narrowly targeted C. Security owns the resource policy, Tournament owns the log group, and API Gateway owns the delivery mechanism. It preserves independent roots and has no frontend, schema, Cognito, data migration or unrelated Lambda effect. No new product data or application-domain resources are introduced.

The [PutResourcePolicy API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutResourcePolicy.html) permits AWS service principals, the two log-writing actions and resource restrictions, with SourceAccount/SourceArn conditions. The draft uses the documented Logs SourceArn shape, not an invented execute-api SourceArn or an unproven resource-tag inheritance rule.

## 4. Exact draft policy and ownership

New proposed resource: `AccessLogDeliveryPolicy`, type `AWS::Logs::ResourcePolicy`, name `ProjectRespawn-Tournaments-Ntgre-AccessLogDelivery`.

Its complete document is [access-log-resource-policy.json](../../infrastructure/security/tournaments-Ntgre-boundary-v3/access-log-resource-policy.json):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "OnlyNtgreTournamentHttpDelivery",
    "Effect": "Allow",
    "Principal": {"Service": "delivery.logs.amazonaws.com"},
    "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
    "Resource": "arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/tournaments/http:log-stream:*",
    "Condition": {
      "StringEquals": {"aws:SourceAccount": "058264289478"},
      "ArnLike": {"aws:SourceArn": "arn:aws:logs:eu-north-1:058264289478:*"}
    }
  }]
}
```

This grants only the service's write path to the future named group. It does not create the group, enable a stage, create a delivery, grant access to an IAM user/role, or prove the Stage caller can omit setup permissions. The source wildcard follows AWS's delivery example; the destination wildcard is limited to streams inside one exact group. No production or other-domain destination is in this document.

[bootstrap.template.json](../../infrastructure/security/tournaments-Ntgre-boundary-v3/bootstrap.template.json) adds this single resource to the five unchanged v2 IAM resources. The separate steady template preserves it when the execution policy binds to the real API ID. Both drafts remain marked BLOCKED.

| Count | Value |
| --- | --- |
| Previous security resources | 5 |
| New proposed security resources | 6 |
| Product resources | 12 |
| New service-linked roles | 0 |
| New log groups in security | 0 |
| Additional installer roles/providers included | 0; the action draft is not a provisioned installer |

## 5. Permissions by lifecycle

| Operation | Tournament execution path | Security/service path and evidence limit |
| --- | --- | --- |
| Security policy first creation | No product operation | ResourcePolicy provider requires PutResourcePolicy and DescribeResourcePolicies. Proven by current registry schema. |
| Product first creation | Own log groups, then CreateStage with AccessLogSettings | Candidate SLR has CreateLogDelivery; destination policy would already exist. Whether caller-side CreateLogDelivery/PutResourcePolicy checks still occur is unresolved. |
| Normal code-only update | UpdateFunctionCode/configuration and read the promoted exact code artifact; stage must be unchanged | Neither new destination permission nor delivery setup should be involved. This is supported by a static diff and CloudFormation's changed-resource update contract; a live Release 2 remains unperformed. |
| Code-only rollback | Restore previous Lambda code/configuration and exact artifact access | No Stage change in the proposed contract, so no logging setup expected. |
| Stage/logging rollback or recreation | Stage create/update/delete as appropriate | May establish/update/delete a delivery. Existing SLR has those actions; originating-caller checks are not proven. Do not generalize code-only rollback evidence to this case. |
| Product stack deletion | Delete own stage/API/groups | SLR has DeleteLogDelivery. Product does not own the resource policy. Actual delivery cleanup/caller checks need confirmation; PutResourcePolicy is not an expected policy-delete operation. |
| Security policy update | No product operation | Provider declares PutResourcePolicy, DescribeResourcePolicies, DeleteResourcePolicy. |
| Security policy rollback/removal | No product operation | DeleteResourcePolicy on the newly owned policy. Keep policy while product still depends on it. |

[Release 2 static contract](phase2a-tournament-boundary-v3-evidence-2026-09-26/release2-static-contract.json) changes only PreviewFunction among resources and its revision output. It is an illustrative comparison, not a new candidate or AWS change set. [AWS documents](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) that updates compare current/new state and update changed resources. A real Release 2 gate must reject stage/log-group/resource-policy changes and replacements, promote exact new template/code hashes into the existing artifact read allowlists, and verify returned AWS changes. No broad Logs action is needed merely to promote artifact hashes. This does not prove a changed logging configuration will work under the same role.

CreateLogDelivery is not universally “initial create only”: another delivery can be needed for destination/stage recreation. PutResourcePolicy is a policy provisioning/change permission; it can stay outside normal code releases. The full logging lifecycle without direct product setup permissions is still a hypothesis requiring specific confirmation.

## 6. Exact identity documents and remaining authority problem

All documents are in [the v3 proposal directory](../../infrastructure/security/tournaments-Ntgre-boundary-v3/).

| Required identity/action | Document and status |
| --- | --- |
| Security logging administrator/action | `security-logging-action-policy.json`; isolated maximum action policy, not attached to any user/role |
| Tournament deployment role | `deployment-policy.json`; unchanged v2 own-stack change sets, pinned URL and exact PassRole |
| First-create Tournament execution | `execution-bootstrap-policy.json`; unchanged v2 bounded product operations and disclosed expiring API exception, no broad Logs mutation |
| Steady Tournament execution | `execution-steady-fixture-policy.json`; simulation fixture only; render `steady.template.json` with verified live API ID later |
| Runtime boundary | `runtime-boundary.json`; own preview streams only |
| Trusts and runtime grant | `deployment-trust.json`, `execution-trust.json`, `runtime-trust.json`, `runtime-identity-policy.json`; unchanged |

The security logging action document allows only PutResourcePolicy, DeleteResourcePolicy and DescribeResourcePolicies, denies other actions, denies other regions, and denies all use at/after `2026-09-27T23:59:00Z`. It is intended as a maximum policy for a separately controlled setup session; attaching it as an extra Allow to an already privileged user would not prove identity isolation. No such attachment or session was created.

These three actions require wildcard Resource under the current authorization metadata. There is no supported policyName/PolicyDocument condition for restricting this administrator to the single payload. The exact payload's narrow destination scope does not reduce the administrator's ability to submit a different payload or delete another policy. A specific counterexample is recorded in the matrix: another policy name is indistinguishable in IAM authorization and remains allowed. Region and expiry bound time/place, not policy ownership.

The draft action identity cannot directly deploy any CloudFormation stack or mutate Cognito, AppSync, DynamoDB, S3, KMS, Lambda, IAM roles, log groups or alarms. That does **not** prove it cannot disrupt another application's delivery by changing Logs policies. Only the dedicated proposed action identity is allowed to administer policy among the tested product identities; this is not a claim that existing account administrators lack that power.

The proposed action policy also does not install the five IAM resources. The trusted security installer from v2 remains a separate responsibility. A complete enforceable installer/package must bind the exact reviewed operations to a real restricted session or service execution path, without smuggling broad Logs administration into product deployment. If that requires additional IAM/provider resources, the six-resource count must be revised before authorization. No new installer or custom provider was invented and silently omitted from accounting.

## 7. Tests and their precise scope

| Matrix | Result |
| --- | --- |
| Tournament positives excluding unresolved caller assumptions | 186/186 PASS |
| Original direct-caller activation checks retained separately | 0/2 allowed; both remain implicitDeny |
| Security logging action positives | 3/3 PASS |
| Existing service-linked policy lifecycle positives | 5/5 PASS |
| Original negative protections | 131/131 PASS |
| Expanded negative protections | 169/169 PASS |
| Unexplained denials | 0 |
| Residual broad-policy capability | 1 explicitly demonstrated; not counted as a protection |

All original v2 cases were rerun, including both failed positives. The two unresolved cases were not discarded to manufacture an all-green end-to-end result. Moving conceptual ownership is not enough to remove an authorization requirement from a real AWS request. Custom IAM simulations cannot establish the API Gateway service's choice of principal or prove absence of caller checks.

New negatives deny all product identities PutResourcePolicy/DeleteResourcePolicy/CreateLogDelivery/UpdateLogDelivery/DeleteLogDelivery, and deny the isolated setup policy direct application/service mutation, other-region use and post-expiry use. Service-role tests use its live AWS policy and show that it can perform delivery operations but cannot PutResourcePolicy. They do not impersonate the service or call delivery APIs.

[Access Analyzer](phase2a-tournament-boundary-v3-evidence-2026-09-26/access-analyzer-validation.json): **10 documents, zero findings** (ERROR/WARNING/SECURITY_WARNING/SUGGESTION). Includes all trusts, identity grants/boundaries, security action and resource policy. No warning was suppressed.

Local proposal tests: **5/5 PASS**. Resource-accounting tests: **24/24 PASS**. AWS ValidateTemplate succeeded for the six-resource security draft and reports CAPABILITY_NAMED_IAM; this read-only validation created no change set. Template validation is not an authorization or delivery test.

## 8. Preserved product and synthesis

No local Tournament infrastructure changed in v3, so the conditional requirement to re-synthesize a changed product does not apply. The full 42-file v2 source/build preservation manifest was rechecked byte-for-byte. The prior 26/26 Tournament tests and TypeScript/build/isolation results belong to that unchanged candidate; they are not described as newly run v3 tests.

- Source-manifest revision: `33b22ca602a238e2ca4fb98b87c016e8da3e058d202f66297e3cd13cae734761`.
- Template SHA-256: `0e1e2b094f03d996cbbb72d9a8ff6a75f2797e9092ad7afac199fd65097d7ee6`.
- Product resources: 12, including AccessLogs and DefaultStage.AccessLogSettings.
- Security draft: six resources, one more than v2, explicitly proposed for review.
- LegacyPlatform synthesis: NO. Amplify schema generation: NO. Unrelated Lambda bundling: NO.
- No Cognito contract, frontend, outputs, business schema or runtime artifact changed.

## 9. Authorization package status and proposed sequence

**There is no ready next AWS write operation in this report.** The requirement “if all blockers are resolved” is not satisfied. The local six-resource template is a review artifact, not a bootstrap approval recommendation. No executable create/execute command is presented as safe to run now.

The intended future security-only package, once the two evidence/control gates are resolved, is:

1. Confirm the exact first-activation authorization contract through authoritative AWS clarification or an already-recorded trace proving the caller policy, pre-existing destination policy, SLR and successful HTTP Stage activation. Existing read-only evidence here cannot supply that proof. Any active verification would require separate explicit authorization; none is performed or implicitly requested here.
2. Bind the security setup action to a concrete controlled principal/execution path for the exact policy payload and reviewed IAM installation. Validate its effective boundary and disclose any residual account-policy authority. Do not run the draft with a broad current session and describe it as restricted.
3. Refresh the account/region, protected baseline, empty-policy/name-collision checks, API inventory, expiry and artifact hashes. Preserve existing shared service roles and CDK roles.
4. Prepare and inspect a security-only CloudFormation change set. Expected *local* diff: six additions (two IAM roles, three managed policies, one Logs resource policy), zero updates/deletions/replacements. This is not an AWS-generated diff. Additional installer resources would require an explicitly revised package/count.
5. Only after separate authorization, execute security bootstrap with rollback enabled. Verify exact policy name/content/hash, all three boundaries and two trusts, existing SLR unchanged, no product group/API/stack created and no existing policy changed. Remove/disable temporary setup authority; do not extend expiry automatically.
6. Tournament Release 1 receives a separate authorization gate, including AWS-generated product changes and actual logging verification. Keep the v2 API child exception explicit and time-limited; bind to the verified real API ID immediately after successful creation. Normal release permissions must contain neither direct broad Logs policy actions nor unknown-ID API scope.
7. Release 2 must demonstrate a code-only update with the steady identity, no Stage/configuration changes and no direct Logs setup permission. Access-log arrival and request correlation are required verification, not just IAM simulation.

Rollback/removal proposal:

- Security create failure before any product exists: CloudFormation rollback removes only newly created security resources. Inspect policy inventory before/after; never delete a pre-existing colliding policy. The exact name/content must be confirmed by the operator because IAM cannot enforce that name restriction.
- Setup session expiry during rollback: stop and inspect; no automatic renewal, switch to an administrator product role or deletion of shared policies.
- Product still exists: retain its runtime boundary, associated execution role and access-log resource policy. Do not delete the shared API Gateway SLR under any Tournament cleanup procedure.
- Product removal after separate authorization: remove its own stage/API/groups using reviewed permissions; verify delivery cleanup before removing the dedicated security policy. Unproven caller-side lifecycle behavior must be resolved before this is considered an executable rollback plan.
- Record all setup/removal operations and compare existing account policy documents. No production, LegacyPlatform or other-domain policy may be modified as incidental cleanup.

## 10. Legacy baseline and stop condition

[Before](phase2a-tournament-boundary-v3-evidence-2026-09-26/legacy-before.json) and [after](phase2a-tournament-boundary-v3-evidence-2026-09-26/legacy-after.json) use the allowlisted read-only verifier.

| Item | Result |
| --- | --- |
| LegacyPlatform resources | 2,621 |
| FunctionDirectiveStack | 167 |
| Root status | UPDATE_COMPLETE |
| Root LastUpdatedTime | `2026-09-26T11:52:06.391000+00:00`, unchanged |
| Stack/template identities | 62 unchanged |
| Protected resource identities | 62 unchanged |
| Monitored Lambda code/configuration hashes | 5 unchanged |
| Cognito core identity / local outputs | unchanged |

The preferred security-owned resource policy is precisely defined and locally validated. The missing result is an end-to-end authorization proof for first activation plus a concrete controlled setup execution boundary. Neither simulation success nor empty account state supplies it. Therefore this report does not claim 188/188 operational readiness, does not propose disabling logging to make tests pass and does not authorize any AWS mutation.

AWS writes: **0**. Tournament deployed: **NO**. Production mutations: **NONE**.
