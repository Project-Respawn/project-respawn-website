# Project Respawn AWS deployment acceptance standard

Applies to Core, Team Hub, Tournament, Creator, Commerce, Community, Applications and Investor Access. This standard authorizes no infrastructure change.

1. Pin immutable source/templates/assets, full configuration contracts and rollback artifacts. Compare the actually installed baseline; a prior offline candidate is not a deployed baseline.
2. Review the complete provider/service lifecycle: trust, identity policies, boundaries, session restrictions, organization controls, resource/key policies, grants and service-mediated context. Test positive paths and explicit-deny controls. Record unsupported simulator behavior and live-only uncertainties.
3. Inspect AWS-generated changes, including nested effects and conditional replacements. Stop on unexpected differences. Separate security, runtime and authority/frontend authorization gates.
4. After execution, read back complete runtime configuration, code hashes, stable properties, roles/boundaries and actual resource counts. Verify expected drift status; UNKNOWN is not confirmed drift and stack completion is not runtime acceptance.
5. Prove authenticated success, ordinary-user denials, authority/epoch enforcement, privacy, monitoring, dependency behavior and domain isolation using live evidence appropriate to the release. Distinguish offline, simulated and live results.
6. Reconcile business state and recovery protections. Verify exact temporary-resource cleanup. Preserve sanitized request IDs, hashes, metrics and acceptance receipts, never credentials or browser sessions.
7. On failure, stop without speculative grants or ambiguous retries. Preserve actual partial state. Do not restore known-unhealthy configuration automatically. Execute only the separately approved recovery scope.

Reference implementation: [Team Hub recovery review](team-hub-2b6-complete-lambda-kms-lifecycle-review.md), [integrity guard](../../scripts/team-hub-recovery-complete/integrity.mjs). Each domain must supply its exact expected routes, configurations, state and isolation evidence; fixtures never establish live acceptance.

## Complete permission lifecycle

Build an operation matrix before candidate approval: principal, API action, exact resource forms, supported conditions, effective policy layers, purpose, required/conditional/unsupported classification, positive control, negative controls and live-only uncertainty. Include provisioning, provider discovery, update, stabilization, rollback, readback and temporary cleanup. An action appearing in a provider schema is not sufficient evidence that this deployment requires it.

For Lambda configuration, inspect complete Environment maps and the actual encryption path. Classify AWS-managed service keys separately from customer-managed business keys. Review identity policy, boundary, resource/key policy, session restrictions, grants and service-mediated conditions. The accepted Team Hub temporary recovery demonstrated Encrypt, Decrypt and DescribeKey on one AWS-managed Lambda key; another domain must establish its own need. Do not automatically grant this list or copy its key ARN.

Where supported for the particular action, bind the exact key, ViaService, CallerAccount and encryption context. DescribeKey metadata evaluation must not inherit an unsupported encryption-context restriction merely because Encrypt/Decrypt use one. Customer-managed alternatives require key policy, rotation/recovery and grant review. Keep business, unknown and unrelated keys and KMS administration denied. Read-role cursor access does not justify Command or deployment access to the secret value.

Inspect unqualified function ARNs and the exact :$LATEST forms AWS evaluates for the operation. Test both functions when a workflow updates two. Do not infer alias/published-version access or wildcard function administration. A correct Allow cannot override an explicit Deny: review NotAction, NotResource, missing-condition behavior and boundary intersections together. Include explicit-deny witnesses, wrong function/key/principal, code-update/create/delete, foreign-domain, KMS administration and PassRole negatives. Scope PassRole to the exact service role and service where supported.

Bind the caller to the exact reviewed template URL/object and execution role, with accepted rollback references retained. Verify bytes, uploaded checksum/encryption metadata where applicable and the actual installed policy. Offline candidates are not installed baselines. No new positive permission or expanded artifact access may be hidden inside a repair.

