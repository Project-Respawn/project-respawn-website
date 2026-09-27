# Phase 2A Tournament deployment boundary

26 September 2026. **CLI prerequisite resolved locally. Restricted-role bootstrap remains blocked. No AWS roles, policies, stacks, assets or change sets were created or modified.**

The scope was local tooling correction, IAM design/policy simulation and read-only preflight. The approved Tournament application was preserved. This report does not authorize bootstrap or deployment.

## Toolchain correction

Original candidate: `.codex-worktrees/phase2a-tournaments-20260926`, revision `ea2eb10eca11b58fdd8713e322c3c00c3402c8a9a4bbd789af240b9950221f1f`.

Separate tooling worktree: `.codex-worktrees/phase2a-tournament-boundary-20260926`, copied from the 24 hash-verified preserved source inputs on base commit `9cacb3bdc53ad2511ef1c8baa6dd1f4dfa71a633`. No unrelated dirty files were copied.

| Component | Before | After |
| --- | --- | --- |
| CDK library generating assembly | 2.260.0 | 2.260.0 |
| Assembly minimum CLI | 2.1143.0 | 2.1143.0 |
| Domain-local CDK CLI | 2.1137.0 | **2.1143.0** |
| Other package versions | Existing isolated lock | Unchanged |

Root cause: the isolated package independently pinned an older CLI alongside CDK library 2.260.0. The library does not depend on/install a matching `aws-cdk` CLI. The original plan called the library's `App.synth()` directly; it did not exercise CLI assembly compatibility. Therefore local synthesis succeeded while the unused CLI remained below the emitted `minimumCliVersion`. This was a missing compatibility check, not a LegacyPlatform dependency.

The only semantic package change is `devDependencies.aws-cdk`. Lockfile differences are that same root pin and the CLI package's version, registry URL and integrity hash. No other dependency changed. A clean `npm ci --ignore-scripts --no-audit --no-fund` installed the new isolated lock. TypeScript and Tournament-only build/synthesis passed. Explicitly invoking `node node_modules/aws-cdk/bin/cdk list --app .build/assembly --no-notices --no-telemetry` succeeded and listed only `ProjectRespawn-Tournaments-Ntgre`; no global CLI or fresh app invocation was used for that check.

[Machine-readable toolchain comparison](phase2a-tournament-boundary-evidence-2026-09-26/toolchain-comparison.json).

### Candidate and template comparison

Tooling-validation revision: `87883c9aab0dbed19719a7656dda5be92dbabf12f1ff173c06a5bc68f1844245`.

Original template SHA-256: `c3bd3b863541ece554592b9d68df2c4b9d9ea512ddc94e3622554babf4309f6c`.

Tooling-validation template SHA-256: `1520cc23363f9095a8a149b94cf1047a536fdd05c691d1f7f6ebc4af1090c103`.

The templates are **not byte-identical**. Exactly two values changed because the source-manifest revision includes the package/lock files:

- `Resources.PreviewFunction.Properties.Environment.Variables.BUILD_REVISION`.
- `Outputs.DeploymentRevision.Value`.

Both contain the tooling-validation revision above. The generated Lambda zip source bytes are identical; all non-toolchain source files are identical. Resource IDs, types, IAM policy, API/JWT configuration, code asset key and infrastructure scope are unchanged: **12 resources**. This is a revision-marker change, not an accepted material infrastructure change. The comparison script fails on any other template difference. The new validation assembly is preserved separately and is **not silently promoted** as the approved release artifact. The original candidate/assembly remain untouched.

The IAM proposal's approved TemplateUrl remains pinned to the original template hash. Choosing the corrected-marker template for a future release requires an explicit artifact pin review. Using the compatible CLI to read the original assembly does not require regenerating it.

## Security model and exact local artifacts

Policies are in [the security planning directory](../../infrastructure/security/tournaments-Ntgre-proposal). They are **blocked proposals**, not installed policies or a usable deployment path.

