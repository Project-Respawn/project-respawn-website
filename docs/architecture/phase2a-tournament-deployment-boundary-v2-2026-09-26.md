> **SUPERSEDED FOR EXECUTION** by [the final Phase 2A deployment boundary](phase2a-tournament-deployment-boundary-final-2026-09-26.md). The report below is historical evidence; its original bytes are preserved in phase2a-tournament-boundary-final-evidence-2026-09-26/historical-reports/. Do not deploy its candidate or bootstrap proposal.

# PHASE 2A DEPLOYMENT BOUNDARY V2

Date: 2026-09-26. Account: `058264289478`. Region: `eu-north-1`.
Read-only AWS caller: `arn:aws:iam::058264289478:user/RavenTest`.

**Decision: PHASE 2A SECURITY BOUNDARY REMAINS BLOCKED.**

The original unexplained runtime Logs simulation denial is isolated and explained by a reproducible action-name case difference in the simulator. The revised local product template attaches the separately owned runtime boundary. A concrete, time-limited API first-create exception and an exact-ID steady-state policy are prepared. However, the complete HTTP access-log activation path requires additional Logs permissions that are not resource-scoped in AWS authorization metadata. They remain denied, rather than being silently added to the execution role. This is a distinct deployment prerequisite, not a recurrence of the runtime logging anomaly.

No AWS resources, IAM roles, policies, change sets, artifacts, or deployments were created or modified. AWS writes: **0**. Production mutations: **0**. Tournament product stack remains absent (`DescribeStacks` returned “does not exist”).

This report supersedes the [v1 boundary report](phase2a-tournament-deployment-boundary-2026-09-26.md) for the local proposal only. It does not authorize security bootstrap or product deployment.

## Evidence and exact local candidate

Evidence directory: [phase2a-tournament-boundary-v2-evidence-2026-09-26](phase2a-tournament-boundary-v2-evidence-2026-09-26/).

Candidate worktree: `.codex-worktrees/phase2a-tournament-boundary-v2-20260926`.

| Item | Value |
| --- | --- |
| Source-manifest revision (not a Git commit) | `33b22ca602a238e2ca4fb98b87c016e8da3e058d202f66297e3cd13cae734761` |
| Product template SHA-256 | `0e1e2b094f03d996cbbb72d9a8ff6a75f2797e9092ad7afac199fd65097d7ee6` |
| CLI | `2.1143.0 (build 9c6bd0e)` |
| CDK library | `2.260.0` |
| Product resources | 12 |
| Proposed security bootstrap resources | 5; incomplete for the unresolved delivery prerequisite |
| Tournament tests | 26/26 PASS |
| Resource-accounting tests | 24/24 PASS |
| TypeScript, runtime/application/client build, isolated synthesis | PASS |
| LegacyPlatform synthesis / Amplify schema generation / unrelated Lambda bundling | NO / NO / NO |

[Preservation manifest](phase2a-tournament-boundary-v2-evidence-2026-09-26/preservation-manifest.json) hashes all 42 copied source/build evidence files. [Comparison](phase2a-tournament-boundary-v2-evidence-2026-09-26/candidate-comparison.json) records the complete template delta against the CLI-corrected candidate: runtime `PermissionsBoundary`, API ownership tags, and two revision markers. All 12 logical IDs/types are unchanged. Runtime bundle bytes and the pinned existing Cognito identity contract are unchanged. Only `stack.ts` and its proof test changed among the 24 source inputs. The original candidate and previous corrected candidate are preserved separately; neither was overwritten or promoted.

## 1. Logging denial diagnosis

[Controlled reproduction](phase2a-tournament-boundary-v2-evidence-2026-09-26/logging-case-repro.json), [20-case investigation](phase2a-tournament-boundary-v2-evidence-2026-09-26/logging-matrix.json).

The API caller is RavenTest. `SimulateCustomPolicy` evaluates supplied hypothetical policy documents; it is not an assumption of a deployed Tournament role. No such role was created. In the minimal reproduction:

- Action request: `logs:PutLogEvents` versus `logs:putlogevents`.
- Resource: `arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/tournaments/preview:log-stream:test`.
- Identity policy: one Allow for that resource. Independently tested policy actions `logs:PutLogEvents`, `logs:putlogevents`, and `*`.
- Supplied context, permissions boundary, session policy, SCP, resource policy: none.
- Same policy/resource: mixed-case request returns `implicitDeny`; lowercase request returns `allowed`, for all three policy-action variants.
- Direct SDK and CLI requests reproduce the behavior. It is not PowerShell quoting, a hidden supplied boundary, or insufficient permission in the minimal identity policy.

