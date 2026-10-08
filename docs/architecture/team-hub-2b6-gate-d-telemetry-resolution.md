# Team Hub 2B6 ? Gate D telemetry resolution

**Latest execution review: GATE D LIVE MONITORING BLOCKED.** Option A is selected. Fresh comparison with deployed dark IAM found runtime/boundary expansion beyond artifact references; missing authority makes required live probe paths unreachable. No AWS writes or change sets. [Execution review](team-hub-2b6-gate-d-live-monitoring-result.md) supersedes earlier readiness conclusions; pins are preserved.


7 October 2026. Account 058264289478, eu-north-1, Ntgre. Correction prepared, not deployed or live accepted. LEGACY_WRITER retained. No AWS mutations, authority row, fence attachment, frontend activation, production, Tournament or Cognito changes.

## Diagnosis

Both original failures were reproduced using the actual handler with isolated transports: 403 FORBIDDEN and inner 503 DEPENDENCY_UNAVAILABLE produced zero corresponding counters. These were offline HTTP responses, not live service incidents. [Original failures](team-hub-2b6-evidence-2026-10-07/preparation/telemetry-tests.json).

1. HTTP API AWS_PROXY carries the Lambda response; a status does not automatically increment an application counter.
2. The inner handler correctly converts service errors into HTTP responses.
3. The outer TEAM_REQUEST log included status but omitted the returned error code; the metric mapper depended on that absent code.
4. The correction extracts only allowlisted error codes for logging, preserving response semantics and authorization. Core dependency emission is centralized to avoid duplicate transport events. Missing authority and epoch mismatches have distinct events.
5. EMF uses ProjectRespawn/TeamHub, exact dimensions Environment=Ntgre and Runtime=read|command. Direct stdout emits JSON lines. Tokens, bodies and subjects are excluded; sanitized request IDs are log attributes, never dimensions.
6. Tests inspect emitted events and unchanged responses. Missing classification before publication explains the zero counters; ingestion delay and dimensions did not cause these failures. Collection treats absent/incomplete data as pending, then failure at deadline, never healthy zero.

[AWS EMF](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html) describes asynchronous, at-least-once extraction: duplicates are possible. [Lambda logging](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html) recommends stdout for EMF with JSON logging. [Dimensions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) must match exactly.

| Behavior | Offline proof |
|---|---|
| 403 denial | AuthorizationFailures = 1 |
| Inner 503 | DependencyFailures = 1 |
| Core failure | CoreDependencyFailures = 1 and DependencyFailures = 1 |
| Successful request | One request, zero failure counters |
| Wrong writer | WriterNotAuthoritative distinguishable |
| Missing authority | AuthorityUnavailable plus dependency failure |
| Missing/stale/future epoch | AuthorityEpochMismatch; existing conflict response retained |
| Four repeated denials | Four requests, four authorization failures |
| Privacy and delayed collection | Pass; no private fields or false-zero acceptance |

## Access-log security and options

The proposed resource is arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/access. The reviewed execution identity and boundary lack an allow for logs:CreateLogGroup there (implicit deny); logs:CreateLogDelivery and logs:PutResourcePolicy encounter explicit administration denies. These are policy simulations, not attempted AWS creates. [Effective-policy evidence](team-hub-2b6-evidence-2026-10-07/preparation/monitoring-permissions.json), [AWS requirements](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html).

| Option | Security and coverage | Cost and complexity |
|---|---|---|
| A ? recommended for review | Existing Lambda logs/EMF, detailed native API metrics, DynamoDB/Lambda metrics, Core events and CloudFormation events. No log-admin grant. No per-request gateway records for pre-Lambda rejection. | Fewer resources and delivery policies; detailed metrics/EMF usage charges remain. Requires attended correlation. |
| B ? dedicated security owner | Separate reviewed owner provisions destination and delivery policies; normal Team role retains administration denies. Adds gateway request visibility. | Extra bootstrap, ownership/lifecycle review and log ingestion/storage costs; separately authorized. |

Option A is an explicit proposed coverage decision, not final acceptance or a silent reduction of the gate. If request-level gateway records or unattended notifications are mandatory, use B or a separately reviewed alerting candidate. Existing alarms have no notification actions; no notification delivery is claimed. EMF uses existing scoped log permissions, not PutMetricData. Runtime DynamoDB permissions and boundaries remain unchanged. Security changes replace exact candidate artifact references only; accepted rollback references remain.

