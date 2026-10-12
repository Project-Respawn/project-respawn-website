# Team Hub 2B6 — final recovery with pre-window certification

Execution authorized 11 October 2026. **FAILED at ReadUpdate: kms:DescribeKey explicitly denied. Temporary resources removed; no retry.**

The user approved the exact existing candidate and revised 210-case certification / 68-case critical installed-role sequence. The prior organization-policy inspection waiver remains in effect; no SCP authorization is inferred. No permanent IAM, code, environment contract, authority, frontend or Legacy retirement change is authorized.

Candidate `4b4e49d07629dbb7fd4fa982bba30a10c3685dd0f989e8ae54161a128dd5470e`; security `b63d162ddf23d8fef1fe8e0f3ebbfa2096c8ffa655c3e93b15be39dac729830e`; identity policy `06c4e9c0126ba4438acd87329442922a7d3b87eabf29092115b35db0979687fe`; workflow `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376`.

Fresh [preflight](team-hub-window-recovery-evidence-2026-10-11/preflight.json) verifies both original RevisionIds and complete installed snapshots, desired template, account and identity. [Protected comparisons](team-hub-window-recovery-evidence-2026-10-11/protected-after.json), [source/data inventory](team-hub-window-recovery-evidence-2026-10-11/after/inventory.json) and permanent IAM checks passed. No temporary resource-name collision.

The [window receipt](team-hub-window-recovery-evidence-2026-10-11/window.json) and [hash](team-hub-window-recovery-evidence-2026-10-11/window-hash.json) bind NotBefore 2026-10-11T23:48:37Z and ExpiresAt 2026-10-12T00:03:37Z: 900 active seconds, 60-minute provisioning/validation lead. No automatic extension or workflow retry.

Managed-key comparison produced intermittent order-sensitive mismatches; subsequent captured readbacks match the historical statements, and set-normalized full policy comparison passed. [Captured reads](team-hub-window-recovery-evidence-2026-10-11/key-policy-readbacks.json), [final full policy comparison](team-hub-window-recovery-evidence-2026-10-11/key-policy.json). No KMS policy edit was made.

All local harness/integrity/trust tests passed (42). Local Amplify outputs verified Ntgre. Full live 210-case supplied-policy certification and 68 critical actual-role cases passed before NotBefore, with no throttling. These tests proved the reviewed policy behavior, not the completeness of its real Lambda lifecycle model.

## Actual execution

Account `058264289478`, region `eu-north-1`, security operator `arn:aws:iam::058264289478:user/RavenTest`. All four approved artifact hashes above and preserved dependencies verified without rebuilding. The exact two-resource CREATE change set contained only RecoveryRole and RecoveryWorkflow; rollback enabled. Installed trust, sole inline identity policy, absence of boundary/attached policies, workflow and RoleId were checked before and after critical simulation and again immediately before execution.

- [210-case certification](team-hub-window-recovery-evidence-2026-10-11/security-validation.json) and [68-case installed-role result](team-hub-window-recovery-evidence-2026-10-11/actual-security.json): PASS, complete, no unfinished checks. Critical validation completed at 23:14:15Z before the window.
- [Change-set inspection](team-hub-window-recovery-evidence-2026-10-11/change-set-gate.json): 2 additions, zero modifications, deletions or replacements.
- [Installed equivalence](team-hub-window-recovery-evidence-2026-10-11/installed.json) and [immediate preflight](team-hub-window-recovery-evidence-2026-10-11/immediate-preflight.json): PASS.
- [Single start receipt](team-hub-window-recovery-evidence-2026-10-11/started.json): 2026-10-11T23:48:53.493Z, over 14 minutes remaining in the approved 900-second window, empty input.
- Execution ARN: `arn:aws:states:eu-north-1:058264289478:execution:ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009:window-recovery-20261011-once`.
- [Terminal history](team-hub-window-recovery-evidence-2026-10-11/workflow-history.json): FAILED at 23:48:54.155Z. ReadBefore succeeded; ReadUpdate failed; Command was never attempted. Exactly one UpdateFunctionConfiguration task, SDK attempt count 1.

## Exact failed gate

