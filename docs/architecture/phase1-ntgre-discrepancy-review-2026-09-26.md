# Phase 1 Ntgre change-set discrepancy review — 26 September 2026

**DISCREPANCIES FULLY RECONCILED — READY FOR NEW EXECUTION-GATE REVIEW**

The 33 additional modifications and the conditional classification on one of the original 81 modifications are explained. No candidate correction is indicated. The evidence supports reviewing the existing change set against its actual **0 additions / 114 modifications / 308 removals / 23 permission replacements / 1 conditional custom-resource replacement** scope. It does not support continuing to describe that scope as 81 modifications and zero replacements.

**Nothing was executed.** This investigation made read-only AWS calls and wrote local analysis/documentation only. The previous readiness and change-set reports remain unchanged. This report reconciles their open discrepancies; it is not execution authorization and does not amend the existing allowance or validation implementation.

## Exact target and preserved input

| Field | Verified value |
| --- | --- |
| Account / region | `058264289478` / `eu-north-1` |
| Identity | `arn:aws:iam::058264289478:user/RavenTest` |
| Root | `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` |
| Change set | `ntgre-phase1-pinned-20260926` |
| Change-set ARN | `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-phase1-pinned-20260926/92dd723b-539b-468a-a6fc-6c7377afdc95` |
| Final observed status | `CREATE_COMPLETE / AVAILABLE`; not executed |
| Candidate manifest SHA-256 | `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7` |
| Assembly tree SHA-256 | `8cf92cd39fa00c1192b00a6b74accb26fa43224e86cc03c9e8b35f551634b916` |
| Source verification | 1,128 files; pinned allowance verification passed |
| Assembly location | Preserved `respawn-ntgre-repro-1790081569268/candidate/.amplify/ntgre-preview/cdk.out` |
| Production / new synthesis / current HEAD substitution | None |
| Root rollback setting | Existing `DisableRollback=true`; future execution must explicitly enable rollback |

The final identity, template and pin checks are in [final-verification.json](phase1-ntgre-discrepancy-evidence-2026-09-26/final-verification.json). The root remains `UPDATE_COMPLETE`, with its last update still September 21. All six change-set resource lists are unchanged from the initial inspection. Eight stacks traversed by the discrepancy references retain their recorded parameters, outputs and deployed templates. These are targeted drift comparisons, not a newly initiated CloudFormation drift-detection operation or a claim that every service property was audited.

## Complete accounting and individual matrix

The [individual discrepancy appendix](phase1-ntgre-discrepancy-evidence-2026-09-26/individual-discrepancies.md) enumerates **all 34 records individually**, including all 23 permissions. Each includes logical/physical IDs, nested scope, AWS action and replacement flag, exact AWS property details, effective before/after values and the full dependency trace. The [machine-readable matrix](phase1-ntgre-discrepancy-evidence-2026-09-26/discrepancy-matrix.json) additionally preserves both complete template resource definitions and distinguishes literals, omitted properties and intrinsics. AWS unknown after-values and truncated policy signatures are preserved rather than replaced with invented AWS results.

| Additional modification category | Count | Classification |
| --- | ---: | --- |
| Lambda permissions | 23 | `SEMANTICALLY_EQUIVALENT_REPLACEMENT` |
| Root nested-stack records | 3 | `EXPECTED_REFERENCE_PROPAGATION` |
| Lambda environment records | 2 | `EXPECTED_REFERENCE_PROPAGATION` |
| IAM inline policies | 2 | `EXPECTED_REFERENCE_PROPAGATION` |
| JWT authorizer | 1 | `EXPECTED_REFERENCE_PROPAGATION` |
| HTTP API integrations | 2 | `EXPECTED_REFERENCE_PROPAGATION` |
| **Additional modifications** | **33** | **23 + 10** |
| Codegen conditional classification, already inside the original 81 modifications | 1 | `EXPECTED_PHASE1_CHANGE_NOT_PREVIOUSLY_ACCOUNTED` |

