# Temporary Ntgre Phase 1 debt allowance

Implemented September 23, 2026 under explicit user authorization. **BLOCKED — AWS credentials unavailable.** No deployment is authorized or planned from archived state.

The local accounting result is **PASS WITH APPROVED EXISTING DEBT** for the exact reviewed candidate: hierarchy **2,621**, FunctionDirectiveStack **167**, fresh creation **BLOCKED**. All **1,128/1,128** candidate source hashes match manifest `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`.

The [allowance](../../scripts/config/ntgre-phase1-resource-debt.json) applies only to the existing `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` root, account `058264289478`, region `eu-north-1`, environment `Ntgre`. Its expected root ARN is recorded for the mandatory later AWS identity check. Baseline hierarchy is 2,929; maximum candidate hierarchy is 2,621; action shape is ADD 0 / MODIFY 81 / DELETE 308 / REPLACE 0.

Owner: Project Respawn platform maintainers. Purpose: complete the reviewed non-production Phase 1 consolidation proof. Effective September 23, 2026 UTC; expires **October 7, 2026 at 00:00 UTC**, with no automatic renewal. Remove when **Phase 1 Ntgre proof is completed and the environment reconciled to the consolidated architecture**.

## Enforcement

This extends accounting with a separate pinned-update verification entry point. It does not add Ntgre to the master/staging exception. The ordinary evaluator rejects the new allowance type unless the dedicated verifier establishes its stronger constraints first. Global thresholds, hard gates, oversized-root guard and hosted allowances remain unchanged.

The verifier checks the exact source manifest and its source files, full baseline/candidate assembly tree digests (including all assets), reviewed live-to-candidate action evidence, protected/dependency evidence and deployed-package comparison evidence. Any changed assembly byte fails, even an unrelated same-count change or synthesis-time expiry change. This intentionally requires fresh review rather than repinning a new synthesis automatically. Pins were generated once from the already accepted local artifacts; normal verification never updates them.

It also checks target context, expiry, update-only operation, baseline count, candidate ceiling, directive count, unchanged root and no new stack paths. It then runs the existing resource-count evaluator with the verified allowance. No Lambda/app/backend behavior or accepted candidate source was changed. Tooling and its test registration live outside the isolated candidate snapshot. This is Shared platform development tooling, with zero generated infrastructure resources, no frontend loading change, no new deployment boundary or stateful migration.

Local verification command, from the repository root (paths from `phase1-ntgre-artifact-evidence/windows-workspaces.json`):

```powershell
$workspaces = Get-Content docs/architecture/phase1-ntgre-artifact-evidence/windows-workspaces.json -Raw | ConvertFrom-Json
node scripts/validate-ntgre-phase1-allowance.mjs $workspaces.candidate (Join-Path $workspaces.baseline '.amplify/ntgre-preview/cdk.out') (Join-Path $workspaces.candidate '.amplify/ntgre-preview/cdk.out')
npm.cmd run test:resource-accounting
```

This command is offline accounting only. Its account/region arguments identify the approved context, not proof of current AWS identity. It performs no deployment, asset publication or AWS mutation and cannot replace the required credential/identity/drift preflight.

## Validation and stop condition

- 41 tests passed: 24 existing accounting tests plus 17 new allowance tests. Boundaries include 2,622 resources, resource growth, extra stack, different root, account, region, environment or manifest, changed candidate source/evidence, expiry, more than 14 days, fresh creation, protected replacement and unrelated same-count infrastructure changes. The 2,622 ceiling is also tested independently of artifact pinning.
- Actual archived candidate: PASS WITH APPROVED EXISTING DEBT; all 1,128 hashes verified. [Local result](phase1-ntgre-artifact-evidence/allowance-local-validation.json).
- `npm run validate:infrastructure-ci` was attempted as required by repository instructions. It failed before synthesis with `uv_os_get_passwd returned ENOMEM` in tsx under Node 24.14.1. It did not validate infrastructure CI. This working-tree check also detects pre-existing unrelated source changes; its working tree must not become the accepted deployment candidate.
- Fresh `aws sts get-caller-identity` returned `NoCredentials`; `aws configure list-profiles` returned no profiles. No credentials were invented, read from unrelated locations or modified.
- No fresh AWS identity/template/hash/protection checks, deployment preparation, or subsequent critical pre-deployment suite was performed because the requested credential stop condition applies. No 653-test rerun is claimed.

The local policy blocker is resolved for the exact accepted artifacts. Execution remains **BLOCKED — AWS credentials unavailable**. Once normal authorized access is available, recheck account, region, root name/ARN, safe status, last update, Cognito and AppSync identity; compare the three affected live template levels and five Lambda CodeSha256 values to accepted evidence. Stop on any mismatch. Only after that refresh run the requested remaining critical checks and review execution planning. Deployment still requires explicit authorization.

Existing recovery findings remain unchanged. No PITR, versioning, Cognito protection, KMS, backup or secret settings were changed.
