# Phase 1 Ntgre change set execution gate — 26 September 2026

**NOT READY FOR CHANGE SET EXECUTION.** The requested change set exists and has not been executed. AWS reports 114 modifications, 308 removals, 23 replacements and one conditional replacement. This supersedes the earlier template-only readiness gate for execution purposes.

## Identity and exact input

- Account: 058264289478; region: eu-north-1; profile: default.
- Identity: `arn:aws:iam::058264289478:user/RavenTest`; UserId: `AIDAQ3EGSQDDCJSMJ75N5`.
- Existing root: `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332/8b2122c0-b5c7-11f1-b780-0aadaa40eeed`.
- Change set: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-phase1-pinned-20260926/92dd723b-539b-468a-a6fc-6c7377afdc95`.
- Status: **CREATE_COMPLETE / AVAILABLE**. AVAILABLE means AWS permits execution, not that this review approves it.
- Candidate manifest: `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`.
- Pinned assembly: `8cf92cd39fa00c1192b00a6b74accb26fa43224e86cc03c9e8b35f551634b916`.
- Source files: **1128/1128 verified**. Exact allowance verification passed before and after preparation.
- Preserved candidate directory: `<local-phase1-reproduction>/candidate`; assembly: `.amplify/ntgre-preview/cdk.out`.
- Current HEAD/working tree and fresh synthesis were not used. No Lambda package was rebuilt. CDK's generic “Synthesis time” log line refers to loading the supplied assembly; no application synthesis command ran.

## Preparation and permitted writes

The documented command was attempted with `--method prepare-change-set --rollback --require-approval any-change`. CDK published the three pinned template objects and the codegen ZIP required for the change plan. Its preliminary review change set was removed by CDK when the noninteractive confirmation failed. No workload update ran.

After recording that failure, preparation was repeated with `--require-approval never` because the user had already explicitly authorized this preparation. The critical method remained `prepare-change-set`, which the installed CLI maps to `execute:false`. That invocation exited successfully and left the above named change set available for inspection. No execute-change-set, UpdateStack, direct deployment, hotswap, sandbox watcher or production deployment was invoked.

The first publication added a codegen ZIP cache and transient read lock inside the assembly directory. An independent file-tree digest proved all original files still matched the accepted digest exactly. The lock was removed by CDK at exit; the new cache ZIP was moved, with its hash checked, into the ignored evidence folder. Final ordinary pinned-allowance verification passes without exclusions or changed pins. All original templates, sources and Lambda assets remain byte-identical. The cache ZIP was packaging for the already reviewed codegen asset, not regenerated Lambda code.

## Complete AWS change-set reconciliation

All six AWS-generated change sets were retrieved with property values and pagination. Each of their submitted templates equals its corresponding pinned template. The root and five children are CREATE_COMPLETE; child ExecutionStatus is UNAVAILABLE because execution is controlled through the root. Before preparation, all 62 deployed stack templates and identities matched the accepted live baseline.

| Classification | Reviewed expectation | AWS result |
| --- | ---: | ---: |
| Additions | 0 | 0 |
| Modifications | 81 | **114** |
| Removals | 308 | **308** |
| Replacement=True | 0 | **23** |
| Replacement=Conditional | 0 | **1** |

Replacement flags are attached to Modify records; they are not extra records to add to 114. AWS reports **39 Dynamic detail entries across 31 resources**. No replacement was normalized away.

All **308 deletion logical IDs and resource types** match the reviewed set: 77 IAM roles, 77 IAM policies, 77 AppSync data sources and 77 AppSync invocation functions, all in FunctionDirectiveStack. No unexpected removal is present. All **81 expected modification logical IDs/types** are present, with the submitted templates matching the accepted plan. However, one expected modification has a new conditional-replacement classification, and **33 additional modifications** are outside the reviewed action set. Therefore “all 81 found” does not mean the entire AWS update plan is reconciled or approved.

| Nested scope | Modify | Remove | True replacements | Conditional |
| --- | ---: | ---: | ---: | ---: |
| Root | 4 | 0 | 0 | 0 |
| Data | 3 | 0 | 0 | 1 |
| FunctionDirectiveStack | 77 | 308 | 0 | 0 |
| Twitch runtime function stack | 2 | 0 | 0 | 0 |
| OverlaySource stack | 3 | 0 | 0 | 0 |
| API stack | 25 | 0 | 23 | 0 |

## Every additional modification

| Stack path under root | Logical ID | Type | AWS replacement | Affected property |
| --- | --- | --- | --- | --- |
| $root | `apistack7B433BC7` | AWS::CloudFormation::Stack | False | Properties |
| $root | `function1351588B` | AWS::CloudFormation::Stack | False | Properties |
| $root | `overlaysourcestackF7F134D8` | AWS::CloudFormation::Stack | False | Properties |
| function1351588B | `twitchruntimelambdaE27C0484` | AWS::Lambda::Function | False | Environment |
| function1351588B | `twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50` | AWS::IAM::Policy | False | PolicyDocument |
| overlaysourcestackF7F134D8 | `OverlaySourceOverlaySourceFunctionC8484D26` | AWS::Lambda::Function | False | Environment |
| overlaysourcestackF7F134D8 | `OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659` | AWS::IAM::Policy | False | PolicyDocument |
| overlaysourcestackF7F134D8 | `OverlaySourceOverlaySourceHttpApiOverlayCreatorAuthorizer3B3A6DB8` | AWS::ApiGatewayV2::Authorizer | False | JwtConfiguration |
| apistack7B433BC7 | `HttpApiDELETEtwitchcommandsmeMyFunctionIntegrationPermission988D4AF4` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETprintfulordersproxyMyFunctionIntegrationPermission27B263F7` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETprintfulproductsMyFunctionIntegration3EEB32F8` | AWS::ApiGatewayV2::Integration | False | IntegrationUri |
| apistack7B433BC7 | `HttpApiGETprintfulproductsMyFunctionIntegrationPermissionEEDCA91E` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETprintfulproductsproxyMyFunctionIntegrationPermissionBBDC8EDC` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETrevolutordersproxyMyFunctionIntegrationPermission59EAC615` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchcommandsMyFunctionIntegrationPermissionB5137FD8` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchcommandsmeMyFunctionIntegrationPermission65528725` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchoauthcallbackMyFunctionIntegrationPermission6AC5B45C` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchruntimeproxyMyFunctionIntegrationPermission2D5F0CC6` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegration35B744C4` | AWS::ApiGatewayV2::Integration | False | IntegrationUri |
| apistack7B433BC7 | `HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegrationPermissionB89EA49B` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiGETtwitchstatusMyFunctionIntegrationPermissionAD0079D1` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTintegrationsalpharewardeventsMyFunctionIntegrationPermission11B85ED7` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTordersfulfillMyFunctionIntegrationPermission40CCD9E6` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTordersimportexistingrevolutMyFunctionIntegrationPermissionFD0FFE2D` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTordersrecoverfulfillmentMyFunctionIntegrationPermissionED664E9D` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTprintfulordersMyFunctionIntegrationPermission1B479DCF` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTrevolutcheckoutMyFunctionIntegrationPermissionD85394E5` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTtwitchcommandsmeMyFunctionIntegrationPermissionD9749DA2` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTtwitchconnectMyFunctionIntegrationPermissionA3D4DBC9` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTtwitchruntimeproxyMyFunctionIntegrationPermission05736304` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTtwitchruntimeproxyTwitchRuntimeIntegrationPermissionC9FB5F6E` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPOSTwebhooksrevolutMyFunctionIntegrationPermissionC877F07A` | AWS::Lambda::Permission | True | FunctionName |
| apistack7B433BC7 | `HttpApiPUTtwitchcommandsmeMyFunctionIntegrationPermission5A843795` | AWS::Lambda::Permission | True | FunctionName |