The codegen classification means its provider lifecycle/object effects had not been accounted for at the execution gate; its source-key modification itself was already in the reviewed template plan. There are **34 discrepancy records, not 34 additional modifications**. Replacement flags are attached to Modify records and are not additional Add/Remove records.

No record is classified `UNKNOWN`, `UNSAFE_CHANGE` or `REQUIRES_REVALIDATION`. Revalidation of the **accounting model and execution gate** is nevertheless needed because its previous zero-replacement expectation is obsolete. Classification here is supported by live policy/configuration comparisons, reference resolution, resource-provider semantics and object-content inspection, not simply by similar-looking ARNs.

The 308 removals remain the exact previously reconciled redundant generated set: 77 each of IAM roles, IAM policies, AppSync data sources and AppSync function configurations. All original 81 modifications remain present. Resource totals remain 2,929 → 2,621, and FunctionDirectiveStack remains 475 → 167. This investigation found no additional deletion or replacement of Cognito, Lambda functions, AppSync APIs, DynamoDB tables, S3 buckets or KMS keys.

## Root cause traced to actual template differences

The exact top-level differences are retained in [root-data-template-differences.json](phase1-ntgre-discrepancy-evidence-2026-09-26/root-data-template-differences.json):

1. Root `data7552DF31.TemplateURL` changes from template asset `45dfcd19…225d4.json` to `f69d4a8b…44a74.json`.
2. Inside data, FunctionDirectiveStack's template asset changes from `96e86772…84283.json` to `79404766…c9ab.json`. That reviewed child change consolidates the generated invocation resources and updates the reviewed resolver pipelines.
3. Inside data, codegen `SourceObjectKeys[0]` changes from `eafe2067…e57a9.zip` to `3f867a5c…0c31d.zip`.
4. The already-reviewed AppSync API-key expiry changes from `1792592350` to `1792674026`. No key value is published here.

Those changes make the data/root hierarchy participate in a nested change-set evaluation. AWS then evaluates parameters bound to nested-stack outputs conservatively. Its property-level change-set documentation explicitly notes that cross-stack references are not resolved for nested change sets. [AWS change-set limitations](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets-view.html).

Crucially, **none of the 33 additional resource definitions changed in the pinned template**. Their parent bindings, relevant output expressions and resolved physical identities are also unchanged. The resolver traced every `Ref`, nested `GetAtt`, `Join` and `Sub` involved back to observed stack outputs or existing physical resource IDs. No assumption of a newly allocated physical ID was needed. All 33 resolve to exactly equal before/after effective values.

Therefore the extra records are **propagation of unknown nested-output values**, not actual rewiring of the API/Lambda references or changed logical IDs. The AWS engine's internal evaluation algorithm is not exposed; the attribution is an inference supported by the identical templates, explicit `ParameterReference` causes, `KNOWN_AFTER_APPLY` values and the complete dependency graph. An AWS `DirectModification` detail does not establish an authored template change: the matrix preserves that label while showing the actual unchanged templates. This matters especially for the two IAM policy records, whose after-values are opaque signatures.

| Extra parent marker | Proven chain |
| --- | --- |
| `apistack7B433BC7` | Root → data's unchanged myFunction ARN output and function's unchanged twitch-runtime ARN output → two integrations and 23 permission records |
| `function1351588B` | Root → data's KMS/AppSync/model-introspection outputs and overlay's table/WebSocket outputs → runtime environment and role-policy evaluation |
| `overlaysourcestackF7F134D8` | Root → data's CreatorWorkspaceRecord/Brand outputs and auth's unchanged pool/client outputs → overlay environment/policy and JWT authorizer evaluation |

These three parent TemplateURLs and resource definitions are unchanged. AWS labels their details `Dynamic / Automatic / RequiresRecreation=Never`; their child records account for the effects. The auth stack itself has no proposed changes. Its pool/client references can still appear unknown during the parent's nested evaluation; they are not evidence of a Cognito replacement.