The wider matrix distinguishes `*`, bare group ARN, group `:*`, and a concrete stream ARN, and tests CreateLogGroup, CreateLogStream, PutLogEvents and DescribeLogGroups. The concrete-stream case exposes the action-case-sensitive simulator behavior. AWS documents IAM action names as case-insensitive. The evidence therefore explains the earlier denial as an observed simulator normalization discrepancy. AWS's internal implementation cause has not been established. The remedy is normalized lowercase **simulation request** action names, not broader deployed policies. [AWS action semantics](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_action.html).

The runtime boundary permits only `logs:CreateLogStream` and `logs:PutLogEvents` within the preview log group. Both pass with concrete own-stream ARNs and fail on unrelated streams, even when the simulated identity policy otherwise allows everything. Runtime CreateLogGroup and DescribeLogGroups remain denied. CloudFormation separately receives own-group create/delete/retention/tag/read permissions and account-level log-group/resource-policy metadata reads.

Organization membership and SCP enablement are visible, but listing attached account SCPs is denied to the caller; see [organization visibility](phase2a-tournament-boundary-v2-evidence-2026-09-26/organization-visibility.json). No SCP/session/resource policy was supplied to these custom simulations. This does not establish the effective permissions of future live sessions under organization policy. IAM simulation does not execute service calls or prove service availability of supplied global context keys. [AWS simulator limitations](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html).

## 2. Runtime boundary and security ownership

The product's `PreviewRole.PermissionsBoundary` now references:

`arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary`

The separate security bootstrap owns this managed policy. The product cannot create, version, remove or replace it. The execution policy permits CreateRole and PutRolePolicy only on the generated Tournament runtime-role name pattern with this boundary. Permissions-boundary mutation and managed-policy attachment are outside its maximum permissions. IAM PassRole is restricted to that runtime role and `lambda.amazonaws.com`.

The boundary explicitly denies operations other than the two runtime log writes and denies other log resources. Thus future inline policy expansion cannot grant DynamoDB, S3 business data, Cognito Admin, AppSync, KMS, IAM, CloudFormation, payments, Twitch, other-domain or production access. Lambda trust remains `lambda.amazonaws.com` only. The proof requires no business-service runtime access.

Keeping the boundary in the product root would let the product lifecycle own its own privilege ceiling and complicate initial dependency order. The security stack must complete before the product change set is prepared. This proposal creates no boundary in AWS.

## 3. API Gateway v2 findings and seven patterns

Official [API Gateway v2 authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigatewayv2.html), [tag support and inheritance](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-tagging-supported-resources.html), and preserved [machine-readable authorization metadata](phase2a-tournament-boundary-v2-evidence-2026-09-26/apigateway-service-reference.json).

API creation authorizes `apigateway:POST` on `/apis`; children use their parent API ID in paths such as `/apis/{id}/routes`. API management ARNs have a region but no account field. Credentials establish account identity; region checks remain explicit. CRUD actions are GET/POST/PATCH/DELETE; some alternative operations use PUT. The exact candidate does not import OpenAPI, create VPC links or pass an integration/authorizer credentials role, so those capabilities are excluded. A provider-schema label `apigateway:TagResource` is not used as a literal IAM action: the service authorization table maps that operation to HTTP-method IAM actions.

| Pattern | Finding and decision |
| --- | --- |
| 1. Name/path scope | Exact API name conditions can constrain API creation. Child paths require the generated API ID; name does not substitute for it. |
| 2. Tag-on-create | Require Project=ProjectRespawn, Domain=Tournaments and Environment=Ntgre on CreateApi. These tags are in the revised local template. |
| 3. RequestTag + ResourceTag | Useful for API-root creation and management; not accepted as proof of inherited ownership for every HTTP API child. |
| 4. Deny missing ownership tag | Applying this to all children can deny legitimate first creation. A synthetic simulator context cannot establish that AWS supplies inherited tags. Rejected as sole protection. |
| 5. Separate API bootstrap | Produces an ID, but creates product-resource ownership/import/lifecycle work outside the current root. Not chosen; security bootstrap should not own the product API. |
| 6. One-time exception | Draft uses a fixed expiry, exact pinned template, required root name/tags, four child collections and explicit denial of every inventoried API. Residual first-create scope is acknowledged below. |
| 7. Bootstrap/normal split | Same CFN execution-role ARN, security-owned policy changed from temporary first-create scope to exact verified API ID. The ordinary identity never retains unknown-ID child grants. |

Perfect pre-create scoping of all children to an unknown generated ID is **not proven**. The service metadata lists ResourceTag on some child resource types, but the tagging documentation limits its inheritance description to API Gateway v1. This proposal does not infer v2 inheritance from that metadata alone.