The 23 True replacements are **AWS::Lambda::Permission resources**, not Lambda function replacements. They affect existing API Gateway invocation permissions, including payments/webhooks, Printful, Alpha and Twitch routes. AWS reports FunctionName as changing from the current ARN to KNOWN_AFTER_APPLY, with ParameterReference/DirectModification detail and RequiresRecreation=Always.

The remaining ten additional modifications are three nested-stack records, two Lambda Environment changes (Twitch runtime and OverlaySource), two IAM PolicyDocument changes, one JWT authorizer configuration and two API integration URIs. The parent/child template bytes are unchanged for these resources, but AWS's expanded plan carries unresolved nested output/parameter values. This is evidence for nested-reference propagation as the cause; it is not proof that all flagged replacements are harmless or will be skipped. AWS documents [nested change-set reference limitations](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets-view.html). The actual returned Replacement=True flags remain blocking under this reviewed scope.

## Conditional replacement and protected impact

The one Conditional record is the expected codegen update:

`amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929` — `Custom::CDKBucketDeployment` — SourceObjectKeys — Evaluation=Static — RequiresRecreation=Conditionally.

Source ZIP key: `eafe20679f70756b9ce3a143c5eb5ca4f8a01c132f2e120b943950c7151e57a9.zip` → `3f867a5c8adc0cf7706f1c77085026271f6e937c8357fc2ed06d2b97f680c31d.zip`.

