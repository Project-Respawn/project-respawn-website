# Phase 1 Ntgre final execution gate and deployment evidence — 26 September 2026

**PHASE 1 DEPLOYMENT SUCCESSFUL.** The existing Ntgre change set completed successfully. The root and all five affected child stacks reached UPDATE_COMPLETE, with no failures or rollback. All post-deployment checks described below passed.

The user explicitly authorized execution of the existing `ntgre-phase1-pinned-20260926` change set only after a successful final gate. Account `058264289478`, region `eu-north-1`, identity `arn:aws:iam::058264289478:user/RavenTest`, existing root `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`. Production is outside scope.

The reviewed scope is 0 additions, 114 modifications, 308 removals, 23 Lambda permission replacements and one conditional codegen custom-resource replacement. The existing change-set ARN ends `92dd723b-539b-468a-a6fc-6c7377afdc95`. No new change set, synthesis, candidate modification, manual policy change or second deployment is authorized.

## Rollback and post-failure procedure

The sole execution path must call `aws cloudformation execute-change-set` with the exact existing change set and root, default profile, `eu-north-1`, and **`--no-disable-rollback`** explicitly present. No CDK deployment wrapper or inherited rollback default is used. The root's pre-existing `DisableRollback=true` must not select execution behaviour. This option requests CloudFormation rollback on failure; successful rollback itself cannot be guaranteed. [AWS execution options](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/execute-change-set.html).

Monitor the root and all five affected child stacks. Persist events including logical/physical IDs, statuses, reasons, client request tokens and timestamps. For permission replacements, distinguish new-ID creation from old-ID cleanup and record their ordering. Observe the codegen Update response through resource events and its resulting physical ID/object content.

If an update fails, continue observing automatic rollback until a terminal state; do not repair resources or redeploy. Record every failed resource and its exact status reason. If rollback fails, preserve that terminal status and report it without automatically calling ContinueUpdateRollback or skipping resources.

After rollback, read back the original root/nested templates and resource inventory, all five Lambda code hashes, protected Cognito/AppSync/table/bucket/key identities, permission statements, IAM/API configuration and the old codegen object hash. Compare against this stage's saved pre-execution evidence. Report any resources or configuration not restored. Preserve the events and failure evidence, and stop. Do not start a second deployment without separate authorization.

After UPDATE_COMPLETE, compare all deployed templates to the preserved pinned assembly and validate 2,621 total resources, 167 in FunctionDirectiveStack, exactly the 308 reviewed deletions and no unexpected identity loss. Check replacement permissions, policy quota, all five code hashes, stateful identities, IAM/API configuration, codegen content and relevant repository/safe live smoke checks. Do not alter application code to obtain passing results.

Raw evidence for this stage is stored in ignored `.amplify/phase1-execution-20260926/`. The gate and actual outcome follow. Previous readiness, change-set and discrepancy reports are preserved.

## Final execution gate, issued before execution

The complete gate was displayed to the user before the sole execution call. [Recorded gate](phase1-ntgre-execution-evidence-2026-09-26/final-gate.json).

| Field | Result |
| --- | --- |
| AWS account / identity / region | 058264289478 / arn:aws:iam::058264289478:user/RavenTest / eu-north-1 |
| Stack before execution | amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332; UPDATE_COMPLETE |
| Existing change set before execution | ntgre-phase1-pinned-20260926; CREATE_COMPLETE / AVAILABLE; unexecuted |
| Reconciled scope matched | 0 additions; 114 modifications; 308 removals; 23 replacements; 1 conditional |
| Live templates / identities | 62/62 templates unchanged; all 2,929 identities matched |
| Lambda hashes | 5/5 matched |
| Protected resources | Verified, including all 55 tables, Cognito pool/client/identity pool, AppSync, three buckets and two KMS keys |
| IAM / API / codegen provider | Unchanged; 36 routes and 79 custom resolver pipelines checked |
| Main policy / quota | 9,734 / 20,480 bytes |
| Required full overlap / remaining margin | 19,415 / 1,065 bytes; unchanged from review and safe |
| Rollback | Explicit --no-disable-rollback; false value recorded in execution request |
| Production / unexpected drift / blockers | No / none found in reviewed checks / none |
| Decision | READY TO EXECUTE EXISTING CHANGE SET |

The execution helper repeated identity, root status, root change-set contents and both permission policies immediately before calling AWS. Its fixed command contained --no-disable-rollback and used the existing default profile/region. A local execution-request record prevented a second invocation. No new change set, synthesis or CDK deploy command was used.

## Actual execution result

