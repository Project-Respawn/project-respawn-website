# Team Hub 2B6 qualified Lambda ARN security review

**Corrected Lambda recovery execution (10 October 2026): FAILED; temporary executor removed.** The single corrected pinned workflow reached ReadUpdate but failed on explicit `kms:Encrypt` denial for the AWS-managed Lambda key. Command was never attempted. Both full configurations/revisions/code remain unchanged and both environments remain MODIFIED. Protected domains, source recovery and LEGACY_WRITER epoch/version 1 preserved; target business state empty. No IAM patch or retry. Separate KMS lifecycle review required before another attempt. [Result, exact error and cleanup](team-hub-2b6-corrected-lambda-recovery-result.md). Earlier entries below are historical.


Candidate preparation only, 9 October 2026. No AWS writes, recovery execution, deployment, Lambda patch, authority transition, frontend switch or retirement are authorized or performed by this review. Final validation status is recorded below when all checks complete.

## Confirmed failure

| Field | Exact evidence |
|---|---|
| Action | `lambda:UpdateFunctionConfiguration` |
| Principal | `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009/cCUVivCJDQRIlTqKTKEOpAaZcBzrMJxs` |
| Evaluated resource | `arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead:$LATEST` |
| Request ID | `b4cc1abf-61d4-4e15-908b-8794271d85d7` |
| CloudTrail event ID | `f6c69c46-c9af-4d66-b080-dde6274d9522` |
| Event/time | `UpdateFunctionConfiguration20150331v2`, `2026-10-09T22:07:45Z` |
| Policy location | Temporary role inline policy `FixedTwoFunctionRecovery`, zero-based `Statement[3]`; template `Resources.RecoveryRole.Properties.Policies[0].PolicyDocument.Statement[3]` |
| Effective layer | Explicit identity-policy deny; failed temporary role had no permissions boundary |

The unchanged failed statement is `Effect: Deny`, `Action: lambda:*`, `NotResource: [unqualified Read ARN, unqualified Command ARN]`. Because `$LATEST` did not match either exemption, the explicit deny applied. The prior Allow likewise listed only unqualified ARNs; an Allow alone would not override that deny. No other policy layer is needed to explain this denial. The error does not establish a KMS failure or that every later provider action will succeed.

The original AWS error, principal and request IDs are preserved in [fresh sanitized CloudTrail inspection](team-hub-qualified-recovery-evidence-2026-10-09/inspection.json) and the [original complete workflow history](team-hub-recovery-execution-evidence-2026-10-09/workflow-history.json). CloudTrail's resources list names the unqualified function, whereas its errorMessage explicitly identifies `$LATEST` as the denied authorization resource. No access key ID, session credentials or secret value was retained in the new CloudTrail projection.

## Operation-specific authorization

