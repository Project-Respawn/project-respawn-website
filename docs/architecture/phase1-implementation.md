# Phase 1: safeguards and current-source consolidation

Status: **IMPLEMENTED LOCALLY / NOT DEPLOYED / REVIEW REQUIRED**. Date: 2026-09-21.

The architecture direction and this preparation were approved. No Amplify/CDK deployment, CloudFormation update/change set, import, physical rename, user/data migration, DNS change or production environment change occurred. The running local `ampx sandbox` watcher was stopped before editing backend source to prevent an automatic deployment; Vite was left running. The watcher remains stopped intentionally.

## A. Implementation summary

The current working tree was snapshotted before edits, including its existing uncommitted auth/local-environment work. Git base: `development` at `3cf3928`. Those earlier changes were preserved. Only `amplify/data/resource.ts` changed inside the backend tree for Phase 1; no frontend source or generated amplify_outputs.json changed.

Implemented the approved LegacyPlatform rule in AGENTS.md and architecture guidance. Substantial new domains no longer default into the shared Amplify backend. A nested stack or `backend.createStack()` is explicitly not an independent release unit; future sibling roots are chosen by lifecycle, size, security and operational ownership. No new roots were created.

Replaced the template-only size check with manifest-based recursive accounting. It reports every template instance, hierarchy total, nested contribution, resource types, generated model/function contributors, module estimates and before/after deltas. Missing assets, cycles, escaping paths and ambiguous roots fail closed. Instantiating the same template twice counts twice; stale files outside the selected hierarchy do not count.

Reconstructed the consolidation from **current source**, retaining all 79 operation definitions: 71 shared-handler operations and eight admin-handler operations. The inverse transformation reproduces the complete pre-change schema exactly after newline normalization. `readTeamHub` and `mutateTeamHub` remain the two Team Hub gateways.

### Reproducible dependencies

The original current lockfile failed Linux `npm ci`. Its parsed contents were proven identical to the historical candidate's original baseline lock, despite byte differences from line endings. The previously reviewed repair was evaluated against that current content before adoption: **1,683 -> 1,800 lock entries, zero changes to any already recorded version or integrity hash**, with unchanged root dependency ranges. The large lockfile diff restores missing/bundled metadata and historical dependency entries; it is not an application dependency upgrade. Both independently installed Linux copies passed `npm ci` with this same repair. The host node_modules directory was not reset.

`amplify.yml` now uses `npm ci --no-audit --no-fund` instead of `npm install` in its existing install positions, and runs `validate:infrastructure-ci` before its existing deployment command. That deployment command was **not executed**. The lockfile repair remains separately reviewable from the schema alias change.

## B. Resource accounting

Fresh baseline and candidate synthesis used the same current source except the reconstructed consolidation and the same repaired dependencies. Counts include metadata/custom declarations and nested handles, not only billable service resources.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Complete root hierarchy | 2,936 | 2,628 | -308 |
| Template instances | 62 | 62 | 0 |
| Largest template | 475 | 167 | -308 |
| FunctionDirectiveStack | 475 | 167 | -308 |
| AppSync function configurations, all stacks | 1,678 | 1,601 | -77 |
| AppSync resolvers, all stacks | 557 | 557 | 0 |
| AppSync data sources | 132 | 55 | -77 |
| IAM roles | 156 | 79 | -77 |
| IAM policies | 98 | 21 | -77 |
| Lambda functions | 12 | 12 | 0 |
| Model-generated declarations | 2,098 | 2,098 | 0 |
| Nested-template contribution, excluding root's 14 declarations | 2,922 | 2,614 | -308 |
| Nested-stack handles, already included in totals | 61 | 61 | 0 |
| Team Hub model-stack contribution | 184 | 184 | 0 |

The directive stack retains 79 resolver and 79 authorization-function resources. Invocation functions/data sources/roles/policies each fall from 79 to two. Model-generated counts cover entire model-table stacks; generated connection/support resources outside them remain in Other platform resources. Module attribution is based on stable existing stack names; shared generated directives stay in the shared/generated category. It is not a claim that every cross-domain dependency has been isolated.

### Enforced budgets

| Measure | NORMAL | WARNING | ACTION REQUIRED | HARD LIMIT / BLOCKED |
| --- | --- | --- | --- | --- |
| Individual template | <=250 | 251–350 | 351–480 | >=481 internal block; AWS limit 500 |
| Root fresh-create declaration count | <=1,000 | 1,001–1,800 | 1,801–2,500 | >=2,501 |

