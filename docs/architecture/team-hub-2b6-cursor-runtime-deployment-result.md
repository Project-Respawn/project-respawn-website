# Project Respawn Team Hub 2B6 — cursor runtime deployment result

**CURSOR RUNTIME DEPLOYED AND ACCEPTED — READY TO RESUME CONTROLLED CUTOVER**

13 October 2026. The explicitly authorized security-first/product-second Ntgre updates completed. This accepts the dark runtime; it is not Team Hub business cutover. Authority remains LEGACY_WRITER, epoch/version 3/3. Legacy frontend/source writer behavior is preserved. No production publication or Legacy retirement occurred.

Evidence: `team-hub-cursor-deployment-evidence-2026-10-13`.

## Identity, pins and preflight

Account 058264289478; eu-north-1. Security/publisher/inspection identity: `arn:aws:iam::058264289478:user/RavenTest`. Product changes used the existing restricted `ProjectRespawn-TeamHub-Ntgre-Deploy` caller and `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution` CloudFormation role. No role was created or granted administrator access.

| Artifact | Verified SHA-256 |
| --- | --- |
| Security | `5cf68f36b3e4e3f95ba8a3cb1444eacc82e382ae214e0cee58d5382409974c23` |
| Product | `caa0a68384990438196ed7720f1a24062641e03220f6092c1b4a2340d2417241` |
| New installed Read ZIP | `ab6edf023d4091f87c56de7f4d5520cda580630d5e147e9c49c0a09a135c571e` |
| Unchanged Command ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Quota-review candidate | `3f06894002c424ba2bd569b5df2250860f584679cd800497c4274a9280b20d48` |

All reviewed artifacts, source hashes, semantic-equivalence receipts and rollback references were verified. No runtime rebuild, synthesis or HEAD substitution. Exactly three approved artifact objects were published at the reviewed content-addressed keys: new ZIP, product template and exact existing desired rollback template. Readback hashes, encryption and object versions are recorded in `publication.json`. They remain retained deployment/rollback assets; no old artifact was overwritten.

Fresh preflight verified protected stacks, both old function configurations and IN_SYNC drift, empty business state, source protections/backups, restored table/logo/gateway policies, D1 monitoring, Legacy localhost bytes and normal Admin/ordinary sessions. Existing browser sessions were verified through the accepted Core capability contract. Tokens and temporary assumed-role credentials remained in process memory; no token/password file was written.

## AWS-generated changes and execution

| Stage | Change set | Actual changes | Completion UTC |
| --- | --- | --- | --- |
| Security | `team-hub-cursor-security-20261013-369c5017` | 3 modifications | 2026-10-13 21:56:47 |
| Product | `team-hub-cursor-product-20261013-a2c1c902` | 1 modification | 2026-10-13 21:58:17 |

Security change-set ARN: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-cursor-security-20261013-369c5017/1b399ee2-b6ca-4957-91e3-e23d34694736`.

Product change-set ARN: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-cursor-product-20261013-a2c1c902/00c02909-92da-4bd1-8242-070e3929d0b5`.

Complete paginated change sets and AWS-held templates were inspected twice before execution. Security changed only ExecutionRole, ExecutionBoundary and PreparationCaller. Product changed only ParityReadFunction Code. Both had zero additions, deletions, replacements, conditional replacements or nested changes; every reported property required no recreation. Product contained no Environment, role, Command, API/route, table or monitoring change.

Both executions explicitly used DisableRollback=false and reached UPDATE_COMPLETE with rollback enabled. No failed AWS write was retried and no permissions were patched or broadened after inspection.

## Installed IAM and runtime acceptance

All five installed managed policy documents match the security pin. ExecutionBoundary is v12, PreparationCaller v15; full version receipts are in `security-installed.json`. Execution/caller trust, inline and attached policies and boundary bindings match. The optimized execution inline policy is 10,166 characters and boundary 5,992. Six fresh actual-execution-role simulations verified new/rollback ZIP access and denial of wrong artifacts, foreign PassRole/function update and KMS administration. The accepted 503-row full equivalence/negative-control evidence remains bound to this exact installed security pin.

Runtime IAM and Read/Command boundaries remain unchanged. Post-deployment four-role inspection confirms exact policies and existing KMS/Core restrictions. No Cognito, KMS, secret, foreign-domain or administrator grant was added.

Read and Command are Active / Successful and their function-level CloudFormation drift is IN_SYNC. Read's installed ZIP hash is the new pin. Its complete Environment and all non-Code configuration remain unchanged. Command's entire configuration, RevisionId and ZIP hash match preflight. Both actual AWS deployment packages were downloaded, hash-verified and used directly for offline regression; presigned download URLs were not recorded.

## Live dark acceptance and monitoring

