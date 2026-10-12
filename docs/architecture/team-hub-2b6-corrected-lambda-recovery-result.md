# Team Hub 2B6 corrected Lambda recovery result

**LAMBDA CONFIGURATION RECOVERY FAILED — 10 October 2026.** The corrected fixed workflow was executed once and stopped at ReadUpdate with an explicit `kms:Encrypt` denial. Command was never attempted. Both entire function configurations, revisions and code hashes remain unchanged. No automatic retry, permission patch, product deployment, unhealthy rollback or authority transition occurred.

## Verified execution input

| Artifact | SHA-256 |
|---|---|
| Corrected candidate | `aa8bcd392fb507c6e477cc594063e325d31f98536a3bc16c14cf21300c71ff9b` |
| Temporary security template | `83ca14579ec405bc5cc96bba9162cfbb49c5b592fe4ebda6528cbbad09fd5f32` |
| Temporary identity policy | `fc6f0da7280e4c2da076e578bd038381408fff6a82b58059fef9d9de0e0121e6` |
| Preserved workflow | `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376` |
| Both runtime ZIPs | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |

The original full environment requests, product template, runtime ZIPs, historical failed candidate and rollback artifacts were verified and preserved. No synthesis, rebuild or HEAD substitution. Operator `arn:aws:iam::058264289478:user/RavenTest`, account `058264289478`, region `eu-north-1`.

The fresh UTC permission window was `2026-10-10T06:31:57Z` to `2026-10-10T06:46:57Z` (end exclusive). Existing CloudFormation parameters bound the window without changing pinned bytes. Inside/before/expiry simulations passed. The two-resource CREATE change set was inspected canonically, with exactly one IAM role and one fixed Step Functions machine, no unrelated changes. Executed with rollback enabled; CREATE_COMPLETE and installed policy/trust/workflow equivalence verified. No extra attached policies or boundary on the temporary role.

Fresh custom-policy controls: 109 passed, two original-policy explicit-deny controls passed; Access Analyzer policy/trust: zero findings. Installed-role controls: 109 passed. One IAM endpoint connect timeout interrupted an earlier read-only simulation run; its partial evidence was preserved and only read-only checks were repeated before workflow execution. Offline preservation tests: 18 passed. These checks modeled the approved policy; they did not prove all live Lambda KMS lifecycle requirements. In particular the approved policy deliberately denies `kms:Encrypt`.

## Exact failure

