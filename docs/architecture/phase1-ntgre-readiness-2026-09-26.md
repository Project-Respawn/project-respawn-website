# Phase 1 Ntgre deployment gate — 26 September 2026

**Later AWS change-set inspection: NOT READY FOR CHANGE SET EXECUTION.** The prepared, unexecuted AWS plan reports 114 modifications, 23 Lambda permission replacements and one conditional codegen custom-resource replacement. See the [actual change-set gate](phase1-ntgre-change-set-2026-09-26.md). The template-only readiness result below is retained as historical evidence and does not override that gate.

**READY FOR EXPLICIT DEPLOYMENT AUTHORIZATION — exact pinned assembly only.** No deployment, AWS resource mutation, asset publication, change-set creation, manual resource deletion, sandbox recreation or production modification occurred. This is a current read-only CDK/template plan and validation gate, not an executed or AWS-evaluated change set. The next authorized execution process must still inspect its actual change set before execution.

## Authentication and environment

The earlier `NoCredentials` and empty-profile results came from the restricted Windows identity `CodexSandboxOffline`, which cannot access `the operator’s local AWS configuration directory`. Running approved read-only commands outside that sandbox accesses the normal `Ntgre` user's existing configuration. No login, new access key, credential copy, profile edit or permission change was necessary.

- AWS CLI: 2.34.51; Node: 24.14.1.
- Profile: `default`, region `eu-north-1`, existing shared-credentials-file authentication. Credential values were withheld. The two other configured profiles use login sessions but were not selected.
- STS account: `058264289478`.
- ARN: `arn:aws:iam::058264289478:user/RavenTest`.
- UserId: `AIDAQ3EGSQDDCJSMJ75N5`.
- Existing root: `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`.
- Root ARN: `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332/8b2122c0-b5c7-11f1-b780-0aadaa40eeed`.
- Root status: `UPDATE_COMPLETE`; last update `2026-09-21T14:32:51.577Z`. All 62 stack instances are `CREATE_COMPLETE` or `UPDATE_COMPLETE`.
- Cognito: `eu-north-1_n24iLL7QE`; AppSync: `dxb2tdlulrch7hj2pts2mfijia`.

Actual reads succeeded for CloudFormation templates/resources/status/events, Lambda code metadata, IAM role configuration, Cognito configuration/tags, AppSync configuration/tags/resolvers, S3 versioning and baseline asset metadata, Amplify app metadata, log-group metadata, DynamoDB configuration/PITR, KMS key metadata and scoped SSM parameter metadata. This proves the specific reads performed, not every possible AWS action or deployment permission. No denied action remains in these checks.

## Exact accepted candidate

The accepted source is identified by its raw-byte manifest, not current HEAD. Historical implementation base was `development @ 3cf3928` plus reviewed uncommitted work. Current HEAD is `9cacb3bdc53ad2511ef1c8baa6dd1f4dfa71a633`; 19 files in the accepted manifest differ in the current working tree. Later/new files also exist. None was incorporated or discarded.

- Candidate: `<local-phase1-reproduction>/candidate`.
- Baseline: sibling `baseline` directory.
- Manifest SHA256: `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`.
- Source files verified before/after: **1,128/1,128**.
- Pinned candidate assembly: candidate `.amplify/ntgre-preview/cdk.out`.
- Candidate assembly digest: `8cf92cd39fa00c1192b00a6b74accb26fa43224e86cc03c9e8b35f551634b916`.
- Baseline assembly digest: `c14fd37d27180836df9ce2f7b999a5a1aa16901c791ebb3fb966bbded610b40a`.
- Exact allowance and accepted evidence verification: PASS after all work. Allowance expiry remains **2026-10-07 00:00 UTC**. No renewal or repinning.

Use this preserved assembly directly for any approved deployment. Ordinary `ampx sandbox` or a new synthesis is not an equivalent deployment command for this gate.

## Fresh live comparison and concrete CDK plan

All **62/62 deployed templates and resource-identity maps** equal the previously accepted live capture. Fresh hierarchy: **2,929**. A newly computed resource-by-resource comparison against the pinned candidate yields:

| Action | Count | Impact |
| --- | ---: | --- |
| Add | 0 | No new resources or roots |
| Modify | 81 | 77 resolver pipeline references, two nested template references, one codegen custom-resource asset, one API-key expiry |
| Delete | 308 | 77 IAM roles, 77 IAM policies, 77 AppSync data sources, 77 AppSync invocation functions |
| Replace | 0 identified | Static property/provider analysis and CDK template diff; actual AWS change set remains an execution-stage check |

