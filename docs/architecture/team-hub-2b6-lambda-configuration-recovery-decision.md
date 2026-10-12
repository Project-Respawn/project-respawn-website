# Team Hub 2B6 — Lambda configuration recovery decision

**Qualified Lambda ARN security correction (9 October 2026): READY FOR EXECUTION REVIEW — NOT DEPLOYED.** Exact `$LATEST` update grants and matching explicit-deny exceptions prepared for Read and Command only. 109 AWS IAM controls, two old-policy denial controls and zero Access Analyzer findings; fixed workflow/maps/revisions/code and KMS restrictions preserved. Current functions remain incomplete; LEGACY_WRITER and live frontend unchanged. Recovery requires separate authorization. [Candidate, exact pins, evidence and future execution gates](team-hub-2b6-qualified-lambda-arn-security-review.md). Earlier entries below are historical.


**Lambda configuration recovery execution (9 October 2026): FAILED; temporary executor removed.** The single pinned workflow stopped on an explicit identity-policy denial for the Read function `:$LATEST` ARN. Command was never attempted. Full readback confirms both configurations/revisions/code unchanged and both Environment properties still MODIFIED. Authority remains LEGACY_WRITER epoch/version 1; business state empty, protected domains preserved. No retry or IAM patch. Qualified-ARN coverage requires separate security review; application/monitoring recovery acceptance and isolated AWS transaction/cursor proofs remain outstanding. [Execution result, cleanup and evidence](team-hub-2b6-lambda-configuration-recovery-result.md). Earlier entries below are historical.


9 October 2026. **LAMBDA CONFIGURATION RECOVERY PLAN READY FOR EXECUTION REVIEW.** Recommend **B: direct environment-only recovery through a fixed, temporary, security-owned Step Functions workflow**. This is a prepared plan, not an executed repair. No AWS resource/configuration writes, artifact publication, IAM installation, change-set creation or workflow execution occurred.

## Confirmed scope

Fresh identity/account: RavenTest / 058264289478; eu-north-1. The only confirmed repair targets remain ParityReadFunction and ParityCommandFunction Environment. CloudFormation desired template still matches product SHA `a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad`. Read lacks four variables, Command three. Both functions remain Active / Successful with business ZIP SHA `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`. Complete installed configurations, physical identities, desired resolved maps and fresh environment-only drift are preserved in [inspection](team-hub-recovery-decision-evidence-2026-10-09/inspection.json).

The preceding full-stack inspection separately recorded three log-group UNKNOWN results and three unsupported API integrations. These are coverage limitations, **not confirmed drift**. This task refreshed the two function diagnostics; it does not relabel the preceding six uncertain resources IN_SYNC. A targeted direct repair does not reconcile those resources.

## A — CloudFormation REVERT_DRIFT remains technically possible

CreateChangeSet supports DeploymentMode REVERT_DRIFT together with TemplateURL; UsePreviousTemplate is not required. [AWS API](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html). The caller already permits the exact reviewed URL ending `team-hub/config-repair/38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f.template.json`. Fresh HeadObject returns its matching SHA-256 checksum, and actual-caller simulation allows CreateChangeSet with that URL and the required execution-role ARN. No publication or artifact-access broadening is needed. [Binding proof](team-hub-recovery-decision-evidence-2026-10-09/template-binding.json).

That reviewed artifact differs from current desired bytes only in CORE_ENVIRONMENT JSON whitespace in the two functions; the contract, member order and parsed values are equivalent. It must be used as its reviewed bytes, not overwritten with a48e bytes under a hash-labelled key. If publication were required later, publish only the exact hash-matching reviewed bytes under their approved key after fresh authorization; do not overwrite historical content or repurpose the key. The prepared [CloudFormation alternative request](team-hub-recovery-decision-evidence-2026-10-09/cfn-alternative-request.json) uses the existing approved URL. This corrects the previous draft's unnecessary UsePreviousTemplate binding obstacle.

The remaining whole-stack read issue is real: `logs:DescribeIndexPolicies` supports selecting log-group identifiers in the request, but AWS's IAM mapping does **not** support resource-level restriction for that action. A functioning Allow needs Resource `*`; specifying only the three log-group ARNs would not provide the intended permission. No such grant was prepared or installed. [Logs authorization mapping](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html), [request-level filtering](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeIndexPolicies.html).

