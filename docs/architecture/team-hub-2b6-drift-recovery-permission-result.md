# Project Respawn Team Hub 2B6 — drift recovery permission result

9 October 2026. **DRIFT RECOVERY REMAINS BLOCKED.** Read-only inspection and offline preparation only. No AWS resource/configuration writes, change-set creation, IAM installation, Lambda patch, frontend activation or authority transition.

## Fresh drift and preservation

Account 058264289478, eu-north-1; inspecting identity RavenTest. Product/security remain UPDATE_COMPLETE, 48+7 resources. Read and Command are Active / Successful, with unchanged runtime SHA `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`. Desired Environment maps still contain all required values. Actual Read lacks CORE_ENVIRONMENT, CORE_CONTRACT_ARN, TEAM_HUB_BUSINESS_RUNTIME and TEAM_CURSOR_SECRET_ARN; Command lacks the first three. Both report MODIFIED with precisely those differences. [Fresh inspection](team-hub-drift-permissions-evidence-2026-10-09/inspection.json).

All 48 product resources received resource-level diagnostic requests: 40 IN_SYNC, two expected MODIFIED functions, three unsupported API Gateway integrations and three UNKNOWN log groups. No unrelated MODIFIED/DELETED resource was reported, but this is **not complete proof of absence of unrelated drift**. ParityCommandLogs, ParityReadLogs and ReadLogs each report `Access denied for operation 'logs:DescribeIndexPolicies'`. Integrations are ParityCommandIntegration, ParityReadIntegration and ReadIntegration. Do not silently classify UNKNOWN or unsupported as IN_SYNC. [Complete results](team-hub-drift-permissions-evidence-2026-10-09/stack-drift.json).

This is an additional blocker to whole-stack reconciliation. The denied Logs read needs its own precise principal/effective-policy review; no speculative log-policy administration or read grant has been added. Resource drift inspection refreshed diagnostic metadata only: 50 requests (two focused plus 48 full-stack), zero resource/configuration writes.

## Provider operation classification

| Operation | Classification for this candidate | Decision |
|---|---|---|
| lambda:GetFunction | Required resource read; already allowed | Preserve |
| lambda:UpdateFunctionConfiguration | Required environment repair lifecycle action; already allowed | Preserve |
| lambda:GetFunctionCodeSigningConfig | Read of an optional code-signing association; conditional provider discovery, exact REVERT_DRIFT invocation requirement unresolved | Do not grant merely from schema membership |
| lambda:GetFunctionScalingConfig | Conditional Lambda Managed Instances read; not applicable to the declared standard-function configuration | Exclude from proposed grant |

The live schema lists both disputed actions, but supplies no executable branching logic. Neither function's template declares CodeSigningConfigArn, CapacityProviderConfig or FunctionScalingConfig. The API documentation limits scaling configuration to Managed Instances and requires a published qualifier; that is not the requested environment repair. [Scaling API](https://docs.aws.amazon.com/lambda/latest/api/API_GetFunctionScalingConfig.html). Code-signing association discovery can be meaningful even when an association is absent, so absence of a template property alone does not prove that a provider never calls it. [Code-signing API](https://docs.aws.amazon.com/lambda/latest/api/API_GetFunctionCodeSigningConfig.html).