Every changed property and every deletion matches the accepted action evidence. No envelope changes or stack movement. Candidate hierarchy: **2,621**; FunctionDirectiveStack: **475 → 167**. The 79 existing operations and authorization functions remain; 77 move to the two existing retained invocation anchors.

Read-only `cdk diff <exact-root> --app <pinned-assembly> --profile default --no-change-set` completed successfully and reported exactly three stacks with differences: root, data and FunctionDirectiveStack. It created no change set and uploaded no assets. The first attempt with `--strict` stopped on an existing cross-stack-reference warning; normal warning handling completed the diff. The warning was preserved; no feature flag was changed.

Protected impact:

- **DynamoDB/data stores:** no table, index or data migration change; all 55 physical table identities preserved.
- **Cognito:** pool/client/identity/group definitions and physical identities unchanged; no user migration or auth replacement.
- **AppSync:** API/schema unchanged; authorization functions retained. The reviewed resolver repointing and obsolete invocation-chain deletions are the intended change.
- **S3:** no bucket replacement/deletion. One existing `Custom::CDKBucketDeployment` changes its codegen source ZIP, so generated codegen objects will be updated. It is not a user-media migration.
- **Lambda:** all ten Ntgre Lambda resource definitions remain unchanged; the five application packages inspected live were also rebuilt and whole-ZIP SHA256 verified exactly.
- **IAM:** only the 77 redundant roles and 77 associated policies are removed; retained role/policy definitions are unchanged, with no new grants.
- **Custom resources:** the one reviewed codegen deployment update remains; no table-manager or bucket-auto-delete action is introduced.

See [complete fresh plan](phase1-ntgre-readiness-evidence-2026-09-26/in-place-plan.json). Raw CDK output and raw templates stay under ignored `.amplify/phase1-readiness-2026-09-26` because raw AWS responses may contain sensitive outputs.

## Validation completed today

| Check | Result |
| --- | --- |
| Complete unchanged accepted suite | **653 passed, 0 failed, 0 skipped** |
| Production build | PASS; existing chunk warnings retained |
| TypeScript and Amplify/frontend contracts | PASS |
| Local output ownership/live required resolvers | PASS for Ntgre |
| Accounting/budget tests | **41 passed, 0 failed** |
| Infrastructure CI including local synthesis | PASS with existing hosted debt allowance; no hosting pipeline/deployment run |
| Ntgre exact pinned allowance | PASS WITH APPROVED EXISTING DEBT |
| Fresh Ntgre synthesis | PASS: 2,621 resources, directive 167 |
| Exact Ntgre baseline/candidate comparison | **1,233 checks passed**, 0 failed; 0 additions / 80 updates / 308 deletions |
| Current live/pinned-candidate comparison | **0 additions / 81 modifications / 308 deletions**, all accepted changes match |
| Fresh whole-ZIP comparisons against current Lambda hashes | **5/5 exact** |
| Manifest preservation | **1,128/1,128 exact** |

The historical **1,238 checks / 81 local updates** concerned the earlier master-context comparison. The accepted Ntgre comparison already recorded **1,233 checks / 80 local updates**; today's rerun exactly reproduces it. Baseline and candidate local Ntgre syntheses share their API-key expiry, whereas live AWS has an older expiry, producing the 81st live modification. This is reconciled evidence, not a waived missing check.

The initial full suite passed 651 tests and failed two because the isolated Ntgre workspace lacked `.amplify/master-preview/cdk.out`. Materializing those local test template fixtures from today's successful master-context CI synthesis resolved both. No test or application file changed; no production AWS operation was involved. The complete suite was then rerun successfully.

`uv_os_get_passwd returned ENOMEM` was reproduced with a minimal `os.userInfo()` call inside the restricted shell. The same Node version succeeds as Windows user `Ntgre`. Running validation under that normal user resolves the environment problem; infrastructure CI passed without a source/tooling fix.

Fresh synthesis has two exact differences from the pinned candidate: API-key expiry advances from **2026-10-22T13:00:26Z** to **2026-10-26T11:08:09Z**, and the containing data-template hash changes its root reference. No other template property changed. The freshly generated assembly is **not approved by the existing artifact pins** and must not be substituted. The original pinned assembly still passes its allowance and remains the proposed deployment input. All five fresh application ZIPs match live AWS regardless of this timestamp change.

## Rollback and recovery

Current root reports **DisableRollback=true** and termination protection false. Cognito deletion protection is inactive; all 55 tables lack deletion protection, two have PITR, and the three buckets have no enabled versioning. Both KMS keys remain enabled. The 23 recorded SSM parameter paths have the same presence/absence as before (17 absent); no secret values were read. These are existing limitations, not newly introduced mutations. No restore drill or comprehensive backup re-audit was performed.

