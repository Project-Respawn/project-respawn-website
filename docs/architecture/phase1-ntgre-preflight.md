# Approved allowance follow-up — 2026-09-23

**BLOCKED — AWS credentials unavailable.** The user-approved temporary Ntgre-specific allowance is implemented and locally tested. The exact archived candidate now returns **PASS WITH APPROVED EXISTING DEBT**, hierarchy 2,621, FunctionDirectiveStack 167, fresh creation BLOCKED, with all 1,128 candidate hashes verified. Expiry: October 7, 2026 at 00:00 UTC. Global budgets and hosted allowances remain unchanged. No deployment authorization is implied.

See [allowance implementation, scope, tests and remaining checks](phase1-ntgre-debt-allowance.md). All 41 accounting/boundary tests passed. Infrastructure CI was attempted but failed before synthesis with `uv_os_get_passwd returned ENOMEM`; no CI pass is claimed. Fresh AWS identity/drift checks and subsequent pre-deployment checks remain unperformed because AWS CLI returned NoCredentials and no profiles. Recovery findings remain unchanged. The older accounting NO-GO below is retained as historical evidence and superseded only for local policy evaluation of the exact pinned candidate.

# Continuation decision — 2026-09-23 (before allowance authorization)

**NO-GO — Phase 1 must not be deployed.** Completed evidence already resolves the Lambda discrepancies and build reproduction. This continuation verified it without repeating completed builds. The unchanged accounting gate still rejects Ntgre. Fresh AWS confirmation is also unavailable: scoped identity/stack queries returned `NoCredentials`, and `aws configure list-profiles` returned no profiles. AWS findings below refer to the September 22 capture, not a successful current refresh. No AWS mutation was attempted.

## A. Live Lambda equivalence

SHA values below are AWS CodeSha256 (base64). Baseline and candidate have the same complete ZIP digest, including maps and metadata. All 15 archived ZIPs were rehashed this continuation.

| Function | Deployed code SHA | Local baseline | Phase 1 candidate | Equivalent? |
| --- | --- | --- | --- | --- |
| post-confirmation | `6sGwH4C8Jhg8LYK0UdfDdSYsl0aVJiy7h8ryM3sAn/w=` | Same | Same | YES, entire ZIP |
| admin-user-management | `7uvEQ6FDsvAbs8gHRU6WWZZJ+CHB4kxMqvdHfmpTTHI=` | Same | Same | YES, entire ZIP |
| myFunction | `8bcpmI6i73K9N9nUPXkfg27rE3BCCjIbFYuYsU4YCis=` | Same | Same | YES, entire ZIP |
| twitch-runtime | `4NH+0eVEqcjmg/YtV0xWNMD0qpJGP1yp095KMvZp5E8=` | Same | Same | YES, entire ZIP |
| OverlaySource | `U/cAL1CAnNBh5VxdBa28I1yvT8Qo6O84izOX1jdCBC4=` | Same | Same | YES, entire ZIP |

Original differences: BUILD PATH / SOURCE MAP and TOOLCHAIN. Corrected package differences: zero APPLICATION CODE, SOURCE MAP, BUILD PATH, TOOLCHAIN, PACKAGING, METADATA or UNKNOWN. Physical names, ARNs, hex hashes, inventories and asset references remain in the prior investigation's linked evidence. Current AWS identity of these packages awaits credentials.

## B. Live build reproduction

Sufficient for the captured deployment: Windows Node 24.14.1, CDK 2.260.0, pinned lockfile/Amplify dependencies, correct directory depth and Ntgre context reproduced exact ZIPs in independent baseline/candidate installs. Historical npm provenance and the complete historical environment remain unknown. No installs or builds were repeated.

## C. Live to candidate changes

**ADD 0 / MODIFY IN PLACE 81 / DELETE 308 / REPLACE 0 / UNKNOWN 0**, against captured templates using static property/provider replacement analysis. Meaningful changes: 77 resolver updates, 308 obsolete-chain deletions and one generated codegen asset update; two nested template references carry the changes. One API-key expiry update is synthesis-time churn, with real in-place expiry effect. CDK metadata differences: zero. These are not newly certified current-live counts or an AWS execution plan.

