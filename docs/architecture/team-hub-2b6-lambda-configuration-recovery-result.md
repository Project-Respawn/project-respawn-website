# Team Hub 2B6 Lambda configuration recovery result

**LAMBDA CONFIGURATION RECOVERY FAILED — 9 October 2026.** The authorized fixed workflow ran once and stopped at the first Read update. No function configuration changed. Both temporary resources were removed and independently verified absent. No automatic retry, policy correction, rollback, product deployment or authority transition was performed.

## Exact execution and security

- Operator: `arn:aws:iam::058264289478:user/RavenTest`; account `058264289478`; region `eu-north-1`.
- Candidate SHA-256: `96aef8d391c6de52d8ad824f7e1e5bf80436cff9e5ef2a7f96a851c6df51db1a`.
- Temporary template SHA-256: `9a61c017c98635553f710feee28a0b39aabdc2d49f6a68a1e15c4456fd37b164`.
- Fixed workflow SHA-256: `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376`.
- Runtime ZIP SHA-256, both functions: `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`.
- Temporary stack/role/state-machine name: `ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009`.
- Reviewed UTC permission window: `2026-10-09T22:06:45Z` through, exclusive, `2026-10-09T22:21:45Z`. Parameter substitution preserved pinned template/policy bytes.
- Temporary change set: exactly two additions (IAM role and state machine); no unrelated changes, deletions or replacements. Executed with rollback enabled; CREATE_COMPLETE and installed trust/policy/workflow match verified.
- Execution: `reviewed-environment-recovery-once`, empty input `{}`, started `2026-10-09T22:07:45.551Z`, terminal FAILED at `2026-10-09T22:07:45.978Z`.
- Access Analyzer and workflow validation passed. The 41 custom-policy and 41 actual-role controls passed as written, but omitted qualified Lambda ARNs; these passes did not establish sufficient live update permission.

## Failure and validation gap

The `ReadBefore` configuration read and pinned revision check succeeded. `ReadUpdate` received HTTP 403, request ID `b4cc1abf-61d4-4e15-908b-8794271d85d7`: explicit identity-policy denial of `lambda:UpdateFunctionConfiguration` on `arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead:$LATEST`.

The pinned policy Allow lists only the two unqualified function ARNs. Its `Deny lambda:*` / `NotResource` exemption likewise lists only those unqualified ARNs. AWS evaluated the qualified `$LATEST` resource. Post-failure simulation of the unchanged installed policy reproduces allowed unqualified and explicitly denied `$LATEST` updates for both functions. This was a coverage defect in the pre-execution simulations, not proof of a KMS failure. No KMS correction was attempted. Command was never reached. The workflow caught the error and stopped without retry.

Evidence: [complete workflow history](team-hub-recovery-execution-evidence-2026-10-09/workflow-history.json), [qualified ARN diagnosis](team-hub-recovery-execution-evidence-2026-10-09/qualified-arn-diagnosis.json), [installed executor](team-hub-recovery-execution-evidence-2026-10-09/installed.json), [original checks](team-hub-recovery-execution-evidence-2026-10-09/actual-security.json).

## Fresh readback and acceptance

| Check | Result |
|---|---|
| Read revision | `4491176f-baaa-4180-8aa2-0e6e96bc51a8`, unchanged |
| Command revision | `50dc3a50-7388-467f-a302-1bf33cd051cf`, unchanged |
| Entire function configurations | Canonically identical to the pinned incomplete baseline, not merely matching code hashes |
| Runtime code, roles, boundaries, non-environment settings | Unchanged; normal installed security read back and matched |
| Lambda states | Both Active / LastUpdateStatus Successful; this is not application acceptance |
| Read environment drift | MODIFIED: four missing variables remain |
| Command environment drift | MODIFIED: three missing variables remain |
| Authority endpoint and 16 authenticated business-route checks | Not run after mandatory workflow failure; no recovery acceptance claimed |
| Request/log/metric correlation and post-recovery six-alarm acceptance | Not run after mandatory workflow failure; existing infrastructure preserved |
| Cleanup | Temporary stack DELETE_COMPLETE; role NoSuchEntity; state machine StateMachineDoesNotExist |

Read still lacks `CORE_ENVIRONMENT`, `CORE_CONTRACT_ARN`, `TEAM_HUB_BUSINESS_RUNTIME` and `TEAM_CURSOR_SECRET_ARN`. Command still lacks the first three. No partial desired map was applied. Function drift remains confirmed; historical log-group UNKNOWN and unsupported integration inspection are not reclassified as drift or IN_SYNC.

Evidence: [full configuration readback and two drift inspections](team-hub-recovery-execution-evidence-2026-10-09/failure-readback.json), [cleanup](team-hub-recovery-execution-evidence-2026-10-09/cleanup.json).

## Preservation

Post-failure read-only checks reconfirm Legacy 2,621 resources / FunctionDirectiveStack 167; Team Hub 48 product + 7 security; Core 8 + 5; Tournament 11. Protected templates, runtime hashes and four installed roles/boundaries match accepted baselines. All four Legacy source tables remain empty; PITR, deletion protection and backups remain intact; logo state and source policies are unchanged. Operational has zero records; Journal has 15 audit rows and one authority record, zero business records. Strongly consistent authority read remains LEGACY_WRITER, epoch 1, version 1. No frontend activation, writer fence, production change or retirement was performed.

Evidence: [protected templates](team-hub-recovery-execution-evidence-2026-10-09/protected-after.json), [inventory](team-hub-recovery-execution-evidence-2026-10-09/after/inventory.json), [authority](team-hub-recovery-execution-evidence-2026-10-09/authority.json), [source protection](team-hub-recovery-execution-evidence-2026-10-09/source-fence-preservation-after.json), [installed security](team-hub-recovery-execution-evidence-2026-10-09/installed-security-audit.json).

## Stop state and next authorization

The attempted direct reconciliation did not restore CloudFormation desired Environment values. Historical candidate pins and rollback artifacts remain untouched. AWS changes were limited to the temporary executor lifecycle and one denied Lambda update attempt. There was no successful Lambda configuration write or business-data write.

A new separately reviewed recovery security candidate must account for exact `$LATEST` update evaluation and repeat qualified/unqualified positive and negative controls, wrong-function/version controls, custody, timing, KMS and rollback checks. This task does not authorize preparing/installing a permission patch or retrying. Refresh revisions before any future execution; never silently repin. Do not restore the unhealthy old maps as a rollback action. Live authority/16-route/monitoring acceptance, isolated AWS transactional enforcement and cursor decryption remain outstanding. FROZEN, TARGET_WRITER, frontend publication and Legacy retirement remain separately gated.