The next authorized process must explicitly execute the reviewed change set with **`--no-disable-rollback`**, rather than assume the existing stack or CLI defaults enable rollback. No protection setting was modified today. AWS documents the [execution rollback switch](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/execute-change-set.html).

Before execution, abort on any target/hash/template/role/operation mismatch. During failure before cleanup, allow the explicitly enabled CloudFormation rollback and monitor nested events. If obsolete-resource cleanup fails or rollback fails, stop and diagnose the root and nested failure events; do not delete/recreate the sandbox, skip resources blindly, or manually delete the old chains. Prefer a narrowly reviewed roll-forward for a post-cleanup regression. Further recovery execution requires its own reviewed scope.

No irreversible business-data action is identified. The removed chains are stateless, but restoring the former layout would recreate 308 resources, potentially with new physical identities. It is a separate expansion decision, not an automatically allowed deployment under the no-growth receipt. The baseline root/data/directive templates contain **568** total resources; candidate affected templates contain **260**. These are conservative changed-template counts, not an AWS-certified operation schedule. Full-root recreation remains prohibited and exceeds the fresh-create accounting gate.

The three existing baseline template/codegen S3 assets needed by the changed template chain were freshly checked and exist. Preserved baseline assemblies and captured templates are available locally. This supports a recovery plan but does not guarantee AWS rollback, service quotas, external dependency behaviour or application recovery. CloudFormation [nested cleanup guidance](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html) remains relevant.

Post-deployment success evidence must include: root/nested completion events; hierarchy 2,621 and directive 167; the exact intended deletion set; unchanged protected IDs and five application Lambda hashes; preserved 79 operations/auth stages; output/contract checks; ordinary/member/admin and negative cross-tenant checks for Team Hub, Investor, Workspace, Twitch and overlays; and scoped error/authorization monitoring. Use safe provider/payment test modes. Do not promote automatically to production.

## Exact next process — NOT EXECUTED

After separate explicit Ntgre deployment authorization, recheck STS, root ARN/status, pinned allowance/source/assembly hashes and the three changed live templates. Stop on a difference or expired allowance. Use the normal Windows user outside the restricted shell. Set `$env:AWS_REGION` and `$env:AWS_DEFAULT_REGION` to `eu-north-1` for that process.

From the repository root, prepare the pinned change set (publishes required assets but does not execute the update):

```powershell
$phaseW = Get-Content docs/architecture/phase1-ntgre-artifact-evidence/windows-workspaces.json -Raw | ConvertFrom-Json
$phaseRoot = 'amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332'
$phaseAssembly = Join-Path $phaseW.candidate '.amplify/ntgre-preview/cdk.out'
$phaseCdk = Join-Path $phaseW.candidate 'node_modules/aws-cdk/bin/cdk'
node $phaseCdk deploy $phaseRoot --app $phaseAssembly --profile default --exclusively --method prepare-change-set --change-set-name ntgre-phase1-pinned-20260926 --rollback --require-approval any-change
```

Inspect the actual created change set and relevant nested effects against the complete plan. Refuse creation/replacement, unexpected assets/actions, wrong execution role or wrong root. Only if it matches the explicitly authorized scope, execute with rollback explicitly enabled:

```powershell
aws cloudformation execute-change-set --stack-name $phaseRoot --change-set-name ntgre-phase1-pinned-20260926 --no-disable-rollback --profile default --region eu-north-1
```

Then monitor the update and collect the post-deployment evidence above. These commands have **not** been run. The read-only CDK diff is a [template comparison](https://docs.aws.amazon.com/cdk/v2/guide/ref-cli-cmd-diff.html), not a promise of the eventual AWS change-set outcome. The prepare/execute separation follows the [CDK deployment options](https://docs.aws.amazon.com/cdk/v2/guide/ref-cli-cmd-deploy.html).

No remaining preparation blocker was found for the **preserved pinned candidate**. Deployment authorization remains outstanding. The gate does not cover HEAD, the current working tree, fresh timestamp-bearing assemblies, sandbox recreation or production.

Evidence: [manifest](phase1-ntgre-readiness-evidence-2026-09-26/evidence-manifest.json), [live refresh](phase1-ntgre-readiness-evidence-2026-09-26/refresh-summary.json), [final validation](phase1-ntgre-readiness-evidence-2026-09-26/final-checks.json), [fresh package hashes](phase1-ntgre-readiness-evidence-2026-09-26/fresh-lambda-packages.json), [recovery settings](phase1-ntgre-readiness-evidence-2026-09-26/recovery-refresh.json), [rollback assets](phase1-ntgre-readiness-evidence-2026-09-26/rollback-assets.json).