| File | Purpose |
| --- | --- |
| [deployment-policy.json](../../infrastructure/security/tournaments-Ntgre-proposal/deployment-policy.json) | Tournament stack/change-set access and exact execution-role PassRole |
| [deployment-trust.json](../../infrastructure/security/tournaments-Ntgre-proposal/deployment-trust.json) | Trusts only the verified RavenTest IAM principal for initial manual assumption |
| [execution-policy.json](../../infrastructure/security/tournaments-Ntgre-proposal/execution-policy.json) | Scoped proposed resource operations; fails closed on unresolved API binding and unbounded runtime role |
| [execution-trust.json](../../infrastructure/security/tournaments-Ntgre-proposal/execution-trust.json) | CloudFormation service principal only |
| [runtime-boundary.json](../../infrastructure/security/tournaments-Ntgre-proposal/runtime-boundary.json) | Maximum runtime permissions: two log-writing actions in the preview log group |
| [bootstrap.template.json](../../infrastructure/security/tournaments-Ntgre-proposal/bootstrap.template.json) | Exact proposed five-resource IAM bootstrap, clearly marked BLOCKED |
| [api-binding-fragment.template.json](../../infrastructure/security/tournaments-Ntgre-proposal/api-binding-fragment.template.json) | Unattached post-binding API ARN policy fragment; not a deployable stack or permission to pre-create an API |
| [proposal-status.json](../../infrastructure/security/tournaments-Ntgre-proposal/proposal-status.json) | Target, role ARNs, artifact pins and unresolved compatibility decisions |

Proposed one-time bootstrap resources:

1. IAM role `ProjectRespawn-Tournaments-Ntgre-Deploy`.
2. IAM role `ProjectRespawn-Tournaments-Ntgre-CfnExecution`.
3. Customer-managed policy `ProjectRespawn-Tournaments-Ntgre-DeployBoundary`.
4. Customer-managed policy `ProjectRespawn-Tournaments-Ntgre-ExecutionBoundary`.
5. Customer-managed policy `ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary`.

The first two customer-managed policies would each be attached to their corresponding role as both an identity policy and its permissions boundary. Neither domain role can edit these policies. They contain no AdministratorAccess or broad AWS managed policy attachment. The execution policy is 5,889 compact JSON characters, within the 6,144-character managed-policy limit. The runtime boundary is proposed for the future runtime-role property; it is not presently attached by the approved application.

Bootstrap is separate from the 12-resource application root. It would add five IAM resources, **not** change the application resource count to 17. No future Team Hub/Creator/Commerce/etc. roles were produced.

## Deployment/change-set role

Proposed ARN: `arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-Deploy`.

CloudFormation resource scope is exactly:

`arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre/*`

The UUID suffix is unknown until creation; the stack name, account and region are fixed. An explicit `Deny` with `NotResource` excludes every other stack. Region conditions reject non-eu-north-1 CloudFormation requests. Direct `CreateStack`, `UpdateStack`, `DeleteStack`, StackSets, imports, resource refactors and IAM mutation are not allowed; normal application updates must use change sets.

`CreateChangeSet` requires the exact dedicated execution-role ARN, the pinned original template URL and `ntgre-tournaments-*` change-set name. Execute/DeleteChangeSet are restricted to the same stack and name namespace. Read operations are restricted to that stack. IAM enforces these restrictions independently of local script checks.

PassRole permits only:

`arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-CfnExecution`

and only when `iam:PassedToService` is `cloudformation.amazonaws.com`. Other roles/services are explicitly denied. The deployment role has no resource provisioning permissions. It may read only the approved template object and existing bootstrap-version parameter; it cannot publish or overwrite artifacts.

The initial trust permits `arn:aws:iam::058264289478:user/RavenTest` to assume this restricted role. This does not revoke the user's separate original permissions. A future runner must verify its assumed-role identity and stop if assumption fails; it must never fall back to the user's broad credentials or the shared CDK bootstrap roles. Future CI trust must be separately constrained to its workload identity/repository/environment.

## CloudFormation execution role

Proposed ARN: `arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-CfnExecution`.