GetFunctionScalingConfig remains inapplicable to these standard $LATEST Zip functions without a capacity provider. The exact code-signing-discovery branch for a future reconciliation is unproven. Neither disputed Lambda read is granted. Option A would still need separately reviewed discovery prerequisites and an AWS-generated preview proving exactly two Environment modifications, no unrelated changes, replacements, additions or deletions. Those counts have not been generated.

## B — selected temporary direct recovery

Prepare two temporary resources only, under a dedicated security-owned recovery stack: one IAM role and one STANDARD Step Functions state machine, named `ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009`. Both must be absent before eventual creation. These do not belong to the 48-product/7-security Team Hub stacks and are removed after evidence preservation.

The role trusts **only states.amazonaws.com**, with exact source account and exact state-machine ARN conditions. No human, ordinary deployment caller or runtime role can assume it through that trust. The approved security custodian (RavenTest identity, subject to fresh permission verification) provisions, inspects, starts and removes the temporary resources. It must not grant other principals UpdateStateMachine, PassRole or role-policy modification access. CloudTrail plus sanitized STANDARD execution history provide audit evidence. Logging/X-Ray delivery is disabled to avoid new logging permissions; no credentials or cursor-secret value enter the definition or history.

The temporary role permits only:

- lambda:GetFunctionConfiguration and lambda:UpdateFunctionConfiguration on the exact two existing ParityRead/ParityCommand ARNs.
- kms:Decrypt on exact AWS-managed Lambda key `13ae83f9-bc5f-4486-a013-e07b9d7d52e7`, constrained to Lambda ViaService, account 058264289478, and either exact function ARN encryption context for environment readback.

Explicit denials cover every other action, foreign Lambda resources/keys, wrong service/account/function context, wrong region and access outside the execution window. There is no code update, invocation, PassRole, DynamoDB, Secrets Manager, Cognito, KMS administration or provider-discovery grant. Existing execution/runtime roles, boundaries, managed-key policy and accepted KMS correction are untouched. This narrow **new temporary** decryption Allow is not a grant to normal runtime/deployment roles. Simulator results are not live decryption proof; any unanticipated KMS failure stops without broadening permissions.

IAM cannot restrict UpdateFunctionConfiguration to Environment request fields. The control enforcing that restriction is the **fixed service-only workflow**, its exact trust and security-owner custody—not a fictional IAM condition. The definition rejects nonempty execution input, has no caller-controlled function/map/revision substitutions, and contains exactly two static update tasks. Each request contains only FunctionName, RevisionId and the full Environment.Variables map. [Definition](team-hub-recovery-decision-evidence-2026-10-09/recovery-workflow.json), [temporary template](team-hub-recovery-decision-evidence-2026-10-09/recovery-security.template.json).

## Exact maps and concurrency

| Function | RevisionId | Complete desired map |
|---|---|---|
| ProjectRespawn-TeamHub-Ntgre-ParityRead | 4491176f-baaa-4180-8aa2-0e6e96bc51a8 | 12 variables; [request](team-hub-recovery-decision-evidence-2026-10-09/read-request.json) |
| ProjectRespawn-TeamHub-Ntgre-ParityCommand | 50dc3a50-7388-467f-a302-1bf33cd051cf | 11 variables; [request](team-hub-recovery-decision-evidence-2026-10-09/command-request.json) |

Maps equal CloudFormation's resolved expected Environment values, including exact CORE_ENVIRONMENT string bytes and existing CursorSecret physical reference. They preserve every existing variable; they are not missing-key patches. The runtime is not rebuilt. Memory, timeout, architecture, VPC, layers, runtime, roles, logging and all other configuration fields are omitted from update requests and must remain equal to their reviewed snapshots.

