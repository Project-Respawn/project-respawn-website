# Project Respawn Team Hub 2B6 — quota-corrected isolated AWS verification result

**ISOLATED AWS BUSINESS VERIFICATION ACCEPTED — READY FOR FINAL CUTOVER REVIEW.**

12 October 2026. The separately authorized, exact quota-corrected lifecycle completed. Four temporary resources were created, used and removed. The approved ZIP object version was uploaded and deleted. All 48 real DynamoDB scenarios and all nine actual-Read-role cursor checks passed. No permanent IAM/runtime, live business state, authority, frontend, source fence or production change occurred. This is isolated acceptance, not business cutover.

## Exact artifacts and change set

| Artifact | Verified SHA-256 |
| --- | --- |
| Candidate | `13db6824ce0f661a4b271a38108c706204b886edb5c7e6e39eea68fc2e492a4b` |
| Template | `62a06af84531336c4067d5a4158575d7a84b2ed9029a4f51765fe34b878a7c9f` |
| Runner policy | `91f88143ba16d5c11cdfd1293c86fbd5ca7c2a2f04311c5962f6112a28228d97` |
| Probe ZIP | `a072a13df0aa7e4299fb8f01a8e77513e8f9bcf6ae37c4867a933b1f09e9d1e4` |
| Existing Read/Command ZIP, unchanged | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |

[Pins and source closure](team-hub-isolated-quota-execution-evidence-2026-10-12/pins.json): original blocked candidates and evidence preserved; no runtime rebuild, synthesis or HEAD substitution. Probe reserved concurrency remained unset. Existing Read role and log group reused without permanent permission changes. That role retains its accepted Team-owned read/Core access; it is not a secret-only role. Fixed code, empty input, one invocation and no public/event trigger constrain this approved probe.

AWS account 058264289478, eu-north-1; approved identity arn:aws:iam::058264289478:user/RavenTest. Fresh unreserved capacity 10; sampled utilization had no throttles/exhaustion. [Custody](team-hub-isolated-quota-execution-evidence-2026-10-12/custody.json) and [Provisioning identity policies](team-hub-isolated-quota-execution-evidence-2026-10-12/operator-policy.json): 41 lifecycle checks plus exact object-version cleanup permission passed. Existing Founder administrator access was inspected, not added. Organization policy visibility remains the previously accepted limitation; these tests do not prove every external policy layer.