Its trust policy permits only `cloudformation.amazonaws.com`. It does not permit direct human assumption. AWS documentation for ordinary CloudFormation service roles does not establish the SourceArn context assumed by many extension/StackSets examples; this proposal does not invent a stack-ARN trust condition. Stack isolation is enforced through deployment-role CloudFormation/PassRole permissions and execution resource permissions. Other administrators with authority over IAM remain outside this delegated-role threat model. See [AWS CloudFormation service roles](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html).

| Resource/action category | Proposed limit |
| --- | --- |
| Lambda create/read/update/delete/tag/permission | `arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Tournaments-Ntgre-PreviewFunction-*` |
| Runtime-role management | Only `arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-PreviewRole-*`; CreateRole/PutRolePolicy require the exact runtime boundary |
| Runtime PassRole | Only that runtime-role namespace, only to Lambda |
| Logs | Exact `/project-respawn/Ntgre/tournaments/preview` and `/project-respawn/Ntgre/tournaments/http` groups, with ARN variants required for resource/tag operations |
| Log metadata discovery | `logs:DescribeLogGroups` needs `Resource:*`; this is read-only metadata, not mutation permission |
| Alarms | Exact stack/logical-ID prefixes for PreviewErrors and HttpErrors |
| API Gateway | **Denied pending a safe first-create/API-ID binding design**; no `/apis/*` mutation wildcard |
| Artifacts | Read-only access to the original approved template object and exact reviewed Lambda zip key in the existing bootstrap bucket |
| SSM | Read-only existing `/cdk-bootstrap/hnb659fds/version` parameter |
| Cognito, AppSync, DynamoDB, KMS, secrets, EC2/ECS, EventBridge, Firehose | Explicitly denied |
| S3 mutations/business data | Denied; exact artifact reads are the only S3 exception |
| Boundary/managed-policy changes | Explicitly denied |

Names constrain a namespace, not a universal proof of CloudFormation ownership. Before future bootstrap/deployment, verify the namespace has no pre-existing or unrelated resources and inspect generated physical naming. Do not widen an ARN prefix after a denied create merely to make deployment pass. No `Environment`/`Domain` tag is treated as a security boundary unless that service/action demonstrably supplies the tag context.

[Live read-only resource-provider schemas and permission inventory](phase2a-tournament-boundary-evidence-2026-09-26/provider-permissions.json) were collected for all 10 resource types. Provider permission lists cover optional features too; they are not a least-privilege policy to copy wholesale. For example, provider-wide EC2/KMS/EFS permissions are unnecessary for this no-VPC/no-KMS/no-EFS Lambda. They were not granted. Logging delivery may require additional permissions depending on service behavior; no account-wide `logs:PutResourcePolicy` grant was added without proof and review.

## Why the unchanged application is not yet compatible

**Runtime privilege delegation:** the reviewed `PreviewRole` has inline policies but no `PermissionsBoundary`. Allowing an execution role to write arbitrary inline policies merely under a name prefix can let it delegate permissions it does not itself possess. The reusable design therefore constrains both role creation and policy updates to a runtime permissions boundary. AWS documents this delegation model in [permissions boundaries](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html).

IAM simulation confirms the exact problem: creation with the approved boundary is allowed; creation without it is explicitly denied. The original application would take the latter path. Attaching the proposed boundary requires a reviewed `PermissionsBoundary` property change, not just creating bootstrap roles. No such application change was made. A release-specific immutable-template strategy is a different security model; it must not be presented as equivalent to unrestricted future template delegation.

**First-create API ownership:** HTTP API IDs are generated by API Gateway. The approved root does not exist, so an exact API ARN is not available before first creation. The policy must then manage integrations, authorizers, routes and stage resources. AWS's tagging documentation lists directly taggable V2 resources and describes child tag inheritance for V1; it does not provide sufficient evidence here to claim a V2 route/integration condition inherits the parent API's tags. See [taggable API Gateway resources](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-tagging-supported-resources.html).

The proposal does not grant broad access to other HTTP APIs or falsely assert that a local domain tag cures the problem. Its current API deny is intentional, and the exact-ID fragment is unattached. This protects other roots but prevents deployment. A reviewed first-create ownership mechanism is required; pre-creating/adopting an API, staging a different application template, or adding a privileged broker/hook would change the approved procedure/scope and was not performed. A verified service-supported ownership condition could be evaluated instead, but synthetic simulator context is not evidence that API Gateway supplies it.

