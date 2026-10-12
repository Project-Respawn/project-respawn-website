# Team Hub 2B6 — DescribeKey lifecycle correction

12 October 2026. Security candidate preparation only. **DESCRIBEKEY CORRECTION READY FOR EXECUTION REVIEW. No execution authorization.** No AWS resources, permissions, environment maps or business authority changed in this task.

## Demonstrated dependency

The single recovery on 11 October at 23:48:54 UTC (12 October 00:48:54 Europe/London) failed at ReadUpdate. [CloudTrail](team-hub-window-recovery-evidence-2026-10-11/execution-cloudtrail.json) records `kms:DescribeKey` AccessDenied on `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`, the reviewed AWS-managed `alias/aws/lambda` key. Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009/jssDOPUlQRHryEYeQWibzIYQHjfNrCIg`.

Lambda request ID `19c63c3e-72f1-4c32-b776-23eda438f9ae`; KMS request ID `4384845a-3e6a-4f04-851d-3c48214ad201`; CloudTrail event ID `83108548-b392-4328-bc81-accdfe8124b9`. The recorded installed inline identity policy `FixedTwoFunctionRecovery`, zero-based Statement[2], explicitly denied every operation except its four NotAction entries. DescribeKey was outside those entries. The temporary role had no permissions boundary. [Installed policy](team-hub-window-recovery-evidence-2026-10-11/installed.json), [complete failed result](team-hub-2b6-window-recovery-result.md). The temporary role/workflow were removed after failure; “current temporary policy” here means that preserved exact installed policy, not a currently installed role.

The earlier lifecycle model incorrectly excluded DescribeKey based on a successful historical direct-update window. This live failure establishes the missing caller dependency. The earlier negative tests demonstrated the denial correctly; they did not establish that denial was compatible with the Lambda lifecycle.

## Minimal policy correction

Only one newly allowed operation: `kms:DescribeKey`.

- Append a separate Allow on the exact key ARN with `StringEquals` for `kms:ViaService = lambda.eu-north-1.amazonaws.com` and `kms:CallerAccount = 058264289478`.
- Add DescribeKey to Statement[2]'s NotAction exceptions so the existing explicit Deny no longer defeats that permission.
- Extend the existing wrong-service and wrong-account explicit denies (Statements[5] and [6]) to DescribeKey. Missing conditions also fail closed.
- Do not extend Statement[7]'s encryption-context test to DescribeKey. Encrypt/Decrypt and their function-context restrictions remain exactly unchanged.

[AWS's action-specific permissions reference](https://docs.aws.amazon.com/kms/latest/developerguide/kms-api-permissions-reference.html) lists ViaService and CallerAccount for DescribeKey, but no encryption-context condition. The [DescribeKey API](https://docs.aws.amazon.com/kms/latest/APIReference/API_DescribeKey.html) accepts a key identifier, not an encryption context. Metadata access cannot be function-scoped through an invented context: the exact two-function Lambda permissions, immutable workflow and service-only exact SourceArn trust enforce that part of the recovery design. The metadata Allow is key/account/service-scoped. Actual Lambda forwarding of service context must still pass the future live gate.

### Every other deny remains effective

| Statement (zero-based) | Interaction |
| --- | --- |
| 2, NotAction | Only DescribeKey added; code updates, create/delete, IAM/PassRole, grants, key administration and other services still explicitly denied |
| 3, Lambda NotResource | Exact Read/Command unqualified and `$LATEST` resource forms unchanged; other functions, aliases and published versions denied |
| 4, KMS NotResource | Every key except the exact managed Lambda key still explicitly denied, including business/customer-managed, unknown, other managed and foreign keys |
| 5–6, service/account | Existing Encrypt/Decrypt restrictions preserved; DescribeKey additionally covered |
| 7, encryption context | Encrypt/Decrypt still require the exact unqualified Read or Command function context; does not match metadata-only DescribeKey |
| 8, region | eu-north-1 restriction unchanged |
| 9–10, time | Deny before NotBefore and at/after ExpiresAt unchanged |

No `kms:*` Allow, KMS administration, runtime-role change, permanent execution-policy change, new PassRole permission, secret retrieval or cross-domain data grant. [Semantic diff](team-hub-describekey-evidence-2026-10-12/semantic-diff.json).

The preserved [managed-key policy readback](team-hub-window-recovery-evidence-2026-10-11/key-policy.json) already includes DescribeKey through Lambda with the same ViaService/CallerAccount pair. It also has account metadata and Lambda service statements. Extending the role's explicit service/account denies makes the intended path restriction unambiguous even when considering other applicable Allows; no managed-key policy is edited. Its direct Lambda-service statements are not grants to the temporary assumed-role principal. The prior composite IAM simulation could not model the actual key policy's resource form; it was not rewritten to force a pass, and supplied identity-policy results are not complete key-policy/SCP/live authorization proof. Fresh managed-key policy review remains an execution gate.

## Immutable candidate

| Artifact | SHA-256 |
| --- | --- |
| Candidate | `9a1bc835b48782cf4bb8df5fbcfb9f138e64ea74a579a0fdec0a8ba507254969` |
| Temporary security template | `0224800977ddd69f6953f53d9d7564f1ec2ad1c3086a99cff91fcd16eb297f59` |
| Temporary identity policy | `4c8aeefccf76019e9df11cda04278ec4ac8de4dae4b77f42218c8252ce1cbe8b` |
| Unchanged fixed workflow | `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376` |
| Unchanged runtime ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |

[Manifest](team-hub-describekey-evidence-2026-10-12/artifact-manifest.json) preserves all previous failed candidates, workflow, service-only trust, full Read/Command requests, original RevisionIds, runtime/product and rollback references. Read revision remains pinned to `4491176f-baaa-4180-8aa2-0e6e96bc51a8`; Command to `50dc3a50-7388-467f-a302-1bf33cd051cf`. No runtime synthesis/build or historical artifact overwrite. The temporary template still contains exactly two resources: IAM role and Step Functions state machine. No permanent resource delta.

## Validation and coverage

All original 210 cases remain. The two DescribeKey expectations change from explicitDeny to allowed, without encryption context. Twelve new cases cover missing/wrong service/account, region, both time boundaries, other/unknown/foreign/wrong-region key ARNs and an unsupported alias-ARN simulator-resource diagnostic. Existing Encrypt/Decrypt, code, IAM, PassRole, Lambda version/alias, protected-domain and trust controls remain. The [complete suite](team-hub-describekey-evidence-2026-10-12/complete-suite.json) has 222 cases; [coverage](team-hub-describekey-evidence-2026-10-12/coverage.json) maps each to certification and installed-role witnesses. The [lifecycle matrix](team-hub-describekey-evidence-2026-10-12/permission-lifecycle-matrix.json) now classifies DescribeKey as required. Its application to Command is preparation for the same fixed lifecycle; the actual failed request was Read, and Command was not attempted.

The critical suite is now 82 cases, retaining every prior critical case and adding DescribeKey coverage plus a separate CreateGrant denial witness. Reclassifying DescribeKey initially left its old administration category without an installed witness; the local coverage test detected this and the mapping was corrected. No original case was dropped. The complete simulation inputs and expected decisions are unchanged by that witness-metadata correction.

The first simulation segment stopped on new diagnostic IAM-222: an alias ARN supplied as the simulator authorization resource returned implicitDeny rather than the initially expected explicitDeny. DescribeKey authorizes a key resource; passing an alias as a real API KeyId resolves to its key and is a different operation from this simulator input. This diagnostic must not be presented as proof that alias KeyId use is prohibited. Its expectation was corrected to implicitDeny without modifying any policy bytes or key-ARN isolation expectation. Both original and corrected receipts are preserved. The 48 completed cases have hash-verified identical security inputs and outcomes; the continuation runs all 174 remaining cases with the same policy and simulated window, including the corrected diagnostic. The original 210 security requirements are all retained.

[Read-only service validation](team-hub-describekey-evidence-2026-10-12/service-validation.json): Access Analyzer zero findings for identity and trust; fixed workflow OK with no diagnostics; template validation passed. [Offline validation](team-hub-describekey-evidence-2026-10-12/offline-validation.json): candidate/harness/integrity/accounting/migration tests and Team Hub TypeScript. [Regression results](team-hub-describekey-evidence-2026-10-12/regressions.json): recovery, configuration, cursor, epochs, Core, privacy, monitoring, accounting/isolation and Amplify TypeScript. AWS policy certification results are recorded separately in [security validation](team-hub-describekey-evidence-2026-10-12/security-validation.json); simulation is not live decryption or recovery proof.

## Separately authorized execution sequence

1. Refresh identity/account/region, immutable hashes, both full installed and desired configurations and original revisions, managed-key and permanent-IAM baselines, source recovery, empty business state, authority LEGACY_WRITER 1/1, Legacy frontend and absent source fence. Stop on unexpected drift. Preserve the user's organization-visibility waiver; do not claim SCP inspection or complete effective authorization from simulation.
2. Select and hash a fresh parameter receipt with sufficient pre-window lead for full certification, installation, propagation and critical checks. Use the same reviewed rate-limited harness: one request at a time, at least 15-second spacing, bounded six-attempt throttling retries with jitter, 30-minute suite deadline. No active window longer than 900 seconds.
3. Run all 222 supplied-policy cases against the exact parameterized candidate. Prepare and inspect exactly two temporary additions; zero unrelated modifications/deletions/replacements, rollback enabled. No template/policy substitution.
4. Install only the exact reviewed role/workflow. Verify trust, policy, RoleId, no boundary/attached policies, full workflow and absence of extra permissions. Run all 82 critical actual-role cases before NotBefore using simulated time context. A validation-only draft runner is `scripts/team-hub-describekey/run.mjs`; it has no deployment APIs. Any incomplete gate means stop and cleanup, not permission broadening.
5. Refresh all critical preflight state and installed equivalence immediately before execution. Execute the immutable workflow once with empty input after NotBefore and with at least 600 seconds remaining. No automatic retry, revision refresh or environment/input substitution. The simulated 2030 window in this review is not an execution window or authorization.
6. Require both complete maps, stable non-environment properties/code/permanent IAM, Active/Successful and function drift IN_SYNC. Require authenticated authority HTTP 200, LEGACY_WRITER epoch/version 1; all 16 business routes denied; zero business changes; D1 request/log/metric correlation and no unexpected API 5xx.
7. After terminal execution, remove only the temporary executor and confirm absence. Preserve evidence, source protections and Legacy 2621/167, Team 48+7, Core 8+5, Tournament 11. If either function changes before a failure, record partial state and stop; never automatically restore the unhealthy map. Do not freeze, activate target authority/frontend or retire Legacy.

The reviewed scheduler predicts 65 certification and 44 critical requests before retries/pagination (about 16 and 11 minutes minimum at 15-second spacing). Plan adequate pre-window lead and stop if the safety margin is lost; do not extend the active permission window. Existing execution scripts remain pinned to their historical packages and must not be used with substituted artifacts.

Remaining live uncertainties: exact installed effective policy layers and service trust, Lambda's forwarded DescribeKey context, managed-key authorization, stabilization, actual endpoint/route/metric acceptance and cleanup. No simulator result can certify these in advance. This correction addresses the demonstrated missing operation only.

## Final validation result

All 222 AWS supplied-policy cases passed: 14 positives and 208 negative controls (207 explicit denials and one unsupported-resource implicit denial), 66 requests, 0 throttling/error retries. All historical cases retained; only the two demonstrated DescribeKey expectations changed. The two hash-verified certification segments retain 48 already-passed cases and cover all 174 remaining cases; the new alias diagnostic expectation was corrected without modifying the policy. Actual installed-role checks remain prepared, not run against an absent role. Access Analyzer: zero findings. Workflow/template validation passed. 454 existing regressions and 99 candidate/harness/accounting/migration tests passed, plus the added installed-baseline equivalence test; Team Hub and Amplify TypeScript passed. Secret scan and documentation/ledger checks are recorded alongside the result. No AWS writes.

**DESCRIBEKEY CORRECTION READY FOR EXECUTION REVIEW**