- Execution ARN: `arn:aws:states:eu-north-1:058264289478:execution:ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009:qualified-recovery-20261010-once`.
- Started `2026-10-10T06:32:22.311Z`, input `{}`. Terminal status FAILED, error `RecoveryStopped`.
- Failed task: `ReadUpdate`, AWS SDK `lambda:updateFunctionConfiguration`, SDK attempt count 1.
- Request ID: `4dbe6fc5-8022-44c6-8fa1-08d6b1b9e973`.
- Denied action: `kms:Encrypt`.
- Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009/BsSBZpwlomZPFrSFqRqIqNGkGPnbcUBz`.
- Key: `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7` (`alias/aws/lambda`, AWS-managed).
- AWS reports it could not encrypt the environment due to an explicit identity-based policy deny. The unchanged temporary inline `FixedTwoFunctionRecovery` policy's zero-based Statement[2] is `Deny` / `NotAction` allowing only GetFunctionConfiguration, UpdateFunctionConfiguration and kms:Decrypt through that deny. `kms:Encrypt` is outside that exception. The narrow positive KMS grant is also Decrypt only. No boundary is attached to this temporary role.

The prior qualified-Lambda-ARN denial was not reported in this attempt; the request reached the KMS encryption requirement. This is not successful environment recovery. No KMS grant or exception was added, and no permission retry was made. The original error and task sequence are preserved in [workflow history](team-hub-corrected-recovery-evidence-2026-10-10/workflow-history.json). [CloudTrail collection](team-hub-corrected-recovery-evidence-2026-10-10/execution-cloudtrail.json) records only events delivered at collection time; absence before ingestion is not proof of no KMS operation.

## Readback and acceptance

| Gate | Result |
|---|---|
| Read RevisionId | `4491176f-baaa-4180-8aa2-0e6e96bc51a8`, unchanged |
| Command RevisionId | `50dc3a50-7388-467f-a302-1bf33cd051cf`, unchanged |
| Full Lambda configuration | Both canonically equal to the pinned incomplete pre-recovery state |
| Runtime code, roles and all non-environment settings | Unchanged |
| Lambda state | Active, LastUpdateStatus Successful; not application acceptance |
| Environment | Read still lacks four variables; Command still lacks three |
| Function-level drift | Read MODIFIED; Command MODIFIED |
| Whole-stack drift | No IN_SYNC claim; historical log-group UNKNOWN and unsupported integrations remain separate |
| Authenticated authority endpoint and 16 normal business routes | Not executed after mandatory recovery failure; live acceptance remains blocked |
| Monitoring | Existing detailed API metrics and all six alarm definitions verified before execution; post-recovery request/log/metric acceptance not reached |
| Business authority | LEGACY_WRITER, epoch 1, version 1, unchanged |

Read is missing CORE_ENVIRONMENT, CORE_CONTRACT_ARN, TEAM_HUB_BUSINESS_RUNTIME and TEAM_CURSOR_SECRET_ARN; Command is missing the first three. No partial map was installed. [Complete readback/drift evidence](team-hub-corrected-recovery-evidence-2026-10-10/failure-readback.json).

## Cleanup and preservation

Only the temporary recovery stack was submitted for deletion after preserving execution history. Final cleanup and preservation completion are recorded below after fresh verification. No authority row, cursor secret, tables or business data was deleted. Permanent product/security stacks were not deployed or modified. Frontend activation stayed unreviewed with a null epoch; no frontend publication or source fence was performed. Production was untouched.

## Remaining gate

Stop before another attempt. A separately scoped review must determine the minimal actual Lambda environment-encryption lifecycle requirements, using this principal/key/error and any delivered KMS encryption context/service evidence. The approved Decrypt-only policy is insufficient for this live operation. Do not simply add a broad KMS Allow or assume Encrypt is the only remaining operation; preserve other-key, administration and foreign-domain restrictions. Any revised candidate requires review and fresh execution authorization, pins, revisions, timing and installed-policy gates. No revision repinning or workflow/environment changes were made here.

After a future successful repair, authority HTTP 200, all 16 approved dark-route denials, request/log/metric correlation and absence of unexplained 5xx remain mandatory. Isolated AWS business transactions, cursor decryption/signing and later cutover gates remain separate. No FROZEN, TARGET_WRITER, live frontend switch or Legacy retirement is authorized by this result.

## Final verified stop state

CloudTrail subsequently delivered the exact KMS failure: event `7220e51d-a665-4cbb-b60f-2d5818024423`, action `Encrypt`, request ID `99600710-949a-4a11-9726-22ebd57a145c`, at `2026-10-10T06:32:22Z`, same temporary assumed-role principal and key, explicit identity-policy deny. One Lambda update event was collected. The audit file's `complete: false` means successful two-function recovery was not established, not that the saved denied KMS event is inferred. The initial delivery-pending snapshot is preserved separately.

Cleanup: DELETE_COMPLETE; exact temporary role and workflow absent. Both full Lambda configurations unchanged. Fresh protected template/accounting checks: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48+7; Core 8+5; Tournament 11. Four installed normal roles/boundaries unchanged. Source tables 0/0/0/0 with PITR/deletion protection/backups intact; logo/source-policy baselines unchanged. Target Operational 0; Journal 15 audits plus unchanged control record, zero business records. No business or authority writes, frontend/fence activation, production change or retirement.

[Cleanup](team-hub-corrected-recovery-evidence-2026-10-10/cleanup.json), [protected templates](team-hub-corrected-recovery-evidence-2026-10-10/protected-after.json), [inventory](team-hub-corrected-recovery-evidence-2026-10-10/after/inventory.json), [authority](team-hub-corrected-recovery-evidence-2026-10-10/authority.json), [installed security](team-hub-corrected-recovery-evidence-2026-10-10/installed-security-audit.json).

**LAMBDA CONFIGURATION RECOVERY FAILED**
