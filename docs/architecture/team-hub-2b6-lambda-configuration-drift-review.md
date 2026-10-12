# Project Respawn Team Hub 2B6 — Lambda configuration drift review

9 October 2026. **LAMBDA CONFIGURATION RECOVERY BLOCKED.** Both Lambda environments are confirmed MODIFIED by CloudFormation drift inspection. A drift-aware reconciliation request is prepared offline, but its provider-read permission prerequisites remain unresolved. No change set was created, no repair retried, and no resource, IAM, data or frontend configuration was changed. Two resource drift inspections refreshed diagnostic metadata only.

## Confirmed state

Read-only identity: `arn:aws:iam::058264289478:user/RavenTest`, account 058264289478, region eu-north-1. Team Hub product and security are UPDATE_COMPLETE, with 48 and 7 resources. This status does **not** establish runtime health or IN_SYNC configuration.

Physical functions are `ProjectRespawn-TeamHub-Ntgre-ParityRead` and `ProjectRespawn-TeamHub-Ntgre-ParityCommand`. Both are Active / Successful, last modified 2026-10-08T22:25:10Z, and retain ZIP SHA-256 `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`. Neither inspection returned Environment.Error.

Both actual maps contain exactly eight existing entries: EXPECTED_ISSUER, EXPECTED_POOL_ID, EXPECTED_CLIENT_ID, TEAM_HUB_RUNTIME, TEAM_HUB_VERIFICATION, TEAM_HUB_AUTHORITY, TEAM_HUB_STAGE and TEAM_HUB_NORMAL_WRITES. Values preserve Ntgre authentication, verification DISABLED, LEGACY_WRITER, PRE_CUTOVER and normal writes DISABLED; TEAM_HUB_RUNTIME is read or command. Full non-secret desired, actual and proposed maps are in [inspection.json](team-hub-config-drift-evidence-2026-10-09/inspection.json).

| Missing variable | Read | Command | Desired value |
|---|---|---|---|
| TEAM_HUB_BUSINESS_RUNTIME | Yes | Yes | AUTHORITY_GATED_V1 |
| CORE_CONTRACT_ARN | Yes | Yes | Accepted Ntgre Core Contracts Lambda ARN |
| CORE_ENVIRONMENT | Yes | Yes | Accepted environment.v1 JSON, account/region/pool/client/issuer |
| TEAM_CURSOR_SECRET_ARN | Yes | No | Existing Team-owned Cursor secret reference |

CloudFormation reports precisely these four/three REMOVE differences under Environment/Variables; both resources are MODIFIED. The current desired template already contains every missing variable. The preceding accepted endpoint artifact has the eight-variable configuration. That previous template is the verified preserved rollback artifact, not a fabricated historical GetTemplate response. The prepared repair is the same returned template from the unexecuted empty change set. Its only template changes are whitespace inside the two CORE_ENVIRONMENT strings; parsed JSON is identical. [Complete comparison](team-hub-config-drift-evidence-2026-10-09/template-comparison.json).

## Zero-change explanation and history

Confirmed: AWS returned zero Changes for the traditional repair change set, despite receiving the expected template. Template-level JSON whitespace differs, but the intended configuration values were already declared in the previous deployment. Traditional change sets compare templates, not actual resource drift. This explains why a missing live value need not generate a change. The exact internal reason the whitespace difference was omitted remains unproven; no provider transform explaining normalization was exposed by DescribeType. Do not describe whitespace normalization as a demonstrated AWS implementation fact. [AWS reconciliation documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/drift-aware-change-sets.html).

CloudTrail records UpdateFunctionConfiguration for both functions at 22:25:04Z on 8 October, followed by UpdateFunctionCode at 22:25:10Z, all through ReadProofExecution / AWSCloudFormation, without recorded API errors. CloudFormation marked both UPDATE_COMPLETE around 22:25:16Z. Thus the configuration calls were not simply skipped. The exact three-minute provider window contains 21 AccessDenied Decrypt events under the execution role and two other matching successful events. Those historical denies corroborate the already corrected KMS blocker; they do not establish the provider's internal failure/stabilization sequence or prove current decryption works.