Unreviewed action-level counts fail. Growth warnings start at +25 resources or +10% per attributed module; growth above +50 or +20% requires review. These thresholds reserve meaningful space for generated IAM/pipelines rather than waiting until 495/500.

The candidate's **default create check deliberately fails at 2,628**. A smaller FunctionDirectiveStack has not solved the whole-tree creation constraint. An update's actual affected-resource count is explicitly UNKNOWN; a static template count cannot certify AWS operation size.

A checked-in, SHA256-pinned, expiring existing-debt receipt permits accounting of **non-growing existing-root updates only** for the exact master/staging roots. It is pinned to the candidate's 2,628 ceiling, not the old 2,936, so reverting the consolidation cannot silently consume the old headroom. It permits no increasing template contribution or added stack and does not waive the 480 template gate. It expires **2026-10-21** and names the platform maintainers and debt-removal milestone. This is an accounting exception, not AWS deployment approval. A fresh create cannot use it.

### CI behavior

The gate uses normalized source receipts, not just `HEAD^`, so a multi-commit backend change cannot hide behind a final frontend-only commit. Covered unchanged infrastructure inputs report the debt and skip synthesis; unrelated frontend edits do not fail because of existing hierarchy debt. Changes to backend/configuration, infrastructure, scripts, dependencies or the build spec trigger branch-aware local synthesis and the strict comparison. Unknown branch/auth contexts cannot take the unchanged shortcut. `--force` / `RESOURCE_ACCOUNTING_FORCE=1` forces the accounting path.

Both the unchanged-input path and forced synthesis/update-accounting path passed in Linux. Never regenerate the baseline automatically in CI. Changes to the baseline, debt scope/expiry, hash or thresholds require explicit review. Target existence, AWS account/region, actual change-set scope and replacements remain separate pre-deployment checks; accounting alone is not that proof.

## C. Exact consolidation diff

The independent Linux comparison reports **0 ADDED, 81 UPDATED, 308 DELETED**, with **1,238 checks passed**. A separate host-installed Windows synthesis comparison reproduced the same resource counts/actions. Exact logical IDs and changed properties are in [changes.json](phase1-evidence/changes.json); full assertions, resolver mappings and asset hashes accompany it.

| Change | Count | Detail |
| --- | ---: | --- |
| Updated AppSync resolvers | 77 | Only pipeline invocation reference changes; existing field/auth stage remains |
| Updated nested-stack references | 2 | Root data template URL and FunctionDirectiveStack template URL |
| Updated generated client/codegen deployment | 1 | SourceObjectKeys only; existing deployment/bucket identity unchanged |
| Updated existing AppSync API key | 1 | Time-generated Expires property only; same key logical ID/API association |
| Deleted redundant IAM roles | 77 | Only obsolete directive resources |
| Deleted redundant IAM policies | 77 | Only obsolete directive resources |
| Deleted redundant data sources | 77 | Replaced by routing to the two retained sources |
| Deleted redundant invocation functions | 77 | Authorization functions are not deleted |

Linux baseline expiry: **2026-10-21 16:06:01 UTC**; candidate: **2026-10-21 16:15:00 UTC**. This is synthesis-time drift, not an applied renewal. Re-synthesis changes this timestamp again; explicitly review the expiry in the eventual AWS plan.

The retained anchors are `FnSubmitInvestorAccessRequest` and `FnReviewInvestorAccessRequest`. They correspond to the existing shared-handler/admin invocation infrastructure. Reusing their names retains the existing logical identities for those two data sources, invocation functions, roles and policies. Arbitrary friendly aliases would instead add replacement infrastructure and remove the old anchors.

### Protected-resource results

| Resource / concern | Result |
| --- | --- |
| 52 custom-managed model tables and three native DynamoDB tables | Definitions and identities unchanged; no additions/deletions |
| Cognito pool, client, identity pool, groups and role attachment | Unchanged |
| Three S3 buckets | Unchanged |
| Two KMS keys | Unchanged |
| AppSync API and schema identity | Unchanged |
| All 12 Lambda definitions and code references | Unchanged |
| Ten unique Lambda assets / 35 uncompressed files | Byte-identical baseline vs candidate |
| Payment/webhook API routes, integrations, stages and permissions | Unchanged |
| Team Hub / Creator / Twitch state and runtime source | Unchanged |
| Template parameters, outputs, conditions and other envelope fields | Unchanged |
| Generated local amplify_outputs.json | Unchanged |