## D. Protected resources

PASS against captured definitions/artifacts for each category: Cognito; DynamoDB; S3; KMS; AppSync API/schema; Lambda definitions/permissions/layers; actual five Lambda ZIPs; Team Hub; Creator/Twitch/OverlaySource; payments/webhooks; HTTP API wiring; retained IAM/auth; generated output snapshot. External services have no proposed action and were not separately audited. No current drift scan is claimed.

## E. Recovery readiness

Recorded state: PITR on two of 55 tables; no listed table backups or AWS Backup recovery points; three buckets without enabled versioning/Object Lock; inactive Cognito deletion protection; two enabled retained KMS keys. Eight configured secret names are absent at both inspected SSM paths. No restore drill proves data/user/secret recovery. These are existing recovery/integration-test limitations, not identified stateful mutations in this consolidation. They are not comprehensive recovery assurance. Current protections were not refreshed.

## F. Dependency/order proof

All 79 operations preserve authorization functions: 77 transition to already-existing unchanged anchors; two already use retained anchors. The recorded 735 graph/protected checks pass. No retained resource references deleted chains. CloudFormation defers nested cleanup until nested stacks have updated or rolled back, supporting resolver repointing before obsolete-chain removal. This is static graph evidence plus documented semantics, not a guaranteed AWS event schedule. [AWS cleanup guidance](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html).

## G. Rollback strategy

Before submission: STOP, no recovery needed. Resolver update failure before cleanup: normal CloudFormation ROLLBACK. Obsolete-chain deletion failure: prefer ROLL-FORWARD through cleanup repair when stack status permits. Rollback failure: stop and diagnose, with separately authorized recovery execution. Regression after completion: prefer a narrowly reviewed ROLL-FORWARD; restoration of the old layout requires expansion review.

The old directive template's 475 resources are technically restorable under AWS's 500-resource template limit, with 25 slots remaining. Reverse changes restore 308 resources and approximately 81 other records. Fresh conservative accounting counts every resource in the three changed baseline templates: **root 7 + data 86 + directive 475 = 568**, below the 2,500-resource nested-operation limit. Unmodified nested templates are not updated under [AWS nested-stack semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudformation-stack.html). This supports feasibility for the captured scope; it does not certify current service quotas, physical-name availability or an AWS operation plan.

The full 2,929-resource hierarchy is not an update/rollback operation-size count. Fresh recreation would exceed 2,500 and is prohibited. No AWS count violation is identified for this scoped reverse update; service quotas, drift, IAM propagation, unavailable assets or cleanup failures can still prevent rollback. Repository policy separately blocks ordinary baseline expansion: 475 exceeds its template action threshold and Ntgre lacks a hierarchy allowance. AWS automatic rollback does not run that local evaluator. [AWS resource and operation quotas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html).

## H. Candidate integrity

Fresh verification: **1,128/1,128 raw file hashes match**. Manifest SHA256: `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`. No application/backend source, lockfile, budgets or allowances were changed; unrelated SWG work remains excluded.

## I. Checks actually performed in this continuation

- Verified every previously pinned evidence file and report digest: zero mismatches before documentation edits.
- Verified all 1,128 candidate hashes and manifest digest.
- Rehashed five downloaded ZIPs plus ten reproduced archives, including AWS base64 conversion: all exact.
- Recomputed assembly totals and reran the unchanged accounting evaluator with/without existing allowance: FAIL, hierarchy 2,621 and Ntgre outside allowance scope.
- Computed the 568-resource total across changed baseline templates and checked AWS limits/cleanup documentation.
- Attempted read-only AWS identity/stack refresh: unavailable, NoCredentials; no CLI profiles.