The documented IAM mappings classify both as read actions supporting function resources. If later evidence establishes a necessary code-signing read, its proposed scope must be exactly the existing ParityRead and ParityCommand function ARNs in account 058264289478/eu-north-1, in both identity policy and boundary as needed. That is a review criterion, not an approved Allow in this candidate. [AWS authorization mapping](https://docs.aws.amazon.com/service-authorization/latest/reference/list_lambda.html).

The completed CloudTrail query found no matching disputed-operation events from 14:55Z to its collection time. This is delivery/coverage-limited corroboration, not proof of a provider implementation or a guarantee for a future change set. The public Lambda provider implementation could not be obtained; no undocumented conditional behavior is asserted. [Audit](team-hub-drift-permissions-evidence-2026-10-09/provider-audit.json). Therefore the earlier assumption that both schema actions necessarily require new grants is withdrawn, but an execution-ready claim is not substituted for it.

## Minimum security and request binding

Prepared IAM semantic delta: **none**. Four installed role/boundary pairs still match the accepted pins, including execution KMS correction, runtime IAM, PassRole guards, domain/business-key denials and rollback artifact access. No broad Lambda, KMS, Cognito or administration grant was introduced. [Installed comparison](team-hub-drift-permissions-evidence-2026-10-09/installed-security-audit.json).

The offline request now uses `UsePreviousTemplate: true`, preserving the exact existing desired template rather than the prior whitespace-only repair. The current restricted caller requires cloudformation:TemplateUrl matching one of its two accepted URLs; this request has no TemplateUrl. Actual-role simulation returns implicitDeny. Do not remove this condition or switch to a more privileged caller. A future candidate must separately review binding the exact existing-desired template to an approved immutable URL (or another explicitly reviewed equally constrained mechanism). [Request check](team-hub-drift-permissions-evidence-2026-10-09/request-iam.json).

No new deployable security template is claimed. The security pin below is the verified unchanged installed baseline; the drift request is an explicitly blocked offline draft. Historical manifests and rollback ZIPs were hash-verified and preserved. [Manifest](team-hub-drift-permissions-evidence-2026-10-09/artifact-manifest.json).

| Artifact | SHA-256 |
|---|---|
| Security baseline, unchanged | 8ff956315649ea5741040f7da2347a0d84dea4af0f6b43226f8f027c6bd1db27 |
| New blocked drift-recovery candidate | 4b5c6cda8afd6a1b9bc887705c56a4dd3270d2f59020d025c953c672ce80ab7b |
| Existing desired product | a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad |
| Unchanged runtime ZIP | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |
| Accepted endpoint rollback product | 5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9 |

## Validation and remaining execution gates

Access Analyzer: three unchanged policy documents, zero findings. 100 actual-role regression controls passed, covering protected resources, KMS lifecycle, PassRole, artifact and rollback permissions. Provider simulations show the disputed actions are not allowed; GetFunction and UpdateFunctionConfiguration are allowed. Simulator denial is not evidence that CloudFormation must invoke an optional action. Identity-only KMS implicitDeny does not model the complete AWS-managed key grant and does not prove live decryption failure/success. [Regression controls](team-hub-drift-permissions-evidence-2026-10-09/installed-security-simulations.json), [Analyzer/provider controls](team-hub-drift-permissions-evidence-2026-10-09/mode-security.json). Additional wrong-function/domain controls are recorded in controls.json.

No runtime, environment contract, application source or security policy changed, so the preceding 441-test/TypeScript/build proof remains applicable and is not falsely reported as rerun here. Candidate preparation verifies desired-template semantic equality and every historical artifact hash. Secret-pattern scan and ledger validation are rerun for the new evidence/documentation.

Before any AWS change-set preparation: resolve log-group read discovery and applicable provider execution identity; resolve exact artifact binding without weakening the guard; establish enough coverage to exclude unrelated effects. Then obtain separate authorization to create a REVERT_DRIFT UPDATE change set. Inspect all pages and property values. Require exactly Read/Command Environment reconciliation, actual-state before values, zero additions/deletions/replacements/conditional replacements/code or unrelated property changes. These are expected gates, **not AWS-generated counts**. Stop on empty changes, unknown/read errors, unexpected drift, ignored relevant properties or any broader resource effect.

During eventual separately authorized execution, retain rollback. Lambda CloudFormation updates can sequence configuration and code calls; do not assume the two functions change atomically. Existing runtime may return 503 until its full environment is restored; check both functions' State, LastUpdateStatus, exact full maps and code hashes after stabilization. [AWS Lambda lifecycle documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-function.html).

REVERT_DRIFT rollback restores actual pre-update state, which can be the present unhealthy configuration. Inspect the actual result after rollback; do not infer endpoint recovery from UPDATE_COMPLETE. The accepted endpoint rollback remains a separate reviewed fallback with resource/retention inspection; never restore obsolete blocked execution security automatically. [AWS drift-aware rollback](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/drift-aware-change-sets.html).

After recovery: require authenticated authority 200 / LEGACY_WRITER epoch 1 version 1; all 16 normal business routes denied; empty business state; unchanged Core integration and D1 logs/metrics; no unexpected 5xx; fresh Lambda drift IN_SYNC plus full-stack coverage. Cursor decryption remains a separately controlled live proof. Stop on failed initialization, unexpected code/IAM/data changes or any required permission expansion. No direct patch or automatic retry.

Fresh protected-template comparisons preserve Legacy 2,621 / FunctionDirective 167, Team Hub 48+7, Core 8+5 and Tournament 11. Strongly consistent authority is unchanged LEGACY_WRITER/1/1. No production, frontend, fence or Legacy retirement actions occurred. [Protected domains](team-hub-drift-permissions-evidence-2026-10-09/protected-after.json), [authority](team-hub-drift-permissions-evidence-2026-10-09/authority.json).

**DRIFT RECOVERY REMAINS BLOCKED**