Change set: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/quota-corrected-isolated-20261012/79692b47-e77e-4628-8501-1b338b3e3e1a`.

[Complete AWS change set](team-hub-isolated-quota-execution-evidence-2026-10-12/change-set.json) and [Review](team-hub-isolated-quota-execution-evidence-2026-10-12/change-review.json): four additions only, zero modifications/deletions/replacements or nested stacks. AWS-held template and time parameters matched. Exact two synthetic tables, restricted role and fixed cursor Lambda; no API, secret, log group or permanent resource added. CloudFormation reached CREATE_COMPLETE with rollback enabled. [Provisioning receipts](team-hub-isolated-quota-execution-evidence-2026-10-12/provision.json).

Runner permission window: 2026-10-12T19:00:51.830Z through 2026-10-12T20:00:51.830Z, at most one hour. Temporary role removed before expiry. [Installed verification](team-hub-isolated-quota-execution-evidence-2026-10-12/installed.json): exact trust/policy, no attached managed policies or boundary, table schemas/tags/recovery, exact probe code/role/logging, absent reservation/triggers verified. 138 installed-role allow/deny/time/region controls passed. Fresh [runtime IAM](team-hub-isolated-quota-execution-evidence-2026-10-12/runtime-security.json) passed 65 cases and four Analyzer validations; [runner certification](team-hub-isolated-quota-execution-evidence-2026-10-12/proposal-security.json) passed 36 cases and one Analyzer validation. All five Analyzer results had zero findings.

## Actual AWS verification

[Transactions and durable cleanup receipts](team-hub-isolated-quota-execution-evidence-2026-10-12/transactions.json): 48/48 scenarios, 728 SDK requests with maxAttempts 1. Actual assumed runner identity and exact tagged table ownership were verified. Tests covered atomic commits/cancellations, missing/stale authority, LEGACY_WRITER/FROZEN rejection, authority and membership races, revision conflicts, concurrent Team/roster changes, replay/idempotency, audit integrity and zero partial writes. Three expected TransactionCanceledException responses were recorded with AWS request IDs. No automatic suite retry.

The reviewed Admin, Manager, Coach, Player and ordinary-user fixtures exercised the unchanged business handlers. Core/persona adapters were explicitly synthetic; this is not real Core/browser authorization success for activated business routes. Wrong roles, subjects and Teams, revoked Player/former Manager, and private persistence were denied. Branding and Coach-private creation remain disabled.

Pre-cleanup reconciliation: Operational 15 rows, digest `b2ab408f7aa96ca370c64c12bed703d3f1cc4d352dbe3a427f0c18d40e76ceb6`; Journal business/audit 38 rows, digest `17a30889962ad56be37e1f939e037863f9617ac9e9c9e0774527da469030c35a` (the separate synthetic authority fixture was also removed). Strong scans confirmed both isolated tables empty afterward.

[Single cursor invocation](team-hub-isolated-quota-execution-evidence-2026-10-12/probe.json): 9/9 boolean checks passed under the actual Read role; signing, verification, tamper, wrong Team/actor/context/limit, wrong material and expiry checks. Empty input only; request ID `e7f6626e-95a2-4be3-b48d-7a0bc6f942ce`. No secret value, cursor, token or digest returned/persisted. [CloudTrail correlation](team-hub-isolated-quota-execution-evidence-2026-10-12/probe-audit.json) independently records successful exact-secret GetSecretValue and managed-key Decrypt under the probe's Read-role session: GetSecretValue f3985cb4-2783-4438-be70-17f201efc312; Decrypt 05aa7a9d-a799-35ad-a8a0-8da910f6fd40.

[DynamoDB observability](team-hub-isolated-quota-execution-evidence-2026-10-12/transaction-monitoring.json): consumed capacity corroborates both tables, no observed throttles, SDK cancellation receipts retained. [Probe monitoring](team-hub-isolated-quota-execution-evidence-2026-10-12/probe-monitoring.json): exactly one invocation, zero errors/throttles and three platform events, no application output. CloudWatch/CloudTrail required read-only ingestion polling; no test was reinvoked. These internal probes do not imply live business API success.

Before provisioning, both existing local test sessions were reused through the approved helper: authority HTTP 200 at LEGACY_WRITER 1/1, all 16 business routes HTTP 403, client rejects target operations. [Authenticated checks](team-hub-isolated-quota-execution-evidence-2026-10-12/live-endpoint.json). [D1 correlation](team-hub-isolated-quota-execution-evidence-2026-10-12/metrics-latest.json): 40 structured events, expected custom counters and native API/Lambda metrics, no unexpected 5xx/errors/throttles. Six existing alarms and detailed API metrics preserved.

## Cleanup and preservation

[Cleanup](team-hub-isolated-quota-execution-evidence-2026-10-12/cleanup.json): four resources absent, exact uploaded S3 object version deleted, stack lifecycle complete. Existing Read role/log group preserved. Synthetic rows were removed before table deletion. No credentials persisted; IAM user tags were omitted from custody evidence because unnecessary for authorization evidence. Secret scan and document-link results are recorded in this execution evidence directory.

[Final baseline](team-hub-isolated-quota-execution-evidence-2026-10-12/final/baseline.json), [protected resources](team-hub-isolated-quota-execution-evidence-2026-10-12/final/protected-after.json), [business/source inventory](team-hub-isolated-quota-execution-evidence-2026-10-12/final/after/inventory.json), [permanent security](team-hub-isolated-quota-execution-evidence-2026-10-12/final/installed-security-audit.json), [source fence](team-hub-isolated-quota-execution-evidence-2026-10-12/final/source-fence-preservation-after.json) and [monitoring configuration](team-hub-isolated-quota-execution-evidence-2026-10-12/final/observability.json):

| Protected state | Final result |
| --- | --- |
| Legacy | 2,621; FunctionDirectiveStack 167; source PITR/deletion protection/backups intact; four source tables and logos empty |
| Team Hub | 48 product + 7 security; API, complete Lambda configurations/revisions/code preserved; Active/Successful/IN_SYNC |
| Core / Tournament | 8+5 / 11; protected identities/templates unchanged |
| Real authority | LEGACY_WRITER, epoch 1, version 1 |
| Permanent business state | Operational 0; Journal 16 = authority + 15 historical audits, 0 business rows |
| Frontend / fence / production | Legacy frontend; source fence absent; no production writes or retirement |

This preservation covers the inspected protected resources, not an account-wide production audit. Local tests: 13 focused tests and 41 accounting tests passed; 75 accepted pins/nine archives verified; ledger 2,621 total, 2,430 assigned, 191 unresolved shared, zero unassigned. The AWS transaction/cursor runs supplement those offline proofs.

## Remaining cutover gates

1. Final review of business-runtime transactional enforcement and real Core/persona acceptance scope; isolated synthetic adapters do not substitute for live global authorization.
2. Separately authorized FROZEN maintenance, installed Legacy writer-fence denial proof and source/state reconciliation. No fence or authority transition occurred here.
3. Separately authorized TARGET_WRITER activation and live business acceptance, followed by reviewed frontend publication. The authority endpoint is not the mutation security boundary.
4. Maintain rollback/recovery protections, abort ownership and accepted rollback constraints; no Legacy retirement authorized.

Current domain Team Hub; phase M5/2B6 isolated AWS verification accepted. AWS changes: four temporary resources created/removed, isolated synthetic writes/cleanup, one probe invocation, one exact artifact upload/delete. Permanent, Legacy, production and ledger changes: zero. Next gate: final cutover execution review with separate authorization boundaries.