No application tests, npm ci, synthesis, contract checks or build were rerun this continuation. The earlier 89 targeted tests and build remain prior evidence, and 653/653 remains tied to the accepted source snapshot. Fresh results and verification code are in `phase1-ntgre-artifact-evidence/continuation-verification.json` and `verify-continuation.mjs` relative to the main report.

## J. FINAL DECISION

**NO-GO — Phase 1 must not be deployed.**

Exact blockers: the unchanged accounting gate rejects the 2,621-resource Ntgre hierarchy, with its allowance covering only master/staging; fresh AWS identity/templates/packages/protection confirmation is unavailable without credentials. A reviewed Ntgre-specific debt decision and working read-only AWS credentials are needed to resolve these blockers. Neither authorizes deployment. No deployment command is proposed. Work stops at this report.


---

# Prior completed investigation — 2026-09-22

# Ntgre Phase 1 preflight — artifact reproduction and final review

**2026-09-22 — NO-GO for deployment: the unchanged resource-accounting gate does not authorize the Ntgre root.** The previous Lambda artifact STOP is resolved. All five actual deployed ZIPs reproduce exactly from both the baseline and the unchanged candidate. No AWS mutation, deployment, change set, upload, watcher, Cognito change or protection-setting change was performed.

This report supersedes the [previous NO-GO report](phase1-ntgre-artifact-evidence/previous-preflight-report.md). Its historical evidence remains intact. New [evidence and reproduction tools](phase1-ntgre-artifact-evidence/README.md) are separate from the accepted application snapshot.

Target: account `058264289478`, region `eu-north-1`, existing root `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`, stack UUID `8b2122c0-b5c7-11f1-b780-0aadaa40eeed`. The final recovery inspection still reported `UPDATE_COMPLETE`, last updated `2026-09-21T14:32:51.577Z`, matching the captured live templates.

## A. Live build recipe

| Input | Finding and confidence |
| --- | --- |
| Build Node | **PROVEN:** live CDK metadata reports 24.14.1; reproduction used v24.14.1. This is separate from the unchanged Lambda runtime, nodejs22.x. |
| npm | **PROVEN for reproduction:** 11.11.0, with two independent successful `npm ci` runs. **UNKNOWN:** npm version used for the original deployment. Exact reproduction establishes that this npm/dependency installation works; it does not establish historical npm provenance. |
| CDK | **PROVEN:** aws-cdk-lib 2.260.0; reproduction CLI 2.1137.0, toolkit-lib 1.32.0. Live metadata and reproduced metadata now agree. |
| Amplify | **PROVEN installed versions:** backend 1.24.0, backend-cli 1.9.0, backend-function 1.18.2, backend-auth 1.9.4, auth-construct 1.11.2, backend-storage 1.5.0. The live auth description's 1.11.2 identifies auth-construct, not backend-auth. |
| esbuild / tsx | **PROVEN installed:** esbuild 0.28.1, tsx 4.22.4. Historical executable provenance is not separately recorded; their output exactly reproduces deployed bytes. |
| Dependencies | **PROVEN:** unchanged lockfile SHA256 `535fffd7f459486823f30f3f78705ccfaff8d573cee5746aa1a00c7819a04674`; fresh Windows installs in independent baseline/candidate directories. No package upgrade or lockfile edit. |
| Platform | **PROVEN:** live metadata identifies Windows; Windows reproduction matches generated env-stub CRLF bytes and all archive metadata. Linux LF stubs caused embedded source-map content differences. Original Windows version is **UNKNOWN**. |
| Layout | **PROVEN necessary relative layout:** `.amplify/ntgre-preview/cdk.out/asset.<hash>/`; source maps naturally resolve through `../../../../`. Previous shallow `.amplify/ntgre-preview/asset.<hash>/` produced `../../../`. No maps were edited or normalized. |
| Working directory | **PROVEN reproduction:** two project roots under `<local-phase1-reproduction>`, named `baseline` and `candidate`. Original absolute build directory is **UNKNOWN**; both different local roots reproduce identical ZIPs. |
| Context | **PROVEN matching target:** namespace `project-respawn-website`, backend name `Ntgre`, deployment type `sandbox`; account/region above. `AWS_BRANCH` unset and managed auth retained. Shared-auth synthesis rejected by the helper. |
| Environment | Helper sets `CDK_DEFAULT_ACCOUNT=058264289478`, `CDK_DEFAULT_REGION=eu-north-1`, `AWS_EC2_METADATA_DISABLED=true`; synthesis uses Amplify context through `MemoryContext`. The complete historical process environment is **UNKNOWN**. No secret values were retrieved or injected. |
| Bundling | Unchanged Amplify factory: ESM, minification, source maps, AWS SDK bundled, `.node` file loader. OverlaySource uses unchanged CDK NodejsFunction defaults with minification/source maps, Node 22 target and ARM64 Lambda architecture; other four functions are x86_64. |
| ZIP packaging | Installed CDK `zipDirectory`, using its standard fixed DOS timestamp, file modes, compression and file enumeration. No manual timestamp or mode adjustments. |