No unexpected stateful change was found, so the preparation STOP condition was not triggered. This is a precise synthesis comparison, **not an executed AWS change set or a guarantee of live update order**. The new comparison script fails on a protected-resource difference or any change outside the narrow consolidation scope.

## D. Security and authorization equivalence

All 79 existing field resolvers and their authorization-function logical IDs/definitions remain. All resolver properties outside the invocation pipeline reference remain identical. The comparison verifies invocation request/response VTL semantics (ignoring comments only), Lambda target, field-name stash, and the four retained directive IAM role/policy definitions. Shared and admin targets remain separate. No IAM grant was broadened by the consolidation.

The schema inverse-transformation check proves model/field/global authorization and operation signatures were not edited. Existing Team Hub gateway tests passed, including membership/role/capability boundaries. Investor/workspace/Twitch and other backend tests were included in the complete suite. The existing `authoritativePermissions` mock/expectation failure remains a release concern; template equivalence does not turn it into a passing authorization test.

Existing broad grants are recorded separately: schema-level `allow.resource(myFunction/adminUserManagement)` can query/mutate across domains; the shared handler spans many products; admin Cognito actions use a wildcard resource in backend.ts. These were not opportunistically redesigned. No browser sign-in, production user, live payment or provider callback was exercised. Equivalence evidence is strong for this infrastructure rewrite, but does not certify the entire existing authorization system as correct.

## E. Test ledger

Linux: Node 22.18.0/npm 10.9.3, two independent installations, no AWS credentials mounted. Read-only local-output verification used the host's existing AWS profile. Detailed logs and machine-readable comparisons are in [phase1-evidence](phase1-evidence/README.md).

| Check | Baseline | Candidate | Interpretation |
| --- | --- | --- | --- |
| Original current lockfile `npm ci` | FAILED | NOT RUN separately with original lock | Original current lock semantically matches historical broken baseline; repaired candidate tested below |
| Repaired lock `npm ci` | PASSED | PASSED | Independent clean installations; same locked dependency graph |
| TypeScript before fresh synthesis | FAILED: missing generated env declarations | Same failure | Clean-checkout prerequisite, not an alias regression |
| TypeScript after master synthesis | PASSED | PASSED | Required Amplify env declarations now generated |
| Amplify/frontend contract validation | PASSED | PASSED | 24 queries, 55 mutations; 62 frontend operations, none missing |
| Amplify guard tests | 16 passed | 16 passed | Existing local environment protection remains |
| Team Hub backend | 47 passed | 47 passed | Gateway behavior preserved |
| Team Hub frontend + Tournament tests | 24 passed | 24 passed | No Phase 2/3 implementation |
| Overlay tests | 139/142; 3 FAILED | Same | Identical existing assertions, listed below |
| Connected-demo tests | 8/9; 1 FAILED | Same | Existing source-text route assertion |
| Master-preview tests before synthesis | 16/17; fixture absent | Same | Required generated template was absent |
| Master-preview tests after synthesis | 17/17 PASSED | 17/17 PASSED | No test fixture/source patched to hide failure |
| Master backend synthesis | PASSED | PASSED | Local only, 62 templates each |
| Runtime ownership after synthesis | 3/3 PASSED | 3/3 PASSED | Existing fixture path populated normally |
| Complete suite, LF/case-sensitive Linux with neutral test environment | **620/627; 7 FAILED** | **646/653; same 7 FAILED** | 26 added safeguard tests passed; zero additional failures |
| Production frontend build | PASSED | PASSED | Process-only matching local API URL and sandbox payment placeholder; no functional payment test |
| New accounting tests | Not present | 24/24 PASSED | Nesting, duplicate instances, thresholds, debt, paths, frontend scope and CRLF-safe receipt hashing |
| New consolidation source tests | Not present | 2/2 PASSED | Anchors and authenticated Team Hub gateways |
| Exact Linux templates/assets/equivalence | Reference | 1,238 checks PASSED | 0 unexpected protected-resource or out-of-scope changes |
| Deliberately altered table in temporary assembly | Reference | BLOCKED as designed | Both protected-resource and allowed-scope checks rejected it |
| New default fresh-create accounting | Baseline is over limit | **BLOCKED as designed** | Candidate 2,628 > 2,500; not a false green |
| Bounded update accounting / forced CI | Reference ceiling | PASSED WITH EXISTING DEBT | Actual AWS update size still unknown |
| Existing staging branch CI context | Reference ceiling | PASSED WITH EXISTING DEBT | Local synthesis only; no staging deployment |
| Unchanged-input CI path | Not present | PASSED | Reports debt without blocking unrelated frontend work |
| Local output validation | PASSED against current Ntgre | Same outputs/operation contract unchanged | Read-only AWS inspection; no deployment |
| Actual deployment, AWS change set, rollback, live auth/provider/payment integration | NOT RUN | NOT RUN | Explicitly outside authorization |

