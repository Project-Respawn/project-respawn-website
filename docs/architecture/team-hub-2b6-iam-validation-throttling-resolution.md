# Team Hub 2B6 — revised recovery validation plan

11 October 2026. **Validation design only. No AWS API calls, installation or recovery execution in this task.** Approved recovery permissions and bytes are unchanged. This plan needs recovery review before replacing the previous all-210-installed execution gate.

## Diagnosis

The observed throttled operation was **IAM SimulatePrincipalPolicy**, returning `Throttling: Rate exceeded`. SimulateCustomPolicy completed all 210 supplied-policy checks in the prior attempt; there is no evidence it throttled in that attempt. Exact AWS quota/bucket occupancy and realized per-second request timestamps were not captured, so no service quota or precise observed RPS is asserted.

Previous configured behavior:

| Stage | Scheduling | Error handling |
|---|---|---|
| Initial actual-role suite | Five concurrent calls per batch, no deliberate spacing | CLI AWS_MAX_ATTEMPTS=1; abort batch on first rejection |
| First slowdown | Two concurrent calls, 750 ms between batches | Same; manual read-only resumption |
| Batched resources | One action/context per request, initially 3-second then 6-second delays | Same; no exponential backoff |

The first multi-resource parser also incorrectly expected only top-level EvalResourceName; it was corrected to read ResourceSpecificResults. Earlier scripts asserted on pagination rather than completing it. Historical scripts/evidence remain intact. These are harness shortcomings, not evidence that the recovery IAM is too restrictive. The installed role was verified, then removed after validation could not complete; the workflow never ran.

164 distinct installed-role cases passed; **46 remained unfinished**. The unfinished set is not the final 46 array entries because resource batching changed completion order. It includes Command Encrypt/Decrypt positives, Read/Command context denials, speculative KMS actions and eight DynamoDB isolation cases. [Exact unfinished IDs, labels, actions, resources, conditions and decisions](team-hub-iam-validation-evidence-2026-10-11/unfinished.json). No unfinished check is deleted.

## Suites and coverage

The immutable source list is the previous 210-case certification. Stable IDs IAM-001 through IAM-210 retain the exact actions/resources/expected decisions. Every case is classified by requirement, risk, historical completion and actual-role requirement in the [coverage map](team-hub-iam-validation-evidence-2026-10-11/coverage.json).

| Suite | Cases | Base API requests | Purpose |
|---|---:|---:|---|
| Full pre-install certification | 210 | 58 | All positives and all negative permutations, including every unfinished case |
| Execution-critical installed-role suite | 68 | 36 | All 12 positive cases plus boundary controls and actual role readback |
| Optional full installed-role suite | 210 | 58 | Supported before window opening; not required by the proposed reduced gate |

Requests may increase for pagination/retries. Grouping is deterministic by complete context and action, with at most 50 resources. Actions are not combined into an unchecked Cartesian product. Identical semantics may share one AWS result while retaining separate case IDs. API per-resource results and all pages are checked; missing, duplicate or mismatched results fail closed.

The 68 critical cases include both unqualified functions and both exact `$LATEST` updates, GetFunctionConfiguration, all Encrypt/Decrypt positives, wrong/missing service/account/context, wrong managed/unknown keys, time/region denials, alias/version controls, code-update denial, IAM/PassRole, business/other services and every unrelated domain represented by the full suite. The complete suite retains every finer permutation. Cases not directly repeated against the role are covered by full policy certification **and** mandatory installed equivalence **and** actual-role witnesses for their security category; this is not a claim that static certification models every external policy layer.

Wrong-principal coverage is a separate requirement: exact installed service-only trust, exact source account/machine, no attached policies/boundary and one exact inline policy. Offline controls reject human/wrong-service/account/workflow trust inputs. Identity-policy simulations do not prove STS trust; actual Step Functions assumption remains a live gate. No misleading CallerArn substitution is used to claim another principal cannot assume the role.

`verifyInstalled` compares exact parameterized policy, trust, workflow, role/machine ARNs, active status, no boundary, no attached policies and exact inline-policy names. Before/after simulation snapshots must use the same RoleId. Re-read these immediately before execution as well. Any drift invalidates certification. Full artifacts, environment maps, revisions and runtime hashes remain subject to their existing gates.

## Rate control and failure handling

[Harness](../../scripts/team-hub-iam-validation/harness.mjs), [future read-only runner](../../scripts/team-hub-iam-validation/run.mjs), [offline tests](../../scripts/team-hub-iam-validation/harness.test.mjs).