**Unresolved positive logging simulation:** `logs:PutLogEvents` on the intended preview stream returned `implicitDeny`. The same result occurred with a minimal exact-resource Allow policy and without the proposed boundary. The cause has not been established; this is not presented as a confirmed runtime policy defect or an AWS defect. [Minimal reproduction input](phase2a-tournament-boundary-evidence-2026-09-26/minimal-logging-probe.json) and [result](phase2a-tournament-boundary-evidence-2026-09-26/minimal-logging-probe-result.json) are preserved. No broad grant or live write was used to bypass the result.

## Security and implementation validation

AWS Access Analyzer ValidatePolicy returned **zero findings for all five identity/trust documents**. It did not create an analyzer or any IAM resource. [Validation evidence](phase2a-tournament-boundary-evidence-2026-09-26/access-analyzer-validation.json).

AWS SimulateCustomPolicy evaluated **57 cases: 56 passed expectations; 1 positive case failed**. All **46 negative cases passed**, and **10 of 11 positive cases passed**. [Complete requests/results](phase2a-tournament-boundary-evidence-2026-09-26/iam-simulation-results.json).

For both deployment and execution policies, tests denied:

- LegacyPlatform create/update and production create/update.
- Arbitrary, Commerce, Creator and Team Hub stack operations.
- Passing the shared bootstrap execution role.
- Cognito, AppSync, DynamoDB, existing business S3 and KMS mutation.
- Other-domain Lambda and API mutation.

Additional tests rejected wrong region, wrong template URL, missing TemplateUrl, wrong execution role/service, direct-stack-update bypass, boundary deletion, bootstrap-policy mutation, artifact overwrite and unbounded runtime-policy writes. Positive tests allowed own change-set preparation/execution/inspection, exact PassRole, scoped Lambda/log-group/alarm operations, bounded runtime-role creation and exact artifact reads. The runtime-boundary test blocked an AdministratorAccess-style inline grant from deleting a table. Its positive logging counterpart is the unresolved failure noted above.

The policy simulator does not perform the requested operations and can differ from live service authorization. Several tests use synthetic resource ARNs/context; they do not prove resources exist, trust policies are installed or services supply a particular condition key. See [AWS SimulateCustomPolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html). In particular, successful negative tests on an API-deny policy are not proof that first creation will work.

Local validation:

- [26/26 Tournament tests](phase2a-tournament-boundary-evidence-2026-09-26/tournament-tests.txt), including actual forbidden-import isolation tests.
- [24/24 resource-accounting tests](phase2a-tournament-boundary-evidence-2026-09-26/resource-accounting-tests.txt).
- TypeScript, runtime/client build and independent synthesis passed; exact resource count 12.
- Domain-local CLI compatibility check passed against the existing synthesized assembly.
- No LegacyPlatform synthesis, shared Amplify schema generation or unrelated Lambda bundling.
- No global CLI, root package upgrade, Amplify dependency change or hosted CI change.

The global infrastructure-CI validator was not run because its changed-input branch synthesizes LegacyPlatform, contradicting this task's explicit isolation boundary. No baseline/debt receipt was refreshed to bypass it.

## Refreshed Release 1 preflight

[Before](phase2a-tournament-boundary-evidence-2026-09-26/legacy-before.json) and [after](phase2a-tournament-boundary-evidence-2026-09-26/legacy-after.json) AWS read-only verification match: **2,621 resources, FunctionDirectiveStack 167, UPDATE_COMPLETE**, same root last-update timestamp `2026-09-26T11:52:06.391000+00:00`. All 62 template/resource identity hashes, all 62 protected resources, Core identity provenance and all five monitored Lambda code/configuration hashes are unchanged. The after check reports `beforeAfterEqual:true`.

[Final preflight](phase2a-tournament-boundary-evidence-2026-09-26/release1-preflight.json) confirms the Tournament root and both proposed domain roles do not exist. Account is `058264289478`, region `eu-north-1`; verification identity remains `arn:aws:iam::058264289478:user/RavenTest`. No application or role deployment was attempted.