The initial exact-Windows-byte Linux runs produced 617/627 baseline and 643/653 candidate, each with ten failures. Two extra failures were source-text regexes sensitive to CRLF in application/media boundary tests; one was introduced by the validation harness setting AWS_BRANCH=master for every test. Container-only LF normalization and removal of that harness variable yielded the seven identical failures below. No repository test, frontend source or authorization code was changed to obtain the comparison. The original logs remain available; the final suite is still red.

### Remaining seven failures, proven on both current versions

| Test | Existing failure |
| --- | --- |
| `amplify/data/stage9-boundaries.test.ts` | Linux casing: test opens Adminevents while the tracked directory is AdminEvents |
| `amplify/myFunction/shared/authoritativePermissions.test.ts` | Mock expects platform-brand error; existing workspace-owner check rejects first |
| Connected-demo Creator Tools routes | Exact source regex expects route path/name formatting that differs from current source |
| Runtime widget Chat v2 | Stale expected fallback expression |
| Browser Source refreshed Chat configuration | Stale expected fallback/normalization expression |
| Legacy live-state test | Expected “Status unknown”; current component renders “Published” |
| Admin-only demo action/email preview | Exact regex omits current application.isDemo condition |

These are attributed, not waived. Resolve them in a separately reviewable test/behavior change, or obtain an explicit release exception after assessing each failure. Do not declare the repository fully green.

## F. Files changed for this phase

Pre-existing dirty files outside this list were preserved; the initial and final source receipts identify the boundary.

| File | Reason |
| --- | --- |
| `AGENTS.md` | Approved LegacyPlatform/domain decision rule |
| `amplify/data/resource.ts` | Current 79 operations mapped to two retained named handlers |
| `package-lock.json` | Verified historical metadata/missing-entry repair for current identical lock baseline |
| `package.json` | Resource accounting, CI and consolidation-test commands |
| `amplify.yml` | Reproducible installs and pre-deployment accounting hook; not executed |
| `scripts/validate-amplify-stack-size.mjs` | Manifest/root-aware accounting CLI, comparison and debt receipt validation |
| `scripts/lib/cloudformation-accounting.mjs` | Traversal, generated/module attribution, budgets, deltas and reporting |
| `scripts/lib/infrastructure-inputs.mjs` | Normalized infrastructure source receipts; excludes frontend-only changes |
| `scripts/validate-infrastructure-ci.mjs` | Existing-build integration, unchanged-input shortcut and forced synth/gate |
| `scripts/synthesize-resource-accounting.mjs` | Branch-aware synthesis-only entry; fresh local output directory |
| `scripts/synthesize-master-backend.mjs` | Restrict deletion/recreation of local synth artifacts to a child of workspace .amplify |
| `scripts/cloudformation-accounting.test.mjs` | 24 meaningful guard tests |
| `scripts/handler-consolidation.test.mjs` | Anchor inventory and Team Hub gateway regression tests |
| `scripts/compare-handler-consolidation.mjs` | Exact local resource diff, protected-resource STOP checks, auth/VTL/asset equivalence |
| `scripts/config/legacy-resource-baseline.json` | Candidate count ceiling and input receipts |
| `scripts/config/legacy-resource-debt.json` | Exact-root, non-growing, expiring accounting allowance |
| `docs/architecture/adding-a-new-feature.md` | Explicit approved LegacyPlatform checklist |
| `docs/architecture/cloudformation-boundaries.md` | Implemented commands, thresholds and exception semantics |
| `docs/architecture/platform-architecture.md` | Distinguish initial audit snapshot from approved direction/current Phase 1 |
| `docs/architecture/migration-plan.md` | Link current phase results while retaining historical ledger |
| `docs/architecture/decisions.md` | Record approved direction without granting migration/deployment authorization |
| `docs/architecture/phase1-implementation.md` | This A–J review report |
| `docs/architecture/phase1-evidence/*` | Exact diff/checks/asset hashes, before/after counts, failure attribution and test logs; manifest in evidence README |