IAM simulation does not execute a service, prove resource/key policy propagation or establish complete organization authorization. Record unsupported action/resource simulation behavior separately from a real missing permission. Obtain SCP hierarchy evidence through an approved management/delegated inspection identity when required. Member-account read grants do not inherently expose the hierarchy. If visibility is unavailable, record the limitation and the explicit task-specific decision; Team Hub's waiver is not a universal waiver.

## Rate limiting and time-bound executors

Use the [shared scheduler](../../scripts/migration/iam-validation.mjs): deterministic action/context batching (up to 50 resource inputs), one simulation request at a time, at least 15 seconds between starts, paginated results, throttling-only exponential backoff with jitter, at most six attempts and a bounded suite deadline. Review current AWS limits before a future live use; these conservative repository settings are the accepted implementation, not a guarantee of no throttling. AccessDenied, mismatches and ambiguous write failures are not retryable throttling.

Run the complete domain-specific certification before installation. Map every security requirement and case to complete certification plus a smaller actual-role suite, requiring exact installed trust/policy/boundary/attachments/RoleId/workflow equivalence. Never discard unfinished negatives. Define case counts from the lifecycle, not a universal 210, 222 or 82.

For a reviewed parameterized time-bound executor, choose a future window with enough lead for certification, installation, propagation, critical checks and safety margin. Use simulated time context for policy tests before NotBefore; do not exercise real permissions early. Hash the parameter receipt and preserve immutable template/workflow bytes. Do not extend an installed window automatically. A different window mechanism, extra permission or workflow change needs review. Complete all mandatory checks before the active window and require the approved remaining execution reserve.

## Actual configuration and drift

Compare desired template properties with actual complete maps, code hashes, physical identities, roles/boundaries, memory/timeout/architecture/VPC/layers/logging and State/LastUpdateStatus. Inspect the complete AWS-generated change set, nested effects, conditional/dynamic replacements and stateful/protected impacts. No-op change sets can coexist with live drift. UPDATE_COMPLETE alone cannot repair or accept a drifted function.

Use resource-level drift where supported; UNKNOWN or unsupported inspection is an unresolved visibility condition, not proof of drift or IN_SYNC. Endpoint behavior, authentication, business-state safety, logs/metrics and relevant alarms are separate acceptance gates. Allow bounded read-only metric-ingestion waits without manufacturing new traffic to satisfy counts.

Direct configuration recovery may be appropriate when the reviewed complete desired map already exists in CloudFormation and a narrowly scoped recovery is safer than broad stack/provider changes. It requires explicit authorization, exact physical identities, full environment maps, pinned RevisionIds, unchanged code/non-environment settings, temporary service-only custody, a fixed non-substitutable operation and no ambiguous retry. Compare against desired CloudFormation afterwards and require supported function drift IN_SYNC. Never restore known-unhealthy prior maps automatically. Preserve partial completion, terminal workflow history and cleanup evidence; stop for a new reviewed recovery decision on failure.

## Acceptance and rollback evidence

Before execution define domain-specific expected routes/statuses, private-data constraints, authority state, resource identities/counts, metric dimensions and source/target reconciliation. A status endpoint cannot substitute for transactional authority/epoch and current membership checks inside business mutations. Prove safe isolated business branches before freeze; reserve live installed source-fence denial for separately authorized maintenance. Require all direct-model/generated/privileged/manual writer paths to be covered.

Code rollback is permitted only with compatible state/contracts. State-authority rollback fences target writes first, exports/reverse-transforms/restores into reviewed targets, reconciles IDs/relationships/counts/digests and transfers authority only after acceptance. Preserve old artifacts and source protections; cleanup only exact rehearsal-owned resources. Record named operator/abort responsibility and telemetry gaps. Retain historical failed packages as evidence, never as current execution authority.

The [accepted recovery result](team-hub-2b6-describekey-recovery-result.md) proves this particular two-function lifecycle. Isolated AWS business transaction/cursor proofs and actual cutover remain pending. [Shared offline helpers](migration-tooling.md) assist validation but cannot attest that supplied evidence came from AWS.