Release 1 result: **NOT READY**. CLI compatibility now passes; AWS permission/bootstrap prerequisites do not.

## One-time bootstrap procedure — blocked, not executed

The exact policy/trust JSON is reviewable, but do not deploy the draft bootstrap as-is: it intentionally denies operations the approved application needs.

Once the open design decisions are separately authorized and resolved:

1. Approve the runtime-boundary integration and a proven HTTP API first-create binding model. Resolve the positive logging check and verify necessary log delivery permissions without opening account-wide mutation. Repeat positive and negative validation.
2. Freeze the final policies, trust documents, bootstrap template and chosen application/template/asset hashes. Confirm both proposed roles and policy names are absent and audit the resource namespaces. No existing shared bootstrap role or existing IAM policy should be edited.
3. Under a separately authorized security-bootstrap identity, create a change set for a distinct security stack, proposed `ProjectRespawn-Tournaments-Ntgre-DeploymentSecurity`. Review only the approved IAM additions. The current draft lists two roles and three customer-managed policies; any added support resource requires explicit review. Enable rollback and stop before execution unless that bootstrap execution is authorized.
4. After authorized creation, retrieve policies/trust/boundaries and compare exact documents. Simulate again using the real roles. Verify assumption, exact PassRole and cross-stack denial without making destructive calls.
5. Freeze the bootstrap evidence and hand normal deployments to the restricted role. Do not use the security administrator or broad bootstrap roles as an automatic fallback.

Artifact publication remains a separate permission: neither proposed domain role can overwrite the trusted template or Lambda zip. A narrowly authorized publisher must publish verified immutable artifacts, not grant arbitrary shared-bucket writes to the deploy role. Existing broad publishing/admin principals can still affect that bucket outside this delegated model; a stronger account-wide immutability mechanism needs its own review.

### Bootstrap rollback

Before any application uses the execution role, a failed security-stack creation should use CloudFormation's rollback. Review events and stop; do not repair shared IAM manually. If a successfully created security stack must later be withdrawn, separately authorize deletion of only its new roles/policies after checking they are unused. Never delete shared CDK roles or detach existing unrelated policies.

Once an application stack is associated with a service role, CloudFormation continues using it, including for rollback. Do not remove the execution role first and strand the application. A later bootstrap policy update should roll back to its preserved prior policy/trust documents. Teardown order or execution-role replacement needs a separate review; no teardown is authorized here.

## Resulting Release 1 procedure — after prerequisites pass

1. Verify the original or explicitly promoted candidate hashes, account/region, Cognito identity and unchanged Legacy baseline; confirm Tournament is absent.
2. Obtain restricted deployment-role credentials and verify their ARN. Publish only separately authorized pinned artifacts through the reviewed publication path.
3. Prepare the Tournament CREATE change set with the pinned TemplateUrl and **explicit dedicated execution RoleARN**, using a driver that does not default to shared bootstrap roles. The approved assembly's existing shared-role metadata must not be followed blindly. An AWS CLI request with the restricted role and explicit execution role can consume the template without resynthesis; a CDK driver must prove both role selections first.
4. Inspect all 12 additions, zero existing-resource changes and rollback configuration. Execute only under a new applicable authorization, then monitor terminal state. Stop after any failed create/rollback.
5. Run live JWT/preview verification, compose a genuine deployed domain manifest and recheck LegacyPlatform. Do not change frontend routing or Amplify outputs.

This task performs none of these AWS write steps. Release 2 and independent rollback remain subsequent proof work.

## Reuse for other domains

Reuse the two-role separation, fixed account/environment/stack ARN, exact PassRole, protected runtime boundary, artifact pinning, service-specific resource scopes and negative-test matrix. Each substantial product domain needs a reviewed ownership/naming model and an actual service-aware first-create strategy. Do not copy the unresolved API wildcard problem into future domains or create one role/root per webpage. No Team Hub, Creator, Commerce, Community, Intake or Investor role is created by this proposal.

**PHASE 2A PREREQUISITES REMAIN BLOCKED**