The bootstrap policy denies all 13 APIs observed in [existing API inventory](phase2a-tournament-boundary-v2-evidence-2026-09-26/existing-apis.json), including Ntgre LegacyPlatform, staging, production and other sandboxes. Its temporary child scope is `/apis/*/{authorizers,integrations,routes,stages}` and descendants in eu-north-1. It expires at `2026-09-27T23:59:00Z`; this is a draft review window, not authority to run before that time. Refreshing it requires an explicit reviewed revision.

**Residual exception:** an unrelated new API created after inventory could match those child grants during the bootstrap window. Exact reviewed template content, no template parameters selecting another API, a security-controlled artifact, the inventory denies, short duration and an account API-creation freeze reduce exposure; they do not make the wildcard an ownership condition. This exception must be explicitly accepted before first creation. IAM simulations show the controls work for their supplied context, not that concurrency is controlled in AWS.

Steady state permits only the verified API ARN and four child collections. It has no POST `/apis` grant and cannot silently replace the API. The simulation value `tournamentfixture` is explicitly fictional and must never be deployed. `steady.template.json` requires a real 10-character ID verified against the product stack, name and ownership tags. Replacement requires a new reviewed bootstrap path.

## 4. New blocking prerequisite: HTTP access-log activation

The preserved candidate includes `DefaultStage.AccessLogSettings` targeting its explicit `/project-respawn/Ntgre/tournaments/http` log group. AWS documents additional permissions for activating HTTP API access logs, distinct from Lambda writing its own logs. [HTTP API logging setup](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html).

`logs:CreateLogDelivery` and `logs:PutResourcePolicy` have no resource-level scope or service-specific ownership condition in the retrieved Logs authorization metadata. The proposed execution policy deliberately does not allow either. Both required first-activation positives return `implicitDeny`. The metadata read `logs:DescribeResourcePolicies` was added and passes. [Logs authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html).

The read-only account-level [existing resource-policy inventory](phase2a-tournament-boundary-v2-evidence-2026-09-26/existing-log-resource-policies.json) is empty. This is not a scan of resource-scoped policies on every existing log group. The new Tournament group does not exist, and no pre-existing delivery coverage for it has been established.

AWS's general delivery documentation describes resource-policy setup and a reduced CreateLogDelivery permission requirement when delivery is already established for the destination. Pre-provisioning a narrow delivery resource policy could move PutResourcePolicy to a security owner, but does not itself remove the documented CreateLogDelivery requirement. The ordinary product role must not receive account-wide policy mutation just to clear a positive test. [CloudWatch delivery setup](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-infrastructure-CWL.html).

Alternatives evaluated:

1. Pre-provision a policy permitting `delivery.logs.amazonaws.com` to write only the future HTTP group's streams, restricted by SourceAccount and the documented Logs SourceArn shape. This may remove automatic policy creation from the product path but still needs delivery activation. Not added as a sixth bootstrap resource without a complete path.
2. Global CalledVia/SourceArn conditions on delivery permissions: no claim of safety without evidence that this specific API Gateway workflow supplies the necessary context. A custom simulation can manufacture those keys and is insufficient proof.
3. Account-wide temporary delivery/policy mutation: would be a separate exception beyond the described API-child exception, affecting existing delivery configuration. No such grant is present in this proposal.
4. Disable or defer stage access logging: changes the reviewed proof and observability behavior; not performed silently. A separately reviewed first-create/activation split would need its own candidate, ownership controls and tests.

Consequently, all-positive readiness is not met. The next design decision must resolve this delivery bootstrap path or explicitly review a narrower revised observability/deployment sequence. No AWS bootstrap authorization should be requested against this incomplete policy set.

## 5. Exact policies and trust relationships

All proposed JSON documents are under [infrastructure/security/tournaments-Ntgre-boundary-v2](../../infrastructure/security/tournaments-Ntgre-boundary-v2/). The [local generator](phase2a-tournament-boundary-v2-evidence-2026-09-26/build-proposal.mjs) has no AWS calls.

| Document | Role |
| --- | --- |
| `deployment-policy.json` | Own-root change-set workflow, pinned template URL, exact execution PassRole; also the deployment permissions boundary |
| `execution-bootstrap-policy.json` | Scoped product operations plus the explicit expiring API exception; also the execution permissions boundary |
| `execution-steady-fixture-policy.json` | Simulation-only exact-ID version; never deploy the fixture ID |
| `runtime-boundary.json` | Maximum runtime permissions: own preview log writes only |
| `deployment-trust.json` | Exact RavenTest user may assume the proposed deployment role |
| `execution-trust.json` | CloudFormation service may assume the execution role |
| `runtime-trust.json` | Extracted product Lambda trust |
| `runtime-identity-policy.json` | Extracted own-group inline log policy with the known group ARN substituted for GetAtt |
| `bootstrap.template.json` | Five-resource security-root draft marked BLOCKED |
| `steady.template.json` | Same five security resources; replaces execution maximum with verified-ID policy |