[History](team-hub-config-drift-evidence-2026-10-09/history.json) fully enumerates the two versioned Lambda update event names from 8 October 00:00Z through its recorded collection end; no other updating principal was observed there. Its broad Decrypt search hit the 50-page safety limit and is explicitly incomplete. The separate [provider-window audit](team-hub-config-drift-evidence-2026-10-09/history-provider-window.json) completed pagination for 22:24–22:27Z. No claim of global absence of other mechanisms is made. CloudTrail omits Environment from UpdateFunctionConfiguration, so empty recorded request-variable names do not prove an empty submitted map. [AWS CloudTrail documentation](https://docs.aws.amazon.com/lambda/latest/dg/logging-using-cloudtrail.html).

## Recovery comparison

| Option | Assessment |
|---|---|
| A — meaningful CFN configuration update | Desired values are already correct. No justified new variable/value or runtime change was found. Reject arbitrary toggles and whitespace retries. Preferred variant is native drift-aware reconciliation of actual state to the existing intended values. |
| B — two-step CFN transition | Remove the missing additions from desired state, inspect/execute alignment, then add them back. First state matches the current fail-closed but unhealthy runtime; second is a real template delta. Adds two deployment gates, artifact-binding review and recovery complexity. Not pinned for execution. |
| C — direct Lambda patch then reconcile | Could set exact maps, but is out-of-band, needs separate authorization and verification. Not selected or executed. |
| D — accepted endpoint rollback | Available pinned recovery fallback, but reverts runtime code and more product resources; broader than an environment repair and cannot silently remove retained resources. Requires a separately inspected rollback plan. Never restore obsolete blocked security automatically. |

The preferred investigation candidate uses `DeploymentMode: REVERT_DRIFT`. It compares actual, previous and desired state and can restore missing variables without changing code or inventing configuration. This is a **new reconciliation request**, not execution/retry of the old traditional change set. It intentionally reuses the approved product bytes and allowed artifact URL. AWS applies this mode across the stack, so unrelated drift is a material stop condition. Failure rollback restores actual pre-deployment state, which here may restore the unhealthy environment; it is not a promise to restore the accepted endpoint. [AWS mode and rollback semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/drift-aware-change-sets.html).

## Security blocker and pinned draft

The live Lambda resource schema declares GetFunction, GetFunctionCodeSigningConfig, GetFunctionRecursionConfig, GetRuntimeManagementConfig, GetFunctionScalingConfig and kms:Decrypt for reads. Actual-role simulation permits GetFunction, recursion/runtime-management reads and UpdateFunctionConfiguration. **GetFunctionCodeSigningConfig and GetFunctionScalingConfig are implicitDeny for both functions.** Installed identity and boundary lack those Allows. Missing simulator context names concern unrelated conditional statements; no matching Lambda Allow exists for these operations. Whether this provider invokes both optional-property reads for these functions is unresolved; schema declaration alone is not a captured live AccessDenied. The successful operator drift inspection does not prove the restricted execution role can perform the same reconciliation.

Do not broaden IAM to discover the answer. Separately review whether those operations are required, the exact execution principal used by drift-aware planning, and any other whole-stack read prerequisites. If narrow policy changes are justified, prepare a new independently reviewed security candidate. No such policy candidate is authorized or installed here. Existing Lambda-key exception and Secrets Manager restrictions remain unchanged; no KMS Allow, runtime IAM, Cognito, Core or cross-domain permission changes.

[Mode permission evidence and Analyzer](team-hub-config-drift-evidence-2026-10-09/mode-security.json). [New immutable draft manifest](team-hub-config-drift-evidence-2026-10-09/artifact-manifest.json), [request — DO NOT RUN](team-hub-config-drift-evidence-2026-10-09/draft-create-change-set.json).

| Pin | SHA-256 |
|---|---|
| New blocked candidate | 69e5df290a4a7494120861979a75da1f1ef985ad9453f1c062fdf7851cbab56d |
| Product, preserved | 38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f |
| Installed security, preserved | 8ff956315649ea5741040f7da2347a0d84dea4af0f6b43226f8f027c6bd1db27 |
| Runtime, preserved | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |
| Endpoint rollback product | 5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9 |

## Required future inspection and acceptance

After resolving security prerequisites and receiving separate preparation authorization, create a new drift-aware UPDATE change set using the pinned request. Read every page with property values and retrieve its template. Require DeploymentMode REVERT_DRIFT and exactly ParityReadFunction plus ParityCommandFunction modifications, only Environment, with actual-state before-values accounting for all seven missing entries. Require zero additions, deletions, replacements, conditional replacements, code changes or unrelated/ignored/unsupported drift. Abort on empty changes, denied/incomplete discovery or any extra resource. Offline tests cannot guarantee that AWS will generate this result.

Only separately authorized execution may follow a passing inspection, with rollback enabled. Wait for both functions to stabilize and compare exact full maps and code hashes. Require authenticated authority 200 with LEGACY_WRITER/1/1, all 16 normal routes 403, empty target state, Core compatibility, D1 log/metric correlation and no unexpected 5xx. Cursor decryption remains a distinct approved isolated proof; do not retrieve the secret here. Any failure stops without direct patches or permission retries. Recheck protected domains, source protections, frontend and fence. Do not enter FROZEN or TARGET_WRITER.

If deployment fails, allow CFN rollback and preserve audit history; then inspect actual function maps rather than infer restoration from status. If service recovery requires the old endpoint, use its preserved product/ZIP references under a new rollback gate, retaining the installed execution-security correction and inspecting all resource effects first.

## Validation and preservation

441 offline tests passed: configuration 11 (all 16 deployed dark routes plus three unpublished branding contracts denied), security 7, cursor 16, business/epoch 21, Core 22, accounting/isolation 75, Team/privacy 273 and monitoring 16. Ledger and TypeScript passed. Production build passed with existing missing /css/styles.css and large-chunk warnings. These are local proofs, not live endpoint acceptance. [Regression receipt](team-hub-config-drift-evidence-2026-10-09/regressions.json), [build](team-hub-config-drift-evidence-2026-10-09/build-result.json).

100 accepted actual-role IAM controls passed; all four installed role/boundary pairs match pins. Access Analyzer: three policies, zero findings. Provider-read checks expose the blocker above; they are not counted as deployment-ready success. Secret-pattern scan is recorded separately in [scan receipt](team-hub-config-drift-evidence-2026-10-09/secret-scan.json). No secret value, browser token or credentials were retrieved.

Fresh template preservation: Legacy 2,621 / FunctionDirectiveStack 167, all 62 templates unchanged; Team Hub 48+7; Core 8+5; Tournament 11. [Preservation](team-hub-config-drift-evidence-2026-10-09/protected-after.json). Strongly consistent authority remains LEGACY_WRITER epoch/version 1; Operational 0 and Journal 15 historical audits plus one control row. Four empty source tables retain recovery protections/backups; logo state and source fences unchanged. [Inventory](team-hub-config-drift-evidence-2026-10-09/after/inventory.json), [fence evidence](team-hub-config-drift-evidence-2026-10-09/source-fence-preservation-after.json). Frontend remains Legacy; production untouched. AWS resource/configuration writes: 0; drift diagnostic checks: 2.

**LAMBDA CONFIGURATION RECOVERY BLOCKED**