The change was reviewed as an in-place generated-object update; the AWS Conditional classification has not been cleared. Its provider physical-ID/update/delete behaviour needs explicit review before execution, including what a replacement would do to generated S3 objects.

- **Cognito:** no pool/client/identity/group change or replacement appears.
- **DynamoDB/KMS:** no table/index/key action or stateful replacement appears.
- **S3:** no bucket deletion/replacement appears; codegen-object impact remains through the conditional custom-resource operation.
- **AppSync:** 77 expected resolver modifications, the reviewed API-key expiry and the 154 reviewed data-source/invocation-function removals; no API or schema replacement appears.
- **IAM:** 154 reviewed role/policy removals plus two additional runtime/overlay policy modifications.
- **Lambda:** no code update or function replacement appears, but two Environment modifications and 23 permission replacements broaden the operational scope.
- **Payments/webhooks/API wiring:** affected by additional permission replacements and integration changes, contrary to the prior unchanged-wiring assumption.

No proposed database or Cognito migration was found. The protected operational wiring is nevertheless affected in AWS's plan, so the existing zero-replacement gate is not satisfied.

## Final safety check and rollback

At 2026-09-26T11:28:51.790Z, STS still returned the expected account/identity; the root was **UPDATE_COMPLETE**, with last update still **2026-09-21T14:32:51.577000+00:00**. The deployed root/data/directive templates are unchanged. All five deployed application Lambda hashes still match. The pinned assembly/manifest again pass exact verification. No unexpected deployed-state drift was detected in these checks.

The change set remains **CREATE_COMPLETE / AVAILABLE**, not EXECUTE_IN_PROGRESS or EXECUTE_COMPLETE. No change set was executed. Production was not modified. The four published preparation assets reside in the bootstrap asset bucket; no production stack operation was performed.

The existing root still reports **DisableRollback=true**. Preparing with `--rollback` does not persist an execution rollback switch on a pending change set. Any eventually authorized execution must explicitly supply **`--no-disable-rollback`**. No execution command is proposed while this gate is blocked; no stack protection setting was changed today.

## Smallest remaining work

1. Trace the 33 additional modifications and 23 permission replacements through the nested outputs/parameters, using the exact AWS property-level evidence. Determine whether a revised preparation strategy can satisfy the reviewed zero-replacement scope, or whether a separately reviewed plan/authorization is needed. Do not silently widen the pinned exception or treat these flags as noise.
2. Review the codegen provider's physical-ID and deletion semantics to resolve the Conditional replacement and generated-object impact.
3. After resolving those discrepancies, prepare and inspect the exact approved plan again if necessary, reconfirm identity/pins/live state, and seek separate execution authorization. Do not execute the current change set to discover its behaviour.

No candidate, allowance or infrastructure code was changed to bypass the gate. The prepared change set has been left unexecuted for review.

Evidence: [sanitized full reconciliation](phase1-ntgre-change-set-evidence-2026-09-26/reconciliation.json), [final safety verification](phase1-ntgre-change-set-evidence-2026-09-26/final-verification.json), [publication-file accounting](phase1-ntgre-change-set-evidence-2026-09-26/publication-files.json). Full AWS property-value responses, all submitted templates and CDK logs are retained privately under `.amplify/phase1-change-set-20260926`.