Normal signed-in Admin and ordinary accounts each obtained GET /v1/authority HTTP 200 with the validated authority contract: LEGACY_WRITER 3/3. Missing/invalid access tokens returned 401. Both personas exercised all sixteen normal business routes: **32/32 HTTP 403 FORBIDDEN**, including an epoch-5 request header, without enabling target operations.

`live-endpoint.json` records sanitized request IDs/statuses. `metrics-latest.json` correlates all 34 handler-reaching requests to structured application logs. The metric window contains:

- API Count 36; 4xx 34 (32 intended business denials plus two intended JWT rejections); 5xx 0.
- Read invocations 16, Command invocations 18; Errors 0 and Throttles 0 for both.
- Requests counters 16 read / 18 command; WriterNotAuthoritative 14 read / 18 command; DependencyFailures 0.
- All six alarms OK; detailed API metrics remain enabled. The previously accepted manual monitoring arrangement and deferred access-log approach remain unchanged.

Logs contain only approved metric fields and no authentication tokens/private-data attributes. CloudWatch ingestion was evaluated against actual correlated receipts; no fixed delivery deadline was assumed. No extra probe disrupted Core or changed authority.

## Offline TARGET_WRITER regression against deployed bytes

`target-offline-regression.json` records the actual downloaded new Read and unchanged Command ZIP hashes. Their stored index.js bytes were loaded directly, without compilation or rebuilding, into a separate child process whose DynamoDB, Lambda and Secrets Manager SDK endpoints are all a local HTTP server. Only fake local SDK credentials and isolated in-memory fixture records are used. No AWS test resource or business write is involved.

The complete 41-scenario mutation/privacy/concurrency/idempotency sequence passed, covering all nine mutations. Twenty-three additional checks prove all four reads, real pagination across the three list operations, tampering, actor/context/expiry binding, missing/KMS-failed/timed-out secret retrieval on all three paginated routes, Core failure, stale/missing epochs, wrong issuer/client, all-operation LEGACY_WRITER/FROZEN denial, atomic freeze at transaction commit, transaction throttling without partial writes, Core revocation before cached replay and missing authority. Every successful business transaction includes the real runtime's authority ConditionCheck at fixture epoch 5.

The local fixture child/server were stopped and memory records cleared. The real Journal row stayed LEGACY_WRITER 3/3; these offline fixtures do not constitute live TARGET business acceptance or a real authority transition.

## Preservation, diagnostics and cleanup

Fresh post-deployment inspectors passed:

| Domain | Preserved resources |
| --- | ---: |
| Legacy | 2,621; FunctionDirectiveStack 167 |
| Team Hub | 48 product + 7 security |
| Core | 8 product + 5 security |
| Tournament | 11 |

Source tables remain empty with PITR, deletion protection and backups intact. Four source table policies, both gateways and logo policy remain restored. Operational business records remain 0; Journal remains 16 rows (one unchanged authority record and fifteen historical audits), with zero business/idempotency additions. Legacy frontend bytes were checked again after acceptance. Local outputs validate against the protected Ntgre Cognito/AppSync/storage identities. No production changes.

The initial uploaded ZIP succeeded once, but the CLI GetObject readback interface rejected local arguments before a verification request. The failure receipt is preserved in STOP.json; `readback-correction.json` binds its hash and the successful fixed scoped SDK readback. Continuation verified the existing ZIP and did not repeat that PutObject. No security/product write had yet occurred. This historical local harness stop is superseded by the complete accepted receipt; it is not a pending AWS deployment failure.

A stronger offline test initially expected 409 after a freeze-at-commit injection. The deployed handler's final authority reread correctly supersedes that conflict with the existing approved FROZEN HTTP 403 denial. The diagnostic is retained; the corrected contract expectation and no-partial-write proof passed against unchanged deployed bytes. No runtime change was made to accommodate the test.

Browser-session material was cleared, local collectors/fixture processes closed and no temporary AWS execution infrastructure was created. Retain approved artifact objects and sanitized audit evidence. Unrelated workspace work is preserved; no Git push/merge or frontend publication occurred.

## Remaining controlled-cutover requirements

The backend blocker is closed. Update the maintenance baseline to bind this accepted Read/Command/product/security deployment while retaining all original writer-fence/S3/epoch-5 frontend and rollback evidence. Existing security-owner/operator approvals remain recorded; this explicit artifact deployment authorization does not enter maintenance by itself.

Before resumption, require explicit maintenance direction and a fresh attended 150-minute window/preflight. Preserve the reviewed monotonic sequence LEGACY_WRITER 3/3 → FROZEN 4/4 → TARGET_WRITER 5/5. Installed original-principal source-fence denial proof, source/target/S3 reconciliation, real five-persona business acceptance, epoch-5 Ntgre frontend activation, attended observation and state-aware recovery remain mandatory. No Master publication or Legacy retirement.