The [corrected synthesis helper](phase1-ntgre-artifact-evidence/synthesize-ntgre-live-context.mjs) is the canonical investigation entry point; the old shallow helper is historical evidence. Copy it into `.amplify/synthesize-ntgre-live-context.mjs` in each freshly materialized project root. Preserve exact raw source bytes using the existing snapshot workflow and manifest; reconstruct the baseline with its recorded pre-consolidation schema override. Do not use the concurrent working tree as the candidate.

From each isolated root, with the relevant label, the reproduction commands were:

```powershell
npm.cmd ci
# Create .amplify/ntgre-preview first; cdk.out must not already exist.
node .amplify/synthesize-ntgre-live-context.mjs baseline
# In the separate candidate root:
node .amplify/synthesize-ntgre-live-context.mjs candidate
```

The helper calls `Toolkit.synth` only. Local archive comparison calls CDK `zipDirectory` only. Neither publishes assets. [Versions](phase1-ntgre-artifact-evidence/toolchain-versions.json), [workspace paths](phase1-ntgre-artifact-evidence/windows-workspaces.json), install and synthesis logs are preserved.

## B. Actual Lambda package comparison

Read-only `lambda get-function` supplied authorized download URLs. Actual ZIP bytes were downloaded locally; every package hash was checked against Lambda's base64 `CodeSha256`. URLs were not persisted. Downloaded code was never substituted into a synthesized asset.

| Function | ZIP bytes | Baseline vs actual ZIP | Candidate vs actual ZIP |
| --- | ---: | --- | --- |
| post-confirmation | 545,963 | EXACT | EXACT |
| admin-user-management | 1,989,980 | EXACT | EXACT |
| myFunction | 2,442,063 | EXACT | EXACT |
| twitch-runtime | 2,200,618 | EXACT | EXACT |
| OverlaySource | 37,264 | EXACT | EXACT |

All ten complete-ZIP comparisons pass. This covers executable bytes, source-map bytes, `sourcesContent`, relative source paths, file names, sizes, compression, timestamps, modes, extra fields and archive structure. All five synthesized CloudFormation S3 keys also equal live keys. Archive SHA256 and CDK asset keys are different identifiers; both are recorded and checked independently.

[Function ARNs, CodeSha256, package SHA256 and live keys](phase1-ntgre-artifact-evidence/deployed-packages.json), [complete ZIP hashes](phase1-ntgre-artifact-evidence/complete-zip-comparison.json), [file inventories and archive metadata](phase1-ntgre-artifact-evidence/deployed-package-inventory.json), [source-map checks](phase1-ntgre-artifact-evidence/windows-package-comparison.json).

