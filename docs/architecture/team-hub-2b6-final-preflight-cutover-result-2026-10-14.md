# Team Hub 2B6 — final preflight and controlled Ntgre cutover result

**TEAM HUB NTGRE CUTOVER ACCEPTED — READY FOR PRODUCTION RELEASE REVIEW**

Actual result recorded 2026-10-14T17:03:58.834Z. Account 058264289478, eu-north-1; RavenTest. This is Ntgre localhost acceptance, not Master/public website publication.

## Authorization and execution

Existing security-owner/operator approvals and the explicit post-abort amendment were retained. The current user authorized resumption with the accepted cursor runtime and confirmed full 150-minute monitoring/recovery availability. The actual window was 2026-10-14T15:04:08.026Z–2026-10-14T17:34:08.026Z; Ntgre is the operator, responder and recovery contact. No signature or user-message timestamp was invented.

Conditional LEGACY_WRITER 3/3 → FROZEN 4/4 → TARGET_WRITER 5/5 writes completed once and were strongly read back. The four exact source table policies, logo-prefix policy and two gateway maintenance mappings remain installed. No blind retry, permanent IAM change, broad Legacy deployment, Lambda code/configuration change or unsafe same-role helper occurred.

## Live evidence

- Fresh templates/counts, runtime configuration/drift, installed IAM, recovery protection and source state passed. [Preflight](team-hub-cursor-accepted-cutover-evidence-2026-10-14/preflight/complete.json).
- Five distinct normal Cognito identities passed Core verification and current Cognito self-session checks. [Receipts](team-hub-cursor-accepted-cutover-evidence-2026-10-14/cognito-session-readiness.json).
- 12/12 original AppSync and 35/35 direct/operator requests returned attributable resource-policy denials. The accepted owned multipart Abort proof is reused only within its recorded scope; final full-prefix policy verification is separate. Original shared/cleanup direct service-role execution remains unavailable under the explicitly approved alternative, not represented as live receipts.
- Empty source/target transfer reconciliation and 3/3 S3 denial audit correlations passed. Provider envelope/known terminal evidence was recorded where available. The closed Admin handler's absent log group is not proof of inactivity. No universal physical S3 revocation or complete historical audit claim is made. [Drain/audit](team-hub-cursor-accepted-cutover-evidence-2026-10-14/drain-and-audit.json).
- Nine mutations and four reads passed live with real Core authorization, privacy, revocation, idempotency, cursor pagination/tampering and stale-epoch rejection. Accepted isolated transaction/cursor and deployed-byte regression evidence remains applicable; it is not relabelled as new live tests. [Business](team-hub-cursor-accepted-cutover-evidence-2026-10-14/business-live.json).
- Five browser personas passed homepage, Admin, Manager, Coach Review and Champion Pool journeys against the exact epoch-5 artifact, then passed again after localhost activation. No unexpected network/console errors or Legacy Team fallback occurred. [Published browser](team-hub-cursor-accepted-cutover-evidence-2026-10-14/browser-published-live.json).
- 58 complete safety samples covered 2026-10-14T16:14:55.385Z–2026-10-14T16:45:15.315Z. The earlier 373-second interval after activation was not counted as continuous safety observation. Source rows/logos stayed zero, fences exact and six alarms OK. [Observation](team-hub-cursor-accepted-cutover-evidence-2026-10-14/observation.json).
- D1 correlated 253 explicitly recorded acceptance requests; native/custom metrics and logs passed. Notification delivery is still attended manual monitoring, and API access-log deferral remains the accepted Option A. [Metrics](team-hub-cursor-accepted-cutover-evidence-2026-10-14/metrics-latest.json).

## Cleanup and preservation

Normal APIs removed the owned champion/assessment fixture data, revoked the three test memberships and marked the synthetic Team INACTIVE. Retain 7 Operational rows and 52 Journal rows, including 18 audits and 18 idempotency records; this is accounted synthetic/history state, not an empty target claim. No direct business-table deletion or source restore occurred. [Final integrity](team-hub-cursor-accepted-cutover-evidence-2026-10-14/post-cleanup-state-integrity.json).

Legacy 2,621/167; Team 48+7; Core 8+5; Tournament 11. Retained auxiliary S3 auditing remains separately accounted and under Ntgre custody for the accepted retention period. Source protections/backups and rollback artifacts are retained. Branding and Coach-private creation remain disabled.

Local harness failures are preserved: Windows browser-file locking, root-route/async readiness assumptions, early SDK storage configuration and helper sign-out revocation. Corrected normal authentication and same-origin static preview passed without changing AWS CORS, runtime or IAM. Earlier transient profiles were Git-excluded; current helpers use memory storage configured after Amplify and private contexts. Cleanup receipts distinguish removed profiles from any previous transient storage; no claim that the early helper never persisted data is made.

After any target write, frontend rollback alone cannot return Legacy authority. Retain source fences; failure containment requires monotonic TARGET 5/5 → FROZEN 6/6 and preserved export/reconciliation before a separately reviewed source restoration. No recovery was required for a failed business/security gate; local pre-publication harness corrections did not repeat business writes.

## Public release and checkpoint

The active artifact is served at http://localhost:5174. Normal source development remains a separately selected configuration; do not substitute an unreviewed build or repoint amplify_outputs.json. Master/public hosting remains unchanged. Production release needs its own environment/auth/Core/endpoint contracts, scoped IAM/CORS/hosting review, state inventory/recovery and explicit deployment/publication authorization. Do not publish this Ntgre manifest into production. Legacy retirement is a separate gate.

Prepare a scoped checkpoint on phase2/team-hub-extraction, preserving unrelated SWG work, excluding credentials, profiles, caches and generated assemblies. No branch merge or production push is authorized by this checkpoint preparation.