The security root owns two roles and three managed policies. Each deployment/execution policy is attached both as a grant and as that role's permissions boundary. The domain roles cannot modify these policies. Finite Allow lists in the boundaries reject unlisted actions even if an additional identity policy later grants them. Negative tests explicitly exercise this with a simulated broad identity policy; no broad managed policy is attached or proposed.

Compact managed-policy lengths: deployment 3,871; execution-bootstrap 5,267; execution-steady 4,085; runtime 532 characters. All are below 6,144.

Deployment PassRole is only `ProjectRespawn-Tournaments-Ntgre-CfnExecution` to CloudFormation. Its change-set preparation requires the exact new content-addressed template URL; direct stack create/update/delete is denied. It cannot write artifact objects. Execution can read only the exact template/code objects and CDK bootstrap version parameter, manage named Tournament Lambda/role/logs/alarms, and use the API phase scope above. Existing business S3 writes and all protected services are denied by the boundaries.

The execution trust does not invent a SourceArn condition for ordinary CloudFormation role assumption. CloudFormation retains its service-role association for future operations; lock-down updates the security-owned policy while preserving the ARN. Do not delete an associated execution role merely to remove temporary permissions. [CloudFormation service-role behavior](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html).

## 6. IAM matrix and Access Analyzer

[Test runner](phase2a-tournament-boundary-v2-evidence-2026-09-26/test-policies.mjs) and [complete requests/responses](phase2a-tournament-boundary-v2-evidence-2026-09-26/iam-simulation-results.json).

| Check | Result |
| --- | --- |
| Required-positive matrix | **186/188 PASS** |
| Negative matrix | **131/131 PASS** |
| Unexplained denials | 0 |
| Explained missing permissions | CreateLogDelivery; PutResourcePolicy |
| Access Analyzer | 8/8 documents validated; zero ERROR, WARNING, SECURITY_WARNING or SUGGESTION findings |

Positive coverage includes scoped CloudFormation change-set inspection/execution, exact PassRole chains, Lambda lifecycle and permission management, IAM role/inline policy operations with the required boundary, both log groups, both alarms, exact artifact reads, API child CRUD, root management, expiry context, and runtime stream writes. The tests enumerate operations independently of the policy statements, using the prior provider schemas and exact candidate properties. This is an authorization matrix, not proof of a live deployment or an exhaustive service-call trace. Broad provider permissions for absent optional properties (OpenAPI imports, managed runtime policies, boundary replacement, credentials-role integrations) were not granted just because a schema lists them.

Negative coverage includes LegacyPlatform/production/arbitrary CloudFormation, wrong PassRole, Cognito, AppSync, DynamoDB, existing S3 writes, KMS, unrelated Lambda/IAM/logs/alarms, runtime privilege escalation, boundary changes, missing/wrong runtime boundary, wrong template/role context, wrong region, all 13 inventoried APIs during bootstrap, expiration, and arbitrary API mutation after lock-down.

[Access Analyzer evidence](phase2a-tournament-boundary-v2-evidence-2026-09-26/access-analyzer-validation.json) covers every distinct identity/boundary/trust document. Bootstrap/steady stack policy documents are the same reviewed documents; the steady parameter substitution must be revalidated with the real ID later. Policy syntax success is not operational readiness.

## 7. Proposed sequence and rollback — not executable while blocked

The following defines ordering and gates. It is not an approved or complete deployment runbook; step A must resolve the stated gap before any write command is appropriate.

**A. Complete the logging design and review.** Establish the access-log activation principal, exact permissions, delivery resource-policy ownership and cleanup behavior. Revalidate every changed document and rerun all positive/negative cases. All required positives must pass. If an extra security resource is necessary, revise the bootstrap count explicitly. Refresh the API inventory, expiry, account identity, organization-policy visibility and candidate hashes before presenting an authorization gate.

**B. Security bootstrap, only after separate authorization.** Use a separately authorized security principal to prepare and inspect `ProjectRespawn-Tournaments-Ntgre-SecurityBootstrap` from the reviewed security template. Confirm only approved security resources, no product API/log groups and no changes to shared bootstrap roles. Execute with rollback enabled only when authorized. Managed policies are created before the two roles through their Ref dependencies. Confirm the runtime boundary exists before product creation.