Classification of the original discrepancy: **BUILD PATH / SOURCE MAP ONLY** for incorrect relative paths; **TOOLCHAIN / SOURCE MAP ONLY** for platform-generated env-stub newlines; **TOOLCHAIN** for Node/platform CDK metadata. Original executable JS already matched all five deployed packages. Final **APPLICATION CODE differences: 0; SOURCE MAP differences: 0; PACKAGING METADATA differences: 0; UNKNOWN package differences: 0**. [Initial diagnosis](phase1-ntgre-artifact-evidence/initial-artifact-diagnosis.json).

## C. Reconstructed baseline vs live

**ADD 0 / MODIFY 2 / DELETE 0**, with zero template-envelope differences.

1. `amplifyDataGraphQLAPIDefaultApiKey1C8ED374`: only `Properties.Expires`, live `1792592350` to reconstructed `1792674026`. This is synthesis-time expiry calculation, not API or key replacement.
2. Root `data7552DF31`: only nested `TemplateURL`, because its template contains that expiry.

The previous 62 CDK metadata changes and five Lambda changes are completely gone. Of 61 nested-template changes, 60 disappear; the one remaining data reference is fully explained by expiry. No metadata difference is suppressed. [Exact baseline diff](phase1-ntgre-artifact-evidence/live-to-baseline.json).

## D. Live ? candidate action summary

| Action | Count |
| --- | ---: |
| ADD | 0 |
| MODIFY | 81 |
| DELETE | 308 |
| REPLACE / conditional replacement identified by property/provider analysis | 0 |

The 81 modifications are 77 resolver `PipelineConfig` updates, two nested `TemplateURL` updates, one API-key expiry and one codegen bucket-deployment `SourceObjectKeys` update. The 308 deletions are exactly 77 each of redundant invocation functions, AppSync data sources, IAM roles and IAM policies, all inside FunctionDirectiveStack. There are no Lambda, CDK metadata or template-envelope changes. Every action is listed in the [candidate diff](phase1-ntgre-artifact-evidence/live-to-candidate.json), with API-key physical identifiers redacted.

Replacement analysis uses the strongest non-mutating evidence available:

- Resolver identity properties (`ApiId`, `TypeName`, `FieldName`) are unchanged. AWS documents `PipelineConfig` updates as no interruption. [Resolver semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-appsync-resolver.html).
- API-key `ApiId` is unchanged; `Expires` supports no-interruption updates. [API-key semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-appsync-apikey.html).
- Nested stacks retain logical identity, parameters and dependencies; only template references change. `TemplateURL` is an in-place update property. [Nested-stack semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudformation-stack.html).
- The unchanged installed CDK bucket-deployment provider preserves the supplied physical ID on Update. Only `SourceObjectKeys` changes; service token and destination remain identical. Its `Prune=true` sync affects the generated codegen bucket, not user uploads. The regenerated bundle contains `model-schema.graphql`. Model-introspection deployment is unchanged.

This is a static, property-level replacement classification, **not an AWS-created change set or a guarantee against operational failure**. No change set was created. All stateful/protected resource definitions are identical, with replacement **NONE**. Provider behavior was read in installed `aws-cdk-lib/custom-resource-handlers/dist/aws-s3-deployment/bucket-deployment-handler/index.py`, particularly physical-ID handling and Update response.

### Accounting result — remaining blocker

| Metric | Live / reconstructed baseline | Candidate |
| --- | ---: | ---: |
| Hierarchy resources | 2,929 | 2,621 |
| FunctionDirectiveStack | 475 | 167 |
| Template instances | 62 | 62 |
| Largest candidate template | — | 167 |

The exact local comparison reports **0 adds / 80 updates / 308 deletes**, **1,233 checks passed**. Both Windows syntheses happened within the same expiry calculation interval, so their API-key expiry is equal. Live-to-candidate has the additional expiry update, producing 81. This explains the difference from the earlier local 81-update / 1,234-check run without weakening the comparator.

The unchanged accounting evaluator fails for Ntgre:

```text
Hierarchy 2621 exceeds action threshold 1800; fresh-create AWS ceiling is 2500
Debt allowance does not cover selected root
```