| Field | Result |
| --- | --- |
| Final root status | UPDATE_COMPLETE |
| Final change-set status | CREATE_COMPLETE / EXECUTE_COMPLETE |
| Execution start (AWS event, UTC) | 2026-09-26T11:52:06.391000+00:00 |
| Execution completion (AWS event, UTC) | 2026-09-26T11:56:20.177000+00:00 |
| Resources before / after | 2,929 / 2,621 |
| FunctionDirectiveStack before / after | 475 / 167 |
| Deleted resources | 308, exactly the reviewed set |
| Unexpected deletions | 0 |
| Actual replacements | 0 |
| Permission validation | All 23 reviewed statements present, semantically identical, with original physical IDs |
| Policy quota | myFunction 9,734 bytes; twitch-runtime 981 bytes; each below 20,480 |
| Codegen | In-place Update; original physical ID retained; expected new schema object present |
| Protected resources | All 62 directly checked protected/stateful resources preserved, including 55 tables; auth client/identity pool and ten groups also confirmed |
| Lambda verification | 5/5 code hashes unchanged; functions Active / Successful |
| IAM/API | Effective policies, environments, integrations, JWT configuration and all 36 routes unchanged |
| AppSync pipelines | All 79 custom pipelines match pinned templates; 77 reviewed pipeline changes completed |
| Rollback occurred | No |
| Final DisableRollback | false |
| Production touched | No |
| Remaining deployment issues | None identified within the validated scope |

The 308 removals comprise 77 IAM roles, 77 IAM policies, 77 AppSync data sources and 77 AppSync invocation functions. Every removed logical ID/type matches the reviewed list; all remaining live templates match the preserved pinned assembly. There were no unexpected resource identity changes.

### Reported replacement flags versus actual execution

Although the inspected plan conservatively flagged 23 Lambda permission replacements, **none occurred**. There are no permission resource events, all 23 physical statement IDs are unchanged, and both complete policies remain semantically identical at their original sizes. The actual result is consistent with AWS resolving the nested references to equal values and skipping the permission operations. Thus no create/delete ordering or temporary policy overlap occurred to measure; the pre-execution headroom calculation was a safety bound, not observed consumption.

The codegen custom resource emitted UPDATE_IN_PROGRESS and UPDATE_COMPLETE using its existing ID, aws.cdk.s3deployment.337d9c7c-ffc8-4128-9fdc-224e7d51472a. Its provider hash is unchanged. The destination contains exactly model-schema.graphql, 49,639 bytes, SHA-256 4fdd69674245b19f587b10faae864d3a1fb3e712a265282018016d8eb7ec82f0, matching the pinned archive. No codegen replacement occurred.

## Smoke tests and client checks

- 18 pinned consolidation/protected-environment guard tests passed.
- 24 pinned webhook/Twitch authentication, runtime and health tests passed. Their first sandbox attempt failed before loading tests because Windows os.userInfo returned uv_os_get_passwd ENOMEM; the unchanged tests passed outside the sandbox. No application or test code was changed.
- Fresh client outputs were generated from the same deployed Ntgre stack into ignored evidence storage. Local output validation passed. The pinned contract check passed for 24 queries, 55 mutations and 62 frontend operations, with none missing. The initial direct CLI invocation required its npm launcher environment; after setting that environment, output generation passed. No synthesis or deployment was involved.
- Six safe live checks passed: checkout missing-amount rejection (400), unsigned Revolut webhook rejection (401), Twitch GET missing-lease rejection, Twitch POST unauthorized-client rejection, JWT authorizer rejection (401), and a public listPublicMerchProducts query through the consolidated AppSync pipeline (200, no errors).

The Twitch rejection responses are **HTTP 500 with the exact existing authentication-error messages**. These checks prove API Gateway can invoke the target handler and its authentication guard runs; they are not successful authenticated Twitch sessions and are not being presented as general HTTP-500 health successes. The source was inspected to establish that these test inputs exit before business mutations. No payment was created, valid webhook replayed, user signed in or Twitch event published. Positive authenticated business flows were covered only by the existing mocked regression tests, not live user credentials.

Workspace outputs equal the regenerated configuration: **true**. Pinned outputs equal it: **true**. No output file was repointed or written inside the pinned candidate. No Vite restart is needed for an unchanged identity/configuration.

## Final preserved-input and evidence checks

Final verification retained all 1,128 source files and assembly SHA-256 8cf92cd39fa00c1192b00a6b74accb26fa43224e86cc03c9e8b35f551634b916. Candidate manifest remains 91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7. The candidate was not edited; current HEAD and a fresh synthesis were not substituted.

[Post-validation](phase1-ntgre-execution-evidence-2026-09-26/post-validation.json), [events](phase1-ntgre-execution-evidence-2026-09-26/sanitized-events.json), [live smoke results](phase1-ntgre-execution-evidence-2026-09-26/smoke.json), [final identity/pins](phase1-ntgre-execution-evidence-2026-09-26/final-verification.json), and [evidence hashes](phase1-ntgre-execution-evidence-2026-09-26/evidence-sha256.json) preserve the outcome. Raw templates, service responses and generated client configuration remain ignored; credential/API-key values are not published.

The no-unexpected-drift conclusion covers the compared templates/identities and inspected policies, Lambda configuration, API routes/integrations/authorizer, custom resolver pipelines and protected resources. It is not a blanket claim about every property of every AWS service, nor a newly initiated CloudFormation drift-detection run. Broader AWS audit remediation remains outside this deployment task.