**C. Publish only reviewed artifacts, only when separately authorized.** An authorized publisher stages the preserved template and unchanged code asset to their content-addressed keys in the existing CDK asset bucket and verifies hashes. The product deployment/execution identities have no S3 write grant. Do not substitute the shared broadly privileged CDK deployment/CloudFormation roles. Pin the S3 artifact content against changes by that publisher for the deployment window.

**D. First product create, separate gate.** Assume the restricted Tournament deployment role; create only the Tournament product change set, using the preserved template URL and exact execution-role ARN. Inspect the full AWS-generated changes, 12 additions, no existing-resource updates/deletions, runtime boundary attachment and the Lambda/API/log/alarm scopes. The logging prerequisite from A must already be resolved. Stop for product-execution authorization. Use rollback-enabled execution when explicitly authorized. Enforce the reviewed API-creation freeze during the temporary interval and leave enough time for rollback before expiry.

**E. Immediate security lock-down.** After successful creation, read the product `ApiId` output and independently verify its CloudFormation physical resource identity, name, account/region context and tags. Render `steady.template.json` with that real ID; never use the fixture policy. Through the separately authorized security owner, inspect and apply the policy-only security-stack update. Verify the default execution policy version contains only the literal own API ID and no unknown-ID child grants or CreateApi grant. The execution role ARN remains unchanged. Remove obsolete nondefault policy versions containing the temporary grants as reviewed cleanup, and verify they cannot be selected by any domain identity. Do not allow routine releases until these checks pass.

**F. Revalidate and hand off.** Re-run the steady matrix against the rendered policies and check live role attachments/boundaries. Confirm unrelated APIs and all protected services remain denied, then perform read-only resource/baseline checks and authorized product smoke tests. Record the live API binding, service-role ARN and artifact hashes. Each future release requires review of its own content-addressed artifacts; API replacement or logging configuration changes cannot reuse the initial exception silently.

Rollback/removal rules:

- Failure before the security stack exists: no product action; no existing-resource cleanup.
- Partial security creation with no product: allow CloudFormation rollback, then inspect only newly created security resources. Do not delete any pre-existing role or policy with a colliding name.
- Product create failure: retain required execution permissions until rollback finishes. Expiry may intentionally block cleanup; do not automatically extend it or switch to an administrator execution role. A security operator must review the failed events and grant only the necessary time-limited rollback actions in a separately authorized revision.
- Failure during lock-down: freeze domain deployments; keep the execution role associated with the product. Inspect the actual default policy version before deciding whether to reapply strict policy or finish product cleanup. Do not roll back to unknown-ID grants as a routine update.
- Product still exists: preserve its attached runtime boundary and associated execution role. Removing those first would break both runtime authorization and future CloudFormation operations. Product removal, if later explicitly authorized, must complete before security-role/boundary removal. Preserve log evidence according to the reviewed cleanup decision.
- No rollback step may target LegacyPlatform, Cognito, production, shared CDK roles, or unrelated APIs. No rollback/removal action has been executed in this task.

## 8. Refreshed LegacyPlatform baseline

[Before](phase2a-tournament-boundary-v2-evidence-2026-09-26/legacy-before.json) and [after](phase2a-tournament-boundary-v2-evidence-2026-09-26/legacy-after.json) were obtained through the allowlisted read-only verifier.

| Item | Result |
| --- | --- |
| Root | `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` |
| Status | UPDATE_COMPLETE |
| Total resources | 2,621 |
| FunctionDirectiveStack | 167 |
| Root LastUpdatedTime | `2026-09-26T11:52:06.391000+00:00`, unchanged |
| Stack/template identities | 62, unchanged |
| Protected stateful resource identities | 62, unchanged |
| Monitored Lambda code/configuration hashes | 5, unchanged |
| Existing Cognito pool/client and local outputs hash | unchanged |
| Before/after equality | true |

## Final gate

The local runtime boundary and API phase separation are concrete and reviewable. The original unexplained simulator denial is resolved without widening runtime access. The full first-deployment authorization path still lacks a safe HTTP access-log delivery setup. All 188 required positives must pass before readiness can be declared; the two known failures must not be relabeled as successful negative tests.

AWS writes: **0**. Tournament deployed: **NO**. Production modified: **NO**.

Next action: resolve and review the access-log delivery bootstrap design, refresh the policy evidence and then present a new security-bootstrap authorization gate. This report does not request or imply permission to deploy.

**PHASE 2A SECURITY BOUNDARY REMAINS BLOCKED**