## Lambda permissions: 23 separate reconciliations

The appendix compares every permission's `FunctionName`, `Action`, `Principal`, `SourceArn`, `SourceAccount`, `PrincipalOrgID`, `FunctionUrlAuthType`, `InvokedViaFunctionUrl` and `EventSourceToken` individually. All 23 live statements were located by their own physical statement IDs and exactly matched the resolved template, including condition operators.

For every permission, AWS's replacement trigger is `/Properties/FunctionName`. Its details combine a **Static ParameterReference** and **Dynamic DirectModification**, both with `RequiresRecreation=Always`. AWS shows the existing ARN before and `{{changeSet:KNOWN_AFTER_APPLY}}` after. The pinned `Ref` is unchanged; it resolves to the same function. `FunctionName` is a create-only property of the regional resource type and requires replacement in the CloudFormation reference. [Lambda Permission properties](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-permission.html).

There are 21 statements targeting `amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV` and two targeting `amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA`. All keep principal `apigateway.amazonaws.com`, action `lambda:InvokeFunction` and the exact existing route SourceArn under API `jm15a0rmi0`. Optional SourceAccount/organization/function-URL/event-token properties are absent before and after. The existing SourceArn wildcards are unchanged. No grant broadens or narrows.

### Replacement lifecycle and invocation continuity