AWS documents that UpdateFunctionConfiguration changes the unpublished version; published-version configuration is immutable. It accepts a function name/ARN. [AWS UpdateFunctionConfiguration API](https://docs.aws.amazon.com/lambda/latest/api/API_UpdateFunctionConfiguration.html).

Qualified and unqualified resource matching must be considered per operation and request. Do not infer this update behavior from invocation examples or assume GetFunctionConfiguration uses the same resource evaluation. [AWS Lambda resource matching](https://docs.aws.amazon.com/lambda/latest/dg/lambda-api-permissions-ref.html).

The failed fixed request supplied the **unqualified** Read ARN and no qualifier; the real update denial evaluated **Read:$LATEST**. Its preceding unqualified GetFunctionConfiguration succeeded. Command update was never reached. Command `$LATEST` behavior is modeled consistently with the same API and must still be proven in a separately authorized live execution; no live Command success is claimed.

| Resource form | Revised UpdateFunctionConfiguration | Revised GetFunctionConfiguration |
|---|---|---|
| Unqualified Read | Allowed, preserved | Allowed, preserved |
| Read:$LATEST | Allowed, new exact grant | Implicitly denied; not required by fixed read tasks |
| Unqualified Command | Allowed, preserved | Allowed, preserved |
| Command:$LATEST | Allowed, new exact grant | Implicitly denied; not required by fixed read tasks |
| Either function's published version or alias | Explicitly denied | Explicitly denied |
| Every other function, including other domains/account/region | Explicitly denied | Explicitly denied |

## Smallest security-only correction

1. Append exactly the following resources to the existing Lambda explicit-deny `NotResource` exemptions:
   - `arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead:$LATEST`
   - `arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityCommand:$LATEST`
2. Add one Allow statement, `UpdateOnlyExactUnpublishedFunctions`, for **only** `lambda:UpdateFunctionConfiguration` on those two literal ARNs. No `:*` pattern, function-name prefix wildcard or additional read permission.

The existing `Deny lambda:*` remains a restriction, not an administration grant. All other statements remain canonically identical, including NotAction denials of code changes, creation/deletion, invocation, publication, IAM/PassRole, Cognito, DynamoDB and foreign-domain access. The reviewed Lambda KMS key/service/account/encryption-context conditions, other-key denials, KMS administration denials, region restrictions and time-window denials are unchanged. No runtime-role, boundary, normal deployment policy, product template or rollback artifact changes.

The template contains exactly the same two temporary resources. Its only semantic difference is the embedded inline identity policy. Workflow definition, trust, full environment requests, pinned RevisionIds, current runtime ZIP and product artifacts are unchanged byte-for-byte. The security template is independent of the 48+7 product/security baseline.

IAM cannot constrain UpdateFunctionConfiguration to the Environment field. That restriction continues to rely on service-only trust to the exact fixed state machine, security-owned custody and post-install definition comparison. Do not hand the role to arbitrary callers or expose workflow-definition editing to the normal deployment identity. Wrong-principal checks evaluate the unchanged exact service/source/account trust offline; IAM custom-policy simulation is not a live STS trust proof.

## Exact pinned candidate

| Artifact | SHA-256 |
|---|---|
| New candidate | `aa8bcd392fb507c6e477cc594063e325d31f98536a3bc16c14cf21300c71ff9b` |
| New temporary security template | `83ca14579ec405bc5cc96bba9162cfbb49c5b592fe4ebda6528cbbad09fd5f32` |
| New temporary identity policy | `fc6f0da7280e4c2da076e578bd038381408fff6a82b58059fef9d9de0e0121e6` |
| Preserved workflow | `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376` |
| Preserved runtime ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Preserved failed candidate | `96aef8d391c6de52d8ad824f7e1e5bf80436cff9e5ef2a7f96a851c6df51db1a` |

[New artifact manifest including preserved artifacts](team-hub-qualified-recovery-evidence-2026-10-09/artifact-manifest.json). No workflow or environment-map revision is necessary for this correction. The old execution wrapper still pins the failed candidate and must not be reused unmodified for a future attempt.

## Separately authorized future procedure

1. Read this report and exact new manifest; verify every new and preserved hash. Verify account `058264289478`, region `eu-north-1`, approved security-owned identity and available custody permissions.
2. Refresh full protected baselines: Team Hub 48+7, Legacy 2,621/167, Core 8+5, Tournament 11; source PITR/deletion protection/backups, empty Operational and business Journal state, LEGACY_WRITER epoch/version 1, Legacy frontend, no source fence. Stop on drift outside the known two environments.
3. Verify both entire incomplete configurations against the preserved snapshots and pinned revisions: Read `4491176f-baaa-4180-8aa2-0e6e96bc51a8`, Command `50dc3a50-7388-467f-a302-1bf33cd051cf`. Stop on mismatch; no revision refresh. Preserve code hashes and all non-environment properties.
4. Revalidate corrected qualified and unqualified IAM cases, explicit-deny controls, trust/custody, Access Analyzer and unchanged KMS conditions. No simulation result substitutes for installed/live acceptance.
5. Bind a fresh UTC window through the existing NotBefore/ExpiresAt parameters, at most 900 seconds. Record parameter receipt/hash. Verify inside/before/expiry decisions. Leave enough provisioning lead and the full workflow timeout; if timing cannot fit, stop rather than change pinned bytes or execute outside the window.
6. Require both temporary names absent. Prepare and inspect a security-owned CREATE change set: exactly one restricted role and one fixed state machine; no product changes. Execute only after separate authorization and all gates, rollback enabled.
7. Read back installed trust, sole inline policy, absence of extra attached policies/boundary and exact workflow definition. Repeat actual-role effective simulations including all four update resource forms. Verify complete static environment requests, no arbitrary input, no retries, fixed revisions and timeout. Stop before start if any gate fails.
8. Recheck immediate configurations/revisions/authority/data; start **once** with `{}` and a fresh unique execution name (do not reuse the failed execution name). Naming the execution does not change the workflow. Record the attempt before the call. Stop on failure or ambiguity; do not auto-retry, refresh revisions or patch permissions.
9. Wait for terminal success, then compare both complete environments and unchanged code/role/boundary/memory/timeout/VPC/architecture/layers/logging. Require Active, Successful and no Environment.Error. Preserve logs/history, inspect any KMS denial. UPDATE_COMPLETE or execution success alone is not application acceptance.
10. Detect drift for the two function resources; require both IN_SYNC. Preserve separate UNKNOWN/unsupported whole-stack limitations.
11. Verify authenticated authority HTTP 200 with LEGACY_WRITER epoch/version 1; missing/invalid token 401. Never fabricate browser authority values.
12. Test all 16 normal business routes for approved 403 denial, with Operational zero and Journal 15 audits + one control; no Core or cursor-secret access from denied routes. No frontend activation.
13. Verify D1/custom and native API/Lambda signals, six alarms, request/log/metric correlation and no unexplained 5xx, allowing documented CloudWatch ingestion delay. Do not weaken expected responses or observability to pass.
14. Preserve sanitized audit history; remove only the temporary role and workflow and verify both absent. Cleanup remains required after a stopped attempt. Never restore known-unhealthy maps automatically; partial recovery requires a separate decision.
15. Refresh protected domains/source recovery/authority/business-state checks and update acceptance. Isolated AWS transactional business enforcement and cursor decryption remain separate proofs, not implied by configuration recovery. No FROZEN, TARGET_WRITER, frontend switch or retirement.

## Validation evidence and limits

See [AWS policy tests and Analyzer](team-hub-qualified-recovery-evidence-2026-10-09/security-validation.json), [wrong-principal/source trust controls](team-hub-qualified-recovery-evidence-2026-10-09/trust-controls.json), [fresh normal IAM readback](team-hub-qualified-recovery-evidence-2026-10-09/installed-security-audit.json), and [semantic delta](team-hub-qualified-recovery-evidence-2026-10-09/semantic-diff.json). Candidate policy simulations are AWS evaluations of supplied documents, not installed-role or live update proofs; the temporary role is absent. Existing live security remains unchanged. Fresh CloudTrail confirms the historical denial, not success of this revision.

## Completed validation

**QUALIFIED LAMBDA ARN CORRECTION READY FOR EXECUTION REVIEW**. AWS custom-policy checks: 109 passed plus two failed-policy explicit-deny reproductions. Access Analyzer: zero findings for policy and trust. Workflow validation OK; template validation passed. Offline preservation/configuration tests: 29 passed; exact trust controls: nine passed (offline, not live STS). Four current normal roles/boundaries match accepted pins. Migration ledger: 2,621 resources, complete inventory coverage; historical unresolved ownership remains unchanged. No AWS writes or recovery execution. [Validation summary](team-hub-qualified-recovery-evidence-2026-10-09/validation-summary.json).
