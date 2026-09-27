# Phase 2A — first independent Tournament deployment

26 September 2026. **Release 1 was stopped at preflight. No deployment was attempted and no AWS write occurred.** This is a failed execution gate, not a CloudFormation creation/rollback failure.

## Blocking permission review

The user authorized deployment only after all gates passed, using the exact preserved candidate and the authoritative Phase 2 plan/readiness evidence. The [Phase 2 plan](phase2-domain-decomposition-plan.md) requires: “A product deploy role must not be able to update LegacyPlatform or production roots.” Its first-deployment sequence also says: “Target permissions must exclude existing roots.” The [implementation readiness report](phase2a-tournament-independent-root-readiness-2026-09-26.md) explicitly leaves review of permissions excluding LegacyPlatform/production as a deployment prerequisite.

Live read-only inspection found:

| Role referenced by the preserved assembly | Observed permission |
| --- | --- |
| `cdk-hnb659fds-deploy-role-058264289478-eu-north-1` | Inline policy permits CloudFormation create/update/change-set/execute/delete operations against `Resource: "*"`; passes the shared execution role |
| `cdk-hnb659fds-cfn-exec-role-058264289478-eu-north-1` | Attached AWS `AdministratorAccess` policy, `Action: "*"`, `Resource: "*"` |
| `cdk-hnb659fds-file-publishing-role-058264289478-eu-north-1` | Shared bootstrap bucket/object publishing permissions, not limited to this Tournament artifact |

Neither the deploy nor execution role has a permissions boundary in `GetRole`. No role-level exclusion for LegacyPlatform or production was found. These permissions do not establish the required Tournament-only deployment boundary. No claim is made about uninspected organization-wide controls; they were not relied on to satisfy the gate.

[Complete role/policy evidence](phase2a-tournament-first-deployment-evidence-2026-09-26/bootstrap-role-review.json).

The task stopped before publishing assets, creating a change set or invoking CloudFormation deployment. No shared role was modified, new deployment role created, candidate changed, caller substituted or broad-role fallback used. Preparing a restricted deployment path would require a separately reviewed scope; it was not silently added to this 12-resource release.

A secondary tooling mismatch was also found: the pinned package includes CDK CLI `2.1137.0`, whereas the preserved assembly declares `minimumCliVersion: 2.1143.0`. That CLI was not used to deploy. This is not a changed assembly or runtime-template defect; a compatible, separately reviewed deployment driver could consume the unchanged artifact after the permission gate is resolved. No package/lock upgrade or fresh synthesis occurred.

## Candidate verification

Worktree: `.codex-worktrees/phase2a-tournaments-20260926`.

Candidate revision: `ea2eb10eca11b58fdd8713e322c3c00c3402c8a9a4bbd789af240b9950221f1f`.

Preserved assembly: `docs/architecture/phase2a-tournament-evidence-2026-09-26/pinned-build/assembly`.

Template SHA-256: `c3bd3b863541ece554592b9d68df2c4b9d9ea512ddc94e3622554babf4309f6c`.

Receipt SHA-256: `6230fb03a4617811da652f4de0c0d28ecd531061cdf7ddb2869cc13fa52e004b`.

All 43 preserved files, 24 candidate source/build/config inputs, generated files and 272 loaded app/library file hashes matched the recorded evidence. The candidate verifier also checked the source-file set, target and exact Core identity pin. No HEAD substitution or synthesis occurred. [Verification record](phase2a-tournament-first-deployment-evidence-2026-09-26/candidate-verification.json).

The actual runtime/infrastructure closure remains the reviewed five Tournament files: preview handler, contract, fixture, app and stack. It excludes Amplify/LegacyPlatform, shared schema and other product-domain implementation. No bundling, schema generation or other product processing was run during this task.

## Target and identity

AWS account: `058264289478`. Region: `eu-north-1`. AWS caller: `arn:aws:iam::058264289478:user/RavenTest`.

Target: `ProjectRespawn-Tournaments-Ntgre`; [live DescribeStacks check](phase2a-tournament-first-deployment-evidence-2026-09-26/target-absence.json) confirmed it does not exist. It was not adopted, created, updated or deleted. Existing bootstrap version is 30; no bootstrap operation was run.

The existing Ntgre pool/client were rechecked read-only: pool `eu-north-1_n24iLL7QE`, client `1iq7ovjaf7d16imdvbqgfgvf86`, issuer `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE`. The verified Core contract and source outputs provenance remain unchanged. No users, groups, clients or pools were modified. No tokens were requested, extracted, logged or used because deployment stopped before authentication testing.

## Proposed resources — not created

| Logical ID | Type |
| --- | --- |
| HttpApi | AWS::ApiGatewayV2::Api |
| DefaultStage | AWS::ApiGatewayV2::Stage |
| JwtAuthorizer | AWS::ApiGatewayV2::Authorizer |
| PreviewIntegration | AWS::ApiGatewayV2::Integration |
| PreviewRoute | AWS::ApiGatewayV2::Route |
| PreviewFunction | AWS::Lambda::Function |
| PreviewRole | AWS::IAM::Role |
| HttpInvoke | AWS::Lambda::Permission |
| PreviewLogs | AWS::Logs::LogGroup |
| AccessLogs | AWS::Logs::LogGroup |
| PreviewErrors | AWS::CloudWatch::Alarm |
| HttpErrors | AWS::CloudWatch::Alarm |

