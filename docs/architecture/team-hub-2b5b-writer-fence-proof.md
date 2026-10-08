# Team Hub 2B5B writer fence proof

7 October 2026. **PREPARATION ONLY; actual authority remains LEGACY_WRITER.**

## Refreshed coverage

[Coverage](team-hub-2b5b-evidence-2026-10-07/coverage-refresh.json) retains the reviewed classification: 13 active business paths, 2 possible paths, 8 privileged/manual paths and 8 generated/internal paths; unknown writers 0 in that inventory. Fresh account IAM enumeration inspected 769 roles and 4 users with no missing policy documents. Existing relevant grants were unchanged. The additional Core execution principal has no exact Team grants and its boundary matches the accepted Core policy. Thirty AppSync resolver configurations were reread. [Schedule evidence](team-hub-2b5b-evidence-2026-10-07/schedule-coverage.json) found no direct EventBridge rule or Scheduler target for the reviewed Legacy handler.

These are scoped inventory conclusions, not proof that no external automation exists. [Fresh edge comparison](team-hub-2b5b-evidence-2026-10-07/edge-refresh.json) confirms 30 business resolver configurations unchanged, 12 subscription pipelines unchanged, all 131 referenced functions resolved to known data sources, and four streams with no Lambda mappings or resource policies. Unknown pipeline edges are zero. Repeat this scoped inventory at execution; metadata comparison does not prove live denial.

## Legacy enforcement

[Fence proposals](team-hub-2b5b-evidence-2026-10-07/fence-candidates.json) preserve the four exact source table policies, revision identifiers, existing logo bucket policy, and both gateway resolver configurations. FROZEN and TARGET_WRITER deny underlying table business writes, including direct and transactional/PartiQL operations. Gateway proposals return maintenance while frozen and DOMAIN_MOVED after transfer. Generated reads remain available only for explicitly approved recovery/verification; they are not authoritative application reads after transfer.

The policy custodian and monitoring responder is **Ntgre (the user)**. There is no permanent recovery principal exception. Removing or changing the fence is a separately authorized recovery operation. Resource policies cannot prevent an account administrator with policy-administration authority from deliberately removing them; the procedure must therefore restrict and audit policy control during the window.

[Isolated live policy proof](team-hub-2b5b-evidence-2026-10-07/fence-rehearsal.json) allowed the initial fixture write, then denied 12 administrative write attempts across FROZEN/TARGET_WRITER: PutItem, UpdateItem, DeleteItem, BatchWriteItem, TransactWriteItems and PartiQL insert in each mode. The disposable table was removed. The first cleanup encountered an in-progress policy update; bounded retries and exact recorded table-ID checks completed cleanup.

**Not installed on actual source tables. Not live-proven through generated AppSync/CloudFormation identities.** Installing an actual source freeze would violate this task's no-authority-transition instruction. Future execution must test every reviewed path against the installed fence before target activation, with safe missing-key/test requests that cannot create business records if the fence fails.

Use fresh revision checks when preparing each PutResourcePolicy request; `NO_POLICY` is the expected revision for attach-only-if-absent. Read-back and enforcement checks must allow for policy propagation. See [AWS PutResourcePolicy documentation](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutResourcePolicy.html). Do not overwrite a changed policy or deploy Legacy CloudFormation to avoid a conflict.

## Target enforcement

The source candidate uses a strongly consistent Journal control row with mode, epoch, version, changedAt, changedBy and gateDigest. Every normal command transaction includes an authority ConditionCheck. Missing/malformed authority, stale client epoch, non-TARGET_WRITER state and Core failure deny. Control writes are excluded from runtime permissions; command writes are transaction-only and read runtime cannot write. No synthetic verification handler or authority bypass is bundled.

[Rollback rehearsal](team-hub-2b5b-evidence-2026-10-07/rehearsal.json) proves an in-flight command fails when isolated authority changes before commit, with no operational, audit or idempotency write. This used the candidate handler locally with real DynamoDB transactions; it does not constitute installed Lambda-role acceptance.

The [security review](team-hub-2b5b-evidence-2026-10-07/security-validation.json) passed five policy Analyzer checks and 34 simulations. Exact accepted Core ARN and `$LATEST` permissions are preserved. Policies are proposals, not installed. Actual business authority row remains absent; the deployed dark runtime remains unchanged.