Local `.amplify/phase1` snapshots, containers, helper runners and assemblies are validation artifacts, not deployed infrastructure or application code. No commit or push was performed.

## G. Remaining risks

1. The hierarchy remains above fresh-create limits. Do not create a new sandbox/root from this LegacyPlatform schema or claim that a small successful update proves creation safety.
2. Seven existing tests remain red. Their equivalence establishes attribution, not release readiness.
3. Generated resource deletion order/rollback have not been exercised live. Rolling back can reintroduce 308 resources; review capacity and prefer an explicitly planned roll-forward when appropriate.
4. The Linux clean build and host installed build use different tool environments. Both reproduce the same consolidation delta; neither replaces comparison against freshly retrieved templates/assets of the actual non-production target.
5. API-key expiry and codegen asset references vary with synthesis time/content. Inspect the exact future AWS plan rather than reusing this report's timestamps.
6. Shared-account rollout is still separate. This task does not activate the earlier shared Cognito candidate or change group/identity-role trust.
7. The pinned debt receipt expires and can be changed by reviewers; it must not become an automatically raised quota. Target/operation verification is still mandatory.

## H. Recommended non-production deployment plan — NOT EXECUTED

1. Review this patch/evidence, the lockfile repair and the seven test failures. Fix or explicitly disposition the failures before a release decision. Pin the exact source/dependency revision and Node/npm toolchain.
2. Obtain separate target-specific deployment authorization. Prefer an **existing** non-production root such as current Ntgre or staging; identify its current ARN, branch/app/account/region and physical pools/APIs/tables dynamically. Do not create a parallel sandbox or assume the historic Ntgrestage8 name.
3. Verify recovery/PITR/retention and operational rollback readiness for that target. Capture deployed templates, outputs, schema/auth contracts and Lambda asset hashes. This audit has not created backups or tested restoration.
4. Synthesize baseline/candidate for that exact non-production context, using the final locked environment. Re-run accounting and the exact comparator against a fresh baseline; compare candidate to deployed state as well. Root totals differ for sandbox vs hosted branch, so do not transplant the production receipt blindly.
5. Under separate authorization, prepare/review the AWS change plan. Accept only the intended alias changes, documented codegen/template URLs and reviewed expiry drift. Stop on any unexpected table/pool/client/identity/bucket/key/API/Lambda/payment/runtime change. Confirm actual touched resources and update/dependency ordering fit AWS limits.
6. Execute only that reviewed in-place update after authorization. Keep the local watcher stopped until intentional execution, and ensure its identifier targets the existing canonical root. No stateful moves, physical renames or user migration belong in this deployment.
7. Regenerate outputs from the same target, run local/branch-aware output validation, contract tests and scoped role tests. Exercise ordinary/member/admin users, Team Hub roster/champion pools, investor expiry, workspace membership/revocation, Twitch/overlay routing and negative cross-tenant cases. Use safe provider/payment test modes; verify no duplicate side effects.
8. Observe error rates, denied/allowed requests, deployment events and relevant traffic for an agreed window. Trigger the reviewed rollback/roll-forward plan on access regression, missing operations, state drift or unexpected external effects. Do not blindly revert to a larger template during a failed update.
9. Reconcile physical IDs and counts after success. Production is a separate review/authorization; no automatic promotion is proposed.

## I. Phase 2 readiness

**Ready to plan as a separate frontend-only change; not started here.** No frontend import/route initialization was modified. Preserve the new infrastructure guard and keep Phase 2 separate from the consolidation deployment. Before claiming a green release, resolve/disposition the seven existing tests and establish the route/auth baseline. Then implement route lazy loading and configure-before-client initialization with the existing frontend plan's browser acceptance tests.

## J. Phase 3 readiness

**Architectural direction and guardrails are ready; implementation/deployment is not yet authorized.** Complete the agreed Phase 1 non-production proof and Phase 2 boundaries first. Tournaments remains a fixture-only frontend. Its future service should be a sibling root with shared identity, its own data/permissions/budget and a versioned Team Hub contract. No Tournament backend, tables, Cognito pool or root was created.