The first message occurs with the actual Ntgre baseline and no new exception. Applying the existing pinned exception also produces the scope error; its receipt digest still matches. The allowance does not cover this sandbox. Counts and accounting tests passing are distinct from **accounting policy approval**, which fails. [Full gate evidence](phase1-ntgre-artifact-evidence/accounting-gate.json).

There are 389 explicit changed resource records, concentrated in root/data/FunctionDirectiveStack. That is not an AWS-certified operation-size plan. The hierarchy total alone also does not establish the number touched by an update. No budget, receipt or exception was changed or bypassed. Fresh recreation is not an approved alternative.

## E. Protected resources

PASS means exact captured live-template definitions plus the applicable artifact checks; it does not claim a comprehensive AWS drift scan.

| Category | Result | Replacement |
| --- | --- | --- |
| Cognito pool, client, identity pool, role attachment and ten groups | PASS | NONE |
| 52 model tables and three native DynamoDB tables | PASS | NONE |
| Three buckets and bucket policies; two KMS keys | PASS | NONE |
| AppSync API and deployed GraphQL schema | PASS | NONE |
| All ten Lambda definitions, permissions and two layers | PASS | NONE |
| Five previously affected actual Lambda ZIPs | PASS, exact bytes | NONE |
| All ten baseline/candidate Lambda resources | PASS, exact local asset comparison | NONE |
| Team Hub gateways, authorization and state | PASS | NONE |
| Creator/Twitch and OverlaySource infrastructure | PASS | NONE |
| Payment/webhook infrastructure and shared-handler artifact | PASS | NONE |
| Three HTTP APIs, 36 routes, four integrations, three stages, authorizer | PASS | NONE |
| Retained IAM/auth wiring and generated output snapshot | PASS | NONE |
| External stacks/services | No proposed action; not separately audited | No proposed replacement |

[175 protected resource records and dependency checks](phase1-ntgre-artifact-evidence/dependency-protected-analysis.json), [all local comparison checks](phase1-ntgre-artifact-evidence/local-comparison-checks.json).

Existing Ntgre still uses pool `eu-north-1_n24iLL7QE`, client `1iq7ovjaf7d16imdvbqgfgvf86`, identity pool `eu-north-1:a3621b12-4773-4295-b232-b55863c37fd3`, AppSync `dxb2tdlulrch7hj2pts2mfijia`. This candidate **does not implement the requested master-pool linkage to `eu-north-1_Uufjxul58`**. That remains separate work; Cognito changes were expressly excluded here.

## F. Recovery readiness

259 scoped read-only API calls completed. Six returned expected absent S3 configuration errors; none returned AccessDenied. [Per-resource results](phase1-ntgre-artifact-evidence/recovery-readiness.json) include every table, bucket, key and secret-path metadata lookup. No secret values, user records or tokens were retrieved.

| Resource class | Actual observed status |
| --- | --- |
| 55 DynamoDB tables | All ACTIVE, deletion protection false. PITR disabled on 53; enabled with 35-day recovery periods on OverlayPublication and TwitchEventDeliveryDedupe. Earliest/latest restorable times are recorded. |
| DynamoDB backups | `list-backups` returned no backups for each table. AWS Backup returned no recovery points for all 55 tables. PITR recovery is separate from those empty backup listings. |
| Three S3 buckets | Versioning returned `{}` for each; Object Lock and lifecycle configuration absent. AWS Backup returned no recovery points. These are codegen, model-introspection and application-upload buckets. |
| Cognito | Deletion protection INACTIVE; estimated user count 0. Estimate is not permission to delete, and no user export/restore exercise occurred. |
| KMS | Both customer-managed keys Enabled, no deletion scheduled. IDs `8656fcfe-9dfc-4cdf-b345-12665950f337` and `76bd4f9a-72aa-4bb4-82b3-05a4fbc16673`. Template policies Retain/Retain. |
| Template retention | Pool/client/identity pool, all table declarations and buckets retain their existing Delete/Delete policies. These are existing recovery risks, not proposed deletions. |
| SSM metadata | Five generated resource-reference parameters exist. Sandbox PRINTFUL_API_KEY exists as SecureString; its shared fallback is absent. Both sandbox and shared fallback paths are absent for eight other configured secrets listed below. |