AWS Lambda returned HTTP 403: `kms:DescribeKey` explicitly denied in an identity-based policy for key `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`.

Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009/jssDOPUlQRHryEYeQWibzIYQHjfNrCIg`.

Blocking policy: temporary role inline `FixedTwoFunctionRecovery`, zero-based `Statement[2]`, `Effect: Deny`, `NotAction` containing only Lambda GetFunctionConfiguration/UpdateFunctionConfiguration and KMS Encrypt/Decrypt, `Resource: *`. DescribeKey is outside that list. The role had no permissions boundary. No statement was changed after failure.

Lambda request ID: `19c63c3e-72f1-4c32-b776-23eda438f9ae`. KMS request ID: `4384845a-3e6a-4f04-851d-3c48214ad201`; CloudTrail event ID: `83108548-b392-4328-bc81-accdfe8124b9`. [Sanitized CloudTrail evidence](team-hub-window-recovery-evidence-2026-10-11/execution-cloudtrail.json) corroborates DescribeKey denial. Its `complete: false` means successful recovery audit acceptance failed, not that the recorded denial is speculative.

The prior review classified DescribeKey as not demonstrated for this direct lifecycle, and certification deliberately expected explicit denial for both functions. Thus all approved tests passed while the real lifecycle failed. This is a coverage-model error, not renewed simulator throttling. A separately reviewed correction must account for the demonstrated action and its supported conditions; no new policy or execution is authorized by this result. SCP visibility remains explicitly waived by the user; no full organization authorization claim is made.

## Final Lambda and application state

[Full configuration and function drift readback](team-hub-window-recovery-evidence-2026-10-11/failure-readback.json) verifies both complete installed configurations are byte-equivalent after canonical JSON comparison to the pinned pre-attempt snapshots, including code hashes, roles, non-environment settings and revisions.

| Function | State / update | RevisionId | Environment | Function drift |
| --- | --- | --- | --- | --- |
| ParityRead | Active / Successful | `4491176f-baaa-4180-8aa2-0e6e96bc51a8` | 8 keys; still missing 4 reviewed additions | MODIFIED |
| ParityCommand | Active / Successful | `50dc3a50-7388-467f-a302-1bf33cd051cf` | 8 keys; still missing 3 reviewed additions | MODIFIED |

Both runtime ZIP hashes remain `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e`. Active/Successful describes Lambda control-plane status and does not establish healthy application initialization.

Authenticated authority HTTP 200 and all 16 dark-route checks were **not run after the mandatory recovery failure**; no successful application response is claimed. Existing Admin/ordinary browser sessions were available before execution, with no tokens persisted. [Monitoring configuration readback](team-hub-window-recovery-evidence-2026-10-11/observability.json) preserves six alarms and detailed API metrics; post-recovery D1 live acceptance remains outstanding.

## Cleanup and preservation

[Cleanup](team-hub-window-recovery-evidence-2026-10-11/cleanup.json): DELETE_COMPLETE, role absent, workflow absent. An initial read observed DELETE_IN_PROGRESS; the subsequent read confirmed deletion. No workflow retry, permission broadening, revision refresh, environment rollback or permanent IAM change occurred.

[Permanent IAM](team-hub-window-recovery-evidence-2026-10-11/installed-security-audit.json), [protected templates/resources](team-hub-window-recovery-evidence-2026-10-11/protected-after.json), [source fence preservation](team-hub-window-recovery-evidence-2026-10-11/source-fence-preservation-after.json) and [strongly consistent inventory/recovery protection](team-hub-window-recovery-evidence-2026-10-11/after/inventory.json) passed after failure.

- Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48 product + 7 security; Core 8 + 5; Tournament 11.
- Operational: 0 records. Journal: 16 records, comprising 15 historical audits and one unchanged control record; zero business records.
- Authority: LEGACY_WRITER, epoch 1, version 1. Four Legacy sources empty; source logos empty; PITR, deletion protection and backups preserved.
- Frontend remains Legacy; source fence not activated; no FROZEN/TARGET_WRITER transition; no production changes or Legacy retirement.

[Consolidated result](team-hub-window-recovery-evidence-2026-10-11/result.json). Previous artifacts/evidence are preserved. The next required step is a separately reviewed temporary execution-policy/lifecycle correction; further recovery execution requires authorization.

**LAMBDA CONFIGURATION RECOVERY BLOCKED — kms:DescribeKey explicitly denied at ReadUpdate.**