A concrete log-stream ARN simulation denied even an unconditional simulator-only allow. Group ARN :* controls work; policy checks use that supported form. [Diagnostic controls](team-hub-2b6-evidence-2026-10-07/gate-d/logging-simulator-controls.json) preserve the limitation. Actual stream delivery still needs live proof. No control policy was attached.

## Candidate and tests

[Candidate](team-hub-2b6-evidence-2026-10-07/gate-d/candidate.json), [pins](team-hub-2b6-evidence-2026-10-07/gate-d/pins.json), [source revision](team-hub-2b6-evidence-2026-10-07/gate-d/source-revision.json).

- Runtime: 37f1ce14ef5876011480f68526425d6e6f0a6099ca53dd6a288cd8b939287c70.
- Product: b096ecbe53c113a4e759fa9b75130e0505d0ddc0b0359e14b5fbca41f6156604.
- Security: ebec9bc231a1362df985c741ff962b5298aa5ed96cc990747a457684d3c0bcbc.
- 44 product +7 security. Compared with the previous business candidate: two Lambda Code changes and stage detailed metrics only. No access-log group. This is offline comparison, not AWS change-set classification.
- Previous ZIP/templates/manifest and four original source files preserved; no old pin overwritten.
- [Validation](team-hub-2b6-evidence-2026-10-07/gate-d/validation.json): 607 passing tests: 16 monitoring, 8 browser repair, 117 candidate, 100 rollback, 75 accounting/isolation/protection, 291 Team regression. TypeScript and ledger pass. Two stale offline accounting receipts were regenerated and affected tests rerun; initial failure receipt retained.
- Both frontend builds pass; 24 static/prior-browser isolation checks pass. Existing stylesheet and shared-chunk warnings remain. No fresh deployed-runtime browser acceptance claimed.
- [Security validation](team-hub-2b6-evidence-2026-10-07/gate-d/security-validation.json): 5 Access Analyzer policies pass without ERROR/SECURITY_WARNING; 43 positive/negative IAM checks pass. No installation.

## Live verification required after separate authorization

Review Option A coverage explicitly; inspect exact security/product change sets, rollback settings, stateful identities, replacements and artifact pins before any execution. No publication or deployment is authorized here.

Use a bounded attended window, baseline and sanitized unique request IDs. Correlate authorization denial, safe Core failure, success, writer denial and epoch/authority probes with raw EMF, API responses and actual CloudWatch data. Fault injection must be isolated and separately reviewed: do not break real Core or create a live authority row to obtain a counter. Prove actual-role log delivery. Gateway rejection before Lambda is a native API outcome, not an expected custom counter.

Query exact namespace/dimensions with Sum and complete minute buckets. Poll every 20 seconds for a proposed ten-minute deadline plus bucket closure; replace snapshots rather than summing repeated polls. Missing data fails at deadline. Exact repeated-request counts require raw correlated events; metric totals alone cannot prove exact counts under at-least-once delivery. Record background traffic/duplicates. [Ingestion timing](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Alarms.html).

Named operator and abort custodian: Ntgre (user). Confirm monitoring access before maintenance. Observe API Count/4xx/5xx/latency, Lambda invocations/errors/throttles/duration, DynamoDB errors/throttles/conflicts, Core dependency and authorization/authority counters. Record conditional authority-transition receipts and consistent readback; no automatic transition publisher is claimed. Inspect CloudFormation events during separately authorized changes. Stop before TARGET for unexpected success/denial, dependency errors, unexplained throttling, missing evidence, authority mismatch or failed reconciliation. Handled HTTP errors do not necessarily increment Lambda Errors.

## C/E/F preparation

[Offline receipt](team-hub-2b6-evidence-2026-10-07/gate-d/offline-cef.json). C: conditional control compiler and 117 candidate tests pass; initialization proposal remains reviewed:false and is not executable authorization. No live row. Synthetic verification grants no business authority. E: manifests/epoch guards retained; builds/isolation pass; prior five-persona browser evidence used live Core and in-memory Team. Actual deployed binding remains pending; frontend inactive. F: 100 offline rollback tests pass; previous AWS rehearsal is historical. No new rehearsal resources. Rebind historical six-table runner to this pin and review before future AWS execution.

Code-only rollback requires proof that no target business writes or state-authority transfer require recovery. Otherwise freeze/drain both writers, export operational/control/journal state, reverse-transform, restore to a separately approved destination and reconcile before authority recovery. Never discard target state or simply remove the fence.

**Historical offline result: GATE D CORRECTION READY FOR DEPLOYMENT REVIEW; superseded by blocked live execution review above.**