- One in-flight request, minimum **15 seconds between starts**, shared across custom/principal simulations and pagination. Local exclusive lock prevents concurrent runs of this harness; operator must stop other IAM test jobs using the account. Other clients may still consume AWS quota.
- Throttling only: maximum **six attempts per page** (initial plus five retries). Equal jitter delay is cap/2 + random × cap/2, cap=min(60 seconds, 5 seconds × 2^retryIndex). Retry timing also respects the 15-second floor. Production jitter varies; injected clock/random make test replay deterministic.
- No retries for AccessDenied, unexpected decisions, invalid input, transport ambiguity or missing results. Bounded CLI timeout and AWS_MAX_ATTEMPTS=1 avoid nested retry loops. No mutation APIs exist in the adapter.
- Maximum 30 minutes per suite, including waits; 30-second maximum request timeout. Persistent throttling or deadline exhaustion yields incomplete evidence, never PASS. Every attempt and page is recorded. Complete batches are validated atomically. A failed suite cannot authorize execution.
- New run requires a new evidence output; old success receipts are not reused as current installed proof. No automatic permission change, time-window extension, workflow retry or refreshed RevisionId.

The 15-second rate is conservative engineering policy, **not an asserted AWS quota or guarantee against throttling**. [AWS simulator API and pagination/context semantics](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulatePrincipalPolicy.html), [custom-policy API](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html).

## Sequencing and timing

Yes, all installed-role simulations can run **after installation but before NotBefore**. The security operator invokes IAM simulation and supplies a simulated aws:CurrentTime inside/outside the proposed window. This does not invoke the target Lambda or enable the role early. The role's actual NotBefore/ExpiresAt remain unchanged. Do not run the fixed workflow early.

Proposed separately reviewed sequence:

1. Complete all 210 supplied-policy cases before installation. Use explicit window parameters and bind receipts to candidate, cases and parameter hashes. No pending/failed case allowed.
2. Plan enough lead for certification and installation without racing the permission window. For this conservative harness, select NotBefore **60 minutes ahead**, ExpiresAt exactly NotBefore+900 seconds. This changes only reviewed parameter scheduling, not permission duration or IAM. The earlier authorization allowed at least two minutes lead, but this revised schedule/gate should be reviewed as part of this plan.
3. Certification base duration is roughly 14.25 minutes of spacing plus API latency (58 calls); critical installed suite about 8.75 minutes plus latency (36 calls). Each suite has a 30-minute upper bound. Certification, provisioning and critical validation must finish at least two minutes before NotBefore. If they cannot, stop and clean up; do not edit the installed window or rush execution. The 60-minute lead does not guarantee success under persistent throttling.
4. The full installed suite is available instead of critical mode, with approximately the same base duration as certification. It can also run before opening; provision its lead explicitly. Do not run critical plus full unnecessarily.
5. Immediately before a single authorized start, refresh identity/revisions/full maps/authority/data/protected baselines, installed equivalence and receipt hashes. Wait until NotBefore, and retain the existing requirement for at least ten minutes remaining. Unexpected actual-role decisions stop even though organization inspection was previously waived.
6. Preserve all original live recovery, drift, authenticated authority/16-route, monitoring and cleanup acceptance gates. The live 15-minute permission window is never extended to accommodate validation.

The CLI defaults to zero-call planning: `node scripts/team-hub-iam-validation/run.mjs certify` (or `critical`, `full-installed`). Future live validation requires explicit `--live-read-only --window <receipt> --out <new receipt>` and separate task authorization. It cannot create/change a role or start recovery. Execution orchestration is deliberately not changed by this design task.

## Tests, preservation and remaining uncertainty

42 offline tests pass: 13 harness scenarios and 29 existing integrity/trust tests. Scenarios include the recorded AWS throttling error text, transient/persistent synthetic rate limits, spacing, bounded attempts, pagination/empty pages, missing/duplicate responses, deadline exhaustion, denial without retry, installed drift and full 210/68 coverage. Mock responses test transport/assertion behavior; they are **not fresh AWS policy certification**. No AWS Access Analyzer or IAM calls were made this turn. Existing Analyzer evidence remains unchanged because the policy is unchanged.

Approved SHA-256 pins, rechecked locally:

- Candidate: `4b4e49d07629dbb7fd4fa982bba30a10c3685dd0f989e8ae54161a128dd5470e`
- Security template: `b63d162ddf23d8fef1fe8e0f3ebbfa2096c8ffa655c3e93b15be39dac729830e`
- Identity policy: `06c4e9c0126ba4438acd87329442922a7d3b87eabf29092115b35db0979687fe`
- Workflow: `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376`

No security requirement is intentionally removed. Remaining limitations: live IAM throttling behavior is unproven at the new rate; actual service-mediated KMS/key-policy behavior and STS assumption remain live-only; organization policies remain uninspected under the user's prior waiver. A successful reduced installed suite cannot establish all possible external-policy conditions. Fresh readback, critical simulations and final live evidence remain mandatory. Permanent runtime IAM, environment maps, RevisionIds, frontend, authority and historical evidence are unchanged.

**IAM VALIDATION PLAN READY FOR RECOVERY REVIEW**