The pinned local template still contains exactly 12 proposed resources, including one runtime role with an inline log-only policy. That runtime role is separate from the broad pre-existing deployment/execution roles that blocked this gate. There are no proposed business-state, Cognito, AppSync, DynamoDB, S3 or KMS resources. This is a local template assessment; no AWS-generated plan was prepared or approved.

## Execution gate

```text
PHASE 2A FIRST DEPLOYMENT EXECUTION GATE
AWS account: 058264289478
AWS identity: arn:aws:iam::058264289478:user/RavenTest
Region: eu-north-1
Tournament stack: ProjectRespawn-Tournaments-Ntgre
Tournament currently exists: NO
Candidate revision: ea2eb10eca11b58fdd8713e322c3c00c3402c8a9a4bbd789af240b9950221f1f
Pinned assembly verified: YES
New resources: 12 proposed locally; AWS plan not prepared
Modifications to existing resources: 0 proposed
Deletions: 0 proposed
Replacements: 0 proposed
HTTP API: 1
Stage: 1
JWT authorizer: 1
Integration/routes: 2
Lambda: 1
IAM: 1 runtime role
Log groups: 2
Alarms: 2
Invoke permission: 1
Other: 0
Business-state resources: 0
AppSync: 0
DynamoDB: 0
S3: 0
KMS: 0
Cognito: 0
LegacyPlatform resources: 2621
FunctionDirectiveStack: 167
LegacyPlatform timestamp: 2026-09-26T11:52:06.391000+00:00
LegacyPlatform plan/change set generated: NO
LegacyPlatform modification proposed: NO
Production target: NO
NOT READY
```

## Deployment, authentication and application results

Resources created: **0**. Stack ARN and live endpoint: **none**. Deployment events, creation order, failures and rollback events: **not applicable — no deployment attempted**. Rollback remains a requirement for any future execution; there is no Tournament stack rollback setting to report now.

No-token, invalid/expired-token, wrong issuer/client and valid Ntgre JWT tests were **not run** because no live endpoint exists. No fixture response was claimed from AWS. The existing endpoint manifest remains `PLANNED_NOT_DEPLOYED`, with null endpoint/stack ARN; no deployed manifest was invented. `amplify_outputs.json`, global Amplify configuration, frontend pages and `amplify.yml` were unchanged by this task.

Post-deployment Tournament/resource-accounting/isolation/contract tests and `npm run dev` were not rerun: deployment was blocked and the user required stopping after evidence collection. Prior implementation test results remain recorded in the readiness report; they are not presented as live-release validation. No running frontend server was stopped or changed.

No new runtime logs, alarm metrics, deployment duration or runtime cost observations exist. Only read-only preflight/evidence collection occurred. Release 2 and the rollback proof were not attempted.

## Legacy protection evidence

The fresh [before baseline](phase2a-tournament-first-deployment-evidence-2026-09-26/legacy-before.json) completed at `2026-09-26T13:45:08.010Z`: 2,621 resources, FunctionDirectiveStack 167, root `UPDATE_COMPLETE`, root timestamp `2026-09-26T11:52:06.391000+00:00`, all 62 stack template/resource identities matching the approved inventory, all 62 protected resources present, and five monitored Lambda code/configuration hashes unchanged. Identity configuration and original outputs hash match the preserved Core contract.

The final read-only comparison is recorded in [after baseline](phase2a-tournament-first-deployment-evidence-2026-09-26/legacy-after.json): **`beforeAfterEqual:true`**. Resource counts remain **2,621 / 167**, root status remains `UPDATE_COMPLETE`, all 62 stack templates/resource identity hashes and all 62 protected resources remain unchanged, all five Lambda code/configuration hashes match, and the root timestamp is unchanged. The [final target check](phase2a-tournament-first-deployment-evidence-2026-09-26/target-final.json) also confirms the Tournament root remains absent. No LegacyPlatform synthesis, diff, change set, deployment, unrelated Lambda bundling or schema generation was performed. This is a read-only template/identity comparison, not a CloudFormation drift-detection operation. Machine-readable outcome and check timings: [final gate](phase2a-tournament-first-deployment-evidence-2026-09-26/final-gate.json).

Production was not targeted or modified. AWS write count: **0**.

## Remaining work

Resolve the deployment-permission and compatible-driver prerequisites through a reviewed authorization before retrying release 1. Preserve the current candidate; do not modify shared bootstrap roles or add support infrastructure under the original 12-resource authorization. Then repeat the first-release gates, including AWS change-set review, rollback-enabled creation, valid JWT verification and unchanged Legacy evidence.

After a successful release 1, Phase 2A still requires:

- A second Tournament-only release.
- Independent rollback to release 1, with LegacyPlatform untouched throughout.

**PHASE 2A RELEASE 1 FAILED**