Before future execution, use the pinned [guards](../../scripts/team-hub-recovery-decision/guards.mjs) to compare fresh complete configurations with the reviewed snapshots and validate exact request keys/maps. A different or missing RevisionId stops and requires re-review/repinning; do not silently refresh it. The workflow repeats RevisionId/code hash/state checks before each update. Lambda's conditional update closes the read/write race: a revision mismatch is an abort, not a retry. [RevisionId API behavior](https://docs.aws.amazon.com/lambda/latest/api/API_UpdateFunctionConfiguration.html).

## Separately authorized execution sequence

1. Reverify every manifest hash, account/region/operator permission and temporary-name absence. Compare desired template, exact physical function identities, full current configurations, revisions, code, roles and boundaries. Require authority LEGACY_WRITER/epoch 1/version 1, Operational business count 0, no Journal business records, Legacy frontend and no source fence. Refresh protected-domain/recovery baselines. Any discrepancy stops.
2. Bind fresh UTC NotBefore and ExpiresAt parameters with at least two minutes provisioning lead and a window no longer than 15 minutes. The guard checks these constraints; CFN parameter patterns alone do not enforce the duration. Preserve a hashed parameter receipt and actual instantiated policy for inspection. No default or stale window is executable. The role's one-hour minimum MaxSessionDuration does not extend permissions: explicit date denials apply to existing sessions after expiry.
3. Under separate authorization, prepare and inspect the temporary security stack change set: exactly role + state machine additions, no existing-domain modifications. Validate instantiated policy, trust, workflow hash, custody, time-window positive/negative controls and rollback/cleanup permission. No new administrator grants. Rollback enabled for temporary infrastructure provisioning. If anything differs, do not execute.
4. After separately authorized provisioning, inspect actual installed policies/trust/definition. Recheck external preflight, then start the fixed workflow exactly once with `{}` within its window. The workflow reads/checks Read, submits its static map once, polls until successful, checks its expected values/hash/role, then repeats for Command. It has a ten-minute overall timeout and no Retry clauses. Authentication, authority, counts and full property preservation remain external mandatory gates; the temporary identity intentionally has no DynamoDB/authentication permissions.
5. An error, revision mismatch, timeout, failed update or ambiguous response stops. Do not restart automatically. If Read succeeds and Command fails, retain the healthy Read state; record partial completion and obtain a new reviewed decision. Expiry may prevent workflow readback; the security operator then performs read-only inspection, never a hidden retry.
6. Strongly verify authority remains LEGACY_WRITER/1/1. Compare complete installed maps and all non-environment properties/code hashes, not only the workflow's subset checks. Require authenticated authority 200, all 16 deployed business routes 403, empty target business state, unchanged Core/D1 monitoring and no unexpected API 5xx. Verify actual KMS/environment readback; cursor-secret decryption remains a separate approved proof.
7. Detect drift on precisely the two function logical IDs. Require IN_SYNC for supported declared properties. Re-read the stack template and compare its original pin; compare code hashes independently because drift detection excludes code. Applying values already declared in CloudFormation should remove the environment drift without updating its template, but this must be proven by live readback and diagnostics. Do not claim whole-stack IN_SYNC while unrelated UNKNOWN/unsupported coverage remains.
8. Preserve sanitized execution history, request hashes, CloudTrail correlation and post-state evidence. Remove only the exact temporary role/state machine through their dedicated stack; never touch the product stack, authority record or business tables. Verify both resources absent. Report and stop if cleanup fails.

## Interruption, rollback and option comparison

Both functions currently return configuration-related 503s on affected paths. Read can recover before Command; functions are not updated atomically. Allow for Lambda stabilization/cold starts and transient 503 responses; do not promise zero downtime. No new business authority is enabled: LEGACY_WRITER remains authoritative and normal target writes stay denied.

Do **not** automatically restore the old eight-variable maps: those are the known unhealthy configuration. There is no direct-repair rollback task. On failure preserve the resulting state/evidence and choose, under separate review, a corrected request or the accepted endpoint product/runtime rollback. That fallback remains pinned, requires its own complete resource/retention inspection and must preserve installed execution KMS correction. Temporary-stack rollback/cleanup is distinct from undoing function updates; deleting the executor does not revert repaired environments.