Absent secret names: `REVOLUT_API_KEY`, `REVOLUT_API_SECRET`, `REVOLUT_WEBHOOK_SIGNING_SECRET`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_OAUTH_STATE_SECRET`, `ALPHA_REWARD_EVENT_AUTH_SECRET`, `TWITCH_RUNTIME_AUTH_SECRET`. [Function/path dependency mapping](phase1-ntgre-artifact-evidence/secret-recovery-dependencies.json). This is a finding about configured SSM paths, not proof that no equivalent secret exists anywhere else. Functional smoke tests involving those integrations require resolving their existing configuration gaps separately.

Recovery limitations: no restore drill; no independent password/user recovery verification; no external/off-account backup search; no export of encrypted token data. Token-vault and overlay credentials require both their stored ciphertext and the original usable KMS keys/permissions. A source/template backup cannot replace missing data, user passwords or secret material. The lack of backups/protection is documented, not silently accepted as restored readiness or authorization to change settings. No stateful mutation is proposed by this consolidation, so these gaps do not explain the resource-accounting failure.

## G. Dependency/update ordering

**PASS for the static transition graph and documented CloudFormation semantics**, subject to the accounting NO-GO and the execution limits below. The graph analysis passed **735 checks**:

1. Each of 77 changed resolvers changes only its second pipeline function to an already-existing, unchanged retained anchor. All 79 authorization functions and resolver context/stash behavior remain intact; exact comparator checks also verify Lambda target and invocation mapping equivalence.
2. Every obsolete invocation function depends on its obsolete data source; each data source references its service role. Each obsolete IAM policy references that role. The only old consumers of each four-resource chain are its resolver and chain members.
3. Every one of the 308 deleted resources belongs to those 77 chains. No candidate resource, output or parameter reference points to a deleted logical ID. All 62 candidate dependency graphs are acyclic and have no dangling references.
4. All template parameters, outputs and other envelope fields are identical. Nested handles keep their parameters and dependencies; no cross-stack contract is removed. Only the root/data and data/directive template references change.

AWS documents intrinsic-reference dependency ordering and dependent-before-dependency deletion. Its update cleanup state removes old resources after successful updates. Applied to the verified graph, the supported sequence is resolver repointing first, then obsolete invocation ? data-source deletion, with data source and policy removed before their role. There is **no explicit policy-versus-data-source edge**; they can be removed in parallel during cleanup because no retained resolver uses that chain. Retained anchor policies and roles already exist unchanged. [Dependency rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-attribute-dependson.html), [update/cleanup states](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/view-stack-events.html).

This sequencing conclusion is an inference from the exact graph and published semantics, not a captured AWS execution schedule. IAM propagation, service failures and out-of-band drift are not eliminated by template analysis. No service-level drift detection or deployment was run. Future execution must observe actual resolver update and cleanup events; it must not manually delete chains ahead of CloudFormation.

## H. Rollback strategy

| Failure point | Recommendation |
| --- | --- |
| Before submission or during local synthesis/asset preparation | STOP. Existing environment remains authoritative; no rollback is needed for a change never submitted. |
| Resolver update fails before cleanup completes | Prefer CloudFormation's normal **ROLLBACK** to its existing template and resolver references. Do not manually remove obsolete chains or start another update mid-rollback. |
| Obsolete-resource deletion fails during cleanup | Inspect actual events/status and the affected IAM/AppSync resources. Prefer resolving cleanup and **ROLL-FORWARD** to the validated consolidated state once CloudFormation permits it; do not blindly submit the baseline. |
| UPDATE_ROLLBACK_FAILED | Stop new deployments; inspect and repair the specific rollback failure through a separately authorized recovery action. Do not delete/recreate the sandbox or skip protected resources as a shortcut. |
| UPDATE_COMPLETE but functional regression | Prefer a narrowly reviewed **ROLL-FORWARD** preserving retained chains if the fault can be corrected safely. If restoration of old wiring is necessary, treat a baseline update as a separate expansion requiring fresh accounting/permission review. |

Restoring the old layout adds 308 resources and restores FunctionDirectiveStack from 167 to 475 and the hierarchy from 2,621 to 2,929. The directive template is below AWS's 500-resource limit and the repository's hard gate of 481, but above its action threshold and close to the ceiling. Missing roles/functions may require recreation; their physical identifiers need not remain the same. Live dependencies supply the creation order: role/policy availability, data source, invocation function, then resolver repointing. The baseline lacks an explicit data-source-to-policy dependency, so IAM propagation and policy availability must be watched rather than assumed instantaneous.

Captured live templates and exact packages preserve infrastructure/code evidence, not database or upload recovery. A codegen deployment rollback may resync generated schema assets; original asset availability and stack status must be rechecked before recovery. No rollback or roll-forward was executed.

## I. Candidate integrity and validation

The isolated candidate matches all **1,128 exact raw file hashes** before and after validation against `docs/architecture/phase1-reproducibility-evidence/candidate-manifest.json`. Manifest SHA256: `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`. Concurrent SWG frontend work is excluded. No application source, comparator, authorization, receipt, budget, Cognito or package version was changed. [Integrity record](phase1-ntgre-artifact-evidence/candidate-integrity.json).

| Fresh validation | Result |
| --- | --- |
| Independent baseline/candidate npm ci | PASS / PASS |
| Correct-layout Windows synthesis | PASS / PASS |
| Baseline/candidate infrastructure and protected comparison | 1,233 checks PASS; 10 Lambda resources verified |
| Actual live ZIP comparison | 10/10 exact, five functions × two builds |
| Dependency/protected analysis | 735 checks PASS |
| Handler consolidation tests | 2 passed |
| Amplify guards | 16 passed |
| Team Hub backend tests | 47 passed |
| Resource-accounting tests | 24 passed |
| Amplify contracts | PASS |
| Backend TypeScript check | PASS |
| Production build | PASS; existing chunk-size/plugin-timing warnings |
| Manifest before / after | PASS / PASS |
| Ntgre accounting policy gate | **FAIL — unapproved root scope / hierarchy debt** |

Fresh targeted tests total **89 passed, 0 failed, 0 skipped**. These are not a rerun of the prior 653-test suite. The prior 653/653 result remains tied to its recorded snapshot. Build-only environment used the isolated snapshot's API endpoint and `VITE_REVOLUT_MODE=sandbox`, `VITE_REVOLUT_PUBLIC_KEY=validation-only`; it performed no payment or backend runtime smoke test. [Validation ledger](phase1-ntgre-artifact-evidence/validation-ledger.json) and individual logs preserve commands/results.

## J. Final decision

**NO-GO to deployment of this candidate to existing Ntgre.**

The artifact mismatch is fully resolved, protected resources are unchanged, no stateful replacement is identified, and the static dependency transition passes. The exact candidate and recovery risks are documented. The remaining concrete blocker is the **unchanged accounting gate**: Ntgre is outside the existing pinned debt allowance and its 2,621-resource hierarchy fails without a valid target-specific allowance.

Resolving that blocker requires an explicit reviewed decision for the exact Ntgre update and its resource debt, without pretending that the current master/staging allowance already covers it. This task forbids changing budgets or accepted receipts, so none was extended. Any later decision must recheck target identity, live templates, package hashes, candidate integrity, recovery findings and gate scope before execution. Shared master Cognito linkage is still a separate change.

No deployment command is proposed as executable under this NO-GO. Work stops at this report as requested. All changes from this investigation are documentation/evidence and local preflight tooling. AWS infrastructure, assets, users, data and protections remain untouched by this task.
