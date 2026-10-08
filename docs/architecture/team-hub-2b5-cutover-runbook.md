# Team Hub 2B5 — future cutover runbook

6 October 2026. **DO NOT EXECUTE.** Account 058264289478, eu-north-1, Ntgre only. Current authority LEGACY_WRITER; target ordinary writes and synthetic verification disabled; frontendCutover=false. This document neither seeds authority nor authorizes a deployment.

## Mode A entry gate

Use [cutover-gate.mjs](../../scripts/team-hub-2b5/cutover-gate.mjs) to evaluate evidence, not execute AWS calls. Immediately before FROZEN require:

- Exact protected environment, stack/table/API/Cognito identities and approved candidate hashes; unrelated roots unchanged.
- Strongly consistent, fully paginated Legacy counts exactly 0/0/0/0 and complete logo object/version/delete-marker listing zero. Any business row/logo stops Mode A and requires Mode B review. Metadata ItemCount does not count as evidence.
- Operational business rows zero; no idempotency/test business state. Journal contains only the exact 15 retained 2B4B synthetic audit rows reconciled to the accepted receipt and, if separately seeded, the explicit control row. The old blanket Journal-zero requirement is superseded by this retained-evidence exception. It does not authorize business state.
- Source and target recovery/PITR/deletion protection healthy; four source backups AVAILABLE; accepted empty restore evidence retained. Snapshot ages bounded to 60 seconds at transition, repeating under freeze if a complete scan takes longer.
- Refreshed IAM/resolver/provider/stream/subscription/schedule/consumer inventory: unknown writers/readers zero. Previous inventory alone is insufficient.
- Core contracts deployed and live accepted, including trusted service/delegated actor, disabled/revoked users, pagination and outage tests.
- Legacy fence installed/proven in a separately authorized rehearsal; target transaction fence installed/proven; exact policy revisions and protected baselines accepted.
- Real frontend/Admin/homepage candidate and DTO conversion accepted; lazy-loading and browser network tests passed; compatibility errors installed/tested.
- Compatible code rollback and isolated nonempty reverse-state rehearsal accepted; old native request replay guard ready.
- Named policy custodian, privileged maintenance freeze and alarm recipient accepted. No concurrent deployments, account grant changes, resource-policy edits, imports/exports/restores or manual business writes.

**Today: Mode A has a last-observed empty source, but the complete execution gate is NOT eligible.** Live Core, fence, UI, security lifecycle and rollback acceptance remain missing.

## Authority record proposal — not seeded

Journal key: PK `CONTROL#AUTHORITY`, SK `STATE`. Closed schema: `schemaVersion: team-hub-authority.v1`, mode LEGACY_WRITER/FROZEN/TARGET_WRITER, positive integer epoch/version, changedAt, changedBy, gateDigest (SHA256), no TTL. Creation is a real state write requiring separate approval with `attribute_not_exists` conditions. Initial mode must be LEGACY_WRITER. Each transition requires expected mode/epoch/version and increments epoch/version. Store an immutable change receipt and CloudTrail evidence without tokens.

Target runtime can only read/ConditionCheck this row; it cannot create, update or delete it. Every business mutation atomically checks TARGET_WRITER plus the captured epoch/version in the same transaction as business rows, audit and idempotency. No verification config, test administrator or prefix bypass exists in the candidate entry/closure. Client `X-Team-Authority-Epoch` must match the strong control read. Idempotency records are namespaced by authority epoch; old client generations cannot silently replay into a later authority epoch. Missing/unavailable authority fails closed.

## Exact future sequence

1. Approve immutable Core/Team/security/client artifacts and all full change sets with rollback enabled, including no stateful replacements. Keep the accepted 2B4 artifacts as evidence, not as a business-writer rollback release.
2. Preflight identities, candidate hashes, IAM boundaries, alarms and all source/target counts. Reconcile the retained audit allowlist.
3. Verify source/target protections, four backups and rehearsed recovery artifacts.
4. Verify live Core contract acceptance and global/Team role separation.
5. In the approved maintenance window conditionally set the control row to FROZEN; install exact source writer/logo denials and compatibility maintenance errors under the separate policy/resolver gate.
6. Prove every supported Legacy write path denied, including custom gateway, direct generated model, transactional adapter, presigned logo PUT and privileged test clients. Partial policy installation does not satisfy this gate.
7. Prove target ordinary commands denied. Preserve no generic verification bypass.
8. Stop retries/subscriptions and drain at least the maximum relevant deployed writer timeout (recorded 900 seconds) plus upload validity (120 seconds), remeasuring current timeouts and outstanding grants. Observe policy propagation and any in-flight work; do not infer completion from elapsed time alone.
9. Recount all four sources and logos under the effective fence; recheck target emptiness. Any new source record/logo stops Mode A. Leave both business writers fenced pending Mode B/recovery review.
10. Refresh all final gate evidence; conditionally transition FROZEN to TARGET_WRITER with a new epoch/version and exact gate digest. Leave all source denials installed.
11. Publish the accepted frontend/endpoint activation descriptor bound to that epoch. Preserve shared Cognito; never edit amplify_outputs.json to switch domains.
12. Verify Admin, Manager, Coach, Player and outsider journeys, account switching, disabled/revoked access and data projections. Admin is not implicitly Manager/Coach.
13. Verify separately approved first business writes, revisions, audit/idempotency and concurrency; test denied Legacy/direct-model attempts again. Never use real business data as an unapproved test fixture.
14. Monitor API route metrics, errors, latency, throttles, transaction conflicts, Core failures, authority denials and authorization failures. A failed or unknown outcome stops automatic retries; reconcile before retrying in a new epoch.
15. Retain original Legacy source identities/protections/backups for the rollback window. No retirement and no ownership ledger transfer until cutover acceptance is explicitly recorded.

Maintenance planning allowance: **30–45 minutes**, including at least the currently recorded 17-minute drain plus policy propagation, complete recount and persona checks. This is an estimate, not an SLA or permission to truncate checks. If a gate exceeds the window, remain FROZEN and invoke the reviewed recovery decision.

## Observability proposal

Current accepted proof: API aggregates and per-request IDs, Lambda platform logs, four parity alarms. Candidate proposes detailed per-route metrics and a 30-day API access log containing route/request ID/status/latency only; never Authorization headers, query bodies or user data. Existing Lambda request logs carry operation/request ID/outcome. Recommend detailed route metrics for real cutover; the dark-proof aggregate exception is not sufficient to close all cutover monitoring requirements.

Still prepare/verify: API access-log delivery permissions, latency/5xx alarm thresholds and recipient, DynamoDB throttles/transaction-conflict metrics, structured Core dependency and writer-not-authoritative/auth-denial counters, dashboards and escalation ownership. Proposed access logging may need account-level CloudWatch delivery authority; do not broaden the domain execution boundary without its own review. This is an explicit blocker, not silently installed logging permission.

## Stop and rollback

Before target business writes, a separately reviewed reversal may restore Legacy only after confirming target has no acknowledged business state and restoring source compatibility/policies in the correct order. After any target business state, never simply switch clients back. Prefer code rollback while TARGET_WRITER remains authoritative; otherwise follow [state rollback rehearsal/runbook](team-hub-2b5-rollback-rehearsal.md). No source deletion or production operation is included.