| Consideration | A: REVERT_DRIFT | B: fixed temporary direct recovery |
|---|---|---|
| Security scope | Whole-stack discovery and existing CFN executor; unscopable Logs list permission remains unresolved | Two exact functions; narrow environment-readback key path; temporary service-only identity |
| Artifact binding | Existing approved URL works; no republishing needed | Exact current desired maps; no product publication or template changes |
| Complexity | Fewer temporary resources, but unresolved discovery plus full change-set review | Two temporary resources, fixed workflow, date/revision gates and explicit cleanup |
| Interruption | Provider update/stabilization sequence; complete preview required | Sequential environment-only updates; stop after first failure |
| Rollback | Can restore the unhealthy actual pre-update maps | No automatic unhealthy rollback; preserve partial repair for reviewed decision |
| Consistency | CloudFormation-managed reconciliation | Restore already-declared values, then prove function IN_SYNC |
| Time to verification | Blocked on broader discovery review | Prepared bounded path; still requires authorization and live gates, no duration guarantee |

## Pins and validation

| Candidate | SHA-256 |
|---|---|
| Recovery plan candidate | 96aef8d391c6de52d8ad824f7e1e5bf80436cff9e5ef2a7f96a851c6df51db1a |
| Temporary security template | 9a61c017c98635553f710feee28a0b39aabdc2d49f6a68a1e15c4456fd37b164 |
| Fixed workflow | 862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376 |
| Read request | 048e5028ea500173b3fdeed123d43dcb1d649590466fafd976f006308a5993b7 |
| Command request | b92e1d40d6a3dc068ff9ea71c25805f3d747eb87a35afba31eac32e5fd153c51 |

[Manifest and preserved rollback artifacts](team-hub-recovery-decision-evidence-2026-10-09/artifact-manifest.json). Installed security remains `8ff956315649ea5741040f7da2347a0d84dea4af0f6b43226f8f027c6bd1db27`; product/runtime hashes above are unchanged.

Fresh validation: 454 offline tests passed, including full-map equality against AWS drift expected properties, stale/missing RevisionId and changed-property rejection, fixed workflow safety, exact desired-map initialization/authority regression, all 16 deployed dark routes (plus three unpublished contract routes), Core/privacy/epoch/KMS/accounting/isolation. TypeScript and ledger passed. [Tests](team-hub-recovery-decision-evidence-2026-10-09/regressions.json).

41 temporary-policy IAM controls passed; 100 installed-role KMS/PassRole/artifact/rollback controls passed. Access Analyzer: temporary identity + trust, zero findings. AWS state-machine definition validation: OK, zero diagnostics. CloudFormation ValidateTemplate accepted the temporary template; this is not a generated change set or live IAM/decryption proof. Initial validation harness errors (wrong resource type for PassRole and CLI service spelling) were corrected without changing permissions. [Security validation](team-hub-recovery-decision-evidence-2026-10-09/security-validation.json), [installed regressions](team-hub-recovery-decision-evidence-2026-10-09/installed-security-simulations.json). Trust/definition checks do not simulate actual STS service assumption; installed trust and live service/KMS behavior remain execution gates.

Fresh preservation: Legacy 2,621 / FunctionDirective 167, all 62 templates unchanged; Team Hub 48+7; Core 8+5; Tournament 11. Authority unchanged LEGACY_WRITER/1/1; Operational 0, Journal 15 audits + one control row; source tables/logos empty, backups/protections intact and source fences unchanged. [Inventory](team-hub-recovery-decision-evidence-2026-10-09/after/inventory.json), [protected templates](team-hub-recovery-decision-evidence-2026-10-09/protected-after.json), [authority](team-hub-recovery-decision-evidence-2026-10-09/authority.json), [fence](team-hub-recovery-decision-evidence-2026-10-09/source-fence-preservation-after.json). No secret value, tokens or credentials were retrieved. [Secret scan](team-hub-recovery-decision-evidence-2026-10-09/secret-scan.json).

No live frontend switch, business cutover, production changes or Legacy retirement. No AWS resource/configuration writes; two targeted drift diagnostic requests only. Preparation readiness does not authorize provisioning or recovery.

**LAMBDA CONFIGURATION RECOVERY PLAN READY FOR EXECUTION REVIEW**