The actual eu-north-1 [registered resource schema](phase1-ntgre-discrepancy-evidence-2026-09-26/lambda-permission-type.json) is `IMMUTABLE`, has create `lambda:AddPermission` and delete `lambda:RemovePermission` handlers, no update handler, and composite identity `FunctionName` + generated `Id`. It contains **no `delete_then_create` override**. The documented resource-schema default is `create_then_delete`. Together these establish the declared strategy for these records, rather than relying only on a generic statement that CloudFormation “usually” creates first. [CloudFormation resource-schema semantics](https://github.com/aws-cloudformation/cloudformation-resource-schema#resource-semantics).

Accordingly, if AWS carries out the reported replacements, the new equivalent statement is created before the old statement is removed. The new generated statement ID differs from the old identity; RemovePermission removes a specific statement, not the entire policy. The templates do not assign fixed statement IDs or contain a competing whole-policy resource. [AddPermission](https://docs.aws.amazon.com/lambda/latest/api/API_AddPermission.html), [RemovePermission](https://docs.aws.amazon.com/lambda/latest/api/API_RemovePermission.html).

This produces no designed interval without a matching invocation grant. Delete-before-create is not the declared strategy. It does not guarantee that an AWS service/control-plane failure, failed stabilization or concurrent external policy edit could never cause an incident. No replacement or live webhook/payment invocation was performed to claim an empirical zero-error deployment. Even if AWS ultimately skips work after resolving equal values, the next gate must retain all **23 reported replacements** in its approved scope.

### Full-overlap policy capacity

The full live policies were measured, and a conservative overlap model retains every current statement while adding every proposed equivalent replacement. Current statement IDs are already the maximum 100 characters allowed by AddPermission, so the estimate does not depend on shorter new IDs. [Statement ID constraint](https://docs.aws.amazon.com/lambda/latest/api/API_AddPermission.html).

| Function | Current statements / bytes | Replacing statements | Maximum modeled overlap bytes | Remaining against 20,480 bytes |
| --- | ---: | ---: | ---: | ---: |
| myFunction | 21 / 9,734 | 21 | 19,415 | 1,065 |
| twitch-runtime | 2 / 981 | 2 | 1,909 | 18,571 |

Both fit the 20 KB function policy limit. The main function's margin is small enough that this read-only check should be repeated at the next execution gate; intervening grants could invalidate it. The model counts the current compact JSON form returned by Lambda and an additional comma per statement. It covers this change set's full replacement overlap, not arbitrary future policy growth. [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), [headroom evidence](phase1-ntgre-discrepancy-evidence-2026-09-26/policy-headroom.json).

### Payment, webhook and Twitch exposure

Payment/webhook/fulfilment statements are individually identified in the appendix for these routes:

- `/revolut/checkout`, `/revolut/orders/{proxy+}`, `/webhooks/revolut`.
- `/orders/fulfill`, `/orders/import-existing-revolut`, `/orders/recover-fulfillment`.
- `/printful/orders`, `/printful/orders/{proxy+}`.

They retain their current handler and scope. No planned permission gap is identified, but these are high-impact endpoints if an abnormal deployment failure occurs; their health belongs in the eventual deployment monitoring/rollback plan. This investigation did not submit transactions or replay webhook events.

The Twitch statements cover commands, commands/me, OAuth callback, connect, status and runtime proxy routes. Both myFunction and twitch-runtime grants for `/twitch/runtime/{proxy+}` remain as currently deployed. GET/POST logical permission records can have the same wildcard-method SourceArn; these existing overlaps were checked individually and were not removed. The `/integrations/alpha/reward-events` permission is also unchanged. No Twitch endpoint was invoked or configuration changed during this review.

## The ten additional non-permission modifications

All seven directly queryable resources passed exact live-service comparisons; the three parent stack markers passed the stack/reference comparisons. The appendix provides full effective before and after objects without abbreviating ARNs or table names.

**Lambda environments:** `twitchruntimelambdaE27C0484` and `OverlaySourceOverlaySourceFunctionC8484D26` have identical full environment maps before/after and in live GetFunctionConfiguration. Every AWS-reported variable path is recorded individually in the appendix, including the KMS key, GraphQL endpoint, model-introspection bucket, table names and WebSocket URL references. Secret-valued settings in these templates are existing runtime-resolution placeholders; secret material was not fetched. No package, handler, runtime, memory, timeout or effective environment change accompanies these records. Reapplication of equal values is possible; it is not a newly intended runtime configuration.

**IAM:** `twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50` and `OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659` have an exact effective statement diff of `[]`. Roles and policy names also match. Live GetRolePolicy equals the resolved before/after document, including every action/resource/effect/condition. The full documents are in their appendix records. No wildcard, principal, privilege or resource scope changes. AWS's truncated AfterValue signature was not treated as policy content.

**JWT authorizer:** `OverlaySourceOverlaySourceHttpApiOverlayCreatorAuthorizer3B3A6DB8`, physical `u5wezi`, retains API `f7oxg5hy72`, type `JWT`, name `OverlayCreatorAuthorizer`, identity source `$request.header.Authorization`, audience `["1iq7ovjaf7d16imdvbqgfgvf86"]` and issuer `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE`. GetAuthorizer matches. Neither Cognito pool nor app client changes.

**Integrations:** `HttpApiGETprintfulproductsMyFunctionIntegration3EEB32F8` (`eelaubc`) and `HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegration35B744C4` (`x291v8i`) retain API `jm15a0rmi0`, type `AWS_PROXY`, payload format `2.0` and the exact respective myFunction/twitch-runtime ARNs. GetIntegration matches all template-controlled properties. The appendix also retains live default fields; no default-field change is proposed.

## Conditional codegen resource: actual provider and object effects

| Field | Inspected value |
| --- | --- |
| Logical ID | `amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929` |
| Existing physical ID | `aws.cdk.s3deployment.337d9c7c-ffc8-4128-9fdc-224e7d51472a` |
| Provider | `amplify-projectrespawnweb-CustomCDKBucketDeploymen-BSbtrADfUoKE` |
| Provider runtime / handler | Python 3.13 / `index.handler` |
| Pinned CDK version | `2.260.0` |
| Source bucket | `cdk-hnb659fds-assets-058264289478-eu-north-1` |
| Old source key | `eafe20679f70756b9ce3a143c5eb5ca4f8a01c132f2e120b943950c7151e57a9.zip` |
| New source key | `3f867a5c8adc0cf7706f1c77085026271f6e937c8357fc2ed06d2b97f680c31d.zip` |
| Destination | `amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx` |
| Prefix | Empty: deployment sync covers the bucket root |
| Prune | `true` |
| RetainOnDelete | Omitted; inspected provider defaults to `true` |
| Current object inventory | Exactly `model-schema.graphql` |
| Bucket versioning | No enabled/suspended Status returned; no versioned recovery assumed |

The deployed provider ZIP was downloaded using Lambda's returned location without publishing that signed URL. Its SHA-256 matches Lambda's `CodeSha256`. Its only member, `index.py`, is byte-identical to both the preserved provider asset and the pinned CDK installation: SHA-256 `52df59c68d1b8e7cd0d0275958741e6855311bd0a8af75d2c0c3c35b1f4ab7d4`. [Provider integrity evidence](phase1-ntgre-discrepancy-evidence-2026-09-26/provider-integrity.json).

The inspected provider code establishes these specific paths:

- `handler`, lines 60–70: empty destination prefix, extraction enabled, retention default true, prune parsed from the property.
- Lines 118–153: only Create allocates a new UUID. Update requires and returns the supplied physical ID. Delete only removes objects when retention is false. The special pre-delete branch additionally requires a changed destination; neither condition applies here.
- `s3_deploy`, lines 201–236: download the selected source archive to a temporary directory, extract it, then run `aws s3 sync --delete` into the same destination. There is no preceding bucket-wide S3 removal in this update.
- `extract_and_replace_markers`, lines 335 onward: extract the archive; this resource supplies empty marker maps.

The source line ranges are navigation aids to the ignored downloaded file `.amplify/phase1-discrepancy-review-20260926/deployed-index.py`; its hash, rather than an arbitrary installed/latest CDK version, identifies the reviewed code. A local harness ran that exact source with every AWS/subprocess/network operation mocked or denied. It verified Update retains identity, Delete retains objects, and a rollback Update selects the old ZIP and retains identity. The harness used local Python 3.14 rather than deployed 3.13 and modeled S3 sync; it is a control-flow check, not a live integration test. [Offline results](phase1-ntgre-discrepancy-evidence-2026-09-26/provider-test.json).

### Why Conditional, and what would replacement mean?

AWS reports a static direct change to `SourceObjectKeys[0]` with `RequiresRecreation=Conditionally`. A custom resource's Update response determines whether its physical identity changes. Same identity means update; a different identity makes CloudFormation replace it and send Delete for the old identity. CloudFormation cannot execute the provider while building the change set to obtain that response. This explains Conditional rather than a promise of either replacement or no replacement. [Custom-resource request/response protocol](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref.html).

For the exact inspected input and provider, a successful Update returns the existing ID, so actual replacement is **not expected**. Were a replacement lifecycle nevertheless initiated, Create would sync the source and generate a new UUID; Delete for the old identity would retain objects under these properties. The destination bucket is a separate, unchanged resource. The custom resource's `DeletionPolicy=Delete` and `UpdateReplacePolicy=Delete` mean send its Delete lifecycle event; they do not override its internal default `RetainOnDelete=true`. Bucket auto-delete support is unchanged and has no planned bucket-deletion event.

### Object content, absence, data and rollback

Both downloaded archives contain exactly one key, `model-schema.graphql`. The live destination bytes equal the old archive, and the new archive bytes equal the preserved pinned file.

| Version | Bytes | Object SHA-256 |
| --- | ---: | --- |
| Old / current destination | 49,259 | `b2b40bef690edfa75bc4411b605c8d2c634d4b43d2ff6aaf708361d088750cff` |
| Pinned new | 49,639 | `4fdd69674245b19f587b10faae864d3a1fb3e712a265282018016d8eb7ec82f0` |

The exact text comparison finds only **77 changed `@function(name: ...)` directive names**. All other bytes are identical. The 79 operation directives now reference the two reviewed shared names, `FnSubmitInvestorAccessRequest` and `FnReviewInvestorAccessRequest`. This is the codegen representation of the reviewed consolidation, not an extra public schema or authorization change. [Schema comparison](phase1-ntgre-discrepancy-evidence-2026-09-26/schema-analysis.json).

There are **zero keys to prune** in the observed destination. Its existing key is overwritten, not deleted and later recreated. AWS CLI sync's delete option targets destination keys missing from the source; a same-key update is a copy/upload. S3 makes a single-key overwrite atomic, so consumers see the old or new object, not a planned missing/partial object interval. [AWS CLI sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html), [S3 consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel).

The pinned Amplify `CodegenAssets` construct explicitly creates this bucket for generated model-schema downloads, persists its URI in stack outputs, and allows Amplify console GET/HEAD access. It is distinct from the model-introspection bucket referenced by runtime Lambda environments. The observed destination contains no user/stateful records, and no application request-time dependency on this codegen object was found. There is no identified application interruption from this object update. A concurrent codegen consumer can read either complete schema version during the update; both preserve the same operation/auth contract.

On a successful rollback Update with the old properties, the same provider syncs the still-available old ZIP to the same key. The different old/new sizes also prevent a same-size sync skip for this object. This restores the old content, not its historical LastModified timestamp. It is **not a transactional backup guarantee**: provider failure, a missing source archive or a future unrelated object pruned by `--delete` would require separate recovery. The current inventory has no such extra objects. Retention on Delete alone does not restore overwritten content; restoration requires the rollback Update to succeed. Future execution must explicitly enable rollback despite the root's current `DisableRollback=true`.

## Risk assessment and smallest next action

The discrepancy investigation is complete. There is no evidence requiring a corrected candidate, manual permission changes, new deployment ordering or a replacement change set. Preserve the existing candidate and existing unexecuted change set.

The smallest next step is a **new execution-gate review** that explicitly accepts and validates this AWS-generated scope. Before any separately authorized execution, that review should:

1. Incorporate the exact 33 additional logical IDs/types and the codegen conditional classification into the reviewed accounting/evidence model, retaining all 23 AWS replacement flags. This task has not changed that model or its tests.
2. Reconfirm the same change-set ARN is available/unexecuted, all six child/root plans and pinned hashes match, and the protected/stateful resources remain unchanged.
3. Recheck both live permission policies and the main function's 1,065-byte full-overlap margin; recheck the codegen key inventory and both source objects.
4. Carry forward rollback-enabled execution explicitly and payment/webhook/Twitch health checks into the eventual execution plan. Do not infer rollback-enabled execution from the stack's existing flag.

No additional live test is required to explain these discrepancies. A live deployment test would itself need separate authorization and is not claimed here. Ordinary control-plane failure and rollback risks remain; none is an unexplained candidate change. If the next review observes a new grant, unexpected object, altered template or changed identity, its conclusions must be revisited.

## Evidence and validation

The evidence directory contains the complete individual matrix, schema comparison, registered Lambda resource schema, provider identity/integrity, mocked provider results, policy-size calculations, stack/reference checks, change-set checks and final pin verification. [Evidence hashes](phase1-ntgre-discrepancy-evidence-2026-09-26/evidence-sha256.json) cover the published files. Raw service responses and downloaded ZIPs remain in the ignored `.amplify/phase1-discrepancy-review-20260926` directory. Signed download URLs and credential material are not published.

Validation completed: 34 discrepancy records resolved; 23/23 individual permission policies matched; 2/2 IAM policies, 2/2 Lambda environments and 3/3 API configurations matched; 8/8 referenced live stack templates and parameter/output sets matched; 6/6 change-set resource lists unchanged; five offline provider assertions passed; codegen archive/destination/pin comparisons passed; 1,128-file source manifest and assembly digest passed. No AWS writes, candidate edits, synthesis, production changes or execution occurred.
